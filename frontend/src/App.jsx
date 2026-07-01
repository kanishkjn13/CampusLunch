import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/public/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import StudentDashboard from './pages/student/StudentDashboard';
import VendorDetails from './pages/student/VendorDetails';

import VendorDashboard from './pages/vendor/VendorDashboard';

import AdminDashboard from './pages/admin/AdminDashboard';
import AboutUs from './pages/public/AboutUs';
import HelpFaq from './pages/public/HelpFaq';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfService from './pages/public/TermsOfService';
import SupportChat from './pages/public/SupportChat';
import { StudentProvider } from './context/StudentContext';

function App() {
  return (
    <Router>
      <StudentProvider>
        <Routes>
          {/* Auth routes don't necessarily need the full layout, but let's wrap them in layout or provide a clean view */}
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/faq" element={<HelpFaq />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/support-chat" element={<SupportChat />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/vendor/:id" element={<VendorDetails />} />
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </StudentProvider>
    </Router>
  );
}

export default App;
