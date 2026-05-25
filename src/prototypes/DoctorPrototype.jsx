import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, Calendar, Clock, Phone, Shield, AlertCircle, AlertTriangle,
  Plus, X, Camera, FileText, Pill, Activity, CheckCircle2, ArrowRight, ArrowLeft,
  Edit3, Save, ClipboardList, Image as ImageIcon, ChevronDown, ChevronRight, Stethoscope,
  Droplet, Sparkles, Users, UserCheck
} from 'lucide-react';

// =====================================================================
// MEDLY — Doctor Portal Prototype
// Qatar dental + aesthetic clinic. Switchable between dental and aesthetic
// encounter views to demonstrate both clinical workflows.
// =====================================================================

// ---- Mock data ------------------------------------------------------
const PATIENT = {
  id: 'p1',
  qid: '28934567812',
  nameEn: 'Aisha Al-Kuwari',
  nameAr: 'عائشة الكواري',
  dob: '1989-03-14',
  age: 37,
  sex: 'F',
  phone: '+974 5512 4488',
  insurer: 'QLM',
  policy: 'QLM-447821',
  allergies: ['Penicillin (rash)', 'Latex'],
  conditions: ['Type 2 diabetes (controlled)', 'Hypertension'],
  medications: ['Metformin 500mg BD', 'Amlodipine 5mg OD'],
  bloodType: 'O+',
  smoker: false,
  pregnant: false,
  careTeam: {
    dental: {
      assistantDoctor: { name: 'Dr. Yusuf Hassan', role: 'Asst. Doctor', specialty: 'Cosmetic Dentistry', initials: 'YH' },
      nurse: { name: 'Nurse Sara Al-Amin', role: 'Dental Nurse', initials: 'SA' },
    },
    aesthetic: {
      assistantDoctor: { name: 'Dr. Marcus Chen', role: 'Asst. Doctor', specialty: 'Aesthetic Medicine', initials: 'MC' },
      nurse: { name: 'Nurse Dina Khalil', role: 'Aesthetic Nurse', initials: 'DK' },
    },
  },
};

const ENCOUNTER_HISTORY = [
  { id: 'e1', date: '2026-04-18', doctor: 'Dr. Priya Menon',     specialty: 'Endodontics',     procedure: 'Root canal — #16', notes: 'Asymptomatic at 6 weeks. Final restoration recommended.', kind: 'dental',    icon: 'tooth' },
  { id: 'e2', date: '2026-02-14', doctor: 'Dr. Layla Al-Mahmoud', specialty: 'General Dentistry', procedure: 'Cleaning + composite filling #36', notes: 'Mild gingivitis lower right. Advised improved flossing.', kind: 'dental', icon: 'tooth' },
  { id: 'e3', date: '2025-11-22', doctor: 'Dr. Reem Al-Thani',    specialty: 'Aesthetic Medicine', procedure: 'Botox — glabellar + forehead', notes: '20U total. Patient pleased at 14-day follow-up.', kind: 'aesthetic', icon: 'sparkle' },
  { id: 'e4', date: '2025-08-03', doctor: 'Dr. Layla Al-Mahmoud', specialty: 'General Dentistry', procedure: 'Consultation + bitewing X-rays', notes: 'Recurrent decay #16 — referred to endodontics.', kind: 'dental', icon: 'tooth' },
  { id: 'e5', date: '2025-05-10', doctor: 'Dr. Reem Al-Thani',    specialty: 'Aesthetic Medicine', procedure: 'Initial consultation', notes: 'Patient interested in preventive Botox.', kind: 'aesthetic', icon: 'sparkle' },
];

const TODAYS_APT = {
  dental: { doctor: 'Dr. Layla Al-Mahmoud', specialty: 'General Dentistry', procedure: 'Filling — tooth #16', time: '10:30', dur: 60, chiefComplaint: 'Sensitivity to cold on upper-right back tooth, started 4 days ago.' },
  aesthetic: { doctor: 'Dr. Reem Al-Thani', specialty: 'Aesthetic Medicine', procedure: 'Botox + dermal filler review', time: '15:30', dur: 60, chiefComplaint: 'Wants to refresh Botox from November and discuss tear-trough filler.' },
};

// Dental drug favourites (real, common in dental practice)
const DRUG_FAVOURITES = [
  { name: 'Amoxicillin 500mg', sig: '1 cap TDS × 5 days', class: 'Antibiotic' },
  { name: 'Ibuprofen 400mg',   sig: '1 tab TDS PRN pain × 3 days', class: 'NSAID' },
  { name: 'Paracetamol 1g',    sig: '1 tab QDS PRN pain', class: 'Analgesic' },
  { name: 'Chlorhexidine 0.2% mouthwash', sig: '10ml rinse BD × 7 days', class: 'Antiseptic' },
  { name: 'Metronidazole 400mg', sig: '1 tab TDS × 5 days', class: 'Antibiotic' },
];

