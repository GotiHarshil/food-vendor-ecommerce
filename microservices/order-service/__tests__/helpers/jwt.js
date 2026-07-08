const jwt = require("jsonwebtoken");

function signToken({ id, email = "user@example.com", name = "Test User", role = "customer" } = {}) {
  return jwt.sign({ id, email, name, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

module.exports = { signToken };
