import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Github, Play, Linkedin, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

                    <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 text-sm font-medium text-slate-600">
                        <Link to="/" className="hover:text-teal-600 transition-colors">
                            Home
                        </Link>
                        <Link to="/features" className="hover:text-teal-600 transition-colors">
                            Features
                        </Link>
                        <Link to="/wsi-processing" className="hover:text-violet-600 transition-colors">
                            WSI Processing
                        </Link>
                        <Link to="/safety" className="hover:text-teal-600 transition-colors">
                            Safety & Compliance
                        </Link>
                        <Link to="/tech-stack" className="hover:text-teal-600 transition-colors">
                            Tech Stack
                        </Link>
                        <Link to="/docs" className="hover:text-teal-600 transition-colors">
                            Documentation
                        </Link>
                        <Link to="/impact" className="hover:text-teal-600 transition-colors">
                            Global Impact
                        </Link>
                        <Link to="/about" className="hover:text-teal-600 transition-colors">
                            About
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Mobile Menu */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-slate-900">
                                        <Menu className="h-6 w-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                    <nav className="flex flex-col gap-4 mt-8">
                                        <Link to="/" className="text-lg font-medium text-slate-900 hover:text-teal-600 transition-colors">
                                            Home
                                        </Link>
                                        <Link to="/features" className="text-lg font-medium text-slate-900 hover:text-teal-600 transition-colors">
                                            Features
                                        </Link>
                                        <Link to="/wsi-processing" className="text-lg font-medium text-slate-900 hover:text-teal-600 transition-colors">
                                            WSI Processing
                                        </Link>
                                        <Link to="/safety" className="text-lg font-medium text-slate-900 hover:text-teal-600 transition-colors">
                                            Safety & Compliance
                                        </Link>
                                        <Link to="/tech-stack" className="text-lg font-medium text-slate-900 hover:text-teal-600 transition-colors">
                                            Tech Stack
                                        </Link>
                                        <Link to="/docs" className="text-lg font-medium text-slate-900 hover:text-teal-600 transition-colors">
                                            Documentation
                                        </Link>
                                        <Link to="/impact" className="text-lg font-medium text-slate-900 hover:text-teal-600 transition-colors">
                                            Global Impact
                                        </Link>
                                        <Link to="/about" className="text-lg font-medium text-slate-900 hover:text-teal-600 transition-colors">
                                            About
                                        </Link>
                                        <div className="pt-4 mt-4 border-t border-slate-100">
                                            <a
                                                href="https://github.com/contact-ajmal/pathoassist"
                                                target="_blank"
                                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                                            >
                                                <Github className="h-5 w-5" />
                                                GitHub Repo
                                            </a>
                                        </div>
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
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
                        <p className="flex items-center gap-1">
                            Built by <a href="https://www.linkedin.com/in/ajmalnazirbaba/" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors font-medium">Ajmal Baba</a> with React & MedGemma.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
