import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, Shield, CreditCard, Banknote, Smartphone, Receipt,
  CheckCircle2, AlertCircle, AlertTriangle, FileText, Send, X, Plus,
  Calendar, Clock, Printer, Download, Mail, MessageSquare,
  Building2, ArrowRight, Edit3, Percent, Tag, Phone,
  Search, History, RefreshCw, ChevronDown, RotateCcw, CalendarDays, User
} from 'lucide-react';

// =====================================================================
// MEDLY — Patient Checkout Prototype v2
// New: encounter list, patient history tab, downpayments, installments, refunds
// =====================================================================

const PATIENT = {
  id: 'p1', fileNo: 'YC-2024-0142',
  qid: '28934567812',
  nameEn: 'Aisha Al-Kuwari', nameAr: 'عائشة الكواري',
  phone: '+974 5512 4488', email: 'aisha.alk@example.qa',
  insurer: 'QLM', policy: 'QLM-447821',
};

// All encounters for this patient — mix of statuses
const ALL_ENCOUNTERS = [
  {
    id: 'enc1', date: '2026-05-24', status: 'payment_required',
    doctors: ['Dr. Layla Al-Mahmoud', 'Dr. Reem Al-Thani'],
    items: [
      { id: 'i1', code: 'D2391', label: 'Composite filling — tooth #16', specialty: 'dental',    doctor: 'Dr. Layla Al-Mahmoud', price: 600,  insurable: true,  coveragePct: 80, authNumber: 'QLM-PA-118822' },
      { id: 'i2', code: 'D0274', label: 'Bitewing X-rays (4 films)',     specialty: 'dental',    doctor: 'Dr. Layla Al-Mahmoud', price: 220,  insurable: true,  coveragePct: 80, authNumber: 'QLM-PA-118822' },
      { id: 'i3', code: 'M0023', label: 'Botox 20U — glabellar',        specialty: 'aesthetic', doctor: 'Dr. Reem Al-Thani',    price: 1800, insurable: false, coveragePct: 0  },
    ],
    totalAmount: 2620, patientDue: 1820, paid: 0, balance: 1820,
    payments: [],
  },
  {
    id: 'enc2', date: '2026-04-10', status: 'partial_payment',
    doctors: ['Dr. Yusuf Hassan'],
    items: [
      { id: 'j1', code: 'D6010', label: 'Implant consultation + X-ray', specialty: 'dental', doctor: 'Dr. Yusuf Hassan', price: 1200, insurable: true, coveragePct: 80 },
    ],
    totalAmount: 1200, patientDue: 240, paid: 120, balance: 120,
    payments: [
      { id: 'pay1', method: 'card', amount: 120, ref: 'TX441829', date: '2026-04-10', type: 'downpayment' },
    ],
  },
  {
    id: 'enc3', date: '2026-03-01', status: 'paid',
    doctors: ['Dr. Reem Al-Thani'],
    items: [
      { id: 'k1', code: 'M0055', label: 'Dermal filler — tear trough', specialty: 'aesthetic', doctor: 'Dr. Reem Al-Thani', price: 2400, insurable: false, coveragePct: 0 },
    ],
    totalAmount: 2400, patientDue: 2400, paid: 2400, balance: 0,
    payments: [
      { id: 'pay2', method: 'apple', amount: 1200, ref: 'TX338812', date: '2026-03-01', type: 'payment' },
      { id: 'pay3', method: 'card',  amount: 1200, ref: 'TX338813', date: '2026-03-01', type: 'payment' },
    ],
  },
  {
    id: 'enc4', date: '2026-02-14', status: 'paid',
    doctors: ['Dr. Layla Al-Mahmoud'],
    items: [
      { id: 'l1', code: 'D1110', label: 'Cleaning & polish', specialty: 'dental', doctor: 'Dr. Layla Al-Mahmoud', price: 400, insurable: true, coveragePct: 80 },
    ],
    totalAmount: 400, patientDue: 80, paid: 80, balance: 0,
    payments: [
      { id: 'pay4', method: 'cash', amount: 80, ref: 'TX223614', date: '2026-02-14', type: 'payment' },
    ],
  },
  {
    id: 'enc5', date: '2025-12-10', status: 'no_charge',
    doctors: ['Dr. Reem Al-Thani'],
    items: [
      { id: 'm1', code: 'M0001', label: 'Aesthetic consultation', specialty: 'aesthetic', doctor: 'Dr. Reem Al-Thani', price: 0, insurable: false, coveragePct: 0 },
    ],
    totalAmount: 0, patientDue: 0, paid: 0, balance: 0,
    payments: [],
  },
];

const PAYMENT_METHODS = [
  { id: 'card',  label: 'Card (Visa/Mada)', icon: CreditCard  },
  { id: 'cash',  label: 'Cash (QAR)',        icon: Banknote    },
  { id: 'apple', label: 'Apple Pay',         icon: Smartphone  },
  { id: 'naps',  label: 'NAPS transfer',     icon: Building2   },
];

