const crypto = require("crypto");
const request = require("supertest");
const app = require("../../app");
const db = require("../helpers/db");
const { createUser } = require("../helpers/factories");

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clearDatabase(); });
afterAll(async () => { await db.closeDatabase(); });

async function seedResetToken(email) {
  const user = await createUser({ email, password: "Test-Passw0rd-42" });
  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();
  return rawToken;
}

describe("POST /api/user/reset-password", () => {
  it("resets the password with a valid token", async () => {
    const email = "reset@example.com";
    const rawToken = await seedResetToken(email);

    const res = await request(app).post("/api/user/reset-password").send({
      token: rawToken,
      newPassword: "Brand-New-Pass-9",
    });
    expect(res.status).toBe(200);

    const oldLogin = await request(app).post("/api/user/login").send({ email, password: "Test-Passw0rd-42" });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app).post("/api/user/login").send({ email, password: "Brand-New-Pass-9" });
    expect(newLogin.status).toBe(200);
  });

  it("rejects an invalid token", async () => {
    const res = await request(app).post("/api/user/reset-password").send({
      token: "not-a-real-token",
      newPassword: "Reset-Strong-Pass-9",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid or expired reset link");
  });

  it("rejects an expired token", async () => {
    const email = "expired@example.com";
    const user = await createUser({ email, password: "Test-Passw0rd-42" });
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetTokenExpiry = new Date(Date.now() - 1000);
    await user.save();

    const res = await request(app).post("/api/user/reset-password").send({
      token: rawToken,
      newPassword: "Reset-Strong-Pass-9",
    });
    expect(res.status).toBe(400);
  });

  it("rejects a weak new password even with a valid token", async () => {
    const email = "weakreset@example.com";
    const rawToken = await seedResetToken(email);

    const res = await request(app).post("/api/user/reset-password").send({
      token: rawToken,
      newPassword: "short",
    });
    expect(res.status).toBe(400);
  });
});
