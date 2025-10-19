# Restaurant Management & Ordering System

A comprehensive, cross-platform restaurant management and ordering system built with React, React Native, Node.js/Express, and Firebase.

## 🏗️ Project Structure

```
.
├── backend/              # Express.js backend server
├── web/                  # React web application
├── mobile/               # React Native mobile app (Expo)
├── firebase/             # Firebase configuration and rules
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Firebase project
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd restaurant-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your Firebase credentials
npm install
npm run dev
```

4. **Setup Web Frontend**
```bash
cd web
cp .env.example .env.local
# Edit .env.local with your Firebase config
npm install
npm run dev
```

5. **Setup Mobile Frontend**
```bash
cd mobile
cp .env.example .env
# Edit .env with your Firebase config
npm install
npm start
```

## 📋 Features

### Core Functionality
- ✅ Multi-organization support with data isolation
- ✅ Role-based access control (RBAC)
- ✅ Real-time order management
- ✅ Kitchen screen with category routing
- ✅ Shift scheduling and management
- ✅ Email notifications
- ✅ Analytics and reporting

### Roles
- **Manager**: Full system access, employee management, menu configuration
- **Front Staff**: Order creation, table management, limited discounts
- **Kitchen Staff**: Order preparation, category-specific screens
- **Expo Staff**: Order finalization and pickup management

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Create a service account and download JSON key
5. Update `.env` files with your credentials

### Environment Variables

**Backend (.env)**
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
PORT=3000
JWT_SECRET=your-jwt-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Web (.env.local)**
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_API_URL=http://localhost:3000/api
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new organization and user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get orders
- `GET /api/orders/:orderId` - Get single order
- `PATCH /api/orders/:orderId` - Update order status

### Menus
- `POST /api/menus` - Create menu item
- `GET /api/menus` - Get menu items
- `PATCH /api/menus/:itemId` - Update menu item
- `DELETE /api/menus/:itemId` - Delete menu item

### Tables
- `POST /api/tables` - Create table
- `GET /api/tables` - Get tables
- `PATCH /api/tables/:tableId` - Update table

### Employees
- `POST /api/employees/invite` - Invite employee
- `POST /api/employees/accept-invite` - Accept invitation
- `GET /api/employees` - Get employees
- `PATCH /api/employees/:employeeId` - Update employee

### Schedules
- `POST /api/schedules/shifts` - Create shift
- `GET /api/schedules` - Get shifts
- `GET /api/schedules/employee/:employeeId` - Get employee shifts
- `POST /api/schedules/:shiftId/trade` - Request shift trade
- `PATCH /api/schedules/:tradeId/approve` - Approve/deny trade

### Analytics
- `GET /api/analytics/orders` - Order statistics
- `GET /api/analytics/prep-times` - Prep time analytics
- `GET /api/analytics/employees` - Employee statistics

## 🔐 Security

- Firestore security rules enforce org-level data isolation
- JWT middleware validates all API requests
- Role-based access control at API and database levels
- Rate limiting on all endpoints
- Environment variables for sensitive data

## 📱 Screens

### Web Application
- Login/Signup
- Dashboard
- POS (Point of Sale)
- Kitchen View
- Expo Screen
- Schedule Management
- Admin Settings

### Mobile Application
- Login/Signup
- Dashboard
- POS Ordering
- Schedule Management

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Web tests
cd web
npm test

# Mobile tests
cd mobile
npm test
```

## 📦 Deployment

### Backend (Render/AWS)
```bash
cd backend
npm run build
# Deploy to Render or AWS
```

### Web (Vercel)
```bash
cd web
npm run build
# Deploy to Vercel
```

### Mobile (Expo)
```bash
cd mobile
npm run build
# Deploy to Expo
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📄 License

MIT License

## 📞 Support

For issues and questions, please open an issue on GitHub.

