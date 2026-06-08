import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calendar, Search, User, Clock, CheckCircle2, AlertCircle, Phone, Mail,
  CreditCard, Shield, ChevronLeft, ChevronRight, X, Plus, Globe, Upload,
  FileText, Settings, Coffee, Plane, Edit3, Save, Eye, Trash2, MoveVertical,
  CalendarDays, UserPlus, ChevronDown, FileImage, Paperclip, Sparkles, Stethoscope
} from 'lucide-react';

// =====================================================================
// MEDLY -- Reception Booking Prototype (v2 -- with all 12 user feedback items)
// Qatar dental + aesthetic clinic, 5-6 doctors
// =====================================================================

// ---- Doctors --------------------------------------------------------
const DOCTORS = [
  { id: 'd1', nameEn: 'Dr. Layla Al-Mahmoud', nameAr: 'د. ليلى المحمود', specialty: 'General Dentistry',  specialtyAr: 'طب الأسنان العام',  qchp: 'QCHP-D-44218', color: 'rose' },
  { id: 'd2', nameEn: 'Dr. Omar Al-Sayed',    nameAr: 'د. عمر السيد',     specialty: 'Orthodontics',       specialtyAr: 'تقويم الأسنان',      qchp: 'QCHP-D-51209', color: 'amber' },
  { id: 'd3', nameEn: 'Dr. Priya Menon',      nameAr: 'د. بريا مينون',    specialty: 'Endodontics',        specialtyAr: 'علاج العصب',         qchp: 'QCHP-D-39871', color: 'teal' },
  { id: 'd4', nameEn: 'Dr. Yusuf Hassan',     nameAr: 'د. يوسف حسن',      specialty: 'Cosmetic Dentistry', specialtyAr: 'تجميل الأسنان',      qchp: 'QCHP-D-47502', color: 'violet' },
  { id: 'd5', nameEn: 'Dr. Reem Al-Thani',    nameAr: 'د. ريم الثاني',    specialty: 'Aesthetic Medicine', specialtyAr: 'الطب التجميلي',      qchp: 'QCHP-M-22041', color: 'sky' },
  { id: 'd6', nameEn: 'Dr. Marcus Chen',      nameAr: 'د. ماركوس تشين',   specialty: 'Aesthetic Medicine', specialtyAr: 'الطب التجميلي',      qchp: 'QCHP-M-29116', color: 'emerald' },
];

// ---- Nurses (NEW: feedback item 12) ---------------------------------
const NURSES = [
  { id: 'n1', name: 'Nurse Dina Khalil',    specialty: 'Aesthetic' },
  { id: 'n2', name: 'Nurse Sara Al-Amin',   specialty: 'Dental' },
  { id: 'n3', name: 'Nurse Mariam Hassan',  specialty: 'General' },
  { id: 'n4', name: 'Nurse Aliya Rahman',   specialty: 'Aesthetic' },
];

// ---- Procedures with nurse-required flag (NEW: feedback item 12) ----
const PROCEDURES = {
  'General Dentistry':   [
    { name: 'Consultation',         dur: 30,  price: 250,  needsNurse: false },
    { name: 'Cleaning & polish',    dur: 45,  price: 400,  needsNurse: true  },
    { name: 'Filling',              dur: 45,  price: 600,  needsNurse: true  },
    { name: 'Extraction',           dur: 60,  price: 800,  needsNurse: true  },
    { name: 'X-ray (bitewing)',     dur: 15,  price: 200,  needsNurse: false },
  ],
  'Orthodontics':        [
    { name: 'Ortho consult',        dur: 45,  price: 350,  needsNurse: false },
    { name: 'Braces adjustment',    dur: 30,  price: 450,  needsNurse: true  },
    { name: 'Retainer fitting',     dur: 60,  price: 1200, needsNurse: true  },
  ],
  'Endodontics':         [
    { name: 'Root canal consult',   dur: 30,  price: 400,  needsNurse: false },
    { name: 'Root canal treatment', dur: 90,  price: 2500, needsNurse: true  },
  ],
  'Cosmetic Dentistry':  [
    { name: 'Veneer consultation',  dur: 30,  price: 300,  needsNurse: false },
    { name: 'Teeth whitening',      dur: 60,  price: 1500, needsNurse: true  },
    { name: 'Veneer fitting',       dur: 120, price: 4500, needsNurse: true  },
  ],
  'Aesthetic Medicine':  [
    { name: 'Aesthetic consult',    dur: 30,  price: 200,  needsNurse: false },
    { name: 'Botox',                dur: 45,  price: 1800, needsNurse: true  },
    { name: 'Dermal filler',        dur: 60,  price: 2400, needsNurse: true  },
    { name: 'Chemical peel',        dur: 60,  price: 900,  needsNurse: true  },
    { name: 'Hydrafacial',          dur: 60,  price: 1200, needsNurse: true  },
    { name: 'Laser hair removal',   dur: 45,  price: 800,  needsNurse: true  },
    { name: 'Microneedling',        dur: 60,  price: 1500, needsNurse: true  },
    { name: 'IV drip therapy',      dur: 45,  price: 1000, needsNurse: true  },
  ],
};

// Flat list of all procedures for autocomplete (NEW: feedback item 9)
const ALL_PROCEDURES = Object.values(PROCEDURES).flat();

// ---- Patients with file numbers + uploaded docs (NEW: items 7, 8) ---
const MOCK_PATIENTS = [
  {
    id: 'p1', fileNo: 'YC-2024-0142', qid: '28934567812',
    nameEn: 'Aisha Al-Kuwari', nameAr: 'عائشة الكواري',
    phone: '+974 5512 4488', dob: '1989-03-14',
    insurer: 'QLM', policy: 'QLM-447821', eligible: true,
    lastVisit: '2026-02-14',
    idFront: 'qid-front-aisha.jpg',
    idBack: 'qid-back-aisha.jpg',
    insuranceCard: 'qlm-card-aisha.jpg',
    allergies: ['Penicillin (rash)', 'Latex'],
    conditions: ['Type 2 diabetes (controlled)', 'Hypertension'],
    notes: 'Prefers afternoon appointments. Anxious about dental work.',
    encounterHistory: [
      { date: '2026-02-14', doctor: 'Dr. Layla Al-Mahmoud', procedure: 'Cleaning & polish', notes: 'Mild gingivitis lower right.' },
      { date: '2025-11-22', doctor: 'Dr. Reem Al-Thani',    procedure: 'Botox -- glabellar',   notes: '20U total. Pleased at follow-up.' },
      { date: '2025-08-03', doctor: 'Dr. Layla Al-Mahmoud', procedure: 'Consultation + X-rays', notes: 'Referred to endodontics.' },
    ],
  },
  {
    id: 'p2', fileNo: 'YC-2024-0089', qid: '29612039874',
    nameEn: 'James Patterson',   nameAr: 'جيمس باترسون',
    phone: '+974 7011 9923', dob: '1985-11-02',
    insurer: 'Cash/Card', policy: null, eligible: null,
    lastVisit: '2025-11-08',
    idFront: 'passport-james.jpg', idBack: null,
    insuranceCard: null,
    allergies: [],
    conditions: [],
    notes: '',
    encounterHistory: [
      { date: '2025-11-08', doctor: 'Dr. Omar Al-Sayed', procedure: 'Braces adjustment', notes: 'Progressing well.' },
    ],
  },
  {
    id: 'p3', fileNo: 'YC-2025-0317', qid: '28701445129',
    nameEn: 'Fatima Al-Mansoori', nameAr: 'فاطمة المنصوري',
    phone: '+974 3344 7712', dob: '1992-07-22',
    insurer: 'AXA', policy: 'AXA-Q-998812', eligible: true,
    lastVisit: '2026-04-30',
    idFront: 'qid-front-fatima.jpg',
    idBack: 'qid-back-fatima.jpg',
    insuranceCard: 'axa-card-fatima.jpg',
    allergies: ['Sulfa drugs'],
    conditions: [],
    notes: 'Pregnant (24 weeks). Avoid X-rays.',
    encounterHistory: [
      { date: '2026-04-30', doctor: 'Dr. Reem Al-Thani', procedure: 'Hydrafacial', notes: 'Good outcome.' },
    ],
  },
];

