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
    name: "Butter Dabeli",
    price: 6.99,
    description: "Rich buttery dabeli with extra masala and topped with fine sev.",
    imageUrl: "/images/butter-dabeli.png",
    category: "Signature Dabeli",
    available: true,
  },
  {
    name: "Cheese Dabeli",
    price: 7.99,
    description: "Classic dabeli loaded with a generous layer of melted cheese on top.",
    imageUrl: "/images/cheese-dabeli.png",
    category: "Signature Dabeli",
    available: true,
  },
  {
    name: "Swaminarayan Dabeli",
    price: 6.99,
    description: "A pure vegetarian dabeli made without onion and garlic, inspired by Swaminarayan dietary traditions.",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80",
    category: "Signature Dabeli",
    available: true,
  },
  {
    name: "Butter Vada Pav",
    price: 6.99,
    description: "Mumbai-style vada pav with a buttery toasted bun and spiced potato fritter.",
    imageUrl: "/images/Garlic_Vadapav.JPG",
    category: "Signature Dabeli",
    available: true,
  },
  {
    name: "Cheese Vada Pav",
    price: 7.99,
    description: "Vada pav topped with melted cheese for an indulgent twist on the classic.",
    imageUrl: "/images/cheese-vada-pav.png",
    category: "Signature Dabeli",
    available: true,
  },

  // Spicy Specials
  {
    name: "Garlic Dabeli",
    price: 7.99,
    description: "Bold and spicy dabeli loaded with roasted garlic chutney and crunchy sev.",
    imageUrl: "/images/Garlic_Dabeli.JPG",
    category: "Spicy Specials",
    available: true,
  },
  {
    name: "Cheese Garlic Dabeli",
    price: 8.99,
    description: "Spicy garlic dabeli topped with a generous layer of melted cheese.",
    imageUrl: "/images/cheese-dabeli.png",
    category: "Spicy Specials",
    available: true,
  },
  {
    name: "Garlic VadaPav",
    price: 7.99,
    description: "Classic vada pav elevated with a punchy roasted garlic chutney.",
    imageUrl: "/images/Garlic_Vadapav.JPG",
    category: "Spicy Specials",
    available: true,
  },
  {
    name: "Cheese Garlic VadaPav",
    price: 8.99,
    description: "Garlic vada pav with a cheesy topping for the ultimate indulgence.",
    imageUrl: "/images/cheese-garlic-vadapav.png",
    category: "Spicy Specials",
    available: true,
  },

  // Loaded Varieties
  {
    name: "Veg Aloo Tikki Burger",
    price: 9.99,
    description: "Crispy spiced potato tikki patty in a toasted bun with chutney and fresh toppings.",
    imageUrl: "/images/veg-aloo-tikki-burger.png",
    category: "Loaded Varieties",
    available: true,
  },
  {
    name: "Paneer Tikka Sub (Full)",
    price: 14.99,
    description: "Marinated paneer tikka packed into a full-size sub with veggies and sauces.",
    imageUrl: "/images/Panner_Sub.jpg",
    category: "Loaded Varieties",
    available: true,
  },
  {
    name: "Paneer Tikka Sub (Half)",
    price: 7.99,
    description: "Marinated paneer tikka in a half-size sub with veggies and sauces.",
    imageUrl: "/images/paneer-tikka-sub-half.png",
    category: "Loaded Varieties",
    available: true,
  },
  {
    name: "Doritos Sub (Full)",
    price: 14.99,
    description: "Full-size sub loaded with Doritos-crusted filling, spicy sauce, and fresh toppings.",
    imageUrl: "/images/doritos-sub.png",
    category: "Loaded Varieties",
    available: true,
  },
  {
    name: "Doritos Sub (Half)",
    price: 7.99,
    description: "Half-size sub with Doritos-crusted filling, spicy sauce, and fresh toppings.",
    imageUrl: "/images/doritos-sub-half.png",
    category: "Loaded Varieties",
    available: true,
  },
  {
    name: "Kachhi Kadak Bowl",
    price: 9.99,
    description: "Spicy and tangy Kutch-style snack bowl with crunchy toppings and chutneys.",
    imageUrl: "/images/kutchi-kadak-bowl.png",
    category: "Loaded Varieties",
    available: true,
  },
  {
    name: "Sev Usal (Bowl)",
    price: 11.99,
    description: "Spiced chickpea curry topped with crispy sev, onions, and fresh garnish.",
    imageUrl: "/images/sev-usal.png",
    category: "Loaded Varieties",
    available: true,
  },

  // Snacks and sides
  {
    name: "Punjabi Samosa (2 Pcs)",
    price: 4.99,
    description: "Crispy fried pastry filled with spiced potato and peas, Punjabi style.",
    imageUrl: "/images/samosas.png",
    category: "Snacks and sides",
    available: true,
  },
  {
    name: "Samosa Chaat",
    price: 7.99,
    description: "Crushed samosas topped with chickpea curry, yogurt, tamarind, and green chutneys.",
    imageUrl: "/images/samosas.png",
    category: "Snacks and sides",
    available: true,
  },
  {
    name: "French Fries",
    price: 4.99,
    description: "Golden crispy fries served with ketchup.",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80",
    category: "Snacks and sides",
    available: true,
  },
  {
    name: "Peri Peri Fries",
    price: 7.99,
    description: "Crispy fries tossed in a bold African peri peri spice blend.",
    imageUrl: "/images/peri-peri-fries.png",
    category: "Snacks and sides",
    available: true,
  },
  {
    name: "Desi Masala Fries",
    price: 8.99,
    description: "Crispy fries loaded with our signature desi masala seasoning and chutneys.",
    imageUrl: "/images/desi-masala-fries.png",
    category: "Snacks and sides",
    available: true,
  },

  // Beverages
  {
    name: "Indian Masala Tea",
    price: 1.99,
    description: "Traditional chai brewed with ginger, cardamom, and aromatic spices.",
    imageUrl: "/images/indian-masala-tea.png",
    category: "Beverages",
    available: true,
  },
  {
    name: "Sp. Masala Buttermilk",
    price: 2.99,
    description: "Chilled spiced buttermilk with cumin, ginger, and fresh herbs.",
    imageUrl: "/images/sp-masala-buttermilk.png",
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
      console.log("Creating default admin: admin@manu.com / Admin12345");
      try {
        const adminUser = new User({
          email: "admin@manu.com",
          name: "Admin",
          role: "admin",
        });
        await User.registerNewUser(adminUser, "Admin12345");
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
