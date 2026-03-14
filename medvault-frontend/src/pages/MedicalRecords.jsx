import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldPlus, Home, CalendarDays, Clock, FileText, Upload, Trash2, ShieldCheck, Settings, LogOut, Eye, Pencil, X, CheckCircle2 } from "lucide-react";
import api from "../services/api";

export default function MedicalRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("PRESCRIPTION");
  const [uploading, setUploading] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [showAuditId, setShowAuditId] = useState(null);

  const userRole = localStorage.getItem("role")?.toUpperCase() || "PATIENT";

  useEffect(() => {
    if (userRole === "PATIENT") {
      fetchRecords();
    } else {
      fetchMyPatients();
    }
  }, [userRole]);

  // FIX: Central refresh helper — patients fetch own records,
  // doctors re-fetch the currently selected patient's records.
  const refreshRecords = () => {
    if (userRole === "PATIENT") {
      fetchRecords();
    } else if (selectedPatientId) {
      fetchPatientRecords(selectedPatientId);
    }
  };

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/records");
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching records", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyPatients = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/users/patients");
      setPatients(res.data || []);
    } catch (err) {
      console.error("Error fetching patients", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientRecords = async (patientId) => {
    if (!patientId) {
      setRecords([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get(`/records/patient/${patientId}`);
      setRecords(res.data || []);
    } catch (err) {
      console.error("Error fetching patient records", err);
      setRecords([]);
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
      await api.post("/records/upload", formData);
      setFile(null);
      setTitle("");
      fetchRecords();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // FIX: Removed the stray ```javascript ... ``` block that was embedded here,
  // causing a fatal syntax error. refreshRecords() is now used correctly.
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/records/${id}`);
      refreshRecords();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete record");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/records/${id}`, { title: editTitle, category: editCategory });
      setEditingRecordId(null);
      refreshRecords();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update record");
    }
  };

  // FIX: record.fileUrl from the backend is "/api/records/{id}/file".
  // The api axios instance already has /api in its baseURL, so calling
  // api.get(record.fileUrl) would produce "/api/api/records/{id}/file".
  // We strip the leading "/api" prefix before passing it to the api instance.
  const handleViewFile = async (record) => {
    try {
      const path = record.fileUrl.replace(/^\/api/, "");
      const response = await api.get(path, { responseType: "blob" });
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error("Failed to view file", err);
      alert("Could not open the file. It may no longer exist on the server.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <img src="/favicon.png" alt="MediVault Logo" className="w-10 h-10 drop-shadow-md" />
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight">MediVault</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {userRole === 'PATIENT' ? 'Patient Portal' : 'Provider Portal'}
            </p>
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

          {userRole !== 'PATIENT' && (
            <Link to="/availability" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors">
              <Clock size={20} />
              <span>Availability</span>
            </Link>
          )}

          <Link to="/records" className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-bold transition-colors">
            <FileText size={20} />
            <span>{userRole === 'PATIENT' ? 'Health Records' : 'Patient Records'}</span>
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
          <h2 className="font-bold text-xl text-slate-900">{userRole === 'PATIENT' ? 'Health Records' : 'Patient Records'}</h2>
        </header>

        <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">

          {/* Upload Section (Patients Only) */}
          {userRole === 'PATIENT' && (
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
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
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
          )}

          {/* Patient Selection (Doctors Only) */}
          {userRole !== 'PATIENT' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                Select Patient
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 w-full max-w-md">
                  <select
                    value={selectedPatientId}
                    onChange={e => {
                      setSelectedPatientId(e.target.value);
                      fetchPatientRecords(e.target.value);
                    }}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="" disabled>Choose a patient to view their records...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.email} (ID: {p.id})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Records List Section */}
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-4">{userRole === 'PATIENT' ? 'Your Medical Records' : 'Patient Medical Records'}</h3>

            {isLoading ? (
              <p className="text-slate-500 font-medium">Loading records...</p>
            ) : records.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-900">No Records Found</h4>
                <p className="text-slate-500 text-sm mt-2">
                  {userRole === 'PATIENT' ? 'Upload your first prescription or test result above.' : 'No records found for the selected patient.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {records.map(record => (
                  <div key={record.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:border-teal-300 transition-colors">
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                          <FileText size={24} />
                        </div>
                        {editingRecordId === record.id ? (
                          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                            <input
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              className="p-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            />
                            <select
                              value={editCategory}
                              onChange={e => setEditCategory(e.target.value)}
                              className="p-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500"
                            >
                              <option value="PRESCRIPTION">Prescription</option>
                              <option value="TEST_REPORT">Test Report</option>
                              <option value="DIAGNOSIS">Diagnosis</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">{record.title}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 mt-1">
                              <span className="bg-slate-100 px-2 py-0.5 rounded">{record.category}</span>
                              <span>{new Date(record.uploadedAt).toLocaleDateString()}</span>
                              {record.fileName && (
                                <span className="text-slate-400 font-normal truncate max-w-[180px]" title={record.fileName}>📎 {record.fileName}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingRecordId === record.id ? (
                          <>
                            <button onClick={() => handleUpdate(record.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Save">
                              <CheckCircle2 size={18} />
                            </button>
                            <button onClick={() => setEditingRecordId(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" title="Cancel">
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleViewFile(record)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View file"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                        {userRole === 'PATIENT' && editingRecordId !== record.id && (
                          <>
                            <button
                              onClick={() => { setEditingRecordId(record.id); setEditTitle(record.title); setEditCategory(record.category); }}
                              className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>
                            <button onClick={() => handleDelete(record.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                        {record.auditTrail && (
                          <button
                            onClick={() => setShowAuditId(showAuditId === record.id ? null : record.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-xs font-bold"
                            title="Audit Trail"
                          >
                            Log
                          </button>
                        )}
                      </div>
                    </div>
                    {showAuditId === record.id && record.auditTrail && (
                      <div className="px-5 pb-4 border-t border-slate-100 pt-3 bg-amber-50/50">
                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">Audit Trail</p>
                        <div className="space-y-1">
                          {record.auditTrail.split('\n').map((line, i) => (
                            <p key={i} className="text-xs text-slate-600 font-mono">{line}</p>
                          ))}
                        </div>
                      </div>
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