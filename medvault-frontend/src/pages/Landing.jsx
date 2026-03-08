import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShieldPlus,
    CalendarDays,
    Stethoscope,
    ChevronRight,
    Lock,
    HeartPulse,
    Activity
} from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-roboto text-slate-900 overflow-x-hidden selection:bg-teal-100 selection:text-teal-900">

            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-3xl opacity-70"></div>
                <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-3xl opacity-50"></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-10 w-full backdrop-blur-md bg-white/70 border-b border-slate-200/50 sticky top-0">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/favicon.png" alt="MediVault Logo" className="w-10 h-10 drop-shadow-lg" />
                        <span className="font-extrabold text-xl tracking-tight text-slate-900">MediVault</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-500">
                        <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
                        <a href="#security" className="hover:text-teal-600 transition-colors">Security</a>
                        <a href="#providers" className="hover:text-teal-600 transition-colors">For Providers</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/login" className="hidden sm:flex text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors">
                            Sign In
                        </Link>
                        <Link to="/register" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
                            Get Started <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 w-full">

                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-24 lg:pt-32 lg:pb-40 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">

                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Secure version 2.0 live
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6">
                            Modern healthcare <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">in one secure vault.</span>
                        </h1>

                        <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-xl">
                            Connect directly with top healthcare providers, manage your appointments seamlessly, and keep all your medical records perfectly secure.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-teal-200 transition-all active:scale-[0.98]">
                                Create Free Account
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-8 py-4 rounded-2xl shadow-sm transition-all active:scale-[0.98]">
                                Sign In to Portal
                            </Link>
                        </div>
                    </div>

                    {/* Hero Visuals */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-emerald-500/10 rounded-3xl transform rotate-3 scale-105 pointer-events-none"></div>
                        <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 relative z-10">

                            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900">Next Appointment</h3>
                                    <p className="text-xs text-slate-500 font-medium">Cardiology Checkup</p>
                                </div>
                                <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-lg text-xs font-bold">
                                    Tomorrow
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                    <Stethoscope size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Dr. Behera</h4>
                                    <p className="text-sm text-slate-500 font-medium">Anandapur General Hospital</p>
                                </div>
                            </div>

                            <button href="#login" className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-sm font-bold transition-colors">
                                View Details
                            </button>
                        </div>

                        {/* Floating Element 1 */}
                        <div className="absolute -left-12 top-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce" style={{ animationDuration: '3s' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Lock size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Security</p>
                                    <p className="font-bold text-slate-900 text-sm">End-to-End</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Element 2 */}
                        <div className="absolute -right-8 -bottom-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce" style={{ animationDuration: '4s' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Activity size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Records</p>
                                    <p className="font-bold text-slate-900 text-sm">Sync Active</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </section>

                {/* Features Section */}
                <section id="features" className="py-24 bg-white border-t border-slate-200/50">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Everything you need for better health management</h2>
                            <p className="text-slate-500 font-medium">Built for both patients and providers to streamline the entire medical journey.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-teal-50/50 hover:border-teal-100 hover:shadow-lg hover:shadow-teal-100/50 transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-white text-teal-600 flex items-center justify-center shadow-sm border border-slate-200 mb-6 group-hover:scale-110 transition-transform">
                                    <CalendarDays size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Scheduling</h3>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">Book, reschedule, or cancel appointments directly from your dashboard with real-time provider availability.</p>
                            </div>

                            <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-100/50 transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-slate-200 mb-6 group-hover:scale-110 transition-transform">
                                    <HeartPulse size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Health Insights</h3>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">Keep track of your vital metrics, prescription status, and lab results all curated beautifully using our platform.</p>
                            </div>

                            <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 hover:shadow-lg transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-sm border border-slate-200 mb-6 group-hover:scale-110 transition-transform">
                                    <Stethoscope size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Provider Access</h3>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">If you're a doctor, seamlessly manage your availability slots and view your scheduled patient roster.</p>
                            </div>

                        </div>

                    </div>
                </section>

            </main>

            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <img src="/favicon.png" alt="MediVault Logo" className="w-7 h-7 opacity-80" />
                        <span className="font-bold text-slate-200">MediVault © 2024</span>
                    </div>
                    <div className="flex gap-6 text-sm font-bold">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
