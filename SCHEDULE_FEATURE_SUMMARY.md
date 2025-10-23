# DineSync Solutions - Complete Schedule Management System

## 🎯 Overview
A comprehensive shift management system for restaurants with employee scheduling, shift trading, pick requests, and admin approvals. Built with React, Firebase/Firestore, and Node.js backend.

## ✨ Features Implemented

### 👥 Employee Features
- **View Schedule**: Weekly calendar view of assigned shifts
- **Trade Shifts**: Propose shift trades with other employees
- **Pick Shifts**: Request to pick open/unassigned shifts
- **Week Navigation**: Browse past and future schedules
- **Real-time Updates**: Live sync with Firestore

### 👨‍💼 Admin Features
- **Manage Requests**: Centralized dashboard for all trade/pick requests
- **Approve/Deny**: One-click approval or denial of requests
- **Request Tracking**: View pending, approved, and denied requests
- **Email Notifications**: Automatic emails on request approval

### 📅 General Features
- **Weekly Calendar View**: 7-day grid showing all shifts
- **Shift Cards**: Detailed shift information with time and role
- **Status Tracking**: Draft, posted, pending, approved, denied statuses
- **Error Handling**: Input validation and user-friendly error messages
- **Loading States**: Smooth loading indicators during async operations
- **Responsive Design**: Works on desktop, tablet, and mobile

## 📁 Files Created/Modified

### Frontend
- **web/src/pages/SchedulePage.jsx** (921 lines)
  - Complete employee schedule view
  - Trade shift modal
  - Pick shift modal
  - Admin request dashboard
  - Weekly calendar grid
  - Real-time Firestore integration

### Backend
- **backend/src/routes/schedules.js** (571 lines)
  - Trade request endpoints
  - Pick request endpoints
  - Admin approval endpoints
  - Firestore queries with role-based access

### Documentation
- **SCHEDULE_IMPLEMENTATION_GUIDE.md**
  - Firestore structure
  - Security rules
  - Cloud Function examples
  - API endpoint reference
  - Integration steps

## 🔧 API Endpoints

### Schedule Endpoints
```
GET  /api/schedules/employee/{userId}     - Get employee's shifts
GET  /api/schedules/open-shifts            - Get unassigned shifts
POST /api/schedules                        - Create schedule (admin)
POST /api/schedules/{id}/post              - Post schedule (admin)
```

### Trade Endpoints
```
POST /api/schedules/trades/request         - Submit trade request
GET  /api/schedules/trades/requests        - Get trade requests
POST /api/schedules/trades/{id}/approve    - Approve trade (admin)
POST /api/schedules/trades/{id}/deny       - Deny trade (admin)
```

### Pick Endpoints
```
POST /api/schedules/picks/request          - Submit pick request
GET  /api/schedules/picks/requests         - Get pick requests
POST /api/schedules/picks/{id}/approve     - Approve pick (admin)
POST /api/schedules/picks/{id}/deny        - Deny pick (admin)
```

## 🔐 Role-Based Access Control

### Client-Side
- Buttons hidden based on `user.role`
- Admin sees "Requests" tab
- Employees see "Trade Shifts" and "Pick Shifts" tabs

### Server-Side
- `requireRole(['Manager', 'Admin'])` middleware on admin endpoints
- Firestore rules enforce role-based access
- Users can only view their own requests

## 📊 Firestore Collections

```
/organizations/{orgId}/
  ├── schedules/
  │   └── {shiftId}: { employeeId, startTime, endTime, role, status }
  ├── tradeRequests/
  │   └── {tradeId}: { requestedBy, targetEmployeeId, status, ... }
  └── pickRequests/
      └── {pickId}: { requestedBy, shiftId, status, ... }
```

## 🚀 How to Use

### For Employees
1. Navigate to "My Schedule"
2. View shifts in weekly calendar
3. Click "Trade" on a shift to propose trade
4. Select employee and their shift
5. Submit request (awaits admin approval)
6. Or click "Pick Shifts" to request open shifts

### For Admins
1. Navigate to "Schedule Requests"
2. View all pending trade and pick requests
3. Click "Approve" or "Deny"
4. Employees notified via email

## 🔄 Real-Time Updates

Uses Firestore `onSnapshot` listeners:
- Trades/picks update immediately when admin approves
- No page refresh needed
- Live sync across all users

## ✅ Testing Checklist

- [ ] Employee can view their schedule
- [ ] Employee can propose shift trade
- [ ] Employee can request to pick shift
- [ ] Admin can view all requests
- [ ] Admin can approve trade request
- [ ] Admin can deny pick request
- [ ] Emails sent on approval
- [ ] Week navigation works
- [ ] Error messages display correctly
- [ ] Loading states show during async operations

## 🔗 Integration with Existing App

1. **Routes**: Already configured in React Router
2. **Auth**: Uses existing `useAuthStore` hook
3. **API**: Uses existing axios setup
4. **Styling**: Uses existing Tailwind CSS
5. **Icons**: Uses existing lucide-react icons

## 📧 Email Notifications

Cloud Function triggers on:
- Trade request approved
- Pick request approved
- Trade request denied
- Pick request denied

See `SCHEDULE_IMPLEMENTATION_GUIDE.md` for Cloud Function code.

## 🐛 Known Limitations

- Email notifications require Cloud Functions setup
- Firestore rules need to be deployed
- Backend routes need to be registered in main Express app
- No recurring shift support yet

## 🎓 Next Steps

1. Deploy Firestore security rules
2. Deploy Cloud Functions for emails
3. Register schedule routes in backend `index.js`
4. Test with real data
5. Add email templates
6. Add SMS notifications (optional)

## 📝 Notes

- All timestamps use ISO format
- Status values: pending, approved, denied
- Shift status: draft, posted
- Role values: Manager, Admin, Employee
- Week starts on Sunday, ends on Saturday

