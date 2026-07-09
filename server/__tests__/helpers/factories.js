const crypto = require("crypto");
const User = require("../../models/user");
const Food = require("../../models/Food");

async function createUser({ email, password = "Test-Passw0rd-42", name = "Test User", role = "customer" } = {}) {
  const user = new User({ email: email || `user-${crypto.randomUUID()}@example.com`, name, role });
  return User.registerNewUser(user, password);
}

async function createAdmin(overrides = {}) {
  return createUser({ role: "admin", ...overrides });
}

async function createFood(overrides = {}) {
  return Food.create({
    name: "Test Dabeli",
    price: 9.99,
    category: "Signature Dabeli",
    imageUrl: "https://example.com/image.jpg",
    available: true,
    ...overrides,
  });
}

module.exports = { createUser, createAdmin, createFood };
