import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Microscope, Brain, FileText, CheckCircle2, Layers, MessageSquare, MessageCircle, Bot } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
    const features = [
        {
            icon: <Microscope className="h-6 w-6 text-teal-600" />,
            title: "WSI Viewer",
            description: "High-performance whole slide image viewer supporting .svs and .ndpi formats with deep zoom capabilities."
        },
        {
            icon: <Layers className="h-6 w-6 text-teal-600" />,
            title: "WSI Processing Deep Dive",
            description: "Learn how PathoAssist processes gigapixel slides using OpenSlide, Otsu's thresholding, and smart patch selection.",
            link: "/wsi-processing"
        },
        {
            icon: <Brain className="h-6 w-6 text-teal-600" />,
            title: "MedGemma AI",
            description: "Powered by Google's MedGemma-4B to perform true multimodal reasoning, synthesizing visual patterns with clinical patient data."
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
                                    PathoAssist combines advanced Whole Slide Imaging (WSI) with <strong>multimodal reasoning</strong> to synthesize visual evidence with patient history, offering deep, context-aware diagnostic support.
                                </p>
                                <div className="mt-8 flex gap-4">
                                    <Link to="/app">
                                        <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white h-12 px-8 text-base">
                                            Launch App
                                        </Button>
                                    </Link>
                                    <Link to="/docs">
                                        <Button variant="outline" size="lg" className="h-12 px-8 text-base border-slate-300 text-slate-700 hover:bg-slate-50">
                                            View Documentation
                                        </Button>
                                    </Link>
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
                                    src="/demo_video.webp"
                                    alt="PathoAssist Application Demo"
                                    className="rounded-xl w-full h-auto shadow-2xl"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => {
                            const CardContent = (
                                <>
                                    <div className="mb-6 p-4 bg-white rounded-xl inline-block shadow-sm">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                                    {feature.link && (
                                        <div className="mt-4 text-sm font-semibold text-teal-600 flex items-center gap-1">
                                            Learn more <ArrowRight className="w-4 h-4" />
                                        </div>
                                    )}
                                </>
                            );

                            return feature.link ? (
                                <Link to={feature.link} key={idx}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 hover:border-teal-300 hover:shadow-lg transition-all cursor-pointer h-full"
                                    >
                                        {CardContent}
                                    </motion.div>
                                </Link>
                            ) : (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-100 hover:shadow-lg transition-all"
                                >
                                    {CardContent}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* HAI-DEF Deep Dive Section */}
            <section className="py-24 bg-teal-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full bg-teal-800/50 border border-teal-700 px-4 py-1.5 text-sm font-medium text-teal-200 mb-6">
                            <Brain className="h-4 w-4" />
                            Core Technology Focus
                        </div>
                        <h2 className="text-3xl font-bold mb-6 sm:text-4xl text-white">The HAI-DEF Advantage</h2>
                        <p className="text-lg text-teal-100 leading-relaxed">
                            Standard AI models only see pixels. <strong className="text-white">PathoAssist sees the whole patient.</strong> <br />
                            By leveraging the <span className="text-teal-300">MedGemma-4B HAI-DEF model</span>, we move beyond simple classification to true cognitive reasoning.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
                        {/* Step 1: Visual */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl relative"
                        >
                            <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <Microscope className="h-6 w-6 text-blue-300" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">1. Visual Analysis</h3>
                            <p className="text-teal-100/80 text-sm leading-relaxed">
                                The vision encoder scans gigapixel slides at 40x magnification, identifying subtle architectural patterns, nuclear atypia, and mitotic figures that standard CNNs might miss.
                            </p>
                        </motion.div>

                        {/* Step 2: Synthesis (Center) */}
                        <div className="hidden md:flex justify-center text-teal-500">
                            <ArrowRight className="h-8 w-8" />
                        </div>

                        {/* Step 3: Fusion */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gradient-to-br from-teal-600/20 to-teal-900/40 backdrop-blur-md border border-teal-500/30 p-8 rounded-2xl relative md:col-span-1 shadow-2xl"
                        >
                            <div className="absolute -top-3 -right-3 bg-teal-500 text-xs font-bold px-3 py-1 rounded-full text-white shadow-lg">
                                HAI-DEF FUSION
                            </div>
                            <div className="bg-teal-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <Brain className="h-6 w-6 text-teal-300" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">2. Multimodal Synthesis</h3>
                            <p className="text-teal-100/80 text-sm leading-relaxed">
                                This is where magic happens. The model fuses the <strong>Visual Features</strong> with the <strong>Patient's Clinical History</strong> (age, symptoms, prior history) to produce a context-aware diagnosis, ruling out conditions that don't match the clinical picture.
                            </p>
                        </motion.div>
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

            {/* PathoAssist AI Bot Section */}
            <section className="py-24 bg-teal-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <div className="bg-teal-100 p-3 rounded-2xl inline-flex items-center justify-center mb-6 shadow-sm">
                                <Bot className="h-8 w-8 text-teal-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Meet Your Digital Fellow</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                The <strong>PathoAssist AI Bot</strong> lives alongside your viewer, ready to answer questions and draft reports. It's like having a second pair of expert eyes on every slide.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Instant answers to slide-related questions',
                                    'Draft microscopic descriptions in seconds',
                                    'Explain diagnostic reasoning with citations'
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <MessageCircle className="h-5 w-5 text-teal-600" />
                                        <span className="text-slate-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
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
                                    <div className="p-6 space-y-4">
                                        <div className="flex gap-3 justify-end">
                                            <div className="bg-teal-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm max-w-[85%]">
                                                Based on the histology, what is the most likely diagnosis?
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="bg-slate-100 text-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[90%]">
                                                <p className="mb-2">The features are most consistent with <strong>Invasive Ductal Carcinoma</strong>.</p>
                                                <div className="flex gap-2">
                                                    <span className="text-xs bg-white text-teal-700 px-2 py-1 rounded border border-slate-200">Confidence: 92%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
}
