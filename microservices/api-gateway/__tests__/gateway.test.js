const request = require("supertest");
const { startStub } = require("./helpers/stubService");

// The gateway reads AUTH_SERVICE_URL/ORDER_SERVICE_URL/TRANSLATION_SERVICE_URL
// once, at proxy-middleware-construction time, so each case sets its env vars
// and then jest.resetModules()s before re-requiring ../app fresh.

describe("API Gateway proxying", () => {
  let stub;

  afterEach(async () => {
    if (stub) await stub.close();
    stub = undefined;
  });

  it("proxies /auth/* to AUTH_SERVICE_URL, preserving the path and body", async () => {
    stub = startStub((app) => {
      app.post("/auth/login", (req, res) => res.json({ from: "auth-stub", body: req.body }));
    });
    process.env.AUTH_SERVICE_URL = stub.url;
    process.env.ORDER_SERVICE_URL = "http://127.0.0.1:1";
    process.env.TRANSLATION_SERVICE_URL = "http://127.0.0.1:1";
    jest.resetModules();
    const app = require("../app");

    const res = await request(app).post("/auth/login").send({ email: "a@b.com" });
    expect(res.status).toBe(200);
    expect(res.body.from).toBe("auth-stub");
    expect(res.body.body.email).toBe("a@b.com");
  });

  it("proxies /orders/* to ORDER_SERVICE_URL", async () => {
    stub = startStub((app) => {
      app.get("/orders/my", (req, res) => res.json({ from: "order-stub" }));
    });
    process.env.AUTH_SERVICE_URL = "http://127.0.0.1:1";
    process.env.ORDER_SERVICE_URL = stub.url;
    process.env.TRANSLATION_SERVICE_URL = "http://127.0.0.1:1";
    jest.resetModules();
    const app = require("../app");

    const res = await request(app).get("/orders/my");
    expect(res.status).toBe(200);
    expect(res.body.from).toBe("order-stub");
  });

  it("proxies /translate/* to TRANSLATION_SERVICE_URL", async () => {
    stub = startStub((app) => {
      app.post("/translate", (req, res) => res.json({ from: "translate-stub" }));
    });
    process.env.AUTH_SERVICE_URL = "http://127.0.0.1:1";
    process.env.ORDER_SERVICE_URL = "http://127.0.0.1:1";
    process.env.TRANSLATION_SERVICE_URL = stub.url;
    jest.resetModules();
    const app = require("../app");

    const res = await request(app).post("/translate").send({ text: "hi" });
    expect(res.status).toBe(200);
    expect(res.body.from).toBe("translate-stub");
  });

  it("reports the configured service URLs on /health", async () => {
    process.env.AUTH_SERVICE_URL = "http://auth.test";
    process.env.ORDER_SERVICE_URL = "http://orders.test";
    process.env.TRANSLATION_SERVICE_URL = "http://translate.test";
    jest.resetModules();
    const app = require("../app");

    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.services.auth).toBe("http://auth.test");
    expect(res.body.services.orders).toBe("http://orders.test");
    expect(res.body.services.translation).toBe("http://translate.test");
  });
});
