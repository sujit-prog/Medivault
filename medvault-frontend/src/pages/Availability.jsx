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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("");
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const navigate = useNavigate();

  // Mock initial data if API fails
  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/availability/doctor");

      const mapped = res.data.map(a => {
        const d = new Date(a.startTime);
        return {
          id: a.id,
          date: d.toISOString().split('T')[0],
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });
      setAvailability(mapped);
    } catch (err) {
      console.error(err);
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
      const startDateTime = new Date(`${selectedDate}T${time}`);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

      const res = await API.post("/availability/add", {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      });

      fetchAvailability();
      setTime("");
    } catch (err) {
      console.error(err);
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
                  const dateStr = date.toISOString().split('T')[0];
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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
                <Clock size={18} className="text-teal-600" />
                Add Time Slot
              </h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1.5 block">Start Time</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-900 flex-1"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAdding || !time}
                  className="w-full h-10 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  {isAdding ? "Adding..." : "Add Slot"}
                  {!isAdding && <Plus size={16} />}
                </button>
              </form>
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