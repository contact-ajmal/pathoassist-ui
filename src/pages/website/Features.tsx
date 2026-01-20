import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { motion } from "framer-motion";
import { Check, Shield, Zap, Server, Lock, WifiOff } from "lucide-react";

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
        </WebsiteLayout>
    );
}
