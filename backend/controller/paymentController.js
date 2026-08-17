const express = require("express");
const { ObjectId } = require("mongodb");
const stripe = require("../utils/stripeClient.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

// Fixed test fee for now — no per-doctor pricing exists yet in the schema.
const CONSULTATION_FEE_CENTS = 5000; // $50.00

router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  const { appointmentId } = req.body;

  try {
    const db = req.app.locals.db;
    const collection = db.collection("appointments");
    const appointment = await collection.findOne({ _id: new ObjectId(appointmentId) });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Managed Payments requires product tax codes / catalog setup we don't need
      // for this project — opt this session out to keep classic Checkout behavior.
      managed_payments: { enabled: false },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Consultation with Dr. ${appointment.doctor_name}` },
            unit_amount: CONSULTATION_FEE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: { appointmentId: appointmentId.toString() },
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?payment=cancelled`,
    });

    res.status(200).json({ success: true, checkoutUrl: session.url });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Mounted separately in index.js with express.raw() BEFORE the global express.json()
// middleware — Stripe signature verification needs the exact raw request body.
async function stripeWebhookHandler(req, res) {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const appointmentId = session.metadata.appointmentId;

    try {
      const db = req.app.locals.db;
      await db.collection("appointments").updateOne(
        { _id: new ObjectId(appointmentId) },
        {
          $set: {
            paymentStatus: "paid",
            stripePaymentIntentId: session.payment_intent,
          },
        }
      );
    } catch (error) {
      console.error("Error updating appointment after payment:", error);
    }
  }

  res.json({ received: true });
}

module.exports = { router, stripeWebhookHandler };
