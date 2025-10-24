# 🧪 RBAC Testing Guide - Complete Workflow

## 🚀 Quick Start

### Step 1: Run Seed Script
```bash
cd backend
npm run seed
```

**Output will show:**
- Organization ID
- All test credentials
- What was created

### Step 2: Start Application
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd web
npm run dev
```

### Step 3: Access Application
```
http://localhost:5173
```

---

## 👥 Test Credentials

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

### Cooks
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

### Servers
```
Server 1:
  Email: server1@dinesy.test
  Password: Server1@12345

Server 2:
  Email: server2@dinesy.test
  Password: Server2@12345
```

---

## 📋 Test Scenarios

### Test 1: Manager Creates Schedule ✅

**Steps:**
1. Login as Manager
2. Navigate to "Shift Management"
3. Click "Create Shift"
4. Select Employee: "Mike Cook - Grill"
5. Set Start Time: Tomorrow 6:00 AM
6. Set End Time: Tomorrow 2:00 PM
7. Click "Create Shift"

**Expected Results:**
- ✅ Shift created successfully
- ✅ Appears in calendar view
- ✅ Cook sees shift in their schedule

**Verify:**
- Logout and login as Cook 1
- Go to Schedule page
- See the created shift

---

### Test 2: Cook Views Station Orders ✅

**Steps:**
1. Login as Cook 1 (Grill)
2. Navigate to Kitchen Screen
3. Click "Grill" button

**Expected Results:**
- ✅ Only Grill orders visible
- ✅ Large, readable fonts
- ✅ Fire/Bump/Recall buttons available

**Verify:**
- Login as Cook 2 (Fryer)
- See only Fryer orders
- Grill orders NOT visible

---

### Test 3: Server Creates Order ✅

**Steps:**
1. Login as Server 1
2. Navigate to POS/Orders
3. Create new order:
   - Table: 1
   - Items: Grilled Chicken, French Fries
4. Submit order

**Expected Results:**
- ✅ Order created
- ✅ Appears on Kitchen Display System
- ✅ Distributed to correct stations:
   - Grill station: Grilled Chicken
   - Fryer station: French Fries

**Verify:**
- Login as Cook 1 (Grill)
- See Grilled Chicken order
- Login as Cook 2 (Fryer)
- See French Fries order

---

### Test 4: Supervisor Approves Trade ✅

**Steps:**
1. Login as Cook 1
2. Go to Schedule → Trade Shifts
3. Propose trade with Cook 2
4. Logout

**Then:**
1. Login as Supervisor
2. Go to Schedule → Requests
3. See pending trade
4. Click "Approve"

**Expected Results:**
- ✅ Trade approved
- ✅ Both cooks notified (email)
- ✅ Schedules updated

**Verify:**
- Login as Cook 1
- See updated schedule
- Check email for notification

---

### Test 5: Kitchen Manager Manages Orders ✅

**Steps:**
1. Login as Kitchen Manager
2. Navigate to Kitchen Display System
3. View all orders
4. Click on an order
5. Update status: Pending → Cooking

**Expected Results:**
- ✅ Can see all orders
- ✅ Can update status
- ✅ Changes reflect on station screens

**Verify:**
- Login as Cook 1
- See status update on their screen

---

### Test 6: RBAC Enforcement ✅

**Test: Cook Cannot Access Manager Features**

**Steps:**
1. Login as Cook 1
2. Try to access:
   - Shift Management (should be blocked)
   - Employee Management (should be blocked)
   - Menu Management (should be blocked)

**Expected Results:**
- ✅ Access denied
- ✅ Redirected to dashboard
- ✅ Error message shown

**Test: Server Cannot See Kitchen Screens**

**Steps:**
1. Login as Server 1
2. Try to access Kitchen Screen
3. Try to access Station Screen

**Expected Results:**
- ✅ Cannot access
- ✅ Redirected or hidden

---

### Test 7: Order Distribution ✅

**Steps:**
1. Login as Server 1
2. Create order with multiple items:
   - Grilled Chicken (Grill)
   - French Fries (Fryer)
   - Butter Chicken (Sauté)
   - Caesar Salad (Prep)

**Expected Results:**
- ✅ Order appears on Kitchen Display System
- ✅ Grill station sees Grilled Chicken
- ✅ Fryer station sees French Fries
- ✅ Sauté station sees Butter Chicken
- ✅ Prep station sees Caesar Salad

**Verify:**
- Login as each cook
- Verify they see only their items

---

### Test 8: Schedule Workflow ✅

**Steps:**
1. Login as Manager
2. Create shifts for all cooks (2 weeks)
3. Logout

**Then:**
1. Login as Cook 1
2. Go to Schedule
3. See all assigned shifts
4. Propose trade with Cook 2
5. Logout

**Then:**
1. Login as Supervisor
2. Go to Schedule → Requests
3. Approve trade
4. Logout

**Then:**
1. Login as Cook 1
2. See updated schedule
3. Verify trade was applied

---

## ✅ Verification Checklist

### Access Control
- [ ] Admin can access everything
- [ ] Manager can manage restaurant
- [ ] Supervisor can approve requests
- [ ] Kitchen Manager can manage kitchen
- [ ] Cook can only see own station
- [ ] Server can create orders
- [ ] Unauthorized access blocked

### Functionality
- [ ] Schedules created and visible
- [ ] Orders distributed correctly
- [ ] Kitchen screens show correct items
- [ ] Status updates work
- [ ] Trades/Picks workflow complete
- [ ] Emails sent on approvals

### UI/UX
- [ ] Role-based menu items show/hide
- [ ] Buttons disabled for unauthorized users
- [ ] Error messages clear
- [ ] Loading states visible
- [ ] Responsive on all devices

---

## 🐛 Troubleshooting

### Issue: Login fails
- Check credentials match seed output
- Verify Firebase is running
- Check network connection

### Issue: Orders not appearing on kitchen screens
- Verify order has components
- Check station names match
- Verify cook is assigned to station

### Issue: RBAC not enforced
- Check Firestore security rules deployed
- Verify user.role in auth token
- Check browser console for errors

### Issue: Schedules not visible
- Verify shifts created in Firestore
- Check date range is correct
- Verify employee assigned to shift

---

## 📊 Expected Results Summary

| Role | Can Create | Can Read | Can Update | Can Delete |
|------|-----------|----------|-----------|-----------|
| Admin | ✅ All | ✅ All | ✅ All | ✅ All |
| Manager | ✅ Most | ✅ All | ✅ Most | ❌ Limited |
| Supervisor | ❌ | ✅ Staff | ✅ Requests | ❌ |
| Kitchen Mgr | ❌ | ✅ Kitchen | ✅ Orders | ❌ |
| Cook | ❌ | ✅ Own | ✅ Own | ❌ |
| Server | ✅ Orders | ✅ Own | ✅ Own | ❌ |

---

**Status**: ✅ Ready for Testing

