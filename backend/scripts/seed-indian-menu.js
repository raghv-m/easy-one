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

// Indian Menu Items with realistic recipes and prices
const indianMenuItems = [
  {
    name: 'Butter Chicken (Murgh Makhani)',
    category: 'Main Course',
    price: 14.99,
    description: 'Tender chicken in creamy tomato-based sauce with butter and cream',
    prepTime: 5,
    cookTime: 25,
    components: [
      { step: 'Marinate chicken in yogurt and spices', station: 'Prep', duration: 5 },
      { step: 'Grill chicken until cooked through', station: 'Grill', duration: 12 },
      { step: 'Prepare tomato-cream sauce', station: 'Sauté', duration: 8 },
      { step: 'Combine chicken with sauce', station: 'Sauté', duration: 5 },
      { step: 'Plate and garnish with cilantro', station: 'Plating', duration: 2 },
    ],
    allergens: ['Dairy', 'Gluten'],
  },
  {
    name: 'Paneer Tikka Masala',
    category: 'Main Course',
    price: 13.99,
    description: 'Cottage cheese cubes in aromatic tomato-based curry with spices',
    prepTime: 5,
    cookTime: 20,
    components: [
      { step: 'Cut paneer into cubes and marinate', station: 'Prep', duration: 5 },
      { step: 'Grill paneer until golden', station: 'Grill', duration: 8 },
      { step: 'Prepare masala sauce with tomatoes', station: 'Sauté', duration: 10 },
      { step: 'Combine paneer with sauce', station: 'Sauté', duration: 2 },
      { step: 'Plate with rice and garnish', station: 'Plating', duration: 2 },
    ],
    allergens: ['Dairy', 'Gluten'],
  },
  {
    name: 'Tandoori Chicken',
    category: 'Main Course',
    price: 12.99,
    description: 'Marinated chicken cooked in traditional tandoor oven',
    prepTime: 10,
    cookTime: 20,
    components: [
      { step: 'Marinate chicken in yogurt and tandoori spices', station: 'Prep', duration: 10 },
      { step: 'Cook in tandoor oven', station: 'Grill', duration: 18 },
      { step: 'Rest chicken for 2 minutes', station: 'Grill', duration: 2 },
      { step: 'Plate with lemon and onions', station: 'Plating', duration: 2 },
    ],
    allergens: ['Dairy'],
  },
  {
    name: 'Biryani (Chicken)',
    category: 'Main Course',
    price: 13.99,
    description: 'Fragrant basmati rice cooked with marinated chicken and spices',
    prepTime: 5,
    cookTime: 30,
    components: [
      { step: 'Marinate chicken with yogurt and spices', station: 'Prep', duration: 5 },
      { step: 'Parboil basmati rice', station: 'Prep', duration: 8 },
      { step: 'Layer rice and chicken in pot', station: 'Sauté', duration: 3 },
      { step: 'Cook on high heat for 2 minutes', station: 'Sauté', duration: 2 },
      { step: 'Reduce heat and cook covered for 15 minutes', station: 'Sauté', duration: 15 },
      { step: 'Plate and garnish with mint', station: 'Plating', duration: 2 },
    ],
    allergens: ['Gluten'],
  },
  {
    name: 'Samosa (3 pieces)',
    category: 'Appetizers',
    price: 4.99,
    description: 'Crispy pastry filled with spiced potatoes and peas',
    prepTime: 5,
    cookTime: 12,
    components: [
      { step: 'Prepare potato and pea filling', station: 'Prep', duration: 5 },
      { step: 'Wrap filling in pastry sheets', station: 'Prep', duration: 5 },
      { step: 'Deep fry until golden brown', station: 'Fryer', duration: 8 },
      { step: 'Drain and plate with chutney', station: 'Plating', duration: 2 },
    ],
    allergens: ['Gluten'],
  },
  {
    name: 'Pakora (Mixed Vegetable)',
    category: 'Appetizers',
    price: 5.99,
    description: 'Vegetables dipped in spiced chickpea batter and deep fried',
    prepTime: 5,
    cookTime: 10,
    components: [
      { step: 'Prepare chickpea batter with spices', station: 'Prep', duration: 3 },
      { step: 'Cut vegetables into bite-sized pieces', station: 'Prep', duration: 2 },
      { step: 'Dip vegetables in batter', station: 'Prep', duration: 2 },
      { step: 'Deep fry until golden', station: 'Fryer', duration: 8 },
      { step: 'Drain and plate with tamarind chutney', station: 'Plating', duration: 2 },
    ],
    allergens: ['Gluten'],
  },
  {
    name: 'Naan Bread',
    category: 'Breads',
    price: 2.99,
    description: 'Traditional Indian flatbread baked in tandoor oven',
    prepTime: 5,
    cookTime: 5,
    components: [
      { step: 'Prepare dough with flour and yogurt', station: 'Prep', duration: 3 },
      { step: 'Roll dough into flat rounds', station: 'Prep', duration: 2 },
      { step: 'Bake in tandoor oven', station: 'Pastry', duration: 4 },
      { step: 'Brush with butter and plate', station: 'Plating', duration: 1 },
    ],
    allergens: ['Gluten', 'Dairy'],
  },
  {
    name: 'Garlic Naan',
    category: 'Breads',
    price: 3.49,
    description: 'Naan bread topped with fresh garlic and cilantro',
    prepTime: 5,
    cookTime: 5,
    components: [
      { step: 'Prepare naan dough', station: 'Prep', duration: 3 },
      { step: 'Roll and top with minced garlic', station: 'Prep', duration: 2 },
      { step: 'Bake in tandoor oven', station: 'Pastry', duration: 4 },
      { step: 'Brush with butter and cilantro', station: 'Plating', duration: 1 },
    ],
    allergens: ['Gluten', 'Dairy'],
  },
  {
    name: 'Dal Makhani',
    category: 'Vegetarian',
    price: 9.99,
    description: 'Creamy lentil curry with butter and cream',
    prepTime: 5,
    cookTime: 35,
    components: [
      { step: 'Soak and cook black lentils', station: 'Prep', duration: 20 },
      { step: 'Prepare tomato-cream base', station: 'Sauté', duration: 8 },
      { step: 'Combine lentils with sauce', station: 'Sauté', duration: 5 },
      { step: 'Simmer for 2 minutes', station: 'Sauté', duration: 2 },
      { step: 'Plate and garnish with cream', station: 'Plating', duration: 1 },
    ],
    allergens: ['Dairy', 'Gluten'],
  },
  {
    name: 'Chana Masala',
    category: 'Vegetarian',
    price: 8.99,
    description: 'Chickpeas in aromatic tomato-based curry',
    prepTime: 5,
    cookTime: 20,
    components: [
      { step: 'Sauté onions and ginger-garlic paste', station: 'Sauté', duration: 3 },
      { step: 'Add tomatoes and spices', station: 'Sauté', duration: 5 },
      { step: 'Add cooked chickpeas', station: 'Sauté', duration: 2 },
      { step: 'Simmer for 10 minutes', station: 'Sauté', duration: 10 },
      { step: 'Plate and garnish with cilantro', station: 'Plating', duration: 1 },
    ],
    allergens: ['Gluten'],
  },
  {
    name: 'Gulab Jamun (3 pieces)',
    category: 'Desserts',
    price: 4.99,
    description: 'Soft milk solids dumplings in sugar syrup',
    prepTime: 5,
    cookTime: 15,
    components: [
      { step: 'Prepare milk solids dough', station: 'Pastry', duration: 5 },
      { step: 'Roll into balls', station: 'Pastry', duration: 3 },
      { step: 'Deep fry until golden', station: 'Fryer', duration: 5 },
      { step: 'Soak in warm sugar syrup', station: 'Pastry', duration: 2 },
      { step: 'Plate and serve warm', station: 'Plating', duration: 1 },
    ],
    allergens: ['Dairy', 'Gluten'],
  },
  {
    name: 'Mango Lassi',
    category: 'Beverages',
    price: 3.99,
    description: 'Refreshing yogurt-based drink with fresh mango',
    prepTime: 3,
    cookTime: 0,
    components: [
      { step: 'Blend yogurt with fresh mango', station: 'Prep', duration: 2 },
      { step: 'Add sugar and cardamom', station: 'Prep', duration: 1 },
      { step: 'Pour into glass and add ice', station: 'Plating', duration: 1 },
    ],
    allergens: ['Dairy'],
  },
  {
    name: 'Masala Chai',
    category: 'Beverages',
    price: 2.49,
    description: 'Traditional Indian spiced tea with milk',
    prepTime: 2,
    cookTime: 5,
    components: [
      { step: 'Brew black tea with spices', station: 'Prep', duration: 4 },
      { step: 'Add milk and sugar', station: 'Prep', duration: 1 },
      { step: 'Pour into cup and serve', station: 'Plating', duration: 1 },
    ],
    allergens: ['Dairy'],
  },
];

async function seedMenu() {
  try {
    // Use the organization ID from environment or default
    const orgId = process.env.ORG_ID || 'easy-one-a9576';

    console.log(`🌱 Seeding Indian menu items for organization: ${orgId}`);

    for (const item of indianMenuItems) {
      const itemRef = db
        .collection('organizations')
        .doc(orgId)
        .collection('menus')
        .doc();

      const menuItem = {
        id: itemRef.id,
        ...item,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await itemRef.set(menuItem);
      console.log(`✅ Added: ${item.name}`);
    }

    console.log(`\n✅ Successfully seeded ${indianMenuItems.length} Indian menu items!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding menu:', error);
    process.exit(1);
  }
}

seedMenu();

