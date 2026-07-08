const request = require("supertest");
const app = require("../../app");
const db = require("../helpers/db");
const { createFood } = require("../helpers/factories");

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clearDatabase(); });
afterAll(async () => { await db.closeDatabase(); });

async function loginAs(email) {
  const agent = request.agent(app);
  await agent.post("/api/user/signup").send({ username: "Cart User", email, password: "password123" });
  return agent;
}

describe("cart", () => {
  it("adds an item, enforces the 15-per-item cap, updates, and removes", async () => {
    const agent = await loginAs("cartuser@example.com");
    const food = await createFood({ price: 5 });

    const addRes = await agent.post(`/api/food/cart/add/${food._id}`);
    expect(addRes.status).toBe(200);
    expect(addRes.body.qty).toBe(1);

    const getRes = await agent.get("/api/food/cart");
    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveLength(1);
    expect(getRes.body[0].foodId).toBe(String(food._id));

    const setRes = await agent.post(`/api/food/cart/update/${food._id}`).send({ action: "set", qty: 15 });
    expect(setRes.status).toBe(200);
    expect(setRes.body.qty).toBe(15);

    const overCapRes = await agent.post(`/api/food/cart/update/${food._id}`).send({ action: "set", qty: 16 });
    expect(overCapRes.status).toBe(400);

    const removeRes = await agent.post(`/api/food/cart/remove/${food._id}`);
    expect(removeRes.status).toBe(200);

    const emptyCart = await agent.get("/api/food/cart");
    expect(emptyCart.body).toHaveLength(0);
  });

  it("enforces the 40-total-items cart cap", async () => {
    const agent = await loginAs("bigcart@example.com");

    const food1 = await createFood({ name: "First Item", price: 1 });
    await agent.post(`/api/food/cart/add/${food1._id}`);
    const set1 = await agent.post(`/api/food/cart/update/${food1._id}`).send({ action: "set", qty: 15 });
    expect(set1.status).toBe(200);

    const food2 = await createFood({ name: "Second Item", price: 1 });
    await agent.post(`/api/food/cart/add/${food2._id}`);
    const set2 = await agent.post(`/api/food/cart/update/${food2._id}`).send({ action: "set", qty: 15 });
    expect(set2.status).toBe(200);

    const food3 = await createFood({ name: "Third Item", price: 1 });
    await agent.post(`/api/food/cart/add/${food3._id}`);
    const set3 = await agent.post(`/api/food/cart/update/${food3._id}`).send({ action: "set", qty: 15 });
    expect(set3.status).toBe(400);
  });

  it("persists a guest (unauthenticated) cart across requests via a stable session cookie", async () => {
    // Regression test: saveUninitialized:false means an untouched session is
    // never persisted, so without getVisitorId() forcing a session write, a
    // guest's very first cart request would get a throwaway sessionID and
    // the item would be unretrievable on the next request — exactly what a
    // real guest browser does (same cookie jar across requests).
    const guestAgent = request.agent(app);
    const food = await createFood({ price: 5 });

    const addRes = await guestAgent.post(`/api/food/cart/add/${food._id}`);
    expect(addRes.status).toBe(200);
    expect(addRes.body.qty).toBe(1);

    const getRes = await guestAgent.get("/api/food/cart");
    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveLength(1);
    expect(getRes.body[0].foodId).toBe(String(food._id));
  });
});
