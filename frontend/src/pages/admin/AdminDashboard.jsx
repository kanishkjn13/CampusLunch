import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronLeft,
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
  UserCheck,
  Flame,
  CheckSquare,
  AlertTriangle
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
  changeUserPasswordApi,
  getAdminStatsApi,
  getAdminStudentsListApi,
  manageStudentApi,
  getAdminMenuItemsApi,
  createAdminMenuItemApi,
  updateAdminMenuItemApi,
  deleteAdminMenuItemApi,
  getAdminOrdersApi,
  updateAdminOrderTrackerApi,
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  sendAdminBroadcastApi
} from "@/services/authService";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Unified Loading and Toast State
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const showNotification = (msg, type = 'success') => {
    setToast({ message: msg, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  // DB Statistics state
  const [stats, setStats] = useState({
    total_users: 0,
    total_students: 0,
    total_vendors: 0,
    total_menu_items: 0,
    available_menu_items: 0,
    unavailable_menu_items: 0,
    today_orders: 0,
    pending_orders: 0,
    accepted_orders: 0,
    preparing_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    today_revenue: 0.0,
    weekly_revenue: 0.0,
    monthly_revenue: 0.0,
    overall_revenue: 0.0,
    avg_order_value: 0.0,
    total_ratings: 0,
    avg_rating: 0.0,
    support_tickets: 0,
    unread_notifications: 0,
    recent_registrations: [],
    recent_orders: [],
    recent_activities: []
  });

  // Data lists
  const [vendors, setVendors] = useState([]);
  const [students, setStudents] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const notificationsDropdownRef = useRef(null);

  // Sub-navigation state for opening Menu page inside Vendor page
  const [viewingMenuVendor, setViewingMenuVendor] = useState(null);

  // Broadcast Announcement states
  const [broadcastTitle, setBroadcastTitle] = useState('System Broadcast');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  // Timeframe selection
  const [timeframe, setTimeframe] = useState('This Month');
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);

  // System Controls
  const [commissionRate, setCommissionRate] = useState(12);
  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [tempCommission, setTempCommission] = useState(12);
  const [healthData, setHealthData] = useState({
    backend: { status: 'Checking...', is_active: true, message: 'Pinging Django server...', latency_ms: 0 },
    brevo: { status: 'Checking...', is_active: true, message: 'Checking Brevo API key...' },
    commission_rate: 12
  });

  // Modal displays
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardForm, setOnboardForm] = useState({ name: '', email: '', phone: '', password: 'Vendor123!' });
  const [showAllApplicationsModal, setShowAllApplicationsModal] = useState(false);

  // Filters and searches
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');

  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');

  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuMealFilter, setMenuMealFilter] = useState('all');
  const [menuAvailabilityFilter, setMenuAvailabilityFilter] = useState('all');

  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Support section
  const [ticketsList, setTicketsList] = useState([]);
  const [activeTicketId, setActiveTicketId] = useState('');
  const [activeTicketMessages, setActiveTicketMessages] = useState([]);
  const [supportReplyText, setSupportReplyText] = useState('');
  const [supportTabFilter, setSupportTabFilter] = useState('all');
  const [supportSearchQuery, setSupportSearchQuery] = useState('');

  // Support Reply Quick Templates
  const quickTemplates = [
    { label: "Greeting", text: "Hello! Thank you for contacting CampusLunch Support. How may I assist you with your tiffin order today?" },
    { label: "Refunded", text: "We have processed a full refund of your order back to your student tiffin account. The funds will reflect shortly." },
    { label: "Onboarded", text: "Welcome to the CampusLunch network! Your kitchen has been verified and registered. You may now log in." },
    { label: "OTP Fallback", text: "If you did not receive your email OTP, please try checking your spam folder, or try clicking Resend OTP." }
  ];

  // Profile Settings
  const [adminProfileForm, setAdminProfileForm] = useState({ fullName: '', email: '', phone: '', role: '' });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });

  // Detailed Modals state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [menuForm, setMenuForm] = useState({ id: '', name: '', description: '', price: '', available_qty: '', category: 'Main', meal_type: 'Lunch', food_type: 'Veg', is_available: true, vendor_id: '' });

  // Load all DB data safely
  const fetchAllData = async () => {
    try {
      const statsData = await getAdminStatsApi();
      setStats(statsData);
      setCommissionRate(statsData.commission_rate || 12);
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    }

    try {
      const vendorList = await getAdminVendorsList();
      setVendors(vendorList || []);
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
    }

    try {
      const studentList = await getAdminStudentsListApi();
      setStudents(studentList || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }

    try {
      const itemsList = await getAdminMenuItemsApi();
      setMenuItems(itemsList || []);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
    }

    try {
      const ordersList = await getAdminOrdersApi();
      setOrders(ordersList || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }

    try {
      const tickets = await getSupportTicketsApi();
      setTicketsList(tickets || []);
      if (tickets && tickets.length > 0 && !activeTicketId) {
        setActiveTicketId(tickets[0].ticket_id);
      }
    } catch (err) {
      console.error("Failed to fetch support tickets:", err);
    }

    try {
      const alerts = await getNotificationsApi();
      setNotifications(alerts || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchAdminProfileData();

    // Setup health check interval
    checkHealth();
    const interval = setInterval(checkHealth, 8000);

    // Close notifications click handler
    const handleClickOutside = (event) => {
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target)) {
        setShowNotificationsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const checkHealth = async () => {
    try {
      const data = await getSystemHealthApi();
      if (data) {
        setHealthData(data);
        if (data.commission_rate !== undefined) {
          setCommissionRate(data.commission_rate);
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

  const fetchAdminProfileData = async () => {
    try {
      const data = await getUserProfileApi();
      if (data) {
        setAdminProfileForm({
          fullName: data.full_name || 'Admin User',
          email: data.email || 'admin@campuslunch.com',
          phone: data.phone || '+91 98765 43210',
          role: data.role === 'admin' ? 'Super Administrator' : data.role
        });
      }
    } catch (err) {
      console.error("Could not fetch admin profile:", err);
    }
  };

  // Support chat handler
  useEffect(() => {
    if (activeTicketId) {
      fetchTicketMessages(activeTicketId);
    }
  }, [activeTicketId]);

  const fetchTicketMessages = async (tId) => {
    if (!tId) return;
    try {
      const res = await getSupportMessagesApi(tId);
      if (res && res.messages) {
        setActiveTicketMessages(res.messages);
      }
    } catch (err) {
      console.error("Could not fetch messages for ticket:", tId, err);
    }
  };

  const handleSendSupportMessage = async (e) => {
    if (e) e.preventDefault();
    if (!supportReplyText.trim()) return;

    const textToSend = supportReplyText.trim();
    setSupportReplyText('');

    try {
      await sendSupportMessageApi(activeTicketId, textToSend, 'admin');
      await fetchTicketMessages(activeTicketId);
    } catch (err) {
      showNotification("Failed to send support reply.", "error");
    }
  };

  const handleToggleTicketStatus = async () => {
    const currentTicket = ticketsList.find(t => t.ticket_id === activeTicketId);
    const newStatus = currentTicket?.status === 'closed' ? 'open' : 'closed';
    try {
      await updateTicketStatusApi(activeTicketId, newStatus);
      showNotification(`Ticket #${activeTicketId} marked as ${newStatus}.`, "success");
      const tickets = await getSupportTicketsApi();
      setTicketsList(tickets || []);
    } catch (err) {
      showNotification("Failed to update ticket status.", "error");
    }
  };

  // Onboard vendor submission
  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await onboardVendorApi(onboardForm);
      showNotification(res.detail || `Successfully onboarded vendor '${onboardForm.name}'.`, "success");
      setShowOnboardModal(false);
      setOnboardForm({ name: '', email: '', phone: '', password: 'Vendor123!' });
      fetchAllData();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to onboard vendor.";
      showNotification(msg, "error");
    }
  };

  // Vendor verification Approve / Reject
  const handleApproveApp = async (appId, appName) => {
    try {
      await verifyVendorApi(appId, 'approve');
      showNotification(`Approved vendor kitchen application for ${appName}.`, 'success');
      fetchAllData();
    } catch (err) {
      showNotification("Failed to approve vendor.", "error");
    }
  };

  const handleRejectApp = async (appId, appName) => {
    try {
      await verifyVendorApi(appId, 'reject');
      showNotification(`Rejected vendor kitchen application for ${appName}.`, 'error');
      fetchAllData();
    } catch (err) {
      showNotification("Failed to reject vendor.", "error");
    }
  };

  const handleSuspendVendor = async (vendorId, vendorName) => {
    try {
      await verifyVendorApi(vendorId, 'suspend');
      showNotification(`Suspended vendor kitchen ${vendorName}.`, 'error');
      fetchAllData();
    } catch (err) {
      showNotification("Failed to suspend vendor.", "error");
    }
  };

  const handleRestoreVendor = async (vendorId, vendorName) => {
    try {
      await verifyVendorApi(vendorId, 'restore');
      showNotification(`Restored vendor kitchen ${vendorName}.`, 'success');
      fetchAllData();
    } catch (err) {
      showNotification("Failed to restore vendor.", "error");
    }
  };

  // Manage Student
  const handleManageStudent = async (studentId, studentName, action) => {
    try {
      await manageStudentApi(studentId, action);
      showNotification(`Successfully ${action === 'suspend' ? 'deactivated' : 'activated'} student ${studentName}.`, action === 'suspend' ? 'error' : 'success');
      fetchAllData();
    } catch (err) {
      showNotification(`Failed to ${action} student.`, "error");
    }
  };

  // Menu item CRUD
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.price || !menuForm.vendor_id) {
      showNotification("Name, Price, and Vendor are required.", "error");
      return;
    }
    try {
      await createAdminMenuItemApi(menuForm);
      showNotification(`Menu item '${menuForm.name}' created successfully.`, "success");
      setShowAddMenuModal(false);
      resetMenuForm();
      fetchAllData();
    } catch (err) {
      showNotification(err.response?.data?.name?.[0] || "Failed to create menu item.", "error");
    }
  };

  const handleEditMenuItem = async (e) => {
    e.preventDefault();
    try {
      await updateAdminMenuItemApi(menuForm.id, menuForm);
      showNotification(`Menu item '${menuForm.name}' updated successfully.`, "success");
      setShowEditMenuModal(false);
      resetMenuForm();
      fetchAllData();
    } catch (err) {
      showNotification(err.response?.data?.name?.[0] || "Failed to update menu item.", "error");
    }
  };

  const handleDeleteMenuItem = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to delete '${itemName}'?`)) return;
    try {
      await deleteAdminMenuItemApi(itemId);
      showNotification(`Menu item '${itemName}' deleted successfully.`, "error");
      fetchAllData();
    } catch (err) {
      showNotification("Failed to delete menu item.", "error");
    }
  };

  const resetMenuForm = () => {
    setMenuForm({ id: '', name: '', description: '', price: '', available_qty: '', category: 'Main', meal_type: 'Lunch', food_type: 'Veg', is_available: true, vendor_id: '' });
  };

  // Tracker advance status
  const handleAdvanceOrderStatus = async (orderId, currentStatusIndex, currentTrackerId) => {
    const statusSteps = ['Confirmed', 'Preparing Food', 'Packed', 'Picked Up', 'Out For Delivery', 'Delivered'];
    const nextIndex = currentStatusIndex + 1;
    if (nextIndex >= statusSteps.length) {
      showNotification("Order already delivered.", "info");
      return;
    }

    const nextStatus = statusSteps[nextIndex];
    const etaMapping = ["Ready for Pickup", "15 mins", "10 mins", "8 mins", "Out for delivery", "Delivered"];
    const locationMapping = ["Tiffin Pickup Point", "Kitchen Grill", "Tiffin Counter", "Tiffin Box", "Out for delivery courier", "Completed"];

    try {
      // Update order tracker first
      await updateAdminOrderTrackerApi(currentTrackerId, {
        status_index: nextIndex,
        progress: Math.round((nextIndex / (statusSteps.length - 1)) * 100),
        eta: etaMapping[nextIndex],
        location: locationMapping[nextIndex]
      });
      // Refresh data
      showNotification(`Order status advanced to ${nextStatus}.`, "success");
      fetchAllData();
      if (selectedOrder && selectedOrder.id === orderId) {
        // Refresh selected details
        const updatedOrders = await getAdminOrdersApi();
        const matched = updatedOrders.find(o => o.order_id === orderId || o.id === orderId);
        setSelectedOrder(matched);
      }
    } catch (err) {
      showNotification("Failed to advance order tracker status.", "error");
    }
  };

  // Notification actions
  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await markNotificationReadApi(notificationId);
      const alerts = await getNotificationsApi();
      setNotifications(alerts || []);
      setStats(prev => ({ ...prev, unread_notifications: Math.max(0, prev.unread_notifications - 1) }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsReadApi();
      showNotification("All alerts marked as read.", "success");
      const alerts = await getNotificationsApi();
      setNotifications(alerts || []);
      setStats(prev => ({ ...prev, unread_notifications: 0 }));
    } catch (err) {
      console.error(err);
    }
  };

  // Save profile modifications
  const handleSaveProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfileApi({
        full_name: adminProfileForm.fullName,
        email: adminProfileForm.email,
        phone: adminProfileForm.phone
      });
      showNotification("Profile updated successfully.", "success");
      fetchAdminProfileData();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to update profile.";
      showNotification(msg, "error");
    }
  };

  // Password modifications
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showNotification("New passwords do not match.", "error");
      return;
    }
    try {
      await changeUserPasswordApi(passwordForm);
      showNotification("Password changed successfully.", "success");
      setShowChangePasswordModal(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const errObj = err.response?.data;
      const msg = typeof errObj === 'string' ? errObj : (errObj?.current_password || errObj?.detail || "Failed to change password.");
      showNotification(Array.isArray(msg) ? msg[0] : msg, "error");
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setBroadcasting(true);
    try {
      await sendAdminBroadcastApi({
        title: broadcastTitle.trim() || 'System Announcement',
        message: broadcastMessage.trim()
      });
      showNotification("Broadcast alert successfully pushed to all accounts!", "success");
      setBroadcastMessage('');
      setBroadcastTitle('System Broadcast');
      fetchAllData();
    } catch (err) {
      showNotification("Failed to send broadcast alert.", "error");
    } finally {
      setBroadcasting(false);
    }
  };

  const handleLogout = () => {
    logoutUser().catch((err) => console.log("Logout backend note:", err));
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  // Filters helpers
  const filteredVendors = vendors.filter(v => {
    const q = vendorSearchQuery.toLowerCase();
    const matchSearch = !q || v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) || v.phone.includes(q);
    const matchStatus = vendorStatusFilter === 'all' ||
      (vendorStatusFilter === 'verified' && v.is_verified) ||
      (vendorStatusFilter === 'pending' && !v.is_verified);
    return matchSearch && matchStatus;
  });

  const filteredStudents = students.filter(s => {
    const q = studentSearchQuery.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q);
    const matchStatus = studentStatusFilter === 'all' ||
      (studentStatusFilter === 'active' && s.is_active) ||
      (studentStatusFilter === 'suspended' && !s.is_active);
    return matchSearch && matchStatus;
  });

  // Filter menu items by selected vendor AND custom search/filter selections
  const filteredMenuItems = menuItems.filter(m => {
    if (viewingMenuVendor && String(m.vendor) !== String(viewingMenuVendor.real_id)) {
      return false;
    }
    const q = menuSearchQuery.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || (m.vendor_name || '').toLowerCase().includes(q);
    const matchMeal = menuMealFilter === 'all' || m.meal_type === menuMealFilter;
    const matchAvail = menuAvailabilityFilter === 'all' ||
      (menuAvailabilityFilter === 'available' && m.is_available) ||
      (menuAvailabilityFilter === 'unavailable' && !m.is_available);
    return matchSearch && matchMeal && matchAvail;
  });

  const filteredOrders = orders.filter(o => {
    const q = orderSearchQuery.toLowerCase();
    const matchSearch = !q || o.order_id.toLowerCase().includes(q) || (o.customer || '').toLowerCase().includes(q) || (o.vendor || '').toLowerCase().includes(q);
    const matchStatus = orderStatusFilter === 'all' || o.deliveryStatus === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  const pendingVendorQueue = vendors.filter(v => !v.is_verified);

  return (
    <div className="admin-portal-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(180, 83, 9, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
          <button className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setViewingMenuVendor(null); setActiveTab('overview'); }}>
            <div className="admin-nav-item-left">
              <Grid size={18} />
              <span>Overview</span>
            </div>
          </button>

          <button className={`admin-nav-item ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => { setViewingMenuVendor(null); setActiveTab('vendors'); }}>
            <div className="admin-nav-item-left">
              <Store size={18} />
              <span>Vendors</span>
            </div>
            {pendingVendorQueue.length > 0 && <span className="sidebar-nav-badge alert-badge">{pendingVendorQueue.length}</span>}
          </button>

          <button className={`admin-nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => { setViewingMenuVendor(null); setActiveTab('students'); }}>
            <div className="admin-nav-item-left">
              <GraduationCap size={18} />
              <span>Students</span>
            </div>
          </button>

          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => { setViewingMenuVendor(null); setActiveTab('orders'); }}>
            <div className="admin-nav-item-left">
              <FileText size={18} />
              <span>Orders</span>
            </div>
          </button>

          <button className={`admin-nav-item ${activeTab === 'revenue' ? 'active' : ''}`} onClick={() => { setViewingMenuVendor(null); setActiveTab('revenue'); }}>
            <div className="admin-nav-item-left">
              <TrendingUp size={18} />
              <span>Revenue Reports</span>
            </div>
          </button>

          <button className={`admin-nav-item ${activeTab === 'support' ? 'active' : ''}`} onClick={() => { setViewingMenuVendor(null); setActiveTab('support'); }}>
            <div className="admin-nav-item-left">
              <MessageSquare size={18} />
              <span>Support</span>
            </div>
            {ticketsList.filter(t => t.status !== 'closed').length > 0 && (
              <span className="sidebar-nav-badge alert-badge">{ticketsList.filter(t => t.status !== 'closed').length} Live</span>
            )}
          </button>

          <button className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setViewingMenuVendor(null); setActiveTab('settings'); }}>
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
              placeholder={
                activeTab === 'vendors' ? (viewingMenuVendor ? "Search menu items..." : "Search vendor name, email, ID...") :
                  activeTab === 'students' ? "Search student name, email, ID..." :
                    activeTab === 'orders' ? "Search order ID..." :
                      "Search dashboard..."
              }
              className="search-bar-input"
              value={
                activeTab === 'vendors' ? (viewingMenuVendor ? menuSearchQuery : vendorSearchQuery) :
                  activeTab === 'students' ? studentSearchQuery :
                    activeTab === 'orders' ? orderSearchQuery : ''
              }
              onChange={(e) => {
                const val = e.target.value;
                if (activeTab === 'vendors') {
                  if (viewingMenuVendor) setMenuSearchQuery(val);
                  else setVendorSearchQuery(val);
                }
                else if (activeTab === 'students') setStudentSearchQuery(val);
                else if (activeTab === 'orders') setOrderSearchQuery(val);
              }}
            />
          </div>

          <div className="header-profile-section" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Notification Bell Dropdown */}
            <div style={{ position: 'relative' }} ref={notificationsDropdownRef}>
              <button
                className="header-icon-btn notification-bell"
                onClick={() => setShowNotificationsDropdown(prev => !prev)}
              >
                <Bell size={20} />
                {stats.unread_notifications > 0 && (
                  <span className="notification-dot"></span>
                )}
              </button>

              {showNotificationsDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '40px',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  zIndex: 2000,
                  width: '320px',
                  maxHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Real-time System Alerts</h4>
                    {stats.unread_notifications > 0 && (
                      <button onClick={handleMarkAllNotificationsRead} style={{ border: 'none', background: 'none', color: '#ea580c', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                        No system notifications.
                      </div>
                    ) : (
                      notifications.map(alert => (
                        <div
                          key={alert.id}
                          onClick={() => alert.unread && handleMarkNotificationRead(alert.id)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            backgroundColor: alert.unread ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                            borderBottom: '1px solid #f8fafc',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: alert.unread ? '#ea580c' : '#475569' }}>
                              {alert.title}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{alert.time}</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.3 }}>
                            {alert.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="header-divider"></div>

            <div className="profile-details-wrapper">
              <div className="profile-text">
                <span className="profile-name">{adminProfileForm.fullName}</span>
                <span className="profile-role">SUPER ADMIN</span>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#855300', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem' }}>
                {adminProfileForm.fullName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-main-content">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              <div className="dashboard-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 className="dashboard-title" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Platform Executive Overview
                  </h1>
                  <p className="dashboard-subtitle" style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Real-time revenue metrics, vendor verification queue, and support desk status.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button onClick={fetchAllData} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 700 }}>
                    <RotateCw size={14} />
                    <span>Sync DB</span>
                  </button>

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
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
                  justifyContent: 'space-between',
                  minHeight: '140px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.85)' }}>
                        TOTAL COMMISSION REVENUE
                      </span>
                      <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '6px 0 0 0', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                        ₹{(stats.overall_revenue * (commissionRate / 100)).toLocaleString()}
                      </h2>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Percent size={20} style={{ color: '#ffffff' }} />
                    </div>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, width: 'fit-content', marginTop: '14px', zIndex: 2 }}>
                    <TrendingUp size={14} />
                    <span>+{commissionRate}% gross fee share</span>
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
                  justifyContent: 'space-between',
                  minHeight: '140px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748b' }}>
                        TOTAL ORDERS
                      </span>
                      <h3 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 0 0' }}>
                        {orders.length}
                      </h3>
                    </div>
                    <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#10b981', marginTop: '14px' }}>
                    <TrendingUp size={14} />
                    <span>{stats.today_orders} orders today</span>
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
                  justifyContent: 'space-between',
                  minHeight: '140px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748b' }}>
                        AVG ORDER VALUE
                      </span>
                      <h3 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 0 0' }}>
                        ₹{stats.avg_order_value}
                      </h3>
                    </div>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={20} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#10b981', marginTop: '14px' }}>
                    <span>Gross sales: ₹{stats.overall_revenue.toLocaleString()}</span>
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
                  justifyContent: 'space-between',
                  minHeight: '140px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748b' }}>
                        KITCHEN PARTNERS
                      </span>
                      <h3 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 0 0' }}>
                        {vendors.filter(v => v.is_verified).length}
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

              {/* Operations & Control Tier: Split Grid */}
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
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(217, 119, 6, 0.12)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Store size={18} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
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
                                <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>{item.email} • {item.phone}</p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              <button
                                onClick={() => handleRejectApp(item.real_id, item.name)}
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
                                onClick={() => handleApproveApp(item.real_id, item.name)}
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
                    onClick={() => { setActiveTab('vendors'); setVendorStatusFilter('pending'); }}
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
                    <span>View All Vendor Applications ({vendors.filter(v => !v.is_verified).length})</span>
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
                  justifyContent: 'space-between',
                  gap: '20px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Settings size={18} />
                      </div>
                      <div style={{ textAlign: 'left' }}>
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
                        justifyContent: 'space-between',
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
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: healthData.backend.is_active ? '#22c55e' : '#ef4444',
                            animation: healthData.backend.is_active ? 'ping 1.5s infinite' : 'none'
                          }}></span>
                          {healthData.backend.is_active ? 'ONLINE' : 'OFFLINE'}
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
                        justifyContent: 'space-between',
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
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: healthData.brevo.is_active ? '#22c55e' : '#d97706',
                            animation: healthData.brevo.is_active ? 'ping 1.5s infinite' : 'none'
                          }}></span>
                          {healthData.brevo.is_active ? (healthData.brevo.status === 'Active' ? 'ACTIVE' : 'FALLBACK ACTIVE') : 'OFFLINE'}
                        </span>
                      </div>
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '24px 0' }}></div>

                    {/* Broadcast Announcement Board */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bell size={18} />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Broadcast Alert Board
                        </h2>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                          Send a push announcement to all Students & Vendors.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>ANNOUNCEMENT TITLE</label>
                        <input
                          type="text"
                          placeholder="e.g. Weather Alert or System Maintenance"
                          value={broadcastTitle}
                          onChange={(e) => setBroadcastTitle(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>MESSAGE TEXT *</label>
                        <textarea
                          placeholder="Type announcement message details here..."
                          value={broadcastMessage}
                          onChange={(e) => setBroadcastMessage(e.target.value)}
                          rows="2"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8rem',
                            outline: 'none',
                            resize: 'none',
                            fontFamily: 'inherit'
                          }}
                        />
                      </div>
                      <button
                        onClick={handleSendBroadcast}
                        disabled={!broadcastMessage.trim() || broadcasting}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          backgroundColor: (!broadcastMessage.trim() || broadcasting) ? '#cbd5e1' : '#ea580c',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          border: 'none',
                          cursor: (!broadcastMessage.trim() || broadcasting) ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Send size={14} />
                        <span>{broadcasting ? 'Publishing Alert...' : 'Publish Announcement'}</span>
                      </button>
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

          {/* TAB 2: VENDORS */}
          {activeTab === 'vendors' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {viewingMenuVendor ? (
                /* NESTED VIEW: Menu Management inside Vendor */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Premium Back navigation header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                      onClick={() => setViewingMenuVendor(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#64748b',
                        fontWeight: 800,
                        fontSize: '0.84rem',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    >
                      <ChevronLeft size={16} />
                      <span>Back to Vendors Directory</span>
                    </button>
                  </div>

                  {/* Vendor overview summary details card */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '20px 24px',
                    border: '1px solid #e2e8f0',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    textAlign: 'left'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>SELECTED KITCHEN</span>
                      <h3 style={{ margin: '2px 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{viewingMenuVendor.name}</h3>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{viewingMenuVendor.email}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>KITCHEN RATING</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>★ {viewingMenuVendor.average_rating}</span>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>(Live average)</span>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>OPERATING TIMINGS</span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>{viewingMenuVendor.timings || 'Active Slots'}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>VERIFIED STATE</span>
                      <div style={{ marginTop: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '99px', backgroundColor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>
                          🟢 Active Kitchen Partner
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', marginTop: '10px' }}>
                    <div>
                      <h1 className="dashboard-title">"{viewingMenuVendor.name}" Menu Management</h1>
                      <p className="dashboard-subtitle">Configure tiffin dishes, categories, pricing, and active quantities for this kitchen vendor.</p>
                    </div>
                    <button
                      onClick={() => { resetMenuForm(); setMenuForm(prev => ({ ...prev, vendor_id: viewingMenuVendor.real_id })); setShowAddMenuModal(true); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#ea580c', color: '#ffffff', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)' }}
                    >
                      <Plus size={16} />
                      <span>Add Menu Item</span>
                    </button>
                  </div>

                  {/* Menu table */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <select
                        value={menuMealFilter}
                        onChange={(e) => setMenuMealFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }}
                      >
                        <option value="all">All Meal Types</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                      </select>

                      <select
                        value={menuAvailabilityFilter}
                        onChange={(e) => setMenuAvailabilityFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }}
                      >
                        <option value="all">All Availability</option>
                        <option value="available">Available Only</option>
                        <option value="unavailable">Unavailable Only</option>
                      </select>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Tiffin Dish Name</th>
                            <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Meal Category</th>
                            <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Price</th>
                            <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Stock status</th>
                            <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Availability</th>
                            <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMenuItems.length === 0 ? (
                            <tr>
                              <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No dishes created for this kitchen thali menu.</td>
                            </tr>
                          ) : (
                            filteredMenuItems.map(m => (
                              <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                                    {/* Pure CSS Veg / Non-Veg Indicator Dot inside square */}
                                    <div style={{
                                      width: '16px',
                                      height: '16px',
                                      border: `1.5px solid ${m.food_type === 'Veg' ? '#22c55e' : '#ef4444'}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRadius: '3px',
                                      backgroundColor: '#ffffff',
                                      flexShrink: 0
                                    }} title={m.food_type}>
                                      <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: m.food_type === 'Veg' ? '#22c55e' : '#ef4444'
                                      }}></div>
                                    </div>

                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {m.image ? (
                                        <img src={m.image} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                      ) : (
                                        <Tag size={16} style={{ color: '#94a3b8' }} />
                                      )}
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>{m.name}</div>
                                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{m.description || 'No description provided'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px', fontSize: '0.78rem', color: '#475569' }}>
                                  <div>{m.category} • {m.meal_type}</div>
                                </td>
                                <td style={{ padding: '12px 8px', fontSize: '0.86rem', fontWeight: 900, color: '#1e293b' }}>
                                  ₹{m.price}
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  {m.available_qty === 0 ? (
                                    <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Flame size={12} /> Out of stock
                                    </span>
                                  ) : m.available_qty < 10 ? (
                                    <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', color: '#d97706', backgroundColor: 'rgba(217, 119, 6, 0.1)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <AlertTriangle size={12} /> Low stock ({m.available_qty})
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', color: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.1)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <CheckCircle size={12} /> Stock: {m.available_qty}
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', color: m.is_available ? '#16a34a' : '#dc2626', backgroundColor: m.is_available ? '#dcfce7' : '#fee2e2' }}>
                                    {m.is_available ? 'Active Thali' : 'Inactive'}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      onClick={() => {
                                        setMenuForm({
                                          id: m.id,
                                          name: m.name,
                                          description: m.description || '',
                                          price: m.price,
                                          available_qty: m.available_qty,
                                          category: m.category || 'Main',
                                          meal_type: m.meal_type || 'Lunch',
                                          food_type: m.food_type || 'Veg',
                                          is_available: m.is_available,
                                          vendor_id: m.vendor
                                        });
                                        setShowEditMenuModal(true);
                                      }}
                                      style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                      Edit
                                    </button>
                                    <button onClick={() => handleDeleteMenuItem(m.id, m.name)} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* NORMAL VENDORS LIST DIRECTORY VIEW */
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                      <h1 className="dashboard-title">Vendors Management</h1>
                      <p className="dashboard-subtitle">Oversee kitchen partners, manage verification approvals, and track quality metrics.</p>
                    </div>
                    <button onClick={() => setShowOnboardModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#ea580c', color: '#ffffff', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)' }}>
                      <Plus size={16} />
                      <span>Onboard Kitchen</span>
                    </button>
                  </div>

                  {/* Vendors KPI Grid */}
                  <div className="admin-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    <div className="kpi-card-white">
                      <div className="kpi-card-inner">
                        <span className="kpi-card-label">ACTIVE VENDORS</span>
                        <h3 className="kpi-card-value">
                          {vendors.filter(v => v.is_verified).length}
                        </h3>
                      </div>
                      <div className="vendors-trend-badge green-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.1)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                        <TrendingUp size={12} />
                        <span>Live DB</span>
                      </div>
                    </div>

                    <div className="kpi-card-white" style={{ border: '1px solid #f59e0b' }}>
                      <div className="kpi-card-inner">
                        <span className="kpi-card-label">PENDING APPROVAL</span>
                        <h3 className="kpi-card-value">{pendingVendorQueue.length}</h3>
                      </div>
                      <button
                        className="check-queue-btn"
                        onClick={() => setVendorStatusFilter(vendorStatusFilter === 'pending' ? 'all' : 'pending')}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', color: '#0f172a', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        {vendorStatusFilter === 'pending' ? 'Show All' : 'Check queue'}
                      </button>
                    </div>

                    <div className="kpi-card-white">
                      <div className="kpi-card-inner">
                        <span className="kpi-card-label">AVG. RATING</span>
                        <h3 className="kpi-card-value">{stats.avg_rating}</h3>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                        {Array.from({ length: Math.round(Number(stats.avg_rating)) || 5 }).map((_, i) => (
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
                          {filteredVendors.length === 0 ? (
                            <tr>
                              <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
                                No vendor partners matching the selected filters.
                              </td>
                            </tr>
                          ) : (
                            filteredVendors.map(vendor => (
                              <tr key={vendor.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#855300', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                    {vendor.name.charAt(0).toUpperCase()}
                                  </div>
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
                                    color: !vendor.is_active ? '#dc2626' : (vendor.is_verified ? '#16a34a' : '#d97706'),
                                    backgroundColor: !vendor.is_active ? '#fee2e2' : (vendor.is_verified ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.1)'),
                                    padding: '4px 10px',
                                    borderRadius: '99px'
                                  }}>
                                    {!vendor.is_active ? '🔴 Blocked' : (vendor.is_verified ? '🟢 Verified' : '🟡 Pending Approval')}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 8px', fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b' }}>
                                  ★ {vendor.average_rating}
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => setSelectedVendor(vendor)} style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer' }}>
                                      Inspect
                                    </button>

                                    <button onClick={() => setViewingMenuVendor(vendor)} style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#ea580c', color: '#ffffff', fontWeight: 800, fontSize: '0.74rem', cursor: 'pointer' }}>
                                      View Menu
                                    </button>

                                    {!vendor.is_verified ? (
                                      <>
                                        <button onClick={() => handleApproveApp(vendor.real_id, vendor.name)} style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: 800, fontSize: '0.74rem', cursor: 'pointer' }}>
                                          Approve
                                        </button>
                                        <button onClick={() => handleRejectApp(vendor.real_id, vendor.name)} style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', fontWeight: 800, fontSize: '0.74rem', cursor: 'pointer' }}>
                                          Reject
                                        </button>
                                      </>
                                    ) : (
                                      vendor.is_active ? (
                                        <button onClick={() => handleSuspendVendor(vendor.real_id, vendor.name)} style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer' }}>
                                          Suspend
                                        </button>
                                      ) : (
                                        <button onClick={() => handleRestoreVendor(vendor.real_id, vendor.name)} style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: 850, fontSize: '0.74rem', cursor: 'pointer' }}>
                                          Restore
                                        </button>
                                      )
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Global Customer Reviews Feed */}
                  <div style={{ marginTop: '24px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                    <h2 className="dashboard-heading" style={{ fontSize: '1.1rem' }}>Global Reviews & Feedback Feed</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                      <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                        <p style={{ margin: 0, fontWeight: 700 }}>No feedback has been submitted yet</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem' }}>Customer review submissions will aggregate and appear here in real-time.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: STUDENTS */}
          {activeTab === 'students' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <h1 className="dashboard-title">Students Management</h1>
                  <p className="dashboard-subtitle">Oversee registered student directory, subscription plans, and status controls.</p>
                </div>
              </div>

              {/* Students Control Table */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <input
                    type="text"
                    placeholder="Search student name, email, ID..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
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
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }}
                  >
                    <option value="all">All Student Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Student Profile</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Contact details</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Joined Date</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Activity Summary</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No student records matched search criteria.</td>
                        </tr>
                      ) : (
                        filteredStudents.map(s => (
                          <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 850 }}>
                                  {s.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{s.name}</div>
                                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID: {s.id}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 8px', fontSize: '0.78rem', color: '#475569' }}>
                              <div>{s.email}</div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{s.phone}</div>
                            </td>
                            <td style={{ padding: '12px 8px', fontSize: '0.78rem', color: '#475569' }}>
                              {s.created_at}
                            </td>
                            <td style={{ padding: '12px 8px', fontSize: '0.78rem', color: '#475569' }}>
                              <div>{s.orders_count} orders placed</div>
                              <div style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 700 }}>{s.subscriptions_count} active plans • {s.cart_items_count} cart items</div>
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', color: s.is_active ? '#16a34a' : '#dc2626', backgroundColor: s.is_active ? '#dcfce7' : '#fee2e2' }}>
                                {s.is_active ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => setSelectedStudent(s)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                                  Inspect Details
                                </button>
                                {s.is_active ? (
                                  <button onClick={() => handleManageStudent(s.real_id, s.name, 'suspend')} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fff5f5', color: '#dc2626', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                                    Deactivate
                                  </button>
                                ) : (
                                  <button onClick={() => handleManageStudent(s.real_id, s.name, 'restore')} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                                    Restore
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <h1 className="dashboard-title">Orders Dispatch Board</h1>
                  <p className="dashboard-subtitle">Monitor live delivery/pickup tracker flows and payment confirmations.</p>
                </div>
              </div>

              {/* Orders Control List */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <input
                    type="text"
                    placeholder="Search order ID..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
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
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }}
                  >
                    <option value="all">All Order Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing Food">Preparing Food</option>
                    <option value="Packed">Packed</option>
                    <option value="Out For Delivery">Out For Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>OrderID</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Student buyer</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Kitchen Kitchen</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Bill</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Order Date</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Payment Status</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Tracker Status</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No orders placed on the system.</td>
                        </tr>
                      ) : (
                        filteredOrders.map(o => (
                          <tr key={o.order_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 850, color: '#0f172a' }}>
                              {o.order_id}
                            </td>
                            <td style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                              {o.customer}
                            </td>
                            <td style={{ padding: '12px 8px', fontSize: '0.8rem', color: '#334155' }}>
                              {o.vendor}
                            </td>
                            <td style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                              ₹{o.bill}
                            </td>
                            <td style={{ padding: '12px 8px', fontSize: '0.74rem', color: '#64748b' }}>
                              {o.date}
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', color: '#16a34a', backgroundColor: '#dcfce7' }}>
                                {o.paymentStatus || 'Paid'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', color: o.deliveryStatus === 'Delivered' ? '#16a34a' : o.deliveryStatus === 'Cancelled' ? '#dc2626' : '#ea580c', backgroundColor: o.deliveryStatus === 'Delivered' ? '#dcfce7' : o.deliveryStatus === 'Cancelled' ? '#fee2e2' : '#fef3c7' }}>
                                {o.deliveryStatus}
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <button onClick={() => setSelectedOrder(o)} style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                                Track & View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REVENUE REPORTS */}
          {activeTab === 'revenue' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ textAlign: 'left' }}>
                <h1 className="dashboard-title">Overall Revenue Reports</h1>
                <p className="dashboard-subtitle">Verify overall daily, weekly, monthly collections and platform commission distributions.</p>
              </div>

              {/* Financial KPI stats cards row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Today's Revenue</span>
                  <h3 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>₹{stats.today_revenue.toLocaleString()}</h3>
                  <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>Commission: ₹{(stats.today_revenue * (commissionRate / 100)).toFixed(1)}</span>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Weekly Revenue</span>
                  <h3 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>₹{stats.weekly_revenue.toLocaleString()}</h3>
                  <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>Commission: ₹{(stats.weekly_revenue * (commissionRate / 100)).toFixed(1)}</span>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Monthly Revenue</span>
                  <h3 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>₹{stats.monthly_revenue.toLocaleString()}</h3>
                  <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>Commission: ₹{(stats.monthly_revenue * (commissionRate / 100)).toFixed(1)}</span>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Overall Gross Sales</span>
                  <h3 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ea580c', margin: '4px 0 0 0' }}>₹{stats.overall_revenue.toLocaleString()}</h3>
                  <span style={{ fontSize: '0.68rem', color: '#ea580c', fontWeight: 800 }}>Fee collected: ₹{(stats.overall_revenue * (commissionRate / 100)).toFixed(1)} ({commissionRate}%)</span>
                </div>
              </div>

              {/* Vendor Sales Breakdown Table */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Kitchen Revenue & platform fee Share Breakdown</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Kitchen Partner</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Email ID</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Completed Orders</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total gross sales</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Platform fee Share ({commissionRate}%)</th>
                        <th style={{ padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Chef payout Net Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No vendor records to display financials.</td>
                        </tr>
                      ) : (
                        vendors.map(v => {
                          const comm = v.total_sales * (commissionRate / 100);
                          const payout = v.total_sales - comm;
                          return (
                            <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 8px', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{v.name}</td>
                              <td style={{ padding: '12px 8px', fontSize: '0.78rem', color: '#475569' }}>{v.email}</td>
                              <td style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>{v.total_orders} orders</td>
                              <td style={{ padding: '12px 8px', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>₹{v.total_sales.toLocaleString()}</td>
                              <td style={{ padding: '12px 8px', fontSize: '0.82rem', fontWeight: 800, color: '#ea580c' }}>₹{comm.toLocaleString()}</td>
                              <td style={{ padding: '12px 8px', fontSize: '0.82rem', fontWeight: 800, color: '#16a34a' }}>₹{payout.toLocaleString()}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SUPPORT DESK */}
          {activeTab === 'support' && (
            <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '20px' }}>
              {/* Support Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9', textAlign: 'left' }}>
                <div>
                  <h1 className="dashboard-title" style={{ fontSize: '1.3rem', margin: 0 }}>Support & Help Center</h1>
                  <p className="dashboard-subtitle" style={{ margin: '4px 0 0 0' }}>Manage customer complaints, vendor inquiries, and live chat resolution.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '6px 14px', borderRadius: '99px' }}>
                    {ticketsList.filter(t => t.status !== 'closed').length} Active Open Tickets
                  </span>
                </div>
              </div>

              {/* 2-Column ticket chats console */}
              <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', minHeight: '480px' }}>
                {/* Tickets list */}
                <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Search ticket content..."
                    value={supportSearchQuery}
                    onChange={(e) => setSupportSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['all', 'customer', 'vendor', 'closed'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setSupportTabFilter(tab)}
                        style={{
                          flex: 1,
                          padding: '4px 6px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: supportTabFilter === tab ? '#0f172a' : '#f1f5f9',
                          color: supportTabFilter === tab ? '#ffffff' : '#64748b'
                        }}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '400px' }}>
                    {ticketsList.filter(t => {
                      const matchQuery = !supportSearchQuery || t.ticket_id.toLowerCase().includes(supportSearchQuery.toLowerCase()) || t.userName.toLowerCase().includes(supportSearchQuery.toLowerCase()) || t.title.toLowerCase().includes(supportSearchQuery.toLowerCase());
                      const matchTab = supportTabFilter === 'all' ? true : (supportTabFilter === 'closed' ? t.status === 'closed' : t.userType === supportTabFilter && t.status !== 'closed');
                      return matchQuery && matchTab;
                    }).map(t => (
                      <div
                        key={t.ticket_id}
                        onClick={() => setActiveTicketId(t.ticket_id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          backgroundColor: t.ticket_id === activeTicketId ? 'rgba(133, 83, 0, 0.05)' : '#f8fafc',
                          border: t.ticket_id === activeTicketId ? '1px solid #855300' : '1px solid #cbd5e1',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 850, color: '#0f172a' }}>#{t.ticket_id}</span>
                          <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', color: t.status === 'closed' ? '#64748b' : '#2563eb', backgroundColor: t.status === 'closed' ? '#e2e8f0' : 'rgba(37,99,235,0.1)' }}>{t.status.toUpperCase()}</span>
                        </div>
                        <h4 style={{ margin: '4px 0', fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</h4>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{t.userName}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat window */}
                {(() => {
                  const currentT = ticketsList.find(t => t.ticket_id === activeTicketId);
                  if (!currentT) {
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                        Select a support ticket chat thread to inspect.
                      </div>
                    );
                  }
                  const isClosed = currentT.status === 'closed';

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '440px' }}>
                      <div style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', textAlign: 'left' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800 }}>{currentT.title}</h3>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>User: {currentT.userName} ({currentT.userEmail}) • Order ID: {currentT.orderId}</span>
                        </div>
                        <button onClick={handleToggleTicketStatus} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: isClosed ? '#2563eb' : '#16a34a', color: '#ffffff', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}>
                          {isClosed ? 'Reopen Ticket' : 'Mark Resolved'}
                        </button>
                      </div>

                      {/* Chat messages */}
                      <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', overflowY: 'auto', maxHeight: '250px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activeTicketMessages.map((msg, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-start' : 'flex-end' }}>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '2px' }}>{msg.sender === 'user' ? currentT.userName : 'Support Lead'} • {msg.time}</span>
                            <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: '12px', fontSize: '#0f172a', backgroundColor: msg.sender === 'user' ? '#f1f5f9' : '#855300', color: msg.sender === 'user' ? '#0f172a' : '#ffffff', fontSize: '0.8rem', textAlign: 'left' }}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Support Quick Templates Options */}
                      {!isClosed && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', textAlign: 'left' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>QUICK TEMPLATES:</span>
                          {quickTemplates.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSupportReplyText(item.text)}
                              style={{
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#f8fafc',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                color: '#475569',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <form onSubmit={handleSendSupportMessage} style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                        <input
                          type="text"
                          placeholder={isClosed ? "Ticket closed. Reopen ticket to chat..." : "Write message text reply..."}
                          disabled={isClosed}
                          value={supportReplyText}
                          onChange={(e) => setSupportReplyText(e.target.value)}
                          style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none' }}
                        />
                        <button type="submit" disabled={isClosed || !supportReplyText.trim()} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: isClosed || !supportReplyText.trim() ? '#cbd5e1' : '#855300', color: '#ffffff', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}>
                          Send
                        </button>
                      </form>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Settings Page Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <h1 className="dashboard-title">Platform & Admin Settings</h1>
                  <p className="dashboard-subtitle">Manage super administrator profile, security protocols, platform commission rates, and live system health.</p>
                </div>
                <button
                  onClick={checkHealth}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 750,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                  }}
                >
                  <RotateCw size={14} /> Re-check System Health
                </button>
              </div>

              {/* Main Settings Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>

                {/* CARD 1: Profile & Contact Configuration */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(133, 83, 0, 0.1)', color: '#855300', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 850, flexShrink: 0 }}>
                      <User size={24} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 850, color: '#0f172a' }}>{adminProfileForm.fullName || 'Admin User'}</h3>
                        <span style={{ fontSize: '0.66rem', fontWeight: 850, color: '#855300', backgroundColor: 'rgba(133, 83, 0, 0.1)', padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase' }}>
                          SUPER ADMIN
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>{adminProfileForm.email}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 850, color: '#475569', marginBottom: '6px', letterSpacing: '0.5px' }}>FULL NAME</label>
                      <input
                        type="text"
                        value={adminProfileForm.fullName}
                        onChange={(e) => setAdminProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 850, color: '#475569', marginBottom: '6px', letterSpacing: '0.5px' }}>EMAIL ADDRESS</label>
                      <input
                        type="email"
                        value={adminProfileForm.email}
                        onChange={(e) => setAdminProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 850, color: '#475569', marginBottom: '6px', letterSpacing: '0.5px' }}>CONTACT PHONE NUMBER</label>
                      <input
                        type="text"
                        value={adminProfileForm.phone}
                        onChange={(e) => setAdminProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 850, color: '#475569', marginBottom: '6px', letterSpacing: '0.5px' }}>SYSTEM ROLE PERMISSIONS</label>
                      <input
                        type="text"
                        disabled
                        value={adminProfileForm.role || 'Super Administrator'}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.84rem', fontWeight: 700 }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        marginTop: '6px',
                        width: 'fit-content',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#855300',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        fontWeight: 850,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(133, 83, 0, 0.2)'
                      }}
                    >
                      <CheckCircle size={16} /> Save Profile Changes
                    </button>
                  </form>
                </div>

                {/* RIGHT COLUMN: Financial Controls & Security */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* CARD 2: Platform Financial Controls */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Percent size={18} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 850, color: '#0f172a' }}>Platform Commission Rules</h3>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>Configure platform fee deducted from vendor order totals</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 850, color: '#ea580c', backgroundColor: 'rgba(234, 88, 12, 0.1)', padding: '4px 12px', borderRadius: '10px' }}>
                        {commissionRate}%
                      </span>
                    </div>

                    <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#9a3412' }}>Live Commission Rate Fee</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 850, color: '#ea580c' }}>{commissionRate}% per order</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={tempCommission}
                        onChange={(e) => setTempCommission(Number(e.target.value))}
                        onMouseUp={async () => {
                          setCommissionRate(tempCommission);
                          try {
                            await updateCommissionRateApi(tempCommission);
                            showNotification(`Commission rate updated to ${tempCommission}% in Database.`, 'success');
                          } catch (err) {
                            showNotification("Failed to update commission rate.", "error");
                          }
                        }}
                        style={{ width: '100%', accentColor: '#ea580c', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9a3412', marginTop: '4px', fontWeight: 700 }}>
                        <span>0% (No Fee)</span>
                        <span>15% (Default)</span>
                        <span>30% (Max)</span>
                      </div>
                    </div>

                    {/* Breakdown example */}
                    <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#475569' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Order Payout Calculation Breakdown:</div>
                      <div>• On a ₹100 order: Vendor receives <strong style={{ color: '#16a34a' }}>₹{(100 * (1 - commissionRate / 100)).toFixed(2)}</strong></div>
                      <div>• CampusLunch Platform Fee: <strong style={{ color: '#ea580c' }}>₹{(100 * (commissionRate / 100)).toFixed(2)}</strong> ({commissionRate}%)</div>
                    </div>
                  </div>

                  {/* CARD 3: Security & Authorization Controls */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={18} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 850, color: '#0f172a' }}>Security & Authorization</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>Password updates, authentication sessions, and access locks</p>
                      </div>
                    </div>

                    {/* Password Sub-item */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid #cbd5e1', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Key size={16} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 850, color: '#0f172a' }}>Change Password</h4>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>Update super admin login credentials</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowChangePasswordModal(true)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1px solid #855300',
                          backgroundColor: '#ffffff',
                          color: '#855300',
                          fontSize: '0.76rem',
                          fontWeight: 850,
                          cursor: 'pointer'
                        }}
                      >
                        Update Password
                      </button>
                    </div>

                    {/* Active Session Diagnostics */}
                    <div style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '0.76rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b', fontWeight: 700 }}>Current Session Host:</span>
                        <span style={{ fontWeight: 850, color: '#0f172a' }}>127.0.0.1 (Localhost / Production)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b', fontWeight: 700 }}>JWT Access Token Status:</span>
                        <span style={{ fontWeight: 850, color: '#16a34a' }}>● ACTIVE & AUTHORIZED</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b', fontWeight: 700 }}>Database Authority:</span>
                        <span style={{ fontWeight: 850, color: '#2563eb' }}>Railway MySQL (Role: Admin)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 4: FULL WIDTH LIVE SYSTEM DIAGNOSTICS */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'left', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Monitor size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 850, color: '#0f172a' }}>Live System Diagnostics & Service Telemetry</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>Real-time service health, server latency, and integration endpoints</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 850, color: healthData.backend.is_active ? '#16a34a' : '#dc2626', backgroundColor: healthData.backend.is_active ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)', padding: '4px 12px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: healthData.backend.is_active ? '#22c55e' : '#ef4444', animation: healthData.backend.is_active ? 'ping 1.5s infinite' : 'none' }}></span>
                    {healthData.backend.is_active ? 'ALL SYSTEMS OPERATIONAL' : 'SYSTEM DEGRADATION'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {/* Indicator 1: Django Backend */}
                  <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 850, color: '#0f172a' }}>Django API Backend</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{healthData.backend.message}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 850, color: '#16a34a' }}>ONLINE</div>
                      {healthData.backend.latency_ms > 0 && <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{healthData.backend.latency_ms}ms latency</div>}
                    </div>
                  </div>

                  {/* Indicator 2: Brevo Email Service */}
                  <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 850, color: '#0f172a' }}>Brevo Email OTP Service</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{healthData.brevo.message}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 850, color: '#6366f1' }}>ACTIVE</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>SMTP Relay Ready</div>
                    </div>
                  </div>

                  {/* Indicator 3: Railway MySQL DB */}
                  <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Cloud size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 850, color: '#0f172a' }}>Railway MySQL Database</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>tokaido.proxy.rlwy.net:30474</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 850, color: '#ea580c' }}>CONNECTED</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Live Tables Synced</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: STUDENT DETAILS INPSECTOR */}
      {selectedStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedStudent(null)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '580px', maxHeight: '80vh', overflowY: 'auto', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Student details: {selectedStudent.name}</h2>
              <button onClick={() => setSelectedStudent(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Profile Card */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.84rem', fontWeight: 800 }}>Contact Profile</h4>
                <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569' }}>Email: {selectedStudent.email} | Phone: {selectedStudent.phone}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: '#475569' }}>Registration Date: {selectedStudent.created_at} | Last Login: {selectedStudent.last_login}</p>
              </div>

              {/* Active Subscription Details */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.84rem', fontWeight: 800 }}>Active Tiffin Subscriptions</h4>
                {selectedStudent.subscriptions.length === 0 ? (
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>No active subscriptions.</p>
                ) : (
                  selectedStudent.subscriptions.map(sub => (
                    <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#fdf8f2', border: '1px solid #fbd38d', borderRadius: '10px', marginBottom: '6px', fontSize: '0.78rem' }}>
                      <div>
                        <strong>{sub.plan_type}</strong> (Kitchen: {sub.vendor_name})
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Duration: {sub.start_date} to {sub.end_date}</div>
                      </div>
                      <span style={{ fontWeight: 800, color: '#dd6b20' }}>₹{sub.price}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Current Cart Items */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.84rem', fontWeight: 800 }}>Current Tiffin Cart</h4>
                {selectedStudent.cart_items.length === 0 ? (
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Cart is empty.</p>
                ) : (
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    {selectedStudent.cart_items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.78rem' }}>
                        <span>{item.quantity} x {item.menu_item_name}</span>
                        <span style={{ fontWeight: 800 }}>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order History */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.84rem', fontWeight: 800 }}>Order History List</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedStudent.orders.length === 0 ? (
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>No orders placed.</p>
                  ) : (
                    selectedStudent.orders.slice(0, 5).map(o => (
                      <div key={o.order_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #f1f5f9', fontSize: '0.76rem' }}>
                        <span>{o.order_id} • {o.vendor_name} ({o.created_at})</span>
                        <span style={{ fontWeight: 800 }}>₹{o.bill} • {o.delivery_status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VENDOR DETAILS INSPECTOR */}
      {selectedVendor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedVendor(null)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '580px', maxHeight: '80vh', overflowY: 'auto', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Kitchen details: {selectedVendor.name}</h2>
              <button onClick={() => setSelectedVendor(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Business Config details */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.84rem', fontWeight: 800 }}>Business Configuration</h4>
                <p style={{ margin: 0 }}>Operational Hours: {selectedVendor.timings} | Working Days: {selectedVendor.working_days}</p>
                <p style={{ margin: '4px 0 0 0' }}>Auto-accept orders: {selectedVendor.auto_accept} | Last Login: {selectedVendor.last_login}</p>
              </div>

              {/* Tiffin items list */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.84rem', fontWeight: 800 }}>Active Tiffin Menus</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {menuItems.filter(m => m.vendor === selectedVendor.real_id).length === 0 ? (
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>No menu items created.</p>
                  ) : (
                    menuItems.filter(m => m.vendor === selectedVendor.real_id).map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.76rem' }}>
                        <span>{m.name} ({m.meal_type}) - Stock: {m.available_qty}</span>
                        <span style={{ fontWeight: 800 }}>₹{m.price}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Vendor Financial Summary */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.84rem', fontWeight: 800 }}>Financial Performance</h4>
                <div style={{ padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>Gross Sales:</span>
                    <strong>₹{selectedVendor.total_sales.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>Platform Commission Collected:</span>
                    <strong style={{ color: '#ea580c' }}>- ₹{(selectedVendor.total_sales * (commissionRate / 100)).toFixed(1)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderTop: '1px solid #bbf7d0', marginTop: '4px', paddingTop: '4px' }}>
                    <span>Net payout due:</span>
                    <strong style={{ color: '#16a34a' }}>₹{(selectedVendor.total_sales - (selectedVendor.total_sales * (commissionRate / 100))).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ORDER TRACKER DETAILS & CONTROL */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedOrder(null)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '540px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Order Tracking Board: {selectedOrder.order_id}</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <div>
                  <strong>Buyer student:</strong> {selectedOrder.customer}
                </div>
                <div>
                  <strong>Kitchen:</strong> {selectedOrder.vendor}
                </div>
              </div>

              {/* Items JSON list */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.8rem', fontWeight: 800 }}>Ordered Items</h4>
                {(() => {
                  try {
                    const parsed = JSON.parse(selectedOrder.items);
                    return parsed.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '2px 0' }}>
                        <span>{item.quantity} x {item.name}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ));
                  } catch (e) {
                    return <pre style={{ fontSize: '0.74rem', margin: 0 }}>{selectedOrder.items}</pre>;
                  }
                })()}
                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '6px', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.82rem' }}>
                  <span>Total Bill:</span>
                  <span>₹{selectedOrder.bill}</span>
                </div>
              </div>

              {/* Order Tracker Step Details */}
              {selectedOrder.tracker && (
                <div style={{ padding: '14px', border: '1px solid #cbd5e1', borderRadius: '12px', backgroundColor: '#fdf8f2' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 800 }}>Live Tracker Progress ({selectedOrder.tracker.progress}%)</h4>
                  <div style={{ fontSize: '#0f172a', fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>ETA:</strong> {selectedOrder.tracker.eta}</div>
                    <div><strong>Location:</strong> {selectedOrder.tracker.location}</div>
                    <div><strong>Driver info:</strong> {selectedOrder.tracker.driverInfo?.name} ({selectedOrder.tracker.driverInfo?.phone})</div>
                  </div>

                  {selectedOrder.deliveryStatus !== 'Delivered' && selectedOrder.deliveryStatus !== 'Cancelled' && (
                    <button
                      onClick={() => handleAdvanceOrderStatus(selectedOrder.order_id, selectedOrder.tracker.statusIndex, selectedOrder.tracker.id)}
                      style={{ marginTop: '12px', width: '100%', padding: '10px', border: 'none', backgroundColor: '#ea580c', color: '#ffffff', fontSize: '0.8rem', fontWeight: 800, borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Advance Order Tracker status
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD DISH MENU */}
      {showAddMenuModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddMenuModal(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '440px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: 800 }}>Create New Tiffin Menu</h2>
            <form onSubmit={handleAddMenuItem} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>DISH NAME *</label>
                <input type="text" required placeholder="e.g. Masala Paneer Thali" value={menuForm.name} onChange={(e) => setMenuForm(prev => ({ ...prev, name: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>DESCRIPTION</label>
                <input type="text" placeholder="Thali with paneer, butter rotis, rice" value={menuForm.description} onChange={(e) => setMenuForm(prev => ({ ...prev, description: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>PRICE (₹) *</label>
                  <input type="number" required placeholder="120" value={menuForm.price} onChange={(e) => setMenuForm(prev => ({ ...prev, price: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>STOCK QUANTITY *</label>
                  <input type="number" required placeholder="25" value={menuForm.available_qty} onChange={(e) => setMenuForm(prev => ({ ...prev, available_qty: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>MEAL TYPE</label>
                  <select value={menuForm.meal_type} onChange={(e) => setMenuForm(prev => ({ ...prev, meal_type: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>FOOD TYPE</label>
                  <select value={menuForm.food_type} onChange={(e) => setMenuForm(prev => ({ ...prev, food_type: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}>
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>ASSIGN KITCHEN VENDOR *</label>
                <select required value={menuForm.vendor_id} onChange={(e) => setMenuForm(prev => ({ ...prev, vendor_id: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}>
                  <option value="">Select Kitchen</option>
                  {vendors.filter(v => v.is_verified).map(v => (
                    <option key={v.id} value={v.real_id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddMenuModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#ea580c', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>Create Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT DISH MENU */}
      {showEditMenuModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowEditMenuModal(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '440px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: 800 }}>Edit Menu Item Details</h2>
            <form onSubmit={handleEditMenuItem} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>DISH NAME *</label>
                <input type="text" required value={menuForm.name} onChange={(e) => setMenuForm(prev => ({ ...prev, name: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>DESCRIPTION</label>
                <input type="text" value={menuForm.description} onChange={(e) => setMenuForm(prev => ({ ...prev, description: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>PRICE (₹) *</label>
                  <input type="number" required value={menuForm.price} onChange={(e) => setMenuForm(prev => ({ ...prev, price: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>STOCK QUANTITY *</label>
                  <input type="number" required value={menuForm.available_qty} onChange={(e) => setMenuForm(prev => ({ ...prev, available_qty: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>MEAL TYPE</label>
                  <select value={menuForm.meal_type} onChange={(e) => setMenuForm(prev => ({ ...prev, meal_type: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>FOOD TYPE</label>
                  <select value={menuForm.food_type} onChange={(e) => setMenuForm(prev => ({ ...prev, food_type: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}>
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input type="checkbox" checked={menuForm.is_available} onChange={(e) => setMenuForm(prev => ({ ...prev, is_available: e.target.checked }))} id="edit-avail-box" />
                <label htmlFor="edit-avail-box" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>Item is Available for Sale</label>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowEditMenuModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#ea580c', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: PLATFORM FEE COMMISSION CONFIG EDIT */}
      {isEditingCommission && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsEditingCommission(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '380px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 800 }}>Adjust Platform fee Commission</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>STANDARD RATE (%)</label>
              <input
                type="number"
                value={tempCommission}
                onChange={(e) => setTempCommission(e.target.value)}
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '0.9rem', outline: 'none' }}
                min="0"
                max="100"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsEditingCommission(false)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={async () => {
                  const rate = parseFloat(tempCommission);
                  if (isNaN(rate) || rate < 0 || rate > 100) {
                    alert("Please enter a valid rate between 0 and 100.");
                    return;
                  }
                  try {
                    await updateCommissionRateApi(rate);
                    setCommissionRate(rate);
                    showNotification(`Platform commission fee adjusted to ${rate}%`, 'success');
                    setIsEditingCommission(false);
                    fetchAllData();
                  } catch (err) {
                    showNotification("Failed to update platform commission in remote DB.", "error");
                  }
                }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#855300', color: '#ffffff', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Save Rate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: ONBOARD NEW KITCHEN VENDOR */}
      {showOnboardModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowOnboardModal(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '440px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800 }}>Onboard New Kitchen Partner</h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', color: '#64748b' }}>Immediately add a verified tiffin home-chef kitchen account in the Django DB.</p>

            <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>KITCHEN NAME *</label>
                <input type="text" required placeholder="e.g. Royal Tiffin Point" value={onboardForm.name} onChange={(e) => setOnboardForm(prev => ({ ...prev, name: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>EMAIL ADDRESS *</label>
                <input type="email" required placeholder="vendor@campuslunch.com" value={onboardForm.email} onChange={(e) => setOnboardForm(prev => ({ ...prev, email: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>PHONE NUMBER *</label>
                <input type="text" required placeholder="e.g. 9876543210" value={onboardForm.phone} onChange={(e) => setOnboardForm(prev => ({ ...prev, phone: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>TEMPORARY PASSWORD *</label>
                <input type="text" required value={onboardForm.password} onChange={(e) => setOnboardForm(prev => ({ ...prev, password: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowOnboardModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#855300', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>Onboard Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: SECURITY PASSWORD CHANGE */}
      {showChangePasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowChangePasswordModal(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '400px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 800 }}>Change Administrator Password</h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', color: '#64748b' }}>Safely update your login details in the Django database.</p>

            <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>CURRENT PASSWORD *</label>
                <input type="password" required value={passwordForm.current_password} onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>NEW PASSWORD *</label>
                <input type="password" required value={passwordForm.new_password} onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>CONFIRM PASSWORD *</label>
                <input type="password" required value={passwordForm.confirm_password} onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowChangePasswordModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#855300', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST ALERT DISPLAY */}
      {toast.visible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'success' ? '#16a34a' : '#ef4444',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 20000,
          fontWeight: 700,
          fontSize: '0.84rem',
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
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          70%, 100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
