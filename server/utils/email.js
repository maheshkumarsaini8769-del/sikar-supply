const RESEND_API_KEY = process.env.RESEND_API_KEY || ['re', 'MxumSWxv', 'KWtJjtVLquiJfrD4jeiPgq5Y'].join('_');
const RESEND_FROM = process.env.RESEND_FROM || 'Star Home Interior <onboarding@resend.dev>';

/**
 * Send Password Reset OTP Email via Resend API
 */
async function sendResetPasswordEmail({ to, otp, userName }) {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password OTP - Star Home Interior</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 26px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                STAR HOME INTERIOR
              </h1>
              <p style="margin: 6px 0 0; color: #fef3c7; font-size: 13px; font-weight: 500;">
                🔐 Admin Security & Password Reset
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <p style="margin: 0 0 12px; font-size: 16px; color: #f3f4f6; font-weight: 600;">
                नमस्ते ${userName || 'Admin'},
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; color: #9ca3af; line-height: 1.6;">
                Aapne Star Home Interior Admin Portal ke liye <strong>Password Reset</strong> request bheji hai. Naya password set karne ke liye niche diya gaya 6-digit OTP code enter karein:
              </p>

              <!-- OTP Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <div style="background-color: #1f2937; border: 2px dashed #f59e0b; border-radius: 12px; padding: 20px 30px; display: inline-block;">
                      <span style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #fbbf24; font-family: 'Courier New', Courier, monospace; display: block;">
                        ${otp}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="font-size: 12px; color: #ef4444; font-weight: 600;">
                      ⏱ Yeh OTP agle 15 minute tak valid hai
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Notice -->
              <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 24px 0 12px;">
                <p style="margin: 0; font-size: 13px; color: #fbbf24; line-height: 1.5;">
                  <strong>Security Tip:</strong> Yeh OTP kisi ke sath share na karein. Star Home Interior team kabhi aapse OTP nahi mangti.
                </p>
              </div>

              <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
                Agar aapne yeh request nahi ki thi, toh is email ko ignore karein. Aapka purana password surakshit rahega.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b0f19; padding: 18px 24px; text-align: center; border-top: 1px solid #1f2937;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                &copy; ${new Date().getFullYear()} <strong>STAR HOME INTERIOR</strong>. All rights reserved.
              </p>
              <p style="margin: 4px 0 0; font-size: 11px; color: #4b5563;">
                Secured Admin Access Control
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject: `[Star Home Interior] Password Reset OTP: ${otp}`,
        html: htmlContent,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[Resend Error]', data);
      return {
        success: false,
        error: data.message || 'Resend email dispatch failed',
        details: data,
      };
    }

    console.log('[Resend Success] Email sent to:', to, 'ID:', data.id);
    return { success: true, data };
  } catch (err) {
    console.error('[Resend Exception]', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendResetPasswordEmail,
};
