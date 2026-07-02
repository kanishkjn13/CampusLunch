import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';
  const isDashboardPage = location.pathname.startsWith('/admin') || location.pathname === '/vendor-dashboard' || location.pathname === '/student';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="page-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isAuthPage && !isDashboardPage && <Navbar />}
      
      <main className={isDashboardPage ? "" : "main-content"} style={{ flex: 1 }}>
        {children}
      </main>
      
      {!isAuthPage && !isDashboardPage && <Footer />}
      
      {!isDashboardPage && <BottomNav />}
    </div>
  );
};

export default Layout;
