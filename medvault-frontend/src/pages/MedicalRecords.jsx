import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldPlus, Home, CalendarDays, Clock, FileText, Upload, Trash2, ShieldCheck, Settings, LogOut, Download } from "lucide-react";
import api from "../services/api";

export default function MedicalRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("PRESCRIPTION");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get("/records");
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching records", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("category", category);

    try {
      await api.post("/records/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFile(null);
      setTitle("");
      fetchRecords(); // Refresh list
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/records/${id}`);
      fetchRecords(); // Refresh list
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* Sidebar Navigation (Reused from Dashboard) */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-200">
            <ShieldPlus size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight">MediVault</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Patient Portal</p>
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
          <Link to="/records" className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-bold transition-colors">
            <FileText size={20} />
            <span>Health Records</span>
          </Link>
          <Link to="/consents" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
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
          <h2 className="font-bold text-xl text-slate-900">Health Records</h2>
        </header>

        <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">
          
          {/* Upload Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Upload size={20} className="text-teal-600" /> Upload New Record
            </h3>
            <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Blood Test Result" 
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" required
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="PRESCRIPTION">Prescription</option>
                  <option value="TEST_REPORT">Test Report</option>
                  <option value="DIAGNOSIS">Diagnosis</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="w-full sm:w-64">
                <label className="block text-sm font-bold text-slate-700 mb-1">File</label>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="w-full p-1.5 border border-slate-200 rounded-xl bg-slate-50 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" required
                />
              </div>
              <button 
                type="submit" 
                disabled={uploading}
                className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-md hover:bg-teal-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {uploading ? "Uploading..." : "Save Record"}
              </button>
            </form>
          </div>

          {/* Records List Section */}
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-4">Your Medical Records</h3>
            
            {isLoading ? (
              <p className="text-slate-500 font-medium">Loading records...</p>
            ) : records.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-900">No Records Found</h4>
                <p className="text-slate-500 text-sm mt-2">Upload your first prescription or test result above.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {records.map(record => (
                  <div key={record.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-teal-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{record.title}</h4>
                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mt-1">
                          <span className="bg-slate-100 px-2 py-0.5 rounded">{record.category}</span>
                          <span>{new Date(record.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Download placeholder">
                        <Download size={18} />
                      </button>
                      <button onClick={() => handleDelete(record.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
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
