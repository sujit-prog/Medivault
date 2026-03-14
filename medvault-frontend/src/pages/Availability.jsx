import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

export default function Availability() {
  const getLocalDateString = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));
  const [time, setTime] = useState("");
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role")?.toUpperCase() || "PATIENT";
    if (role === "PATIENT") {
      navigate("/dashboard");
      return;
    }
    fetchAvailability();
  }, [navigate]);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/availability/doctor");

      const mapped = res.data.map(a => {
        const d = new Date(a.startTime);
        return {
          id: a.id,
          date: getLocalDateString(d),
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });
      console.log("Fetched slots:", mapped);
      setAvailability(mapped);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to fetch availability.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!time) return;

    setIsAdding(true);
    try {
      // Calculate end time (assuming 30min slots)
      // Calculate end time (assuming 30min slots)
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);

      const startDateTime = new Date(year, month - 1, day, hours, minutes, 0);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

      // Format to YYYY-MM-DDTHH:mm:ss for backend LocalDateTime.parse()
      const formatLocalISO = (date) => {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      };

      const res = await API.post("/availability/add", {
        startTime: formatLocalISO(startDateTime),
        endTime: formatLocalISO(endDateTime)
      });

      setSuccess(true); // Added from instruction
      setTime("");
      fetchAvailability();
      setTimeout(() => setSuccess(false), 3000); // Added from instruction
    } catch (err) {
      console.error("Establish Slot Error:", err);
      const backendError = err.response?.data;
      const status = err.response?.status;
      setStatus({
        type: 'error',
        message: typeof backendError === 'string' ? backendError : `Failed to establish slot (${status || 'Network Error'})`
      });
    } finally {
      setIsAdding(false);
    }
  };

  const removeSlot = async (id) => {
    try {
      await API.delete(`/availability/${id}`);
      fetchAvailability();
    } catch (err) {
      console.error("Failed to delete slot:", err);
    }
  };

  const formatTimeString = (time24h) => {
    const [h, m] = time24h.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const generateDates = () => {
    const dates = [];
    let curr = new Date();
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const upcomingDates = generateDates();
  const slotsForSelectedDate = availability.filter(a => a.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">

      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manage Availability</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left Column - Date Selection & Add Slot */}
          <div className="md:col-span-1 space-y-6">

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
                <CalendarIcon size={18} className="text-teal-600" />
                Select Date
              </h3>

              <div className="space-y-2">
                {upcomingDates.map((date, i) => {
                  const dateStr = getLocalDateString(date);
                  const isSelected = selectedDate === dateStr;
                  const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
                  const dayNum = date.getDate();
                  const month = date.toLocaleDateString(undefined, { month: 'short' });

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${isSelected
                        ? 'bg-teal-50 border-teal-500 text-teal-800 ring-1 ring-teal-500 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center ${isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <span className="text-[10px] font-bold uppercase leading-none">{month}</span>
                          <span className="text-sm font-black leading-none mt-1">{dayNum}</span>
                        </div>
                        <span className="font-semibold text-sm">{i === 0 ? 'Today' : dayName}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={16} className="text-teal-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-6">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-base">
                <Clock size={20} className="text-teal-600" />
                Select Time Slot
              </h3>

              <div className="flex gap-4 mb-6 h-48">
                {/* Hour Selection */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-center sticky top-0 bg-white py-1">Hour</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const h = i.toString().padStart(2, '0');
                      const selectedH = time.split(':')[0];
                      return (
                        <button
                          key={i}
                          onClick={() => setTime(`${h}:${time.split(':')[1] || '00'}`)}
                          className={`py-2.5 rounded-xl font-bold text-sm transition-all ${selectedH === h
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-100'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Minute Selection */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-center sticky top-0 bg-white py-1">Min</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {['00', '15', '30', '45'].map((m) => {
                      const selectedM = time.split(':')[1];
                      return (
                        <button
                          key={m}
                          onClick={() => setTime(`${time.split(':')[0] || '09'}:${m}`)}
                          className={`py-2.5 rounded-xl font-bold text-sm transition-all ${selectedM === m
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-100'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter mb-2">
                  <span>Selected Time</span>
                  <span className="text-teal-600">30 Min Session</span>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {time ? formatTimeString(time) : "Select a time..."}
                </div>
              </div>

              {status.message && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${status.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-teal-50 text-teal-600 border border-teal-100'
                  }`}>
                  {status.type === 'error' ? (
                    <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0">!</div>
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  {status.message}
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={isAdding || !time}
                className={`w-full h-12 flex items-center justify-center gap-3 rounded-2xl shadow-xl transition-all active:scale-[0.98] ${time
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                {isAdding ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : success ? (
                  <>
                    <span className="font-bold">Slot Established</span>
                    <CheckCircle2 size={20} />
                  </>
                ) : (
                  <>
                    <span className="font-bold">Establish Slot</span>
                    <Plus size={20} />
                  </>
                )}
              </button>
            </div>


          </div>

          {/* Right Column - Slots View */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">

              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Available Slots</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                  {slotsForSelectedDate.length} slot(s)
                </div>
              </div>

              <div className="p-5 flex-1">
                {isLoading ? (
                  <div className="flex flex-col justify-center items-center h-full text-slate-400 pt-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300 mb-4"></div>
                  </div>
                ) : slotsForSelectedDate.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center pt-16 pb-12">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4">
                      <CalendarDays size={32} />
                    </div>
                    <h3 className="text-slate-700 font-bold mb-1">No availability set</h3>
                    <p className="text-sm text-slate-500 max-w-[250px]">You haven't added any time slots for this date yet. Use the panel on the left to add one.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {slotsForSelectedDate.map(slot => (
                      <div key={slot.id} className="group border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:border-teal-500 hover:shadow-md hover:shadow-teal-50 transition-all bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                            <Clock size={16} />
                          </div>
                          <span className="font-bold text-slate-700">{slot.time}</span>
                        </div>
                        <button
                          onClick={() => removeSlot(slot.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove slot"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}