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
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('tiffin_connect_orders');
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse orders from localStorage:", e);
      return [];
    }
  });

  // Live order active tracker status
  const [activeOrderTracker, setActiveOrderTracker] = useState(null);
  const [activeTrackers, setActiveTrackers] = useState(() => {
    try {
      const saved = localStorage.getItem('tiffin_connect_trackers');
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse trackers from localStorage:", e);
      return [];
    }
  });

  // Ratings State
  const [ratings, setRatings] = useState(() => {
    try {
      const saved = localStorage.getItem('tiffin_connect_ratings');
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse ratings from localStorage:", e);
      return [];
    }
  });

  // Kitchen statuses state
  const [kitchenStatuses, setKitchenStatuses] = useState(() => {
    const statuses = {};
    INITIAL_SELLERS.forEach(s => {
      statuses[s.name] = localStorage.getItem('kitchen_status_' + s.name) !== 'closed';
    });
    return statuses;
  });

  useEffect(() => {
    localStorage.setItem('tiffin_connect_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('tiffin_connect_trackers', JSON.stringify(activeTrackers));
  }, [activeTrackers]);

  useEffect(() => {
    localStorage.setItem('tiffin_connect_ratings', JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      try {
        if (e.key === 'tiffin_connect_orders') {
          const saved = localStorage.getItem('tiffin_connect_orders');
          if (saved && saved !== 'undefined') setOrders(JSON.parse(saved));
        }
        if (e.key === 'tiffin_connect_trackers') {
          const saved = localStorage.getItem('tiffin_connect_trackers');
          if (saved && saved !== 'undefined') setActiveTrackers(JSON.parse(saved));
        }
        if (e.key === 'tiffin_connect_ratings') {
          const saved = localStorage.getItem('tiffin_connect_ratings');
          if (saved && saved !== 'undefined') setRatings(JSON.parse(saved));
        }
        if (e.key && e.key.startsWith('kitchen_status_')) {
          const name = e.key.replace('kitchen_status_', '');
          const isValOpen = localStorage.getItem(e.key) !== 'closed';
          setKitchenStatuses(prev => ({
            ...prev,
            [name]: isValOpen
          }));
        }
      } catch (err) {
        console.error("Error parsing storage changed data:", err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Loading indicator helper for checkout or actions
  const [loading, setLoading] = useState(false);

  // Profile Edit Action
  const updateUserProfile = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  // Cart operations
  const addToCart = (meal, sellerId) => {
    if (cart.length > 0 && cart[0].sellerId !== sellerId) {
      return false;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === meal.id);
      if (existing) {
        return prev.map(item => 
          item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...meal, quantity: 1, sellerId }];
    });
    return true;
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
    const initialTracker = {
      orderId: newOrderId,
      vendorName: vendorName,
      statusIndex: 0,
      driverInfo: {
        name: 'Tiffin Vendor',
        phone: '+91 98765 43210',
        vehicle: 'Pickup Counter',
        photo: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&h=100&fit=crop&q=80'
      },
      eta: 'Ready for Pickup',
      progress: 0,
      location: 'Tiffin Pickup Point'
    };

    setActiveOrderTracker(initialTracker);
    setActiveTrackers(prev => [...prev, initialTracker]);
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
          customer: user ? user.name : 'Student',
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
      setOrders,
      ratings,
      setRatings,
      kitchenStatuses
    }}>
      {children}
    </StudentContext.Provider>
  );
};
