require("dotenv").config();
const Stripe = require("stripe");

const secretKey = (process.env.STRIPE_SECRET_KEY || "").trim();

let stripe = null;

if (secretKey) {
    stripe = Stripe(secretKey);
} else {
    console.warn("⚠️ STRIPE_SECRET_KEY is missing in .env. Online payment will not be available until configured.");
}

module.exports = stripe;
