import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { motion } from "framer-motion";
import { Database, Cpu, Eye, FileText, Layers, Zap, Globe, Code2, Server, Brain, Microscope, Sliders } from "lucide-react";

const techCategories = [
    {
        title: "Backend & API",
        icon: Server,
        color: "from-emerald-500 to-teal-600",
        items: [
            {
                name: "FastAPI",
                role: "Web Framework",
                description: "High-performance Python framework powering all REST API endpoints. Provides automatic OpenAPI documentation and request validation.",
                docs: "https://fastapi.tiangolo.com/"
            },
            {
                name: "Pydantic",
                role: "Data Validation",
                description: "Handles request/response schema validation and serialization. Ensures type safety between frontend and backend.",
                docs: "https://docs.pydantic.dev/"
            },
            {
                name: "aiosqlite",
                role: "Database",
                description: "Lightweight async SQLite driver for storing case metadata, patient records, and analysis history without external DB dependencies.",
                docs: "https://aiosqlite.omnilib.dev/"
            },
        ]
    },
    {
        title: "WSI Processing",
        icon: Microscope,
        color: "from-violet-500 to-purple-600",
        items: [
            {
                name: "OpenSlide",
                role: "Slide Reader",
                description: "C library (via Python bindings) that reads proprietary WSI formats (.svs, .ndpi, .mrxs). Enables efficient tile extraction from multi-gigabyte slides without loading them fully into memory.",
                docs: "https://openslide.org/"
            },
            {
                name: "OpenCV",
                role: "Tissue Detection",
                description: "Used for Otsu's Thresholding to differentiate tissue from background glass. Also calculates color variance scores to find 'interesting' regions.",
                docs: "https://opencv.org/"
            },
            {
                name: "Pillow",
                role: "Image Manipulation",
                description: "Handles image format conversions (RGBA→RGB), thumbnail generation, and patch preparation before AI inference.",
                docs: "https://pillow.readthedocs.io/"
            },
            {
                name: "scikit-image",
                role: "Advanced Imaging",
                description: "Provides sophisticated image processing algorithms for morphological analysis and feature extraction from tissue patches.",
                docs: "https://scikit-image.org/"
            },
        ]
    },
    {
        title: "AI & Machine Learning",
        icon: Brain,
        color: "from-amber-500 to-orange-600",
        items: [
            {
                name: "Google MedGemma",
                role: "Foundation Model",
                description: "The core multimodal AI model. Performs visual analysis of histopathology tiles and generates natural language findings, grounded in clinical context.",
                docs: "https://huggingface.co/google/medgemma-4b-it"
            },
            {
                name: "PyTorch",
                role: "Deep Learning Engine",
                description: "The underlying tensor computation library. Handles GPU acceleration (CUDA/MPS) for fast inference.",
                docs: "https://pytorch.org/"
            },
            {
                name: "HuggingFace Transformers",
                role: "Model Loading",
                description: "Provides the AutoProcessor and model loading utilities to seamlessly work with MedGemma weights and tokenizers.",
                docs: "https://huggingface.co/docs/transformers/"
            },
            {
                name: "bitsandbytes",
                role: "Quantization",
                description: "Enables 4-bit/8-bit model quantization for running MedGemma on consumer GPUs with limited VRAM.",
                docs: "https://github.com/TimDettmers/bitsandbytes"
            },
        ]
    },
    {
        title: "Frontend & UI",
        icon: Code2,
        color: "from-sky-500 to-blue-600",
        items: [
            {
                name: "React 18",
                role: "UI Framework",
                description: "Component-based architecture for building the interactive pathology workstation interface.",
                docs: "https://react.dev/"
            },
            {
                name: "Vite",
                role: "Build Tool",
                description: "Lightning-fast development server and optimized production bundler. Provides instant HMR (Hot Module Replacement).",
                docs: "https://vitejs.dev/"
            },
            {
                name: "Tailwind CSS",
                role: "Styling",
                description: "Utility-first CSS framework for rapid, consistent UI development. Powers all visual styling.",
                docs: "https://tailwindcss.com/"
            },
            {
                name: "shadcn/ui",
                role: "Component Library",
                description: "Pre-built, accessible UI components (Buttons, Cards, Dialogs) that follow modern design patterns.",
                docs: "https://ui.shadcn.com/"
            },
            {
                name: "Framer Motion",
                role: "Animations",
                description: "Provides smooth, physics-based animations for page transitions, loading states, and micro-interactions.",
                docs: "https://www.framer.com/motion/"
            },
        ]
    },
    {
        title: "Visualization & Annotation",
        icon: Eye,
        color: "from-rose-500 to-pink-600",
        items: [
            {
                name: "Custom SVG Renderer",
                role: "Annotation Layer",
                description: "A purpose-built React component using SVG overlays to render annotations (points, rectangles, circles, lines, arrows, freehand) directly on the slide thumbnail.",
                docs: null
            },
            {
                name: "Pan & Zoom Engine",
                role: "Slide Navigation",
                description: "Custom implementation using CSS transforms for smooth, Google Maps-style slide exploration. Supports pinch-to-zoom and drag panning.",
                docs: null
            },
        ]
    },
    {
        title: "Report Generation",
        icon: FileText,
        color: "from-slate-500 to-gray-600",
        items: [
            {
                name: "ReportLab",
                role: "PDF Export",
                description: "Professional-grade Python library for generating structured PDF pathology reports with headers, tables, and clinical formatting.",
                docs: "https://www.reportlab.com/"
            },
            {
                name: "Jinja2",
                role: "Templating",
                description: "Flexible templating engine for generating report HTML and structured text from AI findings.",
                docs: "https://jinja.palletsprojects.com/"
            },
        ]
    },
];

