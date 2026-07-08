// server/controllers/stripeWebhookController.js
const stripe = require("../utils/stripeClient");
const Order = require("../models/Order");
const CartItem = require("../models/CartItem");
const User = require("../models/user");
const { broadcastOrders } = require("./adminController");
const { sendEmail, emailTemplates } = require("../utils/emailService");
const { logAuditSystem } = require("../utils/audit");

// POST /api/food/webhooks/stripe — mounted with express.raw() in app.js, BEFORE the
// global express.json(), since Stripe signature verification needs the raw body.
module.exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;
      default:
        break; // ignore events we don't act on
    }
    res.json({ received: true });
  } catch (err) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, err);
    // Non-2xx so Stripe retries delivery
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

async function handleCheckoutCompleted(session) {
  const order = await Order.findOne({ stripeCheckoutSessionId: session.id });
  if (!order) {
    console.error(`[Stripe Webhook] No order found for session ${session.id}`);
    return;
  }
  if (order.paymentStatus === "paid") return; // already processed (Stripe retries webhooks)

  order.paymentStatus = "paid";
  order.stripePaymentIntentId = session.payment_intent;
  order.stripeCustomerId = session.customer;
  order.paidAt = new Date();
  await order.save();

  await CartItem.deleteMany({ userId: String(order.userId) });

  broadcastOrders().catch(console.error);

  const user = await User.findById(order.userId);
  if (user && user.email) {
    const emailContent = emailTemplates.orderConfirmation(order, user);
    sendEmail(user.email, emailContent.subject, emailContent.html).catch(console.error);
  }

  logAuditSystem(
    "PAYMENT_CAPTURED",
    "Order",
    order._id,
    { subtotal: order.subtotal, stripePaymentIntentId: order.stripePaymentIntentId },
    { actorId: order.userId, actorEmail: user?.email }
  );
}

async function handleCheckoutExpired(session) {
  const order = await Order.findOne({ stripeCheckoutSessionId: session.id });
  if (!order || order.paymentStatus !== "unpaid") return; // already paid, or already handled

  order.status = "cancelled";
  order.paymentStatus = "payment_failed";
  order.cancelledAt = new Date();
  order.cancelReason = "Payment session expired";
  await order.save();

  broadcastOrders().catch(console.error);
  logAuditSystem("PAYMENT_SESSION_EXPIRED", "Order", order._id, {}, { actorId: order.userId });
}

async function handleChargeRefunded(charge) {
  const order = await Order.findOne({ stripePaymentIntentId: charge.payment_intent });
  if (!order) {
    console.error(`[Stripe Webhook] No order found for payment_intent ${charge.payment_intent}`);
    return;
  }
  if (order.paymentStatus === "refunded") return; // already processed

  const refundEntry = charge.refunds?.data?.[0];
  order.paymentStatus = "refunded";
  order.refund = {
    stripeRefundId: refundEntry?.id || order.refund?.stripeRefundId,
    amount: charge.amount_refunded,
    status: "succeeded",
    refundedAt: new Date(),
  };
  await order.save();

  broadcastOrders().catch(console.error);
  logAuditSystem(
    "REFUND_ISSUED",
    "Order",
    order._id,
    { amount: charge.amount_refunded },
    { actorId: order.userId }
  );
}
