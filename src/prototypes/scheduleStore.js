// ─── Shared staff schedule store ───────────────────────────────────────────────
// Working hours, breaks, off-days and vacations for every staff member
// (doctors, trainees, nurses, receptionists), keyed by staff id.
//
// Configured in the Admin portal (Settings → Schedules) and read by the Reception
// portal, where a doctor's schedule blocks out slots in the booking calendar.
// The schedule shape is identical to what Reception already used so admin edits
// show up 1:1 in the reception day view.
//
// Persists to localStorage so both portals share one source of truth and it
// survives reloads. In production this is an API-backed staff-scheduling service.
import { useEffect, useState } from 'react';

const KEY = 'medly.schedules.v1';

// Days of the week, lower-case — matches Reception's dayOfWeek() output.
export const WEEK_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// A sensible default for any staff member without an explicit schedule.
export const defaultSchedule = () => ({
  workStart: '09:00', workEnd: '17:00',
  offDays: ['friday'],
  breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }],
  vacations: [],
});

// Seed — doctor rows are copied verbatim from Reception's original DOCTOR_SCHEDULES
// so existing booking-grid behaviour is unchanged on first load.
const SEED = {
  // Doctors
  d1: { workStart: '09:00', workEnd: '17:00', offDays: ['friday'],            breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }],           vacations: [] },
  d2: { workStart: '10:00', workEnd: '18:00', offDays: ['friday', 'saturday'], breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }],           vacations: [{ start: '2026-06-15', end: '2026-06-22', reason: 'Annual leave' }] },
  d3: { workStart: '09:00', workEnd: '18:00', offDays: ['friday'],            breaks: [{ start: '12:30', end: '13:30', label: 'Prayer + lunch' }],  vacations: [] },
  d4: { workStart: '11:00', workEnd: '18:00', offDays: ['friday', 'sunday'],   breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }],           vacations: [] },
  d5: { workStart: '12:00', workEnd: '18:00', offDays: ['friday'],            breaks: [],                                                           vacations: [{ start: '2026-05-28', end: '2026-05-30', reason: 'Conference' }] },
  d6: { workStart: '09:00', workEnd: '17:00', offDays: ['friday'],            breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }],           vacations: [] },
  // Trainees
  tr1: { workStart: '09:00', workEnd: '15:00', offDays: ['friday'],            breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }], vacations: [] },
  tr2: { workStart: '10:00', workEnd: '16:00', offDays: ['friday'],            breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }], vacations: [] },
  tr3: { workStart: '09:00', workEnd: '15:00', offDays: ['friday', 'saturday'], breaks: [],                                                vacations: [] },
  // Nurses
  n1: { workStart: '09:00', workEnd: '17:00', offDays: ['friday'],            breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }], vacations: [] },
  n2: { workStart: '08:00', workEnd: '16:00', offDays: ['friday'],            breaks: [{ start: '12:30', end: '13:30', label: 'Lunch' }], vacations: [] },
  n3: { workStart: '10:00', workEnd: '18:00', offDays: ['friday', 'saturday'], breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }], vacations: [] },
  n4: { workStart: '12:00', workEnd: '18:00', offDays: ['friday'],            breaks: [],                                                vacations: [] },
  // Receptionists (front desk shifts)
  r1: { workStart: '08:00', workEnd: '16:00', offDays: ['friday'],            breaks: [{ start: '12:30', end: '13:30', label: 'Lunch' }], vacations: [] },
  r2: { workStart: '12:00', workEnd: '20:00', offDays: ['saturday'],          breaks: [{ start: '16:00', end: '16:30', label: 'Break' }], vacations: [] },
};

function load() {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return JSON.parse(JSON.stringify(SEED));
}

let schedules = load();
const listeners = new Set();

function persist() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(schedules));
  } catch (e) { /* ignore */ }
  listeners.forEach(l => l());
}

// Live reference for read-heavy callers (e.g. Reception's isSlotBlocked runs per
// cell). Falls back to a default so unknown ids never crash the calendar.
export function getSchedule(id) { return schedules[id] || defaultSchedule(); }

export function getSchedules() { return schedules; }

export function setSchedule(id, sched) {
  schedules = { ...schedules, [id]: sched };
  persist();
}

export function saveSchedules(map) {
  schedules = map;
  persist();
}

export function useSchedules() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force(x => x + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return schedules;
}
