import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle, Calendar, Package, Users, FileText, ChevronRight,
  ArrowUpRight, ArrowDownRight, Banknote, Shield, Bell, ChevronDown,
  ChevronUp, AlertCircle, CheckCircle2, Plus, Edit3, Save,
  X, UserPlus, LayoutGrid, BarChart3, RefreshCw, Download,
  Search, Clock, Trash2, CalendarDays, Coffee, Plane, Phone, ClipboardList, Headset
} from 'lucide-react';
import { useTreatments, saveTreatments, getTreatments, TREATMENT_INSURERS } from './treatmentStore';
import { useSchedules, getSchedule, setSchedule, WEEK_DAYS, defaultSchedule } from './scheduleStore';
import { usePatients, patientAge } from './patientStore';

// ─── Clinic branding ──────────────────────────────────────────────────────────
const CLINIC_CONFIG = {
  name: 'Yasmeen Clinic',
  nameAr: 'عيادة الياسمين',
  city: 'Doha, Qatar',
  logoUrl: null,
  primaryColor: '#0C6B5A',
  headerBg: '#0f1f1a',
};

function MedlyLogo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <rect width="34" height="34" rx="9" fill={CLINIC_CONFIG.primaryColor} />
      <path d="M7 24V12L13 20L19 12V18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 18C19 22 21.5 24 24.5 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="27" cy="24" r="2.2" stroke="#fff" strokeWidth="2" />
      <circle cx="27" cy="24" r="0.7" fill="#fff" />
    </svg>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const REVENUE_DATA_MONTH = [
  { label: 'Dec', booked: 178400, collected: 162100, dental: 124800, aesthetic: 53600 },
  { label: 'Jan', booked: 192700, collected: 184200, dental: 138900, aesthetic: 53800 },
  { label: 'Feb', booked: 210500, collected: 198400, dental: 142300, aesthetic: 68200 },
  { label: 'Mar', booked: 225800, collected: 211900, dental: 156100, aesthetic: 69700 },
  { label: 'Apr', booked: 248300, collected: 224500, dental: 168800, aesthetic: 79500 },
  { label: 'May', booked: 242100, collected: 198700, dental: 161200, aesthetic: 80900 },
];

// Last 7 days of May 2026 (current week, ending today)
const REVENUE_DATA_WEEK = [
  { label: 'Mon', booked: 8200,  collected: 7100,  dental: 5400, aesthetic: 1700 },
  { label: 'Tue', booked: 11800, collected: 9400,  dental: 6800, aesthetic: 2600 },
  { label: 'Wed', booked: 9600,  collected: 8200,  dental: 5900, aesthetic: 2300 },
  { label: 'Thu', booked: 13200, collected: 11500, dental: 7400, aesthetic: 4100 },
  { label: 'Fri', booked: 4800,  collected: 3900,  dental: 2200, aesthetic: 1700 },
  { label: 'Sat', booked: 12400, collected: 10100, dental: 6300, aesthetic: 3800 },
  { label: 'Sun', booked: 14100, collected: 12300, dental: 8200, aesthetic: 4100 },
];

// Last 4 quarters
const REVENUE_DATA_QUARTER = [
  { label: 'Q3 25', booked: 482400, collected: 438200, dental: 318600, aesthetic: 119600 },
  { label: 'Q4 25', booked: 528700, collected: 491400, dental: 358200, aesthetic: 133200 },
  { label: 'Q1 26', booked: 628900, collected: 594500, dental: 437300, aesthetic: 157200 },
  { label: 'Q2 26', booked: 490400, collected: 423200, dental: 330000, aesthetic: 160400 },
];

const REVENUE_BY_PERIOD = {
  week:    REVENUE_DATA_WEEK,
  month:   REVENUE_DATA_MONTH,
  quarter: REVENUE_DATA_QUARTER,
};

// Period multipliers for cost/obligation amounts
// month is the baseline (1.0); week ≈ 7/30 days; quarter ≈ 3 months
const PERIOD_SCALE = { week: 0.24, month: 1.0, quarter: 3.0 };
const PERIOD_LABEL = { week: 'this week', month: 'May', quarter: 'Q2 2026' };
const PERIOD_LABEL_SHORT = { week: 'wk', month: 'mo', quarter: 'qtr' };

// ─── Download helpers (shared by Reports + Daily tabs) ──────────────────────
const csvEscape = v => {
  const str = String(v ?? '');
  return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
};

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

const downloadCSV = (filename, headers, rows) => {
  const lines = [headers.join(','), ...rows.map(r => r.map(csvEscape).join(','))];
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
};

// Lazy-load SheetJS from CDN only when user clicks Excel
let XLSX_PROMISE = null;
const loadXLSX = () => {
  if (XLSX_PROMISE) return XLSX_PROMISE;
  XLSX_PROMISE = new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.XLSX) return resolve(window.XLSX);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.onload  = () => resolve(window.XLSX);
    script.onerror = () => { XLSX_PROMISE = null; reject(new Error('Failed to load XLSX library')); };
    document.head.appendChild(script);
  });
  return XLSX_PROMISE;
};

const downloadXLSX = async (filename, sheetName, headers, rows) => {
  try {
    const XLSX = await loadXLSX();
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const colWidths = headers.map((h, i) => {
      const maxLen = Math.max(String(h).length, ...rows.map(r => String(r[i] ?? '').length));
      return { wch: Math.min(40, Math.max(8, maxLen + 2)) };
    });
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    XLSX.writeFile(wb, filename);
  } catch (err) {
    alert('Excel export failed — try CSV instead, or check your connection.');
  }
};

