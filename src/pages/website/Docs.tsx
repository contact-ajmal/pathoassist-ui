import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { Book, Code, Terminal } from "lucide-react";

export default function Docs() {
    return (
        <WebsiteLayout>
            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <h3 className="font-bold text-slate-900 mb-4 px-2">Getting Started</h3>
                            <ul className="space-y-1">
                                {['Introduction', 'Installation', 'Quick Start'].map(item => (
                                    <li key={item}>
                                        <button className="w-full text-left px-2 py-2 text-sm text-slate-600 hover:text-teal-600 hover:bg-slate-50 rounded-md transition-colors">
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <h3 className="font-bold text-slate-900 mt-8 mb-4 px-2">Core Concepts</h3>
                            <ul className="space-y-1">
                                {['WSI Viewer', 'AI Inference', 'Reporting'].map(item => (
                                    <li key={item}>
                                        <button className="w-full text-left px-2 py-2 text-sm text-slate-600 hover:text-teal-600 hover:bg-slate-50 rounded-md transition-colors">
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 max-w-3xl prose prose-slate">
                        <h1>Documentation</h1>
                        <p className="lead text-xl text-slate-600">
                            Welcome to the PathoAssist documentation. Learn how to set up, configure, and use the AI-powered pathology assistant.
                        </p>

                        <div className="not-prose grid gap-6 my-12">
                            <div className="p-6 border border-slate-200 rounded-xl hover:border-teal-200 transition-colors cursor-pointer">
                                <div className="bg-teal-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                                    <Terminal className="h-5 w-5 text-teal-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Installation</h3>
                                <p className="text-slate-600 text-sm">Step-by-step guide to setting up the backend and frontend services.</p>
                            </div>
                            <div className="p-6 border border-slate-200 rounded-xl hover:border-teal-200 transition-colors cursor-pointer">
                                <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                                    <Code className="h-5 w-5 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">API Reference</h3>
                                <p className="text-slate-600 text-sm">Detailed documentation for the backend endpoints and inference engine.</p>
                            </div>
                        </div>

                        <h2>Architecture Overview</h2>
                        <p>
                            PathoAssist is built on a modern stack combining a React frontend with a Python (FastAPI/Flask) backend.
                            It uses <strong>OpenSlide</strong> for handling Whole Slide Images (WSI) and <strong>MedGemma</strong> for AI inference.
                        </p>
                    </div>
                </div>
            </div>
        </WebsiteLayout>
    );
}
