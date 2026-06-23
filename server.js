import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3003;

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send messages');
  }
});

app.post('/api/send-email', async (req, res) => {
  const { email, code, parentName } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Your GAD Innovation Hub Registration Code',
    text: `Hello ${parentName || 'Guest'},\n\nThank you for registering at the DOST Ilocos Region GAD Innovation Hub.\n\nYour registration code is: ${code}\n\nPlease use this code to complete your evaluation.\n\nBest regards,\nDOST Innovation Hub Team`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #0066cc;">GAD Innovation Hub Registration</h2>
        <p>Hello <strong>${parentName || 'Guest'}</strong>,</p>
        <p>Thank you for registering at the DOST Ilocos Region GAD Innovation Hub.</p>
        <p style="font-size: 1.1em; background-color: #f0f8ff; padding: 15px; border-radius: 5px; display: inline-block;">
          Your registration code is: <strong style="color: #e63946; font-size: 1.3em; letter-spacing: 1px;">${code}</strong>
        </p>
        <p>Please use this code to complete your customer satisfaction feedback evaluation.</p>
        <br>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 0.9em; color: #666;">Best regards,</p>
        <p style="font-size: 0.9em; color: #666; font-weight: bold;">DOST Ilocos Region Innovation Hub for GAD</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Email service listening at http://localhost:${port}`);
});
