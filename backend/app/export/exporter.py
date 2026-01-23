"""
Report export functionality (PDF, JSON, TXT).
"""
import json
from pathlib import Path
from datetime import datetime
from typing import Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER

from ..config import settings
from ..models import StructuredReport, ExportFormat, ReportExportResult
from ..report import ReportGenerator
from ..utils import get_logger

logger = get_logger(__name__)


class ReportExporter:
    """Exports reports to various formats."""

    def __init__(self):
        """Initialize report exporter."""
        self.exports_dir = settings.EXPORTS_DIR
        self.report_generator = ReportGenerator()

    def export_report(
        self,
        report: StructuredReport,
        format: ExportFormat,
        include_images: bool = False,
    ) -> ReportExportResult:
        """
        Export report to specified format.

        Args:
            report: Structured report
            format: Export format
            include_images: Whether to include images (for PDF)

        Returns:
            Export result with file path
        """
        logger.info(f"Exporting report for case {report.case_id} as {format.value}")

        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{report.case_id}_{timestamp}.{format.value}"
        output_path = self.exports_dir / filename

        # Export based on format
        if format == ExportFormat.PDF:
            self._export_pdf(report, output_path, include_images)
        elif format == ExportFormat.JSON:
            self._export_json(report, output_path)
        elif format == ExportFormat.TXT:
            self._export_txt(report, output_path)
        else:
            raise ValueError(f"Unsupported export format: {format}")

        # Get file size
        file_size = output_path.stat().st_size

        result = ReportExportResult(
            case_id=report.case_id,
            format=format,
            file_path=str(output_path),
            file_size=file_size,
        )

        logger.info(f"✓ Report exported: {output_path} ({file_size} bytes)")

        return result

    def _export_pdf(
        self,
        report: StructuredReport,
        output_path: Path,
        include_images: bool = False,
    ) -> None:
        """
        Export report as PDF.

        Args:
            report: Structured report
            output_path: Output file path
            include_images: Whether to include images
        """
        from reportlab.platypus import Image as RLImage
        
        # Create PDF document
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=letter,
            leftMargin=settings.PDF_MARGIN,
            rightMargin=settings.PDF_MARGIN,
            topMargin=settings.PDF_MARGIN,
            bottomMargin=settings.PDF_MARGIN,
        )

        # Define styles
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor='#2C3E50',
            spaceAfter=12,
            alignment=TA_CENTER,
        )

        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=12,
            textColor='#34495E',
            spaceAfter=6,
            spaceBefore=12,
        )

        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['Normal'],
            fontSize=settings.PDF_FONT_SIZE,
            spaceAfter=6,
        )

        # Build content
        content = []

        # Title
        content.append(Paragraph("PATHOLOGY REPORT", title_style))
        content.append(Paragraph("(AI-Assisted Analysis)", body_style))
        content.append(Spacer(1, 0.3 * inch))

        # Case information
        content.append(Paragraph("Case Information", heading_style))
        content.append(Paragraph(f"<b>Case ID:</b> {report.case_id}", body_style))
        content.append(Paragraph(
            f"<b>Analysis Date:</b> {report.analysis_date.strftime('%Y-%m-%d %H:%M:%S UTC')}",
            body_style
        ))
        content.append(Paragraph(f"<b>Slide:</b> {report.slide_metadata.filename}", body_style))
        content.append(Spacer(1, 0.2 * inch))

        # Clinical context
        if report.patient_context:
            content.append(Paragraph("Clinical Context", heading_style))
            content.append(Paragraph(report.patient_context, body_style))
            content.append(Spacer(1, 0.2 * inch))

        # Tissue classification
        content.append(Paragraph("Tissue Classification", heading_style))
        content.append(Paragraph(f"<b>Type:</b> {report.tissue_type.value}", body_style))
        content.append(Paragraph(f"<b>Confidence:</b> {report.confidence_score:.2f}", body_style))
        content.append(Spacer(1, 0.2 * inch))

        # Structured findings
        content.append(Paragraph("Structured Findings", heading_style))

        if report.cellularity:
            content.append(Paragraph(f"<b>Cellularity:</b> {report.cellularity}", body_style))

        if report.nuclear_atypia:
            content.append(Paragraph(f"<b>Nuclear Features:</b> {report.nuclear_atypia}", body_style))

        if report.mitotic_activity:
            content.append(Paragraph(f"<b>Mitotic Activity:</b> {report.mitotic_activity}", body_style))

        if report.necrosis:
            content.append(Paragraph(f"<b>Necrosis:</b> {report.necrosis}", body_style))

        if report.inflammation:
            content.append(Paragraph(f"<b>Inflammation:</b> {report.inflammation}", body_style))

        content.append(Spacer(1, 0.2 * inch))

        # Additional observations
        if report.other_findings:
            content.append(Paragraph("Additional Observations", heading_style))
            for idx, finding in enumerate(report.other_findings, 1):
                content.append(Paragraph(
                    f"<b>{idx}.</b> {finding.finding} "
                    f"<i>(Confidence: {finding.confidence.value})</i>",
                    body_style
                ))
            content.append(Spacer(1, 0.2 * inch))

        # ROI Images Section
        if include_images:
            content.append(Paragraph("Region of Interest Images", heading_style))
            content.append(Paragraph(
                "The following patches were selected and analyzed from the slide:",
                body_style
            ))
            content.append(Spacer(1, 0.1 * inch))
            
            # Load patches from case directory
            try:
                import json
                roi_file = settings.CASES_DIR / report.case_id / "results" / "roi.json"
                if roi_file.exists():
                    with open(roi_file, "r") as f:
                        roi_data = json.load(f)
                    
                    patches = roi_data.get("selected_patches", [])
                    max_patches = 6  # Limit to 6 patches in PDF
                    
                    for idx, patch in enumerate(patches[:max_patches], 1):
                        patch_id = patch.get("patch_id")
                        if patch_id:
                            patch_file = settings.CASES_DIR / report.case_id / "patches" / f"{patch_id}.png"
                            if patch_file.exists():
                                # Add patch image
                                img = RLImage(str(patch_file), width=2*inch, height=2*inch)
                                content.append(img)
                                
                                # Add patch info
                                coords = patch.get("coordinates", {})
                                tissue_ratio = patch.get("tissue_ratio", 0)
                                content.append(Paragraph(
                                    f"<b>Patch {idx}</b> - Location: ({coords.get('x', 0)}, {coords.get('y', 0)}) - "
                                    f"Tissue: {tissue_ratio:.0%}",
                                    body_style
                                ))
                                content.append(Spacer(1, 0.1 * inch))
                    
                    if len(patches) > max_patches:
                        content.append(Paragraph(
                            f"<i>({len(patches) - max_patches} additional patches not shown)</i>",
                            body_style
                        ))
                else:
                    content.append(Paragraph("<i>No ROI data available</i>", body_style))
            except Exception as e:
                logger.warning(f"Could not include patch images in PDF: {e}")
                content.append(Paragraph(f"<i>Error loading patch images</i>", body_style))
            
            content.append(Spacer(1, 0.2 * inch))

        # Narrative summary
        content.append(Paragraph("Narrative Summary", heading_style))
        for para in report.narrative_summary.split('\n\n'):
            if para.strip():
                content.append(Paragraph(para, body_style))
        content.append(Spacer(1, 0.2 * inch))

        # Recommendations
        if report.suggested_tests:
            content.append(Paragraph("Recommended Follow-Up", heading_style))
            for test in report.suggested_tests:
                content.append(Paragraph(f"• {test}", body_style))
            content.append(Spacer(1, 0.2 * inch))

        # Notes
        if report.follow_up_notes:
            content.append(Paragraph("Notes", heading_style))
            content.append(Paragraph(report.follow_up_notes, body_style))
            content.append(Spacer(1, 0.2 * inch))

        # Warnings
        if report.warnings:
            content.append(Paragraph("Warnings", heading_style))
            for warning in report.warnings:
                content.append(Paragraph(f"⚠ {warning}", body_style))
            content.append(Spacer(1, 0.2 * inch))

        # Disclaimer
        content.append(PageBreak())
        content.append(Paragraph("Important Medical Disclaimer", heading_style))
        for para in report.disclaimer.split('\n\n'):
            if para.strip():
                content.append(Paragraph(para, body_style))

        # Build PDF
        doc.build(content)

        logger.info(f"PDF report generated: {output_path}")

    def _export_json(self, report: StructuredReport, output_path: Path) -> None:
        """
        Export report as JSON.

        Args:
            report: Structured report
            output_path: Output file path
        """
        # Convert to JSON
        report_json = report.model_dump_json(indent=2)

        # Write to file
        with open(output_path, 'w') as f:
            f.write(report_json)

        logger.info(f"JSON report generated: {output_path}")

    def _export_txt(self, report: StructuredReport, output_path: Path) -> None:
        """
        Export report as plain text.

        Args:
            report: Structured report
            output_path: Output file path
        """
        # Format report as text
        text_content = self.report_generator.format_report_text(report)

        # Write to file
        with open(output_path, 'w') as f:
            f.write(text_content)

        logger.info(f"TXT report generated: {output_path}")

    def get_export_path(self, case_id: str, format: ExportFormat) -> Optional[Path]:
        """
        Find most recent export for a case.

        Args:
            case_id: Case identifier
            format: Export format

        Returns:
            Path to export file or None
        """
        # Search for files matching case_id and format
        pattern = f"{case_id}_*.{format.value}"
        matching_files = list(self.exports_dir.glob(pattern))

        if not matching_files:
            return None

        # Return most recent
        return max(matching_files, key=lambda p: p.stat().st_mtime)

    def list_exports(self, case_id: str) -> list[dict]:
        """
        List all exports for a case.

        Args:
            case_id: Case identifier

        Returns:
            List of export info dictionaries
        """
        exports = []

        for format in ExportFormat:
            pattern = f"{case_id}_*.{format.value}"
            for file_path in self.exports_dir.glob(pattern):
                exports.append({
                    "case_id": case_id,
                    "format": format.value,
                    "file_path": str(file_path),
                    "file_size": file_path.stat().st_size,
                    "created_at": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
                })

        # Sort by creation date (newest first)
        exports.sort(key=lambda x: x["created_at"], reverse=True)

        return exports
