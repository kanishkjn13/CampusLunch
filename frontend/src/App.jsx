import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import StudentDashboard from './pages/student/StudentDashboard';
import VendorDetails from './pages/student/VendorDetails';

import VendorDashboard from './pages/vendor/VendorDashboard';

import AdminDashboard from './pages/admin/AdminDashboard';
import AboutUs from './pages/AboutUs';
import HelpFaq from './pages/HelpFaq';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes don't necessarily need the full layout, but let's wrap them in layout or provide a clean view */}
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/faq" element={<HelpFaq />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/vendor/:id" element={<VendorDetails />} />
          <Route path="/vendor-dashboard" element={<VendorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
