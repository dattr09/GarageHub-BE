const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // có thể đổi sang SMTP riêng
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, text) {
  await transporter.sendMail({
    from: `"MyApp" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
}

module.exports = sendEmail;
