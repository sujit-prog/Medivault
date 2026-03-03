import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  CalendarDays,
  Clock,
  User,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock4,
  ArrowLeft,
  CalendarPlus
} from "lucide-react";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [activeFeedbackId, setActiveFeedbackId] = useState(null);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({ doctorId: "", date: "", time: "" });
  const [isBooking, setIsBooking] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/appointments/patient");
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      if (newStatus === "CANCELLED") {
        await API.put(`/appointments/reject/${id}`);
      }
      fetchAppointments();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleSubmitFeedback = async (id) => {
    if (!feedbackInput.trim()) return;
    try {
      await API.put(`/appointments/feedback/${id}`, feedbackInput, {
        headers: { "Content-Type": "text/plain" }
      });
      setActiveFeedbackId(null);
      setFeedbackInput("");
      fetchAppointments();
      alert("Feedback submitted successfully!");
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsBooking(true);
      const startDateTime = new Date(`${bookingData.date}T${bookingData.time}`);

      const payload = {
        doctor: { id: parseInt(bookingData.doctorId) },
        appointmentTime: startDateTime.toISOString()
      };

      await API.post("/appointments/book", payload);
      setShowBookingModal(false);
      setBookingData({ doctorId: "", date: "", time: "" });
      fetchAppointments();
      alert("Appointment successfully booked!");
    } catch (err) {
      console.error("Booking failed", err);
      alert("Failed to book appointment.");
    } finally {
      setIsBooking(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'Completed' };
      case 'CANCELLED': return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', text: 'Cancelled' };
      default: return { icon: Clock4, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', text: 'Scheduled' };
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-teal-200"
          >
            <CalendarPlus size={16} />
            <span className="hidden sm:inline">Book New</span>
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by provider, date or condition..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm shadow-sm"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold shadow-sm">
              <Filter size={16} className="text-slate-400" />
              <span>Filter</span>
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="text-sm font-medium text-slate-500 animate-pulse">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
              <CalendarDays size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No appointments found</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">You don't have any upcoming or past appointments in your record.</p>
            <button className="text-teal-600 font-semibold text-sm hover:underline">Book your first appointment</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {appointments.map((apt, index) => {
                const conf = getStatusConfig(apt.status);
                const StatusIcon = conf.icon;
                return (
                  <div key={apt.id || index} className="flex flex-col">
                    <div className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors group flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="sm:w-48 flex-shrink-0">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1">
                          <CalendarDays size={16} className="text-slate-400" />
                          {formatDate(apt.appointmentTime)}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm ml-6">
                          <Clock size={14} />
                          {formatTime(apt.appointmentTime)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            <User size={16} />
                          </div>
                          <div className="truncate">
                            <h4 className="font-bold text-sm text-slate-900 truncate">
                              {apt.doctor?.name || apt.doctor?.email || "Unknown Provider"}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">
                              {apt.type || "General Consultation"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 mt-2 sm:mt-0">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${conf.color} ${conf.bg} ${conf.border}`}>
                          <StatusIcon size={12} strokeWidth={3} />
                          {conf.text}
                        </div>
                        <div className="flex gap-2 text-xs font-bold">
                          {apt.status === "BOOKED" && (
                            <button onClick={() => handleStatusUpdate(apt.id, "CANCELLED")} className="text-rose-600 hover:text-rose-700 hover:underline">Cancel</button>
                          )}
                          {apt.status === "COMPLETED" && !apt.feedback && activeFeedbackId !== apt.id && (
                            <button onClick={() => setActiveFeedbackId(apt.id)} className="text-teal-600 hover:text-teal-700 hover:underline">Leave Feedback</button>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Inline Feedback Form */}
                    {activeFeedbackId === apt.id && (
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                        <input
                          type="text"
                          value={feedbackInput}
                          onChange={e => setFeedbackInput(e.target.value)}
                          placeholder="How was your consultation?"
                          className="flex-1 p-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                        <button onClick={() => handleSubmitFeedback(apt.id)} className="px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors">Submit</button>
                        <button onClick={() => setActiveFeedbackId(null)} className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-300 transition-colors">Cancel</button>
                      </div>
                    )}
                    {apt.feedback && (
                      <div className="p-3 bg-slate-50 border-t border-slate-100 text-sm text-slate-600 italic">
                        "{apt.feedback}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Book Appointment</h2>
                <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleBookSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Doctor ID</label>
                  <input
                    type="number"
                    required
                    value={bookingData.doctorId}
                    onChange={e => setBookingData({ ...bookingData, doctorId: e.target.value })}
                    placeholder="e.g. 2"
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={bookingData.date}
                      onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
                    <input
                      type="time"
                      required
                      value={bookingData.time}
                      onChange={e => setBookingData({ ...bookingData, time: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowBookingModal(false)} className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isBooking} className="flex-1 py-3 text-white font-bold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl transition-colors">
                    {isBooking ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}