// ─── Shared clinic branding store ───────────────────────────────────────────────
// In a real deployment, the clinic's logo, name and letterhead details would be
// captured once during installation/onboarding and reused everywhere — the
// topmost header of every portal, and any exported document (like the patient
// file PDF). Here that "installation step" is simulated by the Admin ▸ Settings
// ▸ Clinic branding form; it persists to localStorage so every portal (Reception,
// Doctor, Admin) reads the same branding, and stays in sync within a session.
import { useEffect, useState } from 'react';

const KEY = 'medly.clinicConfig.v1';

// Defaults match the clinic used throughout these prototypes, so nothing looks
// different until an admin actually fills in the branding form.
const DEFAULTS = {
  name: 'Yasmeen Clinic',
  nameAr: 'عيادة الياسمين',
  tagline: 'Dental & Aesthetic Medicine',
  city: 'Doha, Qatar',
  address: '',
  phone: '',
  email: '',
  license: '',
  logoUrl: null,
  primaryColor: '#0C6B5A',
  headerBg: '#0f1f1a',
  configured: false,
  updatedAt: null,
};

function load() {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }
  return { ...DEFAULTS };
}

let config = load();
const listeners = new Set();

function persist() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(config));
  } catch (e) { /* ignore */ }
  listeners.forEach(l => l());
}

export function getClinicConfig() { return { ...config }; }

export function setClinicConfig(patch) {
  config = { ...config, ...patch, configured: true, updatedAt: new Date().toISOString().slice(0, 10) };
  persist();
  return { ...config };
}

export function resetClinicConfig() {
  config = { ...DEFAULTS };
  persist();
}

// Subscribe a component to branding changes (returns the current config).
export function useClinicConfig() {
  const [cfg, setCfg] = useState(config);
  useEffect(() => {
    const l = () => setCfg({ ...config });
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return cfg;
}