// ---- Status workflow (NEW: feedback item 4 -- expanded statuses) ----
const STATUS_FLOW = {
  booked:            { label: 'Booked',         labelAr: 'محجوز',     dot: 'bg-stone-400',    chip: 'bg-stone-100 text-stone-700 border-stone-300' },
  confirmed:         { label: 'Confirmed',      labelAr: 'مؤكد',      dot: 'bg-sky-500',      chip: 'bg-sky-100 text-sky-800 border-sky-300' },
  arrived:           { label: 'Arrived',        labelAr: 'وصل',       dot: 'bg-amber-500',    chip: 'bg-amber-100 text-amber-800 border-amber-300' },
  'in-progress':     { label: 'Ongoing',        labelAr: 'جاري',      dot: 'bg-emerald-500',  chip: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  'treatment-done':  { label: 'Treatment done', labelAr: 'انتهى',     dot: 'bg-violet-500',   chip: 'bg-violet-100 text-violet-800 border-violet-300' },
  'payment-done':    { label: 'Paid',           labelAr: 'مدفوع',     dot: 'bg-teal-500',     chip: 'bg-teal-100 text-teal-800 border-teal-300' },
  cancelled:         { label: 'Cancelled',      labelAr: 'ملغى',      dot: 'bg-red-400',      chip: 'bg-red-50 text-red-700 border-red-200' },
  'no-show':         { label: 'No-show',        labelAr: 'لم يحضر',   dot: 'bg-red-600',      chip: 'bg-red-100 text-red-800 border-red-300' },
};

// ---- Doctor schedules (NEW: feedback item 10) -----------------------
// Working hours, weekly off-days, vacations, breaks. In the day grid,
// any slot outside these is blocked from booking.
const DOCTOR_SCHEDULES = {
  d1: { workStart: '09:00', workEnd: '17:00', offDays: ['friday'],            breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }], vacations: [] },
  d2: { workStart: '10:00', workEnd: '18:00', offDays: ['friday', 'saturday'], breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }], vacations: [{ start: '2026-06-15', end: '2026-06-22', reason: 'Annual leave' }] },
  d3: { workStart: '09:00', workEnd: '18:00', offDays: ['friday'],            breaks: [{ start: '12:30', end: '13:30', label: 'Prayer + lunch' }], vacations: [] },
  d4: { workStart: '11:00', workEnd: '18:00', offDays: ['friday', 'sunday'],  breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }], vacations: [] },
  d5: { workStart: '12:00', workEnd: '18:00', offDays: ['friday'],            breaks: [], vacations: [{ start: '2026-05-28', end: '2026-05-30', reason: 'Conference' }] },
  d6: { workStart: '09:00', workEnd: '17:00', offDays: ['friday'],            breaks: [{ start: '13:00', end: '14:00', label: 'Lunch' }], vacations: [] },
};

// Day grid: 09:00 to 18:00 in 30-min slots
const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const h = 9 + Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

// Pre-seeded appointments with new statuses and nurse references
const SEED_APPOINTMENTS = [
  { id: 'a1', doctorId: 'd1', patientId: 'p3', start: '09:00', dur: 45, procedure: 'Cleaning & polish',    status: 'payment-done',  nurseId: 'n2', notes: 'Standard cleaning. No issues.' },
  { id: 'a2', doctorId: 'd1', patientId: 'p1', start: '10:30', dur: 60, procedure: 'Extraction',           status: 'arrived',       nurseId: 'n2', asstDoctorId: 'd4', notes: 'Anxious patient -- explain steps slowly.' },
  { id: 'a3', doctorId: 'd2', patientId: 'p2', start: '11:00', dur: 30, procedure: 'Braces adjustment',    status: 'confirmed',     nurseId: null, notes: '' },
  { id: 'a4', doctorId: 'd3', patientId: 'p1', start: '14:00', dur: 90, procedure: 'Root canal treatment', status: 'in-progress',   nurseId: 'n2', notes: '' },
  { id: 'a5', doctorId: 'd5', patientId: 'p3', start: '15:30', dur: 60, procedure: 'Hydrafacial',          status: 'booked',        nurseId: 'n1', notes: 'First hydrafacial -- check skin sensitivity.' },
  { id: 'a6', doctorId: 'd6', patientId: 'p2', start: '10:00', dur: 45, procedure: 'Botox',                status: 'treatment-done', nurseId: 'n4', notes: '20U total.' },
];

const COLOR_MAP = {
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-300',    text: 'text-rose-900',    dot: 'bg-rose-500' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-900',   dot: 'bg-amber-500' },
  teal:    { bg: 'bg-teal-50',    border: 'border-teal-300',    text: 'text-teal-900',    dot: 'bg-teal-500' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-300',  text: 'text-violet-900',  dot: 'bg-violet-500' },
  sky:     { bg: 'bg-sky-50',     border: 'border-sky-300',     text: 'text-sky-900',     dot: 'bg-sky-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-900', dot: 'bg-emerald-500' },
};

