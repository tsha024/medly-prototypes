import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, Calendar, Package, Users,
  FileText, Send, ChevronRight, ArrowUpRight, ArrowDownRight, Activity,
  CreditCard, Banknote, Shield, Clock, Bell, Settings, ChevronDown,
  DollarSign, Percent, BarChart3, ArrowRight, Search, ExternalLink,
  Stethoscope, Sparkles, AlertCircle, CheckCircle2
} from 'lucide-react';

// =====================================================================
// MEDLY — Admin Dashboard Prototype
// Qatar dental + aesthetic clinic — the clinic owner's view
// =====================================================================

// ---- Mock data: 6 months of revenue, cost, and procedure data ----
const MONTHS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

const REVENUE_DATA = [
  { month: 'Dec', booked: 178400, collected: 162100, dental: 124800, aesthetic: 53600 },
  { month: 'Jan', booked: 192700, collected: 184200, dental: 138900, aesthetic: 53800 },
  { month: 'Feb', booked: 210500, collected: 198400, dental: 142300, aesthetic: 68200 },
  { month: 'Mar', booked: 225800, collected: 211900, dental: 156100, aesthetic: 69700 },
  { month: 'Apr', booked: 248300, collected: 224500, dental: 168800, aesthetic: 79500 },
  { month: 'May', booked: 242100, collected: 198700, dental: 161200, aesthetic: 80900 }, // current month, partial
];

const COST_BREAKDOWN = [
  { category: 'Salaries', amount: 92400,  pct: 38, trend: +4,  color: '#1d9e75' },
  { category: 'Supplies', amount: 38700,  pct: 16, trend: +12, color: '#d85a30', alert: true },
  { category: 'Rent & utilities', amount: 28500, pct: 12, trend: 0, color: '#378add' },
  { category: 'Insurance & licenses', amount: 12200, pct: 5, trend: 0, color: '#7f77dd' },
  { category: 'Marketing', amount: 18400, pct: 8, trend: +22, color: '#ef9f27', alert: true },
  { category: 'Lab outsourcing', amount: 21300, pct: 9, trend: -3, color: '#5dcaa5' },
  { category: 'Other', amount: 29500, pct: 12, trend: +2, color: '#888780' },
];

const DOCTORS = [
  { id: 'd1', name: 'Dr. Layla Al-Mahmoud',  specialty: 'General Dentistry',  revenue: 52400, utilization: 86, ticket: 825, noshow: 6,  hours: 142 },
  { id: 'd2', name: 'Dr. Omar Al-Sayed',     specialty: 'Orthodontics',       revenue: 41800, utilization: 78, ticket: 1240, noshow: 4, hours: 128 },
  { id: 'd3', name: 'Dr. Priya Menon',       specialty: 'Endodontics',        revenue: 38200, utilization: 71, ticket: 1850, noshow: 2, hours: 114 },
  { id: 'd4', name: 'Dr. Yusuf Hassan',      specialty: 'Cosmetic Dentistry', revenue: 28800, utilization: 64, ticket: 2200, noshow: 9, hours: 96  },
  { id: 'd5', name: 'Dr. Reem Al-Thani',     specialty: 'Aesthetic Medicine', revenue: 48700, utilization: 82, ticket: 1980, noshow: 3, hours: 132 },
  { id: 'd6', name: 'Dr. Marcus Chen',       specialty: 'Aesthetic Medicine', revenue: 32200, utilization: 67, ticket: 1720, noshow: 7, hours: 108 },
];

const ATTENTION_ITEMS = [
  { kind: 'claims',   icon: Shield,     priority: 'high',   title: '8 claims awaiting QLM response',      sub: 'QAR 47,200 receivable · 6+ days old',    cta: 'Review claims' },
  { kind: 'supply',   icon: Package,    priority: 'high',   title: 'Botox stock low — 4 vials remaining', sub: 'Dr. Reem booked 9 patients this week',   cta: 'Reorder' },
  { kind: 'license',  icon: FileText,   priority: 'medium', title: "Dr. Hassan's QCHP license expires",   sub: 'June 30 · 38 days · renewal pending',    cta: 'Track renewal' },
  { kind: 'payroll',  icon: Banknote,   priority: 'medium', title: 'Monthly payroll SIF due',             sub: 'May 28 · WPS submission to QNB',         cta: 'Prepare' },
  { kind: 'lab',      icon: AlertCircle,priority: 'low',    title: 'Lab invoice mismatch',                sub: 'NobelBiocare · QAR 1,420 over expected', cta: 'Investigate' },
];

