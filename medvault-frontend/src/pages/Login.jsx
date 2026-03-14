import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Stethoscope
} from 'lucide-react';

/**
 * Clean & Simple Medical Portal Login
 * Fully integrated with the API service and React Router.
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, message: "" });

    try {
      // Real API Integration using the provided service
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      // Store the JWT token and user info from the backend
      localStorage.setItem("token", res.data.token);
      if (res.data.role) localStorage.setItem("role", res.data.role);
      if (res.data.id) localStorage.setItem("userId", res.data.id);

      setStatus({ type: 'success', message: "Access granted. Synchronizing your profile..." });

      // Redirect to dashboard after a short delay to show success state
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      // Enhanced error handling based on API response
      const errorMessage = err.response?.data?.message || "Invalid credentials. Please verify your details.";
      setStatus({
        type: 'error',
        message: errorMessage
      });
      console.error("Login Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-100">
        {/* Simple Branding Header */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center justify-center mb-4">
            <img src="/favicon.png" alt="MediVault Logo" className="w-12 h-12 drop-shadow-lg" />
          </button>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">MediVault Access</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium tracking-wide uppercase">Secure Health Portal</p>
        </div>

        {/* Clean Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all">
          <form onSubmit={handleLogin} className="p-8 space-y-5">

            {/* Identifier Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-tighter">Email</label>
              <div className="relative group text-slate-900">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Passkey Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Passkey</label>
                <button type="button" className="text-xs font-semibold text-teal-600 hover:underline" onClick={() => navigate('/forgot-password')}>Forgot?</button>
              </div>
              <div className="relative group text-slate-900">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-900 placeholder:text-slate-400"
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

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-bold rounded-2xl shadow-lg shadow-teal-200 transition-all active:scale-[0.98] focus:ring-4 focus:ring-teal-500/20"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Authorize Entrance</span>
                  <Stethoscope size={18} />
                </>
              )}
            </button>
          </form>

          {/* Card Footer */}
          <div className="bg-slate-50 py-5 text-center border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              New User? <button type="button" onClick={() => navigate('/register')} className="text-teal-600 font-bold hover:underline">Register Account</button>
            </p>
          </div>
        </div>

        {/* Footnote Links */}
        <div className="mt-8 flex justify-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">
          <button type="button" onClick={() => window.open('https://github.com/sujit-prog')} className="hover:text-teal-600 transition-colors">Support</button>
        </div>
      </div>
    </div>
  );
}