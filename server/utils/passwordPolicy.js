// Password validation follows NIST SP 800-63B guidance: prioritize length and
// checks against known-common/breached passwords over forced composition
// rules (mandatory uppercase/digit/symbol requirements are explicitly
// discouraged by current NIST guidance — they push users toward predictable
// patterns like "Password1!" without meaningfully raising entropy).
//
// The max-length cap matters specifically because hashing now goes through
// argon2id, which is deliberately memory/time-hard: an unbounded-length
// password is a real hashing-cost DoS vector, so length is capped before it
// ever reaches hashPassword().
const MIN_LENGTH = 10;
const MAX_LENGTH = 128;

// Small, bundled sample of frequently breached/guessed passwords (sourced from
// publicly published "most common passwords" lists). Intentionally offline/
// deterministic rather than calling an external breach-check API, so this
// stays fast and doesn't add a network dependency or external failure mode to
// signup/password-change flows.
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "password1234",
  "12345678", "123456789", "1234567890", "12345678910",
  "qwerty123", "qwerty1234", "qwerty12345", "qwertyuiop",
  "letmein123", "letmein1234", "welcome123", "welcome1234",
  "admin12345", "administrator", "iloveyou123", "iloveyou1234",
  "monkey12345", "dragon12345", "football123", "baseball123",
  "sunshine123", "princess123", "superman123", "trustno1234",
  "master12345", "shadow12345", "michael1234", "jennifer123",
  "computer123", "internet123", "changeme123", "changeme1234",
  "abcdefghij", "abcdefgh123", "1qaz2wsx3edc", "1q2w3e4r5t",
  "zaq12wsx3edc", "passw0rd123", "p@ssw0rd123", "p@ssword123",
  "letmein12345", "whatever123", "freedom12345", "trustno1",
  "starwars123", "hello12345", "hello123456", "flower1234",
  "hunter12345", "ranger12345", "buster12345", "soccer12345",
  "harley12345", "hockey123456", "george123456", "ashley123456",
  "bailey123456", "passport123", "market123456", "access1234",
  "yankees1234", "987654321", "1111111111", "0000000000",
  "1234554321", "123123123123", "qazwsx123456", "loveme123456",
  "secret123456", "summer12345", "winter12345", "autumn12345",
  "spring12345", "december2024", "january2025", "november2024",
]);

function validatePasswordStrength(password, { email } = {}) {
  if (typeof password !== "string" || password.length < MIN_LENGTH) {
    return { valid: false, reason: `Password must be at least ${MIN_LENGTH} characters` };
  }
  if (password.length > MAX_LENGTH) {
    return { valid: false, reason: `Password must be at most ${MAX_LENGTH} characters` };
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { valid: false, reason: "This password is too common; please choose another" };
  }
  if (email) {
    const localPart = String(email).split("@")[0].toLowerCase();
    if (localPart.length >= 4 && password.toLowerCase().includes(localPart)) {
      return { valid: false, reason: "Password must not contain your email address" };
    }
  }
  return { valid: true };
}

module.exports = { validatePasswordStrength, MIN_LENGTH, MAX_LENGTH };
