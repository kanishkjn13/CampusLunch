export const INITIAL_SELLERS = [];

export const INITIAL_COUPONS = [
  { code: 'CAMPUS50', discountType: 'percentage', value: 50, desc: '50% off on your entire cart' },
  { code: 'WELCOME10', discountType: 'flat', value: 10, desc: 'Flat ₹10 discount' }
];

export const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'order', title: 'Welcome to TiffinHub!', message: 'Explore verified local tiffin kitchens and subscribe to meal plans.', time: 'Just now', unread: true }
];

export const INITIAL_USER_PROFILE = {
  name: 'Guest User',
  email: '',
  phone: '',
  hostel: '',
  roomNumber: '',
  avatar: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a1a1aa'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>",
  emergencyContact: '',
  language: 'English',
  darkMode: false,
  emailNotification: true,
  pushNotification: true
};
