const express = require("express");
const router = express.Router();

const stripe = require("../config/stripe");

router.post("/create-checkout-session", async (req, res) => {

    if (!stripe) {
        return res.status(503).json({
            success: false,
            message: "Stripe payments are not configured. Please set STRIPE_SECRET_KEY in .env."
        });
    }

    try {

        const {
            customerName,
            email,
            products,
            total
        } = req.body;

        const lineItems = products.map(product => ({
            price_data: {
                currency: "inr",

                product_data: {
                    name: product.name
                },

                unit_amount: Math.round(product.price * 100)
            },

            quantity: product.quantity
        }));


        const session = await stripe.checkout.sessions.create({

            payment_method_types: ["card"],

            mode: "payment",

            customer_email: email,

            line_items: lineItems,

            metadata: {
                orderId: String(req.body.orderId || "")
            },

            success_url:
                `${req.protocol}://${req.get("host")}/payment-success.html?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(req.body.orderId || "")}`,

            cancel_url:
                `${req.protocol}://${req.get("host")}/checkout.html?payment=cancelled`
        });


        res.json({
            success: true,
            url: session.url
        });

    } catch (error) {

        console.error("Stripe Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to create Stripe checkout session"
        });
    }
});


module.exports = router;