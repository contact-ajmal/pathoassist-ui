"""
Tile generation and tissue detection for WSI.
"""
import asyncio
from typing import List, Tuple
import numpy as np
from openslide import OpenSlide
from PIL import Image
import cv2

from ..config import settings
from ..models import PatchInfo
from ..utils import get_logger

logger = get_logger(__name__)


class TileGenerator:
    """Generates tiles/patches from whole slide images."""

    def __init__(self):
        """Initialize tile generator."""
        self.patch_size = settings.PATCH_SIZE
        self.background_threshold = settings.BACKGROUND_THRESHOLD
        self.min_tissue_ratio = settings.MIN_TISSUE_RATIO

    def detect_tissue(self, image: Image.Image) -> Tuple[bool, float]:
        """
        Detect if an image patch contains tissue or is background.

        Args:
            image: PIL Image patch

        Returns:
            Tuple of (is_background, tissue_ratio)
        """
        # Convert to numpy array
        img_array = np.array(image)

        # Convert to grayscale
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_array

        # Apply Otsu's thresholding
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Calculate tissue ratio (non-white pixels)
        tissue_pixels = np.sum(binary < 200)
        total_pixels = binary.size
        tissue_ratio = tissue_pixels / total_pixels

        # Determine if background
        is_background = tissue_ratio < self.min_tissue_ratio

        return is_background, tissue_ratio

    def calculate_variance_score(self, image: Image.Image) -> float:
        """
        Calculate color variance score for a patch.

        Args:
            image: PIL Image patch

        Returns:
            Variance score (0-1)
        """
        # Convert to numpy array
        img_array = np.array(image)

        # Calculate variance in each channel
        if len(img_array.shape) == 3:
            variances = [np.var(img_array[:, :, i]) for i in range(img_array.shape[2])]
            mean_variance = np.mean(variances)
        else:
            mean_variance = np.var(img_array)

        # Normalize to 0-1 range (assuming max variance of ~10000)
        normalized_variance = min(mean_variance / 10000, 1.0)

        return normalized_variance

    async def generate_patches(
        self,
        slide: OpenSlide,
        case_id: str,
        patch_size: int,
        magnification: float,
        level: int = 0,
    ) -> List[PatchInfo]:
        """
        Generate patches from a slide.

        Args:
            slide: OpenSlide object
            case_id: Case identifier
            patch_size: Size of patches in pixels
            magnification: Target magnification
            level: Pyramid level to use

        Returns:
            List of patch information
        """
        logger.info(f"Generating patches for case {case_id}")

        patches = []
        dimensions = slide.level_dimensions[level]
        width, height = dimensions

        # Calculate step size (with some overlap)
        overlap = patch_size // 4
        step_size = patch_size - overlap

        # Calculate total number of patches
        num_x = (width - patch_size) // step_size + 1
        num_y = (height - patch_size) // step_size + 1
        total_patches = num_x * num_y

        logger.info(f"Expected patches: {total_patches} ({num_x}x{num_y})")

        # Limit total patches for performance
        if total_patches > settings.MAX_PATCHES_PER_SLIDE:
            # Increase step size to reduce number of patches
            reduction_factor = np.sqrt(total_patches / settings.MAX_PATCHES_PER_SLIDE)
            step_size = int(step_size * reduction_factor)
            num_x = (width - patch_size) // step_size + 1
            num_y = (height - patch_size) // step_size + 1
            logger.info(f"Reduced to {num_x * num_y} patches due to limit")

        patch_count = 0

        # Generate patches
        for y in range(0, height - patch_size, step_size):
            for x in range(0, width - patch_size, step_size):
                # Read patch
                try:
                    region = slide.read_region((x, y), level, (patch_size, patch_size))

                    # Convert RGBA to RGB
                    if region.mode == "RGBA":
                        region = region.convert("RGB")

                    # Detect tissue
                    is_background, tissue_ratio = self.detect_tissue(region)

                    # Calculate variance score
                    variance_score = self.calculate_variance_score(region) if not is_background else 0.0

                    # Create patch info
                    patch_id = f"{case_id}_{x}_{y}_{level}"
                    patch_info = PatchInfo(
                        patch_id=patch_id,
                        x=x,
                        y=y,
                        level=level,
                        magnification=magnification,
                        tissue_ratio=tissue_ratio,
                        variance_score=variance_score,
                        is_background=is_background,
                        coordinates={"x": x, "y": y, "width": patch_size, "height": patch_size},
                    )

                    patches.append(patch_info)
                    patch_count += 1

                except Exception as e:
                    logger.warning(f"Failed to process patch at ({x}, {y}): {e}")
                    continue

                # Yield control periodically for async operation
                if patch_count % 100 == 0:
                    await asyncio.sleep(0)

        logger.info(f"Generated {len(patches)} patches for case {case_id}")

        return patches

    def filter_background_patches(self, patches: List[PatchInfo]) -> List[PatchInfo]:
        """
        Filter out background patches.

        Args:
            patches: List of patch information

        Returns:
            List of tissue patches only
        """
        tissue_patches = [p for p in patches if not p.is_background]
        logger.info(f"Filtered to {len(tissue_patches)} tissue patches from {len(patches)} total")
        return tissue_patches

    def select_top_patches(self, patches: List[PatchInfo], top_k: int) -> List[PatchInfo]:
        """
        Select top K patches based on variance and tissue density.

        Args:
            patches: List of patch information
            top_k: Number of patches to select

        Returns:
            Top K patches
        """
        # Filter background first
        tissue_patches = self.filter_background_patches(patches)

        # Calculate combined score
        for patch in tissue_patches:
            patch.combined_score = (
                settings.ROI_VARIANCE_WEIGHT * patch.variance_score +
                settings.ROI_DENSITY_WEIGHT * patch.tissue_ratio
            )

        # Sort by combined score
        sorted_patches = sorted(tissue_patches, key=lambda p: p.combined_score, reverse=True)

        # Select top K
        selected = sorted_patches[:top_k]

        logger.info(f"Selected top {len(selected)} patches")

        return selected
