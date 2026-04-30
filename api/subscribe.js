import { Resend } from 'resend';

const resend = new Resend('re_Fv9XErnn_6enWkDVFDu9JMsdnqaBeVbNF');

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // change to your domain later
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
  const cleanInterest = (interest || 'General').trim();

  // -------- OWNER TEMPLATE --------
  const ownerTemplateRaw = `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0; padding:0; background-color:#F2F0EC; font-family: Arial, Helvetica, sans-serif;">

  <div style="padding:64px 20px;">
    <div style="max-width:520px; margin:0 auto; background:#FFFFFF; padding:56px 52px 48px; border:1px solid #CFCBC2;">
      
      <img src="https://southbostonlanding.com/south-boston-landing-logo.png" width="200" style="display:block; margin:0 auto 40px;">

      <h1 style="font-family: Georgia, serif; font-size:28px; font-style:italic; color:#1E2D4A; text-align:center; margin:0 0 14px;">
        New Inquiry
      </h1>

      <div style="width:40px; height:2px; background:#C8A96A; margin:0 auto 20px;"></div>

      <p style="font-size:13px; line-height:1.9; color:#B7B0A3; text-align:center; margin:0 0 28px;">
        A new inquiry for South Boston Landing has been received.
      </p>

      <div style="font-size:14px; color:#B7B0A3; line-height:1.8;">
        <div style="margin-bottom:18px;">
          <div style="color:#1E2D4A; font-size:11px; text-transform:uppercase;">Email</div>
          <div>{{email}}</div>
        </div>

        <div>
          <div style="color:#1E2D4A; font-size:11px; text-transform:uppercase;">Interest</div>
          <div>{{interest}}</div>
        </div>
      </div>

    </div>

    <p style="text-align:center; margin-top:28px; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#B7B0A3;">
      South Boston Landing
    </p>
  </div>

</body>
</html>
`;

  // Inject variables
  const ownerTemplate = ownerTemplateRaw
    .replace('{{email}}', cleanEmail)
    .replace('{{interest}}', cleanInterest);

  // -------- CUSTOMER TEMPLATE --------
  const customerTemplate = `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0; padding:0; background-color:#F2F0EC; font-family: Arial, Helvetica, sans-serif;">

  <div style="padding:64px 20px;">
    <div style="max-width:520px; margin:0 auto; background:#FFFFFF; padding:56px 52px 48px; text-align:center; border:1px solid #CFCBC2;">
      
      <img src="https://southbostonlanding.com/south-boston-landing-logo.png" width="200" style="display:block; margin:0 auto 40px;">

      <h1 style="font-family: Georgia, serif; font-size:28px; font-style:italic; color:#1E2D4A; margin:0 0 16px;">
        You're in.
      </h1>

      <div style="width:40px; height:2px; background:#C8A96A; margin:0 auto 20px;"></div>

      <p style="font-size:13px; line-height:1.9; color:#B7B0A3;">
        Thank you for your interest in South Boston Landing.<br>
        Someone from our team will be in touch with you shortly.
      </p>

    </div>

    <p style="text-align:center; margin-top:28px; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#B7B0A3;">
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
