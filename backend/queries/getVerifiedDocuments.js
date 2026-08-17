const express = require("express");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

router.use(authMiddleware);

router.post("/", async (req, res) => {
  const collectionName = req.body.data;
  console.log(collectionName);

  try {
    const db = req.app.locals.db;
    const collection = db.collection(collectionName);

    const resultArray = await collection.find({ isverified: true }).toArray();

    console.log(resultArray);

    if (resultArray.length > 0) {
      // Documents are found
      res.status(200).json({
        success: true,
        message: `Documents of ${collectionName} retrieved`,
        data: resultArray,
      });
    } else {
      // No matching documents
      res.status(404).json({
        success: false,
        message: `No verified documents found in ${collectionName}`,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
