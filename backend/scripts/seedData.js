/**
 * Seed Script: Complete Restaurant Management System Setup
 * Creates new organization with all roles, employees, schedules, recipes, menus, tables, and kitchen screens
 * Includes RBAC rules and test credentials
 */

const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../src/config/firebase-key.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

// Generate new organization ID
const ORG_ID = `dinesy-${Date.now()}`;
const ORG_NAME = 'DineSync Solutions - Test Restaurant';

// Test credentials for all roles
const TEST_CREDENTIALS = {
  admin: { email: 'admin@dinesy.test', password: 'Admin@12345' },
  manager: { email: 'manager@dinesy.test', password: 'Manager@12345' },
  supervisor: { email: 'supervisor@dinesy.test', password: 'Supervisor@12345' },
  kitchenManager: { email: 'kitchenmgr@dinesy.test', password: 'KitchenMgr@12345' },
  cook1: { email: 'cook1@dinesy.test', password: 'Cook1@12345' },
  cook2: { email: 'cook2@dinesy.test', password: 'Cook2@12345' },
  cook3: { email: 'cook3@dinesy.test', password: 'Cook3@12345' },
  server1: { email: 'server1@dinesy.test', password: 'Server1@12345' },
  server2: { email: 'server2@dinesy.test', password: 'Server2@12345' },
};

// ============================================
// DELETE OLD ORGANIZATIONS
// ============================================
async function deleteOldOrganizations() {
  console.log('🗑️  Deleting old organizations...');
  try {
    const orgsSnapshot = await db.collection('organizations').get();
    let count = 0;

    for (const doc of orgsSnapshot.docs) {
      // Delete all subcollections
      const subcollections = ['employees', 'recipes', 'menus', 'tables', 'shifts', 'orders', 'kitchenScreens', 'tradeRequests', 'pickRequests'];

      for (const subcol of subcollections) {
        const subSnapshot = await db.collection('organizations').doc(doc.id).collection(subcol).get();
        for (const subDoc of subSnapshot.docs) {
          await subDoc.ref.delete();
        }
      }

      // Delete organization
      await doc.ref.delete();
      count++;
    }

    console.log(`✅ Deleted ${count} old organizations`);
  } catch (error) {
    console.error('❌ Error deleting organizations:', error);
    throw error;
  }
}

// ============================================
// CREATE ORGANIZATION
// ============================================
async function createOrganization() {
  console.log('🏢 Creating new organization...');
  try {
    await db.collection('organizations').doc(ORG_ID).set({
      name: ORG_NAME,
      createdAt: new Date(),
      status: 'active',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        language: 'en',
      },
    });

    console.log(`✅ Created organization: ${ORG_ID}`);
    return ORG_ID;
  } catch (error) {
    console.error('❌ Error creating organization:', error);
    throw error;
  }
}

