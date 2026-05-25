import React, { useState, useMemo } from 'react';
import { Calendar, Search, User, Clock, CheckCircle2, AlertCircle, Phone, Mail, CreditCard, Shield, ChevronLeft, ChevronRight, X, Plus, Globe } from 'lucide-react';

// =====================================================================
// MEDLY — Reception Booking Prototype
// Qatar dental + aesthetic clinic, 5–6 doctors
// Design intent: calm, dense, fast. Clinical software, not a landing page.
// =====================================================================

// ---- Mock data ------------------------------------------------------
const DOCTORS = [
  { id: 'd1', nameEn: 'Dr. Layla Al-Mahmoud', nameAr: 'د. ليلى المحمود', specialty: 'General Dentistry', specialtyAr: 'طب الأسنان العام', qchp: 'QCHP-D-44218', color: 'rose' },
  { id: 'd2', nameEn: 'Dr. Omar Al-Sayed', nameAr: 'د. عمر السيد', specialty: 'Orthodontics', specialtyAr: 'تقويم الأسنان', qchp: 'QCHP-D-51209', color: 'amber' },
  { id: 'd3', nameEn: 'Dr. Priya Menon', nameAr: 'د. بريا مينون', specialty: 'Endodontics', specialtyAr: 'علاج العصب', qchp: 'QCHP-D-39871', color: 'teal' },
  { id: 'd4', nameEn: 'Dr. Yusuf Hassan', nameAr: 'د. يوسف حسن', specialty: 'Cosmetic Dentistry', specialtyAr: 'تجميل الأسنان', qchp: 'QCHP-D-47502', color: 'violet' },
  { id: 'd5', nameEn: 'Dr. Reem Al-Thani', nameAr: 'د. ريم الثاني', specialty: 'Aesthetic Medicine', specialtyAr: 'الطب التجميلي', qchp: 'QCHP-M-22041', color: 'sky' },
  { id: 'd6', nameEn: 'Dr. Marcus Chen', nameAr: 'د. ماركوس تشين', specialty: 'Aesthetic Medicine', specialtyAr: 'الطب التجميلي', qchp: 'QCHP-M-29116', color: 'emerald' },
];

const PROCEDURES = {
  'General Dentistry':   [{ name: 'Consultation', dur: 30, price: 250 }, { name: 'Cleaning & polish', dur: 45, price: 400 }, { name: 'Filling', dur: 45, price: 600 }, { name: 'Extraction', dur: 60, price: 800 }],
  'Orthodontics':        [{ name: 'Ortho consult', dur: 45, price: 350 }, { name: 'Braces adjustment', dur: 30, price: 450 }, { name: 'Retainer fitting', dur: 60, price: 1200 }],
  'Endodontics':         [{ name: 'Root canal consult', dur: 30, price: 400 }, { name: 'Root canal treatment', dur: 90, price: 2500 }],
  'Cosmetic Dentistry':  [{ name: 'Veneer consultation', dur: 30, price: 300 }, { name: 'Teeth whitening', dur: 60, price: 1500 }, { name: 'Veneer fitting', dur: 120, price: 4500 }],
  'Aesthetic Medicine':  [{ name: 'Aesthetic consult', dur: 30, price: 200 }, { name: 'Botox', dur: 45, price: 1800 }, { name: 'Dermal filler', dur: 60, price: 2400 }, { name: 'Chemical peel', dur: 60, price: 900 }],
};

const MOCK_PATIENTS = [
  { id: 'p1', qid: '28934567812', nameEn: 'Aisha Al-Kuwari', nameAr: 'عائشة الكواري', phone: '+974 5512 4488', dob: '1989-03-14', insurer: 'QLM', policy: 'QLM-447821', eligible: true, lastVisit: '2026-02-14' },
  { id: 'p2', qid: '29612039874', nameEn: 'James Patterson', nameAr: 'جيمس باترسون', phone: '+974 7011 9923', dob: '1985-11-02', insurer: 'Cash/Card', policy: null, eligible: null, lastVisit: '2025-11-08' },
  { id: 'p3', qid: '28701445129', nameEn: 'Fatima Al-Mansoori', nameAr: 'فاطمة المنصوري', phone: '+974 3344 7712', dob: '1992-07-22', insurer: 'AXA', policy: 'AXA-Q-998812', eligible: true, lastVisit: '2026-04-30' },
];

