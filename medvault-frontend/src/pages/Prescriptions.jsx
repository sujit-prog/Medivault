import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
    Home, CalendarDays, Clock, Settings, LogOut, Search, Bell,
    User, FileText, Pill, ShieldPlus, Menu, X, Plus, ChevronRight,
    Send, Image, Loader2, AlertCircle, CheckCircle2, ClipboardList,
    Stethoscope, ChevronDown
} from "lucide-react";

export default function Prescriptions() {
    const navigate = useNavigate();
    const userRole = (localStorage.getItem("role") || "PATIENT").toUpperCase();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // ── Doctor state ───────────────────────────────────────────
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [medicines, setMedicines] = useState("");
    const [notes, setNotes] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [sentPrescriptions, setSentPrescriptions] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: null, message: "" });

    // ── Patient state ──────────────────────────────────────────
    const [myPrescriptions, setMyPrescriptions] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (userRole === "PATIENT") {
                    const res = await api.get("/prescriptions/my");
                    setMyPrescriptions(res.data || []);
                } else {
                    // Doctor: load appointments to derive unique patients, plus sent list
                    const [aptRes, sentRes, notifRes] = await Promise.allSettled([
                        api.get("/appointments/doctor"),
                        api.get("/prescriptions/sent"),
                        api.get("/notifications/unread"),
                    ]);
                    if (aptRes.status === "fulfilled") {
                        const apts = aptRes.value.data || [];
                        // Unique patients from appointments
                        const seen = new Set();
                        const uniquePatients = [];
                        apts.forEach((a) => {
                            if (a.patient && !seen.has(a.patient.id)) {
                                seen.add(a.patient.id);
                                uniquePatients.push(a.patient);
                            }
                        });
                        setPatients(uniquePatients);
                    }
                    if (sentRes.status === "fulfilled") setSentPrescriptions(sentRes.value.data || []);
                    if (notifRes.status === "fulfilled") setNotifications(notifRes.value.data || []);
                }
            } catch (err) {
                console.error("Failed to load prescription data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userRole]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatientId) {
            setSubmitStatus({ type: "error", message: "Please select a patient." });
            return;
        }
        if (!medicines.trim() && !imageFile) {
            setSubmitStatus({ type: "error", message: "Please enter medicines or upload a prescription image." });
            return;
        }
        setSubmitting(true);
        setSubmitStatus({ type: null, message: "" });
        try {
            const formData = new FormData();
            formData.append("patientId", selectedPatientId);
            if (medicines.trim()) formData.append("medicines", medicines);
            if (notes.trim()) formData.append("notes", notes);
            if (imageFile) formData.append("image", imageFile);

            const res = await api.post("/prescriptions", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setSentPrescriptions((prev) => [res.data, ...prev]);
            setMedicines("");
            setNotes("");
            setImageFile(null);
            setImagePreview(null);
            setSelectedPatientId("");
            setSubmitStatus({ type: "success", message: "Prescription sent successfully!" });
        } catch (err) {
            setSubmitStatus({
                type: "error",
                message: err.response?.data || "Failed to send prescription.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const markNotificationAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch { }
    };

    /**
     * Fetch the prescription image via axios (sends JWT automatically),
     * create a temporary blob URL, and open it in a new tab.
     * This avoids the 403 that plain <a href> links get because browsers
     * don't add the Authorization header to navigation requests.
     */
    const [loadingImageId, setLoadingImageId] = React.useState(null);
    const handleViewImage = async (prescriptionId) => {
        setLoadingImageId(prescriptionId);
        try {
            const res = await api.get(`/prescriptions/${prescriptionId}/image`, {
                responseType: "blob",
            });
            const blobUrl = URL.createObjectURL(res.data);
            window.open(blobUrl, "_blank");
        } catch (err) {
            alert("Could not load the image. Please try again.");
        } finally {
            setLoadingImageId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const formatDate = (dt) =>
        dt ? new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

    const SidebarLink = ({ to, icon: Icon, label, active }) => (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${active
                ? "bg-teal-50 text-teal-700"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
        >
            <Icon size={20} />
            <span>{label}</span>
        </Link>
    );

    const Sidebar = ({ mobile = false }) => (
        <nav className={`${mobile ? "flex-1 px-4 space-y-1 mt-4 overflow-y-auto" : "flex-1 px-4 space-y-1 mt-4"}`}>
            <SidebarLink to="/dashboard" icon={Home} label="Overview" />
            <SidebarLink to="/appointments" icon={CalendarDays} label="Appointments" />
            {userRole !== "PATIENT" && (
                <SidebarLink to="/availability" icon={Clock} label="Availability" />
            )}
            <SidebarLink to="/records" icon={FileText} label={userRole === "PATIENT" ? "Health Records" : "Patient Records"} />
            <SidebarLink to="/prescriptions" icon={Pill} label="Prescriptions" active />
            <SidebarLink to="/consents" icon={ShieldPlus} label="Data Consents" />
            <SidebarLink to="/profile" icon={User} label="My Profile" />
        </nav>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading prescriptions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
                <div className="p-6 flex items-center gap-3">
                    <img src="/favicon.png" alt="MediVault Logo" className="w-10 h-10 drop-shadow-md" />
                    <div>
                        <h1 className="font-bold text-lg text-slate-900 leading-tight">MediVault</h1>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {userRole === "PATIENT" ? "Patient Portal" : "Provider Portal"}
                        </p>
                    </div>
                </div>
                <Sidebar />
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-6 sm:px-10 h-16 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl">
                            <Menu size={20} />
                        </button>
                        <img src="/favicon.png" alt="MediVault" className="w-7 h-7" />
                        <h1 className="font-bold text-slate-900">MediVault</h1>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 text-slate-900">
                        <Pill size={20} className="text-teal-600" />
                        <h2 className="font-bold text-lg">Prescriptions</h2>
                    </div>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                                <Bell size={20} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4">
                                    <h3 className="font-bold text-slate-900 mb-3">Notifications</h3>
                                    {notifications.length === 0 ? (
                                        <p className="text-sm text-slate-500 text-center py-4">No new notifications</p>
                                    ) : (
                                        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                                            {notifications.map((n) => (
                                                <div key={n.id} className="p-3 bg-slate-50 rounded-xl text-sm flex gap-2">
                                                    <div className="flex-1 text-slate-700">{n.message}</div>
                                                    <button onClick={() => markNotificationAsRead(n.id)} className="text-teal-600 font-bold self-end text-xs">Mark Read</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">

                    {/* ── DOCTOR VIEW ─────────────────────────────────────── */}
                    {userRole !== "PATIENT" && (
                        <>
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Issue a Prescription</h2>
                                <p className="text-slate-500 font-medium mt-1">Select a patient and provide medicines text and/or a prescription image.</p>
                            </div>

                            {/* Create Prescription Form */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Patient Select */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Patient</label>
                                        <div className="relative">
                                            <select
                                                value={selectedPatientId}
                                                onChange={(e) => setSelectedPatientId(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-900 appearance-none cursor-pointer"
                                            >
                                                <option value="">— Choose a patient —</option>
                                                {patients.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.email || p.name || `Patient #${p.id}`}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                        {patients.length === 0 && (
                                            <p className="text-xs text-amber-600 font-medium mt-1 px-1">
                                                No patients found. Patients appear here after you have a confirmed appointment with them.
                                            </p>
                                        )}
                                    </div>

                                    {/* Medicines */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medicines & Dosage</label>
                                        <textarea
                                            value={medicines}
                                            onChange={(e) => setMedicines(e.target.value)}
                                            rows={4}
                                            placeholder={"e.g.\n1. Paracetamol 500mg – 1 tab thrice daily after meals\n2. Cetirizine 10mg – 1 tab at bedtime"}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-900 placeholder:text-slate-400 resize-none leading-relaxed"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Additional Notes (Optional)</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={2}
                                            placeholder="e.g. Take plenty of fluids. Follow up in 5 days."
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-900 placeholder:text-slate-400 resize-none"
                                        />
                                    </div>

                                    {/* Image Upload */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prescription Image (Optional)</label>
                                        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl p-6 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all group">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="max-h-48 rounded-xl object-contain" />
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                                                        <Image size={22} className="text-slate-400 group-hover:text-teal-600" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-bold text-slate-700">Click to upload</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, PDF up to 50MB</p>
                                                    </div>
                                                </>
                                            )}
                                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleImageChange} />
                                        </label>
                                        {imageFile && (
                                            <div className="flex items-center justify-between px-3 py-2 bg-teal-50 rounded-xl border border-teal-100">
                                                <span className="text-xs font-semibold text-teal-700 truncate">{imageFile.name}</span>
                                                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-xs text-rose-500 font-bold ml-3 shrink-0">Remove</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Feedback */}
                                    {submitStatus.message && (
                                        <div className={`flex items-start gap-2 p-3.5 rounded-xl text-xs font-semibold ${submitStatus.type === "success"
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                            : "bg-rose-50 text-rose-700 border border-rose-100"
                                            }`}>
                                            <div className="mt-0.5 shrink-0">
                                                {submitStatus.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                            </div>
                                            <span>{submitStatus.message}</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full h-12 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-bold rounded-2xl shadow-lg shadow-teal-200 transition-all active:scale-[0.98]"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /><span>Send Prescription</span></>}
                                    </button>
                                </form>
                            </div>

                            {/* Sent Prescriptions */}
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 mb-4">Sent Prescriptions</h3>
                                {sentPrescriptions.length === 0 ? (
                                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 text-center">
                                        <p className="text-slate-400 font-medium">No prescriptions sent yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {sentPrescriptions.map((p) => (
                                            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start gap-4 shadow-sm">
                                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                                    <ClipboardList size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm">{p.patientEmail}</p>
                                                            <p className="text-xs text-slate-400 font-medium mt-0.5">{formatDate(p.createdAt)}</p>
                                                        </div>
                                                        {p.imageUrl && (
                                                            <button
                                                                onClick={() => handleViewImage(p.id)}
                                                                disabled={loadingImageId === p.id}
                                                                className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors shrink-0">
                                                                {loadingImageId === p.id ? <Loader2 size={13} className="animate-spin" /> : <Image size={13} />} View Image
                                                            </button>
                                                        )}
                                                    </div>
                                                    {p.medicines && (
                                                        <p className="text-xs text-slate-600 mt-2 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-xl">{p.medicines}</p>
                                                    )}
                                                    {p.notes && (
                                                        <p className="text-xs text-slate-500 mt-1 italic">{p.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ── PATIENT VIEW ────────────────────────────────────── */}
                    {userRole === "PATIENT" && (
                        <>
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Prescriptions</h2>
                                <p className="text-slate-500 font-medium mt-1">Prescriptions issued to you by your doctors.</p>
                            </div>

                            {myPrescriptions.length === 0 ? (
                                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                        <Pill size={32} className="text-slate-300" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">No prescriptions yet</p>
                                        <p className="text-sm text-slate-400 font-medium mt-1">Your doctor will send prescriptions here after your appointment.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myPrescriptions.map((p) => (
                                        <div key={p.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                        <Stethoscope size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">Dr. {p.doctorEmail.split("@")[0]}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{formatDate(p.createdAt)}</p>
                                                    </div>
                                                </div>
                                                {p.imageUrl && (
                                                    <button
                                                        onClick={() => handleViewImage(p.id)}
                                                        disabled={loadingImageId === p.id}
                                                        className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 disabled:opacity-60 px-4 py-2 rounded-xl transition-colors"
                                                    >
                                                        {loadingImageId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />}
                                                        View Prescription Image
                                                    </button>
                                                )}
                                            </div>

                                            {/* Medicines */}
                                            {p.medicines && (
                                                <div className="bg-slate-50 rounded-2xl p-4 mb-3">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prescribed Medicines</p>
                                                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{p.medicines}</p>
                                                </div>
                                            )}

                                            {/* Notes */}
                                            {p.notes && (
                                                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Doctor's Notes</p>
                                                    <p className="text-sm text-slate-700 italic">{p.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl h-full">
                        <div className="p-6 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <img src="/favicon.png" alt="MediVault" className="w-9 h-9" />
                                <h1 className="font-bold text-lg text-slate-900">MediVault</h1>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>
                        <Sidebar mobile />
                        <div className="p-4 border-t border-slate-100">
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-rose-500 hover:bg-rose-50 rounded-xl font-bold transition-colors">
                                <LogOut size={20} />
                                <span>Log Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
