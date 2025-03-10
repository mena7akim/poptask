const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "stmp.gmail.com",
    port: 587,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `Poptask <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  console.log(mailOptions);

  await transporter.sendMail(mailOptions);

  console.info(`Email Sent with subject: ${subject} to ${to}`);
};

module.exports = sendEmail;
