// ─── Shared patient audit / change-log store ───────────────────────────────────
// Every change to a patient's file — appointment booked/rescheduled/cancelled,
// insurance added or updated, consent signed, reception notes edited — is
// appended here so the file carries a full "who changed what, and when" trail.
// Read by the Reception, Admin and Doctor portals wherever a patient's file is
// opened. Patients are matched by QID (falling back to file number for
// patients without one yet, e.g. mid-registration). Persists to localStorage.
// In production this would be an append-only, server-written audit log rather
// than something the client can edit directly.
import { useEffect, useState } from 'react';

const KEY = 'medly.auditlog.v1';

// Pre-existing history for a patient already seeded elsewhere, so the log
// isn't empty on first load.
const SEED = [
  { id: 'al-seed-2', qid: '28934567812', fileNo: 'YC-2024-0142', patientName: 'Aisha Al-Kuwari',
    action: 'Consent signed', detail: 'Root canal treatment · iPad', actor: 'Rania Mansour', at: '2026-06-08T09:14:00.000Z' },
  { id: 'al-seed-1', qid: '28934567812', fileNo: 'YC-2024-0142', patientName: 'Aisha Al-Kuwari',
    action: 'Patient registered', detail: 'Insurer: QLM / QLM-447821', actor: 'Rania Mansour', at: '2024-02-10T08:00:00.000Z' },
];

function load() {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return SEED.slice();
}

let entries = load();
// Counter alone would collide with entries already persisted from a prior
// page load (it always restarts at 0); Date.now() alone would collide if two
// changes are logged within the same millisecond. Combining both is unique
// both across reloads and within a single synchronous burst of calls.
let seq = 0;
const listeners = new Set();

function persist() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(entries));
  } catch (e) { /* ignore */ }
  listeners.forEach(l => l());
}

// Append a change. `actor` is the role or name responsible (e.g. 'Reception',
// 'Nurse', 'Dr. Layla Al-Mahmoud') — this prototype has no login system, so
// callers pass whichever identity the current screen already knows.
export function logChange({ qid, fileNo, patientName, action, detail, actor }) {
  const entry = {
    id: 'al-' + Date.now() + '-' + (++seq),
    qid: qid || '', fileNo: fileNo || '', patientName: patientName || '',
    action, detail: detail || '', actor: actor || 'Reception',
    at: new Date().toISOString(),
  };
  entries = [entry, ...entries];
  persist();
  return entry;
}

// All log entries for one patient, newest first.
export function auditLogFor(patient) {
  if (!patient) return [];
  const list = patient.qid
    ? entries.filter(e => e.qid === patient.qid)
    : entries.filter(e => !e.qid && patient.fileNo && e.fileNo === patient.fileNo);
  return list.slice().sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

// Subscribe a component to audit-log changes (returns the current list).
export function useAuditLog() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force(x => x + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return entries;
}