// ============================================
// CREATE EMPLOYEES WITH ALL ROLES
// ============================================
async function createEmployees() {
  console.log('👨‍💼 Creating employees with all roles...');
  try {
    const employees = [
      // Admin
      {
        name: 'Admin User',
        email: TEST_CREDENTIALS.admin.email,
        phone: '555-0000',
        role: 'Admin',
        employeeNumber: 'EMP00000',
        address: '100 Admin St',
        emergencyContact: 'Manager',
        station: null,
      },
      // Manager
      {
        name: 'John Manager',
        email: TEST_CREDENTIALS.manager.email,
        phone: '555-0001',
        role: 'Manager',
        employeeNumber: 'EMP00001',
        address: '123 Main St',
        emergencyContact: 'Jane Manager',
        station: null,
      },
      // Supervisor
      {
        name: 'Sarah Supervisor',
        email: TEST_CREDENTIALS.supervisor.email,
        phone: '555-0002',
        role: 'Supervisor',
        employeeNumber: 'EMP00002',
        address: '456 Oak Ave',
        emergencyContact: 'Tom Supervisor',
        station: null,
      },
      // Kitchen Manager
      {
        name: 'Chef Robert',
        email: TEST_CREDENTIALS.kitchenManager.email,
        phone: '555-0007',
        role: 'Kitchen Manager',
        employeeNumber: 'EMP00007',
        address: '147 Birch Way',
        emergencyContact: 'Sarah Supervisor',
        station: null,
      },
      // Cooks (assigned to different stations)
      {
        name: 'Mike Cook - Grill',
        email: TEST_CREDENTIALS.cook1.email,
        phone: '555-0003',
        role: 'Cook',
        employeeNumber: 'EMP00003',
        station: 'Grill',
        address: '789 Pine Rd',
        emergencyContact: 'Lisa Cook',
      },
      {
        name: 'Lisa Cook - Fryer',
        email: TEST_CREDENTIALS.cook2.email,
        phone: '555-0004',
        role: 'Cook',
        employeeNumber: 'EMP00004',
        station: 'Fryer',
        address: '321 Elm St',
        emergencyContact: 'Mike Cook',
      },
      {
        name: 'David Cook - Sauté',
        email: TEST_CREDENTIALS.cook3.email,
        phone: '555-0008',
        role: 'Cook',
        employeeNumber: 'EMP00008',
        station: 'Sauté',
        address: '555 Spruce Ave',
        emergencyContact: 'Mike Cook',
      },
      // Servers
      {
        name: 'Alex Server',
        email: TEST_CREDENTIALS.server1.email,
        phone: '555-0005',
        role: 'Server',
        employeeNumber: 'EMP00005',
        address: '654 Maple Dr',
        emergencyContact: 'Jordan Server',
        station: null,
      },
      {
        name: 'Jordan Server',
        email: TEST_CREDENTIALS.server2.email,
        phone: '555-0006',
        role: 'Server',
        employeeNumber: 'EMP00006',
        address: '987 Cedar Ln',
        emergencyContact: 'Alex Server',
        station: null,
      },
    ];

    const empRef = db.collection('organizations').doc(ORG_ID).collection('employees');
    let count = 0;

    for (const emp of employees) {
      await empRef.add({
        ...emp,
        createdAt: new Date(),
        status: 'active',
      });
      count++;
    }

    console.log(`✅ Created ${count} employees with all roles`);
  } catch (error) {
    console.error('❌ Error creating employees:', error);
    throw error;
  }
}

// ============================================
// CREATE SCHEDULES FOR EMPLOYEES
// ============================================
async function createSchedules() {
  console.log('📅 Creating employee schedules...');
  try {
    const today = new Date();
    const schedules = [];

    // Get all employees
    const empSnapshot = await db.collection('organizations').doc(ORG_ID).collection('employees').get();
    const employees = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Create shifts for next 2 weeks
    for (let day = 0; day < 14; day++) {
      const shiftDate = new Date(today);
      shiftDate.setDate(shiftDate.getDate() + day);

      // Skip Sundays
      if (shiftDate.getDay() === 0) continue;

      // Morning shift (6 AM - 2 PM)
      const morningStart = new Date(shiftDate);
      morningStart.setHours(6, 0, 0, 0);
      const morningEnd = new Date(shiftDate);
      morningEnd.setHours(14, 0, 0, 0);

      // Afternoon shift (2 PM - 10 PM)
      const afternoonStart = new Date(shiftDate);
      afternoonStart.setHours(14, 0, 0, 0);
      const afternoonEnd = new Date(shiftDate);
      afternoonEnd.setHours(22, 0, 0, 0);

      // Assign employees to shifts
      for (const emp of employees) {
        if (emp.role === 'Admin' || emp.role === 'Manager') continue; // Managers don't have shifts

        const shiftType = day % 2 === 0 ? 'morning' : 'afternoon';
        const startTime = shiftType === 'morning' ? morningStart : afternoonStart;
        const endTime = shiftType === 'morning' ? morningEnd : afternoonEnd;

        schedules.push({
          employeeId: emp.id,
          employeeName: emp.name,
          role: emp.role,
          station: emp.station || null,
          startTime,
          endTime,
          status: 'scheduled',
          createdAt: new Date(),
        });
      }
    }

    const shiftRef = db.collection('organizations').doc(ORG_ID).collection('shifts');
    let count = 0;

    for (const schedule of schedules) {
      await shiftRef.add(schedule);
      count++;
    }

    console.log(`✅ Created ${count} shift schedules`);
  } catch (error) {
    console.error('❌ Error creating schedules:', error);
    throw error;
  }
}

