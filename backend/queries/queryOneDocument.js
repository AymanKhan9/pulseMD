const express = require("express");
const authMiddleware = require("../middleware/authMiddleware.js");
const router = express.Router();

router.use(authMiddleware);

router.post("/", async (req, res) => {
  const { currentUser } = req.body; // Get data from request body
  console.log(currentUser);

  try {
    const db = req.app.locals.db;
    const collection = db.collection(currentUser.role);

    const result = await collection.findOne({ email: currentUser.email });

    console.log(result);
    if (result) {
      const { password, ...userData } = result;
      res.status(200).json({ ...userData, hasPassword: !!password });
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
