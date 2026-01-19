import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { Users, Code, Heart } from "lucide-react";

export default function About() {
    return (
        <WebsiteLayout>
            <div className="container mx-auto px-4 py-24">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-6">About PathoAssist</h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        PathoAssist is an open-source initiative dedicated to democratizing access to advanced AI tools in pathology.
                        Our mission is to bridge the gap between cutting-edge computer vision research and clinical workflows.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    <div className="text-center">
                        <div className="bg-teal-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Users className="h-8 w-8 text-teal-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">For Pathologists</h3>
                        <p className="text-slate-600">Designed with clinical needs in mind, providing decision support that enhances accuracy without replacing expertise.</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Code className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Open Source</h3>
                        <p className="text-slate-600">Built on modern tech stacks (React, Python, PyTorch) and completely transparent. Contribute on GitHub.</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-rose-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Heart className="h-8 w-8 text-rose-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Community Driven</h3>
                        <p className="text-slate-600">Developed by and for the medical AI community. We welcome feedback and collaboration.</p>
                    </div>
                </div>
            </div>
        </WebsiteLayout>
    );
}
