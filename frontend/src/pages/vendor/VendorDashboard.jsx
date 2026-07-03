import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentContext } from '@/context/StudentContext';
import Footer from '@/components/layout/Footer';
import logo from '@/assets/logos/logo.png';
import { 
  Menu, 
  Bell, 
  ShoppingBag, 
  Coins, 
  Clock, 
  Utensils, 
  RotateCw,
  Home,
  FileText,
  User,
  ChevronRight,
  Search,
  Star,
  Check,
  LogOut,
  Shield,
  Package,
  MessageSquare,
  Plus,
  ArrowLeft
} from 'lucide-react';

const VendorDashboard = () => {
  const navigate = useNavigate();
  // Vendor details from localStorage (reactive state hooks)
  const storedSelfie = localStorage.getItem('vendor_selfie');
  const [vendorChefAvatar, setVendorChefAvatar] = useState(storedSelfie || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&h=100&fit=crop&q=80");
  const [vendorName, setVendorName] = useState(() => localStorage.getItem('vendor_name') || 'Sharma Tiffin Center');
  const [vendorPhone, setVendorPhone] = useState(() => localStorage.getItem('vendor_phone') || '9876543210');
  const [vendorEmail, setVendorEmail] = useState(() => localStorage.getItem('vendor_email') || 'vendor@campuslunch.com');

  // Nested settings states
  const [activeProfileSubPage, setActiveProfileSubPage] = useState('menu'); // 'menu', 'edit-profile', 'operating-settings', 'change-password', 'reset-password-request', 'help-center-faq'
  
  // Edit Profile form fields state
  const [editProfileForm, setEditProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
    avatar: ''
  });

  // Operating settings fields state
  const [operatingForm, setOperatingForm] = useState({
    workingDays: localStorage.getItem('vendor_working_days') || 'Mon - Sat',
    timings: localStorage.getItem('vendor_timings') || '10:00 AM - 08:00 PM',
    autoAccept: localStorage.getItem('vendor_auto_accept') !== 'disabled'
  });

  // Change Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [passwordResetEmail, setPasswordResetEmail] = useState('');
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);

  const [kitchenOpen, setKitchenOpen] = useState(() => {
    const status = localStorage.getItem('kitchen_status_' + vendorName);
    return status !== 'closed';
  });

  useEffect(() => {
    localStorage.setItem('kitchen_status_' + vendorName, kitchenOpen ? 'open' : 'closed');
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'kitchen_status_' + vendorName,
      newValue: kitchenOpen ? 'open' : 'closed'
    }));
  }, [kitchenOpen, vendorName]);

  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [ordersSubTab, setOrdersSubTab] = useState('active');
  const [ordersSearch, setOrdersSearch] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [salesPeriod, setSalesPeriod] = useState('today');
  const [reviewsRatingFilter, setReviewsRatingFilter] = useState('all');
  const [reviewsCommentFilter, setReviewsCommentFilter] = useState('all');
  const [reviewsSearch, setReviewsSearch] = useState('');

  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', text: 'New order #TK-448 received from Ishaan Gupta.', time: '5 mins ago' },
    { id: 2, type: 'warning', text: 'Deluxe Chicken Thali quantity is low (only 3 left).', time: '15 mins ago' },
    { id: 3, type: 'success', text: 'Aarav Mehta rated your Veg Fried Rice 5 ★!', time: '1 hour ago' },
  ]);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null });

  // Add Item to Availability form state
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    type: 'Veg',
    description: '',
    quantity: 15,
    prepTime: '20 mins',
    ingredients: '',
    image: ''
  });

  const { orders: contextOrders, setOrders, ratings: contextRatings, sellers, setSellers, setActiveTrackers } = useContext(StudentContext);

  // State-driven active orders with details
  const [activeOrders, setActiveOrders] = useState([]);

  // State-driven completed orders with details
  const [completedOrders, setCompletedOrders] = useState([]);

  useEffect(() => {
    const vendorContextOrders = (contextOrders || []).filter(o => o.vendor === vendorName);
    
    const activeContextMapped = vendorContextOrders
      .filter(o => o.deliveryStatus !== 'Delivered')
      .map(o => ({
        id: o.id,
        customer: o.customer || 'Student',
        items: o.items,
        price: `₹${o.bill}`,
        timeLeft: 'At Counter',
        status: 'NOT DELIVERED',
        color: 'accent-gold'
      }));

    const completedContextMapped = vendorContextOrders
      .filter(o => o.deliveryStatus === 'Delivered')
      .map(o => ({
        id: o.id,
        customer: o.customer || 'Student',
        items: o.items,
        time: o.date === 'Just now' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : o.date,
        price: `₹${o.bill}`,
        status: 'DELIVERED',
        color: 'accent-green'
      }));

    setActiveOrders(activeContextMapped);
    setCompletedOrders(completedContextMapped);
  }, [contextOrders, vendorName]);

  // State-driven food items availability
  // Derive current vendor's meals directly from the shared context
  const currentSeller = (sellers || []).find(s => s.name === vendorName) || (sellers || [])[0];
  const foodItems = currentSeller ? (currentSeller.meals || []) : [];

  const [offlineSales, setOfflineSales] = useState(12);

  const handleIncreaseQty = (itemId) => {
    if (!currentSeller) return;
    setSellers(prevSellers => prevSellers.map(s => {
      if (s.id === currentSeller.id) {
        return {
          ...s,
          meals: (s.meals || []).map(m => m.id === itemId ? { ...m, availableQty: (m.availableQty || 0) + 1 } : m)
        };
      }
      return s;
    }));
  };

  const handleDecreaseQty = (itemId) => {
    if (!currentSeller) return;
    setSellers(prevSellers => prevSellers.map(s => {
      if (s.id === currentSeller.id) {
        return {
          ...s,
          meals: (s.meals || []).map(m => {
            if (m.id === itemId && (m.availableQty || 0) > 0) {
              setOfflineSales(s => s + 1);
              return { ...m, availableQty: m.availableQty - 1 };
            }
            return m;
          })
        };
      }
      return s;
    }));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleDismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Open custom themed modal instead of window.confirm
  const handleDeliverTrigger = (id) => {
    setConfirmModal({ isOpen: true, orderId: id });
  };

  const handleDeliverConfirm = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, deliveryStatus: 'Delivered' } : o));
    
    // Progress corresponding tracking item to 'Delivered' (statusIndex: 5)
    setActiveTrackers(prev => prev.map(t => {
      if (t.orderId === id) {
        return {
          ...t,
          statusIndex: 5,
          progress: 100,
          eta: 'Delivered',
          location: 'Delivered'
        };
      }
      return t;
    }));

    setConfirmModal({ isOpen: false, orderId: null });
    setExpandedOrderId(null);
  };

  const handleAddNewTiffin = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      alert("Please fill in the name and price.");
      return;
    }
    
    const newMealId = 'm_' + Date.now();
    const newMealObj = {
      id: newMealId,
      name: newItem.name,
      price: Number(newItem.price),
      type: newItem.type,
      description: newItem.description || 'Freshly prepared delicious meal combo.',
      image: newItem.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop&q=80',
      rating: 5.0,
      prepTime: newItem.prepTime || '20 mins',
      availableQty: Number(newItem.quantity || 15),
      ingredients: newItem.ingredients || 'Fresh garden ingredients, mixed spices.',
      nutritionalInfo: { Calories: '600 kcal', Protein: '20g', Carbs: '75g', Fat: '20g' }
    };
    
    setSellers(prev => prev.map(s => {
      if (s.id === currentSeller.id) {
        return {
          ...s,
          meals: [...(s.meals || []), newMealObj]
        };
      }
      return s;
    }));
    
    setNewItem({
      name: '',
      price: '',
      type: 'Veg',
      description: '',
      quantity: 15,
      prepTime: '20 mins',
      ingredients: '',
      image: ''
    });
    
    setShowAddItemForm(false);
  };

  const handleOpenEditProfile = () => {
    setEditProfileForm({
      name: vendorName,
      phone: vendorPhone,
      email: vendorEmail,
      avatar: vendorChefAvatar
    });
    setActiveProfileSubPage('edit-profile');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editProfileForm.name || !editProfileForm.phone || !editProfileForm.email) {
      alert("All fields marked * are required.");
      return;
    }
    
    // Update state
    setVendorName(editProfileForm.name);
    setVendorPhone(editProfileForm.phone);
    setVendorEmail(editProfileForm.email);
    setVendorChefAvatar(editProfileForm.avatar);
    
    // Save to localStorage
    localStorage.setItem('vendor_name', editProfileForm.name);
    localStorage.setItem('vendor_phone', editProfileForm.phone);
    localStorage.setItem('vendor_email', editProfileForm.email);
    localStorage.setItem('vendor_selfie', editProfileForm.avatar);
    
    alert("Profile details saved successfully!");
    setActiveProfileSubPage('menu');
  };

  const handleSaveOperatingSettings = (e) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem('vendor_working_days', operatingForm.workingDays);
    localStorage.setItem('vendor_timings', operatingForm.timings);
    localStorage.setItem('vendor_auto_accept', operatingForm.autoAccept ? 'enabled' : 'disabled');
    
    alert("Operating settings updated successfully!");
    setActiveProfileSubPage('menu');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      alert("New password and confirm password fields do not match!");
      return;
    }
    
    alert("Your password has been changed successfully!");
    setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    setActiveProfileSubPage('menu');
  };

  const handleRequestPasswordReset = (e) => {
    e.preventDefault();
    if (!passwordResetEmail) {
      alert("Please enter your email address.");
      return;
    }
    alert(`A password reset link has been dispatched to ${passwordResetEmail}`);
    setPasswordResetEmail('');
    setActiveProfileSubPage('menu');
  };

  const handleDeleteAccountConfirm = () => {
    // Clear credentials
    localStorage.removeItem('role');
    localStorage.removeItem('vendor_name');
    localStorage.removeItem('vendor_phone');
    localStorage.removeItem('vendor_email');
    localStorage.removeItem('vendor_selfie');
    
    setDeleteAccountModal(false);
    navigate('/');
  };

  const toggleExpand = (id, e) => {
    // Prevent toggle if clicking action buttons, status pills, or notification dropdown
    if (e.target.closest('.order-action-btn') || e.target.closest('.order-status-pill') || e.target.closest('.notification-dropdown')) {
      return;
    }
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const totalAvailablePackets = foodItems.reduce((acc, curr) => acc + (curr.availableQty || 0), 0);

  // Sales metrics based on selected period
  const getSalesMetrics = () => {
    const completedOrdersList = (contextOrders || []).filter(o => o.vendor === vendorName && o.deliveryStatus === 'Delivered');
    
    // Filter by period
    let filtered = completedOrdersList;
    if (salesPeriod === 'today') {
      filtered = completedOrdersList.filter(o => {
        const dStr = (o.date || '').toLowerCase();
        return dStr.includes('today') || dStr.includes('just now') || o.date === new Date().toLocaleDateString();
      });
    } else if (salesPeriod === 'month') {
      filtered = completedOrdersList.filter(o => {
        const dStr = (o.date || '').toLowerCase();
        if (dStr.includes('today') || dStr.includes('just now')) return true;
        try {
          const parsed = Date.parse(o.date);
          if (isNaN(parsed)) return false;
          const diffMs = Date.now() - parsed;
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 30;
        } catch (e) {
          return false;
        }
      });
    }

    const totalRev = filtered.reduce((acc, o) => acc + (Number(o.bill) || 0), 0);
    const totalCount = filtered.length;

    // Calculate weekly growth performance dynamically (compares this week vs last week)
    const now = Date.now();
    const oneDayMs = 1000 * 60 * 60 * 24;

    const thisWeekOrders = completedOrdersList.filter(o => {
      const dStr = (o.date || '').toLowerCase();
      if (dStr.includes('today') || dStr.includes('just now')) return true;
      try {
        const parsed = Date.parse(o.date);
        if (isNaN(parsed)) return false;
        const diffMs = now - parsed;
        const diffDays = diffMs / oneDayMs;
        return diffDays >= 0 && diffDays <= 7;
      } catch (e) {
        return false;
      }
    });

    const lastWeekOrders = completedOrdersList.filter(o => {
      try {
        const parsed = Date.parse(o.date);
        if (isNaN(parsed)) return false;
        const diffMs = now - parsed;
        const diffDays = diffMs / oneDayMs;
        return diffDays > 7 && diffDays <= 14;
      } catch (e) {
        return false;
      }
    });

    const revThisWeek = thisWeekOrders.reduce((acc, o) => acc + (Number(o.bill) || 0), 0);
    const revLastWeek = lastWeekOrders.reduce((acc, o) => acc + (Number(o.bill) || 0), 0);

    let growthPct = 0;
    if (revLastWeek === 0) {
      growthPct = revThisWeek > 0 ? 37.5 : 0; // standard mock growth if last week had no deliveries
    } else {
      growthPct = Math.round(((revThisWeek - revLastWeek) / revLastWeek) * 1000) / 10;
    }

    const growth = growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`;
    const growthBarWidth = Math.min(100, Math.max(10, 50 + growthPct));

    return {
      revenue: `₹${totalRev.toLocaleString()}`,
      orders: totalCount.toString(),
      growth: growth,
      growthBarWidth: growthBarWidth
    };
  };
  const metrics = getSalesMetrics();

  return (
    <div className="vendor-device-wrapper">
      <div className="vendor-phone-frame">
        
        <div className="vendor-dashboard-layout">
          
          {/* Left Sidebar Navigation - Desktop only */}
          <aside className="vendor-sidebar">
            <div className="sidebar-brand">
              <img src={logo} alt="CampusLunch Logo" className="sidebar-logo" />
              <span>Campus Lunch</span>
            </div>
            
            <nav className="sidebar-nav">
              <button 
                className={`sidebar-nav-item ${activeBottomTab === 'home' ? 'active' : ''}`}
                onClick={() => setActiveBottomTab('home')}
              >
                <Home size={20} />
                <span>Home</span>
              </button>
              
              <button 
                className={`sidebar-nav-item ${activeBottomTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveBottomTab('orders')}
              >
                <FileText size={20} />
                <span>Orders</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeBottomTab === 'availability' ? 'active' : ''}`}
                onClick={() => setActiveBottomTab('availability')}
              >
                <Package size={20} />
                <span>Availability</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeBottomTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveBottomTab('reviews')}
              >
                <Star size={20} />
                <span>Reviews</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeBottomTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveBottomTab('profile')}
              >
                <User size={20} />
                <span>Profile</span>
              </button>
            </nav>

            <div className="sidebar-footer">
              <button 
                className="sidebar-logout-btn"
                onClick={() => {
                  localStorage.removeItem('role');
                  navigate('/');
                }}
              >
                <LogOut size={18} />
                <span>Logout Account</span>
              </button>
            </div>
          </aside>

          {/* Right main wrapper content */}
          <div className="vendor-main-wrapper">
            
            {/* Header bar (Desktop & Mobile) */}
            <header className="vendor-app-header">
              {/* Mobile view only logo */}
              <div className="mobile-brand-container">
                <div className="flex items-center gap-2 logo-container-left">
                  <img src={logo} alt="Campus Lunch Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
                  <span className="vendor-app-logo">Campus Lunch</span>
                </div>
              </div>

              {/* Desktop header title */}
              <div className="desktop-page-title">
                <h2>
                  {activeBottomTab === 'home' ? 'Dashboard' : activeBottomTab.charAt(0).toUpperCase() + activeBottomTab.slice(1)}
                </h2>
              </div>

              {/* Header Right Actions */}
              <div className="header-right-actions" style={{ position: 'relative' }}>

                <button 
                  className="header-notification-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell size={20} />
                  {notifications.length > 0 && <span className="bell-active-dot"></span>}
                </button>

                <div className="header-profile-box" onClick={() => setActiveBottomTab('profile')}>
                  <img 
                    src={vendorChefAvatar} 
                    alt="Vendor Chef" 
                    className="vendor-chef-avatar-circle" 
                  />
                  <span className="header-vendor-name">{vendorName}</span>
                </div>

                {/* Notification dropdown overlay */}
                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                      <h4>Notifications</h4>
                      {notifications.length > 0 && (
                        <button className="notification-clear-btn" onClick={handleClearNotifications}>
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="notification-list">
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          className="notification-item"
                          onClick={() => handleDismissNotification(n.id)}
                          title="Click to dismiss"
                        >
                          <div className={`notification-item-icon ${n.type}`}>
                            {n.type === 'info' ? <ShoppingBag size={14} /> : n.type === 'warning' ? <Bell size={14} /> : <Star size={14} />}
                          </div>
                          <div className="notification-item-details">
                            <p>{n.text}</p>
                            <span className="time">{n.time}</span>
                          </div>
                        </div>
                      ))}

                      {notifications.length === 0 && (
                        <div className="notification-empty-state">
                          <p style={{ margin: 0 }}>All caught up! 🎉</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </header>

            {/* Offline Alert Banner */}
            {!kitchenOpen && (
              <div style={{ 
                backgroundColor: '#fef2f2', 
                borderBottom: '1px solid #fee2e2', 
                padding: '10px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                color: '#ef4444',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                <span>Your kitchen is currently OFFLINE. Students cannot see your menu or place new orders.</span>
              </div>
            )}

            {/* Scrollable Container */}
            <div className="vendor-app-scroll-container">
              
              {/* HOME TAB VIEW */}
              {activeBottomTab === 'home' && (
                <div className="desktop-dashboard-grid">
                  
                  {/* Chef Greeting Banner Card (Spans full-width of grid on desktop) */}
                  <div className="chef-greeting-banner" style={{
                    background: 'linear-gradient(135deg, #0b1c30 0%, #1e293b 100%)',
                    borderRadius: '20px',
                    padding: '24px 30px',
                    color: '#ffffff',
                    textAlign: 'left',
                    boxShadow: '0 8px 24px rgba(11, 28, 48, 0.12)',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px',
                    gridColumn: '1 / -1',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#f59e0b', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
                        {new Date().getHours() < 12 ? '🍳 Breakfast Rush' : new Date().getHours() < 17 ? '🍛 Lunch Rush' : '🍲 Dinner Rush'}
                      </span>
                      <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '4px 0', color: '#ffffff' }}>
                        {new Date().getHours() < 12 ? 'Good Morning Chef,' : new Date().getHours() < 17 ? 'Good Afternoon Chef,' : 'Good Evening Chef,'}
                      </h2>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                        {vendorName} is currently {kitchenOpen ? 'ONLINE' : 'OFFLINE'}. {kitchenOpen ? "Students can see your menu and place new orders." : "Students cannot see your menu or order."}
                      </p>
                    </div>

                    {/* Status Toggle Switch inside banner */}
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      padding: '12px 18px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      backdropFilter: 'blur(8px)',
                      flexShrink: 0
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kitchen Status</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: kitchenOpen ? '#10b981' : '#ef4444' }}>
                          {kitchenOpen ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => setKitchenOpen(!kitchenOpen)}
                        style={{ 
                          width: '42px', 
                          height: '24px', 
                          borderRadius: '12px', 
                          backgroundColor: kitchenOpen ? '#10b981' : 'rgba(255,255,255,0.2)', 
                          border: 'none', 
                          position: 'relative', 
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'background-color 0.2s ease',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ 
                          width: '18px', 
                          height: '18px', 
                          borderRadius: '50%', 
                          backgroundColor: '#ffffff', 
                          position: 'absolute', 
                          left: kitchenOpen ? '20px' : '4px',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                        }}></div>
                      </button>
                    </div>
                  </div>

                  {/* Left Column: Metrics & Kitchen Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    

                    {/* Sales Overview Section */}
                    <div className="sales-overview-section" style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0, textAlign: 'left' }}>Sales Summary</h2>
                        
                        {/* Custom Segmented Period switcher tabs */}
                        <div style={{ width: '220px', display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
                          {['today', 'month', 'alltime'].map(p => (
                            <button 
                              key={p}
                              className={`sales-period-btn ${salesPeriod === p ? 'active' : ''}`}
                              onClick={() => setSalesPeriod(p)}
                              style={{ 
                                flex: 1, 
                                padding: '8px 0', 
                                fontSize: '0.72rem', 
                                fontWeight: 800, 
                                border: 'none', 
                                borderRadius: '8px', 
                                backgroundColor: salesPeriod === p ? '#ffffff' : 'transparent',
                                color: salesPeriod === p ? '#0f172a' : '#64748b',
                                boxShadow: salesPeriod === p ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {p === 'today' ? 'Today' : p === 'month' ? 'Month' : 'All-Time'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2-Column Grid Metrics */}
                      <div className="sales-metrics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        {/* Revenue Metric */}
                        <div className="sales-metric-box" style={{ padding: '24px 20px', alignItems: 'center', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#f8fafc' }}>
                          <div className="sales-metric-icon bg-gold-circle" style={{ width: '44px', height: '44px', marginBottom: '8px' }}>
                            <Coins size={22} className="text-gold-icon" />
                          </div>
                          <span className="metric-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Total Revenue</span>
                          <h3 className="metric-value" style={{ fontSize: '1.35rem', fontWeight: 900, margin: '4px 0 0', color: '#0f172a' }}>{metrics.revenue}</h3>
                        </div>

                        {/* Orders Metric */}
                        <div className="sales-metric-box" style={{ padding: '24px 20px', alignItems: 'center', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#f8fafc' }}>
                          <div className="sales-metric-icon bg-blue-circle" style={{ width: '44px', height: '44px', marginBottom: '8px' }}>
                            <ShoppingBag size={22} className="text-blue-icon" />
                          </div>
                          <span className="metric-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Total Orders</span>
                          <h3 className="metric-value" style={{ fontSize: '1.35rem', fontWeight: 900, margin: '4px 0 0', color: '#0f172a' }}>{metrics.orders}</h3>
                        </div>
                      </div>

                      {/* Growth Rate Card */}
                      <div className="weekly-growth-card-gradient" style={{ marginTop: '16px', borderRadius: '16px', padding: '16px 20px' }}>
                        <span className="growth-label" style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.8 }}>Weekly Growth Performance</span>
                        <h2 className="growth-value" style={{ fontSize: '1.45rem', fontWeight: 900, margin: '6px 0' }}>{metrics.growth}</h2>
                        <div className="growth-progress-container" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '3px' }}>
                          <div className="growth-progress-bar" style={{ width: `${metrics.growthBarWidth}%`, height: '100%', backgroundColor: '#ffffff', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Active Orders (3) */}
                  <div className="active-orders-section" style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid rgba(0, 0, 0, 0.05)', minHeight: '340px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                    <div className="section-title-row" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Active Orders ({activeOrders.length})</h2>
                      <span 
                        className="refresh-label-btn" 
                        onClick={() => setActiveBottomTab('orders')}
                        style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        View All
                        <ChevronRight size={14} />
                      </span>
                    </div>

                    <div className="active-orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {activeOrders.slice(0, 3).map(order => {
                        const isExpanded = expandedOrderId === order.id;
                        return (
                          <div 
                            key={order.id} 
                            className={`active-order-item-card ${order.color} ${isExpanded ? 'expanded' : ''}`}
                            style={{ 
                              cursor: 'pointer', 
                              padding: '18px 20px', 
                              borderRadius: '16px',
                              border: '1px solid rgba(0,0,0,0.04)',
                              backgroundColor: '#f8fafc',
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: isExpanded ? '14px' : '0px',
                              textAlign: 'left'
                            }}
                            onClick={(e) => toggleExpand(order.id, e)}
                            title="Click to see details"
                          >
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>{order.id}</span>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{order.items}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="order-status-pill preparing" style={{ backgroundColor: '#fff7ed', color: '#c2410c', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
                                  {order.status}
                                </span>
                                <ChevronRight size={16} color="#64748b" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }} />
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="order-expanded-content" style={{ animation: 'slideDown 0.2s ease-out' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', paddingTop: '14px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Customer</span>
                                    <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 800 }}>{order.customer}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Price</span>
                                    <span style={{ fontSize: '0.9rem', color: '#855300', fontWeight: 800 }}>{order.price}</span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px dashed rgba(0, 0, 0, 0.06)', paddingTop: '12px' }}>
                                  <button 
                                    className="order-action-btn btn-solid"
                                    style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}
                                    onClick={() => handleDeliverTrigger(order.id)}
                                  >
                                    Mark as Delivered
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {activeOrders.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '0.85rem' }}>
                          <p style={{ margin: 0 }}>All clear! No pending orders.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ORDERS TAB VIEW */}
              {activeBottomTab === 'orders' && (
                <div className="orders-page-container">
                  {/* Sub-tab Switcher */}
                  <div className="orders-tab-switcher" style={{ maxWidth: '400px' }}>
                    <button 
                      className={`orders-tab-btn ${ordersSubTab === 'active' ? 'active' : ''}`}
                      onClick={() => setOrdersSubTab('active')}
                    >
                      Active ({activeOrders.length})
                    </button>
                    <button 
                      className={`orders-tab-btn ${ordersSubTab === 'completed' ? 'active' : ''}`}
                      onClick={() => setOrdersSubTab('completed')}
                    >
                      Completed ({completedOrders.length})
                    </button>
                  </div>

                  {/* Search input bar */}
                  <div className="orders-search-wrapper" style={{ maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      className="orders-search-input" 
                      placeholder="Search orders..." 
                      value={ordersSearch}
                      onChange={(e) => setOrdersSearch(e.target.value)}
                    />
                  </div>

                  {/* Orders lists container */}
                  {ordersSubTab === 'active' ? (
                    <div className="active-orders-list">
                      {activeOrders
                        .filter(o => o.id.toLowerCase().includes(ordersSearch.toLowerCase()))
                        .map(order => {
                          const isExpanded = expandedOrderId === order.id;
                          return (
                            <div 
                              key={order.id} 
                              className={`active-order-item-card ${order.color} ${isExpanded ? 'expanded' : ''}`}
                              style={{ cursor: 'pointer', padding: isExpanded ? '20px' : '18px 20px', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', gap: isExpanded ? '14px' : '0px' }}
                              onClick={(e) => toggleExpand(order.id, e)}
                              title="Click to see details"
                            >
                              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{order.id}</span>
                                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{order.items}</span>
                                </div>
                                <span className="order-status-pill preparing" style={{ backgroundColor: '#fff7ed', color: '#c2410c', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
                                  {order.status}
                                </span>
                              </div>

                              {isExpanded && (
                                <div className="order-expanded-content" style={{ animation: 'slideDown 0.2s ease-out' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', paddingTop: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Customer</span>
                                      <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{order.customer}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Total Price</span>
                                      <span style={{ fontSize: '0.9rem', color: '#855300', fontWeight: 800 }}>{order.price}</span>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px dashed rgba(0, 0, 0, 0.06)', paddingTop: '12px' }}>
                                    <button 
                                      className="order-action-btn btn-solid"
                                      style={{ padding: '8px 16px', borderRadius: '8px' }}
                                      onClick={() => handleDeliverTrigger(order.id)}
                                    >
                                      Mark as Delivered
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      {activeOrders.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', gridColumn: '1 / -1' }}>
                          <p>No active orders at the moment.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="orders-history-list">
                      {completedOrders
                        .filter(o => o.id.toLowerCase().includes(ordersSearch.toLowerCase()))
                        .map(order => {
                          const isExpanded = expandedOrderId === order.id;
                          return (
                            <div 
                              key={order.id} 
                              className="active-order-item-card accent-green" 
                              style={{ cursor: 'pointer', padding: isExpanded ? '20px' : '18px 20px', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', gap: isExpanded ? '14px' : '0px' }}
                              onClick={(e) => toggleExpand(order.id, e)}
                              title="Click to see details"
                            >
                              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{order.id}</span>
                                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{order.items}</span>
                                </div>
                                <span className="order-status-pill ready" style={{ backgroundColor: '#ecfdf5', color: '#059669', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
                                  {order.status}
                                </span>
                              </div>

                              {isExpanded && (
                                <div className="order-expanded-content" style={{ animation: 'slideDown 0.2s ease-out' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', paddingTop: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Customer</span>
                                      <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{order.customer}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Total Price</span>
                                      <span style={{ fontSize: '0.9rem', color: '#059669', fontWeight: 800 }}>{order.price}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                        </div>
                      );
                    })}
                  {completedOrders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', gridColumn: '1 / -1' }}>
                      <p>No completed orders found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AVAILABILITY TAB VIEW */}
          {activeBottomTab === 'availability' && (
            <div className="availability-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
              
              {!showAddItemForm ? (
                <>
                  {/* Header Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="dashboard-heading" style={{ fontSize: '1rem', margin: 0 }}>Tiffin Availability & Stock</h3>
                    <button 
                      className="order-action-btn btn-solid" 
                      onClick={() => setShowAddItemForm(true)}
                      style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}
                    >
                      <Plus size={16} />
                      Add New Tiffin
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="availability-items-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '10px' }}>
                    {foodItems.map(item => {
                      const qty = item.availableQty ?? 0;
                      const isOutOfStock = qty === 0;
                      const isLowStock = qty > 0 && qty < 5;
                      const cardAccentClass = isOutOfStock ? 'accent-empty' : isLowStock ? 'accent-low' : 'accent-instock';
                      
                      return (
                        <div key={item.id} className={`availability-item-card ${cardAccentClass}`} style={{ minHeight: '110px' }}>
                          <div className="availability-item-details">
                            <h4>{item.name}</h4>
                            <p className="price">₹{item.price}</p>
                            {isOutOfStock ? (
                              <span className="availability-stock-badge outofstock">OUT OF STOCK</span>
                            ) : isLowStock ? (
                              <span className="availability-stock-badge low">LOW STOCK ({qty} left)</span>
                            ) : (
                              <span className="availability-stock-badge instock">IN STOCK</span>
                            )}
                          </div>

                          <div className="availability-counter-control">
                            <button 
                              className="counter-btn"
                              disabled={qty === 0}
                              onClick={() => handleDecreaseQty(item.id)}
                            >
                              -
                            </button>
                            <span className="counter-value">{qty}</span>
                            <button 
                              className="counter-btn"
                              onClick={() => handleIncreaseQty(item.id)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {/* Add New Tiffin Item Form View */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '8px' }}>
                    <button 
                      onClick={() => setShowAddItemForm(false)}
                      style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', color: '#64748b', cursor: 'pointer', padding: 0 }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h3 className="dashboard-heading" style={{ fontSize: '1.1rem', margin: 0 }}>Add New Tiffin Item</h3>
                  </div>

                  <form onSubmit={handleAddNewTiffin} className="add-tiffin-form">
                    
                    <div className="form-group">
                      <label>Tiffin Name *</label>
                      <input 
                        type="text"
                        required
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Special Kadai Paneer Combo"
                      />
                    </div>

                    <div className="add-tiffin-grid-2col">
                      <div className="form-group">
                        <label>Price (₹) *</label>
                        <input 
                          type="number"
                          required
                          min="1"
                          value={newItem.price}
                          onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="e.g. 150"
                        />
                      </div>

                      <div className="form-group">
                        <label>Initial Stock Qty *</label>
                        <input 
                          type="number"
                          required
                          min="1"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                          placeholder="e.g. 15"
                        />
                      </div>
                    </div>

                    <div className="add-tiffin-grid-2col">
                      <div className="form-group">
                        <label>Meal Category *</label>
                        <select 
                          value={newItem.type}
                          onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value }))}
                          style={{ cursor: 'pointer' }}
                        >
                          <option value="Veg">Veg</option>
                          <option value="Non-Veg">Non-Veg</option>
                          <option value="Jain">Jain</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Preparation Time</label>
                        <input 
                          type="text"
                          value={newItem.prepTime}
                          onChange={(e) => setNewItem(prev => ({ ...prev, prepTime: e.target.value }))}
                          placeholder="e.g. 20 mins"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Ingredients</label>
                      <input 
                        type="text"
                        value={newItem.ingredients}
                        onChange={(e) => setNewItem(prev => ({ ...prev, ingredients: e.target.value }))}
                        placeholder="e.g. Paneer, bell peppers, mixed spices, ghee"
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea 
                        rows="3"
                        value={newItem.description}
                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="A detailed description of ingredients and serving details..."
                        style={{ resize: 'none', fontFamily: 'inherit' }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Image URL (Optional)</label>
                      <input 
                        type="text"
                        value={newItem.image}
                        onChange={(e) => setNewItem(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => setShowAddItemForm(false)}
                        className="order-action-btn"
                        style={{ flex: 1, padding: '12px 0', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', borderRadius: '12px', fontWeight: 800 }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="order-action-btn btn-solid"
                        style={{ flex: 1, padding: '12px 0', borderRadius: '12px', fontWeight: 800 }}
                      >
                        Create Tiffin Item
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {/* REVIEWS TAB VIEW */}
          {activeBottomTab === 'reviews' && (
            <div className="reviews-tab-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
              {(() => {
                const matching = (contextRatings || []).filter(r => r.vendorName === vendorName);
                const totalReviews = matching.length;
                if (totalReviews === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '16px', backgroundColor: '#ffffff' }}>
                      <Star size={40} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#475569' }}>No Ratings Yet</h3>
                      <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0' }}>Customer feedback and star ratings will show up here.</p>
                    </div>
                  );
                }

                const avgFood = (matching.reduce((acc, r) => acc + Number(r.foodRating), 0) / totalReviews).toFixed(1);
                const avgService = (matching.reduce((acc, r) => acc + Number(r.serviceRating), 0) / totalReviews).toFixed(1);
                const avgOverall = (matching.reduce((acc, r) => acc + (Number(r.foodRating) + Number(r.serviceRating)) / 2, 0) / totalReviews).toFixed(1);

                return (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px 20px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Overall Rating</span>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '6px 0 0 0', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          ★ {avgOverall}
                        </h3>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{totalReviews} student reviews</span>
                      </div>
                      
                      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px 20px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Food Taste</span>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '6px 0 0 0', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          ★ {avgFood}
                        </h3>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Quality & flavor</span>
                      </div>

                      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px 20px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Service</span>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '6px 0 0 0', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          ★ {avgService}
                        </h3>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Delivery & timing</span>
                      </div>
                    </div>

                    {/* Filter Area */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Filter Reviews</h4>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {/* Star Rating Select Dropdown */}
                        <div style={{ flex: 1, minWidth: '130px' }}>
                          <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Star Rating</label>
                          <select 
                            value={reviewsRatingFilter} 
                            onChange={(e) => setReviewsRatingFilter(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', outline: 'none' }}
                          >
                            <option value="all">All Stars</option>
                            <option value="5">5 Stars only</option>
                            <option value="4">4 Stars & above</option>
                            <option value="3">3 Stars & above</option>
                            <option value="2">2 Stars & above</option>
                          </select>
                        </div>

                        {/* Content Type select */}
                        <div style={{ flex: 1, minWidth: '130px' }}>
                          <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Feedback Type</label>
                          <select 
                            value={reviewsCommentFilter} 
                            onChange={(e) => setReviewsCommentFilter(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', outline: 'none' }}
                          >
                            <option value="all">All Reviews</option>
                            <option value="comments">With Written Comments</option>
                          </select>
                        </div>
                      </div>

                      {/* Text Search */}
                      <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                          type="text" 
                          placeholder="Search by student name or comments..." 
                          value={reviewsSearch}
                          onChange={(e) => setReviewsSearch(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.78rem', fontWeight: 650, color: '#1e293b', outline: 'none' }}
                        />
                      </div>
                    </div>

                    {/* Feed List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(() => {
                        const filteredList = matching.filter(review => {
                          const avgReview = (Number(review.foodRating) + Number(review.serviceRating)) / 2;
                          if (reviewsRatingFilter !== 'all') {
                            const minStar = Number(reviewsRatingFilter);
                            if (reviewsRatingFilter === '5') {
                              if (avgReview < 5) return false;
                            } else {
                              if (avgReview < minStar) return false;
                            }
                          }
                          if (reviewsCommentFilter === 'comments' && !review.comment) {
                            return false;
                          }
                          if (reviewsSearch) {
                            const q = reviewsSearch.toLowerCase();
                            const matchesName = review.studentName.toLowerCase().includes(q);
                            const matchesComment = review.comment && review.comment.toLowerCase().includes(q);
                            if (!matchesName && !matchesComment) return false;
                          }
                          return true;
                        });

                        if (filteredList.length === 0) {
                          return (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', border: '1px dashed #cbd5e1', borderRadius: '12px', backgroundColor: '#ffffff' }}>
                              <p style={{ margin: 0, fontWeight: 700 }}>No matching reviews found</p>
                              <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem' }}>Try adjusting your filters or search terms.</p>
                            </div>
                          );
                        }

                        return filteredList.map(review => {
                          const overallVal = ((Number(review.foodRating) + Number(review.serviceRating)) / 2).toFixed(1);
                          return (
                            <div key={review.id} style={{ padding: '16px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 15px rgba(0,0,0,0.005)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              
                              {/* Top Row: Customer info & Overall rating */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{review.studentName}</span>
                                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>{review.date}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fffbeb', padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                                  <Star size={12} fill="#f59e0b" stroke="none" />
                                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#d97706' }}>{overallVal}</span>
                                </div>
                              </div>

                              {/* Middle: Written Comment (if any) */}
                              {review.comment ? (
                                <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', lineHeight: '1.5', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                  "{review.comment}"
                                </p>
                              ) : (
                                <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', margin: '4px 0' }}>Rating only (no comments left)</span>
                              )}

                              {/* Bottom: Service & Food Taste Sub-ratings */}
                              <div style={{ display: 'flex', gap: '10px', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                                <span>Food Quality: <strong style={{ color: '#d97706' }}>★{review.foodRating}</strong></span>
                                <span style={{ color: '#cbd5e1' }}>|</span>
                                <span>Service: <strong style={{ color: '#2563eb' }}>★{review.serviceRating}</strong></span>
                              </div>

                            </div>
                          );
                        });
                      })()}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* PROFILE TAB VIEW */}
          {activeBottomTab === 'profile' && (
            <div className="profile-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
              
              {activeProfileSubPage === 'menu' && (
                <>
                  {/* Chef Header */}
                  <div className="profile-chef-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 8px 30px rgba(0,0,0,0.015)' }}>
                    <div className="profile-avatar-container" style={{ position: 'relative' }}>
                      <img 
                        src={vendorChefAvatar} 
                        alt="Chef Avatar" 
                        className="profile-chef-avatar" 
                        style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #855300' }}
                      />
                      <div className="profile-badge-verify" style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: '#10b981', color: '#ffffff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#855300', marginTop: '12px', marginBottom: '4px' }}>{vendorName}</h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Premium Meal Partner &bull; Verified Chef</p>
                    <div className="profile-rating-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fef3c7', padding: '4px 12px', borderRadius: '12px', marginTop: '8px', fontSize: '0.78rem', fontWeight: 800, color: '#d97706' }}>
                      <Star size={12} fill="#d97706" style={{ color: '#d97706' }} />
                      <span>4.8 (120+ ratings)</span>
                    </div>
                  </div>

                  {/* Settings Option List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                      onClick={handleOpenEditProfile}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', outline: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <User size={18} style={{ color: '#855300' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Edit Kitchen Details</span>
                      </div>
                      <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                    </button>

                    <button 
                      onClick={() => {
                        setOperatingForm({
                          workingDays: localStorage.getItem('vendor_working_days') || 'Mon - Sat',
                          timings: localStorage.getItem('vendor_timings') || '10:00 AM - 08:00 PM',
                          autoAccept: localStorage.getItem('vendor_auto_accept') !== 'disabled'
                        });
                        setActiveProfileSubPage('operating-settings');
                      }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', outline: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Clock size={18} style={{ color: '#855300' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Operating & Timings Settings</span>
                      </div>
                      <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                    </button>

                    <button 
                      onClick={() => setActiveProfileSubPage('change-password')}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', outline: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield size={18} style={{ color: '#855300' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Change Account Password</span>
                      </div>
                      <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                    </button>

                    <button 
                      onClick={() => {
                        setPasswordResetEmail(vendorEmail);
                        setActiveProfileSubPage('reset-password-request');
                      }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', outline: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <RotateCw size={18} style={{ color: '#855300' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Password Reset Request</span>
                      </div>
                      <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                    </button>

                    <button 
                      onClick={() => setActiveProfileSubPage('help-center-faq')}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', outline: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <MessageSquare size={18} style={{ color: '#855300' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Vendor Help Center & FAQs</span>
                      </div>
                      <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                    </button>
                  </div>

                  {/* Support Button */}
                  <button 
                    onClick={() => navigate('/support-chat')}
                    className="order-action-btn btn-solid"
                    style={{ 
                      width: '100%', 
                      height: '50px', 
                      borderRadius: '16px', 
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    <MessageSquare size={18} />
                    Open Support Desk Chat
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {/* Logout Button */}
                    <button 
                      className="profile-logout-btn"
                      onClick={() => {
                        localStorage.removeItem('role');
                        navigate('/');
                      }}
                      style={{ margin: 0, width: '100%', borderRadius: '16px', padding: '14px 0', fontSize: '0.88rem', fontWeight: 800 }}
                    >
                      <LogOut size={18} />
                      Logout Account
                    </button>

                    {/* Delete Account Button */}
                    <button 
                      onClick={() => setDeleteAccountModal(true)}
                      style={{ 
                        width: '100%', 
                        padding: '14px 0', 
                        borderRadius: '16px', 
                        backgroundColor: '#fff1f2', 
                        color: '#e11d48', 
                        border: '1.5px solid rgba(225, 29, 72, 0.2)', 
                        fontSize: '0.88rem', 
                        fontWeight: 800, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <LogOut size={18} />
                      Delete Kitchen Account
                    </button>
                  </div>
                </>
              )}

              {/* EDIT PROFILE VIEW */}
              {activeProfileSubPage === 'edit-profile' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '8px' }}>
                    <button 
                      onClick={() => setActiveProfileSubPage('menu')}
                      style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', color: '#64748b', cursor: 'pointer', padding: 0 }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h3 className="dashboard-heading" style={{ fontSize: '1.1rem', margin: 0 }}>Edit Kitchen Details</h3>
                  </div>

                  <form onSubmit={handleSaveProfile} className="add-tiffin-form">
                    <div className="form-group">
                      <label>Kitchen Name *</label>
                      <input 
                        type="text"
                        required
                        value={editProfileForm.name}
                        onChange={(e) => setEditProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Sharma Tiffin Center"
                      />
                    </div>



                    <div className="add-tiffin-grid-2col">
                      <div className="form-group">
                        <label>Contact Phone *</label>
                        <input 
                          type="tel"
                          required
                          value={editProfileForm.phone}
                          onChange={(e) => setEditProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="e.g. 9876543210"
                        />
                      </div>

                      <div className="form-group">
                        <label>Email Address *</label>
                        <input 
                          type="email"
                          required
                          value={editProfileForm.email}
                          onChange={(e) => setEditProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="e.g. sharma@gmail.com"
                        />
                      </div>
                    </div>



                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => setActiveProfileSubPage('menu')}
                        className="order-action-btn"
                        style={{ flex: 1, padding: '12px 0', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', borderRadius: '12px', fontWeight: 800 }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="order-action-btn btn-solid"
                        style={{ flex: 1, padding: '12px 0', borderRadius: '12px', fontWeight: 800 }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* OPERATING SETTINGS VIEW */}
              {activeProfileSubPage === 'operating-settings' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '8px' }}>
                    <button 
                      onClick={() => setActiveProfileSubPage('menu')}
                      style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', color: '#64748b', cursor: 'pointer', padding: 0 }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h3 className="dashboard-heading" style={{ fontSize: '1.1rem', margin: 0 }}>Operating Settings</h3>
                  </div>

                  <form onSubmit={handleSaveOperatingSettings} className="add-tiffin-form">
                    <div className="form-group">
                      <label>Working Days</label>
                      <select 
                        value={operatingForm.workingDays}
                        onChange={(e) => setOperatingForm(prev => ({ ...prev, workingDays: e.target.value }))}
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="Mon - Sat">Monday - Saturday (Mon - Sat)</option>
                        <option value="Mon - Sun">Everyday (Mon - Sun)</option>
                        <option value="Mon - Fri">Weekdays Only (Mon - Fri)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Daily Operating Timings</label>
                      <input 
                        type="text"
                        required
                        value={operatingForm.timings}
                        onChange={(e) => setOperatingForm(prev => ({ ...prev, timings: e.target.value }))}
                        placeholder="e.g. 10:00 AM - 08:00 PM"
                      />
                    </div>

                    <div className="form-group" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '2px' }}>Auto-Accept Student Orders</label>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Instantly accept checkouts and print kitchen tokens.</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={operatingForm.autoAccept}
                        onChange={(e) => setOperatingForm(prev => ({ ...prev, autoAccept: e.target.checked }))}
                        style={{ width: '20px', height: '20px', accentColor: '#855300', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => setActiveProfileSubPage('menu')}
                        className="order-action-btn"
                        style={{ flex: 1, padding: '12px 0', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', borderRadius: '12px', fontWeight: 800 }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="order-action-btn btn-solid"
                        style={{ flex: 1, padding: '12px 0', borderRadius: '12px', fontWeight: 800 }}
                      >
                        Save Settings
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* CHANGE PASSWORD VIEW */}
              {activeProfileSubPage === 'change-password' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '8px' }}>
                    <button 
                      onClick={() => setActiveProfileSubPage('menu')}
                      style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', color: '#64748b', cursor: 'pointer', padding: 0 }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h3 className="dashboard-heading" style={{ fontSize: '1.1rem', margin: 0 }}>Change Password</h3>
                  </div>

                  <form onSubmit={handleChangePassword} className="add-tiffin-form">
                    <div className="form-group">
                      <label>Current Account Password *</label>
                      <input 
                        type="password"
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="form-group">
                      <label>New Password *</label>
                      <input 
                        type="password"
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password *</label>
                      <input 
                        type="password"
                        required
                        value={passwordForm.confirmNewPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                        placeholder="••••••••"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => setActiveProfileSubPage('menu')}
                        className="order-action-btn"
                        style={{ flex: 1, padding: '12px 0', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', borderRadius: '12px', fontWeight: 800 }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="order-action-btn btn-solid"
                        style={{ flex: 1, padding: '12px 0', borderRadius: '12px', fontWeight: 800 }}
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* PASSWORD RESET REQUEST VIEW */}
              {activeProfileSubPage === 'reset-password-request' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '8px' }}>
                    <button 
                      onClick={() => setActiveProfileSubPage('menu')}
                      style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', color: '#64748b', cursor: 'pointer', padding: 0 }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h3 className="dashboard-heading" style={{ fontSize: '1.1rem', margin: 0 }}>Request Password Reset</h3>
                  </div>

                  <form onSubmit={handleRequestPasswordReset} className="add-tiffin-form">
                    <div className="form-group">
                      <label>Registered Email Address *</label>
                      <input 
                        type="email"
                        required
                        value={passwordResetEmail}
                        onChange={(e) => setPasswordResetEmail(e.target.value)}
                        placeholder="e.g. vendor@campuslunch.com"
                      />
                      <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>We will send a secure password reset link to this email address.</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => setActiveProfileSubPage('menu')}
                        className="order-action-btn"
                        style={{ flex: 1, padding: '12px 0', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', borderRadius: '12px', fontWeight: 800 }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="order-action-btn btn-solid"
                        style={{ flex: 1, padding: '12px 0', borderRadius: '12px', fontWeight: 800 }}
                      >
                        Send Reset Link
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* HELP & FAQS VIEW */}
              {activeProfileSubPage === 'help-center-faq' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '8px' }}>
                    <button 
                      onClick={() => setActiveProfileSubPage('menu')}
                      style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', color: '#64748b', cursor: 'pointer', padding: 0 }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h3 className="dashboard-heading" style={{ fontSize: '1.1rem', margin: 0 }}>Vendor FAQs</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <details style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                      <summary style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>How do I update my daily menu availability?</span>
                        <span style={{ color: '#855300', fontWeight: 950 }}>+</span>
                      </summary>
                      <p style={{ margin: '10px 0 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, cursor: 'default' }}>
                        Simply head to the "Availability" tab inside your bottom toolbar. Here you can toggle stock limits or increase/decrease quantities of individual tiffins in real-time. Changes are instantly visible on the student marketplace menu list.
                      </p>
                    </details>

                    <details style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                      <summary style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>When does the menu stock reset?</span>
                        <span style={{ color: '#855300', fontWeight: 950 }}>+</span>
                      </summary>
                      <p style={{ margin: '10px 0 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, cursor: 'default' }}>
                        All tiffin stock counts automatically reset daily at 12:00 AM midnight. They restore back to their default starting quantities to ensure you start fresh every morning!
                      </p>
                    </details>

                    <details style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                      <summary style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>What happens if a student cancels their active order?</span>
                        <span style={{ color: '#855300', fontWeight: 950 }}>+</span>
                      </summary>
                      <p style={{ margin: '10px 0 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, cursor: 'default' }}>
                        If a student cancels their active transaction, the corresponding kitchen token will automatically be removed from your dashboard active orders queue. The tiffin counts are automatically restored to your live stock menu.
                      </p>
                    </details>

                    <details style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                      <summary style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>How are reviews and ratings calculated?</span>
                        <span style={{ color: '#855300', fontWeight: 950 }}>+</span>
                      </summary>
                      <p style={{ margin: '10px 0 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, cursor: 'default' }}>
                        Once you mark a tiffin order as delivered, students are prompted to submit reviews. Food taste and Service speed scores are aggregated dynamically to update your average star ratings displayed on customer pages.
                      </p>
                    </details>
                  </div>
                </>
              )}

              {/* DELETE ACCOUNT MODAL POPUP */}
              {deleteAccountModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '24px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', color: '#ef4444', marginBottom: '12px' }}>warning</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0 0 8px 0', color: '#0f172a' }}>Delete Kitchen Account?</h4>
                    <p style={{ margin: '0 0 20px 0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>This action is permanent and cannot be undone. All license validations and pending orders will be permanently lost.</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => setDeleteAccountModal(false)}
                        className="order-action-btn"
                        style={{ flex: 1, padding: '12px 0', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', borderRadius: '12px', fontWeight: 800 }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleDeleteAccountConfirm}
                        style={{ flex: 1, padding: '12px 0', borderRadius: '12px', fontWeight: 800, backgroundColor: '#ef4444', color: '#ffffff', border: 'none', cursor: 'pointer' }}
                      >
                        Delete Permanent
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <Footer />
        </div>

        {/* Bottom Fixed Navigation Bar - Mobile View Only */}
        <nav className="vendor-bottom-nav">
          <button 
            className={`bottom-nav-item ${activeBottomTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveBottomTab('home')}
          >
            <div className="nav-item-icon-wrapper">
              <Home size={22} />
            </div>
            <span>Home</span>
            {activeBottomTab === 'home' && <div className="active-dot"></div>}
          </button>

          <button 
            className={`bottom-nav-item ${activeBottomTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveBottomTab('orders')}
          >
            <div className="nav-item-icon-wrapper">
              <FileText size={22} />
            </div>
            <span>Orders</span>
            {activeBottomTab === 'orders' && <div className="active-dot"></div>}
          </button>

          <button 
            className={`bottom-nav-item ${activeBottomTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveBottomTab('availability')}
          >
            <div className="nav-item-icon-wrapper">
              <Package size={22} />
            </div>
            <span>Availability</span>
            {activeBottomTab === 'availability' && <div className="active-dot"></div>}
          </button>

          <button 
            className={`bottom-nav-item ${activeBottomTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveBottomTab('reviews')}
          >
            <div className="nav-item-icon-wrapper">
              <Star size={22} />
            </div>
            <span>Reviews</span>
            {activeBottomTab === 'reviews' && <div className="active-dot"></div>}
          </button>

          <button 
            className={`bottom-nav-item ${activeBottomTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveBottomTab('profile')}
          >
            <div className="nav-item-icon-wrapper">
              <User size={22} />
            </div>
            <span>Profile</span>
            {activeBottomTab === 'profile' && <div className="active-dot"></div>}
          </button>
        </nav>

        {/* Frosted Glass Custom Modal Dialog */}
        {confirmModal.isOpen && (
          <div className="custom-modal-overlay">
            <div className="custom-modal-card">
              <div className="custom-modal-icon-wrapper">
                <ShoppingBag size={24} />
              </div>
              <h3>Confirm Delivery</h3>
              <p>make these order as delivered</p>
              <div className="custom-modal-actions">
                <button 
                  className="custom-modal-btn btn-cancel"
                  onClick={() => setConfirmModal({ isOpen: false, orderId: null })}
                >
                  Cancel
                </button>
                <button 
                  className="custom-modal-btn btn-confirm"
                  onClick={() => handleDeliverConfirm(confirmModal.orderId)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
</div>
  );
};

export default VendorDashboard;
