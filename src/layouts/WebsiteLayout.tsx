import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Github, Play, Linkedin } from "lucide-react";

export const WebsiteLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <path d="M12 12v6" />
                                    <path d="M9 15h6" />
                                </svg>
                            </div>
                            PathoAssist
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <Link to="/features" className="hover:text-teal-600 transition-colors">
                            Features
                        </Link>
                        <Link to="/docs" className="hover:text-teal-600 transition-colors">
                            Documentation
                        </Link>
                        <Link to="/about" className="hover:text-teal-600 transition-colors">
                            About
                        </Link>
                        <Link to="/impact" className="hover:text-teal-600 transition-colors">
                            Global Impact
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">


                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 py-12 text-slate-400">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-lg font-bold text-white mb-4">PathoAssist</h3>
                            <p className="max-w-xs text-sm leading-relaxed">
                                Empowering pathologists with next-generation AI tools.
                                Remote inference, multimodal analysis, and professional reporting in one platform.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                                <li><Link to="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-4">Contact</h4>
                            <p className="text-sm mb-3">
                                Interested in a private demo? Contact me directly.
                            </p>
                            <a
                                href="https://www.linkedin.com/in/ajmalnazirbaba/"
                                target="_blank"
                                className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors text-sm"
                            >
                                <Linkedin className="h-4 w-4" />
                                Connect on LinkedIn
                            </a>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
                        <p>© 2026 PathoAssist Project. All rights reserved.</p>
                        <p>Built with React, Vite & Google MedGemma.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
