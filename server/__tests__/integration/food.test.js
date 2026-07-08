const request = require("supertest");
const app = require("../../app");
const db = require("../helpers/db");
const { createFood } = require("../helpers/factories");

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clearDatabase(); });
afterAll(async () => { await db.closeDatabase(); });

describe("GET /api/food/menu", () => {
  it("returns visible, available items and excludes deleted/hidden ones", async () => {
    await createFood({ name: "Visible Item" });
    await createFood({ name: "Deleted Item", isDeleted: true });
    await createFood({ name: "Hidden Item", isTemporarilyHidden: true });

    const res = await request(app).get("/api/food/menu");
    expect(res.status).toBe(200);
    const names = res.body.map((f) => f.name);
    expect(names).toContain("Visible Item");
    expect(names).not.toContain("Deleted Item");
    expect(names).not.toContain("Hidden Item");
  });
});

describe("GET /api/food/store-info", () => {
  it("returns store settings with an isOpen flag", async () => {
    const res = await request(app).get("/api/food/store-info");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("isOpen");
  });
});
