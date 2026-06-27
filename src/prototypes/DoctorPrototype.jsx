import React, { useState, useRef } from 'react';
import {
  ChevronLeft, ChevronDown, ChevronRight, Shield, AlertTriangle,
  CheckCircle2, FileText, Plus, Edit3, Save, X, Bell, Pill,
  Stethoscope, Sparkles, Tag, ExternalLink, AlertCircle, Receipt,
  Calendar, Search, BarChart2, Users
} from 'lucide-react';

const CLINIC_CONFIG = {
  name:'Yasmeen Clinic', nameAr:'عيادة الياسمين', city:'Doha, Qatar',
  logoUrl:null, primaryColor:'#0C6B5A', headerBg:'#0f1f1a',
};
function MedlyLogo({ size=34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <rect width="34" height="34" rx="9" fill={CLINIC_CONFIG.primaryColor}/>
      <path d="M7 24V12L13 20L19 12V18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 18C19 22 21.5 24 24.5 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="27" cy="24" r="2.2" stroke="#fff" strokeWidth="2"/>
      <circle cx="27" cy="24" r="0.7" fill="#fff"/>
    </svg>
  );
}

const PATIENT = {
  id:'p1', qid:'28934567812', nameEn:'Aisha Al-Kuwari', nameAr:'عائشة الكواري',
  dob:'1989-03-14', age:37, sex:'F', phone:'+974 5512 4488',
  insurer:'QLM', policy:'QLM-447821', bloodType:'O+', smoker:false, pregnant:false,
  allergies:['Penicillin (rash)','Latex'],
  conditions:['Type 2 diabetes (controlled)','Hypertension'],
  medications:['Metformin 500mg BD','Amlodipine 5mg OD'],
  careTeam:{
    dental:{ assistantDoctor:{name:'Dr. Yusuf Hassan',role:'Asst. Doctor',specialty:'Cosmetic Dentistry',initials:'YH'}, nurse:{name:'Nurse Sara Al-Amin',role:'Dental Nurse',initials:'SA'} },
    aesthetic:{ assistantDoctor:{name:'Dr. Marcus Chen',role:'Asst. Doctor',specialty:'Aesthetic Medicine',initials:'MC'}, nurse:{name:'Nurse Dina Khalil',role:'Aesthetic Nurse',initials:'DK'} },
  },
};

const ENCOUNTER_HISTORY = [
  { id:'e1', date:'2026-04-18', doctor:'Dr. Priya Menon', specialty:'Endodontics', procedure:'Root canal — #16', notes:'Asymptomatic at 6 weeks. Final restoration recommended.', kind:'dental',
    rxDone:[{item:'Root canal treatment #16'}], rxMeds:['Ibuprofen 400mg TDS × 3d','Amoxicillin 500mg TDS × 5d'], plan:['Final composite restoration in 2 weeks','Follow-up X-ray at 3 months'] },
  { id:'e2', date:'2026-02-14', doctor:'Dr. Layla Al-Mahmoud', specialty:'General Dentistry', procedure:'Cleaning + composite filling #36', notes:'Mild gingivitis lower right. Advised improved flossing.', kind:'dental',
    rxDone:[{item:'Cleaning & polish'},{item:'Composite filling #36'}], rxMeds:['Chlorhexidine 0.2% mouthwash BD × 7d'], plan:['Review gingival health at next cleaning','Routine check in 6 months'] },
  { id:'e3', date:'2025-11-22', doctor:'Dr. Reem Al-Thani', specialty:'Aesthetic Medicine', procedure:'Botox — glabellar + forehead', notes:'20U total. Patient pleased at 14-day follow-up.', kind:'aesthetic',
    rxDone:[{item:'Botox 20U — glabellar + frontalis'}], rxMeds:[], plan:['Touch-up in 3-4 months if needed','Consider tear-trough filler at next visit'] },
  { id:'e4', date:'2025-08-03', doctor:'Dr. Layla Al-Mahmoud', specialty:'General Dentistry', procedure:'Consultation + bitewing X-rays', notes:'Recurrent decay #16 — referred to endodontics.', kind:'dental',
    rxDone:[{item:'Consultation'},{item:'Bitewing X-rays (4 films)'}], rxMeds:[], plan:['Endodontic referral for #16','Patient advised on symptom monitoring'] },
  { id:'e5', date:'2025-05-10', doctor:'Dr. Reem Al-Thani', specialty:'Aesthetic Medicine', procedure:'Initial consultation', notes:'Patient interested in preventive Botox.', kind:'aesthetic',
    rxDone:[{item:'Aesthetic consultation'}], rxMeds:[], plan:['Schedule Botox session within 2 months'] },
];

const TODAYS_APT = {
  dental:    { doctor:'Dr. Layla Al-Mahmoud', specialty:'General Dentistry', procedure:'Filling — tooth #16', time:'10:30', dur:60, chiefComplaint:'Sensitivity to cold on upper-right back tooth, started 4 days ago.' },
  aesthetic: { doctor:'Dr. Reem Al-Thani', specialty:'Aesthetic Medicine', procedure:'Botox + dermal filler review', time:'15:30', dur:60, chiefComplaint:'Wants to refresh Botox from November and discuss tear-trough filler.' },
};

const DRUG_FAVOURITES = [
  { name:'Amoxicillin 500mg',             sig:'1 cap TDS × 5 days',         class:'Antibiotic' },
  { name:'Ibuprofen 400mg',               sig:'1 tab TDS PRN pain × 3 days', class:'NSAID' },
  { name:'Paracetamol 1g',                sig:'1 tab QDS PRN pain',          class:'Analgesic' },
  { name:'Chlorhexidine 0.2% mouthwash',  sig:'10ml rinse BD × 7 days',     class:'Antiseptic' },
  { name:'Metronidazole 400mg',           sig:'1 tab TDS × 5 days',          class:'Antibiotic' },
];

const SOAP_MAP = {
  e1:{ s:'Patient had completed root canal on #16. No spontaneous pain. Mild sensitivity when biting.', o:'Tooth #16 — no periapical pathology on X-ray. Percussion negative. Canal obturation adequate.', a:'Successful endodontic treatment. Tooth ready for final restoration.', p:'Composite restoration recommended within 4 weeks. Follow-up X-ray at 3 months.' },
  e2:{ s:'Routine visit. Patient reports no pain. Noticed bleeding gums when flossing lower right.', o:'Mild generalised gingivitis, pronounced at lower right molar. Existing filling #36 intact.', a:'Gingivitis secondary to plaque accumulation. Existing composite restoration serviceable.', p:'Oral hygiene reinforced. Chlorhexidine rinse prescribed. Review at next cleaning.' },
  e3:{ s:'Patient pleased with November Botox. Requesting top-up. Interested in tear-trough filler.', o:'Glabellar lines reduced ~70% at 14-day follow-up. Frontalis movement preserved. No adverse events.', a:'Good response to Botox 20U. Appropriate candidate for tear-trough filler at next visit.', p:'Schedule filler consult within 2-4 weeks. Photograph taken for baseline comparison.' },
  e4:{ s:'Patient reports intermittent cold sensitivity upper right for 3 weeks. No spontaneous pain.', o:'Bitewing X-ray shows recurrent decay under existing restoration on #16. ~3mm depth estimated.', a:'Recurrent caries #16. Risk of pulpal involvement if untreated. Endodontic referral indicated.', p:'Referred to Dr. Priya Menon (Endodontics). Patient advised to avoid cold foods on affected side.' },
  e5:{ s:'New patient consultation. Interested in Botox for preventive anti-ageing. No prior aesthetic treatments.', o:'Skin assessment: mild dynamic lines glabella and frontalis. Good skin turgor. No contraindications.', a:'Appropriate candidate for preventive Botox. Realistic expectations established.', p:'Botox session scheduled for 3 weeks. Pre-treatment photography taken.' },
};


// ─── Landing page seed data ───────────────────────────────────────────────────
const TODAY = '2026-06-26';

const CURRENT_DOCTOR = {
  id:'d1', name:'Dr. Layla Al-Mahmoud', specialty:'General Dentistry & Cosmetic Dentistry',
  initials:'LA', qchp:'QCHP-D-002847',
};

const ALL_PATIENTS = [
  { id:'p1', qid:'28934567812', nameEn:'Aisha Al-Kuwari',     age:37, sex:'F', phone:'+974 5512 4488', lastVisit:'2026-06-26', insurer:'QLM',     fileNo:'YC-2024-0142', bloodType:'O+',  allergies:['Penicillin','Latex'], conditions:['Type 2 diabetes','Hypertension'] },
  { id:'p2', qid:'29012345671', nameEn:'Mohammed Al-Rashidi', age:44, sex:'M', phone:'+974 5523 1122', lastVisit:'2026-06-25', insurer:'AXA',     fileNo:'YC-2024-0089', bloodType:'A+',  allergies:[], conditions:['Hypertension'] },
  { id:'p3', qid:'27891234562', nameEn:'Fatima Hassan',       age:29, sex:'F', phone:'+974 5534 8877', lastVisit:'2026-06-25', insurer:'Daman',   fileNo:'YC-2025-0204', bloodType:'B+',  allergies:['Aspirin'], conditions:[] },
  { id:'p4', qid:'30123456783', nameEn:'Sara Al-Jaber',       age:52, sex:'F', phone:'+974 5545 3344', lastVisit:'2026-06-25', insurer:'QLM',     fileNo:'YC-2023-0318', bloodType:'AB-', allergies:[], conditions:['Osteoporosis'] },
  { id:'p5', qid:'28765432104', nameEn:'Khalid Al-Mansouri',  age:38, sex:'M', phone:'+974 5556 6655', lastVisit:'2026-06-25', insurer:'MedNet',  fileNo:'YC-2024-0271', bloodType:'O-',  allergies:[], conditions:['Type 1 diabetes'] },
  { id:'p6', qid:'29876543215', nameEn:'Nora Al-Thani',       age:31, sex:'F', phone:'+974 5567 9900', lastVisit:'2026-06-24', insurer:'QLM',     fileNo:'YC-2025-0387', bloodType:'A-',  allergies:[], conditions:[] },
  { id:'p7', qid:'27654321096', nameEn:'Ali Hassan Al-Marri', age:55, sex:'M', phone:'+974 5578 1234', lastVisit:'2026-06-24', insurer:'Allianz', fileNo:'YC-2022-0056', bloodType:'B-',  allergies:['Codeine'], conditions:['Hypertension','Ischemic heart disease'] },
];

