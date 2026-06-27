// ─── Shared charge store ───────────────────────────────────────────────────────
// Bridges the Doctor portal (where a treatment + final price is posted at the end
// of the encounter) and the Checkout portal (where the patient pays). Persists to
// localStorage so a charge posted by the doctor lands on the patient's bill.
// Matched by patient QID. In production this is an API-backed charge/invoice line.
import { useEffect, useState } from 'react';

const KEY = 'medly.charges.v1';

function load() {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return [];
}

let charges = load();
let seq = 2000;
const listeners = new Set();

function persist() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(charges));
  } catch (e) { /* ignore */ }
  listeners.forEach(l => l());
}

export function getCharges() { return charges.slice(); }
export function chargesForQid(qid) { return charges.filter(c => c.qid === qid); }

export function addCharge(rec) {
  const full = { id: 'ch-' + (++seq), status: 'posted', postedAt: rec.date || '', ...rec };
  charges = [...charges, full];
  persist();
  return full;
}

export function removeCharge(id) {
  charges = charges.filter(c => c.id !== id);
  persist();
}

// Replace all of a patient's charges in one go (idempotent re-post of a bill).
export function setChargesForQid(qid, recs) {
  const others = charges.filter(c => c.qid !== qid);
  const stamped = recs.map(r => ({ id: 'ch-' + (++seq), status: 'posted', postedAt: r.date || '', ...r }));
  charges = [...others, ...stamped];
  persist();
}

export function useCharges() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force(x => x + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return charges;
}
