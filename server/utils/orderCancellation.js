// server/utils/orderCancellation.js
const stripe = require("./stripeClient");

const CUSTOMER_CANCELLABLE_STATUSES = ["pending"];
const ADMIN_CANCELLABLE_STATUSES = ["pending", "preparing", "ready"];

// Cancels `order` in-place and, if it was paid, issues a full Stripe refund.
// Saves the order on success. Caller is responsible for side effects (email,
// audit log, broadcastOrders) after a successful result.
async function attemptCancelOrder(order, { reason, cancelledBy, allowedStatuses }) {
  if (!allowedStatuses.includes(order.status)) {
    return { ok: false, error: "This order can no longer be cancelled." };
  }

  if (order.paymentStatus === "paid") {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
      });
      order.paymentStatus = "refund_pending";
      order.refund = {
        stripeRefundId: refund.id,
        amount: refund.amount,
        status: "pending",
      };
    } catch (err) {
      console.error("[orderCancellation] Stripe refund failed:", err);
      return { ok: false, error: "Could not process refund. Please try again or contact support." };
    }
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancelledBy = cancelledBy;
  order.cancelReason = reason;
  await order.save();

  return { ok: true, order };
}

module.exports = { attemptCancelOrder, CUSTOMER_CANCELLABLE_STATUSES, ADMIN_CANCELLABLE_STATUSES };
