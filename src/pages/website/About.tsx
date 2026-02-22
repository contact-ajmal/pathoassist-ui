import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { Users, Code, Heart } from "lucide-react";

export default function About() {
    return (
        <WebsiteLayout>
            <div className="container mx-auto px-4 py-24">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-6">About PathoAssist</h1>
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Powered by <strong>Google Cloud & Google MedGemma</strong>
                        </div>
                    </div>
                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                        PathoAssist is a <strong className="text-teal-700">research initiative</strong> developed for the Google MedGemma Impact Challenge.
                        Our mission is to democratize access to advanced diagnostic tools by bringing state-of-the-art AI directly to the edge.
                    </p>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        By optimizing the <strong>Google MedGemma-4B</strong> model for local consumer hardware, we empower clinics in rural and resource-constrained
                        areas to perform high-quality pathology analysis without relying on expensive cloud infrastructure or consistent internet connectivity.
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
                        <h3 className="text-xl font-bold mb-3">Privacy Focused</h3>
                        <p className="text-slate-600">Built on secure, local-first architecture (Google MedGemma, PyTorch) ensuring patient data stays within your infrastructure.</p>
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
