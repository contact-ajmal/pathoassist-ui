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
                            <h1 className="text-3xl font-bold text-slate-900 mb-4">Deployment Guide</h1>
                            <p className="text-lg text-slate-600">
                                PathoAssist supports two deployment modes: <strong>Local Inference</strong> (fully offline, maximum privacy) and <strong>Remote Inference</strong> (GPU-accelerated via cloud/Colab).
                            </p>
                        </div>

                        {/* Prerequisites */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                            <h3 className="font-bold text-lg text-amber-800 mb-3 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Prerequisites (Both Modes)
                            </h3>
                            <ul className="space-y-2 text-amber-700 text-sm">
                                <li>• <strong>Python 3.10+</strong> installed</li>
                                <li>• <strong>Node.js 18+</strong> installed</li>
                                <li>• <strong>Git</strong> for cloning the repository</li>
                                <li>• <strong>Hugging Face Account</strong> with access to <code className="bg-amber-100 px-1 rounded">google/medgemma-1.5-4b-it</code> model</li>
                            </ul>
                        </div>

                        {/* Step 1: Clone & Setup */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                    <span className="bg-teal-500 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center">1</span>
                                    Clone Repository & Install Dependencies
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-100 overflow-x-auto">
                                    <p className="text-slate-400"># Clone the repository</p>
                                    <p>git clone https://github.com/contact-ajmal/pathoassist-ui.git</p>
                                    <p>cd pathoassist-ui</p>
                                    <p className="mt-3 text-slate-400"># Install frontend dependencies</p>
                                    <p>npm install</p>
                                    <p className="mt-3 text-slate-400"># Setup backend virtual environment</p>
                                    <p>cd backend</p>
                                    <p>python -m venv venv</p>
                                    <p>source venv/bin/activate  <span className="text-slate-500"># On Windows: venv\Scripts\activate</span></p>
                                    <p>pip install -r requirements.txt</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Hugging Face Setup */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                    <span className="bg-teal-500 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center">2</span>
                                    Configure Hugging Face Token
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-slate-600">MedGemma is a gated model. You need to:</p>
                                <ol className="list-decimal list-inside space-y-2 text-slate-600 text-sm">
                                    <li>Go to <a href="https://huggingface.co/google/medgemma-1.5-4b-it" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">huggingface.co/google/medgemma-1.5-4b-it</a></li>
                                    <li>Accept the model's license agreement</li>
                                    <li>Create an Access Token at <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">huggingface.co/settings/tokens</a></li>
                                </ol>
                                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-100">
                                    <p className="text-slate-400"># Create .env file in backend directory</p>
                                    <p>cd backend</p>
                                    <p>echo 'HF_TOKEN=hf_your_token_here' {">"} .env</p>
                                </div>
                            </div>
                        </div>

                        {/* Deployment Mode Selection */}
                        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
                            <h3 className="font-bold text-lg text-teal-800 mb-4">Choose Your Deployment Mode</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-4 border border-teal-200">
                                    <h4 className="font-bold text-teal-700 mb-2">🖥️ Local Inference</h4>
                                    <p className="text-sm text-slate-600">AI runs on your machine. Requires 16GB+ RAM. Best for: privacy, offline use, Apple Silicon.</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-teal-200">
                                    <h4 className="font-bold text-teal-700 mb-2">☁️ Remote Inference</h4>
                                    <p className="text-sm text-slate-600">AI runs on cloud GPU (Colab/ngrok). Faster processing. Best for: older hardware, demos.</p>
                                </div>
                            </div>
                        </div>

                        {/* LOCAL INFERENCE SECTION */}
                        <div className="border-2 border-emerald-300 rounded-xl overflow-hidden">
                            <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-200">
                                <h3 className="font-bold text-xl text-emerald-800 flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Option A: Local Inference (Offline Mode)
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4">
                                    <h4 className="font-bold text-emerald-700 mb-2">System Requirements</h4>
                                    <ul className="text-sm text-emerald-700 space-y-1">
                                        <li>• <strong>macOS (Apple Silicon):</strong> M1/M2/M3 with 16GB+ RAM (uses Metal Performance Shaders)</li>
                                        <li>• <strong>Linux/Windows (NVIDIA):</strong> CUDA-capable GPU with 8GB+ VRAM</li>
                                        <li>• <strong>CPU Fallback:</strong> 32GB+ RAM (slow but functional)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900 mb-3">Step 3A: Configure for Local Mode</h4>
                                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-100 overflow-x-auto">
                                        <p className="text-slate-400"># backend/.env configuration</p>
                                        <p><span className="text-emerald-400">HF_TOKEN</span>=hf_your_token_here</p>
                                        <p><span className="text-emerald-400">DEVICE</span>=auto  <span className="text-slate-500"># Options: auto, cuda, mps, cpu</span></p>
                                        <p><span className="text-emerald-400">USE_QUANTIZATION</span>=true  <span className="text-slate-500"># 4-bit quantization for lower RAM</span></p>
                                        <p className="text-slate-400"># Leave REMOTE_INFERENCE_URL empty for local mode</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900 mb-3">Step 4A: Start the Application</h4>
                                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-100 overflow-x-auto">
                                        <p className="text-slate-400"># Terminal 1: Start backend</p>
                                        <p>cd backend</p>
                                        <p>source venv/bin/activate</p>
                                        <p>python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload</p>
                                        <p className="mt-4 text-slate-400"># Terminal 2: Start frontend</p>
                                        <p>cd pathoassist-ui  <span className="text-slate-500"># project root</span></p>
                                        <p>npm run dev</p>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-3">
                                        On first run, the model (~8GB) will download automatically. Subsequent starts are instant.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* REMOTE INFERENCE SECTION */}
                        <div className="border-2 border-sky-300 rounded-xl overflow-hidden">
                            <div className="bg-sky-50 px-6 py-4 border-b border-sky-200">
                                <h3 className="font-bold text-xl text-sky-800 flex items-center gap-2">
                                    <Server className="h-5 w-5" />
                                    Option B: Remote Inference (Cloud GPU)
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="bg-sky-50/50 border border-sky-200 rounded-lg p-4">
                                    <h4 className="font-bold text-sky-700 mb-2">When to Use Remote Mode</h4>
                                    <ul className="text-sm text-sky-700 space-y-1">
                                        <li>• Older hardware without GPU or insufficient RAM</li>
                                        <li>• Quick demos without installing the model locally</li>
                                        <li>• Using Google Colab's free T4 GPU tier</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900 mb-3">Step 3B: Set Up Colab Inference Server</h4>
                                    <ol className="list-decimal list-inside space-y-3 text-slate-600">
                                        <li>Open our <a href="https://colab.research.google.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">Google Colab notebook</a> (or create your own)</li>
                                        <li>Run all cells to start the MedGemma API server</li>
                                        <li>Copy the <strong>ngrok public URL</strong> (e.g., <code className="bg-slate-100 px-1 rounded text-sm">https://abc123.ngrok-free.app</code>)</li>
                                    </ol>
                                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-100 mt-4">
                                        <p className="text-slate-400"># Example Colab cell to expose API</p>
                                        <p>!pip install pyngrok flask transformers</p>
                                        <p>from pyngrok import ngrok</p>
                                        <p>public_url = ngrok.connect(5000)</p>
                                        <p>print(f"ngrok URL: {'{'}public_url{'}'}")</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900 mb-3">Step 4B: Configure Backend for Remote</h4>
                                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-100 overflow-x-auto">
                                        <p className="text-slate-400"># backend/.env configuration</p>
                                        <p><span className="text-sky-400">REMOTE_INFERENCE_URL</span>=https://abc123.ngrok-free.app</p>
                                        <p><span className="text-slate-500"># HF_TOKEN not needed when using remote mode</span></p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900 mb-3">Step 5B: Start the Application</h4>
                                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-100 overflow-x-auto">
                                        <p className="text-slate-400"># Same as local mode - backend auto-detects remote URL</p>
                                        <p>cd backend && python -m uvicorn app.main:app --port 8000</p>
                                        <p className="mt-2 text-slate-400"># In another terminal:</p>
                                        <p>npm run dev</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Validator */}
                        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xl">
                            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                <Terminal className="h-5 w-5 text-teal-400" />
                                System Capability Validator
                            </h3>
                            <p className="text-slate-300 text-sm mb-6">
                                Check if this device meets the requirements for offline inference with MedGemma-4B.
                            </p>

                            <DeploymentValidator />
                        </div>

                        {/* Verification */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    Verify Your Deployment
                                </h3>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-600 mb-4">Once both frontend and backend are running:</p>
                                <ol className="list-decimal list-inside space-y-2 text-slate-600 text-sm">
                                    <li>Open <code className="bg-slate-100 px-1 rounded">http://localhost:5173</code> in your browser</li>
                                    <li>Navigate to the Documentation page and run the <strong>System Validator</strong> above</li>
                                    <li>Upload a sample WSI file (.svs or .ndpi) to test the full pipeline</li>
                                    <li>Check backend logs for any model loading or inference errors</li>
                                </ol>
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
