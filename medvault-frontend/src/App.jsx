import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'

// Lazy-load every page so each becomes its own JS chunk.
// Only the chunk for the current route is downloaded by the browser.
const Landing          = lazy(() => import("./pages/Landing"));
const Login            = lazy(() => import("./pages/Login"));
const Register         = lazy(() => import("./pages/Register"));
const Dashboard        = lazy(() => import("./pages/Dashboard"));
const Appointments     = lazy(() => import("./pages/Appointments"));
const Availability     = lazy(() => import("./pages/Availability"));
const MedicalRecords   = lazy(() => import("./pages/MedicalRecords"));
const ConsentManagement= lazy(() => import("./pages/ConsentManagement"));
const Profile          = lazy(() => import("./pages/Profile"));
const Prescriptions    = lazy(() => import("./pages/Prescriptions"));
const ForgotPassword   = lazy(() => import("./pages/ForgotPassword"));

// Shown while a page chunk is downloading (usually < 300ms on a good connection)
function PageLoader() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8fafc"
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "36px", height: "36px",
          border: "3px solid #e2e8f0",
          borderTop: "3px solid #0d9488",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <p style={{ color: "#94a3b8", fontWeight: 600, fontSize: "14px", fontFamily: "sans-serif" }}>
          Loading…
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"               element={<Landing />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/appointments"   element={<Appointments />} />
          <Route path="/availability"   element={<Availability />} />
          <Route path="/records"        element={<MedicalRecords />} />
          <Route path="/consents"       element={<ConsentManagement />} />
          <Route path="/profile"        element={<Profile />} />
          <Route path="/prescriptions"  element={<Prescriptions />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;