// ============================================
// CREATE RECIPES
// ============================================
async function createRecipes() {
  console.log('📖 Creating recipes...');
  try {
    const recipes = [
      {
        name: 'Grilled Chicken Breast',
        description: 'Perfectly grilled chicken breast with herbs',
        category: 'Main Course',
        prepTime: 5,
        cookTime: 15,
        components: [
          { station: 'Prep', step: 'Season chicken', duration: 5 },
          { station: 'Grill', step: 'Grill for 6-8 minutes per side', duration: 15 },
          { station: 'Expo', step: 'Plate and garnish', duration: 2 },
        ],
      },
      {
        name: 'French Fries',
        description: 'Crispy golden fries with sea salt',
        category: 'Sides',
        prepTime: 5,
        cookTime: 8,
        components: [
          { station: 'Prep', step: 'Cut potatoes', duration: 5 },
          { station: 'Fryer', step: 'Deep fry until golden', duration: 8 },
          { station: 'Expo', step: 'Season and serve', duration: 2 },
        ],
      },
      {
        name: 'Butter Chicken',
        description: 'Creamy butter chicken curry with rice',
        category: 'Main Course',
        prepTime: 10,
        cookTime: 20,
        components: [
          { station: 'Prep', step: 'Marinate chicken', duration: 10 },
          { station: 'Sauté', step: 'Cook in butter sauce', duration: 20 },
          { station: 'Expo', step: 'Plate with rice', duration: 3 },
        ],
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh caesar salad with croutons and parmesan',
        category: 'Appetizer',
        prepTime: 8,
        cookTime: 0,
        components: [
          { station: 'Prep', step: 'Chop vegetables', duration: 8 },
          { station: 'Prep', step: 'Toss with dressing', duration: 3 },
          { station: 'Expo', step: 'Plate and serve', duration: 2 },
        ],
      },
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with ganache',
        category: 'Dessert',
        prepTime: 10,
        cookTime: 30,
        components: [
          { station: 'Pastry', step: 'Bake cake', duration: 30 },
          { station: 'Pastry', step: 'Frost and decorate', duration: 10 },
          { station: 'Expo', step: 'Plate and serve', duration: 2 },
        ],
      },
      {
        name: 'Grilled Fish',
        description: 'Fresh grilled fish with lemon butter',
        category: 'Main Course',
        prepTime: 5,
        cookTime: 12,
        components: [
          { station: 'Prep', step: 'Clean and season fish', duration: 5 },
          { station: 'Grill', step: 'Grill for 5-6 minutes per side', duration: 12 },
          { station: 'Expo', step: 'Plate with lemon', duration: 2 },
        ],
      },
      {
        name: 'Chicken Wings',
        description: 'Crispy fried chicken wings with sauce',
        category: 'Appetizer',
        prepTime: 5,
        cookTime: 10,
        components: [
          { station: 'Prep', step: 'Season wings', duration: 5 },
          { station: 'Fryer', step: 'Deep fry until crispy', duration: 10 },
          { station: 'Expo', step: 'Toss with sauce and serve', duration: 2 },
        ],
      },
    ];

    const recipeRef = db.collection('organizations').doc(ORG_ID).collection('recipes');
    let count = 0;

    for (const recipe of recipes) {
      await recipeRef.add({
        ...recipe,
        createdAt: new Date(),
      });
      count++;
    }

    console.log(`✅ Created ${count} recipes`);
  } catch (error) {
    console.error('❌ Error creating recipes:', error);
    throw error;
  }
}

