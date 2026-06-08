import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, Calendar, Package, Users,
  FileText, Send, ChevronRight, ArrowUpRight, ArrowDownRight, Activity,
  CreditCard, Banknote, Shield, Clock, Bell, Settings, ChevronDown,
  DollarSign, Percent, BarChart3, ArrowRight, Search, ExternalLink,
  Stethoscope, Sparkles, AlertCircle, CheckCircle2, Printer, Download,
  Plus, Edit3, Trash2, GripVertical, Save, X, RefreshCw, UserPlus,
  LayoutGrid, ChevronUp, ArrowLeftRight
} from 'lucide-react';

// =====================================================================
// MEDLY — Admin Dashboard v2
// New tabs: Reports, Daily Report, Settings
// =====================================================================

const MONTHS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

const REVENUE_DATA = [
  { month: 'Dec', booked: 178400, collected: 162100, dental: 124800, aesthetic: 53600 },
  { month: 'Jan', booked: 192700, collected: 184200, dental: 138900, aesthetic: 53800 },
  { month: 'Feb', booked: 210500, collected: 198400, dental: 142300, aesthetic: 68200 },
  { month: 'Mar', booked: 225800, collected: 211900, dental: 156100, aesthetic: 69700 },
  { month: 'Apr', booked: 248300, collected: 224500, dental: 168800, aesthetic: 79500 },
  { month: 'May', booked: 242100, collected: 198700, dental: 161200, aesthetic: 80900 },
];

const COST_BREAKDOWN = [
  { category: 'Salaries',             amount: 92400,  pct: 38, trend: +4,  color: '#1d9e75' },
  { category: 'Supplies',             amount: 38700,  pct: 16, trend: +12, color: '#d85a30', alert: true },
  { category: 'Rent & utilities',     amount: 28500,  pct: 12, trend: 0,   color: '#378add' },
  { category: 'Insurance & licenses', amount: 12200,  pct: 5,  trend: 0,   color: '#7f77dd' },
  { category: 'Marketing',            amount: 18400,  pct: 8,  trend: +22, color: '#ef9f27', alert: true },
  { category: 'Lab outsourcing',      amount: 21300,  pct: 9,  trend: -3,  color: '#5dcaa5' },
  { category: 'Other',                amount: 29500,  pct: 12, trend: +2,  color: '#888780' },
];

const INIT_DOCTORS = [
  { id: 'd1', name: 'Dr. Layla Al-Mahmoud', specialty: 'General Dentistry',  color: 'rose',    qchp: 'QCHP-D-44218', active: true,  calOrder: 1, revenue: 52400, utilization: 86, ticket: 825,  noshow: 6, hours: 142 },
  { id: 'd2', name: 'Dr. Omar Al-Sayed',    specialty: 'Orthodontics',        color: 'amber',   qchp: 'QCHP-D-51209', active: true,  calOrder: 2, revenue: 41800, utilization: 78, ticket: 1240, noshow: 4, hours: 128 },
  { id: 'd3', name: 'Dr. Priya Menon',      specialty: 'Endodontics',         color: 'teal',    qchp: 'QCHP-D-39871', active: true,  calOrder: 3, revenue: 38200, utilization: 71, ticket: 1850, noshow: 2, hours: 114 },
  { id: 'd4', name: 'Dr. Yusuf Hassan',     specialty: 'Cosmetic Dentistry',  color: 'violet',  qchp: 'QCHP-D-47502', active: true,  calOrder: 4, revenue: 28800, utilization: 64, ticket: 2200, noshow: 9, hours: 96  },
  { id: 'd5', name: 'Dr. Reem Al-Thani',    specialty: 'Aesthetic Medicine',  color: 'sky',     qchp: 'QCHP-M-22041', active: true,  calOrder: 5, revenue: 48700, utilization: 82, ticket: 1980, noshow: 3, hours: 132 },
  { id: 'd6', name: 'Dr. Marcus Chen',      specialty: 'Aesthetic Medicine',  color: 'emerald', qchp: 'QCHP-M-29116', active: true,  calOrder: 6, revenue: 32200, utilization: 67, ticket: 1720, noshow: 7, hours: 108 },
];

const INIT_NURSES = [
  { id: 'n1', name: 'Nurse Dina Khalil',   specialty: 'Aesthetic', active: true },
  { id: 'n2', name: 'Nurse Sara Al-Amin',  specialty: 'Dental',    active: true },
  { id: 'n3', name: 'Nurse Mariam Hassan', specialty: 'General',   active: true },
  { id: 'n4', name: 'Nurse Aliya Rahman',  specialty: 'Aesthetic', active: true },
];

const INIT_TRAINEES = [
  { id: 'tr1', name: 'Trainee Ahmed Al-Sulaiti', specialty: 'General Dentistry',  supervisorIds: ['d1', 'd4'], active: true },
  { id: 'tr2', name: 'Trainee Maryam Jaber',     specialty: 'Aesthetic Medicine', supervisorIds: ['d5'],       active: true },
  { id: 'tr3', name: 'Trainee Faris Al-Dosari',  specialty: 'Orthodontics',       supervisorIds: ['d2'],       active: false },
];

const INIT_TREATMENTS = [
  { id: 't1',  name: 'Consultation',          specialty: 'General Dentistry',  dur: 30,  price: 250,  needsNurse: false, active: true },
  { id: 't2',  name: 'Cleaning & polish',     specialty: 'General Dentistry',  dur: 45,  price: 400,  needsNurse: true,  active: true },
  { id: 't3',  name: 'Filling',               specialty: 'General Dentistry',  dur: 45,  price: 600,  needsNurse: true,  active: true },
  { id: 't4',  name: 'Extraction',            specialty: 'General Dentistry',  dur: 60,  price: 800,  needsNurse: true,  active: true },
  { id: 't5',  name: 'Root canal treatment',  specialty: 'Endodontics',         dur: 90,  price: 2500, needsNurse: true,  active: true },
  { id: 't6',  name: 'Braces adjustment',     specialty: 'Orthodontics',        dur: 30,  price: 450,  needsNurse: true,  active: true },
  { id: 't7',  name: 'Teeth whitening',       specialty: 'Cosmetic Dentistry',  dur: 60,  price: 1500, needsNurse: true,  active: true },
  { id: 't8',  name: 'Botox',                 specialty: 'Aesthetic Medicine',  dur: 45,  price: 1800, needsNurse: true,  active: true },
  { id: 't9',  name: 'Dermal filler',         specialty: 'Aesthetic Medicine',  dur: 60,  price: 2400, needsNurse: true,  active: true },
  { id: 't10', name: 'Hydrafacial',           specialty: 'Aesthetic Medicine',  dur: 60,  price: 1200, needsNurse: true,  active: true },
  { id: 't11', name: 'Laser hair removal',    specialty: 'Aesthetic Medicine',  dur: 45,  price: 800,  needsNurse: true,  active: true },
  { id: 't12', name: 'Chemical peel',         specialty: 'Aesthetic Medicine',  dur: 60,  price: 900,  needsNurse: true,  active: true },
];

