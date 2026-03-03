import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldPlus, Home, CalendarDays, Clock, FileText, ShieldCheck, Settings, LogOut, Search, UserPlus, CheckCircle, XCircle } from "lucide-react";
import api from "../services/api";

export default function ConsentManagement() {
    const navigate = useNavigate();
    const [patientConsents, setPatientConsents] = useState([]);
    const [doctorConsents, setDoctorConsents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [patientIdInput, setPatientIdInput] = useState("");
    const [requesting, setRequesting] = useState(false);

    // We will fetch both and see which ones return data depending on user role
    useEffect(() => {
        fetchConsents();
    }, []);

    const fetchConsents = async () => {
        setIsLoading(true);
        try {
            // Try to fetch as patient
            const pRes = await api.get("/consents/patient").catch(() => null);
            if (pRes && pRes.data) setPatientConsents(pRes.data);

            // Try to fetch as doctor
            const dRes = await api.get("/consents/doctor").catch(() => null);
            if (dRes && dRes.data) setDoctorConsents(dRes.data);
        } catch (err) {
            console.error("Error fetching consents", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const handleRequestConsent = async (e) => {
        e.preventDefault();
        if (!patientIdInput) return;
        setRequesting(true);
        try {
            await api.post(`/consents/request/${patientIdInput}`);
            setPatientIdInput("");
            fetchConsents();
            alert("Consent request sent successfully.");
        } catch (err) {
            console.error(err);
            alert("Failed to send request. Ensure patient ID is correct and you are a doctor.");
        } finally {
            setRequesting(false);
        }
    };

    const handleUpdateStatus = async (consentId, status) => {
        try {
            await api.put(`/consents/${consentId}/status?status=${status}`);
            fetchConsents();
        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
        }
    };

    const isPatientView = patientConsents.length > 0 || (patientConsents.length === 0 && doctorConsents.length === 0);
    const isDoctorView = doctorConsents.length > 0;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-200">
                        <ShieldPlus size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-slate-900 leading-tight">MediVault</h1>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Portal</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                        <Home size={20} />
                        <span>Overview</span>
                    </Link>
                    <Link to="/appointments" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                        <CalendarDays size={20} />
                        <span>Appointments</span>
                    </Link>
                    <Link to="/availability" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                        <Clock size={20} />
                        <span>Availability</span>
                    </Link>
                    <Link to="/records" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                        <FileText size={20} />
                        <span>Health Records</span>
                    </Link>
                    <Link to="/consents" className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-bold transition-colors">
                        <ShieldCheck size={20} />
                        <span>Data Consents</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-rose-500 hover:bg-rose-50 rounded-xl font-bold transition-colors mt-1">
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-6 sm:px-10 h-16 flex items-center justify-between shrink-0">
                    <h2 className="font-bold text-xl text-slate-900">Consent Management</h2>
                </header>

                <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">

                    {/* Doctor View: Request Consent */}
                    {/* We show this conservatively. If doctorConsents length > 0, they are definitely a doctor. */}
                    {isDoctorView && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <UserPlus size={20} className="text-teal-600" /> Request Patient Access
                            </h3>
                            <form onSubmit={handleRequestConsent} className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Patient ID</label>
                                    <input
                                        type="number"
                                        value={patientIdInput}
                                        onChange={e => setPatientIdInput(e.target.value)}
                                        placeholder="Enter Patient ID..."
                                        className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={requesting}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-md hover:bg-teal-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {requesting ? "Sending..." : "Send Request"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Consents List Section */}
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-900 mb-4">
                            {isDoctorView ? "Your Access Requests" : "Who has access to your records"}
                        </h3>

                        {isLoading ? (
                            <p className="text-slate-500 font-medium">Loading consents...</p>
                        ) : (patientConsents.length === 0 && doctorConsents.length === 0) ? (
                            <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center shadow-sm">
                                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900">No Consents</h4>
                                <p className="text-slate-500 text-sm mt-2">There are no pending or active consent requests.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {(isDoctorView ? doctorConsents : patientConsents).map(consent => (
                                    <div key={consent.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-colors hover:border-teal-300">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${consent.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : consent.status === 'REVOKED' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div>
                                                {isDoctorView ? (
                                                    <h4 className="font-bold text-slate-900 text-lg">Patient {consent.patientName}</h4>
                                                ) : (
                                                    <h4 className="font-bold text-slate-900 text-lg">Dr. {consent.doctorName}</h4>
                                                )}
                                                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mt-1">
                                                    <span>Status: {consent.status}</span>
                                                    <span>{new Date(consent.requestedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Patient Actions */}
                                        {!isDoctorView && consent.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUpdateStatus(consent.id, 'APPROVED')} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-bold transition-colors">
                                                    <CheckCircle size={16} /> Approve
                                                </button>
                                                <button onClick={() => handleUpdateStatus(consent.id, 'REVOKED')} className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg text-sm font-bold transition-colors">
                                                    <XCircle size={16} /> Deny
                                                </button>
                                            </div>
                                        )}
                                        {!isDoctorView && consent.status === 'APPROVED' && (
                                            <button onClick={() => handleUpdateStatus(consent.id, 'REVOKED')} className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-lg text-sm font-bold transition-colors">
                                                <XCircle size={16} /> Revoke Access
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
