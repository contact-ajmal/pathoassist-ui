"""
WSI (Whole Slide Image) processor using OpenSlide.
"""
import time
from pathlib import Path
from typing import Optional, Tuple
import openslide
from openslide import OpenSlide, OpenSlideError
from PIL import Image
import numpy as np

from ..config import settings
from ..models import SlideMetadata, WSIProcessingResult, PatchInfo
from ..utils import get_logger
from .tiling import TileGenerator

logger = get_logger(__name__)


class WSIProcessor:
    """Processes whole slide images and extracts metadata."""

    def __init__(self):
        """Initialize WSI processor."""
        self.tile_generator = TileGenerator()

    def open_slide(self, slide_path: Path) -> OpenSlide:
        """
        Open a slide file using OpenSlide.

        Args:
            slide_path: Path to slide file

        Returns:
            OpenSlide object

        Raises:
            OpenSlideError: If slide cannot be opened
        """
        try:
            slide = openslide.open_slide(str(slide_path))
            logger.info(f"Opened slide: {slide_path.name}")
            return slide
        except OpenSlideError as e:
            logger.error(f"Failed to open slide {slide_path}: {e}")
            raise

    def extract_metadata(self, case_id: str, slide_path: Path) -> SlideMetadata:
        """
        Extract metadata from a slide.

        Args:
            case_id: Case identifier
            slide_path: Path to slide file

        Returns:
            Slide metadata
        """
        slide = self.open_slide(slide_path)

        try:
            # Get basic properties
            dimensions = slide.dimensions
            level_count = slide.level_count
            level_dimensions = [slide.level_dimensions[i] for i in range(level_count)]

            # Extract vendor-specific properties
            properties = slide.properties
            vendor = properties.get(openslide.PROPERTY_NAME_VENDOR, None)

            # Get magnification
            magnification = None
            if openslide.PROPERTY_NAME_OBJECTIVE_POWER in properties:
                try:
                    magnification = float(properties[openslide.PROPERTY_NAME_OBJECTIVE_POWER])
                except (ValueError, TypeError):
                    pass

            # Get resolution (microns per pixel)
            resolution = None
            if openslide.PROPERTY_NAME_MPP_X in properties:
                try:
                    mpp_x = float(properties[openslide.PROPERTY_NAME_MPP_X])
                    mpp_y = float(properties.get(openslide.PROPERTY_NAME_MPP_Y, mpp_x))
                    resolution = (mpp_x + mpp_y) / 2  # Average
                except (ValueError, TypeError):
                    pass

            # Get objective power
            objective_power = None
            if openslide.PROPERTY_NAME_OBJECTIVE_POWER in properties:
                try:
                    objective_power = int(float(properties[openslide.PROPERTY_NAME_OBJECTIVE_POWER]))
                except (ValueError, TypeError):
                    pass

            metadata = SlideMetadata(
                case_id=case_id,
                filename=slide_path.name,
                file_size=slide_path.stat().st_size,
                dimensions=dimensions,
                magnification=magnification or settings.MAGNIFICATION,
                resolution=resolution,
                vendor=vendor,
                objective_power=objective_power,
                level_count=level_count,
                level_dimensions=level_dimensions,
            )

            logger.info(f"Extracted metadata for case {case_id}")
            return metadata

        finally:
            slide.close()

    def generate_thumbnail(self, slide_path: Path, output_path: Path, max_size: Tuple[int, int] = (800, 800)) -> Path:
        """
        Generate a thumbnail image of the slide.

        Args:
            slide_path: Path to slide file
            output_path: Path to save thumbnail
            max_size: Maximum thumbnail size (width, height)

        Returns:
            Path to saved thumbnail
        """
        slide = self.open_slide(slide_path)

        try:
            # Get thumbnail at appropriate level
            thumbnail = slide.get_thumbnail(max_size)
            if output_path.suffix.lower() == ".jpg" or output_path.suffix.lower() == ".jpeg":
                if thumbnail.mode == 'RGBA':
                    thumbnail = thumbnail.convert('RGB')
                thumbnail.save(output_path, "JPEG", quality=90)
            else:
                thumbnail.save(output_path, "PNG")

            logger.info(f"Generated thumbnail: {output_path} (size: {max_size})")
            return output_path

        finally:
            slide.close()

    async def process_slide(self, case_id: str, slide_path: Path, thumbnail_dir: Path) -> WSIProcessingResult:
        """
        Process a slide: extract metadata, generate tiles, create thumbnail.

        Args:
            case_id: Case identifier
            slide_path: Path to slide file
            thumbnail_dir: Directory to save thumbnail

        Returns:
            Processing result with patches
        """
        start_time = time.time()

        logger.info(f"Processing slide for case {case_id}")

        # Extract metadata
        metadata = self.extract_metadata(case_id, slide_path)

        # Generate standard thumbnail
        thumbnail_path = thumbnail_dir / "thumbnail.png"
        self.generate_thumbnail(slide_path, thumbnail_path, max_size=(800, 800))

        # Generate HD thumbnail for deep zoom
        hd_thumbnail_path = thumbnail_dir / "hd_thumbnail.jpg"
        self.generate_thumbnail(slide_path, hd_thumbnail_path, max_size=(4000, 4000))

        # Generate tiles/patches
        slide = self.open_slide(slide_path)

        try:
            patches = await self.tile_generator.generate_patches(
                slide=slide,
                case_id=case_id,
                patch_size=settings.PATCH_SIZE,
                magnification=metadata.magnification or settings.MAGNIFICATION,
            )

            # Count tissue vs background patches
            tissue_patches = [p for p in patches if not p.is_background]
            background_patches = [p for p in patches if p.is_background]

            processing_time = time.time() - start_time

            result = WSIProcessingResult(
                case_id=case_id,
                total_patches=len(patches),
                tissue_patches=len(tissue_patches),
                background_patches=len(background_patches),
                patches=patches,
                processing_time=processing_time,
                thumbnail_path=str(thumbnail_path),
            )

            logger.info(
                f"Processed case {case_id}: {len(tissue_patches)} tissue patches, "
                f"{len(background_patches)} background patches in {processing_time:.2f}s"
            )

            return result

        finally:
            slide.close()

    def get_slide_region(self, slide_path: Path, x: int, y: int, level: int, size: Tuple[int, int]) -> Image.Image:
        """
        Extract a specific region from the slide.

        Args:
            slide_path: Path to slide file
            x: X coordinate
            y: Y coordinate
            level: Pyramid level
            size: Region size (width, height)

        Returns:
            PIL Image of the region
        """
        slide = self.open_slide(slide_path)

        try:
            # Read region at the specified level
            region = slide.read_region((x, y), level, size)

            # Convert RGBA to RGB if needed
            if region.mode == "RGBA":
                region = region.convert("RGB")

            return region

        finally:
            slide.close()

    async def save_patches(
        self, 
        case_id: str, 
        slide_path: Path, 
        patches: list[PatchInfo], 
        output_dir: Path
    ) -> int:
        """
        Extract and save patches as image files.

        Args:
            case_id: Case identifier
            slide_path: Path to slide file
            patches: List of patches to save
            output_dir: Directory to save patches

        Returns:
            Number of patches saved
        """
        import asyncio
        
        slide = self.open_slide(slide_path)
        count = 0
        patch_size = settings.PATCH_SIZE

        try:
            for patch in patches:
                try:
                    # Read region
                    region = slide.read_region(
                        (patch.x, patch.y), 
                        patch.level, 
                        (patch_size, patch_size)
                    )
                    
                    if region.mode == "RGBA":
                        region = region.convert("RGB")
                    
                    # Save
                    output_path = output_dir / f"{patch.patch_id}.png"
                    
                    # Run IO in thread pool
                    await asyncio.to_thread(region.save, output_path, "PNG")
                    count += 1
                    
                except Exception as e:
                    logger.warning(f"Failed to save patch {patch.patch_id}: {e}")
                    continue

                # Yield control periodically
                if count % 20 == 0:
                    await asyncio.sleep(0)

            return count

        finally:
            slide.close()
