import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logos/logo.png';
import { StudentContext } from '@/context/StudentContext';
import { changePassword, logoutUser, updateUserProfileApi, forgotPassword, deleteUserProfileApi } from "@/Services/authService";
import { getVendors, getVendorDetails, submitRatingApi } from "@/Services/studentService";

import { jsPDF } from 'jspdf';
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
  CheckCircle,
  MessageSquare,
  Phone,
  Bell,
  CreditCard,
  HelpCircle,
  Lock,
  RefreshCw
} from 'lucide-react';

const downloadReceiptPdf = (receiptData) => {
  const tokenCount = receiptData.tokenMappings ? receiptData.tokenMappings.length : 1;
  const displayTokenId = receiptData.tokenMappings && receiptData.tokenMappings.length > 0 ? receiptData.tokenMappings[0].tokenId : (receiptData.orderId || '#TK-UNKNOWN');
  // Decrease formatHeight as barcode is removed
  const formatHeight = 160 + (tokenCount * 6.5);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, formatHeight]
  });

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 80, formatHeight, 'F');

  // Header Banner
  doc.setFillColor(11, 28, 48);
  doc.rect(0, 0, 80, 20, 'F');

  // Logo Badge Vector
  doc.setFillColor(34, 197, 94); // green indicator
  doc.circle(14, 10, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TC', 14, 12.8, { align: 'center' });

  // Brand Name and Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TIFFIN CONNECT', 22, 9);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Campus Marketplace Receipt', 22, 13);

  // Receipt details header
  doc.setTextColor(11, 28, 48);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('INVOICE RECEIPT', 8, 27);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(receiptData.date, 72, 27, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.25);
  doc.line(8, 29, 72, 29);

  // Meta details card
  doc.setFillColor(248, 250, 252);
  doc.rect(8, 33, 64, 21, 'F');
  doc.setDrawColor(241, 245, 249);
  doc.rect(8, 33, 64, 21, 'S');

  // Meta details content
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BILL TO:', 12, 38);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(7.5);
  doc.text(`${receiptData.customerName} (${receiptData.customerPhone})`, 12, 42);
  doc.text(receiptData.customerLocation, 12, 46);
  doc.text(`Slot: ${receiptData.deliverySlot}`, 12, 50);

  // Prepared By Card
  doc.setFillColor(248, 250, 252);
  doc.rect(8, 57, 64, 11, 'F');
  doc.setDrawColor(241, 245, 249);
  doc.rect(8, 57, 64, 11, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PREPARED BY:', 12, 61);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  const cleanVendorName = receiptData.vendor.split(' & ').filter((v, i, a) => a.indexOf(v) === i).join(' & ');
  doc.text(cleanVendorName, 12, 65);

  // Items List Card
  const listHeight = 10 + (tokenCount * 6.5);
  const listY = 71;
  doc.setFillColor(248, 250, 252);
  doc.rect(8, listY, 64, listHeight, 'F');
  doc.setDrawColor(241, 245, 249);
  doc.rect(8, listY, 64, listHeight, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TIFFIN TOKENS', 12, listY + 5);

  let itemY = listY + 11;
  if (receiptData.tokenMappings) {
    receiptData.tokenMappings.forEach((mapping) => {
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(7.5);
      doc.text(`1x ${mapping.itemName}`, 12, itemY);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.setFontSize(8);
      doc.text(mapping.tokenId, 68, itemY, { align: 'right' });
      itemY += 6;
    });
  }

  // Cost details
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);

  let y = listY + listHeight + 7;
  const addCostRow = (label, val, isBold = false, color = [51, 65, 85]) => {
    doc.setFont('Helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, 8, y);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`Rs. ${val}`, 72, y, { align: 'right' });
    y += 4.5;
  };

  addCostRow('Subtotal', receiptData.subtotal);
  addCostRow('GST (5%)', receiptData.gst);
  addCostRow('Delivery Partner Fee', receiptData.deliveryFee);
  addCostRow('Platform Handling Fee', receiptData.platformFee);
  if (receiptData.discount > 0) {
    addCostRow('Discount Applied', `-${receiptData.discount}`, true, [22, 163, 74]);
  }

  // Dashed divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([1.5, 1], 0);
  doc.line(8, y, 72, y);
  doc.setLineDashPattern([], 0);

  y += 5;

  // Grand Total
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL PAID', 8, y);
  doc.text(`Rs. ${receiptData.amount}`, 72, y, { align: 'right' });

  y += 4;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Paid via ${receiptData.paymentMethod}`, 8, y);

  y += 9;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('THANK YOU FOR YOUR ORDER!', 40, y, { align: 'center' });

  doc.save(`receipt-${displayTokenId}.pdf`);
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    sellers,
    cart,
    activeCoupon,
    orders,
    activeOrderTracker,
    activeTrackers,
    setActiveTrackers,
    loading,
    updateUserProfile,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    placeOrder,
    setOrders,
    ratings,
    setRatings,
    kitchenStatuses,
    setSellers,
    notifications,
    deleteNotification,
    markAllNotificationsRead
  } = useContext(StudentContext);

  // Layout Tab Navigation
  const [activeTab, setActiveTab] = useState('home');
  const [profileSubTab, setProfileSubTab] = useState('menu');
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [actionLoading, setActionLoading] = useState({ isLoading: false, message: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState(null);

  const getActiveTrackersList = () => {
    if (!activeTrackers) return [];
    return activeTrackers.filter(t => {
      if (t.statusIndex >= 5) return false;
      const ord = orders.find(o => o.id === t.orderId);
      if (ord && (ord.deliveryStatus === 'Delivered' || ord.deliveryStatus === 'Cancelled')) {
        return false;
      }
      return true;
    });
  };

  const currentTracker = activeTrackers.find(t => t.orderId === selectedTrackingOrderId) || getActiveTrackersList()[0] || activeTrackers[0] || activeOrderTracker;
  const currentSeller = currentTracker && sellers ? (sellers.find(s => s.name === currentTracker.vendorName) || { phone: '+91 98765 43210' }) : null;

  const getSellerRatingInfo = (sellerName) => {
    const matching = (ratings || []).filter(r => r.vendorName === sellerName);
    if (matching.length === 0) {
      return { rating: '0.0', reviews: 0 };
    }
    const sum = matching.reduce((acc, r) => acc + (Number(r.foodRating) + Number(r.serviceRating)) / 2, 0);
    const avg = (sum / matching.length).toFixed(1);
    return { rating: avg, reviews: matching.length };
  };
  // Detail navigation states
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null); // Detailed menu item modal state

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedMealType, setSelectedMealType] = useState('All');
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorsError, setVendorsError] = useState(false);
  const [selectedVendorDetails, setSelectedVendorDetails] = useState(null);
  const [vendorDetailsLoading, setVendorDetailsLoading] = useState(false);



  const fetchVendorsList = async () => {
    setVendorsLoading(true);
    setVendorsError(false);
    try {
      let foodTypeParam = "";
      if (filterType === "Veg" || filterType === "Jain") {
        foodTypeParam = filterType;
      } else if (filterType === "Non-Veg") {
        foodTypeParam = "Non-Veg";
      }

      const data = await getVendors(searchQuery, selectedMealType, foodTypeParam);
      const vendorsList = Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []);
      setVendors(vendorsList);

      // Sync fetched backend vendors with StudentContext sellers state so the cart uses real data
      setSellers(vendorsList.map(v => ({
        id: v.id,
        name: v.full_name || 'Vendor Kitchen',
        is_kitchen_open: v.is_kitchen_open !== false,
        photo: v.profile_image || "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Crect width='24' height='24' fill='%23f1f5f9'/%3E%3Cpath d='M12 3L4 9v12h16V9l-8-6zm0 2.5l6 4.5v11H6v-11l6-4.5z'/%3E%3C/svg%3E",
        rating: '4.8',
        reviews: 12,
        distance: '0.5km',
        servingTime: '12:00 PM - 3:00 PM',
        vendorLocation: 'Campus Area',
        type: ['Veg'],
        meals: (v.menu_items || []).map(m => ({
          id: m.id,
          name: m.name,
          price: Number(m.price),
          type: m.food_type || 'Veg',
          description: m.description || '',
          availableQty: m.is_available ? 999 : 0,
          prepTime: '15 mins'
        }))
      })));
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
      setVendorsError(true);
    } finally {
      setVendorsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorsList();
  }, [searchQuery, filterType, selectedMealType]);

  const handleViewVendorDetails = async (vendorId) => {
    setVendorDetailsLoading(true);
    try {
      const details = await getVendorDetails(vendorId);
      setSelectedVendorDetails(details);
      setSelectedSellerId(vendorId);
      setActiveTab('vendor-details');

      // Update global context sellers to make sure it plays nicely with addToCart lookup
      const formattedSeller = {
        id: details.id,
        name: details.full_name,
        is_kitchen_open: details.is_kitchen_open !== false,
        photo: details.profile_image || "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Crect width='24' height='24' fill='%23f1f5f9'/%3E%3Cpath d='M12 3L4 9v12h16V9l-8-6zm0 2.5l6 4.5v11H6v-11l6-4.5z'/%3E%3C/svg%3E",
        rating: "4.8",
        reviews: "24",
        servingTime: "10:00 AM - 08:00 PM",
        vendorLocation: "Campus Hub",
        distance: "0.2 km",
        meals: (details.menu_items || []).map(m => ({
          id: m.id,
          name: m.name,
          description: m.description,
          price: Number(m.price),
          image: m.image || "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Crect width='24' height='24' fill='%23f1f5f9'/%3E%3Cpath d='M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-8.03c2.09-.13 3.75-1.85 3.75-3.97V2H11v7zm4-6v8h3v11h2V3h-5z'/%3E%3C/svg%3E",
          type: m.food_type,
          availableQty: m.is_available ? 999 : 0
        }))
      };

      if (setSellers) {
        setSellers(prev => {
          const index = prev.findIndex(s => s.id === details.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = formattedSeller;
            return next;
          } else {
            return [...prev, formattedSeller];
          }
        });
      }
    } catch (err) {
      console.error("Failed to fetch vendor details:", err);
      alert("Failed to load vendor menu details.");
    } finally {
      setVendorDetailsLoading(false);
    }
  };

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

  // Profile Form state - loaded from login session (removing hostel, room, emergency contact)
  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    email: user.email || '',
    avatar: user.avatar || '/images/default-avatar.jpg'
  });

  useEffect(() => {
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      avatar: user.avatar || '/images/default-avatar.jpg'
    });
  }, [user]);

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [resetRequestLoading, setResetRequestLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cartConflictModal, setCartConflictModal] = useState({
    isOpen: false,
    meal: null,
    sellerId: null
  });

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
  }).filter(seller => {
    const isClosed = kitchenStatuses && (kitchenStatuses[seller.name] === false || (kitchenStatuses[seller.name] === undefined && seller.is_kitchen_open === false));
    return seller.meals.length > 0 && !isClosed;
  });

  // Add Item to cart helper with toast alert
  const handleAddToCart = (meal, sellerId) => {
    // 1. Check conflicting kitchen first
    if (cart.length > 0 && cart[0].sellerId !== sellerId) {
      setCartConflictModal({
        isOpen: true,
        meal,
        sellerId
      });
      return;
    }

    // 2. Check stock limit constraints
    const seller = sellers.find(s => s.id === sellerId);
    const contextMeal = seller ? seller.meals.find(m => m.id === meal.id) : null;
    const stockLimit = contextMeal ? (contextMeal.availableQty ?? 999) : 999;

    const existingInCart = cart.find(item => item.id === meal.id);
    const currentQtyInCart = existingInCart ? existingInCart.quantity : 0;

    if (currentQtyInCart >= stockLimit) {
      triggerToast(`Sorry, cannot add more. Only ${stockLimit} items left in stock.`);
      return;
    }

    const success = addToCart(meal, sellerId);
    if (success) {
      triggerToast(`${meal.name} added to cart!`);
    }
  };

  const handleConfirmReplaceCart = () => {
    clearCart();
    if (cartConflictModal.meal && cartConflictModal.sellerId) {
      // Add after a slight delay to ensure state clearance of first cart
      setTimeout(() => {
        const seller = sellers.find(s => s.id === cartConflictModal.sellerId);
        const contextMeal = seller ? seller.meals.find(m => m.id === cartConflictModal.meal.id) : null;
        const stockLimit = contextMeal ? (contextMeal.availableQty ?? 999) : 999;

        if (stockLimit <= 0) {
          triggerToast(`Sorry, this item is currently out of stock.`);
        } else {
          addToCart(cartConflictModal.meal, cartConflictModal.sellerId);
          triggerToast(`${cartConflictModal.meal.name} added to cart!`);
        }
      }, 50);
    }
    setCartConflictModal({ isOpen: false, meal: null, sellerId: null });
  };

  // Share menu alert mock
  const handleShareMeal = (mealName) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Hey! Check out this delicious ${mealName} on Campus Lunch!`);
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

    // Capture cart calculations before placeOrder clears the cart
    const cartSummary = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
    const billAmount = cartTotal;
    const billSubtotal = cartSubtotal;
    const billGst = gst;
    const billDeliveryFee = deliveryFee;
    const billPlatformFee = platformFee;
    const billDiscount = discountAmount;
    const payApp = selectedUpiApp;

    // Capture individual cart items list for mapping tokens later
    const tempCartItems = cart.map(item => ({ name: item.name, quantity: item.quantity }));

    try {
      const { orderIds, vendorNames } = await placeOrder(checkoutForm, selectedUpiApp);

      const tokenMappings = [];
      let idIndex = 0;
      tempCartItems.forEach((item) => {
        for (let q = 0; q < item.quantity; q++) {
          tokenMappings.push({
            itemName: item.name,
            tokenId: orderIds[idIndex] || '#TK-ERR'
          });
          idIndex++;
        }
      });

      setPaymentSuccessData({
        orderId: orderIds.join(', '),
        vendor: [...new Set(vendorNames)].join(' & '),
        items: cartSummary,
        tokenMappings: tokenMappings,
        amount: billAmount,
        subtotal: billSubtotal,
        gst: billGst,
        deliveryFee: billDeliveryFee,
        platformFee: billPlatformFee,
        discount: billDiscount,
        paymentMethod: payApp,
        customerName: user.name,
        customerPhone: checkoutForm.phone || user.phone,
        customerLocation: `${checkoutForm.hostel}, Room ${checkoutForm.roomNumber}`,
        deliverySlot: checkoutForm.deliverySlot,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today'
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

  useEffect(() => {
    const savedName = localStorage.getItem('name');
    const savedPhone = localStorage.getItem('phone');
    const savedEmail = localStorage.getItem('email');
    const savedAvatar = savedEmail ? localStorage.getItem(`student_avatar_${savedEmail}`) : null;

    const syncedData = {
      name: savedName || user.name,
      phone: savedPhone || user.phone,
      email: savedEmail || user.email,
      avatar: savedAvatar || user.avatar
    };

    updateUserProfile(syncedData);
    setProfileForm(syncedData);
  }, []);

  useEffect(() => {
    // Lock body scroll to prevent window bounce and lockups on mobile
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;
    const originalHeight = document.body.style.height;

    if (window.innerWidth <= 767) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';

      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      document.body.style.height = originalHeight;

      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, []);

  // Handle avatar upload from gallery
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        const activeEmail = localStorage.getItem('email') || profileForm.email;
        try {
          await updateUserProfileApi({ avatar: base64Data });
          localStorage.setItem(`student_avatar_${activeEmail}`, base64Data);
          setProfileForm(prev => ({ ...prev, avatar: base64Data }));
          updateUserProfile({ ...profileForm, avatar: base64Data });
          triggerToast('Profile picture updated successfully!');
        } catch (err) {
          triggerToast('Failed to save profile picture to remote database.');
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const updatedData = await updateUserProfileApi({
        full_name: profileForm.name,
        phone: profileForm.phone,
      });

      // Sync state and localStorage
      localStorage.setItem('name', updatedData.full_name);
      localStorage.setItem('phone', updatedData.phone);

      const storedUserStr = localStorage.getItem("user");
      if (storedUserStr) {
        const u = JSON.parse(storedUserStr);
        u.full_name = updatedData.full_name;
        u.phone = updatedData.phone;
        localStorage.setItem("user", JSON.stringify(u));
      }

      updateUserProfile({
        name: updatedData.full_name,
        phone: updatedData.phone,
      });

      setProfileSuccess(true);
      triggerToast('Profile information updated successfully!');
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      triggerToast(err.response?.data?.full_name?.[0] || err.response?.data?.phone?.[0] || 'Unable to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    setActionLoading({ isLoading: true, message: 'Logging out securely...' });
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout Error:", err);
    } finally {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      localStorage.removeItem("phone");
      localStorage.removeItem("email");
      localStorage.removeItem("tiffin_connect_orders");
      localStorage.removeItem("tiffin_connect_trackers");
      localStorage.removeItem("tiffin_connect_sellers");
      localStorage.removeItem("tiffin_connect_ratings");

      setActionLoading({ isLoading: false, message: '' });
      navigate("/login", { replace: true });
    }
  };
  return (
    <div className="student-device-wrapper">
      {actionLoading.isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#ffffff',
          fontFamily: 'Outfit, sans-serif'
        }}>
          <style>{`
            @keyframes loadProgress {
              0% { width: 0%; }
              50% { width: 70%; }
              100% { width: 100%; }
            }
          `}</style>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.5px' }}>
              {actionLoading.message}
            </span>
            <div style={{ width: '220px', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '99px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: '0%', backgroundColor: '#f59e0b', borderRadius: '99px', animation: 'loadProgress 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards' }} />
            </div>
          </div>
        </div>
      )}
      <div className="student-phone-frame">

        <div className="student-dashboard-layout">

          {/* Left Sidebar Navigation - Desktop only */}
          <aside className="student-sidebar">
            <div className="sidebar-brand" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
              <img src={logo} alt="CampusLunch Logo" className="sidebar-logo" />
              <span>Campus Lunch</span>
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
              <div className="header-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
                
                {/* Notification Bell Icon */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}>
                  <Bell size={20} style={{ color: '#475569' }} />
                  {notifications && notifications.filter(n => n.unread).length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      borderRadius: '50%',
                      width: '15px',
                      height: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid #ffffff'
                    }}>
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </div>

                {/* Notifications Dropdown Panel */}
                {showNotificationsDropdown && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '40px',
                    width: '300px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    zIndex: 10500,
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1e293b' }}>Notifications</span>
                      {notifications && notifications.filter(n => n.unread).length > 0 && (
                        <button
                          onClick={() => {
                            if (markAllNotificationsRead) markAllNotificationsRead();
                          }}
                          style={{ border: 'none', background: 'transparent', color: '#855300', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }} className="category-scroll-container">
                      {notifications && notifications.length > 0 ? (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              backgroundColor: n.unread ? '#fffbeb' : '#f8fafc',
                              borderLeft: `3px solid ${n.unread ? '#f59e0b' : '#cbd5e1'}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b' }}>{n.title}</span>
                              <button
                                onClick={() => {
                                  if (deleteNotification) deleteNotification(n.id);
                                }}
                                style={{ border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                              >
                                &times;
                              </button>
                            </div>
                            <span style={{ fontSize: '0.68rem', color: '#475569', lineHeight: '1.3', display: 'block' }}>{n.message}</span>
                            <span style={{ fontSize: '0.58rem', color: '#94a3b8', marginTop: '2px' }}>{n.time}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <img
                  src={user.avatar || "/images/default-avatar.jpg"}
                  alt="Student Avatar"
                  className="student-avatar-circle"
                  onClick={() => setActiveTab('profile')}
                  style={{ cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%' }}
                />
                <span className="header-vendor-name" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>{user.name}</span>
              </div>
            </header>

            <div
              className="student-app-scroll-container"
              style={{
                paddingBottom: (activeTab === 'cart' && cart.length > 0) ? '180px' : '90px'
              }}
            >

              {/* HOME VIEW */}
              {activeTab === 'home' && (
                <div className="desktop-student-grid">

                  {/* Left Column: Greetings, Search, Chips, Live Order */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Greetings */}
                    <div>
                      <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', fontFamily: 'serif' }}>Hello, {user.name}!</h1>
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



                    {/* Live Orders sliding carousel */}
                    {getActiveTrackersList().length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#855300' }}>Active Live Orders</span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Swipe &bull; {getActiveTrackersList().length} active</span>
                        </div>

                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          overflowX: 'auto',
                          paddingBottom: '8px',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                          scrollSnapType: 'x mandatory',
                          width: '100%',
                          scrollBehavior: 'smooth',
                          WebkitOverflowScrolling: 'touch'
                        }}>
                          {getActiveTrackersList().map(tracker => (
                            <div
                              key={tracker.orderId}
                              className="live-order-card"
                              onClick={() => {
                                setSelectedTrackingOrderId(tracker.orderId);
                                setActiveTab('track-order');
                              }}
                              style={{
                                padding: '20px 18px',
                                borderRadius: '16px',
                                minWidth: '270px',
                                flexShrink: 0,
                                scrollSnapAlign: 'start',
                                cursor: 'pointer',
                                boxShadow: '0 8px 18px rgba(245, 158, 11, 0.12)'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', opacity: 0.95 }}>Live Order</span>
                                <span style={{ fontSize: '1.15rem', fontWeight: 900, backgroundColor: 'rgba(255, 255, 255, 0.25)', padding: '2px 8px', borderRadius: '8px' }}>{tracker.orderId}</span>
                              </div>

                              <p style={{ margin: '0 0 14px 0', fontSize: '0.78rem', opacity: 0.9, textAlign: 'left' }}>
                                {tracker.vendorName} &bull; {tracker.location}
                              </p>

                              <div style={{ display: 'flex', width: '100%' }}>
                                <button
                                  className="order-action-btn btn-solid"
                                  style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    backgroundColor: '#ffffff',
                                    color: '#855300',
                                    padding: '10px 0',
                                    borderRadius: '10px',
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                  }}
                                >
                                  <MapPin size={16} />
                                  <span>Track Live Location</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Order Again & Explore Kitchens Scroll */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Order Again Section */}
                    {orders.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h3 className="dashboard-heading" style={{ fontSize: '0.95rem' }}>Order Again</h3>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', cursor: 'pointer' }} onClick={() => setActiveTab('orders')}>See History</span>
                        </div>

                        <div className="order-again-card">
                          <img
                            src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Crect width='24' height='24' fill='%23f1f5f9'/%3E%3Cpath d='M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-8.03c2.09-.13 3.75-1.85 3.75-3.97V2H11v7zm4-6v8h3v11h2V3h-5z'/%3E%3C/svg%3E"
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

                    {/* Grouped Catalog - Database-driven Vendor Cards Grid */}
                    <div>
                      <h3 className="dashboard-heading" style={{ fontSize: '0.95rem', marginBottom: '14px' }}>Explore Kitchens</h3>

                      {vendorsLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '10px' }}>
                          <RefreshCw className="animate-spin" size={24} style={{ color: '#855300' }} />
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Loading active kitchens...</span>
                        </div>
                      ) : vendorsError ? (
                        <div style={{ textAlign: 'center', padding: '30px 20px', color: '#ef4444', backgroundColor: '#fef2f2', borderRadius: '16px', border: '1px solid #fee2e2' }}>
                          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 'bold' }}>Failed to load kitchens.</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#7f1d1d' }}>Please check your network connection and try again.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {(() => {
                            const activeVendors = vendors;
                            if (activeVendors.length === 0) {
                              return (
                                <div style={{ textAlign: 'center', padding: '30px 24px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', color: '#64748b' }}>
                                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 'bold' }}>No Active Kitchens Found</p>
                                  <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>Try adjusting your search criteria or meal category filters.</p>
                                </div>
                              );
                            }
                            const sortedVendors = [...activeVendors].sort((a, b) => {
                              const aClosed = !a.is_active || kitchenStatuses[a.full_name] === false || (kitchenStatuses[a.full_name] === undefined && a.is_kitchen_open === false);
                              const bClosed = !b.is_active || kitchenStatuses[b.full_name] === false || (kitchenStatuses[b.full_name] === undefined && b.is_kitchen_open === false);
                              if (aClosed && !bClosed) return 1;
                              if (!aClosed && bClosed) return -1;
                              return 0;
                            });

                            return sortedVendors.map(vendor => {
                              const isClosed = !vendor.is_active || kitchenStatuses[vendor.full_name] === false || (kitchenStatuses[vendor.full_name] === undefined && vendor.is_kitchen_open === false);
                              return (
                                <div
                                  key={vendor.id}
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    textAlign: 'left',
                                    marginBottom: '24px'
                                  }}
                                >
                                  {/* Vendor Header (Only Name and Action link) */}
                                  <div 
                                    onClick={() => !isClosed && handleViewVendorDetails(vendor.id)}
                                    style={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center', 
                                      cursor: isClosed ? 'default' : 'pointer', 
                                      padding: '0 4px',
                                      opacity: isClosed ? 0.55 : 1
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#855300', margin: 0, fontFamily: 'serif' }}>
                                        {vendor.full_name}
                                      </h4>
                                      {isClosed && (
                                        <span style={{ fontSize: '0.62rem', color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, marginLeft: '8px' }}>
                                          Closed
                                        </span>
                                      )}
                                    </div>
                                    {!isClosed && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.72rem', color: '#b45309', fontWeight: 800 }}>
                                        <span>View Kitchen</span>
                                        <ChevronRight size={14} />
                                      </div>
                                    )}
                                  </div>

                                  {/* Tiffins List from Vendor */}
                                  <div style={{ 
                                    display: 'flex', 
                                    gap: '12px', 
                                    overflowX: 'auto', 
                                    paddingBottom: '6px',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                  }}>
                                    {!vendor.menu_items || vendor.menu_items.length === 0 ? (
                                      <div style={{ padding: '16px 8px', fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'left', width: '100%' }}>
                                        No meals matching categories.
                                      </div>
                                    ) : (
                                      vendor.menu_items.map(meal => {
                                        const ratingInfo = getSellerRatingInfo(vendor.full_name);
                                        const displayRating = ratingInfo.reviews > 0 ? ratingInfo.rating : '4.8';
                                        
                                        const contextSeller = sellers.find(s => s.id === vendor.id);
                                        const contextMeal = contextSeller ? contextSeller.meals.find(m => m.id === meal.id) : null;
                                        const availableStock = contextMeal ? contextMeal.availableQty : 15;
                                        const disabledAction = isClosed || availableStock <= 0;
                                        
                                        return (
                                          <div
                                            key={meal.id}
                                            style={{
                                              flexShrink: 0,
                                              width: '180px',
                                              backgroundColor: '#fafbfc',
                                              borderRadius: '16px',
                                              padding: '10px',
                                              border: '1.5px solid rgba(0, 0, 0, 0.025)',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              gap: '6px',
                                              position: 'relative',
                                              opacity: disabledAction ? 0.6 : 1
                                            }}
                                          >
                                            {/* Meal Image */}
                                            <div style={{ position: 'relative', width: '100%', height: '90px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
                                              <img
                                                src={meal.image || "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Crect width='24' height='24' fill='%23f1f5f9'/%3E%3Cpath d='M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-8.03c2.09-.13 3.75-1.85 3.75-3.97V22H11v7zm4-6v8h3v11h2V3h-5z'/%3E%3C/svg%3E"}
                                                alt={meal.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                              />
                                              <span style={{
                                                position: 'absolute',
                                                top: '6px',
                                                left: '6px',
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: meal.food_type === 'Veg' || meal.food_type === 'Jain' ? '#10b981' : '#ef4444',
                                                border: '2px solid #ffffff',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                              }} title={meal.food_type}></span>
                                              <span style={{
                                                position: 'absolute',
                                                top: '6px',
                                                right: '6px',
                                                backgroundColor: 'rgba(255,255,255,0.92)',
                                                color: '#f59e0b',
                                                fontSize: '0.62rem',
                                                fontWeight: 800,
                                                padding: '2px 6px',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '2px',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                              }}>
                                                ★ {displayRating}
                                              </span>
                                            </div>

                                            {/* Meal Info */}
                                            <div style={{ textAlign: 'left' }}>
                                              <h5 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {meal.name}
                                              </h5>
                                              <p style={{ fontSize: '0.65rem', color: '#64748b', margin: '0 0 6px 0', height: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {meal.description}
                                              </p>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                {isClosed ? (
                                                  <span style={{ fontSize: '0.62rem', color: '#ef4444', fontWeight: 700, backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>
                                                    Kitchen Closed
                                                  </span>
                                                ) : availableStock > 0 ? (
                                                  <span style={{ fontSize: '0.62rem', color: availableStock <= 5 ? '#ef4444' : '#059669', fontWeight: 700, backgroundColor: availableStock <= 5 ? '#fef2f2' : '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {availableStock <= 5 ? `Only ${availableStock} left` : `Stock: ${availableStock}`}
                                                  </span>
                                                ) : (
                                                  <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                                    Out of stock
                                                  </span>
                                                )}
                                              </div>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f172a' }}>
                                                  ₹{meal.price}
                                                </span>
                                                <button
                                                  disabled={disabledAction}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(meal, vendor.id);
                                                  }}
                                                  style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    backgroundColor: disabledAction ? '#cbd5e1' : '#855300',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    cursor: disabledAction ? 'not-allowed' : 'pointer',
                                                    boxShadow: disabledAction ? 'none' : '0 2px 4px rgba(133, 83, 0, 0.2)'
                                                  }}
                                                >
                                                  <Plus size={14} />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* VENDOR DETAILS TAB VIEW */}
              {activeTab === 'vendor-details' && selectedVendorDetails && (
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
                      src={selectedVendorDetails.profile_image || "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Crect width='24' height='24' fill='%23f1f5f9'/%3E%3Cpath d='M12 3L4 9v12h16V9l-8-6zm0 2.5l6 4.5v11H6v-11l6-4.5z'/%3E%3C/svg%3E"}
                      alt={selectedVendorDetails.full_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))', display: 'flex', alignItems: 'flex-end', padding: '16px' }}>
                      <h2 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{selectedVendorDetails.full_name}</h2>
                    </div>
                  </div>

                  <div className="order-again-card" style={{ display: 'block', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>★ 4.8 Ratings</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Serving: Fresh Daily</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#475569', margin: '4px 0 0 0' }}>Location: Campus Hub Kitchen</p>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>Contact: {selectedVendorDetails.phone || "N/A"}</p>

                  </div>

                  {/* Menu List */}
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>Today's Menu Items</h3>
                  {vendorDetailsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                      <RefreshCw className="animate-spin" size={20} style={{ color: '#855300' }} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedVendorDetails.menu_items && selectedVendorDetails.menu_items.map(meal => (
                        <div key={meal.id} className="order-again-card" style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <img
                              src={meal.image || "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Crect width='24' height='24' fill='%23f1f5f9'/%3E%3Cpath d='M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-8.03c2.09-.13 3.75-1.85 3.75-3.97V2H11v7zm4-6v8h3v11h2V3h-5z'/%3E%3C/svg%3E"}
                              alt={meal.name}
                              onClick={() => setSelectedMeal({ ...meal, sellerId: selectedVendorDetails.id })}
                              style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }}
                            />
                            <div style={{ flex: 1, textAlign: 'left' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                                <h4
                                  onClick={() => setSelectedMeal({ ...meal, sellerId: selectedVendorDetails.id })}
                                  style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: 0, cursor: 'pointer' }}
                                >
                                  {meal.name}
                                </h4>
                                <span style={{
                                  fontSize: '0.62rem',
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  backgroundColor: meal.food_type === 'Veg' ? '#e2fbe8' : '#fdeeed',
                                  color: meal.food_type === 'Veg' ? '#15803d' : '#b91c1c',
                                  fontWeight: 800
                                }}>
                                  {meal.food_type}
                                </span>
                                <span style={{
                                  fontSize: '0.62rem',
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  backgroundColor: '#f1f5f9',
                                  color: '#475569',
                                  fontWeight: 800
                                }}>
                                  {meal.meal_type}
                                </span>
                              </div>
                              <p style={{ margin: '4px 0 6px 0', fontSize: '0.72rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{meal.description}</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#855300' }}>₹{meal.price}</span>
                                <button
                                  className="order-action-btn btn-solid"
                                  style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '6px' }}
                                  onClick={() => handleAddToCart({ ...meal, price: Number(meal.price) }, selectedVendorDetails.id)}
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!selectedVendorDetails.menu_items || selectedVendorDetails.menu_items.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                          No available menu items found today.
                        </div>
                      )}
                    </div>
                  )}
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
                      {/* Manual Coupon Input */}
                      <div className="premium-coupon-card" style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#855300' }}>Have a Promo Coupon?</span>
                          <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              placeholder="ENTER CODE (e.g. CAMPUS50)"
                              style={{
                                flex: 1,
                                borderRadius: '10px',
                                border: '1px solid rgba(245, 158, 11, 0.25)',
                                padding: '8px 12px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px'
                              }}
                            />
                            <button
                              type="submit"
                              style={{
                                border: 'none',
                                backgroundColor: '#f59e0b',
                                color: '#ffffff',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                padding: '8px 16px',
                                borderRadius: '10px',
                                cursor: 'pointer'
                              }}
                            >
                              Apply
                            </button>
                          </form>
                          {couponError && <span style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>{couponError}</span>}
                          {couponSuccess && <span style={{ color: '#059669', fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>{couponSuccess}</span>}
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
                  <div className="order-again-card" style={{
                    padding: '24px 20px',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
                    position: 'relative',
                    overflow: 'hidden',
                    maxWidth: '420px',
                    margin: '0 auto'
                  }}>
                    {/* Top colored stripe */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '6px',
                      backgroundColor: '#0b1c30'
                    }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginTop: '6px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: '#1e293b', letterSpacing: '0.05em', margin: 0 }}>Order Receipt</h4>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{paymentSuccessData.date}</span>
                    </div>

                    {/* Customer & Delivery details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Bill To</span>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem', display: 'block' }}>{paymentSuccessData.customerName}</span>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginTop: '2px' }}>{paymentSuccessData.customerLocation}</span>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>{paymentSuccessData.customerPhone}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Kitchen Details</span>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem', display: 'block' }}>{paymentSuccessData.vendor.split(' & ').filter((v, i, a) => a.indexOf(v) === i).join(' & ')}</span>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginTop: '2px' }}>Slot: {paymentSuccessData.deliverySlot}</span>
                      </div>
                    </div>

                    {/* Items/Tokens List */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Tiffin Tokens</span>
                      {paymentSuccessData.tokenMappings && paymentSuccessData.tokenMappings.map((mapping, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderBottom: idx < paymentSuccessData.tokenMappings.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: idx < paymentSuccessData.tokenMappings.length - 1 ? '6px' : '0' }}>
                          <span style={{ fontWeight: 700, color: '#334155' }}>1x {mapping.itemName}</span>
                          <span style={{ fontWeight: 850, color: '#b45309', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>{mapping.tokenId}</span>
                        </div>
                      ))}
                    </div>

                    {/* Cost Breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal</span>
                        <span style={{ fontWeight: 600, color: '#334155' }}>₹{paymentSuccessData.subtotal}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>GST (5%)</span>
                        <span style={{ fontWeight: 600, color: '#334155' }}>₹{paymentSuccessData.gst}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Delivery Partner Fee</span>
                        <span style={{ fontWeight: 600, color: '#334155' }}>₹{paymentSuccessData.deliveryFee}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Platform Handling Fee</span>
                        <span style={{ fontWeight: 600, color: '#334155' }}>₹{paymentSuccessData.platformFee}</span>
                      </div>
                      {paymentSuccessData.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                          <span>Discount Applied</span>
                          <span style={{ fontWeight: 700 }}>-₹{paymentSuccessData.discount}</span>
                        </div>
                      )}
                    </div>

                    {/* Dashed Separator */}
                    <div style={{ borderTop: '1px dashed #cbd5e1', margin: '4px 0 2px 0' }}></div>

                    {/* Grand Total */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0f172a' }}>Total Paid</span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '2px' }}>via {paymentSuccessData.paymentMethod}</span>
                      </div>
                      <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>₹{paymentSuccessData.amount}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '28px' }}>
                    <button
                      className="order-action-btn btn-solid"
                      onClick={() => {
                        const activeTrack = getActiveTrackersList()[0];
                        if (activeTrack) {
                          setSelectedTrackingOrderId(activeTrack.orderId);
                          setActiveTab('track-order');
                        } else {
                          setActiveTab('orders');
                        }
                      }}
                      style={{ padding: '12px 0', borderRadius: '12px', fontWeight: 800 }}
                    >
                      Vendor Live Location
                    </button>

                    <button
                      className="order-action-btn"
                      onClick={() => {
                        downloadReceiptPdf(paymentSuccessData);
                        triggerToast('Downloading PDF Receipt...');
                      }}
                      style={{ padding: '10px 0', borderRadius: '12px', fontWeight: 800, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569' }}
                    >
                      Download Receipt (PDF)
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

              {/* LIVE ORDER TRACKER VIEW */}
              {activeTab === 'track-order' && currentTracker && currentSeller && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => setActiveTab('orders')}
                      style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', color: '#64748b', cursor: 'pointer', padding: 0 }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h2 className="dashboard-heading" style={{ fontSize: '1.25rem' }}>Vendor Live Location ({currentTracker.orderId})</h2>
                  </div>

                  {/* Status Progress Stepper */}
                  <div className="order-again-card" style={{ padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>Order Status</span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 900,
                          color: currentTracker.statusIndex === 5 ? '#10b981' : '#f59e0b',
                          backgroundColor: currentTracker.statusIndex === 5 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          padding: '4px 10px',
                          borderRadius: '99px',
                          textTransform: 'uppercase'
                        }}
                      >
                        {currentTracker.statusIndex === 5 ? 'Delivered' : currentTracker.eta}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${currentTracker.statusIndex === 5 ? 100 : (currentTracker.statusIndex * 20)}%`,
                          height: '100%',
                          backgroundColor: currentTracker.statusIndex === 5 ? '#10b981' : '#855300',
                          borderRadius: '99px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>

                    {/* Stepper Labels */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', fontWeight: 800, color: '#94a3b8' }}>
                      <span style={{ color: currentTracker.statusIndex >= 0 ? '#855300' : 'inherit' }}>Ordered</span>
                      <span style={{ color: currentTracker.statusIndex >= 1 ? '#855300' : 'inherit' }}>Preparing</span>
                      <span style={{ color: currentTracker.statusIndex >= 3 ? '#855300' : 'inherit' }}>In Transit</span>
                      <span style={{ color: currentTracker.statusIndex === 5 ? '#10b981' : 'inherit' }}>Delivered</span>
                    </div>
                  </div>

                  {/* Delivered Success & Ratings Actions Card */}
                  {currentTracker.statusIndex === 5 && (
                    <div className="order-again-card" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.2)', backgroundColor: 'rgba(16, 185, 129, 0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#10b981' }}>check_circle</span>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 900, margin: '0 0 4px 0', color: '#0f172a' }}>Tiffin Handed Over Successfully!</h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Enjoy your fresh warm meal. Please share your feedback to help us maintain food quality.</p>
                      </div>
                      <button
                        className="order-action-btn btn-solid"
                        onClick={() => {
                          setRatingModal({
                            isOpen: true,
                            orderId: currentTracker.orderId,
                            vendorName: currentTracker.vendorName,
                            foodRating: 0,
                            serviceRating: 0,
                            comment: ''
                          });
                          setActiveTab('orders');
                        }}
                        style={{ padding: '8px 24px', fontSize: '0.8rem', borderRadius: '10px', fontWeight: 800 }}
                      >
                        Rate Tiffin Order
                      </button>
                    </div>
                  )}

                  {/* Interactive Google Map */}
                  <div className="order-again-card" style={{ padding: '0px', overflow: 'hidden', borderRadius: '16px', display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9' }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.0805315481755!2d75.8953181!3d22.7531235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396302a247d519b5%3A0xb36de176249e0c52!2sIndore%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                      width="100%"
                      height="320"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>

                  {/* Vendor Contact details */}
                  <div className="order-again-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: '#fef3c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d97706',
                      fontWeight: 950,
                      fontSize: '1.25rem'
                    }}>
                      {currentTracker.vendorName.charAt(0)}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{currentTracker.vendorName}</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>Pickup Point: {currentTracker.location}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', fontWeight: 600, color: '#475569' }}>Phone: {currentSeller.phone || '+91 98765 43210'}</p>
                    </div>
                    <a
                      href={`tel:${currentSeller.phone || '9876543210'}`}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Phone size={14} />
                      Call
                    </a>
                  </div>
                </div>
              )}



              {/* ORDERS TAB VIEW */}
              {activeTab === 'orders' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2 className="dashboard-heading" style={{ fontSize: '1.25rem' }}>My Orders</h2>

                  {/* Active Tokens Info */}
                  {getActiveTrackersList().length === 0 && (
                    <div className="order-again-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1.5px dashed rgba(133, 83, 0, 0.25)', borderRadius: '16px', backgroundColor: '#fffbeb', color: '#855300', textAlign: 'left', marginBottom: '12px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.8rem', color: '#d97706' }}>info</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#855300' }}>No active orders for now</h4>
                      </div>
                    </div>
                  )}
                  {getActiveTrackersList().map(tracker => (
                    <div
                      key={tracker.orderId}
                      className="order-again-card"
                      onClick={() => {
                        setSelectedTrackingOrderId(tracker.orderId);
                        setActiveTab('track-order');
                      }}
                      style={{ borderLeft: '4px solid #f59e0b', padding: '16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '8px' }}
                    >
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Active Order Tracker</span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Token {tracker.orderId}</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>{tracker.vendorName} • Pickup Point: {tracker.location}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b' }}>VIEW &rarr;</span>
                    </div>
                  ))}

                  {/* Past Orders Queue */}
                  <h3 className="dashboard-heading" style={{ fontSize: '0.95rem' }}>Order History</h3>
                  <div className="student-rated-list-grid">
                    {orders.filter(o => o.deliveryStatus === 'Delivered' || o.deliveryStatus === 'Cancelled').length === 0 ? (
                      <div className="order-again-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', border: '2px dashed #cbd5e1', borderRadius: '12px', color: '#64748b', textAlign: 'center', background: '#f8fafc', width: '100%', gridColumn: '1 / -1' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '8px' }}>shopping_bag</span>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>No past orders yet</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>Delivered orders will be displayed in your order history.</p>
                      </div>
                    ) : (
                      orders.filter(o => o.deliveryStatus === 'Delivered' || o.deliveryStatus === 'Cancelled').map(order => (
                        <div key={order.id} className="order-again-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.03)', backgroundColor: '#ffffff', boxShadow: '0 4px 15px rgba(0,0,0,0.005)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', textAlign: 'left' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <h4 style={{ fontSize: '0.92rem', fontWeight: 900, margin: 0, color: '#1e293b' }}>Token {order.id}</h4>
                              <span style={{
                                fontWeight: 800,
                                color: order.deliveryStatus === 'Cancelled' ? '#e11d48' : '#10b981',
                                backgroundColor: order.deliveryStatus === 'Cancelled' ? '#fff1f2' : '#f0fdf4',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.68rem',
                                letterSpacing: '0.5px'
                              }}>
                                {order.deliveryStatus.toUpperCase()}
                              </span>
                            </div>
                            <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.03)', paddingBottom: '6px' }}>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', fontWeight: 800 }}>{order.vendor}</p>
                              <p style={{ margin: '3px 0 0 0', fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>{order.date} &bull; {order.items}</p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Paid amount</span>
                              <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#0f172a' }}>₹{order.bill} <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>via {order.paymentMethod}</span></span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(0, 0, 0, 0.04)', paddingTop: '8px', width: '100%', marginTop: '2px' }}>
                            {order.deliveryStatus === 'Delivered' && (
                              <button
                                className="order-action-btn btn-solid"
                                style={{ flex: 2, padding: '10px 0', fontSize: '0.75rem', borderRadius: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
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
                                const totalBill = order.bill;
                                const estSubtotal = Math.max(10, Math.round(totalBill / 1.05) - 25);
                                const estGst = Math.round(estSubtotal * 0.05);
                                downloadReceiptPdf({
                                  orderId: order.id,
                                  vendor: order.vendor,
                                  items: order.items,
                                  tokenMappings: [{ itemName: order.items.replace(/^\d+x /, ''), tokenId: order.id }],
                                  amount: totalBill,
                                  subtotal: estSubtotal,
                                  gst: estGst,
                                  deliveryFee: 20,
                                  platformFee: 5,
                                  discount: 0,
                                  paymentMethod: order.paymentMethod || 'Google Pay',
                                  customerName: profileForm.name || user.name || 'Student',
                                  customerPhone: profileForm.phone || user.phone || '9876543210',
                                  customerLocation: profileForm.hostel ? `${profileForm.hostel}, Room ${profileForm.roomNumber}` : 'Hostel B, Room 302',
                                  deliverySlot: 'Lunch 12:30 PM',
                                  date: order.date
                                });
                                triggerToast('Downloading PDF Receipt...');
                              }}
                              style={{ flex: 1, padding: '10px 0', fontSize: '0.75rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              Receipt
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}



              {/* PROFILE VIEW */}
              {activeTab === 'profile' && (
                <div className="profile-page-container">

                  {/* MAIN MENU TAB */}
                  {profileSubTab === 'menu' && (
                    <>
                      {/* Header block */}
                      <div className="profile-chef-header" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.04)', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                        <img
                          src={profileForm.avatar || user.avatar || "/images/default-avatar.jpg"}
                          alt="Student Avatar"
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', border: '3px solid #855300', padding: '2px' }}
                        />
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#855300', marginTop: '10px', marginBottom: '2px' }}>{profileForm.name}</h3>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{profileForm.email}</p>
                      </div>

                      {/* Menu List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>

                        <button
                          onClick={() => setProfileSubTab('edit-profile')}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <User size={18} style={{ color: '#855300' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Edit Profile & Preferences</span>
                          </div>
                          <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                        </button>

                        <button
                          onClick={() => setProfileSubTab('notifications')}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Bell size={18} style={{ color: '#855300' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Notification Settings</span>
                          </div>
                          <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                        </button>

                        <button
                          onClick={() => setProfileSubTab('change-password')}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Lock size={18} style={{ color: '#855300' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Change Password</span>
                          </div>
                          <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                        </button>

                        <button
                          onClick={() => setProfileSubTab('reset-password')}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <RefreshCw size={18} style={{ color: '#855300' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Password Reset Request</span>
                          </div>
                          <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                        </button>

                        <button
                          onClick={() => setProfileSubTab('support')}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <HelpCircle size={18} style={{ color: '#855300' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Help Center & FAQ</span>
                          </div>
                          <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                        </button>
                      </div>

                      {/* Action buttons with custom tight spacing */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                          className="profile-logout-btn"
                          onClick={handleLogout}
                          style={{
                            width: '100%',
                            height: '44px',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            marginTop: '0',
                            marginBottom: '0'
                          }}
                        >
                          <LogOut size={16} />
                          Logout Account
                        </button>

                        <button
                          className="profile-logout-btn"
                          onClick={() => setShowDeleteConfirm(true)}
                          style={{ width: '100%', height: '44px', borderRadius: '10px', fontSize: '0.85rem', color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fff5f5', marginTop: '0', marginBottom: '0' }}
                        >
                          Delete Account
                        </button>
                      </div>
                    </>
                  )}

                  {/* EDIT PROFILE SUB-PAGE */}
                  {profileSubTab === 'edit-profile' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <button
                        onClick={() => setProfileSubTab('menu')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', backgroundColor: 'transparent', color: '#855300', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', padding: 0, width: 'fit-content' }}
                      >
                        <ArrowLeft size={16} />
                        Back to Profile Menu
                      </button>

                      <div className="profile-chef-header" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '8px' }}>
                          <img
                            src={profileForm.avatar || user.avatar || "/images/default-avatar.jpg"}
                            alt="Student Face Photo"
                            className="profile-chef-avatar"
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%' }}
                          />
                          <label
                            htmlFor="avatar-upload"
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: '#f59e0b',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              border: '2px solid #ffffff'
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>photo_camera</span>
                          </label>
                          <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                          />
                        </div>
                      </div>

                      <form onSubmit={handleSaveProfile} className="profile-info-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="profile-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 6px 0', color: '#1e293b' }}>Personal Information</h4>

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
                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Email Address</label>
                            <input
                              type="email"
                              value={profileForm.email}
                              disabled
                              style={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Contact Phone</label>
                            <input
                              type="text"
                              value={profileForm.phone}
                              disabled
                              style={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
                            />
                          </div>


                        </div>

                        <button
                          type="submit"
                          className="order-action-btn btn-solid"
                          disabled={profileLoading}
                          style={{ padding: '10px 0', borderRadius: '8px', fontWeight: 800, opacity: profileLoading ? 0.7 : 1 }}
                        >
                          {profileLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* NOTIFICATION SETTINGS SUB-PAGE */}
                  {profileSubTab === 'notifications' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <button
                        onClick={() => setProfileSubTab('menu')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', backgroundColor: 'transparent', color: '#855300', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', padding: 0, width: 'fit-content' }}
                      >
                        <ArrowLeft size={16} />
                        Back to Profile Menu
                      </button>

                      <div className="profile-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Manage Notifications</h4>

                        {/* In-App Notifications Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>In-App Notifications</span>
                            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>For real-time delivery tracking alerts and system updates</span>
                          </div>
                          <button
                            onClick={() => setInAppNotifications(!inAppNotifications)}
                            style={{ width: '40px', height: '22px', borderRadius: '11px', backgroundColor: inAppNotifications ? '#855300' : '#cbd5e1', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s', padding: 0 }}
                          >
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ffffff', position: 'absolute', left: inAppNotifications ? '20px' : '4px', top: '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}></div>
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          triggerToast('Notification preferences updated successfully!');
                          setProfileSubTab('menu');
                        }}
                        className="order-action-btn btn-solid"
                        style={{ padding: '10px 0', borderRadius: '8px', fontWeight: 800 }}
                      >
                        Apply Changes
                      </button>
                    </div>
                  )}

                  {/* CHANGE PASSWORD SUB-PAGE */}
                  {profileSubTab === 'change-password' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <button
                        onClick={() => {
                          setProfileSubTab('menu');
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', backgroundColor: 'transparent', color: '#855300', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', padding: 0, width: 'fit-content' }}
                      >
                        <ArrowLeft size={16} />
                        Back to Profile Menu
                      </button>

                      <div className="profile-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, color: '#1e293b', textAlign: 'left' }}>Change Password</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Current Password</label>
                          <input
                            type="password"
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            style={{ borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>New Password</label>
                          <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{ borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (!currentPassword || !newPassword || !confirmPassword) {
                            triggerToast("Please fill in all password fields.");
                            return;
                          }

                          if (newPassword !== confirmPassword) {
                            triggerToast("Passwords do not match.");
                            return;
                          }

                          if (newPassword.length < 8) {
                            triggerToast("Password must be at least 8 characters long.");
                            return;
                          }

                          // Must contain at least one uppercase, one lowercase, one number and one special character
                          const strongPassword =
                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

                          if (!strongPassword.test(newPassword)) {
                            triggerToast(
                              "Password must contain an uppercase letter, lowercase letter, number, and special character."
                            );
                            return;
                          }

                          try {
                            setPasswordLoading(true);
                            await changePassword({
                              current_password: currentPassword,
                              new_password: newPassword,
                              confirm_password: confirmPassword,
                            });

                            triggerToast("Password updated successfully!");

                            setProfileSubTab("menu");
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");

                          } catch (err) {

                            if (err.response?.data) {

                              const errors = err.response.data;
                              const firstError = Object.values(errors)[0];

                              if (Array.isArray(firstError)) {
                                triggerToast(firstError[0]);
                              } else {
                                triggerToast(firstError);
                              }

                            } else {

                              triggerToast("Unable to change password.");

                            }
                          } finally {
                            setPasswordLoading(false);
                          }
                        }}
                        className="order-action-btn btn-solid"
                        disabled={passwordLoading}
                        style={{ padding: '10px 0', borderRadius: '8px', fontWeight: 800, opacity: passwordLoading ? 0.7 : 1 }}
                      >
                        {passwordLoading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  )}

                  {/* RESET PASSWORD SUB-PAGE */}
                  {profileSubTab === 'reset-password' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <button
                        onClick={() => setProfileSubTab('menu')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', backgroundColor: 'transparent', color: '#855300', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', padding: 0, width: 'fit-content' }}
                      >
                        <ArrowLeft size={16} />
                        Back to Profile Menu
                      </button>

                      <div className="profile-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Reset Password Request</h4>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                          If you forgot your password or want to reset it securely, we can email you a temporary login code or a secure reset link.
                        </p>

                        <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Registered Email Address</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{user.email}</span>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          setResetRequestLoading(true);
                          try {
                            await forgotPassword(user.email);
                            triggerToast('Password reset link sent to ' + user.email);
                            setProfileSubTab('menu');
                          } catch (err) {
                            triggerToast("Unable to send password reset link.");
                          } finally {
                            setResetRequestLoading(false);
                          }
                        }}
                        className="order-action-btn btn-solid"
                        disabled={resetRequestLoading}
                        style={{ padding: '10px 0', borderRadius: '8px', fontWeight: 800, opacity: resetRequestLoading ? 0.7 : 1 }}
                      >
                        {resetRequestLoading ? "Sending..." : "Send Reset Link"}
                      </button>
                    </div>
                  )}

                  {/* HELP & SUPPORT SUB-PAGE */}
                  {profileSubTab === 'support' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <button
                        onClick={() => setProfileSubTab('menu')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', backgroundColor: 'transparent', color: '#855300', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', padding: 0, width: 'fit-content' }}
                      >
                        <ArrowLeft size={16} />
                        Back to Profile Menu
                      </button>

                      <div className="profile-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 4px 0', color: '#1e293b' }}>Frequently Asked Questions</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <details style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                            <summary style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', outline: 'none' }}>Where do I pick up my orders?</summary>
                            <p style={{ margin: '6px 0 0 0', fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4' }}>All orders are delivered at designated cafeteria tables in main campus buildings. Go to the kitchen status tracker to see the exact pick-up point.</p>
                          </details>

                          <details style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                            <summary style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', outline: 'none' }}>Can I cancel a placed order?</summary>
                            <p style={{ margin: '6px 0 0 0', fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4' }}>Orders can only be cancelled before the kitchen marks them as 'Preparing Food'. Once food preparation starts, cancellations are blocked.</p>
                          </details>


                        </div>
                      </div>

                      <div className="profile-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Need further assistance?</h4>
                        <button
                          onClick={() => navigate('/support-chat')}
                          style={{
                            width: '100%',
                            height: '44px',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            backgroundColor: '#0b1c30',
                            color: '#ffffff',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <MessageSquare size={16} />
                          Help & Support Chat
                        </button>
                      </div>
                    </div>
                  )}
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
                onClick={async () => {
                  try {
                    const seller = sellers.find(s => s.name === ratingModal.vendorName);
                    if (!seller) {
                      alert("Error: Vendor not found");
                      return;
                    }
                    
                    const payload = {
                      vendor_id: seller.id,
                      orderId: ratingModal.orderId,
                      foodRating: ratingModal.foodRating,
                      serviceRating: ratingModal.serviceRating,
                      comment: ratingModal.comment
                    };

                    const createdRating = await submitRatingApi(payload);

                    if (setRatings) {
                      setRatings(prev => [createdRating, ...(prev || [])]);
                    }
                    triggerToast(`Feedback for ${ratingModal.vendorName} submitted successfully!`);
                  } catch (err) {
                    console.error("Failed to submit feedback to remote database:", err);
                    alert("Failed to submit feedback. Please try again.");
                  }
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
                onClick={async () => {
                  setShowDeleteConfirm(false);
                  setActionLoading({ isLoading: true, message: 'Deleting account permanently...' });
                  try {
                    await deleteUserProfileApi();
                  } catch (err) {
                    console.error("Account deletion failed:", err);
                  }
                  await new Promise(resolve => setTimeout(resolve, 1800));
                  triggerToast('Account deleted successfully.');
                  localStorage.removeItem('role');
                  localStorage.removeItem('access');
                  localStorage.removeItem('refresh');
                  localStorage.removeItem('user');
                  setActionLoading({ isLoading: false, message: '' });
                  navigate('/');
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart conflict warning dialog */}
      {cartConflictModal.isOpen && (
        <div className="custom-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="custom-modal-card" style={{ maxWidth: '320px', padding: '24px' }}>
            <div className="custom-modal-icon-wrapper" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
              <ShoppingBag size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '12px 0 6px 0', color: '#0f172a' }}>Replace Cart Items?</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0', lineHeight: '1.4', textAlign: 'center' }}>
              Your cart contains items from another kitchen. Do you want to discard your current cart and start a new order from this kitchen?
            </p>

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                className="custom-modal-btn btn-cancel"
                style={{ flex: 1, padding: '10px 0', fontSize: '0.82rem' }}
                onClick={() => setCartConflictModal({ isOpen: false, meal: null, sellerId: null })}
              >
                No, Keep
              </button>
              <button
                className="custom-modal-btn btn-confirm"
                style={{ flex: 1, padding: '10px 0', fontSize: '0.82rem', backgroundColor: '#f59e0b', color: '#ffffff' }}
                onClick={handleConfirmReplaceCart}
              >
                Yes, Discard
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Toast confirmation overlays */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
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
          animation: 'slideDown 0.3s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
