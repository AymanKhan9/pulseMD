const express = require("express");
const authMiddleware = require("../middleware/authMiddleware.js");
const router = express.Router();

router.use(authMiddleware);

router.post("/", async (req, res) => {
  const doctorIdToQuery = req.body.user_id; //`ObjectId(${req.body})`;
  console.log(doctorIdToQuery);
  try {
    const db = req.app.locals.db;
    const collection = db.collection("appointments");

    const prescriptionsWithDoctor = await collection
      .aggregate([
        {
          $match: { doctor_id: doctorIdToQuery },
        },
        {
          $lookup: {
            from: "patient",
            localField: "patient_id",
            foreignField: "email",
            as: "patient",
          },
        },
        {
          $unwind: "$patient",
        },
        {
          $project: {
            doctor_id: 1,
            date: 1,
            patient_id: "$patient.email",
            patient_name: "$patient.fullname",
            patient_age: "$patient.age",
            patient_gender: "$patient.gender", 
            patient_bloodgroup: "$patient.bloodgroup",
            symptoms: 1,
            isConfirmed: 1,
            prescriptions: 1,
          },
        },
      ])
      .toArray();

    console.log(prescriptionsWithDoctor);
    // Send the result to the frontend
    res.json(prescriptionsWithDoctor);
  } catch (error) {
    console.error("Error querying prescriptions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
