const express = require("express");
const { ObjectId } = require("mongodb");
const authMiddleware = require("../middleware/authMiddleware.js");
const stripe = require("../utils/stripeClient.js");
const router = express.Router();

router.use(authMiddleware);

router.post("/get", async (req, res) => {
  const { user_id, role } = req.body;
  console.log(user_id, role);

  try {
    const db = req.app.locals.db;
    const collection = db.collection("appointments");

    let resultArray;
    if (role === "patient") {
      resultArray = await collection.find({ patient_id: user_id }).toArray();
    } else {
      // Doctors only see appointments that have actually been paid for —
      // an unpaid booking shouldn't clutter their schedule.
      resultArray = await collection.find({ doctor_id: user_id, paymentStatus: "paid" }).toArray();
    }

    console.log(resultArray);

    if (resultArray.length > 0) {
      res.status(200).json({
        success: true,
        data: resultArray,
      });
    } else {
      res.status(404).json({ success: true, message: `No Meetings Scheduled` });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/accept", async (req, res) => {
  const { appointmentId } = req.body;

  try {
    const db = req.app.locals.db;
    const collection = db.collection("appointments");

    const appointment = await collection.findOne({ _id: new ObjectId(appointmentId) });
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    if (appointment.paymentStatus !== "paid") {
      return res.status(400).json({ success: false, message: "Appointment has not been paid for yet" });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(appointmentId) },
      { $set: { isConfirmed: true } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ success: true, message: "Meeting Accepted!" });
    } else {
      res.status(200).json({ success: true, message: "Meeting Accepted!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/book", async (req, res) => {
  const { appointment } = req.body;

  try {
    const db = req.app.locals.db;
    const collection = db.collection("appointments");
    const result = await collection.insertOne({ ...appointment, paymentStatus: "pending" });

    if (result) {
      res.status(200).json({
        success: true,
        message: "Appointment booked! Proceed to payment to confirm your slot.",
        appointmentId: result.insertedId,
      });
    } else {
      res.status(401).json({ success: false, message: "Error occurred!" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.delete("/reject", async (req, res) => {
  const { appointmentId } = req.body;

  try {
    const db = req.app.locals.db;
    const collection = db.collection("appointments");

    const appointment = await collection.findOne({ _id: new ObjectId(appointmentId) });
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    if (appointment.paymentStatus === "paid" && appointment.stripePaymentIntentId) {
      await stripe.refunds.create({ payment_intent: appointment.stripePaymentIntentId });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(appointmentId) });

    if (result.deletedCount === 1) {
      res.status(200).json({ success: true, message: "Meeting Cancelled and Refunded!" });
    } else {
      res.status(404).json({ success: false, message: "Meeting not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/prescriptions", async (req, res) => {
  const { patient, doctor_id, prescriptions, date } = req.body;
  console.log(doctor_id, patient, prescriptions, date);

  try {
    const db = req.app.locals.db;
    const collection = db.collection("appointments");

    const filter = { date: date, doctor_id: doctor_id, patient_id: patient };
    const prescriptionsUpdate = {
      $set: {
        prescriptions: prescriptions,
      },
    };

    const result = await collection.updateOne(filter, prescriptionsUpdate);
    console.log(result);

    const result2 = await collection.findOne(filter);
    console.log(result2);

    if (result.modifiedCount > 0) {
      res
        .status(200)
        .json({ success: true, message: "Prescriptions updated successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "No matching appointment found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
