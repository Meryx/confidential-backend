// src/utils/mailer.js
import nodemailer from "nodemailer";

async function createTransporter() {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
}

async function sendPasswordResetEmail(userEmail, token) {
  const transporter = await createTransporter();

  const info = await transporter.sendMail({
    from: '"Your App Name" <no-reply@yourapp.com>',
    to: userEmail,
    subject: "Password Reset",
    html: `<p>To reset your password, please click on the following link: <a href="http://localhost:3000/reset-password/${token}">Reset Password</a></p>`, // Adjust according to your front-end URL
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

export { sendPasswordResetEmail };

export default createTransporter;
