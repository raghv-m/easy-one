# 🔐 RBAC Rules & Permissions - DineSync Solutions

## 📋 Role Hierarchy

```
Admin (Full Access)
  ├── Manager (Restaurant Management)
  │   ├── Supervisor (Staff Management)
  │   │   ├── Kitchen Manager (Kitchen Operations)
  │   │   │   ├── Cook (Cooking)
  │   │   │   └── Server (Service)
```

---

## 👥 Roles & Permissions

### 1. **ADMIN** 👑
**Full system access**

| Feature | Permission |
|---------|-----------|
| Organizations | Create, Read, Update, Delete |
| Employees | Create, Read, Update, Delete |
| Roles | Assign, Modify |
| Schedules | Create, Read, Update, Delete |
| Recipes | Create, Read, Update, Delete |
| Menu Items | Create, Read, Update, Delete |
| Tables | Create, Read, Update, Delete |
| Orders | Create, Read, Update, Delete |
| Kitchen Screens | Create, Read, Update, Delete |
| Reports | View All |
| Settings | Modify All |

**Test Credentials:**
```
Email: admin@dinesy.test
Password: Admin@12345
```

---

### 2. **MANAGER** 📊
**Restaurant operations & staff management**

| Feature | Permission |
|---------|-----------|
| Employees | Read, Update (not delete) |
| Schedules | Create, Read, Update, Delete |
| Recipes | Create, Read, Update |
| Menu Items | Create, Read, Update |
| Tables | Create, Read, Update |
| Orders | Read, Update |
| Kitchen Screens | Read |
| Reports | View Restaurant |
| Settings | Modify Restaurant |

**Test Credentials:**
```
Email: manager@dinesy.test
Password: Manager@12345
```

---

### 3. **SUPERVISOR** 👔
**Staff & shift management**

| Feature | Permission |
|---------|-----------|
| Employees | Read |
| Schedules | Read, Approve Trades/Picks |
| Recipes | Read |
| Menu Items | Read |
| Orders | Read, Update Status |
| Kitchen Screens | Read |
| Reports | View Staff |

**Test Credentials:**
```
Email: supervisor@dinesy.test
Password: Supervisor@12345
```

---

### 4. **KITCHEN MANAGER** 🍳
**Kitchen operations & order management**

| Feature | Permission |
|---------|-----------|
| Recipes | Read, Update |
| Menu Items | Read |
| Orders | Read, Update Status |
| Kitchen Screens | Read, Manage |
| Cooks | Assign Tasks |
| Reports | View Kitchen |

**Test Credentials:**
```
Email: kitchenmgr@dinesy.test
Password: KitchenMgr@12345
```

---

### 5. **COOK** 👨‍🍳
**Kitchen operations - Station specific**

| Feature | Permission |
|---------|-----------|
| Orders | Read (own station) |
| Kitchen Screens | View (own station) |
| Recipes | Read |
| Actions | Fire, Bump, Recall |

**Stations:**
- Cook 1: Grill
- Cook 2: Fryer
- Cook 3: Sauté

**Test Credentials:**
```
Cook 1 (Grill):
  Email: cook1@dinesy.test
  Password: Cook1@12345

Cook 2 (Fryer):
  Email: cook2@dinesy.test
  Password: Cook2@12345

Cook 3 (Sauté):
  Email: cook3@dinesy.test
  Password: Cook3@12345
```

---

### 6. **SERVER** 🍽️
**Customer service & order placement**

| Feature | Permission |
|---------|-----------|
| Orders | Create, Read (own), Update |
| Tables | Read, Update Status |
| Menu Items | Read |
| Kitchen Screens | View (Expo only) |

**Test Credentials:**
```
Server 1:
  Email: server1@dinesy.test
  Password: Server1@12345

Server 2:
  Email: server2@dinesy.test
  Password: Server2@12345
```

---

## 🔄 Workflows by Role

### **Manager Workflow**
1. Login → Dashboard
2. View all employee schedules
3. Create/Edit shifts
4. Manage menu items
5. View kitchen screens
6. Generate reports

### **Supervisor Workflow**
1. Login → Dashboard
2. View employee schedules
3. Approve/Deny trade requests
4. Approve/Deny pick requests
5. Monitor orders
6. View staff reports

### **Kitchen Manager Workflow**
1. Login → Kitchen Dashboard
2. View all kitchen screens
3. Manage order status
4. Assign tasks to cooks
5. View kitchen reports

### **Cook Workflow**
1. Login → Kitchen Screen (own station)
2. View orders for station
3. Fire items (start cooking)
4. Recall items (if needed)
5. Bump items (move to next station)

### **Server Workflow**
1. Login → POS System
2. Create new orders
3. Select table & items
4. Send to kitchen
5. View order status
6. Manage table status

---

## 🛡️ Security Rules

### Firestore Security Rules

```javascript
// Admin: Full access
match /organizations/{orgId} {
  allow read, write: if request.auth.token.role == 'Admin';
  
  // Manager: Organization data
  allow read: if request.auth.token.role in ['Manager', 'Admin'];
  allow write: if request.auth.token.role == 'Manager';
  
  // Employees: Own data only
  match /employees/{empId} {
    allow read: if request.auth.uid == empId || 
                   request.auth.token.role in ['Manager', 'Admin'];
    allow write: if request.auth.uid == empId || 
                    request.auth.token.role == 'Manager';
  }
  
  // Schedules: Role-based
  match /shifts/{shiftId} {
    allow read: if request.auth.token.role in ['Manager', 'Supervisor', 'Admin'];
    allow write: if request.auth.token.role in ['Manager', 'Admin'];
  }
  
  // Orders: Station-based for cooks
  match /orders/{orderId} {
    allow read: if request.auth.token.role in ['Manager', 'Admin', 'Kitchen Manager'] ||
                   (request.auth.token.role == 'Cook' && 
                    resource.data.station == request.auth.token.station);
    allow write: if request.auth.token.role in ['Manager', 'Admin', 'Kitchen Manager'];
  }
}
```

---

## 📊 Test Scenarios

### Scenario 1: Manager Creates Schedule
1. Login as Manager
2. Go to Shift Management
3. Create shift for Cook 1 (Grill)
4. Verify Cook 1 sees shift in schedule

### Scenario 2: Cook Manages Order
1. Login as Cook 1
2. View Grill station screen
3. See orders with Grill component
4. Fire → Bump → Complete

### Scenario 3: Supervisor Approves Trade
1. Login as Supervisor
2. Go to Schedule → Trades
3. See pending trade requests
4. Approve/Deny trade
5. Verify emails sent

### Scenario 4: Server Creates Order
1. Login as Server
2. Create new order
3. Select table & items
4. Send to kitchen
5. Verify appears on kitchen screens

---

## ✅ Testing Checklist

- [ ] Admin can access all features
- [ ] Manager can create schedules
- [ ] Supervisor can approve trades
- [ ] Kitchen Manager can manage orders
- [ ] Cook sees only own station orders
- [ ] Server can create orders
- [ ] Orders appear on correct kitchen screens
- [ ] Unauthorized access is blocked
- [ ] Role-based UI elements show/hide correctly
- [ ] Firestore rules enforce permissions

---

## 🚀 Running the Seed Script

```bash
cd backend
npm run seed
```

This will:
1. Delete all old organizations
2. Create new organization
3. Create 9 employees (all roles)
4. Create 14-day schedules
5. Create 7 recipes
6. Create 7 menu items
7. Create 12 tables
8. Create 6 kitchen screens
9. Print all test credentials

---

**Status**: ✅ RBAC System Ready for Testing

