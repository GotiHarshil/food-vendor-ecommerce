const { sanitizeOrder } = require("../../utils/sanitize");

describe("sanitizeOrder", () => {
  const baseOrder = {
    _id: "abc123",
    status: "pending",
    subtotal: 10,
    paymentStatus: "paid",
    adminNote: "internal note",
    readyNotifiedAt: new Date(),
    stripeCheckoutSessionId: "cs_test_123",
    stripePaymentIntentId: "pi_test_123",
    stripeCustomerId: "cus_test_123",
  };

  it("strips admin-only fields for a non-admin role", () => {
    const result = sanitizeOrder(baseOrder, "customer");
    expect(result.adminNote).toBeUndefined();
    expect(result.readyNotifiedAt).toBeUndefined();
    expect(result.stripeCheckoutSessionId).toBeUndefined();
    expect(result.stripePaymentIntentId).toBeUndefined();
    expect(result.stripeCustomerId).toBeUndefined();
    expect(result.paymentStatus).toBe("paid");
    expect(result.status).toBe("pending");
  });

  it("keeps all fields for an admin role", () => {
    const result = sanitizeOrder(baseOrder, "admin");
    expect(result.adminNote).toBe("internal note");
    expect(result.stripeCheckoutSessionId).toBe("cs_test_123");
  });

  it("does not mutate the original object", () => {
    sanitizeOrder(baseOrder, "customer");
    expect(baseOrder.adminNote).toBe("internal note");
  });
});