const MY_SCHEDULE = [
  { id:'s1',  date:'2026-06-26', time:'09:00', dur:30, patientId:'p2', patientName:'Mohammed Al-Rashidi', procedure:'Routine check + X-rays',         status:'done',        kind:'dental', fileNo:'YC-2024-0089' },
  { id:'s2',  date:'2026-06-26', time:'09:45', dur:15, patientId:'p3', patientName:'Fatima Hassan',       procedure:'Post-op review — extraction #28', status:'done',        kind:'dental', fileNo:'YC-2025-0204' },
  { id:'s3',  date:'2026-06-26', time:'10:30', dur:60, patientId:'p1', patientName:'Aisha Al-Kuwari',     procedure:'Filling — tooth #16',             status:'in-progress', kind:'dental', fileNo:'YC-2024-0142' },
  { id:'s4',  date:'2026-06-26', time:'12:00', dur:45, patientId:'p4', patientName:'Sara Al-Jaber',       procedure:'Crown prep — tooth #26',          status:'booked',      kind:'dental', fileNo:'YC-2023-0318' },
  { id:'s5',  date:'2026-06-26', time:'13:00', dur:30, patientId:'p5', patientName:'Khalid Al-Mansouri',  procedure:'Emergency — toothache #36',       status:'booked',      kind:'dental', fileNo:'YC-2024-0271' },
  { id:'s6',  date:'2026-06-26', time:'14:00', dur:60, patientId:'p6', patientName:'Nora Al-Thani',       procedure:'Scaling & root planing',          status:'booked',      kind:'dental', fileNo:'YC-2025-0387' },
  { id:'s7',  date:'2026-06-26', time:'15:30', dur:30, patientId:'p7', patientName:'Ali Hassan Al-Marri', procedure:'Consultation + treatment plan',   status:'booked',      kind:'dental', fileNo:'YC-2022-0056' },
  { id:'s8',  date:'2026-06-25', time:'09:00', dur:60, patientId:'p1', patientName:'Aisha Al-Kuwari',     procedure:'Root canal — #16 prep',           status:'done',        kind:'dental', fileNo:'YC-2024-0142' },
  { id:'s9',  date:'2026-06-25', time:'10:30', dur:30, patientId:'p3', patientName:'Fatima Hassan',       procedure:'Extraction #28',                  status:'done',        kind:'dental', fileNo:'YC-2025-0204' },
  { id:'s10', date:'2026-06-25', time:'11:30', dur:45, patientId:'p5', patientName:'Khalid Al-Mansouri',  procedure:'Filling #14 + #15',               status:'done',        kind:'dental', fileNo:'YC-2024-0271' },
  { id:'s11', date:'2026-06-25', time:'13:30', dur:30, patientId:'p7', patientName:'Ali Hassan Al-Marri', procedure:'Routine check',                   status:'no-show',     kind:'dental', fileNo:'YC-2022-0056' },
  { id:'s12', date:'2026-06-25', time:'14:30', dur:60, patientId:'p4', patientName:'Sara Al-Jaber',       procedure:'Crown impression #26',            status:'done',        kind:'dental', fileNo:'YC-2023-0318' },
  { id:'s13', date:'2026-06-24', time:'09:30', dur:60, patientId:'p2', patientName:'Mohammed Al-Rashidi', procedure:'Composite fillings #11, #12',      status:'done',        kind:'dental', fileNo:'YC-2024-0089' },
  { id:'s14', date:'2026-06-24', time:'11:00', dur:30, patientId:'p6', patientName:'Nora Al-Thani',       procedure:'Cleaning + fluoride',             status:'done',        kind:'dental', fileNo:'YC-2025-0387' },
  { id:'s15', date:'2026-06-24', time:'13:00', dur:45, patientId:'p1', patientName:'Aisha Al-Kuwari',     procedure:'Bitewing X-rays',                 status:'done',        kind:'dental', fileNo:'YC-2024-0142' },
  { id:'s16', date:'2026-06-24', time:'15:00', dur:30, patientId:'p7', patientName:'Ali Hassan Al-Marri', procedure:'Emergency — broken crown #36',    status:'done',        kind:'dental', fileNo:'YC-2022-0056' },
];

const PROCEDURE_REPORT = [
  { id:'pr1',  date:'2026-06-25', patientName:'Aisha Al-Kuwari',     procedure:'Root canal — #16 prep',      code:'D3310', amount:900,  kind:'dental', insurer:'QLM'     },
  { id:'pr2',  date:'2026-06-25', patientName:'Fatima Hassan',       procedure:'Extraction #28',              code:'D7210', amount:350,  kind:'dental', insurer:'Daman'   },
  { id:'pr3',  date:'2026-06-25', patientName:'Khalid Al-Mansouri',  procedure:'Filling #14 + #15',           code:'D2390', amount:820,  kind:'dental', insurer:'MedNet'  },
  { id:'pr4',  date:'2026-06-25', patientName:'Sara Al-Jaber',       procedure:'Crown impression #26',        code:'D2752', amount:1400, kind:'dental', insurer:'QLM'     },
  { id:'pr5',  date:'2026-06-24', patientName:'Mohammed Al-Rashidi', procedure:'Composite fillings #11, #12', code:'D2391', amount:1100, kind:'dental', insurer:'AXA'     },
  { id:'pr6',  date:'2026-06-24', patientName:'Nora Al-Thani',       procedure:'Cleaning + fluoride',         code:'D1110', amount:420,  kind:'dental', insurer:'QLM'     },
  { id:'pr7',  date:'2026-06-24', patientName:'Aisha Al-Kuwari',     procedure:'Bitewing X-rays',             code:'D0274', amount:220,  kind:'dental', insurer:'QLM'     },
  { id:'pr8',  date:'2026-06-24', patientName:'Ali Hassan Al-Marri', procedure:'Emergency consultation',      code:'D9110', amount:200,  kind:'dental', insurer:'Allianz' },
  { id:'pr9',  date:'2026-06-23', patientName:'Fatima Hassan',       procedure:'Consultation + OPG X-ray',   code:'D0330', amount:380,  kind:'dental', insurer:'Daman'   },
  { id:'pr10', date:'2026-06-23', patientName:'Khalid Al-Mansouri',  procedure:'Routine check',               code:'D0120', amount:180,  kind:'dental', insurer:'MedNet'  },
  { id:'pr11', date:'2026-06-20', patientName:'Mohammed Al-Rashidi', procedure:'Scaling & polish',            code:'D1110', amount:380,  kind:'dental', insurer:'AXA'     },
  { id:'pr12', date:'2026-06-20', patientName:'Sara Al-Jaber',       procedure:'Crown seat #25',              code:'D2752', amount:1400, kind:'dental', insurer:'QLM'     },
  { id:'pr13', date:'2026-06-18', patientName:'Nora Al-Thani',       procedure:'Composite filling #36',       code:'D2391', amount:600,  kind:'dental', insurer:'QLM'     },
  { id:'pr14', date:'2026-06-18', patientName:'Ali Hassan Al-Marri', procedure:'Routine check + X-rays',      code:'D0120', amount:300,  kind:'dental', insurer:'Allianz' },
  { id:'pr15', date:'2026-06-15', patientName:'Aisha Al-Kuwari',     procedure:'Cleaning + polish',           code:'D1110', amount:380,  kind:'dental', insurer:'QLM'     },
  { id:'pr16', date:'2026-06-12', patientName:'Fatima Hassan',       procedure:'Composite filling #21',       code:'D2391', amount:550,  kind:'dental', insurer:'Daman'   },
  { id:'pr17', date:'2026-06-10', patientName:'Mohammed Al-Rashidi', procedure:'Emergency — abscess drainage', code:'D9110', amount:250, kind:'dental', insurer:'AXA'     },
  { id:'pr18', date:'2026-06-08', patientName:'Khalid Al-Mansouri',  procedure:'Root canal — #36',            code:'D3330', amount:1100, kind:'dental', insurer:'MedNet'  },
  { id:'pr19', date:'2026-06-05', patientName:'Sara Al-Jaber',       procedure:'Crown prep #25',              code:'D2750', amount:1200, kind:'dental', insurer:'QLM'     },
  { id:'pr20', date:'2026-06-02', patientName:'Ali Hassan Al-Marri', procedure:'Denture reline',              code:'D5730', amount:800,  kind:'dental', insurer:'Allianz' },
];

const fmtDate      = d => new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
const fmtDateShort = d => new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short'});
const shiftDay     = (d,n) => { const dt=new Date(d+'T12:00:00'); dt.setDate(dt.getDate()+n); return dt.toISOString().slice(0,10); };

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = { fontFamily:"'Manrope','Noto Sans Arabic',system-ui,sans-serif" };
const CANVAS = '#EAEDEB';
const card  = { background:'#fff', borderRadius:14, border:'1px solid #DCE4E0', boxShadow:'0 1px 3px rgba(15,31,26,.08)' };
const cardHd = { padding:'13px 18px 11px', borderBottom:'1px solid #EEF2F0', display:'flex', alignItems:'flex-start', justifyContent:'space-between' };
const cardBd = { padding:'14px 18px' };
const SEC  = { fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'#2E4840', marginBottom:8 };
const PrimaryBtn = ({onClick,disabled,children,style={}}) => <button onClick={onClick} disabled={disabled} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:9,border:'none',background:CLINIC_CONFIG.primaryColor,color:'#fff',fontSize:12.5,fontWeight:700,cursor:'pointer',opacity:disabled?.4:1,transition:'filter .13s',...style}}>{children}</button>;
const GhostBtn   = ({onClick,children,style={}}) => <button onClick={onClick} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:9,border:'1px solid #DCE4E0',background:'#F5F8F7',fontSize:12.5,fontWeight:600,color:'#2A4840',cursor:'pointer',...style}}>{children}</button>;