function DownloadMenu({ onCSV, onXLSX, disabled }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open]);
  return (
    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)} disabled={disabled} title="Download report"
        style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #DCE4E0', borderRadius: 9, background: '#fff', color: '#2A4840', cursor: 'pointer', opacity: disabled ? .4 : 1 }}>
        <Download size={13} /> Download <ChevronDown size={11} style={{ marginLeft: 2 }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', borderRadius: 10, border: '1px solid #DCE4E0', boxShadow: '0 8px 20px rgba(15,31,26,.14)', overflow: 'hidden', zIndex: 100, minWidth: 200 }}>
          <button onClick={() => { setOpen(false); onCSV(); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid #EEF2F0', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F0FAF6', color: '#0A6040', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>CSV</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111814' }}>Download CSV</div>
              <div style={{ fontSize: 11.5, color: '#5A7870', fontWeight: 500 }}>Universal, works everywhere</div>
            </div>
          </button>
          <button onClick={() => { setOpen(false); onXLSX(); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#E8F3F0', color: '#0A6040', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>XLS</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111814' }}>Download Excel</div>
              <div style={{ fontSize: 11.5, color: '#5A7870', fontWeight: 500 }}>Formatted spreadsheet</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}


// Backwards compat shim — some places still read REVENUE_DATA
const REVENUE_DATA = REVENUE_DATA_MONTH.map(r => ({ ...r, month: r.label }));
const COST_BREAKDOWN = [
  { category: 'Salaries',             amount: 92400,  pct: 38, trend: +4,  color: '#0C6B5A' },
  { category: 'Supplies',             amount: 38700,  pct: 16, trend: +12, color: '#DC4F38', alert: true },
  { category: 'Rent & utilities',     amount: 28500,  pct: 12, trend: 0,   color: '#3B82F6' },
  { category: 'Insurance & licenses', amount: 12200,  pct: 5,  trend: 0,   color: '#8B5CF6' },
  { category: 'Marketing',            amount: 18400,  pct: 8,  trend: +22, color: '#F59E0B', alert: true },
  { category: 'Lab outsourcing',      amount: 21300,  pct: 9,  trend: -3,  color: '#10B981' },
  { category: 'Other',                amount: 29500,  pct: 12, trend: +2,  color: '#9CA3AF' },
];
const INIT_DOCTORS = [
  { id: 'd1', name: 'Dr. Layla Al-Mahmoud', specialty: 'General Dentistry',  color: 'rose',    initials: 'LA', qchp: 'QCHP-D-44218', active: true,  calOrder: 1, revenue: 52400, utilization: 86, ticket: 825,  noshow: 6,  hours: 142 },
  { id: 'd2', name: 'Dr. Omar Al-Sayed',    specialty: 'Orthodontics',        color: 'amber',   initials: 'OS', qchp: 'QCHP-D-51209', active: true,  calOrder: 2, revenue: 41800, utilization: 78, ticket: 1240, noshow: 4,  hours: 128 },
  { id: 'd3', name: 'Dr. Priya Menon',      specialty: 'Endodontics',         color: 'teal',    initials: 'PM', qchp: 'QCHP-D-39871', active: true,  calOrder: 3, revenue: 38200, utilization: 71, ticket: 1850, noshow: 2,  hours: 114 },
  { id: 'd4', name: 'Dr. Yusuf Hassan',     specialty: 'Cosmetic Dentistry',  color: 'violet',  initials: 'YH', qchp: 'QCHP-D-47502', active: true,  calOrder: 4, revenue: 28800, utilization: 64, ticket: 2200, noshow: 9,  hours: 96  },
  { id: 'd5', name: 'Dr. Reem Al-Thani',    specialty: 'Aesthetic Medicine',  color: 'sky',     initials: 'RT', qchp: 'QCHP-M-22041', active: true,  calOrder: 5, revenue: 48700, utilization: 82, ticket: 1980, noshow: 3,  hours: 132 },
  { id: 'd6', name: 'Dr. Marcus Chen',      specialty: 'Aesthetic Medicine',  color: 'emerald', initials: 'MC', qchp: 'QCHP-M-29116', active: true,  calOrder: 6, revenue: 32200, utilization: 67, ticket: 1720, noshow: 7,  hours: 108 },
];
const INIT_NURSES = [
  { id: 'n1', name: 'Nurse Dina Khalil',   specialty: 'Aesthetic', active: true },
  { id: 'n2', name: 'Nurse Sara Al-Amin',  specialty: 'Dental',    active: true },
  { id: 'n3', name: 'Nurse Mariam Hassan', specialty: 'General',   active: true },
  { id: 'n4', name: 'Nurse Aliya Rahman',  specialty: 'Aesthetic', active: true },
];
const INIT_TRAINEES = [
  { id: 'tr1', name: 'Trainee Ahmed Al-Sulaiti', specialty: 'General Dentistry',  supervisorIds: ['d1', 'd4'], active: true  },
  { id: 'tr2', name: 'Trainee Maryam Jaber',     specialty: 'Aesthetic Medicine', supervisorIds: ['d5'],       active: true  },
  { id: 'tr3', name: 'Trainee Faris Al-Dosari',  specialty: 'Orthodontics',       supervisorIds: ['d2'],       active: false },
];
const INIT_RECEPTIONISTS = [
  { id: 'r1', name: 'Rania Mansour',    desk: 'Front desk',    phone: '+974 5512 0091', shift: 'Morning', active: true  },
  { id: 'r2', name: 'Huda Al-Naimi',    desk: 'Front desk',    phone: '+974 5533 7742', shift: 'Evening', active: true  },
  { id: 'r3', name: 'Leen Abdullah',    desk: 'Aesthetic wing', phone: '+974 5501 8830', shift: 'Morning', active: true  },
];
const INIT_TREATMENTS = [
  { id: 't1',  name: 'Consultation',         specialty: 'General Dentistry',  dur: 30, price: 250,  needsNurse: false, active: true },
  { id: 't2',  name: 'Cleaning & polish',    specialty: 'General Dentistry',  dur: 45, price: 400,  needsNurse: true,  active: true },
  { id: 't3',  name: 'Filling',              specialty: 'General Dentistry',  dur: 45, price: 600,  needsNurse: true,  active: true },
  { id: 't4',  name: 'Extraction',           specialty: 'General Dentistry',  dur: 60, price: 800,  needsNurse: true,  active: true },
  { id: 't5',  name: 'Root canal treatment', specialty: 'Endodontics',         dur: 90, price: 2500, needsNurse: true,  active: true },
  { id: 't6',  name: 'Braces adjustment',    specialty: 'Orthodontics',        dur: 30, price: 450,  needsNurse: true,  active: true },
  { id: 't7',  name: 'Teeth whitening',      specialty: 'Cosmetic Dentistry',  dur: 60, price: 1500, needsNurse: true,  active: true },
  { id: 't8',  name: 'Botox',                specialty: 'Aesthetic Medicine',  dur: 45, price: 1800, needsNurse: true,  active: true },
  { id: 't9',  name: 'Dermal filler',        specialty: 'Aesthetic Medicine',  dur: 60, price: 2400, needsNurse: true,  active: true },
  { id: 't10', name: 'Hydrafacial',          specialty: 'Aesthetic Medicine',  dur: 60, price: 1200, needsNurse: true,  active: true },
  { id: 't11', name: 'Laser hair removal',   specialty: 'Aesthetic Medicine',  dur: 45, price: 800,  needsNurse: true,  active: true },
  { id: 't12', name: 'Chemical peel',        specialty: 'Aesthetic Medicine',  dur: 60, price: 900,  needsNurse: true,  active: true },
];
const TREATMENT_REPORT = [
  { name: 'Botox',             count: 38, revenue: 68400, avgTicket: 1800, insured: 0,     selfPay: 68400, specialty: 'Aesthetic Medicine' },
  { name: 'Root canal',        count: 12, revenue: 30000, avgTicket: 2500, insured: 22000, selfPay: 8000,  specialty: 'Endodontics' },
  { name: 'Dermal filler',     count: 14, revenue: 33600, avgTicket: 2400, insured: 0,     selfPay: 33600, specialty: 'Aesthetic Medicine' },
  { name: 'Cleaning & polish', count: 52, revenue: 20800, avgTicket: 400,  insured: 14200, selfPay: 6600,  specialty: 'General Dentistry' },
  { name: 'Teeth whitening',   count: 11, revenue: 16500, avgTicket: 1500, insured: 0,     selfPay: 16500, specialty: 'Cosmetic Dentistry' },
  { name: 'Hydrafacial',       count: 18, revenue: 21600, avgTicket: 1200, insured: 0,     selfPay: 21600, specialty: 'Aesthetic Medicine' },
  { name: 'Filling',           count: 29, revenue: 17400, avgTicket: 600,  insured: 11200, selfPay: 6200,  specialty: 'General Dentistry' },
  { name: 'Extraction',        count: 16, revenue: 12800, avgTicket: 800,  insured: 8400,  selfPay: 4400,  specialty: 'General Dentistry' },
  { name: 'Braces adjustment', count: 22, revenue: 9900,  avgTicket: 450,  insured: 6200,  selfPay: 3700,  specialty: 'Orthodontics' },
  { name: 'Laser hair removal',count: 9,  revenue: 7200,  avgTicket: 800,  insured: 0,     selfPay: 7200,  specialty: 'Aesthetic Medicine' },
];
const DAILY_TRANSACTIONS = [
  { id: 'tx1',  time: '09:00', patient: 'Fatima Al-Mansoori', fileNo: 'YC-2025-0317', doctor: 'Dr. Layla Al-Mahmoud', treatment: 'Cleaning & polish', amount: 400,  method: 'Card',      insurer: null,  status: 'paid',    corrected: false },
  { id: 'tx2',  time: '09:30', patient: 'James Patterson',    fileNo: 'YC-2024-0089', doctor: 'Dr. Omar Al-Sayed',    treatment: 'Braces adjustment', amount: 450,  method: 'Cash',      insurer: null,  status: 'paid',    corrected: false },
  { id: 'tx3',  time: '10:00', patient: 'Aisha Al-Kuwari',    fileNo: 'YC-2024-0142', doctor: 'Dr. Layla Al-Mahmoud', treatment: 'Extraction',        amount: 800,  method: 'Card',      insurer: 'QLM', status: 'paid',    corrected: false },
  { id: 'tx4',  time: '10:30', patient: 'Khalid Al-Emadi',    fileNo: 'YC-2026-0028', doctor: 'Dr. Reem Al-Thani',    treatment: 'Botox',             amount: 1800, method: 'Card',      insurer: null,  status: 'paid',    corrected: false },
  { id: 'tx5',  time: '11:00', patient: 'Sara Nasser',        fileNo: 'YC-2025-0204', doctor: 'Dr. Priya Menon',      treatment: 'Root canal',        amount: 2500, method: 'NAPS',      insurer: 'AXA', status: 'paid',    corrected: false },
  { id: 'tx6',  time: '11:30', patient: 'Mohammed Al-Ali',    fileNo: 'YC-2024-0312', doctor: 'Dr. Marcus Chen',      treatment: 'Dermal filler',     amount: 2400, method: 'Apple Pay', insurer: null,  status: 'paid',    corrected: false },
  { id: 'tx7',  time: '13:00', patient: 'Noura Al-Sulaiti',   fileNo: 'YC-2025-0418', doctor: 'Dr. Yusuf Hassan',     treatment: 'Teeth whitening',   amount: 1500, method: 'Card',      insurer: null,  status: 'paid',    corrected: false },
  { id: 'tx8',  time: '14:00', patient: 'Aisha Al-Kuwari',    fileNo: 'YC-2024-0142', doctor: 'Dr. Priya Menon',      treatment: 'Root canal',        amount: 2500, method: 'Insurance', insurer: 'QLM', status: 'pending', corrected: false },
  { id: 'tx9',  time: '14:30', patient: 'Reem Al-Hajri',      fileNo: 'YC-2026-0055', doctor: 'Dr. Reem Al-Thani',    treatment: 'Hydrafacial',       amount: 1200, method: 'Card',      insurer: null,  status: 'paid',    corrected: false },
  { id: 'tx10', time: '15:30', patient: 'Ahmed Al-Marri',     fileNo: 'YC-2025-0137', doctor: 'Dr. Layla Al-Mahmoud', treatment: 'Filling',           amount: 600,  method: 'Cash',      insurer: 'Daman',status: 'paid',   corrected: true, correctionNote: 'Amount corrected from QAR 800 — wrong procedure code.' },
];
const ATTENTION_ITEMS = [
  { icon: Shield,      priority: 'high',   title: '8 claims awaiting QLM response',      sub: 'QAR 47,200 receivable · 6+ days old',    cta: 'Review'      },
  { icon: Package,     priority: 'high',   title: 'Botox stock critical — 4 vials left',  sub: 'Dr. Reem has 9 patients booked',          cta: 'Reorder'     },
  { icon: FileText,    priority: 'medium', title: 'Dr. Hassan QCHP license expiring',     sub: 'June 30 · 38 days remaining',             cta: 'Track'       },
  { icon: Banknote,    priority: 'medium', title: 'Payroll SIF due May 28',               sub: 'WPS submission to QNB',                   cta: 'Prepare'     },
  { icon: AlertCircle, priority: 'low',    title: 'Lab invoice mismatch',                 sub: 'NobelBiocare · QAR 1,420 over expected',  cta: 'Investigate' },
];
const CLAIMS_PIPELINE = [
  { status: 'Submitted',    count: 12, value: 38900, color: '#94A3B8' },
  { status: 'Adjudicating', count: 8,  value: 47200, color: '#F59E0B' },
  { status: 'Approved',     count: 6,  value: 24100, color: '#0C6B5A' },
  { status: 'Disputed',     count: 2,  value: 8800,  color: '#DC4F38' },
];
const AVATAR_COLORS = {
  rose:    { bg: '#FEE2E2', fg: '#991B1B' },
  amber:   { bg: '#FEF3C7', fg: '#92400E' },
  teal:    { bg: '#CCFBF1', fg: '#134E4A' },
  violet:  { bg: '#EDE9FE', fg: '#4C1D95' },
  sky:     { bg: '#E0F2FE', fg: '#075985' },
  emerald: { bg: '#D1FAE5', fg: '#064E3B' },
};
const qar = n => `QAR ${Number(n).toLocaleString()}`;

// ─── Date helpers (Reports) ────────────────────────────────────────────────────
const isoDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Monday-anchored week start for a given ISO date string.
function weekStartISO(iso) {
  const d = new Date(iso + 'T00:00:00');
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - dow);
  return isoDate(d);
}
const fmtDay = iso => { const d = new Date(iso + 'T00:00:00'); return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`; };

// ─── Procedure log — every procedure across all patients & doctors ─────────────
// Built deterministically over a date range so date/doctor/treatment filters and
// daily/weekly/monthly revenue roll-ups are all meaningful. In production this is
// the billing ledger. Each row: one completed, billed procedure.
const REPORT_PATIENTS = [
  { name: 'Aisha Al-Kuwari',   fileNo: 'YC-2024-0142', insurer: 'QLM' },
  { name: 'James Patterson',   fileNo: 'YC-2024-0089', insurer: null },
  { name: 'Fatima Al-Mansoori', fileNo: 'YC-2025-0317', insurer: 'AXA' },
  { name: 'Sara Al-Jaber',     fileNo: 'YC-2023-0318', insurer: 'QLM' },
  { name: 'Nora Al-Thani',     fileNo: 'YC-2025-0387', insurer: 'QLM' },
  { name: 'Ali Hassan Al-Marri', fileNo: 'YC-2022-0056', insurer: 'Allianz' },
  { name: 'Sara Nasser',       fileNo: 'YC-2025-0204', insurer: 'AXA' },
  { name: 'Khalid Al-Emadi',   fileNo: 'YC-2026-0028', insurer: null },
  { name: 'Mohammed Al-Ali',   fileNo: 'YC-2024-0312', insurer: 'MedNet' },
  { name: 'Ahmed Al-Marri',    fileNo: 'YC-2025-0137', insurer: 'Daman' },
];
// treatment → { specialty, doctorId, price, insurable }
const REPORT_TX = [
  { treatment: 'Cleaning & polish',    specialty: 'General Dentistry', doctorId: 'd1', price: 400,  insurable: true  },
  { treatment: 'Filling',              specialty: 'General Dentistry', doctorId: 'd1', price: 600,  insurable: true  },
  { treatment: 'Extraction',           specialty: 'General Dentistry', doctorId: 'd1', price: 800,  insurable: true  },
  { treatment: 'Crown prep',           specialty: 'General Dentistry', doctorId: 'd1', price: 1400, insurable: true  },
  { treatment: 'Braces adjustment',    specialty: 'Orthodontics',      doctorId: 'd2', price: 450,  insurable: true  },
  { treatment: 'Retainer fitting',     specialty: 'Orthodontics',      doctorId: 'd2', price: 1200, insurable: true  },
  { treatment: 'Root canal treatment', specialty: 'Endodontics',       doctorId: 'd3', price: 2500, insurable: true  },
  { treatment: 'Teeth whitening',      specialty: 'Cosmetic Dentistry', doctorId: 'd4', price: 1500, insurable: false },
  { treatment: 'Veneer fitting',       specialty: 'Cosmetic Dentistry', doctorId: 'd4', price: 4500, insurable: false },
  { treatment: 'Botox',                specialty: 'Aesthetic Medicine', doctorId: 'd5', price: 1800, insurable: false },
  { treatment: 'Dermal filler',        specialty: 'Aesthetic Medicine', doctorId: 'd6', price: 2400, insurable: false },
  { treatment: 'Hydrafacial',          specialty: 'Aesthetic Medicine', doctorId: 'd5', price: 1200, insurable: false },
  { treatment: 'Chemical peel',        specialty: 'Aesthetic Medicine', doctorId: 'd6', price: 900,  insurable: false },
];
const DOCTOR_NAME_BY_ID = Object.fromEntries(INIT_DOCTORS.map(d => [d.id, d.name]));
const METHODS = ['Card', 'Cash', 'Apple Pay', 'NAPS'];

function buildProcedureLog() {
  const out = [];
  const start = new Date(2026, 3, 1);   // 01 Apr 2026
  const end   = new Date(2026, 4, 24);  // 24 May 2026
  let i = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 5) continue;      // Friday — clinic closed
    const iso = isoDate(d);
    const nRec = 2 + (i % 3);            // 2–4 procedures per open day
    for (let k = 0; k < nRec; k++) {
      const tx = REPORT_TX[(i * 5 + k * 3) % REPORT_TX.length];
      const pt = REPORT_PATIENTS[(i * 3 + k * 7) % REPORT_PATIENTS.length];
      const useIns = tx.insurable && pt.insurer && ((i + k) % 2 === 0);
      const insurer = useIns ? pt.insurer : null;
      const insured = useIns ? Math.round(tx.price * 0.8) : 0;
      const selfPay = tx.price - insured;
      const hh = 9 + ((i + k) % 8);
      const mm = (k % 2) === 0 ? '00' : '30';
      out.push({
        id: `px-${i}-${k}`,
        date: iso,
        time: `${String(hh).padStart(2, '0')}:${mm}`,
        patient: pt.name,
        fileNo: pt.fileNo,
        doctorId: tx.doctorId,
        doctor: DOCTOR_NAME_BY_ID[tx.doctorId] || 'Unknown',
        treatment: tx.treatment,
        specialty: tx.specialty,
        amount: tx.price,
        insurer,
        insured,
        selfPay,
        method: insurer ? 'Insurance' : METHODS[(i + k) % METHODS.length],
      });
      i++;
    }
  }
  return out;
}
const PROCEDURE_LOG = buildProcedureLog();

const S = {
  fontFamily: "'Manrope', 'Noto Sans Arabic', system-ui, sans-serif",
  background: '#EAEDEB',
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AdminPrototype() {
  const [tab, setTab]             = useState('dashboard');
  const [period, setPeriod]       = useState('month');
  const [doctors, setDoctors]     = useState(INIT_DOCTORS);
  const [nurses, setNurses]       = useState(INIT_NURSES);
  const [trainees, setTrainees]   = useState(INIT_TRAINEES);
  const [receptionists, setReceptionists] = useState(INIT_RECEPTIONISTS);
  const treatments = useTreatments();
  const setTreatments = up => saveTreatments(typeof up==='function' ? up(getTreatments()) : up);
  const patients = usePatients();
  useSchedules(); // re-render when any staff schedule changes
  const [transactions, setTransactions] = useState(DAILY_TRANSACTIONS);

  // Period-aware data — recomputes whenever Week/Month/Quarter changes
  const periodData    = REVENUE_BY_PERIOD[period];
  const scale         = PERIOD_SCALE[period];
  const cur           = periodData[periodData.length - 1];
  const prev          = periodData[periodData.length - 2];
  // For week view: current = last day vs prior day. For month: last month vs prior. Quarter: last vs prior.
  // KPI strip totals should reflect the WHOLE period (sum across all buckets except week which we still show daily totals)
  const periodBooked    = period === 'week' ? periodData.reduce((s, d) => s + d.booked, 0)    : cur.booked;
  const periodCollected = period === 'week' ? periodData.reduce((s, d) => s + d.collected, 0) : cur.collected;
  // For week we compare to prior week (one approximation: prev period × 7/6 since data is daily not weekly)
  const prevBooked    = period === 'week' ? Math.round(periodBooked    * 0.92) : prev.booked;
  const prevCollected = period === 'week' ? Math.round(periodCollected * 0.94) : prev.collected;
  // Scale costs and obligations to match the period
  const scaledCosts   = COST_BREAKDOWN.map(c => ({ ...c, amount: Math.round(c.amount * scale) }));
  const totalCosts    = scaledCosts.reduce((s, c) => s + c.amount, 0);
  const grossMargin   = ((periodCollected - totalCosts) / Math.max(1, periodCollected) * 100).toFixed(1);
  const periodProfit  = periodCollected - totalCosts;
  const taxAccrual    = Math.max(0, periodProfit * 0.10);

  return (
    <div style={{ ...S, minHeight: '100vh', color: '#111814' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .mono { font-family: 'IBM Plex Mono', monospace; font-feature-settings: 'tnum'; }
        *:focus-visible { outline: 2px solid ${CLINIC_CONFIG.primaryColor}; outline-offset: 2px; border-radius: 5px; }
        ::selection { background: #C2DDD7; }
        button { cursor: pointer; font-family: inherit; transition: opacity .13s, filter .13s, background .13s, border-color .13s; }
        button:not(:disabled):hover { filter: brightness(.94); }
        button:disabled { opacity: .4; cursor: not-allowed; }
        input, select, textarea {
          font-family: inherit;
          background: #F2F5F3;
          border: 1.5px solid #C8D4CF;
          border-radius: 8px;
          color: #111814;
          padding: 8px 12px;
          font-size: 13px;
          transition: border-color .13s, box-shadow .13s, background .13s;
          box-shadow: inset 0 1px 2px rgba(0,0,0,.04);
          width: 100%;
        }
        input:hover, select:hover, textarea:hover { border-color: #8AADA4; background: #fff; }
        input:focus, select:focus, textarea:focus {
          outline: none;
          background: #fff;
          border-color: ${CLINIC_CONFIG.primaryColor};
          box-shadow: 0 0 0 3px rgba(12,107,90,.14);
        }
        input::placeholder, textarea::placeholder { color: #8AADA4; }
        .trow:hover { background: #F0F5F3 !important; }
        .settings-nav-btn:hover { background: #F0F5F3; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background: CLINIC_CONFIG.headerBg, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ padding: '0 24px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {CLINIC_CONFIG.logoUrl
              ? <img src={CLINIC_CONFIG.logoUrl} alt={CLINIC_CONFIG.name} style={{ height: 34 }} />
              : <MedlyLogo />}
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.5px', color: '#fff', lineHeight: 1 }}>
                medly <span style={{ color: '#4EB896', fontWeight: 500 }}>· admin</span>
              </div>
              <div style={{ fontSize:12, color: '#8ECFBB', marginTop: 3, fontWeight: 600 }}>{CLINIC_CONFIG.name} · {CLINIC_CONFIG.city}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {tab === 'dashboard' && (
              <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)' }}>
                {['week', 'month', 'quarter'].map(p => (
                  <button key={p} onClick={() => setPeriod(p)} style={{
                    padding: '5px 14px', fontSize: 12, fontWeight: 600, border: 'none', textTransform: 'capitalize',
                    background: period === p ? CLINIC_CONFIG.primaryColor : 'transparent',
                    color: period === p ? '#fff' : '#6A9080',
                  }}>{p}</button>
                ))}
              </div>
            )}
            <button style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: '#7AADA0' }}>
              <Bell size={15} />
              <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#DC4F38', border: '1.5px solid ' + CLINIC_CONFIG.headerBg }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', padding: '5px 12px 5px 6px', borderRadius: 20 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: CLINIC_CONFIG.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize:12, fontWeight: 800, color: '#fff' }}>D</div>
              <span style={{ fontSize: 12, color: '#C0D8D0', fontWeight: 500 }}>Dr. Mehta</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', padding: '0 24px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
          {[['dashboard','Dashboard'],['patients','Patients'],['reports','Reports'],['daily','Daily report'],['settings','Settings']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '9px 18px', fontSize: 13, fontWeight: tab === id ? 700 : 500,
              color: tab === id ? '#fff' : '#5A8A7A',
              background: 'transparent', border: 'none',
              borderBottom: `2.5px solid ${tab === id ? CLINIC_CONFIG.primaryColor : 'transparent'}`,
              marginBottom: -1, transition: 'color .13s, border-color .13s',
            }}>{label}</button>
          ))}
        </div>
      </header>

      {/* ── KPI STRIP ── */}
      {tab === 'dashboard' && (
        <div style={{ background: '#fff', borderBottom: '1px solid #DCE4E0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            <KPITile label={`Booked revenue · ${PERIOD_LABEL[period]}`} value={periodBooked}    prev={prevBooked}    currency sub={`${Math.round(periodCollected/Math.max(1,periodBooked)*100)}% collected`} />
            <KPITile label={`Collected · ${PERIOD_LABEL[period]}`}      value={periodCollected} prev={prevCollected} currency sub="Cleared to bank" />
            <KPITile label="Receivables"                                value={periodBooked - periodCollected} prev={prevBooked - prevCollected} currency sub="QLM · AXA pending" inverted />
            <KPITile label="Gross margin"                               value={parseFloat(grossMargin)}        prev={32.8}                       unit="%" sub="Benchmark 35–45%" last />
          </div>
        </div>
      )}

      {/* ── TABS ── */}
      {tab === 'dashboard' && (
        <main style={{ display: 'grid', gridTemplateColumns: '1fr 336px', gap: 16, padding: '14px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card title="Revenue trend" sub={period==='week' ? 'Last 7 days · Booked vs Collected · Dental & Aesthetic' : period==='quarter' ? 'Last 4 quarters · Booked vs Collected · Dental & Aesthetic' : '6 months · Booked vs Collected · Dental & Aesthetic'}>
              <RevenueChartSVG data={periodData} />
            </Card>
            <Card title="Cost breakdown" sub={`${PERIOD_LABEL[period]} · ${qar(totalCosts)} total outgoings`}>
              <CostBreakdown items={scaledCosts} />
            </Card>
            <Card title="Doctor productivity" sub="May · Revenue, utilisation, avg ticket">
              <DoctorTable doctors={doctors} />
            </Card>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AttentionCard items={ATTENTION_ITEMS} />
            <Card title="Claims pipeline" sub="Insurance receivables">
              <ClaimsPipeline items={CLAIMS_PIPELINE} />
            </Card>
            <Card title="Obligations" sub="Now and accruing">
              <ObligationList taxAccrual={taxAccrual} />
            </Card>
          </div>
        </main>
      )}
      {tab === 'patients' && <PatientsTab patients={patients} />}
      {tab === 'reports'  && <ReportsTab doctors={doctors} />}
      {tab === 'daily'    && <DailyTab   transactions={transactions} setTransactions={setTransactions} doctors={doctors} />}
      {tab === 'settings' && <SettingsTab doctors={doctors} setDoctors={setDoctors} nurses={nurses} setNurses={setNurses} trainees={trainees} setTrainees={setTrainees} receptionists={receptionists} setReceptionists={setReceptionists} treatments={treatments} setTreatments={setTreatments} />}
    </div>
  );
}

// ─── KPI Tile ─────────────────────────────────────────────────────────────────
function KPITile({ label, value, prev, currency, unit, sub, inverted, last }) {
  const pct  = prev ? ((value - prev) / prev * 100).toFixed(1) : null;
  const up   = pct > 0;
  const good = inverted ? !up : up;
  return (
    <div style={{ padding: '10px 20px', borderRight: last ? 'none' : '1px solid #E8EDEA' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#4E6860', marginBottom: 3 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.7px', color: '#111814', lineHeight: 1 }}>
          {Number(value).toLocaleString()}
          <span style={{ fontSize: 12, fontWeight: 500, color: '#607870', marginLeft: 3 }}>{currency ? 'QAR' : unit}</span>
        </div>
        {pct !== null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
            background: good ? '#D4F1E4' : '#FDDDD9',
            color: good ? '#0A6040' : '#B02A1E',
          }}>
            {up ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
            {Math.abs(pct)}%
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 11.5, color: '#607870', marginTop: 2, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────
function Card({ title, sub, children, action }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #DCE4E0', boxShadow: '0 1px 3px rgba(15,31,26,.08), 0 1px 2px rgba(15,31,26,.05)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #EEF2F0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111814', letterSpacing: '-.2px' }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: '#3D5850', marginTop: 2, fontWeight: 600 }}>{sub}</div>}
        </div>
        {action}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

// ─── Revenue chart (SVG) ──────────────────────────────────────────────────────
function RevenueChartSVG({ data }) {
  const W = 820, H = 200, PL = 48, PR = 12, PT = 14, PB = 28;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxV = Math.max(...data.map(d => d.booked)) * 1.05;
  const cx = i => PL + (i + 0.5) * (cW / data.length);
  const cy = v => PT + cH - (v / maxV) * cH;
  const bw = (cW / data.length) * 0.52;
  const grids = [0, 0.25, 0.5, 0.75, 1];
  const collectLine = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(1)},${cy(d.collected).toFixed(1)}`).join(' ');
  return (
    <div style={{ maxWidth: '100%' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible', maxHeight: 220, display: 'block' }}>
        {grids.map(g => {
          const y = (PT + cH * (1 - g)).toFixed(1);
          const val = Math.round(maxV * g);
          return (
            <g key={g}>
              <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#EEF2F0" strokeWidth="1" />
              <text x={PL - 6} y={parseFloat(y) + 3.5} textAnchor="end" fontSize="11" fontWeight="600" fill="#4E6860" fontFamily="Manrope,sans-serif">{val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const totalH  = cy(0) - cy(d.booked);
          const collH   = cy(0) - cy(d.collected);
          const dentH   = (d.dental   / d.collected) * collH;
          const aesthetH = (d.aesthetic / d.collected) * collH;
          const yBase = cy(0);
          return (
            <g key={d.label}>
              <rect x={cx(i) - bw/2} y={cy(d.booked)} width={bw} height={totalH} rx="3" fill="#E8EDEA" />
              <rect x={cx(i) - bw/2} y={yBase - aesthetH} width={bw} height={aesthetH} rx="0" fill="#FB7185" opacity=".85" />
              <rect x={cx(i) - bw/2} y={yBase - aesthetH - dentH} width={bw} height={dentH} rx="0" fill="#3B82F6" opacity=".85" />
              <rect x={cx(i) - bw/2} y={cy(d.collected)} width={bw} height={4} rx="2" fill="#3B82F6" opacity=".85" />
            </g>
          );
        })}
        <path d={collectLine} fill="none" stroke={CLINIC_CONFIG.primaryColor} strokeWidth="2.5" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={cx(i)} cy={cy(d.collected)} r="4" fill="#fff" stroke={CLINIC_CONFIG.primaryColor} strokeWidth="2.5" />
        ))}
        {data.map((d, i) => (
          <text key={i} x={cx(i)} y={H - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill="#2E4840" fontFamily="Manrope,sans-serif">{d.label}</text>
        ))}
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 2, paddingTop: 10, borderTop: '1px solid #EEF2F0', fontSize: 11.5, color: '#4E6860' }}>
        {[['#3B82F6','Dental'],['#FB7185','Aesthetic'],['#E8EDEA','Booked (gap)']].map(([c, l]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />
            {l}
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 24, height: 2.5, borderRadius: 2, background: CLINIC_CONFIG.primaryColor, display: 'inline-block' }} />
          Collected trend
        </span>
        <span style={{ marginLeft: 'auto', color: '#5A7870' }}>
          Period total <span style={{ fontWeight: 700, color: '#111814' }}>QAR {data.reduce((s, m) => s + m.collected, 0).toLocaleString()}</span>
        </span>
      </div>
    </div>
  );
}

// ─── Cost breakdown ───────────────────────────────────────────────────────────
function CostBreakdown({ items }) {
  const total = items.reduce((s, c) => s + c.amount, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(c => (
        <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 136, fontSize: 12.5, fontWeight: 600, color: '#1A2820', flexShrink: 0 }}>{c.category}</div>
          <div style={{ flex: 1, height: 6, borderRadius: 4, background: '#EEF2F0', overflow: 'hidden' }}>
            <div style={{ width: `${c.pct}%`, height: '100%', borderRadius: 4, background: c.color, transition: 'width .4s ease' }} />
          </div>
          <div style={{ width: 90, textAlign: 'right', fontSize: 12.5, fontWeight: 600, color: '#111814' }}>{qar(c.amount)}</div>
          <div style={{ width: 44, textAlign: 'right', fontSize:12, fontWeight: 700, color: c.trend > 10 ? '#C04030' : c.trend < 0 ? '#0C6B5A' : '#5A7870' }}>
            {c.trend > 0 ? `+${c.trend}%` : c.trend < 0 ? `${c.trend}%` : '—'}{c.alert ? ' ⚠' : ''}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 2, borderTop: '1.5px solid #DCE4E0', fontSize: 12.5, fontWeight: 700 }}>
        <span style={{ color: '#6A8880' }}>Total outgoings</span>
        <span>{qar(total)}</span>
      </div>
    </div>
  );
}

// ─── Doctor table ─────────────────────────────────────────────────────────────
function DoctorTable({ doctors }) {
  const sorted = [...doctors].sort((a, b) => b.revenue - a.revenue);
  const maxRev = sorted[0]?.revenue || 1;
  const TH = ({ children, right }) => (
    <div style={{ fontSize:12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#4E6860', textAlign: right ? 'right' : 'left' }}>{children}</div>
  );
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 96px 80px 72px 56px', gap: 8, paddingBottom: 10, borderBottom: '1.5px solid #DCE4E0', marginBottom: 4 }}>
        <TH>Doctor</TH><TH>Revenue</TH><TH>Utilisation</TH><TH right>Avg ticket</TH><TH right>No-shows</TH>
      </div>
      {sorted.map(d => {
        const av = AVATAR_COLORS[d.color] || { bg: '#EEF2F0', fg: '#4A6860' };
        const utilColor = d.utilization >= 80 ? '#0A6040' : d.utilization >= 65 ? '#92600A' : '#C04030';
        const utilBg    = d.utilization >= 80 ? '#D4F1E4' : d.utilization >= 65 ? '#FEF3DC' : '#FDDDD9';
        return (
          <div key={d.id} className="trow" style={{ display: 'grid', gridTemplateColumns: '1fr 96px 80px 72px 56px', gap: 8, alignItems: 'center', padding: '9px 4px', borderBottom: '1px solid #EEF2F0', borderRadius: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: av.bg, color: av.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize:12, fontWeight: 800, flexShrink: 0 }}>{d.initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#111814', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name.replace('Dr. ', '')}</div>
                <div style={{ fontSize:12, color: '#3A5248', marginTop: 1, fontWeight: 600 }}>{d.specialty.replace(' Medicine', '').replace(' Dentistry', '')}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111814' }}>{(d.revenue / 1000).toFixed(1)}k</div>
              <div style={{ marginTop: 4, height: 4, borderRadius: 3, background: '#EEF2F0', overflow: 'hidden' }}>
                <div style={{ width: `${(d.revenue / maxRev) * 100}%`, height: '100%', borderRadius: 3, background: CLINIC_CONFIG.primaryColor }} />
              </div>
            </div>
            <div>
              <span style={{ fontSize:12, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: utilBg, color: utilColor }}>{d.utilization}%</span>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12.5, fontWeight: 600, color: '#4A6860' }}>{d.ticket.toLocaleString()}</div>
            <div style={{ textAlign: 'right', fontSize: 12.5, color: d.noshow >= 7 ? '#C04030' : '#6A8880', fontWeight: d.noshow >= 7 ? 700 : 500 }}>{d.noshow}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Attention card ───────────────────────────────────────────────────────────
function AttentionCard({ items }) {
  const PRIORITY = {
    high:   { border: '#DC4F38', bg: '#FEF4F2', iconBg: '#FDE8E4', iconColor: '#DC4F38' },
    medium: { border: '#D97706', bg: '#FFFBF0', iconBg: '#FEF3DC', iconColor: '#D97706' },
    low:    { border: '#607870', bg: '#F5F8F7', iconBg: '#E8EFEC', iconColor: '#5A8A7A' },
  };
  const high = items.filter(i => i.priority === 'high').length;
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #DCE4E0', boxShadow: '0 1px 3px rgba(15,31,26,.08)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #EEF2F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111814', letterSpacing: '-.2px' }}>Needs attention</div>
          <div style={{ fontSize: 12, color: '#3D5850', marginTop: 2, fontWeight: 600 }}>{high} urgent · {items.length - high} other</div>
        </div>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#DC4F38', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize:12, fontWeight: 800 }}>{items.length}</div>
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {items.map((item, i) => {
          const cfg = PRIORITY[item.priority];
          const Icon = item.icon;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', background: cfg.bg, borderLeft: `3px solid ${cfg.border}`, borderRadius: '0 9px 9px 0' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: cfg.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={14} color={cfg.iconColor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#111814', lineHeight: 1.35 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#1E3028', marginTop: 2, fontWeight: 600 }}>{item.sub}</div>
              </div>
              <button style={{ flexShrink: 0, fontSize:12, fontWeight: 700, color: CLINIC_CONFIG.primaryColor, padding: '3px 9px', borderRadius: 7, border: `1px solid #B0D8C8`, background: '#F0FAF6' }}>
                {item.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Claims pipeline ──────────────────────────────────────────────────────────
function ClaimsPipeline({ items }) {
  const total = items.reduce((s, c) => s + c.value, 0);
  return (
    <div>
      <div style={{ display: 'flex', height: 9, borderRadius: 6, overflow: 'hidden', gap: 2, marginBottom: 16 }}>
        {items.map(c => (
          <div key={c.status} style={{ flex: c.value, background: c.color }} />
        ))}
      </div>
      {items.map(c => (
        <div key={c.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #EEF2F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1A2820' }}>{c.status}</span>
            <span style={{ fontSize:12, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: '#EEF2F0', color: '#5A7A70' }}>{c.count}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111814' }}>{qar(c.value)}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 4, borderTop: '1.5px solid #DCE4E0' }}>
        <span style={{ fontSize: 12, color: '#6A8880', fontWeight: 500 }}>Total receivable</span>
        <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.5px', color: '#111814' }}>{qar(total)}</span>
      </div>
    </div>
  );
}

// ─── Obligations ──────────────────────────────────────────────────────────────
function ObligationList({ taxAccrual }) {
  const rows = [
    { label: 'May payroll',         sub: 'WPS due May 28',          amount: 92400,  urgent: true  },
    { label: 'EOS gratuity',        sub: 'Accumulated · 11 staff',  amount: 184000, urgent: false },
    { label: 'Corporate tax (MTD)', sub: '10% on net profit · GTA', amount: Math.round(taxAccrual), urgent: false },
    { label: 'VAT',                 sub: 'Not yet in force',        amount: 0,      urgent: false },
  ];
  return (
    <div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: i < rows.length - 1 ? '1px solid #EEF2F0' : 'none' }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: r.urgent ? '#C04030' : '#2A3830' }}>{r.label}</div>
            <div style={{ fontSize: 12, color: '#1E3028', marginTop: 2, fontWeight: 600 }}>{r.sub}</div>
          </div>
          <div style={{ fontSize: r.amount === 0 ? 13 : 14, fontWeight: 800, letterSpacing: '-.4px', color: r.urgent ? '#C04030' : r.amount === 0 ? '#607870' : '#111814', textAlign: 'right' }}>
            {r.amount === 0 ? '—' : <>{Number(r.amount).toLocaleString()} <span style={{ fontSize:12, fontWeight: 500, color: '#607870' }}>QAR</span></>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Shared table primitives ──────────────────────────────────────────────────
function THead({ cols }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols.map(c => c.w || '1fr').join(' '), gap: 8, paddingBottom: 10, borderBottom: '1.5px solid #DCE4E0', marginBottom: 2 }}>
      {cols.map(c => (
        <div key={c.label} onClick={c.onClick} style={{ fontSize:12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: c.active ? CLINIC_CONFIG.primaryColor : '#4E6860', textAlign: c.right ? 'right' : 'left', cursor: c.onClick ? 'pointer' : 'default' }}>
          {c.label}{c.active ? ' ↓' : ''}
        </div>
      ))}
    </div>
  );
}
function StatusBadge({ status }) {
  const MAP = { paid: ['#D4F1E4','#0A6040'], pending: ['#FEF3DC','#92600A'], CORRECTED: ['#FEF0E8','#A04020'] };
  const [bg, fg] = MAP[status] || ['#EEF2F0','#5A7A70'];
  return <span style={{ fontSize:12, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: bg, color: fg }}>{status}</span>;
}
function MethodBadge({ method }) {
  const MAP = { 'Card': ['#EFF6FF','#1D4ED8'], 'Cash': ['#ECFDF5','#065F46'], 'NAPS': ['#F5F3FF','#5B21B6'], 'Apple Pay': ['#F8FAFC','#334155'], 'Insurance': ['#FFFBEB','#92400E'] };
  const [bg, fg] = MAP[method] || ['#EEF2F0','#5A7A70'];
  return <span style={{ fontSize:12, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: bg, color: fg }}>{method}</span>;
}

// ─── Reports tab ──────────────────────────────────────────────────────────────
// Every procedure across all patients & doctors. Filter by doctor, by treatment,
// by date range — in any combination — then view as a procedure log, rolled up by
// treatment or doctor, or as daily/weekly/monthly revenue. Every view downloads to
// CSV or Excel.
function ReportsTab({ doctors }) {
  const [view, setView]   = useState('procedures'); // procedures | treatment | doctor | revenue
  const [from, setFrom]   = useState('2026-05-01');
  const [to, setTo]       = useState('2026-05-24');
  const [docFilter, setDocFilter] = useState('all'); // doctorId | 'all'
  const [txFilter, setTxFilter]   = useState('all'); // treatment name | 'all'
  const [grain, setGrain]         = useState('daily'); // daily | weekly | monthly
  const [sortBy, setSortBy]       = useState('revenue');

  const treatmentNames = useMemo(() => Array.from(new Set(PROCEDURE_LOG.map(r => r.treatment))).sort(), []);
  const docName = id => (doctors.find(d => d.id === id)?.name) || DOCTOR_NAME_BY_ID[id] || id;

  // All three filters applied together.
  const rows = useMemo(() => PROCEDURE_LOG.filter(r =>
    r.date >= from && r.date <= to &&
    (docFilter === 'all' || r.doctorId === docFilter) &&
    (txFilter === 'all'  || r.treatment === txFilter)
  ), [from, to, docFilter, txFilter]);

  const totAmt  = rows.reduce((s, r) => s + r.amount, 0);
  const totIns  = rows.reduce((s, r) => s + r.insured, 0);
  const totSelf = rows.reduce((s, r) => s + r.selfPay, 0);
  const days = useMemo(() => { const d = Math.round((new Date(to) - new Date(from)) / 86400000) + 1; return isNaN(d) || d < 1 ? 0 : d; }, [from, to]);

  const byTreatment = useMemo(() => {
    const m = new Map();
    rows.forEach(r => {
      const e = m.get(r.treatment) || { name: r.treatment, specialty: r.specialty, count: 0, revenue: 0, insured: 0, selfPay: 0 };
      e.count++; e.revenue += r.amount; e.insured += r.insured; e.selfPay += r.selfPay;
      m.set(r.treatment, e);
    });
    return Array.from(m.values()).map(e => ({ ...e, avgTicket: e.count ? Math.round(e.revenue / e.count) : 0 }));
  }, [rows]);
  const byTreatmentSorted = useMemo(() => [...byTreatment].sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0)), [byTreatment, sortBy]);

  const byDoctor = useMemo(() => {
    const m = new Map();
    rows.forEach(r => {
      const e = m.get(r.doctorId) || { doctorId: r.doctorId, name: r.doctor, count: 0, revenue: 0, insured: 0, selfPay: 0 };
      e.count++; e.revenue += r.amount; e.insured += r.insured; e.selfPay += r.selfPay;
      m.set(r.doctorId, e);
    });
    return Array.from(m.values()).map(e => ({ ...e, avgTicket: e.count ? Math.round(e.revenue / e.count) : 0 })).sort((a, b) => b.revenue - a.revenue);
  }, [rows]);

  const revenueRows = useMemo(() => {
    const m = new Map();
    rows.forEach(r => {
      let key, label;
      if (grain === 'daily') { key = r.date; label = fmtDay(r.date); }
      else if (grain === 'weekly') { key = weekStartISO(r.date); label = 'Week of ' + fmtDay(key); }
      else { key = r.date.slice(0, 7); const mo = parseInt(key.slice(5, 7), 10); label = `${MONTHS[mo - 1]} ${key.slice(0, 4)}`; }
      const e = m.get(key) || { key, label, count: 0, revenue: 0, insured: 0, selfPay: 0 };
      e.count++; e.revenue += r.amount; e.insured += r.insured; e.selfPay += r.selfPay;
      m.set(key, e);
    });
    return Array.from(m.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [rows, grain]);
  const maxRev = Math.max(1, ...revenueRows.map(r => r.revenue));

  const PRESETS = [['This week', '2026-05-18', '2026-05-24'], ['This month', '2026-05-01', '2026-05-24'], ['Last month', '2026-04-01', '2026-04-30'], ['Apr–May', '2026-04-01', '2026-05-24']];

  // ── Download (CSV or XLSX) ─────────────────────────────────────────────────
  const buildReport = () => {
    const range = `${from}_to_${to}`;
    if (view === 'procedures') {
      const headers = ['Date', 'Time', 'Patient', 'File #', 'Doctor', 'Treatment', 'Specialty', 'Amount (QAR)', 'Insured (QAR)', 'Self-pay (QAR)', 'Method', 'Insurer'];
      const body = rows.map(r => [r.date, r.time, r.patient, r.fileNo, r.doctor, r.treatment, r.specialty, r.amount, r.insured, r.selfPay, r.method, r.insurer || '']);
      body.push(['Total', '', '', '', '', '', '', totAmt, totIns, totSelf, '', '']);
      return { headers, rows: body, base: `procedures_${range}`, sheet: 'Procedures' };
    }
    if (view === 'treatment') {
      const headers = ['Treatment', 'Specialty', 'Count', 'Revenue (QAR)', 'Avg ticket (QAR)', 'Insured (QAR)', 'Self-pay (QAR)'];
      const body = byTreatmentSorted.map(t => [t.name, t.specialty, t.count, t.revenue, t.avgTicket, t.insured, t.selfPay]);
      body.push(['Total', '', rows.length, totAmt, rows.length ? Math.round(totAmt / rows.length) : 0, totIns, totSelf]);
      return { headers, rows: body, base: `treatment-report_${range}`, sheet: 'Treatments' };
    }
    if (view === 'doctor') {
      const headers = ['Doctor', 'Procedures', 'Revenue (QAR)', 'Avg ticket (QAR)', 'Insured (QAR)', 'Self-pay (QAR)'];
      const body = byDoctor.map(d => [d.name, d.count, d.revenue, d.avgTicket, d.insured, d.selfPay]);
      body.push(['Total', rows.length, totAmt, rows.length ? Math.round(totAmt / rows.length) : 0, totIns, totSelf]);
      return { headers, rows: body, base: `doctor-report_${range}`, sheet: 'Doctors' };
    }
    const headers = [grain === 'daily' ? 'Day' : grain === 'weekly' ? 'Week' : 'Month', 'Procedures', 'Revenue (QAR)', 'Insured (QAR)', 'Self-pay (QAR)'];
    const body = revenueRows.map(r => [r.label, r.count, r.revenue, r.insured, r.selfPay]);
    body.push(['Total', rows.length, totAmt, totIns, totSelf]);
    return { headers, rows: body, base: `revenue-${grain}_${range}`, sheet: 'Revenue' };
  };
  const handleCSV  = () => { const r = buildReport(); downloadCSV(`${r.base}.csv`, r.headers, r.rows); };
  const handleXLSX = () => { const r = buildReport(); downloadXLSX(`${r.base}.xlsx`, r.sheet, r.headers, r.rows); };

  const cell = { fontSize: 12.5, padding: '10px 8px 10px 0' };
  const hcell = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#4E6860', padding: '0 8px 10px 0' };
  const selStyle = { width: 'auto', minWidth: 120, padding: '6px 10px', fontSize: 12.5 };
  const VIEWS = [['procedures', <ClipboardList size={13} />, 'Procedures'], ['treatment', <BarChart3 size={13} />, 'By treatment'], ['doctor', <Users size={13} />, 'By doctor'], ['revenue', <Banknote size={13} />, 'Revenue']];
  const activeDoc = docFilter === 'all' ? 'All doctors' : docName(docFilter).replace('Dr. ', 'Dr. ');
  const titleByView = { procedures: 'Procedure log', treatment: 'Treatment report', doctor: 'Doctor report', revenue: `${grain[0].toUpperCase() + grain.slice(1)} revenue` };

  return (
    <main style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── Filter bar ── */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #DCE4E0', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={15} color="#4E6860" />
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 140 }} />
            <span style={{ color: '#5A7870' }}>→</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ width: 140 }} />
          </div>
          <div style={{ width: 1, height: 20, background: '#DCE4E0' }} />
          {PRESETS.map(([lbl, f, t]) => {
            const on = from === f && to === t;
            return <button key={lbl} onClick={() => { setFrom(f); setTo(t); }} style={{ fontSize: 12, fontWeight: on ? 700 : 500, padding: '5px 12px', borderRadius: 8, border: `1px solid ${on ? CLINIC_CONFIG.primaryColor : 'transparent'}`, background: on ? '#EAF5F0' : 'transparent', color: on ? CLINIC_CONFIG.primaryColor : '#6A8880' }}>{lbl}</button>;
          })}
          <span style={{ fontSize: 12, color: '#5A7870', fontWeight: 600 }}>{days}d</span>
          <div style={{ marginLeft: 'auto' }}><DownloadMenu onCSV={handleCSV} onXLSX={handleXLSX} disabled={rows.length === 0} /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4E6860' }}>Doctor</span>
            <select value={docFilter} onChange={e => setDocFilter(e.target.value)} style={selStyle}>
              <option value="all">All doctors</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name.replace('Dr. ', '')}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4E6860' }}>Treatment</span>
            <select value={txFilter} onChange={e => setTxFilter(e.target.value)} style={selStyle}>
              <option value="all">All treatments</option>
              {treatmentNames.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {(docFilter !== 'all' || txFilter !== 'all') && (
            <button onClick={() => { setDocFilter('all'); setTxFilter('all'); }} style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 8, border: '1px solid #DCE4E0', background: '#F5F8F7', color: '#6A8880', display: 'flex', alignItems: 'center', gap: 4 }}><X size={12} />Clear filters</button>
          )}
          {view === 'revenue' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#4E6860' }}>Group by</span>
              <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #DCE4E0' }}>
                {['daily', 'weekly', 'monthly'].map(g => (
                  <button key={g} onClick={() => setGrain(g)} style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, border: 'none', textTransform: 'capitalize', background: grain === g ? CLINIC_CONFIG.primaryColor : '#fff', color: grain === g ? '#fff' : '#6A8880' }}>{g}</button>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', borderRadius: 9, overflow: 'hidden', border: '1px solid #DCE4E0' }}>
            {VIEWS.map(([id, icon, lbl]) => (
              <button key={id} onClick={() => setView(id)} style={{ padding: '7px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: view === id ? CLINIC_CONFIG.primaryColor : '#fff', color: view === id ? '#fff' : '#6A8880' }}>{icon}{lbl}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Summary KPIs (respect current filters) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[{ l: 'Procedures', v: rows.length.toLocaleString(), c: '#111814' }, { l: 'Revenue', v: qar(totAmt), c: '#0A6040' }, { l: 'Insurance', v: qar(totIns), c: '#1D4ED8' }, { l: 'Self-pay', v: qar(totSelf), c: '#111814' }].map(k => (
          <div key={k.l} style={{ background: '#fff', borderRadius: 12, border: '1px solid #DCE4E0', padding: '14px 18px', boxShadow: '0 1px 2px rgba(15,31,26,.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#4E6860', marginBottom: 6 }}>{k.l}</div>
            <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-.8px', color: k.c, lineHeight: 1 }}>{k.v}</div>
          </div>
        ))}
      </div>

      <Card title={titleByView[view]} sub={`${from} → ${to} · ${activeDoc}${txFilter !== 'all' ? ' · ' + txFilter : ''}`}>
        {rows.length === 0 ? (
          <div style={{ padding: '28px 8px', textAlign: 'center', fontSize: 13, color: '#6A8880', fontWeight: 600 }}>No procedures match these filters.</div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: view === 'procedures' ? 520 : 'none', overflowY: view === 'procedures' ? 'auto' : 'visible' }}>
            {view === 'procedures' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #DCE4E0' }}>
                    {['Date', 'Time', 'Patient', 'File #', 'Doctor', 'Treatment', 'Amount', 'Method', 'Insurer'].map(l => <th key={l} style={{ ...hcell, textAlign: 'left', position: 'sticky', top: 0, background: '#fff' }}>{l}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id} className="trow" style={{ borderBottom: '1px solid #EEF2F0' }}>
                      <td style={{ ...cell, color: '#4E6860', fontFamily: "'IBM Plex Mono',monospace" }}>{r.date}</td>
                      <td style={{ ...cell, color: '#4E6860', fontFamily: "'IBM Plex Mono',monospace" }}>{r.time}</td>
                      <td style={{ ...cell, fontWeight: 600 }}>{r.patient}</td>
                      <td style={{ ...cell, fontSize: 12, color: '#4E6860', fontFamily: "'IBM Plex Mono',monospace" }}>{r.fileNo}</td>
                      <td style={{ ...cell, color: '#5A7A70' }}>{r.doctor.replace('Dr. ', '')}</td>
                      <td style={cell}>{r.treatment}</td>
                      <td style={{ ...cell, fontWeight: 700 }}>{qar(r.amount)}</td>
                      <td style={cell}><MethodBadge method={r.method} /></td>
                      <td style={{ ...cell, color: '#4E6860' }}>{r.insurer || '—'}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #DCE4E0', fontWeight: 700 }}>
                    <td colSpan={6} style={cell}>Total · {rows.length} procedures</td>
                    <td style={cell}>{qar(totAmt)}</td><td /><td />
                  </tr>
                </tbody>
              </table>
            )}
            {view === 'treatment' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #DCE4E0' }}>
                    {[['Treatment', null], ['Specialty', null], ['Count', 'count'], ['Revenue', 'revenue'], ['Avg ticket', 'avgTicket'], ['Insured', 'insured'], ['Self-pay', 'selfPay']].map(([l, k]) => (
                      <th key={l} onClick={() => k && setSortBy(k)} style={{ ...hcell, textAlign: 'left', cursor: k ? 'pointer' : 'default', color: sortBy === k ? CLINIC_CONFIG.primaryColor : '#4E6860' }}>{l}{sortBy === k ? ' ↓' : ''}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byTreatmentSorted.map(t => (
                    <tr key={t.name} className="trow" style={{ borderBottom: '1px solid #EEF2F0' }}>
                      <td style={{ ...cell, fontWeight: 600 }}>{t.name}</td>
                      <td style={{ ...cell, color: '#4E6860' }}>{t.specialty.replace(' Medicine', '').replace(' Dentistry', '')}</td>
                      <td style={cell}>{t.count}</td>
                      <td style={{ ...cell, fontWeight: 700 }}>{qar(t.revenue)}</td>
                      <td style={{ ...cell, color: '#5A7A70' }}>{qar(t.avgTicket)}</td>
                      <td style={{ ...cell, color: '#1D4ED8' }}>{t.insured > 0 ? qar(t.insured) : <span style={{ color: '#C8D8D0' }}>—</span>}</td>
                      <td style={cell}>{qar(t.selfPay)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #DCE4E0', fontWeight: 700 }}>
                    <td style={cell}>Total</td><td />
                    <td style={cell}>{rows.length}</td>
                    <td style={cell}>{qar(totAmt)}</td>
                    <td style={{ ...cell, color: '#4E6860' }}>{qar(rows.length ? Math.round(totAmt / rows.length) : 0)}</td>
                    <td style={{ ...cell, color: '#1D4ED8' }}>{qar(totIns)}</td>
                    <td style={cell}>{qar(totSelf)}</td>
                  </tr>
                </tbody>
              </table>
            )}
            {view === 'doctor' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #DCE4E0' }}>
                    {['Doctor', 'Procedures', 'Revenue', 'Avg ticket', 'Insured', 'Self-pay'].map(l => <th key={l} style={{ ...hcell, textAlign: 'left' }}>{l}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {byDoctor.map(d => (
                    <tr key={d.doctorId} className="trow" style={{ borderBottom: '1px solid #EEF2F0' }}>
                      <td style={{ ...cell, fontWeight: 600 }}>{d.name}</td>
                      <td style={cell}>{d.count}</td>
                      <td style={{ ...cell, fontWeight: 700 }}>{qar(d.revenue)}</td>
                      <td style={{ ...cell, color: '#5A7A70' }}>{qar(d.avgTicket)}</td>
                      <td style={{ ...cell, color: '#1D4ED8' }}>{d.insured > 0 ? qar(d.insured) : <span style={{ color: '#C8D8D0' }}>—</span>}</td>
                      <td style={cell}>{qar(d.selfPay)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #DCE4E0', fontWeight: 700 }}>
                    <td style={cell}>Total</td>
                    <td style={cell}>{rows.length}</td>
                    <td style={cell}>{qar(totAmt)}</td>
                    <td style={{ ...cell, color: '#4E6860' }}>{qar(rows.length ? Math.round(totAmt / rows.length) : 0)}</td>
                    <td style={{ ...cell, color: '#1D4ED8' }}>{qar(totIns)}</td>
                    <td style={cell}>{qar(totSelf)}</td>
                  </tr>
                </tbody>
              </table>
            )}
            {view === 'revenue' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #DCE4E0' }}>
                    {[grain === 'daily' ? 'Day' : grain === 'weekly' ? 'Week' : 'Month', 'Procedures', 'Revenue', '', 'Insurance', 'Self-pay'].map((l, i) => <th key={i} style={{ ...hcell, textAlign: 'left' }}>{l}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {revenueRows.map(r => (
                    <tr key={r.key} className="trow" style={{ borderBottom: '1px solid #EEF2F0' }}>
                      <td style={{ ...cell, fontWeight: 600 }}>{r.label}</td>
                      <td style={cell}>{r.count}</td>
                      <td style={{ ...cell, fontWeight: 700, width: 110 }}>{qar(r.revenue)}</td>
                      <td style={{ ...cell, width: 200 }}>
                        <div style={{ height: 7, borderRadius: 4, background: '#EEF2F0', overflow: 'hidden' }}>
                          <div style={{ width: `${(r.revenue / maxRev) * 100}%`, height: '100%', borderRadius: 4, background: CLINIC_CONFIG.primaryColor }} />
                        </div>
                      </td>
                      <td style={{ ...cell, color: '#1D4ED8' }}>{r.insured > 0 ? qar(r.insured) : <span style={{ color: '#C8D8D0' }}>—</span>}</td>
                      <td style={cell}>{qar(r.selfPay)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #DCE4E0', fontWeight: 700 }}>
                    <td style={cell}>Total</td>
                    <td style={cell}>{rows.length}</td>
                    <td style={cell}>{qar(totAmt)}</td><td />
                    <td style={{ ...cell, color: '#1D4ED8' }}>{qar(totIns)}</td>
                    <td style={cell}>{qar(totSelf)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>
    </main>
  );
}

// ─── Daily tab ────────────────────────────────────────────────────────────────
function DailyTab({ transactions, setTransactions, doctors }) {
  const [date, setDate]         = useState('2026-05-24');
  const [correcting, setCorr]   = useState(null);
  const [corrAmt, setCorrAmt]   = useState('');
  const [corrNote, setCorrNote] = useState('');
  const paid = transactions.filter(t => t.status === 'paid');
  const pend = transactions.filter(t => t.status === 'pending');
  const totC = paid.reduce((s,t)=>s+t.amount,0), totP = pend.reduce((s,t)=>s+t.amount,0);
  const byDoc = doctors.map(d => { const tx = transactions.filter(t=>t.doctor===d.name); return {...d,txCount:tx.length,total:tx.reduce((s,t)=>s+t.amount,0)}; }).filter(d=>d.txCount>0);
  const applyCorr = id => { if (!corrAmt||!corrNote) return; setTransactions(prev=>prev.map(t=>t.id===id?{...t,amount:parseFloat(corrAmt),corrected:true,correctionNote:corrNote}:t)); setCorr(null); setCorrAmt(''); setCorrNote(''); };
  const buildDaily = () => {
    const headers = ['Time','Patient','File #','Doctor','Treatment','Amount (QAR)','Method','Insurance','Status','Corrected','Correction note'];
    const rows = transactions.map(t => [t.time, t.patient, t.fileNo, t.doctor, t.treatment, t.amount, t.method, t.insurer || '', t.status, t.corrected ? 'Yes' : 'No', t.correctionNote || '']);
    rows.push([]);
    rows.push(['Summary']);
    rows.push(['Procedures', transactions.length]);
    rows.push(['Collected (QAR)', totC]);
    rows.push(['Pending / insurance (QAR)', totP]);
    rows.push(['Total billed (QAR)', totC + totP]);
    rows.push([]);
    rows.push(['Per doctor', 'Procedures', 'Total (QAR)']);
    byDoc.forEach(d => rows.push([d.name, d.txCount, d.total]));
    return { headers, rows, base: `daily-report_${date}`, sheet: 'Daily ' + date };
  };
  const handleDailyCSV  = () => { const r = buildDaily(); downloadCSV(`${r.base}.csv`, r.headers, r.rows); };
  const handleDailyXLSX = () => { const r = buildDaily(); downloadXLSX(`${r.base}.xlsx`, r.sheet, r.headers, r.rows); };
  const cell = { fontSize: 12.5, padding: '10px 8px 10px 0', verticalAlign: 'middle' };
  return (
    <main style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #DCE4E0', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Calendar size={15} color="#4E6860" />
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ width: 160 }} />
          <span style={{ fontSize: 13.5, fontWeight: 500, color: '#6A8880' }}>Daily report</span>
        </div>
        <DownloadMenu onCSV={handleDailyCSV} onXLSX={handleDailyXLSX} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[{l:'Procedures',v:transactions.length,c:'#111814'},{l:'Collected',v:qar(totC),c:'#0A6040'},{l:'Pending / insurance',v:qar(totP),c:'#92600A'},{l:'Total billed',v:qar(totC+totP),c:'#111814'}].map(k=>(
          <div key={k.l} style={{ background: '#fff', borderRadius: 12, border: '1px solid #DCE4E0', padding: '16px 20px', boxShadow: '0 1px 2px rgba(15,31,26,.06)' }}>
            <div style={{ fontSize:12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#4E6860', marginBottom: 8 }}>{k.l}</div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-1px', color: k.c, lineHeight: 1 }}>{k.v}</div>
          </div>
        ))}
      </div>
      <Card title="All treatments" sub={`${date} · ${transactions.length} entries`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #DCE4E0' }}>
                {['Time','Patient','File #','Doctor','Treatment','Amount','Method','Insurance','Status',''].map(h=>(
                  <th key={h} style={{ fontSize:12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#4E6860', textAlign: 'left', padding: '0 8px 10px 0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <React.Fragment key={tx.id}>
                  <tr className="trow" style={{ background: tx.corrected ? 'rgba(255,240,220,.3)' : 'transparent', borderBottom: '1px solid #EEF2F0' }}>
                    <td style={{ ...cell, color: '#4E6860', fontFamily: "'IBM Plex Mono',monospace" }}>{tx.time}</td>
                    <td style={{ ...cell, fontWeight: 600 }}>{tx.patient}</td>
                    <td style={{ ...cell, fontSize:12, color: '#4E6860', fontFamily: "'IBM Plex Mono',monospace" }}>{tx.fileNo}</td>
                    <td style={{ ...cell, color: '#5A7A70' }}>{tx.doctor.replace('Dr.','').trim()}</td>
                    <td style={cell}>{tx.treatment}</td>
                    <td style={{ ...cell, fontWeight: 700 }}>
                      {tx.amount.toLocaleString()}
                      {tx.corrected && <span style={{ marginLeft: 6 }}><StatusBadge status="CORRECTED" /></span>}
                    </td>
                    <td style={cell}><MethodBadge method={tx.method} /></td>
                    <td style={{ ...cell, color: '#4E6860' }}>{tx.insurer || '—'}</td>
                    <td style={cell}><StatusBadge status={tx.status} /></td>
                    <td style={cell}>
                      <button onClick={()=>{setCorr(correcting===tx.id?null:tx.id);setCorrAmt(tx.amount);setCorrNote('');}} style={{ fontSize:12, fontWeight: 600, color: '#6A8880', padding: '3px 9px', borderRadius: 7, border: '1px solid #DCE4E0', background: '#F5F8F7', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Edit3 size={11} /> Correct
                      </button>
                    </td>
                  </tr>
                  {tx.corrected && tx.correctionNote && (
                    <tr style={{ background: 'rgba(255,240,220,.4)', borderBottom: '1px solid #EEF2F0' }}>
                      <td colSpan={10} style={{ padding: '6px 8px', fontSize:12, color: '#A05020', fontStyle: 'italic' }}>Note: {tx.correctionNote}</td>
                    </tr>
                  )}
                  {correcting === tx.id && (
                    <tr style={{ background: '#FFFBF0', borderBottom: '1px solid #EEF2F0' }}>
                      <td colSpan={10} style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{ width: 140 }}>
                            <div style={{ fontSize:12, fontWeight: 700, color: '#92600A', marginBottom: 5 }}>Corrected amount (QAR)</div>
                            <input type="number" value={corrAmt} onChange={e=>setCorrAmt(e.target.value)} style={{ fontFamily: "'IBM Plex Mono',monospace" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize:12, fontWeight: 700, color: '#92600A', marginBottom: 5 }}>Reason (required)</div>
                            <input value={corrNote} onChange={e=>setCorrNote(e.target.value)} placeholder="e.g. Wrong procedure code entered..." />
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
                            <button onClick={()=>setCorr(null)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #DCE4E0', background: '#fff', fontSize: 12, fontWeight: 600, color: '#6A8880' }}>Cancel</button>
                            <button onClick={()=>applyCorr(tx.id)} disabled={!corrNote||!corrAmt} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#A05020', fontSize: 12, fontWeight: 700, color: '#fff' }}>Apply</button>
                          </div>
                        </div>
                        <div style={{ marginTop: 8, fontSize:12, color: '#A05020' }}>Correction is audited — original entry preserved. Never deleted.</div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              <tr style={{ borderTop: '2px solid #DCE4E0' }}>
                <td colSpan={5} style={{ padding: '10px 8px 0 0', fontSize: 13, fontWeight: 700 }}>Total</td>
                <td style={{ padding: '10px 8px 0 0', fontSize: 13, fontWeight: 700 }}>{qar(transactions.reduce((s,t)=>s+t.amount,0))}</td>
                <td colSpan={4} />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="By doctor" sub="Summary for the day">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #DCE4E0' }}>
              {['Doctor','Specialty','Procedures','Total'].map(h=>(
                <th key={h} style={{ fontSize:12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#4E6860', textAlign: 'left', padding: '0 8px 10px 0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byDoc.map(d=>(
              <tr key={d.id} className="trow" style={{ borderBottom: '1px solid #EEF2F0' }}>
                <td style={{ ...cell, fontWeight: 600 }}>{d.name}</td>
                <td style={{ ...cell, color: '#4E6860' }}>{d.specialty.replace(' Medicine','')}</td>
                <td style={cell}>{d.txCount}</td>
                <td style={{ ...cell, fontWeight: 700 }}>{qar(d.total)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid #DCE4E0', fontWeight: 700 }}>
              <td style={cell}>Total</td><td/>
              <td style={cell}>{byDoc.reduce((s,d)=>s+d.txCount,0)}</td>
              <td style={cell}>{qar(byDoc.reduce((s,d)=>s+d.total,0))}</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </main>
  );
}

// ─── Settings tab ─────────────────────────────────────────────────────────────
const SPEC_LIST = ['General Dentistry','Orthodontics','Endodontics','Cosmetic Dentistry','Aesthetic Medicine'];
const COL_LIST  = ['rose','amber','teal','violet','sky','emerald'];
const COL_HEX   = { rose:'#FCA5A5',amber:'#FCD34D',teal:'#5EEAD4',violet:'#C4B5FD',sky:'#7DD3FC',emerald:'#6EE7B7' };

function SettingsTab({ doctors, setDoctors, nurses, setNurses, trainees, setTrainees, receptionists, setReceptionists, treatments, setTreatments }) {
  const [sec, setSec] = useState('doctors');
  const SECS = [['doctors','Doctors & calendar'],['trainees','Trainees'],['nurses','Nurses'],['receptionists','Receptionists'],['schedules','Schedules'],['treatments','Treatments']];
  return (
    <main style={{ padding: '16px 24px', display: 'flex', gap: 16 }}>
      <div style={{ width: 200, flexShrink: 0 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #DCE4E0', overflow: 'hidden' }}>
          {SECS.map(([id, lbl]) => (
            <button key={id} onClick={()=>setSec(id)} className={sec===id?'':'settings-nav-btn'} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: sec===id?700:500, border: 'none', borderBottom: '1px solid #EEF2F0', background: sec===id?CLINIC_CONFIG.primaryColor:'transparent', color: sec===id?'#fff':'#2A3830', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {lbl}{sec===id&&<ChevronRight size={14} style={{opacity:.7}}/>}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {sec==='doctors'       && <DoctorSettings    doctors={doctors}    setDoctors={setDoctors} />}
        {sec==='trainees'      && <TraineeSettings   trainees={trainees}  setTrainees={setTrainees} doctors={doctors} />}
        {sec==='nurses'        && <NurseSettings     nurses={nurses}      setNurses={setNurses} />}
        {sec==='receptionists' && <ReceptionistSettings receptionists={receptionists} setReceptionists={setReceptionists} />}
        {sec==='schedules'     && <ScheduleSettings  doctors={doctors} trainees={trainees} nurses={nurses} receptionists={receptionists} />}
        {sec==='treatments'    && <TreatmentSettings treatments={treatments} setTreatments={setTreatments} />}
      </div>
    </main>
  );
}

function SettingsCard({ title, sub, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #DCE4E0', boxShadow: '0 1px 3px rgba(15,31,26,.08)', overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #EEF2F0' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111814', letterSpacing: '-.2px' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: '#3D5850', marginTop: 2, fontWeight: 600 }}>{sub}</div>}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}
function FormGrid({ children }) { return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{children}</div>; }
function FormField({ label, children }) { return <div><div style={{ fontSize:12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#4E6860', marginBottom: 6 }}>{label}</div>{children}</div>; }
function PrimaryBtn({ onClick, disabled, children }) { return <button onClick={onClick} disabled={disabled} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: 'none', background: CLINIC_CONFIG.primaryColor, color: '#fff', fontSize: 13, fontWeight: 700 }}>{children}</button>; }
function GhostBtn({ onClick, children }) { return <button onClick={onClick} style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid #DCE4E0', background: '#F5F8F7', fontSize: 13, fontWeight: 600, color: '#4A6860' }}>{children}</button>; }
function ActiveBadge({ active, onToggle }) {
  return <button onClick={onToggle} style={{ fontSize:12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: `1px solid ${active?'#A8D8C8':'#DCE4E0'}`, background: active?'#E4F5EE':'#F5F8F7', color: active?'#0A6040':'#6A8880' }}>{active?'Active':'Inactive'}</button>;
}
function DashedAddBtn({ onClick, children }) { return <button onClick={onClick} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px dashed #C8D4CF', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#6A8880', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{children}</button>; }
function FormBox({ children }) { return <div style={{ padding: 16, borderRadius: 10, background: '#F5F8F7', border: '1px solid #DCE4E0', marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>; }
function FormActions({ onCancel, onSave, saveLabel, disabled }) {
  return <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><GhostBtn onClick={onCancel}>Cancel</GhostBtn><PrimaryBtn onClick={onSave} disabled={disabled}><Save size={13}/>{saveLabel}</PrimaryBtn></div>;
}

function DoctorSettings({ doctors, setDoctors }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name:'', specialty:'General Dentistry', qchp:'', color:'rose' });
  const sorted = [...doctors].sort((a,b)=>a.calOrder-b.calOrder);
  const move = (idx, dir) => { const arr=[...sorted]; [arr[idx],arr[idx+dir]]=[arr[idx+dir],arr[idx]]; setDoctors(prev=>prev.map(d=>{const u=arr.find(a=>a.id===d.id);return u?{...d,calOrder:arr.indexOf(u)+1}:d;})); };
  const add = () => { if(!form.name||!form.qchp)return; setDoctors(prev=>[...prev,{id:`d${Date.now()}`,...form,active:true,calOrder:doctors.length+1,revenue:0,utilization:0,ticket:0,noshow:0,hours:0}]); setForm({name:'',specialty:'General Dentistry',qchp:'',color:'rose'}); setAdding(false); };
  return (
    <SettingsCard title="Doctors" sub="Manage doctors and calendar column order">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {sorted.map((d,idx) => {
          const av = AVATAR_COLORS[d.color]||{bg:'#EEF2F0',fg:'#4A6860'};
          return (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid #DCE4E0', background: d.active?'#fff':'#F8FAF9', opacity: d.active?1:.55 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button onClick={()=>move(idx,-1)} disabled={idx===0} style={{ width:20,height:20,borderRadius:5,border:'1px solid #DCE4E0',background:'#F5F8F7',display:'flex',alignItems:'center',justifyContent:'center' }}><ChevronUp size={11} color="#4E6860"/></button>
                <button onClick={()=>move(idx,1)} disabled={idx===sorted.length-1} style={{ width:20,height:20,borderRadius:5,border:'1px solid #DCE4E0',background:'#F5F8F7',display:'flex',alignItems:'center',justifyContent:'center' }}><ChevronDown size={11} color="#4E6860"/></button>
              </div>
              <div style={{ width:22,height:22,borderRadius:'50%',background:'#EEF2F0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#5A7A70',flexShrink:0 }}>{idx+1}</div>
              <div style={{ width:44,height: 44,borderRadius:'50%',background:av.bg,color:av.fg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,flexShrink:0 }}>{d.initials}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:600,color:'#111814' }}>{d.name}</div>
                <div style={{ fontSize:12,color:'#4E6860',marginTop:1 }}>{d.specialty} · <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12}}>{d.qchp}</span></div>
              </div>
              <ActiveBadge active={d.active} onToggle={()=>setDoctors(prev=>prev.map(x=>x.id===d.id?{...x,active:!x.active}:x))} />
            </div>
          );
        })}
      </div>
      {!adding ? <DashedAddBtn onClick={()=>setAdding(true)}><UserPlus size={14}/>Add doctor</DashedAddBtn> : (
        <FormBox>
          <div style={{ fontSize:13,fontWeight:700,color:'#111814' }}>New doctor</div>
          <FormGrid>
            <FormField label="Full name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Dr. Name" /></FormField>
            <FormField label="QCHP license"><input value={form.qchp} onChange={e=>setForm({...form,qchp:e.target.value})} placeholder="QCHP-D-XXXXX" style={{fontFamily:"'IBM Plex Mono',monospace"}} /></FormField>
            <FormField label="Specialty"><select value={form.specialty} onChange={e=>setForm({...form,specialty:e.target.value})}>{SPEC_LIST.map(s=><option key={s}>{s}</option>)}</select></FormField>
            <FormField label="Calendar colour">
              <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginTop:4 }}>
                {COL_LIST.map(c=><button key={c} onClick={()=>setForm({...form,color:c})} style={{ width:44,height: 44,borderRadius:'50%',background:COL_HEX[c],border:'none',boxShadow:form.color===c?`0 0 0 2px #fff,0 0 0 4px ${CLINIC_CONFIG.primaryColor}`:'none' }} />)}
              </div>
            </FormField>
          </FormGrid>
          <FormActions onCancel={()=>setAdding(false)} onSave={add} saveLabel="Save doctor" disabled={!form.name||!form.qchp} />
        </FormBox>
      )}
      <div style={{ marginTop:10,fontSize:12,color:'#4E6860',display:'flex',alignItems:'center',gap:6 }}><LayoutGrid size={13}/>Order here sets column sequence in the reception calendar.</div>
    </SettingsCard>
  );
}

function TraineeSettings({ trainees, setTrainees, doctors }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'', specialty:'General Dentistry', supervisorIds:[] });
  const toggle = id => setForm(f=>({...f,supervisorIds:f.supervisorIds.includes(id)?f.supervisorIds.filter(x=>x!==id):[...f.supervisorIds,id]}));
  const cancel = () => { setAdding(false); setEditing(null); setForm({name:'',specialty:'General Dentistry',supervisorIds:[]}); };
  const save = () => { if(editing) setTrainees(prev=>prev.map(t=>t.id===editing?{...t,...form}:t)); else if(form.name) setTrainees(prev=>[...prev,{id:`tr${Date.now()}`,...form,active:true}]); cancel(); };
  return (
    <SettingsCard title="Trainees" sub="Appear as assistant in booking and doctor portals">
      <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:12 }}>
        {trainees.map(t => {
          const sups = doctors.filter(d=>t.supervisorIds.includes(d.id));
          return (
            <div key={t.id}>
              <div style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,border:'1px solid #DCE4E0',background:t.active?'#fff':'#F8FAF9',opacity:t.active?1:.55 }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{ fontSize:13,fontWeight:600,color:'#111814' }}>{t.name}</span>
                    <span style={{ fontSize:12,fontWeight:700,padding:'2px 7px',borderRadius:20,background:'#EFF6FF',color:'#1D4ED8' }}>Trainee</span>
                  </div>
                  <div style={{ fontSize:12,color:'#4E6860',marginTop:2 }}>{t.specialty}</div>
                  <div style={{ display:'flex',alignItems:'center',gap:5,flexWrap:'wrap',marginTop:4 }}>
                    <span style={{ fontSize:12,color:'#5A7870' }}>Supervisors:</span>
                    {sups.length>0?sups.map(d=><span key={d.id} style={{ fontSize:12,fontWeight:500,padding:'1px 7px',borderRadius:8,background:'#EEF2F0',color:'#3A5048' }}>{d.name.replace('Dr. ','Dr.')}</span>):<span style={{ fontSize:12,color:'#E09050' }}>None assigned</span>}
                  </div>
                </div>
                <button onClick={()=>{setEditing(t.id);setForm({name:t.name,specialty:t.specialty,supervisorIds:[...t.supervisorIds]});setAdding(false);}} style={{ fontSize:12,fontWeight:600,padding:'4px 10px',borderRadius:7,border:'1px solid #DCE4E0',background:'#F5F8F7',color:'#4A6860',display:'flex',alignItems:'center',gap:4 }}><Edit3 size={11}/>Edit</button>
                <ActiveBadge active={t.active} onToggle={()=>setTrainees(prev=>prev.map(x=>x.id===t.id?{...x,active:!x.active}:x))} />
              </div>
              {editing===t.id && (
                <FormBox>
                  <FormGrid>
                    <FormField label="Full name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Trainee Name" /></FormField>
                    <FormField label="Specialty"><select value={form.specialty} onChange={e=>setForm({...form,specialty:e.target.value})}>{SPEC_LIST.map(s=><option key={s}>{s}</option>)}</select></FormField>
                  </FormGrid>
                  <FormField label="Supervising doctors — select one or more">
                    <div style={{ display:'flex',flexDirection:'column',gap:4,marginTop:4 }}>
                      {doctors.filter(d=>d.active).map(d=>(
                        <label key={d.id} style={{ display:'flex',alignItems:'center',gap:8,padding:'6px 10px',borderRadius:7,background:'#fff',border:'1px solid #EEF2F0',cursor:'pointer',fontSize:12.5 }}>
                          <input type="checkbox" checked={form.supervisorIds.includes(d.id)} onChange={()=>toggle(d.id)} style={{ width:15,height:15,flexShrink:0 }} />
                          <span style={{ fontWeight:600 }}>{d.name}</span>
                          <span style={{ color:'#4E6860' }}>{d.specialty.replace(' Dentistry','').replace(' Medicine','')}</span>
                        </label>
                      ))}
                    </div>
                    {form.supervisorIds.length===0&&<div style={{ fontSize:12,color:'#D97706',marginTop:4 }}>Select at least one supervisor.</div>}
                  </FormField>
                  <FormActions onCancel={cancel} onSave={save} saveLabel="Save changes" disabled={!form.name||form.supervisorIds.length===0} />
                </FormBox>
              )}
            </div>
          );
        })}
        {trainees.length===0&&<div style={{ fontSize:12.5,color:'#4E6860',fontStyle:'italic',padding:'8px 0' }}>No trainees added yet.</div>}
      </div>
      {!adding&&!editing&&<DashedAddBtn onClick={()=>setAdding(true)}><UserPlus size={14}/>Add trainee</DashedAddBtn>}
      {adding&&(
        <FormBox>
          <FormGrid>
            <FormField label="Full name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Trainee Name" /></FormField>
            <FormField label="Specialty"><select value={form.specialty} onChange={e=>setForm({...form,specialty:e.target.value})}>{SPEC_LIST.map(s=><option key={s}>{s}</option>)}</select></FormField>
          </FormGrid>
          <FormField label="Supervising doctors — select one or more">
            <div style={{ display:'flex',flexDirection:'column',gap:4,marginTop:4 }}>
              {doctors.filter(d=>d.active).map(d=>(
                <label key={d.id} style={{ display:'flex',alignItems:'center',gap:8,padding:'6px 10px',borderRadius:7,background:'#fff',border:'1px solid #EEF2F0',cursor:'pointer',fontSize:12.5 }}>
                  <input type="checkbox" checked={form.supervisorIds.includes(d.id)} onChange={()=>toggle(d.id)} style={{ width:15,height:15,flexShrink:0 }} />
                  <span style={{ fontWeight:600 }}>{d.name}</span>
                  <span style={{ color:'#4E6860' }}>{d.specialty.replace(' Dentistry','').replace(' Medicine','')}</span>
                </label>
              ))}
            </div>
            {form.supervisorIds.length===0&&<div style={{ fontSize:12,color:'#D97706',marginTop:4 }}>Select at least one supervisor.</div>}
          </FormField>
          <FormActions onCancel={cancel} onSave={save} saveLabel="Add trainee" disabled={!form.name||form.supervisorIds.length===0} />
        </FormBox>
      )}
      <div style={{ marginTop:10,fontSize:12,color:'#4E6860' }}>One trainee can be mapped to multiple supervisors. Multiple trainees can share one supervisor.</div>
    </SettingsCard>
  );
}

function NurseSettings({ nurses, setNurses }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name:'', specialty:'General' });
  const add = () => { if(!form.name)return; setNurses(prev=>[...prev,{id:`n${Date.now()}`,...form,active:true}]); setForm({name:'',specialty:'General'}); setAdding(false); };
  return (
    <SettingsCard title="Nurses" sub="Manage nursing staff available for procedures">
      <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:12 }}>
        {nurses.map(n=>(
          <div key={n.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,border:'1px solid #DCE4E0',background:n.active?'#fff':'#F8FAF9',opacity:n.active?1:.55 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13,fontWeight:600,color:'#111814' }}>{n.name}</div>
              <div style={{ fontSize:12,color:'#4E6860',marginTop:1 }}>{n.specialty}</div>
            </div>
            <ActiveBadge active={n.active} onToggle={()=>setNurses(prev=>prev.map(x=>x.id===n.id?{...x,active:!x.active}:x))} />
          </div>
        ))}
      </div>
      {!adding?<DashedAddBtn onClick={()=>setAdding(true)}><Plus size={14}/>Add nurse</DashedAddBtn>:(
        <FormBox>
          <FormGrid>
            <FormField label="Full name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nurse Name" /></FormField>
            <FormField label="Specialty"><select value={form.specialty} onChange={e=>setForm({...form,specialty:e.target.value})}>{['General','Dental','Aesthetic'].map(s=><option key={s}>{s}</option>)}</select></FormField>
          </FormGrid>
          <FormActions onCancel={()=>setAdding(false)} onSave={add} saveLabel="Save nurse" disabled={!form.name} />
        </FormBox>
      )}
    </SettingsCard>
  );
}

function TreatmentSettings({ treatments, setTreatments }) {
  const BLANK = { name:'', code:'', specialty:'General Dentistry', dur:30, grossPrice:0, cashPrice:0, discount:0, needsNurse:false, insurers:[] };
  const [adding, setAdding]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(BLANK);
  const startEdit = t => {
    setEditing(t.id);
    setForm({ name:t.name, code:t.code||'', specialty:t.specialty, dur:t.dur, grossPrice:t.grossPrice??t.price??0,
              cashPrice:t.cashPrice??t.price??0, discount:t.discount||0, needsNurse:t.needsNurse, insurers:(t.insurers||[]).map(x=>({...x})) });
    setAdding(false);
  };
  const startAdd = () => { setForm(BLANK); setAdding(true); setEditing(null); };
  const cancel = () => { setAdding(false); setEditing(null); setForm(BLANK); };
  const save = () => {
    if (editing) setTreatments(prev=>prev.map(t=>t.id===editing?{...t,...form}:t));
    else if (form.name) setTreatments(prev=>[...prev,{id:`t${Date.now()}`,...form,active:true}]);
    cancel();
  };
  const num = v => parseInt(v)||0;
  const addInsurer = () => setForm(f=>({...f,insurers:[...f.insurers,{name:(TREATMENT_INSURERS.find(n=>!f.insurers.some(r=>r.name===n))||TREATMENT_INSURERS[0]),insurancePrice:f.grossPrice||0,copayPct:20}]}));
  const setIns = (i,patch) => setForm(f=>({...f,insurers:f.insurers.map((r,idx)=>idx===i?{...r,...patch}:r)}));
  const delIns = i => setForm(f=>({...f,insurers:f.insurers.filter((_,idx)=>idx!==i)}));
  const groups = SPEC_LIST.map(s=>({s,items:treatments.filter(t=>t.specialty===s)})).filter(g=>g.items.length>0);

  const form_jsx = (
    <FormBox>
      <div style={{ fontSize:13,fontWeight:700,color:'#111814' }}>{editing?'Edit treatment':'New treatment'}</div>
      <FormGrid>
        <FormField label="Treatment name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></FormField>
        <FormField label="Code"><input value={form.code} onChange={e=>setForm({...form,code:e.target.value})} style={{fontFamily:"'IBM Plex Mono',monospace"}} /></FormField>
        <FormField label="Specialty"><select value={form.specialty} onChange={e=>setForm({...form,specialty:e.target.value})}>{SPEC_LIST.map(s=><option key={s}>{s}</option>)}</select></FormField>
        <FormField label="Duration (min)"><input type="number" value={form.dur} onChange={e=>setForm({...form,dur:num(e.target.value)||30})} style={{fontFamily:"'IBM Plex Mono',monospace"}} /></FormField>
        <FormField label="Gross price (QAR)"><input type="number" value={form.grossPrice} onChange={e=>setForm({...form,grossPrice:num(e.target.value)})} style={{fontFamily:"'IBM Plex Mono',monospace"}} /></FormField>
        <FormField label="Cash price (QAR)"><input type="number" value={form.cashPrice} onChange={e=>setForm({...form,cashPrice:num(e.target.value)})} style={{fontFamily:"'IBM Plex Mono',monospace"}} /></FormField>
        <FormField label="Cash discount (%)"><input type="number" value={form.discount} onChange={e=>setForm({...form,discount:num(e.target.value)})} style={{fontFamily:"'IBM Plex Mono',monospace"}} /></FormField>
      </FormGrid>

      <div>
        <div style={{ fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#4E6860',marginBottom:8 }}>Insurance pricing</div>
        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          {form.insurers.length===0&&<div style={{ fontSize:12.5,fontWeight:600,color:'#6A8880' }}>No insurance pricing &mdash; cash only.</div>}
          {form.insurers.length>0&&(
            <div style={{ display:'grid',gridTemplateColumns:'1.2fr 1fr .8fr 1fr 32px',gap:8,alignItems:'center' }}>
              {['Insurer','Gross (QAR)','Copay %','Net (QAR)',''].map((l,i)=>(
                <div key={i} style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#4E6860' }}>{l}</div>
              ))}
            </div>
          )}
          {form.insurers.map((row,i)=>{
            const net = Math.max(0, Math.round((row.insurancePrice||0) * (1 - (row.copayPct||0)/100)));
            return (
            <div key={i} style={{ display:'grid',gridTemplateColumns:'1.2fr 1fr .8fr 1fr 32px',gap:8,alignItems:'center' }}>
              <select value={row.name} onChange={e=>setIns(i,{name:e.target.value})}>{TREATMENT_INSURERS.map(n=><option key={n}>{n}</option>)}</select>
              <input type="number" value={row.insurancePrice} onChange={e=>setIns(i,{insurancePrice:num(e.target.value)})} placeholder="0" style={{fontFamily:"'IBM Plex Mono',monospace"}} title="Gross — approved / list price billed to the insurer (QAR)" />
              <input type="number" value={row.copayPct} onChange={e=>setIns(i,{copayPct:num(e.target.value)})} placeholder="0" style={{fontFamily:"'IBM Plex Mono',monospace"}} title="Patient copay as a percentage of gross" />
              <input type="text" value={net.toLocaleString()} readOnly tabIndex={-1} style={{fontFamily:"'IBM Plex Mono',monospace",background:'#EEF3F1',color:'#0A6040',fontWeight:700,cursor:'default'}} title="Net payable by the insurer = Gross × (1 − Copay%). Auto-calculated." />
              <button onClick={()=>delIns(i)} title="Remove insurer" style={{ width:30,height:30,borderRadius:7,border:'1px solid #DCE4E0',background:'#F5F8F7',color:'#9A3412',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}><X size={13}/></button>
            </div>
            );
          })}
          <DashedAddBtn onClick={addInsurer}><Plus size={13}/>Add insurer price</DashedAddBtn>
          {form.insurers.length>0&&<div style={{ fontSize:11.5,color:'#6A8880',fontWeight:500 }}>Net = Gross × (1 − Copay%) — the amount the insurer reimburses; the patient pays the copay. Net updates automatically.</div>}
        </div>
      </div>

      <label style={{ display:'flex',alignItems:'center',gap:8,fontSize:13,fontWeight:500,color:'#2A3830',cursor:'pointer' }}>
        <input type="checkbox" checked={form.needsNurse} onChange={e=>setForm({...form,needsNurse:e.target.checked})} style={{ width:15,height:15,flexShrink:0 }} />
        Nurse assist recommended for this procedure
      </label>
      <FormActions onCancel={cancel} onSave={save} saveLabel={editing?'Save changes':'Add treatment'} disabled={!form.name} />
    </FormBox>
  );

  return (
    <div>
      {!adding&&!editing&&<div style={{ display:'flex',justifyContent:'flex-end',marginBottom:12 }}><PrimaryBtn onClick={startAdd}><Plus size={14}/>Add treatment</PrimaryBtn></div>}
      {(adding||editing)&&<div style={{marginBottom:14}}>{form_jsx}</div>}
      {groups.map(g=>(
        <SettingsCard key={g.s} title={g.s} sub={`${g.items.length} treatments`}>
          <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
            {g.items.map(t=>(
              <div key={t.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,border:'1px solid #DCE4E0',background:t.active?'#fff':'#F8FAF9',opacity:t.active?1:.5 }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
                    <span style={{ fontSize:13,fontWeight:600,color:'#111814' }}>{t.name}</span>
                    {t.code&&<span style={{ fontSize:11,fontWeight:600,color:'#6A8880',fontFamily:"'IBM Plex Mono',monospace" }}>{t.code}</span>}
                    {t.needsNurse&&<span style={{ fontSize:12,fontWeight:700,padding:'2px 7px',borderRadius:20,background:'#EDE9FE',color:'#5B21B6' }}>+ nurse</span>}
                  </div>
                  <div style={{ fontSize:12,color:'#4E6860',marginTop:2 }}>
                    {t.dur}min &middot; Cash QAR {(t.cashPrice??t.price??0).toLocaleString()}
                    {t.discount>0&&<span> ({t.discount}% off)</span>}
                    {' · '}{(t.insurers||[]).length>0?`${t.insurers.length} insurer${t.insurers.length>1?'s':''}`:'cash only'}
                  </div>
                </div>
                <button onClick={()=>startEdit(t)} style={{ fontSize:12,fontWeight:600,padding:'4px 10px',borderRadius:7,border:'1px solid #DCE4E0',background:'#F5F8F7',color:'#4A6860',display:'flex',alignItems:'center',gap:4,cursor:'pointer' }}><Edit3 size={11}/>Edit</button>
                <ActiveBadge active={t.active} onToggle={()=>setTreatments(prev=>prev.map(x=>x.id===t.id?{...x,active:!x.active}:x))} />
              </div>
            ))}
          </div>
        </SettingsCard>
      ))}
    </div>
  );
}

// ─── Patients tab ─────────────────────────────────────────────────────────────
// The clinic's patient file index — searchable by name, phone, patient ID (QID)
// or file number. Click a row to open the record (insurer, allergies, history).
function PatientsTab({ patients }) {
  const [q, setQ]           = useState('');
  const [openId, setOpenId] = useState(null);
  const query  = q.trim();
  const norm   = s => (s || '').toLowerCase();
  const digits = s => (s || '').replace(/\D/g, '');
  const filtered = useMemo(() => {
    if (!query) return patients;
    const ql = norm(query), qd = digits(query);
    return patients.filter(p =>
      norm(p.nameEn).includes(ql) ||
      norm(p.fileNo).includes(ql) ||
      (p.qid || '').includes(query) ||
      (!!qd && (p.qid || '').includes(qd)) ||
      (!!qd && digits(p.phone).includes(qd))
    );
  }, [patients, query]);

  const buildList = () => {
    const headers = ['Name', 'File #', 'Patient ID (QID)', 'Phone', 'Gender', 'DOB', 'Insurer', 'Policy', 'Last visit', 'Balance (QAR)', 'Allergies', 'Conditions'];
    const rows = filtered.map(p => [p.nameEn, p.fileNo, p.qid || '', p.phone || '', p.gender || '', p.dob || '', p.insurer || '', p.policy || '', p.lastVisit || '', p.balance || 0, (p.allergies || []).join('; '), (p.conditions || []).join('; ')]);
    return { headers, rows, base: 'patient-records', sheet: 'Patients' };
  };
  const handleCSV  = () => { const r = buildList(); downloadCSV(`${r.base}.csv`, r.headers, r.rows); };
  const handleXLSX = () => { const r = buildList(); downloadXLSX(`${r.base}.xlsx`, r.sheet, r.headers, r.rows); };

  const cell  = { fontSize: 12.5, padding: '10px 8px 10px 0', verticalAlign: 'middle' };
  const hcell = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#4E6860', textAlign: 'left', padding: '0 8px 10px 0' };
  const initials = n => (n || '').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
  const withBalance = filtered.filter(p => (p.balance || 0) > 0).length;

  return (
    <main style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #DCE4E0', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <Search size={16} color="#4E6860" style={{ flexShrink: 0 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, phone, patient ID (QID) or file number…" style={{ width: '100%' }} />
          {q && <button onClick={() => setQ('')} style={{ background: 'transparent', border: 'none', color: '#6A8880', display: 'flex', alignItems: 'center' }}><X size={15} /></button>}
        </div>
        <span style={{ fontSize: 12.5, color: '#5A7870', fontWeight: 600 }}>{filtered.length} of {patients.length} patients</span>
        <DownloadMenu onCSV={handleCSV} onXLSX={handleXLSX} disabled={filtered.length === 0} />
      </div>

      <Card title="Patient records" sub={`${patients.length} on file · ${withBalance} with an outstanding balance`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #DCE4E0' }}>
                {['Patient', 'File #', 'Patient ID', 'Phone', 'Insurer', 'Last visit', 'Balance', ''].map(h => <th key={h} style={hcell}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const open = openId === p.id;
                const age = patientAge(p.dob);
                return (
                  <React.Fragment key={p.id}>
                    <tr className="trow" onClick={() => setOpenId(open ? null : p.id)} style={{ borderBottom: '1px solid #EEF2F0', cursor: 'pointer' }}>
                      <td style={cell}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E8F3F0', color: '#0C6B5A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{initials(p.nameEn)}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#111814', display: 'flex', alignItems: 'center', gap: 6 }}>
                              {p.nameEn || 'Unnamed patient'}
                              {p.allergies?.length > 0 && <AlertTriangle size={12} color="#DC4F38" title={`Allergies: ${p.allergies.join(', ')}`} />}
                            </div>
                            <div style={{ fontSize: 11.5, color: '#6A8880', fontWeight: 600 }}>{[age != null ? `${age} yrs` : null, p.gender].filter(Boolean).join(' · ')}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...cell, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#4E6860' }}>{p.fileNo}</td>
                      <td style={{ ...cell, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#4E6860' }}>{p.qid || '—'}</td>
                      <td style={{ ...cell, color: '#3A5248' }}>{p.phone || '—'}</td>
                      <td style={cell}>{p.insurer && p.insurer !== 'Cash/Card' ? <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#EFF6FF', color: '#1D4ED8' }}>{p.insurer}</span> : <span style={{ fontSize: 12, color: '#6A8880', fontWeight: 600 }}>Cash</span>}</td>
                      <td style={{ ...cell, color: '#4E6860' }}>{p.lastVisit || '—'}</td>
                      <td style={{ ...cell, fontWeight: 700, color: (p.balance || 0) > 0 ? '#C04030' : '#0A6040' }}>{(p.balance || 0) > 0 ? qar(p.balance) : '—'}</td>
                      <td style={cell}>{open ? <ChevronUp size={15} color="#6A8880" /> : <ChevronDown size={15} color="#6A8880" />}</td>
                    </tr>
                    {open && (
                      <tr style={{ background: '#F7FAF9', borderBottom: '1px solid #EEF2F0' }}>
                        <td colSpan={8} style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
                            <PatientMeta label="Date of birth" value={p.dob || '—'} />
                            <PatientMeta label="Insurance" value={p.insurer && p.insurer !== 'Cash/Card' ? `${p.insurer}${p.policy ? ' · ' + p.policy : ''}` : 'Cash / card'} />
                            <PatientMeta label="Eligibility" value={p.eligible === true ? 'Verified' : p.eligible === false ? 'Not eligible' : 'N/A'} />
                            <PatientMeta label="Balance" value={(p.balance || 0) > 0 ? qar(p.balance) : 'Settled'} />
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                            {(p.allergies || []).map(a => <span key={a} style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#FEE2E2', color: '#991B1B' }}>⚠ {a}</span>)}
                            {(p.conditions || []).map(c => <span key={c} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#EEF2F0', color: '#3A5048' }}>{c}</span>)}
                            {(p.allergies || []).length === 0 && (p.conditions || []).length === 0 && <span style={{ fontSize: 12.5, color: '#6A8880', fontWeight: 600 }}>No known allergies or conditions.</span>}
                          </div>
                          {p.notes && <div style={{ fontSize: 12.5, color: '#3A5248', fontStyle: 'italic', marginBottom: 12 }}>Note: {p.notes}</div>}
                          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#4E6860', marginBottom: 6 }}>Encounter history</div>
                          {(p.encounterHistory || []).length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <tbody>
                                {p.encounterHistory.map((h, i) => (
                                  <tr key={i} style={{ borderBottom: '1px solid #E8EDEA' }}>
                                    <td style={{ ...cell, width: 100, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#4E6860' }}>{h.date}</td>
                                    <td style={{ ...cell, width: 200, color: '#5A7A70' }}>{h.doctor.replace('Dr. ', '')}</td>
                                    <td style={{ ...cell, fontWeight: 600 }}>{h.procedure}</td>
                                    <td style={{ ...cell, color: '#6A8880' }}>{h.notes}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : <div style={{ fontSize: 12.5, color: '#6A8880', fontWeight: 600 }}>No recorded encounters.</div>}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '28px 8px', textAlign: 'center', fontSize: 13, color: '#6A8880', fontWeight: 600 }}>No patients match “{query}”.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
function PatientMeta({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#6A8880', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#111814' }}>{value}</div>
    </div>
  );
}

// ─── Receptionist settings ────────────────────────────────────────────────────
const DESK_LIST  = ['Front desk', 'Aesthetic wing', 'Billing'];
const SHIFT_LIST = ['Morning', 'Evening', 'Rotating'];
function ReceptionistSettings({ receptionists, setReceptionists }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const BLANK = { name: '', desk: 'Front desk', phone: '', shift: 'Morning' };
  const [form, setForm] = useState(BLANK);
  const cancel = () => { setAdding(false); setEditing(null); setForm(BLANK); };
  const startEdit = r => { setEditing(r.id); setForm({ name: r.name, desk: r.desk, phone: r.phone || '', shift: r.shift }); setAdding(false); };
  const save = () => {
    if (!form.name) return;
    if (editing) setReceptionists(prev => prev.map(r => r.id === editing ? { ...r, ...form } : r));
    else setReceptionists(prev => [...prev, { id: `r${Date.now()}`, ...form, active: true }]);
    cancel();
  };
  return (
    <SettingsCard title="Receptionists" sub="Front-desk staff who book appointments, check patients in and take payment">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {receptionists.map(r => (
          <div key={r.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid #DCE4E0', background: r.active ? '#fff' : '#F8FAF9', opacity: r.active ? 1 : .55 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E8F3F0', color: '#0C6B5A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Headset size={16} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111814' }}>{r.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#EDE9FE', color: '#5B21B6' }}>{r.shift}</span>
                </div>
                <div style={{ fontSize: 12, color: '#4E6860', marginTop: 2 }}>{r.desk}{r.phone ? <> · <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{r.phone}</span></> : null}</div>
              </div>
              <button onClick={() => startEdit(r)} style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 7, border: '1px solid #DCE4E0', background: '#F5F8F7', color: '#4A6860', display: 'flex', alignItems: 'center', gap: 4 }}><Edit3 size={11} />Edit</button>
              <ActiveBadge active={r.active} onToggle={() => setReceptionists(prev => prev.map(x => x.id === r.id ? { ...x, active: !x.active } : x))} />
            </div>
            {editing === r.id && <RecForm form={form} setForm={setForm} onCancel={cancel} onSave={save} saveLabel="Save changes" />}
          </div>
        ))}
        {receptionists.length === 0 && <div style={{ fontSize: 12.5, color: '#4E6860', fontStyle: 'italic', padding: '8px 0' }}>No receptionists added yet.</div>}
      </div>
      {!adding && !editing && <DashedAddBtn onClick={() => { setForm(BLANK); setAdding(true); }}><UserPlus size={14} />Add receptionist</DashedAddBtn>}
      {adding && <RecForm form={form} setForm={setForm} onCancel={cancel} onSave={save} saveLabel="Add receptionist" />}
    </SettingsCard>
  );
}
function RecForm({ form, setForm, onCancel, onSave, saveLabel }) {
  return (
    <FormBox>
      <FormGrid>
        <FormField label="Full name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Receptionist name" /></FormField>
        <FormField label="Phone"><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+974 …" style={{ fontFamily: "'IBM Plex Mono',monospace" }} /></FormField>
        <FormField label="Desk"><select value={form.desk} onChange={e => setForm({ ...form, desk: e.target.value })}>{DESK_LIST.map(d => <option key={d}>{d}</option>)}</select></FormField>
        <FormField label="Shift"><select value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })}>{SHIFT_LIST.map(s => <option key={s}>{s}</option>)}</select></FormField>
      </FormGrid>
      <FormActions onCancel={onCancel} onSave={onSave} saveLabel={saveLabel} disabled={!form.name} />
    </FormBox>
  );
}

// ─── Schedule settings ────────────────────────────────────────────────────────
// Set working hours, breaks, off-days and vacations per staff member. Uses the
// same schedule shape the Reception booking calendar reads, so a doctor's edits
// here immediately change which slots are bookable there.
function ScheduleSettings({ doctors, trainees, nurses, receptionists }) {
  useSchedules(); // re-render when a schedule is saved
  const [group, setGroup]     = useState('doctors');
  const [editing, setEditing] = useState(null);
  const GROUPS = { doctors, trainees, nurses, receptionists };
  const TABS = [['doctors', 'Doctors'], ['trainees', 'Trainees'], ['nurses', 'Nurses'], ['receptionists', 'Receptionists']];
  const staff = GROUPS[group] || [];

  return (
    <SettingsCard title="Staff schedules" sub="Working hours, breaks, off-days and vacations. Doctor schedules drive bookable slots in the reception calendar.">
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {TABS.map(([id, lbl]) => {
          const on = group === id;
          return (
            <button key={id} onClick={() => { setGroup(id); setEditing(null); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: on ? 700 : 600, border: `1px solid ${on ? CLINIC_CONFIG.primaryColor : '#DCE4E0'}`, background: on ? '#EAF5F0' : '#fff', color: on ? CLINIC_CONFIG.primaryColor : '#5A7870' }}>
              {lbl}<span style={{ fontSize: 11, fontWeight: 700, padding: '0 6px', borderRadius: 10, background: on ? '#D4EBE3' : '#EEF2F0', color: on ? '#0A6040' : '#6A8880' }}>{(GROUPS[id] || []).length}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {staff.map(s => <ScheduleRow key={s.id} staff={s} editing={editing === s.id} onEdit={() => setEditing(s.id)} onClose={() => setEditing(null)} />)}
        {staff.length === 0 && <div style={{ fontSize: 12.5, color: '#4E6860', fontStyle: 'italic', padding: '8px 0' }}>No staff in this group.</div>}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: '#4E6860', display: 'flex', alignItems: 'center', gap: 6 }}><CalendarDays size={13} />Off-days, breaks and vacations grey out the matching slots when reception books an appointment.</div>
    </SettingsCard>
  );
}
function ScheduleRow({ staff, editing, onEdit, onClose }) {
  const s = getSchedule(staff.id);
  const av = AVATAR_COLORS[staff.color] || { bg: '#E8F3F0', fg: '#0C6B5A' };
  const initials = staff.name.split(' ').filter(w => !w.startsWith('Dr.') && !/(Nurse|Trainee)/.test(w)).map(w => w[0]).slice(0, 2).join('') || staff.name.slice(0, 2).toUpperCase();
  return (
    <div style={{ borderRadius: 10, border: '1px solid #DCE4E0', background: staff.active === false ? '#F8FAF9' : '#fff', opacity: staff.active === false ? .6 : 1, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px' }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: av.bg, color: av.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111814' }}>{staff.name}{staff.specialty ? <span style={{ fontSize: 12, fontWeight: 600, color: '#5A7870' }}> · {staff.specialty}</span> : null}</div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12.5, fontWeight: 600, color: '#3D5850', marginTop: 3 }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{s.workStart}–{s.workEnd}</span>
            {s.offDays.length > 0 && <span style={{ color: '#C05820' }}>Off: {s.offDays.map(cap).join(', ')}</span>}
            {s.breaks.length > 0 && <span>Break: {s.breaks.map(b => `${b.start}–${b.end} ${b.label}`).join(', ')}</span>}
            {s.vacations.length > 0 && s.vacations.map(v => <span key={v.start} style={{ color: '#8B5CF6' }}>Leave: {v.start} → {v.end}{v.reason ? ` (${v.reason})` : ''}</span>)}
          </div>
        </div>
        <button onClick={editing ? onClose : onEdit} style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 7, border: '1px solid #DCE4E0', background: editing ? '#EAF5F0' : '#F5F8F7', color: '#4A6860', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}><Clock size={11} />{editing ? 'Close' : 'Edit hours'}</button>
      </div>
      {editing && <ScheduleEditor staff={staff} onClose={onClose} />}
    </div>
  );
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function ScheduleEditor({ staff, onClose }) {
  const [form, setForm] = useState(() => {
    const s = getSchedule(staff.id);
    return { workStart: s.workStart, workEnd: s.workEnd, offDays: [...s.offDays], breaks: s.breaks.map(b => ({ ...b })), vacations: s.vacations.map(v => ({ ...v })) };
  });
  const toggleDay = d => setForm(f => ({ ...f, offDays: f.offDays.includes(d) ? f.offDays.filter(x => x !== d) : [...f.offDays, d] }));
  const addBreak  = () => setForm(f => ({ ...f, breaks: [...f.breaks, { start: '13:00', end: '14:00', label: 'Break' }] }));
  const setBreak  = (i, patch) => setForm(f => ({ ...f, breaks: f.breaks.map((b, idx) => idx === i ? { ...b, ...patch } : b) }));
  const delBreak  = i => setForm(f => ({ ...f, breaks: f.breaks.filter((_, idx) => idx !== i) }));
  const addVac    = () => setForm(f => ({ ...f, vacations: [...f.vacations, { start: '', end: '', reason: '' }] }));
  const setVac    = (i, patch) => setForm(f => ({ ...f, vacations: f.vacations.map((v, idx) => idx === i ? { ...v, ...patch } : v) }));
  const delVac    = i => setForm(f => ({ ...f, vacations: f.vacations.filter((_, idx) => idx !== i) }));
  const save = () => {
    setSchedule(staff.id, {
      workStart: form.workStart, workEnd: form.workEnd,
      offDays: [...form.offDays],
      breaks: form.breaks.filter(b => b.start && b.end).map(b => ({ ...b, label: b.label || 'Break' })),
      vacations: form.vacations.filter(v => v.start && v.end).map(v => ({ ...v, reason: v.reason || 'Leave' })),
    });
    onClose();
  };
  const timeCell = { fontFamily: "'IBM Plex Mono',monospace" };
  return (
    <div style={{ padding: 16, borderTop: '1px solid #DCE4E0', background: '#F5F8F7', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FormGrid>
        <FormField label="Shift start"><input type="time" value={form.workStart} onChange={e => setForm({ ...form, workStart: e.target.value })} style={timeCell} /></FormField>
        <FormField label="Shift end"><input type="time" value={form.workEnd} onChange={e => setForm({ ...form, workEnd: e.target.value })} style={timeCell} /></FormField>
      </FormGrid>
      <FormField label="Off days">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
          {WEEK_DAYS.map(d => {
            const on = form.offDays.includes(d);
            return <button key={d} onClick={() => toggleDay(d)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: on ? 700 : 600, border: `1px solid ${on ? '#DC4F38' : '#DCE4E0'}`, background: on ? '#FEE2E2' : '#fff', color: on ? '#991B1B' : '#5A7870' }}>{cap(d).slice(0, 3)}</button>;
          })}
        </div>
      </FormField>
      <FormField label="Breaks">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {form.breaks.map((b, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr 32px', gap: 8, alignItems: 'center' }}>
              <input type="time" value={b.start} onChange={e => setBreak(i, { start: e.target.value })} style={timeCell} />
              <input type="time" value={b.end} onChange={e => setBreak(i, { end: e.target.value })} style={timeCell} />
              <input value={b.label} onChange={e => setBreak(i, { label: e.target.value })} placeholder="Label (e.g. Lunch)" />
              <button onClick={() => delBreak(i)} title="Remove break" style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #DCE4E0', background: '#fff', color: '#9A3412', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
            </div>
          ))}
          <DashedAddBtn onClick={addBreak}><Coffee size={13} />Add break</DashedAddBtn>
        </div>
      </FormField>
      <FormField label="Vacations / leave">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {form.vacations.map((v, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr 32px', gap: 8, alignItems: 'center' }}>
              <input type="date" value={v.start} onChange={e => setVac(i, { start: e.target.value })} />
              <input type="date" value={v.end} onChange={e => setVac(i, { end: e.target.value })} />
              <input value={v.reason} onChange={e => setVac(i, { reason: e.target.value })} placeholder="Reason (e.g. Annual leave)" />
              <button onClick={() => delVac(i)} title="Remove leave" style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #DCE4E0', background: '#fff', color: '#9A3412', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
            </div>
          ))}
          <DashedAddBtn onClick={addVac}><Plane size={13} />Add vacation</DashedAddBtn>
        </div>
      </FormField>
      <FormActions onCancel={onClose} onSave={save} saveLabel="Save schedule" disabled={!form.workStart || !form.workEnd} />
    </div>
  );
}
