const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Food = require("./models/Food");
const { uploadToCloudinary } = require("./utils/uploadToCloudinary");

async function migrateImages() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✓ Connected\n");

    const items = await Food.find({ imageUrl: { $regex: "^/images/" } });
    console.log(`Found ${items.length} items with local images\n`);

    const imagesDir = path.join(__dirname, "public", "images");

    for (const item of items) {
      const fileName = item.imageUrl.split("/").pop();
      const filePath = path.join(imagesDir, fileName);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${item.name}: Image file not found (${fileName})`);
        continue;
      }

      try {
        const fileBuffer = fs.readFileSync(filePath);
        console.log(`📤 Uploading ${item.name}...`);

        const result = await uploadToCloudinary(fileBuffer, fileName);

        item.imageUrl = result.secure_url;
        await item.save();

        console.log(`✓ ${item.name}: ${result.secure_url}\n`);
      } catch (error) {
        console.error(`❌ ${item.name}: ${error.message}\n`);
      }
    }

    console.log("✅ Migration complete");
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

migrateImages();
