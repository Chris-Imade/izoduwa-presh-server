require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const cors = require("cors");

const app = express();

// Enable CORS for all routes and all origins
app.use(cors());

const port = process.env.PORT || 3000; // You can choose any port

// Base route for health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Mail server is up and running!" });
});

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (if you have any, e.g., for testing or a success page)
// app.use(express.static(path.join(__dirname, 'public')));

// POST route to handle form submission
app.post("/send-email", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, email, and message are required." });
  }

  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com", // Default to Gmail SMTP if not set
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === "true" || false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email address from .env
      pass: process.env.EMAIL_PASS, // Your email password or app password from .env
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // 1. Email options for Admin
  const adminMailOptions = {
    from: `"${name}" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: subject || `New Contact Form: ${name}`,
    text: `You have a new message from your website contact form:\n\nName: ${name}\nEmail: ${email}\nSubject: ${
      subject || "N/A"
    }\nMessage:\n${message}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border-top: 4px solid #4F46E5;">
        <h2 style="color: #333; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Form Submission</h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px;">
          <p style="margin-top: 0; color: #555; font-size: 16px;">You've received a new message from your website contact form.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #777; width: 100px;">Name:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 500; color: #333;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #777;">Email:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 500; color: #333;"><a href="mailto:${email}" style="color: #4F46E5; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #777;">Subject:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 500; color: #333;">${
                subject || "N/A"
              }</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px;">
            <h3 style="color: #555; font-size: 16px; margin-bottom: 10px;">Message:</h3>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; color: #333; line-height: 1.5; white-space: pre-wrap;">${message.replace(
              /\n/g,
              "<br>"
            )}</div>
          </div>
        </div>
        
        <div style="color: #999; font-size: 13px; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>This is an automated message from your portfolio website contact form.</p>
        </div>
      </div>
    `,
  };

  // 2. Email options for User Confirmation
  const userMailOptions = {
    from: `"Your Website Name" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Thank you for contacting us, ${name}!`,
    text: `Hi ${name},\n\nThank you for reaching out! We have received your message and will get back to you shortly if a response is needed.\n\nYour submission:\nSubject: ${
      subject || "N/A"
    }\nMessage:\n${message}\n\nBest regards,\nYour Website Team`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border-top: 4px solid #4F46E5;">
        <h2 style="color: #333; margin-top: 0; padding-bottom: 10px;">Thank You for Your Message</h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <p style="margin-top: 0; color: #555; font-size: 16px;">Hi ${name},</p>
          
          <p style="color: #555; line-height: 1.5;">Thank you for reaching out! We have received your message and will get back to you shortly if a response is needed.</p>
          
          <div style="margin: 25px 0; padding: 20px; background-color: #f5f5f5; border-left: 4px solid #4F46E5; border-radius: 4px;">
            <h3 style="color: #444; font-size: 16px; margin-top: 0; margin-bottom: 12px;">Your submission:</h3>
            
            <div style="margin-bottom: 15px;">
              <span style="display: block; font-size: 14px; color: #777; margin-bottom: 5px;">Subject:</span>
              <span style="display: block; font-weight: 500; color: #333;">${
                subject || "N/A"
              }</span>
            </div>
            
            <div>
              <span style="display: block; font-size: 14px; color: #777; margin-bottom: 5px;">Message:</span>
              <span style="display: block; color: #333; line-height: 1.5; white-space: pre-wrap;">${message.replace(
                /\n/g,
                "<br>"
              )}</span>
            </div>
          </div>
          
          <p style="color: #555; line-height: 1.5;">If you have any more questions or need further assistance, please don't hesitate to contact us again.</p>
          
          <p style="color: #555; margin-bottom: 0;">Best regards,<br>Your Website Team</p>
        </div>
        
        <div style="color: #999; font-size: 13px; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin-bottom: 5px;">This is an automated confirmation of your message submission.</p>
          <p style="margin-top: 0;">Please do not reply to this email.</p>
        </div>
      </div>
    `,
  };

  try {
    // Send email to Admin
    const adminMailInfo = await transporter.sendMail(adminMailOptions);
    console.log("Admin email sent: %s", adminMailInfo.messageId);

    // Send confirmation email to User
    const userMailInfo = await transporter.sendMail(userMailOptions);
    console.log("User confirmation email sent: %s", userMailInfo.messageId);

    res.status(200).json({
      success: true,
      message: "Message sent successfully to admin and user!",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    // Determine which email failed if necessary, or send a generic error
    let errorMessage = "Failed to send message.";
    if (error.errors && error.errors.length > 0) {
      // Nodemailer can return an array of errors for multiple recipients
      errorMessage +=
        " Details: " + error.errors.map((e) => e.message).join("; ");
    } else {
      errorMessage += " Details: " + error.message;
    }
    res.status(500).json({ error: errorMessage });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
