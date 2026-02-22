
import nodemailer from "nodemailer";

export const EmailSend = async (emailTo, emailText, emailSubject) => {
  try {
    const port = parseInt(process.env.SMTP_PORT, 10);
    
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emailTo,
      subject: emailSubject,
      text: emailText,
    };

    const result = await transport.sendMail(mailOptions);
    console.log("📧 Email sent successfully to:", emailTo);
    return result;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};

