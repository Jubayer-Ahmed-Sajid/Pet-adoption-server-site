const { env } = require("./env");

let stripe = null;

if (env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY.includes("your_stripe")) {
  try {
    stripe = require("stripe")(env.STRIPE_SECRET_KEY);
  } catch (err) {
    console.warn("Stripe initialization skipped:", err.message);
  }
}

module.exports = { stripe };

