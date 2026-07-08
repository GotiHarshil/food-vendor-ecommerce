const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async function globalSetup() {
  const instance = await MongoMemoryServer.create();
  global.__MONGOINSTANCE = instance;
  process.env.MONGO_URL = instance.getUri();
  process.env.NODE_ENV = "test";
  process.env.SECRET = "test-secret";
  process.env.SESSION_SECRET = "test-session-secret";
  process.env.CLIENT_URL = "http://localhost:5173";
};
