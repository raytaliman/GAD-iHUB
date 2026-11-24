import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
  const { email, code, parentName, contactNumber, countryCode, idCardImage } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  const name = parentName || 'Valued Visitor';

  try {
    // 1. Generate QR Code image buffer with purple theme
    const qrCodeBuffer = await QRCode.toBuffer(String(code), {
      width: 280,
      margin: 2,
      color: {
        dark: '#7030a0',
        light: '#ffffff'
      }
    });

    // 2. Prepare attachments
    const attachments = [
      {
        filename: `qrcode-${code}.png`,
        content: qrCodeBuffer,
        cid: 'qrcode'
      }
    ];

    // Attach ID Card image if provided by frontend
    if (idCardImage && typeof idCardImage === 'string') {
      const base64Data = idCardImage.includes('base64,') ? idCardImage.split('base64,')[1] : idCardImage;
      attachments.push({
        filename: `AccessPass-${code}.png`,
        content: Buffer.from(base64Data, 'base64'),
        contentType: 'image/png'
      });
    }

    // 3. Email Body (Only Code ID and QR Code in main body, with ID attached as image)
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Your GAD Innovation Hub Registration Code & Access Pass [${code}]`,
      text: `Hello ${name},\n\nThank you for registering at the DOST Ilocos Region GAD Innovation Hub.\n\nYour Registration Code is: ${code}\n\nYour QR Code and official Access Pass ID Card (AccessPass-${code}.png) have been attached to this email.\n\nYou can present your QR code or registration code at the entrance kiosk scanner to quickly check in and complete your service evaluation.\n\nBest regards,\nDOST Ilocos Region Innovation Hub for GAD`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin: 0; padding: 24px 10px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; line-height: 1.5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
            
            <!-- Header banner -->
            <tr>
              <td style="background: linear-gradient(135deg, #7030a0 0%, #4a1d6d 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">GAD Innovation Hub</h1>
                <p style="margin: 6px 0 0; font-size: 13px; color: #e9d5ff; font-weight: 500;">DOST Ilocos Region • City of San Fernando, La Union</p>
              </td>
            </tr>

            <!-- Main Greeting & Description -->
            <tr>
              <td style="padding: 28px 28px 12px 28px; text-align: center;">
                <p style="margin: 0 0 10px; font-size: 16px; color: #1e293b;">Hello <strong>${name}</strong>,</p>
                <p style="margin: 0 0 20px; font-size: 14px; color: #475569; line-height: 1.6;">
                  Thank you for registering at the DOST Ilocos Region GAD Innovation Hub. Below is your <strong>Registration Code</strong> and scannable <strong>QR Code</strong>.
                </p>
              </td>
            </tr>

            <!-- QR CODE (TOP) & CODE ID (BELOW) BOX -->
            <tr>
              <td style="padding: 0 28px 20px 28px;" align="center">
                <div style="max-width: 360px; background-color: #faf5ff; border: 2px dashed #d8b4fe; border-radius: 20px; padding: 24px 20px; text-align: center;">
                  
                  <!-- QR Code on top -->
                  <div style="background-color: #ffffff; padding: 12px; border-radius: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(112, 48, 160, 0.08); margin-bottom: 16px;">
                    <img src="cid:qrcode" width="190" height="190" alt="QR Code" style="display: block; border-radius: 8px;" />
                  </div>

                  <!-- Code ID below QR Code -->
                  <span style="display: block; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">
                    Code ID
                  </span>
                  
                  <div style="font-size: 38px; font-weight: 900; color: #7030a0; letter-spacing: 3px; line-height: 1.2; margin-bottom: 12px;">
                    ${code}
                  </div>

                  <p style="margin: 0; font-size: 12px; font-weight: 700; color: #64748b;">
                    Scan this QR code at the entrance kiosk scanner to check in
                  </p>

                </div>
              </td>
            </tr>

            <!-- Downloadable ID Notice -->
            <tr>
              <td style="padding: 0 28px 24px 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 18px;">
                  <tr>
                    <td>
                      <p style="margin: 0 0 6px; font-size: 13px; font-weight: 800; color: #1e293b;">
                        🪪 Access Pass ID Card Attached
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
                        Your official Access Pass ID Card is attached to this email as an image file (<strong>AccessPass-${code}.png</strong>). You can download and save it to your phone or print it anytime.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; color: #94a3b8; font-size: 11px;">
                <p style="margin: 0 0 4px; font-weight: 600; color: #64748b;">DOST Ilocos Region Innovation Hub for GAD</p>
                <p style="margin: 0;">Department of Science and Technology, Regional Office No. 1, DMMMSU-MLUC Campus, City of San Fernando, La Union</p>
              </td>
            </tr>

          </table>
        </body>
        </html>
      `,
      attachments: attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error generating and sending email:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Email service listening at http://localhost:${port}`);
});
