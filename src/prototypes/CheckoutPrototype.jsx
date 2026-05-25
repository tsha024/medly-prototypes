import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, Shield, CreditCard, Banknote, Smartphone, Receipt,
  CheckCircle2, AlertCircle, AlertTriangle, FileText, Send, X, Plus,
  Calendar, Clock, Printer, Download, Mail, MessageSquare,
  Building2, ArrowRight, Edit3, Percent, Tag, Phone
} from 'lucide-react';

// =====================================================================
// MEDLY — Patient Checkout Prototype
// Qatar dental + aesthetic clinic
// Closes the loop: doctor's treatment plan -> invoice -> payment -> claim -> rebook
// =====================================================================

const PATIENT = {
  id: 'p1',
  qid: '28934567812',
  nameEn: 'Aisha Al-Kuwari',
  nameAr: 'عائشة الكواري',
  phone: '+974 5512 4488',
  email: 'aisha.alk@example.qa',
  insurer: 'QLM',
  policy: 'QLM-447821',
};

// Today's visit covered three things — a real mixed scenario
const VISIT_ITEMS_RAW = [
  { id: 'i1', code: 'D2391', label: 'Composite filling — tooth #16',     specialty: 'dental',    doctor: 'Dr. Layla Al-Mahmoud', price: 600,  insurable: true,  authNumber: 'QLM-PA-118822' },
  { id: 'i2', code: 'D0274', label: 'Bitewing X-rays (4 films)',          specialty: 'dental',    doctor: 'Dr. Layla Al-Mahmoud', price: 220,  insurable: true,  authNumber: 'QLM-PA-118822' },
  { id: 'i3', code: 'M0023', label: 'Botox 20U — glabellar + frontalis',  specialty: 'aesthetic', doctor: 'Dr. Reem Al-Thani',    price: 1800, insurable: false },
];

const PAYMENT_METHODS = [
  { id: 'card',   label: 'Card (Visa/Mada)',   icon: CreditCard,  fee: 0 },
  { id: 'cash',   label: 'Cash (QAR)',         icon: Banknote,    fee: 0 },
  { id: 'apple',  label: 'Apple Pay',          icon: Smartphone,  fee: 0 },
  { id: 'naps',   label: 'NAPS bank transfer', icon: Building2,   fee: 0 },
];

