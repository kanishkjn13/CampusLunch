import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';
  const isSupportChat = location.pathname === '/support-chat';
  const isDashboardPage = location.pathname.startsWith('/admin') || location.pathname === '/vendor-dashboard' || location.pathname === '/student';
  const pathsWithFooter = ['/', '/privacy', '/terms', '/about', '/faq'];
  const showFooter = pathsWithFooter.includes(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthPage || isSupportChat || isDashboardPage) {
      document.body.style.paddingBottom = '0px';
    } else {
      document.body.style.paddingBottom = '70px';
    }
    return () => {
      document.body.style.paddingBottom = '';
    };
  }, [location.pathname, isAuthPage, isSupportChat, isDashboardPage]);

  return (
    <div className="page-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isAuthPage && !isDashboardPage && <Navbar />}
      
      <main className={isDashboardPage ? "" : "main-content"} style={{ flex: 1 }}>
        {children}
      </main>
      
      {showFooter && <Footer />}
      
      {!isDashboardPage && !isSupportChat && <BottomNav />}
    </div>
  );
};

export default Layout;
