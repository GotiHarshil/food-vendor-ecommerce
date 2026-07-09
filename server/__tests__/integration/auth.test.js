const request = require("supertest");
const app = require("../../app");
const db = require("../helpers/db");

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clearDatabase(); });
afterAll(async () => { await db.closeDatabase(); });

describe("auth flow", () => {
  it("signs up a new user and establishes a session", async () => {
    const agent = request.agent(app);
    const res = await agent.post("/api/user/signup").send({
      username: "Alice",
      email: "alice@example.com",
      password: "Test-Passw0rd-42",
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const statusRes = await agent.get("/api/user/status");
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.user.email).toBe("alice@example.com");
    expect(statusRes.body.user.role).toBe("customer");
  });

  it("rejects signup with missing fields", async () => {
    const res = await request(app).post("/api/user/signup").send({ email: "x@example.com" });
    expect(res.status).toBe(400);
  });

  it("rejects duplicate email signup", async () => {
    await request(app).post("/api/user/signup").send({ username: "A", email: "dup@example.com", password: "Test-Passw0rd-42" });
    const res = await request(app).post("/api/user/signup").send({ username: "B", email: "dup@example.com", password: "Test-Passw0rd-42" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already registered/i);
  });

  it("logs in with correct credentials and rejects incorrect ones", async () => {
    await request(app).post("/api/user/signup").send({ username: "Bob", email: "bob@example.com", password: "Test-Passw0rd-42" });

    const agent = request.agent(app);
    const badLogin = await agent.post("/api/user/login").send({ email: "bob@example.com", password: "wrongpass" });
    expect(badLogin.status).toBe(401);

    const goodLogin = await agent.post("/api/user/login").send({ email: "bob@example.com", password: "Test-Passw0rd-42" });
    expect(goodLogin.status).toBe(200);
    expect(goodLogin.body.success).toBe(true);
  });

  it("returns 401 for status when not logged in", async () => {
    const res = await request(app).get("/api/user/status");
    expect(res.status).toBe(401);
  });

  it("logs out and clears the session", async () => {
    const agent = request.agent(app);
    await agent.post("/api/user/signup").send({ username: "Carl", email: "carl@example.com", password: "Test-Passw0rd-42" });

    const logoutRes = await agent.post("/api/user/logout");
    expect(logoutRes.status).toBe(200);

    const statusRes = await agent.get("/api/user/status");
    expect(statusRes.status).toBe(401);
  });
});
