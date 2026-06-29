import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
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
  Package
} from 'lucide-react';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [kitchenOpen, setKitchenOpen] = useState(true);
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [ordersSubTab, setOrdersSubTab] = useState('active');
  const [ordersSearch, setOrdersSearch] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [salesPeriod, setSalesPeriod] = useState('today');

  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', text: 'New order #TK-448 received from Ishaan Gupta.', time: '5 mins ago' },
    { id: 2, type: 'warning', text: 'Deluxe Chicken Thali quantity is low (only 3 left).', time: '15 mins ago' },
    { id: 3, type: 'success', text: 'Aarav Mehta rated your Veg Fried Rice 5 ★!', time: '1 hour ago' },
  ]);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null });

  // Vendor details from localStorage
  const storedSelfie = localStorage.getItem('vendor_selfie');
  const vendorChefAvatar = storedSelfie || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&h=100&fit=crop&q=80";
  const vendorName = localStorage.getItem('vendor_name') || 'Sharma Tiffin Center';
  const vendorPhone = localStorage.getItem('vendor_phone') || '9876543210';
  const vendorEmail = localStorage.getItem('vendor_email') || 'vendor@campuslunch.com';
  const vendorLicense = localStorage.getItem('vendor_license') || '12345678901234';

  // State-driven active orders with details
  const [activeOrders, setActiveOrders] = useState([
    { id: '#TK-442', customer: 'Rahul Sharma', items: '2x Deluxe Lunch Thali', price: '₹340', timeLeft: '12 mins left', status: 'NOT DELIVERED', color: 'accent-gold' },
    { id: '#TK-445', customer: 'Priya Verma', items: '1x Keto Bowl, 1x Coke', price: '₹190', timeLeft: 'At Counter', status: 'NOT DELIVERED', color: 'accent-gold' },
    { id: '#TK-448', customer: 'Ishaan Gupta', items: '3x Home-Style Roti Sabzi', price: '₹210', timeLeft: '22 mins left', status: 'NOT DELIVERED', color: 'accent-gold' },
  ]);

  // State-driven completed orders with details
  const [completedOrders, setCompletedOrders] = useState([
    { id: '#TK-435', customer: 'Aarav Mehta', items: '1x Veg Fried Rice', time: '12:30 PM', price: '₹140', status: 'DELIVERED', color: 'accent-green' },
    { id: '#TK-431', customer: 'Neha Patel', items: '2x Paneer Paratha, 1x Lassi', time: '11:45 AM', price: '₹280', status: 'DELIVERED', color: 'accent-green' },
    { id: '#TK-428', customer: 'Karan Malhotra', items: '1x Mini Thali', time: '11:15 AM', price: '₹110', status: 'DELIVERED', color: 'accent-green' },
  ]);

  // State-driven food items availability
  const [offlineSales, setOfflineSales] = useState(12);
  const [foodItems, setFoodItems] = useState([
    { id: 1, name: 'Deluxe Veg Thali', price: '₹120', quantity: 15 },
    { id: 2, name: 'Deluxe Chicken Thali', price: '₹150', quantity: 3 },
    { id: 3, name: 'Special Paneer Combo', price: '₹140', quantity: 12 },
  ]);

  const handleIncreaseQty = (id) => {
    setFoodItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecreaseQty = (id) => {
    setFoodItems(prev => prev.map(item => {
      if (item.id === id && item.quantity > 0) {
        setOfflineSales(s => s + 1);
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
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
    const orderToDeliver = activeOrders.find(o => o.id === id);
    if (orderToDeliver) {
      setActiveOrders(prev => prev.filter(o => o.id !== id));
      setCompletedOrders(prev => [
        { 
          id: orderToDeliver.id, 
          customer: orderToDeliver.customer, 
          items: orderToDeliver.items, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          price: orderToDeliver.price, 
          status: 'DELIVERED', 
          color: 'accent-green' 
        },
        ...prev
      ]);
    }
    setConfirmModal({ isOpen: false, orderId: null });
    setExpandedOrderId(null);
  };

  const toggleExpand = (id, e) => {
    // Prevent toggle if clicking action buttons, status pills, or notification dropdown
    if (e.target.closest('.order-action-btn') || e.target.closest('.order-status-pill') || e.target.closest('.notification-dropdown')) {
      return;
    }
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const totalAvailablePackets = foodItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // Sales metrics based on selected period
  const getSalesMetrics = () => {
    switch (salesPeriod) {
      case 'month':
        return { revenue: '₹1,24,800', orders: '840', growth: '+18.2%' };
      case 'alltime':
        return { revenue: '₹3,42,000', orders: '2,350', growth: '+24.5%' };
      case 'today':
      default:
        return { revenue: '₹4,250', orders: '28', growth: '+12.5%' };
    }
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
              <span>CampusLunch</span>
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
            <header className="vendor-desktop-header">
              {/* Mobile view only logo */}
              <div className="mobile-brand-container">
                <div className="flex items-center gap-2 logo-container-left">
                  <img src={logo} alt="CampusLunch Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
                  <span className="vendor-app-logo">CampusLunch</span>
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
                {/* Kitchen Status Toggle (visible inside Header on Desktop, hidden on Mobile) */}
                <div className="header-kitchen-status-pill">
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: kitchenOpen ? '#10b981' : '#ef4444' }}>
                    {kitchenOpen ? 'Kitchen Open' : 'Kitchen Closed'}
                  </span>
                  <div 
                    className={`status-toggle-track small ${kitchenOpen ? 'active' : ''}`}
                    onClick={() => setKitchenOpen(!kitchenOpen)}
                  >
                    <div className="status-toggle-thumb small"></div>
                  </div>
                </div>

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

            {/* Scrollable Container */}
            <div className="vendor-app-scroll-container">
              
              {/* HOME TAB VIEW */}
              {activeBottomTab === 'home' && (
                <div className="desktop-dashboard-grid">
                  
                  {/* Left Column: Metrics & Kitchen Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Kitchen Status Toggle Card (visible on mobile only, hidden on desktop layout) */}
                    <div className="kitchen-status-card mobile-only-status" style={{ display: 'flex' }}>
                      <div className="status-card-left">
                        <h3>Kitchen Status</h3>
                        <p className={kitchenOpen ? "text-accepting" : "text-offline"}>
                          {kitchenOpen ? "Accepting Orders" : "Closed / Offline"}
                        </p>
                      </div>
                      <div 
                        className={`status-toggle-track ${kitchenOpen ? 'active' : ''}`}
                        onClick={() => setKitchenOpen(!kitchenOpen)}
                      >
                        <div className="status-toggle-thumb"></div>
                      </div>
                    </div>

                    {/* Sales Overview Section */}
                    <div className="sales-overview-section" style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                      <div className="section-title-row" style={{ marginBottom: '16px' }}>
                        <h2>Sales Overview</h2>
                        
                        {/* Period Selector Tabs */}
                        <div className="sales-period-switcher" style={{ margin: 0, width: '240px' }}>
                          <button 
                            className={`sales-period-btn ${salesPeriod === 'today' ? 'active' : ''}`}
                            onClick={() => setSalesPeriod('today')}
                          >
                            Today
                          </button>
                          <button 
                            className={`sales-period-btn ${salesPeriod === 'month' ? 'active' : ''}`}
                            onClick={() => setSalesPeriod('month')}
                          >
                            1 Month
                          </button>
                          <button 
                            className={`sales-period-btn ${salesPeriod === 'alltime' ? 'active' : ''}`}
                            onClick={() => setSalesPeriod('alltime')}
                          >
                            All Time
                          </button>
                        </div>
                      </div>

                      {/* Grid Metrics */}
                      <div className="sales-metrics-grid">
                        {/* Revenue Metric */}
                        <div className="sales-metric-box">
                          <div className="sales-metric-icon bg-gold-circle">
                            <Coins size={20} className="text-gold-icon" />
                          </div>
                          <span className="metric-label">Revenue</span>
                          <h3 className="metric-value">{metrics.revenue}</h3>
                        </div>

                        {/* Orders Metric */}
                        <div className="sales-metric-box">
                          <div className="sales-metric-icon bg-blue-circle">
                            <ShoppingBag size={20} className="text-blue-icon" />
                          </div>
                          <span className="metric-label">Orders</span>
                          <h3 className="metric-value">{metrics.orders}</h3>
                        </div>
                      </div>

                      {/* Growth Rate Card */}
                      <div className="weekly-growth-card-gradient" style={{ marginTop: '20px' }}>
                        <span className="growth-label">Growth Rate</span>
                        <h2 className="growth-value">{metrics.growth}</h2>
                        <div className="growth-progress-container">
                          <div className="growth-progress-bar" style={{ width: salesPeriod === 'today' ? '65%' : salesPeriod === 'month' ? '80%' : '95%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Active Orders (3) */}
                  <div className="active-orders-section" style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0, 0, 0, 0.05)', height: '100%', minHeight: '340px' }}>
                    <div className="section-title-row" style={{ marginBottom: '16px' }}>
                      <h2>Active Orders ({activeOrders.length})</h2>
                      <span className="refresh-label-btn" onClick={() => setActiveBottomTab('orders')}>
                        View All
                        <ChevronRight size={14} style={{ marginLeft: '2px' }} />
                      </span>
                    </div>

                    <div className="active-orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {activeOrders.slice(0, 3).map(order => {
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
                        <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                          <p>All clear! No pending orders.</p>
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
            <div className="availability-container">
              {/* Items List */}
              <div className="availability-items-list">
                {foodItems.map(item => {
                  const isOutOfStock = item.quantity === 0;
                  const isLowStock = item.quantity > 0 && item.quantity < 5;
                  const cardAccentClass = isOutOfStock ? 'accent-empty' : isLowStock ? 'accent-low' : 'accent-instock';
                  
                  return (
                    <div key={item.id} className={`availability-item-card ${cardAccentClass}`}>
                      <div className="availability-item-details">
                        <h4>{item.name}</h4>
                        <p className="price">{item.price}</p>
                        {isOutOfStock ? (
                          <span className="availability-stock-badge outofstock">OUT OF STOCK</span>
                        ) : isLowStock ? (
                          <span className="availability-stock-badge low">LOW STOCK ({item.quantity} left)</span>
                        ) : (
                          <span className="availability-stock-badge instock">IN STOCK</span>
                        )}
                      </div>

                      <div className="availability-counter-control">
                        <button 
                          className="counter-btn"
                          disabled={item.quantity === 0}
                          onClick={() => handleDecreaseQty(item.id)}
                        >
                          -
                        </button>
                        <span className="counter-value">{item.quantity}</span>
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
            </div>
          )}

          {/* PROFILE TAB VIEW */}
          {activeBottomTab === 'profile' && (
            <div className="profile-page-container">
              {/* Chef Header */}
              <div className="profile-chef-header">
                <div className="profile-avatar-container">
                  <img 
                    src={vendorChefAvatar} 
                    alt="Chef Avatar" 
                    className="profile-chef-avatar" 
                  />
                  <div className="profile-badge-verify">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
                <h3>{vendorName}</h3>
                <p>Premium Meal Partner</p>
                <div className="profile-rating-badge">
                  <Star size={12} fill="#d97706" style={{ color: '#d97706' }} />
                  <span>4.8 ★ (120+ ratings)</span>
                </div>
              </div>

              <div className="profile-info-section">
                {/* Kitchen info card */}
                <div className="profile-card">
                  <h4>Kitchen Details</h4>
                  <div className="profile-info-row">
                    <span className="label">FSSAI License</span>
                    <span className="value">{vendorLicense}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="label">Contact Number</span>
                    <span className="value">{vendorPhone}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="label">Email Address</span>
                    <span className="value">{vendorEmail}</span>
                  </div>
                </div>

                {/* Operating details card */}
                <div className="profile-card">
                  <h4>Operating Settings</h4>
                  <div className="profile-info-row">
                    <span className="label">Working Days</span>
                    <span className="value">Mon - Sat</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="label">Timings</span>
                    <span className="value">10:00 AM - 08:00 PM</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="label">Auto-Accept Orders</span>
                    <span className="value" style={{ color: '#10b981' }}>Enabled</span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                className="profile-logout-btn"
                onClick={() => {
                  localStorage.removeItem('role');
                  navigate('/');
                }}
              >
                <LogOut size={18} />
                Logout Account
              </button>
            </div>
          )}

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
