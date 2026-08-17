const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.REACT_APP_API_URL}/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your PulseMD account",
    html: `
      <p>Welcome to PulseMD!</p>
      <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    `,
  });
}

module.exports = { sendVerificationEmail };