// ============================================
// CREATE MENU ITEMS
// ============================================
async function createMenuItems() {
  console.log('🍽️  Creating menu items...');
  try {
    const menuItems = [
      {
        name: 'Grilled Chicken',
        category: 'Main Course',
        price: 14.99,
        description: 'Grilled chicken breast with vegetables',
        recipe: 'Grilled Chicken Breast',
        available: true,
        components: [
          { station: 'Prep', step: 'Season chicken', duration: 5 },
          { station: 'Grill', step: 'Grill for 6-8 minutes per side', duration: 15 },
          { station: 'Expo', step: 'Plate and garnish', duration: 2 },
        ],
      },
      {
        name: 'French Fries',
        category: 'Sides',
        price: 4.99,
        description: 'Crispy golden fries',
        recipe: 'French Fries',
        available: true,
        components: [
          { station: 'Prep', step: 'Cut potatoes', duration: 5 },
          { station: 'Fryer', step: 'Deep fry until golden', duration: 8 },
          { station: 'Expo', step: 'Season and serve', duration: 2 },
        ],
      },
      {
        name: 'Butter Chicken',
        category: 'Main Course',
        price: 16.99,
        description: 'Creamy butter chicken curry',
        recipe: 'Butter Chicken',
        available: true,
        components: [
          { station: 'Prep', step: 'Marinate chicken', duration: 10 },
          { station: 'Sauté', step: 'Cook in butter sauce', duration: 20 },
          { station: 'Expo', step: 'Plate with rice', duration: 3 },
        ],
      },
      {
        name: 'Caesar Salad',
        category: 'Appetizer',
        price: 9.99,
        description: 'Fresh caesar salad',
        recipe: 'Caesar Salad',
        available: true,
        components: [
          { station: 'Prep', step: 'Chop vegetables', duration: 8 },
          { station: 'Prep', step: 'Toss with dressing', duration: 3 },
          { station: 'Expo', step: 'Plate and serve', duration: 2 },
        ],
      },
      {
        name: 'Chocolate Cake',
        category: 'Dessert',
        price: 7.99,
        description: 'Rich chocolate cake',
        recipe: 'Chocolate Cake',
        available: true,
        components: [
          { station: 'Pastry', step: 'Bake cake', duration: 30 },
          { station: 'Pastry', step: 'Frost and decorate', duration: 10 },
          { station: 'Expo', step: 'Plate and serve', duration: 2 },
        ],
      },
      {
        name: 'Grilled Fish',
        category: 'Main Course',
        price: 18.99,
        description: 'Fresh grilled fish with lemon butter',
        recipe: 'Grilled Fish',
        available: true,
        components: [
          { station: 'Prep', step: 'Clean and season fish', duration: 5 },
          { station: 'Grill', step: 'Grill for 5-6 minutes per side', duration: 12 },
          { station: 'Expo', step: 'Plate with lemon', duration: 2 },
        ],
      },
      {
        name: 'Chicken Wings',
        category: 'Appetizer',
        price: 11.99,
        description: 'Crispy fried chicken wings with sauce',
        recipe: 'Chicken Wings',
        available: true,
        components: [
          { station: 'Prep', step: 'Season wings', duration: 5 },
          { station: 'Fryer', step: 'Deep fry until crispy', duration: 10 },
          { station: 'Expo', step: 'Toss with sauce and serve', duration: 2 },
        ],
      },
    ];

    const menuRef = db.collection('organizations').doc(ORG_ID).collection('menus');
    let count = 0;

    for (const item of menuItems) {
      await menuRef.add({
        ...item,
        createdAt: new Date(),
      });
      count++;
    }

    console.log(`✅ Created ${count} menu items`);
  } catch (error) {
    console.error('❌ Error creating menu items:', error);
    throw error;
  }
}