export default function TechStack() {
    return (
        <WebsiteLayout>
            {/* Hero */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                            <Layers className="w-4 h-4 text-teal-400" />
                            <span className="text-sm font-medium">Technology Deep Dive</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                            Under the Hood
                        </h1>
                        <p className="text-xl text-slate-300 font-light leading-relaxed">
                            PathoAssist is built on a modern, modular stack designed for <strong>performance</strong>, <strong>privacy</strong>, and <strong>clinical reliability</strong>. Here's a breakdown of every tool and library powering the experience.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Architecture Overview */}
            <section className="py-16 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">High-Level Architecture</h2>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Globe className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-2">Frontend</h3>
                                    <p className="text-sm text-slate-600">React + Vite + Tailwind</p>
                                    <p className="text-xs text-slate-400 mt-2">User Interface & Visualization</p>
                                </div>
                                <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm relative">
                                    <div className="absolute top-1/2 -left-3 w-6 h-px bg-slate-300 hidden md:block" />
                                    <div className="absolute top-1/2 -right-3 w-6 h-px bg-slate-300 hidden md:block" />
                                    <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Server className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-2">Backend</h3>
                                    <p className="text-sm text-slate-600">FastAPI + OpenSlide</p>
                                    <p className="text-xs text-slate-400 mt-2">API & WSI Processing</p>
                                </div>
                                <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Brain className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-2">AI Engine</h3>
                                    <p className="text-sm text-slate-600">MedGemma + PyTorch</p>
                                    <p className="text-xs text-slate-400 mt-2">Multimodal Analysis</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technology Categories */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="space-y-16">
                        {techCategories.map((category, catIdx) => (
                            <motion.div
                                key={category.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: catIdx * 0.1 }}
                            >
                                <div className="flex items-center gap-3 mb-8">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg`}>
                                        <category.icon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {category.items.map((item, idx) => (
                                        <motion.div
                                            key={item.name}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{item.name}</h3>
                                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.role}</span>
                                                </div>
                                                {item.docs && (
                                                    <a
                                                        href={item.docs}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-slate-400 hover:text-teal-600 transition-colors"
                                                        title="View Documentation"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WSI Processing Deep Dive */}
            <section className="py-20 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                            <Microscope className="w-4 h-4 text-violet-300" />
                            <span className="text-sm font-medium">Deep Dive</span>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6">How WSI Processing Works</h2>
                        <p className="text-lg text-violet-200 leading-relaxed">
                            Whole Slide Images are massive (often 1-10+ GB). Here's how PathoAssist efficiently processes them without overloading memory.
                        </p>
                    </div>

                    {/* Step 1: Pyramid Structure */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-violet-500 text-white text-sm font-bold px-3 py-1 rounded-full">Step 1</span>
                                <h3 className="text-2xl font-bold">Understanding the Pyramid</h3>
                            </div>
                            <p className="text-violet-200 leading-relaxed mb-4">
                                WSI files (like <code className="bg-white/10 px-1.5 py-0.5 rounded">.svs</code>, <code className="bg-white/10 px-1.5 py-0.5 rounded">.ndpi</code>) store images as a <strong>multi-resolution pyramid</strong>.
                                The base level is the full resolution scan, while higher levels are progressively smaller thumbnails.
                            </p>
                            <p className="text-violet-200 leading-relaxed">
                                <strong>OpenSlide</strong> can efficiently access any level without loading the entire file, making it possible to work with multi-gigabyte slides on standard hardware.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            {/* Pyramid Visual */}
                            <div className="relative w-64">
                                {[
                                    { label: "Level 0", size: "40000×30000", width: "100%", bg: "from-pink-500 to-rose-600" },
                                    { label: "Level 1", size: "10000×7500", width: "75%", bg: "from-amber-500 to-orange-600" },
                                    { label: "Level 2", size: "2500×1875", width: "50%", bg: "from-emerald-500 to-teal-600" },
                                    { label: "Level 3", size: "625×469", width: "25%", bg: "from-sky-500 to-blue-600" },
                                ].map((level, idx) => (
                                    <div
                                        key={level.label}
                                        className={`bg-gradient-to-r ${level.bg} rounded-lg shadow-lg mx-auto mb-2 p-3 text-center transition-all hover:scale-105`}
                                        style={{ width: level.width }}
                                    >
                                        <span className="text-xs font-bold block">{level.label}</span>
                                        <span className="text-[10px] opacity-75">{level.size}</span>
                                    </div>
                                ))}
                                <p className="text-center text-xs text-violet-300 mt-4">Multi-Resolution Pyramid Structure</p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Tile Extraction */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                        <div className="order-2 lg:order-1 flex justify-center">
                            {/* Tile Grid Visual */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <div className="grid grid-cols-6 gap-1 w-48 h-48 mx-auto">
                                    {Array.from({ length: 36 }).map((_, i) => {
                                        const isTissue = [7, 8, 13, 14, 15, 19, 20, 21, 25, 26, 27].includes(i);
                                        return (
                                            <div
                                                key={i}
                                                className={`rounded-sm transition-all ${isTissue ? 'bg-gradient-to-br from-pink-400 to-rose-500 shadow-sm' : 'bg-slate-700/50'}`}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-pink-400 to-rose-500" />
                                        <span className="text-violet-300">Tissue</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm bg-slate-700/50" />
                                        <span className="text-violet-300">Background</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-violet-500 text-white text-sm font-bold px-3 py-1 rounded-full">Step 2</span>
                                <h3 className="text-2xl font-bold">Tile Extraction</h3>
                            </div>
                            <p className="text-violet-200 leading-relaxed mb-4">
                                Using <code className="bg-white/10 px-1.5 py-0.5 rounded">slide.read_region()</code>, we divide the slide into a grid of small patches (typically 224×224 or 512×512 pixels).
                            </p>
                            <p className="text-violet-200 leading-relaxed">
                                This allows the AI to analyze specific regions independently, rather than attempting to process the entire multi-gigapixel image at once.
                            </p>
                        </div>
                    </div>

                    {/* Step 3: Tissue Detection */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-violet-500 text-white text-sm font-bold px-3 py-1 rounded-full">Step 3</span>
                                <h3 className="text-2xl font-bold">Tissue Detection (Otsu's Thresholding)</h3>
                            </div>
                            <p className="text-violet-200 leading-relaxed mb-4">
                                Most of a pathology slide is empty glass (white background). We use <strong>Otsu's Binarization</strong> (via OpenCV) to automatically separate tissue from background.
                            </p>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-sm">
                                <p className="text-violet-300">
                                    <span className="text-emerald-400">cv2.threshold</span>(gray, 0, 255,
                                </p>
                                <p className="text-violet-300 pl-4">
                                    cv2.THRESH_BINARY + <span className="text-amber-400">cv2.THRESH_OTSU</span>)
                                </p>
                            </div>
                            <p className="text-violet-200 leading-relaxed mt-4">
                                Patches with less than 5% tissue are discarded, saving compute time and improving AI focus.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            {/* Otsu Visual */}
                            <div className="flex gap-4 items-end">
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-pink-200 via-white to-pink-100 border-2 border-white/30 mb-2 flex items-center justify-center overflow-hidden">
                                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-70" />
                                    </div>
                                    <span className="text-xs text-violet-300">Original</span>
                                </div>
                                <div className="text-2xl text-violet-400 pb-8">→</div>
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-lg bg-white border-2 border-white/30 mb-2 flex items-center justify-center overflow-hidden">
                                        <div className="w-12 h-12 bg-black rounded-full" />
                                    </div>
                                    <span className="text-xs text-violet-300">Binary Mask</span>
                                </div>
                                <div className="text-2xl text-violet-400 pb-8">→</div>
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-lg bg-emerald-500/20 border-2 border-emerald-400 mb-2 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-emerald-400">78%</span>
                                    </div>
                                    <span className="text-xs text-violet-300">Tissue Ratio</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Variance Scoring */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1 flex justify-center">
                            {/* Scoring Visual */}
                            <div className="space-y-3 w-full max-w-xs">
                                {[
                                    { label: "Patch #12", variance: 0.87, tissue: 0.92, score: 0.89, top: true },
                                    { label: "Patch #5", variance: 0.72, tissue: 0.85, score: 0.78, top: true },
                                    { label: "Patch #31", variance: 0.45, tissue: 0.68, score: 0.56, top: false },
                                    { label: "Patch #8", variance: 0.12, tissue: 0.35, score: 0.23, top: false },
                                ].map((patch, idx) => (
                                    <div
                                        key={patch.label}
                                        className={`p-3 rounded-lg border transition-all ${patch.top ? 'bg-emerald-500/10 border-emerald-400/50' : 'bg-white/5 border-white/10'}`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-sm">{patch.label}</span>
                                            {patch.top && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Selected</span>}
                                        </div>
                                        <div className="flex gap-4 text-xs">
                                            <div>
                                                <span className="text-violet-400">Variance:</span> <span className="text-white font-mono">{(patch.variance * 100).toFixed(0)}%</span>
                                            </div>
                                            <div>
                                                <span className="text-violet-400">Tissue:</span> <span className="text-white font-mono">{(patch.tissue * 100).toFixed(0)}%</span>
                                            </div>
                                            <div>
                                                <span className="text-violet-400">Score:</span> <span className="text-amber-400 font-bold font-mono">{(patch.score * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-violet-500 text-white text-sm font-bold px-3 py-1 rounded-full">Step 4</span>
                                <h3 className="text-2xl font-bold">Smart Patch Selection</h3>
                            </div>
                            <p className="text-violet-200 leading-relaxed mb-4">
                                Not all tissue is equally "interesting" to the AI. We calculate a <strong>Combined Score</strong> based on:
                            </p>
                            <ul className="space-y-2 text-violet-200 mb-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 mt-1">•</span>
                                    <span><strong>Color Variance:</strong> High variance indicates complex cellular structures (nuclei, atypia).</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 mt-1">•</span>
                                    <span><strong>Tissue Density:</strong> Patches with more tissue are more likely to contain diagnostic features.</span>
                                </li>
                            </ul>
                            <p className="text-violet-200 leading-relaxed">
                                Only the <strong>Top-K</strong> patches (e.g., top 10) are sent to MedGemma for analysis, ensuring efficiency without sacrificing accuracy.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Flow Diagram (Conceptual) */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">The Analysis Pipeline</h2>
                        <p className="text-slate-400">From slide upload to final report, here's how the data flows.</p>
                    </div>
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
                            {[
                                { step: 1, title: "Upload", desc: "WSI file received", icon: Database },
                                { step: 2, title: "Process", desc: "OpenSlide extracts tiles", icon: Sliders },
                                { step: 3, title: "Filter", desc: "OpenCV finds tissue", icon: Eye },
                                { step: 4, title: "Analyze", desc: "MedGemma inference", icon: Brain },
                                { step: 5, title: "Report", desc: "PDF/JSON generation", icon: FileText },
                            ].map((item, idx, arr) => (
                                <div key={item.step} className="flex items-center gap-2 md:flex-1">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg mb-3">
                                            <item.icon className="w-7 h-7" />
                                        </div>
                                        <span className="text-xs font-bold text-teal-400 mb-1">Step {item.step}</span>
                                        <span className="font-semibold">{item.title}</span>
                                        <span className="text-xs text-slate-400">{item.desc}</span>
                                    </div>
                                    {idx < arr.length - 1 && (
                                        <div className="hidden md:block w-full h-px bg-gradient-to-r from-teal-500/50 to-transparent flex-1" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

        </WebsiteLayout>
    );
}
