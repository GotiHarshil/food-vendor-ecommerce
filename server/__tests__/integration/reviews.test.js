const request = require("supertest");
const app = require("../../app");
const db = require("../helpers/db");
const Order = require("../../models/Order");
const Food = require("../../models/Food");
const { createFood } = require("../helpers/factories");

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clearDatabase(); });
afterAll(async () => { await db.closeDatabase(); });

async function loginAndGetUserId(email) {
  const agent = request.agent(app);
  await agent.post("/api/user/signup").send({ username: "Reviewer", email, password: "password123" });
  const statusRes = await agent.get("/api/user/status");
  return { agent, userId: statusRes.body.user.id };
}

describe("POST /api/food/reviews", () => {
  it("rejects a review for an order that isn't picked_up", async () => {
    const { agent, userId } = await loginAndGetUserId("rev1@example.com");
    const food = await createFood();
    const order = await Order.create({
      userId, customerName: "x", customerEmail: "rev1@example.com",
      items: [{ foodId: food._id, name: food.name, price: food.price, qty: 1 }],
      subtotal: food.price, status: "pending", paymentStatus: "paid",
    });

    const res = await agent.post("/api/food/reviews").send({ orderId: order._id, foodId: food._id, rating: 5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/completed order/i);
  });

  it("rejects a review for a food item not in the order", async () => {
    const { agent, userId } = await loginAndGetUserId("rev2@example.com");
    const orderedFood = await createFood({ name: "Ordered" });
    const otherFood = await createFood({ name: "Not Ordered" });
    const order = await Order.create({
      userId, customerName: "x", customerEmail: "rev2@example.com",
      items: [{ foodId: orderedFood._id, name: orderedFood.name, price: orderedFood.price, qty: 1 }],
      subtotal: orderedFood.price, status: "picked_up", paymentStatus: "paid",
    });

    const res = await agent.post("/api/food/reviews").send({ orderId: order._id, foodId: otherFood._id, rating: 4 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/wasn't part/i);
  });

  it("creates a review and updates the food's avgRating/reviewCount", async () => {
    const { agent, userId } = await loginAndGetUserId("rev3@example.com");
    const food = await createFood();
    const order = await Order.create({
      userId, customerName: "x", customerEmail: "rev3@example.com",
      items: [{ foodId: food._id, name: food.name, price: food.price, qty: 1 }],
      subtotal: food.price, status: "picked_up", paymentStatus: "paid",
    });

    const res = await agent.post("/api/food/reviews").send({
      orderId: order._id, foodId: food._id, rating: 4, comment: "Tasty!",
    });
    expect(res.status).toBe(200);
    expect(res.body.review.rating).toBe(4);

    const updatedFood = await Food.findById(food._id);
    expect(updatedFood.avgRating).toBe(4);
    expect(updatedFood.reviewCount).toBe(1);
  });

  it("rejects a duplicate review for the same order/food/user", async () => {
    const { agent, userId } = await loginAndGetUserId("rev4@example.com");
    const food = await createFood();
    const order = await Order.create({
      userId, customerName: "x", customerEmail: "rev4@example.com",
      items: [{ foodId: food._id, name: food.name, price: food.price, qty: 1 }],
      subtotal: food.price, status: "picked_up", paymentStatus: "paid",
    });

    const first = await agent.post("/api/food/reviews").send({ orderId: order._id, foodId: food._id, rating: 5 });
    expect(first.status).toBe(200);

    const second = await agent.post("/api/food/reviews").send({ orderId: order._id, foodId: food._id, rating: 2 });
    expect(second.status).toBe(409);
  });
});
