const request = require("supertest");
const app = require("../../app");
const db = require("../helpers/db");
const { createAdmin, createUser } = require("../helpers/factories");
const Order = require("../../models/Order");

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clearDatabase(); });
afterAll(async () => { await db.closeDatabase(); });

async function loginAgent(email, password = "Test-Passw0rd-42") {
  const agent = request.agent(app);
  await agent.post("/api/user/login").send({ email, password });
  return agent;
}

describe("admin order management", () => {
  it("returns 401 for anonymous and 403 for a non-admin user", async () => {
    const anonRes = await request(app).get("/api/admin/orders");
    expect(anonRes.status).toBe(401);

    await createUser({ email: "plain@example.com", password: "Test-Passw0rd-42" });
    const agent = await loginAgent("plain@example.com");
    const res = await agent.get("/api/admin/orders");
    expect(res.status).toBe(403);
  });

  it("lets an admin list and update order status", async () => {
    const admin = await createAdmin({ email: "admin1@example.com", password: "Test-Passw0rd-42" });
    const agent = await loginAgent("admin1@example.com");

    const order = await Order.create({
      userId: admin._id, customerName: "x", customerEmail: "admin1@example.com",
      items: [], subtotal: 5, status: "pending", paymentStatus: "paid",
    });

    const listRes = await agent.get("/api/admin/orders");
    expect(listRes.status).toBe(200);
    expect(listRes.body.orders.length).toBeGreaterThanOrEqual(1);

    const updateRes = await agent.put(`/api/admin/orders/${order._id}/status`).send({ status: "preparing" });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe("preparing");
  });

  it("rejects cancelling an already picked_up order (guard fix regression test)", async () => {
    const admin = await createAdmin({ email: "admin2@example.com", password: "Test-Passw0rd-42" });
    const agent = await loginAgent("admin2@example.com");

    const order = await Order.create({
      userId: admin._id, customerName: "x", customerEmail: "admin2@example.com",
      items: [], subtotal: 5, status: "picked_up", paymentStatus: "paid",
    });

    const res = await agent.post(`/api/admin/orders/${order._id}/cancel`).send({ reason: "test" });
    expect(res.status).toBe(400);
  });
});
