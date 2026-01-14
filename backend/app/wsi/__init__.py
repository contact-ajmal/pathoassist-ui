"""WSI (Whole Slide Image) processing module."""
from .processor import WSIProcessor
from .tiling import TileGenerator

__all__ = ["WSIProcessor", "TileGenerator"]
