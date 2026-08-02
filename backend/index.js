const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./configs/mongodbConfig.js");
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: "GET,POST,PUT,DELETE"
}));

app.use(bodyParser.json());

connectDB().then(() => {
  console.log("Connected to DB!");
});

const auth = require("./controller/authController.js");
const appointment = require("./controller/appointmentController.js");
const getVerifiedDocumentsRoute = require("./queries/getVerifiedDocuments.js");
const queryOneDocument = require("./queries/queryOneDocument.js");
const yourpatients = require("./queries/yourpatients.js");

app.use("/auth", auth);
app.use("/appointment", appointment)
app.use("/getVerifiedDocuments", getVerifiedDocumentsRoute);
app.use("/fetchUser",queryOneDocument);
app.use("/yourpatients",yourpatients);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});