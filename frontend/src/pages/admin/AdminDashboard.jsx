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
  UploadCloud
} from 'lucide-react';

const ticketsData = {
  'TK-8821': {
    id: 'TK-8821',
    title: 'Meal Spilled during delivery',
    priority: 'Urgent',
    priorityClass: 'urgent',
    created: 'Oct 12, 10:42 AM',
    userName: 'John Doe',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop&q=80',
    userEmail: 'john.doe@gmail.com',
    userPhone: '+91 98765 43210',
    orderId: '#99212',
    orderTotal: '₹340.50',
    orderVendor: 'The Curry Pot',
    orderRider: 'K. Sharma',
    orderStatus: 'DELIVERED',
    userTier: 'Platinum',
    userOrdersCount: '152 lifetime orders',
    userRiskNote: 'No refund requests in the last 12 months. High-value customer.',
    userHostel: 'Hostel Block 4, Room 302',
    userEmergency: '+91 98888 77777',
    userDiet: 'Vegetarian'
  },
  'TK-8819': {
    id: 'TK-8819',
    title: 'Refund Request: Cold Food',
    priority: 'High',
    priorityClass: 'high',
    created: 'Oct 12, 09:30 AM',
    userName: 'Sara Riley',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&fit=crop&q=80',
    userEmail: 'sara.riley@yahoo.com',
    userPhone: '+91 87654 32109',
    orderId: '#99208',
    orderTotal: '₹185.00',
    orderVendor: 'Annapurna Kitchens',
    orderRider: 'M. Patel',
    orderStatus: 'DELIVERED',
    userTier: 'Gold',
    userOrdersCount: '48 lifetime orders',
    userRiskNote: '1 prior dispute resolution. Low risk.',
    userHostel: 'Hostel Block 2, Room 104',
    userEmergency: '+91 97777 66666',
    userDiet: 'Jain'
  },
  'TK-8815': {
    id: 'TK-8815',
    title: 'Vendor App Login Issue',
    priority: 'Medium',
    priorityClass: 'medium',
    created: 'Oct 12, 07:15 AM',
    userName: 'Spice Garden',
    userAvatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=80&fit=crop&q=80',
    userEmail: 'support@spicegarden.com',
    userPhone: '+91 76543 21098',
    orderId: 'N/A (App login)',
    orderTotal: 'N/A',
    orderVendor: 'Spice Garden',
    orderRider: 'N/A',
    orderStatus: 'N/A',
    userTier: 'Vendor Partner',
    userOrdersCount: '890 processed meals',
    userRiskNote: 'No platform violations. Premium partner.',
    userLicense: 'FSSAI-2026-8815-SG',
    userTimings: '10:00 AM - 08:00 PM'
  },
  'TK-8802': {
    id: 'TK-8802',
    title: 'New Subscription Inquiry',
    priority: 'Low',
    priorityClass: 'low',
    created: 'Oct 12, 05:00 AM',
    userName: 'Bob Corp',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop&q=80',
    userEmail: 'bulk@bobcorp.com',
    userPhone: '+91 65432 10987',
    orderId: 'N/A (Inquiry)',
    orderTotal: 'N/A',
    orderVendor: 'N/A',
    orderRider: 'N/A',
    orderStatus: 'N/A',
    userTier: 'Enterprise Lead',
    userOrdersCount: '0 orders (Prospect)',
    userRiskNote: 'Potential contract size: 50+ subscribers.'
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const context = useContext(StudentContext) || {};
  const sellers = context.sellers || [];
  const ratings = context.ratings || [];

  const getSellerRatingInfo = (sellerName) => {
    const matching = (ratings || []).filter(r => r.vendorName === sellerName);
    if (matching.length === 0) {
      return { rating: '0.0', reviews: 0 };
    }
    const sum = matching.reduce((acc, r) => acc + (Number(r.foodRating) + Number(r.serviceRating)) / 2, 0);
    const avg = (sum / matching.length).toFixed(1);
    return { rating: avg, reviews: matching.length };
  };

  const globalAvgRating = (() => {
    if ((ratings || []).length === 0) return '0.0';
    const sum = ratings.reduce((acc, r) => acc + (Number(r.foodRating) + Number(r.serviceRating)) / 2, 0);
    return (sum / ratings.length).toFixed(1);
  })();

  const [selectedTicket, setSelectedTicket] = useState('TK-8821');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [roundedCornersEnabled, setRoundedCornersEnabled] = useState(true);
  const [supportMessages, setSupportMessages] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState('');

  const currentTicketInfo = ticketsData[selectedTicket] || ticketsData['TK-8821'];

  useEffect(() => {
    // Seed initial messages for all tickets if they don't exist
    const initialSeed = {
      'TK-8821': [
        { id: 1, sender: "admin", text: "Hi there! Welcome to Campus Lunch Live Support. 👋 How can we help you today?", time: "10:30 AM" },
        { id: 2, sender: "user", text: "Hi support, I just received my order (#99212) from 'The Curry Pot' but the dal container was completely crushed. Half of it is in the bag. Can I get a refund or a replacement? I'm quite hungry!", time: "10:42 AM" },
        { id: 3, sender: "admin", text: "I'm so sorry to hear that, John! That's definitely not the experience we want for you. I've already reached out to the dispatch team. Would you prefer a fresh replacement or a full refund to your wallet?", time: "10:48 AM" }
      ],
      'TK-8819': [
        { id: 1, sender: "user", text: "My meal was delivered completely cold and it took almost 90 minutes. I would like a refund.", time: "09:30 AM" },
        { id: 2, sender: "admin", text: "Hello Sara, I am so sorry for the delay. I have initiated a refund of ₹185 to your wallet.", time: "09:40 AM" }
      ],
      'TK-8815': [
        { id: 1, sender: "user", text: "I cannot login to the vendor partner app. It says FSSAI credential verification pending.", time: "07:15 AM" },
        { id: 2, sender: "admin", text: "Hello Spice Garden, our admin team is reviewing your FSSAI documents. We will approve it shortly.", time: "07:30 AM" }
      ],
      'TK-8802': [
        { id: 1, sender: "user", text: "Do you offer corporate discounts for recurring bulk tiffin subscriptions?", time: "05:00 AM" }
      ]
    };

    Object.keys(initialSeed).forEach(tId => {
      const key = `support_chat_messages_${tId}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(initialSeed[tId]));
      }
    });
  }, []);

  // Sync active ticket's chat state & set up polling
  useEffect(() => {
    const activeKey = `support_chat_messages_${selectedTicket}`;
    const saved = localStorage.getItem(activeKey);
    if (saved) {
      setSupportMessages(JSON.parse(saved));
    }

    const interval = setInterval(() => {
      const current = localStorage.getItem(activeKey);
      if (current) {
        const parsed = JSON.parse(current);
        setSupportMessages(prev => {
          if (prev.length !== parsed.length || (prev.length > 0 && prev[prev.length - 1].id !== parsed[parsed.length - 1].id)) {
            return parsed;
          }
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedTicket]);

  const handleAdminSendReply = () => {
    if (!adminReplyText.trim()) return;
    const newReply = {
      id: Date.now(),
      sender: "admin",
      text: adminReplyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const activeKey = `support_chat_messages_${selectedTicket}`;
    const currentSaved = localStorage.getItem(activeKey);
    const list = currentSaved ? JSON.parse(currentSaved) : [];
    const updated = [...list, newReply];
    localStorage.setItem(activeKey, JSON.stringify(updated));
    setSupportMessages(updated);
    setAdminReplyText('');
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/');
  };

  // Dynamic header configuration based on the active tab
  const getHeaderConfig = () => {
    if (activeTab === 'vendors') {
      return {
        searchPlaceholder: "Search vendors, IDs, or locations...",
        adminName: "Alex Rivera",
        adminAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80"
      };
    } else if (activeTab === 'support') {
      return {
        searchPlaceholder: "Search tickets, vendors, or customers...",
        adminName: "Alex Chen",
        adminAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&q=80"
      };
    } else if (activeTab === 'system') {
      return {
        searchPlaceholder: "Search system logs or configurations...",
        adminName: "Admin User",
        adminAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80"
      };
    } else if (activeTab === 'settings') {
      return {
        searchPlaceholder: "Search settings, users, or system logs...",
        adminName: "Sarah Jenkins",
        adminAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80"
      };
    }
    return {
      searchPlaceholder: "Search orders, vendors or students...",
      adminName: "Admin User",
      adminAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80"
    };
  };

  const headerConfig = getHeaderConfig();

  // API Health bar heights (pixel-perfect replica of the mockups)
  const healthBars = [
    { height: '55%', highlight: false },
    { height: '40%', highlight: false },
    { height: '75%', highlight: false },
    { height: '70%', highlight: false },
    { height: '58%', highlight: true }, 
    { height: '85%', highlight: false },
    { height: '45%', highlight: false },
    { height: '52%', highlight: false },
    { height: '78%', highlight: false },
    { height: '62%', highlight: true }, 
    { height: '48%', highlight: false },
    { height: '58%', highlight: false },
    { height: '90%', highlight: true }, 
    { height: '50%', highlight: false },
    { height: '64%', highlight: false },
    { height: '72%', highlight: false },
  ];

  return (
    <div className="admin-portal-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo-box">
            {/* TiffinHub Fork/Knife Custom Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="brand-details">
            <span className="brand-title">TiffinHub</span>
            <span className="brand-subtitle">ADMIN PORTAL</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Grid size={18} />
            <span>Overview</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendors')}
          >
            <Store size={18} />
            <span>Vendors</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <MessageSquare size={18} />
            <span>Support</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <Cpu size={18} />
            <span>System</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="new-dispatch-btn">
            <Plus size={16} />
            <span>New Dispatch</span>
          </button>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
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
            <button className="header-icon-btn notification-bell">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <button className="header-icon-btn">
              <HelpCircle size={20} />
            </button>
            <div className="header-divider"></div>
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
            <div className="animate-fade-in">
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dashboard-title">Platform Revenue</h1>
                  <p className="dashboard-subtitle">Monthly growth and commission stats tracking.</p>
                </div>
                <button className="timeframe-dropdown-btn">
                  <span>This Month</span>
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* Metrics Row */}
              <div className="admin-metrics-grid">
                {/* Total Commission Card (Orange Gradient) */}
                <div className="commission-card-orange">
                  <div className="commission-card-content">
                    <span className="commission-card-label">TOTAL COMMISSION</span>
                    <h2 className="commission-card-value">₹4,82,900</h2>
                    <div className="commission-trend-badge">
                      <TrendingUp size={12} />
                      <span>+12.5% vs last month</span>
                    </div>
                  </div>
                  <div className="orange-card-decor">
                    <svg width="150" height="100" viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="150" height="100" rx="14" fill="white" fillOpacity="0.08"/>
                      <rect x="6" y="6" width="138" height="88" rx="8" stroke="white" strokeWidth="2.5" strokeOpacity="0.12"/>
                      <circle cx="75" cy="50" r="22" stroke="white" strokeWidth="4" strokeOpacity="0.15"/>
                      <rect x="14" y="14" width="28" height="18" rx="4" fill="white" fillOpacity="0.1"/>
                      <rect x="108" y="68" width="28" height="18" rx="4" fill="white" fillOpacity="0.1"/>
                    </svg>
                  </div>
                </div>

                {/* Small Stat Card 1: Active Subs */}
                <div className="kpi-card-white">
                  <div className="kpi-card-inner">
                    <span className="kpi-card-label">Active Subs</span>
                    <h3 className="kpi-card-value">1,240</h3>
                  </div>
                  <div className="kpi-trend-badge trend-up">
                    <TrendingUp size={14} />
                    <span>+4%</span>
                  </div>
                </div>

                {/* Small Stat Card 2: Avg Order */}
                <div className="kpi-card-white">
                  <div className="kpi-card-inner">
                    <span className="kpi-card-label">Avg. Order</span>
                    <h3 className="kpi-card-value">₹185</h3>
                  </div>
                  <div className="kpi-trend-badge trend-down">
                    <TrendingDown size={14} />
                    <span>-2%</span>
                  </div>
                </div>
              </div>

              {/* Split Row: Queue and Complaints */}
              <div className="dashboard-split-row">
                <div className="verification-queue-column">
                  <div className="queue-header">
                    <h2 className="dashboard-heading" style={{ fontSize: '1.25rem' }}>Verification Queue</h2>
                    <span className="queue-pending-badge">12 PENDING</span>
                  </div>

                  <div className="queue-list">
                    <div className="queue-card-item accent-gold">
                      <div className="queue-card-left">
                        <div className="queue-icon-circle bg-peach">
                          <Store size={18} />
                        </div>
                        <div className="queue-card-info">
                          <h4>Annapurna Kitchens</h4>
                          <p>Vendor • ID: V-9921</p>
                        </div>
                      </div>
                      <div className="queue-card-actions">
                        <button className="queue-reject-btn"><X size={16} /></button>
                        <button className="queue-approve-btn">
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>

                    <div className="queue-card-item accent-blue">
                      <div className="queue-card-left">
                        <div className="queue-icon-circle bg-blue">
                          <GraduationCap size={18} />
                        </div>
                        <div className="queue-card-info">
                          <h4>Rohan Mehta</h4>
                          <p>Student • IIT Bombay</p>
                        </div>
                      </div>
                      <div className="queue-card-actions">
                        <button className="queue-reject-btn"><X size={16} /></button>
                        <button className="queue-approve-btn">
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button className="view-applications-btn">
                    <span>View All Applications</span>
                  </button>
                </div>

                <div className="open-tickets-column">
                  <div className="tickets-card-container">
                    <div className="tickets-header-row">
                      <div>
                        <span className="tickets-label">RECENT COMPLAINTS</span>
                        <h2 className="dashboard-heading controls-title" style={{ fontSize: '1.25rem' }}>Open Tickets</h2>
                      </div>
                      <div className="tickets-avatars-group">
                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop&q=80" alt="User 1" />
                        <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&fit=crop&q=80" alt="User 2" />
                        <span className="more-avatars-badge">+5</span>
                      </div>
                    </div>

                    <div className="tickets-list">
                      <div 
                        className="ticket-item-card" 
                        onClick={() => { setActiveTab('support'); setSelectedTicket('TK-8821'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="ticket-icon-box bg-pink"><AlertCircle size={18} /></div>
                        <div className="ticket-info">
                          <h4>Late Delivery: Order #8821</h4>
                          <p>Assigned to: Support Agent 04 • Click to View</p>
                        </div>
                      </div>

                      <div 
                        className="ticket-item-card" 
                        onClick={() => { setActiveTab('support'); setSelectedTicket('TK-8819'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="ticket-icon-box bg-green"><MessageSquare size={18} /></div>
                        <div className="ticket-info">
                          <h4>Vendor Dispute: Refund Request</h4>
                          <p>Awaiting vendor response (2h) • Click to View</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Controls */}
              <div className="system-controls-section">
                <h2 className="dashboard-heading controls-title" style={{ fontSize: '1.25rem' }}>System Controls</h2>
                <div className="controls-grid">
                  <div className="control-item-card">
                    <div className="control-card-left">
                      <div className="control-icon-circle"><Percent size={18} /></div>
                      <div className="control-info">
                        <h4>Commission Rate</h4>
                        <p>Currently 12% per order</p>
                      </div>
                    </div>
                    <button className="control-action-btn">Edit</button>
                  </div>

                  <div className="control-item-card">
                    <div className="control-card-left">
                      <div className="control-icon-circle"><Tag size={18} /></div>
                      <div className="control-info">
                        <h4>Subscription Plans</h4>
                        <p>4 Active student tiers</p>
                      </div>
                    </div>
                    <button className="control-action-btn">Manage</button>
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
                  <p className="dashboard-subtitle">Oversee kitchen performance, manage credentials, and track logistic efficiencies.</p>
                </div>
                <div className="header-action-buttons">
                  <button className="vendors-filters-btn">
                    <SlidersHorizontal size={16} />
                    <span>Filters</span>
                  </button>
                  <button className="onboard-vendor-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>Onboard Vendor</span>
                  </button>
                </div>
              </div>

              {/* Vendors KPI Grid */}
              <div className="vendors-metrics-grid">
                <div className="kpi-card-white vendors-metric-card">
                  <div className="kpi-card-inner">
                    <span className="kpi-card-label">ACTIVE VENDORS</span>
                    <h3 className="kpi-card-value">124</h3>
                  </div>
                  <div className="vendors-trend-badge green-badge">
                    <TrendingUp size={12} className="trend-arrow" />
                    <span>12%</span>
                  </div>
                </div>

                <div className="kpi-card-white vendors-metric-card border-gold-accent">
                  <div className="kpi-card-inner">
                    <span className="kpi-card-label">PENDING APPROVAL</span>
                    <h3 className="kpi-card-value">18</h3>
                  </div>
                  <button className="check-queue-btn">Check queue</button>
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
                <h2 className="dashboard-heading" style={{ fontSize: '1.1rem' }}>Kitchen Quality Performance</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                        <th style={{ padding: '12px 8px', fontSize: '0.74rem', fontWeight: 850, color: '#64748b', textTransform: 'uppercase' }}>Kitchen Partner</th>
                        <th style={{ padding: '12px 8px', fontSize: '0.74rem', fontWeight: 850, color: '#64748b', textTransform: 'uppercase' }}>Distance</th>
                        <th style={{ padding: '12px 8px', fontSize: '0.74rem', fontWeight: 850, color: '#64748b', textTransform: 'uppercase' }}>Service Slot</th>
                        <th style={{ padding: '12px 8px', fontSize: '0.74rem', fontWeight: 850, color: '#64748b', textTransform: 'uppercase' }}>Avg Rating</th>
                        <th style={{ padding: '12px 8px', fontSize: '0.74rem', fontWeight: 850, color: '#64748b', textTransform: 'uppercase' }}>Reviews Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sellers || []).map(seller => {
                        const info = getSellerRatingInfo(seller.name);
                        return (
                          <tr key={seller.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={seller.photo} alt={seller.name} style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{seller.name}</span>
                            </td>
                            <td style={{ padding: '12px 8px', fontSize: '0.78rem', color: '#475569' }}>{seller.distance}</td>
                            <td style={{ padding: '12px 8px', fontSize: '0.78rem', color: '#475569' }}>{seller.servingTime}</td>
                            <td style={{ padding: '12px 8px', fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b' }}>★ {info.rating}</td>
                            <td style={{ padding: '12px 8px', fontSize: '0.78rem', color: '#475569' }}>{info.reviews} reviews</td>
                          </tr>
                        );
                      })}
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
                    (ratings || []).map(review => (
                      <div key={review.id} style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{review.studentName}</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '6px' }}>rated <strong style={{ color: '#0f172a' }}>{review.vendorName}</strong></span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{review.date}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                          <span style={{ color: '#d97706' }}>Food: ★{review.foodRating}</span>
                          <span style={{ color: '#2563eb' }}>Service: ★{review.serviceRating}</span>
                        </div>
                        {review.comment && (
                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', fontStyle: 'italic', lineHeight: '1.4' }}>
                            "{review.comment}"
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="support-tickets-workspace animate-fade-in">
              {/* Left Column: Tickets List */}
              <div className="support-tickets-sidebar">
                <div className="tickets-sidebar-header">
                  <div className="flex items-center gap-2">
                    <h2>Tickets</h2>
                    <span className="active-tickets-badge">12 Active</span>
                  </div>
                  <div className="tickets-tab-triggers">
                    <button className="ticket-tab-btn active">All Open</button>
                    <button className="ticket-tab-btn">Delivery Issues</button>
                  </div>
                </div>

                <div className="tickets-sidebar-list">
                  {/* Ticket 1 */}
                  <div 
                    className={`ticket-sidebar-card ${selectedTicket === 'TK-8821' ? 'active' : ''}`}
                    onClick={() => setSelectedTicket('TK-8821')}
                  >
                    <div className="ticket-card-header">
                      <span className="ticket-id-tag">#TK-8821</span>
                      <span className="ticket-priority-pill urgent">URGENT</span>
                    </div>
                    <h4>Meal Spilled during delivery</h4>
                    <p className="ticket-card-snippet">Order #99212 - Customer reporting the container was...</p>
                    <div className="ticket-card-footer">
                      <div className="ticket-user-initials bg-peach-tint">JD</div>
                      <span className="ticket-user-name">John Doe</span>
                      <span className="ticket-card-time">12m ago</span>
                    </div>
                  </div>

                  {/* Ticket 2 */}
                  <div 
                    className={`ticket-sidebar-card ${selectedTicket === 'TK-8819' ? 'active' : ''}`}
                    onClick={() => setSelectedTicket('TK-8819')}
                  >
                    <div className="ticket-card-header">
                      <span className="ticket-id-tag">#TK-8819</span>
                      <span className="ticket-priority-pill high">HIGH</span>
                    </div>
                    <h4>Refund Request: Cold Food</h4>
                    <p className="ticket-card-snippet">Customer claims delivery took over 90 minutes. Temperatur...</p>
                    <div className="ticket-card-footer">
                      <div className="ticket-user-initials bg-blue-tint">SR</div>
                      <span className="ticket-user-name">Sara Riley</span>
                      <span className="ticket-card-time">1h ago</span>
                    </div>
                  </div>

                  {/* Ticket 3 */}
                  <div 
                    className={`ticket-sidebar-card ${selectedTicket === 'TK-8815' ? 'active' : ''}`}
                    onClick={() => setSelectedTicket('TK-8815')}
                  >
                    <div className="ticket-card-header">
                      <span className="ticket-id-tag">#TK-8815</span>
                      <span className="ticket-priority-pill medium">MEDIUM</span>
                    </div>
                    <h4>Vendor App Login Issue</h4>
                    <p className="ticket-card-snippet">Spice Garden (Vendor ID: SG-02) unable to update stock vi...</p>
                    <div className="ticket-card-footer">
                      <div className="ticket-user-initials bg-purple-tint">SG</div>
                      <span className="ticket-user-name">Spice Garden</span>
                      <span className="ticket-card-time">3h ago</span>
                    </div>
                  </div>

                  {/* Ticket 4 */}
                  <div 
                    className={`ticket-sidebar-card ${selectedTicket === 'TK-8802' ? 'active' : ''}`}
                    onClick={() => setSelectedTicket('TK-8802')}
                  >
                    <div className="ticket-card-header">
                      <span className="ticket-id-tag">#TK-8802</span>
                      <span className="ticket-priority-pill low">LOW</span>
                    </div>
                    <h4>New Subscription Inquiry</h4>
                    <p className="ticket-card-snippet">Enterprise query for corporate bulk lunches. Interested in...</p>
                    <div className="ticket-card-footer">
                      <div className="ticket-user-initials bg-gray-tint">BC</div>
                      <span className="ticket-user-name">Bob Corp</span>
                      <span className="ticket-card-time">5h ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column: Chat Feed & Editor */}
              <div className="support-chat-pane">
                <div className="chat-pane-header">
                  <div className="chat-header-left">
                    <div className="header-alert-icon">
                      <AlertCircle size={20} />
                    </div>
                    <div className="header-text-block">
                      <div className="flex items-center gap-2">
                        <h3>{currentTicketInfo.title}</h3>
                        <span className={`ticket-priority-pill ${currentTicketInfo.priorityClass} font-bold`}>{currentTicketInfo.priority}</span>
                      </div>
                      <p>Ticket #{currentTicketInfo.id} • Created {currentTicketInfo.created}</p>
                    </div>
                  </div>

                  <div className="chat-header-actions">
                    <button className="chat-action-btn" title="Print"><Printer size={18} /></button>
                    <button className="chat-action-btn" title="More"><MoreVertical size={18} /></button>
                    <button className="resolve-ticket-btn">
                      <Check size={14} />
                      <span>Resolve</span>
                    </button>
                  </div>
                </div>

                <div className="chat-conversation-feed">
                  {supportMessages.map(msg => {
                    if (msg.sender === 'user') {
                      return (
                        <div className="chat-message-row customer-msg" key={msg.id}>
                          <img 
                            src={currentTicketInfo.userAvatar} 
                            alt={currentTicketInfo.userName} 
                            className="chat-avatar-circle" 
                          />
                          <div className="chat-message-bubble-wrapper">
                            <div className="chat-bubble-header">
                              <span className="bubble-sender-name">{currentTicketInfo.userName}</span>
                              <span className="bubble-timestamp">{msg.time}</span>
                            </div>
                            <div className="chat-bubble-body">
                              <p>{msg.text}</p>
                              {/* Show dal image container for initial spilled container text ID */}
                              {msg.id === 2 && (
                                <div className="chat-attached-image">
                                  <img 
                                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&fit=crop&q=80" 
                                    alt="Spilled dal container soup" 
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="chat-message-row support-msg" key={msg.id}>
                          <div className="chat-message-bubble-wrapper">
                            <div className="chat-bubble-header justify-end">
                              <span className="bubble-timestamp">{msg.time}</span>
                              <span className="bubble-sender-name">Support (You)</span>
                            </div>
                            <div className="chat-bubble-body support-bubble">
                              <p>{msg.text}</p>
                            </div>
                          </div>
                          <img 
                            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&q=80" 
                            alt="Alex Chen" 
                            className="chat-avatar-circle" 
                          />
                        </div>
                      );
                    }
                  })}
                </div>

                <div className="chat-reply-container">
                  <div className="chat-reply-editor-header">
                    <div className="editor-formatting-tools">
                      <button className="formatting-btn"><Bold size={16} /></button>
                      <button className="formatting-btn"><Italic size={16} /></button>
                      <button className="formatting-btn"><Paperclip size={16} /></button>
                    </div>
                    <div className="editor-divider"></div>
                    <div className="canned-responses-trigger">
                      <span>Insert Canned Response...</span>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  
                  <textarea 
                    placeholder={`Type your response to ${currentTicketInfo.userName}...`} 
                    className="reply-textarea-input"
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                  ></textarea>

                  <div className="chat-reply-footer">
                    <label className="notify-checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Notify via Push & Email</span>
                    </label>

                    <div className="reply-action-buttons">
                      <button className="save-draft-link">Save Draft</button>
                      <button className="send-reply-btn" onClick={handleAdminSendReply}>
                        <span>Send Reply</span>
                        <Send size={14} className="send-arrow-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Linked Order and Customer Info */}
              <div className="support-details-sidebar">
                <div className="details-section-card">
                  <span className="details-section-label">Linked Order</span>
                  <div className="details-order-box">
                    <div className="order-box-icon-container">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="order-box-id">{currentTicketInfo.orderId}</h4>
                      <p className="order-box-total">Total: {currentTicketInfo.orderTotal}</p>
                    </div>
                  </div>
                  
                  <div className="order-details-rows">
                    <div className="order-detail-row">
                      <span className="row-key">Vendor:</span>
                      <span className="row-value font-bold">{currentTicketInfo.orderVendor}</span>
                    </div>
                    <div className="order-detail-row">
                      <span className="row-key">Rider:</span>
                      <span className="row-value font-bold text-orange-accent">{currentTicketInfo.orderRider}</span>
                    </div>
                    <div className="order-detail-row items-center">
                      <span className="row-key">Status:</span>
                      <span className="order-status-badge">{currentTicketInfo.orderStatus}</span>
                    </div>
                  </div>

                  <button className="view-order-details-btn">
                    <span>View Order Detail</span>
                  </button>
                </div>

                <div className="details-section-card">
                  <span className="details-section-label">User Profile Details</span>
                  <div className="order-details-rows">
                    <div className="order-detail-row">
                      <span className="row-key">Full Name:</span>
                      <span className="row-value font-bold">{currentTicketInfo.userName}</span>
                    </div>
                    <div className="order-detail-row">
                      <span className="row-key">Email:</span>
                      <span className="row-value font-bold" style={{ wordBreak: 'break-all' }}>{currentTicketInfo.userEmail}</span>
                    </div>
                    <div className="order-detail-row">
                      <span className="row-key">Phone:</span>
                      <span className="row-value font-bold">{currentTicketInfo.userPhone}</span>
                    </div>
                    {currentTicketInfo.userHostel && (
                      <>
                        <div className="order-detail-row">
                          <span className="row-key">Hostel & Room:</span>
                          <span className="row-value font-bold text-orange-accent">{currentTicketInfo.userHostel}</span>
                        </div>
                        <div className="order-detail-row">
                          <span className="row-key">Emergency:</span>
                          <span className="row-value font-bold">{currentTicketInfo.userEmergency}</span>
                        </div>
                        <div className="order-detail-row">
                          <span className="row-key">Diet Preference:</span>
                          <span className="row-value font-bold">{currentTicketInfo.userDiet}</span>
                        </div>
                      </>
                    )}
                    {currentTicketInfo.userLicense && (
                      <>
                        <div className="order-detail-row">
                          <span className="row-key">FSSAI License:</span>
                          <span className="row-value font-bold text-orange-accent">{currentTicketInfo.userLicense}</span>
                        </div>
                        <div className="order-detail-row">
                          <span className="row-key">Kitchen Hours:</span>
                          <span className="row-value font-bold">{currentTicketInfo.userTimings}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="details-section-card">
                  <span className="details-section-label">Customer Insights</span>
                  <div className="details-order-box">
                    <div className="order-box-icon-container bg-gray">
                      <Tag size={18} />
                    </div>
                    <div>
                      <h4 className="order-box-id">Tier: {currentTicketInfo.userTier}</h4>
                      <p className="order-box-total">{currentTicketInfo.userOrdersCount}</p>
                    </div>
                  </div>

                  <div className="customer-risk-note-box">
                    <span className="risk-note-title">Risk Note:</span>
                    <p className="risk-note-body">{currentTicketInfo.userRiskNote}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="animate-fade-in">
              {/* Infrastructure header */}
              <div className="dashboard-header-row">
                <div>
                  <span className="system-breadcrumb-label">INFRASTRUCTURE &gt; SYSTEM HEALTH</span>
                  <h1 className="dashboard-title" style={{ marginTop: '4px' }}>System Control Center</h1>
                  <p className="dashboard-subtitle">Global monitoring, database orchestration, and revenue tiering management.</p>
                </div>
                <div className="header-action-buttons">
                  <button className="purge-cache-btn">
                    <RotateCw size={16} />
                    <span>Purge Cache</span>
                  </button>
                  <button className="deploy-changes-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                    <span>Deploy Changes</span>
                  </button>
                </div>
              </div>

              {/* Top Row: Chart & Database metrics */}
              <div className="system-metrics-container">
                {/* Live API Health Panel (approx 70% width) */}
                <div className="kpi-card-white api-health-card">
                  <div className="api-health-header-row">
                    <div className="flex items-center gap-2">
                      <span className="live-dot-pulse"></span>
                      <h3 className="api-health-title">Live API Health</h3>
                    </div>
                    <div className="flex gap-2">
                      <span className="api-badge-info">CLUSTER-A (PRIMARY)</span>
                      <span className="api-badge-region">REGION: US-EAST-1</span>
                    </div>
                  </div>

                  {/* Columns chart */}
                  <div className="api-chart-container">
                    {healthBars.map((bar, idx) => (
                      <div 
                        key={idx} 
                        className={`api-chart-bar-col ${bar.highlight ? 'highlight-bar' : ''}`}
                        style={{ height: bar.height }}
                      ></div>
                    ))}
                  </div>

                  {/* Summary grid */}
                  <div className="api-chart-summary-grid">
                    <div className="summary-stat-box">
                      <span className="summary-stat-label">LATENCY</span>
                      <span className="summary-stat-value">42ms</span>
                    </div>
                    <div className="summary-stat-box">
                      <span className="summary-stat-label text-green-success">SUCCESS RATE</span>
                      <span className="summary-stat-value text-green-success">99.98%</span>
                    </div>
                    <div className="summary-stat-box">
                      <span className="summary-stat-label">THROUGHPUT</span>
                      <span className="summary-stat-value">12k/s</span>
                    </div>
                    <div className="summary-stat-box">
                      <span className="summary-stat-label text-red-error">ERRORS (24H)</span>
                      <span className="summary-stat-value text-red-error">0.02%</span>
                    </div>
                  </div>
                </div>

                {/* Database Metrics stack (approx 30% width) */}
                <div className="database-metrics-stack">
                  {/* Redis Card */}
                  <div className="kpi-card-white db-metric-card">
                    <div className="db-card-header">
                      <h4>Redis Cache</h4>
                      <span className="db-status-badge stable">STABLE</span>
                    </div>
                    <div className="db-card-details">
                      <span className="db-detail-key">Memory Usage</span>
                      <span className="db-detail-val font-bold">4.2 / 8.0 GB</span>
                    </div>
                    <div className="db-progress-container">
                      <div className="db-progress-bar" style={{ width: '52.5%' }}></div>
                    </div>
                  </div>

                  {/* PostgreSQL Card */}
                  <div className="kpi-card-white db-metric-card">
                    <div className="db-card-header">
                      <h4>PostgreSQL</h4>
                      <span className="db-status-badge stable">STABLE</span>
                    </div>
                    <div className="db-card-details">
                      <span className="db-detail-key">Connections</span>
                      <span className="db-detail-val font-bold">142 / 500</span>
                    </div>
                    <div className="db-progress-container">
                      <div className="db-progress-bar" style={{ width: '28.4%' }}></div>
                    </div>
                  </div>

                  {/* Auto-Backup Dark Slate Card */}
                  <div className="auto-backup-dark-card">
                    <div className="backup-card-header">
                      <span className="backup-label">AUTO-BACKUP</span>
                      <Cloud size={18} className="cloud-icon" />
                    </div>
                    <h3 className="backup-sync-time">Last Sync: 14m ago</h3>
                    <button className="manual-trigger-btn">MANUAL TRIGGER</button>
                  </div>
                </div>
              </div>

              {/* Middle Row: Commission & Vendor Subscription Tiers */}
              <div className="system-config-grid">
                {/* Commission Config Form Card */}
                <div className="kpi-card-white config-panel-card">
                  <div className="config-card-title-row">
                    <div className="config-icon-box bg-orange-tint">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <line x1="12" y1="4" x2="12" y2="20" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                      </svg>
                    </div>
                    <h3>Commission Config</h3>
                  </div>

                  <form className="config-form-fields" onSubmit={(e) => e.preventDefault()}>
                    <div className="config-input-group">
                      <label>STANDARD COMMISSION (%)</label>
                      <input type="text" defaultValue="15" className="config-text-input" />
                    </div>
                    <div className="config-input-group">
                      <label>DELIVERY PARTNER FEE (FLAT)</label>
                      <div className="input-prefix-wrapper">
                        <span className="input-prefix-symbol">$</span>
                        <input type="text" defaultValue="2.50" className="config-text-input prefix-padding" />
                      </div>
                    </div>
                    <label className="surge-checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Enable Surge Multiplier</span>
                    </label>
                  </form>
                </div>

                {/* Vendor Subscription Tiers Card Table */}
                <div className="kpi-card-white config-panel-card tiers-table-card">
                  <div className="config-card-title-row justify-between">
                    <div className="flex items-center gap-2">
                      <div className="config-icon-box bg-blue-tint">
                        <Tag size={18} />
                      </div>
                      <h3>Vendor Subscription Tiers</h3>
                    </div>
                    <button className="add-tier-action-btn">
                      <Plus size={14} />
                      <span>Add Tier</span>
                    </button>
                  </div>

                  <div className="tiers-table-container">
                    <table className="tiers-data-table">
                      <thead>
                        <tr>
                          <th>TIER NAME</th>
                          <th>MONTHLY PRICE</th>
                          <th>COMMISSION %</th>
                          <th>FEATURES</th>
                          <th className="text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="font-bold">Basic Vendor</td>
                          <td>$29.00</td>
                          <td>18%</td>
                          <td className="text-secondary text-xs">Basic Analytics, 50 orders/mo</td>
                          <td className="text-right"><button className="tier-edit-btn"><Edit2 size={13} /></button></td>
                        </tr>
                        <tr>
                          <td className="font-bold">Pro Partner</td>
                          <td>$79.00</td>
                          <td>12%</td>
                          <td className="text-secondary text-xs">Priority Support, Unlimited, Pro Dashboard</td>
                          <td className="text-right"><button className="tier-edit-btn"><Edit2 size={13} /></button></td>
                        </tr>
                        <tr>
                          <td className="font-bold text-orange-accent">Enterprise Elite</td>
                          <td>$199.00</td>
                          <td>8%</td>
                          <td className="text-secondary text-xs">Dedicated Manager, API Access, Premium Ads</td>
                          <td className="text-right"><button className="tier-edit-btn"><Edit2 size={13} /></button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Recent System Logs */}
              <div className="kpi-card-white system-logs-card">
                <div className="logs-header-row">
                  <h3>Recent System Logs</h3>
                  <div className="auto-refresh-label">
                    <span>AUTO-REFRESHING EVERY 5S</span>
                    <span className="live-dot-pulse green"></span>
                  </div>
                </div>

                <div className="system-logs-list">
                  {/* Log Row 1 */}
                  <div className="system-log-row border-green">
                    <span className="log-timestamp">14:22:01</span>
                    <span className="log-badge-pill bg-green-badge">INFO</span>
                    <p className="log-message-content">
                      Daily scheduled backup completed successfully in <strong>142s</strong>. Destination: AWS-S3-MAIN.
                    </p>
                    <a href="#" className="log-action-link" onClick={(e) => e.preventDefault()}>Trace</a>
                  </div>

                  {/* Log Row 2 */}
                  <div className="system-log-row border-yellow">
                    <span className="log-timestamp">14:18:45</span>
                    <span className="log-badge-pill bg-orange-badge">CONFIG</span>
                    <p className="log-message-content">
                      Global commission rate for 'Basic Vendor' updated from <strong>28%</strong> to <strong>18%</strong> by <strong>Admin_Josh</strong>.
                    </p>
                    <a href="#" className="log-action-link" onClick={(e) => e.preventDefault()}>View Diff</a>
                  </div>

                  {/* Log Row 3 */}
                  <div className="system-log-row border-red">
                    <span className="log-timestamp">13:55:12</span>
                    <span className="log-badge-pill bg-red-badge">WARNING</span>
                    <p className="log-message-content">
                      API latency spike detected in Region US-West (850ms). Automatic traffic re-routing initiated to Cluster-B.
                    </p>
                    <a href="#" className="log-action-link" onClick={(e) => e.preventDefault()}>Debug</a>
                  </div>

                  {/* Log Row 4 */}
                  <div className="system-log-row border-green">
                    <span className="log-timestamp">13:40:00</span>
                    <span className="log-badge-pill bg-green-badge">INFO</span>
                    <p className="log-message-content">
                      SSL Certificate renewed for primary domain *.tiffinhub-app.com. Next expiry: 365 days.
                    </p>
                    <a href="#" className="log-action-link" onClick={(e) => e.preventDefault()}>Certificate</a>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <button className="load-extended-logs-btn">
                    LOAD EXTENDED LOGS (LAST 7 DAYS)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              {/* Header block */}
              <div className="dashboard-header-row">
                <div>
                  <h1 className="dashboard-title">Platform Settings</h1>
                  <p className="dashboard-subtitle">Manage your administrative profile, security protocols, and global branding assets.</p>
                </div>
              </div>

              {/* Row 1: Admin Profile and Security */}
              <div className="settings-grid-row">
                {/* Admin Profile Card */}
                <div className="kpi-card-white settings-card-white flex-col gap-5">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <h3 className="settings-card-title">Admin Profile</h3>
                      <p className="settings-card-subtitle">Update your personal information and public-facing administrator identity.</p>
                    </div>
                    <button className="save-changes-btn">Save Changes</button>
                  </div>

                  <div className="profile-upload-section">
                    <div className="profile-avatar-circle-wrapper">
                      <User size={40} className="text-slate-400" />
                      <div className="camera-badge">
                        <Camera size={14} />
                      </div>
                    </div>
                    <div>
                      <p className="profile-upload-requirement">PNG OR JPG. MAX 2MB.</p>
                    </div>
                  </div>

                  <div className="settings-form-grid">
                    <div className="settings-input-group">
                      <label>FULL NAME</label>
                      <input type="text" defaultValue="Sarah Jenkins" className="settings-text-input" />
                    </div>
                    <div className="settings-input-group">
                      <label>EMAIL ADDRESS</label>
                      <input type="email" defaultValue="sarah.jenkins@tiffinhub.com" className="settings-text-input" />
                    </div>
                    <div className="settings-input-group">
                      <label>ADMIN ROLE</label>
                      <div className="locked-input-wrapper">
                        <input type="text" defaultValue="Super Administrator" disabled className="settings-text-input locked-input" />
                        <Lock size={14} className="lock-icon-inside" />
                      </div>
                    </div>
                    <div className="settings-input-group">
                      <label>PHONE NUMBER</label>
                      <input type="text" defaultValue="+1 (555) 012-3456" className="settings-text-input" />
                    </div>
                  </div>
                </div>

                {/* Security Card */}
                <div className="kpi-card-white settings-card-white flex-col gap-5">
                  <div className="flex items-center gap-2">
                    <div className="config-icon-box bg-blue-tint">
                      <Shield size={18} />
                    </div>
                    <h3 className="settings-card-title">Security</h3>
                  </div>

                  <div className="security-rows-stack w-full mt-2">
                    {/* Item 1: 2FA */}
                    <div className="security-item-row" onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}>
                      <div className="security-item-left">
                        <div className="security-icon-box"><Shield size={18} /></div>
                        <div>
                          <h5>2FA Authentication</h5>
                          <p>Currently Enabled</p>
                        </div>
                      </div>
                      <div 
                        className={`switch-track ${twoFactorEnabled ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTwoFactorEnabled(!twoFactorEnabled);
                        }}
                      >
                        <div className="switch-thumb"></div>
                      </div>
                    </div>

                    {/* Item 2: Change Password */}
                    <div className="security-item-row">
                      <div className="security-item-left">
                        <div className="security-icon-box"><Key size={18} /></div>
                        <div>
                          <h5>Change Password</h5>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>

                    {/* Item 3: Active Sessions */}
                    <div className="security-item-row">
                      <div className="security-item-left">
                        <div className="security-icon-box"><Monitor size={18} /></div>
                        <div>
                          <h5>Active Sessions</h5>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Notification Center and Platform Branding */}
              <div className="settings-grid-row mt-6">
                {/* Notification Center Card */}
                <div className="kpi-card-white settings-card-white flex-col gap-5">
                  <div>
                    <h3 className="settings-card-title">Notification Center</h3>
                    <p className="settings-card-subtitle">Choose how you receive updates and critical alerts.</p>
                  </div>

                  <div className="notification-rows-list w-full mt-2">
                    {/* Row 1 */}
                    <div className="notification-alert-row">
                      <div className="alert-row-left">
                        <h5>New Vendor Application</h5>
                        <p className="text-xs text-secondary">Instant alert when a kitchen joins.</p>
                      </div>
                      <div className="alert-row-actions">
                        <button className="alert-action-icon-btn"><Mail size={14} /></button>
                        <button className="alert-action-icon-btn"><MessageSquare size={14} /></button>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="notification-alert-row">
                      <div className="alert-row-left">
                        <h5>Payout Success</h5>
                        <p className="text-xs text-secondary">Summary report after weekly payouts.</p>
                      </div>
                      <div className="alert-row-actions">
                        <button className="alert-action-icon-btn"><Mail size={14} /></button>
                        <button className="alert-action-icon-btn"><MessageSquare size={14} /></button>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="notification-alert-row">
                      <div className="alert-row-left">
                        <h5>System Maintenance</h5>
                        <p className="text-xs text-secondary">Alerts for scheduled downtime.</p>
                      </div>
                      <div className="alert-row-actions">
                        <button className="alert-action-icon-btn"><Mail size={14} /></button>
                        <button className="alert-action-icon-btn"><MessageSquare size={14} /></button>
                      </div>
                    </div>

                    {/* Row 4 */}
                    <div className="notification-alert-row">
                      <div className="alert-row-left">
                        <h5>Customer Complaints</h5>
                        <p className="text-xs text-secondary">High-priority ticket escalations.</p>
                      </div>
                      <div className="alert-row-actions">
                        <button className="alert-action-icon-btn"><Mail size={14} /></button>
                        <button className="alert-action-icon-btn"><MessageSquare size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Branding Card */}
                <div className="kpi-card-white settings-card-white flex-col gap-5">
                  <div className="flex items-center gap-2">
                    <div className="config-icon-box bg-blue-tint">
                      <Tag size={18} />
                    </div>
                    <div>
                      <h3 className="settings-card-title">Platform Branding</h3>
                      <p className="settings-card-subtitle">Global style tokens for the customer and vendor interfaces.</p>
                    </div>
                  </div>

                  <div className="platform-branding-split w-full mt-2">
                    {/* Left Column: Color Pickers */}
                    <div className="color-pickers-column">
                      <div className="settings-input-group">
                        <label>PRIMARY BRAND COLOR</label>
                        <div className="color-picker-input-row">
                          <div className="color-preview-box" style={{ backgroundColor: '#F59E0B' }}>F59EO</div>
                          <input type="text" defaultValue="#F59E0B" className="settings-text-input font-mono" />
                        </div>
                      </div>

                      <div className="settings-input-group">
                        <label>SECONDARY ACCENT</label>
                        <div className="color-picker-input-row">
                          <div className="color-preview-box" style={{ backgroundColor: '#1E293B' }}>1E293B</div>
                          <input type="text" defaultValue="#1E293B" className="settings-text-input font-mono" />
                        </div>
                      </div>

                      <div className="flex justify-between items-center w-full mt-2">
                        <span className="font-semibold text-sm text-slate-700">Use Rounded Corners</span>
                        <div 
                          className={`switch-track ${roundedCornersEnabled ? 'active' : ''}`}
                          onClick={() => setRoundedCornersEnabled(!roundedCornersEnabled)}
                        >
                          <div className="switch-thumb"></div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Upload Logo */}
                    <div className="upload-logo-column">
                      <label className="text-xs font-bold text-slate-400 tracking-wider">PLATFORM LOGO (LIGHT MODE)</label>
                      <div className="logo-upload-box">
                        <UploadCloud size={28} className="text-slate-400" />
                        <span className="font-bold text-sm text-slate-700">Upload SVG / PNG</span>
                        <span className="text-xs text-slate-400">Transparant background preferred</span>
                      </div>
                    </div>
                  </div>

                  {/* Info notice box at the bottom */}
                  <div className="branding-footer-alert w-full">
                    <div className="alert-left-info">
                      <Info size={16} className="info-icon" />
                      <span>Changes take up to 5 minutes to propagate across apps.</span>
                    </div>
                    <a href="#" className="preview-sys-link" onClick={(e) => e.preventDefault()}>Preview Design System</a>
                  </div>
                </div>
              </div>

              {/* Bottom buttons row */}
              <div className="settings-footer-action-row w-full flex justify-end gap-4 mt-8" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '20px' }}>
                <button className="discard-settings-btn">Discard All Changes</button>
                <button className="save-settings-btn">Save All Settings</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
