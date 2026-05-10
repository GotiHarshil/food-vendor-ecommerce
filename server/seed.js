// server/seed.js — Run with: node seed.js
// Seeds the database with food items using real images from Unsplash
// Also creates an admin user if one doesn't exist

require("dotenv").config();
const mongoose = require("mongoose");
const Food = require("./models/Food");
const User = require("./models/user");
const StoreSettings = require("./models/StoreSettings");

const MONGO_URL = process.env.MONGO_URL;

const foodItems = [
  // Signature Dabeli
  {
    name: "Classic Dabeli",
    price: 3.99,
    description: "The original street-style dabeli with spiced potato filling, pomegranate, and crunchy sev.",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80",
    category: "Signature Dabeli",
    available: true,
  },
  {
    name: "Cheese Dabeli",
    price: 4.99,
    description: "Classic dabeli loaded with a generous layer of melted cheese on top.",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
    category: "Signature Dabeli",
    available: true,
  },
  {
    name: "Butter Dabeli",
    price: 4.49,
    description: "Rich buttery dabeli with extra masala and topped with fine sev.",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    category: "Signature Dabeli",
    available: true,
  },

  // Spicy Specials
  {
    name: "Fire Cracker Dabeli",
    price: 5.49,
    description: "Extremely spicy dabeli with green chili chutney and hot pepper flakes.",
    imageUrl: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&q=80",
    category: "Spicy Specials",
    available: true,
  },
  {
    name: "Schezwan Dabeli",
    price: 5.99,
    description: "Indo-Chinese fusion with schezwan sauce, crispy noodles, and spiced filling.",
    imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880049?w=500&q=80",
    category: "Spicy Specials",
    available: true,
  },
  {
    name: "Peri Peri Dabeli",
    price: 5.49,
    description: "Dabeli with African-inspired peri peri spice blend and tangy sauce.",
    imageUrl: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&q=80",
    category: "Spicy Specials",
    available: true,
  },

  // Loaded Varieties
  {
    name: "Dabeli Pizza",
    price: 7.99,
    description: "Dabeli-inspired pizza with spiced potato, pomegranate, sev, and mozzarella.",
    imageUrl: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&q=80",
    category: "Loaded Varieties",
    available: true,
  },
  {
    name: "Loaded Nachos Dabeli",
    price: 6.99,
    description: "Crispy nachos topped with dabeli masala, cheese sauce, and fresh salsa.",
    imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&q=80",
    category: "Loaded Varieties",
    available: true,
  },
  {
    name: "Dabeli Wrap",
    price: 6.49,
    description: "All the goodness of dabeli rolled in a soft tortilla with extra toppings.",
    imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80",
    category: "Loaded Varieties",
    available: true,
  },

  // Snacks and sides
  {
    name: "Masala Fries",
    price: 3.99,
    description: "Crispy golden fries tossed with our special masala blend and served with chutney.",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80",
    category: "Snacks and sides",
    available: true,
  },
  {
    name: "Samosa (2 pcs)",
    price: 3.49,
    description: "Crispy fried pastry filled with spiced potato and peas.",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80",
    category: "Snacks and sides",
    available: true,
  },
  {
    name: "Pani Puri (6 pcs)",
    price: 4.99,
    description: "Crispy hollow shells filled with spiced water, tamarind, and potato.",
    imageUrl: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=500&q=80",
    category: "Snacks and sides",
    available: true,
  },

  // Beverages
  {
    name: "Masala Chai",
    price: 2.49,
    description: "Traditional Indian spiced tea with ginger, cardamom, and fresh milk.",
    imageUrl: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=500&q=80",
    category: "Beverages",
    available: true,
  },
  {
    name: "Mango Lassi",
    price: 3.99,
    description: "Creamy yogurt smoothie blended with ripe Alphonso mangoes.",
    imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&q=80",
    category: "Beverages",
    available: true,
  },
  {
    name: "Fresh Lime Soda",
    price: 2.99,
    description: "Refreshing fizzy drink with fresh lime juice, salt, and a hint of cumin.",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
    category: "Beverages",
    available: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");

    // Seed food items (only if collection is empty or few items)
    const existingCount = await Food.countDocuments();
    if (existingCount < 5) {
      console.log("Seeding food items...");
      await Food.deleteMany({});
      await Food.insertMany(foodItems);
      console.log(`Seeded ${foodItems.length} food items`);
    } else {
      console.log(`Skipping food seed (${existingCount} items already exist). Use --force to re-seed.`);
      if (process.argv.includes("--force")) {
        await Food.deleteMany({});
        await Food.insertMany(foodItems);
        console.log(`Force re-seeded ${foodItems.length} food items`);
      }
    }

    // Initialize store settings
    await StoreSettings.getSettings();
    console.log("Store settings initialized");

    // Create admin user if none exists
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      console.log("\n--- No admin user found ---");
      console.log("Creating default admin: admin@manu.com / admin123");
      try {
        const adminUser = new User({
          email: "admin@manu.com",
          name: "Admin",
          role: "admin",
        });
        await User.register(adminUser, "admin123");
        console.log("Admin user created successfully!");
      } catch (e) {
        if (e.message.includes("already")) {
          // User exists but not marked as admin
          await User.findOneAndUpdate({ email: "admin@manu.com" }, { role: "admin" });
          console.log("Existing user promoted to admin");
        } else {
          console.error("Error creating admin:", e.message);
        }
      }
    } else {
      console.log(`Admin user exists: ${adminExists.email}`);
    }

    console.log("\nSeed complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
