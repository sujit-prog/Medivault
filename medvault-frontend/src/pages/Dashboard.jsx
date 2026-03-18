import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Home,
  CalendarDays,
  Clock,
  Settings,
  LogOut,
  Search,
  Bell,
  User,
  Activity,
  FileText,
  Pill,
  ShieldPlus,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  Plus,
  Menu,
  X
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Patient");
  const initialRole = (localStorage.getItem("role") || "PATIENT").toUpperCase();
  const [userRole, setUserRole] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(true);
  const [dataTimedOut, setDataTimedOut] = useState(false);
  const [slowWarning, setSlowWarning] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role") || "PATIENT";
        setUserRole(role.toUpperCase());

        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const namePart = payload.sub.split('@')[0];
            setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
          } catch (e) {
            console.error("Token decode failed", e);
          }
        }

        const currentRole = (localStorage.getItem("role") || "PATIENT").toUpperCase();
        const appointmentEndpoint = currentRole === "PATIENT" ? "/appointments/patient" : "/appointments/doctor";

        // Fetch all data concurrently
        const [notifRes, aptRes, recRes] = await Promise.allSettled([
          api.get("/notifications/unread"),
          api.get(appointmentEndpoint),
          api.get("/records")
        ]);

        if (isMounted) {
          if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data || []);
          if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data || []);
          if (recRes.status === 'fulfilled') setRecordsCount(recRes.value.data?.length || 0);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        // Only clear loading state here if we didn't already timeout
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();

    // After 3s still loading → show a gentle "server is waking up" hint
    const slowHintId = setTimeout(() => {
      if (isMounted) setSlowWarning(true);
    }, 3000);

    // Hard bail-out after 8s so users aren't stuck forever
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn("Dashboard data fetch timed out");
        setDataTimedOut(true);
        setIsLoading(false);
      }
    }, 8000);

    return () => {
      isMounted = false;
      clearTimeout(slowHintId);
      clearTimeout(timeoutId);
    };
  }, []);

  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.appointmentTime) > new Date() && a.status !== "CANCELLED"
  ).sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));

  const nextApt = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

  const markNotificationAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading dashboard…</p>
          {slowWarning && (
            <div className="mt-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl max-w-xs">
              <p className="text-amber-800 text-sm font-semibold">
                ⏳ The server is waking up — this only happens once and takes ~15 s.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">

      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <img src="/favicon.png" alt="MediVault Logo" className="w-10 h-10 drop-shadow-md" />
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight">MediVault</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {userRole === 'PATIENT' ? 'Patient Portal' : 'Doctor Portal'}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-bold transition-colors">
            <Home size={20} />
            <span>Overview</span>
          </Link>
          <Link to="/appointments" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
            <CalendarDays size={20} />
            <span>Appointments</span>
          </Link>

          {userRole !== 'PATIENT' && (
            <Link to="/availability" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
              <Clock size={20} />
              <span>Availability</span>
            </Link>
          )}

          <Link to="/records" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
            <FileText size={20} />
            <span>{userRole === 'PATIENT' ? 'Health Records' : 'Patient Records'}</span>
          </Link>
          <Link to="/prescriptions" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
            <Pill size={20} />
            <span>Prescriptions</span>
          </Link>
          <Link to="/consents" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
            <ShieldPlus size={20} />
            <span>Data Consents</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
            <User size={20} />
            <span>My Profile</span>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-6 sm:px-10 h-16 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              <Menu size={20} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <ShieldPlus size={16} />
            </div>
            <h1 className="font-bold text-slate-900">MediVault</h1>
          </div>

          <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500" size={18} />
            <input
              type="text"
              placeholder="Search doctors, records, or tests..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4">
                  <h3 className="font-bold text-slate-900 mb-3">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No new notifications</p>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                      {notifications.map(n => (
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

            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="hidden sm:block text-right">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${userRole === 'PATIENT' ? 'bg-teal-50 text-teal-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                    {userRole === 'PATIENT' ? 'Patient' : 'Doctor'}
                  </span>
                  <p className="text-sm font-bold text-slate-900 leading-none">{userName}</p>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Free Plan</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center border-2 border-white shadow-sm">
                <User size={18} />
              </div>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full space-y-8">

          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Good morning, {userName}.</h2>
              <p className="text-slate-500 font-medium mt-1">Here is a summary of your health dashboard for today.</p>
              {dataTimedOut && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-800 text-sm font-bold flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    Server is waking up. Some data may be missing. Please refresh in a minute.
                  </p>
                </div>
              )}
            </div>
            <Link to="/appointments" className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
              <Plus size={16} />
              <span>{userRole === 'PATIENT' ? 'Book Appointment' : 'View Schedule'}</span>
            </Link>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Metric 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CalendarDays size={80} className="text-teal-600 -mt-4 -mr-4" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <CalendarDays size={20} />
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1">Upcoming Visits</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900">{upcomingAppointments.length}</h3>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">Scheduled</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Pill size={80} className="text-blue-600 -mt-4 -mr-4" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Pill size={20} />
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1">Active Prescriptions</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900">3</h3>
                <span className="text-xs font-bold text-slate-400">1 expiring soon</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity size={80} className="text-rose-600 -mt-4 -mr-4" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <Activity size={20} />
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1">Vital Trends</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900">Stable</h3>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <TrendingUp size={12} /> Normal
                </span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText size={80} className="text-indigo-600 -mt-4 -mr-4" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <FileText size={20} />
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1">{userRole === 'PATIENT' ? 'Health Records' : 'Cases Managed'}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900">{recordsCount}</h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{userRole === 'PATIENT' ? 'Uploaded' : 'Total'}</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Next Appointment Card */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900">Upcoming Visit</h3>
                <Link to="/appointments" className="text-sm font-bold text-teal-600 hover:text-teal-700 hover:underline">View all</Link>
              </div>

              {nextApt ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-64 bg-teal-500/5 -skew-x-12 transform translate-x-10 pointer-events-none"></div>

                  <div className="bg-teal-50 p-4 rounded-2xl shrink-0 text-center w-28 border border-teal-100/50">
                    <span className="block text-teal-600 font-bold uppercase text-xs tracking-wider mb-1">
                      {new Date(nextApt.appointmentTime).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="block text-teal-700 font-black text-4xl leading-none">
                      {new Date(nextApt.appointmentTime).getDate()}
                    </span>
                    <span className="block text-teal-600/80 font-bold text-xs mt-2">
                      {new Date(nextApt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex-1 text-center sm:text-left z-10">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg mb-3">
                      {nextApt.type || "General Checkup"}
                    </span>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">
                      {nextApt.doctor?.name || nextApt.doctor?.email || "Unknown Doctor"}
                    </h4>
                    <p className="text-slate-500 text-sm font-medium mb-4">MedVault General Hospital</p>

                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                      <Link to="/appointments" className="px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-teal-700 transition-colors">Manage</Link>
                      <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors">Prepare for visit</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center h-48">
                  <p className="text-slate-500 font-medium mb-4">No upcoming visits scheduled.</p>
                  <Link to="/appointments" className="px-5 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-teal-700 transition-colors">Book an Appointment</Link>
                </div>
              )}
            </div>

            {/* Quick Actions / Recent Activity */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900">Quick Actions</h3>

              <div className="bg-white border border-slate-200 rounded-3xl p-2 shadow-sm">

                <Link to="/appointments" className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer border-b border-slate-100 last:border-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <CalendarDays size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">{userRole === 'PATIENT' ? 'Schedule Appointment' : 'Review Appointments'}</h4>
                    <p className="text-xs text-slate-500 font-medium">{userRole === 'PATIENT' ? 'Find a doctor and book' : 'Manage your calendar'}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </Link>

                {userRole !== 'PATIENT' && (
                  <Link to="/availability" className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer border-b border-slate-100 last:border-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Clock size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm">Manage Availability</h4>
                      <p className="text-xs text-slate-500 font-medium">Doctor tools</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </Link>
                )}

                <Link to="/prescriptions" className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer border-b border-slate-100 last:border-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Pill size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">{userRole === 'PATIENT' ? 'View Prescriptions' : 'Issue Prescription'}</h4>
                    <p className="text-xs text-slate-500 font-medium">{userRole === 'PATIENT' ? 'View your medicines' : 'Prescribe to a patient'}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </Link>

              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl h-full animate-in slide-in-from-left">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                  <ShieldPlus size={20} />
                </div>
                <h1 className="font-bold text-lg text-slate-900">MediVault</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-bold transition-colors">
                <Home size={20} />
                <span>Overview</span>
              </Link>
              <Link to="/appointments" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                <CalendarDays size={20} />
                <span>Appointments</span>
              </Link>
              {userRole !== 'PATIENT' && (
                <Link to="/availability" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                  <Clock size={20} />
                  <span>Availability</span>
                </Link>
              )}
              <Link to="/records" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                <FileText size={20} />
                <span>{userRole === 'PATIENT' ? 'Health Records' : 'Patient Records'}</span>
              </Link>
              <Link to="/prescriptions" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                <Pill size={20} />
                <span>Prescriptions</span>
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                <User size={20} />
                <span>My Profile</span>
              </Link>
            </nav>
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