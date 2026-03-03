import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Availability from "./pages/Availability";
import MedicalRecords from "./pages/MedicalRecords";
import ConsentManagement from "./pages/ConsentManagement";
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/records" element={<MedicalRecords />} />
        <Route path="/consents" element={<ConsentManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;