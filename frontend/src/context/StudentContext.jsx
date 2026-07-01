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
  const [user, setUser] = useState(() => {
    const activeEmail = localStorage.getItem('email') || INITIAL_USER_PROFILE.email;
    return {
      ...INITIAL_USER_PROFILE,
      name: localStorage.getItem('name') || INITIAL_USER_PROFILE.name,
      phone: localStorage.getItem('phone') || INITIAL_USER_PROFILE.phone,
      email: activeEmail,
      dietPreference: localStorage.getItem('dietPreference') || INITIAL_USER_PROFILE.dietPreference || 'Vegetarian',
      avatar: localStorage.getItem(`student_avatar_${activeEmail}`) || INITIAL_USER_PROFILE.avatar
    };
  });
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
  const [activeOrderTracker, setActiveOrderTracker] = useState(null);
  const [activeTrackers, setActiveTrackers] = useState([]);

  // Loading indicator helper for checkout or actions
  const [loading, setLoading] = useState(false);

  // Profile Edit Action
  const updateUserProfile = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  // Cart operations
  const addToCart = (meal, sellerId) => {
    let success = true;
    setCart(prev => {
      if (prev.length > 0 && prev[0].sellerId !== sellerId) {
        success = false;
        return prev;
      }
      const existing = prev.find(item => item.id === meal.id);
      if (existing) {
        return prev.map(item => 
          item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...meal, quantity: 1, sellerId }];
    });
    return success;
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
    const initialTracker = {
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
    };

    setActiveOrderTracker(initialTracker);
    setActiveTrackers(prev => [...prev, initialTracker]);

    const interval = setInterval(() => {
      currentStep += 1;
      if (currentStep <= 5) {
        let loc = 'Vendor Kitchen Gate';
        if (currentStep === 1) loc = 'Preparing Food at Kitchen';
        if (currentStep === 2) loc = 'Order Packed, Waiting for Driver';
        if (currentStep === 3) loc = 'Driver Picked Up, Heading to Campus';
        if (currentStep === 4) loc = 'Near Himalaya Hostel Road';
        if (currentStep === 5) loc = 'Delivered at Room Door';

        const updatedTrackerFields = {
          statusIndex: currentStep,
          progress: Math.round(((currentStep + 1) / 6) * 100),
          eta: currentStep === 5 ? 'Delivered' : `${18 - currentStep * 3} mins`,
          location: loc
        };

        setActiveOrderTracker(prev => {
          if (prev && prev.orderId === newOrderId) {
            return { ...prev, ...updatedTrackerFields };
          }
          return prev;
        });

        setActiveTrackers(prev => prev.map(t => {
          if (t.orderId === newOrderId) {
            return { ...t, ...updatedTrackerFields };
          }
          return t;
        }));

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

    const newOrders = [];
    const orderIds = [];
    const vendorNames = [];
    let tiffinIndex = 0;

    cart.forEach((item) => {
      const seller = sellers.find(s => s.id === item.sellerId) || { name: 'Local Kitchen' };
      for (let q = 0; q < item.quantity; q++) {
        const randomOffset = Math.floor(Math.random() * 25);
        const newOrderId = '#TK-' + (800 + tiffinIndex * 35 + randomOffset);
        tiffinIndex++;

        // Calculate individual bill (item price + platform fee + GST + delivery fee split)
        const totalItemsInCart = cart.reduce((sum, i) => sum + i.quantity, 0);
        const itemsTotal = item.price;
        const platformFee = Math.round(5 / totalItemsInCart);
        const gst = Math.round(itemsTotal * 0.05);
        const deliveryFee = Math.round(20 / totalItemsInCart);
        const discount = activeCoupon 
          ? (activeCoupon.discountType === 'percentage' ? Math.round(itemsTotal * (activeCoupon.value / 100)) : Math.round(activeCoupon.value / totalItemsInCart))
          : 0;
        const finalAmount = itemsTotal + platformFee + gst + deliveryFee - discount;

        const newOrderObj = {
          id: newOrderId,
          vendor: seller.name,
          items: `1x ${item.name}`,
          date: 'Just now',
          bill: finalAmount,
          paymentMethod: paymentMethod,
          paymentStatus: 'Paid',
          deliveryStatus: 'Confirmed'
        };

        newOrders.push(newOrderObj);
        orderIds.push(newOrderId);
        vendorNames.push(seller.name);

        // Start live status simulation for this individual order
        startOrderTrackingSimulation(newOrderId, seller.name);
      }
    });

    // Update orders list in state
    setOrders(prev => [...newOrders, ...prev]);

    clearCart();
    setLoading(false);
    
    // Return all order IDs and vendor names
    return { orderIds, vendorNames };
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
      activeTrackers,
      setActiveTrackers,
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
