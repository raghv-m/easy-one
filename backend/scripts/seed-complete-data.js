const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase
const serviceAccountPath = path.join(__dirname, '../../firebase-key.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID || 'easy-one-a9576',
});

const db = admin.firestore();

// Organization ID
const ORG_ID = 'easy-one-a9576';

// Manager User
const managerUser = {
  email: 'raaghvv0508@gmail.com',
  password: 'Raghav@123456',
  displayName: 'Raghav Mahajan',
  role: 'Manager',
};

// Team Members
const teamMembers = [
  { name: 'Priya Singh', email: 'priya.singh@restaurant.com', role: 'Server', phone: '9876543210' },
  { name: 'Amit Kumar', email: 'amit.kumar@restaurant.com', role: 'Line Cook', phone: '9876543211' },
  { name: 'Neha Patel', email: 'neha.patel@restaurant.com', role: 'Server', phone: '9876543212' },
  { name: 'Rajesh Verma', email: 'rajesh.verma@restaurant.com', role: 'Line Cook', phone: '9876543213' },
  { name: 'Anjali Sharma', email: 'anjali.sharma@restaurant.com', role: 'Expo', phone: '9876543214' },
  { name: 'Vikram Singh', email: 'vikram.singh@restaurant.com', role: 'Line Cook', phone: '9876543215' },
  { name: 'Deepika Gupta', email: 'deepika.gupta@restaurant.com', role: 'Server', phone: '9876543216' },
  { name: 'Arjun Reddy', email: 'arjun.reddy@restaurant.com', role: 'Manager', phone: '9876543217' },
  { name: 'Sneha Desai', email: 'sneha.desai@restaurant.com', role: 'Server', phone: '9876543218' },
  { name: 'Rohan Nair', email: 'rohan.nair@restaurant.com', role: 'Line Cook', phone: '9876543219' },
];

// Sample Orders with dates
const generateOrders = () => {
  const orders = [];
  const tables = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const menuItems = [
    { name: 'Butter Chicken', price: 14.99 },
    { name: 'Paneer Tikka Masala', price: 13.99 },
    { name: 'Tandoori Chicken', price: 12.99 },
    { name: 'Biryani (Chicken)', price: 13.99 },
    { name: 'Samosa (3 pieces)', price: 4.99 },
    { name: 'Naan Bread', price: 2.99 },
    { name: 'Dal Makhani', price: 9.99 },
  ];
  const servers = ['Priya Singh', 'Neha Patel', 'Deepika Gupta', 'Sneha Desai'];
  const guestNames = ['John Doe', 'Jane Smith', 'Raj Patel', 'Priya Sharma', 'Amit Singh', 'Neha Gupta'];

  // Generate orders for last 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    // 3-5 orders per day
    const ordersPerDay = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < ordersPerDay; i++) {
      const orderTime = new Date(date);
      orderTime.setHours(Math.floor(Math.random() * 12) + 11, Math.floor(Math.random() * 60), 0);

      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const item = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        items.push({
          name: item.name,
          quantity,
          price: item.price,
          status: 'served',
        });
        totalAmount += item.price * quantity;
      }

      const prepTime = Math.floor(Math.random() * 20) + 10;
      const servedTime = new Date(orderTime.getTime() + prepTime * 60000);

      orders.push({
        orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tableNumber: tables[Math.floor(Math.random() * tables.length)],
        guestName: guestNames[Math.floor(Math.random() * guestNames.length)],
        guestCount: Math.floor(Math.random() * 4) + 1,
        serverName: servers[Math.floor(Math.random() * servers.length)],
        items,
        allergies: Math.random() > 0.7 ? 'Gluten allergy' : '',
        specialInstructions: Math.random() > 0.8 ? 'No onions' : '',
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        status: 'served',
        createdAt: orderTime,
        servedAt: servedTime,
        prepTime,
        updatedAt: servedTime,
      });
    }
  }

  return orders;
};

