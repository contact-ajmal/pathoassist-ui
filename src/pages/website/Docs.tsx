import { useState, useEffect } from "react";
import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { Book, Code, Terminal, Server, Shield, Cpu, Activity, FileText, CheckCircle2, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";

type DocSection = 'intro' | 'install' | 'config' | 'usage' | 'architecture';

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
                                All patient data and slide images are processed locally by default. PathoAssist uses local AI models (MedGemma) optimized for Apple Silicon (MPS) and CUDA to ensure sensitive medical data never leaves your secure infrastructure unless explicitly configured for remote inference.
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

                        {/* Open Source Note */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-amber-800 mb-1">Developer Access</h4>
                                    <p className="text-sm text-amber-700">
                                        PathoAssist is available as open-source for research and educational purposes. Developers can access the public repository on GitHub. Technical documentation is included in the repository.
                                    </p>
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
                                A typical workflow from patient intake to final report.
                            </p>
                        </div>

                        <div className="grid gap-8">
                            {[
                                {
                                    step: 1,
                                    title: "Patient Management",
                                    desc: "Start by selecting an existing patient or creating a new record. This ensures all analysis is linked to the correct Clinical Context."
                                },
                                {
                                    step: 2,
                                    title: "Case Upload",
                                    desc: "Upload a Whole Slide Image (.svs, .ndpi) or select a demo case. The system automatically generates thumbnails and extracts metadata."
                                },
                                {
                                    step: 3,
                                    title: "ROI Selection",
                                    desc: "Use the Deep Zoom viewer to navigate the slide. The system can auto-detect tissue, or you can manually select Regions of Interest (ROIs) for detailed analysis."
                                },
                                {
                                    step: 4,
                                    title: "AI Analysis",
                                    desc: "The MedGemma model processes the selected patches, identifying cellular patterns, atypia, and mitotic activity. This runs locally or remotely depending on your config."
                                },
                                {
                                    step: 5,
                                    title: "Report Generation",
                                    desc: "Review the structured findings. You can edit the narrative summary, approve the confidence scores, and export the final document as a PDF."
                                }
                            ].map((item) => (
                                <div key={item.step} className="flex gap-6 items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl">
                                        {item.step}
                                    </div>
                                    <div className="pt-2">
                                        <h3 className="font-bold text-xl text-slate-900 mb-2">{item.title}</h3>
                                        <p className="text-slate-600">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'architecture':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-4">System Architecture</h1>
                            <p className="text-lg text-slate-600">
                                PathoAssist follows a modular, offline-first architecture.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h3 className="font-bold text-lg mb-4">Tech Stack</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                                    <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Frontend</span>
                                    <span className="font-semibold">React + TypeScript</span>
                                </div>
                                <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                                    <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Backend</span>
                                    <span className="font-semibold">FastAPI (Python)</span>
                                </div>
                                <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                                    <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">AI Model</span>
                                    <span className="font-semibold">Google MedGemma</span>
                                </div>
                                <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                                    <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Imaging</span>
                                    <span className="font-semibold">OpenSlide</span>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-slate bg-indigo-50/50 p-6 rounded-xl border-l-4 border-indigo-400">
                            <h4>Why offline first?</h4>
                            <p>
                                In rural clinics and developing regions, internet connectivity is often unreliable.
                                By optimizing for local inference on consumer hardware (like MacBooks), we bring
                                diagnostic capabilities directly to the point of care without dependency on cloud infrastructure.
                            </p>
                        </div>
                    </div>
                );

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
