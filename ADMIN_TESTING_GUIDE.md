# Admin Page - Testing Guide

## 🧪 Quick Testing Steps

### Prerequisites
- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:5173`
- Logged in as Manager role

---

## 1️⃣ Test Employee Management

### Add Employee
```
1. Navigate to: http://localhost:5173/admin
2. Click "Employees" tab
3. Click "Add Employee" button
4. Fill in form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@restaurant.com
   - Phone: (555) 123-4567
   - Address: 123 Main St, City, State
   - Emergency Contact: Jane Doe
   - Emergency Phone: (555) 987-6543
   - Role: Kitchen Staff
5. Click "Add Employee & Send Invite"
6. Verify success message appears
7. Verify employee appears in list with auto-generated number (EMP00001)
```

### Verify Employee Number Auto-Generation
```
1. Add another employee with different details
2. Verify new employee number is EMP00002
3. Add third employee
4. Verify number is EMP00003
```

### Delete Employee
```
1. Click trash icon on any employee
2. Confirm deletion
3. Verify employee removed from list
```

### Test Validation
```
1. Try adding employee without First Name
2. Verify error message: "Please fill in all required fields"
3. Try adding employee with duplicate email
4. Verify error message: "User with this email already exists"
```

---

## 2️⃣ Test Table Management

### Add Table
```
1. Click "Tables" tab
2. Click "Add Table" button
3. Fill in form:
   - Table Number: 1
   - Seats: 4
   - Type: indoor
   - Location: Window
4. Click "Add Table"
5. Verify success message
6. Verify table appears in grid
```

### Add Multiple Tables
```
1. Add Table 2 (6 seats, outdoor, Patio)
2. Add Table 3 (2 seats, bar, Bar Counter)
3. Verify all tables appear in grid
4. Verify tables sorted by number
```

### Delete Table
```
1. Click trash icon on any table
2. Confirm deletion
3. Verify table removed from grid
```

### Test Validation
```
1. Try adding table without Table Number
2. Verify error message: "Please fill in all required fields"
3. Try adding table with duplicate number
4. Verify error message: "Table number already exists"
```

---

## 3️⃣ Test Menu Item Notifications

### Add Menu Item with Notifications
```
1. Navigate to: http://localhost:5173/menu
2. Click "Add Menu Item"
3. Fill in form:
   - Name: Grilled Salmon
   - Price: 24.99
   - Category: Entrees
   - Description: Fresh Atlantic salmon
   - Add Component: Salmon Fillet (Grill)
   - Add Component: Vegetables (Prep)
4. Click "Add Menu Item"
5. If email configured: Check employee emails received notification
6. If email not configured: Verify no errors occur
```

### Verify Email Content (if configured)
```
Email should contain:
- Subject: "New Menu Item Added: Grilled Salmon"
- Employee name greeting
- Menu item name
- Price: $24.99
- Category: Entrees
- Description
- Components list with stations
```

---

## 4️⃣ Test Invite Email Flow

### Generate Invite
```
1. Add new employee (see step 1)
2. If email configured: Check inbox for invite email
3. Email should contain:
   - Subject: "You're invited to join [Restaurant Name] on Easy One"
   - Personalized greeting
   - "Accept Invite" button
   - Invite link with token
   - 7-day expiration notice
```

### Accept Invite
```
1. Click invite link in email (or manually visit):
   http://localhost:5173/invite?token=<token>
2. Fill in form:
   - Full Name: John Doe
   - Password: password123
   - Confirm Password: password123
3. Click "Create Account"
4. Verify redirected to dashboard
5. Verify logged in as new employee
```

---

## 5️⃣ Test Error Handling

### Test Missing Email Service
```
1. Ensure SMTP credentials not configured in .env
2. Add new employee
3. Verify success message still appears
4. Verify employee added to database
5. Verify no error messages
6. Check backend logs: "Email not sent (service not configured)"
```

### Test Duplicate Prevention
```
1. Add employee with email: test@example.com
2. Try adding another employee with same email
3. Verify error: "User with this email already exists"
4. Try adding table with number: 1
5. Try adding another table with number: 1
6. Verify error: "Table number already exists"
```

### Test Role-Based Access
```
1. Login as non-Manager user
2. Try accessing /admin
3. Verify access denied or redirected
4. Login as Manager
5. Verify full access to all features
```

---

## 6️⃣ Test UI/UX

### Responsive Design
```
1. Test on desktop (1920x1080)
2. Test on tablet (768x1024)
3. Test on mobile (375x667)
4. Verify all forms and tables display correctly
```

### Loading States
```
1. Add employee and observe loading spinner
2. Add table and observe loading spinner
3. Verify spinner disappears after completion
```

### Success/Error Messages
```
1. Add employee successfully
2. Verify green success message appears
3. Verify message disappears after 3 seconds
4. Try adding duplicate email
5. Verify red error message appears
```

### Form Validation
```
1. Try submitting empty form
2. Verify error message
3. Fill in required fields
4. Verify form submits successfully
```

---

## 🔍 Backend Testing (cURL)

### Add Employee
```bash
curl -X POST http://localhost:3000/api/employees/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "(555) 123-4567",
    "address": "123 Main St",
    "emergencyContact": "Jane",
    "emergencyPhone": "(555) 987-6543",
    "role": "Kitchen Staff"
  }'
```

### Get All Employees
```bash
curl -X GET http://localhost:3000/api/employees \
  -H "Authorization: Bearer <token>"
```

### Add Table
```bash
curl -X POST http://localhost:3000/api/tables \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": 1,
    "seats": 4,
    "type": "indoor",
    "location": "Window"
  }'
```

### Get All Tables
```bash
curl -X GET http://localhost:3000/api/tables \
  -H "Authorization: Bearer <token>"
```

---

## ✅ Checklist

- [ ] Employee add/delete works
- [ ] Employee numbers auto-generate correctly
- [ ] Table add/delete works
- [ ] Duplicate prevention works
- [ ] Invite emails sent (if configured)
- [ ] Menu notifications sent (if configured)
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] UI responsive on all devices
- [ ] Loading states work
- [ ] Role-based access control works
- [ ] All validations work

---

## 🐛 Troubleshooting

### Employees not loading
- Check backend is running
- Check token is valid
- Check browser console for errors

### Email not sending
- Verify SMTP credentials in .env
- Check backend logs for email errors
- Verify email service is configured

### Table number duplicate error
- Ensure table number is unique
- Check existing tables in database

### Employee number not auto-generating
- Check backend logs
- Verify database connection
- Try refreshing page

---

**Last Updated**: 2025-10-19

