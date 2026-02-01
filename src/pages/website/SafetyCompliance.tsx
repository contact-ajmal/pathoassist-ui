
import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, CheckCircle, AlertTriangle, FileCode, Check, Search, Server } from "lucide-react";
import { Link } from "react-router-dom";

export default function SafetyCompliance() {
    return (
        <WebsiteLayout>
            <div className="bg-white">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-slate-900 py-20 sm:py-32">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                    <div className="container relative mx-auto px-4 text-center">
                        <div className="mx-auto max-w-2xl">
                            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                                Zero Hallucination Protocol
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-slate-300">
                                Our commitment to safety, transparency, and regulatory compliance.
                                We employ a 4-layer defense system to ensure AI reliability in clinical workflows.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Button className="bg-teal-600 hover:bg-teal-500 text-white" size="lg">
                                    Read Whitepaper
                                </Button>
                                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10" size="lg">
                                    Contact Compliance
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Philosophy */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl text-center mb-16">
                            <h2 className="text-base font-semibold leading-7 text-teal-600">Core Philosophy</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                "If in doubt, refuse."
                            </p>
                            <p className="mt-6 text-lg leading-8 text-slate-600">
                                In pathology, false confidence is dangerous. Our system is architected to prefer
                                explicit refusal or uncertainty over fabrication. We do not optimize for
                                "convincing" text; we optimize for <strong>grounded truth</strong>.
                            </p>
                        </div>

                        {/* 4-Layer Architecture Visual */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <LayerCard
                                icon={Server}
                                layer="Layer 1"
                                title="Pre-Inference Quality Gates"
                                description="Algorithmic refusal before AI generation. Checks for tissue sufficiency, focus quality, and staining artifacts."
                                color="bg-blue-500"
                            />
                            <LayerCard
                                icon={Lock}
                                layer="Layer 2"
                                title="Strict Constraints"
                                description="System prompts with negative constraints. 'Do not invent findings'. Mandatory ROI citations for every claim."
                                color="bg-indigo-500"
                            />
                            <LayerCard
                                icon={Search}
                                layer="Layer 3"
                                title="The 'Critic' Loop"
                                description="Post-generation verification. A secondary model validates that cited ROIs actually contain the described features."
                                color="bg-purple-500"
                            />
                            <LayerCard
                                icon={Eye}
                                layer="Layer 4"
                                title="Visual Verification"
                                description="Human-in-the-loop. Every AI claim is a clickable link that jumps the viewer to the exact visual evidence."
                                color="bg-teal-500"
                            />
                        </div>
                    </div>
                </section>

                {/* Technical Implementation Details */}
                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                            {/* Code Column */}
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">Technical Implementation</h2>
                                <p className="text-slate-600 mb-8">
                                    Transparency is key for regulatory approval. Here is the actual production code
                                    implementing our safety layers.
                                </p>

                                <div className="space-y-8">
                                    <CodeBlock
                                        title="Layer 1: The Refusal Logic (engine.py)"
                                        language="python"
                                        code={`# --- HALLUCINATION PREVENTION (LAYER 1) ---
# Check Tissue Sufficiency
if len(tissue_patches) / total_patches < 0.1:
    logger.warning("Analysis REFUSED: Insufficient tissue.")
    return self._create_refusal_result(
        reason="Analysis Refused: Insufficient tissue density.",
        warnings=["[REFUSAL] Tissue density < 10%"]
    )

# Check Image Quality (Focus)
if all(p.variance_score < 0.1 for p in tissue_patches):
    return self._create_refusal_result(
        reason="Analysis Refused: Possible blur/artifact.",
        warnings=["[REFUSAL] Low variance/Focus issue"]
    )`}
                                    />

                                    <CodeBlock
                                        title="Layer 4: Visual Grounding (PathoCopilot.tsx)"
                                        language="typescript"
                                        code={`// Helper to render message with clickable ROI links
const renderMessageContent = (content: string) => {
    // Parser finds [ROI-X] tags in AI response
    const parts = content.split(/(\\[(?:ROI)-?\\s*#?\\d+\\])/gi);
    
    return parts.map((part) => {
        // Converts text citations to interactive buttons
        if (part.match(/\\[ROI-?\\d+\\]/)) {
            return (
                <button onClick={() => viewEvidence(index)}>
                    <ImageIcon className="icon" />
                    {part} {/* e.g., "[ROI-3]" */}
                </button>
            );
        }
        return <span>{part}</span>;
    });
};`}
                                    />
                                </div>
                            </div>

                            {/* Features Column */}
                            <div className="space-y-12">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                                        <AlertTriangle className="text-amber-500" />
                                        Handling Uncertainty
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        Unlike generative chatbots, PathoAssist is trained to define its "Unknowns".
                                        Our prompts strictly forbid guessing. If the visual evidence is ambiguous,
                                        the model outputs an <code>[INSUFFICIENT_EVIDENCE]</code> token which flags
                                        the case for mandatory manual review.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                                        <CheckCircle className="text-teal-600" />
                                        Evidence-Based Reasoning
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        Every diagnostic claim (e.g., "Nuclear atypia present") is treated as a
                                        hypothesis that requires a citation. By linking text generation directly
                                        to image patches (ROIs), we create a closed-loop system where text cannot
                                        exist without visual support.
                                    </p>
                                </div>

                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                                    <h4 className="font-semibold text-slate-900 mb-4">Regulator Readiness Checklist</h4>
                                    <ul className="space-y-3">
                                        <CheckItem text="FDA 'Software as a Medical Device' (SaMD) aligned" />
                                        <CheckItem text="Audit trails for all AI decisions" />
                                        <CheckItem text="Reproducible inference pipeline" />
                                        <CheckItem text="Human-in-the-loop verification workflow" />
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </WebsiteLayout>
    );
}

function LayerCard({ icon: Icon, layer, title, description, color }: any) {
    return (
        <Card className="relative overflow-hidden border-0 shadow-lg group hover:-translate-y-1 transition-transform duration-300">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${color}`} />
            <div className="p-6">
                <div className={`w-12 h-12 rounded-lg ${color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:bg-opacity-20 transition-colors`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{layer}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
            </div>
        </Card>
    );
}

function CodeBlock({ title, code, language }: any) {
    return (
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-950">
                <FileCode className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-300">{title}</span>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed text-slate-300">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );
}

function CheckItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-sm text-slate-700">{text}</span>
        </li>
    );
}
