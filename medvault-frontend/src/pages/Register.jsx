import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
    Building2,
    CalendarDays,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Mail,
    Lock,
    User,
    ShieldPlus,
    Stethoscope,
    ChevronRight
} from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "PATIENT",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ type: null, message: "" });

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: null, message: "" });

        try {
            const res = await API.post("/auth/register", formData);
            if (res.data.token) localStorage.setItem("token", res.data.token);
            if (res.data.role) localStorage.setItem("role", res.data.role);
            if (res.data.id) localStorage.setItem("userId", res.data.id);

            setStatus({ type: 'success', message: "Account successfully created. Proceeding to login..." });

            setTimeout(() => {
                navigate("/");
            }, 1500);

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Registration failed. Please check your details.";
            setStatus({
                type: 'error',
                message: errorMessage
            });
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-slate-900 bg-white">
            {/* Left Pane - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-12 border-r border-slate-100 relative min-h-screen overflow-y-auto">

                <div className="absolute top-8 left-8 flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                    <img src="/favicon.png" alt="MediVault Logo" className="w-8 h-8 drop-shadow-sm" />
                    <span className="font-bold text-sm text-slate-700 tracking-tight">MediVault</span>
                </div>

                <div className="max-w-100 w-full mx-auto mt-12 mb-8">
                    <div className="mb-10">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Create Account</h1>
                        <p className="text-slate-500 font-medium text-sm">Join the MediVault network for secure healthcare management.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">

                        {/* Role Selection */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <label className={`
                relative flex items-center p-3 cursor-pointer rounded-2xl border-2 transition-all
                ${formData.role === 'PATIENT' ? 'border-teal-500 bg-teal-50/50 text-teal-700' : 'border-slate-100 bg-white hover:border-slate-200 text-slate-500'}
              `}>
                                <input type="radio" name="role" value="PATIENT" checked={formData.role === 'PATIENT'} onChange={handleInputChange} className="sr-only" />
                                <div className="flex items-center gap-2.5">
                                    <User size={18} className={formData.role === 'PATIENT' ? 'text-teal-600' : 'text-slate-400'} />
                                    <span className="font-bold text-sm">Patient</span>
                                </div>
                            </label>

                            <label className={`
                relative flex items-center p-3 cursor-pointer rounded-2xl border-2 transition-all
                ${formData.role === 'DOCTOR' ? 'border-teal-500 bg-teal-50/50 text-teal-700' : 'border-slate-100 bg-white hover:border-slate-200 text-slate-500'}
              `}>
                                <input type="radio" name="role" value="DOCTOR" checked={formData.role === 'DOCTOR'} onChange={handleInputChange} className="sr-only" />
                                <div className="flex items-center gap-2.5">
                                    <Stethoscope size={18} className={formData.role === 'DOCTOR' ? 'text-teal-600' : 'text-slate-400'} />
                                    <span className="font-bold text-sm">Doctor</span>
                                </div>
                            </label>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-tighter">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    required
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-tighter">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    required
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-tighter">Email Address</label>
                            <div className="relative group text-slate-900">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="john.doe@email.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-tighter">Secure Passkey</label>
                            <div className="relative group text-slate-900">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 ml-1 font-medium">Must be at least 8 characters long.</p>
                        </div>

                        {/* Feedback Message */}
                        {status.message && (
                            <div className={`flex items-start gap-2 p-3.5 rounded-xl text-xs font-semibold animate-in fade-in slide-in-from-top-1 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                <div className="mt-0.5 shrink-0">
                                    {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                </div>
                                <span>{status.message}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 mt-2 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] focus:ring-4 focus:ring-slate-500/20"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Complete Registration</span>
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-slate-500 font-medium">
                        Already have an account? <button onClick={() => navigate('/')} className="text-teal-600 font-bold hover:underline">Sign In</button>
                    </p>
                </div>
            </div>

            {/* Right Pane - Visuals */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-50 flex-col items-center justify-center p-12 relative overflow-hidden">
                {/* Abstract Background Design */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-105 relative z-10 space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Your health, securely managed.</h3>
                        <p className="text-slate-500 leading-relaxed text-sm font-medium">
                            Join thousands of patients and doctors on a single, secure network. Manage appointments, clinical records, and availability with enterprise-grade security.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4 p-5 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">
                            <div className="shrink-0 w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                                <CalendarDays size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">Smart Scheduling</h4>
                                <p className="text-xs text-slate-500 font-medium">Book easily with synchronized calendars.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-5 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">
                            <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">Network of Care</h4>
                                <p className="text-xs text-slate-500 font-medium">Connect directly with top healthcare professionals.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
