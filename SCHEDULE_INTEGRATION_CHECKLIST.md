# Schedule Management System - Integration Checklist

## ✅ Frontend Implementation (COMPLETE)

- [x] **SchedulePage.jsx** - 921 lines
  - [x] Employee schedule view with weekly calendar
  - [x] Trade shift modal with employee/shift selection
  - [x] Pick shift modal for open shifts
  - [x] Admin request dashboard
  - [x] Real-time Firestore integration
  - [x] Error handling and loading states
  - [x] Role-based UI (admin vs employee)
  - [x] Week navigation (prev/next)
  - [x] Success/error toast notifications

## ✅ Backend Implementation (COMPLETE)

- [x] **backend/src/routes/schedules.js** - Trade & Pick endpoints
  - [x] `POST /api/schedules/trades/request` - Submit trade
  - [x] `GET /api/schedules/trades/requests` - Get trades
  - [x] `POST /api/schedules/trades/{id}/approve` - Approve trade
  - [x] `POST /api/schedules/trades/{id}/deny` - Deny trade
  - [x] `POST /api/schedules/picks/request` - Submit pick
  - [x] `GET /api/schedules/picks/requests` - Get picks
  - [x] `POST /api/schedules/picks/{id}/approve` - Approve pick
  - [x] `POST /api/schedules/picks/{id}/deny` - Deny pick

## 📋 Integration Steps (TODO)

### Step 1: Register Routes in Backend
**File**: `backend/src/index.js` or `backend/src/server.js`

```javascript
// Add this line with other route imports
const scheduleRoutes = require('./routes/schedules');

// Add this line with other route registrations
app.use('/api/schedules', scheduleRoutes);
```

**Status**: [ ] TODO

### Step 2: Deploy Firestore Security Rules
**File**: `firestore.rules`

Copy the security rules from `SCHEDULE_IMPLEMENTATION_GUIDE.md` and deploy:

```bash
firebase deploy --only firestore:rules
```

**Status**: [ ] TODO

### Step 3: Deploy Cloud Functions
**File**: `functions/scheduleNotifications.js`

```bash
cd functions
npm install nodemailer
firebase deploy --only functions
```

Set environment variables:
```bash
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"
```

**Status**: [ ] TODO

### Step 4: Update Firestore Collections
Ensure these collections exist in Firestore:

```
/organizations/{orgId}/
  ├── shifts/
  ├── tradeRequests/
  └── pickRequests/
```

**Status**: [ ] TODO

### Step 5: Test Employee Features
- [ ] Login as employee
- [ ] Navigate to `/schedule`
- [ ] View weekly calendar
- [ ] Click "Trade" on a shift
- [ ] Select another employee and their shift
- [ ] Submit trade request
- [ ] Verify request appears in admin dashboard

**Status**: [ ] TODO

### Step 6: Test Admin Features
- [ ] Login as admin/manager
- [ ] Navigate to `/schedule`
- [ ] Click "Requests" tab
- [ ] View pending trade requests
- [ ] Click "Approve" on a trade
- [ ] Verify emails sent to both employees
- [ ] Test "Deny" functionality

**Status**: [ ] TODO

### Step 7: Test Pick Shift Feature
- [ ] Login as employee
- [ ] Click "Pick Shifts" tab
- [ ] View open shifts
- [ ] Click "Request Shift"
- [ ] Submit pick request
- [ ] Login as admin
- [ ] Approve pick request
- [ ] Verify employee receives email

**Status**: [ ] TODO

### Step 8: Test Week Navigation
- [ ] Click left arrow to go to previous week
- [ ] Click right arrow to go to next week
- [ ] Verify shifts update correctly
- [ ] Verify calendar dates update

**Status**: [ ] TODO

### Step 9: Test Error Handling
- [ ] Try submitting trade without selecting employee
- [ ] Try submitting pick without selecting shift
- [ ] Verify error messages display
- [ ] Verify loading states show during requests

**Status**: [ ] TODO

