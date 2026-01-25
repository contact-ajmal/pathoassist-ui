import numpy as np
import json
import pickle
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from ..config import settings
from ..utils import get_logger

logger = get_logger(__name__)

@dataclass
class AtlasEntry:
    case_id: str
    patch_id: str
    embedding: np.ndarray
    diagnosis: str
    description: str
    metadata: Dict[str, Any]

class AtlasStore:
    """
    Local Retrieval Augmented Generation (RAG) store for pathology atlas.
    Functionality:
    - Stores embeddings of "Gold Standard" or previously analyzed cases.
    - Performs nearest neighbor search to find similar patches.
    """

    def __init__(self):
        self.atlas_dir = settings.DATA_DIR / "atlas"
        self.atlas_dir.mkdir(parents=True, exist_ok=True)
        self.index_path = self.atlas_dir / "atlas_index.pkl"
        self.entries: List[AtlasEntry] = []
        self.is_loaded = False
        
        # Load existing index if available
        self.load()

    def load(self):
        """Load atlas index from disk."""
        if self.index_path.exists():
            try:
                with open(self.index_path, "rb") as f:
                    data = pickle.load(f)
                    self.entries = data
                logger.info(f"Loaded Atlas with {len(self.entries)} entries.")
                self.is_loaded = True
            except Exception as e:
                logger.error(f"Failed to load Atlas index: {e}")
                self.entries = []
        else:
            logger.info("No existing Atlas index found. Starting fresh.")
            # Optionally: Seed with some dummy data if needed for demo?
            # For now, we start empty and rely on adding cases.

    def save(self):
        """Save atlas index to disk."""
        try:
            with open(self.index_path, "wb") as f:
                pickle.dump(self.entries, f)
            logger.info(f"Saved Atlas with {len(self.entries)} entries.")
        except Exception as e:
            logger.error(f"Failed to save Atlas index: {e}")

    def add_entry(self, entry: AtlasEntry):
        """Add a new entry to the atlas."""
        self.entries.append(entry)
        # In a real high-throughput scenario, we wouldn't save on every add.
        # But for this local desktop app, it ensures persistence.
        self.save()

    def search(self, query_embedding: np.ndarray, k: int = 3) -> List[Dict[str, Any]]:
        """
        Find k nearest neighbors for the query embedding.
        Using cosine similarity.
        """
        if not self.entries:
            return []

        # Convert entries to matrix
        # Stack embeddings: Shape (N, D)
        embeddings_matrix = np.stack([e.embedding for e in self.entries])
        
        # Normalize query: Shape (D,) -> (1, D)
        query_norm = np.linalg.norm(query_embedding)
        if query_norm == 0:
            return []
            
        query_vec = (query_embedding / query_norm).reshape(1, -1)
        
        # Normalize matrix
        matrix_norm = np.linalg.norm(embeddings_matrix, axis=1, keepdims=True)
        matrix_norm[matrix_norm == 0] = 1 # Avoid div by zero
        normalized_matrix = embeddings_matrix / matrix_norm
        
        # Compute Cosine Similarity: (1, D) @ (D, N) -> (1, N)
        # We transposed matrix implicitly by dot product logic or just allow matching dimensions
        # similarity = dot(A, B) / (|A|*|B|)
        
        # scores: shape (N,)
        scores = np.dot(normalized_matrix, query_vec.T).flatten()
        
        # Get top k indices
        # argsort is ascending, so take last k and reverse
        top_k_indices = np.argsort(scores)[-k:][::-1]
        
        results = []
        for idx in top_k_indices:
            entry = self.entries[idx]
            score = float(scores[idx])
            
            # Simple threshold to avoid garbage matches
            if score < 0.3: 
                continue
                
            results.append({
                "case_id": entry.case_id,
                "patch_id": entry.patch_id,
                "diagnosis": entry.diagnosis,
                "description": entry.description,
                "similarity": score,
                "metadata": entry.metadata
            })
            
        return results

    def mock_populate(self):
        """Populate with some dummy data for demonstration if empty."""
        if self.entries:
            return

        logger.info("Populating Atlas with mock data for demonstration...")
        # Create random embeddings (simulating 4096 dim from MedGemma or similar)
        # Note: In reality, we need compatible embeddings. 
        # If we can't generate real ones easily without the model running, 
        # this mock is only useful if we ALSO mock the query embedding.
        pass

