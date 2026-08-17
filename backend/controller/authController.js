const express = require("express");
const bcryptUtils = require("../utils/bcrypt-hashing.js");
const PatientModel = require("../models/patientModel.js");
const DoctorModel = require("../models/doctorModel.js");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware.js");
const { sendVerificationEmail } = require("../utils/mailer.js");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();

const getModel = (role) => (role === "patient" ? PatientModel : DoctorModel);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const Model = getModel(role);

    // Find the user by email
    const result = await Model.findOne({ email }).lean();

    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Email doesn't exist" });
    }

    if (!result.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google Sign-In. Please log in with Google instead.",
      });
    }

    // Compare the hashed password
    const isMatch = await bcryptUtils.compareHash(password, result.password);

    if (isMatch) {
      if (!result.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email before logging in. Check your inbox for the verification link.",
        });
      }

      const { _id, password, ...userData } = result;
      const token = jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: { ...userData, hasPassword: !!password },
        token,
      });
    } else {
      // If passwords don't match
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  } catch (error) {
    console.error("Error:", error);
    // If any other error occurs, send a server error response
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});

router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const dbRole = role === "patient" ? "patient" : "doctor"; //selects the collection based on role recieved.
    const Model = getModel(dbRole);
    const userExists = await Model.findOne({ email });

    if (userExists) {
      res
        .status(409)
        .json({ success: false, message: "Email is already in use" });
    } else {
      const hashedPassword = await bcryptUtils.hashString(password);

      const baseFields = {
        email,
        password: hashedPassword,
        role,
        fullname: name,
        image: "",
        gender: "",
        address: "",
        age: "",
        isverified: false,
        emailVerified: false,
      };

      const query =
        dbRole === "patient"
          ? { ...baseFields, bloodgroup: "" }
          : {
              ...baseFields,
              degree: "",
              speciality: "",
              starttime: "",
              endtime: "",
              // regno/regyear/experience are Number in the schema — left unset here
              // rather than "" (which would fail Number casting), filled in later via updateProfile.
            };

      const result = await Model.create(query);

      if (result) {
        const verificationToken = jwt.sign(
          { email, role: dbRole },
          process.env.EMAIL_TOKEN_SECRET,
          { expiresIn: "1d" }
        );
        await sendVerificationEmail(email, verificationToken);

        res.status(200).json({
          success: true,
          message: "Sign up successful! Please check your email to verify your account before logging in.",
        });
      } else {
        res.status(401).json({ success: false, message: "Unable to Sign Up" });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/google", async (req, res) => {
  const { idToken, role } = req.body;

  try {
    const dbRole = role === "patient" ? "patient" : "doctor";
    const Model = getModel(dbRole);

    // Verifies the token was actually issued by Google for this app's client ID —
    // never trust a decoded-but-unverified token here.
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    let user = await Model.findOne({ email }).lean();

    if (!user) {
      const baseFields = {
        email,
        role: dbRole,
        fullname: payload.name || "",
        image: payload.picture || "",
        gender: "",
        address: "",
        age: "",
        isverified: false,
        emailVerified: true, // Google already verified this address
      };

      const query =
        dbRole === "patient"
          ? { ...baseFields, bloodgroup: "" }
          : { ...baseFields, degree: "", speciality: "", starttime: "", endtime: "" };

      user = await Model.create(query);
      user = user.toObject();
    }

    const { _id, password, ...userData } = user;
    const token = jwt.sign({ email, role: dbRole }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Google sign-in successful",
      user: { ...userData, hasPassword: !!password },
      token,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(401).json({ success: false, message: "Google sign-in failed" });
  }
});

router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);
    const Model = getModel(decoded.role);

    await Model.updateOne({ email: decoded.email }, { $set: { emailVerified: true } });

    res.redirect(`${process.env.FRONTEND_URL}/Register?verified=success`);
  } catch (error) {
    console.error("Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/Register?verified=failed`);
  }
});

router.post("/resend-verification", async (req, res) => {
  const { email, role } = req.body;

  try {
    const dbRole = role === "patient" ? "patient" : "doctor";
    const Model = getModel(dbRole);
    const user = await Model.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "Email doesn't exist" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    const verificationToken = jwt.sign(
      { email, role: dbRole },
      process.env.EMAIL_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({ success: true, message: "Verification email resent" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { email, role } = req.user; // from the verified JWT, not the request body

  try {
    const Model = getModel(role);
    const user = await Model.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google Sign-In and has no password to change.",
      });
    }

    const isMatch = await bcryptUtils.compareHash(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcryptUtils.hashString(newPassword);
    await Model.updateOne({ email }, { $set: { password: hashedPassword } });

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.delete("/delete", authMiddleware, async (req, res) => {
  const { email, role } = req.body;

  try {
    const Model = getModel(role);

    const result = await Model.deleteOne({ email: email });

    if (result.deletedCount === 1) {
      res
        .status(200)
        .json({ success: true, message: "Account successfully deleted!" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "User account not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/updateProfile", authMiddleware, async (req, res) => {
  const { currentUser } = req.body;

  try {
    const Model = getModel(currentUser.role);

    const { _id, email, password, role, ...updateField } = currentUser;

    const result = await Model.updateOne({ email: email }, { $set: updateField });
    if (result.modifiedCount > 0) {
      res
        .status(200)
        .json({ success: true, message: "Profile updated successfully" });
    } else {
      res
        .status(200)
        .json({ success: true, message: "Profile update failed" });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
})

module.exports = router;
