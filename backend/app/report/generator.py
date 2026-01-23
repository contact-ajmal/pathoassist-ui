"""
Structured report generation from analysis results.
"""
from datetime import datetime
from typing import List, Optional

from ..config import settings, MEDICAL_DISCLAIMER
from ..models import (
    AnalysisResult,
    SlideMetadata,
    StructuredReport,
    PathologyFinding,
    TissueType,
)
from ..utils import get_logger

logger = get_logger(__name__)


class ReportGenerator:
    """Generates structured pathology reports from analysis results."""

    def __init__(self):
        """Initialize report generator."""
        pass

    def generate_report(
        self,
        case_id: str,
        slide_metadata: SlideMetadata,
        analysis_result: AnalysisResult,
        patient_context: Optional[str] = None,
    ) -> StructuredReport:
        """
        Generate a structured pathology report.

        Args:
            case_id: Case identifier
            slide_metadata: Slide metadata
            analysis_result: AI analysis result
            patient_context: Optional patient context

        Returns:
            Structured report
        """
        logger.info(f"Generating report for case {case_id}")

        # Extract structured findings
        cellularity = self._extract_cellularity(analysis_result.findings)
        nuclear_atypia = self._extract_nuclear_features(analysis_result.findings)
        mitotic_activity = self._extract_mitotic_activity(analysis_result.findings)
        necrosis = self._extract_necrosis(analysis_result.findings)
        inflammation = self._extract_inflammation(analysis_result.findings)

        # Generate suggested tests
        suggested_tests = self._suggest_follow_up_tests(
            tissue_type=analysis_result.tissue_type,
            findings=analysis_result.findings,
            confidence=analysis_result.overall_confidence,
        )

        # Generate follow-up notes
        follow_up_notes = self._generate_follow_up_notes(
            confidence=analysis_result.overall_confidence,
            warnings=analysis_result.warnings,
        )

        # Create report
        report = StructuredReport(
            case_id=case_id,
            patient_context=patient_context,
            slide_metadata=slide_metadata,
            analysis_date=datetime.utcnow(),
            tissue_type=analysis_result.tissue_type,
            cellularity=cellularity,
            nuclear_atypia=nuclear_atypia,
            mitotic_activity=mitotic_activity,
            necrosis=necrosis,
            inflammation=inflammation,
            other_findings=analysis_result.findings,
            narrative_summary=analysis_result.narrative_summary,
            confidence_score=analysis_result.overall_confidence,
            suggested_tests=suggested_tests,
            follow_up_notes=follow_up_notes,
            disclaimer=MEDICAL_DISCLAIMER,
            warnings=analysis_result.warnings,
        )

        logger.info(f"✓ Report generated for case {case_id}")

        return report

    def _extract_cellularity(self, findings: List[PathologyFinding]) -> Optional[str]:
        """
        Extract cellularity information from findings.

        Args:
            findings: List of findings

        Returns:
            Cellularity description or None
        """
        import re
        for finding in findings:
            text = finding.finding.lower()
            if "cellularity" in text or "cell density" in text or "cellular" in text:
                # Clean redundant prefixes
                cleaned = re.sub(r'^\s*(?:cellularity|cell density)[:\s]*', '', finding.finding, flags=re.IGNORECASE).strip()
                # Filter out noise
                if cleaned.lower() in ["and", "the", "", "not assessed"]:
                    continue
                return cleaned if len(cleaned) > 5 else finding.finding

        return None

    def _extract_nuclear_features(self, findings: List[PathologyFinding]) -> Optional[str]:
        """
        Extract nuclear atypia features.

        Args:
            findings: List of findings

        Returns:
            Nuclear features description or None
        """
        for finding in findings:
            text = finding.finding.lower()
            if any(term in text for term in ["nuclear", "nuclei", "atypia", "pleomorphism"]):
                return finding.finding

        return None

    def _extract_mitotic_activity(self, findings: List[PathologyFinding]) -> Optional[str]:
        """
        Extract mitotic activity information.

        Args:
            findings: List of findings

        Returns:
            Mitotic activity description or None
        """
        import re
        for finding in findings:
            text = finding.finding.lower()
            if "mitotic" in text or "mitosis" in text or "proliferation" in text:
                # Clean redundant prefixes
                cleaned = re.sub(r'^\s*(?:mitosis|mitotic activity|mitotic)[:\s]*', '', finding.finding, flags=re.IGNORECASE).strip()
                return cleaned if len(cleaned) > 5 else finding.finding

        return None

    def _extract_necrosis(self, findings: List[PathologyFinding]) -> Optional[str]:
        """
        Extract necrosis information.

        Args:
            findings: List of findings

        Returns:
            Necrosis description or None
        """
        for finding in findings:
            text = finding.finding.lower()
            if "necrosis" in text or "necrotic" in text:
                return finding.finding

        return None

    def _extract_inflammation(self, findings: List[PathologyFinding]) -> Optional[str]:
        """
        Extract inflammation information.

        Args:
            findings: List of findings

        Returns:
            Inflammation description or None
        """
        import re
        for finding in findings:
            text = finding.finding.lower()
            if "inflammation" in text or "inflammatory" in text or "infiltrate" in text:
                # Clean redundant prefixes
                cleaned = re.sub(r'^\s*(?:inflammation|inflammatory)[:\s]*', '', finding.finding, flags=re.IGNORECASE).strip()
                return cleaned if len(cleaned) > 5 else finding.finding

        return None

    def _suggest_follow_up_tests(
        self,
        tissue_type: TissueType,
        findings: List[PathologyFinding],
        confidence: float,
    ) -> List[str]:
        """
        Suggest follow-up tests based on findings.

        Args:
            tissue_type: Tissue type
            findings: List of findings
            confidence: Overall confidence

        Returns:
            List of suggested tests
        """
        suggestions = []

        # Low confidence = more follow-up
        if confidence < 0.6:
            suggestions.append("Expert pathologist review recommended")
            suggestions.append("Additional sampling if possible")

        # Check for specific keywords in findings
        finding_text = " ".join([f.finding.lower() for f in findings])

        if "atypia" in finding_text or "atypical" in finding_text:
            suggestions.append("Immunohistochemistry panel consideration")

        if "proliferation" in finding_text or "mitotic" in finding_text:
            suggestions.append("Ki-67 proliferation index assessment")

        if "inflammation" in finding_text:
            suggestions.append("Special stains for organisms (GMS, PAS)")

        if tissue_type == TissueType.EPITHELIAL:
            suggestions.append("Consider additional epithelial markers")

        # Generic suggestions
        if not suggestions:
            suggestions.append("Clinical correlation recommended")
            suggestions.append("Follow institutional protocols")

        return suggestions

    def _generate_follow_up_notes(
        self,
        confidence: float,
        warnings: List[str],
    ) -> Optional[str]:
        """
        Generate follow-up notes based on confidence and warnings.

        Args:
            confidence: Overall confidence
            warnings: List of warnings

        Returns:
            Follow-up notes or None
        """
        notes = []

        if confidence < settings.CONFIDENCE_THRESHOLD:
            notes.append(
                f"Analysis confidence ({confidence:.2f}) is below recommended threshold. "
                "Expert review is strongly advised."
            )

        if warnings:
            notes.append("Warnings noted during analysis: " + "; ".join(warnings))

        notes.append(
            "This AI-assisted analysis is intended for decision support only. "
            "All findings must be verified by qualified pathologists before clinical use."
        )

        return " ".join(notes) if notes else None

    def format_report_text(self, report: StructuredReport) -> str:
        """
        Format report as plain text.

        Args:
            report: Structured report

        Returns:
            Formatted text
        """
        lines = []

        # Header
        lines.append("=" * 80)
        lines.append("PATHOLOGY REPORT (AI-ASSISTED ANALYSIS)")
        lines.append("=" * 80)
        lines.append("")

        # Case information
        lines.append(f"Case ID: {report.case_id}")
        lines.append(f"Analysis Date: {report.analysis_date.strftime('%Y-%m-%d %H:%M:%S UTC')}")
        lines.append(f"Slide: {report.slide_metadata.filename}")
        lines.append("")

        # Patient context
        if report.patient_context:
            lines.append("CLINICAL CONTEXT:")
            lines.append(report.patient_context)
            lines.append("")

        # Tissue classification
        lines.append("TISSUE CLASSIFICATION:")
        lines.append(f"  Type: {report.tissue_type.value}")
        lines.append(f"  Confidence: {report.confidence_score:.2f}")
        lines.append("")

        # Findings
        lines.append("STRUCTURED FINDINGS:")

        if report.cellularity:
            lines.append(f"  Cellularity: {report.cellularity}")

        if report.nuclear_atypia:
            lines.append(f"  Nuclear Features: {report.nuclear_atypia}")

        if report.mitotic_activity:
            lines.append(f"  Mitotic Activity: {report.mitotic_activity}")

        if report.necrosis:
            lines.append(f"  Necrosis: {report.necrosis}")

        if report.inflammation:
            lines.append(f"  Inflammation: {report.inflammation}")

        lines.append("")

        # Other findings
        if report.other_findings:
            lines.append("ADDITIONAL OBSERVATIONS:")
            for idx, finding in enumerate(report.other_findings, 1):
                lines.append(f"  {idx}. {finding.finding}")
                lines.append(f"     Confidence: {finding.confidence.value}")
            lines.append("")

        # Narrative summary
        lines.append("NARRATIVE SUMMARY:")
        lines.append(report.narrative_summary)
        lines.append("")

        # Recommendations
        if report.suggested_tests:
            lines.append("RECOMMENDED FOLLOW-UP:")
            for test in report.suggested_tests:
                lines.append(f"  - {test}")
            lines.append("")

        # Follow-up notes
        if report.follow_up_notes:
            lines.append("NOTES:")
            lines.append(report.follow_up_notes)
            lines.append("")

        # Warnings
        if report.warnings:
            lines.append("WARNINGS:")
            for warning in report.warnings:
                lines.append(f"  ⚠ {warning}")
            lines.append("")

        # Disclaimer
        lines.append(report.disclaimer)
        lines.append("")
        lines.append("=" * 80)

        return "\n".join(lines)