const CLAIMS_PIPELINE = [
  { status: 'Submitted',   count: 12, value: 38900, color: 'bg-stone-400' },
  { status: 'Adjudicating', count: 8, value: 47200, color: 'bg-amber-500' },
  { status: 'Approved',    count: 6,  value: 24100, color: 'bg-emerald-500' },
  { status: 'Disputed',    count: 2,  value: 8800,  color: 'bg-red-500' },
];

// =====================================================================
export default function AdminPrototype() {
  const [period, setPeriod] = useState('month'); // week | month | quarter
  const current = REVENUE_DATA[REVENUE_DATA.length - 1];
  const previous = REVENUE_DATA[REVENUE_DATA.length - 2];

  const totalCosts = COST_BREAKDOWN.reduce((s, c) => s + c.amount, 0);
  const grossMargin = ((current.collected - totalCosts) / current.collected * 100).toFixed(1);

  // Qatar corporate tax accrual (10% on net profit for foreign-owned)
  const monthlyProfit = current.collected - totalCosts;
  const taxAccrual = Math.max(0, monthlyProfit * 0.10);

  // EOS gratuity liability (3 weeks/year × current monthly salary as a rough proxy)
  const eosLiability = 184000;

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
            <div className="flex border border-stone-300 rounded-md overflow-hidden text-xs">
              {['week', 'month', 'quarter'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 capitalize ${period === p ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button className="p-1.5 hover:bg-stone-100 rounded text-stone-500 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500"></span>
            </button>
            <div className="px-3 py-1.5 text-xs bg-stone-100 rounded-md text-stone-700">
              Dr. Mehta · Owner
            </div>
          </div>
        </div>
      </header>

      {/* HEADLINE STRIP — the four numbers that matter */}
      <section className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-6">
          <HeadlineKPI
            label="Booked revenue (May, MTD)"
            value={current.booked}
            previous={previous.booked}
            currency
            sub={`vs ${previous.booked.toLocaleString()} in ${previous.month}`}
          />
          <HeadlineKPI
            label="Collected (in bank)"
            value={current.collected}
            previous={previous.collected}
            currency
            sub={`${Math.round(current.collected / current.booked * 100)}% of booked`}
          />
          <HeadlineKPI
            label="Receivables"
            value={current.booked - current.collected}
            previous={previous.booked - previous.collected}
            currency
            inverted
            sub="Mostly QLM, AXA awaiting adjudication"
          />
          <HeadlineKPI
            label="Gross margin"
            value={grossMargin}
            previous={32.8}
            unit="%"
            sub="Industry benchmark: 35–45%"
          />
        </div>
      </section>

      {/* MAIN: 12 col grid */}
      <main className="px-6 py-5 grid grid-cols-12 gap-4">
        {/* Left: Revenue chart + cost breakdown */}
        <div className="col-span-8 space-y-4">
          {/* Revenue chart */}
          <Card title="Revenue trend" subtitle="Last 6 months · Booked vs Collected · Split by specialty">
            <RevenueChart data={REVENUE_DATA} />
            <div className="mt-3 flex items-center gap-4 text-[11px] text-stone-600 border-t border-stone-100 pt-3">
              <Legend dot="bg-sky-500" label="Dental" />
              <Legend dot="bg-rose-400" label="Aesthetic" />
              <Legend dot="bg-stone-300" label="Collected (not yet)" />
              <div className="ml-auto text-stone-500">
                YTD: <span className="mono font-semibold text-stone-900">QAR {REVENUE_DATA.reduce((s, m) => s + m.collected, 0).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Cost breakdown */}
          <Card title="Where the money went" subtitle="Costs this month · Watch the arrows">
            <CostBreakdown items={COST_BREAKDOWN} />
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">Total costs · May</span>
              <span className="mono font-semibold">QAR {totalCosts.toLocaleString()}</span>
            </div>
          </Card>

          {/* Doctor productivity */}
          <Card title="Doctor productivity" subtitle="May · Click any row for drill-down">
            <DoctorLeaderboard doctors={DOCTORS} />
          </Card>
        </div>

        {/* Right: Attention + claims + obligations */}
        <aside className="col-span-4 space-y-4">
          {/* Needs your attention */}
          <Card title="Needs your attention" subtitle={`${ATTENTION_ITEMS.length} items`}>
            <div className="divide-y divide-stone-100 -mx-3">
              {ATTENTION_ITEMS.map((item, i) => (
                <AttentionRow key={i} item={item} />
              ))}
            </div>
          </Card>

          {/* Claims pipeline */}
          <Card title="Claims pipeline" subtitle="Insurance receivables">
            <ClaimsPipeline items={CLAIMS_PIPELINE} />
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">Total receivable</span>
              <span className="mono font-semibold">QAR {CLAIMS_PIPELINE.reduce((s, c) => s + c.value, 0).toLocaleString()}</span>
            </div>
          </Card>

          {/* Obligations */}
          <Card title="Obligations & accruals" subtitle="What you owe (now or later)">
            <div className="space-y-2.5 text-xs">
              <ObligationRow
                label="May payroll"
                sub="WPS due May 28"
                amount={92400}
                urgent
              />
              <ObligationRow
                label="EOS gratuity liability"
                sub="Accumulated · 11 staff"
                amount={eosLiability}
                informational
              />
              <ObligationRow
                label="Corporate tax accrual (MTD)"
                sub="10% on net profit · GTA"
                amount={taxAccrual}
                informational
              />
              <ObligationRow
                label="VAT"
                sub="Not yet in force in Qatar"
                amount={0}
                informational
              />
            </div>
          </Card>
        </aside>
      </main>
    </div>
  );
}

// =====================================================================
// HEADLINE KPI
// =====================================================================
function HeadlineKPI({ label, value, previous, currency, unit, sub, inverted }) {
  const change = previous ? ((value - previous) / previous * 100) : 0;
  const isUp = change > 0;
  // "inverted" means up = bad (receivables)
  const goodDirection = inverted ? !isUp : isUp;

  return (
    <div>
      <div className="text-xs text-stone-500">{label}</div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-semibold mono tracking-tight">
          {currency && 'QAR '}{typeof value === 'number' ? value.toLocaleString() : value}{unit && unit}
        </span>
        {previous !== undefined && Math.abs(change) > 0.1 && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${goodDirection ? 'text-emerald-700' : 'text-red-600'}`}>
            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      {sub && <div className="text-[11px] text-stone-500 mt-1">{sub}</div>}
    </div>
  );
}

// =====================================================================
// REUSABLE CARD
// =====================================================================
function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4">
      <div className="mb-3">
        <div className="text-xs font-semibold text-stone-700 uppercase tracking-wide">{title}</div>
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

// =====================================================================
// REVENUE CHART — stacked bars with collected overlay
// =====================================================================
function RevenueChart({ data }) {
  const max = Math.max(...data.map(d => d.booked)) * 1.1;
  const W = 560;
  const H = 180;
  const padding = { left: 50, right: 10, top: 10, bottom: 24 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;
  const barW = chartW / data.length * 0.55;
  const gap = chartW / data.length;

  return (
    <div className="overflow-x-auto">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {/* y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const y = padding.top + chartH - chartH * t;
          const v = Math.round(max * t / 1000);
          return (
            <g key={t}>
              <line x1={padding.left} x2={W - padding.right} y1={y} y2={y} stroke="#e7e5e4" strokeWidth="1" strokeDasharray={t === 0 ? '' : '2 3'} />
              <text x={padding.left - 6} y={y + 3} fontSize="9" fill="#a8a29e" textAnchor="end" className="mono">{v}k</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = padding.left + gap * i + (gap - barW) / 2;
          const dentalH = (d.dental / max) * chartH;
          const aestheticH = (d.aesthetic / max) * chartH;
          const collectedH = (d.collected / max) * chartH;
          const bookedH = (d.booked / max) * chartH;

          return (
            <g key={d.month}>
              {/* Dental portion (bottom) */}
              <rect
                x={x}
                y={padding.top + chartH - dentalH}
                width={barW}
                height={dentalH}
                fill="#38bdf8"
                rx="2"
              />
              {/* Aesthetic portion (top, stacked) */}
              <rect
                x={x}
                y={padding.top + chartH - bookedH}
                width={barW}
                height={aestheticH}
                fill="#fb7185"
                rx="2"
              />
              {/* Collected line — shows gap */}
              <line
                x1={x - 3}
                x2={x + barW + 3}
                y1={padding.top + chartH - collectedH}
                y2={padding.top + chartH - collectedH}
                stroke="#44403c"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
              {/* Month label */}
              <text x={x + barW / 2} y={H - 8} fontSize="10" fill="#78716c" textAnchor="middle" className="mono">{d.month}</text>
              {/* Value at top */}
              <text x={x + barW / 2} y={padding.top + chartH - bookedH - 4} fontSize="8" fill="#57534e" textAnchor="middle" className="mono">{Math.round(d.booked / 1000)}k</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// =====================================================================
// COST BREAKDOWN
// =====================================================================
function CostBreakdown({ items }) {
  const max = Math.max(...items.map(i => i.amount));
  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.category} className="flex items-center gap-3">
          <div className="w-32 text-xs flex-shrink-0">
            <div className="font-medium flex items-center gap-1.5">
              {item.alert && <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />}
              {item.category}
            </div>
          </div>
          <div className="flex-1 relative h-5 bg-stone-50 rounded">
            <div
              className="h-full rounded transition-all"
              style={{ width: `${(item.amount / max) * 100}%`, background: item.color, opacity: 0.85 }}
            />
          </div>
          <div className="w-24 text-right">
            <div className="text-xs font-medium mono">QAR {item.amount.toLocaleString()}</div>
          </div>
          <div className="w-16 text-right flex items-center justify-end gap-0.5">
            {item.trend === 0 ? (
              <span className="text-[10px] text-stone-400">flat</span>
            ) : item.trend > 0 ? (
              <span className={`text-[10px] font-medium flex items-center ${item.alert ? 'text-amber-700' : 'text-stone-500'}`}>
                <ArrowUpRight className="w-2.5 h-2.5" />{item.trend}%
              </span>
            ) : (
              <span className="text-[10px] font-medium text-emerald-700 flex items-center">
                <ArrowDownRight className="w-2.5 h-2.5" />{Math.abs(item.trend)}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// DOCTOR LEADERBOARD
// =====================================================================
function DoctorLeaderboard({ doctors }) {
  const [sort, setSort] = useState('revenue');
  const sorted = [...doctors].sort((a, b) => b[sort] - a[sort]);
  const maxRev = Math.max(...doctors.map(d => d.revenue));

  return (
    <div>
      {/* Sort tabs */}
      <div className="flex items-center gap-1 mb-2 text-[10px]">
        <span className="text-stone-500 uppercase tracking-wide font-semibold mr-2">Sort by</span>
        {[
          { k: 'revenue', label: 'Revenue' },
          { k: 'utilization', label: 'Utilization' },
          { k: 'ticket', label: 'Avg ticket' },
          { k: 'noshow', label: 'No-show %' },
        ].map(s => (
          <button
            key={s.k}
            onClick={() => setSort(s.k)}
            className={`px-2 py-0.5 rounded ${sort === s.k ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-[10px] text-stone-500 uppercase tracking-wide font-semibold border-b border-stone-100 pb-1.5 mb-1">
        <div className="col-span-4">Doctor</div>
        <div className="col-span-3">Revenue</div>
        <div className="col-span-2 text-right">Util.</div>
        <div className="col-span-2 text-right">Avg ticket</div>
        <div className="col-span-1 text-right">No-show</div>
      </div>

      {sorted.map(d => {
        const isDental = !d.specialty.includes('Aesthetic');
        return (
          <button key={d.id} className="w-full grid grid-cols-12 gap-2 items-center py-1.5 text-xs hover:bg-stone-50 -mx-2 px-2 rounded text-left">
            <div className="col-span-4 min-w-0">
              <div className="flex items-center gap-1.5">
                {isDental ? <Stethoscope className="w-3 h-3 text-sky-500 flex-shrink-0" /> : <Sparkles className="w-3 h-3 text-rose-400 flex-shrink-0" />}
                <div className="font-medium truncate">{d.name.replace('Dr. ', '')}</div>
              </div>
              <div className="text-[10px] text-stone-500 ml-4.5">{d.specialty}</div>
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${isDental ? 'bg-sky-400' : 'bg-rose-400'}`} style={{ width: `${(d.revenue / maxRev) * 100}%` }} />
              </div>
              <div className="mono text-stone-700 w-14 text-right text-[11px]">{(d.revenue / 1000).toFixed(1)}k</div>
            </div>
            <div className="col-span-2 text-right mono">
              <span className={d.utilization >= 80 ? 'text-emerald-700' : d.utilization < 70 ? 'text-amber-700' : 'text-stone-700'}>
                {d.utilization}%
              </span>
            </div>
            <div className="col-span-2 text-right mono text-stone-700">{d.ticket}</div>
            <div className="col-span-1 text-right">
              <span className={`mono text-[11px] ${d.noshow > 7 ? 'text-amber-700' : 'text-stone-500'}`}>{d.noshow}%</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// =====================================================================
// ATTENTION ROW
// =====================================================================
function AttentionRow({ item }) {
  const Icon = item.icon;
  const priorityColor = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-stone-300',
  }[item.priority];

  return (
    <button className={`w-full py-2.5 px-3 hover:bg-stone-50 border-l-2 ${priorityColor} flex items-start gap-2.5 text-left`}>
      <Icon className="w-3.5 h-3.5 text-stone-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium leading-tight">{item.title}</div>
        <div className="text-[10px] text-stone-500 mt-0.5">{item.sub}</div>
      </div>
      <span className="text-[10px] text-stone-400 hover:text-stone-900 flex items-center gap-0.5 flex-shrink-0">
        {item.cta}
        <ChevronRight className="w-2.5 h-2.5" />
      </span>
    </button>
  );
}

// =====================================================================
// CLAIMS PIPELINE
// =====================================================================
function ClaimsPipeline({ items }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  return (
    <div>
      {/* Stacked bar */}
      <div className="flex h-6 rounded-md overflow-hidden border border-stone-200">
        {items.map((item, i) => (
          <div
            key={i}
            className={`${item.color} flex items-center justify-center text-[10px] font-medium text-white`}
            style={{ width: `${(item.value / total) * 100}%` }}
            title={`${item.status}: ${item.count} claims, QAR ${item.value.toLocaleString()}`}
          >
            {((item.value / total) * 100) > 10 && item.count}
          </div>
        ))}
      </div>

      {/* Detail rows */}
      <div className="mt-3 space-y-1.5">
        {items.map(item => (
          <div key={item.status} className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
            <span className="flex-1 text-stone-700">{item.status}</span>
            <span className="text-stone-500 mono text-[10px]">{item.count}</span>
            <span className="mono font-medium w-20 text-right">QAR {item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// OBLIGATION ROW
// =====================================================================
function ObligationRow({ label, sub, amount, urgent, informational }) {
  return (
    <div className={`flex items-start gap-2 py-1.5 ${urgent ? 'bg-amber-50 border border-amber-200 px-2 rounded' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium leading-tight ${urgent ? 'text-amber-900' : 'text-stone-900'}`}>
          {label}
        </div>
        <div className={`text-[10px] mt-0.5 ${urgent ? 'text-amber-700' : 'text-stone-500'}`}>{sub}</div>
      </div>
      <div className={`mono text-xs font-medium ${urgent ? 'text-amber-900' : informational ? 'text-stone-600' : 'text-stone-900'}`}>
        QAR {amount.toLocaleString()}
      </div>
    </div>
  );
}
