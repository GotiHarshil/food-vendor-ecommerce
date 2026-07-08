jest.mock("../../utils/stripeClient");
const stripe = require("../../utils/stripeClient");
const { attemptCancelOrder } = require("../../utils/orderCancellation");

function makeOrder(overrides = {}) {
  return {
    status: "pending",
    paymentStatus: "unpaid",
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("attemptCancelOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects when status is not in allowedStatuses", async () => {
    const order = makeOrder({ status: "picked_up" });
    const result = await attemptCancelOrder(order, {
      reason: "test",
      cancelledBy: "admin",
      allowedStatuses: ["pending", "preparing"],
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/no longer be cancelled/i);
    expect(order.save).not.toHaveBeenCalled();
  });

  it("cancels without calling Stripe when the order was never paid", async () => {
    const order = makeOrder({ status: "pending", paymentStatus: "unpaid" });
    const result = await attemptCancelOrder(order, {
      reason: "changed my mind",
      cancelledBy: "customer",
      allowedStatuses: ["pending"],
    });
    expect(result.ok).toBe(true);
    expect(stripe.refunds.create).not.toHaveBeenCalled();
    expect(order.status).toBe("cancelled");
    expect(order.cancelledBy).toBe("customer");
    expect(order.cancelReason).toBe("changed my mind");
    expect(order.save).toHaveBeenCalled();
  });

  it("issues a full Stripe refund when the order was paid", async () => {
    stripe.refunds.create.mockResolvedValue({ id: "re_test_1", amount: 999 });
    const order = makeOrder({
      status: "pending",
      paymentStatus: "paid",
      stripePaymentIntentId: "pi_test_1",
    });
    const result = await attemptCancelOrder(order, {
      reason: "store request",
      cancelledBy: "admin",
      allowedStatuses: ["pending", "preparing", "ready"],
    });
    expect(result.ok).toBe(true);
    expect(stripe.refunds.create).toHaveBeenCalledWith({ payment_intent: "pi_test_1" });
    expect(order.paymentStatus).toBe("refund_pending");
    expect(order.refund).toEqual({ stripeRefundId: "re_test_1", amount: 999, status: "pending" });
    expect(order.status).toBe("cancelled");
  });

  it("returns a clean error and leaves the order untouched if the Stripe refund call fails", async () => {
    stripe.refunds.create.mockRejectedValue(new Error("stripe down"));
    const order = makeOrder({ status: "pending", paymentStatus: "paid", stripePaymentIntentId: "pi_test_2" });
    const result = await attemptCancelOrder(order, {
      reason: "test",
      cancelledBy: "customer",
      allowedStatuses: ["pending"],
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/refund/i);
    expect(order.status).not.toBe("cancelled");
    expect(order.save).not.toHaveBeenCalled();
  });
});
