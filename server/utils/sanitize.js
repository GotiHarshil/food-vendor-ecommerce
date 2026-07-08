const ADMIN_ONLY_ORDER_FIELDS = [
  "adminNote",
  "readyNotifiedAt",
  "stripeCheckoutSessionId",
  "stripePaymentIntentId",
  "stripeCustomerId",
];

function sanitizeOrder(order, userRole) {
  const obj = order.toObject ? order.toObject() : { ...order };
  if (userRole !== "admin") {
    ADMIN_ONLY_ORDER_FIELDS.forEach((f) => delete obj[f]);
  }
  return obj;
}

module.exports = { sanitizeOrder };