### Step 10: Test Real-time Updates
- [ ] Open schedule in two browser windows
- [ ] Approve a request in one window
- [ ] Verify it updates in the other window without refresh

**Status**: [ ] TODO

## 🔧 Configuration Checklist

### Environment Variables
- [ ] `EMAIL_USER` - Gmail address for sending emails
- [ ] `EMAIL_PASSWORD` - Gmail app password (not regular password)
- [ ] `SENDGRID_API_KEY` - If using SendGrid instead of Gmail

### Firebase Configuration
- [ ] Firestore database created
- [ ] Authentication enabled
- [ ] Cloud Functions enabled
- [ ] Storage bucket created (if needed)

### Backend Configuration
- [ ] Schedule routes registered in main app
- [ ] CORS configured for frontend
- [ ] Auth middleware working
- [ ] Role-based access control working

### Frontend Configuration
- [ ] API_URL environment variable set
- [ ] useAuthStore hook working
- [ ] React Router configured
- [ ] Tailwind CSS working

## 📊 Data Structure Verification

### Shifts Collection
```javascript
{
  id: "shift-123",
  employeeId: "emp-456",
  startTime: Timestamp,
  endTime: Timestamp,
  role: "Server",
  status: "active"
}
```

### Trade Requests Collection
```javascript
{
  id: "trade-789",
  requestedBy: "emp-123",
  targetEmployeeId: "emp-456",
  myShiftId: "shift-111",
  targetShiftId: "shift-222",
  status: "pending",
  reason: "Need to swap",
  createdAt: Timestamp
}
```

### Pick Requests Collection
```javascript
{
  id: "pick-999",
  requestedBy: "emp-123",
  shiftId: "shift-333",
  status: "pending",
  reason: "Want extra hours",
  createdAt: Timestamp
}
```

## 🚀 Deployment Steps

1. **Test Locally**
   - [ ] Run `npm run dev` in web folder
   - [ ] Run backend server
   - [ ] Test all features

2. **Deploy Backend**
   - [ ] Push to main branch
   - [ ] Deploy to production server
   - [ ] Verify API endpoints working

3. **Deploy Frontend**
   - [ ] Build: `npm run build`
   - [ ] Deploy to hosting (Vercel, Netlify, etc.)
   - [ ] Test in production

4. **Deploy Cloud Functions**
   - [ ] `firebase deploy --only functions`
   - [ ] Verify functions deployed
   - [ ] Test email notifications

5. **Deploy Firestore Rules**
   - [ ] `firebase deploy --only firestore:rules`
   - [ ] Verify rules applied

## 📞 Support & Troubleshooting

### Common Issues

**Emails not sending:**
- Check EMAIL_USER and EMAIL_PASSWORD in Cloud Functions config
- Verify Gmail app password (not regular password)
- Check Cloud Functions logs: `firebase functions:log`

**Trades not appearing:**
- Verify Firestore rules allow read access
- Check browser console for API errors
- Verify backend routes registered

**Real-time updates not working:**
- Check Firestore onSnapshot listeners
- Verify user has read permissions
- Check browser network tab

**Role-based access not working:**
- Verify user.role is set correctly in auth
- Check requireRole middleware
- Verify Firestore rules

## 📚 Documentation Files

- `SCHEDULE_IMPLEMENTATION_GUIDE.md` - Complete technical guide
- `SCHEDULE_FEATURE_SUMMARY.md` - Feature overview
- `SCHEDULE_INTEGRATION_CHECKLIST.md` - This file
- `functions/scheduleNotifications.js` - Cloud Function code
- `web/src/pages/SchedulePage.jsx` - Frontend code
- `backend/src/routes/schedules.js` - Backend code

## ✨ Next Steps

1. Complete all integration steps above
2. Run through testing checklist
3. Deploy to production
4. Monitor Cloud Functions logs
5. Gather user feedback
6. Iterate on features

## 📞 Questions?

Refer to the implementation guide or check the code comments for detailed explanations.

