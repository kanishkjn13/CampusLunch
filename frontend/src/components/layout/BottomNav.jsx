import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from "@/services/authService";
import { 
  Home, 
  Search, 
  ClipboardList, 
  User, 
  LogIn, 
  UserPlus, 
  MoreHorizontal, 
  Languages, 
  Info, 
  HelpCircle, 
  X 
} from 'lucide-react';

const BottomNav = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || null;

  const handleLogout = () => {
    logoutUser().catch((err) => console.error("BottomNav Logout Error:", err));
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setIsProfileOpen(false);
    navigate("/login", { replace: true });
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const isActive = (path) => location.pathname === path;

  // Simple active color logic
  const getColor = (path) => isActive(path) ? '#855300' : 'rgba(133, 83, 0, 0.6)';

  return (
    <>
      <style>{`
        .bottom-nav { display: none; }
        .bottom-sheet-overlay { display: none; }
        .bottom-sheet { display: none; }
        
        @media (max-width: 768px) {
          .bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.75) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            border-top: 1px solid rgba(133, 83, 0, 0.1) !important;
            z-index: 100;
            padding: 10px 20px 20px;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05) !important;
            
            /* Hidden initially on mobile viewports */
            transform: translateY(100%);
            opacity: 0;
            pointer-events: none;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
          }
          .bottom-nav.visible {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
          }
          .bottom-nav a, .bottom-nav button {
            transition: transform 0.15s ease, opacity 0.15s ease !important;
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
          }
          .bottom-nav a:active, .bottom-nav button:active {
            transform: scale(0.9) !important;
          }
          .active-dot {
            width: 4px;
            height: 4px;
            background-color: #855300;
            border-radius: 50%;
            margin-top: 2px;
          }
          
          /* Bottom Sheet Backdrop */
          .bottom-sheet-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 199;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }
          .bottom-sheet-overlay.open {
            opacity: 1;
            pointer-events: auto;
          }

          /* Bottom Sheet Panel */
          .bottom-sheet {
            display: block;
            position: fixed;
            bottom: -100%;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.85) !important; /* translucent white matching bottom-nav */
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border-top: 1px solid rgba(133, 83, 0, 0.1) !important;
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
            z-index: 200;
            padding: 20px 20px 32px;
            box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.08) !important;
            transition: bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .bottom-sheet.open {
            bottom: 0;
          }

          /* Bottom Sheet Header */
          .bottom-sheet-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(133, 83, 0, 0.1) !important;
          }
          .bottom-sheet-title {
            font-size: 1.05rem;
            font-weight: 600;
            color: #855300 !important;
          }
          .bottom-sheet-close {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(133, 83, 0, 0.08) !important;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #855300 !important;
            border: none;
            padding: 0;
          }

          /* Bottom Sheet Grid */
          .bottom-sheet-grid {
            display: grid;
            grid-template-cols: repeat(3, 1fr);
            gap: 8px;
          }
          .bottom-sheet-item {
            background: rgba(255, 255, 255, 0.5) !important;
            border-radius: var(--radius-md);
            padding: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            text-align: center;
            color: #855300 !important;
            border: 1px solid rgba(133, 83, 0, 0.12) !important;
            transition: background var(--transition-fast), border-color var(--transition-fast);
          }
          .bottom-sheet-item:active {
            background: rgba(133, 83, 0, 0.1) !important;
            border-color: rgba(133, 83, 0, 0.2) !important;
          }
        }
      `}</style>
      
      <div className={`bottom-nav ${isVisible ? 'visible' : ''}`}>
        {!role ? (
          <>
            <NavItem to="/" icon={<Home size={24} color={getColor('/')} />} label="Home" active={isActive('/')} />
            <NavItem to="/login" icon={<LogIn size={24} color={getColor('/login')} />} label="Log In" active={isActive('/login')} />
            <NavItem to="/register" icon={<UserPlus size={24} color={getColor('/register')} />} label="Sign Up" active={isActive('/register')} />
            <button
              onClick={() => setIsMoreOpen(true)}
              className="flex flex-col items-center gap-1"
              style={{ width: '60px' }}
            >
              <MoreHorizontal size={24} color={isMoreOpen ? '#855300' : 'rgba(133, 83, 0, 0.6)'} />
              <span style={{ fontSize: '0.7rem', color: isMoreOpen ? '#855300' : 'rgba(133, 83, 0, 0.6)', fontWeight: isMoreOpen ? 600 : 400 }}>More</span>
            </button>
          </>
        ) : (
          <>
            {role === 'student' && (
              <>
                <NavItem to="/student" icon={<Home size={24} color={getColor('/student')} />} label="Home" active={isActive('/student')} />
                <NavItem to="#" icon={<Search size={24} color={getColor('#')} />} label="Search" active={false} />
                <NavItem to="#" icon={<ClipboardList size={24} color={getColor('#')} />} label="Orders" active={false} />
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex flex-col items-center gap-1"
                  style={{ width: '60px', background: 'none', border: 'none', padding: 0 }}
                >
                  <User size={24} color={isProfileOpen ? '#855300' : 'rgba(133, 83, 0, 0.6)'} />
                  <span style={{ fontSize: '0.7rem', color: isProfileOpen ? '#855300' : 'rgba(133, 83, 0, 0.6)', fontWeight: isProfileOpen ? 600 : 400 }}>Profile</span>
                </button>
              </>
            )}
            
            {role === 'vendor' && (
              <>
                <NavItem to="/vendor-dashboard" icon={<Home size={24} color={getColor('/vendor-dashboard')} />} label="Dashboard" active={isActive('/vendor-dashboard')} />
                <NavItem to="#" icon={<ClipboardList size={24} color={getColor('#')} />} label="Menu" active={false} />
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex flex-col items-center gap-1"
                  style={{ width: '60px', background: 'none', border: 'none', padding: 0 }}
                >
                  <User size={24} color={isProfileOpen ? '#855300' : 'rgba(133, 83, 0, 0.6)'} />
                  <span style={{ fontSize: '0.7rem', color: isProfileOpen ? '#855300' : 'rgba(133, 83, 0, 0.6)', fontWeight: isProfileOpen ? 600 : 400 }}>Profile</span>
                </button>
              </>
            )}
            
            {role === 'admin' && (
              <>
                <NavItem to="/admin" icon={<Home size={24} color={getColor('/admin')} />} label="Dashboard" active={isActive('/admin')} />
                <NavItem to="#" icon={<User size={24} color={getColor('#')} />} label="Users" active={false} />
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex flex-col items-center gap-1"
                  style={{ width: '60px', background: 'none', border: 'none', padding: 0 }}
                >
                  <User size={24} color={isProfileOpen ? '#855300' : 'rgba(133, 83, 0, 0.6)'} />
                  <span style={{ fontSize: '0.7rem', color: isProfileOpen ? '#855300' : 'rgba(133, 83, 0, 0.6)', fontWeight: isProfileOpen ? 600 : 400 }}>Profile</span>
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Bottom Sheet Modal for Guest 'More' */}
      <div className={`bottom-sheet-overlay ${isMoreOpen ? 'open' : ''}`} onClick={() => setIsMoreOpen(false)}></div>
      <div className={`bottom-sheet ${isMoreOpen ? 'open' : ''}`}>
        <div className="bottom-sheet-header">
          <span className="bottom-sheet-title">More Options</span>
          <button className="bottom-sheet-close" onClick={() => setIsMoreOpen(false)}>
            <X size={16} />
          </button>
        </div>
        <div className="bottom-sheet-grid">
          <button className="bottom-sheet-item" onClick={() => { setIsMoreOpen(false); alert('Language is currently set to English.'); }}>
            <Languages size={26} color="#855300" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Language</span>
          </button>
          <Link to="/about" className="bottom-sheet-item" onClick={() => setIsMoreOpen(false)}>
            <Info size={26} color="#855300" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>About Us</span>
          </Link>
          <Link to="/faq" className="bottom-sheet-item" onClick={() => setIsMoreOpen(false)}>
            <HelpCircle size={26} color="#855300" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Help & FAQ</span>
          </Link>
        </div>
      </div>

      {/* Bottom Sheet Modal for Profile */}
      <div className={`bottom-sheet-overlay ${isProfileOpen ? 'open' : ''}`} onClick={() => setIsProfileOpen(false)}></div>
      <div className={`bottom-sheet ${isProfileOpen ? 'open' : ''}`}>
        <div className="bottom-sheet-header">
          <span className="bottom-sheet-title">My Profile</span>
          <button className="bottom-sheet-close" onClick={() => setIsProfileOpen(false)}>
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col items-center text-center py-6 px-4">
          {/* Avatar Icon */}
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(133, 83, 0, 0.08)' }}
          >
            <User size={36} color="#855300" />
          </div>
          
          {/* Role details */}
          <h3 className="text-lg font-bold uppercase tracking-wide" style={{ color: '#855300' }}>
            {role === 'student' && 'Student Account'}
            {role === 'vendor' && 'Vendor Partner'}
            {role === 'admin' && 'Administrator'}
          </h3>
          <p className="text-sm font-medium mt-1 mb-6" style={{ color: 'rgba(133, 83, 0, 0.7)' }}>
            {role === 'student' && 'student@gmail.com'}
            {role === 'vendor' && 'vendor@kitchen.com'}
            {role === 'admin' && 'admin@campuslunch.com'}
          </p>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full h-12 text-white rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-bold"
            style={{ backgroundColor: '#dc2626', border: 'none', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24" }}>logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

const NavItem = ({ to, icon, label, active }) => (
  <Link to={to} className="flex flex-col items-center gap-1" style={{ width: '60px' }}>
    {icon}
    <span style={{ fontSize: '0.7rem', color: active ? '#855300' : 'rgba(133, 83, 0, 0.6)', fontWeight: active ? 600 : 400 }}>{label}</span>
    {active && <div className="active-dot"></div>}
  </Link>
);

export default BottomNav;
