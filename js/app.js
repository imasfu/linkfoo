// Konfigurasi Supabase ditaruh di luar objek LF
const SUPABASE_URL = "https://phnprjmsyhhlkhtuvbpj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_XsbjMe60D3qKxHjYTrV-QQ_ubdcgzx_";

// Inisialisasi client Supabase
const supabaseClient = (window.supabase && typeof window.supabase.createClient === 'function')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

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

  defaultAvatar: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#000"/><circle cx="50" cy="36" r="17" fill="#fff"/><path d="M16 100c0-24 15-36 34-36s34 12 34 36z" fill="#fff"/></svg>'
};
