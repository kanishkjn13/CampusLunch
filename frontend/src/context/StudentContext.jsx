import React, { createContext, useState, useEffect } from 'react';
import { 
  INITIAL_SELLERS, 
  INITIAL_COUPONS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_USER_PROFILE 
} from '../data/studentMockData';

export const StudentContext = createContext();

export const TRACKING_STEPS = [
  'Order Confirmed',
  'Preparing Food',
  'Packed',
  'Picked Up',
  'Out For Delivery',
  'Delivered'
];

export const StudentProvider = ({ children }) => {
  const [user, setUser] = useState(INITIAL_USER_PROFILE);
  const [sellers, setSellers] = useState(INITIAL_SELLERS);
  const [coupons] = useState(INITIAL_COUPONS);
  const [cart, setCart] = useState([]);
  const [activeCoupon, setActiveCoupon] = useState(null);
  
  // Dynamic Notifications State
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  
  // Favorites State (Array of food ids or seller ids)
  const [favorites, setFavorites] = useState(['m1', 'd1']);
  
  // Orders State
  const [orders, setOrders] = useState([
    {
      id: '#TK-871',
      vendor: "Maa's Kitchen",
      items: '2x Deluxe Veg Thali',
      date: 'Yesterday',
      bill: 240,
      paymentMethod: 'Google Pay',
      paymentStatus: 'Paid',
      deliveryStatus: 'Delivered'
    },
    {
      id: '#TK-859',
      vendor: 'Swad Sugandh',
      items: '1x Special Paneer Combo',
      date: '2 days ago',
      bill: 140,
      paymentMethod: 'PhonePe',
      paymentStatus: 'Paid',
      deliveryStatus: 'Delivered'
    }
  ]);

  // Live order active tracker status
  const [activeOrderTracker, setActiveOrderTracker] = useState({
    orderId: '#TK-882',
    vendorName: 'Dakshin Delights',
    statusIndex: 4, // Out for Delivery default
    driverInfo: {
      name: 'Ramesh Kumar',
      phone: '+91 9012345678',
      vehicle: 'Activa (MP-09-AB-1234)',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'
    },
    eta: '5 mins',
    progress: 83.3,
    location: 'Near Himalaya Hostel Road'
  });

  // Loading indicator helper for checkout or actions
  const [loading, setLoading] = useState(false);

  // Profile Edit Action
  const updateUserProfile = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  // Cart operations
  const addToCart = (meal, sellerId) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === meal.id);
      if (existing) {
        return prev.map(item => 
          item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...meal, quantity: 1, sellerId }];
    });
  };

  const updateCartQuantity = (mealId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === mealId) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (mealId) => {
    setCart(prev => prev.filter(item => item.id !== mealId));
  };

  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
  };

  // Apply Promo Coupon
  const applyCoupon = (code) => {
    const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (found) {
      setActiveCoupon(found);
      return { success: true, message: `Promo code ${found.code} applied successfully!` };
    }
    return { success: false, message: 'Invalid promo coupon code.' };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  // Favorites logic
  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Notification logic
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Real-time tracking progress simulation
  const startOrderTrackingSimulation = (newOrderId, vendorName) => {
    let currentStep = 0;
    setActiveOrderTracker({
      orderId: newOrderId,
      vendorName: vendorName,
      statusIndex: 0,
      driverInfo: {
        name: 'Ramesh Kumar',
        phone: '+91 9012345678',
        vehicle: 'Activa (MP-09-AB-1234)',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'
      },
      eta: '18 mins',
      progress: 16.6,
      location: 'Vendor Kitchen Gate'
    });

    const interval = setInterval(() => {
      currentStep += 1;
      if (currentStep <= 5) {
        let loc = 'Vendor Kitchen Gate';
        if (currentStep === 1) loc = 'Preparing Food at Kitchen';
        if (currentStep === 2) loc = 'Order Packed, Waiting for Driver';
        if (currentStep === 3) loc = 'Driver Picked Up, Heading to Campus';
        if (currentStep === 4) loc = 'Near Himalaya Hostel Road';
        if (currentStep === 5) loc = 'Delivered at Room Door';

        setActiveOrderTracker(prev => {
          if (!prev || prev.orderId !== newOrderId) {
            clearInterval(interval);
            return prev;
          }
          return {
            ...prev,
            statusIndex: currentStep,
            progress: Math.round(((currentStep + 1) / 6) * 100),
            eta: currentStep === 5 ? 'Delivered' : `${18 - currentStep * 3} mins`,
            location: loc
          };
        });

        // Push order state notification
        setNotifications(prev => [
          {
            id: Date.now(),
            type: 'order',
            title: 'Order Status Update',
            message: `Your order ${newOrderId} is now: ${TRACKING_STEPS[currentStep]}`,
            time: 'Just now',
            unread: true
          },
          ...prev
        ]);

        if (currentStep === 5) {
          clearInterval(interval);
          // Mark in list as delivered
          setOrders(prev => prev.map(o => 
            o.id === newOrderId ? { ...o, deliveryStatus: 'Delivered' } : o
          ));
        }
      } else {
        clearInterval(interval);
      }
    }, 12000); // advances step every 12 seconds for testing simulation speed
  };

  // Place checkout order
  const placeOrder = async (addressDetails, paymentMethod) => {
    setLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newOrderId = '#TK-' + Math.floor(800 + Math.random() * 200);
    const seller = sellers.find(s => s.id === cart[0]?.sellerId) || { name: 'Local Kitchen' };

    // Subtotal calculations
    const itemsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const platformFee = 5;
    const gst = Math.round(itemsTotal * 0.05);
    const deliveryFee = 20;
    const discount = activeCoupon 
      ? (activeCoupon.discountType === 'percentage' ? Math.round(itemsTotal * (activeCoupon.value / 100)) : activeCoupon.value)
      : 0;
    const finalAmount = itemsTotal + platformFee + gst + deliveryFee - discount;

    const newOrderObj = {
      id: newOrderId,
      vendor: seller.name,
      items: cart.map(item => `${item.quantity}x ${item.name}`).join(', '),
      date: 'Just now',
      bill: finalAmount,
      paymentMethod: paymentMethod,
      paymentStatus: 'Paid',
      deliveryStatus: 'Confirmed'
    };

    setOrders(prev => [newOrderObj, ...prev]);
    
    // Start live status simulation
    startOrderTrackingSimulation(newOrderId, seller.name);

    clearCart();
    setLoading(false);
    
    return newOrderId;
  };

  return (
    <StudentContext.Provider value={{
      user,
      sellers,
      coupons,
      cart,
      activeCoupon,
      orders,
      activeOrderTracker,
      notifications,
      favorites,
      loading,
      updateUserProfile,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      applyCoupon,
      removeCoupon,
      toggleFavorite,
      markAllNotificationsRead,
      deleteNotification,
      placeOrder,
      setOrders
    }}>
      {children}
    </StudentContext.Provider>
  );
};
