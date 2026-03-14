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
  const [ratingInput, setRatingInput] = useState(0);
  const [activeFeedbackId, setActiveFeedbackId] = useState(null);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [isFetchingDoctors, setIsFetchingDoctors] = useState(false);
  const [isFetchingAvailability, setIsFetchingAvailability] = useState(false);

  const userRole = localStorage.getItem("role")?.toUpperCase() || "PATIENT";

  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const url = userRole === "PATIENT" ? "/appointments/patient" : "/appointments/doctor";
      const res = await API.get(url);
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setIsFetchingDoctors(true);
      const res = await API.get("/users/doctors");
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setIsFetchingDoctors(false);
    }
  };

  const fetchAvailability = async (doctorId) => {
    if (!doctorId) {
      setAvailableSlots([]);
      return;
    }
    try {
      setIsFetchingAvailability(true);
      const res = await API.get(`/availability/doctor/${doctorId}`);
      console.log(`DEBUG: fetchAvailability for Doctor ID ${doctorId}:`, res.data);
      setAvailableSlots(res.data || []);
    } catch (err) {
      console.error("Failed to fetch availability:", err);
    } finally {
      setIsFetchingAvailability(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      if (newStatus === "CANCELLED" || newStatus === "REJECTED") {
        await API.put(`/appointments/reject/${id}`);
      } else if (newStatus === "APPROVED") {
        await API.put(`/appointments/approve/${id}`);
      }
      fetchAppointments();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleSubmitFeedback = async (id) => {
    if (!feedbackInput.trim()) { alert("Please write a comment."); return; }
    if (!ratingInput) { alert("Please select a star rating."); return; }
    try {
      await API.put(`/appointments/feedback/${id}`, { feedback: feedbackInput, rating: ratingInput });
      setActiveFeedbackId(null);
      setFeedbackInput("");
      setRatingInput(0);
      fetchAppointments();
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlotId) {
      alert("Please select a time slot.");
      return;
    }

    try {
      setIsBooking(true);
      const slot = availableSlots.find(s => s.id === parseInt(selectedSlotId));
      if (!slot) return;

      const payload = {
        doctor: { id: parseInt(selectedDoctorId) },
        appointmentTime: slot.startTime,
        availabilityId: slot.id
      };

      await API.post("/appointments/book", payload);
      setShowBookingModal(false);
      setSelectedDoctorId("");
      setSelectedSlotId("");
      setAvailableSlots([]);
      fetchAppointments();
      alert("Appointment request sent! Awaiting doctor approval.");
    } catch (err) {
      console.error("Booking failed", err);
      alert("Failed to book appointment.");
    } finally {
      setIsBooking(false);
    }
  };

  const isPending = (status) => ['PENDING', 'BOOKED'].includes(status?.toUpperCase());

  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'Approved' };
      case 'REJECTED': return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', text: 'Rejected' };
      case 'CANCELLED': return { icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', text: 'Cancelled' };
      case 'PENDING':
      case 'BOOKED': return { icon: Clock4, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', text: 'Pending Approval' };
      default: return { icon: Clock4, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', text: status || 'Unknown' };
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
          {userRole === 'PATIENT' && (
            <button
              onClick={() => {
                fetchDoctors();
                setShowBookingModal(true);
              }}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-teal-200"
            >
              <CalendarPlus size={16} />
              <span className="hidden sm:inline">Book New</span>
            </button>
          )}
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
                          {/* Doctor actions */}
                          {userRole !== 'PATIENT' && isPending(apt.status) && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(apt.id, "APPROVED")}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(apt.id, "REJECTED")}
                                className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {userRole !== 'PATIENT' && apt.status === 'APPROVED' && (
                            <button
                              onClick={() => handleStatusUpdate(apt.id, "CANCELLED")}
                              className="text-slate-500 hover:text-slate-700 hover:underline"
                            >
                              Cancel
                            </button>
                          )}

                          {/* Patient actions */}
                          {userRole === 'PATIENT' && (isPending(apt.status) || apt.status === 'APPROVED') && (
                            <button
                              onClick={() => handleStatusUpdate(apt.id, "CANCELLED")}
                              className="text-rose-600 hover:text-rose-700 hover:underline"
                            >
                              Cancel
                            </button>
                          )}
                          {apt.status === 'APPROVED' && !apt.feedback && activeFeedbackId !== apt.id && userRole === 'PATIENT' && (
                            <button onClick={() => setActiveFeedbackId(apt.id)} className="text-teal-600 hover:text-teal-700 hover:underline">Leave Feedback</button>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Feedback Form */}
                    {activeFeedbackId === apt.id && (
                      <div className="p-5 bg-gradient-to-br from-teal-50 to-slate-50 border-t border-slate-100">
                        <h4 className="text-sm font-bold text-slate-800 mb-3">Rate your consultation</h4>
                        {/* Star Rating */}
                        <div className="flex gap-1.5 mb-4">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingInput(star)}
                              className={`text-2xl transition-transform hover:scale-110 ${star <= ratingInput ? 'text-amber-400' : 'text-slate-300'
                                }`}
                            >
                              ★
                            </button>
                          ))}
                          {ratingInput > 0 && (
                            <span className="ml-2 self-center text-xs font-semibold text-slate-500">
                              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][ratingInput]}
                            </span>
                          )}
                        </div>
                        {/* Comment */}
                        <textarea
                          rows={3}
                          value={feedbackInput}
                          onChange={e => setFeedbackInput(e.target.value)}
                          placeholder="Share details about your experience (optional but helpful)..."
                          className="w-full p-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 resize-none bg-white"
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleSubmitFeedback(apt.id)}
                            className="flex-1 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors"
                          >
                            Submit Feedback
                          </button>
                          <button
                            onClick={() => { setActiveFeedbackId(null); setFeedbackInput(""); setRatingInput(0); }}
                            className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Submitted Feedback Display */}
                    {apt.feedback && (
                      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-start gap-3">
                        <div className="flex-1">
                          {apt.rating && (
                            <div className="flex items-center gap-1 mb-1">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} className={`text-base ${s <= apt.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                              ))}
                              <span className="ml-1 text-xs font-semibold text-slate-400">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][apt.rating]}</span>
                            </div>
                          )}
                          <p className="text-sm text-slate-600 italic">"{apt.feedback}"</p>
                        </div>
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
                  <label className="block text-sm font-bold text-slate-700 mb-1">Select Provider</label>
                  <select
                    required
                    value={selectedDoctorId}
                    onChange={e => {
                      setSelectedDoctorId(e.target.value);
                      fetchAvailability(e.target.value);
                      setSelectedSlotId("");
                    }}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-white"
                  >
                    <option value="" disabled>{isFetchingDoctors ? "Loading doctors..." : "Select a doctor"}</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>Dr. {doc.email.split('@')[0]} (Provider)</option>
                    ))}
                  </select>
                </div>

                {selectedDoctorId && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Available Time Slot</label>
                    <select
                      required
                      value={selectedSlotId}
                      onChange={e => setSelectedSlotId(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-white"
                      disabled={availableSlots.length === 0 || isFetchingAvailability}
                    >
                      <option value="" disabled>
                        {isFetchingAvailability
                          ? "Loading slots..."
                          : availableSlots.length > 0
                            ? "Select a time slot"
                            : "No available slots found for this doctor"}
                      </option>
                      {availableSlots.map(slot => (
                        <option key={slot.id} value={slot.id}>
                          {formatDate(slot.startTime)} at {formatTime(slot.startTime)}
                        </option>
                      ))}
                    </select>
                    {availableSlots.length === 0 && !isFetchingAvailability && (
                      <p className="mt-2 text-xs text-rose-500 font-medium italic">
                        The selected doctor hasn't set any upcoming availability slots yet.
                      </p>
                    )}
                  </div>
                )}

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