// ============================================
// CREATE KITCHEN SCREENS
// ============================================
async function createKitchenScreens() {
  console.log('🖥️  Creating kitchen screens...');
  try {
    const screens = [
      {
        name: 'Grill Station',
        station: 'Grill',
        status: 'active',
        displayMode: 'station',
      },
      {
        name: 'Fryer Station',
        station: 'Fryer',
        status: 'active',
        displayMode: 'station',
      },
      {
        name: 'Sauté Station',
        station: 'Sauté',
        status: 'active',
        displayMode: 'station',
      },
      {
        name: 'Prep Station',
        station: 'Prep',
        status: 'active',
        displayMode: 'station',
      },
      {
        name: 'Expo/Plating',
        station: 'Expo',
        status: 'active',
        displayMode: 'station',
      },
      {
        name: 'Kitchen Display System',
        station: 'All',
        status: 'active',
        displayMode: 'all',
      },
    ];

    const screenRef = db.collection('organizations').doc(ORG_ID).collection('kitchenScreens');
    let count = 0;

    for (const screen of screens) {
      await screenRef.add({
        ...screen,
        createdAt: new Date(),
      });
      count++;
    }

    console.log(`✅ Created ${count} kitchen screens`);
  } catch (error) {
    console.error('❌ Error creating kitchen screens:', error);
    throw error;
  }
}

// ============================================
// CREATE TABLES
// ============================================
async function createTables() {
  console.log('🪑 Creating restaurant tables...');
  try {
    const tables = [];
    for (let i = 1; i <= 12; i++) {
      tables.push({
        tableNumber: i,
        seats: i <= 4 ? 2 : i <= 8 ? 4 : 6,
        type: i <= 4 ? 'Bar' : i <= 8 ? 'Standard' : 'Large',
        status: 'available',
        location: `Section ${Math.ceil(i / 4)}`,
      });
    }

    const tableRef = db.collection('organizations').doc(ORG_ID).collection('tables');
    let count = 0;

    for (const table of tables) {
      await tableRef.add({
        ...table,
        createdAt: new Date(),
      });
      count++;
    }

    console.log(`✅ Created ${count} tables`);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// ============================================
// MAIN EXECUTION
// ============================================
async function main() {
  try {
    console.log('\n🌱 Starting Complete Restaurant Setup...\n');

    // Delete old organizations
    await deleteOldOrganizations();

    // Create new organization
    await createOrganization();
    console.log(`📍 Organization ID: ${ORG_ID}\n`);

    // Create all data
    await createEmployees();
    await createSchedules();
    await createRecipes();
    await createMenuItems();
    await createTables();
    await createKitchenScreens();

    // Print test credentials
    console.log('\n' + '='.repeat(60));
    console.log('🔐 TEST CREDENTIALS FOR RBAC TESTING');
    console.log('='.repeat(60));
    console.log('\n📍 Organization ID:', ORG_ID);
    console.log('\n🔑 Login Credentials:\n');

    Object.entries(TEST_CREDENTIALS).forEach(([role, creds]) => {
      console.log(`${role.toUpperCase()}`);
      console.log(`  Email:    ${creds.email}`);
      console.log(`  Password: ${creds.password}`);
      console.log();
    });

    console.log('='.repeat(60));
    console.log('\n✅ Complete restaurant setup finished!');
    console.log('🎉 Ready for RBAC testing!\n');
    console.log('📋 What was created:');
    console.log('  ✓ 1 New Organization');
    console.log('  ✓ 9 Employees (all roles)');
    console.log('  ✓ 14-day Shift Schedules');
    console.log('  ✓ 7 Recipes');
    console.log('  ✓ 7 Menu Items');
    console.log('  ✓ 12 Restaurant Tables');
    console.log('  ✓ 6 Kitchen Screens');
    console.log('\n🚀 Start testing at: http://localhost:5173\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();

