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
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const loggedInUser = JSON.parse(userStr);
        if (loggedInUser) {
          return {
            ...INITIAL_USER_PROFILE,
            name: loggedInUser.full_name || loggedInUser.name || INITIAL_USER_PROFILE.name,
            phone: loggedInUser.phone || INITIAL_USER_PROFILE.phone,
            email: loggedInUser.email || INITIAL_USER_PROFILE.email,
            avatar: localStorage.getItem(`student_avatar_${loggedInUser.email}`) || INITIAL_USER_PROFILE.avatar
          };
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }
    const activeEmail = localStorage.getItem('email') || INITIAL_USER_PROFILE.email;
    return {
      ...INITIAL_USER_PROFILE,
      name: localStorage.getItem('name') || INITIAL_USER_PROFILE.name,
      phone: localStorage.getItem('phone') || INITIAL_USER_PROFILE.phone,
      email: activeEmail,
      avatar: localStorage.getItem(`student_avatar_${activeEmail}`) || INITIAL_USER_PROFILE.avatar
    };
  });
  const [sellers, setSellers] = useState(() => {
    try {
      const saved = localStorage.getItem('tiffin_connect_sellers');
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : INITIAL_SELLERS;
    } catch (e) {
      console.error("Failed to parse sellers from localStorage:", e);
      return INITIAL_SELLERS;
    }
  });
  const [coupons] = useState(INITIAL_COUPONS);
  const [cart, setCart] = useState([]);
  const [activeCoupon, setActiveCoupon] = useState(null);
  
  // Dynamic Notifications State
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  
  // Favorites State (Array of food ids or seller ids)
  const [favorites, setFavorites] = useState([]);
  
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('tiffin_connect_orders');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        const isValid = Array.isArray(parsed) && parsed.every(o => typeof o.items === 'string');
        if (isValid) {
          return parsed;
        }
      }
      return [];
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
      const loadedTrackers = (saved && saved !== 'undefined') ? JSON.parse(saved) : [];
      
      const savedOrdersStr = localStorage.getItem('tiffin_connect_orders');
      const currentOrders = (savedOrdersStr && savedOrdersStr !== 'undefined') ? JSON.parse(savedOrdersStr) : [];
      
      return loadedTrackers.map(t => {
        const matched = currentOrders.find(o => o.id === t.orderId);
        if (matched && (matched.deliveryStatus === 'Delivered' || matched.deliveryStatus === 'Cancelled') && t.statusIndex < 5) {
          return { ...t, statusIndex: 5, progress: 100, eta: 'Delivered', location: 'Delivered' };
        }
        return t;
      });
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
    localStorage.setItem('tiffin_connect_sellers', JSON.stringify(sellers));
  }, [sellers]);

  // Reset stock at 12:00 AM daily
  const checkMidnightReset = () => {
    const todayStr = new Date().toDateString();
    const lastReset = localStorage.getItem('last_stock_reset');
    
    if (lastReset !== todayStr) {
      setSellers(INITIAL_SELLERS);
      localStorage.setItem('tiffin_connect_sellers', JSON.stringify(INITIAL_SELLERS));
      localStorage.setItem('last_stock_reset', todayStr);
    }
  };

  useEffect(() => {
    checkMidnightReset();
    const interval = setInterval(checkMidnightReset, 30000); // Check every 30s for date boundary crossings
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      try {
        if (e.key === 'tiffin_connect_orders') {
          const saved = localStorage.getItem('tiffin_connect_orders');
          if (saved && saved !== 'undefined') {
            const parsedOrders = JSON.parse(saved);
            setOrders(parsedOrders);
            // Auto-advance trackers of delivered/cancelled orders to index 5 (Delivered)
            setActiveTrackers(prev => {
              let updated = false;
              const nextTrackers = prev.map(t => {
                const matchedOrder = parsedOrders.find(o => o.id === t.orderId);
                if (matchedOrder && (matchedOrder.deliveryStatus === 'Delivered' || matchedOrder.deliveryStatus === 'Cancelled') && t.statusIndex < 5) {
                  updated = true;
                  return { ...t, statusIndex: 5, progress: 100, eta: 'Delivered', location: 'Delivered' };
                }
                return t;
              });
              return updated ? nextTrackers : prev;
            });
          }
        }
        if (e.key === 'tiffin_connect_trackers') {
          const saved = localStorage.getItem('tiffin_connect_trackers');
          if (saved && saved !== 'undefined') {
            const parsed = JSON.parse(saved);
            setActiveTrackers(parsed);
            // Also sync activeOrderTracker status
            setActiveOrderTracker(prev => {
              if (!prev) return null;
              const matched = parsed.find(t => t.orderId === prev.orderId);
              return matched || prev;
            });
          }
        }
        if (e.key === 'tiffin_connect_ratings') {
          const saved = localStorage.getItem('tiffin_connect_ratings');
          if (saved && saved !== 'undefined') setRatings(JSON.parse(saved));
        }
        if (e.key === 'tiffin_connect_sellers') {
          const saved = localStorage.getItem('tiffin_connect_sellers');
          if (saved && saved !== 'undefined') setSellers(JSON.parse(saved));
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
    setUser(prev => {
      const nextUser = { ...prev, ...updatedFields };
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          u.full_name = nextUser.name;
          u.phone = nextUser.phone;
          localStorage.setItem("user", JSON.stringify(u));
        } catch (e) {
          console.error("Error syncing user profile to localStorage:", e);
        }
      }
      return nextUser;
    });
  };

  // Cart operations
  const addToCart = (meal, sellerId) => {
    if (cart.length > 0 && cart[0].sellerId !== sellerId) {
      return false;
    }
    const seller = sellers.find(s => s.id === sellerId);
    const contextMeal = seller ? seller.meals.find(m => m.id === meal.id) : null;
    const stockLimit = contextMeal ? (contextMeal.availableQty ?? 999) : 999;

    let addedSuccessfully = true;

    setCart(prev => {
      const existing = prev.find(item => item.id === meal.id);
      if (existing) {
        if (existing.quantity >= stockLimit) {
          addedSuccessfully = false;
          return prev;
        }
        return prev.map(item => 
          item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (stockLimit <= 0) {
        addedSuccessfully = false;
        return prev;
      }
      return [...prev, { ...meal, quantity: 1, sellerId }];
    });
    return addedSuccessfully;
  };

  const updateCartQuantity = (mealId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === mealId) {
          const nextQty = item.quantity + delta;
          if (delta > 0) {
            const seller = sellers.find(s => s.id === item.sellerId);
            const contextMeal = seller ? seller.meals.find(m => m.id === mealId) : null;
            const stockLimit = contextMeal ? (contextMeal.availableQty ?? 999) : 999;
            if (nextQty > stockLimit) {
              return item; // Cap quantity at stock limit
            }
          }
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
        photo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a1a1aa'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>"
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

    // Reduce stock quantities in sellers list based on cart items purchased
    setSellers(prevSellers => prevSellers.map(s => {
      const sellerCartItems = cart.filter(item => item.sellerId === s.id);
      if (sellerCartItems.length > 0) {
        return {
          ...s,
          meals: (s.meals || []).map(m => {
            const matchingCartItem = sellerCartItems.find(item => item.id === m.id);
            if (matchingCartItem) {
              const currentStock = m.availableQty || 0;
              const nextStock = Math.max(0, currentStock - matchingCartItem.quantity);
              return { ...m, availableQty: nextStock };
            }
            return m;
          })
        };
      }
      return s;
    }));

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
      setUser,
      sellers,
      setSellers,
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
