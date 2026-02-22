import { useState, useEffect } from "react";
import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { Book, BookOpen, Code, Terminal, Server, Shield, Cpu, Activity, FileText, CheckCircle2, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
import TechnicalDocs from "./TechnicalDocs";

type DocSection = 'intro' | 'install' | 'config' | 'usage' | 'architecture' | 'technical';

function DeploymentValidator() {
    const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
    const [report, setReport] = useState<any>(null);

    const runCheck = async () => {
        setStatus('checking');
        try {
            // Fetch from backend
            const res = await fetch(`${API_BASE_URL}/health/detailed`);
            if (!res.ok) throw new Error("Failed to connect");
            const data = await res.json();

            // Simulate "Analysis" delay for effect
            await new Promise(r => setTimeout(r, 1500));

            setReport(data);
            setStatus('success');
        } catch (e) {
            setStatus('error');
        }
    };

    if (status === 'idle') {
        return (
            <Button onClick={runCheck} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-6">
                Run Feasibility Check
            </Button>
        );
    }

    if (status === 'checking') {
        return (
            <div className="text-center py-8 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-teal-400 mx-auto" />
                <p className="text-teal-100">Analyzing host hardware capabilities...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg text-center">
                <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <h4 className="font-bold text-red-200">Connection Failed</h4>
                <p className="text-sm text-red-200/70">Ensure backend is running on port 8007</p>
                <Button onClick={runCheck} variant="ghost" className="mt-4 text-white hover:bg-white/10">Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-teal-500/30">
                <span className="text-slate-300">Accelerator</span>
                <span className="font-mono text-teal-300 font-bold">{report.system.accelerator}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-teal-500/30">
                <span className="text-slate-300">Available RAM</span>
                <div className="text-right">
                    <span className="font-mono text-white font-bold block">{report.system.ram_available_gb} GB</span>
                    <span className="text-xs text-slate-400">of {report.system.ram_total_gb} GB Total</span>
                </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-teal-500/30">
                <span className="text-slate-300">Model Quantization</span>
                <span className="inline-flex items-center gap-1.5 text-teal-300 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    4-bit Supported
                </span>
            </div>

            <div className="bg-teal-500/20 border border-teal-500/50 p-4 rounded-lg mt-4">
                <p className="text-teal-200 text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    System is Ready for Deployment
                </p>
                <p className="text-xs text-teal-200/70 mt-1">
                    This device meets the requirements for offline clinical inference.
                </p>
            </div>

            <Button onClick={() => setStatus('idle')} variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-white/5 text-xs">
                Run Check Again
            </Button>
        </div>
    );
}

export default function Docs() {
    const [activeSection, setActiveSection] = useState<DocSection>('intro');

    const sections: { id: DocSection; label: string; icon: any }[] = [
        { id: 'intro', label: 'Introduction', icon: Book },
        { id: 'install', label: 'Deployment', icon: Terminal },
        { id: 'config', label: 'Configuration', icon: Server },
        { id: 'usage', label: 'User Guide', icon: Activity },
        { id: 'architecture', label: 'Architecture', icon: Cpu },
        { id: 'technical', label: 'Technical Review', icon: Code },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'intro':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-4">PathoAssist Documentation</h1>
                            <p className="text-xl text-slate-600 leading-relaxed">
                                PathoAssist is an AI-powered offline pathology assistant designed to help clinicians in resource-constrained environments analyze Whole Slide Images (WSI) and generate professional reports.
                            </p>
                        </div>

                        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
                            <h3 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Privacy First Design
                            </h3>
                            <p className="text-teal-700">
                                All patient data and slide images are processed locally by default. PathoAssist uses local AI models (Google MedGemma) optimized for Apple Silicon (MPS) and CUDA to ensure sensitive medical data never leaves your secure infrastructure unless explicitly configured for remote inference.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 border border-slate-200 rounded-xl">
                                <h3 className="font-bold text-lg mb-2">Key Features</h3>
                                <ul className="space-y-2 text-slate-600">
                                    <li>• Deep Zoom WSI Viewer (.svs, .ndpi, .tiff)</li>
                                    <li>• Local AI Inference (No internet required)</li>
                                    <li>• Automated Reporting & Export</li>
                                    <li>• Patient Context Integration</li>
                                </ul>
                            </div>
                            <div className="p-6 border border-slate-200 rounded-xl">
                                <h3 className="font-bold text-lg mb-2">System Requirements</h3>
                                <ul className="space-y-2 text-slate-600">
                                    <li>• <strong>OS:</strong> macOS (M1/M2/M3), Linux, or Windows</li>
                                    <li>• <strong>RAM:</strong> 16GB Minimum (32GB Recommended)</li>
                                    <li>• <strong>Storage:</strong> 10GB for Models & Data</li>
                                    <li>• <strong>Python:</strong> 3.10+</li>
                                    <li>• <strong>Node.js:</strong> 18+</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case 'install':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-4">Deployment Options</h1>
                            <p className="text-lg text-slate-600">
                                PathoAssist offers flexible deployment models to meet diverse institutional requirements, from fully offline local installations to cloud-accelerated configurations.
                            </p>
                        </div>

                        {/* Deployment Models */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-emerald-100 p-2 rounded-lg">
                                        <Shield className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <h3 className="font-bold text-xl text-emerald-800">Local Inference</h3>
                                </div>
                                <p className="text-slate-600 mb-4">
                                    Run PathoAssist entirely on your own hardware. All patient data and AI processing stays within your secure environment.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>Complete data privacy—nothing leaves your network</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>Works offline after initial setup</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>Optimized for modern hardware (Apple Silicon, NVIDIA GPUs)</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-sky-100 p-2 rounded-lg">
                                        <Server className="h-6 w-6 text-sky-600" />
                                    </div>
                                    <h3 className="font-bold text-xl text-sky-800">Remote Inference</h3>
                                </div>
                                <p className="text-slate-600 mb-4">
                                    Leverage cloud GPU resources for faster processing while maintaining local control of your data pipeline.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
                                        <span>Faster inference on high-performance GPUs</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
                                        <span>Lower hardware requirements at the point of care</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
                                        <span>Configurable for secure cloud environments</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* System Requirements */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                                <h3 className="font-bold text-lg text-slate-900">System Requirements</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-slate-800 mb-3">For Local Inference</h4>
                                        <ul className="space-y-2 text-sm text-slate-600">
                                            <li>• macOS with Apple Silicon (M1/M2/M3), 16GB+ RAM</li>
                                            <li>• Linux/Windows with NVIDIA GPU, 8GB+ VRAM</li>
                                            <li>• CPU-only mode available (32GB+ RAM)</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800 mb-3">For Remote Inference</h4>
                                        <ul className="space-y-2 text-sm text-slate-600">
                                            <li>• Any modern computer with a web browser</li>
                                            <li>• Stable network connection</li>
                                            <li>• Cloud GPU instance (provided or self-hosted)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enterprise Deployment */}
                        <div className="bg-slate-900 text-white rounded-xl p-8">
                            <div className="flex items-start gap-4">
                                <div className="bg-teal-500/20 p-3 rounded-xl shrink-0">
                                    <Shield className="h-8 w-8 text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl mb-2">Enterprise & Institutional Deployment</h3>
                                    <p className="text-slate-300 mb-4">
                                        For healthcare institutions requiring HIPAA-compliant deployments, on-premise installations, or custom integrations with existing hospital systems, we provide dedicated support.
                                    </p>
                                    <ul className="space-y-2 text-sm text-slate-300 mb-6">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-400" />
                                            Private repository access with full source code
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-400" />
                                            Containerized deployment options
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-400" />
                                            Integration support for HL7/FHIR workflows
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-400" />
                                            Dedicated onboarding and training
                                        </li>
                                    </ul>
                                    <a
                                        href="https://www.linkedin.com/in/ajmalnazirbaba/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
                                    >
                                        Contact for Deployment Support
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Research & Educational Access */}
                        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-indigo-100 p-2 rounded-lg shrink-0">
                                    <BookOpen className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-indigo-900 mb-2">Research & Educational Access</h4>
                                    <p className="text-sm text-indigo-700 mb-4">
                                        While PathoAssist is not publicly available as open-source, we actively support the research and academic community. If you are a researcher, educator, or student working on digital pathology or AI-assisted diagnostics, we would be happy to discuss access to the codebase for non-commercial purposes.
                                    </p>
                                    <a
                                        href="https://www.linkedin.com/in/ajmalnazirbaba/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                                    >
                                        Request Research Access →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'config':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-4">Configuration</h1>
                            <p className="text-lg text-slate-600">
                                Customize the application settings using the <code>backend/.env</code> file.
                            </p>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 font-bold text-slate-700">Variable</th>
                                        <th className="p-4 font-bold text-slate-700">Description</th>
                                        <th className="p-4 font-bold text-slate-700">Default</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="p-4 font-mono text-teal-600">PORT</td>
                                        <td className="p-4">Backend server port</td>
                                        <td className="p-4 font-mono">8000</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-mono text-teal-600">DEVICE</td>
                                        <td className="p-4">Inference device (cuda, mps, cpu)</td>
                                        <td className="p-4 font-mono">auto</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-mono text-teal-600">REMOTE_INFERENCE_URL</td>
                                        <td className="p-4">URL for remote GPU inference server</td>
                                        <td className="p-4 font-mono">""</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-mono text-teal-600">HF_TOKEN</td>
                                        <td className="p-4">Hugging Face API Token for model access</td>
                                        <td className="p-4 font-mono">Required</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'usage':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-4">User Guide</h1>
                            <p className="text-lg text-slate-600">
                                A comprehensive walkthrough of the clinical workflow, from patient intake to final diagnostic report generation.
                            </p>
                        </div>

                        {/* Workflow Steps */}
                        <div className="space-y-6">
                            {[
                                {
                                    step: 1,
                                    title: "Patient Management",
                                    desc: "Begin by selecting an existing patient record or creating a new one. Patient context is critical for accurate AI analysis.",
                                    details: [
                                        "Enter patient demographics (age, sex, relevant medical history)",
                                        "Add clinical notes and presenting symptoms",
                                        "Link prior cases for longitudinal tracking"
                                    ],
                                    color: "teal"
                                },
                                {
                                    step: 2,
                                    title: "Slide Upload & Preprocessing",
                                    desc: "Upload digitized pathology slides in standard formats. The system handles all preprocessing automatically.",
                                    details: [
                                        "Supported formats: .svs, .ndpi, .tiff, .mrxs",
                                        "Automatic thumbnail generation and metadata extraction",
                                        "Multi-resolution pyramid loading for responsive viewing"
                                    ],
                                    color: "sky"
                                },
                                {
                                    step: 3,
                                    title: "Deep Zoom Viewer & ROI Selection",
                                    desc: "Navigate gigapixel slides seamlessly with our optimized viewer. Select regions of interest for detailed AI analysis.",
                                    details: [
                                        "Smooth pan and zoom across entire slide at any magnification",
                                        "Automatic tissue detection using Otsu's thresholding",
                                        "Manual annotation tools for precise ROI selection",
                                        "Smart patch selection ranks regions by diagnostic potential"
                                    ],
                                    color: "violet"
                                },
                                {
                                    step: 4,
                                    title: "AI-Powered Analysis",
                                    desc: "Google MedGemma analyzes selected tissue patches using true multimodal reasoning, combining visual patterns with clinical context.",
                                    details: [
                                        "Cellular morphology and architecture assessment",
                                        "Nuclear atypia and mitotic activity detection",
                                        "Tissue type classification and pattern recognition",
                                        "Confidence scoring for all findings"
                                    ],
                                    color: "amber"
                                },
                                {
                                    step: 5,
                                    title: "Findings Review & Editing",
                                    desc: "Review AI-generated findings with full transparency. Edit, approve, or reject individual observations.",
                                    details: [
                                        "Structured findings with confidence levels",
                                        "Side-by-side comparison with source regions",
                                        "Editable narrative summaries",
                                        "Differential diagnosis suggestions"
                                    ],
                                    color: "rose"
                                },
                                {
                                    step: 6,
                                    title: "Report Generation & Export",
                                    desc: "Generate professional pathology reports ready for clinical use or further review.",
                                    details: [
                                        "Customizable report templates",
                                        "Export to PDF with embedded images",
                                        "Audit trail and version history",
                                        "Integration-ready structured data output"
                                    ],
                                    color: "emerald"
                                }
                            ].map((item) => (
                                <div key={item.step} className="flex gap-6 items-start">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-${item.color}-100 text-${item.color}-700 flex items-center justify-center font-bold text-xl`}>
                                        {item.step}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-xl text-slate-900 mb-2">{item.title}</h3>
                                        <p className="text-slate-600 mb-3">{item.desc}</p>
                                        <ul className="grid sm:grid-cols-2 gap-2">
                                            {item.details.map((detail, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-500">
                                                    <CheckCircle2 className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                                                    <span>{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Best Practices */}
                        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
                            <h3 className="font-bold text-lg text-teal-800 mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                Best Practices for Optimal Results
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-4 border border-teal-100">
                                    <h4 className="font-semibold text-slate-800 mb-2">Slide Quality</h4>
                                    <p className="text-sm text-slate-600">Ensure slides are properly focused and free of artifacts. Poor quality scans reduce AI accuracy.</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-teal-100">
                                    <h4 className="font-semibold text-slate-800 mb-2">Clinical Context</h4>
                                    <p className="text-sm text-slate-600">Provide complete patient history. The AI uses clinical context to improve diagnostic precision.</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-teal-100">
                                    <h4 className="font-semibold text-slate-800 mb-2">ROI Selection</h4>
                                    <p className="text-sm text-slate-600">Select multiple representative regions. Diverse sampling improves comprehensive analysis.</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-teal-100">
                                    <h4 className="font-semibold text-slate-800 mb-2">Human Review</h4>
                                    <p className="text-sm text-slate-600">Always review AI findings. PathoAssist is a decision support tool, not a replacement for clinical judgment.</p>
                                </div>
                            </div>
                        </div>

                        {/* Important Notice */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-amber-800 mb-1">Clinical Disclaimer</h4>
                                    <p className="text-sm text-amber-700">
                                        PathoAssist is designed as a decision support tool for research and educational purposes. All AI-generated findings must be reviewed and validated by qualified healthcare professionals before any clinical decisions are made.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'architecture':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-4">System Architecture</h1>
                            <p className="text-lg text-slate-600">
                                PathoAssist is built on a modular, privacy-first architecture designed for both standalone deployment and enterprise integration.
                            </p>
                        </div>

                        {/* Architecture Diagram Placeholder */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 text-white">
                            <h3 className="font-bold text-lg mb-6 text-center">High-Level System Architecture</h3>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                                <div className="bg-sky-500/20 border border-sky-400/50 rounded-lg p-4 w-40">
                                    <div className="text-sky-300 text-xs uppercase tracking-wider mb-1">Frontend</div>
                                    <div className="font-semibold">React UI</div>
                                </div>
                                <div className="text-slate-500">→</div>
                                <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-lg p-4 w-40">
                                    <div className="text-emerald-300 text-xs uppercase tracking-wider mb-1">Backend</div>
                                    <div className="font-semibold">FastAPI Server</div>
                                </div>
                                <div className="text-slate-500">→</div>
                                <div className="bg-violet-500/20 border border-violet-400/50 rounded-lg p-4 w-40">
                                    <div className="text-violet-300 text-xs uppercase tracking-wider mb-1">AI Engine</div>
                                    <div className="font-semibold">Google MedGemma</div>
                                </div>
                            </div>
                            <div className="flex justify-center mt-4">
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full"></span> WSI Processing</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-teal-400 rounded-full"></span> Local Storage</span>
                                </div>
                            </div>
                        </div>

                        {/* Core Components */}
                        <div>
                            <h3 className="font-bold text-xl text-slate-900 mb-4">Core Components</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="border border-slate-200 rounded-xl p-5 hover:border-teal-300 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-sky-100 p-2 rounded-lg">
                                            <Code className="h-5 w-5 text-sky-600" />
                                        </div>
                                        <h4 className="font-bold text-slate-800">Frontend Application</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">Modern React application with TypeScript for type safety and enhanced developer experience.</p>
                                    <ul className="text-xs text-slate-500 space-y-1">
                                        <li>• Deep Zoom slide viewer with OpenSeadragon</li>
                                        <li>• Responsive design for desktop and tablet</li>
                                        <li>• State management with React hooks</li>
                                        <li>• Tailwind CSS for consistent styling</li>
                                    </ul>
                                </div>

                                <div className="border border-slate-200 rounded-xl p-5 hover:border-teal-300 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-emerald-100 p-2 rounded-lg">
                                            <Server className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <h4 className="font-bold text-slate-800">Backend API</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">High-performance Python backend handling slide processing, AI inference, and data management.</p>
                                    <ul className="text-xs text-slate-500 space-y-1">
                                        <li>• FastAPI for async request handling</li>
                                        <li>• OpenSlide for multi-format WSI support</li>
                                        <li>• OpenCV for tissue detection algorithms</li>
                                        <li>• RESTful API with automatic documentation</li>
                                    </ul>
                                </div>

                                <div className="border border-slate-200 rounded-xl p-5 hover:border-teal-300 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-violet-100 p-2 rounded-lg">
                                            <Cpu className="h-5 w-5 text-violet-600" />
                                        </div>
                                        <h4 className="font-bold text-slate-800">AI Inference Engine</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">Multimodal vision-language model optimized for medical imaging with clinical reasoning capabilities.</p>
                                    <ul className="text-xs text-slate-500 space-y-1">
                                        <li>• Google MedGemma foundation model</li>
                                        <li>• 4-bit quantization for efficient inference</li>
                                        <li>• Support for MPS, CUDA, and CPU</li>
                                        <li>• Structured output for findings extraction</li>
                                    </ul>
                                </div>

                                <div className="border border-slate-200 rounded-xl p-5 hover:border-teal-300 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-amber-100 p-2 rounded-lg">
                                            <FileText className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <h4 className="font-bold text-slate-800">Report Generator</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">Automated report generation with customizable templates and professional formatting.</p>
                                    <ul className="text-xs text-slate-500 space-y-1">
                                        <li>• Clinical-grade report templates</li>
                                        <li>• PDF export with embedded images</li>
                                        <li>• Structured data output for EHR integration</li>
                                        <li>• Audit trail and version control</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Data Flow */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                            <h3 className="font-bold text-lg text-slate-900 mb-4">Data Flow</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">Slide Ingestion</h4>
                                        <p className="text-sm text-slate-600">WSI files are uploaded and stored locally. OpenSlide extracts multi-resolution tiles without loading entire files into memory.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">Tissue Detection</h4>
                                        <p className="text-sm text-slate-600">Otsu's thresholding identifies tissue regions. Color variance scoring ranks patches by diagnostic relevance.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">AI Analysis</h4>
                                        <p className="text-sm text-slate-600">Selected patches are processed by Google MedGemma with clinical context. The model generates structured findings with confidence scores.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">4</div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">Report Assembly</h4>
                                        <p className="text-sm text-slate-600">Findings are aggregated into a cohesive narrative. PDFs are generated with professional formatting and embedded visualizations.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Design Principles */}
                        <div>
                            <h3 className="font-bold text-xl text-slate-900 mb-4">Design Principles</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-5">
                                    <Shield className="h-8 w-8 text-teal-600 mb-3" />
                                    <h4 className="font-bold text-slate-800 mb-2">Privacy First</h4>
                                    <p className="text-sm text-slate-600">All data processing happens locally by default. No patient information leaves your environment without explicit configuration.</p>
                                </div>
                                <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-xl p-5">
                                    <Activity className="h-8 w-8 text-sky-600 mb-3" />
                                    <h4 className="font-bold text-slate-800 mb-2">Offline Capable</h4>
                                    <p className="text-sm text-slate-600">After initial setup, PathoAssist runs without internet. Critical for rural clinics and areas with unreliable connectivity.</p>
                                </div>
                                <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-5">
                                    <Cpu className="h-8 w-8 text-violet-600 mb-3" />
                                    <h4 className="font-bold text-slate-800 mb-2">Hardware Optimized</h4>
                                    <p className="text-sm text-slate-600">Automatic detection and optimization for available hardware—Apple Silicon, NVIDIA GPUs, or CPU fallback.</p>
                                </div>
                            </div>
                        </div>

                        {/* Why Offline First */}
                        <div className="bg-indigo-50/50 p-6 rounded-xl border-l-4 border-indigo-400">
                            <h4 className="font-bold text-indigo-900 mb-2">Why Offline-First Matters</h4>
                            <p className="text-indigo-800">
                                In rural clinics and developing regions, internet connectivity is often unreliable or unavailable.
                                By optimizing for local inference on consumer hardware, PathoAssist brings diagnostic capabilities
                                directly to the point of care—eliminating dependency on cloud infrastructure and ensuring
                                continuous operation regardless of network conditions.
                            </p>
                        </div>
                    </div>
                );

            case 'technical':
                return <TechnicalDocs />;

            default:
                return null;
        }
    };

    return (
        <WebsiteLayout>
            <div className="container mx-auto px-4 py-8 lg:py-16">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4 px-2 text-sm uppercase tracking-wider">Documentation</h3>
                            <ul className="space-y-1">
                                {sections.map((section) => (
                                    <li key={section.id}>
                                        <button
                                            onClick={() => setActiveSection(section.id)}
                                            className={cn(
                                                "w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-3",
                                                activeSection === section.id
                                                    ? "bg-teal-50 text-teal-700 shadow-sm translate-x-1"
                                                    : "text-slate-600 hover:text-teal-600 hover:bg-slate-50"
                                            )}
                                        >
                                            <section.icon className={cn("h-4 w-4 transition-colors", activeSection === section.id ? "text-teal-600" : "text-slate-400")} />
                                            {section.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>


                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-h-[600px] lg:border-l lg:border-slate-100 lg:pl-16">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </WebsiteLayout>
    );
}
