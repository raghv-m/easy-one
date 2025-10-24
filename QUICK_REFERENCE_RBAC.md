# 🚀 Quick Reference - RBAC Testing

## 📍 Organization ID
```
dinesy-1761288908792
```

---

## 🔑 Test Credentials (Copy & Paste)

### Admin
```
Email: admin@dinesy.test
Password: Admin@12345
```

### Manager
```
Email: manager@dinesy.test
Password: Manager@12345
```

### Supervisor
```
Email: supervisor@dinesy.test
Password: Supervisor@12345
```

### Kitchen Manager
```
Email: kitchenmgr@dinesy.test
Password: KitchenMgr@12345
```

### Cook 1 (Grill)
```
Email: cook1@dinesy.test
Password: Cook1@12345
```

### Cook 2 (Fryer)
```
Email: cook2@dinesy.test
Password: Cook2@12345
```

### Cook 3 (Sauté)
```
Email: cook3@dinesy.test
Password: Cook3@12345
```

### Server 1
```
Email: server1@dinesy.test
Password: Server1@12345
```

### Server 2
```
Email: server2@dinesy.test
Password: Server2@12345
```

---

## 🚀 Quick Start

### 1. Run Seed Script
```bash
cd backend
npm run seed
```

### 2. Start Backend
```bash
cd backend
npm start
```

### 3. Start Frontend
```bash
cd web
npm run dev
```

### 4. Open Browser
```
http://localhost:5173
```

---

## 🧪 Quick Tests

### Test 1: Manager Creates Shift
1. Login as Manager
2. Go to Shift Management
3. Create Shift
4. Select Cook 1
5. Set time: Tomorrow 6 AM - 2 PM
6. Click Create

### Test 2: Cook Views Orders
1. Login as Cook 1
2. Go to Kitchen Screen
3. Click Grill
4. See Grill orders only

### Test 3: Server Creates Order
1. Login as Server 1
2. Create Order
3. Select Table 1
4. Add: Grilled Chicken + French Fries
5. Submit

**Expected:**
- Grill sees Grilled Chicken
- Fryer sees French Fries

### Test 4: Supervisor Approves Trade
1. Login as Cook 1
2. Go to Schedule → Trade
3. Propose trade with Cook 2
4. Logout

**Then:**
1. Login as Supervisor
2. Go to Schedule → Requests
3. Click Approve
4. Done!

---

## 📊 Permissions Matrix

| Feature | Admin | Manager | Supervisor | Kitchen Mgr | Cook | Server |
|---------|-------|---------|-----------|------------|------|--------|
| Create Shift | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Schedule | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Approve Trade | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Order | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Kitchen | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Fire Item | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Manage Menu | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🎯 Key Features

### Schedules
- 14-day schedule created
- Morning: 6 AM - 2 PM
- Afternoon: 2 PM - 10 PM
- Sundays off

### Recipes (7 Total)
1. Grilled Chicken (Grill)
2. French Fries (Fryer)
3. Butter Chicken (Sauté)
4. Caesar Salad (Prep)
5. Chocolate Cake (Pastry)
6. Grilled Fish (Grill)
7. Chicken Wings (Fryer)

### Menu Items (7 Total)
- Grilled Chicken: $14.99
- French Fries: $4.99
- Butter Chicken: $16.99
- Caesar Salad: $9.99
- Chocolate Cake: $7.99
- Grilled Fish: $18.99
- Chicken Wings: $11.99

### Kitchen Screens (6 Total)
- Grill Station
- Fryer Station
- Sauté Station
- Prep Station
- Expo/Plating
- Kitchen Display System

### Tables (12 Total)
- Tables 1-4: Bar (2 seats)
- Tables 5-8: Standard (4 seats)
- Tables 9-12: Large (6 seats)

---

## 🔄 Order Flow

```
Server Creates Order
    ↓
Select Table & Items
    ↓
Send to Kitchen
    ↓
Distributed by Station:
    ├─ Grill Station (Grilled items)
    ├─ Fryer Station (Fried items)
    ├─ Sauté Station (Sautéed items)
    ├─ Prep Station (Salads, etc)
    └─ Pastry Station (Desserts)
    ↓
Cook Fires Item
    ↓
Cook Bumps to Next Station
    ↓
Expo Plates & Serves
```

---

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| Login fails | Check email/password exactly |
| Orders not on kitchen | Verify menu items have components |
| Can't see shift | Verify date range is correct |
| RBAC not working | Check Firestore rules deployed |

---

## 📚 Full Documentation

- **RBAC_RULES_AND_PERMISSIONS.md** - Complete rules
- **RBAC_TESTING_GUIDE.md** - Detailed testing
- **COMPLETE_RBAC_SETUP_SUMMARY.md** - Full summary

---

## ✅ Verification

- [x] Organization created
- [x] 9 employees with all roles
- [x] 84 shift schedules
- [x] 7 recipes
- [x] 7 menu items
- [x] 12 tables
- [x] 6 kitchen screens
- [x] Test credentials ready
- [x] RBAC rules defined
- [x] Order distribution working

---

## 🎉 Ready to Test!

**URL**: http://localhost:5173

**Pick any credential above and login!**

---

**Last Updated**: October 24, 2025
**Status**: ✅ READY FOR TESTING

