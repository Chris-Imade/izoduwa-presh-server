# Portfolio Contact Form Mail Server

This project is a Node.js Express server designed to handle contact form submissions from a portfolio website. It uses Nodemailer to send email notifications to the site admin and confirmation emails to the user who submitted the form.

## Features

- Receives contact form data (name, email, subject, message).
- Sends an email notification to the admin.
- Sends a confirmation email to the user.
- Uses environment variables for secure configuration of email credentials and other settings.

## Prerequisites

- Node.js and npm (or yarn) installed.
- An email account (e.g., Gmail, Outlook365, SendGrid) to be used for sending emails.

## Setup

1.  **Clone the repository (if applicable) or download the files.**

2.  **Navigate to the project directory:**

    ```bash
    cd path/to/your/project
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Create a `.env` file** in the root of the project directory. Copy the contents of `.env.example` (if provided) or create it from scratch with the following variables:

    ```env
    # Email Service Configuration
    EMAIL_HOST=your_smtp_host        # e.g., smtp.gmail.com for Gmail
    EMAIL_PORT=your_smtp_port        # e.g., 587 for TLS, 465 for SSL
    EMAIL_SECURE=false               # true if using port 465 (SSL), false for others (TLS/STARTTLS)
    EMAIL_USER=your_email_address    # The email address to send from
    EMAIL_PASS=your_email_password   # The password for EMAIL_USER (or App Password for Gmail)

    # Admin Configuration
    ADMIN_EMAIL=your_admin_email     # Email address where admin notifications will be sent

    # Server Configuration
    PORT=3000                        # Port the server will run on (optional, defaults to 3000)
    ```

    **Important Notes for `.env`:**

    - Replace placeholder values (like `your_smtp_host`, `your_email_address`, etc.) with your actual credentials and settings.
    - For Gmail, if you have 2-Step Verification enabled, you'll need to generate an "App Password" to use as `EMAIL_PASS`.
    - `EMAIL_SECURE` should be `true` if `EMAIL_PORT` is `465`, otherwise `false`.

## Running the Server

1.  **Start the server:**
    ```bash
    node server.js
    ```
    You should see a message like: `Server listening at http://localhost:3000` (the port may vary based on your `.env` configuration or system availability).

## API Endpoint

- **`POST /send-email`**
  - This is the endpoint your website's contact form should submit to.
  - **Request Body (JSON or URL-encoded):**
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "subject": "Inquiry about services",
      "message": "Hello, I would like to know more..."
    }
    ```
  - **Required fields:** `name`, `email`, `message`.
  - **Responses:**
    - `200 OK`: If emails are sent successfully.
      ```json
      {
        "success": true,
        "message": "Message sent successfully to admin and user!"
      }
      ```
    - `400 Bad Request`: If required fields are missing.
      ```json
      {
        "error": "Name, email, and message are required."
      }
      ```
    - `500 Internal Server Error`: If there was an issue sending the email.
      ```json
      {
        "error": "Failed to send message. Details: ..."
      }
      ```

## Customization

- **Email Templates:** Modify the `adminMailOptions` and `userMailOptions` objects in `server.js` to change the content and structure of the emails sent.
- **"From" Name in User Confirmation:** In `server.js`, update the `from` field in `userMailOptions` (e.g., `"Your Website Name" <${process.env.EMAIL_USER}>`) to reflect your website or brand name.

## Troubleshooting

- **Emails not sending:**
  - Double-check your `.env` file for correct email credentials (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`).
  - Ensure your email provider allows SMTP access. Some providers might require you to enable it or adjust security settings (e.g., Gmail's "Less secure app access" if not using an App Password).
  - Check the server console for error messages from Nodemailer.
- **`ECONNREFUSED` error:** Verify the `EMAIL_HOST` and `EMAIL_PORT` are correct and that your firewall isn't blocking outbound connections on that port.
