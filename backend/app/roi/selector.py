"""
ROI (Region of Interest) selection logic.
"""
from typing import List
from ..config import settings
from ..models import PatchInfo, ROIResult, ROISelection
from ..utils import get_logger

logger = get_logger(__name__)


class ROISelector:
    """Selects regions of interest from processed patches."""

    def __init__(self):
        """Initialize ROI selector."""
        self.roi_top_k = settings.ROI_TOP_K
        self.variance_weight = settings.ROI_VARIANCE_WEIGHT
        self.density_weight = settings.ROI_DENSITY_WEIGHT

    def calculate_patch_score(self, patch: PatchInfo) -> float:
        """
        Calculate a combined score for a patch based on tissue density and variance.

        Args:
            patch: Patch information

        Returns:
            Combined score (0-1)
        """
        # Skip background patches
        if patch.is_background:
            return 0.0

        # Weighted combination of variance and tissue density
        score = (
            self.variance_weight * patch.variance_score +
            self.density_weight * patch.tissue_ratio
        )

        return score

    def auto_select_rois(self, patches: List[PatchInfo], top_k: int = None) -> List[PatchInfo]:
        """
        Automatically select top ROIs based on scoring.

        Args:
            patches: List of all patches
            top_k: Number of top patches to select (default from settings)

        Returns:
            List of selected patches
        """
        if top_k is None:
            top_k = self.roi_top_k

        # Filter out background patches
        tissue_patches = [p for p in patches if not p.is_background]

        if not tissue_patches:
            logger.warning("No tissue patches found for ROI selection")
            return []

        # Calculate scores for all patches (store in tuple, don't mutate Pydantic model)
        scored_patches = [
            (self.calculate_patch_score(patch), patch)
            for patch in tissue_patches
        ]

        # Sort by score (descending)
        scored_patches.sort(key=lambda x: x[0], reverse=True)

        # Select top K
        selected_patches = [patch for score, patch in scored_patches[:top_k]]

        logger.info(
            f"Auto-selected {len(selected_patches)} ROIs from {len(tissue_patches)} tissue patches"
        )

        return selected_patches

    def confirm_roi_selection(
        self,
        all_patches: List[PatchInfo],
        selected_patch_ids: List[str],
        auto_select: bool = False,
        top_k: int = None,
    ) -> ROIResult:
        """
        Confirm ROI selection with optional auto-selection and manual overrides.

        Args:
            all_patches: List of all patches
            selected_patch_ids: Manually selected patch IDs
            auto_select: Whether to auto-select if no manual selection
            top_k: Number of patches for auto-selection

        Returns:
            ROI selection result
        """
        # Create patch ID lookup
        patch_lookup = {p.patch_id: p for p in all_patches}

        # Start with manual selections
        manual_patches = []
        for patch_id in selected_patch_ids:
            if patch_id in patch_lookup:
                manual_patches.append(patch_lookup[patch_id])
            else:
                logger.warning(f"Patch ID not found: {patch_id}")

        # If auto-select is enabled and we have few/no manual selections
        if auto_select and len(manual_patches) < (top_k or self.roi_top_k):
            auto_selected = self.auto_select_rois(all_patches, top_k)

            # Merge with manual selections (avoid duplicates)
            manual_ids = set(p.patch_id for p in manual_patches)
            auto_patches = [p for p in auto_selected if p.patch_id not in manual_ids]

            # Take enough auto-selected to reach target
            target_count = (top_k or self.roi_top_k) - len(manual_patches)
            auto_patches = auto_patches[:target_count]

            combined_patches = manual_patches + auto_patches

            result = ROIResult(
                case_id="_".join(all_patches[0].patch_id.split("_")[:2]) if all_patches else "unknown",
                selected_patches=combined_patches,
                auto_selected_count=len(auto_patches),
                manual_override_count=len(manual_patches),
            )

            logger.info(
                f"ROI selection: {len(manual_patches)} manual, "
                f"{len(auto_patches)} auto-selected, "
                f"{len(combined_patches)} total"
            )

        else:
            # Manual selection only
            result = ROIResult(
                case_id="_".join(all_patches[0].patch_id.split("_")[:2]) if all_patches else "unknown",
                selected_patches=manual_patches,
                auto_selected_count=0,
                manual_override_count=len(manual_patches),
            )

            logger.info(f"ROI selection: {len(manual_patches)} manual selections only")

        return result

    def filter_by_spatial_diversity(
        self,
        patches: List[PatchInfo],
        min_distance: int = 500,
    ) -> List[PatchInfo]:
        """
        Filter patches to ensure spatial diversity (avoid clustering).

        Args:
            patches: List of patches
            min_distance: Minimum distance between selected patches

        Returns:
            Filtered list with spatial diversity
        """
        if not patches:
            return []

        # Sort by score (assuming patches have been scored)
        sorted_patches = sorted(
            patches,
            key=lambda p: getattr(p, 'score', self.calculate_patch_score(p)),
            reverse=True
        )

        # Greedy selection with spatial constraint
        selected = [sorted_patches[0]]

        for patch in sorted_patches[1:]:
            # Check distance to all selected patches
            too_close = False
            for selected_patch in selected:
                distance = ((patch.x - selected_patch.x) ** 2 + (patch.y - selected_patch.y) ** 2) ** 0.5
                if distance < min_distance:
                    too_close = True
                    break

            if not too_close:
                selected.append(patch)

        logger.info(
            f"Spatial diversity filtering: {len(selected)} patches selected from {len(patches)}"
        )

        return selected

    def get_patch_by_id(self, patches: List[PatchInfo], patch_id: str) -> PatchInfo:
        """
        Get a specific patch by ID.

        Args:
            patches: List of patches
            patch_id: Patch identifier

        Returns:
            Patch information or None
        """
        for patch in patches:
            if patch.patch_id == patch_id:
                return patch
        return None
