import { Resend } from 'resend';

const resend = new Resend('re_Fv9XErnn_6enWkDVFDu9JMsdnqaBeVbNF');

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // change to your domain later
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, interest } = req.body;

  // Validation
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Customer email
  const customerTemplate = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background-color:#F2F0EC;font-family:'Jost',Arial,sans-serif;">
    <div style="padding:64px 20px;">
      <div style="max-width:520px;margin:0 auto;background:#1E2D4A;padding:56px 52px 52px;text-align:center;">
        <img src="https://southbostonlanding.com/south-boston-landing-logo-white.png" style="width:180px;margin-bottom:24px;" />
        <h1 style="font-family:Georgia,serif;font-size:36px;font-style:italic;color:#fff;margin:0 0 24px;">You're in.</h1>
        <p style="font-size:13px;line-height:1.9;color:#A8B8C9;">
          Thank you for your interest in South Boston Landing.<br>
          Someone from our team will be in touch with you shortly.
        </p>
      </div>
      <p style="text-align:center;margin-top:28px;font-size:10px;letter-spacing:2px;color:#B7B0A3;">
        South Boston Landing
      </p>
    </div>
  </body>
  </html>
  `;

  // Owner email
  const ownerTemplate = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background-color:#F2F0EC;font-family:'Jost',Arial,sans-serif;">
    <div style="padding:64px 20px;">
      <div style="max-width:520px;margin:0 auto;background:#1E2D4A;padding:56px 52px 52px;text-align:center;">
        <img src="https://southbostonlanding.com/south-boston-landing-logo-white.png" style="width:180px;margin-bottom:24px;" />
        
        <h1 style="font-family:Georgia,serif;font-size:32px;font-style:italic;color:#fff;margin-bottom:20px;">
          New Inquiry
        </h1>

        <p style="font-size:13px;color:#A8B8C9;">
          A new inquiry has been received.
        </p>

        <div style="margin-top:28px;text-align:left;color:#fff;">
          <p style="font-size:11px;text-transform:uppercase;color:#A8B8C9;">Email</p>
          <p style="margin:0 0 12px;">${cleanEmail}</p>

          <p style="font-size:11px;text-transform:uppercase;color:#A8B8C9;">Interest</p>
          <p style="margin:0;">${interest || 'General'}</p>
        </div>
      </div>

      <p style="text-align:center;margin-top:28px;font-size:10px;letter-spacing:2px;color:#B7B0A3;">
        South Boston Landing
      </p>
    </div>
  </body>
  </html>
  `;

  try {
    // Send to customer
    await resend.emails.send({
      from: 'South Boston Landing <contact@southbostonlanding.com>',
      to: cleanEmail,
      subject: "You're in — South Boston Landing",
      html: customerTemplate,
    });

    // Send to owner
    await resend.emails.send({
      from: 'South Boston Landing <contact@southbostonlanding.com>',
      to: 'contact@southbostonlanding.com',
      reply_to: cleanEmail,
      subject: 'New Inquiry — South Boston Landing',
      html: ownerTemplate,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