// Treatment-wise report data
const TREATMENT_REPORT = [
  { name: 'Botox',              count: 38, revenue: 68400, avgTicket: 1800, insured: 0,     selfPay: 68400, specialty: 'Aesthetic Medicine' },
  { name: 'Root canal',         count: 12, revenue: 30000, avgTicket: 2500, insured: 22000, selfPay: 8000,  specialty: 'Endodontics' },
  { name: 'Dermal filler',      count: 14, revenue: 33600, avgTicket: 2400, insured: 0,     selfPay: 33600, specialty: 'Aesthetic Medicine' },
  { name: 'Cleaning & polish',  count: 52, revenue: 20800, avgTicket: 400,  insured: 14200, selfPay: 6600,  specialty: 'General Dentistry' },
  { name: 'Teeth whitening',    count: 11, revenue: 16500, avgTicket: 1500, insured: 0,     selfPay: 16500, specialty: 'Cosmetic Dentistry' },
  { name: 'Hydrafacial',        count: 18, revenue: 21600, avgTicket: 1200, insured: 0,     selfPay: 21600, specialty: 'Aesthetic Medicine' },
  { name: 'Filling',            count: 29, revenue: 17400, avgTicket: 600,  insured: 11200, selfPay: 6200,  specialty: 'General Dentistry' },
  { name: 'Extraction',         count: 16, revenue: 12800, avgTicket: 800,  insured: 8400,  selfPay: 4400,  specialty: 'General Dentistry' },
  { name: 'Braces adjustment',  count: 22, revenue: 9900,  avgTicket: 450,  insured: 6200,  selfPay: 3700,  specialty: 'Orthodontics' },
  { name: 'Laser hair removal', count: 9,  revenue: 7200,  avgTicket: 800,  insured: 0,     selfPay: 7200,  specialty: 'Aesthetic Medicine' },
];

// Daily report mock data for 24 May 2026
const DAILY_TRANSACTIONS = [
  { id: 'tx1',  time: '09:00', patient: 'Fatima Al-Mansoori', fileNo: 'YC-2025-0317', doctor: 'Dr. Layla Al-Mahmoud', treatment: 'Cleaning & polish', amount: 400,  method: 'Card',  insurer: null,   status: 'paid',      corrected: false },
  { id: 'tx2',  time: '09:30', patient: 'James Patterson',     fileNo: 'YC-2024-0089', doctor: 'Dr. Omar Al-Sayed',    treatment: 'Braces adjustment', amount: 450,  method: 'Cash',  insurer: null,   status: 'paid',      corrected: false },
  { id: 'tx3',  time: '10:00', patient: 'Aisha Al-Kuwari',     fileNo: 'YC-2024-0142', doctor: 'Dr. Layla Al-Mahmoud', treatment: 'Extraction',        amount: 800,  method: 'Card',  insurer: 'QLM',  status: 'paid',      corrected: false },
  { id: 'tx4',  time: '10:30', patient: 'Khalid Al-Emadi',     fileNo: 'YC-2026-0028', doctor: 'Dr. Reem Al-Thani',    treatment: 'Botox',             amount: 1800, method: 'Card',  insurer: null,   status: 'paid',      corrected: false },
  { id: 'tx5',  time: '11:00', patient: 'Sara Nasser',         fileNo: 'YC-2025-0204', doctor: 'Dr. Priya Menon',      treatment: 'Root canal',        amount: 2500, method: 'NAPS',  insurer: 'AXA',  status: 'paid',      corrected: false },
  { id: 'tx6',  time: '11:30', patient: 'Mohammed Al-Ali',     fileNo: 'YC-2024-0312', doctor: 'Dr. Marcus Chen',      treatment: 'Dermal filler',     amount: 2400, method: 'Apple Pay', insurer: null, status: 'paid',    corrected: false },
  { id: 'tx7',  time: '13:00', patient: 'Noura Al-Sulaiti',    fileNo: 'YC-2025-0418', doctor: 'Dr. Yusuf Hassan',     treatment: 'Teeth whitening',   amount: 1500, method: 'Card',  insurer: null,   status: 'paid',      corrected: false },
  { id: 'tx8',  time: '14:00', patient: 'Aisha Al-Kuwari',     fileNo: 'YC-2024-0142', doctor: 'Dr. Priya Menon',      treatment: 'Root canal',        amount: 2500, method: 'Insurance', insurer: 'QLM', status: 'pending', corrected: false },
  { id: 'tx9',  time: '14:30', patient: 'Reem Al-Hajri',       fileNo: 'YC-2026-0055', doctor: 'Dr. Reem Al-Thani',    treatment: 'Hydrafacial',       amount: 1200, method: 'Card',  insurer: null,   status: 'paid',      corrected: false },
  { id: 'tx10', time: '15:30', patient: 'Ahmed Al-Marri',      fileNo: 'YC-2025-0137', doctor: 'Dr. Layla Al-Mahmoud', treatment: 'Filling',           amount: 600,  method: 'Cash',  insurer: 'Daman', status: 'paid',     corrected: true, correctionNote: 'Amount corrected from QAR 800 — wrong procedure code used initially.' },
];

const ATTENTION_ITEMS = [
  { kind: 'claims',   icon: Shield,      priority: 'high',   title: '8 claims awaiting QLM response',      sub: 'QAR 47,200 receivable · 6+ days old',    cta: 'Review claims' },
  { kind: 'supply',   icon: Package,     priority: 'high',   title: 'Botox stock low — 4 vials remaining', sub: 'Dr. Reem booked 9 patients this week',   cta: 'Reorder' },
  { kind: 'license',  icon: FileText,    priority: 'medium', title: "Dr. Hassan QCHP license expires",     sub: 'June 30 · 38 days · renewal pending',    cta: 'Track renewal' },
  { kind: 'payroll',  icon: Banknote,    priority: 'medium', title: 'Monthly payroll SIF due',             sub: 'May 28 · WPS submission to QNB',         cta: 'Prepare' },
  { kind: 'lab',      icon: AlertCircle, priority: 'low',    title: 'Lab invoice mismatch',                sub: 'NobelBiocare · QAR 1,420 over expected', cta: 'Investigate' },
];

const CLAIMS_PIPELINE = [
  { status: 'Submitted',    count: 12, value: 38900, color: 'bg-stone-400' },
  { status: 'Adjudicating', count: 8,  value: 47200, color: 'bg-amber-500' },
  { status: 'Approved',     count: 6,  value: 24100, color: 'bg-emerald-500' },
  { status: 'Disputed',     count: 2,  value: 8800,  color: 'bg-red-500' },
];

const qar = (n) => `QAR ${Number(n).toLocaleString()}`;

