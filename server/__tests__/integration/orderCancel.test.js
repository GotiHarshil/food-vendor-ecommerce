jest.mock("../../utils/stripeClient");
const stripe = require("../../utils/stripeClient");
const request = require("supertest");
const app = require("../../app");
const db = require("../helpers/db");
const Order = require("../../models/Order");

beforeAll(async () => { await db.connect(); });
afterEach(async () => {
  await db.clearDatabase();
  jest.clearAllMocks();
});
afterAll(async () => { await db.closeDatabase(); });

async function loginAndGetUserId(email) {
  const agent = request.agent(app);
  await agent.post("/api/user/signup").send({ username: "U", email, password: "Test-Passw0rd-42" });
  const statusRes = await agent.get("/api/user/status");
  return { agent, userId: statusRes.body.user.id };
}

describe("POST /api/food/orders/:id/cancel", () => {
  it("cancels a pending unpaid order with no refund call", async () => {
    const { agent, userId } = await loginAndGetUserId("cancel1@example.com");
    const order = await Order.create({
      userId, customerName: "x", customerEmail: "cancel1@example.com",
      items: [], subtotal: 10, status: "pending", paymentStatus: "unpaid",
    });

    const res = await agent.post(`/api/food/orders/${order._id}/cancel`).send({ reason: "changed my mind" });
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("cancelled");
    expect(stripe.refunds.create).not.toHaveBeenCalled();
  });

  it("issues a refund for a paid pending order", async () => {
    stripe.refunds.create.mockResolvedValue({ id: "re_1", amount: 1000 });
    const { agent, userId } = await loginAndGetUserId("cancel2@example.com");
    const order = await Order.create({
      userId, customerName: "x", customerEmail: "cancel2@example.com",
      items: [], subtotal: 10, status: "pending", paymentStatus: "paid",
      stripePaymentIntentId: "pi_1",
    });

    const res = await agent.post(`/api/food/orders/${order._id}/cancel`).send({});
    expect(res.status).toBe(200);
    expect(stripe.refunds.create).toHaveBeenCalledWith({ payment_intent: "pi_1" });
    expect(res.body.order.paymentStatus).toBe("refund_pending");
  });

  it("rejects cancelling an order that's already preparing", async () => {
    const { agent, userId } = await loginAndGetUserId("cancel3@example.com");
    const order = await Order.create({
      userId, customerName: "x", customerEmail: "cancel3@example.com",
      items: [], subtotal: 10, status: "preparing", paymentStatus: "paid",
      stripePaymentIntentId: "pi_2",
    });

    const res = await agent.post(`/api/food/orders/${order._id}/cancel`).send({});
    expect(res.status).toBe(400);
  });

  it("returns 403 when cancelling someone else's order", async () => {
    const owner = await loginAndGetUserId("owner@example.com");
    const other = await loginAndGetUserId("other@example.com");
    const order = await Order.create({
      userId: owner.userId, customerName: "x", customerEmail: "owner@example.com",
      items: [], subtotal: 10, status: "pending", paymentStatus: "unpaid",
    });

    const res = await other.agent.post(`/api/food/orders/${order._id}/cancel`).send({});
    expect(res.status).toBe(403);
  });
});