// ---- Main App -------------------------------------------------------
export default function DoctorPrototype() {
  const [mode, setMode] = useState('dental'); // 'dental' | 'aesthetic'
  const isDental = mode === 'dental';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: '"IBM Plex Sans", "Noto Sans Arabic", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .mono { font-family: "IBM Plex Mono", monospace; }
        .tooth-svg:hover { filter: brightness(0.95); cursor: pointer; }
        .injection-site:hover { r: 9; cursor: pointer; }
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
              <div className="text-sm font-semibold tracking-tight">Medly Clinical</div>
              <div className="text-xs text-stone-500">Yasmeen Clinic, Doha</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex border border-stone-300 rounded-md overflow-hidden text-xs">
              <button
                onClick={() => setMode('dental')}
                className={`px-3 py-1.5 flex items-center gap-1.5 ${isDental ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}
              >
                <Stethoscope className="w-3 h-3" /> Dental
              </button>
              <button
                onClick={() => setMode('aesthetic')}
                className={`px-3 py-1.5 flex items-center gap-1.5 ${!isDental ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}
              >
                <Sparkles className="w-3 h-3" /> Aesthetic
              </button>
            </div>
            <div className="px-3 py-1.5 text-xs bg-stone-100 rounded-md text-stone-700">
              {isDental ? 'Dr. Layla Al-Mahmoud' : 'Dr. Reem Al-Thani'}
            </div>
          </div>
        </div>
      </header>

      {/* Patient banner — always visible, the doctor's anchor */}
      <PatientBanner patient={PATIENT} appointment={TODAYS_APT[mode]} mode={mode} />

      {/* Three-column layout: history | encounter | actions */}
      <div className="grid grid-cols-12 gap-4 px-4 py-4">
        {/* Left: History */}
        <aside className="col-span-3">
          <HistoryColumn patient={PATIENT} history={ENCOUNTER_HISTORY} mode={mode} />
        </aside>

        {/* Center: Active encounter */}
        <main className="col-span-6">
          {isDental ? <DentalEncounter appointment={TODAYS_APT.dental} /> : <AestheticEncounter appointment={TODAYS_APT.aesthetic} />}
        </main>

        {/* Right: Actions */}
        <aside className="col-span-3">
          <ActionsColumn mode={mode} appointment={TODAYS_APT[mode]} />
        </aside>
      </div>
    </div>
  );
}

