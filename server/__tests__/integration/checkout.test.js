jest.mock("../../utils/stripeClient");
const stripe = require("../../utils/stripeClient");
const request = require("supertest");
const app = require("../../app");
const db = require("../helpers/db");
const { createFood } = require("../helpers/factories");
const Order = require("../../models/Order");
const StoreSettings = require("../../models/StoreSettings");

beforeAll(async () => { await db.connect(); });
afterEach(async () => {
  await db.clearDatabase();
  jest.clearAllMocks();
});
afterAll(async () => { await db.closeDatabase(); });

async function loginAs(email) {
  const agent = request.agent(app);
  await agent.post("/api/user/signup").send({ username: "Checkout User", email, password: "password123" });
  return agent;
}

describe("POST /api/food/checkout/create-session", () => {
  it("rejects when the store is closed", async () => {
    await StoreSettings.findOneAndUpdate({ _id: "store_settings" }, { isOpen: false }, { upsert: true });
    const agent = await loginAs("closed@example.com");
    const res = await agent.post("/api/food/checkout/create-session").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/closed/i);
  });

  it("rejects when the cart is empty", async () => {
    const agent = await loginAs("emptycart@example.com");
    const res = await agent.post("/api/food/checkout/create-session").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/empty/i);
  });

  it("creates a Stripe session and an unpaid order", async () => {
    stripe.checkout.sessions.create.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/pay/cs_test_123",
    });

    const agent = await loginAs("payer@example.com");
    const food = await createFood({ price: 10 });
    await agent.post(`/api/food/cart/add/${food._id}`);

    const res = await agent.post("/api/food/checkout/create-session").send({ note: "no onions" });
    expect(res.status).toBe(200);
    expect(res.body.url).toBe("https://checkout.stripe.com/pay/cs_test_123");

    const order = await Order.findOne({ stripeCheckoutSessionId: "cs_test_123" });
    expect(order).not.toBeNull();
    expect(order.paymentStatus).toBe("unpaid");
    expect(order.status).toBe("pending");
    expect(order.subtotal).toBe(10);
  });

  it("counts only paid orders toward the 2-active-order limit", async () => {
    const agent = await loginAs("repeat@example.com");
    const statusRes = await agent.get("/api/user/status");
    const userId = statusRes.body.user.id;

    // Two unpaid (abandoned) orders should NOT block a new checkout attempt
    await Order.create({
      userId, customerName: "x", customerEmail: "repeat@example.com",
      items: [], subtotal: 5, status: "pending", paymentStatus: "unpaid",
    });
    await Order.create({
      userId, customerName: "x", customerEmail: "repeat@example.com",
      items: [], subtotal: 5, status: "pending", paymentStatus: "unpaid",
    });

    stripe.checkout.sessions.create.mockResolvedValue({
      id: "cs_test_ok",
      url: "https://checkout.stripe.com/pay/cs_test_ok",
    });
    const food = await createFood({ price: 5 });
    await agent.post(`/api/food/cart/add/${food._id}`);
    const okRes = await agent.post("/api/food/checkout/create-session").send({});
    expect(okRes.status).toBe(200);

    // Two PAID active orders should block a new checkout attempt
    await Order.create({
      userId, customerName: "x", customerEmail: "repeat@example.com",
      items: [], subtotal: 5, status: "pending", paymentStatus: "paid",
    });
    await Order.create({
      userId, customerName: "x", customerEmail: "repeat@example.com",
      items: [], subtotal: 5, status: "preparing", paymentStatus: "paid",
    });

    await agent.post(`/api/food/cart/add/${food._id}`);
    const blockedRes = await agent.post("/api/food/checkout/create-session").send({});
    expect(blockedRes.status).toBe(400);
    expect(blockedRes.body.error).toMatch(/2 active orders/i);
  });
});