// ---- Helpers --------------------------------------------------------
const fmt = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
const fmtShort = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
const validateQID = (qid) => /^\d{11}$/.test(qid.replace(/\s/g, ''));
const validateQatarPhone = (p) => /^\+974\s?\d{4}\s?\d{4}$/.test(p);
const dayOfWeek = (d) => d.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase();
const slotToMinutes = (slot) => { const [h, m] = slot.split(':').map(Number); return h * 60 + m; };
const minutesToSlot = (m) => { const h = Math.floor(m / 60); const min = m % 60; return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`; };

// Returns true if a given time slot is blocked for a doctor on a given date.
function isSlotBlocked(doctorId, date, slot) {
  const sched = DOCTOR_SCHEDULES[doctorId];
  if (!sched) return false;
  const dow = dayOfWeek(date);
  if (sched.offDays.includes(dow)) return true;
  const dateStr = date.toISOString().slice(0, 10);
  for (const v of sched.vacations) {
    if (dateStr >= v.start && dateStr <= v.end) return true;
  }
  const slotMin = slotToMinutes(slot);
  if (slotMin < slotToMinutes(sched.workStart) || slotMin >= slotToMinutes(sched.workEnd)) return true;
  for (const b of sched.breaks) {
    if (slotMin >= slotToMinutes(b.start) && slotMin < slotToMinutes(b.end)) return true;
  }
  return false;
}

// Returns a human-readable reason a slot is blocked (for tooltips).
function blockedReason(doctorId, date, slot) {
  const sched = DOCTOR_SCHEDULES[doctorId];
  if (!sched) return null;
  const dow = dayOfWeek(date);
  if (sched.offDays.includes(dow)) return `Off ${dow}`;
  const dateStr = date.toISOString().slice(0, 10);
  for (const v of sched.vacations) {
    if (dateStr >= v.start && dateStr <= v.end) return v.reason;
  }
  const slotMin = slotToMinutes(slot);
  if (slotMin < slotToMinutes(sched.workStart)) return `Before shift (${sched.workStart})`;
  if (slotMin >= slotToMinutes(sched.workEnd)) return `After shift (${sched.workEnd})`;
  for (const b of sched.breaks) {
    if (slotMin >= slotToMinutes(b.start) && slotMin < slotToMinutes(b.end)) return b.label;
  }
  return null;
}

// Generate next file number from highest existing.
function nextFileNumber(patients) {
  const year = new Date().getFullYear();
  let max = 0;
  patients.forEach(p => {
    const m = p.fileNo && p.fileNo.match(/^YC-(\d{4})-(\d{4})$/);
    if (m && parseInt(m[1]) === year) {
      max = Math.max(max, parseInt(m[2]));
    }
  });
  return `YC-${year}-${String(max + 1).padStart(4, '0')}`;
}

// =====================================================================
// MAIN APP
// =====================================================================
export default function ReceptionPrototype() {
  const [date, setDate]                 = useState(new Date(2026, 4, 24)); // Sun 24 May 2026
  const [appointments, setAppointments] = useState(SEED_APPOINTMENTS);
  const [patients, setPatients]         = useState(MOCK_PATIENTS);
  const [bookingModal, setBookingModal] = useState(null); // { doctorId, slot } | null
  const [detailModal, setDetailModal]   = useState(null); // appointment | null
  const [showSchedules, setShowSchedules] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [fileViewer, setFileViewer]     = useState(null); // patient | null
  const [locale, setLocale]             = useState('en'); // 'en' | 'ar'
  const [draggingAppt, setDraggingAppt] = useState(null); // appointment being dragged
  const [dragOverCell, setDragOverCell] = useState(null); // { doctorId, slot }

  const isArabic = locale === 'ar';

  const stats = useMemo(() => {
    const total      = appointments.filter(a => a.status !== 'cancelled' && a.status !== 'no-show').length;
    const arrived    = appointments.filter(a => a.status === 'arrived').length;
    const inProgress = appointments.filter(a => a.status === 'in-progress').length;
    const done       = appointments.filter(a => a.status === 'payment-done').length;
    return { total, arrived, inProgress, done };
  }, [appointments]);

  const addAppointment = (apt) => {
    setAppointments(prev => [...prev, { ...apt, id: `a${Date.now()}`, status: 'booked' }]);
    setBookingModal(null);
  };

  const updateAppointment = (id, patch) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  };

  const addPatient = (patient) => {
    const fileNo = nextFileNumber(patients);
    const newPatient = { ...patient, id: `p${Date.now()}`, fileNo, encounterHistory: [] };
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  };

  const updatePatient = (id, patch) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    // If the file viewer is open on this patient, refresh its data too
    setFileViewer(prev => prev && prev.id === id ? { ...prev, ...patch } : prev);
  };

  const prevDay = () => setDate(d => { const n = new Date(d); n.setDate(d.getDate() - 1); return n; });
  const nextDay = () => setDate(d => { const n = new Date(d); n.setDate(d.getDate() + 1); return n; });

  // ── DRAG-AND-DROP HANDLERS (feedback item 3) ──────────────────────
  const handleDragStart = (apt) => setDraggingAppt(apt);
  const handleDragEnd   = () => { setDraggingAppt(null); setDragOverCell(null); };
  const handleDragOver  = (e, doctorId, slot) => {
    if (!draggingAppt) return;
    e.preventDefault();
    setDragOverCell({ doctorId, slot });
  };
  const handleDrop = (e, doctorId, slot) => {
    e.preventDefault();
    if (!draggingAppt) return;
    if (isSlotBlocked(doctorId, date, slot)) { handleDragEnd(); return; }
    // Check conflict with existing appointments
    const cellsNeeded = draggingAppt.dur / 30;
    const slotIdx = TIME_SLOTS.indexOf(slot);
    const conflict = appointments.some(a => {
      if (a.id === draggingAppt.id) return false;
      if (a.doctorId !== doctorId) return false;
      if (a.status === 'cancelled' || a.status === 'no-show') return false;
      const aStart = TIME_SLOTS.indexOf(a.start);
      const aEnd   = aStart + a.dur / 30;
      return slotIdx < aEnd && slotIdx + cellsNeeded > aStart;
    });
    if (conflict) { handleDragEnd(); return; }
    updateAppointment(draggingAppt.id, { doctorId, start: slot });
    handleDragEnd();
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: '"IBM Plex Sans", "Noto Sans Arabic", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+Arabic:wght@400;500;600&display=swap');
        .mono { font-family: "IBM Plex Mono", monospace; }
        .grid-cell { transition: background-color 120ms ease; }
        .grid-cell:hover { background-color: rgba(120, 113, 108, 0.06); cursor: pointer; }
        .grid-cell-blocked { background-image: repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(120,113,108,0.08) 6px, rgba(120,113,108,0.08) 7px); cursor: not-allowed; }
        .grid-cell-drag-over { background-color: rgba(16,185,129,0.18); outline: 2px dashed rgb(16,185,129); outline-offset: -2px; }
        .appt-draggable { cursor: grab; }
        .appt-draggable:active { cursor: grabbing; }
        .appt-dragging { opacity: 0.4; }
      `}</style>

      {/* Top bar */}
      <header className="border-b border-stone-200 bg-white">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-stone-900 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">M</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Medly Reception</div>
              <div className="text-xs text-stone-500">{isArabic ? 'عيادة الياسمين، الدوحة' : 'Yasmeen Clinic, Doha'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowSchedules(true)} className="px-3 py-1.5 text-xs border border-stone-300 rounded-md hover:bg-stone-100 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              Doctor schedules
            </button>
            <button onClick={() => setLocale(l => l === 'en' ? 'ar' : 'en')} className="px-3 py-1.5 text-xs border border-stone-300 rounded-md hover:bg-stone-100 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {locale === 'en' ? 'العربية' : 'English'}
            </button>
            <div className="px-3 py-1.5 text-xs bg-stone-100 rounded-md text-stone-700">Rania M. · Reception</div>
          </div>
        </div>

        {/* Stats + calendar strip */}
        <div className="px-6 py-2.5 flex items-center gap-5 border-t border-stone-100 bg-stone-50/60">
          {/* Date picker (NEW: feedback item 1) */}
          <div className="flex items-center gap-2 relative">
            <Calendar className="w-4 h-4 text-stone-500" />
            <button onClick={prevDay} className="p-1 hover:bg-stone-200 rounded"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button
              onClick={() => setShowCalendar(s => !s)}
              className="text-sm font-medium mono w-44 text-center hover:bg-stone-200 rounded px-2 py-0.5 flex items-center justify-center gap-1.5"
            >
              <CalendarDays className="w-3.5 h-3.5 text-stone-500" />
              {fmt(date)}
            </button>
            <button onClick={nextDay} className="p-1 hover:bg-stone-200 rounded"><ChevronRight className="w-3.5 h-3.5" /></button>
            <button
              onClick={() => setDate(new Date(2026, 4, 24))}
              className="px-2 py-0.5 text-[10px] text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded"
            >
              Today
            </button>
            {showCalendar && (
              <DatePickerPopover
                value={date}
                onSelect={(d) => { setDate(d); setShowCalendar(false); }}
                onClose={() => setShowCalendar(false)}
              />
            )}
          </div>
          <div className="h-4 w-px bg-stone-300" />
          <Stat label={isArabic ? 'إجمالي' : 'Total'} value={stats.total} />
          <Stat label={isArabic ? 'وصل' : 'Arrived'} value={stats.arrived} accent="amber" />
          <Stat label={isArabic ? 'جاري' : 'Ongoing'} value={stats.inProgress} accent="emerald" />
          <Stat label={isArabic ? 'انتهى' : 'Done'} value={stats.done} accent="teal" />
        </div>
      </header>

      {/* Main grid */}
      <main className="px-6 py-5">
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          {/* Doctor column headers */}
          <div className="grid border-b border-stone-200" style={{ gridTemplateColumns: `80px repeat(${DOCTORS.length}, 1fr)` }}>
            <div className="p-3 text-xs text-stone-500 font-medium border-r border-stone-200">{isArabic ? 'الوقت' : 'Time'}</div>
            {DOCTORS.map(doc => (
              <div key={doc.id} className="p-3 border-r border-stone-200 last:border-r-0">
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${COLOR_MAP[doc.color].dot}`} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{isArabic ? doc.nameAr : doc.nameEn}</div>
                    <div className="text-xs text-stone-500 truncate">{isArabic ? doc.specialtyAr : doc.specialty}</div>
                    <div className="text-[10px] text-stone-400 mono mt-0.5">{doc.qchp}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Time-slot rows */}
          <div className="relative">
            {TIME_SLOTS.map((slot, idx) => (
              <div
                key={slot}
                className="grid border-b border-stone-100 last:border-b-0"
                style={{ gridTemplateColumns: `80px repeat(${DOCTORS.length}, 1fr)`, minHeight: '44px' }}
              >
                <div className={`px-3 py-2 text-xs mono text-stone-500 border-r border-stone-200 ${idx % 2 === 0 ? '' : 'opacity-60'}`}>
                  {idx % 2 === 0 ? slot : ''}
                </div>
                {DOCTORS.map(doc => {
                  const apt = appointments.find(a => a.doctorId === doc.id && a.start === slot && a.status !== 'cancelled' && a.status !== 'no-show');
                  if (apt) {
                    const patient = patients.find(p => p.id === apt.patientId);
                    const cells = apt.dur / 30;
                    const colors = COLOR_MAP[doc.color];
                    const status = STATUS_FLOW[apt.status];
                    const isDragging = draggingAppt?.id === apt.id;
                    return (
                      <button
                        key={doc.id + slot}
                        onClick={() => setDetailModal(apt)}
                        draggable
                        onDragStart={() => handleDragStart(apt)}
                        onDragEnd={handleDragEnd}
                        className={`appt-draggable ${isDragging ? 'appt-dragging' : ''} relative border-r border-stone-200 last:border-r-0 text-left p-2 m-0.5 rounded ${colors.bg} ${colors.border} border ${colors.text} hover:brightness-95`}
                        style={{ gridRow: `span ${cells}`, minHeight: `${cells * 44 - 4}px` }}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="text-xs font-medium truncate flex-1">{patient?.nameEn}</div>
                          <span className={`text-[9px] mono px-1 py-0.5 rounded border ${status.chip} whitespace-nowrap`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="text-[11px] truncate opacity-80">{apt.procedure}</div>
                        <div className="text-[10px] mono opacity-70 mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {apt.start} · {apt.dur}m
                          {apt.nurseId && (
                            <span className="ml-auto flex items-center gap-0.5 text-stone-600">
                              <User className="w-2.5 h-2.5" />
                              {NURSES.find(n => n.id === apt.nurseId)?.name.replace('Nurse ', '')}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  }
                  // Check if a previous appointment occupies this slot
                  const occupied = appointments.some(a => {
                    if (a.doctorId !== doc.id) return false;
                    if (a.status === 'cancelled' || a.status === 'no-show') return false;
                    const startIdx = TIME_SLOTS.indexOf(a.start);
                    const endIdx = startIdx + a.dur / 30;
                    const thisIdx = TIME_SLOTS.indexOf(slot);
                    return thisIdx > startIdx && thisIdx < endIdx;
                  });
                  if (occupied) return <div key={doc.id + slot} className="border-r border-stone-200 last:border-r-0" />;

                  // Blocked? (NEW: feedback item 10)
                  const blocked = isSlotBlocked(doc.id, date, slot);
                  if (blocked) {
                    const reason = blockedReason(doc.id, date, slot);
                    return (
                      <div
                        key={doc.id + slot}
                        title={reason || 'Unavailable'}
                        className="grid-cell-blocked border-r border-stone-200 last:border-r-0 flex items-center justify-center"
                      >
                        {idx % 2 === 0 && reason && (
                          <span className="text-[9px] text-stone-400 px-1 truncate">{reason}</span>
                        )}
                      </div>
                    );
                  }

                  const isDragOver = dragOverCell?.doctorId === doc.id && dragOverCell?.slot === slot;
                  return (
                    <div
                      key={doc.id + slot}
                      onClick={() => setBookingModal({ doctorId: doc.id, slot })}
                      onDragOver={(e) => handleDragOver(e, doc.id, slot)}
                      onDrop={(e) => handleDrop(e, doc.id, slot)}
                      className={`grid-cell ${isDragOver ? 'grid-cell-drag-over' : ''} border-r border-stone-200 last:border-r-0`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
          <div>{isArabic ? 'انقر فوق أي خلية فارغة لحجز موعد · اسحب الموعد لإعادة الجدولة' : 'Click empty cell to book · Drag appointment to reschedule · Hashed = unavailable'}</div>
          <div className="flex items-center gap-3 flex-wrap">
            {Object.entries(STATUS_FLOW).slice(0, 6).map(([k, s]) => (
              <LegendDot key={k} label={s.label} colorClass={s.dot} />
            ))}
          </div>
        </div>
      </main>

      {bookingModal && (
        <BookingModal
          isArabic={isArabic}
          doctor={DOCTORS.find(d => d.id === bookingModal.doctorId)}
          slot={bookingModal.slot}
          date={date}
          patients={patients}
          onClose={() => setBookingModal(null)}
          onConfirm={addAppointment}
          onAddPatient={addPatient}
          onUpdatePatient={updatePatient}
        />
      )}

      {detailModal && (
        <AppointmentDetail
          isArabic={isArabic}
          appointment={detailModal}
          patient={patients.find(p => p.id === detailModal.patientId)}
          onClose={() => setDetailModal(null)}
          onUpdate={(patch) => { updateAppointment(detailModal.id, patch); setDetailModal({ ...detailModal, ...patch }); }}
          onViewFile={(patient) => { setDetailModal(null); setFileViewer(patient); }}
        />
      )}

      {showSchedules && <DoctorScheduleModal onClose={() => setShowSchedules(false)} />}
      {fileViewer && <PatientFileViewer patient={fileViewer} onUpdate={updatePatient} onClose={() => setFileViewer(null)} />}
    </div>
  );
}

// =====================================================================
// SUB-COMPONENTS
// =====================================================================
function Stat({ label, value, accent }) {
  const color = accent === 'emerald' ? 'text-emerald-700'
              : accent === 'amber'   ? 'text-amber-700'
              : accent === 'teal'    ? 'text-teal-700'
              : 'text-stone-900';
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`text-base font-semibold mono ${color}`}>{value}</span>
      <span className="text-xs text-stone-500">{label}</span>
    </div>
  );
}

function LegendDot({ label, colorClass }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
      <span>{label}</span>
    </div>
  );
}

// ---- Date picker popover (NEW: feedback item 1) ---------------------
function DatePickerPopover({ value, onSelect, onClose }) {
  const [viewMonth, setViewMonth] = useState(new Date(value.getFullYear(), value.getMonth(), 1));
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Sunday = 0, build a 6x7 grid starting from Sunday (GCC week)
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <div ref={ref} className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-50 bg-white border border-stone-200 rounded-lg shadow-lg p-3 w-72">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setViewMonth(new Date(year, month - 1, 1))} className="p-1 hover:bg-stone-100 rounded">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div className="text-sm font-semibold">{viewMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
        <button onClick={() => setViewMonth(new Date(year, month + 1, 1))} className="p-1 hover:bg-stone-100 rounded">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="text-[10px] text-stone-500 text-center py-1 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const cellDate = new Date(year, month, d);
          const isToday = isSameDay(cellDate, today);
          const isSelected = isSameDay(cellDate, value);
          const isFriday = cellDate.getDay() === 5;
          return (
            <button
              key={i}
              onClick={() => onSelect(cellDate)}
              className={`text-xs py-1.5 rounded hover:bg-stone-200 ${
                isSelected ? 'bg-stone-900 text-white hover:bg-stone-800' :
                isToday    ? 'bg-stone-100 font-semibold' :
                isFriday   ? 'text-stone-400' : ''
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
      <div className="mt-2 pt-2 border-t border-stone-100 text-[10px] text-stone-500 text-center">
        Friday is the GCC weekend
      </div>
    </div>
  );
}

// ---- BOOKING MODAL --------------------------------------------------
function BookingModal({ doctor, slot, date, patients, onClose, onConfirm, onAddPatient, onUpdatePatient, isArabic }) {
  const [step, setStep] = useState(1); // 1: patient, 2: procedure, 3: confirm
  const [searchQ, setSearchQ] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPatient, setNewPatient] = useState(null);
  const [procedure, setProcedure] = useState(null);
  const [customProcedureName, setCustomProcedureName] = useState('');
  const [customDur, setCustomDur] = useState(30);
  const [customPrice, setCustomPrice] = useState(0);
  const [nurseId, setNurseId] = useState(null);
  const [asstDoctorId, setAsstDoctorId] = useState(null);
  const [time, setTime] = useState(slot);
  const [notes, setNotes] = useState('');

  // Always re-resolve selectedPatient against the live patient list so edits made
  // mid-booking (e.g. updating reception notes) are reflected immediately.
  const liveSelectedPatient = selectedPatient ? (patients.find(p => p.id === selectedPatient.id) || selectedPatient) : null;
  const patient = liveSelectedPatient || newPatient;

  const searchResults = useMemo(() => {
    if (!searchQ) return [];
    const q = searchQ.toLowerCase().replace(/\s/g, '');
    return patients.filter(p =>
      (p.qid && p.qid.includes(q)) ||
      (p.fileNo && p.fileNo.toLowerCase().includes(q)) ||
      p.nameEn.toLowerCase().includes(searchQ.toLowerCase()) ||
      p.phone.replace(/\s/g, '').includes(q)
    );
  }, [searchQ, patients]);

  const handleConfirm = () => {
    const finalProc = procedure || { name: customProcedureName, dur: customDur, price: customPrice, needsNurse: !!nurseId };
    onConfirm({
      doctorId: doctor.id,
      patientId: patient.id,
      start: time,
      dur: finalProc.dur,
      procedure: finalProc.name,
      nurseId,
      asstDoctorId,
      notes,
    });
  };

  const canContinue = step === 1 ? !!patient
                    : step === 2 ? (!!procedure || (customProcedureName && customDur > 0))
                    : true;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{isArabic ? 'حجز موعد جديد' : 'New appointment'}</div>
            <div className="text-xs text-stone-500 mt-0.5 mono">
              {doctor.nameEn} · {time} · {fmtShort(date)}
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded"><X className="w-4 h-4" /></button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-3 border-b border-stone-200 flex items-center gap-2">
          {['Patient', 'Procedure', 'Confirm'].map((label, i) => (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-2 ${step > i + 1 ? 'text-stone-400' : step === i + 1 ? 'text-stone-900' : 'text-stone-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${step === i + 1 ? 'bg-stone-900 text-white' : step > i + 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'}`}>
                  {step > i + 1 ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                </div>
                <span className="text-xs font-medium">{label}</span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-stone-200" />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && (
            <PatientStep
              searchQ={searchQ}
              setSearchQ={setSearchQ}
              results={searchResults}
              selectedPatient={liveSelectedPatient}
              setSelectedPatient={(p) => { setSelectedPatient(p); setNewPatient(null); }}
              newPatient={newPatient}
              setNewPatient={(p) => { setNewPatient(p); setSelectedPatient(null); }}
              onAddPatient={onAddPatient}
              onUpdatePatient={onUpdatePatient}
            />
          )}
          {step === 2 && (
            <ProcedureStep
              doctor={doctor}
              procedure={procedure}
              setProcedure={setProcedure}
              customProcedureName={customProcedureName}
              setCustomProcedureName={setCustomProcedureName}
              customDur={customDur}
              setCustomDur={setCustomDur}
              customPrice={customPrice}
              setCustomPrice={setCustomPrice}
              nurseId={nurseId}
              setNurseId={setNurseId}
              asstDoctorId={asstDoctorId}
              setAsstDoctorId={setAsstDoctorId}
              time={time}
              setTime={setTime}
              notes={notes}
              setNotes={setNotes}
              patient={patient}
              onUpdatePatient={onUpdatePatient}
            />
          )}
          {step === 3 && (
            <ConfirmStep
              doctor={doctor}
              time={time}
              date={date}
              patient={patient}
              procedure={procedure || { name: customProcedureName, dur: customDur, price: customPrice }}
              nurseId={nurseId}
              asstDoctorId={asstDoctorId}
              notes={notes}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between bg-stone-50">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="px-3 py-1.5 text-sm text-stone-600 hover:text-stone-900">
            {step === 1 ? (isArabic ? 'إلغاء' : 'Cancel') : (isArabic ? 'رجوع' : 'Back')}
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canContinue}
              className="px-4 py-1.5 text-sm bg-stone-900 text-white rounded-md hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed">
              {isArabic ? 'متابعة' : 'Continue'}
            </button>
          ) : (
            <button onClick={handleConfirm} className="px-4 py-1.5 text-sm bg-emerald-700 text-white rounded-md hover:bg-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isArabic ? 'تأكيد الحجز' : 'Confirm booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- PATIENT STEP (with File# search + ID upload) -------------------
function PatientStep({ searchQ, setSearchQ, results, selectedPatient, setSelectedPatient, newPatient, setNewPatient, onAddPatient, onUpdatePatient }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState({
    qid: '', nameEn: '', nameAr: '', phone: '+974 ', dob: '',
    insurer: 'Cash/Card', policy: '',
    idFront: null, idBack: null, insuranceCard: null,
    allergies: '', conditions: '', notes: '',
  });

  const qidValid = !form.qid || validateQID(form.qid);
  const phoneValid = !form.phone || validateQatarPhone(form.phone);
  const canSave = form.nameEn && validateQID(form.qid) && validateQatarPhone(form.phone) && form.dob && form.idFront;

  const saveNew = () => {
    const patient = onAddPatient({
      ...form,
      eligible: form.insurer === 'Cash/Card' ? null : 'pending',
      allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      conditions: form.conditions ? form.conditions.split(',').map(s => s.trim()).filter(Boolean) : [],
      lastVisit: null,
    });
    setNewPatient(patient);
    setShowNewForm(false);
  };

  return (
    <div>
      <label className="text-xs text-stone-600 font-medium">Search patient</label>
      <div className="mt-1.5 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          value={searchQ}
          onChange={e => { setSearchQ(e.target.value); if (e.target.value) setShowNewForm(false); }}
          placeholder="File # (YC-2024-0142), QID, name, or phone"
          className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 mono"
        />
      </div>

      {searchQ && results.length > 0 && (
        <div className="mt-3 border border-stone-200 rounded-md overflow-hidden">
          {results.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPatient(p)}
              className={`w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-stone-50 border-b border-stone-100 last:border-b-0 ${selectedPatient?.id === p.id ? 'bg-stone-50' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                <User className="w-4 h-4 text-stone-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium flex items-center gap-2">
                  {p.nameEn}
                  <span className="text-[10px] mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{p.fileNo}</span>
                </div>
                <div className="text-xs text-stone-500 mono">QID {p.qid} · {p.phone}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-stone-600">{p.insurer}</div>
                <div className="text-[10px] text-stone-400 mono">Last: {p.lastVisit || 'New'}</div>
              </div>
              {selectedPatient?.id === p.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </button>
          ))}
        </div>
      )}

      {searchQ && results.length === 0 && !showNewForm && (
        <div className="mt-3 text-xs text-stone-700 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between">
          <span>No patient found.</span>
          <button onClick={() => setShowNewForm(true)} className="text-amber-900 font-medium underline flex items-center gap-1">
            <UserPlus className="w-3 h-3" /> Register new patient
          </button>
        </div>
      )}

      {!showNewForm && !searchQ && (
        <button onClick={() => setShowNewForm(true)} className="mt-3 w-full px-3 py-2.5 border border-dashed border-stone-300 rounded-md text-sm text-stone-600 hover:bg-stone-50 hover:border-stone-400 flex items-center justify-center gap-2">
          <UserPlus className="w-3.5 h-3.5" />
          Register new patient
        </button>
      )}

      {showNewForm && (
        <NewPatientForm
          form={form} setForm={setForm}
          qidValid={qidValid} phoneValid={phoneValid}
          canSave={canSave} onSave={saveNew}
          onCancel={() => setShowNewForm(false)}
        />
      )}

      {selectedPatient && <PatientCard patient={selectedPatient} onUpdate={onUpdatePatient} />}
      {newPatient && <PatientCard patient={newPatient} isNew />}
    </div>
  );
}

