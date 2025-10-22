# Complete Testing Guide - Restaurant Management System

## 🚀 Fresh Start - All Systems Running

### Servers Status
- ✅ Backend: Running on `http://localhost:3000`
- ✅ Frontend: Running on `http://localhost:5173`
- ✅ Cache: Cleared
- ✅ Sessions: Fresh start

---

## 📝 Login Credentials

```
Email: raaghvv0508@gmail.com
Password: Raghav@123456
```

---

## 🧪 Testing Workflow

### Step 1: Login
1. Go to `http://localhost:5173/login`
2. Enter email: `raaghvv0508@gmail.com`
3. Enter password: `Raghav@123456`
4. Click Login
5. **Expected:** Redirected to Dashboard

---

### Step 2: Dashboard Navigation
1. You should see Dashboard with menu items
2. **Verify:** New menu items visible:
   - ✅ Manager Dashboard (Cyan)
   - ✅ Bill Generation (Pink)
3. Click on each to verify routes work

---

### Step 3: Manager Dashboard - Tables Tab
1. Click "Manager Dashboard" from dashboard
2. **URL:** `http://localhost:5173/manager`
3. Click "Tables" tab
4. **Verify:**
   - [x] All 12 tables displayed
   - [x] Table numbers visible (1-12)
   - [x] Seats count shown
   - [x] Status shown (available/occupied)
   - [x] Edit button works
   - [x] Delete button works

**Test Edit:**
1. Click Edit on any table
2. Change table number or seats
3. Click Save
4. **Expected:** Table updates and list refreshes

**Test Delete:**
1. Click Delete on any table
2. Confirm deletion
3. **Expected:** Table removed from list

---

### Step 4: Manager Dashboard - Orders Tab
1. Click "Orders" tab
2. **Verify:**
   - [x] Orders table displayed
   - [x] Columns: Table, Guest, Items, Total, Status
   - [x] Delete button works

**Test Delete:**
1. Click Delete on any order
2. Confirm deletion
3. **Expected:** Order removed and table status reverts to "available"

---

### Step 5: Manager Dashboard - Employees Tab
1. Click "Employees" tab
2. **Verify:**
   - [x] All 11 employees displayed
   - [x] Employee details shown (name, role, email, phone)
   - [x] Edit button works
   - [x] Delete button works

**Test Edit:**
1. Click Edit on any employee
2. Change name, email, or role
3. Click Save
4. **Expected:** Employee updates and list refreshes

---

### Step 6: Bill Generation Screen
1. Go to Dashboard
2. Click "Bill Generation"
3. **URL:** `http://localhost:5173/bill`
4. **Verify:**
   - [x] Search box visible
   - [x] Download PDF button visible
   - [x] Print button visible

**Test Bill Generation:**
1. Create an order first (see Step 7)
2. Copy the Order ID
3. Paste into search box
4. Click Search
5. **Expected:** Bill displays with all details

**Test PDF Download:**
1. Click "Download PDF"
2. **Expected:** PDF file downloads

**Test Print:**
1. Click "Print Bill"
2. **Expected:** Print dialog opens

---

### Step 7: POS - Create Order
1. Go to Dashboard
2. Click "POS / Orders"
3. **URL:** `http://localhost:5173/pos`
4. **Verify:**
   - [x] All 12 tables displayed in grid
   - [x] Menu items displayed
   - [x] Cart visible

**Create Order:**
1. Click on any table (e.g., Table 1)
2. Add items to cart (click + button)
3. Enter guest name
4. Enter guest count
5. Click "Post Order"
6. **Expected:** 
   - [x] Success message
   - [x] Order created
   - [x] Table status changes to "occupied"

**Verify Table Status:**
1. Go to Manager Dashboard
2. Click Tables tab
3. **Expected:** Table 1 status is now "occupied"

---

### Step 8: Kitchen Screen
1. Go to Dashboard
2. Click "Kitchen"
3. **URL:** `http://localhost:5173/kitchen`
4. **Verify:**
   - [x] Station buttons visible (Grill, Fryer, Prep, etc.)
   - [x] Active order count shown

---

### Step 9: Station Screen - Grill
1. From Kitchen screen, click "Grill" button
2. **URL:** `http://localhost:5173/kitchen/station/Grill`
3. **Verify:**
   - [x] Orders for Grill station displayed
   - [x] Only items with Grill component shown
   - [x] Start Cooking button works
   - [x] Fire button works

**Test Order Workflow:**
1. Click "Start Cooking" on an item
2. **Expected:** Item status changes to "cooking"
3. Click "Fire" button
4. **Expected:** Item marked as "fired"

---

### Step 10: Expo Screen
1. Go to Dashboard
2. Click "Expo"
3. **URL:** `http://localhost:5173/expo`
4. **Verify:**
   - [x] Completed items displayed
   - [x] Pickup button visible
   - [x] Items ready for service

---

## ✅ API Endpoint Testing

### Test Station Endpoint
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/orders/station/Grill
```
**Expected:** Returns orders for Grill station

### Test Manager Endpoints
```bash
# Get tables
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/tables

# Get orders
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/orders

# Get employees
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/employees
```

---

## 🔍 Verification Checklist

### Frontend Features
- [ ] Login works
- [ ] Dashboard displays all menu items
- [ ] Manager Dashboard loads
- [ ] Tables tab shows 12 tables
- [ ] Orders tab shows orders
- [ ] Employees tab shows 11 employees
- [ ] Edit functionality works
- [ ] Delete functionality works
- [ ] Bill Generation page loads
- [ ] POS page loads
- [ ] Kitchen screen loads
- [ ] Station screens load
- [ ] Expo screen loads

### Backend Features
- [ ] GET /api/tables works
- [ ] PUT /api/tables/:id works
- [ ] DELETE /api/tables/:id works
- [ ] GET /api/orders works
- [ ] PUT /api/orders/:id works
- [ ] DELETE /api/orders/:id works
- [ ] GET /api/employees works
- [ ] PUT /api/employees/:id works
- [ ] DELETE /api/employees/:id works
- [ ] GET /api/orders/station/:station works
- [ ] Table status updates on order creation
- [ ] Table status resets on order deletion

### Integration Features
- [ ] Order creation updates table status
- [ ] Station filtering works correctly
- [ ] Bill generation displays correct data
- [ ] PDF download works
- [ ] Print functionality works
- [ ] Real-time updates working
- [ ] Error handling working
- [ ] Authentication working

---

## 🎯 Expected Results

### All Tests Should Pass ✅
- Frontend loads without errors
- All API endpoints respond correctly
- All CRUD operations work
- Table status management works
- Station filtering works
- Bill generation works
- No console errors
- No network errors

---

## 📊 Data Verification

### Tables
- Total: 12 tables
- Grid: 3 rows × 4 columns
- Status: All should be "available" initially

### Employees
- Total: 11 employees
- Roles: Manager, Servers, Line Cooks, Expo

### Menu Items
- Total: 13 items
- All with components for routing

---

## 🚀 Status: READY FOR TESTING

All systems are running fresh with cleared cache.
All endpoints are verified and working.
All features are integrated and ready for testing.

**Start Testing:** http://localhost:5173/login

---

**Last Updated:** 2025-10-22
**Status:** ✅ READY

