# DineSync Solutions - Schedule Management Implementation Guide

## Overview
Complete shift management system with employee scheduling, shift trading, pick requests, and admin approvals.

## Frontend Features (SchedulePage.jsx)

### Employee Features
- **View Schedule**: Weekly calendar view of assigned shifts
- **Trade Shifts**: Propose shift trades with other employees (requires admin approval)
- **Pick Shifts**: Request to pick open/unassigned shifts (requires admin approval)
- **Week Navigation**: Move between weeks to view past/future schedules

### Admin Features
- **Manage Requests**: View and approve/deny trade and pick requests
- **Request Dashboard**: Centralized view of all pending requests
- **Real-time Updates**: Live sync with Firestore

## Firestore Structure

```
/organizations/{orgId}/
  ├── schedules/
  │   ├── {scheduleId}/
  │   │   ├── weekStart: Date
  │   │   ├── weekEnd: Date
  │   │   ├── status: 'draft' | 'posted'
  │   │   ├── shifts: [
  │   │   │   {
  │   │   │     id: string
  │   │   │     employeeId: string
  │   │   │     date: Date
  │   │   │     startTime: Date
  │   │   │     endTime: Date
  │   │   │     role: string
  │   │   │     notes: string
  │   │   │     status: 'draft' | 'posted'
  │   │   │   }
  │   │   ]
  │   │   ├── createdBy: string (admin ID)
  │   │   ├── createdAt: Date
  │   │   └── updatedAt: Date
  │
  ├── tradeRequests/
  │   ├── {tradeId}/
  │   │   ├── requestedBy: string (employee ID)
  │   │   ├── targetEmployeeId: string
  │   │   ├── myShiftId: string
  │   │   ├── targetShiftId: string
  │   │   ├── status: 'pending' | 'approved' | 'denied'
  │   │   ├── reason: string
  │   │   ├── createdAt: Date
  │   │   └── updatedAt: Date
  │
  └── pickRequests/
      ├── {pickId}/
      │   ├── requestedBy: string (employee ID)
      │   ├── shiftId: string
      │   ├── shiftDate: Date
      │   ├── status: 'pending' | 'approved' | 'denied'
      │   ├── reason: string
      │   ├── createdAt: Date
      │   └── updatedAt: Date
```

## API Endpoints Required

### Schedule Endpoints
- `GET /api/schedules/employee/{userId}` - Get employee's shifts for week
- `GET /api/schedules/open-shifts` - Get unassigned shifts
- `POST /api/schedules` - Create new schedule (admin only)
- `POST /api/schedules/{scheduleId}/post` - Post schedule (admin only)

### Trade Endpoints
- `GET /api/trades/requests` - Get all trade requests (admin) or user's trades
- `POST /api/trades/request` - Submit trade request
- `POST /api/trades/{tradeId}/approve` - Approve trade (admin only)
- `POST /api/trades/{tradeId}/deny` - Deny trade (admin only)

### Pick Endpoints
- `GET /api/picks/requests` - Get all pick requests (admin) or user's picks
- `POST /api/picks/request` - Submit pick request
- `POST /api/picks/{pickId}/approve` - Approve pick (admin only)
- `POST /api/picks/{pickId}/deny` - Deny pick (admin only)

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /organizations/{orgId} {
      // Schedules
      match /schedules/{scheduleId} {
        allow read: if request.auth != null && 
                       request.auth.uid in resource.data.allowedUsers;
        allow create, update: if request.auth != null && 
                                 getUserRole(request.auth.uid) == 'Manager';
        allow delete: if request.auth != null && 
                        getUserRole(request.auth.uid) == 'Manager';
      }

      // Trade Requests
      match /tradeRequests/{tradeId} {
        allow read: if request.auth != null && 
                       (request.auth.uid == resource.data.requestedBy || 
                        request.auth.uid == resource.data.targetEmployeeId ||
                        getUserRole(request.auth.uid) == 'Manager');
        allow create: if request.auth != null;
        allow update: if request.auth != null && 
                        getUserRole(request.auth.uid) == 'Manager';
      }

      // Pick Requests
      match /pickRequests/{pickId} {
        allow read: if request.auth != null && 
                       (request.auth.uid == resource.data.requestedBy ||
                        getUserRole(request.auth.uid) == 'Manager');
        allow create: if request.auth != null;
        allow update: if request.auth != null && 
                        getUserRole(request.auth.uid) == 'Manager';
      }
    }
  }

  function getUserRole(uid) {
    return get(/databases/$(database)/documents/users/$(uid)).data.role;
  }
}
```

## Email Notifications (Cloud Function)

```javascript
// functions/scheduleNotifications.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Trigger on trade approval
exports.onTradeApproved = functions.firestore
  .document('organizations/{orgId}/tradeRequests/{tradeId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status === 'pending' && after.status === 'approved') {
      const { orgId } = context.params;
      
      // Get employee emails
      const requester = await admin.firestore()
        .collection('organizations').doc(orgId)
        .collection('employees').doc(after.requestedBy).get();
      
      const target = await admin.firestore()
        .collection('organizations').doc(orgId)
        .collection('employees').doc(after.targetEmployeeId).get();

      // Send emails
      await transporter.sendMail({
        to: requester.data().email,
        subject: 'Shift Trade Approved',
        html: `<p>Your shift trade has been approved!</p>`,
      });

      await transporter.sendMail({
        to: target.data().email,
        subject: 'Shift Trade Approved',
        html: `<p>A shift trade involving you has been approved!</p>`,
      });
    }
  });

// Trigger on pick approval
exports.onPickApproved = functions.firestore
  .document('organizations/{orgId}/pickRequests/{pickId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status === 'pending' && after.status === 'approved') {
      const { orgId } = context.params;
      
      const employee = await admin.firestore()
        .collection('organizations').doc(orgId)
        .collection('employees').doc(after.requestedBy).get();

      await transporter.sendMail({
        to: employee.data().email,
        subject: 'Shift Pick Approved',
        html: `<p>Your shift pick request has been approved!</p>`,
      });
    }
  });
```

## Integration Steps

1. **Update Backend Routes**: Add schedule, trade, and pick endpoints
2. **Deploy Firestore Rules**: Update security rules
3. **Deploy Cloud Functions**: Set up email notifications
4. **Test Workflow**: 
   - Create shifts as admin
   - Request trades as employee
   - Approve/deny as admin
   - Verify emails sent

## Role-Based Access Control

- **Admin/Manager**: Can create schedules, post schedules, approve/deny requests
- **Employee**: Can view own schedule, propose trades, request picks
- **Client-side**: Buttons hidden based on `user.role`
- **Server-side**: API endpoints check role before allowing operations

## Real-time Updates

Uses Firestore `onSnapshot` listeners for live updates:
- Trades/picks update immediately when admin approves
- Schedule changes reflect across all employees
- No page refresh needed

## Error Handling

- Input validation on all forms
- API error messages displayed to user
- Toast notifications for success/error
- Loading states during async operations

