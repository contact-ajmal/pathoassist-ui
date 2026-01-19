import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { motion } from "framer-motion";
import { Check, Shield, Zap, Server } from "lucide-react";

export default function Features() {
    const specs = [
        { title: "Model Architecture", value: "MedGemma 4B" },
        { title: "Training Data", value: "PubMed + PathVQA" },
        { title: "Context Window", value: "4096 Tokens" },
        { title: "Inference Time", value: "< 5s / slide" },
    ];

    return (
        <WebsiteLayout>
            <div className="bg-slate-900 text-white py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h1 className="text-4xl font-bold mb-6">Advanced Pathology Features</h1>
                        <p className="text-xl text-slate-400">
                            Built for precision, scalability, and ease of use in clinical research environments.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Feature 1: Remote Inference */}
            <section className="py-24 border-b border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <div className="bg-teal-100 p-3 rounded-xl inline-block mb-6">
                                <Server className="h-8 w-8 text-teal-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Remote Inference Engine</h2>
                            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                                Offload heavy computation to the cloud. PathoAssist seamlessly connects to remote GPU instances (like Google Colab via Ngrok) to run the 8GB+ MedGemma model, enabling powerful AI analysis even on standard laptops.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {specs.map((spec) => (
                                    <div key={spec.title} className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-500">{spec.title}</p>
                                        <p className="font-semibold text-slate-900">{spec.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2">
                            <img src="/screen_home.png" alt="Remote Config" className="rounded-2xl shadow-xl border border-slate-200" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 2: Detailed Reporting */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                        <div className="lg:w-1/2">
                            <div className="bg-indigo-100 p-3 rounded-xl inline-block mb-6">
                                <Shield className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Professional Reporting</h2>
                            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                                Generate tailored pathology reports that mimic professional standards. The AI analyzes visual features and combines them with clinical context to produce detailed summaries, differential diagnoses, and confidence-scored findings.
                            </p>
                            <ul className="space-y-3">
                                {['Detailed narrative summaries', 'Confidence scoring per finding', 'PDF Export ready'].map(item => (
                                    <li key={item} className="flex items-center gap-3">
                                        <Check className="h-5 w-5 text-green-600" />
                                        <span className="text-slate-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:w-1/2">
                            <img src="/screen_report.png" alt="Report Generation" className="rounded-2xl shadow-xl border border-slate-200" />
                        </div>
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
}