async function seedData() {
  try {
    console.log('🌱 Starting complete data seed...\n');

    // 1. Create Manager User (using fixed UID)
    console.log('👤 Creating manager user...');
    const managerUid = 'manager-raghav-mahajan-001';
    console.log(`✅ Manager: ${managerUser.email} (UID: ${managerUid})`);

    // 2. Create Organization Settings
    console.log('\n🏢 Creating organization settings...');
    await db.collection('organizations').doc(ORG_ID).set({
      name: 'Easy One Restaurant',
      address: '123 Main Street, Mumbai, India',
      phone: '+91-9876543210',
      email: 'info@easyone.com',
      cuisine: 'Indian',
      description: 'Authentic Indian cuisine restaurant',
      logo: '',
      theme: 'dark',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Organization settings created');

    // 2.5. Create User Document for Raghav Mahajan
    console.log('\n👤 Creating user document for Raghav Mahajan...');
    await db.collection('users').doc(managerUid).set({
      id: managerUid,
      email: managerUser.email,
      password: managerUser.password,
      name: managerUser.displayName,
      role: managerUser.role,
      orgId: ORG_ID,
      organizationName: 'Easy One Restaurant',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ User document created for Raghav Mahajan');

    // 3. Create Manager in Employees Collection
    console.log('\n👨‍💼 Creating manager employee record...');
    await db
      .collection('organizations')
      .doc(ORG_ID)
      .collection('employees')
      .doc(managerUid)
      .set({
        id: managerUid,
        name: managerUser.displayName,
        email: managerUser.email,
        phone: '9876543200',
        role: 'Manager',
        employeeNumber: 'EMP00001',
        address: '123 Manager Lane, Mumbai',
        emergencyContact: 'Mahajan Family',
        emergencyPhone: '9876543200',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    console.log('✅ Manager employee record created');

    // 4. Create Team Members
    console.log('\n👥 Creating team members...');
    let employeeCounter = 2;
    for (const member of teamMembers) {
      const employeeUid = `employee-${member.email.split('@')[0]}-${employeeCounter}`;
      const defaultPassword = 'Employee@123456'; // Default password for all employees

      // Create employee in organization
      await db
        .collection('organizations')
        .doc(ORG_ID)
        .collection('employees')
        .doc(employeeUid)
        .set({
          id: employeeUid,
          name: member.name,
          email: member.email,
          phone: member.phone,
          role: member.role,
          employeeNumber: `EMP${String(employeeCounter).padStart(5, '0')}`,
          address: `${employeeCounter} Employee Street, Mumbai`,
          emergencyContact: `${member.name} Family`,
          emergencyPhone: member.phone,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      // Also create user in users collection
      await db.collection('users').doc(employeeUid).set({
        id: employeeUid,
        email: member.email,
        password: defaultPassword,
        name: member.name,
        role: member.role,
        orgId: ORG_ID,
        organizationName: 'Easy One Restaurant',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ ${member.name} (${member.role}) - ${member.email}`);
      employeeCounter++;
    }

    // 5. Create Tables (3 rows x 4 columns grid layout)
    console.log('\n🪑 Creating tables...');
    const tables = [
      // Row 1
      { number: '1', seats: 2, type: 'indoor', row: 1, col: 1 },
      { number: '2', seats: 2, type: 'indoor', row: 1, col: 2 },
      { number: '3', seats: 4, type: 'indoor', row: 1, col: 3 },
      { number: '4', seats: 4, type: 'indoor', row: 1, col: 4 },
      // Row 2
      { number: '5', seats: 6, type: 'indoor', row: 2, col: 1 },
      { number: '6', seats: 6, type: 'indoor', row: 2, col: 2 },
      { number: '7', seats: 4, type: 'indoor', row: 2, col: 3 },
      { number: '8', seats: 8, type: 'indoor', row: 2, col: 4 },
      // Row 3
      { number: '9', seats: 2, type: 'outdoor', row: 3, col: 1 },
      { number: '10', seats: 4, type: 'outdoor', row: 3, col: 2 },
      { number: '11', seats: 6, type: 'outdoor', row: 3, col: 3 },
      { number: '12', seats: 8, type: 'outdoor', row: 3, col: 4 },
    ];

    for (const table of tables) {
      await db
        .collection('organizations')
        .doc(ORG_ID)
        .collection('tables')
        .doc(`table-${table.number}`)
        .set({
          id: `table-${table.number}`,
          tableNumber: table.number,
          seats: table.seats,
          type: table.type,
          row: table.row,
          col: table.col,
          status: 'available',
          createdAt: new Date(),
        });
    }
    console.log(`✅ Created ${tables.length} tables`);

    // 6. Create Sample Orders
    console.log('\n📦 Creating sample orders...');
    const orders = generateOrders();
    for (const order of orders) {
      await db
        .collection('organizations')
        .doc(ORG_ID)
        .collection('archivedOrders')
        .doc(order.orderId)
        .set(order);
    }
    console.log(`✅ Created ${orders.length} sample orders`);

    console.log('\n✅ ✅ ✅ COMPLETE DATA SEED SUCCESSFUL! ✅ ✅ ✅\n');
    console.log('📊 Summary:');
    console.log(`   Organization: Easy One Restaurant`);
    console.log(`   Manager: Raghav Mahajan (raaghvv0508@gmail.com)`);
    console.log(`   Team Members: ${teamMembers.length}`);
    console.log(`   Tables: ${tables.length}`);
    console.log(`   Sample Orders: ${orders.length}`);
    console.log('\n🚀 Ready to use!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();

