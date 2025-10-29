import nodemailer from "nodemailer";

async function testEmail() {
  const EMAIL_ADDRESS = process.env.EMAIL_SENDER_ADDRESS;
  const APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;
  const SENDER_NAME = process.env.EMAIL_SENDER_NAME;

  console.log("Testing Gmail SMTP connection...");
  console.log(`Email: ${EMAIL_ADDRESS}`);
  console.log(`App Password length: ${APP_PASSWORD?.length} chars`);
  console.log(`App Password (masked): ${APP_PASSWORD?.substring(0, 4)}...${APP_PASSWORD?.substring(APP_PASSWORD.length - 4)}`);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use STARTTLS
    auth: {
      user: EMAIL_ADDRESS,
      pass: APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: true
    }
  });

  try {
    // Verify connection
    console.log("Attempting to verify SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully!");

    // Send test email
    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: {
        name: SENDER_NAME || "Task Management",
        address: EMAIL_ADDRESS || ""
      },
      to: "ahmet.elhalit@innogy.com.tr",
      subject: "Test Email from Task Management System",
      text: "This is a test email to verify Gmail SMTP is working correctly."
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Email test failed:");
    console.error(error);
  }
}

testEmail();