// =====================================================================
export default function CheckoutPrototype() {
  const [step, setStep] = useState(1); // 1: review, 2: payment, 3: complete
  const [items, setItems] = useState(VISIT_ITEMS_RAW.map(i => ({
    ...i,
    covered: i.insurable, // QLM covers dental, not cosmetic
    coveragePct: i.insurable ? 80 : 0,
  })));
  const [discount, setDiscount] = useState({ pct: 0, reason: '' });
  const [splits, setSplits] = useState([]); // [{ methodId, amount, ref }]
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [splitMode, setSplitMode] = useState(false);
  const [tempAmount, setTempAmount] = useState('');
  const [nextAppointments, setNextAppointments] = useState([
    { id: 'fu1', label: 'Follow-up — sensitivity check', doctor: 'Dr. Layla', when: '2 weeks', selected: true },
    { id: 'fu2', label: 'Botox review + photography', doctor: 'Dr. Reem', when: '14 days', selected: true },
    { id: 'fu3', label: 'Tear-trough filler consult', doctor: 'Dr. Reem', when: '2 weeks', selected: false },
  ]);

  // --- Money math, the single source of truth ---
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const insuredPortion = items.filter(i => i.covered).reduce((s, i) => s + (i.price * i.coveragePct / 100), 0);
  const patientPortion = subtotal - insuredPortion;
  const discountAmount = patientPortion * (discount.pct / 100);
  const vatRate = 0; // Qatar healthcare = 0% VAT today; aesthetic is gray, we'll show the line for completeness
  const vat = 0;
  const totalDueToday = patientPortion - discountAmount + vat;
  const paidSoFar = splits.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, totalDueToday - paidSoFar);

  const toggleCoverage = (id) => {
    setItems(items.map(i => i.id === id ? { ...i, covered: !i.covered } : i));
  };

  const addSplit = () => {
    const amt = parseFloat(tempAmount);
    if (!amt || amt <= 0) return;
    setSplits([...splits, { methodId: paymentMethod, amount: amt, ref: `TX${Date.now().toString().slice(-6)}` }]);
    setTempAmount('');
    setSplitMode(false);
  };

  const payFullRemaining = () => {
    if (remaining <= 0) return;
    setSplits([...splits, { methodId: paymentMethod, amount: remaining, ref: `TX${Date.now().toString().slice(-6)}` }]);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: '"IBM Plex Sans", "Noto Sans Arabic", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .mono { font-family: "IBM Plex Mono", monospace; }
        .receipt-row { display: grid; grid-template-columns: 1fr auto; gap: 0.75rem; align-items: baseline; }
        .arabic { font-family: "IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif; }
      `}</style>

      {/* Top bar */}
      <header className="border-b border-stone-200 bg-white">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-1.5 hover:bg-stone-100 rounded text-stone-500">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-md bg-stone-900 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">M</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Medly Checkout</div>
              <div className="text-xs text-stone-500">Yasmeen Clinic, Doha</div>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2">
            {['Review', 'Payment', 'Complete'].map((label, i) => (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-1.5 ${step > i + 1 ? 'text-stone-400' : step === i + 1 ? 'text-stone-900' : 'text-stone-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${step === i + 1 ? 'bg-stone-900 text-white' : step > i + 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'}`}>
                    {step > i + 1 ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                </div>
                {i < 2 && <ChevronLeft className="w-3 h-3 text-stone-300 rotate-180" />}
              </React.Fragment>
            ))}
          </div>

          <div className="px-3 py-1.5 text-xs bg-stone-100 rounded-md text-stone-700">
            Rania M. · Reception
          </div>
        </div>
      </header>

      {/* Patient strip */}
      <div className="bg-white border-b border-stone-200 px-6 py-3 flex items-center gap-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-stone-700">AK</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold">{PATIENT.nameEn}</div>
              <div className="text-sm text-stone-500" dir="rtl">{PATIENT.nameAr}</div>
            </div>
            <div className="text-xs text-stone-500 mono mt-0.5">
              QID {PATIENT.qid} · {PATIENT.phone}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-stone-500">Visit total</div>
          <div className="text-lg font-semibold mono">QAR {subtotal.toLocaleString()}</div>
        </div>
        <div className="text-right border-l border-stone-200 pl-6">
          <div className="text-xs text-stone-500">Due today</div>
          <div className="text-lg font-semibold mono text-emerald-700">QAR {totalDueToday.toLocaleString()}</div>
        </div>
      </div>

      {/* Main */}
      <main className="px-6 py-5 max-w-6xl mx-auto">
        {step === 1 && (
          <ReviewStep
            items={items}
            toggleCoverage={toggleCoverage}
            discount={discount}
            setDiscount={setDiscount}
            subtotal={subtotal}
            insuredPortion={insuredPortion}
            patientPortion={patientPortion}
            discountAmount={discountAmount}
            totalDueToday={totalDueToday}
            onContinue={() => setStep(2)}
            patient={PATIENT}
          />
        )}
        {step === 2 && (
          <PaymentStep
            totalDueToday={totalDueToday}
            patientPortion={patientPortion}
            insuredPortion={insuredPortion}
            paidSoFar={paidSoFar}
            remaining={remaining}
            splits={splits}
            setSplits={setSplits}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            splitMode={splitMode}
            setSplitMode={setSplitMode}
            tempAmount={tempAmount}
            setTempAmount={setTempAmount}
            addSplit={addSplit}
            payFullRemaining={payFullRemaining}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <CompleteStep
            patient={PATIENT}
            items={items}
            splits={splits}
            totalDueToday={totalDueToday}
            insuredPortion={insuredPortion}
            nextAppointments={nextAppointments}
            setNextAppointments={setNextAppointments}
          />
        )}
      </main>
    </div>
  );
}

