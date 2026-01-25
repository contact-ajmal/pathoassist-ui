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
        from reportlab.platypus import Image as RLImage, Table, TableStyle, Frame, Spacer
        from reportlab.lib import colors
        from reportlab.lib.colors import HexColor
        
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

        # Modern Colors
        PRIMARY_COLOR = HexColor("#0F766E") # Teal-700
        SECONDARY_COLOR = HexColor("#334155") # Slate-700
        ACCENT_COLOR = HexColor("#F1F5F9") # Slate-100 (Backgrounds)
        TEXT_COLOR = HexColor("#1E293B") # Slate-900
        LIGHT_TEAL = HexColor("#CCFBF1") # Teal-100

        # Custom Styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=26,
            textColor=PRIMARY_COLOR,
            spaceAfter=4,
            alignment=TA_LEFT,
            fontName='Helvetica-Bold'
        )

        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=11,
            textColor=SECONDARY_COLOR,
            spaceAfter=24,
            alignment=TA_LEFT,
            fontName='Helvetica'
        )

        section_header_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=13,
            textColor=PRIMARY_COLOR,
            spaceAfter=10,
            spaceBefore=16,
            borderPadding=(0, 0, 6, 0),
            borderWidth=1,
            borderColor=PRIMARY_COLOR, # Underline effect
            fontName='Helvetica-Bold'
        )

        label_style = ParagraphStyle(
            'Label',
            parent=styles['Normal'],
            fontSize=9,
            textColor=SECONDARY_COLOR,
            fontName='Helvetica-Bold'
        )
        
        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['Normal'],
            fontSize=10,
            textColor=TEXT_COLOR,
            spaceAfter=8,
            leading=15 # Better line spacing
        )
        
        narrative_style = ParagraphStyle(
            'Narrative',
            parent=body_style,
            fontSize=10,
            leading=16,
            textColor=TEXT_COLOR
        )
        
        warning_style = ParagraphStyle(
            'Warning',
            parent=styles['Normal'],
            fontSize=9,
            textColor=HexColor("#B91C1C"), # Red-700
            spaceAfter=6,
            backColor=HexColor("#FEE2E2"), # Red-100
            borderPadding=6,
            borderRadius=4
        )

        # Build content
        content = []

        # --- HEADER ---
        # Logo placeholder logic could go here
        content.append(Paragraph("PathoAssist", title_style))
        content.append(Paragraph("AI-POWERED PATHOLOGY ANALYSIS REPORT", subtitle_style))
        content.append(Spacer(1, 0.1 * inch))

        # --- PATIENT & CASE DETAILS (Boxed Table) ---
        md = report.slide_metadata
        
        # Clinical Details
        patient_age = str(md.patient_age) if md.patient_age else "Unknown"
        patient_gender = md.patient_gender if md.patient_gender else "Unknown"
        
        # Case Details
        case_id = report.case_id
        accession_date = report.analysis_date.strftime('%Y-%m-%d')
        body_site = md.body_site if md.body_site else "Unknown"
        
        data = [
            [Paragraph("PATIENT DETAILS", label_style), "", Paragraph("CASE DETAILS", label_style), ""],
            [Paragraph("Age/Gender:", label_style), Paragraph(f"{patient_age} / {patient_gender}", body_style), 
             Paragraph("Case ID:", label_style), Paragraph(case_id[:16], body_style)], # Truncate ID slightly if long
             
            [Paragraph("Body Site:", label_style), Paragraph(md.body_site or "N/A", body_style),
             Paragraph("Date:", label_style), Paragraph(accession_date, body_style)],
             
            [Paragraph("Procedure:", label_style), Paragraph(md.procedure_type or "N/A", body_style),
             Paragraph("Slide:", label_style), Paragraph(md.filename, body_style)]
        ]
        
        t = Table(data, colWidths=[1*inch, 2.5*inch, 0.8*inch, 2.7*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), ACCENT_COLOR),
            ('LINEBELOW', (0,0), (-1,0), 1, colors.lightgrey),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            # Vertical line in middle
            ('LINEAFTER', (1,0), (1,-1), 1, colors.lightgrey),
        ]))
        content.append(t)
        content.append(Spacer(1, 0.2 * inch))

        # --- CLINICAL HISTORY ---
        if md.clinical_history:
            content.append(Paragraph("Clinical History", section_header_style))
            # Wrap in a light gray box for emphasis
            c_hist = Paragraph(md.clinical_history, body_style)
            content.append(c_hist)
            content.append(Spacer(1, 0.1 * inch))

        # --- DIAGNOSTIC SUMMARY (Highlight) ---
        content.append(Paragraph("Diagnostic Summary", section_header_style))
        
        summary_data = [
            [Paragraph("<b>Tissue Classification:</b>", label_style), Paragraph(report.tissue_type.value.upper(), label_style)],
            [Paragraph("<b>AI Confidence:</b>", label_style), Paragraph(f"{report.confidence_score:.0%}", label_style)]
        ]
        
        # Narrative Text - Put inside a colored box/table
        narrative_paras = []
        for para in report.narrative_summary.split('\n\n'):
            if para.strip():
                narrative_paras.append(Paragraph(para, narrative_style))
        
        # Create a container table for the summary to give it a background
        # We put the text inside one big cell
        narrative_col = []
        narrative_col.extend(narrative_paras)
        
        final_summary_table = Table([[narrative_col]], colWidths=[7*inch])
        final_summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), HexColor("#F8FAFC")), # Very light slate
            ('BOX', (0,0), (-1,-1), 1, colors.lightgrey),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        
        content.append(Paragraph(f"<b>Tissue Classification:</b> {report.tissue_type.value.title()}", body_style))
        content.append(Spacer(1, 0.05 * inch))
        content.append(final_summary_table)
        content.append(Spacer(1, 0.2 * inch))

        # --- STRUCTURAL & MICROSCOPIC FINDINGS (Zebra Table) ---
        content.append(Paragraph("Microscopic Findings", section_header_style))
        
        findings_data = []
        # Header
        findings_data.append([Paragraph("<b>Feature</b>", label_style), Paragraph("<b>Observation</b>", label_style)])
        
        # Rows
        if report.cellularity: findings_data.append([Paragraph("Cellularity", body_style), Paragraph(report.cellularity, body_style)])
        if report.nuclear_atypia: findings_data.append([Paragraph("Nuclear Atypia", body_style), Paragraph(report.nuclear_atypia, body_style)])
        if report.mitotic_activity: findings_data.append([Paragraph("Mitotic Activity", body_style), Paragraph(report.mitotic_activity, body_style)])
        if report.necrosis: findings_data.append([Paragraph("Necrosis", body_style), Paragraph(report.necrosis, body_style)])
        if report.inflammation: findings_data.append([Paragraph("Inflammation", body_style), Paragraph(report.inflammation, body_style)])
        
        if len(findings_data) > 1:
            ft = Table(findings_data, colWidths=[2*inch, 5*inch])
            
            # Styling
            ts = TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LINEBELOW', (0,0), (-1,0), 1, PRIMARY_COLOR), # Header line
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('TOPPADDING', (0,0), (-1,-1), 8),
            ])
            
            # Zebra striping
            for i in range(1, len(findings_data)):
                if i % 2 == 0:
                    ts.add('BACKGROUND', (0,i), (-1,i), ACCENT_COLOR)
            
            ft.setStyle(ts)
            content.append(ft)
        
        # Additional Observations
        if report.other_findings:
            content.append(Spacer(1, 0.1 * inch))
            content.append(Paragraph("Detailed Observations:", label_style))
            for finding in report.other_findings:
                 # Bullet point style
                 content.append(Paragraph(f"• {finding.finding}", body_style))
        
        content.append(Spacer(1, 0.2 * inch))
        
        # --- IMAGES ---
        if include_images:
            try:
                import json
                roi_file = settings.CASES_DIR / report.case_id / "results" / "roi.json"
                patches_to_show = []
                if roi_file.exists():
                    with open(roi_file, "r") as f:
                        roi_data = json.load(f)
                    patches_to_show = roi_data.get("selected_patches", [])
                
                if patches_to_show:
                    content.append(PageBreak())
                    content.append(Paragraph("Selected Regions of Interest", section_header_style))
                    content.append(Paragraph("The following areas were selected for AI analysis based on key features.", body_style))
                    content.append(Spacer(1, 0.15 * inch))
                    
                    table_data = []
                    row = []
                    
                    for idx, patch in enumerate(patches_to_show[:6], 1): # Limit to 6
                        patch_id = patch.get("patch_id")
                        patch_file = settings.CASES_DIR / report.case_id / "patches" / f"{patch_id}.png"
                        
                        if patch_file.exists():
                            # Create Image
                            try:
                                from PIL import Image as PILImage
                                import io
                                
                                with PILImage.open(patch_file) as pil_img:
                                    pil_img.load()
                                    if pil_img.width > 400: pil_img.thumbnail((400, 400)) # Larger thumbnail for clearer grid
                                    if pil_img.mode in ('RGBA', 'LA'):
                                        background = PILImage.new(pil_img.mode[:-1], pil_img.size, (255, 255, 255))
                                        background.paste(pil_img, pil_img.split()[-1])
                                        pil_img = background
                                    pil_img = pil_img.convert("RGB")
                                    
                                    img_buffer = io.BytesIO()
                                    pil_img.save(img_buffer, format='JPEG', quality=85)
                                    img_buffer.seek(0)
                                    
                                    img = RLImage(img_buffer, width=3.2*inch, height=3.2*inch)
                                    
                                    # Caption
                                    coords = patch.get("coordinates", {})
                                    caption_txt = f"<b>ROI #{idx}</b><br/>Loc: ({coords.get('x',0)}, {coords.get('y',0)})<br/>Var: {patch.get('variance_score',0):.2f}"
                                    caption = Paragraph(caption_txt, ParagraphStyle('Caption', parent=styles['Normal'], fontSize=8, alignment=TA_CENTER, textColor=SECONDARY_COLOR))
                                    
                                    cell = [img, caption]
                                    row.append(cell)
                                    
                                    if len(row) == 2:
                                        table_data.append(row)
                                        row = []
                                        
                            except Exception as e:
                                logger.warning(f"Image error: {e}")
                    
                    if row: table_data.append(row)

                    if table_data:
                        # Flatten for table
                        final = []
                        for r in table_data:
                            imgs = [x[0] for x in r]
                            caps = [x[1] for x in r]
                            final.append(imgs)
                            final.append(caps)
                            final.append([Spacer(1, 0.1*inch)] * len(imgs)) # Spacing row
                            
                        img_table = Table(final, colWidths=[3.5*inch, 3.5*inch])
                        img_table.setStyle(TableStyle([
                            ('VALIGN', (0,0), (-1,-1), 'TOP'),
                            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                            ('TOPPADDING', (0,0), (-1,-1), 0),
                            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                        ]))
                        content.append(img_table)

            except Exception as e:
                logger.error(f"Error adding images: {e}")

        # --- DISCLAIMER ---
        content.append(Spacer(1, 0.5 * inch))
        content.append(Paragraph("<b>Disclaimer:</b> This report is generated by an AI-assisted system (PathoAssist). Findings should be verified by a qualified pathologist.", warning_style))

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
