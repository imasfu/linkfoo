const crypto = require('crypto');

// POST /api/send-otp  { email }  ->  { token }
// Kirim lewat EmailJS REST API (server-side, memakai private key).
// Env di Vercel: EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY, OTP_SECRET
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { OTP_SECRET, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;
  if (!OTP_SECRET || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY)
    return res.status(501).json({ error: 'not_configured' });

  const email = String((req.body && req.body.email) || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'invalid_email' });

  const code = String(crypto.randomInt(0, 10000)).padStart(4, '0');
  const exp = Date.now() + 5 * 60 * 1000;
  const sig = crypto.createHmac('sha256', OTP_SECRET).update(`${email}|${code}|${exp}`).digest('hex');

  const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      template_params: { to_email: email, email, otp_code: code, passcode: code }
    })
  });
  if (!r.ok) return res.status(502).json({ error: 'send_failed' });
  return res.status(200).json({ token: `${exp}.${sig}` });
};