// =====================================================================
// STEP 1 — Review line items + coverage
// =====================================================================
function ReviewStep({ items, toggleCoverage, discount, setDiscount, subtotal, insuredPortion, patientPortion, discountAmount, totalDueToday, onContinue, patient }) {
  return (
    <div className="grid grid-cols-12 gap-5">
      {/* Left: items */}
      <div className="col-span-8 space-y-4">
        {/* Items table */}
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-stone-700 uppercase tracking-wide">Today's items</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Auto-loaded from doctors' encounters · Toggle coverage if needed</div>
            </div>
            <button className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add ad-hoc item
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {items.map(item => (
              <ItemRow key={item.id} item={item} onToggle={() => toggleCoverage(item.id)} />
            ))}
          </div>
        </div>

        {/* Insurance call-out */}
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-sky-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-sky-900">{patient.insurer} insurance applied</div>
              <div className="text-xs text-sky-800 mt-0.5">
                Policy {patient.policy} · Dental coverage at 80% (after deductible) · Aesthetic procedures excluded
              </div>
              <div className="text-[10px] text-sky-700 mono mt-2 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Pre-auth: QLM-PA-118822 · Valid through 2026-05-30
              </div>
            </div>
          </div>
        </div>

        {/* Discount */}
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Discount
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-stone-300 rounded-md text-xs">
              {[0, 5, 10, 15].map(p => (
                <button
                  key={p}
                  onClick={() => setDiscount({ ...discount, pct: p })}
                  className={`px-3 py-1.5 border-r border-stone-300 last:border-r-0 ${discount.pct === p ? 'bg-stone-900 text-white' : 'hover:bg-stone-50'}`}
                >
                  {p}%
                </button>
              ))}
            </div>
            <input
              type="text"
              value={discount.reason}
              onChange={e => setDiscount({ ...discount, reason: e.target.value })}
              placeholder="Reason (required for discount > 0)"
              disabled={discount.pct === 0}
              className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 disabled:bg-stone-50 disabled:text-stone-400"
            />
          </div>
          {discount.pct > 0 && !discount.reason && (
            <div className="text-[10px] text-amber-700 mt-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Reason required — will be logged in audit trail
            </div>
          )}
        </div>
      </div>

      {/* Right: summary */}
      <aside className="col-span-4">
        <div className="bg-white border border-stone-200 rounded-lg p-4 sticky top-4">
          <div className="text-xs font-semibold text-stone-700 uppercase tracking-wide mb-3">Bill summary</div>

          <div className="space-y-2 text-sm">
            <div className="receipt-row">
              <span className="text-stone-600">Visit subtotal</span>
              <span className="mono">QAR {subtotal.toLocaleString()}</span>
            </div>
            <div className="receipt-row text-sky-700">
              <span>Insurance covers</span>
              <span className="mono">−QAR {insuredPortion.toLocaleString()}</span>
            </div>
            <div className="receipt-row pt-2 border-t border-stone-100">
              <span className="text-stone-600">Patient portion</span>
              <span className="mono">QAR {patientPortion.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="receipt-row text-emerald-700">
                <span>Discount ({discount.pct}%)</span>
                <span className="mono">−QAR {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="receipt-row text-stone-400">
              <span>VAT (0% — healthcare)</span>
              <span className="mono">QAR 0.00</span>
            </div>
            <div className="receipt-row pt-3 border-t border-stone-200 text-base font-semibold">
              <span>Due today</span>
              <span className="mono text-emerald-700">QAR {totalDueToday.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-stone-50 border border-stone-200 rounded text-[10px] text-stone-600 leading-relaxed">
            <Send className="w-3 h-3 inline -mt-0.5 mr-1" />
            Insurance claim of <span className="font-medium mono">QAR {insuredPortion.toLocaleString()}</span> will be submitted to QLM after payment is recorded.
          </div>

          <button
            onClick={onContinue}
            disabled={discount.pct > 0 && !discount.reason}
            className="mt-4 w-full px-3 py-2 bg-stone-900 text-white rounded-md hover:bg-stone-800 text-sm font-medium disabled:bg-stone-300 flex items-center justify-center gap-2"
          >
            Continue to payment
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </div>
  );
}

function ItemRow({ item, onToggle }) {
  const specialtyDot = item.specialty === 'dental' ? 'bg-sky-500' : 'bg-rose-400';

  return (
    <div className="px-4 py-3 flex items-start gap-3 hover:bg-stone-50">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${specialtyDot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{item.label}</span>
          <span className="text-[10px] mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{item.code}</span>
        </div>
        <div className="text-xs text-stone-500 mt-0.5">{item.doctor}</div>
        {item.covered && item.authNumber && (
          <div className="text-[10px] text-sky-700 mono mt-1 flex items-center gap-1">
            <Shield className="w-2.5 h-2.5" /> Pre-auth {item.authNumber}
          </div>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-semibold mono">QAR {item.price.toLocaleString()}</div>
        <button
          onClick={onToggle}
          disabled={!item.insurable}
          className={`mt-1.5 text-[10px] px-2 py-0.5 rounded border ${
            !item.insurable
              ? 'border-stone-200 text-stone-400 cursor-not-allowed'
              : item.covered
              ? 'border-sky-300 bg-sky-50 text-sky-800'
              : 'border-stone-300 bg-white text-stone-600 hover:border-stone-400'
          }`}
        >
          {!item.insurable ? 'Not insurable' : item.covered ? '✓ Insurance' : 'Patient pays'}
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// STEP 2 — Payment (split-payment capable)
// =====================================================================
function PaymentStep({ totalDueToday, paidSoFar, remaining, splits, setSplits, paymentMethod, setPaymentMethod, splitMode, setSplitMode, tempAmount, setTempAmount, addSplit, payFullRemaining, onBack, onContinue, insuredPortion }) {
  const fullyPaid = remaining <= 0.01;

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* Left: payment input */}
      <div className="col-span-7 space-y-4">
        <div className="bg-white border border-stone-200 rounded-lg p-5">
          <div className="text-xs font-semibold text-stone-700 uppercase tracking-wide mb-3">Collect payment</div>

          {/* Method picker */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {PAYMENT_METHODS.map(m => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`px-2 py-3 border rounded-md flex flex-col items-center gap-1.5 hover:border-stone-400 transition-colors ${paymentMethod === m.id ? 'border-stone-900 bg-stone-50' : 'border-stone-200'}`}
                >
                  <Icon className="w-5 h-5 text-stone-700" />
                  <span className="text-[11px] text-stone-700 text-center leading-tight">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Amount + action */}
          {!splitMode && !fullyPaid && (
            <div className="space-y-2">
              <button
                onClick={payFullRemaining}
                className="w-full px-3 py-3 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 text-sm font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Charge full remaining — QAR {remaining.toLocaleString()}
              </button>
              <button
                onClick={() => setSplitMode(true)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md hover:bg-stone-50 text-xs text-stone-600 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3 h-3" /> Split payment across methods
              </button>
            </div>
          )}

          {splitMode && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-md space-y-2">
              <div className="text-xs font-semibold text-stone-700">Add partial payment</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={tempAmount}
                  onChange={e => setTempAmount(e.target.value)}
                  placeholder="Amount in QAR"
                  className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 mono"
                  autoFocus
                />
                <button
                  onClick={addSplit}
                  className="px-3 py-2 bg-stone-900 text-white text-sm rounded-md hover:bg-stone-800"
                >
                  Add
                </button>
                <button
                  onClick={() => { setSplitMode(false); setTempAmount(''); }}
                  className="px-2 py-2 text-sm text-stone-500 hover:text-stone-900"
                >
                  Cancel
                </button>
              </div>
              <div className="text-[11px] text-stone-500">
                Tip: receptionists in Doha often see patients pay partially via card and partially via Apple Pay or NAPS — that's why split is here.
              </div>
            </div>
          )}

          {fullyPaid && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <div className="text-sm text-emerald-900">
                <span className="font-medium">Fully paid.</span> Continue to finalize the visit.
              </div>
            </div>
          )}
        </div>

        {/* Payments collected */}
        {splits.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-stone-200 text-xs font-semibold text-stone-700 uppercase tracking-wide">
              Collected so far
            </div>
            <div className="divide-y divide-stone-100">
              {splits.map((s, i) => {
                const method = PAYMENT_METHODS.find(m => m.id === s.methodId);
                const Icon = method.icon;
                return (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                    <Icon className="w-4 h-4 text-stone-500" />
                    <div className="flex-1 text-sm">{method.label}</div>
                    <div className="text-xs text-stone-500 mono">{s.ref}</div>
                    <div className="text-sm font-medium mono">QAR {s.amount.toLocaleString()}</div>
                    <button onClick={() => setSplits(splits.filter((_, idx) => idx !== i))} className="text-stone-400 hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: running total */}
      <aside className="col-span-5">
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden sticky top-4">
          <div className="px-4 py-3 border-b border-stone-200 text-xs font-semibold text-stone-700 uppercase tracking-wide">
            Payment status
          </div>
          <div className="p-4 space-y-3">
            <BigNumber label="Due today" value={totalDueToday} />
            <div className="space-y-1.5 text-sm">
              <div className="receipt-row">
                <span className="text-stone-600">Paid so far</span>
                <span className="mono text-emerald-700">−QAR {paidSoFar.toLocaleString()}</span>
              </div>
              <div className="receipt-row pt-2 border-t border-stone-100 font-semibold">
                <span>Remaining</span>
                <span className={`mono ${remaining > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>QAR {remaining.toLocaleString()}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${Math.min(100, (paidSoFar / totalDueToday) * 100)}%` }}
              />
            </div>

            <div className="pt-2 border-t border-stone-100">
              <div className="text-[10px] text-stone-500 uppercase tracking-wide font-semibold mb-1.5">
                Claim — submitted after payment
              </div>
              <div className="receipt-row text-sm">
                <span className="text-stone-600 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> QLM claim
                </span>
                <span className="mono text-stone-700">QAR {insuredPortion.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-stone-200 bg-stone-50 flex gap-2">
            <button onClick={onBack} className="px-3 py-2 text-sm text-stone-600 hover:text-stone-900">
              Back
            </button>
            <button
              onClick={onContinue}
              disabled={!fullyPaid}
              className="flex-1 px-3 py-2 bg-stone-900 text-white rounded-md hover:bg-stone-800 text-sm font-medium disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              Finalize visit
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function BigNumber({ label, value }) {
  return (
    <div>
      <div className="text-xs text-stone-500">{label}</div>
      <div className="text-2xl font-semibold mono mt-0.5">QAR {value.toLocaleString()}</div>
    </div>
  );
}

// =====================================================================
// STEP 3 — Complete: receipt, rebook, send
// =====================================================================
function CompleteStep({ patient, items, splits, totalDueToday, insuredPortion, nextAppointments, setNextAppointments }) {
  const [sentVia, setSentVia] = useState({ sms: true, email: false, print: false });

  const toggleAppointment = (id) => {
    setNextAppointments(nextAppointments.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
  };

  const invoiceNum = useMemo(() => `INV-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`, []);

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* Left: receipt preview */}
      <div className="col-span-7">
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          {/* Receipt header */}
          <div className="px-6 py-5 border-b border-stone-200 bg-stone-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-semibold">Yasmeen Clinic</div>
                <div className="text-xs text-stone-500 mt-0.5">Yasmeen Medical Center W.L.L.</div>
                <div className="text-xs text-stone-500">West Bay, Doha, Qatar</div>
                <div className="text-xs text-stone-500 mono mt-1">Tax ID 100012345 · License HF-DOH-2247</div>
              </div>
              <div className="text-right" dir="rtl">
                <div className="text-base font-semibold arabic">عيادة الياسمين</div>
                <div className="text-xs text-stone-500 mt-0.5 arabic">مركز الياسمين الطبي ذ.م.م</div>
                <div className="text-xs text-stone-500 arabic">الخليج الغربي، الدوحة، قطر</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wide">Invoice</div>
                <div className="mono font-medium mt-0.5">{invoiceNum}</div>
              </div>
              <div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wide">Date</div>
                <div className="mono font-medium mt-0.5">2026-05-24 17:42</div>
              </div>
              <div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wide">Patient</div>
                <div className="font-medium mt-0.5">{patient.nameEn}</div>
                <div className="text-stone-500 mono">QID {patient.qid}</div>
              </div>
              <div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wide">Insurer</div>
                <div className="font-medium mt-0.5">{patient.insurer}</div>
                <div className="text-stone-500 mono">{patient.policy}</div>
              </div>
            </div>
          </div>

          {/* Receipt body */}
          <div className="px-6 py-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] text-stone-500 uppercase tracking-wide border-b border-stone-200">
                  <th className="text-left py-2 font-semibold">Item</th>
                  <th className="text-left py-2 font-semibold">Code</th>
                  <th className="text-right py-2 font-semibold">Amount</th>
                  <th className="text-right py-2 font-semibold">Coverage</th>
                  <th className="text-right py-2 font-semibold">Patient</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map(item => {
                  const ins = item.covered ? item.price * item.coveragePct / 100 : 0;
                  const pat = item.price - ins;
                  return (
                    <tr key={item.id}>
                      <td className="py-2.5">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-[10px] text-stone-500">{item.doctor}</div>
                      </td>
                      <td className="py-2.5 mono text-stone-500">{item.code}</td>
                      <td className="py-2.5 text-right mono">{item.price.toLocaleString()}</td>
                      <td className="py-2.5 text-right mono text-sky-700">
                        {ins > 0 ? ins.toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 text-right mono font-medium">{pat.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t border-stone-200">
                <tr>
                  <td colSpan="4" className="py-2 text-right text-stone-600">Subtotal</td>
                  <td className="py-2 text-right mono">QAR {totalDueToday.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan="4" className="py-1 text-right text-stone-500 text-[10px]">VAT (0% — exempt healthcare)</td>
                  <td className="py-1 text-right mono text-stone-500 text-[10px]">QAR 0.00</td>
                </tr>
                <tr className="border-t border-stone-300 text-base font-semibold">
                  <td colSpan="4" className="py-2 text-right">Total paid</td>
                  <td className="py-2 text-right mono text-emerald-700">QAR {totalDueToday.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-4 pt-3 border-t border-stone-100 text-[10px] text-stone-500">
              <div className="font-semibold uppercase tracking-wide mb-1">Payment</div>
              {splits.map((s, i) => {
                const method = PAYMENT_METHODS.find(m => m.id === s.methodId);
                return (
                  <div key={i} className="flex justify-between mono">
                    <span>{method.label} · ref {s.ref}</span>
                    <span>QAR {s.amount.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 p-2 bg-sky-50 border border-sky-200 rounded text-[10px] text-sky-800">
              <span className="font-medium">Insurance claim:</span> QAR {insuredPortion.toLocaleString()} to {patient.insurer} (policy {patient.policy}). You will be notified of any adjustment.
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 text-[10px] text-stone-400 text-center leading-relaxed">
              Thank you for visiting Yasmeen Clinic · This is a tax invoice retained for 10 years per Qatar MOPH guidelines<br />
              <span className="arabic">شكراً لزيارتكم عيادة الياسمين</span>
            </div>
          </div>
        </div>

        {/* Send actions */}
        <div className="mt-3 bg-white border border-stone-200 rounded-lg p-3 flex items-center gap-2">
          <span className="text-xs text-stone-600 mr-2">Deliver receipt:</span>
          <SendChip icon={MessageSquare} label="SMS" active={sentVia.sms} onClick={() => setSentVia({ ...sentVia, sms: !sentVia.sms })} sub={patient.phone} />
          <SendChip icon={Mail} label="Email" active={sentVia.email} onClick={() => setSentVia({ ...sentVia, email: !sentVia.email })} sub={patient.email} />
          <SendChip icon={Printer} label="Print" active={sentVia.print} onClick={() => setSentVia({ ...sentVia, print: !sentVia.print })} />
          <button className="ml-auto px-3 py-1.5 text-xs border border-stone-300 rounded-md hover:bg-stone-50 flex items-center gap-1.5">
            <Download className="w-3 h-3" /> PDF
          </button>
        </div>
      </div>

      {/* Right: rebook + close */}
      <aside className="col-span-5 space-y-4">
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-200">
            <div className="text-xs font-semibold text-stone-700 uppercase tracking-wide">Book next steps</div>
            <div className="text-[10px] text-stone-500 mt-0.5">From the doctors' treatment plans</div>
          </div>
          <div className="divide-y divide-stone-100">
            {nextAppointments.map(apt => (
              <label key={apt.id} className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-stone-50">
                <input
                  type="checkbox"
                  checked={apt.selected}
                  onChange={() => toggleAppointment(apt.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{apt.label}</div>
                  <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {apt.when}</span>
                    <span>{apt.doctor}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-stone-200 bg-stone-50">
            <button className="w-full px-3 py-2 bg-stone-900 text-white rounded-md hover:bg-stone-800 text-sm font-medium flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Book {nextAppointments.filter(a => a.selected).length} appointment{nextAppointments.filter(a => a.selected).length !== 1 ? 's' : ''}
            </button>
            <div className="text-[10px] text-stone-500 mt-2 text-center">
              Will open the appointment calendar pre-filled
            </div>
          </div>
        </div>

        {/* Final actions */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-emerald-900">Visit complete</div>
              <div className="text-xs text-emerald-800 mt-1">
                Invoice {invoiceNum} created · Payment recorded · Claim queued for submission · Audit log updated
              </div>
            </div>
          </div>
          <button className="mt-3 w-full px-3 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 text-sm font-medium">
            Close visit & return to calendar
          </button>
        </div>

        {/* Claim status */}
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Send className="w-3 h-3" />
            Insurance claim
          </div>
          <div className="space-y-2 text-xs">
            <ClaimStatus done label="Claim record created" />
            <ClaimStatus done label={`Queued for submission to ${patient.insurer}`} />
            <ClaimStatus pending label="Awaiting submission (5 min delay)" />
            <ClaimStatus pending label="Awaiting adjudication (typically 3–10 days)" />
          </div>
          <div className="mt-3 text-[10px] text-stone-500">
            Claim will be tracked in <span className="font-medium text-stone-700">Billing → Open claims</span>. Patient won't be re-billed unless the claim is rejected.
          </div>
        </div>
      </aside>
    </div>
  );
}

function SendChip({ icon: Icon, label, active, onClick, sub }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 text-xs border rounded-md flex items-center gap-1.5 ${active ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}
    >
      <Icon className="w-3 h-3" />
      <span className="font-medium">{label}</span>
      {sub && <span className="text-[10px] opacity-70 mono">{sub}</span>}
    </button>
  );
}

function ClaimStatus({ done, pending, label }) {
  return (
    <div className="flex items-center gap-2">
      {done && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
      {pending && <div className="w-3 h-3 rounded-full border border-stone-300" />}
      <span className={done ? 'text-stone-900' : 'text-stone-500'}>{label}</span>
    </div>
  );
}
