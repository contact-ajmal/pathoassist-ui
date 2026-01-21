import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { motion } from "framer-motion";
import {
    Globe2,
    Clock,
    Users,
    Activity,
    Heart,
    AlertTriangle,
    CheckCircle2,
    Microscope,
    Zap,
    Building2,
    Stethoscope,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Impact() {
    const impactAreas = [
        {
            icon: Clock,
            title: "Faster Detection, Better Outcomes",
            description: "Early detection of cancer and other diseases dramatically improves patient survival rates. PathoAssist enables rapid preliminary analysis, reducing diagnostic delays from weeks to hours.",
            stat: "15 min",
            statLabel: "Average time to preliminary findings"
        },
        {
            icon: Building2,
            title: "Relief for Overloaded Hospitals",
            description: "Hospitals worldwide face pathologist shortages. By automating initial screening and prioritization, PathoAssist helps clinical teams focus on the most critical cases first.",
            stat: "4x",
            statLabel: "Faster case triage"
        },
        {
            icon: Stethoscope,
            title: "Empowering Pathologists",
            description: "PathoAssist doesn't replace pathologists—it amplifies their capabilities. AI-generated findings serve as a 'second opinion', highlighting regions of interest and potential abnormalities.",
            stat: "100%",
            statLabel: "Final decisions remain with clinicians"
        }
    ];

    const useCases = [
        {
            title: "High-Volume Cancer Screening",
            description: "In breast, cervical, and colorectal cancer programs, PathoAssist pre-screens slides to flag suspicious cases, allowing pathologists to prioritize their review queue.",
            icon: Activity
        },
        {
            title: "Rural & Remote Clinics",
            description: "Clinics without on-site pathologists can generate preliminary reports locally, enabling faster referrals and reducing patient anxiety during diagnostic waits.",
            icon: Globe2
        },
        {
            title: "Emergency Departments",
            description: "When time is critical, rapid AI-assisted analysis helps ED physicians understand tissue samples faster, supporting urgent treatment decisions.",
            icon: AlertTriangle
        },
        {
            title: "Training & Education",
            description: "Medical students and residents can use PathoAssist as a learning tool, comparing their assessments against AI-generated findings to develop diagnostic skills.",
            icon: Users
        }
    ];

    return (
        <WebsiteLayout>
            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-sm font-medium mb-6">
                            <Heart className="h-4 w-4 text-teal-300" />
                            Saving Lives Through Early Detection
                        </div>
                        <h1 className="text-5xl font-bold mb-6 tracking-tight">
                            Every Minute Counts in Disease Detection
                        </h1>
                        <p className="text-xl text-teal-100 font-light leading-relaxed max-w-2xl mx-auto">
                            When hospitals are overwhelmed and pathologists are stretched thin, PathoAssist provides the rapid, reliable support that helps catch diseases earlier—when they're most treatable.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Critical Stats */}
            <section className="py-16 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center p-8 rounded-2xl bg-teal-50"
                        >
                            <h3 className="text-5xl font-bold text-teal-600 mb-3">91%</h3>
                            <p className="text-slate-700 font-medium">5-year survival rate for localized breast cancer</p>
                            <p className="text-sm text-slate-500 mt-2">vs 29% for distant-stage diagnosis</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-center p-8 rounded-2xl bg-amber-50"
                        >
                            <h3 className="text-5xl font-bold text-amber-600 mb-3">2 Weeks</h3>
                            <p className="text-slate-700 font-medium">Average wait time for pathology results</p>
                            <p className="text-sm text-slate-500 mt-2">in overburdened healthcare systems</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-center p-8 rounded-2xl bg-teal-50"
                        >
                            <h3 className="text-5xl font-bold text-teal-600 mb-3">1:15,000</h3>
                            <p className="text-slate-700 font-medium">Pathologist-to-patient ratio recommended</p>
                            <p className="text-sm text-slate-500 mt-2">vs 1:1,000,000 in some regions</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Impact Areas */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">How PathoAssist Makes a Difference</h2>
                        <p className="text-slate-600">Designed with clinical workflows in mind, PathoAssist addresses real challenges faced by healthcare providers worldwide.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {impactAreas.map((area, idx) => (
                            <motion.div
                                key={area.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow"
                            >
                                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                                    <area.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{area.title}</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">{area.description}</p>
                                <div className="pt-4 border-t border-slate-100">
                                    <span className="text-3xl font-bold text-teal-600">{area.stat}</span>
                                    <span className="text-sm text-slate-500 ml-2">{area.statLabel}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Where PathoAssist Helps Most</h2>
                        <p className="text-slate-600">From high-volume screening programs to emergency situations, PathoAssist adapts to diverse clinical needs.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {useCases.map((useCase, idx) => (
                            <motion.div
                                key={useCase.title}
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex gap-4 p-6 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors"
                            >
                                <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                                    <useCase.icon className="w-6 h-6 text-teal-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">{useCase.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{useCase.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pathologist-Centered Design */}
            <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                                    <Microscope className="w-4 h-4 text-teal-300" />
                                    Built for Clinicians
                                </div>
                                <h2 className="text-3xl font-bold mb-6">AI That Supports, Not Replaces</h2>
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    PathoAssist is designed as a <strong>clinical support tool</strong>—not an autonomous diagnostic system.
                                    Every AI-generated finding is presented as a suggestion for the pathologist to verify, modify, or dismiss.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Highlights regions requiring attention",
                                        "Provides confidence scores for transparency",
                                        "Generates editable draft reports",
                                        "Maintains full audit trail of changes"
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span className="text-slate-200">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                                <div className="text-center">
                                    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Zap className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">The PathoAssist Workflow</h3>
                                    <div className="space-y-4 text-left">
                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                            <span className="bg-teal-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center">1</span>
                                            <span className="text-slate-200">AI analyzes slide regions</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                            <span className="bg-teal-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center">2</span>
                                            <span className="text-slate-200">Flags potential abnormalities</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                            <span className="bg-teal-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center">3</span>
                                            <span className="text-slate-200">Pathologist reviews & validates</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                                            <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center">✓</span>
                                            <span className="text-emerald-300 font-medium">Final diagnosis by clinician</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-teal-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Join the Mission for Earlier Detection</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
                        Whether you're a hospital administrator, pathologist, or researcher, PathoAssist can help you deliver faster, more accessible diagnostic support.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Button size="lg" className="bg-teal-600 hover:bg-teal-700 h-12 px-8">
                            <Link to="/app" className="flex items-center gap-2">
                                Try PathoAssist <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 border-teal-300 text-teal-700 hover:bg-teal-100">
                            <Link to="/docs">View Documentation</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
}
