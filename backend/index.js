const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser")
const connectDB = require("./configs/mongodbConfig.js");
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: "GET,POST,PUT,DELETE"
}));

// Registered before express.json() — Stripe needs the exact raw request body
// to verify the webhook signature, not a parsed/re-serialized copy.
const { router: paymentRouter, stripeWebhookHandler } = require("./controller/paymentController.js");
app.post("/payment/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);

app.use(express.json());
app.use(cookieParser());

const auth = require("./controller/authController.js");
const appointment = require("./controller/appointmentController.js");
const getVerifiedDocumentsRoute = require("./queries/getVerifiedDocuments.js");
const queryOneDocument = require("./queries/queryOneDocument.js");
const yourpatients = require("./queries/yourpatients.js");

app.use("/auth", auth);
app.use("/appointment", appointment)
app.use("/payment", paymentRouter);
app.use("/getVerifiedDocuments", getVerifiedDocumentsRoute);
app.use("/fetchUser",queryOneDocument);
app.use("/yourpatients",yourpatients);

connectDB()
  .then((db) => {
    app.locals.db = db;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });