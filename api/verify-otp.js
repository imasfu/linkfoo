const crypto = require('crypto');

// POST /api/verify-otp  { email, code, token }  ->  { ok: true|false }
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const secret = process.env.OTP_SECRET;
  if (!secret) return res.status(501).json({ error: 'not_configured' });

  const b = req.body || {};
  const email = String(b.email || '').trim().toLowerCase();
  const code = String(b.code || '');
  const [exp, sig] = String(b.token || '').split('.');
  if (!/^\d{4}$/.test(code) || !exp || !sig || Date.now() > Number(exp)) return res.status(200).json({ ok: false });

  const expected = crypto.createHmac('sha256', secret).update(`${email}|${code}|${exp}`).digest('hex');
  const a = Buffer.from(expected), c = Buffer.from(sig);
  const ok = a.length === c.length && crypto.timingSafeEqual(a, c);
  return res.status(200).json({ ok });
};
