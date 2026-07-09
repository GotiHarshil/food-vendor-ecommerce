const request = require("supertest");
const app = require("../../app");
const db = require("../helpers/db");
const { createUser } = require("../helpers/factories");

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clearDatabase(); });
afterAll(async () => { await db.closeDatabase(); });

async function loginAgent(email, password) {
  const agent = request.agent(app);
  await agent.post("/api/user/login").send({ email, password });
  return agent;
}

describe("PUT /api/user/password", () => {
  it("changes the password and invalidates the old one", async () => {
    const email = "changer@example.com";
    await createUser({ email, password: "Test-Passw0rd-42" });
    const agent = await loginAgent(email, "Test-Passw0rd-42");

    const changeRes = await agent.put("/api/user/password").send({
      currentPassword: "Test-Passw0rd-42",
      newPassword: "New-Strong-Pass-9",
    });
    expect(changeRes.status).toBe(200);

    const oldLogin = await request(app).post("/api/user/login").send({ email, password: "Test-Passw0rd-42" });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app).post("/api/user/login").send({ email, password: "New-Strong-Pass-9" });
    expect(newLogin.status).toBe(200);
  });

  it("rejects a wrong current password", async () => {
    const email = "wrongcurrent@example.com";
    await createUser({ email, password: "Test-Passw0rd-42" });
    const agent = await loginAgent(email, "Test-Passw0rd-42");

    const res = await agent.put("/api/user/password").send({
      currentPassword: "not-the-current-password",
      newPassword: "New-Strong-Pass-9",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Current password is incorrect");
  });

  it("rejects a weak new password", async () => {
    const email = "weaknew@example.com";
    await createUser({ email, password: "Test-Passw0rd-42" });
    const agent = await loginAgent(email, "Test-Passw0rd-42");

    const res = await agent.put("/api/user/password").send({
      currentPassword: "Test-Passw0rd-42",
      newPassword: "short",
    });
    expect(res.status).toBe(400);
  });
});