// ---- New patient form with ID + insurance upload (NEW: item 8) ------
function NewPatientForm({ form, setForm, qidValid, phoneValid, canSave, onSave, onCancel }) {
  return (
    <div className="mt-4 p-4 bg-stone-50 border border-stone-200 rounded-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
          <UserPlus className="w-3.5 h-3.5" /> New patient registration
        </div>
        <button onClick={onCancel} className="text-xs text-stone-500 hover:text-stone-700">Cancel</button>
      </div>

      <div className="text-[10px] text-stone-500 -mt-1">
        File # will be auto-assigned (e.g. YC-2026-0XXX) on save
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="QID (Qatar ID)" value={form.qid}
          onChange={v => setForm({ ...form, qid: v.replace(/\D/g, '').slice(0, 11) })}
          placeholder="11 digits" mono error={form.qid && !qidValid ? 'Must be 11 digits' : null} />
        <Field label="Full name (English)" value={form.nameEn}
          onChange={v => setForm({ ...form, nameEn: v })} placeholder="e.g. Sara Al-Mannai" />
        <Field label="Name (Arabic)" value={form.nameAr}
          onChange={v => setForm({ ...form, nameAr: v })} placeholder="الاسم بالعربية" />
        <Field label="Phone (+974)" value={form.phone}
          onChange={v => setForm({ ...form, phone: v })} placeholder="+974 5512 4488" mono
          error={form.phone && !phoneValid ? 'Format: +974 #### ####' : null} />
        <Field label="Date of birth" value={form.dob}
          onChange={v => setForm({ ...form, dob: v })} placeholder="YYYY-MM-DD" type="date" mono />
        <div>
          <label className="text-xs text-stone-600 font-medium">Insurer</label>
          <select value={form.insurer}
            onChange={e => setForm({ ...form, insurer: e.target.value })}
            className="mt-1.5 w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 bg-white">
            <option>Cash/Card</option>
            <option>QLM</option>
            <option>AXA</option>
            <option>Daman</option>
            <option>Bupa Arabia</option>
            <option>Cigna</option>
            <option>MetLife</option>
          </select>
        </div>
        {form.insurer !== 'Cash/Card' && (
          <Field label="Policy number" value={form.policy}
            onChange={v => setForm({ ...form, policy: v })} placeholder="e.g. QLM-447821" mono />
        )}
      </div>

      <div>
        <div className="text-xs font-semibold text-stone-700 mt-2 mb-1.5">Medical information (optional)</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Known allergies (comma-separated)" value={form.allergies}
            onChange={v => setForm({ ...form, allergies: v })} placeholder="e.g. Penicillin, Latex" />
          <Field label="Chronic conditions" value={form.conditions}
            onChange={v => setForm({ ...form, conditions: v })} placeholder="e.g. Diabetes, Hypertension" />
        </div>
        <div className="mt-2">
          <label className="text-xs text-stone-600 font-medium">Reception notes</label>
          <textarea value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={2} placeholder="Visible to reception and doctors. E.g. prefers afternoons, anxious, ride arranged..."
            className="mt-1.5 w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 resize-none" />
        </div>
      </div>

      {/* Document upload (NEW: feedback item 8) */}
      <div>
        <div className="text-xs font-semibold text-stone-700 mt-2 mb-1.5 flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5" /> Identity & insurance documents
        </div>
        <div className="grid grid-cols-3 gap-2">
          <FileUploadField label="QID front" required value={form.idFront} onChange={(v) => setForm({ ...form, idFront: v })} />
          <FileUploadField label="QID back" value={form.idBack} onChange={(v) => setForm({ ...form, idBack: v })} />
          <FileUploadField label="Insurance card" value={form.insuranceCard} onChange={(v) => setForm({ ...form, insuranceCard: v })} disabled={form.insurer === 'Cash/Card'} />
        </div>
      </div>

      <div className="text-[11px] text-stone-500 leading-relaxed border-t border-stone-200 pt-3">
        <Shield className="w-3 h-3 inline -mt-0.5 mr-1" />
        Documents are encrypted at rest. Patient consent for data processing (per Qatar PDPPL) will be collected at check-in.
        Records retained for 10 years per MOPH guidelines.
      </div>

      <button onClick={onSave} disabled={!canSave}
        className="w-full px-3 py-2 text-sm bg-stone-900 text-white rounded-md hover:bg-stone-800 disabled:bg-stone-300 flex items-center justify-center gap-2">
        <Save className="w-3.5 h-3.5" />
        Save patient & assign File #
      </button>
      {!canSave && (
        <div className="text-[10px] text-stone-500 -mt-2 text-center">
          QID, name, DOB, phone, and QID front upload are required.
        </div>
      )}
    </div>
  );
}

