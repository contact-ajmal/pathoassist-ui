import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { motion } from "framer-motion";
import { Microscope, Layers, Cpu, Eye, CheckCircle2, AlertTriangle, ArrowRight, Zap, Database, Brain } from "lucide-react";
import { Link } from "react-router-dom";

export default function WSIProcessing() {
    return (
        <WebsiteLayout>
            {/* Hero */}
            <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                            <Microscope className="w-4 h-4 text-teal-300" />
                            <span className="text-sm font-medium">Technical Deep Dive</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                            Whole Slide Image Processing
                        </h1>
                        <p className="text-xl text-teal-200 font-light leading-relaxed">
                            How PathoAssist efficiently processes <strong>gigapixel</strong> pathology slides using OpenSlide, OpenCV, and intelligent patch selection—without overloading memory.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Introduction: What is WSI? */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-teal-100 p-2 rounded-lg">
                                <Layers className="w-6 h-6 text-teal-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">What is Whole Slide Imaging?</h2>
                        </div>
                        <p className="text-lg text-slate-600 leading-relaxed mb-6">
                            <strong>Whole Slide Imaging (WSI)</strong> is the digitization of traditional glass pathology slides at ultra-high resolution,
                            creating virtual slides that can be viewed and navigated like maps. These slides allow pathologists and AI models to zoom
                            in and out across tissue sections with surgical precision.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed mb-8">
                            A single WSI can exceed <strong>100,000 × 100,000 pixels</strong> (gigapixel-scale) and range from <strong>1-10+ GB</strong> in file size.
                            This massive scale makes them impossible to process using traditional image methods—requiring specialized pipelines like the one PathoAssist provides.
                        </p>

                        {/* Key Characteristics */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { title: "Gigapixel Resolution", desc: "Each slide can contain billions of pixels, enabling inspection at both tissue and cellular levels without losing clarity." },
                                { title: "Multi-Level Magnification", desc: "WSI viewers allow seamless zoom from 1x to 40x or higher—replicating how a pathologist would examine slides under a microscope." },
                                { title: "Tile-Based Architecture", desc: "WSIs are stored as tiles or patches. This allows systems to load only what's visible on screen—critical for performance." },
                                { title: "Multiple File Formats", desc: "Common formats include .svs, .ndpi, .mrxs, .tiff, and .scn. PathoAssist uses OpenSlide to support all major vendor formats." },
                            ].map((item) => (
                                <div key={item.title} className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                                    <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Step 1: Pyramid Structure */}
            <section className="py-20 bg-slate-50 border-y">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="bg-teal-500 text-white text-sm font-bold px-3 py-1 rounded-full">Step 1</span>
                                <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-4">Understanding the Pyramid</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    WSI files (like <code className="bg-slate-200 px-1.5 py-0.5 rounded text-sm">.svs</code>, <code className="bg-slate-200 px-1.5 py-0.5 rounded text-sm">.ndpi</code>) store images as a <strong>multi-resolution pyramid</strong>.
                                    The base level (Level 0) is the full resolution scan, while higher levels are progressively smaller thumbnails.
                                </p>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    PathoAssist uses <strong>OpenSlide</strong> to efficiently access any level without loading the entire file into memory.
                                    This makes it possible to work with multi-gigabyte slides on standard hardware.
                                </p>
                                <div className="bg-white border border-slate-200 rounded-lg p-4 font-mono text-sm">
                                    <p className="text-slate-600">
                                        <span className="text-teal-600">from</span> openslide <span className="text-teal-600">import</span> OpenSlide
                                    </p>
                                    <p className="text-slate-600 mt-2">
                                        slide = OpenSlide(<span className="text-emerald-600">"slide.svs"</span>)
                                    </p>
                                    <p className="text-slate-600">
                                        tile = slide.<span className="text-amber-600">read_region</span>((x, y), level, (224, 224))
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                {/* Pyramid Visual */}
                                <div className="relative w-72">
                                    {[
                                        { label: "Level 0 (Full Res)", size: "40000×30000 px", width: "100%", bg: "from-pink-500 to-rose-600" },
                                        { label: "Level 1", size: "10000×7500 px", width: "75%", bg: "from-amber-500 to-orange-600" },
                                        { label: "Level 2", size: "2500×1875 px", width: "50%", bg: "from-emerald-500 to-teal-600" },
                                        { label: "Thumbnail", size: "625×469 px", width: "25%", bg: "from-sky-500 to-blue-600" },
                                    ].map((level) => (
                                        <div
                                            key={level.label}
                                            className={`bg-gradient-to-r ${level.bg} rounded-lg shadow-lg mx-auto mb-2 p-3 text-center transition-all hover:scale-105 text-white`}
                                            style={{ width: level.width }}
                                        >
                                            <span className="text-xs font-bold block">{level.label}</span>
                                            <span className="text-[10px] opacity-80">{level.size}</span>
                                        </div>
                                    ))}
                                    <p className="text-center text-xs text-slate-500 mt-4">Multi-Resolution Pyramid</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Step 2: Tile Extraction */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1 flex justify-center">
                                {/* Tile Grid Visual */}
                                <div className="bg-slate-100 border border-slate-200 rounded-xl p-6">
                                    <div className="grid grid-cols-8 gap-1 w-64 h-64 mx-auto">
                                        {Array.from({ length: 64 }).map((_, i) => {
                                            const tissueIndices = [18, 19, 20, 21, 26, 27, 28, 29, 34, 35, 36, 37, 42, 43, 44, 45];
                                            const isTissue = tissueIndices.includes(i);
                                            return (
                                                <div
                                                    key={i}
                                                    className={`rounded-sm transition-all ${isTissue ? 'bg-gradient-to-br from-pink-400 to-rose-500 shadow-sm' : 'bg-slate-300/50'}`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-pink-400 to-rose-500" />
                                            <span className="text-slate-600">Tissue Patches</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 rounded-sm bg-slate-300/50" />
                                            <span className="text-slate-600">Background</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <span className="bg-teal-500 text-white text-sm font-bold px-3 py-1 rounded-full">Step 2</span>
                                <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-4">Tile Extraction</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Using <code className="bg-slate-200 px-1.5 py-0.5 rounded text-sm">slide.read_region()</code>, we divide the slide into a grid of small patches
                                    (typically <strong>224×224</strong> or <strong>512×512</strong> pixels).
                                </p>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    This is often called <strong>patch extraction</strong> in the literature. It allows the AI to analyze specific regions independently,
                                    rather than attempting to process the entire multi-gigapixel image at once.
                                </p>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                                    <strong>💡 Why Patches?</strong> Dense information: A single slide may contain thousands of cells and dozens of tissue types.
                                    Annotating even a small region can train highly capable AI models.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Step 3: Tissue Detection */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="bg-teal-500 text-white text-sm font-bold px-3 py-1 rounded-full">Step 3</span>
                                <h2 className="text-2xl font-bold mt-4 mb-4">Tissue Detection with Otsu's Thresholding</h2>
                                <p className="text-slate-300 leading-relaxed mb-4">
                                    Most of a pathology slide is empty glass (white background). We use <strong>Otsu's Binarization</strong> (via OpenCV)
                                    to automatically separate tissue from background.
                                </p>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-sm mb-4">
                                    <p className="text-slate-300">
                                        gray = <span className="text-sky-400">cv2.cvtColor</span>(image, cv2.COLOR_RGB2GRAY)
                                    </p>
                                    <p className="text-slate-300 mt-1">
                                        _, binary = <span className="text-emerald-400">cv2.threshold</span>(gray, 0, 255,
                                    </p>
                                    <p className="text-slate-300 pl-4">
                                        cv2.THRESH_BINARY + <span className="text-amber-400">cv2.THRESH_OTSU</span>)
                                    </p>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    Patches with less than <strong>5% tissue</strong> are automatically discarded, saving compute time and improving AI focus
                                    on diagnostically relevant regions.
                                </p>
                            </div>
                            <div className="flex justify-center">
                                {/* Otsu Visual */}
                                <div className="flex gap-4 items-end">
                                    <div className="text-center">
                                        <div className="w-28 h-28 rounded-lg bg-gradient-to-br from-pink-200 via-white to-pink-100 border-2 border-white/30 mb-2 flex items-center justify-center overflow-hidden">
                                            <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-70" />
                                        </div>
                                        <span className="text-xs text-slate-400">Original Patch</span>
                                    </div>
                                    <div className="text-2xl text-violet-400 pb-10">→</div>
                                    <div className="text-center">
                                        <div className="w-28 h-28 rounded-lg bg-white border-2 border-white/30 mb-2 flex items-center justify-center overflow-hidden">
                                            <div className="w-14 h-14 bg-black rounded-full" />
                                        </div>
                                        <span className="text-xs text-slate-400">Binary Mask</span>
                                    </div>
                                    <div className="text-2xl text-violet-400 pb-10">→</div>
                                    <div className="text-center">
                                        <div className="w-28 h-28 rounded-lg bg-emerald-500/20 border-2 border-emerald-400 mb-2 flex items-center justify-center">
                                            <span className="text-3xl font-bold text-emerald-400">78%</span>
                                        </div>
                                        <span className="text-xs text-slate-400">Tissue Ratio</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Step 4: Variance Scoring */}
            <section className="py-20 bg-white border-t">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1 flex justify-center">
                                {/* Scoring Visual */}
                                <div className="space-y-3 w-full max-w-sm">
                                    {[
                                        { label: "Patch #12", variance: 0.87, tissue: 0.92, score: 0.89, top: true },
                                        { label: "Patch #5", variance: 0.72, tissue: 0.85, score: 0.78, top: true },
                                        { label: "Patch #31", variance: 0.45, tissue: 0.68, score: 0.56, top: false },
                                        { label: "Patch #8", variance: 0.12, tissue: 0.35, score: 0.23, top: false },
                                    ].map((patch) => (
                                        <div
                                            key={patch.label}
                                            className={`p-4 rounded-lg border transition-all ${patch.top ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'bg-slate-50 border-slate-200'}`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold text-slate-800">{patch.label}</span>
                                                {patch.top && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">Selected for AI</span>}
                                            </div>
                                            <div className="flex gap-4 text-xs text-slate-600">
                                                <div>Variance: <span className="font-mono font-bold text-slate-800">{(patch.variance * 100).toFixed(0)}%</span></div>
                                                <div>Tissue: <span className="font-mono font-bold text-slate-800">{(patch.tissue * 100).toFixed(0)}%</span></div>
                                                <div>Score: <span className="font-mono font-bold text-amber-600">{(patch.score * 100).toFixed(0)}%</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <span className="bg-teal-500 text-white text-sm font-bold px-3 py-1 rounded-full">Step 4</span>
                                <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-4">Smart Patch Selection</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Not all tissue is equally "interesting" to the AI. We calculate a <strong>Combined Score</strong> for each patch based on:
                                </p>
                                <ul className="space-y-3 text-slate-600 mb-4">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span><strong>Color Variance:</strong> High variance indicates complex cellular structures (nuclei, mitotic figures, atypia).</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span><strong>Tissue Density:</strong> Patches with more tissue are more likely to contain diagnostic features.</span>
                                    </li>
                                </ul>
                                <p className="text-slate-600 leading-relaxed">
                                    Only the <strong>Top-K</strong> patches (e.g., top 10-20) are sent to MedGemma for analysis,
                                    ensuring efficiency without sacrificing diagnostic accuracy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Challenges Section */}
            <section className="py-20 bg-slate-50 border-t">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Challenges We Address</h2>
                            <p className="text-slate-600">WSI processing introduces several technical hurdles. Here's how PathoAssist solves them.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { challenge: "File Size & Performance", solution: "Tile-based streaming via OpenSlide. Never loads full image into RAM." },
                                { challenge: "Magnification Consistency", solution: "Standardized patch extraction at configurable zoom levels." },
                                { challenge: "Color Variation Between Labs", solution: "Robust Otsu thresholding works across different stain intensities." },
                                { challenge: "Annotation Complexity", solution: "Auto-ROI selection reduces manual work. Top-K patches are pre-selected for review." },
                            ].map((item) => (
                                <div key={item.challenge} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                    <h3 className="font-bold text-slate-800 mb-2">{item.challenge}</h3>
                                    <p className="text-sm text-slate-600">{item.solution}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to See It in Action?</h2>
                    <p className="text-teal-100 mb-8 max-w-xl mx-auto">
                        Upload a Whole Slide Image and watch PathoAssist extract, filter, and analyze the most diagnostically relevant regions in seconds.
                    </p>
                    <Link
                        to="/app"
                        className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-teal-50 transition-colors"
                    >
                        Launch Application
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

        </WebsiteLayout>
    );
}
