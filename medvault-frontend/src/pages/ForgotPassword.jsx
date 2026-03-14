import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
    Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle,
    ArrowLeft, ShieldCheck, KeyRound
} from "lucide-react";

/**
 * 3-step forgot-password flow:
 *   Step 1 – Enter email  → POST /api/auth/forgot-password
 *   Step 2 – Enter OTP + new password → POST /api/auth/reset-password
 *   Step 3 – Success confirmation + link back to login
 */
export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Fields
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ type: null, message: "" });

    // ── Step 1: Send OTP ──────────────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: null, message: "" });
        try {
            const res = await API.post("/auth/forgot-password", { email });
            setStatus({ type: "success", message: res.data.message });
            // Move to step 2 after a brief success flash
            setTimeout(() => {
                setStatus({ type: null, message: "" });
                setStep(2);
            }, 1200);
        } catch (err) {
            setStatus({
                type: "error",
                message: err.response?.data?.message || "Failed to send OTP. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 2: Reset Password ────────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setStatus({ type: "error", message: "Passwords do not match." });
            return;
        }
        if (newPassword.length < 6) {
            setStatus({ type: "error", message: "Password must be at least 6 characters." });
            return;
        }
        setIsLoading(true);
        setStatus({ type: null, message: "" });
        try {
            const res = await API.post("/auth/reset-password", { email, otp, newPassword });
            setStatus({ type: "success", message: res.data.message });
            setTimeout(() => {
                setStatus({ type: null, message: "" });
                setStep(3);
            }, 1000);
        } catch (err) {
            setStatus({
                type: "error",
                message: err.response?.data?.message || "Failed to reset password. Please check the OTP.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const StatusBanner = () =>
        status.message ? (
            <div className={`flex items-start gap-2 p-3.5 rounded-xl text-xs font-semibold animate-in fade-in ${status.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-rose-50 text-rose-700 border border-rose-100"
                }`}>
                <div className="mt-0.5 shrink-0">
                    {status.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                </div>
                <span>{status.message}</span>
            </div>
        ) : null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
            <div className="w-full max-w-sm">
                {/* Branding */}
                <div className="text-center mb-8">
                    <button onClick={() => navigate("/")} className="inline-flex items-center justify-center mb-4">
                        <img src="/favicon.png" alt="MediVault Logo" className="w-12 h-12 drop-shadow-lg" />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">MediVault</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium uppercase tracking-wide">Password Recovery</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {/* ── STEP 1: Email ── */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="p-8 space-y-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Reset your password</h3>
                                    <p className="text-xs text-slate-400 font-medium">We'll send a 6-digit OTP to your email.</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-tighter">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <StatusBanner />

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-bold rounded-2xl shadow-lg shadow-teal-200 transition-all active:scale-[0.98]"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={18} /><span>Send OTP</span></>}
                            </button>
                        </form>
                    )}

                    {/* ── STEP 2: OTP + New Password ── */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="p-8 space-y-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                    <KeyRound size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Enter OTP & New Password</h3>
                                    <p className="text-xs text-slate-400 font-medium">Check your email <span className="font-bold text-slate-600">{email}</span></p>
                                </div>
                            </div>

                            {/* OTP */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-tighter">6-Digit OTP</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-center tracking-[0.4em] font-bold placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400"
                                />
                            </div>

                            {/* New Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-tighter">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Min 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-teal-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-tighter">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <StatusBanner />

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors"
                                >
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 h-12 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-bold rounded-2xl shadow-lg shadow-teal-200 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={18} /><span>Reset Password</span></>}
                                </button>
                            </div>

                            <p className="text-center text-xs text-slate-400 font-medium">
                                Didn't receive the OTP?{" "}
                                <button type="button" onClick={() => setStep(1)} className="text-teal-600 font-bold hover:underline">
                                    Resend
                                </button>
                            </p>
                        </form>
                    )}

                    {/* ── STEP 3: Success ── */}
                    {step === 3 && (
                        <div className="p-8 text-center space-y-5">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">All done!</h3>
                                <p className="text-sm text-slate-500 font-medium mt-2">
                                    Your password has been reset successfully. You can now sign in with your new password.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-200 transition-all active:scale-[0.98]"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}

                    {/* Footer */}
                    {step !== 3 && (
                        <div className="bg-slate-50 py-5 text-center border-t border-slate-100">
                            <p className="text-xs text-slate-500 font-medium">
                                Remembered it?{" "}
                                <button type="button" onClick={() => navigate("/login")} className="text-teal-600 font-bold hover:underline">
                                    Back to Login
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
