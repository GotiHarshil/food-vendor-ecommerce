const Stripe = require("stripe");

// Lazily construct the Stripe client so the server can boot (and every non-payment
// route can work) even before STRIPE_SECRET_KEY is configured — the Stripe SDK
// throws immediately at construction time if the key is missing/empty.
let client = null;

function getClient() {
  if (!client) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set. Add it to server/.env to use payment features.");
    }
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}

module.exports = new Proxy(
  {},
  {
    get(_target, prop) {
      return getClient()[prop];
    },
  }
);
