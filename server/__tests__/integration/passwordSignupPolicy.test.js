const request = require("supertest");
const app = require("../../app");
const db = require("../helpers/db");

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clearDatabase(); });
afterAll(async () => { await db.closeDatabase(); });

describe("password policy on signup", () => {
  it("rejects a password shorter than 10 characters", async () => {
    const res = await request(app).post("/api/user/signup").send({
      username: "Short", email: "short@example.com", password: "Ab1defg",
    });
    expect(res.status).toBe(400);
  });

  it("rejects a password longer than 128 characters", async () => {
    const res = await request(app).post("/api/user/signup").send({
      username: "Long", email: "long@example.com", password: "A1" + "a".repeat(130),
    });
    expect(res.status).toBe(400);
  });

  it("rejects a common password", async () => {
    const res = await request(app).post("/api/user/signup").send({
      username: "Common", email: "common@example.com", password: "password123",
    });
    expect(res.status).toBe(400);
  });

  it("rejects a password containing the email's local part", async () => {
    const res = await request(app).post("/api/user/signup").send({
      username: "Selfref", email: "selfref@example.com", password: "selfref-password-1",
    });
    expect(res.status).toBe(400);
  });

  it("accepts a strong, non-common password", async () => {
    const res = await request(app).post("/api/user/signup").send({
      username: "Strong", email: "strong@example.com", password: "Correct-Horse-42",
    });
    expect(res.status).toBe(200);
  });
});
