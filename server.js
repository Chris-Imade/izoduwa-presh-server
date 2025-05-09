require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000; // You can choose any port

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
    from: `"${name}" <${process.env.EMAIL_USER}>`, // Sender address (shows as Name <your_app_email>)
    to: process.env.ADMIN_EMAIL, // Admin's email address from .env
    subject: subject || `New Contact Form: ${name}`, // Subject line
    text: `You have a new message from your website contact form:\n\nName: ${name}\nEmail: ${email}\nSubject: ${
      subject || "N/A"
    }\nMessage:\n${message}`,
    html: `<p>You have a new message from your website contact form:</p>
           <ul>
             <li><strong>Name:</strong> ${name}</li>
             <li><strong>Email:</strong> ${email}</li>
             <li><strong>Subject:</strong> ${subject || "N/A"}</li>
           </ul>
           <p><strong>Message:</strong></p>
           <p>${message.replace(/\n/g, "<br>")}</p>`,
  };

  // 2. Email options for User Confirmation
  const userMailOptions = {
    from: `"Your Website Name" <${process.env.EMAIL_USER}>`, // Your website name and app email
    to: email, // User's email address from form
    subject: `Thank you for contacting us, ${name}!`, // Confirmation subject
    text: `Hi ${name},\n\nThank you for reaching out! We have received your message and will get back to you shortly if a response is needed.\n\nYour submission:\nSubject: ${
      subject || "N/A"
    }\nMessage:\n${message}\n\nBest regards,\nYour Website Team`,
    html: `<p>Hi ${name},</p>
           <p>Thank you for reaching out! We have received your message and will get back to you shortly if a response is needed.</p>
           <p><strong>Your submission:</strong></p>
           <ul>
             <li><strong>Subject:</strong> ${subject || "N/A"}</li>
           </ul>
           <p><strong>Message:</strong></p>
           <p>${message.replace(/\n/g, "<br>")}</p>
           <p>Best regards,<br>Your Website Team</p>`,
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
