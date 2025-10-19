# 🚀 Admin Page - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Start the Application
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd web
npm run dev

# Terminal 3: Mobile (optional)
cd mobile
npm start
```

### 2. Login as Manager
- URL: `http://localhost:5173/login`
- Email: `manager@restaurant.com`
- Password: `password123`

### 3. Access Admin Page
- Click "Admin" in dashboard
- Or navigate to: `http://localhost:5173/admin`

---

## 👥 Add Your First Employee

### Step-by-Step
1. Click **Employees** tab
2. Click **Add Employee** button
3. Fill in the form:
   ```
   First Name: John
   Last Name: Doe
   Email: john@restaurant.com
   Phone: (555) 123-4567
   Address: 123 Main St, City, State
   Emergency Contact: Jane Doe
   Emergency Phone: (555) 987-6543
   Role: Kitchen Staff
   ```
4. Click **Add Employee & Send Invite**
5. ✅ Employee added with number **EMP00001**
6. ✅ Invite email sent (if configured)

### What Happens
- Employee number auto-generated: `EMP00001`
- Invite email sent to employee
- Employee appears in list immediately
- Employee can accept invite and create account

---

## 🪑 Add Your First Table

### Step-by-Step
1. Click **Tables** tab
2. Click **Add Table** button
3. Fill in the form:
   ```
   Table Number: 1
   Seats: 4
   Type: indoor
   Location: Window
   ```
4. Click **Add Table**
5. ✅ Table added and appears in grid

### Add More Tables
- Table 2: 6 seats, outdoor, Patio
- Table 3: 2 seats, bar, Bar Counter
- Table 4: 8 seats, indoor, Main Dining

---

## 📧 Email Configuration (Optional)

### Setup Gmail SMTP
1. Open `backend/.env`
2. Add your Gmail credentials:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```
3. Get app password from: https://myaccount.google.com/apppasswords
4. Restart backend: `npm run dev`

### Without Email
- All features work without email
- Invite links still generated
- No errors or failures

---

## 🔔 Menu Item Notifications

### Add Menu Item
1. Go to **Menu Management** (`/menu`)
2. Click **Add Menu Item**
3. Fill in details:
   ```
   Name: Grilled Salmon
   Price: 24.99
   Category: Entrees
   Description: Fresh Atlantic salmon
   ```
4. Add components:
   - Salmon Fillet (Grill)
   - Vegetables (Prep)
5. Click **Add Menu Item**
6. ✅ All employees notified via email

---

## 📊 View Your Data

### Employees List
- Shows all employees
- Employee number, name, email, phone, role, status
- Delete button for each employee

### Tables List
- Shows all tables in grid
- Table number, seats, type, location, status
- Delete button for each table

### Settings
- Organization ID
- Your role
- Your email

---

## 🎯 Common Tasks

### Delete an Employee
1. Go to Employees tab
2. Find employee in list
3. Click trash icon
4. Confirm deletion
5. ✅ Employee removed

### Delete a Table
1. Go to Tables tab
2. Find table in grid
3. Click trash icon
4. Confirm deletion
5. ✅ Table removed

### Add Multiple Employees
1. Click "Add Employee"
2. Fill form
3. Click "Add Employee & Send Invite"
4. Repeat for each employee
5. ✅ All get auto-generated numbers

### Add Multiple Tables
1. Click "Add Table"
2. Fill form
3. Click "Add Table"
4. Repeat for each table
5. ✅ All appear in grid

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Can access Admin page
- [ ] Can add employee
- [ ] Employee number auto-generated
- [ ] Can view employee in list
- [ ] Can delete employee
- [ ] Can add table
- [ ] Can view table in grid
- [ ] Can delete table
- [ ] Success messages appear
- [ ] Error messages appear on validation

---

## 🐛 Troubleshooting

### Can't access Admin page
- Verify logged in as Manager
- Check browser console for errors
- Verify backend is running

### Employee not appearing in list
- Refresh page
- Check backend logs
- Verify token is valid

### Email not sending
- Check SMTP credentials in .env
- Verify email service configured
- Check backend logs for errors

### Duplicate table number error
- Ensure table number is unique
- Check existing tables
- Try different number

### Form validation errors
- Fill all required fields (marked with *)
- Check email format
- Check phone format

---

## 📱 Mobile Testing

### Test on Mobile
1. Open `http://localhost:5173/admin` on phone
2. Verify responsive layout
3. Test form inputs
4. Test button clicks
5. Verify tables display correctly

---

## 🔐 Security Notes

✅ Only Managers can access Admin page
✅ All data requires authentication
✅ Passwords hashed in production
✅ Email invites use JWT tokens
✅ Tokens expire after 7 days

---

## 📞 Support

### Backend Issues
- Check `backend/src/routes/employees.js`
- Check `backend/src/routes/tables.js`
- Check backend logs

### Frontend Issues
- Check `web/src/pages/AdminPage.jsx`
- Check browser console
- Check network tab

### Email Issues
- Check `.env` configuration
- Check backend logs
- Verify SMTP credentials

---

## 🎓 Next Steps

1. ✅ Add employees
2. ✅ Add tables
3. ✅ Configure email (optional)
4. ✅ Add menu items
5. ✅ Test invite flow
6. ✅ Train team on system

---

## 📚 Documentation

- `ADMIN_FEATURES_SUMMARY.md` - Complete feature list
- `ADMIN_TESTING_GUIDE.md` - Detailed testing guide
- `ADMIN_PAGE_COMPLETE_SUMMARY.md` - Full implementation details

---

**Ready to go!** 🚀

Start by adding your first employee and table, then explore the other features.

**Questions?** Check the documentation files or review the code comments.

---

**Last Updated**: 2025-10-19

