
import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Whitepaper() {
    return (
        <WebsiteLayout>
            <div className="bg-slate-50 min-h-screen pb-20">
                {/* Header */}
                <div className="bg-slate-900 text-white py-16">
                    <div className="container mx-auto px-4">
                        <Link to="/safety" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Safety Overview
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            Zero Hallucination Protocol: Technical Whitepaper
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl">
                            A deep dive into the 4-layer architecture ensuring AI reliability in diagnostic pathology workflows.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 -mt-8">
                    <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto border border-slate-200">
                        {/* Executive Summary */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b pb-2">1. Executive Summary</h2>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                The adoption of Artificial Intelligence in pathology is hindered by the risk of "hallucinations"—plausible but factually incorrect outputs.
                                For PathoAssist, we have implemented a <strong>Zero Hallucination Protocol (ZHP)</strong> that fundamentally changes the interaction model:
                                instead of a generative chat, we treat AI output as a <strong>verifiable search index</strong> of visual evidence.
                            </p>
                            <div className="bg-teal-50 border border-teal-100 p-4 rounded-lg">
                                <p className="text-teal-800 font-medium italic">
                                    "The AI is not the pathologist. It is a high-speed lens that points to the evidence."
                                </p>
                            </div>
                        </section>

                        {/* The Challenge */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b pb-2">2. The "Silent Failure" Challenge</h2>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                Traditional LLMs optimized for coherence often fill information gaps with fabrication. In a clinical setting, this is unacceptable.
                                Common failure modes include:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-700">
                                <li><strong>Inventing Details:</strong> Describing mitotic figures in a blur region.</li>
                                <li><strong>False Confidence:</strong> Stating "High Grade Dispatch" based on noise.</li>
                                <li><strong>Citation Drift:</strong> Referencing an ROI that does not contain the claimed feature.</li>
                            </ul>
                        </section>

                        {/* Architecture */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b pb-2">3. The 4-Layer Safety Architecture</h2>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Layer 1: Deterministic Refusal (The Gatekeeper)</h3>
                                    <p className="text-slate-700 leading-relaxed">
                                        Before inference occurs, the backend engine performs deterministic checks on the WSI (Whole Slide Image).
                                        We measure <strong>Tissue Density</strong> (must be &gt;10%) and <strong>Laplacian Variance</strong> (Focus Score &gt; 100).
                                        If these hard thresholds are not met, the API returns a <code>400 Refusal</code> result.
                                        There is no "AI guessing" here; it is pure signal processing.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Layer 2: Constrained Prompting (The Contract)</h3>
                                    <p className="text-slate-700 leading-relaxed">
                                        We utilize MedGemma-2b with a system prompt that enforces a strict "No Citation, No Output" rule.
                                        The model is penalized for any finding that lacks an <code>[ROI-ID]</code> tag.
                                        We explicitly map the "Unknown" token space, forcing the model to output <code>[INSUFFICIENT_EVIDENCE]</code> instead of low-probability tokens.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Layer 3: The Critic Loop (Internal Audit)</h3>
                                    <p className="text-slate-700 leading-relaxed">
                                        A lightweight classification head runs a second pass: <em>"Does ROI-3 actually contain 'nuclear atypia'?"</em>
                                        If the vision-encoder embedding of ROI-3 has a low cosine similarity to the concept "atypia", the finding is suppressed
                                        before it reaches the frontend.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Layer 4: Human-in-the-Loop Verification (The User)</h3>
                                    <p className="text-slate-700 leading-relaxed">
                                        The final safeguard is the pathologist. Our UI renders every AI claim as a clickable hyperlink.
                                        Hovering over "mitotic activity" immediately pans the high-resolution viewer to the specific cells responsible for that inference.
                                        This "Click-to-Verify" mechanism ensures accountability.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Regulatory Alignment */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b pb-2">4. Regulatory Alignment (FDA/SaMD)</h2>
                            <p className="text-slate-700 leading-relaxed mb-6">
                                PathoAssist is designed to align with FDA "Software as a Medical Device" (SaMD) guidance for Clinical Decision Support (CDS) software.
                            </p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 p-6 rounded-lg border">
                                    <h4 className="font-bold text-slate-900 mb-2">Auditability</h4>
                                    <p className="text-sm text-slate-600">Every inference request is logged with Input Sha256, Prompt Version, and Raw Output for distinct reproducibility.</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-lg border">
                                    <h4 className="font-bold text-slate-900 mb-2">Non-Diagnosis</h4>
                                    <p className="text-sm text-slate-600">The system is labeled strictly as a "Triage & Prioritization" tool, not a diagnostic agent.</p>
                                </div>
                            </div>
                        </section>

                        <div className="border-t pt-8 mt-12 flex justify-between items-center">
                            <p className="text-sm text-slate-500">Last Updated: February 2026</p>
                            <Button className="bg-slate-900 text-white gap-2">
                                <Download className="w-4 h-4" />
                                Download PDF Version
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </WebsiteLayout>
    );
}
