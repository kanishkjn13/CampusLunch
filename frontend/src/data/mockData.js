// Dummy Data for MVP

export const VENDORS = [
  {
    id: 'v1',
    name: 'Sharma Tiffin Center',
    photo: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
    foodImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    type: ['Veg', 'Jain'],
    rating: 4.8,
    reviews: 124,
    status: 'Available',
    price: 60,
    pickupLocation: 'Boys Hostel',
    vendorLocation: 'Rau Market',
    servingTime: '12:30 PM - 2:00 PM',
    subscriptionAvailable: true,
    monthlyPrice: 1500,
  },
  {
    id: 'v2',
    name: 'Maa Ki Rasoi',
    photo: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80',
    foodImage: 'https://images.unsplash.com/photo-1626776876729-ab5d99292520?w=400&q=80',
    type: ['Veg'],
    rating: 4.5,
    reviews: 89,
    status: 'Available',
    price: 50,
    pickupLocation: 'Girls Hostel',
    vendorLocation: 'Silicon City',
    servingTime: '1:00 PM - 2:30 PM',
    subscriptionAvailable: true,
    monthlyPrice: 1300,
  },
  {
    id: 'v3',
    name: 'Bhaiya Ji Tiffin',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    foodImage: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80',
    type: ['Veg', 'Non-Veg'],
    rating: 4.2,
    reviews: 210,
    status: 'Closed',
    price: 80,
    pickupLocation: 'Academic Block',
    vendorLocation: 'AB Road',
    servingTime: '12:00 PM - 1:30 PM',
    subscriptionAvailable: false,
    monthlyPrice: 2000,
  },
  {
    id: 'v4',
    name: 'Green Leaf Vegan',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    foodImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    type: ['Vegan', 'Veg'],
    rating: 4.9,
    reviews: 56,
    status: 'Available',
    price: 90,
    pickupLocation: 'Library Area',
    vendorLocation: 'Bhavarkuan',
    servingTime: '1:00 PM - 3:00 PM',
    subscriptionAvailable: true,
    monthlyPrice: 2200,
  }
];

export const MENU_ITEMS = {
  v1: [
    { id: 'm1', name: 'Deluxe Thali', description: 'Paneer, Dal Makhani, 4 Roti, Rice, Sweet', price: 80, isAvailable: true, type: 'Veg' },
    { id: 'm2', name: 'Regular Thali', description: 'Seasonal Veg, Dal, 4 Roti, Rice', price: 60, isAvailable: true, type: 'Veg' },
    { id: 'm3', name: 'Jain Thali', description: 'No Onion No Garlic - Sabzi, Dal, 4 Roti, Rice', price: 70, isAvailable: true, type: 'Jain' }
  ],
  v2: [
    { id: 'm4', name: 'Ghar Ki Thali', description: 'Aloo Gobi, Yellow Dal, 4 Roti, Rice, Salad', price: 50, isAvailable: true, type: 'Veg' }
  ],
  v3: [
    { id: 'm5', name: 'Chicken Thali', description: 'Chicken Curry, 4 Roti, Rice, Salad', price: 100, isAvailable: true, type: 'Non-Veg' },
    { id: 'm6', name: 'Egg Thali', description: 'Egg Curry, 4 Roti, Rice, Salad', price: 80, isAvailable: false, type: 'Non-Veg' }
  ]
};

export const ORDERS = [
  { id: 'ORD-1029', vendorName: 'Sharma Tiffin Center', date: '2026-06-10', amount: 60, status: 'Completed', token: 'T-8921' },
  { id: 'ORD-1028', vendorName: 'Maa Ki Rasoi', date: '2026-06-09', amount: 50, status: 'Completed', token: 'T-7742' },
  { id: 'ORD-1027', vendorName: 'Bhaiya Ji Tiffin', date: '2026-06-08', amount: 80, status: 'Cancelled', token: 'T-1198' }
];

export const ADMIN_STATS = {
  totalUsers: 1240,
  totalVendors: 45,
  totalOrders: 8900,
  totalRevenue: 540000,
  activeSubscriptions: 320
};

export const CHART_DATA = [
  { name: 'Jan', revenue: 40000, orders: 800 },
  { name: 'Feb', revenue: 45000, orders: 900 },
  { name: 'Mar', revenue: 55000, orders: 1100 },
  { name: 'Apr', revenue: 50000, orders: 1000 },
  { name: 'May', revenue: 65000, orders: 1300 },
  { name: 'Jun', revenue: 70000, orders: 1500 },
];
