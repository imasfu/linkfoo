/* Linkfoo - helper bersama */
const LF = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },

  session() { return LF.get('lf_session', null); },
  profile() { return LF.get('lf_profile', null); },
  emptyProfile(email) {
    const u = (email || '').split('@')[0].replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase();
    return { username: u, title: '', avatar: '', bg: '', links: [] };
  },

  async hash(s) {
    try {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
    } catch (e) { return btoa(unescape(encodeURIComponent(s))); }
  },

  toast(msg, ms = 4000) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(LF._tt); LF._tt = setTimeout(() => t.classList.remove('show'), ms);
  },

  validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); },
  normUrl(u) { u = (u || '').trim(); if (!u) return ''; return /^(https?:|mailto:|tel:)/i.test(u) ? u : 'https://' + u; },

  defaultAvatar: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#000"/><circle cx="50" cy="36" r="17" fill="#fff"/><path d="M16 100c0-24 15-36 34-36s34 12 34 36z" fill="#fff"/></svg>',

  /* OTP: pakai server (Vercel /api) bila tersedia, jika tidak -> mode demo */
  async sendOtp(email) {
    try {
      const r = await fetch('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (r.ok) {
        const j = await r.json();
        LF.set('lf_otp', { email, token: j.token, mode: 'server', sentAt: Date.now() });
        return { mode: 'server' };
      }
      if (r.status === 400 || r.status === 502) return { error: 'Gagal mengirim email OTP. Periksa alamat email atau konfigurasi server.' };
    } catch (e) {}
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const rec = { email, code, exp: Date.now() + 5 * 60000, mode: 'demo', sentAt: Date.now() };
    const c = window.LF_CONFIG && LF_CONFIG.emailjs;
    if (c && c.publicKey && c.serviceId && c.templateId && !/^GANTI/.test(c.templateId)) {
      // tanpa server (mis. GitHub Pages): kirim langsung lewat EmailJS dari browser
      try {
        const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service_id: c.serviceId, template_id: c.templateId, user_id: c.publicKey,
            template_params: { to_email: email, email, otp_code: code, passcode: code } })
        });
        if (r.ok) { rec.mode = 'client'; LF.set('lf_otp', rec); return { mode: 'client' }; }
      } catch (e) {}
      return { error: 'Gagal mengirim email OTP. Cek konfigurasi EmailJS (Template ID, domain yang diizinkan).' };
    }
    LF.set('lf_otp', rec);
    return { mode: 'demo', code };
  },
  async verifyOtp(code) {
    const o = LF.get('lf_otp', null);
    if (!o) return false;
    if (o.mode === 'demo' || o.mode === 'client') return Date.now() < o.exp && o.code === code;
    try {
      const r = await fetch('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: o.email, code, token: o.token }) });
      if (!r.ok) return false;
      return !!(await r.json()).ok;
    } catch (e) { return false; }
  },

  /* kompres gambar agar muat di localStorage */
  resizeImage(file, max, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('baca file gagal'));
      fr.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('bukan gambar'));
        img.onload = () => {
          const s = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
          x.drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', quality));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
};