// =====================================================================
// MAIN
// =====================================================================
export default function AdminPrototype() {
  const [tab, setTab] = useState('dashboard');
  const [period, setPeriod] = useState('month');
  const [doctors, setDoctors] = useState(INIT_DOCTORS);
  const [nurses, setNurses] = useState(INIT_NURSES);
  const [trainees, setTrainees] = useState(INIT_TRAINEES);
  const [treatments, setTreatments] = useState(INIT_TREATMENTS);
  const [transactions, setTransactions] = useState(DAILY_TRANSACTIONS);

  const current = REVENUE_DATA[REVENUE_DATA.length - 1];
  const previous = REVENUE_DATA[REVENUE_DATA.length - 2];
  const totalCosts = COST_BREAKDOWN.reduce((s, c) => s + c.amount, 0);
  const grossMargin = ((current.collected - totalCosts) / current.collected * 100).toFixed(1);
  const monthlyProfit = current.collected - totalCosts;
  const taxAccrual = Math.max(0, monthlyProfit * 0.10);
  const eosLiability = 184000;

  const TABS = [
    { id: 'dashboard',    label: 'Dashboard' },
    { id: 'reports',      label: 'Reports' },
    { id: 'daily',        label: 'Daily report' },
    { id: 'settings',     label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: '"IBM Plex Sans", "Noto Sans Arabic", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .mono { font-family: "IBM Plex Mono", monospace; }
      `}</style>

      {/* Top bar */}
      <header className="border-b border-stone-200 bg-white">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-stone-900 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">M</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Medly Admin</div>
              <div className="text-xs text-stone-500">Yasmeen Clinic, Doha</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tab === 'dashboard' && (
              <div className="flex border border-stone-300 rounded-md overflow-hidden text-xs">
                {['week', 'month', 'quarter'].map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 capitalize ${period === p ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
            <button className="p-1.5 hover:bg-stone-100 rounded text-stone-500 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>
            <div className="px-3 py-1.5 text-xs bg-stone-100 rounded-md text-stone-700">Dr. Mehta · Owner</div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="px-6 flex gap-0 border-t border-stone-100">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* KPI strip — only on dashboard tab */}
      {tab === 'dashboard' && (
        <section className="bg-white border-b border-stone-200 px-6 py-4">
          <div className="grid grid-cols-4 gap-6">
            <HeadlineKPI label="Booked revenue (May, MTD)" value={current.booked} previous={previous.booked} currency sub={`vs ${previous.booked.toLocaleString()} in ${previous.month}`} />
            <HeadlineKPI label="Collected (in bank)" value={current.collected} previous={previous.collected} currency sub={`${Math.round(current.collected / current.booked * 100)}% of booked`} />
            <HeadlineKPI label="Receivables" value={current.booked - current.collected} previous={previous.booked - previous.collected} currency inverted sub="Mostly QLM, AXA awaiting adjudication" />
            <HeadlineKPI label="Gross margin" value={grossMargin} previous={32.8} unit="%" sub="Industry benchmark: 35-45%" />
          </div>
        </section>
      )}

      {/* ── TAB CONTENT ──────────────────────────────────────────── */}
      {tab === 'dashboard' && (
        <main className="px-6 py-5 grid grid-cols-12 gap-4">
          <div className="col-span-8 space-y-4">
            <Card title="Revenue trend" subtitle="Last 6 months · Booked vs Collected · Split by specialty">
              <RevenueChart data={REVENUE_DATA} />
              <div className="mt-3 flex items-center gap-4 text-[11px] text-stone-600 border-t border-stone-100 pt-3">
                <Legend dot="bg-sky-500" label="Dental" />
                <Legend dot="bg-rose-400" label="Aesthetic" />
                <div className="ml-auto text-stone-500">YTD: <span className="mono font-semibold text-stone-900">QAR {REVENUE_DATA.reduce((s, m) => s + m.collected, 0).toLocaleString()}</span></div>
              </div>
            </Card>
            <Card title="Where the money went" subtitle="Costs this month · Watch the arrows">
              <CostBreakdown items={COST_BREAKDOWN} />
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500">Total costs · May</span>
                <span className="mono font-semibold">QAR {totalCosts.toLocaleString()}</span>
              </div>
            </Card>
            <Card title="Doctor productivity" subtitle="May · Revenue, utilisation, avg ticket">
              <DoctorLeaderboard doctors={doctors} />
            </Card>
          </div>
          <aside className="col-span-4 space-y-4">
            <Card title="Needs your attention" subtitle={`${ATTENTION_ITEMS.length} items`}>
              <div className="divide-y divide-stone-100 -mx-3">
                {ATTENTION_ITEMS.map((item, i) => <AttentionRow key={i} item={item} />)}
              </div>
            </Card>
            <Card title="Claims pipeline" subtitle="Insurance receivables">
              <ClaimsPipeline items={CLAIMS_PIPELINE} />
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500">Total receivable</span>
                <span className="mono font-semibold">QAR {CLAIMS_PIPELINE.reduce((s, c) => s + c.value, 0).toLocaleString()}</span>
              </div>
            </Card>
            <Card title="Obligations & accruals" subtitle="What you owe (now or later)">
              <div className="space-y-2.5 text-xs">
                <ObligationRow label="May payroll" sub="WPS due May 28" amount={92400} urgent />
                <ObligationRow label="EOS gratuity liability" sub="Accumulated · 11 staff" amount={eosLiability} informational />
                <ObligationRow label="Corporate tax accrual (MTD)" sub="10% on net profit · GTA" amount={taxAccrual} informational />
                <ObligationRow label="VAT" sub="Not yet in force in Qatar" amount={0} informational />
              </div>
            </Card>
          </aside>
        </main>
      )}

      {tab === 'reports'  && <ReportsTab doctors={doctors} />}
      {tab === 'daily'    && <DailyReportTab transactions={transactions} setTransactions={setTransactions} doctors={doctors} />}
      {tab === 'settings' && <SettingsTab doctors={doctors} setDoctors={setDoctors} nurses={nurses} setNurses={setNurses} trainees={trainees} setTrainees={setTrainees} treatments={treatments} setTreatments={setTreatments} transactions={transactions} setTransactions={setTransactions} />}
    </div>
  );
}

// =====================================================================
// REPORTS TAB — treatment-wise and doctor-wise with date range
// =====================================================================
function ReportsTab({ doctors }) {
  const [view, setView]     = useState('treatment');
  const [dateFrom, setFrom] = useState('2026-05-01');
  const [dateTo,   setTo]   = useState('2026-05-24');
  const [sortBy, setSortBy] = useState('revenue');

  // Scale mock data proportionally to the selected date range.
  // Reference: TREATMENT_REPORT is calibrated to 24 days (May 1–24).
  // When the range changes, counts and amounts scale accordingly so the
  // report feels live. Average ticket stays constant — it's a ratio.
  const REF_DAYS = 24;
  const rangeDays = useMemo(() => {
    const from = new Date(dateFrom);
    const to   = new Date(dateTo);
    if (isNaN(from) || isNaN(to) || to < from) return REF_DAYS;
    return Math.max(1, Math.round((to - from) / 86400000) + 1);
  }, [dateFrom, dateTo]);
  const scale = rangeDays / REF_DAYS;

  const scaledTreatments = useMemo(() => {
    return TREATMENT_REPORT.map(t => ({
      ...t,
      count:   Math.max(0, Math.round(t.count   * scale)),
      revenue: Math.round(t.revenue * scale),
      insured: Math.round(t.insured * scale),
      selfPay: Math.round(t.selfPay * scale),
      // avgTicket is unchanged — it's per-procedure, not cumulative
    }));
  }, [scale]);

  const sortedTreatments = useMemo(() => {
    return [...scaledTreatments].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [scaledTreatments, sortBy]);

  const totalRevenue = scaledTreatments.reduce((s, t) => s + t.revenue, 0);
  const totalCount   = scaledTreatments.reduce((s, t) => s + t.count, 0);
  const totalInsured = scaledTreatments.reduce((s, t) => s + t.insured, 0);
  const totalSelfPay = scaledTreatments.reduce((s, t) => s + t.selfPay, 0);

  const doctorReport = useMemo(() => doctors.map(d => ({
    ...d,
    treatments: Math.max(0, Math.round((d.revenue / d.ticket) * scale)),
    revenue:    Math.round(d.revenue * scale),
    insured:    Math.round(d.revenue * 0.35 * scale),
    selfPay:    Math.round(d.revenue * 0.65 * scale),
  })), [doctors, scale]);

  const setPreset = (from, to) => { setFrom(from); setTo(to); };

  return (
    <main className="px-6 py-5 space-y-4">
      {/* Controls */}
      <div className="bg-white border border-stone-200 rounded-lg px-4 py-3 flex items-center gap-4 flex-wrap">
        {/* Date range */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-stone-400" />
          <input type="date" value={dateFrom} onChange={e => setFrom(e.target.value)}
            className="text-sm border border-stone-300 rounded px-2 py-1 mono focus:outline-none focus:border-stone-500" />
          <span className="text-stone-400 text-sm">→</span>
          <input type="date" value={dateTo} onChange={e => setTo(e.target.value)}
            className="text-sm border border-stone-300 rounded px-2 py-1 mono focus:outline-none focus:border-stone-500" />
        </div>
        <div className="h-4 w-px bg-stone-200" />
        {/* Quick presets */}
        {[['Today', '2026-05-24', '2026-05-24'], ['This week', '2026-05-18', '2026-05-24'], ['This month', '2026-05-01', '2026-05-24'], ['Last month', '2026-04-01', '2026-04-30']].map(([label, from, to]) => (
          <button key={label} onClick={() => setPreset(from, to)}
            className={`text-xs hover:underline ${dateFrom === from && dateTo === to ? 'text-stone-900 font-semibold underline' : 'text-stone-500 hover:text-stone-900'}`}>
            {label}
          </button>
        ))}
        <span className="text-[10px] text-stone-400 mono">{rangeDays} day{rangeDays !== 1 ? 's' : ''}</span>
        <div className="ml-auto flex rounded-md border border-stone-300 overflow-hidden text-xs">
          <button onClick={() => setView('treatment')} className={`px-3 py-1.5 flex items-center gap-1.5 ${view === 'treatment' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}>
            <BarChart3 className="w-3 h-3" /> By treatment
          </button>
          <button onClick={() => setView('doctor')} className={`px-3 py-1.5 flex items-center gap-1.5 ${view === 'doctor' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}>
            <Users className="w-3 h-3" /> By doctor
          </button>
        </div>
      </div>

      {view === 'treatment' && (
        <Card title="Treatment report" subtitle={`${dateFrom} to ${dateTo} · ${totalCount} procedures · Sorted by ${sortBy}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-200">
                  {[['Treatment', null], ['Specialty', null], ['Count', 'count'], ['Revenue', 'revenue'], ['Avg ticket', 'avgTicket'], ['Insured', 'insured'], ['Self-pay', 'selfPay']].map(([col, key]) => (
                    <th key={col} onClick={() => key && setSortBy(key)}
                      className={`text-left py-2 pr-4 font-semibold text-stone-600 ${key ? 'cursor-pointer hover:text-stone-900' : ''} ${sortBy === key ? 'text-stone-900' : ''}`}>
                      {col}{sortBy === key ? ' ↓' : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sortedTreatments.map(t => (
                  <tr key={t.name} className="hover:bg-stone-50">
                    <td className="py-2.5 pr-4 font-medium">{t.name}</td>
                    <td className="py-2.5 pr-4 text-stone-500">{t.specialty.replace(' Medicine', '').replace(' Dentistry', '')}</td>
                    <td className="py-2.5 pr-4 mono">{t.count}</td>
                    <td className="py-2.5 pr-4 mono font-medium">{qar(t.revenue)}</td>
                    <td className="py-2.5 pr-4 mono text-stone-600">{qar(t.avgTicket)}</td>
                    <td className="py-2.5 pr-4 mono text-sky-700">{t.insured > 0 ? qar(t.insured) : '—'}</td>
                    <td className="py-2.5 pr-4 mono text-stone-700">{qar(t.selfPay)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-stone-300">
                <tr className="font-semibold">
                  <td className="pt-2.5 pr-4">Total</td>
                  <td />
                  <td className="pt-2.5 pr-4 mono">{totalCount}</td>
                  <td className="pt-2.5 pr-4 mono">{qar(totalRevenue)}</td>
                  <td className="pt-2.5 pr-4 mono text-stone-500">{qar(Math.round(totalRevenue / totalCount))}</td>
                  <td className="pt-2.5 pr-4 mono text-sky-700">{qar(totalInsured)}</td>
                  <td className="pt-2.5 pr-4 mono">{qar(totalSelfPay)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {view === 'doctor' && (
        <Card title="Doctor report" subtitle={`${dateFrom} to ${dateTo}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-200">
                  {['Doctor', 'Specialty', 'Procedures', 'Revenue', 'Avg ticket', 'Insured', 'Self-pay', 'Utilisation', 'No-shows'].map(col => (
                    <th key={col} className="text-left py-2 pr-4 font-semibold text-stone-600">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {doctorReport.map(d => (
                  <tr key={d.id} className="hover:bg-stone-50">
                    <td className="py-2.5 pr-4 font-medium">{d.name}</td>
                    <td className="py-2.5 pr-4 text-stone-500">{d.specialty.replace(' Medicine', '').replace(' Dentistry', '')}</td>
                    <td className="py-2.5 pr-4 mono">{d.treatments}</td>
                    <td className="py-2.5 pr-4 mono font-medium">{qar(d.revenue)}</td>
                    <td className="py-2.5 pr-4 mono text-stone-600">{qar(d.ticket)}</td>
                    <td className="py-2.5 pr-4 mono text-sky-700">{qar(d.insured)}</td>
                    <td className="py-2.5 pr-4 mono">{qar(d.selfPay)}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${d.utilization}%` }} />
                        </div>
                        <span className="mono">{d.utilization}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 mono text-stone-500">{d.noshow}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-stone-300">
                <tr className="font-semibold">
                  <td className="pt-2.5 pr-4">Total</td>
                  <td />
                  <td className="pt-2.5 pr-4 mono">{doctorReport.reduce((s, d) => s + d.treatments, 0)}</td>
                  <td className="pt-2.5 pr-4 mono">{qar(doctorReport.reduce((s, d) => s + d.revenue, 0))}</td>
                  <td />
                  <td className="pt-2.5 pr-4 mono text-sky-700">{qar(doctorReport.reduce((s, d) => s + d.insured, 0))}</td>
                  <td className="pt-2.5 pr-4 mono">{qar(doctorReport.reduce((s, d) => s + d.selfPay, 0))}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </main>
  );
}

// =====================================================================
// DAILY REPORT TAB
// =====================================================================
function DailyReportTab({ transactions, setTransactions, doctors }) {
  const [date, setDate]           = useState('2026-05-24');
  const [correcting, setCorrecting] = useState(null); // tx id
  const [correctionAmt, setCorrAmt] = useState('');
  const [correctionNote, setCorrNote] = useState('');

  const paid    = transactions.filter(t => t.status === 'paid');
  const pending = transactions.filter(t => t.status === 'pending');
  const totalCollected  = paid.reduce((s, t) => s + t.amount, 0);
  const totalPending    = pending.reduce((s, t) => s + t.amount, 0);

  // Per-doctor summary
  const doctorSummary = doctors.map(d => {
    const txs = transactions.filter(t => t.doctor === d.name);
    return { ...d, txCount: txs.length, total: txs.reduce((s, t) => s + t.amount, 0) };
  }).filter(d => d.txCount > 0);

  const applyCorrection = (txId) => {
    if (!correctionAmt || !correctionNote) return;
    setTransactions(prev => prev.map(t => t.id === txId
      ? { ...t, amount: parseFloat(correctionAmt), corrected: true, correctionNote }
      : t));
    setCorrecting(null); setCorrAmt(''); setCorrNote('');
  };

  const methodColor = { 'Card': 'bg-sky-100 text-sky-800', 'Cash': 'bg-emerald-100 text-emerald-800', 'NAPS': 'bg-violet-100 text-violet-800', 'Apple Pay': 'bg-stone-100 text-stone-700', 'Insurance': 'bg-amber-100 text-amber-800' };

  return (
    <main className="px-6 py-5 space-y-4">
      {/* Date picker + print */}
      <div className="bg-white border border-stone-200 rounded-lg px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-stone-400" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="text-sm border border-stone-300 rounded px-2 py-1 mono focus:outline-none focus:border-stone-500" />
          <span className="text-sm text-stone-500">Daily report</span>
        </div>
        <button onClick={() => window.print()}
          className="px-3 py-1.5 text-xs border border-stone-300 rounded-md hover:bg-stone-50 flex items-center gap-1.5">
          <Printer className="w-3.5 h-3.5" /> Print / Export PDF
        </button>
      </div>

      {/* Headline totals */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Procedures', value: transactions.length, mono: true },
          { label: 'Collected', value: qar(totalCollected), accent: 'emerald' },
          { label: 'Pending / insurance', value: qar(totalPending), accent: 'amber' },
          { label: 'Total billed', value: qar(totalCollected + totalPending), accent: 'stone' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-stone-200 rounded-lg px-4 py-3">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-1">{k.label}</div>
            <div className={`text-lg font-semibold mono ${k.accent === 'emerald' ? 'text-emerald-700' : k.accent === 'amber' ? 'text-amber-700' : 'text-stone-900'}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* All treatments table */}
      <Card title="All treatments" subtitle={`${date} · ${transactions.length} entries`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200">
                {['Time', 'Patient', 'File #', 'Doctor', 'Treatment', 'Amount (QAR)', 'Method', 'Insurance', 'Status', ''].map(col => (
                  <th key={col} className="text-left py-2 pr-3 font-semibold text-stone-600">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {transactions.map(tx => (
                <React.Fragment key={tx.id}>
                  <tr className={`hover:bg-stone-50 ${tx.corrected ? 'bg-amber-50/40' : ''}`}>
                    <td className="py-2.5 pr-3 mono text-stone-500">{tx.time}</td>
                    <td className="py-2.5 pr-3 font-medium">{tx.patient}</td>
                    <td className="py-2.5 pr-3 mono text-stone-500 text-[10px]">{tx.fileNo}</td>
                    <td className="py-2.5 pr-3 text-stone-600">{tx.doctor.replace('Dr. ', '')}</td>
                    <td className="py-2.5 pr-3">{tx.treatment}</td>
                    <td className="py-2.5 pr-3 mono font-medium">
                      {tx.amount.toLocaleString()}
                      {tx.corrected && <span className="ml-1 text-[9px] text-amber-700 bg-amber-100 px-1 py-0.5 rounded">CORRECTED</span>}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${methodColor[tx.method] || 'bg-stone-100 text-stone-600'}`}>{tx.method}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-stone-500">{tx.insurer || '—'}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${tx.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <button onClick={() => { setCorrecting(correcting === tx.id ? null : tx.id); setCorrAmt(tx.amount); setCorrNote(''); }}
                        className="text-[10px] text-stone-400 hover:text-stone-700 flex items-center gap-0.5">
                        <Edit3 className="w-3 h-3" /> Correct
                      </button>
                    </td>
                  </tr>
                  {tx.corrected && tx.correctionNote && (
                    <tr className="bg-amber-50/60">
                      <td colSpan={10} className="px-3 py-1.5 text-[10px] text-amber-800 italic">
                        Correction note: {tx.correctionNote}
                      </td>
                    </tr>
                  )}
                  {correcting === tx.id && (
                    <tr className="bg-amber-50">
                      <td colSpan={10} className="px-3 py-2.5">
                        <div className="flex items-start gap-3">
                          <div>
                            <div className="text-[10px] font-semibold text-amber-900 mb-1">Corrected amount (QAR)</div>
                            <input type="number" value={correctionAmt} onChange={e => setCorrAmt(e.target.value)}
                              className="w-28 px-2 py-1 text-sm border border-amber-300 rounded mono focus:outline-none focus:border-amber-500" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] font-semibold text-amber-900 mb-1">Reason for correction (required)</div>
                            <input value={correctionNote} onChange={e => setCorrNote(e.target.value)}
                              placeholder="e.g. Wrong procedure code entered, correct amount is..."
                              className="w-full px-2 py-1 text-xs border border-amber-300 rounded focus:outline-none focus:border-amber-500" />
                          </div>
                          <div className="flex gap-1.5 mt-4">
                            <button onClick={() => setCorrecting(null)}
                              className="px-2 py-1 text-[10px] border border-amber-300 rounded hover:bg-white">Cancel</button>
                            <button onClick={() => applyCorrection(tx.id)}
                              disabled={!correctionNote || !correctionAmt}
                              className="px-2 py-1 text-[10px] bg-amber-700 text-white rounded hover:bg-amber-800 disabled:opacity-50">
                              Apply
                            </button>
                          </div>
                        </div>
                        <div className="mt-1.5 text-[9px] text-amber-700">Correction is audited — original entry is preserved. Never deletes.</div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-stone-300">
              <tr className="font-semibold text-xs">
                <td colSpan={5} className="pt-2.5 pr-3">Total</td>
                <td className="pt-2.5 pr-3 mono">{qar(transactions.reduce((s, t) => s + t.amount, 0))}</td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Per-doctor summary */}
      <Card title="Per doctor" subtitle="Summary for the day">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-stone-200">
              {['Doctor', 'Specialty', 'Procedures', 'Total (QAR)'].map(col => (
                <th key={col} className="text-left py-2 pr-4 font-semibold text-stone-600">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {doctorSummary.map(d => (
              <tr key={d.id} className="hover:bg-stone-50">
                <td className="py-2.5 pr-4 font-medium">{d.name}</td>
                <td className="py-2.5 pr-4 text-stone-500">{d.specialty}</td>
                <td className="py-2.5 pr-4 mono">{d.txCount}</td>
                <td className="py-2.5 pr-4 mono font-medium">{qar(d.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-stone-300">
            <tr className="font-semibold">
              <td className="pt-2.5 pr-4">Total</td>
              <td />
              <td className="pt-2.5 pr-4 mono">{doctorSummary.reduce((s, d) => s + d.txCount, 0)}</td>
              <td className="pt-2.5 pr-4 mono">{qar(doctorSummary.reduce((s, d) => s + d.total, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </Card>
    </main>
  );
}

// =====================================================================
// SETTINGS TAB
// =====================================================================
function SettingsTab({ doctors, setDoctors, nurses, setNurses, trainees, setTrainees, treatments, setTreatments, transactions, setTransactions }) {
  const [section, setSection] = useState('doctors');

  const SECTIONS = [
    { id: 'doctors',    label: 'Doctors & calendar order' },
    { id: 'trainees',   label: 'Trainees' },
    { id: 'nurses',     label: 'Nurses' },
    { id: 'treatments', label: 'Treatments' },
  ];

  return (
    <main className="px-6 py-5">
      <div className="flex gap-4">
        {/* Settings sidebar */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-stone-100 last:border-b-0 flex items-center justify-between ${
                  section === s.id ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-50'
                }`}>
                {s.label}
                {section === s.id && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Settings body */}
        <div className="flex-1 min-w-0">
          {section === 'doctors'    && <DoctorSettings    doctors={doctors}    setDoctors={setDoctors} />}
          {section === 'trainees'   && <TraineeSettings   trainees={trainees}  setTrainees={setTrainees} doctors={doctors} />}
          {section === 'nurses'     && <NurseSettings     nurses={nurses}      setNurses={setNurses} />}
          {section === 'treatments' && <TreatmentSettings treatments={treatments} setTreatments={setTreatments} />}
        </div>
      </div>
    </main>
  );
}

// ---- Doctor settings: add, reorder calendar, toggle active ----------
function DoctorSettings({ doctors, setDoctors }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ name: '', specialty: 'General Dentistry', qchp: '', color: 'rose' });
  const [dragIdx, setDragIdx] = useState(null);

  const sorted = [...doctors].sort((a, b) => a.calOrder - b.calOrder);

  const addDoctor = () => {
    if (!form.name || !form.qchp) return;
    const next = { id: `d${Date.now()}`, ...form, active: true, calOrder: doctors.length + 1, revenue: 0, utilization: 0, ticket: 0, noshow: 0, hours: 0 };
    setDoctors(prev => [...prev, next]);
    setForm({ name: '', specialty: 'General Dentistry', qchp: '', color: 'rose' });
    setAdding(false);
  };

  const toggleActive = (id) => setDoctors(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));

  const moveUp = (idx) => {
    if (idx === 0) return;
    const arr = [...sorted];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    setDoctors(prev => prev.map(d => {
      const updated = arr.find(a => a.id === d.id);
      return updated ? { ...d, calOrder: arr.indexOf(updated) + 1 } : d;
    }));
  };

  const moveDown = (idx) => {
    if (idx === sorted.length - 1) return;
    const arr = [...sorted];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    setDoctors(prev => prev.map(d => {
      const updated = arr.find(a => a.id === d.id);
      return updated ? { ...d, calOrder: arr.indexOf(updated) + 1 } : d;
    }));
  };

  const COLORS = ['rose', 'amber', 'teal', 'violet', 'sky', 'emerald'];
  const COLOR_DOT = { rose: 'bg-rose-500', amber: 'bg-amber-500', teal: 'bg-teal-500', violet: 'bg-violet-500', sky: 'bg-sky-500', emerald: 'bg-emerald-500' };

  return (
    <div className="space-y-4">
      <Card title="Doctors" subtitle="Manage doctors and their order in the reception calendar">
        <div className="space-y-1 mb-3">
          {sorted.map((d, idx) => (
            <div key={d.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-md border ${d.active ? 'border-stone-200 bg-white' : 'border-stone-100 bg-stone-50 opacity-60'}`}>
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-0.5 hover:bg-stone-100 rounded disabled:opacity-20">
                  <ChevronUp className="w-3 h-3 text-stone-500" />
                </button>
                <button onClick={() => moveDown(idx)} disabled={idx === sorted.length - 1} className="p-0.5 hover:bg-stone-100 rounded disabled:opacity-20">
                  <ChevronDown className="w-3 h-3 text-stone-500" />
                </button>
              </div>
              {/* Position badge */}
              <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-semibold text-stone-600 flex-shrink-0">
                {idx + 1}
              </div>
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${COLOR_DOT[d.color]}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{d.name}</div>
                <div className="text-[10px] text-stone-500">{d.specialty} · {d.qchp}</div>
              </div>
              <button onClick={() => toggleActive(d.id)}
                className={`text-[10px] px-2 py-0.5 rounded border ${d.active ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' : 'border-stone-300 text-stone-500 hover:bg-stone-100'}`}>
                {d.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
        {!adding ? (
          <button onClick={() => setAdding(true)} className="w-full px-3 py-2 text-xs border border-dashed border-stone-300 rounded-md hover:bg-stone-50 flex items-center justify-center gap-1.5 text-stone-600">
            <UserPlus className="w-3.5 h-3.5" /> Add doctor
          </button>
        ) : (
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-md space-y-2">
            <div className="text-xs font-semibold text-stone-700">New doctor</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-stone-600">Full name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Dr. Name" className="mt-1 w-full px-2 py-1.5 text-xs border border-stone-300 rounded focus:outline-none focus:border-stone-500" />
              </div>
              <div>
                <label className="text-[10px] text-stone-600">QCHP license</label>
                <input value={form.qchp} onChange={e => setForm({ ...form, qchp: e.target.value })}
                  placeholder="QCHP-D-XXXXX" className="mt-1 w-full px-2 py-1.5 text-xs border border-stone-300 rounded mono focus:outline-none focus:border-stone-500" />
              </div>
              <div>
                <label className="text-[10px] text-stone-600">Specialty</label>
                <select value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}
                  className="mt-1 w-full px-2 py-1.5 text-xs border border-stone-300 rounded bg-white focus:outline-none focus:border-stone-500">
                  {['General Dentistry', 'Orthodontics', 'Endodontics', 'Cosmetic Dentistry', 'Aesthetic Medicine', 'General Practice'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-stone-600">Calendar colour</label>
                <div className="mt-1 flex gap-1.5 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setForm({ ...form, color: c })}
                      className={`w-5 h-5 rounded-full ${COLOR_DOT[c]} ${form.color === c ? 'ring-2 ring-offset-1 ring-stone-900' : ''}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setAdding(false)} className="px-3 py-1 text-[11px] border border-stone-300 rounded hover:bg-white">Cancel</button>
              <button onClick={addDoctor} disabled={!form.name || !form.qchp}
                className="px-3 py-1 text-[11px] bg-stone-900 text-white rounded hover:bg-stone-800 disabled:opacity-50 flex items-center gap-1">
                <Save className="w-3 h-3" /> Save doctor
              </button>
            </div>
          </div>
        )}
      </Card>
      <div className="text-xs text-stone-500 flex items-center gap-1.5">
        <LayoutGrid className="w-3.5 h-3.5" /> Order here sets the column sequence in the reception calendar.
      </div>
    </div>
  );
}

// ---- Nurse settings -------------------------------------------------
// ---- Trainee settings: add trainees, assign to one or more doctors -
function TraineeSettings({ trainees, setTrainees, doctors }) {
  const [adding, setAdding]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({ name: '', specialty: 'General Dentistry', supervisorIds: [] });

  const SPECIALTIES = ['General Dentistry', 'Orthodontics', 'Endodontics', 'Cosmetic Dentistry', 'Aesthetic Medicine'];

  const toggleSupervisor = (docId) => {
    setForm(f => ({
      ...f,
      supervisorIds: f.supervisorIds.includes(docId)
        ? f.supervisorIds.filter(id => id !== docId)
        : [...f.supervisorIds, docId],
    }));
  };

  const startEdit = (t) => {
    setEditing(t.id);
    setForm({ name: t.name, specialty: t.specialty, supervisorIds: [...t.supervisorIds] });
    setAdding(false);
  };

  const saveEdit = () => {
    setTrainees(prev => prev.map(t => t.id === editing ? { ...t, ...form } : t));
    setEditing(null);
  };

  const addTrainee = () => {
    if (!form.name) return;
    setTrainees(prev => [...prev, { id: `tr${Date.now()}`, ...form, active: true }]);
    setForm({ name: '', specialty: 'General Dentistry', supervisorIds: [] });
    setAdding(false);
  };

  const cancelForm = () => { setAdding(false); setEditing(null); setForm({ name: '', specialty: 'General Dentistry', supervisorIds: [] }); };

  const TraineeForm = ({ onSave, saveLabel }) => (
    <div className="p-3 bg-stone-50 border border-stone-200 rounded-md space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-stone-600 font-medium">Full name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Trainee Name"
            className="mt-1 w-full px-2 py-1.5 text-xs border border-stone-300 rounded focus:outline-none focus:border-stone-500" />
        </div>
        <div>
          <label className="text-[10px] text-stone-600 font-medium">Specialty</label>
          <select value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}
            className="mt-1 w-full px-2 py-1.5 text-xs border border-stone-300 rounded bg-white focus:outline-none focus:border-stone-500">
            {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Supervisor assignment — multi-select */}
      <div>
        <label className="text-[10px] text-stone-600 font-medium block mb-1.5">
          Supervising doctor(s)
          <span className="ml-1 font-normal text-stone-400">— select one or more</span>
        </label>
        <div className="space-y-1">
          {doctors.filter(d => d.active).map(d => (
            <label key={d.id} className="flex items-center gap-2 cursor-pointer text-xs hover:bg-white rounded px-2 py-1">
              <input
                type="checkbox"
                checked={form.supervisorIds.includes(d.id)}
                onChange={() => toggleSupervisor(d.id)}
                className="w-3.5 h-3.5"
              />
              <span className="font-medium">{d.name}</span>
              <span className="text-stone-400">{d.specialty}</span>
            </label>
          ))}
        </div>
        {form.supervisorIds.length === 0 && (
          <div className="text-[10px] text-amber-600 mt-1 px-2">Select at least one supervising doctor.</div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button onClick={cancelForm} className="px-3 py-1 text-[11px] border border-stone-300 rounded hover:bg-white">Cancel</button>
        <button onClick={onSave} disabled={!form.name || form.supervisorIds.length === 0}
          className="px-3 py-1 text-[11px] bg-stone-900 text-white rounded hover:bg-stone-800 disabled:opacity-50 flex items-center gap-1">
          <Save className="w-3 h-3" /> {saveLabel}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card title="Trainees" subtitle="Trainees appear as assistant doctors in reception and doctor portals. One trainee can be assigned to multiple supervisors.">
        <div className="space-y-1.5 mb-3">
          {trainees.length === 0 && (
            <div className="text-xs text-stone-400 italic py-2">No trainees added yet.</div>
          )}
          {trainees.map(t => {
            const supervisors = doctors.filter(d => t.supervisorIds.includes(d.id));
            return (
              <div key={t.id}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md border ${t.active ? 'border-stone-200 bg-white' : 'border-stone-100 bg-stone-50 opacity-60'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium flex items-center gap-2">
                      {t.name}
                      <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">Trainee</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">{t.specialty}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-1 flex-wrap">
                      <span className="text-stone-400">Supervisors:</span>
                      {supervisors.length > 0
                        ? supervisors.map(d => (
                            <span key={d.id} className="bg-stone-100 px-1.5 py-0.5 rounded">{d.name.replace('Dr. ', 'Dr.')}</span>
                          ))
                        : <span className="text-amber-600">None assigned</span>
                      }
                    </div>
                  </div>
                  <button onClick={() => startEdit(t)}
                    className="text-[10px] text-stone-500 hover:text-stone-900 flex items-center gap-0.5 border border-stone-200 px-2 py-0.5 rounded hover:bg-stone-50">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => setTrainees(prev => prev.map(x => x.id === t.id ? { ...x, active: !x.active } : x))}
                    className={`text-[10px] px-2 py-0.5 rounded border ${t.active ? 'border-emerald-300 text-emerald-700' : 'border-stone-300 text-stone-500'}`}>
                    {t.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
                {editing === t.id && <div className="mt-1.5"><TraineeForm onSave={saveEdit} saveLabel="Save changes" /></div>}
              </div>
            );
          })}
        </div>

        {!adding && !editing && (
          <button onClick={() => setAdding(true)}
            className="w-full px-3 py-2 text-xs border border-dashed border-stone-300 rounded-md hover:bg-stone-50 flex items-center justify-center gap-1.5 text-stone-600">
            <UserPlus className="w-3.5 h-3.5" /> Add trainee
          </button>
        )}
        {adding && <TraineeForm onSave={addTrainee} saveLabel="Add trainee" />}
      </Card>

      <div className="text-xs text-stone-500 leading-relaxed px-1">
        Trainees show as <span className="font-medium text-stone-700">assistant</span> when booking appointments under their supervising doctors. 
        A trainee can be mapped to multiple supervisors; multiple trainees can appear under the same supervisor.
      </div>
    </div>
  );
}

function NurseSettings({ nurses, setNurses }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ name: '', specialty: 'General' });

  const addNurse = () => {
    if (!form.name) return;
    setNurses(prev => [...prev, { id: `n${Date.now()}`, ...form, active: true }]);
    setForm({ name: '', specialty: 'General' });
    setAdding(false);
  };

  return (
    <Card title="Nurses" subtitle="Manage nursing staff available for procedures">
      <div className="space-y-1 mb-3">
        {nurses.map(n => (
          <div key={n.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-md border ${n.active ? 'border-stone-200 bg-white' : 'border-stone-100 bg-stone-50 opacity-60'}`}>
            <div className="flex-1">
              <div className="text-sm font-medium">{n.name}</div>
              <div className="text-[10px] text-stone-500">{n.specialty}</div>
            </div>
            <button onClick={() => setNurses(prev => prev.map(x => x.id === n.id ? { ...x, active: !x.active } : x))}
              className={`text-[10px] px-2 py-0.5 rounded border ${n.active ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' : 'border-stone-300 text-stone-500 hover:bg-stone-100'}`}>
              {n.active ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))}
      </div>
      {!adding ? (
        <button onClick={() => setAdding(true)} className="w-full px-3 py-2 text-xs border border-dashed border-stone-300 rounded-md hover:bg-stone-50 flex items-center justify-center gap-1.5 text-stone-600">
          <Plus className="w-3.5 h-3.5" /> Add nurse
        </button>
      ) : (
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-md space-y-2">
          <div className="text-xs font-semibold">New nurse</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-stone-600">Full name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nurse Name" className="mt-1 w-full px-2 py-1.5 text-xs border border-stone-300 rounded focus:outline-none focus:border-stone-500" />
            </div>
            <div>
              <label className="text-[10px] text-stone-600">Specialty</label>
              <select value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}
                className="mt-1 w-full px-2 py-1.5 text-xs border border-stone-300 rounded bg-white focus:outline-none focus:border-stone-500">
                {['General', 'Dental', 'Aesthetic'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="px-3 py-1 text-[11px] border border-stone-300 rounded hover:bg-white">Cancel</button>
            <button onClick={addNurse} disabled={!form.name}
              className="px-3 py-1 text-[11px] bg-stone-900 text-white rounded hover:bg-stone-800 disabled:opacity-50 flex items-center gap-1">
              <Save className="w-3 h-3" /> Save
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ---- Treatment settings: add / edit / toggle ------------------------
function TreatmentSettings({ treatments, setTreatments }) {
  const [adding, setAdding]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({ name: '', specialty: 'General Dentistry', dur: 30, price: 0, needsNurse: false });

  const SPECIALTIES = ['General Dentistry', 'Orthodontics', 'Endodontics', 'Cosmetic Dentistry', 'Aesthetic Medicine'];

  const startEdit = (t) => {
    setEditing(t.id);
    setForm({ name: t.name, specialty: t.specialty, dur: t.dur, price: t.price, needsNurse: t.needsNurse });
    setAdding(false);
  };

  const saveEdit = () => {
    setTreatments(prev => prev.map(t => t.id === editing ? { ...t, ...form } : t));
    setEditing(null);
  };

  const addTreatment = () => {
    if (!form.name) return;
    setTreatments(prev => [...prev, { id: `t${Date.now()}`, ...form, active: true }]);
    setForm({ name: '', specialty: 'General Dentistry', dur: 30, price: 0, needsNurse: false });
    setAdding(false);
  };

  const bySpecialty = SPECIALTIES.map(s => ({
    specialty: s,
    items: treatments.filter(t => t.specialty === s),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {!adding && !editing && (
          <button onClick={() => { setAdding(true); setEditing(null); }}
            className="px-3 py-1.5 text-xs bg-stone-900 text-white rounded-md hover:bg-stone-800 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add treatment
          </button>
        )}
      </div>

      {(adding || editing) && (
        <Card title={editing ? 'Edit treatment' : 'New treatment'}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-stone-600 font-medium">Treatment name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full px-2 py-1.5 text-xs border border-stone-300 rounded focus:outline-none focus:border-stone-500" />
            </div>
            <div>
              <label className="text-[10px] text-stone-600 font-medium">Specialty</label>
              <select value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}
                className="mt-1 w-full px-2 py-1.5 text-xs border border-stone-300 rounded bg-white focus:outline-none focus:border-stone-500">
                {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-stone-600 font-medium">Default duration (min)</label>
              <input type="number" min="15" step="15" value={form.dur} onChange={e => setForm({ ...form, dur: parseInt(e.target.value) || 30 })}
                className="mt-1 w-full px-2 py-1.5 text-xs border border-stone-300 rounded mono focus:outline-none focus:border-stone-500" />
            </div>
            <div>
              <label className="text-[10px] text-stone-600 font-medium">Default price (QAR)</label>
              <input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full px-2 py-1.5 text-xs border border-stone-300 rounded mono focus:outline-none focus:border-stone-500" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs mt-3 cursor-pointer">
            <input type="checkbox" checked={form.needsNurse} onChange={e => setForm({ ...form, needsNurse: e.target.checked })} className="w-3.5 h-3.5" />
            Nurse assist recommended for this procedure
          </label>
          <div className="flex gap-2 justify-end mt-3">
            <button onClick={() => { setAdding(false); setEditing(null); }} className="px-3 py-1 text-[11px] border border-stone-300 rounded hover:bg-stone-50">Cancel</button>
            <button onClick={editing ? saveEdit : addTreatment} disabled={!form.name}
              className="px-3 py-1 text-[11px] bg-stone-900 text-white rounded hover:bg-stone-800 disabled:opacity-50 flex items-center gap-1">
              <Save className="w-3 h-3" /> {editing ? 'Save changes' : 'Add treatment'}
            </button>
          </div>
        </Card>
      )}

      {bySpecialty.map(group => (
        <Card key={group.specialty} title={group.specialty} subtitle={`${group.items.length} treatments`}>
          <div className="space-y-1">
            {group.items.map(t => (
              <div key={t.id} className={`flex items-center gap-3 px-3 py-2 rounded border ${t.active ? 'border-stone-200 bg-white' : 'border-stone-100 bg-stone-50 opacity-60'}`}>
                <div className="flex-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {t.name}
                    {t.needsNurse && <span className="text-[9px] bg-violet-100 text-violet-800 px-1 py-0.5 rounded">+ nurse</span>}
                  </div>
                  <div className="text-[10px] text-stone-500 mono">{t.dur}min · QAR {t.price.toLocaleString()}</div>
                </div>
                <button onClick={() => startEdit(t)}
                  className="text-[10px] text-stone-500 hover:text-stone-900 flex items-center gap-0.5 border border-stone-200 px-2 py-0.5 rounded hover:bg-stone-50">
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => setTreatments(prev => prev.map(x => x.id === t.id ? { ...x, active: !x.active } : x))}
                  className={`text-[10px] px-2 py-0.5 rounded border ${t.active ? 'border-emerald-300 text-emerald-700' : 'border-stone-300 text-stone-500'}`}>
                  {t.active ? 'Active' : 'Inactive'}
                </button>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// =====================================================================
// SHARED COMPONENTS (unchanged from v1)
// =====================================================================
function HeadlineKPI({ label, value, previous, currency, unit, sub, inverted }) {
  const pct = previous ? ((value - previous) / previous * 100).toFixed(1) : null;
  const up = pct > 0;
  const good = inverted ? !up : up;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-1">{label}</div>
      <div className="text-2xl font-semibold mono">
        {currency ? `QAR ${Number(value).toLocaleString()}` : `${value}${unit || ''}`}
      </div>
      {pct !== null && (
        <div className={`text-xs flex items-center gap-1 mt-0.5 ${good ? 'text-emerald-700' : 'text-red-600'}`}>
          {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(pct)}% vs last period
        </div>
      )}
      {sub && <div className="text-[10px] text-stone-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4">
      <div className="mb-3">
        <div className="text-sm font-semibold">{title}</div>
        {subtitle && <div className="text-[11px] text-stone-500 mt-0.5">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function Legend({ dot, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span>{label}</span>
    </div>
  );
}

function RevenueChart({ data }) {
  const max = Math.max(...data.map(d => d.booked));
  return (
    <div className="flex items-end gap-2 h-36">
      {data.map(d => {
        const bH = (d.booked / max) * 100;
        const cH = (d.collected / max) * 100;
        const dentalH = (d.dental / max) * 100;
        const aestheticH = (d.aesthetic / max) * 100;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-0.5 h-28 relative">
              <div className="flex-1 rounded-sm bg-stone-200 flex flex-col justify-end" style={{ height: `${bH}%` }}>
                <div className="w-full rounded-sm" style={{ height: `${(cH / bH) * 100}%`, background: 'linear-gradient(180deg, #38bdf8 0%, #d1fae5 100%)' }}>
                  <div className="w-full rounded-sm bg-sky-400" style={{ height: `${(dentalH / cH) * 100}%` }} />
                  <div className="w-full rounded-sm bg-rose-300" style={{ height: `${(aestheticH / cH) * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="text-[10px] text-stone-500">{d.month}</div>
          </div>
        );
      })}
    </div>
  );
}

function CostBreakdown({ items }) {
  const total = items.reduce((s, c) => s + c.amount, 0);
  return (
    <div className="space-y-2">
      {items.map(c => (
        <div key={c.category} className="flex items-center gap-3">
          <div className="w-28 text-xs text-stone-700 truncate">{c.category}</div>
          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
          </div>
          <div className="text-xs mono text-stone-700 w-20 text-right">QAR {c.amount.toLocaleString()}</div>
          <div className={`text-[10px] mono w-12 text-right ${c.trend > 10 ? 'text-red-600 font-semibold' : c.trend < 0 ? 'text-emerald-600' : 'text-stone-500'}`}>
            {c.trend > 0 ? `+${c.trend}%` : c.trend < 0 ? `${c.trend}%` : '—'}
            {c.alert && ' ⚠'}
          </div>
        </div>
      ))}
    </div>
  );
}

function DoctorLeaderboard({ doctors }) {
  const sorted = [...doctors].sort((a, b) => b.revenue - a.revenue);
  const max = sorted[0]?.revenue || 1;
  return (
    <div className="space-y-2.5">
      {sorted.map(d => (
        <div key={d.id} className="flex items-center gap-3">
          <div className="w-32 text-xs truncate font-medium">{d.name.replace('Dr. ', '')}</div>
          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-stone-700" style={{ width: `${(d.revenue / max) * 100}%` }} />
          </div>
          <div className="text-xs mono w-24 text-right">QAR {d.revenue.toLocaleString()}</div>
          <div className="text-[10px] text-stone-500 w-16 text-right mono">{d.utilization}% util</div>
          <div className="text-[10px] text-stone-400 w-14 text-right mono">avg {d.ticket.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

function AttentionRow({ item }) {
  const priority = { high: 'text-red-600 bg-red-50', medium: 'text-amber-700 bg-amber-50', low: 'text-stone-500 bg-stone-50' };
  return (
    <div className="px-3 py-2.5 flex items-start gap-2.5">
      <item.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${item.priority === 'high' ? 'text-red-500' : item.priority === 'medium' ? 'text-amber-500' : 'text-stone-400'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium">{item.title}</div>
        <div className="text-[10px] text-stone-500 mt-0.5">{item.sub}</div>
      </div>
      <button className="text-[10px] text-stone-600 hover:text-stone-900 whitespace-nowrap">{item.cta} →</button>
    </div>
  );
}

function ClaimsPipeline({ items }) {
  const total = items.reduce((s, c) => s + c.value, 0);
  return (
    <div className="space-y-2">
      {items.map(c => (
        <div key={c.status} className="flex items-center gap-2">
          <div className="w-20 text-xs text-stone-600">{c.status}</div>
          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${c.color}`} style={{ width: `${(c.value / total) * 100}%` }} />
          </div>
          <div className="text-[10px] mono text-stone-600 w-6 text-right">{c.count}</div>
          <div className="text-xs mono text-stone-700 w-20 text-right">QAR {c.value.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

function ObligationRow({ label, sub, amount, urgent, informational }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className={`font-medium ${urgent ? 'text-red-700' : 'text-stone-700'}`}>{label}</div>
        <div className="text-[10px] text-stone-400 mt-0.5">{sub}</div>
      </div>
      <div className={`mono font-semibold text-sm whitespace-nowrap ${urgent ? 'text-red-700' : informational ? 'text-stone-500' : 'text-stone-900'}`}>
        {amount === 0 ? '—' : `QAR ${amount.toLocaleString()}`}
      </div>
    </div>
  );
}
