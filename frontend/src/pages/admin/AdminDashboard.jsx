import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentContext } from '@/context/StudentContext';
import {
  Grid,
  Store,
  MessageSquare,
  Cpu,
  Settings,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  Check,
  X,
  AlertCircle,
  Percent,
  Tag,
  ChevronDown,
  Plus,
  SlidersHorizontal,
  Star,
  Printer,
  MoreVertical,
  Paperclip,
  Send,
  Bold,
  Italic,
  FileText,
  User,
  RotateCw,
  Zap,
  Cloud,
  CheckCircle,
  Edit2,
  Lock,
  Camera,
  Shield,
  Key,
  Monitor,
  ChevronRight,
  Info,
  Mail,
  UploadCloud,
  UserCheck
} from 'lucide-react';
import {
  logoutUser,
  getAdminVendorsList,
  verifyVendorApi,
  onboardVendorApi,
  getSystemHealthApi,
  updateCommissionRateApi,
  getSupportTicketsApi,
  getSupportMessagesApi,
  sendSupportMessageApi,
  updateTicketStatusApi,
  getUserProfileApi,
  updateUserProfileApi,
  changeUserPasswordApi
} from "@/services/authService";



const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const context = useContext(StudentContext) || {};
  const sellers = context.sellers || [];
  const ratings = context.ratings || [];
  const orders = context.orders || [];

  const getSellerRatingInfo = (sellerName, sellerId) => {
    const matching = (ratings || []).filter(r => {
      const vName = r.vendorName || r.vendor_name;
      const vId = r.vendorId || r.vendor_id;
      return (sellerName && vName && vName.toLowerCase() === sellerName.toLowerCase()) || 
             (sellerId && vId && String(vId) === String(sellerId));
    });
    if (!matching || matching.length === 0) {
      return { rating: '0.0', reviews: 0 };
    }
    const sum = matching.reduce((acc, r) => {
      const food = Number(r.foodRating || r.food_rating || 0);
      const service = Number(r.serviceRating || r.service_rating || 0);
      return acc + (food + service) / 2;
    }, 0);
    const avg = (sum / matching.length).toFixed(1);
    return { rating: avg, reviews: matching.length };
  };

  const globalAvgRating = (() => {
    if ((ratings || []).length === 0) return '0.0';
    const sum = ratings.reduce((acc, r) => {
      const food = Number(r.foodRating || r.food_rating || 0);
      const service = Number(r.serviceRating || r.service_rating || 0);
      return acc + (food + service) / 2;
    }, 0);
    return (sum / ratings.length).toFixed(1);
  })();

  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const showNotification = (msg, type = 'success') => {
    setToast({ message: msg, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const [timeframe, setTimeframe] = useState('This Month');
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);

  const [commissionRate, setCommissionRate] = useState(() => {
    return Number(localStorage.getItem('admin_commission_rate') || 12);
  });
  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [tempCommission, setTempCommission] = useState(commissionRate);

  const [verificationQueue, setVerificationQueue] = useState(() => {
    const savedQueue = localStorage.getItem('admin_vendor_verification_queue');
    if (savedQueue) {
      try {
        const parsed = JSON.parse(savedQueue);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });
  const [showAllApplicationsModal, setShowAllApplicationsModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardForm, setOnboardForm] = useState({ name: '', email: '', phone: '', password: 'Vendor123!' });
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboardForm.name || !onboardForm.email) {
      showNotification("Kitchen Name and Email are required.", "error");
      return;
    }
    try {
      const res = await onboardVendorApi(onboardForm);
      showNotification(res.detail || `Successfully onboarded vendor '${onboardForm.name}'.`, "success");
      setShowOnboardModal(false);
      setOnboardForm({ name: '', email: '', phone: '', password: 'Vendor123!' });
      await fetchBackendVendors();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to onboard vendor.";
      showNotification(msg, "error");
    }
  };

  const fetchBackendVendors = async () => {
    try {
      const data = await getAdminVendorsList();
      if (data && Array.isArray(data)) {
        setVerificationQueue(data);
        localStorage.setItem('admin_vendor_verification_queue', JSON.stringify(data));
      }
    } catch (err) {
      console.log("Could not fetch vendors from DB for admin queue:", err);
    }
  };

  const [ticketsList, setTicketsList] = useState([]);
  const [activeTicketId, setActiveTicketId] = useState('TK-8821');
  const [activeTicketMessages, setActiveTicketMessages] = useState([]);
  const [supportReplyText, setSupportReplyText] = useState('');
  const [supportTabFilter, setSupportTabFilter] = useState('all');
  const [supportSearchQuery, setSupportSearchQuery] = useState('');

  const fetchSupportTickets = async () => {
    try {
      const data = await getSupportTicketsApi();
      if (data && Array.isArray(data)) {
        setTicketsList(data);
        if (data.length > 0 && !data.some(t => t.ticket_id === activeTicketId)) {
          setActiveTicketId(data[0].ticket_id);
        }
      }
    } catch (err) {
      console.log("Could not fetch support tickets from DB:", err);
    }
  };

  const fetchTicketMessages = async (tId) => {
    if (!tId) return;
    try {
      const res = await getSupportMessagesApi(tId);
      if (res && res.messages) {
        setActiveTicketMessages(res.messages);
      }
    } catch (err) {
      console.log("Could not fetch messages for ticket:", tId, err);
    }
  };

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  useEffect(() => {
    if (activeTicketId) {
      fetchTicketMessages(activeTicketId);
    }
  }, [activeTicketId]);

  const handleSendSupportMessage = async (e) => {
    if (e) e.preventDefault();
    if (!supportReplyText.trim()) return;

    const textToSend = supportReplyText.trim();
    setSupportReplyText('');

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const optMsg = { id: Date.now(), sender: 'admin', text: textToSend, time: nowStr };
    setActiveTicketMessages(prev => [...prev, optMsg]);

    try {
      await sendSupportMessageApi(activeTicketId, textToSend, 'admin');
      await fetchTicketMessages(activeTicketId);
    } catch (err) {
      showNotification("Failed to send message to database.", "error");
    }
  };

  const handleToggleTicketStatus = async () => {
    const currentTicket = ticketsList.find(t => t.ticket_id === activeTicketId);
    const newStatus = currentTicket?.status === 'closed' ? 'open' : 'closed';
    try {
      await updateTicketStatusApi(activeTicketId, newStatus);
      showNotification(`Ticket #${activeTicketId} marked as ${newStatus}.`, "success");
      await fetchSupportTickets();
    } catch (err) {
      showNotification("Failed to update ticket status.", "error");
    }
  };

  const [adminProfileForm, setAdminProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: ''
  });

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const fetchAdminProfileData = async () => {
    try {
      const data = await getUserProfileApi();
      if (data) {
        setAdminProfileForm({
          fullName: data.full_name || data.name || 'Admin User',
          email: data.email || 'admin@campuslunch.com',
          phone: data.phone || '+91 98765 43210',
          role: data.role === 'admin' ? 'Super Administrator' : (data.role || 'Super Administrator')
        });
      }
    } catch (err) {
      console.log("Could not fetch admin profile from DB:", err);
    }
  };

  useEffect(() => {
    fetchAdminProfileData();
  }, []);

  const handleSaveProfileSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      await updateUserProfileApi({
        full_name: adminProfileForm.fullName,
        email: adminProfileForm.email,
        phone: adminProfileForm.phone
      });
      showNotification("Admin profile updated successfully in database.", "success");
      await fetchAdminProfileData();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to update profile in DB.";
      showNotification(msg, "error");
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showNotification("New passwords do not match.", "error");
      return;
    }
    try {
      await changeUserPasswordApi(passwordForm);
      showNotification("Password changed successfully in database.", "success");
      setShowChangePasswordModal(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const errObj = err.response?.data;
      const msg = typeof errObj === 'string' ? errObj : (errObj?.current_password || errObj?.new_password || errObj?.detail || "Failed to change password.");
      showNotification(Array.isArray(msg) ? msg[0] : msg, "error");
    }
  };



  const [healthData, setHealthData] = useState({
    backend: { status: 'Checking...', is_active: true, message: 'Pinging Django server...', latency_ms: 0 },
    brevo: { status: 'Checking...', is_active: true, message: 'Checking Brevo API key...' },
    commission_rate: commissionRate
  });

  const checkHealth = async () => {
    try {
      const data = await getSystemHealthApi();
      if (data) {
        setHealthData(data);
        if (data.commission_rate !== undefined && data.commission_rate !== null) {
          setCommissionRate(data.commission_rate);
          localStorage.setItem('admin_commission_rate', data.commission_rate.toString());
        }
      }
    } catch (err) {
      setHealthData({
        backend: { status: 'Offline', is_active: false, message: 'Server unreachable on port 8000', latency_ms: 0 },
        brevo: { status: 'Offline', is_active: false, message: 'Brevo service unreachable' },
        commission_rate: commissionRate
      });
    }
  };

  useEffect(() => {
    fetchBackendVendors();
    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  const pendingVendorQueue = verificationQueue.filter(item => item.status === 'Pending');

  const handleApproveApp = async (appId, appName) => {
    const targetItem = verificationQueue.find(i => i.id === appId);
    const idToVerify = targetItem?.real_id || targetItem?.email || appId;

    try {
      await verifyVendorApi(idToVerify, 'approve');
    } catch (err) {
      console.log("Backend verification update error:", err);
    }

    setVerificationQueue(prev => {
      const updated = prev.map(item => item.id === appId ? { ...item, status: 'Approved', is_verified: true } : item);
      localStorage.setItem('admin_vendor_verification_queue', JSON.stringify(updated));
      return updated;
    });
    showNotification(`Approved vendor kitchen application for ${appName}.`, 'success');
  };

  const handleRejectApp = async (appId, appName) => {
    const targetItem = verificationQueue.find(i => i.id === appId);
    const idToVerify = targetItem?.real_id || targetItem?.email || appId;

    try {
      await verifyVendorApi(idToVerify, 'reject');
    } catch (err) {
      console.log("Backend rejection update error:", err);
    }

    setVerificationQueue(prev => {
      const updated = prev.map(item => item.id === appId ? { ...item, status: 'Rejected', is_verified: false } : item);
      localStorage.setItem('admin_vendor_verification_queue', JSON.stringify(updated));
      return updated;
    });
    showNotification(`Rejected vendor kitchen application for ${appName}.`, 'error');
  };

  const getOpenTickets = () => {
    return (ticketsList || []).filter(ticket => ticket.status !== 'closed');
  };

  const getMetricsByTimeframe = () => {
    const validOrders = (orders || []).filter(o => {
      const status = o.deliveryStatus || o.delivery_status;
      return status !== 'Cancelled';
    });

    const now = Date.now();
    const oneDayMs = 1000 * 60 * 60 * 24;

    const filtered = validOrders.filter(o => {
      const dVal = o.created_at || o.date;
      if (!dVal) return true;
      const lower = String(dVal).toLowerCase();
      if (lower.includes('today') || lower.includes('just now')) return true;
      const d = new Date(dVal);
      if (isNaN(d.getTime())) return true;
      const diffDays = (now - d.getTime()) / oneDayMs;

      switch (timeframe) {
        case 'This Month':
          return diffDays >= 0 && diffDays <= 30;
        case 'Last Month':
          return diffDays > 30 && diffDays <= 60;
        case 'This Year':
          return diffDays >= 0 && diffDays <= 365;
        case 'All Time':
        default:
          return true;
      }
    });

    const totalGrossRevenue = filtered.reduce((sum, o) => sum + (Number(o.bill) || 0), 0);
    const totalOrdersCount = filtered.length;
    const activeCount = filtered.filter(o => {
      const s = o.deliveryStatus || o.delivery_status;
      return s !== 'Delivered' && s !== 'Cancelled';
    }).length;

    const commissionAmount = Math.round(totalGrossRevenue * (commissionRate / 100));
    const avgOrderVal = totalOrdersCount > 0 ? Math.round(totalGrossRevenue / totalOrdersCount) : 0;

    return {
      commission: `₹${commissionAmount.toLocaleString()}`,
      commissionTrend: `Based on ${commissionRate}% platform fee`,
      commissionTrendUp: true,
      activeSubs: `${activeCount > 0 ? activeCount : totalOrdersCount}`,
      activeSubsTrend: `${totalOrdersCount} total orders`,
      activeSubsTrendUp: true,
      avgOrder: `₹${avgOrderVal}`,
      avgOrderTrend: `Across ${totalOrdersCount} orders`,
      avgOrderTrendUp: true
    };
  };



  const handleLogout = () => {
    try {
      if (typeof logoutUser === 'function') {
        logoutUser().catch((err) => console.log("Backend logout message:", err));
      }
    } catch (err) {
      console.log("Logout error handling:", err);
    }
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  // Dynamic header configuration based on the active tab
  const getHeaderConfig = () => {
    if (activeTab === 'vendors') {
      return {
        searchPlaceholder: "Search vendors, IDs, or locations...",
        adminName: "Admin User",
        adminAvatar: "/images/default-avatar.jpg"
      };
    } else if (activeTab === 'support') {
      return {
        searchPlaceholder: "Search tickets, vendors, or customers...",
        adminName: "Admin User",
        adminAvatar: "/images/default-avatar.jpg"
      };
    } else if (activeTab === 'system') {
      return {
        searchPlaceholder: "Search system logs or configurations...",
        adminName: "Admin User",
        adminAvatar: "/images/default-avatar.jpg"
      };
    } else if (activeTab === 'settings') {
      return {
        searchPlaceholder: "Search settings, users, or system logs...",
        adminName: "Admin User",
        adminAvatar: "/images/default-avatar.jpg"
      };
    }
    return {
      searchPlaceholder: "Search orders, vendors or students...",
      adminName: "Admin User",
      adminAvatar: "/images/default-avatar.jpg"
    };
  };

  const headerConfig = getHeaderConfig();



  return (
    <div className="admin-portal-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand" style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(180, 83, 9, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            gap: '8px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }}></span>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              ADMIN
            </span>
          </div>
        </div>

        <div className="sidebar-section-title">MAIN NAVIGATION</div>

        <nav className="sidebar-nav">
          <button
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <div className="admin-nav-item-left">
              <Grid size={18} />
              <span>Overview</span>
            </div>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendors')}
          >
            <div className="admin-nav-item-left">
              <Store size={18} />
              <span>Vendors</span>
            </div>
            <span className="sidebar-nav-badge">{(verificationQueue && verificationQueue.length) || 0}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <div className="admin-nav-item-left">
              <MessageSquare size={18} />
              <span>Support</span>
            </div>
            {(() => {
              const openCount = ticketsList.filter(t => t.status !== 'closed').length;
              return openCount > 0 ? (
                <span className="sidebar-nav-badge alert-badge">{openCount} Live</span>
              ) : (
                <span className="sidebar-nav-badge">0</span>
              );
            })()}
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <div className="admin-nav-item-left">
              <Settings size={18} />
              <span>Settings</span>
            </div>
          </button>

          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button className="admin-logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout Account</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Workspace */}
      <div className="admin-workspace">
        {/* Header */}
        <header className="admin-header">
          <div className="search-bar-wrapper">
            <Search size={18} className="search-bar-icon" />
            <input
              type="text"
              placeholder={headerConfig.searchPlaceholder}
              className="search-bar-input"
            />
          </div>

          <div className="header-profile-section">
            <div className="profile-details-wrapper">
              <div className="profile-text">
                <span className="profile-name">{headerConfig.adminName}</span>
                <span className="profile-role">
                  {activeTab === 'support' ? 'Support Lead' : 'SUPER ADMIN'}
                </span>
              </div>
              <img
                src={headerConfig.adminAvatar}
                alt="Profile Avatar"
                className="profile-avatar-img"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className={activeTab === 'support' ? "admin-main-content support-main-override" : "admin-main-content"}>
          {activeTab === 'overview' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Header Row */}
              <div className="dashboard-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 className="dashboard-title" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Platform Executive Overview
                  </h1>
                  <p className="dashboard-subtitle" style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Real-time revenue metrics, vendor verification queue, and support desk status.
                  </p>
                </div>

                {/* Timeframe Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    className="timeframe-dropdown-btn"
                    onClick={() => setShowTimeframeDropdown(prev => !prev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      fontWeight: 700,
                      color: '#0f172a',
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  >
                    <span>{timeframe}</span>
                    <ChevronDown size={16} style={{ color: '#64748b' }} />
                  </button>

                  {showTimeframeDropdown && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '48px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      width: '160px',
                      overflow: 'hidden'
                    }}>
                      {['This Month', 'Last Month', 'This Year', 'All Time'].map((tf) => (
                        <button
                          key={tf}
                          onClick={() => {
                            setTimeframe(tf);
                            setShowTimeframeDropdown(false);
                          }}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 16px',
                            textAlign: 'left',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            color: timeframe === tf ? '#ea580c' : '#475569',
                            backgroundColor: timeframe === tf ? 'rgba(234, 88, 12, 0.08)' : 'transparent',
                            fontWeight: timeframe === tf ? '800' : '500',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => { if (timeframe !== tf) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                          onMouseOut={(e) => { if (timeframe !== tf) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4-Card Executive Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px'
              }}>
                
                {/* Metric 1: Revenue & Commission (Featured Warm Gradient Card) */}
                <div style={{
                  background: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
                  borderRadius: '20px',
                  padding: '24px',
                  color: '#ffffff',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px -5px rgba(234, 88, 12, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  minHeight: '140px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.85)' }}>
                        TOTAL COMMISSION REVENUE
                      </span>
                      <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '6px 0 0 0', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                        {getMetricsByTimeframe().commission}
                      </h2>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Percent size={20} style={{ color: '#ffffff' }} />
                    </div>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, width: 'fit-content', marginTop: '14px', zIndex: 2 }}>
                    {getMetricsByTimeframe().commissionTrendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{getMetricsByTimeframe().commissionTrend}</span>
                  </div>

                  {/* Decorative Background Pattern */}
                  <div style={{ position: 'absolute', right: '-15px', bottom: '-20px', opacity: 0.15, pointerEvents: 'none', zIndex: 1 }}>
                    <svg width="140" height="110" viewBox="0 0 140 110" fill="none">
                      <rect width="140" height="110" rx="16" fill="white" />
                      <circle cx="70" cy="55" r="35" stroke="white" strokeWidth="6" />
                    </svg>
                  </div>
                </div>

                {/* Metric 2: Total Orders */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  minHeight: '140px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748b' }}>
                        TOTAL ORDERS
                      </span>
                      <h3 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 0 0' }}>
                        {getMetricsByTimeframe().activeSubs}
                      </h3>
                    </div>
                    <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#10b981', marginTop: '14px' }}>
                    <TrendingUp size={14} />
                    <span>{getMetricsByTimeframe().activeSubsTrend}</span>
                  </div>
                </div>

                {/* Metric 3: Avg Order Value */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  minHeight: '140px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748b' }}>
                        AVG ORDER VALUE
                      </span>
                      <h3 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 0 0' }}>
                        {getMetricsByTimeframe().avgOrder}
                      </h3>
                    </div>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={20} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#10b981', marginTop: '14px' }}>
                    <span>{getMetricsByTimeframe().avgOrderTrend}</span>
                  </div>
                </div>

                {/* Metric 4: Kitchen Network Partners */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  minHeight: '140px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748b' }}>
                        KITCHEN PARTNERS
                      </span>
                      <h3 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 0 0' }}>
                        {verificationQueue.filter(v => v.status === 'Approved' || v.is_verified).length + 4}
                      </h3>
                    </div>
                    <div style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)', color: '#d97706', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Store size={20} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: pendingVendorQueue.length > 0 ? '#d97706' : '#16a34a', marginTop: '14px' }}>
                    <AlertCircle size={14} />
                    <span>{pendingVendorQueue.length} awaiting verification</span>
                  </div>
                </div>
              </div>

              {/* Operations & Control Tier: Split Grid 7 : 5 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                alignItems: 'stretch'
              }}>
                
                {/* Left Column: Vendor Verification Queue Card Container */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(217, 119, 6, 0.12)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Store size={18} />
                        </div>
                        <div>
                          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            Vendor Verification Queue
                          </h2>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                            Verify newly registered kitchen partner applications.
                          </p>
                        </div>
                      </div>

                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: pendingVendorQueue.length > 0 ? '#dc2626' : '#16a34a',
                        color: '#ffffff',
                        padding: '4px 12px',
                        borderRadius: '99px'
                      }}>
                        {pendingVendorQueue.length} PENDING VENDORS
                      </span>
                    </div>

                    {/* Pending List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {pendingVendorQueue.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '36px 20px', color: '#16a34a', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                            <CheckCircle size={24} />
                          </div>
                          <p style={{ fontSize: '0.92rem', fontWeight: 800, margin: '0 0 4px 0', color: '#16a34a' }}>All vendor applications verified!</p>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>No pending vendor kitchen verifications at the moment.</p>
                        </div>
                      ) : (
                        pendingVendorQueue.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            style={{
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '14px',
                              padding: '14px 18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #fef3c7' }}>
                                <Store size={18} />
                              </div>
                              <div style={{ textAlign: 'left' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>{item.name}</h4>
                                <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>{item.detail}</p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              <button
                                onClick={() => handleRejectApp(item.id, item.name)}
                                title="Reject Application"
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '10px',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #fca5a5',
                                  color: '#dc2626',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <X size={16} />
                              </button>
                              <button
                                onClick={() => handleApproveApp(item.id, item.name)}
                                title="Approve Vendor"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '8px 14px',
                                  borderRadius: '10px',
                                  backgroundColor: '#16a34a',
                                  color: '#ffffff',
                                  fontWeight: 800,
                                  fontSize: '0.78rem',
                                  border: 'none',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <Check size={14} />
                                <span>Approve</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAllApplicationsModal(true)}
                    style={{
                      marginTop: '20px',
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>View All Vendor Applications ({verificationQueue.length})</span>
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Right Column: Platform System Controls & Operational Health */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '20px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Settings size={18} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          System Controls & Health
                        </h2>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                          Platform fee settings & backend sync status.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Commission Rate Control Card */}
                      <div style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '14px',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Percent size={18} />
                          </div>
                          <div style={{ textAlign: 'left' }}>
                            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>Commission Rate</h4>
                            <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>Currently {commissionRate}% platform fee per order</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setTempCommission(commissionRate); setIsEditingCommission(true); }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#0f172a',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          Edit Rate
                        </button>
                      </div>

                      {/* Health Indicator 1: Backend Sync */}
                      <div style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '14px',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: healthData.backend.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: healthData.backend.is_active ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Zap size={18} />
                          </div>
                          <div style={{ textAlign: 'left' }}>
                            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>Django API Backend</h4>
                            <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                              {healthData.backend.message} {healthData.backend.latency_ms > 0 && `• ${healthData.backend.latency_ms}ms`}
                            </p>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          color: healthData.backend.is_active ? '#16a34a' : '#dc2626',
                          backgroundColor: healthData.backend.is_active ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                          padding: '4px 10px',
                          borderRadius: '99px',
                          flexShrink: 0
                        }}>
                          {healthData.backend.is_active ? '🟢 ONLINE' : '🔴 OFFLINE'}
                        </span>
                      </div>

                      {/* Health Indicator 2: Security & OTP */}
                      <div style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '14px',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: healthData.brevo.is_active ? 'rgba(99, 102, 241, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: healthData.brevo.is_active ? '#6366f1' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Shield size={18} />
                          </div>
                          <div style={{ textAlign: 'left' }}>
                            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>Brevo Email OTP Service</h4>
                            <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>{healthData.brevo.message}</p>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          color: healthData.brevo.is_active ? '#16a34a' : '#d97706',
                          backgroundColor: healthData.brevo.is_active ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                          padding: '4px 10px',
                          borderRadius: '99px',
                          flexShrink: 0
                        }}>
                          {healthData.brevo.is_active ? (healthData.brevo.status === 'Active' ? '🟢 ACTIVE' : '🟡 FALLBACK ACTIVE') : '🔴 OFFLINE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Tier: Simplified 2-Column Complaints Section */}
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 className="dashboard-heading" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Recent Complaints & Support Tickets
                    </h2>
                  </div>
                  <button
                    className="control-action-btn"
                    onClick={() => setActiveTab('support')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      backgroundColor: '#ea580c',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
                    }}
                  >
                    <MessageSquare size={16} />
                    <span>Open Live Support Hub</span>
                  </button>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    
                    {/* Column 1: Customer Complaints */}
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={18} />
                        </div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Customer Complaints</h3>
                        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '3px 10px', borderRadius: '99px' }}>
                          {ticketsList.filter(t => t.userType === 'customer' && t.status !== 'closed').length} OPEN
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {ticketsList.filter(t => t.userType === 'customer' && t.status !== 'closed').length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '24px 16px', color: '#16a34a', fontSize: '0.84rem', fontWeight: 700, backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                            ✓ All customer complaints resolved!
                          </div>
                        ) : (
                          ticketsList
                            .filter(t => t.userType === 'customer' && t.status !== 'closed')
                            .map(ticket => {
                              const tId = ticket.ticket_id || ticket.id;
                              return (
                                <div
                                  key={tId}
                                  onClick={() => { setActiveTab('support'); setActiveTicketId(tId); }}
                                  style={{
                                    cursor: 'pointer',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                    transition: 'all 0.15s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                                      {tId} {ticket.orderId && ticket.orderId !== 'N/A' && `• ${ticket.orderId}`}
                                    </span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                                    Buyer: <strong style={{ color: '#334155' }}>{ticket.userName}</strong>
                                  </p>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>

                    {/* Column 2: Vendor Kitchen Complaints */}
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(217, 119, 6, 0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Store size={18} />
                        </div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Vendor Kitchen Complaints</h3>
                        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 800, color: '#d97706', backgroundColor: 'rgba(217, 119, 6, 0.1)', padding: '3px 10px', borderRadius: '99px' }}>
                          {ticketsList.filter(t => t.userType === 'vendor' && t.status !== 'closed').length} OPEN
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {ticketsList.filter(t => t.userType === 'vendor' && t.status !== 'closed').length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '24px 16px', color: '#16a34a', fontSize: '0.84rem', fontWeight: 700, backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                            ✓ All vendor kitchen complaints resolved!
                          </div>
                        ) : (
                          ticketsList
                            .filter(t => t.userType === 'vendor' && t.status !== 'closed')
                            .map(ticket => {
                              const tId = ticket.ticket_id || ticket.id;
                              return (
                                <div
                                  key={tId}
                                  onClick={() => { setActiveTab('support'); setActiveTicketId(tId); }}
                                  style={{
                                    cursor: 'pointer',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                    transition: 'all 0.15s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                                      {tId} {ticket.orderId && ticket.orderId !== 'N/A' && `• ${ticket.orderId}`}
                                    </span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                                    Buyer: <strong style={{ color: '#334155' }}>{ticket.userName}</strong>
                                  </p>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="animate-fade-in">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dashboard-title">Vendors Management</h1>
                  <p className="dashboard-subtitle">Oversee kitchen partners, manage verification approvals, and track quality metrics.</p>
                </div>
              </div>

              {/* Vendors KPI Grid */}
              <div className="vendors-metrics-grid">
                <div className="kpi-card-white vendors-metric-card">
                  <div className="kpi-card-inner">
                    <span className="kpi-card-label">ACTIVE VENDORS</span>
                    <h3 className="kpi-card-value">
                      {(verificationQueue || []).filter(v => v && (v.status === 'Approved' || v.is_verified)).length + (sellers || []).length}
                    </h3>
                  </div>
                  <div className="vendors-trend-badge green-badge">
                    <TrendingUp size={12} className="trend-arrow" />
                    <span>Live DB</span>
                  </div>
                </div>

                <div className="kpi-card-white vendors-metric-card border-gold-accent">
                  <div className="kpi-card-inner">
                    <span className="kpi-card-label">PENDING APPROVAL</span>
                    <h3 className="kpi-card-value">{(pendingVendorQueue || []).length}</h3>
                  </div>
                  <button
                    className="check-queue-btn"
                    onClick={() => setVendorStatusFilter(vendorStatusFilter === 'pending' ? 'all' : 'pending')}
                  >
                    {vendorStatusFilter === 'pending' ? 'Show All' : 'Check queue'}
                  </button>
                </div>

                <div className="kpi-card-white vendors-metric-card">
                  <div className="kpi-card-inner">
                    <span className="kpi-card-label">AVG. RATING</span>
                    <h3 className="kpi-card-value">{globalAvgRating}</h3>
                  </div>
                  <div className="rating-stars-outline" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    {Array.from({ length: Math.round(Number(globalAvgRating)) || 5 }).map((_, i) => (
                      <Star key={i} size={16} style={{ fill: '#f59e0b', stroke: '#f59e0b' }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Kitchen Performance Table */}
              <div style={{ marginTop: '24px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <h2 className="dashboard-heading" style={{ fontSize: '1.1rem', margin: 0 }}>Kitchen Quality Performance & DB Directory</h2>
                  
                  {/* Search and Status Filter */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Search vendor name, email, ID..."
                      value={vendorSearchQuery}
                      onChange={(e) => setVendorSearchQuery(e.target.value)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        outline: 'none',
                        width: '220px'
                      }}
                    />
                    <select
                      value={vendorStatusFilter}
                      onChange={(e) => setVendorStatusFilter(e.target.value)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      <option value="all">All Vendors</option>
                      <option value="verified">Verified Only</option>
                      <option value="pending">Pending Approval Only</option>
                    </select>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                        <th style={{ padding: '12px 8px', fontSize: '0.74rem', fontWeight: 850, color: '#64748b', textTransform: 'uppercase' }}>Kitchen Partner</th>
                        <th style={{ padding: '12px 8px', fontSize: '0.74rem', fontWeight: 850, color: '#64748b', textTransform: 'uppercase' }}>Details / Contact</th>
                        <th style={{ padding: '12px 8px', fontSize: '0.74rem', fontWeight: 850, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '12px 8px', fontSize: '0.74rem', fontWeight: 850, color: '#64748b', textTransform: 'uppercase' }}>Avg Rating</th>
                        <th style={{ padding: '12px 8px', fontSize: '0.74rem', fontWeight: 850, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Merge DB vendor queue with sellers list safely
                        const dbVendorsFormatted = (verificationQueue || [])
                          .filter(Boolean)
                          .map(v => {
                            const nameVal = v.name || v.full_name || v.email || 'Vendor Partner';
                            return {
                              id: v.id || v.real_id || String(Math.random()),
                              real_id: v.real_id || v.id,
                              name: nameVal,
                              email: v.email || '',
                              phone: v.phone || v.detail || 'N/A',
                              photo: v.photo || '/images/default-avatar.jpg',
                              status: v.status || (v.is_verified ? 'Verified' : 'Pending'),
                              is_verified: Boolean(v.is_verified || v.status === 'Approved' || v.status === 'Verified'),
                              detail: v.detail || `ID: ${v.id || 'N/A'}`
                            };
                          });

                        const catalogSellersFormatted = (sellers || [])
                          .filter(Boolean)
                          .map(s => {
                            const nameVal = s.name || 'Vendor Partner';
                            const cleanEmail = nameVal.toLowerCase().replace(/[^a-z0-9]/g, '');
                            return {
                              id: s.id || String(Math.random()),
                              real_id: s.id,
                              name: nameVal,
                              email: `${cleanEmail || 'vendor'}@campuslunch.com`,
                              phone: '+91 98765 43210',
                              photo: s.photo || '/images/default-avatar.jpg',
                              status: 'Verified',
                              is_verified: true,
                              detail: `${s.distance || '1.0 km'} • ${s.servingTime || 'Active Slot'}`
                            };
                          });

                        // Deduplicate by name or ID safely
                        const seenNames = new Set();
                        const combined = [];

                        [...dbVendorsFormatted, ...catalogSellersFormatted].forEach(item => {
                          const lowerName = (item.name || '').toLowerCase();
                          if (lowerName && !seenNames.has(lowerName)) {
                            seenNames.add(lowerName);
                            combined.push(item);
                          }
                        });

                        // Filter by search query & status
                        const queryLower = (vendorSearchQuery || '').toLowerCase();
                        const filtered = combined.filter(v => {
                          const nameMatches = (v.name || '').toLowerCase().includes(queryLower);
                          const emailMatches = (v.email || '').toLowerCase().includes(queryLower);
                          const phoneMatches = (v.phone || '').includes(queryLower);
                          const matchesQuery = !queryLower || nameMatches || emailMatches || phoneMatches;

                          const isVerified = Boolean(v.is_verified || v.status === 'Verified' || v.status === 'Approved');
                          const matchesStatus = vendorStatusFilter === 'all' ||
                            (vendorStatusFilter === 'verified' && isVerified) ||
                            (vendorStatusFilter === 'pending' && !isVerified);

                          return matchesQuery && matchesStatus;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
                                No vendor partners matching the selected filters.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map(vendor => {
                          const info = getSellerRatingInfo(vendor.name, vendor.id);
                          const isVerified = Boolean(vendor.is_verified || vendor.status === 'Verified' || vendor.status === 'Approved');

                          return (
                            <tr key={vendor.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                              <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src={vendor.photo} alt={vendor.name} style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }} />
                                <div>
                                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>{vendor.name}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{vendor.email}</div>
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '0.78rem', color: '#475569' }}>
                                <div>{vendor.detail}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{vendor.phone}</div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  color: isVerified ? '#16a34a' : '#d97706',
                                  backgroundColor: isVerified ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                                  padding: '4px 10px',
                                  borderRadius: '99px'
                                }}>
                                  {isVerified ? '🟢 Verified' : '🟡 Pending Approval'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b' }}>
                                ★ {info.rating} <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>({info.reviews})</span>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                {!isVerified ? (
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      onClick={() => handleApproveApp(vendor.id, vendor.name)}
                                      style={{
                                        padding: '5px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: '#16a34a',
                                        color: '#ffffff',
                                        fontWeight: 800,
                                        fontSize: '0.74rem',
                                        border: 'none',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectApp(vendor.id, vendor.name)}
                                      style={{
                                        padding: '5px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: '#ef4444',
                                        color: '#ffffff',
                                        fontWeight: 800,
                                        fontSize: '0.74rem',
                                        border: 'none',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleRejectApp(vendor.id, vendor.name)}
                                    style={{
                                      padding: '5px 12px',
                                      borderRadius: '8px',
                                      backgroundColor: '#ffffff',
                                      border: '1px solid #cbd5e1',
                                      color: '#64748b',
                                      fontWeight: 700,
                                      fontSize: '0.74rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Suspend
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Global Customer Reviews Feed */}
              <div style={{ marginTop: '24px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                <h2 className="dashboard-heading" style={{ fontSize: '1.1rem' }}>Global Reviews & Feedback Feed</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                  {(ratings || []).length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                      <p style={{ margin: 0, fontWeight: 700 }}>No feedback has been submitted yet</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem' }}>Customer review submissions will aggregate and appear here in real-time.</p>
                    </div>
                  ) : (
                    (ratings || []).map(review => {
                      const studentName = review.studentName || review.student_name || 'Student Customer';
                      const vendorName = review.vendorName || review.vendor_name || 'Vendor Kitchen';
                      const reviewDate = review.date || (review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recently');
                      const food = Number(review.foodRating || review.food_rating || 0);
                      const service = Number(review.serviceRating || review.service_rating || 0);

                      return (
                        <div key={review.id} style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{studentName}</span>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '6px' }}>rated <strong style={{ color: '#0f172a' }}>{vendorName}</strong></span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{reviewDate}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            <span style={{ color: '#d97706' }}>Food: ★{food}</span>
                            <span style={{ color: '#2563eb' }}>Service: ★{service}</span>
                          </div>
                          {review.comment && (
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', fontStyle: 'italic', lineHeight: '1.4' }}>
                              "{review.comment}"
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.02)', padding: '24px' }}>
              
              {/* Support Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <h1 className="dashboard-title" style={{ fontSize: '1.4rem', margin: 0 }}>Support & Help Center</h1>
                  <p className="dashboard-subtitle" style={{ margin: '4px 0 0 0' }}>Manage customer complaints, vendor inquiries, and live chat resolution.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '6px 14px', borderRadius: '99px' }}>
                    {ticketsList.filter(t => t.status !== 'closed').length} Active Open Tickets
                  </span>
                </div>
              </div>

              {/* 2-Column Workspace */}
              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', minHeight: '580px' }}>
                
                {/* Left Side: Tickets List & Filter */}
                <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* Search bar */}
                  <input
                    type="text"
                    placeholder="Search ticket ID or name..."
                    value={supportSearchQuery}
                    onChange={(e) => setSupportSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  />

                  {/* Filter Pills */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'customer', label: 'Customers' },
                      { id: 'vendor', label: 'Vendors' },
                      { id: 'closed', label: 'Closed' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setSupportTabFilter(tab.id)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: supportTabFilter === tab.id ? '#0f172a' : '#f1f5f9',
                          color: supportTabFilter === tab.id ? '#ffffff' : '#64748b'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tickets List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '500px', paddingRight: '4px' }}>
                    {(() => {
                      const filteredTickets = ticketsList.filter(t => {
                        const matchesQuery = !supportSearchQuery ||
                          t.ticket_id.toLowerCase().includes(supportSearchQuery.toLowerCase()) ||
                          t.userName.toLowerCase().includes(supportSearchQuery.toLowerCase()) ||
                          t.title.toLowerCase().includes(supportSearchQuery.toLowerCase());

                        const matchesTab = supportTabFilter === 'all' ? true :
                          supportTabFilter === 'closed' ? t.status === 'closed' :
                          t.userType === supportTabFilter && t.status !== 'closed';

                        return matchesQuery && matchesTab;
                      });

                      if (filteredTickets.length === 0) {
                        return (
                          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                            No tickets matching criteria.
                          </div>
                        );
                      }

                      return filteredTickets.map(t => {
                        const isActive = t.ticket_id === activeTicketId;
                        const isClosed = t.status === 'closed';

                        return (
                          <div
                            key={t.ticket_id}
                            onClick={() => setActiveTicketId(t.ticket_id)}
                            style={{
                              padding: '14px',
                              borderRadius: '12px',
                              backgroundColor: isActive ? 'rgba(133, 83, 0, 0.06)' : '#f8fafc',
                              border: isActive ? '1px solid #855300' : '1px solid #e2e8f0',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 850, color: '#0f172a' }}>#{t.ticket_id}</span>
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '99px',
                                color: isClosed ? '#64748b' : t.userType === 'vendor' ? '#d97706' : '#2563eb',
                                backgroundColor: isClosed ? '#e2e8f0' : t.userType === 'vendor' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(37, 99, 235, 0.1)'
                              }}>
                                {isClosed ? 'Closed' : t.userType === 'vendor' ? 'Vendor' : 'Customer'}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {t.title}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                              <span>{t.userName}</span>
                              <span>{t.created}</span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Right Side: Active Ticket Chat & Controls */}
                {(() => {
                  const currentT = ticketsList.find(t => t.ticket_id === activeTicketId) || ticketsList[0];
                  if (!currentT) {
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        Select a ticket to view conversation
                      </div>
                    );
                  }

                  const isClosed = currentT.status === 'closed';

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      
                      {/* Active Ticket Banner */}
                      <div style={{
                        padding: '16px 20px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '16px'
                      }}>
                        <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{currentT.title}</h3>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '3px 10px',
                              borderRadius: '99px',
                              color: isClosed ? '#475569' : '#15803d',
                              backgroundColor: isClosed ? '#f1f5f9' : 'rgba(22, 163, 74, 0.12)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {isClosed ? 'Closed' : '🟢 Open Live'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748b', flexWrap: 'wrap' }}>
                            <span>Ticket <strong>#{currentT.ticket_id}</strong></span>
                            <span>•</span>
                            <span>User: <strong style={{ color: '#334155' }}>{currentT.userName}</strong> ({currentT.userEmail || 'No email'})</span>
                            <span>•</span>
                            <span>Order: <strong style={{ color: '#334155' }}>{currentT.orderId}</strong></span>
                          </div>
                        </div>

                        <button
                          onClick={handleToggleTicketStatus}
                          style={{
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                            padding: '10px 18px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: isClosed ? '#2563eb' : '#16a34a',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: isClosed ? '0 4px 12px rgba(37, 99, 235, 0.25)' : '0 4px 12px rgba(22, 163, 74, 0.25)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Check size={16} />
                          <span>{isClosed ? 'Reopen Ticket' : 'Mark Resolved'}</span>
                        </button>
                      </div>

                      {/* Chat Messages Feed */}
                      <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '14px', padding: '16px', overflowY: 'auto', maxHeight: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activeTicketMessages.length === 0 ? (
                          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', padding: '32px' }}>
                            No messages in this ticket thread yet.
                          </div>
                        ) : (
                          activeTicketMessages.map((msg, idx) => {
                            const isUser = msg.sender === 'user';
                            return (
                              <div
                                key={msg.id || idx}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: isUser ? 'flex-start' : 'flex-end',
                                  width: '100%'
                                }}
                              >
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '3px' }}>
                                  {isUser ? currentT.userName : 'Support Admin'} • {msg.time}
                                </div>
                                <div
                                  style={{
                                    maxWidth: '75%',
                                    padding: '12px 16px',
                                    borderRadius: isUser ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                                    backgroundColor: isUser ? '#f1f5f9' : '#855300',
                                    color: isUser ? '#0f172a' : '#ffffff',
                                    fontSize: '0.85rem',
                                    lineHeight: '1.4',
                                    textAlign: 'left',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                  }}
                                >
                                  {msg.text}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Send Message Input */}
                      <form onSubmit={handleSendSupportMessage} style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                        <input
                          type="text"
                          placeholder={isClosed ? "This ticket is closed. Reopen to reply..." : `Type reply to ${currentT.userName}...`}
                          disabled={isClosed}
                          value={supportReplyText}
                          onChange={(e) => setSupportReplyText(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.86rem',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="submit"
                          disabled={isClosed || !supportReplyText.trim()}
                          style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: isClosed || !supportReplyText.trim() ? '#cbd5e1' : '#855300',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.86rem',
                            cursor: isClosed || !supportReplyText.trim() ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>Send</span>
                          <Send size={14} />
                        </button>
                      </form>

                    </div>
                  );
                })()}

              </div>

            </div>
          )}



          {activeTab === 'settings' && (
            <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              {/* Header block */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h1 className="dashboard-title" style={{ margin: 0 }}>Account & Security Settings</h1>
                    <span style={{
                      backgroundColor: 'rgba(22, 163, 74, 0.1)',
                      color: '#15803d',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '99px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span className="live-dot-pulse green"></span>
                      DB CONNECTED
                    </span>
                  </div>
                  <p className="dashboard-subtitle" style={{ margin: '4px 0 0 0' }}>
                    Manage your administrator profile credentials, two-factor authentication, and platform security.
                  </p>
                </div>

              </div>

              {/* Main Settings Grid: 2 Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>

                {/* Left Card: Admin Profile Form */}
                <div className="kpi-card-white" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#855300', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={22} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Admin Profile</h3>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Personal account details stored in Django DB</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Avatar Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
                        {adminProfileForm.fullName ? adminProfileForm.fullName.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div style={{ position: 'absolute', bottom: '0', right: '0', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#855300', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Camera size={10} />
                      </div>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{adminProfileForm.fullName}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>{adminProfileForm.email}</p>
                      <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.68rem', fontWeight: 800, color: '#855300', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                        {adminProfileForm.role}
                      </span>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <form onSubmit={handleSaveProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          FULL NAME *
                        </label>
                        <input
                          type="text"
                          value={adminProfileForm.fullName}
                          onChange={(e) => setAdminProfileForm({ ...adminProfileForm, fullName: e.target.value })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', backgroundColor: '#ffffff' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          PHONE NUMBER *
                        </label>
                        <input
                          type="text"
                          value={adminProfileForm.phone}
                          onChange={(e) => setAdminProfileForm({ ...adminProfileForm, phone: e.target.value })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', backgroundColor: '#ffffff' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        EMAIL ADDRESS *
                      </label>
                      <input
                        type="email"
                        value={adminProfileForm.email}
                        onChange={(e) => setAdminProfileForm({ ...adminProfileForm, email: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', backgroundColor: '#ffffff' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        ADMIN ROLE (LOCKED)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={adminProfileForm.role}
                          disabled
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
                        />
                        <Lock size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{
                        marginTop: '8px',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        backgroundColor: '#855300',
                        color: '#ffffff',
                        fontWeight: 800,
                        border: 'none',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      Save Profile Changes
                    </button>
                  </form>
                </div>

                {/* Right Card: Security & Credentials */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Security Controls Card */}
                  <div className="kpi-card-white" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={22} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Security & Login</h3>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Authentication preferences & account protection</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      
                      {/* Change Password Item */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => setShowChangePasswordModal(true)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Key size={18} />
                          </div>
                          <div>
                            <h5 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Change Password</h5>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Update account login password</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#855300', fontSize: '0.8rem', fontWeight: 700 }}>
                          <span>Update</span>
                          <ChevronRight size={16} />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Active Sessions Card */}
                  <div className="kpi-card-white" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Monitor size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Active Login Session</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Current browser authorization state</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Mac OS • Chrome Browser</p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>IP: 127.0.0.1 (Local Session)</p>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803d', backgroundColor: 'rgba(22, 163, 74, 0.12)', padding: '3px 10px', borderRadius: '99px' }}>
                        Active Now
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </main>

        {/* Onboard Vendor Modal */}
        {showOnboardModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }} onClick={() => setShowOnboardModal(false)}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              width: '90%',
              maxWidth: '480px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }} onClick={(e) => e.stopPropagation()}>
              <h2 className="dashboard-heading" style={{ fontSize: '1.3rem', marginBottom: '6px' }}>Onboard New Vendor Kitchen</h2>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.8rem', color: '#64748b' }}>
                Directly add a new verified kitchen partner to the system and Django database.
              </p>

              <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                    KITCHEN / VENDOR NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Rajasthani Tiffins"
                    value={onboardForm.name}
                    onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vendor@campuslunch.com"
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                    PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={onboardForm.phone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                    TEMPORARY LOGIN PASSWORD
                  </label>
                  <input
                    type="text"
                    required
                    value={onboardForm.password}
                    onChange={(e) => setOnboardForm({ ...onboardForm, password: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowOnboardModal(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#855300',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(133, 83, 0, 0.25)'
                    }}
                  >
                    Onboard Vendor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePasswordModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }} onClick={() => setShowChangePasswordModal(false)}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              width: '90%',
              maxWidth: '440px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }} onClick={(e) => e.stopPropagation()}>
              <h2 className="dashboard-heading" style={{ fontSize: '1.25rem', marginBottom: '6px' }}>Change Account Password</h2>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.8rem', color: '#64748b' }}>
                Update your account password in the Django database.
              </p>

              <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>
                    CURRENT PASSWORD *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>
                    NEW PASSWORD *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>
                    CONFIRM NEW PASSWORD *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#855300',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(133, 83, 0, 0.25)'
                    }}
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Verification Queue Modal */}
        {showAllApplicationsModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }} onClick={() => setShowAllApplicationsModal(false)}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '600px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 className="dashboard-heading" style={{ fontSize: '1.3rem', margin: 0 }}>Vendor Partner Applications</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>Review and verify kitchen onboarding requests.</p>
                </div>
                <button onClick={() => setShowAllApplicationsModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
                {verificationQueue.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    <CheckCircle size={48} style={{ color: '#22c55e', marginBottom: '12px' }} />
                    <p className="font-bold">No vendor applications</p>
                    <p style={{ fontSize: '0.85rem' }}>All vendor kitchen applications have been processed.</p>
                  </div>
                ) : (
                  verificationQueue.map((item) => (
                    <div key={item.id} className={`queue-card-item ${item.colorClass}`} style={{ margin: 0 }}>
                      <div className="queue-card-left">
                        <div className={`queue-icon-circle ${item.bgClass}`}>
                          <Store size={18} />
                        </div>
                        <div className="queue-card-info">
                          <h4>{item.name}</h4>
                          <p>{item.type} • {item.detail}</p>
                        </div>
                      </div>
                      <div className="queue-card-actions">
                        {item.status === 'Approved' ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.1)', padding: '4px 10px', borderRadius: '99px' }}>● APPROVED</span>
                        ) : item.status === 'Rejected' ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '4px 10px', borderRadius: '99px' }}>● REJECTED</span>
                        ) : (
                          <>
                            <button className="queue-reject-btn" title="Reject Application" onClick={() => handleRejectApp(item.id, item.name)}><X size={16} /></button>
                            <button className="queue-approve-btn" title="Approve Vendor" onClick={() => handleApproveApp(item.id, item.name)}>
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Commission Edit Modal */}
        {isEditingCommission && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }} onClick={() => setIsEditingCommission(false)}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            }} onClick={(e) => e.stopPropagation()}>
              <h2 className="dashboard-heading" style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Edit Commission Rate</h2>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>STANDARD RATE (%)</label>
                <input
                  type="number"
                  value={tempCommission}
                  onChange={(e) => setTempCommission(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    padding: '0 12px',
                    fontSize: '0.95rem'
                  }}
                  min="0"
                  max="100"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'end' }}>
                <button
                  onClick={() => setIsEditingCommission(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const rate = parseFloat(tempCommission);
                    if (!isNaN(rate) && rate >= 0 && rate <= 100) {
                      setCommissionRate(rate);
                      localStorage.setItem('admin_commission_rate', rate.toString());
                      window.dispatchEvent(new Event('commission_rate_updated'));
                      window.dispatchEvent(new Event('storage'));
                      try {
                        await updateCommissionRateApi(rate);
                      } catch (err) {
                        console.log("Could not update backend commission cache:", err);
                      }
                      setIsEditingCommission(false);
                      showNotification(`Commission rate updated to ${rate}%`, 'success');
                    } else {
                      alert("Please enter a valid rate between 0 and 100.");
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#855300',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Toast Alert */}
        {toast.visible && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: toast.type === 'success' ? '#22c55e' : '#ef4444',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 11000,
            fontWeight: 700,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{toast.message}</span>
          </div>
        )}

        <style>{`
          @keyframes slideIn {
            from {
              transform: translateY(-20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminDashboard;
