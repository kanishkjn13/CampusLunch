import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isHideLayout = isAuthPage || isAdminPage || location.pathname === '/vendor-dashboard';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="page-container">
      {!isHideLayout && <Navbar />}
      <main className={isHideLayout ? "" : "main-content"}>
        {children}
      </main>
      {!isHideLayout && <Footer />}
      {!isHideLayout && <BottomNav />}
    </div>
  );
};

export default Layout;
