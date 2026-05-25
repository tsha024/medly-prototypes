import { useState } from 'react'
import ReceptionPrototype    from './prototypes/ReceptionPrototype.jsx'
import DoctorPrototype       from './prototypes/DoctorPrototype.jsx'
import CheckoutPrototype     from './prototypes/CheckoutPrototype.jsx'
import AdminPrototype        from './prototypes/AdminPrototype.jsx'

// ── Simple hash-based router — no dependencies needed ─────────────────────────
// Reads window.location.hash to decide which screen to show.
// e.g. #reception, #doctor, #checkout, #admin

const PROTOTYPES = [
  {
    id: 'reception',
    title: 'Reception & Booking',
    titleAr: 'الاستقبال والحجز',
    description: 'Multi-doctor day calendar, appointment booking, patient search by QID, insurance capture.',
    who: 'Reception staff',
    color: 'teal',
    component: ReceptionPrototype,
  },
  {
    id: 'doctor',
    title: 'Doctor Portal',
    titleAr: 'بوابة الطبيب',
    description: 'SOAP notes, odontogram (dental), full-body injection map (aesthetic), prescriptions with allergy guardrails, care team.',
    who: 'Doctors & nurses',
    color: 'violet',
    component: DoctorPrototype,
  },
  {
    id: 'checkout',
    title: 'Patient Checkout',
    titleAr: 'تسوية الحساب',
    description: 'Line-item billing with insurance coverage, split payments (card, cash, Apple Pay, NAPS), bilingual receipt, claim submission.',
    who: 'Reception staff',
    color: 'amber',
    component: CheckoutPrototype,
  },
  {
    id: 'admin',
    title: 'Admin Dashboard',
    titleAr: 'لوحة الإدارة',
    description: 'Revenue vs collected, cost breakdown, doctor productivity, claims pipeline, payroll and tax obligations.',
    who: 'Clinic owner',
    color: 'rose',
    component: AdminPrototype,
  },
]

const COLOR = {
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   badge: 'bg-teal-100 text-teal-800',   btn: 'bg-teal-700 hover:bg-teal-800',   dot: 'bg-teal-500' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-800', btn: 'bg-violet-700 hover:bg-violet-800', dot: 'bg-violet-500' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-800',  btn: 'bg-amber-700 hover:bg-amber-800',  dot: 'bg-amber-500' },
  rose:   { bg: 'bg-rose-50',   border: 'border-rose-200',   badge: 'bg-rose-100 text-rose-800',    btn: 'bg-rose-700 hover:bg-rose-800',    dot: 'bg-rose-500' },
}

function getHash() {
  return window.location.hash.replace('#', '') || 'home'
}

export default function App() {
  const [route, setRoute] = useState(getHash)

  const navigate = (to) => {
    window.location.hash = to
    setRoute(to)
    window.scrollTo(0, 0)
  }

  const active = PROTOTYPES.find(p => p.id === route)

  // ── Render active prototype ──────────────────────────────────────────────
  if (active) {
    const Component = active.component
    return (
      <div>
        {/* Slim back bar */}
        <div
          className="fixed top-0 left-0 right-0 z-50 bg-stone-900 text-white px-4 py-2 flex items-center gap-3 text-sm"
          style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}
        >
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors text-xs"
          >
            ← All prototypes
          </button>
          <span className="text-stone-600">|</span>
          <span className="text-stone-200 font-medium">{active.title}</span>
          <span className="ml-auto text-stone-500 text-xs">Medly · Feedback prototype</span>
        </div>
        <div className="pt-9">
          <Component />
        </div>
      </div>
    )
  }

  // ── Landing page ─────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-stone-50"
      style={{ fontFamily: '"IBM Plex Sans", "Noto Sans Arabic", system-ui, sans-serif' }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <header className="bg-stone-900 text-white px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center font-semibold text-lg">M</div>
            <div>
              <div className="font-semibold tracking-tight">Medly</div>
              <div className="text-stone-400 text-xs">Clinic Management System</div>
            </div>
          </div>
          <h1 className="text-2xl font-semibold mb-1">Interactive prototypes</h1>
          <p className="text-stone-400 text-sm max-w-xl">
            Yasmeen Clinic, Doha · Dental & Aesthetic Medicine · 5–6 doctors
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Prototype — not connected to live data · For feedback only
          </div>
        </div>
      </header>

      {/* Prototype cards */}
      <main className="max-w-4xl mx-auto px-8 py-10">
        <p className="text-sm text-stone-600 mb-6">
          Click any module below to open the interactive prototype. Use the <strong>← All prototypes</strong> link
          at the top of each screen to come back here.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {PROTOTYPES.map((p, i) => {
            const c = COLOR[p.color]
            return (
              <button
                key={p.id}
                onClick={() => navigate(p.id)}
                className={`text-left p-5 rounded-xl border ${c.bg} ${c.border} hover:shadow-md transition-all group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-7 h-7 rounded-md ${c.dot} flex items-center justify-center text-white text-xs font-bold`}>
                    {i + 1}
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.badge}`}>{p.who}</span>
                </div>
                <div className="font-semibold text-stone-900 mb-0.5">{p.title}</div>
                <div className="text-xs text-stone-500 mb-3 leading-relaxed">{p.description}</div>
                <div className={`text-xs font-medium text-white px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 ${c.btn} group-hover:gap-2.5 transition-all`}>
                  Open prototype →
                </div>
              </button>
            )
          })}
        </div>

        {/* Feedback section */}
        <div className="mt-10 p-5 bg-white border border-stone-200 rounded-xl">
          <h2 className="font-semibold text-stone-800 mb-1">How to give feedback</h2>
          <p className="text-sm text-stone-600 mb-3">
            Explore each module as if you were using it in the clinic. As you go, note:
          </p>
          <div className="grid grid-cols-3 gap-3 text-xs text-stone-700">
            {[
              { emoji: '✅', label: 'What works well', sub: 'Flows that feel natural and complete' },
              { emoji: '⚠️', label: "What's confusing", sub: 'Steps that feel unclear or missing' },
              { emoji: '➕', label: "What's missing", sub: "Features or information you'd need" },
            ].map(f => (
              <div key={f.label} className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                <div className="text-base mb-1">{f.emoji}</div>
                <div className="font-medium mb-0.5">{f.label}</div>
                <div className="text-stone-500">{f.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-stone-400">
          Medly prototype v1.0 · Qatar · Built May 2026
        </div>
      </main>
    </div>
  )
}
