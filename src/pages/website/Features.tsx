import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { motion } from "framer-motion";
import { Check, Shield, Zap, Server, Lock, WifiOff, MessageSquare, MessageCircle, Bot } from "lucide-react";

export default function Features() {
    const specs = [
        { title: "Model Architecture", value: "MedGemma 4B" },
        { title: "Training Data", value: "PubMed + PathVQA" },
        { title: "Context Window", value: "4096 Tokens" },
        { title: "Inference Time", value: "< 5s / slide" },
    ];

    return (
        <WebsiteLayout>
            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">Advanced Pathology Features</h1>
                        <p className="text-xl text-slate-300 font-light">
                            Leveraging <strong>MedGemma</strong> and local acceleration (MPS/CUDA) to deliver hospital-grade analysis on consumer devices.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Feature 1: Remote Inference */}
            <section className="py-24 border-b border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <div className="bg-teal-100 p-3 rounded-2xl inline-flex items-center justify-center mb-6 shadow-sm">
                                <Server className="h-8 w-8 text-teal-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Remote Inference Engine</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Offload heavy computation to secure remote environments. PathoAssist seamlessly connects to external GPU instances to run the 8GB+ MedGemma model, enabling powerful AI analysis even on standard laptops without compromising local performance.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {specs.map((spec) => (
                                    <div key={spec.title} className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-teal-100 transition-colors">
                                        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">{spec.title}</p>
                                        <p className="font-bold text-slate-900">{spec.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-teal-50 border border-teal-100 rounded-xl flex items-start gap-3">
                                <div className="bg-teal-100 p-1.5 rounded-full shrink-0">
                                    <Check className="h-4 w-4 text-teal-700" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-teal-900">Built on Proven Technology</p>
                                    <p className="text-sm text-teal-700 mt-1 leading-relaxed">
                                        PathoAssist extends the capabilities of Google's HAI-DEF architecture.
                                        <a href="https://huggingface.co/spaces/google/path-foundation-demo" target="_blank" rel="noopener noreferrer" className="underline font-bold ml-1 hover:text-teal-900">
                                            Try Google's Official Path Foundation Demo
                                        </a> to verify the model's baseline reliability.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <img src="/screen_home.png" alt="Remote Config" className="rounded-2xl shadow-2xl border border-slate-200" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 1.5: PathoAssist AI Bot */}
            <section className="py-24 bg-teal-50/50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                        <div className="lg:w-1/2">
                            <div className="bg-teal-100 p-3 rounded-2xl inline-flex items-center justify-center mb-6 shadow-sm">
                                <MessageSquare className="h-8 w-8 text-teal-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">PathoAssist AI Bot</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Meet your new digital fellow. The <strong>PathoAssist AI Bot</strong> (formerly Copilot) lives right alongside your slide viewer. It sees exactly what you see and is ready to answer questions, explain findings, or draft sections of your report instantly.
                            </p>
                            <ul className="space-y-4">
                                {['"What features support a diagnosis of melanoma?"', '"Draft a microscopic description for this ROI"', '"Explain why you ruled out nevus"'].map(item => (
                                    <li key={item} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                        <div className="bg-teal-100 rounded-full p-1">
                                            <MessageCircle className="h-4 w-4 text-teal-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium italic">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-md mx-auto">
                                    <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center border border-teal-200">
                                            <Bot className="h-5 w-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 text-sm">PathoAssist AI Bot</h3>
                                            <p className="text-xs text-teal-600 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                                Online
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4 bg-slate-50/30">
                                        <div className="flex gap-3 justify-end">
                                            <div className="bg-teal-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[85%] shadow-md">
                                                Can you summarize the findings in this ROI?
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[90%] shadow-sm">
                                                <p className="mb-2">I see <strong>high-grade nuclear atypia</strong> and abundant <strong>mitotic figures</strong> in this region.</p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded border border-teal-100">Confidence: 94%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-slate-200 bg-white">
                                        <div className="h-10 bg-slate-100 rounded-full border border-slate-200 w-full" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 2: Detailed Reporting */}
            <section className="py-24 bg-slate-50/50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                        <div className="lg:w-1/2">
                            <div className="bg-indigo-100 p-3 rounded-2xl inline-flex items-center justify-center mb-6 shadow-sm">
                                <Shield className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Multimodal Clinical Synthesis</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                PathoAssist helps you leverage the full potential of HAI-DEF models by fusing high-resolution visual data with patient clinical history. The AI doesn't just "see" the image; it reasons about the findings in context, providing evidence-based assessments that mimic expert cognitive processes.
                            </p>
                            <ul className="space-y-4">
                                {['Cross-references visual & clinical data', 'Evidence-based reasoning for & against diagnoses', 'Confidence scoring with justification'].map(item => (
                                    <li key={item} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                        <div className="bg-green-100 rounded-full p-1">
                                            <Check className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <img src="/screen_report.png" alt="Report Generation" className="rounded-2xl shadow-2xl border border-slate-200" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>



            {/* Feature 2.5: Differential Diagnosis Dashboard (New) */}
            <section className="py-24 bg-white border-b border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-lg">
                                    {/* Mock UI for Differential Diagnosis */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-4 w-4 bg-teal-500 rounded-full" />
                                            <div className="h-2 w-32 bg-slate-200 rounded" />
                                        </div>
                                        {[
                                            { name: "Invasive Ductal Carcinoma", score: 92, reason: "High cellularity and nuclear variations consistent with history." },
                                            { name: "DCIS", score: 45, reason: "Some cribriform patterns but lacks invasive features." },
                                            { name: "Fibroadenoma", score: 12, reason: "Benign features not aligned with patient age." }
                                        ].map((item, i) => (
                                            <div key={i} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                                                    <span className="text-xs font-mono text-teal-600">{item.score}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                                                    <div className="h-full bg-teal-500" style={{ width: `${item.score}%` }} />
                                                </div>
                                                <p className="text-xs text-slate-500 italic">"{item.reason}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        <div className="lg:w-1/2">
                            <div className="bg-amber-100 p-3 rounded-2xl inline-flex items-center justify-center mb-6 shadow-sm">
                                <Zap className="h-8 w-8 text-amber-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Interactive Reasoning Dashboard</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Don't just get a label. Understand the <strong>"Why"</strong>. <br />
                                Our new Differential Diagnosis engine provides a ranked list of potential conditions, each accompanied by an <strong>explainable AI reasoning</strong> snippet derived from the fusion of image features and clinical context.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Ranked Differential Diagnosis candidates',
                                    'Likelihood visualization strings',
                                    'Transparency into model decision making'
                                ].map(item => (
                                    <li key={item} className="flex items-center gap-3">
                                        <Check className="h-5 w-5 text-amber-500" />
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 2.75: Trust & Explainability (Visual Grounding) */}
            <section className="py-24 bg-slate-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl relative overflow-hidden">
                                    {/* Mock UI for Visual Grounding */}
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Shield className="w-32 h-32" />
                                    </div>

                                    <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                        Evidence Verification
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-medium text-slate-200">Mitotic Activity</span>
                                                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">Review Needed</span>
                                            </div>
                                            <p className="text-sm text-slate-400 mb-2">High index observed in upper quadrant.</p>

                                            {/* EVIDENCE BADGE */}
                                            <div className="flex items-center gap-2 text-xs bg-teal-500/10 border border-teal-500/30 rounded px-2 py-1.5 text-teal-300 w-fit">
                                                <Server className="w-3 h-3" />
                                                <span className="font-mono font-bold">Evidence:</span>
                                                <span>Atypical figures in ROI #12</span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 opacity-60">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-medium text-slate-200">Necrosis</span>
                                                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded border border-green-500/30">Confident</span>
                                            </div>
                                            <p className="text-sm text-slate-400">Not observed in current field.</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                                        <span className="text-xs text-slate-500">Confidence Score</span>
                                        <span className="font-mono text-xl font-bold text-teal-400">88.4%</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:w-1/2">
                            <div className="bg-indigo-900/50 p-3 rounded-2xl inline-flex items-center justify-center mb-6 border border-indigo-500/30">
                                <Shield className="h-8 w-8 text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-6">Trust & Explainability</h2>
                            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                                A black box has no place in a clinic. PathoAssist introduces <strong>Visual Grounding</strong> to AI pathology.
                                Every finding is backed by specific "Evidence Citations"—telling you exactly <em>where</em> in the image the AI is looking (e.g., "ROI #3", "Lower Left Quadrant") so you can verify the results instantly.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Specific ROI citations for every finding',
                                    'Visual confirmation of AI attention',
                                    'Reduced hallucination risk via forced grounding'
                                ].map(item => (
                                    <li key={item} className="flex items-center gap-3">
                                        <div className="bg-indigo-500/20 rounded-full p-1">
                                            <Check className="h-4 w-4 text-indigo-400" />
                                        </div>
                                        <span className="text-slate-300 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 3: Offline & Privacy */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center justify-center p-3 bg-teal-50 rounded-2xl mb-6 shadow-sm">
                            <Lock className="h-8 w-8 text-teal-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Privacy-First & Offline-Ready</h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            PathoAssist is engineered for the realities of global healthcare. We understand that patient data privacy is paramount and internet access isn't guaranteed.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 hover:shadow-lg transition-all"
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <WifiOff className="h-6 w-6 text-slate-700" />
                                Zero-Latency Offline Mode
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                Once the MedGemma model is downloaded, the entire analysis pipeline runs locally on your machine. No data is ever sent to the cloud, ensuring compliance and functionality even during internet outages.
                            </p>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 hover:shadow-lg transition-all"
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Shield className="h-6 w-6 text-teal-600" />
                                HIPAA/GDPR Compliant Architecture
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                By processing data at the edge, we eliminate the risks associated with data transmission and cloud storage. Your patient data stays on your device, under your control.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </WebsiteLayout >
    );
}
