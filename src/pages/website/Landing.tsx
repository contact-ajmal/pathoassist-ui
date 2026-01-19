import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Microscope, Brain, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
    const features = [
        {
            icon: <Microscope className="h-6 w-6 text-teal-600" />,
            title: "WSI Viewer",
            description: "High-performance whole slide image viewer supporting .svs and .ndpi formats with deep zoom capabilities."
        },
        {
            icon: <Brain className="h-6 w-6 text-teal-600" />,
            title: "MedGemma AI",
            description: "Integrated with Google's MedGemma-4B multimodal model for analyzing tissue morphology and cellular patterns."
        },
        {
            icon: <FileText className="h-6 w-6 text-teal-600" />,
            title: "Professional Reports",
            description: "Generate detailed, clinically-styled pathology reports with confidence scores and structured findings."
        }
    ];

    return (
        <WebsiteLayout>
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-32">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-slate-100 -z-10" />
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="lg:w-1/2 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800">
                                    <span className="flex h-2 w-2 rounded-full bg-teal-600"></span>
                                    v1.0 Now Available with Remote Inference
                                </div>
                                <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                                    AI-Powered Assistant for <span className="text-teal-600">Modern Pathology</span>
                                </h1>
                                <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                                    PathoAssist combines advanced Whole Slide Imaging (WSI) with multimodal AI to provide real-time decision support, automated ROI analysis, and professional reporting.
                                </p>
                                <div className="mt-8 flex gap-4">
                                    <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white h-12 px-8 text-base">
                                        <Link to="/app" className="flex items-center gap-2">
                                            Get Started <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="h-12 px-8 text-base text-slate-700 hover:bg-slate-50">
                                        <Link to="/docs">View Documentation</Link>
                                    </Button>
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-2"
                            >
                                <img
                                    src="/screen_report.png"
                                    alt="PathoAssist Dashboard"
                                    className="rounded-xl w-full h-auto"
                                />
                                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 max-w-xs">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-green-100 p-2 rounded-lg">
                                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Analysis Complete</p>
                                            <p className="text-sm text-slate-500">Processing time: 2.3s</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need</h2>
                        <p className="mt-4 text-lg text-slate-600">
                            A comprehensive suite of tools designed for the modern digital pathology workflow.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-100 hover:shadow-lg transition-all"
                            >
                                <div className="mb-6 p-4 bg-white rounded-xl inline-block shadow-sm">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Showcase Section */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Deep Zoom Viewer</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Our advanced viewer handles gigapixel slide images with ease. Navigate, zoom, and select regions of interest (ROI) with intuitive controls. Features automated tissue detection and manual selection modes.
                            </p>
                            <ul className="space-y-4">
                                {['Support for .svs, .ndpi, .tiff', 'Real-time navigation', 'Automated tissue masking'].map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-teal-600" />
                                        <span className="text-slate-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:w-1/2">
                            <img
                                src="/screen_viewer.png"
                                alt="WSI Viewer Interface"
                                className="rounded-2xl shadow-xl border border-slate-200"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
}
