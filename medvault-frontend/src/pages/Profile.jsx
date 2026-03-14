import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ShieldPlus, Home, CalendarDays, Clock, FileText, ShieldCheck,
    Settings, LogOut, User, Stethoscope, Pencil, CheckCircle2, X,
    Phone, MapPin, Calendar, Droplet, Building2, BadgeCheck, ChevronRight
} from "lucide-react";
import api from "../services/api";

export default function Profile() {
    const navigate = useNavigate();
    const userRole = (localStorage.getItem("role") || "PATIENT").toUpperCase();
    const isPatient = userRole === "PATIENT";

    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const res = await api.get("/profile");
            setProfile(res.data);
            setForm(flattenProfile(res.data));
        } catch (err) {
            console.error("Failed to load profile", err);
        } finally {
            setIsLoading(false);
        }
    };

    const flattenProfile = (data) => {
        if (!data) return {};
        return {
            fullName: data.fullName || "",
            dob: data.dob || "",
            gender: data.gender || "",
            bloodGroup: data.bloodGroup || "",
            phone: data.phone || "",
            address: data.address || "",
            organizationName: data.organizationName || "",
            specialization: data.specialization || "",
            licenseNumber: data.licenseNumber || "",
        };
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put("/profile", form);
            setProfile(res.data);
            setForm(flattenProfile(res.data));
            setEditing(false);
        } catch (err) {
            console.error("Failed to save profile", err);
        } finally {
            setSaving(false);
        }
    };

    const Field = ({ icon: Icon, label, value, field, type = "text", options }) => (
        <div className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                {editing ? (
                    options ? (
                        <select
                            value={form[field] || ""}
                            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                            className="w-full p-2 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                        >
                            <option value="">— select —</option>
                            {options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ) : (
                        <input
                            type={type}
                            value={form[field] || ""}
                            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                            className="w-full p-2 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            placeholder={`Enter ${label.toLowerCase()}...`}
                        />
                    )
                ) : (
                    <p className="text-sm font-semibold text-slate-800">{value || <span className="text-slate-400 italic">Not set</span>}</p>
                )}
            </div>
        </div>
    );

    const navLinks = [
        { to: "/dashboard", icon: Home, label: "Overview" },
        { to: "/appointments", icon: CalendarDays, label: "Appointments" },
        ...(userRole !== "PATIENT" ? [{ to: "/availability", icon: Clock, label: "Availability" }] : []),
        { to: "/records", icon: FileText, label: isPatient ? "Health Records" : "Patient Records" },
        { to: "/consents", icon: ShieldCheck, label: "Data Consents" },
        { to: "/profile", icon: User, label: "My Profile", active: true },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
                <div className="p-6 flex items-center gap-3">
                    <img src="/favicon.png" alt="MediVault Logo" className="w-10 h-10 drop-shadow-md" />
                    <div>
                        <h1 className="font-bold text-lg text-slate-900 leading-tight">MediVault</h1>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {isPatient ? "Patient Portal" : "Provider Portal"}
                        </p>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {navLinks.map(({ to, icon: Icon, label, active }) => (
                        <Link key={to} to={to}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${active ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
                            <Icon size={20} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                        <Settings size={20} /><span>Settings</span>
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-rose-500 hover:bg-rose-50 rounded-xl font-bold transition-colors mt-1">
                        <LogOut size={20} /><span>Log Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-6 sm:px-10 h-16 flex items-center justify-between shrink-0">
                    <h2 className="font-bold text-xl text-slate-900">{isPatient ? "Patient Profile" : "Professional Profile"}</h2>
                    {!editing ? (
                        <button onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors">
                            <Pencil size={15} /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-70">
                                <CheckCircle2 size={15} /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button onClick={() => { setEditing(false); setForm(flattenProfile(profile)); }}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-300 transition-colors">
                                <X size={15} /> Cancel
                            </button>
                        </div>
                    )}
                </header>

                <div className="p-6 sm:p-10 max-w-4xl mx-auto w-full space-y-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* Avatar + Summary */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-48 h-48 bg-teal-500/5 rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-teal-200 shrink-0">
                                    {isPatient ? <User size={40} /> : <Stethoscope size={40} />}
                                </div>
                                <div className="text-center sm:text-left z-10">
                                    <h3 className="text-2xl font-extrabold text-slate-900">
                                        {(isPatient ? profile?.fullName : profile?.organizationName) || "Complete your profile"}
                                    </h3>
                                    <p className="text-slate-500 font-medium mt-1">
                                        {isPatient
                                            ? `${profile?.gender || "—"} • ${profile?.bloodGroup || "Blood type unknown"}`
                                            : `${profile?.specialization || "Specialization not set"} • ${profile?.licenseNumber || "No license #"}`
                                        }
                                    </p>
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPatient ? "bg-teal-50 text-teal-700" : "bg-indigo-50 text-indigo-700"}`}>
                                        {isPatient ? "Patient" : "Healthcare Professional"}
                                    </span>
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    {isPatient ? <User size={18} className="text-teal-600" /> : <Stethoscope size={18} className="text-indigo-600" />}
                                    {isPatient ? "Personal Information" : "Professional Information"}
                                </h4>
                                <div className="divide-y divide-slate-100">
                                    {isPatient ? (
                                        <>
                                            <Field icon={User} label="Full Name" value={profile?.fullName} field="fullName" />
                                            <Field icon={Calendar} label="Date of Birth" value={profile?.dob} field="dob" type="date" />
                                            <Field icon={User} label="Gender" value={profile?.gender} field="gender"
                                                options={["Male", "Female", "Non-binary", "Prefer not to say"]} />
                                            <Field icon={Droplet} label="Blood Group" value={profile?.bloodGroup} field="bloodGroup"
                                                options={["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"]} />
                                            <Field icon={Phone} label="Phone Number" value={profile?.phone} field="phone" type="tel" />
                                            <Field icon={MapPin} label="Address" value={profile?.address} field="address" />
                                        </>
                                    ) : (
                                        <>
                                            <Field icon={Building2} label="Hospital / Organization" value={profile?.organizationName} field="organizationName" />
                                            <Field icon={Stethoscope} label="Specialization" value={profile?.specialization} field="specialization"
                                                options={["General Practice", "Cardiology", "Dermatology", "Neurology", "Orthopedics", "Pediatrics", "Psychiatry", "Radiology", "Surgery", "Other"]} />
                                            <Field icon={BadgeCheck} label="License Number" value={profile?.licenseNumber} field="licenseNumber" />
                                            <Field icon={Phone} label="Phone Number" value={profile?.phone} field="phone" type="tel" />
                                            <Field icon={MapPin} label="Address / Clinic" value={profile?.address} field="address" />
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-2">
                                <h4 className="font-bold text-slate-900 px-4 pt-3 pb-2">Quick Links</h4>
                                {[
                                    { to: "/records", icon: FileText, label: isPatient ? "View Health Records" : "View Patient Records", color: "text-indigo-600 bg-indigo-50" },
                                    { to: "/appointments", icon: CalendarDays, label: isPatient ? "Manage Appointments" : "Review Appointments", color: "text-teal-600 bg-teal-50" },
                                    { to: "/consents", icon: ShieldCheck, label: "Manage Data Consents", color: "text-amber-600 bg-amber-50" },
                                ].map(({ to, icon: Icon, label, color }) => (
                                    <Link key={to} to={to}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${color}`}>
                                            <Icon size={18} />
                                        </div>
                                        <span className="flex-1 font-bold text-sm text-slate-900">{label}</span>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
