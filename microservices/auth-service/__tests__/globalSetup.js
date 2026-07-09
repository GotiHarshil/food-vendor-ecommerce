const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async function globalSetup() {
  const instance = await MongoMemoryServer.create();
  global.__MONGOINSTANCE = instance;
  process.env.MONGO_URI = instance.getUri();
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.NODE_ENV = "test";
  process.env.PASSWORD_PEPPER = "test-pepper-not-for-production-use";
};
