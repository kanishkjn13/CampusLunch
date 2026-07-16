import React, { createContext, useState, useEffect } from 'react';
import { 
  INITIAL_SELLERS, 
  INITIAL_COUPONS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_USER_PROFILE 
} from '../data/studentMockData';

export const StudentContext = createContext();
import { getOrders, placeOrderApi, getTrackers, getRatings } from '../Services/studentService';
import { getUserProfile, updateUserProfileApi } from '../Services/authService';

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
          const activeEmail = loggedInUser.email || INITIAL_USER_PROFILE.email;
          return {
            ...INITIAL_USER_PROFILE,
            name: loggedInUser.full_name || loggedInUser.name || INITIAL_USER_PROFILE.name,
            phone: loggedInUser.phone || INITIAL_USER_PROFILE.phone,
            email: activeEmail,
            avatar: loggedInUser.avatar || localStorage.getItem(`student_avatar_${activeEmail}`) || INITIAL_USER_PROFILE.avatar,
            sync_orders_trigger: loggedInUser.sync_orders_trigger || localStorage.getItem('sync_orders_trigger') || '',
            sync_trackers_trigger: loggedInUser.sync_trackers_trigger || localStorage.getItem('sync_trackers_trigger') || '',
            sync_ratings_trigger: loggedInUser.sync_ratings_trigger || localStorage.getItem('sync_ratings_trigger') || '',
            tiffin_connect_sellers: loggedInUser.tiffin_connect_sellers || localStorage.getItem('tiffin_connect_sellers') || '',
            last_stock_reset: loggedInUser.last_stock_reset || localStorage.getItem('last_stock_reset') || '',
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
      avatar: localStorage.getItem(`student_avatar_${activeEmail}`) || INITIAL_USER_PROFILE.avatar,
      sync_orders_trigger: localStorage.getItem('sync_orders_trigger') || '',
      sync_trackers_trigger: localStorage.getItem('sync_trackers_trigger') || '',
      sync_ratings_trigger: localStorage.getItem('sync_ratings_trigger') || '',
      tiffin_connect_sellers: localStorage.getItem('tiffin_connect_sellers') || '',
      last_stock_reset: localStorage.getItem('last_stock_reset') || '',
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
  
  const [orders, setOrders] = useState([]);

  // Live order active tracker status
  const [activeOrderTracker, setActiveOrderTracker] = useState(null);
  const [activeTrackers, setActiveTrackers] = useState([]);

  // Ratings State
  const [ratings, setRatings] = useState([]);

  const [kitchenStatuses, setKitchenStatuses] = useState(() => {
    const statuses = {};
    INITIAL_SELLERS.forEach(s => {
      statuses[s.name] = localStorage.getItem('kitchen_status_' + s.name) !== 'closed';
    });
    return statuses;
  });

  const addNotification = (title, message, type = 'info') => {
    setNotifications(prev => [
      {
        id: Date.now() + Math.random(),
        title,
        message,
        time: 'Just now',
        unread: true,
        type
      },
      ...(prev || [])
    ]);
  };

  useEffect(() => {
    const loadBackendData = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      try {
        const [profileData, ordersData, trackersData, ratingsData] = await Promise.all([
          getUserProfile(),
          getOrders(),
          getTrackers(),
          getRatings(),
        ]);

        setUser(prev => {
          const nextUser = {
            ...prev,
            name: profileData.full_name || prev.name,
            phone: profileData.phone || prev.phone,
            email: profileData.email || prev.email,
            avatar: profileData.avatar || prev.avatar,
            sync_orders_trigger: profileData.sync_orders_trigger || prev.sync_orders_trigger,
            sync_trackers_trigger: profileData.sync_trackers_trigger || prev.sync_trackers_trigger,
            sync_ratings_trigger: profileData.sync_ratings_trigger || prev.sync_ratings_trigger,
            tiffin_connect_sellers: profileData.tiffin_connect_sellers || prev.tiffin_connect_sellers,
            last_stock_reset: profileData.last_stock_reset || prev.last_stock_reset,
          };

          // Sync database profile data to local storage
          localStorage.setItem('name', nextUser.name);
          localStorage.setItem('phone', nextUser.phone);
          localStorage.setItem('email', nextUser.email);
          if (nextUser.avatar) {
            localStorage.setItem(`student_avatar_${nextUser.email}`, nextUser.avatar);
          }
          if (nextUser.sync_orders_trigger) {
            localStorage.setItem('sync_orders_trigger', nextUser.sync_orders_trigger);
          }
          if (nextUser.sync_trackers_trigger) {
            localStorage.setItem('sync_trackers_trigger', nextUser.sync_trackers_trigger);
          }
          if (nextUser.sync_ratings_trigger) {
            localStorage.setItem('sync_ratings_trigger', nextUser.sync_ratings_trigger);
          }
          if (nextUser.tiffin_connect_sellers) {
            localStorage.setItem('tiffin_connect_sellers', nextUser.tiffin_connect_sellers);
          }
          if (nextUser.last_stock_reset) {
            localStorage.setItem('last_stock_reset', nextUser.last_stock_reset);
          }

          // Update cached sellers state if returned from database
          if (profileData.tiffin_connect_sellers) {
            try {
              setSellers(JSON.parse(profileData.tiffin_connect_sellers));
            } catch (e) {
              console.error("Failed to parse sellers from database profileData:", e);
            }
          }

          return nextUser;
        });

        setOrders(ordersData);
        setActiveTrackers(trackersData);
        setRatings(ratingsData);
      } catch (err) {
        console.error("Failed to load initial data from remote database:", err);
      }
    };
    loadBackendData();
  }, [user.email]);

  useEffect(() => {
    if (orders.length > 0) {
      const val = Date.now().toString();
      const prevVal = localStorage.getItem('sync_orders_trigger');
      if (val !== prevVal) {
        localStorage.setItem('sync_orders_trigger', val);
        updateUserProfileApi({ sync_orders_trigger: val }).catch(err => 
          console.error("Failed to sync sync_orders_trigger to remote DB:", err)
        );
      }
    }
  }, [orders]);

  useEffect(() => {
    if (activeTrackers.length > 0) {
      const val = Date.now().toString();
      const prevVal = localStorage.getItem('sync_trackers_trigger');
      if (val !== prevVal) {
        localStorage.setItem('sync_trackers_trigger', val);
        updateUserProfileApi({ sync_trackers_trigger: val }).catch(err => 
          console.error("Failed to sync sync_trackers_trigger to remote DB:", err)
        );
      }
    }
  }, [activeTrackers]);

  useEffect(() => {
    if (ratings.length > 0) {
      const val = Date.now().toString();
      const prevVal = localStorage.getItem('sync_ratings_trigger');
      if (val !== prevVal) {
        localStorage.setItem('sync_ratings_trigger', val);
        updateUserProfileApi({ sync_ratings_trigger: val }).catch(err => 
          console.error("Failed to sync sync_ratings_trigger to remote DB:", err)
        );
      }
    }
  }, [ratings]);

  // Reset stock at 12:00 AM daily
  const checkMidnightReset = () => {
    const todayStr = new Date().toDateString();
    const lastReset = localStorage.getItem('last_stock_reset');
    
    if (lastReset !== todayStr) {
      setSellers(INITIAL_SELLERS);
      const sellersStr = JSON.stringify(INITIAL_SELLERS);
      localStorage.setItem('tiffin_connect_sellers', sellersStr);
      localStorage.setItem('last_stock_reset', todayStr);
      
      // Update database!
      updateUserProfileApi({
        tiffin_connect_sellers: sellersStr,
        last_stock_reset: todayStr
      }).catch(err => 
        console.error("Failed to sync midnight reset to remote DB:", err)
      );
    }
  };

  useEffect(() => {
    checkMidnightReset();
    const interval = setInterval(checkMidnightReset, 30000); // Check every 30s for date boundary crossings
    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    const handleStorageChange = async (e) => {
      try {
        if (e.key === 'sync_orders_trigger') {
          const ordersData = await getOrders();
          setOrders(prevOrders => {
            ordersData.forEach(newOrd => {
              const oldOrd = prevOrders.find(o => o.order_id === newOrd.order_id || o.id === newOrd.id);
              if (oldOrd && oldOrd.deliveryStatus !== newOrd.deliveryStatus) {
                addNotification(
                  `Order ${newOrd.deliveryStatus}`,
                  `Order ${newOrd.order_id || newOrd.id} from ${newOrd.vendor} is now ${newOrd.deliveryStatus}!`,
                  newOrd.deliveryStatus === 'Delivered' ? 'success' : 'info'
                );
              }
            });
            return ordersData;
          });
        }
        if (e.key === 'sync_trackers_trigger') {
          const trackersData = await getTrackers();
          setActiveTrackers(trackersData);
          setActiveOrderTracker(prev => {
            if (!prev) return null;
            const matched = trackersData.find(t => t.orderId === prev.orderId);
            return matched || prev;
          });
        }
        if (e.key === 'sync_ratings_trigger') {
          const ratingsData = await getRatings();
          setRatings(ratingsData);
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
        console.error("Error handling storage trigger refresh:", err);
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
        photo: "/images/default-avatar.jpg"
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

    const newOrders = [];
    const orderIds = [];
    const vendorNames = [];
    const newTrackers = [];

    try {
      for (const item of cart) {
        const seller = sellers.find(s => s.id === item.sellerId);
        
        for (let q = 0; q < item.quantity; q++) {
          const totalItemsInCart = cart.reduce((sum, i) => sum + i.quantity, 0);
          const itemsTotal = item.price;
          const platformFee = Math.round(5 / totalItemsInCart);
          const gst = Math.round(itemsTotal * 0.05);
          const deliveryFee = Math.round(20 / totalItemsInCart);
          const discount = activeCoupon 
            ? (activeCoupon.discountType === 'percentage' ? Math.round(itemsTotal * (activeCoupon.value / 100)) : Math.round(activeCoupon.value / totalItemsInCart))
            : 0;
          const finalAmount = itemsTotal + platformFee + gst + deliveryFee - discount;

          const payload = {
            vendor_id: item.sellerId,
            items: `1x ${item.name}`,
            bill: finalAmount,
            paymentMethod: paymentMethod,
            paymentStatus: 'Paid',
            deliveryStatus: 'Confirmed'
          };

          const createdOrder = await placeOrderApi(payload);

          newOrders.push(createdOrder);
          orderIds.push(createdOrder.order_id);
          vendorNames.push(createdOrder.vendor);
          
          if (createdOrder.tracker) {
            newTrackers.push(createdOrder.tracker);
          }
        }
      }

      setOrders(prev => [...newOrders, ...prev]);
      setActiveTrackers(prev => [...newTrackers, ...prev]);

      addNotification(
        'Order Confirmed',
        `Your order of ${newOrders.map(o => o.items).join(', ')} has been successfully placed!`,
        'success'
      );

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

      clearCart();
    } catch (err) {
      console.error("Failed to place order in remote database:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
    
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
      addNotification,
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
