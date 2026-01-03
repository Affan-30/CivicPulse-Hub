import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import RegisterGrievance from './components/RegisterGrievance.jsx';
import OfficerDashboard from './components/OfficerDashboard.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Login page */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard page shown after successful login */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admindashboard" element={<AdminDashboard/>} />
        <Route path="/grievanceform" element={<RegisterGrievance/>} />
        // Add this route
<Route path="/officer-dashboard" element={<OfficerDashboard />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
