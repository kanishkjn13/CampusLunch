import idliVadaImage from '@/assets/images/idli_vada_combo.png';

export const INITIAL_SELLERS = [
  {
    id: 'sharma',
    name: 'Sharma Tiffin Center',
    photo: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80',
    rating: '0.0',
    reviews: 0,
    distance: '0.6km',
    servingTime: '11:30 AM - 3:00 PM',
    vendorLocation: 'Main Campus Cafeteria, Block D',
    type: ['Veg'],
    meals: [
      {
        id: 's1',
        name: 'Deluxe Lunch Thali',
        price: 170,
        type: 'Veg',
        description: 'Paneer, Mixed Veg Sabzi, Dal, 4 Rotis, Rice, Salad and Dessert.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&h=200&fit=crop&q=80',
        rating: 4.7,
        prepTime: '15 mins',
        availableQty: 20,
        ingredients: 'Paneer, Mixed Veg, Lentils, Wheat Flour, Basmati Rice.',
        nutritionalInfo: { Calories: '720 kcal', Protein: '24g', Carbs: '90g', Fat: '26g' }
      },
      {
        id: 's2',
        name: 'Keto Bowl',
        price: 185,
        type: 'Veg',
        description: 'Healthy mix of grilled paneer, sauteed broccoli, bell peppers, spinach, and roasted seeds.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop&q=80',
        rating: 4.8,
        prepTime: '10 mins',
        availableQty: 15,
        ingredients: 'Paneer, Broccoli, Bell Peppers, Spinach, Olive Oil, Roasted Seeds.',
        nutritionalInfo: { Calories: '450 kcal', Protein: '18g', Carbs: '15g', Fat: '30g' }
      }
    ]
  },
  {
    id: 'maas',
    name: "Maa's Kitchen",
    photo: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80',
    rating: '0.0',
    reviews: 0,
    distance: '0.5km',
    servingTime: '12:00 PM - 2:30 PM',
    vendorLocation: 'Near Girls Hostel, Sector 2',
    type: ['Veg', 'Jain'],
    meals: [
      {
        id: 'm1',
        name: 'Deluxe Veg Thali',
        price: 120,
        type: 'Veg',
        description: 'A wholesome meal containing Paneer Butter Masala, Dal Fry, Jeera Rice, 4 Butter Rotis, Salad, and a Gulab Jamun.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&h=200&fit=crop&q=80',
        rating: 4.8,
        prepTime: '20 mins',
        availableQty: 15,
        ingredients: 'Paneer, Wheat Flour, Basmati Rice, Lentils, Dairy Cream, Spices, Ghee.',
        nutritionalInfo: { Calories: '650 kcal', Protein: '22g', Carbs: '85g', Fat: '24g' }
      },
      {
        id: 'm2',
        name: 'Rajasthani Premium Thali',
        price: 160,
        type: 'Veg',
        description: 'Authentic Rajasthani taste with Dal-Baati-Churma, Gatte ki Sabzi, Panchmel Dal, Khichdi, and Buttermilk.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop&q=80',
        rating: 4.9,
        prepTime: '25 mins',
        availableQty: 10,
        ingredients: 'Wheat Flour, Ghee, Jaggery, Besan, Yogurt, Mixed Lentils, Spices.',
        nutritionalInfo: { Calories: '850 kcal', Protein: '26g', Carbs: '110g', Fat: '34g' }
      },
      {
        id: 'm4',
        name: 'Jain Special Thali',
        price: 110,
        type: 'Jain',
        description: 'Authentic Jain meal prepared strictly without onion, garlic, or root vegetables. Includes Paneer, Dal, Rice, and 4 Rotis.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop&q=80',
        rating: 4.7,
        prepTime: '20 mins',
        availableQty: 12,
        ingredients: 'Paneer, Wheat Flour, Basmati Rice, Moong Dal, Spices, Ghee.',
        nutritionalInfo: { Calories: '600 kcal', Protein: '20g', Carbs: '80g', Fat: '22g' }
      },
      {
        id: 'm3',
        name: 'Mini Diet Thali',
        price: 95,
        type: 'Veg',
        description: 'Healthy low-oil option containing Boiled Lentils, Dry Mixed Veg, 3 Whole Wheat Chapatis, Brown Rice, and Curd.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&h=200&fit=crop&q=80',
        rating: 4.6,
        prepTime: '15 mins',
        availableQty: 25,
        ingredients: 'Whole Wheat, Brown Rice, Yellow Lentils, Broccoli, Carrot, Curd, Olive Oil.',
        nutritionalInfo: { Calories: '420 kcal', Protein: '16g', Carbs: '65g', Fat: '8g' }
      }
    ]
  },
  {
    id: 'dakshin',
    name: 'Dakshin Delights',
    photo: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80',
    rating: '0.0',
    reviews: 0,
    distance: '0.4km',
    servingTime: '8:00 AM - 9:30 PM',
    vendorLocation: 'North Campus Food Court',
    type: ['Veg'],
    meals: [
      {
        id: 'd1',
        name: 'Butter Masala Dosa',
        price: 120,
        type: 'Veg',
        description: 'Crispy rice crepe spread with pure butter, stuffed with spiced potato mash. Served with Sambhar and Coconut Chutney.',
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&h=200&fit=crop&q=80',
        rating: 4.9,
        prepTime: '10 mins',
        availableQty: 30,
        ingredients: 'Rice, Urad Dal, Potato, Butter, Mustard Seeds, Curry Leaves, Coconut.',
        nutritionalInfo: { Calories: '380 kcal', Protein: '8g', Carbs: '55g', Fat: '15g' }
      },
      {
        id: 'd2',
        name: 'Idli Vada Combo',
        price: 80,
        type: 'Jain',
        description: '2 soft steamed rice cakes (Idlis) and 1 crispy fried lentil donut (Vada). Prepared strictly Jain-compliant, served with Sambhar and Chutney.',
        image: idliVadaImage,
        rating: 4.7,
        prepTime: '8 mins',
        availableQty: 40,
        ingredients: 'Steamed Rice Batter, Lentils, Ginger, Green Chillies, Curry Leaves.',
        nutritionalInfo: { Calories: '290 kcal', Protein: '9g', Carbs: '48g', Fat: '6g' }
      },
      {
        id: 'd3',
        name: 'Onion Uttapam',
        price: 100,
        type: 'Veg',
        description: 'Thick savory pancake topped with finely chopped onions, green chillies, coriander, and gun powder spice blend.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&h=200&fit=crop&q=80',
        rating: 4.5,
        prepTime: '12 mins',
        availableQty: 20,
        ingredients: 'Fermented Rice Batter, Red Onions, Fresh Coriander, Gunpowder (Podhi) spice.',
        nutritionalInfo: { Calories: '340 kcal', Protein: '7g', Carbs: '52g', Fat: '11g' }
      }
    ]
  },
  {
    id: 'punjabi',
    name: 'Punjabi Zaika',
    photo: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80',
    rating: '0.0',
    reviews: 0,
    distance: '0.8km',
    servingTime: '1:00 PM - 10:00 PM',
    vendorLocation: 'Subhash Chowk Corridor',
    type: ['Veg', 'Non-Veg'],
    meals: [
      {
        id: 'p1',
        name: 'Butter Chicken Meal',
        price: 150,
        type: 'Non-Veg',
        description: 'Tender chicken tikka cooked in rich tomato, butter, and cashew gravy. Served with 2 Butter Naans and Pulao Rice.',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop&q=80',
        rating: 4.8,
        prepTime: '22 mins',
        availableQty: 12,
        ingredients: 'Chicken Boneless, Tomato Puree, Butter, Cashew Paste, Naan Dough, Basmati Rice.',
        nutritionalInfo: { Calories: '790 kcal', Protein: '38g', Carbs: '75g', Fat: '32g' }
      },
      {
        id: 'p2',
        name: 'Paneer Makhani Meal',
        price: 130,
        type: 'Veg',
        description: 'Soft cottage cheese cubes in sweet and tangy makhani gravy. Served with 2 garlic naans and Jeera Rice.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop&q=80',
        rating: 4.6,
        prepTime: '18 mins',
        availableQty: 18,
        ingredients: 'Paneer Cubes, Rich Tomato Gravy, Ghee, Naan Flour, Basmati Rice.',
        nutritionalInfo: { Calories: '690 kcal', Protein: '20g', Carbs: '78g', Fat: '28g' }
      },
      {
        id: 'p3',
        name: 'Chicken Biryani Pack',
        price: 140,
        type: 'Non-Veg',
        description: 'Fragrant long grain rice layered with marinated chicken, saffron, fried onions, and mint. Served with raita.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&h=200&fit=crop&q=80',
        rating: 4.7,
        prepTime: '20 mins',
        availableQty: 15,
        ingredients: 'Chicken with bone, Basmati Rice, Yogurt, Saffron, Rose Water, Mint, Spices.',
        nutritionalInfo: { Calories: '710 kcal', Protein: '32g', Carbs: '82g', Fat: '21g' }
      }
    ]
  }
];

export const INITIAL_COUPONS = [
  { code: 'CAMPUS50', discountType: 'percentage', value: 50, desc: '50% off on your entire cart' },
  { code: 'WELCOME10', discountType: 'flat', value: 10, desc: 'Flat ₹10 discount' }
];

export const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'order', title: 'Order Confirmed!', message: 'Token #882 has been accepted by Dakshin Delights.', time: '10 mins ago', unread: true },
  { id: 2, type: 'payment', title: 'Payment Successful', message: '₹420 added successfully. Transaction ID: UPI982314.', time: '2 hours ago', unread: false },
  { id: 3, type: 'offer', title: 'Special Promo Inside!', message: 'Use coupon CAMPUS50 for a flat 50% discount today.', time: '5 hours ago', unread: true }
];

export const INITIAL_USER_PROFILE = {
  name: 'Alex Johnson',
  email: 'alex.johnson@campus.edu',
  phone: '9876543210',
  hostel: 'Himalaya Hostel',
  roomNumber: 'Room 402',
  avatar: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a1a1aa'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>",
  emergencyContact: '9999911111',
  language: 'English',
  darkMode: false,
  emailNotification: true,
  pushNotification: true
};