const STATUS_CONFIG = {
  payment_required: { label: 'Payment required', dot: 'bg-amber-500',  chip: 'bg-amber-100 text-amber-800 border-amber-300' },
  partial_payment:  { label: 'Balance remaining', dot: 'bg-orange-500', chip: 'bg-orange-100 text-orange-800 border-orange-300' },
  paid:             { label: 'Paid',              dot: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  no_charge:        { label: 'No charge',         dot: 'bg-stone-400',  chip: 'bg-stone-100 text-stone-600 border-stone-300' },
};

const qar = (n) => `QAR ${Number(n).toLocaleString()}`;
const methodLabel = (id) => PAYMENT_METHODS.find(m => m.id === id)?.label ?? id;

// =====================================================================
// MAIN
// =====================================================================
export default function CheckoutPrototype() {
  const [activeTab,     setActiveTab]     = useState('checkout'); // 'checkout' | 'history'
  const [selectedEncId, setSelectedEncId] = useState('enc1');     // which encounter is active
  const [step,          setStep]          = useState(1);          // 1: review  2: payment  3: complete
  const [encounters,    setEncounters]    = useState(ALL_ENCOUNTERS);
  const [paymentType,   setPaymentType]   = useState('full');     // full | downpayment | installments | refund

  // Per-encounter checkout state (items with covered toggle, discount, splits)
  const [itemOverrides, setItemOverrides] = useState({}); // { encId: { itemId: covered } }
  const [discounts,     setDiscounts]     = useState({}); // { encId: { pct, reason } }
  const [splitsByEnc,   setSplitsByEnc]   = useState({}); // { encId: [splits] }

  const encounter = encounters.find(e => e.id === selectedEncId);

  // Build items with coverage state
  const items = useMemo(() => {
    if (!encounter) return [];
    const overrides = itemOverrides[selectedEncId] || {};
    return encounter.items.map(i => ({
      ...i,
      covered: overrides[i.id] !== undefined ? overrides[i.id] : i.insurable,
    }));
  }, [encounter, itemOverrides, selectedEncId]);

  const discount = discounts[selectedEncId] || { pct: 0, reason: '' };
  const setDiscount = (d) => setDiscounts(prev => ({ ...prev, [selectedEncId]: d }));

  const splits = splitsByEnc[selectedEncId] || [];
  const setSplits = (fn) => setSplitsByEnc(prev => ({
    ...prev,
    [selectedEncId]: typeof fn === 'function' ? fn(prev[selectedEncId] || []) : fn,
  }));

  const subtotal        = items.reduce((s, i) => s + i.price, 0);
  const insuredPortion  = items.filter(i => i.covered).reduce((s, i) => s + (i.price * i.coveragePct / 100), 0);
  const patientPortion  = subtotal - insuredPortion;
  const discountAmount  = patientPortion * (discount.pct / 100);
  const totalDueToday   = patientPortion - discountAmount;
  const alreadyPaid     = encounter?.paid || 0;
  const balance         = Math.max(0, totalDueToday - alreadyPaid);
  const paidSoFar       = splits.reduce((s, p) => s + p.amount, 0);
  const remaining       = Math.max(0, balance - paidSoFar);

  const toggleCoverage = (itemId) => {
    setItemOverrides(prev => {
      const enc = prev[selectedEncId] || {};
      const current = enc[itemId] !== undefined ? enc[itemId] : items.find(i => i.id === itemId)?.insurable;
      return { ...prev, [selectedEncId]: { ...enc, [itemId]: !current } };
    });
  };

  const addSplit = (amount, methodId, ref) => {
    setSplits(prev => [...prev, { methodId, amount, ref: ref || `TX${Date.now().toString().slice(-6)}` }]);
  };

  const markEncounterPaid = () => {
    const total = paidSoFar;
    setEncounters(prev => prev.map(e => e.id === selectedEncId
      ? { ...e, paid: (e.paid || 0) + total, balance: Math.max(0, e.balance - total),
          status: Math.max(0, e.balance - total) <= 0 ? 'paid' : 'partial_payment',
          payments: [...e.payments, ...splits.map(s => ({ ...s, date: '2026-05-24', type: paymentType }))] }
      : e));
    setStep(3);
  };

  const pendingEncounters = encounters.filter(e => e.status === 'payment_required' || e.status === 'partial_payment');

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: '"IBM Plex Sans", "Noto Sans Arabic", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .mono { font-family: "IBM Plex Mono", monospace; }
        .arabic { font-family: "Noto Sans Arabic", sans-serif; }
      `}</style>

      {/* Top bar */}
      <header className="border-b border-stone-200 bg-white">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-1.5 hover:bg-stone-100 rounded text-stone-500"><ChevronLeft className="w-4 h-4" /></button>
            <div className="w-8 h-8 rounded-md bg-stone-900 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">M</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Medly Checkout</div>
              <div className="text-xs text-stone-500">Yasmeen Clinic, Doha</div>
            </div>
          </div>
          {/* Stepper (checkout tab only) */}
          {activeTab === 'checkout' && (
            <div className="flex items-center gap-2">
              {['Review', 'Payment', 'Complete'].map((label, i) => (
                <React.Fragment key={label}>
                  <div className={`flex items-center gap-1.5 ${step > i+1 ? 'text-stone-400' : step === i+1 ? 'text-stone-900' : 'text-stone-400'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${step === i+1 ? 'bg-stone-900 text-white' : step > i+1 ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'}`}>
                      {step > i+1 ? <CheckCircle2 className="w-3 h-3" /> : i+1}
                    </div>
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                  {i < 2 && <ChevronLeft className="w-3 h-3 text-stone-300 rotate-180" />}
                </React.Fragment>
              ))}
            </div>
          )}
          <div className="px-3 py-1.5 text-xs bg-stone-100 rounded-md text-stone-700">Rania M. · Reception</div>
        </div>

        {/* Tab bar + patient strip */}
        <div className="px-6 flex items-center justify-between border-t border-stone-100">
          <div className="flex">
            {[['checkout', 'Checkout'], ['history', 'Patient history']].map(([id, label]) => (
              <button key={id} onClick={() => { setActiveTab(id); setStep(1); }}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
                {label}
              </button>
            ))}
          </div>
          {/* Patient identity */}
          <div className="flex items-center gap-3 py-2">
            <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs font-medium text-stone-700">AK</div>
            <div>
              <div className="text-xs font-semibold">{PATIENT.nameEn}
                <span className="ml-2 mono text-stone-400 font-normal">{PATIENT.fileNo}</span>
              </div>
              <div className="text-[10px] text-stone-500 mono">QID {PATIENT.qid} · {PATIENT.insurer} {PATIENT.policy}</div>
            </div>
            {pendingEncounters.length > 0 && (
              <div className="ml-2 text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                {pendingEncounters.length} pending
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-6 py-5 max-w-7xl mx-auto">
        {activeTab === 'checkout' && (
          <div className="grid grid-cols-12 gap-4">
            {/* Left: encounter list */}
            <aside className="col-span-3">
              <EncounterList
                encounters={encounters}
                selectedId={selectedEncId}
                onSelect={(id) => { setSelectedEncId(id); setStep(1); setSplits([]); }}
                step={step}
              />
            </aside>

            {/* Right: checkout flow */}
            <div className="col-span-9">
              {encounter && step === 1 && (
                <ReviewStep
                  encounter={encounter}
                  items={items}
                  toggleCoverage={toggleCoverage}
                  discount={discount}
                  setDiscount={setDiscount}
                  subtotal={subtotal}
                  insuredPortion={insuredPortion}
                  patientPortion={patientPortion}
                  discountAmount={discountAmount}
                  totalDueToday={totalDueToday}
                  alreadyPaid={alreadyPaid}
                  balance={balance}
                  onContinue={() => setStep(2)}
                />
              )}
              {encounter && step === 2 && (
                <PaymentStep
                  encounter={encounter}
                  balance={balance}
                  paidSoFar={paidSoFar}
                  remaining={remaining}
                  splits={splits}
                  setSplits={setSplits}
                  addSplit={addSplit}
                  paymentType={paymentType}
                  setPaymentType={setPaymentType}
                  onBack={() => setStep(1)}
                  onComplete={markEncounterPaid}
                  insuredPortion={insuredPortion}
                  paidEncounters={encounters.filter(e => e.status === 'paid')}
                />
              )}
              {step === 3 && (
                <CompleteStep
                  patient={PATIENT}
                  encounter={encounter}
                  items={items}
                  splits={splits}
                  paymentType={paymentType}
                  totalDueToday={totalDueToday}
                  insuredPortion={insuredPortion}
                  onNewCheckout={() => { setStep(1); setSelectedEncId('enc1'); setSplits([]); }}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <PatientHistoryView
            patient={PATIENT}
            encounters={encounters}
            onStartCheckout={(encId) => { setActiveTab('checkout'); setSelectedEncId(encId); setStep(1); }}
          />
        )}
      </main>
    </div>
  );
}

// =====================================================================
// ENCOUNTER LIST — left sidebar showing all patient encounters
// =====================================================================
function EncounterList({ encounters, selectedId, onSelect, step }) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden sticky top-4">
      <div className="px-3 py-2.5 border-b border-stone-200 text-xs font-semibold text-stone-700 uppercase tracking-wide">
        Encounters
      </div>
      <div className="divide-y divide-stone-100 max-h-[calc(100vh-220px)] overflow-y-auto">
        {encounters.map(enc => {
          const cfg = STATUS_CONFIG[enc.status];
          const isSelected = enc.id === selectedId;
          const isPending = enc.status === 'payment_required' || enc.status === 'partial_payment';
          const isReadOnly = enc.status === 'paid' || enc.status === 'no_charge';

          // Read-only encounters (paid / no-charge) — not clickable into checkout
          if (isReadOnly) {
            return (
              <div
                key={enc.id}
                className="px-3 py-2.5 opacity-50 cursor-default border-l-2 border-l-transparent"
              >
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <div className="text-xs font-medium mono text-stone-600">{enc.date}</div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${cfg.chip}`}>{cfg.label}</span>
                </div>
                <div className="text-[10px] text-stone-400 truncate">{enc.doctors.join(', ')}</div>
                <div className="text-[10px] text-stone-400 mt-0.5 truncate">{enc.items.map(i => i.label).join(' · ')}</div>
                {enc.status === 'paid' && (
                  <div className="mt-1 text-[10px] mono text-emerald-600">{qar(enc.paid)} paid</div>
                )}
              </div>
            );
          }

          // Pending encounters — clickable
          return (
            <button
              key={enc.id}
              onClick={() => onSelect(enc.id)}
              className={`w-full text-left px-3 py-2.5 hover:bg-stone-50 transition-colors border-l-2 ${
                isSelected ? 'border-l-stone-900 bg-stone-50' : 'border-l-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5 mb-1">
                <div className="text-xs font-medium mono text-stone-700">{enc.date}</div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${cfg.chip}`}>{cfg.label}</span>
              </div>
              <div className="text-[10px] text-stone-500 truncate">{enc.doctors.join(', ')}</div>
              <div className="text-[10px] text-stone-400 mt-0.5 truncate">{enc.items.map(i => i.label).join(' · ')}</div>
              <div className="mt-1.5 text-xs font-semibold mono text-amber-700">
                Balance: {qar(enc.balance)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// STEP 1 — Review
// =====================================================================
function ReviewStep({ encounter, items, toggleCoverage, discount, setDiscount, subtotal, insuredPortion, patientPortion, discountAmount, totalDueToday, alreadyPaid, balance, onContinue }) {
  const [editDiscount, setEditDiscount] = useState(false);
  const [draftDisc, setDraftDisc] = useState({ pct: discount.pct, reason: discount.reason });
  const cfg = STATUS_CONFIG[encounter.status];
  const isNoCharge = encounter.status === 'no_charge' || totalDueToday === 0;

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-8 space-y-4">
        {/* Encounter header */}
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold">{encounter.date} visit</div>
              <div className="text-xs text-stone-500 mt-0.5">{encounter.doctors.join(' · ')}</div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${cfg.chip}`}>{cfg.label}</span>
          </div>

          {alreadyPaid > 0 && (
            <div className="mb-3 px-3 py-2 bg-sky-50 border border-sky-200 rounded text-xs text-sky-900 flex items-center justify-between">
              <span>Downpayment / part-payment already collected</span>
              <span className="mono font-semibold">{qar(alreadyPaid)}</span>
            </div>
          )}

          {/* Line items */}
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className={`p-3 border rounded-md ${item.covered ? 'border-sky-200 bg-sky-50/50' : 'border-stone-200 bg-white'}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-stone-500 mt-0.5">{item.doctor} · {item.code}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold mono">{qar(item.price)}</div>
                    {item.insurable && item.covered && (
                      <div className="text-[10px] text-sky-700 mono">
                        {item.coveragePct}% insured · patient {qar(Math.round(item.price * (1 - item.coveragePct/100)))}
                      </div>
                    )}
                  </div>
                </div>
                {item.insurable && (
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={item.covered} onChange={() => toggleCoverage(item.id)} className="w-3 h-3" />
                      Bill to {encounter.doctors[0]?.includes('Reem') ? 'patient (not insurable)' : 'QLM insurance'}
                    </label>
                    {item.authNumber && <span className="text-[10px] mono text-stone-400">{item.authNumber}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Discount */}
          {!editDiscount ? (
            <button onClick={() => setEditDiscount(true)}
              className="mt-3 w-full px-3 py-2 border border-dashed border-stone-300 rounded-md text-xs text-stone-500 hover:bg-stone-50 flex items-center justify-center gap-1.5">
              <Percent className="w-3 h-3" />
              {discount.pct > 0 ? `Discount applied: ${discount.pct}% (${discount.reason})` : 'Apply discount'}
            </button>
          ) : (
            <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-md space-y-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-medium text-stone-600">Discount %</label>
                  <input type="number" min={0} max={100} value={draftDisc.pct}
                    onChange={e => setDraftDisc({ ...draftDisc, pct: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="mt-1 w-full px-2 py-1.5 text-xs border border-stone-300 rounded mono focus:outline-none focus:border-stone-500" />
                </div>
                <div className="flex-[3]">
                  <label className="text-[10px] font-medium text-stone-600">Reason (required)</label>
                  <input value={draftDisc.reason} onChange={e => setDraftDisc({ ...draftDisc, reason: e.target.value })}
                    placeholder="e.g. Staff family member, loyalty discount..."
                    className="mt-1 w-full px-2 py-1.5 text-xs border border-stone-300 rounded focus:outline-none focus:border-stone-500" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditDiscount(false)} className="px-3 py-1 text-[11px] border border-stone-300 rounded hover:bg-white">Cancel</button>
                <button onClick={() => { setDiscount(draftDisc); setEditDiscount(false); }} disabled={draftDisc.pct > 0 && !draftDisc.reason}
                  className="px-3 py-1 text-[11px] bg-stone-900 text-white rounded hover:bg-stone-800 disabled:opacity-50">Apply</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary sidebar */}
      <aside className="col-span-4">
        <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-3 sticky top-4">
          <div className="text-xs font-semibold text-stone-700 uppercase tracking-wide">Invoice summary</div>
          <div className="space-y-1.5 text-sm">
            <SummaryRow label="Subtotal"        value={qar(subtotal)} />
            {insuredPortion > 0 && <SummaryRow label="Insurance covers" value={`−${qar(insuredPortion)}`} accent="sky" />}
            <SummaryRow label="Patient portion" value={qar(patientPortion)} />
            {discount.pct > 0 && <SummaryRow label={`Discount (${discount.pct}%)`} value={`−${qar(discountAmount)}`} accent="emerald" />}
            <div className="border-t border-stone-200 pt-2 mt-2">
              <SummaryRow label="Total" value={qar(totalDueToday)} bold />
              {alreadyPaid > 0 && <SummaryRow label="Already paid" value={`−${qar(alreadyPaid)}`} accent="emerald" />}
              <SummaryRow label="Balance due now" value={qar(balance)} bold accent={balance > 0 ? 'amber' : 'emerald'} />
            </div>
            <SummaryRow label="VAT (0% — exempt)" value="QAR 0" />
          </div>

          {isNoCharge && (
            <div className="p-2.5 bg-stone-50 border border-stone-200 rounded text-xs text-stone-700 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
              No charge — marked complimentary by doctor. No payment required.
            </div>
          )}

          {/* CTA — only for encounters that need payment */}
          {encounter.status === 'payment_required' || encounter.status === 'partial_payment' ? (
            <button
              onClick={onContinue}
              className="w-full px-3 py-2.5 bg-stone-900 text-white rounded-md hover:bg-stone-800 text-sm font-medium flex items-center justify-center gap-2"
            >
              Proceed to payment
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : encounter.status === 'paid' ? (
            <button className="w-full px-3 py-2.5 border border-stone-300 rounded-md hover:bg-stone-50 text-sm font-medium flex items-center justify-center gap-2 text-stone-700">
              <FileText className="w-3.5 h-3.5" /> View invoice
            </button>
          ) : null /* no_charge — no button */ }
        </div>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value, bold, accent }) {
  const color = accent === 'sky' ? 'text-sky-700' : accent === 'emerald' ? 'text-emerald-700' : accent === 'amber' ? 'text-amber-700' : 'text-stone-900';
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={bold ? 'font-semibold' : 'text-stone-600'}>{label}</span>
      <span className={`mono ${bold ? 'font-semibold text-base' : 'text-sm'} ${color}`}>{value}</span>
    </div>
  );
}

// =====================================================================
// STEP 2 — Payment (full / downpayment / installments / refund)
// =====================================================================
function PaymentStep({ encounter, balance, paidSoFar, remaining, splits, setSplits, addSplit, paymentType, setPaymentType, onBack, onComplete, insuredPortion, paidEncounters }) {
  const [method, setMethod] = useState('card');
  const [splitMode, setSplitMode] = useState(false);
  const [tempAmt, setTempAmt]     = useState('');
  const [downAmt, setDownAmt]     = useState('');
  const [instPlan, setInstPlan]   = useState({ count: 3, frequency: 'monthly', firstDate: '2026-06-01' });
  const [refundEnc, setRefundEnc] = useState(paidEncounters[0]?.id || '');
  const [refundAmt, setRefundAmt] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('original');

  const fullySettled = remaining <= 0.01 || paymentType === 'downpayment' || paymentType === 'installments';
  const canComplete = paymentType === 'refund'
    ? (refundAmt && refundReason)
    : paymentType === 'downpayment'
    ? !!downAmt
    : paymentType === 'installments'
    ? !!instPlan.firstDate
    : fullySettled;

  const perInstalment = instPlan.count > 0 ? Math.ceil(balance / instPlan.count) : 0;
  const refundedEnc = paidEncounters.find(e => e.id === refundEnc);

  const handleComplete = () => {
    if (paymentType === 'downpayment' && downAmt) {
      addSplit(parseFloat(downAmt), method, undefined);
    } else if (paymentType === 'installments') {
      addSplit(perInstalment, method, `INST-1`);
    } else if (paymentType === 'refund') {
      addSplit(-Math.abs(parseFloat(refundAmt)), refundMethod === 'original' ? method : refundMethod, `REF-${Date.now().toString().slice(-6)}`);
    }
    onComplete();
  };

  const PAYMENT_TYPES = [
    { id: 'full',         label: 'Full payment',  desc: 'Collect entire balance now' },
    { id: 'downpayment',  label: 'Downpayment',   desc: 'Partial now, rest later' },
    { id: 'installments', label: 'Installments',  desc: 'Scheduled payments' },
    { id: 'refund',       label: 'Refund',        desc: 'Refund a past payment' },
  ];

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-7 space-y-4">
        {/* Payment type selector */}
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-stone-700 uppercase tracking-wide mb-3">Payment type</div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {PAYMENT_TYPES.map(pt => (
              <button key={pt.id} onClick={() => { setPaymentType(pt.id); setSplits([]); }}
                className={`px-2 py-3 border rounded-md flex flex-col items-center gap-1 text-center hover:border-stone-400 transition-colors ${paymentType === pt.id ? 'border-stone-900 bg-stone-50' : 'border-stone-200'}`}>
                <span className="text-[11px] font-semibold text-stone-800">{pt.label}</span>
                <span className="text-[9px] text-stone-500 leading-tight">{pt.desc}</span>
              </button>
            ))}
          </div>

          {/* Payment method (shown for all except refund) */}
          {paymentType !== 'refund' && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {PAYMENT_METHODS.map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className={`px-2 py-2.5 border rounded-md flex flex-col items-center gap-1.5 hover:border-stone-400 ${method === m.id ? 'border-stone-900 bg-stone-50' : 'border-stone-200'}`}>
                    <Icon className="w-4 h-4 text-stone-600" />
                    <span className="text-[10px] text-stone-700 text-center leading-tight">{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── FULL PAYMENT ── */}
          {paymentType === 'full' && (
            <div className="space-y-2">
              {!splitMode && !fullySettled && (
                <>
                  <button onClick={() => { addSplit(remaining, method); }}
                    className="w-full px-3 py-3 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 text-sm font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Charge full balance — {qar(remaining)}
                  </button>
                  <button onClick={() => setSplitMode(true)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md hover:bg-stone-50 text-xs text-stone-600 flex items-center justify-center gap-1.5">
                    <Plus className="w-3 h-3" /> Split across payment methods
                  </button>
                </>
              )}
              {splitMode && !fullySettled && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-md space-y-2">
                  <div className="text-xs font-semibold text-stone-700">Add partial payment</div>
                  <div className="flex gap-2">
                    <input type="number" value={tempAmt} onChange={e => setTempAmt(e.target.value)}
                      placeholder={`Amount (max ${remaining})`}
                      className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 mono" autoFocus />
                    <button onClick={() => { addSplit(parseFloat(tempAmt), method); setTempAmt(''); setSplitMode(false); }}
                      className="px-3 py-2 bg-stone-900 text-white text-sm rounded-md hover:bg-stone-800">Add</button>
                    <button onClick={() => { setSplitMode(false); setTempAmt(''); }} className="px-2 py-2 text-sm text-stone-500 hover:text-stone-900">Cancel</button>
                  </div>
                </div>
              )}
              {fullySettled && splits.length > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span className="text-sm text-emerald-900 font-medium">Fully collected. Finalize below.</span>
                </div>
              )}
            </div>
          )}

          {/* ── DOWNPAYMENT ── */}
          {paymentType === 'downpayment' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900">
                Patient pays a portion now. The remaining balance is saved and can be collected at a future visit.
              </div>
              <div>
                <label className="text-xs font-medium text-stone-700">Amount to collect now (QAR)</label>
                <input type="number" value={downAmt} onChange={e => setDownAmt(e.target.value)} placeholder={`Max: ${balance}`}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-stone-300 rounded-md mono focus:outline-none focus:border-stone-500" autoFocus />
              </div>
              {downAmt && (
                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-stone-600">Collecting now</span><span className="mono font-semibold">{qar(parseFloat(downAmt) || 0)}</span></div>
                  <div className="flex justify-between"><span className="text-stone-600">Remaining balance saved</span><span className="mono text-amber-700">{qar(Math.max(0, balance - (parseFloat(downAmt) || 0)))}</span></div>
                </div>
              )}
            </div>
          )}

          {/* ── INSTALLMENTS ── */}
          {paymentType === 'installments' && (
            <div className="space-y-3">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-md text-xs text-sky-900">
                Set up a payment schedule. First instalment collected now; remaining are tracked and collected at future visits.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-700">Number of instalments</label>
                  <div className="flex gap-1.5 mt-1.5">
                    {[2, 3, 6, 12].map(n => (
                      <button key={n} onClick={() => setInstPlan({ ...instPlan, count: n })}
                        className={`flex-1 py-1.5 text-xs border rounded ${instPlan.count === n ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 hover:border-stone-500'}`}>{n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-700">Frequency</label>
                  <select value={instPlan.frequency} onChange={e => setInstPlan({ ...instPlan, frequency: e.target.value })}
                    className="mt-1.5 w-full px-2 py-1.5 text-xs border border-stone-300 rounded bg-white focus:outline-none focus:border-stone-500">
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-700">First payment date</label>
                  <input type="date" value={instPlan.firstDate} onChange={e => setInstPlan({ ...instPlan, firstDate: e.target.value })}
                    className="mt-1.5 w-full px-2 py-1.5 text-xs border border-stone-300 rounded mono focus:outline-none focus:border-stone-500" />
                </div>
                <div className="flex items-end">
                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded w-full">
                    <div className="text-[10px] text-stone-500">Per instalment</div>
                    <div className="text-base font-semibold mono">{qar(perInstalment)}</div>
                    <div className="text-[10px] text-stone-400">{instPlan.count}× {instPlan.frequency}</div>
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded text-xs">
                <div className="font-medium text-stone-700 mb-1">Schedule preview</div>
                {Array.from({ length: Math.min(instPlan.count, 4) }, (_, i) => {
                  const d = new Date(instPlan.firstDate);
                  if (instPlan.frequency === 'monthly') d.setMonth(d.getMonth() + i);
                  else if (instPlan.frequency === 'biweekly') d.setDate(d.getDate() + i * 14);
                  else d.setDate(d.getDate() + i * 7);
                  return (
                    <div key={i} className="flex justify-between text-stone-600 mono py-0.5">
                      <span>#{i+1} — {d.toISOString().slice(0,10)}</span>
                      <span>{qar(i < instPlan.count - 1 ? perInstalment : balance - perInstalment * (instPlan.count - 1))}</span>
                    </div>
                  );
                })}
                {instPlan.count > 4 && <div className="text-stone-400 text-[10px] mt-1">+ {instPlan.count - 4} more instalments</div>}
              </div>
            </div>
          )}

          {/* ── REFUND ── */}
          {paymentType === 'refund' && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-900">
                Refunds are audit-logged and cannot be deleted. Always enter a reason.
              </div>
              <div>
                <label className="text-xs font-medium text-stone-700">Select encounter to refund</label>
                <select value={refundEnc} onChange={e => setRefundEnc(e.target.value)}
                  className="mt-1.5 w-full px-2 py-1.5 text-xs border border-stone-300 rounded bg-white focus:outline-none focus:border-stone-500">
                  {paidEncounters.map(e => (
                    <option key={e.id} value={e.id}>{e.date} — {e.items[0]?.label} — {qar(e.paid)} paid</option>
                  ))}
                </select>
              </div>
              {refundedEnc && (
                <div className="p-2 bg-stone-50 border border-stone-100 rounded text-[10px] text-stone-600 mono">
                  Original payments: {refundedEnc.payments.map(p => `${methodLabel(p.method)} ${qar(p.amount)}`).join(' · ')}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-700">Refund amount (QAR)</label>
                  <input type="number" value={refundAmt} onChange={e => setRefundAmt(e.target.value)}
                    placeholder={`Max: ${qar(refundedEnc?.paid || 0)}`}
                    className="mt-1.5 w-full px-2 py-1.5 text-xs border border-stone-300 rounded mono focus:outline-none focus:border-stone-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-700">Refund via</label>
                  <select value={refundMethod} onChange={e => setRefundMethod(e.target.value)}
                    className="mt-1.5 w-full px-2 py-1.5 text-xs border border-stone-300 rounded bg-white focus:outline-none focus:border-stone-500">
                    <option value="original">Original payment method</option>
                    {PAYMENT_METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-700">Reason (required)</label>
                <input value={refundReason} onChange={e => setRefundReason(e.target.value)}
                  placeholder="e.g. Treatment not completed, wrong procedure charged..."
                  className="mt-1.5 w-full px-2 py-1.5 text-xs border border-stone-300 rounded focus:outline-none focus:border-stone-500" />
              </div>
            </div>
          )}
        </div>

        {/* Collected so far */}
        {splits.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-stone-200 text-xs font-semibold text-stone-700 uppercase tracking-wide">Collected</div>
            <div className="divide-y divide-stone-100">
              {splits.map((s, i) => {
                const m = PAYMENT_METHODS.find(m => m.id === s.methodId);
                const Icon = m?.icon || CreditCard;
                return (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                    <Icon className="w-4 h-4 text-stone-500" />
                    <div className="flex-1 text-sm">{m?.label}</div>
                    <div className="text-xs text-stone-400 mono">{s.ref}</div>
                    <div className={`text-sm font-semibold mono ${s.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                      {s.amount < 0 ? '−' : ''}{qar(Math.abs(s.amount))}
                    </div>
                    <button onClick={() => setSplits(prev => prev.filter((_, idx) => idx !== i))} className="text-stone-300 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: status */}
      <aside className="col-span-5">
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden sticky top-4">
          <div className="px-4 py-3 border-b border-stone-200 text-xs font-semibold text-stone-700 uppercase tracking-wide">Payment status</div>
          <div className="p-4 space-y-3">
            {paymentType === 'full' && (
              <>
                <SummaryRow label="Balance due" value={qar(balance)} bold />
                <SummaryRow label="Collected" value={`−${qar(paidSoFar)}`} accent="emerald" />
                <SummaryRow label="Remaining" value={qar(remaining)} bold accent={remaining > 0 ? 'amber' : 'emerald'} />
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 transition-all" style={{ width: `${Math.min(100, balance > 0 ? (paidSoFar / balance) * 100 : 100)}%` }} />
                </div>
              </>
            )}
            {paymentType === 'downpayment' && (
              <>
                <SummaryRow label="Total balance" value={qar(balance)} />
                <SummaryRow label="Collecting now" value={qar(parseFloat(downAmt) || 0)} bold accent="emerald" />
                <SummaryRow label="Saved as balance" value={qar(Math.max(0, balance - (parseFloat(downAmt) || 0)))} accent="amber" />
              </>
            )}
            {paymentType === 'installments' && (
              <>
                <SummaryRow label="Total balance" value={qar(balance)} />
                <SummaryRow label="First instalment" value={qar(perInstalment)} bold accent="emerald" />
                <SummaryRow label="Remaining instalments" value={`${instPlan.count - 1} × ${qar(perInstalment)}`} accent="amber" />
              </>
            )}
            {paymentType === 'refund' && (
              <>
                <SummaryRow label="Refund amount" value={refundAmt ? `−${qar(parseFloat(refundAmt))}` : 'QAR —'} bold accent="red" />
                {refundReason && <div className="text-[10px] text-stone-500 italic">"{refundReason}"</div>}
              </>
            )}
            {insuredPortion > 0 && paymentType !== 'refund' && (
              <div className="pt-2 border-t border-stone-100 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1 text-stone-500"><Shield className="w-3 h-3" /> QLM claim</span>
                <span className="mono">{qar(insuredPortion)}</span>
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-stone-200 bg-stone-50 flex gap-2">
            <button onClick={onBack} className="px-3 py-2 text-sm text-stone-600 hover:text-stone-900">Back</button>
            <button onClick={handleComplete} disabled={!canComplete}
              className="flex-1 px-3 py-2 bg-stone-900 text-white rounded-md hover:bg-stone-800 text-sm font-medium disabled:bg-stone-300 flex items-center justify-center gap-1.5">
              {paymentType === 'refund' ? 'Process refund' : paymentType === 'installments' ? 'Confirm schedule' : 'Finalize visit'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

// =====================================================================
// STEP 3 — Complete
// =====================================================================
function CompleteStep({ patient, encounter, items, splits, paymentType, totalDueToday, insuredPortion, onNewCheckout }) {
  const [sentVia, setSentVia] = useState({ sms: true, email: false, print: false });
  const invoiceNum = useMemo(() => `INV-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`, []);
  const collected = splits.filter(s => s.amount > 0).reduce((s, p) => s + p.amount, 0);

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-7">
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-200 bg-stone-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-semibold">Yasmeen Clinic</div>
                <div className="text-xs text-stone-500 mt-0.5">West Bay, Doha, Qatar · Tax ID 100012345</div>
              </div>
              <div className="text-right" dir="rtl">
                <div className="text-base font-semibold arabic">عيادة الياسمين</div>
                <div className="text-xs text-stone-500 arabic">الخليج الغربي، الدوحة</div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-200 grid grid-cols-3 gap-3 text-xs">
              <div><div className="text-[10px] text-stone-500 uppercase tracking-wide">Invoice</div><div className="mono font-medium mt-0.5">{invoiceNum}</div></div>
              <div><div className="text-[10px] text-stone-500 uppercase tracking-wide">Date</div><div className="mono font-medium mt-0.5">2026-05-24</div></div>
              <div><div className="text-[10px] text-stone-500 uppercase tracking-wide">Patient</div><div className="font-medium mt-0.5">{patient.nameEn}</div><div className="text-stone-400 mono text-[10px]">{patient.fileNo}</div></div>
            </div>
          </div>

          <div className="px-6 py-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] text-stone-500 uppercase tracking-wide border-b border-stone-200">
                  <th className="text-left py-2">Item</th><th className="text-left py-2">Code</th>
                  <th className="text-right py-2">Amount</th><th className="text-right py-2">Insured</th><th className="text-right py-2">Patient</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map(item => {
                  const ins = item.covered ? item.price * item.coveragePct / 100 : 0;
                  const pat = item.price - ins;
                  return (
                    <tr key={item.id}>
                      <td className="py-2.5"><div className="font-medium">{item.label}</div><div className="text-[10px] text-stone-400">{item.doctor}</div></td>
                      <td className="py-2.5 mono text-stone-400">{item.code}</td>
                      <td className="py-2.5 text-right mono">{item.price.toLocaleString()}</td>
                      <td className="py-2.5 text-right mono text-sky-700">{ins > 0 ? ins.toLocaleString() : '—'}</td>
                      <td className="py-2.5 text-right mono font-medium">{pat.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t border-stone-200">
                <tr><td colSpan={4} className="py-2 text-right text-stone-500 text-[10px]">VAT (0% — exempt)</td><td className="py-2 text-right mono text-stone-400 text-[10px]">0.00</td></tr>
                <tr className="font-semibold border-t border-stone-300">
                  <td colSpan={4} className="py-2 text-right">Total</td>
                  <td className="py-2 text-right mono text-emerald-700">{qar(totalDueToday)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-3 pt-3 border-t border-stone-100 text-[10px]">
              <div className="font-semibold uppercase tracking-wide text-stone-600 mb-1">
                {paymentType === 'refund' ? 'Refund' : paymentType === 'installments' ? 'Instalment schedule' : paymentType === 'downpayment' ? 'Downpayment' : 'Payment'}
              </div>
              {splits.map((s, i) => {
                const m = PAYMENT_METHODS.find(m => m.id === s.methodId);
                return (
                  <div key={i} className="flex justify-between mono text-stone-600">
                    <span>{m?.label} · {s.ref}</span>
                    <span className={s.amount < 0 ? 'text-red-600' : ''}>{s.amount < 0 ? '−' : ''}{qar(Math.abs(s.amount))}</span>
                  </div>
                );
              })}
            </div>

            {insuredPortion > 0 && (
              <div className="mt-3 p-2 bg-sky-50 border border-sky-200 rounded text-[10px] text-sky-800">
                Insurance claim: {qar(insuredPortion)} to {patient.insurer} (policy {patient.policy})
              </div>
            )}

            <div className="mt-4 text-[10px] text-stone-400 text-center leading-relaxed border-t border-stone-200 pt-3">
              Thank you for visiting Yasmeen Clinic · <span className="arabic">شكراً لزيارتكم عيادة الياسمين</span>
            </div>
          </div>
        </div>

        <div className="mt-3 bg-white border border-stone-200 rounded-lg p-3 flex items-center gap-2">
          <span className="text-xs text-stone-600 mr-2">Send receipt:</span>
          <SendChip icon={MessageSquare} label="SMS" active={sentVia.sms} onClick={() => setSentVia({ ...sentVia, sms: !sentVia.sms })} sub={patient.phone} />
          <SendChip icon={Mail} label="Email" active={sentVia.email} onClick={() => setSentVia({ ...sentVia, email: !sentVia.email })} sub={patient.email} />
          <SendChip icon={Printer} label="Print" active={sentVia.print} onClick={() => setSentVia({ ...sentVia, print: !sentVia.print })} />
          <button className="ml-auto px-3 py-1.5 text-xs border border-stone-300 rounded-md hover:bg-stone-50 flex items-center gap-1.5"><Download className="w-3 h-3" /> PDF</button>
        </div>
      </div>

      <aside className="col-span-5 space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-emerald-900">Visit complete</div>
              <div className="text-xs text-emerald-800 mt-1">Invoice {invoiceNum} · Payment recorded · {insuredPortion > 0 ? 'Claim queued · ' : ''}Audit log updated</div>
            </div>
          </div>
          <button onClick={onNewCheckout} className="mt-3 w-full px-3 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 text-sm font-medium">
            Close & return to calendar
          </button>
        </div>

        {insuredPortion > 0 && (
          <div className="bg-white border border-stone-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2 flex items-center gap-1.5"><Send className="w-3 h-3" /> Insurance claim</div>
            <div className="space-y-2 text-xs">
              <ClaimStatus done label="Claim record created" />
              <ClaimStatus done label={`Queued for submission to ${patient.insurer}`} />
              <ClaimStatus pending label="Awaiting submission (5 min)" />
              <ClaimStatus pending label="Awaiting adjudication (3–10 days)" />
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

// =====================================================================
// PATIENT HISTORY TAB
// =====================================================================
function PatientHistoryView({ patient, encounters, onStartCheckout }) {
  const [searchQ, setSearchQ] = useState('');
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="bg-white border border-stone-200 rounded-lg px-4 py-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
          placeholder="Search by patient name, QID, or file # — showing Aisha Al-Kuwari (YC-2024-0142)"
          className="flex-1 text-sm focus:outline-none text-stone-700" />
        {searchQ && <button onClick={() => setSearchQ('')} className="text-stone-400 hover:text-stone-700"><X className="w-4 h-4" /></button>}
      </div>

      {/* Patient card */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-sm font-medium text-stone-700 flex-shrink-0">AK</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-base font-semibold">{patient.nameEn}</div>
            <div className="text-sm text-stone-500" dir="rtl">{patient.nameAr}</div>
            <span className="text-[10px] mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded">{patient.fileNo}</span>
          </div>
          <div className="text-xs text-stone-500 mono mt-0.5">QID {patient.qid} · {patient.phone} · {patient.insurer} {patient.policy}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-stone-500">Total billed (all time)</div>
          <div className="text-lg font-semibold mono">{qar(encounters.reduce((s, e) => s + e.totalAmount, 0))}</div>
          <div className="text-xs text-emerald-700 mono">{qar(encounters.reduce((s, e) => s + e.paid, 0))} collected</div>
        </div>
      </div>

      {/* Encounter history */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
          <div className="text-sm font-semibold">All encounters</div>
          <div className="text-xs text-stone-500">{encounters.length} total · {encounters.filter(e => e.status === 'paid').length} paid · {encounters.filter(e => e.status === 'payment_required' || e.status === 'partial_payment').length} outstanding</div>
        </div>

        <div className="divide-y divide-stone-100">
          {encounters.map(enc => {
            const cfg = STATUS_CONFIG[enc.status];
            const isOpen = expanded === enc.id;
            const isPending = enc.status === 'payment_required' || enc.status === 'partial_payment';
            return (
              <div key={enc.id}>
                <div className="px-4 py-3 flex items-center gap-3 hover:bg-stone-50 cursor-pointer" onClick={() => setExpanded(isOpen ? null : enc.id)}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <div className="mono text-xs text-stone-600 w-24 flex-shrink-0">{enc.date}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{enc.items.map(i => i.label).join(', ')}</div>
                    <div className="text-xs text-stone-400 truncate">{enc.doctors.join(' · ')}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm mono font-medium">{qar(enc.totalAmount)}</div>
                    {isPending && <div className="text-xs text-amber-700 mono">Balance: {qar(enc.balance)}</div>}
                    {enc.status === 'paid' && <div className="text-xs text-emerald-700 mono">Paid: {qar(enc.paid)}</div>}
                    {enc.status === 'no_charge' && <div className="text-xs text-stone-400">No charge</div>}
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ml-2 ${cfg.chip}`}>{cfg.label}</span>
                  <ChevronDown className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 bg-stone-50 border-t border-stone-100">
                    {/* Line items */}
                    <div className="mt-3 space-y-1">
                      {enc.items.map(i => (
                        <div key={i.id} className="flex items-center justify-between text-xs py-1">
                          <span className="text-stone-700">{i.label} <span className="text-stone-400 mono">{i.code}</span></span>
                          <span className="mono">{qar(i.price)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Payment records */}
                    {enc.payments.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-stone-200">
                        <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Payment records</div>
                        {enc.payments.map(p => {
                          const m = PAYMENT_METHODS.find(m => m.id === p.method);
                          const Icon = m?.icon || CreditCard;
                          return (
                            <div key={p.id} className="flex items-center gap-2 text-xs py-1">
                              <Icon className="w-3.5 h-3.5 text-stone-400" />
                              <span className="text-stone-600">{m?.label}</span>
                              <span className="mono text-stone-400">{p.ref}</span>
                              <span className="mono text-stone-400">{p.date}</span>
                              {p.type !== 'payment' && <span className="text-[9px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded">{p.type}</span>}
                              <span className="ml-auto mono font-medium">{qar(p.amount)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Actions — conditional on status */}
                    <div className="mt-3 flex gap-2">
                      {isPending && (
                        <button onClick={() => onStartCheckout(enc.id)}
                          className="px-3 py-1.5 text-xs bg-stone-900 text-white rounded-md hover:bg-stone-800 flex items-center gap-1.5">
                          <CreditCard className="w-3 h-3" /> Collect payment
                        </button>
                      )}
                      {enc.status === 'partial_payment' && (
                        <button className="px-3 py-1.5 text-xs border border-stone-300 rounded-md hover:bg-white flex items-center gap-1.5">
                          <Printer className="w-3 h-3" /> Print receipt
                        </button>
                      )}
                      {enc.status === 'paid' && (
                        <>
                          <button className="px-3 py-1.5 text-xs border border-stone-300 rounded-md hover:bg-white flex items-center gap-1.5">
                            <FileText className="w-3 h-3" /> View invoice
                          </button>
                          <button className="px-3 py-1.5 text-xs border border-stone-300 rounded-md hover:bg-white flex items-center gap-1.5">
                            <Printer className="w-3 h-3" /> Print receipt
                          </button>
                        </>
                      )}
                      {/* no_charge: no action buttons */}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// SHARED UTILITY COMPONENTS
// =====================================================================
function SendChip({ icon: Icon, label, active, onClick, sub }) {
  return (
    <button onClick={onClick}
      className={`px-2.5 py-1.5 text-xs border rounded-md flex items-center gap-1.5 ${active ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}>
      <Icon className="w-3 h-3" />
      <span className="font-medium">{label}</span>
      {sub && <span className="text-[10px] opacity-70 mono">{sub}</span>}
    </button>
  );
}

function ClaimStatus({ done, pending, label }) {
  return (
    <div className="flex items-center gap-2">
      {done    && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
      {pending && <div className="w-3 h-3 rounded-full border border-stone-300" />}
      <span className={done ? 'text-stone-900' : 'text-stone-500'}>{label}</span>
    </div>
  );
}
