import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Home, CalendarDays, Clock, FileText, ShieldCheck, Settings, LogOut,
    UserPlus, CheckCircle, XCircle, Clock3, ShieldAlert, ExternalLink, RefreshCw
} from "lucide-react";
import api from "../services/api";

const STATUS_CONFIG = {
    PENDING: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
    APPROVED: { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
    REVOKED: { label: "Revoked", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

export default function ConsentManagement() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem("role")?.toUpperCase() || "PATIENT";
    const isDoctor = userRole !== "PATIENT";

    const [patientConsents, setPatientConsents] = useState([]);
    const [doctorConsents, setDoctorConsents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [patientIdInput, setPatientIdInput] = useState("");
    const [requesting, setRequesting] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // consent id being acted on

    useEffect(() => { fetchConsents(); }, []);

    const fetchConsents = async () => {
        setIsLoading(true);
        try {
            if (isDoctor) {
                const dRes = await api.get("/consents/doctor").catch(() => null);
                if (dRes?.data) setDoctorConsents(dRes.data);
            } else {
                const pRes = await api.get("/consents/patient").catch(() => null);
                if (pRes?.data) setPatientConsents(pRes.data);
            }
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
            alert(err.response?.data || "Failed to send request. Ensure patient ID is correct.");
        } finally {
            setRequesting(false);
        }
    };

    const handleUpdateStatus = async (consentId, status) => {
        setActionLoading(consentId);
        try {
            await api.put(`/consents/${consentId}/status?status=${status}`);
            fetchConsents();
        } catch (err) {
            console.error(err);
            alert("Failed to update consent status.");
        } finally {
            setActionLoading(null);
        }
    };

    const sidebarLinks = [
        { to: "/dashboard", icon: <Home size={20} />, label: "Overview" },
        { to: "/appointments", icon: <CalendarDays size={20} />, label: "Appointments" },
        ...(isDoctor ? [{ to: "/availability", icon: <Clock size={20} />, label: "Availability" }] : []),
        { to: "/records", icon: <FileText size={20} />, label: isDoctor ? "Patient Records" : "Health Records" },
        { to: "/consents", icon: <ShieldCheck size={20} />, label: "Data Consents", active: true },

    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
            {/* ── Sidebar ── */}
            <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
                <div className="p-6 flex items-center gap-3">
                    <img src="/favicon.png" alt="MediVault Logo" className="w-10 h-10 drop-shadow-md" />
                    <div>
                        <h1 className="font-bold text-lg text-slate-900 leading-tight">MediVault</h1>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {isDoctor ? "Provider Portal" : "Patient Portal"}
                        </p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {sidebarLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${link.active
                                ? "bg-teal-50 text-teal-700"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                        <Settings size={20} /><span>Settings</span>
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-rose-500 hover:bg-rose-50 rounded-xl font-bold transition-colors mt-1">
                        <LogOut size={20} /><span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-6 sm:px-10 h-16 flex items-center justify-between shrink-0">
                    <h2 className="font-bold text-xl text-slate-900">Consent Management</h2>
                    <button
                        onClick={fetchConsents}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <RefreshCw size={15} /> Refresh
                    </button>
                </header>

                <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">

                    {/* ────────────────────────────────────────────
              DOCTOR VIEW
          ──────────────────────────────────────────── */}
                    {isDoctor && (
                        <>
                            {/* Request consent card */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                                    <UserPlus size={20} className="text-teal-600" /> Request Patient Access
                                </h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    Enter the patient's ID to request access to their health records. The patient must approve before you can view anything.
                                </p>
                                <form onSubmit={handleRequestConsent} className="flex flex-col sm:flex-row gap-3 items-end">
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Patient ID</label>
                                        <input
                                            type="number"
                                            value={patientIdInput}
                                            onChange={e => setPatientIdInput(e.target.value)}
                                            placeholder="Enter numeric patient ID..."
                                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={requesting}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-md hover:bg-teal-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {requesting ? "Sending…" : "Send Request"}
                                    </button>
                                </form>
                            </div>

                            {/* Doctor's outgoing requests */}
                            <section>
                                <h3 className="text-xl font-extrabold text-slate-900 mb-4">Your Access Requests</h3>
                                {isLoading ? (
                                    <p className="text-slate-500 font-medium">Loading…</p>
                                ) : doctorConsents.length === 0 ? (
                                    <EmptyState
                                        icon={<ShieldAlert size={32} />}
                                        title="No Requests Yet"
                                        desc="You haven't requested access to any patient's records yet."
                                    />
                                ) : (
                                    <div className="grid gap-4">
                                        {doctorConsents.map(consent => (
                                            <div
                                                key={consent.id}
                                                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-300 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${consent.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" :
                                                        consent.status === "REVOKED" ? "bg-rose-50 text-rose-600" :
                                                            "bg-amber-50 text-amber-600"
                                                        }`}>
                                                        <ShieldCheck size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">Patient: {consent.patientName}</h4>
                                                        <div className="flex flex-wrap items-center gap-3 mt-1">
                                                            <StatusBadge status={consent.status} />
                                                            <span className="text-xs text-slate-400 font-semibold">
                                                                Requested {new Date(consent.requestedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {consent.status === "APPROVED" && (
                                                    <Link
                                                        to="/records"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl text-sm font-bold hover:bg-teal-100 transition-colors shrink-0"
                                                    >
                                                        <ExternalLink size={15} /> View Records
                                                    </Link>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}

                    {/* ────────────────────────────────────────────
              PATIENT VIEW
          ──────────────────────────────────────────── */}
                    {!isDoctor && (
                        <section>
                            {/* Info banner */}
                            <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-200 rounded-2xl mb-6">
                                <ShieldCheck size={20} className="text-teal-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-teal-800 font-medium">
                                    Healthcare professionals can request access to your records. <strong>Only you</strong> can approve or revoke that access — doctors cannot see your records without your explicit consent.
                                </p>
                            </div>

                            <h3 className="text-xl font-extrabold text-slate-900 mb-4">Access Requests to Your Records</h3>

                            {isLoading ? (
                                <p className="text-slate-500 font-medium">Loading…</p>
                            ) : patientConsents.length === 0 ? (
                                <EmptyState
                                    icon={<ShieldCheck size={32} />}
                                    title="No Access Requests"
                                    desc="No healthcare provider has requested access to your records yet."
                                />
                            ) : (
                                <div className="grid gap-4">
                                    {patientConsents.map(consent => {
                                        const isActing = actionLoading === consent.id;
                                        return (
                                            <div
                                                key={consent.id}
                                                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-teal-300 transition-colors"
                                            >
                                                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${consent.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" :
                                                            consent.status === "REVOKED" ? "bg-rose-50 text-rose-600" :
                                                                "bg-amber-50 text-amber-600"
                                                            }`}>
                                                            <ShieldCheck size={24} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 text-lg">Dr. {consent.doctorName}</h4>
                                                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                                                <StatusBadge status={consent.status} />
                                                                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                                                                    <Clock3 size={12} />
                                                                    {new Date(consent.requestedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2 flex-wrap">
                                                        {consent.status === "PENDING" && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(consent.id, "APPROVED")}
                                                                    disabled={isActing}
                                                                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-bold transition-colors disabled:opacity-60"
                                                                >
                                                                    <CheckCircle size={16} /> Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(consent.id, "REVOKED")}
                                                                    disabled={isActing}
                                                                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl text-sm font-bold transition-colors disabled:opacity-60"
                                                                >
                                                                    <XCircle size={16} /> Deny
                                                                </button>
                                                            </>
                                                        )}
                                                        {consent.status === "APPROVED" && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(consent.id, "REVOKED")}
                                                                disabled={isActing}
                                                                className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl text-sm font-bold transition-colors disabled:opacity-60"
                                                            >
                                                                <XCircle size={16} /> Revoke Access
                                                            </button>
                                                        )}
                                                        {consent.status === "REVOKED" && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(consent.id, "APPROVED")}
                                                                disabled={isActing}
                                                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-bold transition-colors disabled:opacity-60"
                                                            >
                                                                <CheckCircle size={16} /> Re-approve
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Consent status explanation strip */}
                                                {consent.status === "APPROVED" && (
                                                    <div className="px-5 py-3 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2 text-sm text-emerald-700 font-medium">
                                                        <CheckCircle size={15} className="shrink-0" />
                                                        This doctor can currently view all your uploaded health records.
                                                    </div>
                                                )}
                                                {consent.status === "REVOKED" && (
                                                    <div className="px-5 py-3 bg-rose-50 border-t border-rose-100 flex items-center gap-2 text-sm text-rose-700 font-medium">
                                                        <XCircle size={15} className="shrink-0" />
                                                        Access has been revoked. This doctor can no longer view your records.
                                                    </div>
                                                )}
                                                {consent.status === "PENDING" && (
                                                    <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-2 text-sm text-amber-700 font-medium">
                                                        <Clock3 size={15} className="shrink-0" />
                                                        Awaiting your decision — the doctor cannot view your records until you approve.
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                </div>
            </main>
        </div>
    );
}

function EmptyState({ icon, title, desc }) {
    return (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                {icon}
            </div>
            <h4 className="text-lg font-bold text-slate-900">{title}</h4>
            <p className="text-slate-500 text-sm mt-2">{desc}</p>
        </div>
    );
}
