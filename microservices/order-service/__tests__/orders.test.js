const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const db = require("./helpers/db");
const { signToken } = require("./helpers/jwt");
const Order = require("../models/Order");

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clearDatabase(); });
afterAll(async () => { await db.closeDatabase(); });

function newUserId() {
  return new mongoose.Types.ObjectId().toString();
}

describe("POST /orders", () => {
  it("creates an order for the authenticated customer", async () => {
    const userId = newUserId();
    const token = signToken({ id: userId, email: "cust@example.com", role: "customer" });

    const res = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ name: "Dabeli", price: 10, qty: 1 }], subtotal: 10 });

    expect(res.status).toBe(201);
    expect(res.body.order.userId).toBe(userId);
    expect(res.body.order.status).toBe("pending");
  });

  it("rejects a request with no token", async () => {
    const res = await request(app).post("/orders").send({ items: [], subtotal: 0 });
    expect(res.status).toBe(401);
  });

  it("rejects an order with no items", async () => {
    const token = signToken({ id: newUserId() });
    const res = await request(app).post("/orders").set("Authorization", `Bearer ${token}`).send({ items: [], subtotal: 0 });
    expect(res.status).toBe(400);
  });
});

describe("GET /orders/my", () => {
  it("returns only the caller's own orders", async () => {
    const userAId = newUserId();
    const userBId = newUserId();
    await Order.create({ userId: userAId, customerName: "A", customerEmail: "a@example.com", items: [], subtotal: 5 });
    await Order.create({ userId: userBId, customerName: "B", customerEmail: "b@example.com", items: [], subtotal: 7 });

    const token = signToken({ id: userAId });
    const res = await request(app).get("/orders/my").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].userId).toBe(userAId);
  });
});

describe("GET /orders (admin only)", () => {
  it("rejects a non-admin token and accepts an admin token", async () => {
    const customerToken = signToken({ id: newUserId(), role: "customer" });
    const forbidden = await request(app).get("/orders").set("Authorization", `Bearer ${customerToken}`);
    expect(forbidden.status).toBe(403);

    const adminToken = signToken({ id: newUserId(), role: "admin" });
    const allowed = await request(app).get("/orders").set("Authorization", `Bearer ${adminToken}`);
    expect(allowed.status).toBe(200);
  });
});

describe("PUT /orders/:id/status (admin only)", () => {
  it("updates status as admin, rejects as customer", async () => {
    const order = await Order.create({
      userId: newUserId(), customerName: "x", customerEmail: "x@example.com", items: [], subtotal: 5,
    });

    const customerToken = signToken({ id: newUserId(), role: "customer" });
    const forbidden = await request(app)
      .put(`/orders/${order._id}/status`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ status: "preparing" });
    expect(forbidden.status).toBe(403);

    const adminToken = signToken({ id: newUserId(), role: "admin" });
    const res = await request(app)
      .put(`/orders/${order._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "preparing" });
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("preparing");
  });
});

describe("POST /orders/:id/cancel", () => {
  it("rejects cancelling someone else's order", async () => {
    const ownerId = newUserId();
    const order = await Order.create({
      userId: ownerId, customerName: "x", customerEmail: "x@example.com", items: [], subtotal: 5,
    });

    const otherToken = signToken({ id: newUserId(), role: "customer" });
    const res = await request(app).post(`/orders/${order._id}/cancel`).set("Authorization", `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  it("rejects cancelling an already picked_up order", async () => {
    const ownerId = newUserId();
    const order = await Order.create({
      userId: ownerId, customerName: "x", customerEmail: "x@example.com", items: [], subtotal: 5, status: "picked_up",
    });

    const token = signToken({ id: ownerId, role: "customer" });
    const res = await request(app).post(`/orders/${order._id}/cancel`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("cancels a pending order owned by the caller", async () => {
    const ownerId = newUserId();
    const order = await Order.create({
      userId: ownerId, customerName: "x", customerEmail: "x@example.com", items: [], subtotal: 5, status: "pending",
    });

    const token = signToken({ id: ownerId, role: "customer" });
    const res = await request(app)
      .post(`/orders/${order._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ cancelReason: "changed my mind" });
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("cancelled");
    expect(res.body.order.cancelledBy).toBe("customer");
  });
});

describe("PATCH /orders/:id/note-hindi (admin only)", () => {
  it("rejects a customer token and accepts an admin token", async () => {
    const order = await Order.create({
      userId: newUserId(), customerName: "x", customerEmail: "x@example.com", items: [], subtotal: 5, note: "no onions",
    });

    const customerToken = signToken({ id: newUserId(), role: "customer" });
    const forbidden = await request(app)
      .patch(`/orders/${order._id}/note-hindi`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ noteHindi: "प्याज नहीं" });
    expect(forbidden.status).toBe(403);

    const adminToken = signToken({ id: newUserId(), role: "admin" });
    const res = await request(app)
      .patch(`/orders/${order._id}/note-hindi`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ noteHindi: "प्याज नहीं" });
    expect(res.status).toBe(200);
    expect(res.body.order.noteHindi).toBe("प्याज नहीं");
  });
});
