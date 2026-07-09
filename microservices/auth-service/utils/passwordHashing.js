// Password storage: argon2id (OWASP's current top recommendation for password
// hashing — memory-hard, PHC-competition winner, stronger against GPU/ASIC
// cracking than PBKDF2 or bcrypt) with an application-wide pepper.
//
// The pepper is applied as HMAC-SHA256(key = PASSWORD_PEPPER, message = password)
// BEFORE argon2id, rather than concatenated onto the password. HMAC treats the
// pepper as a formal MAC key (PRF security guarantees) and always yields a fixed
// 32-byte input regardless of password length/encoding, unlike concatenation.
// The pepper lives only in env config (never the database), so it's a
// defense-in-depth control against a database-only compromise.
//
// Cost params below (memory=64MiB, time=3, parallelism=1) follow OWASP's
// Password Storage Cheat Sheet argon2id guidance, sized for a modest
// single-host deployment.
//
// Known, accepted limitation for this project's scope: no pepper
// rotation/versioning. Rotating PASSWORD_PEPPER invalidates all existing
// hashes; that's an acceptable trade-off here, not an oversight.
const crypto = require("crypto");
const argon2 = require("argon2");

const IS_TEST = process.env.NODE_ENV === "test";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: IS_TEST ? 2 ** 12 : 2 ** 16, // 4 MiB in tests, 64 MiB otherwise
  timeCost: IS_TEST ? 2 : 3,
  parallelism: 1,
};

function applyPepper(plaintextPassword) {
  const pepper = process.env.PASSWORD_PEPPER;
  if (!pepper) {
    throw new Error("PASSWORD_PEPPER is not configured");
  }
  return crypto.createHmac("sha256", pepper).update(plaintextPassword, "utf8").digest();
}

async function hashPassword(plaintextPassword) {
  return argon2.hash(applyPepper(plaintextPassword), ARGON2_OPTIONS);
}

async function verifyPasswordHash(encodedHash, plaintextPassword) {
  return argon2.verify(encodedHash, applyPepper(plaintextPassword));
}

module.exports = { hashPassword, verifyPasswordHash, ARGON2_OPTIONS };