// =====================================================================
// PATIENT BANNER — sticky context that never leaves the screen
// =====================================================================
function PatientBanner({ patient, appointment, mode }) {
  const team = patient.careTeam[mode];
  return (
    <div className="bg-white border-b border-stone-200">
      <div className="px-6 py-3 flex items-start gap-5">
        {/* Identity */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-medium text-stone-700">{patient.nameEn.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold">{patient.nameEn}</div>
              <div className="text-sm text-stone-500" dir="rtl">{patient.nameAr}</div>
            </div>
            <div className="text-xs text-stone-500 mono mt-0.5">
              QID {patient.qid} · {patient.age}y · {patient.sex} · {patient.bloodType}
            </div>
            <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {patient.insurer} · {patient.policy}</span>
            </div>
          </div>
        </div>

        {/* Care team */}
        <div className="border-l border-stone-200 pl-5 min-w-[190px]">
          <div className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 mb-1.5">
            <Users className="w-3.5 h-3.5" /> Care team
          </div>
          <div className="space-y-1.5">
            <CareTeamMember member={team.assistantDoctor} color="violet" />
            <CareTeamMember member={team.nurse} color="sky" />
          </div>
        </div>

        {/* Allergies — always highlighted */}
        <div className="border-l border-stone-200 pl-5 min-w-[170px]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            Allergies
          </div>
          <div className="mt-1 space-y-0.5">
            {patient.allergies.map(a => (
              <div key={a} className="text-xs text-red-900 bg-red-50 border border-red-200 px-2 py-0.5 rounded inline-block mr-1">
                {a}
              </div>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="border-l border-stone-200 pl-5 min-w-[170px]">
          <div className="text-xs font-semibold text-stone-700">Conditions</div>
          <div className="mt-1 space-y-0.5">
            {patient.conditions.map(c => (
              <div key={c} className="text-xs text-stone-700">{c}</div>
            ))}
          </div>
        </div>

        {/* Today's appointment */}
        <div className="border-l border-stone-200 pl-5 min-w-[180px]">
          <div className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Today
          </div>
          <div className="text-sm font-medium mt-1">{appointment.procedure}</div>
          <div className="text-xs text-stone-500 mono mt-0.5">
            {appointment.time} · {appointment.dur} min
          </div>
        </div>
      </div>

      {/* Chief complaint strip */}
      <div className="px-6 py-2 bg-amber-50 border-t border-amber-200 flex items-start gap-2">
        <div className="text-[10px] font-semibold text-amber-800 mt-0.5 uppercase tracking-wide">Chief complaint</div>
        <div className="text-xs text-amber-900 italic">"{appointment.chiefComplaint}"</div>
        <div className="ml-auto text-[10px] text-amber-700 mono">Logged by reception · 09:14</div>
      </div>
    </div>
  );
}

function CareTeamMember({ member, color }) {
  const colors = {
    violet: 'bg-violet-100 text-violet-800',
    sky:    'bg-sky-100 text-sky-800',
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${colors[color]}`}>
        {member.initials}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium truncate">{member.name}</div>
        <div className="text-[10px] text-stone-500">{member.role}</div>
      </div>
    </div>
  );
}

// =====================================================================
// LEFT COLUMN — History timeline
// =====================================================================
function HistoryColumn({ patient, history, mode }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'dental' | 'aesthetic'
  const filtered = filter === 'all' ? history : history.filter(e => e.kind === filter);

  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
      <div className="px-3 py-2.5 border-b border-stone-200 flex items-center justify-between">
        <div className="text-xs font-semibold text-stone-700">Patient history</div>
        <div className="flex text-[10px] border border-stone-200 rounded overflow-hidden">
          {['all', 'dental', 'aesthetic'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-1.5 py-0.5 capitalize ${filter === f ? 'bg-stone-900 text-white' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Medications section */}
      <div className="px-3 py-2.5 border-b border-stone-100 bg-stone-50/60">
        <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Current meds</div>
        <div className="space-y-1">
          {patient.medications.map(m => (
            <div key={m} className="text-xs flex items-center gap-1.5">
              <Pill className="w-3 h-3 text-stone-400" />
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-3 py-2 max-h-[480px] overflow-y-auto">
        <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Encounters</div>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1.5 top-1 bottom-1 w-px bg-stone-200" />
          {filtered.map(e => (
            <button key={e.id} className="block w-full text-left mb-3 last:mb-0 relative pl-5 hover:bg-stone-50 -mx-1 px-1 py-0.5 rounded">
              <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white ${e.kind === 'dental' ? 'bg-sky-500' : 'bg-rose-400'}`} />
              <div className="text-[10px] mono text-stone-500">{e.date}</div>
              <div className="text-xs font-medium mt-0.5">{e.procedure}</div>
              <div className="text-[11px] text-stone-500 mt-0.5">{e.doctor}</div>
              <div className="text-[11px] text-stone-600 mt-1 italic line-clamp-2">{e.notes}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// CENTER — DENTAL ENCOUNTER
// =====================================================================
function DentalEncounter({ appointment }) {
  const [selectedTooth, setSelectedTooth] = useState(16);
  const [toothFindings, setToothFindings] = useState({
    16: { status: 'decay', note: 'Distal occlusal caries, ~2mm depth' },
    11: { status: 'crown', note: 'Existing crown — intact' },
    36: { status: 'filling', note: 'Composite filling, Feb 2026' },
  });
  const [soap, setSoap] = useState({
    subjective: 'Patient reports cold sensitivity on upper-right back tooth for ~4 days. Pain is sharp but transient, no spontaneous pain at rest. No throbbing or night pain.',
    objective: 'Tooth #16: distal occlusal caries, ~2mm depth on bitewing. No periapical changes. Negative response to percussion. Positive to cold but resolves within 5 seconds.',
    assessment: 'Reversible pulpitis secondary to dental caries on #16. No indication for endodontic treatment at this stage.',
    plan: 'Composite restoration on #16 today. If symptoms persist beyond 2 weeks, reassess for possible endodontic referral.',
  });
  const [expanded, setExpanded] = useState({ subjective: true, objective: true, assessment: true, plan: true });

  const toggle = (k) => setExpanded({ ...expanded, [k]: !expanded[k] });

  return (
    <div className="bg-white border border-stone-200 rounded-lg">
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <div>
          <div className="text-xs text-stone-500 uppercase tracking-wide font-semibold">Active encounter</div>
          <div className="text-sm font-semibold mt-0.5">{appointment.procedure}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> In progress · 14m
          </span>
        </div>
      </div>

      {/* Odontogram */}
      <div className="px-4 py-4 border-b border-stone-100">
        <div className="text-xs font-semibold text-stone-700 mb-2 flex items-center justify-between">
          <span>Odontogram</span>
          <span className="text-[10px] text-stone-500 font-normal">FDI notation · Click any tooth</span>
        </div>
        <Odontogram findings={toothFindings} selected={selectedTooth} onSelect={setSelectedTooth} />

        {selectedTooth && (
          <div className="mt-3 p-2.5 bg-stone-50 border border-stone-200 rounded text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="font-medium">Tooth #{selectedTooth}</div>
              <div className="text-[10px] text-stone-500">
                {selectedTooth >= 11 && selectedTooth <= 18 && 'Upper right'}
                {selectedTooth >= 21 && selectedTooth <= 28 && 'Upper left'}
                {selectedTooth >= 31 && selectedTooth <= 38 && 'Lower left'}
                {selectedTooth >= 41 && selectedTooth <= 48 && 'Lower right'}
              </div>
            </div>
            <div className="text-stone-600">
              {toothFindings[selectedTooth]?.note || <span className="italic text-stone-400">No findings recorded. Click to add.</span>}
            </div>
          </div>
        )}
      </div>

      {/* SOAP note */}
      <div className="px-4 py-3">
        <div className="text-xs font-semibold text-stone-700 mb-2 flex items-center justify-between">
          <span>Clinical note</span>
          <span className="text-[10px] text-stone-500 font-normal">SOAP format · Auto-saved 12s ago</span>
        </div>

        {[
          { key: 'subjective', label: 'S — Subjective', hint: 'What the patient reports' },
          { key: 'objective',  label: 'O — Objective',  hint: 'What you observe / measure' },
          { key: 'assessment', label: 'A — Assessment', hint: 'Your diagnosis or impression' },
          { key: 'plan',       label: 'P — Plan',       hint: 'What you intend to do' },
        ].map(({ key, label, hint }) => (
          <SoapSection
            key={key}
            label={label}
            hint={hint}
            value={soap[key]}
            onChange={v => setSoap({ ...soap, [key]: v })}
            expanded={expanded[key]}
            onToggle={() => toggle(key)}
          />
        ))}
      </div>
    </div>
  );
}

function SoapSection({ label, hint, value, onChange, expanded, onToggle }) {
  return (
    <div className="border border-stone-200 rounded-md mb-2 overflow-hidden">
      <button onClick={onToggle} className="w-full px-3 py-2 flex items-center justify-between hover:bg-stone-50 text-left">
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-3 h-3 text-stone-500" /> : <ChevronRight className="w-3 h-3 text-stone-500" />}
          <div>
            <div className="text-xs font-semibold">{label}</div>
            <div className="text-[10px] text-stone-500">{hint}</div>
          </div>
        </div>
        <div className="text-[10px] mono text-stone-400">{value.length} chars</div>
      </button>
      {expanded && (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border-t border-stone-200 resize-none focus:outline-none focus:bg-stone-50"
        />
      )}
    </div>
  );
}

// ---- Odontogram component -------------------------------------------
function Odontogram({ findings, selected, onSelect }) {
  // FDI tooth numbering: upper-right 18-11, upper-left 21-28, lower-left 38-31, lower-right 48-41
  const upper = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lower = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const statusColor = (status) => {
    if (status === 'decay') return '#fca5a5';
    if (status === 'filling') return '#93c5fd';
    if (status === 'crown') return '#fcd34d';
    if (status === 'missing') return '#d6d3d1';
    return '#ffffff';
  };

  return (
    <div className="bg-stone-50 rounded-md p-3">
      <div className="flex flex-col items-center gap-1">
        <div className="text-[9px] text-stone-400 mono">UPPER</div>
        <div className="flex gap-0.5">
          {upper.map((t, i) => (
            <Tooth key={t} num={t} findings={findings[t]} selected={selected === t} onSelect={onSelect} fill={statusColor(findings[t]?.status)} divider={i === 7} />
          ))}
        </div>
        <div className="flex gap-0.5">
          {lower.map((t, i) => (
            <Tooth key={t} num={t} findings={findings[t]} selected={selected === t} onSelect={onSelect} fill={statusColor(findings[t]?.status)} divider={i === 7} flipped />
          ))}
        </div>
        <div className="text-[9px] text-stone-400 mono">LOWER</div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-stone-200 text-[10px] text-stone-600">
        <Legend color="#fca5a5" label="Decay" />
        <Legend color="#93c5fd" label="Filling" />
        <Legend color="#fcd34d" label="Crown" />
        <Legend color="#d6d3d1" label="Missing" />
        <Legend color="#ffffff" label="Healthy" border />
      </div>
    </div>
  );
}

function Tooth({ num, findings, selected, onSelect, fill, divider, flipped }) {
  return (
    <>
      {divider && <div className="w-2" />}
      <button
        onClick={() => onSelect(num)}
        className="flex flex-col items-center group"
      >
        <div className="text-[8px] text-stone-400 mono group-hover:text-stone-700">{num}</div>
        <svg width="20" height="26" viewBox="0 0 20 26" className="tooth-svg" style={{ transform: flipped ? 'scaleY(-1)' : 'none' }}>
          <path
            d="M3,2 Q3,0 5,0 L15,0 Q17,0 17,2 L18,12 Q18,18 16,22 Q14,26 12,24 L8,24 Q6,26 4,22 Q2,18 2,12 Z"
            fill={fill}
            stroke={selected ? '#0c0a09' : '#a8a29e'}
            strokeWidth={selected ? 1.5 : 0.7}
          />
        </svg>
      </button>
    </>
  );
}

function Legend({ color, label, border }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color, border: border ? '1px solid #a8a29e' : 'none' }} />
      <span>{label}</span>
    </div>
  );
}

// =====================================================================
// CENTER — AESTHETIC ENCOUNTER
// =====================================================================

// Body zones per tab — each zone has a label and normalised SVG coordinates
const BODY_ZONES = {
  face: [
    { id: 'glabellar',    label: 'Glabellar',        cx: 150, cy: 88  },
    { id: 'l-frontalis',  label: 'L Frontalis',      cx: 122, cy: 72  },
    { id: 'r-frontalis',  label: 'R Frontalis',      cx: 178, cy: 72  },
    { id: 'l-crow',       label: "L Crow's feet",    cx: 102, cy: 108 },
    { id: 'r-crow',       label: "R Crow's feet",    cx: 198, cy: 108 },
    { id: 'l-cheek',      label: 'L Cheek',          cx: 108, cy: 148 },
    { id: 'r-cheek',      label: 'R Cheek',          cx: 192, cy: 148 },
    { id: 'perioral',     label: 'Perioral',         cx: 150, cy: 185 },
    { id: 'chin',         label: 'Chin',             cx: 150, cy: 210 },
    { id: 'masseter-l',   label: 'L Masseter',       cx: 96,  cy: 178 },
    { id: 'masseter-r',   label: 'R Masseter',       cx: 204, cy: 178 },
  ],
  neck: [
    { id: 'neck-bands',   label: 'Platysmal bands',  cx: 150, cy: 60  },
    { id: 'neck-l',       label: 'L Neck',           cx: 110, cy: 90  },
    { id: 'neck-r',       label: 'R Neck',           cx: 190, cy: 90  },
    { id: 'decolletage',  label: 'Décolletage',      cx: 150, cy: 170 },
    { id: 'l-shoulder',   label: 'L Shoulder',       cx: 68,  cy: 145 },
    { id: 'r-shoulder',   label: 'R Shoulder',       cx: 232, cy: 145 },
  ],
  arms: [
    { id: 'l-axilla',     label: 'L Axilla',         cx: 90,  cy: 55  },
    { id: 'r-axilla',     label: 'R Axilla',         cx: 210, cy: 55  },
    { id: 'l-forearm',    label: 'L Forearm',        cx: 60,  cy: 155 },
    { id: 'r-forearm',    label: 'R Forearm',        cx: 240, cy: 155 },
    { id: 'l-hand',       label: 'L Hand',           cx: 48,  cy: 225 },
    { id: 'r-hand',       label: 'R Hand',           cx: 252, cy: 225 },
  ],
  torso: [
    { id: 'hyperhidrosis-torso', label: 'Hyperhidrosis — torso', cx: 150, cy: 100 },
    { id: 'l-flank',      label: 'L Flank',          cx: 88,  cy: 145 },
    { id: 'r-flank',      label: 'R Flank',          cx: 212, cy: 145 },
    { id: 'abdomen',      label: 'Abdomen',          cx: 150, cy: 190 },
    { id: 'lower-back',   label: 'Lower back',       cx: 150, cy: 240 },
  ],
  legs: [
    { id: 'l-thigh',      label: 'L Thigh',          cx: 110, cy: 60  },
    { id: 'r-thigh',      label: 'R Thigh',          cx: 190, cy: 60  },
    { id: 'l-calf',       label: 'L Calf',           cx: 104, cy: 175 },
    { id: 'r-calf',       label: 'R Calf',           cx: 196, cy: 175 },
    { id: 'l-foot',       label: 'L Plantar',        cx: 100, cy: 255 },
    { id: 'r-foot',       label: 'R Plantar',        cx: 200, cy: 255 },
  ],
};

const BODY_TAB_LABELS = {
  face: 'Face', neck: 'Neck / Décolletage',
  arms: 'Arms / Hands', torso: 'Torso', legs: 'Legs / Feet',
};

function AestheticEncounter({ appointment }) {
  const [bodyTab, setBodyTab] = useState('face');
  const [sites, setSites] = useState([
    { id: 1, zone: 'glabellar',   tab: 'face', product: 'Botox', units: 12, batch: 'BTX-9921', region: 'Glabellar' },
    { id: 2, zone: 'l-frontalis', tab: 'face', product: 'Botox', units: 4,  batch: 'BTX-9921', region: 'L Frontalis' },
    { id: 3, zone: 'r-frontalis', tab: 'face', product: 'Botox', units: 4,  batch: 'BTX-9921', region: 'R Frontalis' },
  ]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [addingZone, setAddingZone] = useState(null); // zone id being added
  const [consent, setConsent] = useState({ procedure: true, photos: false, marketing: false });
  const [soap, setSoap] = useState({
    subjective: 'Patient pleased with November Botox result. Now interested in tear-trough filler for mild hollowness, present for 1+ year. No prior filler.',
    objective: 'Glabellar lines fully resolved. Mild residual frontalis activity. Bilateral tear-trough hollows, grade 2 — palpable bone, mild shadowing.',
    assessment: 'Recurrence of glabellar/frontalis dynamic lines (5-month interval, expected). Mild infraorbital volume deficit, candidate for HA filler (cannula technique).',
    plan: 'Botox 20U today (glabellar 12U + frontalis 4U+4U). Schedule tear-trough filler consult in 2 weeks with photography review.',
  });
  const [expanded, setExpanded] = useState({ subjective: true, objective: true, assessment: true, plan: true });
  const toggle = (k) => setExpanded({ ...expanded, [k]: !expanded[k] });

  const tabSites = sites.filter(s => s.tab === bodyTab);
  const allTotals = {};
  sites.forEach(s => { allTotals[s.product] = (allTotals[s.product] || 0) + s.units; });

  const addSite = (zoneId) => {
    const zoneDef = BODY_ZONES[bodyTab].find(z => z.id === zoneId);
    if (!zoneDef) return;
    const newSite = {
      id: Date.now(),
      zone: zoneId,
      tab: bodyTab,
      product: 'Botox',
      units: 4,
      batch: 'BTX-9921',
      region: zoneDef.label,
    };
    setSites(prev => [...prev, newSite]);
    setAddingZone(null);
    setSelectedSite(newSite.id);
  };

  const removeSite = (siteId) => {
    setSites(prev => prev.filter(s => s.id !== siteId));
    if (selectedSite === siteId) setSelectedSite(null);
  };

  const occupiedZones = new Set(tabSites.map(s => s.zone));

  return (
    <div className="bg-white border border-stone-200 rounded-lg">
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <div>
          <div className="text-xs text-stone-500 uppercase tracking-wide font-semibold">Active encounter</div>
          <div className="text-sm font-semibold mt-0.5">{appointment.procedure}</div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> In progress · 8m
        </span>
      </div>

      {/* Body map */}
      <div className="px-4 py-4 border-b border-stone-100">
        <div className="text-xs font-semibold text-stone-700 mb-2 flex items-center justify-between">
          <span>Injection site map — full body</span>
          <div className="flex items-center gap-2 text-[10px] text-stone-500 font-normal">
            {Object.entries(allTotals).map(([prod, total]) => (
              <span key={prod} className="bg-stone-100 px-2 py-0.5 rounded mono">{prod} {total}U total</span>
            ))}
          </div>
        </div>

        {/* Body region tabs */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {Object.entries(BODY_TAB_LABELS).map(([tab, label]) => {
            const count = sites.filter(s => s.tab === tab).length;
            return (
              <button
                key={tab}
                onClick={() => { setBodyTab(tab); setSelectedSite(null); }}
                className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors flex items-center gap-1.5 ${
                  bodyTab === tab
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`text-[10px] font-semibold px-1 rounded-full ${
                    bodyTab === tab ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-stone-50 rounded-md p-3 grid grid-cols-2 gap-3">
          {/* SVG body zone diagram */}
          <BodyZoneMap
            tab={bodyTab}
            zones={BODY_ZONES[bodyTab]}
            occupiedZones={occupiedZones}
            selectedSite={selectedSite}
            tabSites={tabSites}
            onZoneClick={(zoneId) => {
              const existing = tabSites.find(s => s.zone === zoneId);
              if (existing) { setSelectedSite(existing.id); }
              else { setAddingZone(zoneId); }
            }}
          />

          {/* Site list */}
          <div>
            <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
              {BODY_TAB_LABELS[bodyTab]} sites
            </div>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {tabSites.length === 0 && (
                <div className="text-[11px] text-stone-400 italic py-3 text-center">
                  No sites on {BODY_TAB_LABELS[bodyTab]} yet — click a zone to add
                </div>
              )}
              {tabSites.map(s => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSite(s.id)}
                  className={`px-2 py-1.5 text-xs rounded border cursor-pointer ${
                    selectedSite === s.id ? 'border-rose-400 bg-rose-50' : 'border-stone-200 bg-white hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{s.region}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="mono text-stone-500">{s.units}U</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSite(s.id); }}
                        className="text-stone-300 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-stone-500 mono mt-0.5">{s.product} · Lot {s.batch}</div>
                </div>
              ))}
            </div>

            {/* Add site form — appears when a vacant zone is clicked */}
            {addingZone && (
              <AddSiteForm
                zone={BODY_ZONES[bodyTab].find(z => z.id === addingZone)}
                onConfirm={addSite}
                onCancel={() => setAddingZone(null)}
              />
            )}

            {!addingZone && (
              <div className="mt-2 pt-2 border-t border-stone-200 flex items-center justify-between text-[11px]">
                <span className="text-stone-500">This region total</span>
                <span className="mono font-medium">{tabSites.reduce((s, x) => s + x.units, 0)}U</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consent */}
      <div className="px-4 py-3 border-b border-stone-100 bg-amber-50/50">
        <div className="text-xs font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Patient consent — required before procedure
          <span className="text-[10px] text-stone-500 font-normal ml-1">v2.1 · 2026-01-15</span>
        </div>
        <div className="space-y-1.5">
          {[
            { k: 'procedure', label: 'Procedure consent (Botox + filler info)', required: true },
            { k: 'photos',    label: 'Clinical photography (chart use only)',     required: true },
            { k: 'marketing', label: 'Photo use for clinic marketing (optional)', required: false },
          ].map(c => (
            <label key={c.k} className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={consent[c.k]} onChange={() => setConsent({ ...consent, [c.k]: !consent[c.k] })} className="w-3.5 h-3.5" />
              <span className={consent[c.k] ? 'text-stone-900' : 'text-stone-600'}>{c.label}</span>
              {c.required && !consent[c.k] && <span className="text-[10px] text-red-600 font-semibold">REQUIRED</span>}
            </label>
          ))}
        </div>
      </div>

      {/* SOAP */}
      <div className="px-4 py-3">
        <div className="text-xs font-semibold text-stone-700 mb-2 flex items-center justify-between">
          <span>Clinical note</span>
          <span className="text-[10px] text-stone-500 font-normal">SOAP format · Auto-saved 5s ago</span>
        </div>
        {[
          { key: 'subjective', label: 'S — Subjective', hint: 'Patient concerns and goals' },
          { key: 'objective',  label: 'O — Objective',  hint: 'Examination findings, grading' },
          { key: 'assessment', label: 'A — Assessment', hint: 'Clinical impression' },
          { key: 'plan',       label: 'P — Plan',       hint: 'Treatment today + future' },
        ].map(({ key, label, hint }) => (
          <SoapSection key={key} label={label} hint={hint} value={soap[key]}
            onChange={v => setSoap({ ...soap, [key]: v })}
            expanded={expanded[key]} onToggle={() => toggle(key)} />
        ))}
      </div>
    </div>
  );
}

// Body zone SVG diagrams — one per tab
function BodyZoneMap({ tab, zones, occupiedZones, selectedSite, tabSites, onZoneClick }) {
  const siteByZone = {};
  tabSites.forEach(s => { siteByZone[s.zone] = s; });

  const diagrams = {
    face: FaceSvg,
    neck: NeckSvg,
    arms: ArmsSvg,
    torso: TorsoSvg,
    legs: LegsSvg,
  };
  const Diagram = diagrams[tab] || FaceSvg;

  return (
    <div className="relative">
      <Diagram />
      <svg
        viewBox="0 0 300 280"
        className="absolute inset-0 w-full h-full"
        style={{ cursor: 'crosshair' }}
      >
        {zones.map(zone => {
          const site = siteByZone[zone.id];
          const isSelected = site && selectedSite === site.id;
          const occupied = !!site;
          return (
            <g key={zone.id} onClick={() => onZoneClick(zone.id)} style={{ cursor: 'pointer' }}>
              <circle
                cx={zone.cx} cy={zone.cy}
                r={isSelected ? 11 : occupied ? 9 : 7}
                fill={occupied ? (isSelected ? '#f43f5e' : '#fb7185') : 'rgba(244,63,94,0.15)'}
                stroke={occupied ? 'white' : '#f43f5e'}
                strokeWidth={occupied ? 1.5 : 1}
                opacity={occupied ? 0.9 : 0.7}
              />
              {occupied && (
                <text x={zone.cx} y={zone.cy + 3.5} fontSize="8" fill="white" textAnchor="middle" fontWeight="700" pointerEvents="none">
                  {site.units}
                </text>
              )}
              {!occupied && (
                <text x={zone.cx} y={zone.cy + 3.5} fontSize="8" fill="#f43f5e" textAnchor="middle" opacity="0.8" pointerEvents="none">+</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function AddSiteForm({ zone, onConfirm, onCancel }) {
  return (
    <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-xs">
      <div className="font-medium text-rose-900 mb-1.5">Add site: {zone?.label}</div>
      <div className="text-[10px] text-rose-700 mb-2">Click confirm to add with default settings (Botox 4U). Edit after adding.</div>
      <div className="flex gap-1.5">
        <button onClick={() => onConfirm(zone?.id)} className="flex-1 py-1 bg-rose-600 text-white rounded text-[11px] font-medium hover:bg-rose-700">Confirm</button>
        <button onClick={onCancel} className="px-2 py-1 border border-stone-300 rounded text-stone-600 hover:bg-white text-[11px]">Cancel</button>
      </div>
    </div>
  );
}

// --- Body silhouette SVGs ---
function FaceSvg() {
  return (
    <svg viewBox="0 0 300 280" className="w-full" style={{ maxHeight: 200 }}>
      <ellipse cx="150" cy="155" rx="88" ry="112" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <path d="M 72 115 Q 150 55 228 115" stroke="#78716c" strokeWidth="1" fill="none"/>
      <ellipse cx="118" cy="138" rx="10" ry="5" fill="white" stroke="#78716c" strokeWidth="0.8"/>
      <ellipse cx="182" cy="138" rx="10" ry="5" fill="white" stroke="#78716c" strokeWidth="0.8"/>
      <circle cx="118" cy="138" r="2" fill="#44403c"/><circle cx="182" cy="138" r="2" fill="#44403c"/>
      <path d="M 106 122 Q 118 117 130 122" stroke="#44403c" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M 170 122 Q 182 117 194 122" stroke="#44403c" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M 150 142 L 145 172 Q 150 179 155 172 Z" fill="none" stroke="#a8a29e" strokeWidth="0.8"/>
      <path d="M 130 213 Q 150 220 170 213 Q 150 223 130 213" fill="#fda4af" stroke="#9f1239" strokeWidth="0.6"/>
      <path d="M 95 188 Q 62 185 62 215 Q 62 230 80 235" stroke="#a8a29e" strokeWidth="0.8" fill="none"/>
      <path d="M 205 188 Q 238 185 238 215 Q 238 230 220 235" stroke="#a8a29e" strokeWidth="0.8" fill="none"/>
    </svg>
  );
}

function NeckSvg() {
  return (
    <svg viewBox="0 0 300 280" className="w-full" style={{ maxHeight: 200 }}>
      <rect x="118" y="10" width="64" height="70" rx="8" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <path d="M 60 90 Q 60 80 118 80 L 118 80 L 182 80 Q 240 80 240 90 L 255 190 Q 255 210 150 210 Q 45 210 45 190 Z" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <path d="M 118 80 Q 150 100 182 80" stroke="#a8a29e" strokeWidth="0.8" fill="none" strokeDasharray="3 2"/>
      <line x1="140" y1="90" x2="140" y2="175" stroke="#e8d5b7" strokeWidth="0.8"/>
      <line x1="160" y1="90" x2="160" y2="175" stroke="#e8d5b7" strokeWidth="0.8"/>
    </svg>
  );
}

function ArmsSvg() {
  return (
    <svg viewBox="0 0 300 280" className="w-full" style={{ maxHeight: 200 }}>
      <rect x="120" y="10" width="60" height="30" rx="6" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="125" y="38" width="50" height="80" rx="6" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="30" y="42" width="82" height="32" rx="10" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="18" y="72" width="32" height="100" rx="10" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="10" y="170" width="44" height="36" rx="8" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="188" y="42" width="82" height="32" rx="10" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="250" y="72" width="32" height="100" rx="10" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="246" y="170" width="44" height="36" rx="8" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
    </svg>
  );
}

function TorsoSvg() {
  return (
    <svg viewBox="0 0 300 280" className="w-full" style={{ maxHeight: 200 }}>
      <rect x="118" y="8" width="64" height="28" rx="6" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <path d="M 70 50 Q 60 45 55 90 L 50 200 Q 50 220 150 220 Q 250 220 250 200 L 245 90 Q 240 45 230 50 Q 200 36 182 36 L 118 36 Q 100 36 70 50 Z" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <ellipse cx="127" cy="80" rx="14" ry="10" fill="none" stroke="#e8d5b7" strokeWidth="1"/>
      <ellipse cx="173" cy="80" rx="14" ry="10" fill="none" stroke="#e8d5b7" strokeWidth="1"/>
      <path d="M 150 95 L 150 160" stroke="#e8d5b7" strokeWidth="1" strokeDasharray="3 3"/>
      <ellipse cx="150" cy="165" rx="12" ry="8" fill="none" stroke="#e8d5b7" strokeWidth="1"/>
    </svg>
  );
}

function LegsSvg() {
  return (
    <svg viewBox="0 0 300 280" className="w-full" style={{ maxHeight: 200 }}>
      <rect x="95" y="8" width="50" height="30" rx="8" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="155" y="8" width="50" height="30" rx="8" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="88" y="36" width="56" height="130" rx="12" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="156" y="36" width="56" height="130" rx="12" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="85" y="163" width="30" height="70" rx="8" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="116" y="163" width="30" height="70" rx="8" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="153" y="163" width="30" height="70" rx="8" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="185" y="163" width="30" height="70" rx="8" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="75" y="230" width="76" height="20" rx="6" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
      <rect x="149" y="230" width="76" height="20" rx="6" fill="#fef3e2" stroke="#a8a29e" strokeWidth="1"/>
    </svg>
  );
}

// =====================================================================
// RIGHT COLUMN — Actions
// =====================================================================
function ActionsColumn({ mode, appointment }) {
  const [tab, setTab] = useState('prescribe'); // prescribe | plan | images | finish

  return (
    <div className="space-y-3">
      {/* Insurance / coverage call-out */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-sky-700 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-sky-900">
              {mode === 'dental' ? 'QLM — Dental covered' : 'QLM — Aesthetic excluded'}
            </div>
            <div className="text-[11px] text-sky-800 mt-0.5">
              {mode === 'dental'
                ? 'Pre-auth approved for filling. Co-pay QAR 60.'
                : 'Cosmetic procedure. Patient pays direct.'}
            </div>
            <div className="text-[10px] text-sky-700 mono mt-1">
              Auth #{mode === 'dental' ? 'QLM-PA-118822' : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Action tabs */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 border-b border-stone-200">
          {[
            { k: 'prescribe', icon: Pill, label: 'Rx' },
            { k: 'plan', icon: ClipboardList, label: 'Plan' },
            { k: 'images', icon: ImageIcon, label: 'Images' },
            { k: 'finish', icon: CheckCircle2, label: 'Finish' },
          ].map(({ k, icon: Icon, label }) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-2 py-2 text-[11px] flex flex-col items-center gap-0.5 ${tab === k ? 'bg-stone-50 border-b-2 border-stone-900 -mb-px font-semibold' : 'text-stone-500 hover:bg-stone-50'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-3">
          {tab === 'prescribe' && <PrescribePanel mode={mode} />}
          {tab === 'plan' && <TreatmentPlanPanel mode={mode} />}
          {tab === 'images' && <ImagesPanel mode={mode} />}
          {tab === 'finish' && <FinishPanel mode={mode} />}
        </div>
      </div>
    </div>
  );
}

function PrescribePanel({ mode }) {
  const [rxList, setRxList] = useState([]);
  const addRx = (drug) => {
    // Check for allergy: Penicillin → Amoxicillin
    if (drug.name.startsWith('Amoxicillin') || drug.name.startsWith('Penicillin')) {
      if (!confirm('⚠ Patient is ALLERGIC to Penicillin. Are you sure you want to prescribe Amoxicillin?')) return;
    }
    setRxList([...rxList, { ...drug, id: Date.now() }]);
  };

  return (
    <div>
      <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Quick prescribe</div>
      <div className="space-y-1">
        {DRUG_FAVOURITES.map(d => {
          const dangerous = d.name.startsWith('Amoxicillin');
          return (
            <button
              key={d.name}
              onClick={() => addRx(d)}
              className={`w-full text-left px-2 py-1.5 text-xs border rounded hover:bg-stone-50 ${dangerous ? 'border-red-200 bg-red-50/30' : 'border-stone-200'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{d.name}</span>
                {dangerous && <AlertTriangle className="w-3 h-3 text-red-600" />}
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5">{d.sig}</div>
            </button>
          );
        })}
      </div>

      {rxList.length > 0 && (
        <div className="mt-3 pt-3 border-t border-stone-200">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">On prescription</div>
          {rxList.map(r => (
            <div key={r.id} className="px-2 py-1.5 bg-emerald-50 border border-emerald-200 rounded text-xs mb-1 flex items-start justify-between">
              <div className="min-w-0">
                <div className="font-medium text-emerald-900">{r.name}</div>
                <div className="text-[10px] text-emerald-800">{r.sig}</div>
              </div>
              <button onClick={() => setRxList(rxList.filter(x => x.id !== r.id))} className="text-emerald-700 hover:text-red-600 flex-shrink-0">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TreatmentPlanPanel({ mode }) {
  const dentalPlan = [
    { step: 1, item: 'Composite filling #16', when: 'Today', cost: 600, status: 'in-progress' },
    { step: 2, item: 'Follow-up — sensitivity check', when: '2 weeks', cost: 0, status: 'planned' },
    { step: 3, item: 'Routine cleaning + check', when: '6 months', cost: 400, status: 'planned' },
  ];
  const aestheticPlan = [
    { step: 1, item: 'Botox 20U — glabellar + frontalis', when: 'Today', cost: 1800, status: 'in-progress' },
    { step: 2, item: 'Review + photography', when: '14 days', cost: 0, status: 'planned' },
    { step: 3, item: 'Tear-trough filler consult', when: '2 weeks', cost: 200, status: 'planned' },
    { step: 4, item: 'Filler placement (if cleared)', when: '4 weeks', cost: 2400, status: 'planned' },
  ];
  const plan = mode === 'dental' ? dentalPlan : aestheticPlan;
  const total = plan.reduce((s, x) => s + x.cost, 0);

  return (
    <div>
      <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Treatment plan</div>
      <div className="space-y-1.5">
        {plan.map(p => (
          <div key={p.step} className="px-2 py-1.5 border border-stone-200 rounded text-xs">
            <div className="flex items-start gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${p.status === 'in-progress' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                {p.step}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium leading-tight">{p.item}</div>
                <div className="text-[10px] text-stone-500 mt-0.5 mono">{p.when} · QAR {p.cost.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
        <span className="text-stone-600">Total estimate</span>
        <span className="mono font-semibold">QAR {total.toLocaleString()}</span>
      </div>
      <button className="mt-2 w-full px-2 py-1.5 text-xs border border-dashed border-stone-300 rounded text-stone-600 hover:bg-stone-50 hover:border-stone-400 flex items-center justify-center gap-1">
        <Plus className="w-3 h-3" /> Add step
      </button>
    </div>
  );
}

function ImagesPanel({ mode }) {
  const dentalImages = [
    { kind: 'X-ray', label: 'Bitewing right', date: '2025-08-03' },
    { kind: 'X-ray', label: 'Periapical #16', date: '2025-08-03' },
    { kind: 'Intraoral', label: 'Pre-op #16', date: 'Today' },
  ];
  const aestheticImages = [
    { kind: 'Photo', label: 'Front, neutral', date: '2025-11-22' },
    { kind: 'Photo', label: 'Front, animated', date: '2025-11-22' },
    { kind: 'Photo', label: 'Lateral L', date: '2025-11-22' },
    { kind: 'Photo', label: 'Pre-op today', date: 'Today' },
  ];
  const imgs = mode === 'dental' ? dentalImages : aestheticImages;

  return (
    <div>
      <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-2">
        {mode === 'dental' ? 'X-rays & intraoral' : 'Clinical photos'}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {imgs.map((img, i) => (
          <div key={i} className="aspect-square bg-stone-100 border border-stone-200 rounded flex flex-col items-center justify-center text-stone-400">
            {mode === 'dental' ? <ImageIcon className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            <div className="text-[9px] mono mt-1">{img.kind}</div>
            <div className="text-[8px] text-stone-500 mt-0.5 px-1 text-center leading-tight">{img.label}</div>
            <div className="text-[8px] text-stone-400 mono mt-0.5">{img.date}</div>
          </div>
        ))}
      </div>
      <button className="mt-2 w-full px-2 py-1.5 text-xs border border-dashed border-stone-300 rounded text-stone-600 hover:bg-stone-50 hover:border-stone-400 flex items-center justify-center gap-1">
        <Plus className="w-3 h-3" /> Upload {mode === 'dental' ? 'X-ray' : 'photo'}
      </button>
    </div>
  );
}

function FinishPanel({ mode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Finalize encounter</div>
      <div className="space-y-1.5 text-xs">
        <Check item="SOAP note completed" />
        <Check item={mode === 'dental' ? 'Tooth chart updated' : 'Injection sites logged'} />
        <Check item="Prescription signed" pending />
        <Check item={mode === 'dental' ? 'X-ray annotated' : 'Photos uploaded'} pending />
        <Check item="Treatment plan shared with patient" pending />
      </div>

      <button className="mt-3 w-full px-3 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 text-sm font-medium flex items-center justify-center gap-1.5">
        <CheckCircle2 className="w-4 h-4" />
        Sign & close encounter
      </button>
      <div className="text-[10px] text-stone-500 mt-2 text-center">
        Signing locks the note. Edits require an addendum.
      </div>
    </div>
  );
}

function Check({ item, pending }) {
  return (
    <div className="flex items-center gap-2">
      {pending
        ? <div className="w-3 h-3 rounded-full border border-stone-300" />
        : <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      }
      <span className={pending ? 'text-stone-500' : 'text-stone-900'}>{item}</span>
    </div>
  );
}
