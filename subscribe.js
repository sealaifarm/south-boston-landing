import { Resend } from 'resend';

const resend = new Resend('re_Fv9XErnn_6enWkDVFDu9JMsdnqaBeVbNF');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, interest } = req.body;

  // Validate email
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Send confirmation email to the user
    await resend.emails.send({
      from: 'South Boston Landing <onboarding@resend.dev>',
      to: cleanEmail,
      subject: "You're on the list — South Boston Landing",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f8f8f6;font-family:'Georgia',serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f6;padding:48px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e8e6e0;">
                <tr>
                  <td style="background:#1a1a18;padding:36px 48px;text-align:center;">
                    <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#ffffff;letter-spacing:0.04em;">South Boston Landing</p>
                    <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;">804 East 7th Street · South Boston</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:52px 48px 40px;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#3498db;font-family:Arial,sans-serif;">Welcome</p>
                    <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:30px;font-weight:300;color:#1a1a18;line-height:1.2;">You're on the list.</h1>
                    <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#5a5a55;font-family:Arial,sans-serif;font-weight:300;">Thank you for your interest in South Boston Landing — 15 exclusive residences at 804 East 7th Street in South Boston's City Point neighborhood.</p>
                    <p style="margin:0 0 36px;font-size:15px;line-height:1.8;color:#5a5a55;font-family:Arial,sans-serif;font-weight:300;">You'll be among the first to receive pricing, floor plans, and private viewing invitations as they become available.</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#3498db;border-radius:100px;">
                          <a href="https://southbostonlanding.com" style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:12px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;text-decoration:none;">View Residences</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 48px 36px;border-top:1px solid #e8e6e0;">
                    <p style="margin:0;font-size:12px;color:#9a9a95;font-family:Arial,sans-serif;line-height:1.6;">804 East 7th Street, South Boston, MA · <a href="#" style="color:#9a9a95;">Unsubscribe</a></p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    // 2. Send notification email to the owner
    await resend.emails.send({
      from: 'South Boston Landing <onboarding@resend.dev>',
      to: 'sealaifarm@gmail.com',
      subject: 'New Lead — South Boston Landing',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:32px;background:#f8f8f6;font-family:Arial,sans-serif;">
          <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e8e6e0;padding:40px;">
            <tr>
              <td>

                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#3498db;">
                  New Lead
                </p>

                <h2 style="margin:0 0 24px;font-family:Georgia,serif;font-size:24px;font-weight:300;color:#1a1a18;">
                  South Boston Landing
                </h2>

                <p style="margin:0 0 12px;font-size:13px;color:#5a5a55;">
                  A new visitor submitted their information:
                </p>

                <!-- EMAIL -->
                <p style="margin:16px 0;font-size:18px;font-weight:500;color:#1a1a18;background:#f8f8f6;padding:16px 20px;border-left:3px solid #3498db;">
                  ${cleanEmail}
                </p>

                <!-- INTEREST -->
                <p style="margin:0 0 16px;font-size:14px;color:#5a5a55;">
                  Interest: 
                  <strong style="color:#1a1a18;">
                    ${interest || 'General'}
                  </strong>
                </p>

                <!-- TIME -->
                <p style="margin:0;font-size:12px;color:#9a9a95;">
                  Submitted at ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
                </p>

              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true, message: "You're on the list!" });

  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
}