export default function DoctorPortalPrototype() {
  const [view, setView]                       = useState('home');
  const [mode, setMode]                       = useState('dental');
  const [viewingEnc, setViewingEnc]           = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const isDental = mode === 'dental';

  const openEncounter = apt => { if (apt?.kind) setMode(apt.kind); setView('encounter'); setViewingEnc(null); };
  const openPatient   = pt  => { setSelectedPatient(pt); setView('patientFile'); };
  const goHome        = ()  => { setView('home'); setViewingEnc(null); };

  return (
    <div style={{...T, minHeight:'100vh', background:CANVAS, color:'#111814'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;}
        .mono{font-family:'IBM Plex Mono',monospace;font-feature-settings:'tnum';}
        *:focus-visible{outline:2px solid #0C6B5A;outline-offset:2px;border-radius:5px;}
        button{cursor:pointer;font-family:inherit;transition:filter .13s;}
        button:not(:disabled):hover{filter:brightness(.93);}
        input,select,textarea{font-family:inherit;background:#F2F5F3;border:1.5px solid #C8D4CF;border-radius:8px;color:#111814;padding:8px 12px;font-size:13px;transition:all .13s;width:100%;}
        input:hover,select:hover,textarea:hover{border-color:#7A9A90;background:#fff;}
        input:focus,select:focus,textarea:focus{outline:none;background:#fff;border-color:#0C6B5A;box-shadow:0 0 0 3px rgba(12,107,90,.12);}
        input::placeholder,textarea::placeholder{color:#8AA8A0;}
        .apt-row:hover{background:#F5F8F7;}
        .pt-row:hover{background:#F5F8F7;}
        .tooth-svg:hover{filter:brightness(.95);cursor:pointer;}
        .injection-site:hover{r:9;cursor:pointer;}
        .enc-row:hover{background:#F5F8F7;}
        @media(prefers-reduced-motion:reduce){*{transition:none!important;}}
      `}</style>

      {/* Header */}
      <header style={{background:CLINIC_CONFIG.headerBg,borderBottom:'1px solid rgba(255,255,255,.07)'}}>
        <div style={{padding:'0 24px',height:54,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {view !== 'home' ? (
              <button onClick={goHome} style={{width:44,height:44,borderRadius:8,background:'rgba(255,255,255,.08)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',color:'#7AADA0'}}><ChevronLeft size={16}/></button>
            ) : (
              <div style={{width:44,height:44}}/>
            )}
            {CLINIC_CONFIG.logoUrl?<img src={CLINIC_CONFIG.logoUrl} alt={CLINIC_CONFIG.name} style={{height:34}}/>:<MedlyLogo/>}
            <div>
              <div style={{fontSize:16,fontWeight:800,letterSpacing:'-.5px',color:'#fff',lineHeight:1}}>medly <span style={{color:'#4EB896',fontWeight:500}}>&#xB7; clinical</span></div>
              <div style={{fontSize:12,color:'#8ECFBB',marginTop:3,fontWeight:600}}>{CLINIC_CONFIG.name} &#xB7; {CLINIC_CONFIG.city}</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {view === 'encounter' && (
              <div style={{display:'flex',borderRadius:9,overflow:'hidden',border:'1px solid rgba(255,255,255,.12)'}}>
                <button onClick={()=>setMode('dental')} style={{padding:'6px 14px',fontSize:12.5,fontWeight:600,border:'none',display:'flex',alignItems:'center',gap:6,background:isDental?CLINIC_CONFIG.primaryColor:'transparent',color:isDental?'#fff':'#6A9080'}}>
                  <Stethoscope size={13}/> Dental
                </button>
                <button onClick={()=>setMode('aesthetic')} style={{padding:'6px 14px',fontSize:12.5,fontWeight:600,border:'none',display:'flex',alignItems:'center',gap:6,background:!isDental?CLINIC_CONFIG.primaryColor:'transparent',color:!isDental?'#fff':'#6A9080'}}>
                  <Sparkles size={13}/> Aesthetic
                </button>
              </div>
            )}
            <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',padding:'5px 12px 5px 6px',borderRadius:20}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:CLINIC_CONFIG.primaryColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff'}}>{CURRENT_DOCTOR.initials}</div>
              <span style={{fontSize:12,color:'#C0D8D0',fontWeight:500}}>{CURRENT_DOCTOR.name}</span>
            </div>
          </div>
        </div>
      </header>

      {view === 'home' && <DoctorLanding onOpenEncounter={openEncounter} onOpenPatient={openPatient}/>}
      {view === 'encounter' && (
        <>
          <PatientBanner patient={PATIENT} appointment={TODAYS_APT[mode]} mode={mode}/>
          {viewingEnc?(
            <PastEncounterView enc={viewingEnc} onBack={()=>setViewingEnc(null)}/>
          ):(
            <EncounterPanel mode={mode} isDental={isDental} onView={setViewingEnc}/>
          )}
        </>
      )}
      {view === 'patientFile' && selectedPatient && (
        <PatientFileView patient={selectedPatient} onBack={goHome} onOpenEncounter={openEncounter}/>
      )}
    </div>
  );
}

// ─── Doctor Landing ────────────────────────────────────────────────────────────
function DoctorLanding({ onOpenEncounter, onOpenPatient }) {
  const [tab, setTab] = useState('schedule');
  const TABS = [
    {id:'schedule', label:'My Schedule', Icon:Calendar},
    {id:'search',   label:'Patient Search', Icon:Search},
    {id:'report',   label:'My Report', Icon:BarChart2},
  ];
  const todayCount = MY_SCHEDULE.filter(a=>a.date===TODAY).length;
  const doneCount  = MY_SCHEDULE.filter(a=>a.date===TODAY&&a.status==='done').length;
  const hour = new Date().getHours();
  const greeting = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
  return (
    <div style={{maxWidth:900,margin:'0 auto',padding:'20px 24px'}}>
      <div style={{marginBottom:20,display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
        <div>
          <div style={{fontSize:21,fontWeight:800,color:'#111814',letterSpacing:'-.5px'}}>{greeting}, {CURRENT_DOCTOR.name.replace('Dr. ','')}</div>
          <div style={{fontSize:13,fontWeight:600,color:'#5A7870',marginTop:3}}>{fmtDate(TODAY)} &#xB7; {CURRENT_DOCTOR.specialty}</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          {[['Today',todayCount,'#111814'],['Done',doneCount,'#0C6B5A'],['Remaining',todayCount-doneCount,'#92600A']].map(([lbl,val,color])=>(
            <div key={lbl} style={{padding:'8px 16px',background:'#fff',borderRadius:10,border:'1px solid #DCE4E0',textAlign:'center',minWidth:72}}>
              <div style={{fontSize:20,fontWeight:800,color,letterSpacing:'-0.5px'}}>{val}</div>
              <div style={{fontSize:11,fontWeight:700,color:'#5A7870',textTransform:'uppercase',letterSpacing:'.06em',marginTop:1}}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'flex',borderBottom:'2px solid #DCE4E0',marginBottom:20}}>
        {TABS.map(({id,label,Icon})=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'10px 24px',fontSize:13.5,fontWeight:tab===id?700:500,border:'none',borderBottom:`2.5px solid ${tab===id?CLINIC_CONFIG.primaryColor:'transparent'}`,marginBottom:-2,background:'transparent',color:tab===id?CLINIC_CONFIG.primaryColor:'#5A7870',cursor:'pointer',display:'flex',alignItems:'center',gap:7,transition:'color .13s'}}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>

      {tab==='schedule' && <ScheduleTab onOpenEncounter={onOpenEncounter}/>}
      {tab==='search'   && <PatientSearchTab onOpenPatient={onOpenPatient} onOpenEncounter={onOpenEncounter}/>}
      {tab==='report'   && <RangeReportTab/>}
    </div>
  );
}

// ─── Schedule Tab ─────────────────────────────────────────────────────────────
function ScheduleTab({ onOpenEncounter }) {
  const [date, setDate] = useState(TODAY);
  const apts = MY_SCHEDULE.filter(a=>a.date===date).sort((a,b)=>a.time.localeCompare(b.time));
  const ST = {
    'done':        {bg:'#D1FAE5',color:'#065F46',label:'Done',        bar:'#34D399'},
    'in-progress': {bg:'#F0FAF6',color:'#0C6B5A',label:'In progress', bar:CLINIC_CONFIG.primaryColor},
    'booked':      {bg:'#F5F8F7',color:'#5A7870',label:'Booked',      bar:'#C8D4CF'},
    'no-show':     {bg:'#FEF2F2',color:'#991B1B',label:'No-show',     bar:'#FCA5A5'},
    'cancelled':   {bg:'#FFF7ED',color:'#92400E',label:'Cancelled',   bar:'#FCD34D'},
  };
  const stats = {total:apts.length,done:apts.filter(a=>a.status==='done').length,rem:apts.filter(a=>['booked','in-progress'].includes(a.status)).length};
  const isToday = date===TODAY;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
        <button onClick={()=>setDate(shiftDay(date,-1))} style={{width:34,height:34,borderRadius:8,border:'1px solid #DCE4E0',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><ChevronLeft size={15} color="#5A7870"/></button>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:170,fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}/>
        <button onClick={()=>setDate(shiftDay(date,1))} style={{width:34,height:34,borderRadius:8,border:'1px solid #DCE4E0',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><ChevronRight size={15} color="#5A7870"/></button>
        {!isToday&&<button onClick={()=>setDate(TODAY)} style={{padding:'5px 12px',borderRadius:7,border:'1px solid #DCE4E0',background:'#F5F8F7',fontSize:12.5,fontWeight:600,color:'#5A7870',cursor:'pointer'}}>Today</button>}
        <span style={{fontSize:13,fontWeight:600,color:'#3D5850',marginLeft:4}}>{fmtDate(date)}{isToday?' &#x2014; Today':''}</span>
      </div>

      {apts.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {[['Total',stats.total,'#111814'],['Done',stats.done,'#065F46'],['Remaining',stats.rem,'#92600A']].map(([l,v,c])=>(
            <div key={l} style={{padding:'10px 14px',background:'#fff',borderRadius:10,border:'1px solid #DCE4E0',textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800,color:c,letterSpacing:'-0.5px'}}>{v}</div>
              <div style={{fontSize:11,fontWeight:700,color:'#5A7870',textTransform:'uppercase',letterSpacing:'.06em',marginTop:1}}>{l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={card}>
        {apts.length===0?(
          <div style={{padding:'48px 20px',textAlign:'center',color:'#5A7870',fontSize:13,fontWeight:600}}>No appointments scheduled for {fmtDate(date)}</div>
        ):(
          apts.map((apt,i)=>{
            const st=ST[apt.status]||ST['booked'];
            return (
              <div key={apt.id} className="apt-row" onClick={()=>onOpenEncounter(apt)}
                style={{display:'flex',alignItems:'center',gap:14,padding:'13px 18px',borderBottom:i<apts.length-1?'1px solid #EEF2F0':'none',cursor:'pointer'}}>
                <div style={{width:52,flexShrink:0,textAlign:'right'}}>
                  <div style={{fontSize:13,fontWeight:800,color:'#111814',fontFamily:"'IBM Plex Mono',monospace"}}>{apt.time}</div>
                  <div style={{fontSize:11,fontWeight:600,color:'#8AA8A0',marginTop:1}}>{apt.dur}min</div>
                </div>
                <div style={{width:3,height:40,borderRadius:2,background:st.bar,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13.5,fontWeight:700,color:'#111814',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{apt.patientName}</div>
                  <div style={{fontSize:12,fontWeight:600,color:'#5A7870',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{apt.procedure}</div>
                </div>
                <div style={{fontSize:11.5,fontWeight:600,color:'#8AA8A0',fontFamily:"'IBM Plex Mono',monospace",flexShrink:0}}>{apt.fileNo}</div>
                <div style={{padding:'3px 10px',borderRadius:20,background:st.bg,color:st.color,fontSize:11.5,fontWeight:700,flexShrink:0,whiteSpace:'nowrap'}}>{st.label}</div>
                <ChevronRight size={14} color="#C8D4CF" style={{flexShrink:0}}/>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Patient Search Tab ────────────────────────────────────────────────────────
function PatientSearchTab({ onOpenPatient, onOpenEncounter }) {
  const [query, setQuery] = useState('');
  const q = query.trim();
  const shown = q.length<2 ? ALL_PATIENTS : ALL_PATIENTS.filter(p=>
    p.nameEn.toLowerCase().includes(q.toLowerCase()) || p.qid.includes(q)
  );
  const initials = n => n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{position:'relative'}}>
        <Search size={15} color="#8AA8A0" style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by patient name or QID..." style={{paddingLeft:40,fontSize:13.5}} autoFocus/>
      </div>
      <div style={card}>
        {shown.length===0?(
          <div style={{padding:'48px 20px',textAlign:'center',color:'#5A7870',fontSize:13,fontWeight:600}}>No patients match "{q}"</div>
        ):(
          shown.map((pt,i)=>{
            const todayApt = MY_SCHEDULE.find(a=>a.date===TODAY&&a.patientId===pt.id);
            return (
              <div key={pt.id} className="pt-row" onClick={()=>onOpenPatient(pt)}
                style={{display:'flex',alignItems:'center',gap:12,padding:'13px 18px',borderBottom:i<shown.length-1?'1px solid #EEF2F0':'none',cursor:'pointer'}}>
                <div style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#E3EEEA,#CFE3DC)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#0C6B5A',flexShrink:0}}>{initials(pt.nameEn)}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <span style={{fontSize:13.5,fontWeight:700,color:'#111814'}}>{pt.nameEn}</span>
                    {todayApt&&<span style={{fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:10,background:'#F0FAF6',color:'#0C6B5A',border:'1px solid #B8DDD6',whiteSpace:'nowrap'}}>Today {todayApt.time}</span>}
                  </div>
                  <div style={{fontSize:12,fontWeight:600,color:'#5A7870',marginTop:2}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace"}}>{pt.qid}</span>
                    <span style={{margin:'0 6px'}}>&#xB7;</span>{pt.age}y {pt.sex}
                    <span style={{margin:'0 6px'}}>&#xB7;</span>Last visit {fmtDateShort(pt.lastVisit)}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:11.5,fontWeight:600,color:'#8AA8A0',fontFamily:"'IBM Plex Mono',monospace"}}>{pt.fileNo}</div>
                  <div style={{fontSize:11.5,fontWeight:600,color:'#5A7870',marginTop:2}}>{pt.insurer}</div>
                </div>
                <ChevronRight size={14} color="#C8D4CF" style={{flexShrink:0}}/>
              </div>
            );
          })
        )}
      </div>
      {q.length<2&&<div style={{fontSize:12,fontWeight:600,color:'#8AA8A0',textAlign:'center'}}>Showing all {ALL_PATIENTS.length} patients &#x2014; type to filter</div>}
    </div>
  );
}

// ─── Range Report Tab ──────────────────────────────────────────────────────────
function RangeReportTab() {
  const [period, setPeriod]     = useState('7d');
  const [fromDate, setFromDate] = useState(shiftDay(TODAY,-6));
  const [toDate, setToDate]     = useState(TODAY);
  const [kindFilter, setKind]   = useState('all');
  const [txFilter, setTx]       = useState('all');

  const from = period==='today'?TODAY : period==='7d'?shiftDay(TODAY,-6) : period==='month'?(TODAY.slice(0,7)+'-01') : fromDate;
  const to   = period==='custom'?toDate:TODAY;

  const filtered = PROCEDURE_REPORT.filter(p=>
    p.date>=from && p.date<=to &&
    (kindFilter==='all'||p.kind===kindFilter) &&
    (txFilter==='all'||p.procedure===txFilter)
  );

  const totalRev = filtered.reduce((s,p)=>s+p.amount,0);
  const avgRev   = filtered.length?Math.round(totalRev/filtered.length):0;
  const uniqueTx = [...new Set(PROCEDURE_REPORT.map(p=>p.procedure))].sort();

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
        <div style={{display:'flex',borderRadius:8,overflow:'hidden',border:'1px solid #DCE4E0'}}>
          {[['today','Today'],['7d','Last 7d'],['month','This month'],['custom','Custom']].map(([k,lbl])=>(
            <button key={k} onClick={()=>setPeriod(k)} style={{padding:'6px 13px',fontSize:12.5,fontWeight:period===k?700:500,border:'none',background:period===k?CLINIC_CONFIG.primaryColor:'#fff',color:period===k?'#fff':'#4A6860',cursor:'pointer',whiteSpace:'nowrap'}}>{lbl}</button>
          ))}
        </div>
        <div style={{display:'flex',borderRadius:8,overflow:'hidden',border:'1px solid #DCE4E0'}}>
          {[['all','All'],['dental','Dental'],['aesthetic','Aesthetic']].map(([k,lbl])=>(
            <button key={k} onClick={()=>setKind(k)} style={{padding:'6px 12px',fontSize:12.5,fontWeight:kindFilter===k?700:500,border:'none',background:kindFilter===k?'#EFF6FF':'#fff',color:kindFilter===k?'#1D4ED8':'#4A6860',cursor:'pointer'}}>{lbl}</button>
          ))}
        </div>
        <select value={txFilter} onChange={e=>setTx(e.target.value)} style={{flex:1,maxWidth:260,fontSize:12.5,padding:'6px 12px',width:'auto'}}>
          <option value="all">All treatments</option>
          {uniqueTx.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {period==='custom'&&(
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'#F5F8F7',borderRadius:10,border:'1px solid #DCE4E0',flexWrap:'wrap'}}>
          <span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>From</span>
          <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} style={{width:165,fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}/>
          <span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>To</span>
          <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} style={{width:165,fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}/>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
        {[['Procedures',filtered.length,'#111814'],['Total revenue','QAR '+totalRev.toLocaleString(),'#0C6B5A'],['Avg per procedure','QAR '+avgRev.toLocaleString(),'#1D4ED8']].map(([l,v,c])=>(
          <div key={l} style={{padding:'12px 16px',background:'#fff',borderRadius:12,border:'1px solid #DCE4E0'}}>
            <div style={{fontSize:20,fontWeight:800,color:c,letterSpacing:'-0.5px'}}>{v}</div>
            <div style={{fontSize:11.5,fontWeight:700,color:'#5A7870',textTransform:'uppercase',letterSpacing:'.06em',marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{...card,overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'90px 1fr 1fr 68px 100px 80px',padding:'8px 18px',background:'#F8FAF9',borderBottom:'1px solid #EEF2F0'}}>
          {['Date','Patient','Procedure','Code','Amount','Insurer'].map(h=>(
            <div key={h} style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#2E4840'}}>{h}</div>
          ))}
        </div>
        {filtered.length===0?(
          <div style={{padding:'48px 20px',textAlign:'center',color:'#5A7870',fontSize:13,fontWeight:600}}>No procedures in this period</div>
        ):(
          filtered.map((p,i)=>(
            <div key={p.id} style={{display:'grid',gridTemplateColumns:'90px 1fr 1fr 68px 100px 80px',padding:'10px 18px',borderBottom:i<filtered.length-1?'1px solid #EEF2F0':'none',alignItems:'center'}}>
              <div style={{fontSize:12,fontWeight:600,color:'#5A7870',fontFamily:"'IBM Plex Mono',monospace"}}>{fmtDateShort(p.date)}</div>
              <div style={{fontSize:13,fontWeight:600,color:'#111814',paddingRight:10,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.patientName}</div>
              <div style={{fontSize:12.5,fontWeight:500,color:'#3D5850',paddingRight:10,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.procedure}</div>
              <div style={{fontSize:12,fontWeight:600,color:'#4E6860',fontFamily:"'IBM Plex Mono',monospace"}}>{p.code}</div>
              <div style={{fontSize:13,fontWeight:800,color:'#111814',letterSpacing:'-0.3px'}}>QAR {p.amount.toLocaleString()}</div>
              <div style={{fontSize:12,fontWeight:600,color:'#5A7870'}}>{p.insurer}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Patient File View ─────────────────────────────────────────────────────────
function PatientFileView({ patient, onBack, onOpenEncounter }) {
  const todayApt   = MY_SCHEDULE.find(a=>a.date===TODAY&&a.patientId===patient.id);
  const pastVisits = MY_SCHEDULE.filter(a=>a.patientId===patient.id&&a.date<TODAY&&a.status==='done').sort((a,b)=>b.date.localeCompare(a.date));
  const totalVisits= MY_SCHEDULE.filter(a=>a.patientId===patient.id).length;
  const initials   = patient.nameEn.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return (
    <div style={{maxWidth:860,margin:'0 auto',padding:'20px 24px'}}>
      <div style={{...card,padding:'18px 20px',marginBottom:16,display:'flex',alignItems:'flex-start',gap:16,flexWrap:'wrap'}}>
        <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#E3EEEA,#CFE3DC)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:'#0C6B5A',flexShrink:0}}>{initials}</div>
        <div style={{flex:1,minWidth:200}}>
          <div style={{fontSize:17,fontWeight:800,color:'#111814',letterSpacing:'-.3px'}}>{patient.nameEn}</div>
          <div style={{fontSize:12.5,fontWeight:600,color:'#5A7870',marginTop:4,display:'flex',gap:12,flexWrap:'wrap'}}>
            <span style={{fontFamily:"'IBM Plex Mono',monospace"}}>{patient.qid}</span>
            <span>&#xB7;</span><span>{patient.age}y {patient.sex}</span>
            <span>&#xB7;</span><span>{patient.bloodType}</span>
            <span>&#xB7;</span><span style={{color:'#0A6040'}}>{patient.insurer}</span>
            <span>&#xB7;</span><span style={{fontFamily:"'IBM Plex Mono',monospace"}}>{patient.fileNo}</span>
          </div>
          {patient.allergies.length>0&&(
            <div style={{display:'flex',alignItems:'center',gap:6,marginTop:7}}>
              <AlertTriangle size={12} color="#DC4F38"/>
              <span style={{fontSize:12,fontWeight:600,color:'#B02A1E'}}>Allergies: {patient.allergies.join(', ')}</span>
            </div>
          )}
          {patient.conditions.length>0&&(
            <div style={{fontSize:12,fontWeight:600,color:'#5A7870',marginTop:5}}>Conditions: {patient.conditions.join(' &#xB7; ')}</div>
          )}
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <div style={{fontSize:24,fontWeight:800,color:'#111814',letterSpacing:'-0.5px'}}>{totalVisits}</div>
          <div style={{fontSize:11,fontWeight:700,color:'#5A7870',textTransform:'uppercase',letterSpacing:'.06em'}}>Total visits</div>
        </div>
      </div>

      {todayApt&&(
        <div style={{padding:'13px 18px',background:'#F0FAF6',border:'1px solid #B8DDD6',borderRadius:12,marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
          <div>
            <div style={{fontSize:13.5,fontWeight:700,color:'#0A6040'}}>Today &#xB7; {todayApt.time} &#x2014; {todayApt.procedure}</div>
            <div style={{fontSize:12,fontWeight:600,color:'#2A6040',marginTop:2,textTransform:'capitalize'}}>{todayApt.status}</div>
          </div>
          <PrimaryBtn onClick={()=>onOpenEncounter(todayApt)}><FileText size={13}/>Open encounter</PrimaryBtn>
        </div>
      )}

      <div style={card}>
        <div style={cardHd}><div style={{fontSize:14,fontWeight:700}}>Visit history with you</div></div>
        {pastVisits.length===0?(
          <div style={{padding:'36px 20px',textAlign:'center',color:'#5A7870',fontSize:13,fontWeight:600}}>No past visits recorded</div>
        ):(
          pastVisits.map((apt,i)=>(
            <div key={apt.id} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 18px',borderBottom:i<pastVisits.length-1?'1px solid #EEF2F0':'none'}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:'#34D399',flexShrink:0}}/>
              <div style={{width:88,fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:600,color:'#5A7870',flexShrink:0}}>{fmtDateShort(apt.date)}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:'#111814'}}>{apt.procedure}</div>
              </div>
              <div style={{fontSize:11.5,fontWeight:600,color:'#8AA8A0',fontFamily:"'IBM Plex Mono',monospace"}}>{apt.dur}min</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Encounter Panel — 3-tab layout replacing the old 3-column grid ─────────────
function EncounterPanel({ mode, isDental, onView }) {
  const [tab, setTab] = useState('soap');
  const apt = TODAYS_APT[mode];

  const TABS = [
    { id: 'history',   label: 'History' },
    { id: 'soap',      label: 'SOAP' },
    { id: 'treatment', label: 'Treatment' },
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '16px 20px' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '2px solid #DCE4E0', marginBottom: 18 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 24px',
              fontSize: 13.5,
              fontWeight: tab === t.id ? 700 : 500,
              border: 'none',
              borderBottom: `2.5px solid ${tab === t.id ? CLINIC_CONFIG.primaryColor : 'transparent'}`,
              marginBottom: -2,
              background: 'transparent',
              color: tab === t.id ? CLINIC_CONFIG.primaryColor : '#5A7870',
              cursor: 'pointer',
              transition: 'color .13s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'history'   && <HistoryTab history={ENCOUNTER_HISTORY} mode={mode} onView={onView} />}
      {tab === 'soap'      && (isDental ? <DentalEncounter apt={apt} /> : <AestheticSoapTab apt={apt} />)}
      {tab === 'treatment' && <TreatmentTab mode={mode} apt={apt} isDental={isDental} />}
    </div>
  );
}

// ─── History Tab ───────────────────────────────────────────────────────────────
function HistoryTab({ history, mode, onView }) {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const filtered = filter === 'all' ? history : history.filter(e => e.kind === filter);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Current medications */}
      <div style={card}>
        <div style={cardHd}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Current medications</div>
        </div>
        <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PATIENT.medications.map(m => (
            <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pill size={13} color="#4E6860" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#2A3830' }}>{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Encounter timeline */}
      <div style={card}>
        <div style={{ ...cardHd, alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Encounter history</div>
          <div style={{ display: 'flex', borderRadius: 7, overflow: 'hidden', border: '1px solid #DCE4E0' }}>
            {['all', 'dental', 'aesthetic'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, border: 'none', background: filter === f ? CLINIC_CONFIG.primaryColor : '#fff', color: filter === f ? '#fff' : '#4A6860', cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: '14px 18px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 5, top: 6, bottom: 0, width: 1, background: '#DCE4E0' }} />
            {filtered.map(e => {
              const isExp = expanded === e.id;
              return (
                <div key={e.id} style={{ marginBottom: 14, paddingLeft: 22, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 4, width: 11, height: 11, borderRadius: '50%', border: '2px solid #fff', background: e.kind === 'dental' ? '#3B82F6' : '#FB7185' }} />
                  <button className="enc-row" onClick={() => setExpanded(isExp ? null : e.id)} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '4px 0', cursor: 'pointer', borderRadius: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#5A7870' }}>{e.date}</span>
                      <ChevronDown size={13} color="#5A7870" style={{ transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111814', marginTop: 2, lineHeight: 1.3 }}>{e.procedure}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#5A7870', marginTop: 1 }}>{e.doctor}</div>
                    {!isExp && <div style={{ fontSize: 12, fontWeight: 500, color: '#6A8880', marginTop: 3, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.notes}</div>}
                  </button>
                  {isExp && (
                    <div style={{ marginTop: 8, padding: '12px 14px', background: '#F5F8F7', borderRadius: 9, border: '1px solid #DCE4E0' }}>
                      <div style={{ ...SEC, marginBottom: 6 }}>Rx Done</div>
                      {e.rxDone.map((r, i) => <div key={i} style={{ fontSize: 13, fontWeight: 500, color: '#2A3830', marginBottom: 3 }}>· {r.item}</div>)}
                      <div style={{ ...SEC, marginTop: 10, marginBottom: 6 }}>Notes</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#2A3830', fontStyle: 'italic' }}>{e.notes}</div>
                      {e.rxMeds.length > 0 && (<><div style={{ ...SEC, marginTop: 10, marginBottom: 6 }}>Medications</div>{e.rxMeds.map((m, i) => <div key={i} style={{ fontSize: 13, fontWeight: 600, color: '#2A3830', marginBottom: 3 }}>{m}</div>)}</>)}
                      {e.plan.length > 0 && (<><div style={{ ...SEC, marginTop: 10, marginBottom: 6 }}>Plan</div>{e.plan.map((p, i) => <div key={i} style={{ fontSize: 13, fontWeight: 600, color: '#2A3830', marginBottom: 3 }}>{i + 1}. {p}</div>)}</>)}
                      <button onClick={() => onView(e)} style={{ marginTop: 12, width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #DCE4E0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#2A4840', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                        <ExternalLink size={12} /> Open full encounter
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Aesthetic SOAP Tab (minimal, mirrors DentalEncounter SOAP section) ────────
function AestheticSoapTab({ apt }) {
  const [soap, setSoap] = useState({ s: 'Wants to refresh Botox from November and discuss tear-trough filler.', o: '', a: '', p: '' });
  const update = k => v => setSoap(p => ({ ...p, [k]: v }));
  return (
    <div style={card}>
      <div style={cardHd}><div><div style={{ fontSize: 14, fontWeight: 700 }}>SOAP note</div><div style={{ fontSize: 12, color: '#3D5850', marginTop: 2, fontWeight: 600 }}>{apt.procedure} · {apt.time}</div></div></div>
      <div style={cardBd}>
        <SoapField letter="S" label="Subjective"  value={soap.s} onChange={update('s')} />
        <SoapField letter="O" label="Objective"   value={soap.o} onChange={update('o')} />
        <SoapField letter="A" label="Assessment"  value={soap.a} onChange={update('a')} />
        <SoapField letter="P" label="Plan"        value={soap.p} onChange={update('p')} />
        <PrimaryBtn style={{ marginTop: 4 }}><Save size={13} />Save notes</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Treatment Tab — odontogram/injection map + Rx + actions ──────────────────
function TreatmentTab({ mode, apt, isDental }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Insurance banner */}
      <div style={{ padding: '11px 14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 9 }}>
        <Shield size={15} color="#1D4ED8" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1E40AF' }}>{mode === 'dental' ? 'QLM — Dental covered' : 'QLM — Aesthetic excluded'}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3B5FA0', marginTop: 2 }}>{mode === 'dental' ? 'Pre-auth approved. Co-pay QAR 60.' : 'Cosmetic procedure — patient pays direct.'}</div>
          {mode === 'dental' && <div style={{ fontSize: 12, color: '#6080B0', marginTop: 2, fontWeight: 600 }}>Auth #QLM-PA-118822</div>}
        </div>
      </div>

      {/* Odontogram / injection map */}
      {isDental ? <DentalTreatmentCard /> : <AestheticMapCard />}

      {/* Rx Done + Rx Med + Plan + Finish */}
      <ActionsColumn mode={mode} apt={apt} />
    </div>
  );
}

// ─── Dental treatment card (odontogram only) ───────────────────────────────────
function DentalTreatmentCard() {
  const [findings, setFindings] = useState({ 16: { status: 'decay' }, 17: { status: 'filling' }, 36: { status: 'filling' } });
  const [selectedTooth, setSelectedTooth] = useState(16);
  const setToothStatus = (num, status) => {
    setFindings(prev => {
      const next = { ...prev };
      if (status === 'healthy') delete next[num];
      else next[num] = { status };
      return next;
    });
  };
  return (
    <div style={card}>
      <div style={cardHd}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Odontogram</div>
          <div style={{ fontSize: 12, color: '#3D5850', marginTop: 2, fontWeight: 600 }}>FDI notation · Click a tooth to flag treatment</div>
        </div>
      </div>
      <div style={{ padding: '18px 20px' }}>
        <Odontogram findings={findings} selected={selectedTooth} onSelect={setSelectedTooth} />
        <ToothStatusPicker
          num={selectedTooth}
          currentStatus={findings[selectedTooth]?.status || 'healthy'}
          onSet={status => setToothStatus(selectedTooth, status)}
        />
      </div>
    </div>
  );
}

// ─── Aesthetic map card (injection map only) ───────────────────────────────────
const INJ_PRODUCTS = {
  Botox:  { label: 'Botox',  unit: 'U',  color: '#0C6B5A', defaultAmt: 4 },
  Filler: { label: 'Filler', unit: 'ml', color: '#B45309', defaultAmt: 1 },
};

// Suggest an anatomical region label from a click position on the 300×200 face.
function suggestRegion(x, y) {
  const side = x < 128 ? 'Left ' : x > 172 ? 'Right ' : '';
  let area = 'Cheek';
  if (y < 50)       area = 'Forehead';
  else if (y < 68)  area = 'Glabella';
  else if (y < 90)  area = 'Periorbital';
  else if (y < 112) area = 'Nasolabial';
  else              area = 'Lip / chin';
  return (side + area).trim();
}

function AestheticMapCard() {
  const [sites, setSites] = useState([
    { id: 's1', x: 150, y: 62, product: 'Botox', amount: 8, region: 'Glabella' },
    { id: 's2', x: 112, y: 46, product: 'Botox', amount: 4, region: 'Left Forehead' },
    { id: 's3', x: 188, y: 46, product: 'Botox', amount: 4, region: 'Right Forehead' },
  ]);
  const [product, setProduct]   = useState('Botox');
  const [selected, setSelected] = useState(null);
  const nextId = useRef(4);

  const addSiteAt = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width)  * 300);
    const y = Math.round(((e.clientY - rect.top)  / rect.height) * 200);
    const id = 's' + (nextId.current++);
    setSites(p => [...p, { id, x, y, product, amount: INJ_PRODUCTS[product].defaultAmt, region: suggestRegion(x, y) }]);
    setSelected(id);
  };
  const updateSite = (id, patch) => setSites(p => p.map(s => s.id === id ? { ...s, ...patch } : s));
  const removeSite = id => { setSites(p => p.filter(s => s.id !== id)); setSelected(sel => sel === id ? null : sel); };

  const botoxTotal  = sites.filter(s => s.product === 'Botox').reduce((t, s) => t + (Number(s.amount) || 0), 0);
  const fillerTotal = sites.filter(s => s.product === 'Filler').reduce((t, s) => t + (Number(s.amount) || 0), 0);

  return (
    <div style={card}>
      <div style={cardHd}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Injection map — Face</div>
          <div style={{ fontSize: 12, color: '#3D5850', marginTop: 2, fontWeight: 600 }}>Pick a product, then click the face to drop a site</div>
        </div>
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #DCE4E0' }}>
          {Object.keys(INJ_PRODUCTS).map(k => {
            const active = product === k;
            return (
              <button key={k} onClick={() => setProduct(k)} style={{ padding: '5px 13px', fontSize: 12, fontWeight: active ? 700 : 600, border: 'none', background: active ? INJ_PRODUCTS[k].color : '#fff', color: active ? '#fff' : '#4A6860', cursor: 'pointer' }}>{INJ_PRODUCTS[k].label}</button>
            );
          })}
        </div>
      </div>
      <div style={{ padding: '14px 18px' }}>
        <svg viewBox="0 0 300 200" onClick={addSiteAt} style={{ width: '100%', maxHeight: 200, cursor: 'crosshair', background: '#F8FAF9', borderRadius: 8 }}>
          {/* Face outline */}
          <ellipse cx="150" cy="90" rx="55" ry="70" fill="#FEF3C7" stroke="#D8B960" strokeWidth="1.5"/>
          <ellipse cx="150" cy="55" rx="40" ry="30" fill="#FEF3C7" stroke="#D8B960" strokeWidth="1"/>
          {/* Eyes */}
          <ellipse cx="132" cy="80" rx="10" ry="6" fill="#fff" stroke="#D8B960" strokeWidth="1"/>
          <ellipse cx="168" cy="80" rx="10" ry="6" fill="#fff" stroke="#D8B960" strokeWidth="1"/>
          {/* Nose */}
          <path d="M145 95 Q150 105 155 95" stroke="#D8B960" strokeWidth="1" fill="none"/>
          {/* Mouth */}
          <path d="M135 115 Q150 125 165 115" stroke="#D8B960" strokeWidth="1" fill="none"/>
          {/* Injection sites */}
          {sites.map(s => {
            const p = INJ_PRODUCTS[s.product];
            const isSel = selected === s.id;
            return (
              <g key={s.id} onClick={e => { e.stopPropagation(); setSelected(isSel ? null : s.id); }} style={{ cursor: 'pointer' }}>
                {isSel && <circle cx={s.x} cy={s.y} r="11" fill="none" stroke={p.color} strokeWidth="1.5" strokeDasharray="3 2"/>}
                <circle cx={s.x} cy={s.y} r="7" fill={p.color} opacity=".85"/>
                <circle cx={s.x} cy={s.y} r="3" fill="#fff"/>
                <text x={s.x + 10} y={s.y + 4} fontSize="8" fill={p.color} fontWeight="700" fontFamily="Manrope,sans-serif">{s.amount}{p.unit}</text>
              </g>
            );
          })}
        </svg>

        {/* Totals */}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, flexWrap: 'wrap' }}>
          <span style={{ color: '#4E6860', fontWeight: 600 }}>{sites.length} site{sites.length !== 1 ? 's' : ''} recorded</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, color: '#0C6B5A' }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: '#0C6B5A' }}/>{botoxTotal}U Botox</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, color: '#B45309' }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: '#B45309' }}/>{fillerTotal}ml filler</span>
        </div>

        {/* Placed sites */}
        {sites.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #EEF2F0', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={SEC}>Placed sites</div>
            {sites.map(s => {
              const p = INJ_PRODUCTS[s.product];
              const isSel = selected === s.id;
              return (
                <div key={s.id} onClick={() => setSelected(isSel ? null : s.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 9, border: `1.5px solid ${isSel ? p.color : '#DCE4E0'}`, background: isSel ? '#fff' : '#F8FAF9', cursor: 'pointer' }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.color, flexShrink: 0 }}/>
                  <input value={s.region} onClick={e => e.stopPropagation()} onChange={e => updateSite(s.id, { region: e.target.value })} style={{ flex: 1, padding: '4px 8px', fontSize: 12.5, fontWeight: 600 }}/>
                  <input type="number" min={0} value={s.amount} onClick={e => e.stopPropagation()} onChange={e => updateSite(s.id, { amount: parseFloat(e.target.value) || 0 })} style={{ width: 58, textAlign: 'right', fontFamily: "'IBM Plex Mono',monospace", padding: '4px 7px', fontSize: 12.5, fontWeight: 700 }}/>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#5A7870', width: 20 }}>{p.unit}</span>
                  <button onClick={e => { e.stopPropagation(); removeSite(s.id); }} style={{ background: 'none', border: 'none', color: '#C8D4CF', cursor: 'pointer', padding: 2, flexShrink: 0 }}><X size={13}/></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Patient Banner ───────────────────────────────────────────────────────────
function PatientBanner({ patient, appointment, mode }) {
  const [showId, setShowId] = useState(false);
  const team = patient.careTeam[mode];
  return (
    <div style={{background:'#fff',borderBottom:'1px solid #DCE4E0'}}>
      <div style={{padding:'12px 20px',display:'flex',alignItems:'flex-start',gap:20,flexWrap:'wrap'}}>
        {/* Identity */}
        <div style={{display:'flex',alignItems:'flex-start',gap:12,minWidth:280}}>
          <div style={{width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,#E3EEEA,#CFE3DC)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#0C6B5A',flexShrink:0}}>AK</div>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
              <span style={{fontSize:15,fontWeight:800,color:'#111814'}}>{patient.nameEn}</span>
              <span style={{fontSize:13,color:'#3D5850',fontWeight:600,direction:'rtl'}}>{patient.nameAr}</span>
            </div>
            <div style={{fontSize:12,color:'#5A7870',marginTop:2,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',fontWeight:600}}>
              <span className="mono">{patient.qid}</span>
              <span>·</span><span>{patient.age}y {patient.sex}</span>
              <span>·</span><span>{patient.bloodType}</span>
              <button onClick={()=>setShowId(!showId)} style={{fontSize:12,fontWeight:700,padding:'1px 8px',borderRadius:6,border:'1px solid #B8DDD6',background:showId?'#0C6B5A':'#F0FAF6',color:showId?'#fff':'#0C6B5A',cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
                <FileText size={10}/>{showId?'Hide ID':'View ID'}
              </button>
            </div>
            <div style={{fontSize:12,color:'#5A7870',marginTop:2,fontWeight:600}}>{patient.phone} · <span style={{color:'#0A6040'}}>{patient.insurer} {patient.policy}</span></div>
          </div>
        </div>

        {/* Allergies */}
        <div style={{borderLeft:'1px solid #EEF2F0',paddingLeft:18,minWidth:160}}>
          <div style={{...SEC,marginBottom:5,color:'#C04030'}}>Allergies</div>
          {patient.allergies.map(a=>(
            <div key={a} style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
              <AlertTriangle size={12} color="#DC4F38"/>
              <span style={{fontSize:12.5,fontWeight:600,color:'#B02A1E'}}>{a}</span>
            </div>
          ))}
        </div>

        {/* Conditions */}
        <div style={{borderLeft:'1px solid #EEF2F0',paddingLeft:18,minWidth:180}}>
          <div style={{...SEC,marginBottom:5}}>Conditions</div>
          {patient.conditions.map(c=><div key={c} style={{fontSize:12.5,fontWeight:600,color:'#2A3830',marginBottom:3}}>· {c}</div>)}
        </div>

        {/* Care team */}
        <div style={{borderLeft:'1px solid #EEF2F0',paddingLeft:18,minWidth:160}}>
          <div style={{...SEC,marginBottom:5}}>Care team</div>
          {[team.assistantDoctor, team.nurse].map(m=>(
            <div key={m.name} style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
              <div style={{width:44,height: 44,borderRadius:'50%',background:'#E8F3F0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#0C6B5A',flexShrink:0}}>{m.initials}</div>
              <div><div style={{fontSize:12,fontWeight:600,color:'#111814'}}>{m.name}</div><div style={{fontSize:12,fontWeight:600,color:'#5A7870'}}>{m.role}</div></div>
            </div>
          ))}
        </div>

        {/* Appointment */}
        <div style={{borderLeft:'1px solid #EEF2F0',paddingLeft:18,marginLeft:'auto'}}>
          <div style={{...SEC,marginBottom:5}}>Today</div>
          <div style={{fontSize:13,fontWeight:700,color:'#111814'}}>{appointment.procedure}</div>
          <div style={{fontSize:12,fontWeight:600,color:'#5A7870',marginTop:2}}>{appointment.time} · {appointment.dur}min</div>
        </div>
      </div>

      {/* ID viewer */}
      {showId&&(
        <div style={{padding:'12px 20px',background:'#F0FAF6',borderTop:'1px solid #B8DDD6',display:'flex',gap:16,alignItems:'flex-start'}}>
          {['QID — Front','QID — Back'].map(label=>(
            <div key={label} style={{width:160,height:90,borderRadius:8,background:'#fff',border:'1px solid #B8DDD6',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,flexShrink:0}}>
              <FileText size={18} color="#4E6860"/>
              <div style={{fontSize:12,fontWeight:600,color:'#5A7870'}}>{label}</div>
              <div style={{fontSize:12,color:'#4E6860',fontWeight:600}}>Uploaded 2024-06-15</div>
            </div>
          ))}
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:4}}>
            <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#2E4840',marginBottom:4}}>ID on file</div>
            {[['Document type','Qatar ID (QID)'],['QID number',patient.qid],['Full name',patient.nameEn],['Date of birth','1989-03-14'],['Nationality','Qatari'],['Expiry','2029-06-30']].map(([l,v])=>(
              <div key={l} style={{display:'flex',gap:12,fontSize:12.5}}>
                <span style={{color:'#5A7870',fontWeight:600,width:110,flexShrink:0}}>{l}</span>
                <span style={{fontWeight:600,color:'#111814',fontFamily:l==='QID number'?"'IBM Plex Mono',monospace":'inherit'}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chief complaint */}
      <div style={{padding:'9px 20px',background:'#FEF9EC',borderTop:'1px solid #FDE68A',display:'flex',alignItems:'flex-start',gap:10}}>
        <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#92600A',flexShrink:0,marginTop:1}}>Chief complaint</div>
        <div style={{fontSize:13,fontWeight:600,color:'#78400A',fontStyle:'italic',flex:1}}>"{appointment.chiefComplaint}"</div>
        <div style={{fontSize:12,color:'#B08040',fontWeight:600,flexShrink:0}}>Logged by reception · {appointment.time}</div>
      </div>
    </div>
  );
}

// ─── Shared SOAP section ──────────────────────────────────────────────────────
function SoapField({ letter, label, value, onChange }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{marginBottom:14,paddingBottom:14,borderBottom:'1px solid #EEF2F0'}}>
      <button onClick={()=>setOpen(!open)} style={{width:'100%',display:'flex',alignItems:'center',gap:8,background:'transparent',border:'none',padding:0,cursor:'pointer',marginBottom:open?8:0}}>
        <div style={{width:22,height:22,borderRadius:6,background:CLINIC_CONFIG.primaryColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff',flexShrink:0}}>{letter}</div>
        <span style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#2E4840',flex:1,textAlign:'left'}}>{label}</span>
        <ChevronDown size={13} color="#5A7870" style={{transform:open?'rotate(180deg)':'none',transition:'transform .15s'}}/>
      </button>
      {open&&<textarea value={value} onChange={e=>onChange(e.target.value)} rows={3} style={{resize:'vertical',lineHeight:1.6,fontSize:13}}/>}
    </div>
  );
}

// ─── Odontogram — recreated from the original prototype ──────────────────────
// Single tooth path repeated for all 32 teeth. Lower arch flipped vertically.
// FDI numbering. Status: decay | filling | crown | missing | healthy.
const ODONTO_STATUS_COLOR = {
  decay:   '#fca5a5',
  filling: '#93c5fd',
  crown:   '#fcd34d',
  missing: '#d6d3d1',
};

function ToothStatusPicker({ num, currentStatus, onSet }) {
  const STATUSES = [
    { id: 'healthy', label: 'Healthy', color: '#FFFFFF',  border: '#A8A29E' },
    { id: 'decay',   label: 'Decay',   color: '#fca5a5',  border: '#DC4F38' },
    { id: 'filling', label: 'Filling', color: '#93c5fd',  border: '#3B82F6' },
    { id: 'crown',   label: 'Crown',   color: '#fcd34d',  border: '#D97706' },
    { id: 'missing', label: 'Missing', color: '#d6d3d1',  border: '#78716C' },
  ];
  const quadrant = (() => {
    if (num >= 11 && num <= 18) return 'Upper right';
    if (num >= 21 && num <= 28) return 'Upper left';
    if (num >= 31 && num <= 38) return 'Lower left';
    if (num >= 41 && num <= 48) return 'Lower right';
    return '';
  })();
  return (
    <div style={{marginTop:12,padding:'12px 14px',background:'#fff',border:'1px solid #DCE4E0',borderRadius:10}}>
      <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:10,flexWrap:'wrap'}}>
        <span style={{fontSize:13,fontWeight:700,color:'#111814'}}>Tooth #{num}</span>
        <span style={{fontSize:11.5,fontWeight:600,color:'#5A7870'}}>{quadrant}</span>
        <span style={{marginLeft:'auto',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#5A7870'}}>Set status</span>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
        {STATUSES.map(st => {
          const active = st.id === currentStatus;
          return (
            <button
              key={st.id}
              onClick={() => onSet(st.id)}
              style={{
                display:'flex',alignItems:'center',gap:7,
                padding:'6px 11px',borderRadius:8,
                border:`1.5px solid ${active ? st.border : '#DCE4E0'}`,
                background: active ? '#fff' : '#F8FAF9',
                fontSize:12,fontWeight:active?700:600,
                color: active ? '#111814' : '#3D5850',
                cursor:'pointer',transition:'all .13s'
              }}
            >
              <span style={{width:12,height:12,borderRadius:3,background:st.color,border:`1px solid ${st.border}`,display:'inline-block',flexShrink:0}}/>
              {st.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Tooth({ num, findings, selected, onSelect, fill, divider, flipped }) {
  return (
    <>
      {divider && <div style={{width:8}}/>}
      <button onClick={()=>onSelect(num)} style={{display:'flex',flexDirection:'column',alignItems:'center',background:'transparent',border:'none',padding:0,cursor:'pointer'}}>
        <div style={{fontSize:9,color:'#6A8880',fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,marginBottom:1}}>{num}</div>
        <svg width="22" height="28" viewBox="0 0 20 26" className="tooth-svg" style={{transform:flipped?'scaleY(-1)':'none',transition:'filter .13s'}}>
          <path
            d="M3,2 Q3,0 5,0 L15,0 Q17,0 17,2 L18,12 Q18,18 16,22 Q14,26 12,24 L8,24 Q6,26 4,22 Q2,18 2,12 Z"
            fill={fill}
            stroke={selected ? '#0C6B5A' : '#A8A29E'}
            strokeWidth={selected ? 1.8 : 0.8}
          />
        </svg>
      </button>
    </>
  );
}

function LegendDot({ color, label, border }) {
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:11.5,color:'#3D5850',fontWeight:600}}>
      <span style={{width:11,height:11,borderRadius:3,background:color,border:border?'1px solid #A8A29E':'none',display:'inline-block',flexShrink:0}}/>
      {label}
    </span>
  );
}

function Odontogram({ findings = {}, selected, onSelect = () => {} }) {
  const upper = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
  const lower = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
  const fillFor = num => ODONTO_STATUS_COLOR[findings[num]?.status] || '#FFFFFF';
  return (
    <div style={{background:'#F8FAF9',borderRadius:8,padding:'12px 14px'}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
        <div style={{fontSize:9,color:'#9CA3AF',fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,letterSpacing:'.06em'}}>UPPER</div>
        <div style={{display:'flex',gap:2}}>
          {upper.map((t,i)=>(
            <Tooth key={t} num={t} findings={findings[t]} selected={selected===t} onSelect={onSelect} fill={fillFor(t)} divider={i===7}/>
          ))}
        </div>
        <div style={{display:'flex',gap:2}}>
          {lower.map((t,i)=>(
            <Tooth key={t} num={t} findings={findings[t]} selected={selected===t} onSelect={onSelect} fill={fillFor(t)} divider={i===7} flipped/>
          ))}
        </div>
        <div style={{fontSize:9,color:'#9CA3AF',fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,letterSpacing:'.06em'}}>LOWER</div>
      </div>
      {/* Legend */}
      <div style={{display:'flex',alignItems:'center',gap:14,marginTop:10,paddingTop:8,borderTop:'1px solid #DCE4E0',flexWrap:'wrap'}}>
        <LegendDot color="#fca5a5" label="Decay"/>
        <LegendDot color="#93c5fd" label="Filling"/>
        <LegendDot color="#fcd34d" label="Crown"/>
        <LegendDot color="#d6d3d1" label="Missing"/>
        <LegendDot color="#FFFFFF" label="Healthy" border/>
      </div>
    </div>
  );
}


// ─── Dental Encounter (SOAP tab only) ─────────────────────────────────────────
function DentalEncounter({ apt }) {
  const [soap, setSoap] = useState({s:'Sensitivity to cold on upper-right back tooth, started 4 days ago.',o:'',a:'',p:''});
  const update = k => v => setSoap(p=>({...p,[k]:v}));
  return (
    <div style={card}>
      <div style={cardHd}><div><div style={{fontSize:14,fontWeight:700}}>SOAP note</div><div style={{fontSize:12,color:'#3D5850',marginTop:2,fontWeight:600}}>{apt.procedure} · {apt.time}</div></div></div>
      <div style={cardBd}>
        <SoapField letter="S" label="Subjective"  value={soap.s} onChange={update('s')}/>
        <SoapField letter="O" label="Objective"   value={soap.o} onChange={update('o')}/>
        <SoapField letter="A" label="Assessment"  value={soap.a} onChange={update('a')}/>
        <SoapField letter="P" label="Plan"        value={soap.p} onChange={update('p')}/>
        <PrimaryBtn style={{marginTop:4}}><Save size={13}/>Save notes</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Actions Column ───────────────────────────────────────────────────────────
function ActionsColumn({ mode, apt }) {
  const [tab, setTab] = useState('rxdone');
  const [receptionNote, setReceptionNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const saveNote = () => { setNoteSaved(true); setTimeout(()=>setNoteSaved(false),2000); };
  const TABS = [
    {k:'rxmed',  icon:Pill,    label:'Rx Med'},
    {k:'rxdone', icon:Receipt, label:'Rx Done'},
    {k:'plan',   icon:FileText,label:'Plan'},
    {k:'finish', icon:CheckCircle2,label:'Finish'},
  ];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Insurance call-out */}
      <div style={{padding:'11px 14px',background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:12,display:'flex',alignItems:'flex-start',gap:9}}>
        <Shield size={15} color="#1D4ED8" style={{flexShrink:0,marginTop:1}}/>
        <div>
          <div style={{fontSize:12.5,fontWeight:700,color:'#1E40AF'}}>{mode==='dental'?'QLM — Dental covered':'QLM — Aesthetic excluded'}</div>
          <div style={{fontSize:12,fontWeight:600,color:'#3B5FA0',marginTop:2}}>{mode==='dental'?'Pre-auth approved. Co-pay QAR 60.':'Cosmetic procedure — patient pays direct.'}</div>
          {mode==='dental'&&<div style={{fontSize:12,color:'#6080B0',marginTop:2,fontWeight:600}}>Auth #QLM-PA-118822</div>}
        </div>
      </div>

      {/* Action tabs */}
      <div style={{...card,overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:`repeat(${TABS.length},1fr)`,borderBottom:'1px solid #EEF2F0'}}>
          {TABS.map(({k,icon:Icon,label})=>(
            <button key={k} onClick={()=>setTab(k)} style={{padding:'10px 4px',fontSize:12,fontWeight:tab===k?700:500,border:'none',borderBottom:`2.5px solid ${tab===k?CLINIC_CONFIG.primaryColor:'transparent'}`,background:'transparent',color:tab===k?CLINIC_CONFIG.primaryColor:'#4A6860',display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:'pointer',marginBottom:-1}}>
              <Icon size={13}/>{label}
            </button>
          ))}
        </div>
        <div style={{padding:'14px 16px'}}>
          {tab==='rxmed'  && <RxMedPanel mode={mode}/>}
          {tab==='rxdone' && <RxDonePanel mode={mode} apt={apt}/>}
          {tab==='plan'   && <PlanPanel mode={mode}/>}
          {tab==='finish' && <FinishPanel mode={mode}/>}
        </div>
      </div>

      {/* Note for reception */}
      <div style={{padding:'12px 14px',background:'#FEF9EC',border:'1px solid #FDE68A',borderRadius:12}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#92600A',display:'flex',alignItems:'center',gap:5}}>
            <Bell size={11}/>Note for reception
          </div>
          <span style={{fontSize:12,fontWeight:600,color:'#B08040'}}>Visible at checkout</span>
        </div>
        <textarea value={receptionNote} onChange={e=>{setReceptionNote(e.target.value);setNoteSaved(false);}} rows={3} placeholder="e.g. Waive co-pay today · Schedule follow-up before leaving · Remind about pre-auth for next procedure..." style={{background:'#fff',borderColor:'#FDE68A',resize:'none',fontSize:12.5}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6}}>
          <span style={{fontSize:12,color:'#B08040',fontWeight:600}}>{receptionNote.length>0?`${receptionNote.length} chars`:''}</span>
          <button onClick={saveNote} disabled={!receptionNote.trim()} style={{padding:'5px 12px',borderRadius:7,border:'none',background:noteSaved?'#0A6040':'#92600A',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:4,transition:'background .15s'}}>
            {noteSaved?<><CheckCircle2 size={11}/>Saved</>:<><Save size={11}/>Save note</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Rx Med Panel ─────────────────────────────────────────────────────────────
function RxMedPanel({ mode }) {
  const [rxList, setRxList] = useState([]);
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState({name:'',sig:''});
  const add = drug => { if(drug.name.startsWith('Amoxicillin')){ if(!confirm('ALLERGY: Patient allergic to Penicillin. Continue?')) return; } setRxList(p=>[...p,{...drug,id:Date.now()}]); };
  const addCustom = () => { if(!custom.name)return; add(custom); setCustom({name:'',sig:''}); setShowCustom(false); };
  return (
    <div>
      <div style={SEC}>Quick prescribe</div>
      <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:10}}>
        {DRUG_FAVOURITES.map(d=>(
          <button key={d.name} onClick={()=>add(d)} style={{textAlign:'left',padding:'8px 10px',borderRadius:8,border:`1px solid ${d.name.startsWith('Amoxicillin')?'#FECACA':'#DCE4E0'}`,background:d.name.startsWith('Amoxicillin')?'#FEF4F2':'#fff',cursor:'pointer',transition:'filter .13s'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12.5,fontWeight:600,color:'#111814'}}>{d.name}</span>
              {d.name.startsWith('Amoxicillin')&&<AlertTriangle size={12} color="#DC4F38"/>}
            </div>
            <div style={{fontSize:12,fontWeight:600,color:'#5A7870',marginTop:2}}>{d.sig}</div>
          </button>
        ))}
      </div>
      {!showCustom?<button onClick={()=>setShowCustom(true)} style={{width:'100%',padding:'8px',borderRadius:8,border:'1.5px dashed #C8D4CF',background:'transparent',fontSize:12.5,fontWeight:600,color:'#5A7870',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5}}><Plus size={13}/>Add other medicine</button>:(
        <div style={{padding:'10px 12px',background:'#F5F8F7',borderRadius:9,border:'1px solid #DCE4E0',display:'flex',flexDirection:'column',gap:7}}>
          <input value={custom.name} onChange={e=>setCustom({...custom,name:e.target.value})} placeholder="Medicine name + strength"/>
          <input value={custom.sig}  onChange={e=>setCustom({...custom,sig:e.target.value})}  placeholder="Instructions (e.g. 1 tab OD × 3 days)"/>
          <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
            <GhostBtn onClick={()=>{setShowCustom(false);setCustom({name:'',sig:''});}} style={{padding:'5px 12px',fontSize:12}}>Cancel</GhostBtn>
            <PrimaryBtn onClick={addCustom} disabled={!custom.name} style={{padding:'5px 12px',fontSize:12}}><Plus size={11}/>Add</PrimaryBtn>
          </div>
        </div>
      )}
      {rxList.length>0&&(
        <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid #EEF2F0'}}>
          <div style={SEC}>On prescription</div>
          {rxList.map(r=>(
            <div key={r.id} style={{padding:'7px 10px',background:'#F0FAF6',border:'1px solid #B8DDD6',borderRadius:8,marginBottom:5,display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
              <div><div style={{fontSize:12.5,fontWeight:700,color:'#0A6040'}}>{r.name}</div><div style={{fontSize:12,fontWeight:600,color:'#2A6040',marginTop:1}}>{r.sig}</div></div>
              <button onClick={()=>setRxList(p=>p.filter(x=>x.id!==r.id))} style={{background:'none',border:'none',color:'#4E6860',cursor:'pointer',padding:2}}><X size={12}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rx Done Panel ────────────────────────────────────────────────────────────
function RxDonePanel({ mode, apt }) {
  const DEFAULTS = mode==='dental'?[{id:'d1',label:'Composite filling — tooth #16',code:'D2391',price:600},{id:'d2',label:'Bitewing X-rays (4 films)',code:'D0274',price:220}]:[{id:'a1',label:'Botox 20U — glabellar + frontalis',code:'M0023',price:1800}];
  const [items, setItems] = useState(DEFAULTS.map(i=>({...i,editPrice:i.price})));
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({label:'',code:'',price:''});
  const [discPct, setDiscPct] = useState(0);
  const [discReason, setDiscReason] = useState('');
  const [showDisc, setShowDisc] = useState(false);
  const subtotal = items.reduce((s,i)=>s+i.editPrice,0);
  const discAmt = Math.round(subtotal*discPct/100);
  const total = subtotal-discAmt;
  const addItem = () => { if(!newItem.label)return; const p=parseInt(newItem.price)||0; setItems(prev=>[...prev,{id:`r${Date.now()}`,label:newItem.label,code:newItem.code,price:p,editPrice:p}]); setNewItem({label:'',code:'',price:''}); setShowAdd(false); };
  return (
    <div>
      <div style={SEC}>Treatments done today</div>
      <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:8}}>
        {items.map(item=>(
          <div key={item.id} style={{padding:'9px 11px',border:'1px solid #DCE4E0',borderRadius:9,background:'#fff'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12.5,fontWeight:600,color:'#111814'}}>{item.label}</div>
                <div style={{fontSize:12,fontFamily:"'IBM Plex Mono',monospace",color:'#4E6860',marginTop:1,fontWeight:600}}>{item.code}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
                <span style={{fontSize:12,fontWeight:600,color:'#5A7870'}}>QAR</span>
                <input type="number" value={item.editPrice} onChange={e=>setItems(p=>p.map(i=>i.id===item.id?{...i,editPrice:parseInt(e.target.value)||0}:i))} style={{width:72,textAlign:'right',fontFamily:"'IBM Plex Mono',monospace",padding:'4px 7px',fontSize:13,fontWeight:700}}/>
                <button onClick={()=>setItems(p=>p.filter(i=>i.id!==item.id))} style={{background:'none',border:'none',color:'#C8D4CF',cursor:'pointer',padding:2}}><X size={12}/></button>
              </div>
            </div>
            {item.editPrice!==item.price&&<div style={{fontSize:12,fontWeight:600,color:'#C05820',marginTop:4,display:'flex',alignItems:'center',gap:4}}><Edit3 size={10}/>Modified from QAR {item.price.toLocaleString()}</div>}
          </div>
        ))}
      </div>
      {!showAdd?<button onClick={()=>setShowAdd(true)} style={{width:'100%',padding:'7px',borderRadius:8,border:'1.5px dashed #C8D4CF',background:'transparent',fontSize:12.5,fontWeight:600,color:'#5A7870',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5,marginBottom:8}}><Plus size={13}/>Add treatment</button>:(
        <div style={{padding:'10px 12px',background:'#F5F8F7',borderRadius:9,border:'1px solid #DCE4E0',marginBottom:8,display:'flex',flexDirection:'column',gap:7}}>
          <input value={newItem.label} onChange={e=>setNewItem({...newItem,label:e.target.value})} placeholder="Treatment name"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
            <input value={newItem.code} onChange={e=>setNewItem({...newItem,code:e.target.value})} placeholder="Code (opt)" style={{fontFamily:"'IBM Plex Mono',monospace"}}/>
            <input type="number" value={newItem.price} onChange={e=>setNewItem({...newItem,price:e.target.value})} placeholder="Price (QAR)" style={{fontFamily:"'IBM Plex Mono',monospace"}}/>
          </div>
          <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
            <GhostBtn onClick={()=>{setShowAdd(false);setNewItem({label:'',code:'',price:''}); }} style={{padding:'5px 12px',fontSize:12}}>Cancel</GhostBtn>
            <PrimaryBtn onClick={addItem} disabled={!newItem.label} style={{padding:'5px 12px',fontSize:12}}><Plus size={11}/>Add</PrimaryBtn>
          </div>
        </div>
      )}
      {!showDisc?<button onClick={()=>setShowDisc(true)} style={{width:'100%',padding:'7px',borderRadius:8,border:'1.5px dashed #C8D4CF',background:'transparent',fontSize:12.5,fontWeight:600,color:'#5A7870',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5,marginBottom:8}}><Tag size={13}/>Add discount</button>:(
        <div style={{padding:'10px 12px',background:'#F5F8F7',borderRadius:9,border:'1px solid #DCE4E0',marginBottom:8}}>
          <div style={{display:'flex',gap:8,marginBottom:6}}>
            <div style={{width:64}}><div style={{...SEC,marginBottom:4}}>% Off</div><input type="number" min={0} max={100} value={discPct} onChange={e=>setDiscPct(Math.min(100,Math.max(0,parseInt(e.target.value)||0)))} style={{fontFamily:"'IBM Plex Mono',monospace"}}/></div>
            <div style={{flex:1}}><div style={{...SEC,marginBottom:4}}>Reason</div><input value={discReason} onChange={e=>setDiscReason(e.target.value)} placeholder="e.g. Staff family"/></div>
            <button onClick={()=>{setShowDisc(false);setDiscPct(0);setDiscReason('');}} style={{alignSelf:'flex-end',marginBottom:2,background:'none',border:'none',color:'#4E6860',cursor:'pointer'}}><X size={14}/></button>
          </div>
          {discPct>0&&<div style={{fontSize:12,fontWeight:700,color:'#0A6040'}}>Saves patient QAR {discAmt.toLocaleString()}</div>}
        </div>
      )}
      <div style={{paddingTop:10,borderTop:'1px solid #EEF2F0',display:'flex',flexDirection:'column',gap:5}}>
        <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>Subtotal</span><span style={{fontSize:12.5,fontWeight:700}}>QAR {subtotal.toLocaleString()}</span></div>
        {discPct>0&&<div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#0A6040'}}>Discount ({discPct}%)</span><span style={{fontSize:12.5,fontWeight:700,color:'#0A6040'}}>-QAR {discAmt.toLocaleString()}</span></div>}
        <div style={{display:'flex',justifyContent:'space-between',paddingTop:6,marginTop:2,borderTop:'1px solid #DCE4E0'}}><span style={{fontSize:13,fontWeight:700}}>Total</span><span style={{fontSize:14,fontWeight:800,letterSpacing:'-0.5px'}}>QAR {total.toLocaleString()}</span></div>
      </div>
      <div style={{marginTop:8,fontSize:12,fontWeight:600,color:'#4E6860',fontStyle:'italic'}}>Prices flow to checkout. Edits are audit-logged.</div>
    </div>
  );
}

// ─── Plan Panel ───────────────────────────────────────────────────────────────
function PlanPanel({ mode }) {
  const DENTAL_PLAN    = [{step:1,item:'Composite filling #16',when:'Today',status:'in-progress'},{step:2,item:'Follow-up — sensitivity check',when:'2 weeks',status:'planned'},{step:3,item:'Routine cleaning + check',when:'6 months',status:'planned'}];
  const AESTHETIC_PLAN = [{step:1,item:'Botox 20U — glabellar + frontalis',when:'Today',status:'in-progress'},{step:2,item:'Review at 2 weeks',when:'2 weeks',status:'planned'},{step:3,item:'Tear-trough filler consult',when:'Next visit',status:'planned'}];
  const plan = mode==='dental'?DENTAL_PLAN:AESTHETIC_PLAN;
  return (
    <div>
      <div style={SEC}>Treatment plan</div>
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:10}}>
        {plan.map(p=>(
          <div key={p.step} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'9px 11px',border:`1px solid ${p.status==='in-progress'?'#B8DDD6':'#DCE4E0'}`,borderRadius:9,background:p.status==='in-progress'?'#F0FAF6':'#fff'}}>
            <div style={{width:20,height:20,borderRadius:'50%',background:p.status==='in-progress'?CLINIC_CONFIG.primaryColor:'#EEF2F0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:p.status==='in-progress'?'#fff':'#5A7870',flexShrink:0}}>{p.step}</div>
            <div style={{flex:1}}><div style={{fontSize:12.5,fontWeight:600,color:'#111814'}}>{p.item}</div><div style={{fontSize:12,fontWeight:600,color:'#5A7870',marginTop:2}}>{p.when}</div></div>
          </div>
        ))}
      </div>
      <button style={{width:'100%',padding:'8px',borderRadius:8,border:'1.5px dashed #C8D4CF',background:'transparent',fontSize:12.5,fontWeight:600,color:'#5A7870',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5}}><Plus size={13}/>Add step</button>
      <div style={{marginTop:8,fontSize:12,fontWeight:600,color:'#4E6860',fontStyle:'italic'}}>Treatment plan is clinical only. Pricing in Rx Done tab.</div>
    </div>
  );
}

// ─── Finish Panel ─────────────────────────────────────────────────────────────
function FinishPanel({ mode }) {
  const CHECKLIST = mode==='dental'?[['SOAP note saved',true],['Odontogram updated',false],['Treatment plan updated',false],['Rx prescribed (if needed)',true],['Rx Done prices confirmed',false],['Note for reception written',false]]:
    [['SOAP note saved',true],['Injection map updated',true],['Treatment plan updated',false],['Rx Done prices confirmed',false],['Note for reception written',false]];
  return (
    <div>
      <div style={SEC}>Visit checklist</div>
      <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:14}}>
        {CHECKLIST.map(([lbl,done])=>(
          <div key={lbl} style={{display:'flex',alignItems:'center',gap:9,padding:'7px 10px',borderRadius:8,background:done?'#F0FAF6':'#F5F8F7',border:`1px solid ${done?'#B8DDD6':'#DCE4E0'}`}}>
            <div style={{width:18,height:18,borderRadius:'50%',background:done?CLINIC_CONFIG.primaryColor:'#EEF2F0',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {done&&<CheckCircle2 size={11} color="#fff"/>}
            </div>
            <span style={{fontSize:12.5,fontWeight:600,color:done?'#111814':'#5A7870'}}>{lbl}</span>
          </div>
        ))}
      </div>
      <PrimaryBtn style={{width:'100%',justifyContent:'center',padding:'11px'}}><CheckCircle2 size={14}/>Complete visit</PrimaryBtn>
    </div>
  );
}

// ─── Past Encounter View ──────────────────────────────────────────────────────
function PastEncounterView({ enc, onBack }) {
  const soap = SOAP_MAP[enc.id] || {s:enc.notes,o:'—',a:'—',p:enc.plan?.join('. ')||'—'};
  return (
    <div style={{padding:'14px 20px'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
        <GhostBtn onClick={onBack}><ChevronLeft size={14}/>Back to today</GhostBtn>
        <div style={{fontSize:14,fontWeight:700,color:'#111814'}}>{enc.date} — {enc.procedure}</div>
        <div style={{fontSize:13,fontWeight:600,color:'#5A7870'}}>{enc.doctor} · {enc.specialty}</div>
        <span style={{marginLeft:'auto',fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:20,background:enc.kind==='dental'?'#EFF6FF':'#FFF0F3',color:enc.kind==='dental'?'#1D4ED8':'#BE185D',border:`1px solid ${enc.kind==='dental'?'#BFDBFE':'#FBCFE8'}`}}>{enc.kind}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:16}}>
        <div style={card}>
          <div style={cardHd}><div style={{fontSize:14,fontWeight:700}}>SOAP Note — read only</div></div>
          <div style={cardBd}>
            {[['S','Subjective',soap.s],['O','Objective',soap.o],['A','Assessment',soap.a],['P','Plan',soap.p]].map(([k,lbl,val])=>(
              <div key={k} style={{marginBottom:14,paddingBottom:14,borderBottom:'1px solid #EEF2F0'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <div style={{width:22,height:22,borderRadius:6,background:CLINIC_CONFIG.primaryColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff'}}>{k}</div>
                  <span style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#2E4840'}}>{lbl}</span>
                </div>
                <div style={{fontSize:13,fontWeight:500,color:'#2A3830',lineHeight:1.65,paddingLeft:30}}>{val}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {[['Rx Done',enc.rxDone.map((r,i)=><div key={i} style={{fontSize:12.5,fontWeight:600,color:'#2A3830',marginBottom:3}}>· {r.item}</div>)],
            ['Rx Medicines',enc.rxMeds.length>0?enc.rxMeds.map((m,i)=><div key={i} style={{display:'flex',gap:6,marginBottom:3}}><Pill size={12} color="#4E6860"/><span style={{fontSize:12.5,fontWeight:600,color:'#2A3830'}}>{m}</span></div>):<div style={{fontSize:12.5,fontWeight:600,color:'#4E6860',fontStyle:'italic'}}>None prescribed</div>],
            ['Plan',enc.plan.map((p,i)=><div key={i} style={{display:'flex',gap:8,marginBottom:4}}><span style={{width:18,height:18,borderRadius:'50%',background:'#EEF2F0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#5A7870',flexShrink:0}}>{i+1}</span><span style={{fontSize:12.5,fontWeight:600,color:'#2A3830'}}>{p}</span></div>)],
          ].map(([title,content])=>(
            <div key={title} style={card}>
              <div style={cardHd}><div style={{fontSize:13,fontWeight:700}}>{title}</div></div>
              <div style={cardBd}>{content}</div>
            </div>
          ))}
          <div style={{fontSize:12,fontWeight:600,color:'#4E6860',display:'flex',alignItems:'center',gap:5}}><FileText size={12}/>Past encounter — read only. Audit entry created.</div>
        </div>
      </div>
    </div>
  );
}