// ---- File upload field (mock for prototype) -------------------------
function FileUploadField({ label, value, onChange, required, disabled }) {
  return (
    <div className={disabled ? 'opacity-50' : ''}>
      <label className="text-[11px] text-stone-600 font-medium">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {!value ? (
        <button
          disabled={disabled}
          onClick={() => onChange(`${label.toLowerCase().replace(/\s/g, '-')}-${Date.now()}.jpg`)}
          className="mt-1 w-full h-20 border border-dashed border-stone-300 rounded-md hover:border-stone-500 hover:bg-white flex flex-col items-center justify-center gap-1 text-stone-500 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          <span className="text-[10px]">Click to upload</span>
        </button>
      ) : (
        <div className="mt-1 w-full h-20 border border-emerald-300 bg-emerald-50 rounded-md flex flex-col items-center justify-center gap-1 text-emerald-800 relative">
          <FileImage className="w-5 h-5" />
          <span className="text-[10px] mono truncate px-2 max-w-full">{value.slice(0, 18)}...</span>
          <button onClick={() => onChange(null)} className="absolute top-0.5 right-0.5 p-0.5 hover:bg-emerald-100 rounded">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', mono, error }) {
  return (
    <div>
      <label className="text-xs text-stone-600 font-medium">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`mt-1.5 w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-stone-500 ${error ? 'border-red-300' : 'border-stone-300'} ${mono ? 'mono' : ''}`} />
      {error && <div className="text-[10px] text-red-600 mt-0.5">{error}</div>}
    </div>
  );
}

function PatientCard({ patient, isNew, onUpdate }) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState(patient.notes || '');
  useEffect(() => { setDraftNotes(patient.notes || ''); }, [patient.id, patient.notes]);
  const saveNotes = () => { onUpdate(patient.id, { notes: draftNotes }); setEditingNotes(false); };

  return (
    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">

        {/* Identity */}
        <div className="text-sm font-medium text-emerald-900 flex items-center gap-2 flex-wrap">
          {isNew && <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded mr-1.5 align-middle">NEW</span>}
          {patient.nameEn}
          <span className="text-[10px] mono text-emerald-700 bg-white border border-emerald-200 px-1.5 py-0.5 rounded">{patient.fileNo}</span>
        </div>
        <div className="text-xs text-emerald-800 mono mt-0.5">QID {patient.qid} · {patient.phone}</div>

        {/* Reception notes — right after identity, always */}
        {onUpdate && (
          <div className="mt-2 pt-2 border-t border-emerald-200">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-semibold text-emerald-900 uppercase tracking-wide">
                Reception notes
                <span className="ml-1.5 text-[9px] text-emerald-700 font-normal normal-case">(visible to doctors)</span>
              </div>
              {!editingNotes && (
                <button onClick={() => setEditingNotes(true)} className="text-[10px] text-emerald-800 hover:text-emerald-900 flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />{patient.notes ? 'Edit' : 'Add'}
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-1.5">
                <textarea value={draftNotes} onChange={e => setDraftNotes(e.target.value)} rows={2} autoFocus
                  placeholder="E.g. prefers afternoons, ride arranged, anxious about needles..."
                  className="w-full px-2 py-1.5 text-xs border border-emerald-300 bg-white rounded focus:outline-none focus:border-emerald-500 resize-none" />
                <div className="flex gap-1.5 justify-end">
                  <button onClick={() => { setDraftNotes(patient.notes || ''); setEditingNotes(false); }}
                    className="px-2 py-0.5 text-[10px] border border-emerald-300 rounded hover:bg-white">Cancel</button>
                  <button onClick={saveNotes} className="px-2 py-0.5 text-[10px] bg-emerald-700 text-white rounded hover:bg-emerald-800 flex items-center gap-1">
                    <Save className="w-2.5 h-2.5" /> Save</button>
                </div>
              </div>
            ) : patient.notes ? (
              <div className="text-xs text-emerald-900 italic">"{patient.notes}"</div>
            ) : (
              <div className="text-[11px] text-emerald-700/70 italic">No reception notes yet.</div>
            )}
          </div>
        )}

        {/* Insurance */}
        {patient.insurer && patient.insurer !== 'Cash/Card' && (
          <div className="mt-2 flex items-center gap-2">
            <Shield className="w-3 h-3 text-emerald-700" />
            <span className="text-xs text-emerald-900">{patient.insurer} · {patient.policy || '—'}</span>
            {patient.eligible === true && <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded">Eligible</span>}
            {patient.eligible === 'pending' && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Verifying...</span>}
          </div>
        )}

        {/* Allergies */}
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="mt-1.5 text-[11px] text-red-700 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Allergies: {patient.allergies.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Procedure step with autocomplete + time + nurse + notes --------
function ProcedureStep({ doctor, procedure, setProcedure, customProcedureName, setCustomProcedureName, customDur, setCustomDur, customPrice, setCustomPrice, nurseId, setNurseId, asstDoctorId, setAsstDoctorId, time, setTime, notes, setNotes, patient, onUpdatePatient }) {
  const list = PROCEDURES[doctor.specialty] || [];
  const isInsured = patient?.insurer && patient.insurer !== 'Cash/Card';
  const isDental = ['General Dentistry', 'Orthodontics', 'Endodontics', 'Cosmetic Dentistry'].includes(doctor.specialty);
  const dentalSpecialties = ['General Dentistry', 'Orthodontics', 'Endodontics', 'Cosmetic Dentistry'];
  const availableAssistants = DOCTORS.filter(d => d.id !== doctor.id && dentalSpecialties.includes(d.specialty));
  const [showCustom, setShowCustom] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const filteredAuto = ALL_PROCEDURES.filter(p =>
    p.name.toLowerCase().includes(customProcedureName.toLowerCase()) && customProcedureName.length > 0
  ).slice(0, 5);

  // Auto-suggest nurse if procedure requires one
  const needsNurse = procedure?.needsNurse || false;

  const [editingReceptionNotes, setEditingReceptionNotes] = useState(false);
  const [draftReceptionNotes, setDraftReceptionNotes] = useState(patient?.notes || '');

  const saveReceptionNotes = () => {
    if (onUpdatePatient && patient) onUpdatePatient(patient.id, { notes: draftReceptionNotes });
    setEditingReceptionNotes(false);
  };

  return (
    <div className="space-y-4">

      {/* Reception notes — patient-level, visible to doctors */}
      {patient && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] font-semibold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
              Reception notes
              <span className="text-[9px] font-normal text-amber-700 normal-case">· {patient.nameEn} · visible to doctors</span>
            </div>
            {!editingReceptionNotes && (
              <button onClick={() => setEditingReceptionNotes(true)}
                className="text-[10px] text-amber-800 hover:text-amber-900 flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                {patient.notes ? 'Edit' : 'Add'}
              </button>
            )}
          </div>
          {editingReceptionNotes ? (
            <div className="space-y-1.5">
              <textarea value={draftReceptionNotes}
                onChange={e => setDraftReceptionNotes(e.target.value)}
                rows={2}
                placeholder="E.g. prefers afternoons, ride arranged, anxious about needles..."
                className="w-full px-2 py-1.5 text-xs border border-amber-300 bg-white rounded focus:outline-none focus:border-amber-500 resize-none"
                autoFocus
              />
              <div className="flex gap-1.5 justify-end">
                <button onClick={() => { setDraftReceptionNotes(patient.notes || ''); setEditingReceptionNotes(false); }}
                  className="px-2 py-0.5 text-[10px] border border-amber-300 rounded hover:bg-white">Cancel</button>
                <button onClick={saveReceptionNotes}
                  className="px-2 py-0.5 text-[10px] bg-amber-700 text-white rounded hover:bg-amber-800 flex items-center gap-1">
                  <Save className="w-2.5 h-2.5" /> Save
                </button>
              </div>
            </div>
          ) : patient.notes ? (
            <div className="text-xs text-amber-900 italic">"{patient.notes}"</div>
          ) : (
            <div className="text-[11px] text-amber-700/70 italic">No reception notes yet.</div>
          )}
        </div>
      )}

      {/* Procedure picker */}
      <div>
        <div className="text-xs text-stone-600 mb-2 font-medium">Procedure with {doctor.nameEn}</div>
        {!showCustom ? (
          <>
            <div className="space-y-1.5">
              {list.map(p => (
                <button key={p.name}
                  onClick={() => { setProcedure(p); setNurseId(p.needsNurse && !nurseId ? null : nurseId); }}
                  className={`w-full px-3 py-2.5 text-left border rounded-md flex items-center justify-between hover:border-stone-400 transition-colors ${procedure?.name === p.name ? 'border-stone-900 bg-stone-50' : 'border-stone-200'}`}>
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      {p.name}
                      {p.needsNurse && <span className="text-[9px] bg-violet-100 text-violet-800 px-1 py-0.5 rounded">+ nurse</span>}
                    </div>
                    <div className="text-xs text-stone-500 mono mt-0.5">{p.dur} min</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium mono">QAR {p.price.toLocaleString()}</div>
                    {isInsured && doctor.specialty.includes('Dent') && (
                      <div className="text-[10px] text-emerald-700">Insurance eligible</div>
                    )}
                    {isInsured && doctor.specialty.includes('Aesthetic') && (
                      <div className="text-[10px] text-stone-400">Cosmetic, not covered</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => { setShowCustom(true); setProcedure(null); }}
              className="mt-2 w-full px-3 py-2 text-xs text-stone-600 border border-dashed border-stone-300 rounded-md hover:bg-stone-50 hover:border-stone-400 flex items-center justify-center gap-1.5">
              <Edit3 className="w-3 h-3" /> Enter custom procedure
            </button>
          </>
        ) : (
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-md space-y-2 relative">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-stone-700">Custom procedure</div>
              <button onClick={() => setShowCustom(false)} className="text-[11px] text-stone-500 hover:text-stone-900">Back to list</button>
            </div>
            <div className="relative">
              <input
                value={customProcedureName}
                onChange={(e) => { setCustomProcedureName(e.target.value); setAutocompleteOpen(true); }}
                onFocus={() => setAutocompleteOpen(true)}
                onBlur={() => setTimeout(() => setAutocompleteOpen(false), 200)}
                placeholder="Start typing -- e.g. 'Sclerotherapy', 'PRP'..."
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500"
              />
              {autocompleteOpen && filteredAuto.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-stone-200 rounded-md shadow-lg z-20 max-h-40 overflow-y-auto">
                  {filteredAuto.map(p => (
                    <button key={p.name}
                      onClick={() => {
                        setCustomProcedureName(p.name);
                        setCustomDur(p.dur);
                        setCustomPrice(p.price);
                        setAutocompleteOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-stone-50 flex justify-between items-center">
                      <span>{p.name}</span>
                      <span className="text-[10px] text-stone-400 mono">{p.dur}m · QAR {p.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-stone-600 font-medium">Duration (min)</label>
                <input type="number" min="15" step="15" value={customDur}
                  onChange={(e) => setCustomDur(parseInt(e.target.value) || 30)}
                  className="mt-1 w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 mono" />
              </div>
              <div>
                <label className="text-[10px] text-stone-600 font-medium">Price (QAR)</label>
                <input type="number" min="0" value={customPrice}
                  onChange={(e) => setCustomPrice(parseInt(e.target.value) || 0)}
                  className="mt-1 w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 mono" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time editor (NEW: item 2 -- time editable inline) */}
      <div>
        <label className="text-xs text-stone-600 font-medium flex items-center gap-1.5">
          <Clock className="w-3 h-3" /> Time
        </label>
        <select value={time} onChange={e => setTime(e.target.value)}
          className="mt-1.5 w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 bg-white mono">
          {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Assistant doctor picker (dental procedures only) */}
      {isDental && (
        <div>
          <label className="text-xs text-stone-600 font-medium flex items-center gap-1.5">
            <Stethoscope className="w-3 h-3" /> Assistant doctor
            <span className="text-[10px] text-stone-400 font-normal">(optional, dental procedures)</span>
          </label>
          <select value={asstDoctorId || ''}
            onChange={(e) => setAsstDoctorId(e.target.value || null)}
            className="mt-1.5 w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 bg-white">
            <option value="">— No assistant —</option>
            {availableAssistants.map(d => (
              <option key={d.id} value={d.id}>{d.nameEn} ({d.specialty})</option>
            ))}
          </select>
        </div>
      )}

      {/* Nurse picker (NEW: feedback item 12) */}
      <div>
        <label className="text-xs text-stone-600 font-medium flex items-center gap-1.5">
          <Stethoscope className="w-3 h-3" /> Assigned nurse
          {needsNurse && <span className="text-[9px] bg-violet-100 text-violet-800 px-1 py-0.5 rounded">recommended</span>}
        </label>
        <select value={nurseId || ''}
          onChange={(e) => setNurseId(e.target.value || null)}
          className={`mt-1.5 w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-stone-500 bg-white ${needsNurse && !nurseId ? 'border-amber-400' : 'border-stone-300'}`}>
          <option value="">— No nurse —</option>
          {NURSES.map(n => (
            <option key={n.id} value={n.id}>{n.name} ({n.specialty})</option>
          ))}
        </select>
        {needsNurse && !nurseId && (
          <div className="text-[10px] text-amber-700 mt-1 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" /> This procedure usually has a nurse assist.
          </div>
        )}
      </div>

      {/* Notes (NEW: feedback item 5) */}
      <div>
        <label className="text-xs text-stone-600 font-medium">Notes / chief complaint</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="e.g. Patient complaining of upper-left molar pain since Friday. Anxious -- discuss anesthesia."
          className="mt-1.5 w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 resize-none" />
      </div>
    </div>
  );
}

// ---- Confirm step ---------------------------------------------------
function ConfirmStep({ doctor, time, date, patient, procedure, nurseId, asstDoctorId, notes }) {
  const isInsured = patient?.insurer && patient.insurer !== 'Cash/Card';
  const isDental = doctor.specialty.includes('Dent') || doctor.specialty === 'Orthodontics' || doctor.specialty === 'Endodontics';
  const insuranceCovers = isInsured && isDental;
  const nurse = nurseId ? NURSES.find(n => n.id === nurseId) : null;
  const asstDoctor = asstDoctorId ? DOCTORS.find(d => d.id === asstDoctorId) : null;

  return (
    <div className="space-y-4">
      <Row label="Patient" value={patient.nameEn} sub={`File ${patient.fileNo} · QID ${patient.qid}`} />
      <Row label="Doctor" value={doctor.nameEn} sub={doctor.specialty} />
      {asstDoctor && <Row label="Assistant" value={asstDoctor.nameEn} sub={asstDoctor.specialty} />}
      {nurse && <Row label="Nurse" value={nurse.name} sub={`${nurse.specialty}`} />}
      <Row label="When" value={fmt(date)} sub={`${time} · ${procedure.dur} minutes`} />
      <Row label="Procedure" value={procedure.name} sub={`QAR ${(procedure.price || 0).toLocaleString()}`} />
      {notes && <Row label="Notes" value={notes} />}

      <div className="border-t border-stone-200 pt-4">
        <div className="text-xs font-semibold text-stone-700 mb-2">Payment path</div>
        {insuranceCovers ? (
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-md">
            <div className="flex items-center gap-2 text-sm font-medium text-sky-900">
              <Shield className="w-4 h-4" />
              Insurance claim -- {patient.insurer}
            </div>
            <div className="text-xs text-sky-800 mt-1">
              Pre-authorization will be submitted automatically. Patient may need to pay co-pay at check-out.
            </div>
          </div>
        ) : (
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-md">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-900">
              <CreditCard className="w-4 h-4" />
              Direct payment -- {patient.insurer || 'Cash/Card'}
            </div>
            <div className="text-xs text-stone-600 mt-1">
              {isInsured && !isDental ? 'This aesthetic procedure is not covered. Patient will be billed directly.' : 'Patient will be billed at check-out.'}
            </div>
          </div>
        )}
      </div>

      <div className="text-[11px] text-stone-500 border-t border-stone-200 pt-3 leading-relaxed">
        Booking confirmation will be sent to <span className="mono">{patient.phone}</span> via SMS in Arabic and English.
      </div>
    </div>
  );
}

function Row({ label, value, sub }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-xs text-stone-500 w-20 pt-0.5">{label}</div>
      <div className="flex-1">
        <div className="text-sm font-medium">{value}</div>
        {sub && <div className="text-xs text-stone-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ---- APPOINTMENT DETAIL with inline editing (NEW: item 2) -----------
function AppointmentDetail({ appointment, patient, onClose, onUpdate, onViewFile, isArabic }) {
  const [editing, setEditing] = useState(false);
  const [editProc, setEditProc] = useState(appointment.procedure);
  const [editTime, setEditTime] = useState(appointment.start);
  const [editDur, setEditDur] = useState(appointment.dur);
  const [editNotes, setEditNotes] = useState(appointment.notes || '');
  const [editNurse, setEditNurse] = useState(appointment.nurseId);
  const [editAsstDoctor, setEditAsstDoctor] = useState(appointment.asstDoctorId);

  const doctor = DOCTORS.find(d => d.id === appointment.doctorId);
  const status = STATUS_FLOW[appointment.status];
  const nurse = appointment.nurseId ? NURSES.find(n => n.id === appointment.nurseId) : null;
  const asstDoctor = appointment.asstDoctorId ? DOCTORS.find(d => d.id === appointment.asstDoctorId) : null;
  const isDentalSpec = ['General Dentistry', 'Orthodontics', 'Endodontics', 'Cosmetic Dentistry'].includes(doctor?.specialty);
  const dentalAssistants = DOCTORS.filter(d => d.id !== doctor?.id && ['General Dentistry', 'Orthodontics', 'Endodontics', 'Cosmetic Dentistry'].includes(d.specialty));

  const saveEdits = () => {
    onUpdate({ procedure: editProc, start: editTime, dur: editDur, notes: editNotes, nurseId: editNurse, asstDoctorId: editAsstDoctor });
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{isArabic ? 'تفاصيل الموعد' : 'Appointment details'}</div>
            <div className="text-xs text-stone-500 mt-0.5 mono">#{appointment.id}</div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Patient block with View file button */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
                  {patient?.nameEn}
                  <span className="text-[10px] mono text-stone-500 bg-white border border-stone-200 px-1.5 py-0.5 rounded">{patient?.fileNo}</span>
                </div>
                <div className="text-xs text-stone-500 mono mt-0.5">QID {patient?.qid}</div>
                <div className="text-xs text-stone-500 mt-0.5">{patient?.phone}</div>
                {patient?.allergies && patient.allergies.length > 0 && (
                  <div className="mt-1.5 text-[11px] text-red-700 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {patient.allergies.join(', ')}
                  </div>
                )}
              </div>
              <button onClick={() => onViewFile(patient)}
                className="px-2.5 py-1.5 text-[11px] border border-stone-300 rounded-md hover:bg-white flex items-center gap-1.5 flex-shrink-0">
                <Eye className="w-3 h-3" /> View file
              </button>
            </div>
          </div>

          {/* Status picker (NEW: feedback item 4) */}
          <div>
            <label className="text-xs text-stone-600 font-medium">Status</label>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {Object.entries(STATUS_FLOW).map(([key, s]) => (
                <button key={key}
                  onClick={() => onUpdate({ status: key })}
                  className={`px-2.5 py-1.5 text-xs rounded border flex items-center gap-1.5 transition-colors ${
                    appointment.status === key ? s.chip + ' font-semibold' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Editable fields */}
          {!editing ? (
            <div className="space-y-2.5">
              <Row label="Doctor" value={doctor?.nameEn} sub={doctor?.specialty} />
              <Row label="Time" value={appointment.start} sub={`${appointment.dur} minutes`} />
              <Row label="Procedure" value={appointment.procedure} />
              {asstDoctor && <Row label="Assistant" value={asstDoctor.nameEn} sub={asstDoctor.specialty} />}
              {nurse && <Row label="Nurse" value={nurse.name} />}
              {appointment.notes && <Row label="Notes" value={appointment.notes} />}
              <button onClick={() => setEditing(true)}
                className="mt-2 w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md hover:bg-stone-50 flex items-center justify-center gap-1.5">
                <Edit3 className="w-3 h-3" /> Edit appointment
              </button>
            </div>
          ) : (
            <div className="space-y-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <Edit3 className="w-3 h-3" /> Editing
              </div>
              <Field label="Procedure" value={editProc} onChange={setEditProc} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-600 font-medium">Time</label>
                  <select value={editTime} onChange={(e) => setEditTime(e.target.value)}
                    className="mt-1 w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 bg-white mono">
                    {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-stone-600 font-medium">Duration (min)</label>
                  <input type="number" min="15" step="15" value={editDur}
                    onChange={(e) => setEditDur(parseInt(e.target.value) || 30)}
                    className="mt-1 w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 mono" />
                </div>
              </div>
              {isDentalSpec && (
                <div>
                  <label className="text-[10px] text-stone-600 font-medium">Assistant doctor</label>
                  <select value={editAsstDoctor || ''} onChange={(e) => setEditAsstDoctor(e.target.value || null)}
                    className="mt-1 w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 bg-white">
                    <option value="">— No assistant —</option>
                    {dentalAssistants.map(d => <option key={d.id} value={d.id}>{d.nameEn}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-[10px] text-stone-600 font-medium">Nurse</label>
                <select value={editNurse || ''} onChange={(e) => setEditNurse(e.target.value || null)}
                  className="mt-1 w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 bg-white">
                  <option value="">— No nurse —</option>
                  {NURSES.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-stone-600 font-medium">Notes</label>
                <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2}
                  className="mt-1 w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-md hover:bg-white">Cancel</button>
                <button onClick={saveEdits} className="flex-1 px-3 py-1.5 text-xs bg-stone-900 text-white rounded-md hover:bg-stone-800 flex items-center justify-center gap-1.5">
                  <Save className="w-3 h-3" /> Save changes
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button onClick={() => onUpdate({ status: 'cancelled' })} className="text-xs text-red-600 hover:underline">Cancel appointment</button>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs border border-stone-300 rounded-md hover:bg-white flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> Call
            </button>
            {appointment.status === 'booked' || appointment.status === 'confirmed' ? (
              <button onClick={() => onUpdate({ status: 'arrived' })} className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Check in (arrived)
              </button>
            ) : (
              <button onClick={() => {
                const next = appointment.status === 'arrived' ? 'in-progress'
                           : appointment.status === 'in-progress' ? 'treatment-done'
                           : appointment.status === 'treatment-done' ? 'payment-done'
                           : 'payment-done';
                onUpdate({ status: next });
              }} className="px-3 py-1.5 text-xs bg-stone-900 text-white rounded-md hover:bg-stone-800 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3" /> Next step
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- PATIENT FILE VIEWER (NEW: feedback item 11) --------------------
// Read-only view for receptionists -- show full history, no edit capability.
function PatientFileViewer({ patient, onUpdate, onClose }) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState(patient.notes || '');

  const saveNotes = () => {
    onUpdate(patient.id, { notes: draftNotes });
    setEditingNotes(false);
  };

  const cancelEdit = () => {
    setDraftNotes(patient.notes || '');
    setEditingNotes(false);
  };
  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold flex items-center gap-2 flex-wrap">
              <Eye className="w-4 h-4 text-stone-500" />
              Patient file
              <span className="text-[10px] mono bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">CLINICAL: READ-ONLY</span>
            </div>
            <div className="text-xs text-stone-500 mt-0.5">
              Reception can view clinical history but only edit reception notes
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Identity */}
          <div className="px-5 py-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                <User className="w-6 h-6 text-stone-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-base font-semibold">{patient.nameEn}</div>
                  <div className="text-sm text-stone-500" dir="rtl">{patient.nameAr}</div>
                  <span className="text-[10px] mono text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">{patient.fileNo}</span>
                </div>
                <div className="text-xs text-stone-500 mono mt-0.5">
                  QID {patient.qid} · DOB {patient.dob} · {patient.phone}
                </div>
                {patient.insurer && (
                  <div className="text-xs text-stone-600 mt-0.5 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> {patient.insurer} {patient.policy && `· ${patient.policy}`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reception notes — right after identity */}
          <div className="px-5 py-3 border-b border-stone-100">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Reception notes</div>
              {!editingNotes && (
                <button onClick={() => setEditingNotes(true)}
                  className="text-[10px] text-stone-600 hover:text-stone-900 flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  {patient.notes ? 'Edit' : 'Add notes'}
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea value={draftNotes} onChange={e => setDraftNotes(e.target.value)} rows={3} autoFocus
                  placeholder="Visible to reception and doctors. E.g. prefers afternoons, ride arranged, anxious patient..."
                  className="w-full px-2.5 py-2 text-xs border border-amber-300 bg-amber-50/50 rounded focus:outline-none focus:border-amber-500 resize-none" />
                <div className="flex gap-2 justify-end">
                  <button onClick={cancelEdit} className="px-3 py-1 text-[11px] border border-stone-300 rounded hover:bg-stone-50">Cancel</button>
                  <button onClick={saveNotes} className="px-3 py-1 text-[11px] bg-stone-900 text-white rounded hover:bg-stone-800 flex items-center gap-1">
                    <Save className="w-3 h-3" /> Save notes
                  </button>
                </div>
              </div>
            ) : patient.notes ? (
              <div className="text-xs text-stone-700 bg-amber-50 border border-amber-200 rounded p-2 italic">{patient.notes}</div>
            ) : (
              <div className="text-xs text-stone-400 italic px-2 py-1.5 border border-dashed border-stone-200 rounded">
                No reception notes yet. Click "Add notes" to record anything reception or doctors should know.
              </div>
            )}
          </div>

          {/* Allergies & conditions */}
          {(patient.allergies?.length > 0 || patient.conditions?.length > 0) && (
            <div className="px-5 py-3 border-b border-stone-100 grid grid-cols-2 gap-4">
              {patient.allergies?.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-red-700 uppercase tracking-wide mb-1.5">Allergies</div>
                  <div className="space-y-1">
                    {patient.allergies.map(a => (
                      <div key={a} className="text-xs text-red-900 bg-red-50 border border-red-200 px-2 py-0.5 rounded">{a}</div>
                    ))}
                  </div>
                </div>
              )}
              {patient.conditions?.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-stone-700 uppercase tracking-wide mb-1.5">Conditions</div>
                  <div className="space-y-1">
                    {patient.conditions.map(c => <div key={c} className="text-xs text-stone-700">{c}</div>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Encounter history */}
          <div className="px-5 py-3 border-b border-stone-100">
            <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Encounter history</div>
            {(!patient.encounterHistory || patient.encounterHistory.length === 0) ? (
              <div className="text-xs text-stone-400 italic">No previous encounters</div>
            ) : (
              <div className="space-y-2">
                {patient.encounterHistory.map((e, i) => (
                  <div key={i} className="p-2.5 bg-stone-50 border border-stone-200 rounded">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium">{e.procedure}</div>
                      <div className="text-[10px] mono text-stone-500">{e.date}</div>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">{e.doctor}</div>
                    {e.notes && <div className="text-xs text-stone-600 mt-1 italic">{e.notes}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="px-5 py-3 border-b border-stone-100">
            <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Documents on file</div>
            <div className="grid grid-cols-3 gap-2">
              <DocumentChip label="QID front" filename={patient.idFront} />
              <DocumentChip label="QID back"  filename={patient.idBack} />
              <DocumentChip label="Insurance" filename={patient.insuranceCard} />
            </div>
          </div>

        </div>

        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 text-[10px] text-stone-500 flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          Read access logged · Audit entry created at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

function DocumentChip({ label, filename }) {
  if (!filename) {
    return (
      <div className="px-2 py-1.5 border border-dashed border-stone-300 rounded text-center text-[10px] text-stone-400">
        {label}: not uploaded
      </div>
    );
  }
  return (
    <div className="px-2 py-1.5 border border-stone-200 bg-stone-50 rounded text-[10px] flex items-center gap-1.5">
      <FileImage className="w-3 h-3 text-stone-500 flex-shrink-0" />
      <div className="min-w-0">
        <div className="font-medium text-stone-700">{label}</div>
        <div className="text-stone-500 mono truncate">{filename}</div>
      </div>
    </div>
  );
}

// ---- DOCTOR SCHEDULE MANAGER (NEW: feedback item 10) ----------------
function DoctorScheduleModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4" /> Doctor schedules
            </div>
            <div className="text-xs text-stone-500 mt-0.5">Working hours, off days, vacations, recurring breaks</div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {DOCTORS.map(doc => {
            const sched = DOCTOR_SCHEDULES[doc.id];
            const colors = COLOR_MAP[doc.color];
            return (
              <div key={doc.id} className={`p-3 border ${colors.border} ${colors.bg} rounded-md`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className={`text-sm font-semibold ${colors.text}`}>{doc.nameEn}</div>
                    <div className="text-xs text-stone-500">{doc.specialty} · {doc.qchp}</div>
                  </div>
                  <button className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide font-semibold text-stone-600 mb-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Working hours
                    </div>
                    <div className="mono">{sched.workStart} -- {sched.workEnd}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide font-semibold text-stone-600 mb-1">Weekly off</div>
                    <div className="flex gap-1 flex-wrap">
                      {sched.offDays.map(d => (
                        <span key={d} className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded capitalize">{d}</span>
                      ))}
                    </div>
                  </div>
                  {sched.breaks.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wide font-semibold text-stone-600 mb-1 flex items-center gap-1">
                        <Coffee className="w-2.5 h-2.5" /> Daily breaks
                      </div>
                      {sched.breaks.map((b, i) => (
                        <div key={i} className="mono text-stone-700">{b.start}--{b.end} · {b.label}</div>
                      ))}
                    </div>
                  )}
                  {sched.vacations.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wide font-semibold text-stone-600 mb-1 flex items-center gap-1">
                        <Plane className="w-2.5 h-2.5" /> Upcoming vacations
                      </div>
                      {sched.vacations.map((v, i) => (
                        <div key={i} className="text-stone-700">
                          <span className="mono">{v.start} → {v.end}</span>
                          <span className="text-stone-500 ml-1">({v.reason})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 text-[11px] text-stone-500 flex items-center justify-between">
          <span>Blocked time slots appear hashed in the calendar grid.</span>
          <button onClick={onClose} className="px-3 py-1.5 text-xs bg-stone-900 text-white rounded-md hover:bg-stone-800">Done</button>
        </div>
      </div>
    </div>
  );
}
