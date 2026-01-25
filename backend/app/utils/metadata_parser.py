"""
Metadata parser for clinical context files.
"""
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class MetadataParser:
    """Parses clinical context files (JSON, TXT) into structured metadata."""

    @staticmethod
    def parse_context_file(content: bytes, filename: str) -> Dict[str, Any]:
        """
        Parse context file content based on extension.
        
        Args:
            content: Raw file content
            filename: Original filename
            
        Returns:
            Dictionary of extracted metadata fields
        """
        filename = filename.lower()
        
        try:
            if filename.endswith('.json'):
                return MetadataParser._parse_json(content)
            elif filename.endswith('.txt'):
                return MetadataParser._parse_txt(content)
            else:
                logger.warning(f"Unsupported context file format: {filename}")
                return {}
        except Exception as e:
            logger.error(f"Failed to parse context file {filename}: {e}")
            return {}

    @staticmethod
    def _parse_txt(content: bytes) -> Dict[str, Any]:
        """Parse text file as clinical history."""
        try:
            text = content.decode('utf-8').strip()
            return {"clinical_history": text}
        except UnicodeDecodeError:
            return {}

    @staticmethod
    def _parse_json(content: bytes) -> Dict[str, Any]:
        """
        Parse JSON content.
        Handles both flat dictionaries and GDC-style complex nested structures.
        """
        try:
            data = json.loads(content)
            
            # If list (GDC format often wraps in list), take first item
            if isinstance(data, list) and len(data) > 0:
                data = data[0]
                
            if not isinstance(data, dict):
                return {}

            metadata = {}

            # 1. GDC Format Extraction
            if "demographic" in data:
                demo = data["demographic"]
                
                # Age
                if "age_at_index" in demo:
                    metadata["patient_age"] = demo["age_at_index"]
                elif "days_to_birth" in demo:
                    # Approximation if strictly needed, but let's stick to explicit fields first
                    pass
                elif "year_of_birth" in demo:
                    import datetime
                    current_year = datetime.datetime.now().year
                    try:
                        metadata["patient_age"] = current_year - int(demo["year_of_birth"])
                    except:
                        pass
                        
                # Gender
                if "gender" in demo:
                    metadata["patient_gender"] = demo["gender"].capitalize()
                    
            if "diagnoses" in data and isinstance(data["diagnoses"], list) and len(data["diagnoses"]) > 0:
                diag = data["diagnoses"][0]
                
                # Primary Diagnosis / Body Site
                if "tissue_or_organ_of_origin" in diag:
                    metadata["body_site"] = diag["tissue_or_organ_of_origin"]
                elif "primary_diagnosis" in diag:
                     # e.g., "Adenocarcinoma, NOS" - treat as helpful context but maybe not strictly body site
                     pass
                     
                # Staging
                stage = diag.get("ajcc_pathologic_stage", diag.get("ajcc_clinical_stage"))
                if stage:
                    current_history = metadata.get("clinical_history", "")
                    metadata["clinical_history"] = f"{current_history}\nStage: {stage}".strip()

            # 2. Generic Flat Format (user provided simpler JSON)
            # Map common keys to our schema
            key_map = {
                "age": "patient_age",
                "patient_age": "patient_age",
                "gender": "patient_gender", 
                "sex": "patient_gender",
                "patient_gender": "patient_gender",
                "site": "body_site",
                "body_site": "body_site",
                "procedure": "procedure_type",
                "procedure_type": "procedure_type",
                "diagnosis": "clinical_history", # Append if needs be
                "history": "clinical_history",
                "clinical_history": "clinical_history",
                "stain": "stain_type",
                "stain_type": "stain_type"
            }

            for key, value in data.items():
                target_key = key_map.get(key.lower())
                if target_key:
                    # Don't overwrite GDC extraction if already present, EXCEPT if this seems like a direct override
                    if target_key not in metadata or not metadata[target_key]:
                         metadata[target_key] = value

            # 3. Construct Clinical History from miscellaneous useful fields if main history empty
            history_parts = []
            if metadata.get("clinical_history"):
                history_parts.append(metadata["clinical_history"])
                
            # GDC specific extras
            if "disease_type" in data:
                 history_parts.append(f"Disease Type: {data['disease_type']}")
            if "diagnoses" in data and isinstance(data["diagnoses"], list) and len(data["diagnoses"]) > 0:
                 diag = data["diagnoses"][0]
                 if "primary_diagnosis" in diag:
                     history_parts.append(f"Primary Diagnosis: {diag['primary_diagnosis']}")
                     
            if history_parts:
                metadata["clinical_history"] = "\n".join(history_parts)

            return metadata

        except json.JSONDecodeError:
            return {}
