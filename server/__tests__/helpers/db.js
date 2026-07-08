const mongoose = require("mongoose");

async function connect() {
  await mongoose.connect(process.env.MONGO_URL);
}

async function clearDatabase() {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

async function closeDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}

module.exports = { connect, clearDatabase, closeDatabase };
