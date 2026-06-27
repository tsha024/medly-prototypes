// ─── Shared consent store ──────────────────────────────────────────────────────
// Bridges the Reception portal (where consent is captured at arrival by
// reception / nurse / assistant) and the Doctor portal (where it is verified
// before treatment). Persists to localStorage so a signed consent stays
// attached to the patient's file and can be referred back to in the future.
//
// In production this module would be backed by an API; here it is a singleton
// with localStorage persistence and a tiny subscription so both portals stay
// in sync within a session and across reloads. Patients are matched by QID.
import { useEffect, useState } from 'react';

const KEY = 'medly.consents.v1';

// Pre-existing consents already on file (e.g. captured at an earlier visit).
const SEED = [
  { id:'cs-seed-1', qid:'28934567812', patientName:'Aisha Al-Kuwari', fileNo:'YC-2024-0142',
    treatment:'Root canal treatment', date:'2026-06-08', method:'iPad',
    signedName:'Aisha Al-Kuwari', capturedBy:'Reception', signedAt:'2026-06-08' },
];

function load() {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return SEED.slice();
}

let consents = load();
let seq = 1000;
const listeners = new Set();

function persist() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(consents));
  } catch (e) { /* ignore */ }
  listeners.forEach(l => l());
}

// Normalize a treatment label so cross-portal names line up, e.g.
// "Filling — tooth #16" and "Filling" both reduce to "filling".
export function normalizeTreatment(t) {
  return String(t || '')
    .toLowerCase()
    .replace(/#\s*\d+/g, '')
    .replace(/tooth|teeth/g, '')
    .replace(/\b(prep|preparation|impression|seat|review|post-?op|treatment|plan|consultation|emergency)\b/g, '')
    .replace(/[^a-z]+/g, ' ')
    .trim();
}

export function getConsents() { return consents.slice(); }

export function consentsForQid(qid) {
  return consents
    .filter(c => c.qid === qid)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function findConsent(qid, treatment) {
  if (!qid) return null;
  const n = normalizeTreatment(treatment);
  return consents.find(c => c.qid === qid && normalizeTreatment(c.treatment) === n) || null;
}

export function addConsent(rec) {
  const full = { id: 'cs-' + (++seq), capturedBy: 'Reception', signedAt: rec.date || '', ...rec };
  // de-dupe an existing consent for the same patient + treatment
  consents = consents.filter(c =>
    !(c.qid === full.qid && normalizeTreatment(c.treatment) === normalizeTreatment(full.treatment)));
  consents = [full, ...consents];
  persist();
  return full;
}

// Subscribe a component to consent changes (returns the current list).
export function useConsents() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force(x => x + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return consents;
}
