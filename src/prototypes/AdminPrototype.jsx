import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, Calendar, Package, Users, FileText, ChevronRight,
  ArrowUpRight, ArrowDownRight, Banknote, Shield, Bell, ChevronDown,
  ChevronUp, AlertCircle, CheckCircle2, Printer, Plus, Edit3, Save,
  X, UserPlus, LayoutGrid, BarChart3, RefreshCw
} from 'lucide-react';

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
const REVENUE_DATA = [
  { month: 'Dec', booked: 178400, collected: 162100, dental: 124800, aesthetic: 53600 },
  { month: 'Jan', booked: 192700, collected: 184200, dental: 138900, aesthetic: 53800 },
  { month: 'Feb', booked: 210500, collected: 198400, dental: 142300, aesthetic: 68200 },
  { month: 'Mar', booked: 225800, collected: 211900, dental: 156100, aesthetic: 69700 },
  { month: 'Apr', booked: 248300, collected: 224500, dental: 168800, aesthetic: 79500 },
  { month: 'May', booked: 242100, collected: 198700, dental: 161200, aesthetic: 80900 },
];
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
  const [treatments, setTreatments] = useState(INIT_TREATMENTS);
  const [transactions, setTransactions] = useState(DAILY_TRANSACTIONS);

  const cur  = REVENUE_DATA[REVENUE_DATA.length - 1];
  const prev = REVENUE_DATA[REVENUE_DATA.length - 2];
  const totalCosts    = COST_BREAKDOWN.reduce((s, c) => s + c.amount, 0);
  const grossMargin   = ((cur.collected - totalCosts) / cur.collected * 100).toFixed(1);
  const monthlyProfit = cur.collected - totalCosts;
  const taxAccrual    = Math.max(0, monthlyProfit * 0.10);

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
        <div style={{ padding: '0 24px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          {[['dashboard','Dashboard'],['reports','Reports'],['daily','Daily report'],['settings','Settings']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '11px 18px', fontSize: 13, fontWeight: tab === id ? 700 : 500,
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
            <KPITile label="Booked revenue" value={cur.booked}                  prev={prev.booked}                  currency sub={`${Math.round(cur.collected/cur.booked*100)}% collected`} />
            <KPITile label="Collected"      value={cur.collected}               prev={prev.collected}               currency sub="Cleared to bank" />
            <KPITile label="Receivables"    value={cur.booked - cur.collected}  prev={prev.booked - prev.collected} currency sub="QLM · AXA pending" inverted />
            <KPITile label="Gross margin"   value={parseFloat(grossMargin)}     prev={32.8}                         unit="%" sub="Benchmark 35–45%" last />
          </div>
        </div>
      )}

      {/* ── TABS ── */}
      {tab === 'dashboard' && (
        <main style={{ display: 'grid', gridTemplateColumns: '1fr 336px', gap: 16, padding: '16px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card title="Revenue trend" sub="6 months · Booked vs Collected · Dental & Aesthetic">
              <RevenueChartSVG data={REVENUE_DATA} />
            </Card>
            <Card title="Cost breakdown" sub={`May · ${qar(totalCosts)} total outgoings`}>
              <CostBreakdown items={COST_BREAKDOWN} />
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
      {tab === 'reports'  && <ReportsTab doctors={doctors} />}
      {tab === 'daily'    && <DailyTab   transactions={transactions} setTransactions={setTransactions} doctors={doctors} />}
      {tab === 'settings' && <SettingsTab doctors={doctors} setDoctors={setDoctors} nurses={nurses} setNurses={setNurses} trainees={trainees} setTrainees={setTrainees} treatments={treatments} setTreatments={setTreatments} />}
    </div>
  );
}

// ─── KPI Tile ─────────────────────────────────────────────────────────────────
function KPITile({ label, value, prev, currency, unit, sub, inverted, last }) {
  const pct  = prev ? ((value - prev) / prev * 100).toFixed(1) : null;
  const up   = pct > 0;
  const good = inverted ? !up : up;
  return (
    <div style={{ padding: '14px 22px', borderRight: last ? 'none' : '1px solid #E8EDEA' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#2E4840', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', color: '#111814', lineHeight: 1 }}>
          {Number(value).toLocaleString()}
          <span style={{ fontSize: 13, fontWeight: 500, color: '#607870', marginLeft: 3 }}>{currency ? 'QAR' : unit}</span>
        </div>
        {pct !== null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
            background: good ? '#D4F1E4' : '#FDDDD9',
            color: good ? '#0A6040' : '#B02A1E',
          }}>
            {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(pct)}%
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#607870', marginTop: 4, fontWeight: 600 }}>{sub}</div>}
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
  const W = 580, H = 190, PL = 48, PR = 12, PT = 10, PB = 24;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxV = Math.max(...data.map(d => d.booked)) * 1.05;
  const cx = i => PL + (i + 0.5) * (cW / data.length);
  const cy = v => PT + cH - (v / maxV) * cH;
  const bw = (cW / data.length) * 0.52;
  const grids = [0, 0.25, 0.5, 0.75, 1];
  const collectLine = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(1)},${cy(d.collected).toFixed(1)}`).join(' ');
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {grids.map(g => {
          const y = (PT + cH * (1 - g)).toFixed(1);
          const val = Math.round(maxV * g);
          return (
            <g key={g}>
              <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#EEF2F0" strokeWidth="1" />
              <text x={PL - 6} y={parseFloat(y) + 3.5} textAnchor="end" fontSize="11.5" fontWeight="600" fill="#2E4840" fontFamily="Manrope,sans-serif">{val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}</text>
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
            <g key={d.month}>
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
          <text key={i} x={cx(i)} y={H - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#2E4840" fontFamily="Manrope,sans-serif">{d.month}</text>
        ))}
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4, paddingTop: 12, borderTop: '1px solid #EEF2F0', fontSize:12, color: '#4E6860' }}>
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
          YTD <span style={{ fontWeight: 700, color: '#111814' }}>QAR {REVENUE_DATA.reduce((s, m) => s + m.collected, 0).toLocaleString()}</span>
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
        <span style={{ color: '#6A8880' }}>Total outgoings · May</span>
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
function ReportsTab({ doctors }) {
  const [view, setView]     = useState('treatment');
  const [from, setFrom]     = useState('2026-05-01');
  const [to, setTo]         = useState('2026-05-24');
  const [sortBy, setSortBy] = useState('revenue');
  const REF = 24;
  const days  = useMemo(() => { const d = Math.round((new Date(to) - new Date(from)) / 86400000) + 1; return isNaN(d) || d < 1 ? REF : d; }, [from, to]);
  const scale = days / REF;
  const scaled = useMemo(() => TREATMENT_REPORT.map(t => ({ ...t, count: Math.round(t.count * scale), revenue: Math.round(t.revenue * scale), insured: Math.round(t.insured * scale), selfPay: Math.round(t.selfPay * scale) })), [scale]);
  const sorted = useMemo(() => [...scaled].sort((a, b) => b[sortBy] - a[sortBy]), [scaled, sortBy]);
  const totR = scaled.reduce((s,t)=>s+t.revenue,0), totC = scaled.reduce((s,t)=>s+t.count,0), totI = scaled.reduce((s,t)=>s+t.insured,0), totS = scaled.reduce((s,t)=>s+t.selfPay,0);
  const docR = useMemo(() => doctors.map(d => ({ ...d, treatments: Math.round(d.revenue / d.ticket * scale), revenue: Math.round(d.revenue * scale), insured: Math.round(d.revenue * .35 * scale), selfPay: Math.round(d.revenue * .65 * scale) })), [doctors, scale]);
  const PRESETS = [['Today','2026-05-24','2026-05-24'],['This week','2026-05-18','2026-05-24'],['This month','2026-05-01','2026-05-24'],['Last month','2026-04-01','2026-04-30']];
  const cell = { fontSize: 12.5, padding: '10px 8px 10px 0' };
  const hcell = { fontSize:12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#4E6860', padding: '0 8px 10px 0', cursor: 'pointer' };
  return (
    <main style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #DCE4E0', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
        <span style={{ fontSize:12, color: '#5A7870', fontWeight: 600 }}>{days}d</span>
        <div style={{ marginLeft: 'auto', display: 'flex', borderRadius: 9, overflow: 'hidden', border: '1px solid #DCE4E0' }}>
          {[['treatment', <BarChart3 size={13} />, 'By treatment'],['doctor', <Users size={13} />, 'By doctor']].map(([id, icon, lbl]) => (
            <button key={id} onClick={() => setView(id)} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: view === id ? CLINIC_CONFIG.primaryColor : '#fff', color: view === id ? '#fff' : '#6A8880' }}>{icon}{lbl}</button>
          ))}
        </div>
      </div>
      <Card title={view === 'treatment' ? 'Treatment report' : 'Doctor report'} sub={`${from} → ${to} · ${view === 'treatment' ? totC + ' procedures' : doctors.length + ' doctors'}`}>
        <div style={{ overflowX: 'auto' }}>
          {view === 'treatment' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #DCE4E0' }}>
                  {[['Treatment',null],['Specialty',null],['Count','count'],['Revenue','revenue'],['Avg ticket','avgTicket'],['Insured','insured'],['Self-pay','selfPay']].map(([l,k]) => (
                    <th key={l} onClick={() => k && setSortBy(k)} style={{ ...hcell, textAlign: 'left', color: sortBy === k ? CLINIC_CONFIG.primaryColor : '#4E6860' }}>{l}{sortBy===k?' ↓':''}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(t => (
                  <tr key={t.name} className="trow" style={{ borderBottom: '1px solid #EEF2F0' }}>
                    <td style={{ ...cell, fontWeight: 600 }}>{t.name}</td>
                    <td style={{ ...cell, color: '#4E6860' }}>{t.specialty.replace(' Medicine','').replace(' Dentistry','')}</td>
                    <td style={cell}>{t.count}</td>
                    <td style={{ ...cell, fontWeight: 700 }}>{qar(t.revenue)}</td>
                    <td style={{ ...cell, color: '#5A7A70' }}>{qar(t.avgTicket)}</td>
                    <td style={{ ...cell, color: '#1D4ED8' }}>{t.insured > 0 ? qar(t.insured) : <span style={{color:'#C8D8D0'}}>—</span>}</td>
                    <td style={cell}>{qar(t.selfPay)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #DCE4E0', fontWeight: 700 }}>
                  <td style={cell}>Total</td><td/>
                  <td style={cell}>{totC}</td>
                  <td style={cell}>{qar(totR)}</td>
                  <td style={{ ...cell, color: '#4E6860' }}>{qar(Math.round(totR/totC))}</td>
                  <td style={{ ...cell, color: '#1D4ED8' }}>{qar(totI)}</td>
                  <td style={cell}>{qar(totS)}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #DCE4E0' }}>
                  {['Doctor','Specialty','Procedures','Revenue','Avg ticket','Insured','Self-pay','Util.','No-shows'].map(l => (
                    <th key={l} style={{ ...hcell, textAlign: 'left' }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docR.map(d => (
                  <tr key={d.id} className="trow" style={{ borderBottom: '1px solid #EEF2F0' }}>
                    <td style={{ ...cell, fontWeight: 600 }}>{d.name}</td>
                    <td style={{ ...cell, color: '#4E6860' }}>{d.specialty.replace(' Medicine','').replace(' Dentistry','')}</td>
                    <td style={cell}>{d.treatments}</td>
                    <td style={{ ...cell, fontWeight: 700 }}>{qar(d.revenue)}</td>
                    <td style={{ ...cell, color: '#5A7A70' }}>{qar(d.ticket)}</td>
                    <td style={{ ...cell, color: '#1D4ED8' }}>{qar(d.insured)}</td>
                    <td style={cell}>{qar(d.selfPay)}</td>
                    <td style={cell}><span style={{ fontSize:12, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: d.utilization>=80?'#D4F1E4':d.utilization>=65?'#FEF3DC':'#FDDDD9', color: d.utilization>=80?'#0A6040':d.utilization>=65?'#92600A':'#C04030' }}>{d.utilization}%</span></td>
                    <td style={cell}>{d.noshow}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #DCE4E0', fontWeight: 700 }}>
                  <td style={cell}>Total</td><td/>
                  <td style={cell}>{docR.reduce((s,d)=>s+d.treatments,0)}</td>
                  <td style={cell}>{qar(docR.reduce((s,d)=>s+d.revenue,0))}</td>
                  <td/><td style={{...cell,color:'#1D4ED8'}}>{qar(docR.reduce((s,d)=>s+d.insured,0))}</td>
                  <td style={cell}>{qar(docR.reduce((s,d)=>s+d.selfPay,0))}</td>
                  <td/><td/>
                </tr>
              </tbody>
            </table>
          )}
        </div>
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
  const cell = { fontSize: 12.5, padding: '10px 8px 10px 0', verticalAlign: 'middle' };
  return (
    <main style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #DCE4E0', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Calendar size={15} color="#4E6860" />
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ width: 160 }} />
          <span style={{ fontSize: 13.5, fontWeight: 500, color: '#6A8880' }}>Daily report</span>
        </div>
        <button onClick={()=>window.print()} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 9, border: '1px solid #DCE4E0', background: '#F5F8F7', fontSize: 13, fontWeight: 600, color: '#2A4840' }}>
          <Printer size={14} /> Print / Export PDF
        </button>
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

function SettingsTab({ doctors, setDoctors, nurses, setNurses, trainees, setTrainees, treatments, setTreatments }) {
  const [sec, setSec] = useState('doctors');
  const SECS = [['doctors','Doctors & calendar'],['trainees','Trainees'],['nurses','Nurses'],['treatments','Treatments']];
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
        {sec==='doctors'    && <DoctorSettings    doctors={doctors}    setDoctors={setDoctors} />}
        {sec==='trainees'   && <TraineeSettings   trainees={trainees}  setTrainees={setTrainees} doctors={doctors} />}
        {sec==='nurses'     && <NurseSettings     nurses={nurses}      setNurses={setNurses} />}
        {sec==='treatments' && <TreatmentSettings treatments={treatments} setTreatments={setTreatments} />}
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
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'', specialty:'General Dentistry', dur:30, price:0, needsNurse:false });
  const startEdit = t => { setEditing(t.id); setForm({name:t.name,specialty:t.specialty,dur:t.dur,price:t.price,needsNurse:t.needsNurse}); setAdding(false); };
  const cancel = () => { setAdding(false); setEditing(null); };
  const save = () => { if(editing) setTreatments(prev=>prev.map(t=>t.id===editing?{...t,...form}:t)); else if(form.name) setTreatments(prev=>[...prev,{id:`t${Date.now()}`,...form,active:true}]); cancel(); };
  const groups = SPEC_LIST.map(s=>({s,items:treatments.filter(t=>t.specialty===s)})).filter(g=>g.items.length>0);
  const TxForm = () => (
    <FormBox>
      <div style={{ fontSize:13,fontWeight:700,color:'#111814' }}>{editing?'Edit treatment':'New treatment'}</div>
      <FormGrid>
        <FormField label="Treatment name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></FormField>
        <FormField label="Specialty"><select value={form.specialty} onChange={e=>setForm({...form,specialty:e.target.value})}>{SPEC_LIST.map(s=><option key={s}>{s}</option>)}</select></FormField>
        <FormField label="Duration (min)"><input type="number" value={form.dur} onChange={e=>setForm({...form,dur:parseInt(e.target.value)||30})} style={{fontFamily:"'IBM Plex Mono',monospace"}} /></FormField>
        <FormField label="Default price (QAR)"><input type="number" value={form.price} onChange={e=>setForm({...form,price:parseInt(e.target.value)||0})} style={{fontFamily:"'IBM Plex Mono',monospace"}} /></FormField>
      </FormGrid>
      <label style={{ display:'flex',alignItems:'center',gap:8,fontSize:13,fontWeight:500,color:'#2A3830',cursor:'pointer' }}>
        <input type="checkbox" checked={form.needsNurse} onChange={e=>setForm({...form,needsNurse:e.target.checked})} style={{ width:15,height:15,flexShrink:0 }} />
        Nurse assist recommended for this procedure
      </label>
      <FormActions onCancel={cancel} onSave={save} saveLabel={editing?'Save changes':'Add treatment'} disabled={!form.name} />
    </FormBox>
  );
  return (
    <div>
      {!adding&&!editing&&<div style={{ display:'flex',justifyContent:'flex-end',marginBottom:12 }}><PrimaryBtn onClick={()=>setAdding(true)}><Plus size={14}/>Add treatment</PrimaryBtn></div>}
      {(adding||editing)&&<div style={{marginBottom:14}}><TxForm/></div>}
      {groups.map(g=>(
        <SettingsCard key={g.s} title={g.s} sub={`${g.items.length} treatments`}>
          <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
            {g.items.map(t=>(
              <div key={t.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,border:'1px solid #DCE4E0',background:t.active?'#fff':'#F8FAF9',opacity:t.active?1:.5 }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{ fontSize:13,fontWeight:600,color:'#111814' }}>{t.name}</span>
                    {t.needsNurse&&<span style={{ fontSize:12,fontWeight:700,padding:'2px 7px',borderRadius:20,background:'#EDE9FE',color:'#5B21B6' }}>+ nurse</span>}
                  </div>
                  <div style={{ fontSize:12,color:'#4E6860',marginTop:2 }}>{t.dur}min · QAR {t.price.toLocaleString()}</div>
                </div>
                <button onClick={()=>startEdit(t)} style={{ fontSize:12,fontWeight:600,padding:'4px 10px',borderRadius:7,border:'1px solid #DCE4E0',background:'#F5F8F7',color:'#4A6860',display:'flex',alignItems:'center',gap:4 }}><Edit3 size={11}/>Edit</button>
                <ActiveBadge active={t.active} onToggle={()=>setTreatments(prev=>prev.map(x=>x.id===t.id?{...x,active:!x.active}:x))} />
              </div>
            ))}
          </div>
        </SettingsCard>
      ))}
    </div>
  );
}