// Day grid: 09:00 to 18:00 in 30-min slots
const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const h = 9 + Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

// Pre-seeded appointments to make the grid feel alive
const SEED_APPOINTMENTS = [
  { id: 'a1', doctorId: 'd1', patientId: 'p3', start: '09:00', dur: 45, procedure: 'Cleaning & polish', status: 'confirmed' },
  { id: 'a2', doctorId: 'd1', patientId: 'p1', start: '10:30', dur: 60, procedure: 'Extraction',        status: 'confirmed' },
  { id: 'a3', doctorId: 'd2', patientId: 'p2', start: '11:00', dur: 30, procedure: 'Braces adjustment', status: 'confirmed' },
  { id: 'a4', doctorId: 'd3', patientId: 'p1', start: '14:00', dur: 90, procedure: 'Root canal treatment', status: 'in-progress' },
  { id: 'a5', doctorId: 'd5', patientId: 'p3', start: '15:30', dur: 60, procedure: 'Dermal filler',     status: 'confirmed' },
  { id: 'a6', doctorId: 'd6', patientId: 'p2', start: '10:00', dur: 45, procedure: 'Botox',             status: 'confirmed' },
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
const validateQID = (qid) => /^\d{11}$/.test(qid.replace(/\s/g, ''));
const validateQatarPhone = (p) => /^\+974\s?\d{4}\s?\d{4}$/.test(p);

// ---- Main App -------------------------------------------------------
export default function ReceptionPrototype() {
  const [date, setDate] = useState(new Date(2026, 4, 24)); // Sun 24 May 2026
  const [appointments, setAppointments] = useState(SEED_APPOINTMENTS);
  const [bookingModal, setBookingModal] = useState(null); // { doctorId, slot } | null
  const [detailModal, setDetailModal] = useState(null);   // appointment | null
  const [locale, setLocale] = useState('en'); // 'en' | 'ar'

  const isArabic = locale === 'ar';

  const todaysApts = useMemo(() => appointments, [appointments]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const insured = appointments.filter(a => {
      const p = MOCK_PATIENTS.find(p => p.id === a.patientId);
      return p?.insurer && p.insurer !== 'Cash/Card';
    }).length;
    const inProgress = appointments.filter(a => a.status === 'in-progress').length;
    return { total, insured, inProgress };
  }, [appointments]);

  const addAppointment = (apt) => {
    setAppointments(prev => [...prev, { ...apt, id: `a${Date.now()}`, status: 'confirmed' }]);
    setBookingModal(null);
  };

  const prevDay = () => setDate(d => { const n = new Date(d); n.setDate(d.getDate() - 1); return n; });
  const nextDay = () => setDate(d => { const n = new Date(d); n.setDate(d.getDate() + 1); return n; });

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: '"IBM Plex Sans", "Noto Sans Arabic", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+Arabic:wght@400;500;600&display=swap');
        .mono { font-family: "IBM Plex Mono", monospace; }
        .grid-cell { transition: background-color 120ms ease; }
        .grid-cell:hover { background-color: rgba(120, 113, 108, 0.06); cursor: pointer; }
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
            <button
              onClick={() => setLocale(l => l === 'en' ? 'ar' : 'en')}
              className="px-3 py-1.5 text-xs border border-stone-300 rounded-md hover:bg-stone-100 flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              {locale === 'en' ? 'العربية' : 'English'}
            </button>
            <div className="px-3 py-1.5 text-xs bg-stone-100 rounded-md text-stone-700">
              Rania M. · Reception
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="px-6 py-2.5 flex items-center gap-6 border-t border-stone-100 bg-stone-50/60">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-500" />
            <button onClick={prevDay} className="p-1 hover:bg-stone-200 rounded"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <span className="text-sm font-medium mono w-44 text-center">{fmt(date)}</span>
            <button onClick={nextDay} className="p-1 hover:bg-stone-200 rounded"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
          <div className="h-4 w-px bg-stone-300" />
          <Stat label={isArabic ? 'إجمالي الحجوزات' : 'Total bookings'} value={stats.total} />
          <Stat label={isArabic ? 'مؤمن عليه' : 'Insured'} value={stats.insured} />
          <Stat label={isArabic ? 'قيد التنفيذ' : 'In progress'} value={stats.inProgress} accent="emerald" />
        </div>
      </header>

      {/* Main grid */}
      <main className="px-6 py-5">
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          {/* Doctor column headers */}
          <div className="grid border-b border-stone-200" style={{ gridTemplateColumns: `80px repeat(${DOCTORS.length}, 1fr)` }}>
            <div className="p-3 text-xs text-stone-500 font-medium border-r border-stone-200">
              {isArabic ? 'الوقت' : 'Time'}
            </div>
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
                  const apt = appointments.find(a => a.doctorId === doc.id && a.start === slot);
                  if (apt) {
                    const patient = MOCK_PATIENTS.find(p => p.id === apt.patientId);
                    const cells = apt.dur / 30;
                    const colors = COLOR_MAP[doc.color];
                    return (
                      <button
                        key={doc.id + slot}
                        onClick={() => setDetailModal(apt)}
                        className={`relative border-r border-stone-200 last:border-r-0 text-left p-2 m-0.5 rounded ${colors.bg} ${colors.border} border ${colors.text} hover:brightness-95`}
                        style={{ gridRow: `span ${cells}`, minHeight: `${cells * 44 - 4}px` }}
                      >
                        <div className="text-xs font-medium truncate">{patient?.nameEn}</div>
                        <div className="text-[11px] truncate opacity-80">{apt.procedure}</div>
                        <div className="text-[10px] mono opacity-70 mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {apt.start} · {apt.dur}m
                          {apt.status === 'in-progress' && (
                            <span className="ml-auto inline-flex items-center gap-1 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              live
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  }
                  // Check if a previous appointment occupies this slot
                  const blocked = appointments.some(a => {
                    if (a.doctorId !== doc.id) return false;
                    const startIdx = TIME_SLOTS.indexOf(a.start);
                    const endIdx = startIdx + a.dur / 30;
                    const thisIdx = TIME_SLOTS.indexOf(slot);
                    return thisIdx > startIdx && thisIdx < endIdx;
                  });
                  if (blocked) return <div key={doc.id + slot} className="border-r border-stone-200 last:border-r-0" />;
                  return (
                    <div
                      key={doc.id + slot}
                      onClick={() => setBookingModal({ doctorId: doc.id, slot })}
                      className="grid-cell border-r border-stone-200 last:border-r-0"
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
          <div>{isArabic ? 'انقر فوق أي خلية فارغة لحجز موعد' : 'Click any empty cell to book an appointment'}</div>
          <div className="flex items-center gap-3">
            <LegendDot label={isArabic ? 'مؤكد' : 'Confirmed'} colorClass="bg-stone-400" />
            <LegendDot label={isArabic ? 'قيد التنفيذ' : 'In progress'} colorClass="bg-emerald-500" />
          </div>
        </div>
      </main>

      {bookingModal && (
        <BookingModal
          isArabic={isArabic}
          doctor={DOCTORS.find(d => d.id === bookingModal.doctorId)}
          slot={bookingModal.slot}
          onClose={() => setBookingModal(null)}
          onConfirm={addAppointment}
        />
      )}

      {detailModal && (
        <AppointmentDetail
          isArabic={isArabic}
          appointment={detailModal}
          onClose={() => setDetailModal(null)}
        />
      )}
    </div>
  );
}

// ---- Sub-components -------------------------------------------------
function Stat({ label, value, accent }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`text-base font-semibold mono ${accent === 'emerald' ? 'text-emerald-700' : 'text-stone-900'}`}>{value}</span>
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

// ---- BOOKING MODAL -------------------------------------------------
function BookingModal({ doctor, slot, onClose, onConfirm, isArabic }) {
  const [step, setStep] = useState(1); // 1: patient, 2: procedure, 3: confirm
  const [searchQ, setSearchQ] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPatient, setNewPatient] = useState(null);
  const [procedure, setProcedure] = useState(null);
  const [notes, setNotes] = useState('');

  const patient = selectedPatient || newPatient;

  const searchResults = useMemo(() => {
    if (!searchQ) return [];
    return MOCK_PATIENTS.filter(p =>
      p.qid.includes(searchQ.replace(/\s/g, '')) ||
      p.nameEn.toLowerCase().includes(searchQ.toLowerCase()) ||
      p.phone.replace(/\s/g, '').includes(searchQ.replace(/\s/g, ''))
    );
  }, [searchQ]);

  const handleConfirm = () => {
    onConfirm({
      doctorId: doctor.id,
      patientId: patient.id,
      start: slot,
      dur: procedure.dur,
      procedure: procedure.name,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{isArabic ? 'حجز موعد جديد' : 'New appointment'}</div>
            <div className="text-xs text-stone-500 mt-0.5 mono">
              {doctor.nameEn} · {slot} · Sun 24 May
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
              selectedPatient={selectedPatient}
              setSelectedPatient={(p) => { setSelectedPatient(p); setNewPatient(null); }}
              newPatient={newPatient}
              setNewPatient={(p) => { setNewPatient(p); setSelectedPatient(null); }}
            />
          )}
          {step === 2 && (
            <ProcedureStep
              doctor={doctor}
              procedure={procedure}
              setProcedure={setProcedure}
              notes={notes}
              setNotes={setNotes}
              patient={patient}
            />
          )}
          {step === 3 && (
            <ConfirmStep doctor={doctor} slot={slot} patient={patient} procedure={procedure} notes={notes} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between bg-stone-50">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-3 py-1.5 text-sm text-stone-600 hover:text-stone-900"
          >
            {step === 1 ? (isArabic ? 'إلغاء' : 'Cancel') : (isArabic ? 'رجوع' : 'Back')}
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !patient) || (step === 2 && !procedure)}
              className="px-4 py-1.5 text-sm bg-stone-900 text-white rounded-md hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              {isArabic ? 'متابعة' : 'Continue'}
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="px-4 py-1.5 text-sm bg-emerald-700 text-white rounded-md hover:bg-emerald-800 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isArabic ? 'تأكيد الحجز' : 'Confirm booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Step 1: Patient ------------------------------------------------
function PatientStep({ searchQ, setSearchQ, results, selectedPatient, setSelectedPatient, newPatient, setNewPatient }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState({ qid: '', nameEn: '', phone: '+974 ', dob: '', insurer: 'Cash/Card', policy: '' });

  const qidValid = !form.qid || validateQID(form.qid);
  const phoneValid = !form.phone || validateQatarPhone(form.phone);
  const canSave = form.nameEn && validateQID(form.qid) && validateQatarPhone(form.phone) && form.dob;

  const saveNew = () => {
    const id = `new-${Date.now()}`;
    setNewPatient({ id, ...form, eligible: form.insurer === 'Cash/Card' ? null : 'pending' });
    setShowNewForm(false);
  };

  return (
    <div>
      <label className="text-xs text-stone-600 font-medium">Search patient</label>
      <div className="mt-1.5 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          placeholder="QID, name, or phone — e.g. 28934567812"
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
                <div className="text-sm font-medium">{p.nameEn}</div>
                <div className="text-xs text-stone-500 mono">QID {p.qid} · {p.phone}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-stone-600">{p.insurer}</div>
                <div className="text-[10px] text-stone-400 mono">Last: {p.lastVisit}</div>
              </div>
              {selectedPatient?.id === p.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </button>
          ))}
        </div>
      )}

      {searchQ && results.length === 0 && !showNewForm && (
        <div className="mt-3 text-xs text-stone-500 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md">
          No patient found. <button className="underline font-medium" onClick={() => setShowNewForm(true)}>Register new patient</button>
        </div>
      )}

      {!showNewForm && !searchQ && (
        <button
          onClick={() => setShowNewForm(true)}
          className="mt-3 w-full px-3 py-2.5 border border-dashed border-stone-300 rounded-md text-sm text-stone-600 hover:bg-stone-50 hover:border-stone-400 flex items-center justify-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Register new patient
        </button>
      )}

      {showNewForm && (
        <div className="mt-4 p-4 bg-stone-50 border border-stone-200 rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-stone-700">New patient details</div>
            <button onClick={() => setShowNewForm(false)} className="text-xs text-stone-500 hover:text-stone-700">Cancel</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="QID (Qatar ID)"
              value={form.qid}
              onChange={v => setForm({ ...form, qid: v.replace(/\D/g, '').slice(0, 11) })}
              placeholder="11 digits"
              mono
              error={form.qid && !qidValid ? 'Must be 11 digits' : null}
            />
            <Field
              label="Full name (English)"
              value={form.nameEn}
              onChange={v => setForm({ ...form, nameEn: v })}
              placeholder="e.g. Sara Al-Mannai"
            />
            <Field
              label="Phone (+974)"
              value={form.phone}
              onChange={v => setForm({ ...form, phone: v })}
              placeholder="+974 5512 4488"
              mono
              error={form.phone && !phoneValid ? 'Format: +974 #### ####' : null}
            />
            <Field
              label="Date of birth"
              value={form.dob}
              onChange={v => setForm({ ...form, dob: v })}
              placeholder="YYYY-MM-DD"
              type="date"
              mono
            />
            <div>
              <label className="text-xs text-stone-600 font-medium">Insurer</label>
              <select
                value={form.insurer}
                onChange={e => setForm({ ...form, insurer: e.target.value })}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 bg-white"
              >
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
              <Field
                label="Policy number"
                value={form.policy}
                onChange={v => setForm({ ...form, policy: v })}
                placeholder="e.g. QLM-447821"
                mono
              />
            )}
          </div>

          <div className="text-[11px] text-stone-500 leading-relaxed border-t border-stone-200 pt-3">
            <Shield className="w-3 h-3 inline -mt-0.5 mr-1" />
            Patient consent for data processing will be collected at check-in (per Qatar PDPPL).
            Records will be retained for 10 years per MOPH guidelines.
          </div>

          <button
            onClick={saveNew}
            disabled={!canSave}
            className="w-full px-3 py-2 text-sm bg-stone-900 text-white rounded-md hover:bg-stone-800 disabled:bg-stone-300"
          >
            Save and continue
          </button>
        </div>
      )}

      {selectedPatient && (
        <PatientCard patient={selectedPatient} />
      )}
      {newPatient && (
        <PatientCard patient={newPatient} isNew />
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', mono, error }) {
  return (
    <div>
      <label className="text-xs text-stone-600 font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1.5 w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-stone-500 ${error ? 'border-red-300' : 'border-stone-300'} ${mono ? 'mono' : ''}`}
      />
      {error && <div className="text-[10px] text-red-600 mt-0.5">{error}</div>}
    </div>
  );
}

function PatientCard({ patient, isNew }) {
  return (
    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-emerald-900">
          {isNew && <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded mr-1.5 align-middle">NEW</span>}
          {patient.nameEn}
        </div>
        <div className="text-xs text-emerald-800 mono mt-0.5">QID {patient.qid} · {patient.phone}</div>
        {patient.insurer && patient.insurer !== 'Cash/Card' && (
          <div className="mt-2 flex items-center gap-2">
            <Shield className="w-3 h-3 text-emerald-700" />
            <span className="text-xs text-emerald-900">{patient.insurer} · {patient.policy || '—'}</span>
            {patient.eligible === true && <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded">Eligible</span>}
            {patient.eligible === 'pending' && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Verifying…</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Step 2: Procedure ----------------------------------------------
function ProcedureStep({ doctor, procedure, setProcedure, notes, setNotes, patient }) {
  const list = PROCEDURES[doctor.specialty] || [];
  const isInsured = patient?.insurer && patient.insurer !== 'Cash/Card';

  return (
    <div>
      <div className="text-xs text-stone-600 mb-2 font-medium">Procedure with {doctor.nameEn}</div>
      <div className="space-y-1.5">
        {list.map(p => (
          <button
            key={p.name}
            onClick={() => setProcedure(p)}
            className={`w-full px-3 py-2.5 text-left border rounded-md flex items-center justify-between hover:border-stone-400 transition-colors ${procedure?.name === p.name ? 'border-stone-900 bg-stone-50' : 'border-stone-200'}`}
          >
            <div>
              <div className="text-sm font-medium">{p.name}</div>
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

      <div className="mt-4">
        <label className="text-xs text-stone-600 font-medium">Reason for visit / chief complaint</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. Patient complaining of upper-left molar pain since Friday."
          className="mt-1.5 w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 resize-none"
        />
      </div>
    </div>
  );
}

// ---- Step 3: Confirm ------------------------------------------------
function ConfirmStep({ doctor, slot, patient, procedure, notes }) {
  const isInsured = patient?.insurer && patient.insurer !== 'Cash/Card';
  const isDental = doctor.specialty.includes('Dent') || doctor.specialty === 'Orthodontics' || doctor.specialty === 'Endodontics';
  const insuranceCovers = isInsured && isDental;

  return (
    <div className="space-y-4">
      <Row label="Patient" value={patient.nameEn} sub={`QID ${patient.qid}`} />
      <Row label="Doctor" value={doctor.nameEn} sub={doctor.specialty} />
      <Row label="When" value="Sun 24 May 2026" sub={`${slot} · ${procedure.dur} minutes`} />
      <Row label="Procedure" value={procedure.name} sub={`QAR ${procedure.price.toLocaleString()}`} />
      {notes && <Row label="Notes" value={notes} />}

      <div className="border-t border-stone-200 pt-4">
        <div className="text-xs font-semibold text-stone-700 mb-2">Payment path</div>
        {insuranceCovers ? (
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-md">
            <div className="flex items-center gap-2 text-sm font-medium text-sky-900">
              <Shield className="w-4 h-4" />
              Insurance claim — {patient.insurer}
            </div>
            <div className="text-xs text-sky-800 mt-1">
              Pre-authorization will be submitted automatically. Patient may need to pay co-pay at check-out.
            </div>
            <div className="text-[10px] text-sky-700 mt-2 mono">Claim will be flagged for billing team review.</div>
          </div>
        ) : (
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-md">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-900">
              <CreditCard className="w-4 h-4" />
              Direct payment — {patient.insurer || 'Cash/Card'}
            </div>
            <div className="text-xs text-stone-600 mt-1">
              {isInsured && !isDental
                ? 'This aesthetic procedure is not covered. Patient will be billed directly.'
                : 'Patient will be billed at check-out.'}
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

// ---- Appointment Detail (when clicking an existing appointment) -----
function AppointmentDetail({ appointment, onClose, isArabic }) {
  const doctor = DOCTORS.find(d => d.id === appointment.doctorId);
  const patient = MOCK_PATIENTS.find(p => p.id === appointment.patientId);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{isArabic ? 'تفاصيل الموعد' : 'Appointment details'}</div>
            <div className="text-xs text-stone-500 mt-0.5 mono">#{appointment.id}</div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <Row label="Patient" value={patient?.nameEn} sub={`QID ${patient?.qid}`} />
          <Row label="Phone" value={patient?.phone} />
          <Row label="Doctor" value={doctor?.nameEn} sub={doctor?.specialty} />
          <Row label="Time" value={appointment.start} sub={`${appointment.dur} minutes`} />
          <Row label="Procedure" value={appointment.procedure} />
          <Row label="Insurance" value={patient?.insurer} sub={patient?.policy} />
          <Row label="Status" value={
            appointment.status === 'in-progress'
              ? <span className="inline-flex items-center gap-1.5 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> In progress</span>
              : 'Confirmed'
          } />
        </div>

        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button className="text-xs text-red-600 hover:underline">Cancel appointment</button>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs border border-stone-300 rounded-md hover:bg-stone-100 flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> Call
            </button>
            <button className="px-3 py-1.5 text-xs bg-stone-900 text-white rounded-md hover:bg-stone-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> Check in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
