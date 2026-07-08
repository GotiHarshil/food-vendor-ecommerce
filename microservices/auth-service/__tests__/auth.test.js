const request = require("supertest");
const app = require("../app");
const db = require("./helpers/db");

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clearDatabase(); });
afterAll(async () => { await db.closeDatabase(); });

describe("POST /auth/register", () => {
  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe("alice@example.com");
    expect(res.body.user.role).toBe("customer");
  });

  it("rejects registration with missing fields", async () => {
    const res = await request(app).post("/auth/register").send({ email: "x@example.com" });
    expect(res.status).toBe(400);
  });

  it("rejects a password shorter than 6 characters", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Bob", email: "bob@example.com", password: "123",
    });
    expect(res.status).toBe(400);
  });

  it("rejects a duplicate email", async () => {
    await request(app).post("/auth/register").send({ name: "A", email: "dup@example.com", password: "password123" });
    const res = await request(app).post("/auth/register").send({ name: "B", email: "dup@example.com", password: "password123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already registered/i);
  });
});

describe("POST /auth/login", () => {
  it("logs in with correct credentials and rejects incorrect ones", async () => {
    await request(app).post("/auth/register").send({ name: "Carl", email: "carl@example.com", password: "password123" });

    const badLogin = await request(app).post("/auth/login").send({ email: "carl@example.com", password: "wrongpass" });
    expect(badLogin.status).toBe(401);

    const goodLogin = await request(app).post("/auth/login").send({ email: "carl@example.com", password: "password123" });
    expect(goodLogin.status).toBe(200);
    expect(goodLogin.body.token).toBeTruthy();
  });

  it("rejects login for an unknown email", async () => {
    const res = await request(app).post("/auth/login").send({ email: "nobody@example.com", password: "password123" });
    expect(res.status).toBe(401);
  });
});

describe("token-protected routes", () => {
  it("rejects /auth/verify and /auth/profile with no token", async () => {
    const verifyRes = await request(app).post("/auth/verify");
    expect(verifyRes.status).toBe(401);

    const profileRes = await request(app).get("/auth/profile");
    expect(profileRes.status).toBe(401);
  });

  it("rejects an invalid/malformed token", async () => {
    const res = await request(app).get("/auth/profile").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("accepts a real token for /auth/verify and /auth/profile", async () => {
    const registerRes = await request(app).post("/auth/register").send({
      name: "Dana", email: "dana@example.com", password: "password123",
    });
    const token = registerRes.body.token;

    const verifyRes = await request(app).post("/auth/verify").set("Authorization", `Bearer ${token}`);
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.user.email).toBe("dana@example.com");

    const profileRes = await request(app).get("/auth/profile").set("Authorization", `Bearer ${token}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.user.email).toBe("dana@example.com");
    expect(profileRes.body.user.password).toBeUndefined();
  });
});
