import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { StudentContext } from '../../context/StudentContext';
import { 
  Search, 
  Menu, 
  ShoppingBag, 
  Clock, 
  Calendar, 
  User, 
  Home, 
  FileText, 
  ChevronRight, 
  Plus, 
  Minus, 
  LogOut, 
  Star, 
  Map, 
  ArrowLeft, 
  MapPin, 
  AlertCircle, 
  Trash2, 
  Share2, 
  CheckCircle 
} from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    sellers,
    cart,
    activeCoupon,
    orders,
    activeOrderTracker,
    loading,
    updateUserProfile,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    placeOrder,
    setOrders
  } = useContext(StudentContext);

  // Layout Tab Navigation
  const [activeTab, setActiveTab] = useState('home'); 
  // Detail navigation states
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null); // Detailed menu item modal state
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Checkout Form states
  const [checkoutForm, setCheckoutForm] = useState({
    hostel: user.hostel,
    roomNumber: user.roomNumber,
    phone: user.phone,
    deliverySlot: 'Lunch 12:30 PM',
    instructions: ''
  });

  // Coupon entry state
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Payment simulation state
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [paymentStep, setPaymentStep] = useState(0);

  // Review modal state
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    orderId: null,
    vendorName: '',
    foodRating: 0,
    serviceRating: 0,
    comment: ''
  });

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    phone: user.phone,
    hostel: user.hostel,
    roomNumber: user.roomNumber,
    dietPreference: user.dietPreference,
    emergencyContact: user.emergencyContact
  });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Toast confirmation helper
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Helper selectors
  const activeSeller = sellers.find(s => s.id === selectedSellerId);
  
  // Cart price aggregates
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const platformFee = cart.length > 0 ? 5 : 0;
  const gst = Math.round(cartSubtotal * 0.05);
  const deliveryFee = cart.length > 0 ? 20 : 0;
  const discountAmount = activeCoupon 
    ? (activeCoupon.discountType === 'percentage' ? Math.round(cartSubtotal * (activeCoupon.value / 100)) : activeCoupon.value)
    : 0;
  const cartTotal = cartSubtotal + platformFee + gst + deliveryFee - discountAmount;

  // Filter & Search Logic (Jain Filter correctly filters to type === 'Jain')
  const filteredSellers = sellers.map(seller => {
    const matchedMeals = seller.meals.filter(meal => {
      const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            meal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            meal.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterType === 'All' || 
                              (filterType === 'Veg' && (meal.type === 'Veg' || meal.type === 'Jain')) || 
                              (filterType === 'Non-Veg' && meal.type === 'Non-Veg') ||
                              (filterType === 'Jain' && meal.type === 'Jain');
      
      return matchesSearch && matchesCategory;
    });

    return {
      ...seller,
      meals: matchedMeals
    };
  }).filter(seller => seller.meals.length > 0);

  // Add Item to cart helper with toast alert
  const handleAddToCart = (meal, sellerId) => {
    addToCart(meal, sellerId);
    triggerToast(`${meal.name} added to cart!`);
  };

  // Share menu alert mock
  const handleShareMeal = (mealName) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Hey! Check out this delicious ${mealName} on CampusLunch!`);
      triggerToast('Share link copied to clipboard!');
    } else {
      triggerToast(`Shared ${mealName} successfully!`);
    }
  };

  // Submit Promo code
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput) return;

    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  // Trigger UPI Payment Checkout
  const handleUpiPay = async () => {
    setPaymentProcessing(true);
    setPaymentStep(0);
    
    const steps = [
      "Contacting secure servers...",
      "Request sent to " + selectedUpiApp + "...",
      "Waiting for UPI PIN authorization...",
      "Authorization confirmed, finalising order..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 700));
      setPaymentStep(i);
    }
    
    try {
      const orderId = await placeOrder(checkoutForm, selectedUpiApp);
      setPaymentSuccessData({
        orderId,
        paymentId: 'PAY' + Math.floor(100000 + Math.random() * 900000),
        transactionId: 'TXN' + Math.floor(1000000000 + Math.random() * 9000000000),
        eta: checkoutForm.deliverySlot.includes('Lunch') ? '1:15 PM' : '8:30 PM',
        vendor: activeSeller ? activeSeller.name : 'Kitchen'
      });
      setPaymentProcessing(false);
      setActiveTab('order-success');
    } catch (err) {
      setPaymentProcessing(false);
      triggerToast('Payment verification failed. Please try again.');
    }
  };

  // Cancel order (allowed before preparation step)
  const handleCancelOrder = (orderId) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, deliveryStatus: 'Cancelled', paymentStatus: 'Refunded' } : o
    ));
    triggerToast(`Order ${orderId} has been cancelled. Refund initiated.`);
  };

  // Save profile updates
  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile(profileForm);
    setProfileSuccess(true);
    triggerToast('Profile information updated successfully!');
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  return (
    <div className="student-device-wrapper">
      <div className="student-phone-frame">
        
        <div className="student-dashboard-layout">
          
          {/* Left Sidebar Navigation - Desktop only */}
          <aside className="student-sidebar">
            <div className="sidebar-brand" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
              <img src={logo} alt="CampusLunch Logo" className="sidebar-logo" />
              <span>CampusLunch</span>
            </div>
            
            <nav className="sidebar-nav">
              <button 
                className={`sidebar-nav-item ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => { setActiveTab('home'); setSelectedSellerId(null); }}
              >
                <Home size={20} />
                <span>Home</span>
              </button>
              
              <button 
                className={`sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <FileText size={20} />
                <span>Orders</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'cart' ? 'active' : ''}`}
                onClick={() => setActiveTab('cart')}
              >
                <ShoppingBag size={20} />
                <span>Cart</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
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
          <div className="student-main-wrapper">
            
            {/* Header bar (Desktop & Mobile) */}
            <header className="student-desktop-header">
              {/* Mobile view only logo */}
              <div className="mobile-brand-container" onClick={() => { setActiveTab('home'); setSelectedSellerId(null); }} style={{ cursor: 'pointer' }}>
                <div className="flex items-center gap-2 logo-container-left">
                  <img src={logo} alt="CampusLunch Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
                  <span className="vendor-app-logo">TiffinHub</span>
                </div>
              </div>

              {/* Desktop header title */}
              <div className="desktop-page-title">
                <h2>
                  {activeTab === 'home' && 'Marketplace'}
                  {activeTab === 'vendor-details' && 'Kitchen Menu'}
                  {activeTab === 'cart' && 'My Cart'}
                  {activeTab === 'checkout' && 'Checkout details'}
                  {activeTab === 'payment' && 'Confirm Payment'}
                  {activeTab === 'order-success' && 'Order Confirmed'}
                  {activeTab === 'track-order' && 'Live Status Tracker'}
                  {activeTab === 'orders' && 'My Orders'}
                  {activeTab === 'profile' && 'Profile Details'}
                </h2>
              </div>

              {/* Header Right Actions */}
              <div className="header-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img 
                  src={user.avatar} 
                  alt="Student Avatar" 
                  className="student-avatar-circle"
                  onClick={() => setActiveTab('profile')}
                  style={{ cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%' }}
                />
                <span className="header-vendor-name" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>{user.name}</span>
              </div>
            </header>

            {/* Scrollable Container */}
            <div className="student-app-scroll-container">
              
              {/* HOME VIEW */}
              {activeTab === 'home' && (
                <div className="desktop-student-grid">
                  
                  {/* Left Column: Greetings, Search, Chips, Live Order */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Greetings */}
                    <div>
                      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', fontFamily: 'serif' }}>Hello, {user.name}!</h1>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>Ready for your home-cooked meal today?</p>
                    </div>

                    {/* Search bar */}
                    <div className="orders-search-wrapper" style={{ margin: 0 }}>
                      <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input 
                        type="text" 
                        className="orders-search-input" 
                        placeholder="Search for food, kitchens, or cuisines..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '42px', borderRadius: '12px', height: '44px' }}
                      />
                    </div>

                    {/* Category Toggles */}
                    <div className="category-scroll-container">
                      <button 
                        className={`category-pill ${filterType === 'All' ? 'active-veg' : 'inactive-blue'}`}
                        onClick={() => setFilterType('All')}
                      >
                        All
                      </button>
                      <button 
                        className={`category-pill ${filterType === 'Veg' ? 'active-veg' : 'inactive-blue'}`}
                        onClick={() => setFilterType('Veg')}
                      >
                        <span className="category-dot veg"></span>
                        Veg
                      </button>
                      <button 
                        className={`category-pill ${filterType === 'Non-Veg' ? 'active-veg' : 'inactive-blue'}`}
                        onClick={() => setFilterType('Non-Veg')}
                      >
                        <span className="category-dot nonveg"></span>
                        Non-Veg
                      </button>
                      <button 
                        className={`category-pill ${filterType === 'Jain' ? 'active-veg' : 'inactive-blue'}`}
                        onClick={() => setFilterType('Jain')}
                      >
                        Jain
                      </button>
                    </div>

                    {/* Live Order Card (ONLY display Heading, Token and Maps Button) */}
                    {activeOrderTracker && activeOrderTracker.statusIndex < 5 && (
                      <div className="live-order-card" style={{ padding: '24px 20px', borderRadius: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', opacity: 0.95 }}>Live Order</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, backgroundColor: 'rgba(255, 255, 255, 0.25)', padding: '4px 10px', borderRadius: '10px' }}>{activeOrderTracker.orderId}</span>
                        </div>

                        <a 
                          href="https://maps.google.com/?q=Himalaya+Hostel+Block+Campus"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="order-action-btn btn-solid"
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px', 
                            width: '100%',
                            backgroundColor: '#ffffff',
                            color: '#855300',
                            padding: '12px 16px',
                            borderRadius: '14px',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          <Map size={18} />
                          <span>Track on Maps</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Order Again & Explore Kitchens Scroll */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Order Again Section */}
                    {orders.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Order Again</h3>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', cursor: 'pointer' }} onClick={() => setActiveTab('orders')}>See History</span>
                        </div>

                        <div className="order-again-card">
                          <img 
                            src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&h=150&fit=crop&q=80" 
                            alt="Premium Rajasthani Thali" 
                            className="order-again-image"
                          />
                          <div className="order-again-info">
                            <h4>{orders[0].items.split(',')[0] || 'Veg Thali'}</h4>
                            <p>By {orders[0].vendor} • {orders[0].date}</p>
                            <span className="rating">★ 4.8</span>
                          </div>
                          <button 
                            className="order-again-action" 
                            onClick={() => {
                              const seller = sellers.find(s => s.name === orders[0].vendor);
                              if (seller && seller.meals[0]) {
                                handleAddToCart(seller.meals[0], seller.id);
                              } else {
                                triggerToast('Added thali to cart!');
                              }
                            }}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Grouped Catalog - Horizontal Scrolls under Seller Headings */}
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>Explore Kitchens</h3>
                      
                      {filteredSellers.map(seller => (
                        <div key={seller.id} className="seller-section" style={{ marginBottom: '24px' }}>
                          {/* Seller Heading */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{seller.name}</h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                                  ★ {seller.rating} ({seller.reviews} reviews)
                                </span>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></span>
                                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{seller.servingTime}</span>
                              </div>
                            </div>
                            <span 
                              style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 700, cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedSellerId(seller.id);
                                setActiveTab('vendor-details');
                              }}
                            >
                              View Menu
                            </span>
                          </div>

                          {/* Horizontal scroll list */}
                          <div className="horizontal-meal-scroll" style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px' }}>
                            {seller.meals.map(meal => (
                              <div 
                                key={meal.id} 
                                className="horizontal-meal-card" 
                                style={{ 
                                  flexShrink: 0, 
                                  width: '145px', 
                                  backgroundColor: '#ffffff', 
                                  borderRadius: '16px', 
                                  overflow: 'hidden', 
                                  border: '1px solid rgba(0, 0, 0, 0.04)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  position: 'relative'
                                }}
                              >
                                <img 
                                  src={meal.image} 
                                  alt={meal.name} 
                                  onClick={() => setSelectedMeal({ ...meal, sellerId: seller.id })}
                                  style={{ width: '100%', height: '95px', objectFit: 'cover', cursor: 'pointer' }} 
                                />
                                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '8px' }}>
                                  <h5 
                                    onClick={() => setSelectedMeal({ ...meal, sellerId: seller.id })}
                                    style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: '1.2', height: '28px', overflow: 'hidden', cursor: 'pointer' }}
                                  >
                                    {meal.name}
                                  </h5>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#855300' }}>₹{meal.price}</span>
                                    <button 
                                      className="food-plus-btn" 
                                      style={{ position: 'static', width: '24px', height: '24px' }}
                                      onClick={() => handleAddToCart(meal, seller.id)}
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {filteredSellers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                          <p style={{ margin: 0 }}>No meals found matching search filters.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* VENDOR DETAILS TAB VIEW */}
              {activeTab === 'vendor-details' && activeSeller && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Back banner */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <button 
                      onClick={() => setActiveTab('home')}
                      style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Back to Marketplace</span>
                  </div>

                  <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '140px' }}>
                    <img 
                      src={activeSeller.photo} 
                      alt={activeSeller.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))', display: 'flex', alignItems: 'flex-end', padding: '16px' }}>
                      <h2 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{activeSeller.name}</h2>
                    </div>
                  </div>

                  <div className="order-again-card" style={{ display: 'block', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>★ {activeSeller.rating} Ratings</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Serving: {activeSeller.servingTime}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#475569', margin: '4px 0 0 0' }}>Location: {activeSeller.vendorLocation}</p>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>Distance: {activeSeller.distance}</p>
                  </div>

                  {/* Menu List */}
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>Today's Menu Items</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeSeller.meals.map(meal => (
                      <div key={meal.id} className="order-again-card" style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <img 
                            src={meal.image} 
                            alt={meal.name} 
                            onClick={() => setSelectedMeal({ ...meal, sellerId: activeSeller.id })}
                            style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 
                                onClick={() => setSelectedMeal({ ...meal, sellerId: activeSeller.id })}
                                style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: 0, cursor: 'pointer' }}
                              >
                                {meal.name}
                              </h4>
                            </div>
                            <p style={{ margin: '4px 0 6px 0', fontSize: '0.72rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{meal.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#855300' }}>₹{meal.price}</span>
                              <button 
                                className="order-action-btn btn-solid" 
                                style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '6px' }}
                                onClick={() => handleAddToCart(meal, activeSeller.id)}
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CART VIEW */}
              {activeTab === 'cart' && (
                <div className="premium-cart-container">
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                      <ShoppingBag size={48} style={{ margin: '0 auto 16px', color: '#cbd5e1' }} />
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#475569' }}>Your Cart is Empty</h3>
                      <p style={{ fontSize: '0.8rem', margin: '4px 0 20px 0' }}>Add delicious combo meals from kitchens to checkout.</p>
                      <button className="order-action-btn btn-solid" onClick={() => setActiveTab('home')}>Go Shopping</button>
                    </div>
                  ) : (
                    <>
                      {/* Cart Items list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {cart.map(item => (
                          <div key={item.id} className="premium-cart-item">
                            {/* Veg/Non-Veg dot indicator */}
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              width: '12px',
                              height: '12px',
                              border: '1px solid ' + (item.type === 'Non-Veg' ? '#ef4444' : '#10b981'),
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#ffffff',
                              borderRadius: '2px'
                            }}>
                              <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: item.type === 'Non-Veg' ? '#ef4444' : '#10b981'
                              }}></div>
                            </div>

                            <img src={item.image} alt={item.name} style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', marginLeft: '12px' }} />
                            
                            <div style={{ flex: 1, textAlign: 'left' }}>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{item.name}</h4>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#855300', display: 'block', marginTop: '2px' }}>₹{item.price}</span>
                            </div>
                            
                            {/* Premium Quantity controls */}
                            <div className="premium-qty-controls">
                              <button onClick={() => updateCartQuantity(item.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b', padding: 0 }}>
                                <Minus size={12} />
                              </button>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b', padding: 0 }}>
                                <Plus size={12} />
                              </button>
                            </div>

                            <button 
                              onClick={() => removeFromCart(item.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      {/* Quick Coupons List Grid */}
                      <div className="premium-coupon-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#855300' }}>Available Coupons</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>Tap to Apply</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { code: 'CAMPUS50', desc: '50% off on your entire order' },
                            { code: 'WELCOME10', desc: 'Flat ₹10 discount on bill' }
                          ].map(coupon => {
                            const isApplied = activeCoupon?.code === coupon.code;
                            return (
                              <div 
                                key={coupon.code}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '10px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.15)' }}
                              >
                                <div style={{ textAlign: 'left' }}>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#b45309', backgroundColor: '#fffbeb', border: '1px dashed #f59e0b', padding: '2px 6px', borderRadius: '6px' }}>{coupon.code}</span>
                                  <p style={{ margin: '4px 0 0 0', fontSize: '0.68rem', color: '#64748b' }}>{coupon.desc}</p>
                                </div>
                                <button 
                                  onClick={() => {
                                    if (isApplied) removeCoupon();
                                    else applyCoupon(coupon.code);
                                  }}
                                  style={{ 
                                    border: 'none', 
                                    backgroundColor: isApplied ? '#059669' : '#f59e0b', 
                                    color: '#ffffff', 
                                    fontSize: '0.7rem', 
                                    fontWeight: 800, 
                                    padding: '6px 12px', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer' 
                                  }}
                                >
                                  {isApplied ? 'Applied' : 'Apply'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Detailed Dotted Bill Summary */}
                      <div className="premium-bill-card">
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', margin: '0 0 12px 0', textAlign: 'left' }}>Detailed Bill</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                            <span>Items Total</span>
                            <span>₹{cartSubtotal}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                            <span>Platform Fee</span>
                            <span>₹{platformFee}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                            <span>GST & Taxes (5%)</span>
                            <span>₹{gst}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                            <span>Delivery Partner Fee</span>
                            <span>₹{deliveryFee}</span>
                          </div>
                          {activeCoupon && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 800 }}>
                              <span>Promo Discount ({activeCoupon.code})</span>
                              <span>-₹{discountAmount}</span>
                            </div>
                          )}
                          
                          <div style={{ borderTop: '1.5px dashed #cbd5e1', margin: '8px 0' }}></div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                            <span>Grand Total</span>
                            <span>₹{cartTotal}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* PAYMENT VIEW (UPI ONLY) */}
              {activeTab === 'payment' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <button onClick={() => setActiveTab('cart')} style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer' }}>
                      <ArrowLeft size={20} />
                    </button>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Back to Cart</span>
                  </div>

                  {paymentProcessing ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px' }}>
                      {/* Concentric rotating loaders */}
                      <div style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '24px' }}>
                        <div style={{ 
                          position: 'absolute', 
                          inset: 0, 
                          borderRadius: '50%', 
                          border: '3px solid #f1f5f9', 
                          borderTopColor: '#f59e0b', 
                          animation: 'spin 1s linear infinite' 
                        }}></div>
                        <div style={{ 
                          position: 'absolute', 
                          inset: '8px', 
                          borderRadius: '50%', 
                          border: '3px solid #f1f5f9', 
                          borderBottomColor: '#059669', 
                          animation: 'spin 1.5s linear infinite reverse' 
                        }}></div>
                      </div>

                      <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                        {paymentStep === 0 && "Contacting secure servers..."}
                        {paymentStep === 1 && `Request sent to ${selectedUpiApp}...`}
                        {paymentStep === 2 && "Waiting for UPI PIN authorization..."}
                        {paymentStep === 3 && "Finalizing order details..."}
                      </h3>
                      
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px', fontStyle: 'italic' }}>
                        Do not exit or close the application.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="premium-bill-card" style={{ padding: '20px 16px' }}>
                        {/* Secure total amount header */}
                        <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '16px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Secure Checkout</span>
                          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>₹{cartTotal}</h2>
                          <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, backgroundColor: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '6px' }}>
                            ✓ 128-bit Encrypted SSL
                          </span>
                        </div>

                        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 14px 0', color: '#475569', textAlign: 'left' }}>Select UPI Payment App</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {[
                            { name: 'Google Pay', desc: 'Pay instantly via bank account', color: '#1a73e8', bg: '#e8f0fe', glyph: 'G' },
                            { name: 'PhonePe', desc: 'Secure one-click UPI checkout', color: '#5f259f', bg: '#f3e8ff', glyph: 'Pe' },
                            { name: 'Paytm', desc: 'Paytm UPI wallet support', color: '#002e6e', bg: '#e0f2fe', glyph: 'Pay' },
                            { name: 'BHIM UPI', desc: 'Unified Government payment portal', color: '#ff6600', bg: '#fff7ed', glyph: 'U' }
                          ].map(app => {
                            const isSelected = selectedUpiApp === app.name;
                            return (
                              <div 
                                key={app.name}
                                onClick={() => setSelectedUpiApp(app.name)}
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '12px', 
                                  padding: '14px 16px', 
                                  borderRadius: '16px', 
                                  border: isSelected ? `2.5px solid ${app.color}` : '1.5px solid #e2e8f0', 
                                  cursor: 'pointer',
                                  backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                                  boxShadow: isSelected ? '0 8px 20px rgba(0,0,0,0.04)' : 'none',
                                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                              >
                                {/* Circle logo indicator */}
                                <div style={{ 
                                  width: '38px', 
                                  height: '38px', 
                                  borderRadius: '10px', 
                                  backgroundColor: app.bg, 
                                  color: app.color, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  fontWeight: 900,
                                  fontSize: '0.85rem'
                                }}>
                                  {app.glyph}
                                </div>

                                <div style={{ flex: 1, textAlign: 'left' }}>
                                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{app.name}</h4>
                                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '2px' }}>{app.desc}</span>
                                </div>

                                {/* Custom Radio selection check */}
                                <div style={{ 
                                  width: '20px', 
                                  height: '20px', 
                                  borderRadius: '50%', 
                                  border: '2px solid ' + (isSelected ? app.color : '#cbd5e1'), 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center' 
                                }}>
                                  {isSelected && (
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: app.color }}></div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pay Button */}
                      <button 
                        className="order-action-btn btn-solid" 
                        onClick={handleUpiPay}
                        style={{ 
                          padding: '14px 0', 
                          borderRadius: '14px', 
                          fontWeight: 800, 
                          width: '100%', 
                          fontSize: '0.92rem',
                          backgroundColor: '#0f172a',
                          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)'
                        }}
                      >
                        Pay Now via UPI
                      </button>

                      {/* PCI Secure Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.68rem', marginTop: '4px' }}>
                        <span>🔒 Secured by Unified Payments Interface (UPI)</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ORDER SUCCESS VIEW */}
              {activeTab === 'order-success' && paymentSuccessData && (
                <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    backgroundColor: '#ecfdf5', 
                    color: '#059669', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 16px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)'
                  }}>
                    <CheckCircle size={36} />
                  </div>

                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Order Placed Successfully!</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 24px 0' }}>Your payment is processed. Kitchen is preparing your order.</p>

                  {/* Order Receipt Card */}
                  <div className="order-again-card" style={{ padding: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', margin: '0 0 6px 0' }}>Order Receipt</h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: '#64748b' }}>Order Token ID</span>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{paymentSuccessData.orderId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: '#64748b' }}>Kitchen Name</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{paymentSuccessData.vendor}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: '#64748b' }}>Transaction ID</span>
                      <span style={{ color: '#475569', fontSize: '0.72rem' }}>{paymentSuccessData.transactionId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: '#64748b' }}>Payment ID</span>
                      <span style={{ color: '#475569', fontSize: '0.72rem' }}>{paymentSuccessData.paymentId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: '#64748b' }}>Delivery ETA</span>
                      <span style={{ fontWeight: 700, color: '#d97706' }}>{paymentSuccessData.eta}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '28px' }}>
                    <button 
                      className="order-action-btn btn-solid" 
                      onClick={() => setActiveTab('orders')}
                      style={{ padding: '12px 0', borderRadius: '12px', fontWeight: 800 }}
                    >
                      Track Order Live
                    </button>
                    
                    <button 
                      className="order-action-btn" 
                      onClick={() => {
                        triggerToast('Receipt downloaded successfully!');
                      }}
                      style={{ padding: '10px 0', borderRadius: '12px', fontWeight: 800, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569' }}
                    >
                      Download Receipt
                    </button>

                    <button 
                      className="order-action-btn" 
                      onClick={() => { setActiveTab('home'); setSelectedSellerId(null); }}
                      style={{ padding: '10px 0', color: '#f59e0b', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}

              {/* ORDERS TAB VIEW */}
              {activeTab === 'orders' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>My Orders</h2>
                  
                  {/* Active Token Info */}
                  {activeOrderTracker && activeOrderTracker.statusIndex < 5 && (
                    <div className="order-again-card" style={{ borderLeft: '4px solid #f59e0b', padding: '16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Active Order Tracker</span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Token {activeOrderTracker.orderId}</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>{activeOrderTracker.vendorName} • ETA: {activeOrderTracker.eta}</p>
                      </div>
                    </div>
                  )}

                  {/* Past Orders Queue */}
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '12px 0 0 0' }}>Order History</h3>
                  <div className="student-rated-list-grid">
                    {orders.map(order => (
                      <div key={order.id} className="order-again-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>Token {order.id}</h4>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>{order.vendor} • {order.date} • {order.items}</p>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginTop: '4px' }}>Bill Paid: ₹{order.bill} via {order.paymentMethod}</span>
                          </div>
                          
                          <span style={{ 
                            fontWeight: 800, 
                            color: order.deliveryStatus === 'Cancelled' ? '#ef4444' : '#059669', 
                            fontSize: '0.78rem' 
                          }}>
                            {order.deliveryStatus.toUpperCase()}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid rgba(0, 0, 0, 0.04)', paddingTop: '8px', width: '100%' }}>
                          {order.deliveryStatus === 'Delivered' && (
                            <button 
                              className="order-action-btn btn-solid"
                              style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: '8px', fontWeight: 800 }}
                              onClick={() => setRatingModal({
                                isOpen: true,
                                orderId: order.id,
                                vendorName: order.vendor,
                                foodRating: 0,
                                serviceRating: 0,
                                comment: ''
                              })}
                            >
                              Rate Vendor & Services
                            </button>
                          )}
                          
                          <button 
                            className="order-action-btn"
                            onClick={() => {
                              triggerToast('Receipt downloaded successfully!');
                            }}
                            style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: 800 }}
                          >
                            Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PROFILE VIEW */}
              {activeTab === 'profile' && (
                <div className="profile-page-container">
                  <div className="profile-chef-header" style={{ padding: '20px 16px' }}>
                    <img 
                      src={user.avatar} 
                      alt="Student Face Photo" 
                      className="profile-chef-avatar" 
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>{user.name}</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>CS-2024-042 • alex.johnson@campus.edu</p>
                  </div>

                  {/* Profile Edit Form */}
                  <form onSubmit={handleSaveProfile} className="profile-info-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="profile-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 6px 0' }}>Edit Details</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Full Name</label>
                        <input 
                          type="text" 
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          style={{ borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Contact Phone</label>
                        <input 
                          type="text" 
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          style={{ borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Hostel Block</label>
                        <input 
                          type="text" 
                          value={profileForm.hostel}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, hostel: e.target.value }))}
                          style={{ borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Room Number</label>
                        <input 
                          type="text" 
                          value={profileForm.roomNumber}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                          style={{ borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Emergency Phone</label>
                        <input 
                          type="text" 
                          value={profileForm.emergencyContact}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                          style={{ borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Diet Preference</label>
                        <select 
                          value={profileForm.dietPreference}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, dietPreference: e.target.value }))}
                          style={{ borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#ffffff' }}
                        >
                          <option value="Vegetarian">Vegetarian</option>
                          <option value="Jain">Jain</option>
                          <option value="Non-Vegetarian">Non-Vegetarian</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="order-action-btn btn-solid" 
                      style={{ padding: '10px 0', borderRadius: '8px', fontWeight: 800 }}
                    >
                      Save Changes
                    </button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    <button 
                      className="profile-logout-btn" 
                      onClick={() => {
                        localStorage.removeItem('role');
                        navigate('/');
                      }}
                      style={{ width: '100%', height: '44px', borderRadius: '10px', fontSize: '0.85rem' }}
                    >
                      <LogOut size={16} />
                      Logout Account
                    </button>

                    <button 
                      className="profile-logout-btn" 
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{ width: '100%', height: '44px', borderRadius: '10px', fontSize: '0.85rem', color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fff5f5' }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Relocated Premium Sticky Bottom Bar (Sticks fixed at bottom of viewport above the nav) */}
            {activeTab === 'cart' && cart.length > 0 && (
              <div className="premium-sticky-bottom-bar">
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Total Bill</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>₹{cartTotal}</span>
                </div>
                
                <button 
                  className="premium-sticky-btn"
                  onClick={() => setActiveTab('payment')}
                >
                  Proceed to Payment
                </button>
              </div>
            )}

            {/* Bottom Fixed Navigation Bar */}
            <nav className="vendor-bottom-nav">
              <button 
                className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => { setActiveTab('home'); setSelectedSellerId(null); }}
              >
                <div className="nav-item-icon-wrapper">
                  <Home size={22} />
                </div>
                <span>Home</span>
                {activeTab === 'home' && <div className="active-dot"></div>}
              </button>

              <button 
                className={`bottom-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <div className="nav-item-icon-wrapper">
                  <FileText size={22} />
                </div>
                <span>Orders</span>
                {activeTab === 'orders' && <div className="active-dot"></div>}
              </button>

              <button 
                className={`bottom-nav-item ${activeTab === 'cart' ? 'active' : ''}`}
                onClick={() => setActiveTab('cart')}
              >
                <div className="nav-item-icon-wrapper" style={{ position: 'relative' }}>
                  <ShoppingBag size={22} />
                  {cart.length > 0 && (
                    <span style={{ 
                      position: 'absolute', 
                      top: '-4px', 
                      right: '-4px', 
                      backgroundColor: '#ef4444', 
                      color: '#ffffff', 
                      fontSize: '0.58rem', 
                      fontWeight: 800, 
                      borderRadius: '50%', 
                      width: '14px', 
                      height: '14px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </div>
                <span>Cart</span>
                {activeTab === 'cart' && <div className="active-dot"></div>}
              </button>

              <button 
                className={`bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <div className="nav-item-icon-wrapper">
                  <User size={22} />
                </div>
                <span>Profile</span>
                {activeTab === 'profile' && <div className="active-dot"></div>}
              </button>
            </nav>

          </div>

        </div>

      </div>

      {/* DETAILED MENU MODAL (Image, description, ingredients, nutritional facts, availableQty) */}
      {selectedMeal && (
        <div className="custom-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="custom-modal-card" style={{ maxWidth: '350px', padding: '0', overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '140px' }}>
              <img src={selectedMeal.image} alt={selectedMeal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button 
                onClick={() => setSelectedMeal(null)}
                style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '12px', 
                  background: 'rgba(0,0,0,0.5)', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '26px', 
                  height: '26px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{selectedMeal.name}</h3>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: selectedMeal.type === 'Veg' || selectedMeal.type === 'Jain' ? '#ecfdf5' : '#fef2f2', color: selectedMeal.type === 'Veg' || selectedMeal.type === 'Jain' ? '#047857' : '#b91c1c', padding: '2px 8px', borderRadius: '6px' }}>
                  {selectedMeal.type}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                <span>Rating: ★ {selectedMeal.rating}</span>
                <span>•</span>
                <span>Time: {selectedMeal.prepTime}</span>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '10px 0', lineHeight: '1.4' }}>{selectedMeal.description}</p>
              
              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '8px 0' }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>Ingredients:</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{selectedMeal.ingredients}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>Nutritional Facts:</span>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.68rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '6px', borderRadius: '8px' }}>
                  <span>Cal: {selectedMeal.nutritionalInfo.Calories}</span>
                  <span>•</span>
                  <span>Pro: {selectedMeal.nutritionalInfo.Protein}</span>
                  <span>•</span>
                  <span>Carb: {selectedMeal.nutritionalInfo.Carbs}</span>
                  <span>•</span>
                  <span>Fat: {selectedMeal.nutritionalInfo.Fat}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: selectedMeal.availableQty < 5 ? '#ef4444' : '#059669' }}>
                  Stock Left: {selectedMeal.availableQty}
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#855300' }}>₹{selectedMeal.price}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button 
                  className="order-action-btn btn-solid"
                  style={{ flex: 1, padding: '10px 0', fontSize: '0.85rem' }}
                  onClick={() => {
                    handleAddToCart(selectedMeal, selectedMeal.sellerId);
                    setSelectedMeal(null);
                  }}
                >
                  Add to Cart
                </button>
                <button 
                  onClick={() => handleShareMeal(selectedMeal.name)}
                  style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Share2 size={18} color="#64748b" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating modal overlay */}
      {ratingModal.isOpen && (
        <div className="custom-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="custom-modal-card" style={{ maxWidth: '350px', padding: '24px' }}>
            <div className="custom-modal-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Star size={24} fill="#d97706" />
            </div>
            
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '12px 0 4px 0', color: '#0f172a' }}>Rate your Experience</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0' }}>{ratingModal.vendorName}</p>

            {/* Rating Category 1: Food Quality */}
            <div style={{ width: '100%', textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Food Quality</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star}
                    type="button"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => setRatingModal(prev => ({ ...prev, foodRating: star }))}
                  >
                    <Star 
                      size={24} 
                      fill={star <= ratingModal.foodRating ? "#f59e0b" : "none"} 
                      color={star <= ratingModal.foodRating ? "#f59e0b" : "#cbd5e1"} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Category 2: Delivery Service */}
            <div style={{ width: '100%', textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Delivery Service</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star}
                    type="button"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => setRatingModal(prev => ({ ...prev, serviceRating: star }))}
                  >
                    <Star 
                      size={24} 
                      fill={star <= ratingModal.serviceRating ? "#f59e0b" : "none"} 
                      color={star <= ratingModal.serviceRating ? "#f59e0b" : "#cbd5e1"} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Comments */}
            <div style={{ width: '100%', textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>Review Comments</label>
              <textarea 
                placeholder="Tell us about the quality, taste, or service..."
                value={ratingModal.comment}
                onChange={(e) => setRatingModal(prev => ({ ...prev, comment: e.target.value }))}
                style={{ 
                  width: '100%', 
                  height: '60px', 
                  borderRadius: '10px', 
                  border: '1px solid #cbd5e1', 
                  padding: '8px 12px', 
                  fontSize: '0.8rem',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none'
                }}
              />
            </div>

            {/* Actions */}
            <div className="custom-modal-actions" style={{ width: '100%', display: 'flex', gap: '10px' }}>
              <button 
                className="custom-modal-btn btn-cancel"
                style={{ flex: 1, padding: '10px 0', fontSize: '0.85rem' }}
                onClick={() => setRatingModal({ isOpen: false, orderId: null, vendorName: '', foodRating: 0, serviceRating: 0, comment: '' })}
              >
                Cancel
              </button>
              <button 
                className="custom-modal-btn btn-confirm"
                style={{ flex: 1, padding: '10px 0', fontSize: '0.85rem', opacity: (ratingModal.foodRating > 0 && ratingModal.serviceRating > 0) ? 1 : 0.5 }}
                disabled={!(ratingModal.foodRating > 0 && ratingModal.serviceRating > 0)}
                onClick={() => {
                  triggerToast(`Feedback for ${ratingModal.vendorName} submitted successfully!`);
                  setRatingModal({ isOpen: false, orderId: null, vendorName: '', foodRating: 0, serviceRating: 0, comment: '' });
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account confirm dialog */}
      {showDeleteConfirm && (
        <div className="custom-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="custom-modal-card" style={{ maxWidth: '320px', padding: '24px' }}>
            <div className="custom-modal-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
              <AlertCircle size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '12px 0 6px 0', color: '#0f172a' }}>Delete Account?</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0', lineHeight: '1.4' }}>This action is irreversible. All your order history will be permanently deleted.</p>
            
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button 
                className="custom-modal-btn btn-cancel" 
                style={{ flex: 1, padding: '10px 0', fontSize: '0.82rem' }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="custom-modal-btn btn-confirm" 
                style={{ flex: 1, padding: '10px 0', fontSize: '0.82rem', backgroundColor: '#ef4444', color: '#ffffff' }}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  triggerToast('Account deleted successfully.');
                  localStorage.removeItem('role');
                  navigate('/');
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast confirmation overlays */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '30px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          zIndex: 11000,
          fontSize: '0.85rem',
          fontWeight: 700,
          textAlign: 'center',
          minWidth: '280px',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
