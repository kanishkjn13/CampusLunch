# Campus Lunch Platform

Campus Lunch is a premium, modern campus-focused web application designed to connect college students with local home-chefs and tiffin vendors. It features a complete subscription model, live order tracking, a dedicated vendor management dashboard, an administrator resolution center, and a beautiful responsive user interface styled with premium design tokens.

---

## 🌟 Key Features

### 1. Student Portal
* **Meal Exploration**: Browse local home kitchens, view menus, active stocks, pricing, and ratings.
* **Subscription Management**: Flexible weekly or monthly plan subscriptions tailored to a student's schedule.
* **Active Order Carousel**: Sliding tracker indicating current status indices (Order Confirmed, Preparing Food, Packed, Picked Up, Out for Delivery, Delivered) and live ETAs.
* **Edit Profile**: Modify student personal profile settings, phone, email, and upload profile avatars.
* **Cart & Coupons**: Cart drawer supporting quantity controls, platform fee breakdowns, platform discounts, and promotional coupon applications.

### 2. Vendor Portal
* **Kitchen Status Toggle**: Open or close the kitchen in real-time, affecting user visibility on home feeds.
* **Meal & Menu Manager**: Create, edit, delete, or hide tiffin packages and track real-time available stock quantities.
* **Order Management**: Monitor pending, active, and completed orders, advance prep status indices, and verify customer tokens.
* **Earnings Analytics**: Dynamic revenue charts (using Recharts) to analyze sales trends and daily payouts.
* **Operating Hours**: Update operating timings, working days, and toggle automatic order acceptance rules.

### 3. Admin Portal
* **Operations Command**: View active and onboarded home kitchens, daily orders, and customer feedback.
* **Interactive Helpdesk**: Ticket manager linking student/vendor support queries with a mock bot resolution chat.
* **Platform Security**: Configure global campus building drop points and audit kitchen ratings.

### 4. Authentication & Security
* **JWT Authorization**: Custom role-based session logic separating students, vendors, and admins.
* **Signup Redirection**: Successful registrations redirect users straight to the login screen with success feedback (rather than auto-logging them in) to ensure secure manual credential verification.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 19, Vite 8, React Router DOM 7
* **Styling**: Tailwind CSS & Vanilla CSS (with premium design tokens)
* **Data Visualization**: Recharts (for vendor dashboard revenue charts)
* **Document Generation**: jsPDF (for generating order receipts)
* **HTTP Client**: Axios

### Backend
* **Core Framework**: Django 5.2 & Django REST Framework (DRF)
* **Authentication**: SimpleJWT (JSON Web Token Authentication)
* **Database**: MySQL (via MySQLclient)
* **Configuration**: Python Decouple (using `.env` file values)
* **Image Processing**: Pillow (for uploading vendor and student profile avatars)

---

## 📂 Project Directory Structure

```text
Tiffin Connect/
├── backend/                  # Django REST API Backend
│   ├── manage.py             # Django CLI Tool
│   ├── requirements.txt      # Python Dependencies
│   ├── config/               # Project Settings and URLs
│   │   ├── settings.py
│   │   └── urls.py
│   ├── accounts/             # User Auth Models & Serializers
│   ├── vendors/              # Vendor Kitchen Management
│   ├── students/             # Student Subscriptions & Orders
│   └── templates/            # HTML Email & Invoice Templates
│
└── frontend/                 # React & Vite Frontend
    ├── package.json          # Node Dependencies & Scripts
    ├── vite.config.js        # Vite Build Configuration
    ├── src/
    │   ├── main.jsx          # App Entrypoint
    │   ├── App.jsx           # Routing & Layout Setup
    │   ├── components/       # Common UI elements (Navbar, BottomNav, Button)
    │   ├── context/          # StudentContext (Cart, Orders, Subscriptions state)
    │   ├── data/             # Mock DB details (studentMockData.js)
    │   ├── styles/           # globals.css, variables.css, responsive.css
    │   └── pages/
    │       ├── auth/         # Login, Register, ForgotPassword
    │       ├── student/      # StudentDashboard
    │       ├── vendor/       # VendorDashboard
    │       ├── admin/        # AdminDashboard
    │       └── public/       # Landing, HelpFaq, SupportChat, TermsOfService, PrivacyPolicy
```

---

## 🚀 Setup & Installation

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **Python** (v3.10 or higher)
* **MySQL Database Server**

### Backend Setup
1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/config/` directory and configure the environment variables:
   ```env
   SECRET_KEY=your-django-secret-key
   DEBUG=True
   DB_NAME=tiffin_connect
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=127.0.0.1
   DB_PORT=3306
   ```
5. Apply database migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate into the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Vite development server locally:
   ```bash
   npm run dev
   ```
4. Build the assets for production deployment:
   ```bash
   npm run build
   ```

---

## 🎨 Premium Visual Aesthetics

The frontend uses custom CSS design tokens (`variables.css`) to enforce visual excellence across all views:
* **Deep Blue Brand Color** (`#0b1c30`) represents primary backgrounds and text structures.
* **Warm Golden Accents** (`#f59e0b` / `#855300`) reflect primary interactive components, timeline markers, and highlight headers.
* **Dark-Themed Footer**: Fully custom dark navy site footer (`#0b1c30` background) with high-contrast white text (`#ffffff`), translucent light dividers (`rgba(255, 255, 255, 0.08)`), and golden hover transitions.

---

## 📝 Recent Refactoring Details

1. **FSSAI License Field Removal**: All database model properties, serializers, validation checks, input controls, and text references regarding FSSAI registration numbers have been removed from frontend forms and backend endpoints.
2. **Diet Preference Option Removal**: Student personal diet preference attributes (Vegetarian, Jain, Non-Vegetarian) have been removed from user profiles and signup forms to keep registration clean. General meal tag filtering remains active on home feeds.
3. **Signup Redirect Workflow**: Updated signup validation callbacks to navigate users straight to `/login` upon success, showing a green alert block ("Registration successful! Please sign in with your credentials."). This prevents auto-logging in unregistered configurations.
4. **Text Colors in Footer**: Styled all labels, copyright notices, dividers, and social items inside the footers to compile cleanly with white foreground structures on the dark background.
