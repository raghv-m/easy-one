# Quick Reference Guide

## 🚀 Start Development in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Add your Firebase credentials to .env
npm run dev
```

### 3. Setup Web
```bash
cd web
cp .env.example .env.local
# Add your Firebase config to .env.local
npm run dev
```

### 4. Access Application
- Web: http://localhost:5173
- Backend: http://localhost:3000

## 📁 File Structure Quick Guide

```
backend/src/
├── config/firebase.js          # Firebase setup
├── middleware/auth.js          # Authentication
├── middleware/errorHandler.js  # Error handling
├── routes/
│   ├── auth.js                # Login/signup
│   ├── orders.js              # Order management
│   ├── menus.js               # Menu items
│   ├── tables.js              # Table management
│   ├── employees.js           # Employee management
│   ├── schedules.js           # Shift management
│   └── analytics.js           # Analytics
└── services/emailService.js   # Email notifications

web/src/
├── config/firebase.js         # Firebase setup
├── store/authStore.js         # Auth state
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── Dashboard.jsx
│   ├── POSPage.jsx
│   ├── KitchenPage.jsx
│   ├── ExpoPage.jsx
│   ├── SchedulePage.jsx
│   └── AdminPage.jsx
└── components/ProtectedRoute.jsx
```

## 🔑 Key Credentials to Setup

### Firebase
- [ ] Project ID
- [ ] Private Key
- [ ] Client Email
- [ ] API Key
- [ ] Auth Domain

### Email (SMTP)
- [ ] SMTP Host
- [ ] SMTP Port
- [ ] SMTP User
- [ ] SMTP Password

### JWT
- [ ] JWT Secret (random string)

## 🧪 Testing Endpoints

### Create Organization & User
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@restaurant.com",
    "password": "password123",
    "name": "John Manager",
    "organizationName": "My Restaurant"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@restaurant.com",
    "password": "password123"
  }'
```

### Create Menu Item
```bash
curl -X POST http://localhost:3000/api/menus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Burger",
    "description": "Delicious burger",
    "price": 12.99,
    "category": "Grill"
  }'
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tableId": "1",
    "items": [
      {
        "name": "Burger",
        "price": 12.99,
        "category": "Grill",
        "quantity": 1
      }
    ]
  }'
```

## 🎯 User Roles & Permissions

| Feature | Manager | Front Staff | Kitchen Staff | Expo Staff |
|---------|---------|-------------|---------------|-----------|
| Create Orders | ✅ | ✅ | ❌ | ❌ |
| View Orders | ✅ | ✅ | ✅ | ✅ |
| Update Order Status | ✅ | ❌ | ✅ | ✅ |
| Manage Menu | ✅ | ❌ | ❌ | ❌ |
| Manage Tables | ✅ | ✅ | ❌ | ❌ |
| Manage Employees | ✅ | ❌ | ❌ | ❌ |
| Create Shifts | ✅ | ❌ | ❌ | ❌ |
| View Analytics | ✅ | ❌ | ❌ | ❌ |

## 🔗 API Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-backend.com/api`

## 📱 Screen Routes

### Web
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - Main dashboard
- `/pos` - POS ordering
- `/kitchen` - Kitchen view
- `/expo` - Expo/pickup
- `/schedule` - Schedule management
- `/admin` - Admin settings

## 🐛 Common Errors & Solutions

### "Firebase not initialized"
- Check .env file has correct credentials
- Verify Firebase project exists

### "Invalid token"
- Token may have expired
- Check JWT_SECRET matches

### "CORS error"
- Verify frontend URL in backend .env
- Check CORS configuration

### "Order not found"
- Verify orgId matches
- Check order exists in Firestore

## 📊 Database Collections

All collections are nested under `/organizations/{orgId}`:
- `employees` - Team members
- `orders` - Customer orders
- `menus` - Menu items
- `tables` - Restaurant tables
- `kitchenCategories` - Kitchen stations
- `kitchenScreens` - Active kitchen orders
- `shifts` - Employee shifts
- `shiftTrades` - Shift trade requests
- `invitations` - Employee invitations

## 🚀 Deployment Checklist

- [ ] Firebase project created
- [ ] Environment variables configured
- [ ] Backend deployed to Render
- [ ] Web deployed to Vercel
- [ ] Firestore rules deployed
- [ ] Email service configured
- [ ] Domain configured
- [ ] SSL certificate enabled
- [ ] Monitoring set up
- [ ] Backups configured

## 📞 Useful Commands

```bash
# Install all dependencies
npm install

# Start backend
cd backend && npm run dev

# Start web
cd web && npm run dev

# Start mobile
cd mobile && npm start

# Build for production
npm run build

# Run tests
npm test

# Deploy to Firebase
firebase deploy

# Deploy to Vercel
vercel

# Deploy to Render
git push origin main
```

## 🎓 Learning Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [React Docs](https://react.dev)
- [Express Docs](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)

## 💡 Pro Tips

1. Use Firebase Emulator for local development
2. Test with multiple roles to verify RBAC
3. Monitor Firestore usage to optimize queries
4. Use React DevTools for debugging
5. Keep environment variables secure
6. Test on mobile devices before deployment
7. Set up error tracking early
8. Document API changes

## 🆘 Need Help?

1. Check DEVELOPMENT.md for detailed guide
2. Review DEPLOYMENT.md for deployment help
3. Check IMPLEMENTATION_SUMMARY.md for overview
4. Review error logs in console
5. Check Firebase console for data issues

