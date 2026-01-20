import { useState, useEffect } from "react";
import { WebsiteLayout } from "@/layouts/WebsiteLayout";
import { motion } from "framer-motion";
import {
    Globe2,
    TrendingUp,
    WifiOff,
    Users,
    Calculator,
    DollarSign,
    Clock,
    BarChart3,
    ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Impact() {
    // Calculator State
    const [caseVolume, setCaseVolume] = useState([20]); // Slides per day
    const [dataCost, setDataCost] = useState([5]); // $ per GB (High like in rural Africa sat links)
    const [pathologistRate, setPathologistRate] = useState([50]); // $ per hour

    // Constants
    const AVG_SLIDE_SIZE_GB = 1.2;
    const MANUAL_REVIEW_MINS = 20;
    const AI_ASSISTED_MINS = 5;

    // Derived Metrics
    const dailyDataSaved = caseVolume[0] * AVG_SLIDE_SIZE_GB;
    const monthlyDataCostSaved = dailyDataSaved * dataCost[0] * 22; // 22 working days
    const dailyTimeSavedMins = caseVolume[0] * (MANUAL_REVIEW_MINS - AI_ASSISTED_MINS);
    const monthlyTimeSavedHours = (dailyTimeSavedMins / 60) * 22;
    const monthlyLaborValue = monthlyTimeSavedHours * pathologistRate[0];

    return (
        <WebsiteLayout>
            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 bg-slate-900 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop')] opacity-20 bg-cover bg-center" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-sm font-medium text-blue-200 mb-6">
                            <Globe2 className="h-4 w-4" />
                            Global Health Initiative
                        </div>
                        <h1 className="text-5xl font-bold mb-6 tracking-tight">Bridging the Diagnostic Gap</h1>
                        <p className="text-xl text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
                            In many regions, a lack of specialists and internet connectivity creates a fatal bottleneck.
                            PathoAssist is designed to break these barriers through <strong>Offline-First AI</strong>.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Problem Statement Grid */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="text-center p-6">
                            <h3 className="text-4xl font-bold text-slate-900 mb-2">1 per 1M</h3>
                            <p className="text-slate-600">Pathologists in Sub-Saharan Africa vs 1 per 15k in US.</p>
                        </div>
                        <div className="text-center p-6 border-x border-slate-100">
                            <h3 className="text-4xl font-bold text-slate-900 mb-2">47%</h3>
                            <p className="text-slate-600">Of the world has no or expensive/unreliable internet access.</p>
                        </div>
                        <div className="text-center p-6">
                            <h3 className="text-4xl font-bold text-slate-900 mb-2">2 Weeks</h3>
                            <p className="text-slate-600">Average wait time for cancer diagnosis in resource-limited settings.</p>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto bg-slate-50 rounded-2xl p-8 border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <WifiOff className="h-6 w-6 text-slate-600" />
                            Why "Cloud-First" Fails
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Most AI pathology solutions require uploading gigapixel slides (1-2GB each) to the cloud for processing.
                            In rural clinics with satellite internet ($5+/GB) or unstable 3G, this is functionally impossible.
                            <strong>PathoAssist brings the AI to the data</strong>, running complex HAI-DEF models locally on consumer hardware.
                        </p>
                    </div>
                </div>
            </section>

            {/* Interactive ROI Calculator */}
            <section className="py-24 bg-teal-900 text-white relative overflow-hidden" id="calculator">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">Impact Calculator</h2>
                        <p className="text-teal-200">Estimate the tangible value of deploying PathoAssist in your facility.</p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
                        {/* Inputs */}
                        <Card className="lg:col-span-5 bg-white/10 backdrop-blur-md border-white/20 text-white p-8">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Facility Parameters
                            </h3>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label className="text-teal-100">Daily Case Volume</Label>
                                        <span className="font-mono bg-teal-950/50 px-2 py-1 rounded text-sm">{caseVolume[0]} slides/day</span>
                                    </div>
                                    <Slider
                                        value={caseVolume}
                                        onValueChange={setCaseVolume}
                                        max={100}
                                        step={1}
                                        className="py-4"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label className="text-teal-100">Connectivity Cost (per GB)</Label>
                                        <span className="font-mono bg-teal-950/50 px-2 py-1 rounded text-sm">${dataCost[0].toFixed(2)}</span>
                                    </div>
                                    <Slider
                                        value={dataCost}
                                        onValueChange={setDataCost}
                                        max={20}
                                        step={0.5}
                                        className="py-4"
                                    />
                                    <p className="text-xs text-teal-300/60">Global avg mobile data cost varies: India ($0.17) vs Falkland Islands ($38+).</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label className="text-teal-100">Pathologist Hourly Rate</Label>
                                        <span className="font-mono bg-teal-950/50 px-2 py-1 rounded text-sm">${pathologistRate[0]}/hr</span>
                                    </div>
                                    <Slider
                                        value={pathologistRate}
                                        onValueChange={setPathologistRate}
                                        max={300}
                                        step={10}
                                        className="py-4"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Outputs */}
                        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
                            <Card className="bg-white text-slate-900 p-6 flex flex-col justify-between border-0 shadow-xl">
                                <div>
                                    <div className="bg-blue-100 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                                        <WifiOff className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h4 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Monthly Bandwidth Saved</h4>
                                </div>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold tracking-tight">{Math.round(dailyDataSaved * 22)} GB</span>
                                    <p className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3" />
                                        ${Math.round(monthlyDataCostSaved).toLocaleString()} saved/mo
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                                    Based on 1.2GB avg WSI size. Cloud analysis requires full upload.
                                </div>
                            </Card>

                            <Card className="bg-white text-slate-900 p-6 flex flex-col justify-between border-0 shadow-xl">
                                <div>
                                    <div className="bg-amber-100 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                                        <Clock className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <h4 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Clinical Hours Saved</h4>
                                </div>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold tracking-tight">{Math.round(monthlyTimeSavedHours)} hrs</span>
                                    <p className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3" />
                                        ${Math.round(monthlyLaborValue).toLocaleString()} value/mo
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                                    AI-assisted triage (5 mins) vs Manual review (20 mins).
                                </div>
                            </Card>

                            <Card className="sm:col-span-2 bg-gradient-to-br from-teal-500 to-teal-600 text-white p-8 border-0 shadow-xl">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-teal-100 font-medium mb-1">Projected Annual Impact</h4>
                                        <p className="text-5xl font-bold tracking-tight mb-2">
                                            $ {Math.round((monthlyDataCostSaved + monthlyLaborValue) * 12).toLocaleString()}
                                        </p>
                                        <p className="text-teal-100">Total efficiency value generated per year.</p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <BarChart3 className="h-24 w-24 text-teal-300/20" />
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap gap-6">
                                    <div>
                                        <span className="block text-2xl font-bold">{Math.round((dailyTimeSavedMins / 20) * 22)}</span>
                                        <span className="text-sm text-teal-100">Additional Patients/Mo</span>
                                    </div>
                                    <div>
                                        <span className="block text-2xl font-bold">100%</span>
                                        <span className="text-sm text-teal-100">Data Privacy</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to make an impact?</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
                        Join the community of clinics and researchers using PathoAssist to democratize access to advanced diagnostics.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button size="lg" className="bg-teal-600 hover:bg-teal-700 h-12 px-8">
                            <Link to="/docs">Case Studies</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8">
                            <Link to="/contact">Contact Research Team</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
}
