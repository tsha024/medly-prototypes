import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, ChevronDown, Calendar, Bell, Settings,
  Search, Plus, User, Clock, Shield, AlertTriangle, CheckCircle2,
  FileText, X, Save, Globe, Edit3, CalendarDays
} from 'lucide-react';

// ─── Clinic branding ─────────────────────────────────────────────────────────
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

// ─── Data ─────────────────────────────────────────────────────────────────────
const DOCTORS = [
  { id:'d1', nameEn:'Dr. Layla Al-Mahmoud', nameAr:'د. ليلى المحمود', specialty:'General Dentistry',  specialtyAr:'طب الأسنان العام',  qchp:'QCHP-D-44218', color:'rose'    },
  { id:'d2', nameEn:'Dr. Omar Al-Sayed',    nameAr:'د. عمر السيد',     specialty:'Orthodontics',       specialtyAr:'تقويم الأسنان',      qchp:'QCHP-D-51209', color:'amber'   },
  { id:'d3', nameEn:'Dr. Priya Menon',      nameAr:'د. بريا مينون',    specialty:'Endodontics',        specialtyAr:'علاج العصب',         qchp:'QCHP-D-39871', color:'teal'    },
  { id:'d4', nameEn:'Dr. Yusuf Hassan',     nameAr:'د. يوسف حسن',      specialty:'Cosmetic Dentistry', specialtyAr:'تجميل الأسنان',      qchp:'QCHP-D-47502', color:'violet'  },
  { id:'d5', nameEn:'Dr. Reem Al-Thani',    nameAr:'د. ريم الثاني',    specialty:'Aesthetic Medicine', specialtyAr:'الطب التجميلي',      qchp:'QCHP-M-22041', color:'sky'     },
  { id:'d6', nameEn:'Dr. Marcus Chen',      nameAr:'د. ماركوس تشين',   specialty:'Aesthetic Medicine', specialtyAr:'الطب التجميلي',      qchp:'QCHP-M-29116', color:'emerald' },
];
const NURSES = [
  { id:'n1', name:'Nurse Dina Khalil',   specialty:'Aesthetic' },
  { id:'n2', name:'Nurse Sara Al-Amin',  specialty:'Dental'    },
  { id:'n3', name:'Nurse Mariam Hassan', specialty:'General'   },
  { id:'n4', name:'Nurse Aliya Rahman',  specialty:'Aesthetic' },
];
const PROCEDURES = {
  'General Dentistry':  [{ name:'Consultation',dur:30,price:250,needsNurse:false},{name:'Cleaning & polish',dur:45,price:400,needsNurse:true},{name:'Filling',dur:45,price:600,needsNurse:true},{name:'Extraction',dur:60,price:800,needsNurse:true},{name:'X-ray (bitewing)',dur:15,price:200,needsNurse:false}],
  'Orthodontics':       [{ name:'Ortho consult',dur:45,price:350,needsNurse:false},{name:'Braces adjustment',dur:30,price:450,needsNurse:true},{name:'Retainer fitting',dur:60,price:1200,needsNurse:true}],
  'Endodontics':        [{ name:'Root canal consult',dur:30,price:400,needsNurse:false},{name:'Root canal treatment',dur:90,price:2500,needsNurse:true}],
  'Cosmetic Dentistry': [{ name:'Veneer consultation',dur:30,price:300,needsNurse:false},{name:'Teeth whitening',dur:60,price:1500,needsNurse:true},{name:'Veneer fitting',dur:120,price:4500,needsNurse:true}],
  'Aesthetic Medicine': [{ name:'Aesthetic consult',dur:30,price:200,needsNurse:false},{name:'Botox',dur:45,price:1800,needsNurse:true},{name:'Dermal filler',dur:60,price:2400,needsNurse:true},{name:'Chemical peel',dur:60,price:900,needsNurse:true},{name:'Hydrafacial',dur:60,price:1200,needsNurse:true},{name:'Laser hair removal',dur:45,price:800,needsNurse:true}],
};
const ALL_PROCEDURES = Object.values(PROCEDURES).flat();
const MOCK_PATIENTS = [
  { id:'p1', fileNo:'YC-2024-0142', qid:'28934567812', nameEn:'Aisha Al-Kuwari',     nameAr:'عائشة الكواري',    phone:'+974 5512 4488', dob:'1989-03-14', insurer:'QLM',       policy:'QLM-447821',  eligible:true,  lastVisit:'2026-02-14', allergies:['Penicillin (rash)','Latex'],   conditions:['Type 2 diabetes (controlled)','Hypertension'], notes:'Prefers afternoon. Anxious about dental work.',   encounterHistory:[{date:'2026-02-14',doctor:'Dr. Layla Al-Mahmoud',procedure:'Cleaning & polish',notes:'Mild gingivitis lower right.'},{date:'2025-11-22',doctor:'Dr. Reem Al-Thani',procedure:'Botox -- glabellar',notes:'20U. Pleased at follow-up.'},{date:'2025-08-03',doctor:'Dr. Layla Al-Mahmoud',procedure:'Consultation + X-rays',notes:'Referred to endodontics.'}] },
  { id:'p2', fileNo:'YC-2024-0089', qid:'29612039874', nameEn:'James Patterson',      nameAr:'جيمس باترسون',     phone:'+974 7011 9923', dob:'1985-11-02', insurer:'Cash/Card', policy:null,          eligible:null,  lastVisit:'2025-11-08', allergies:[],                              conditions:[],                                              notes:'',                                                encounterHistory:[{date:'2025-11-08',doctor:'Dr. Omar Al-Sayed',procedure:'Braces adjustment',notes:'Progressing well.'}] },
  { id:'p3', fileNo:'YC-2025-0317', qid:'28701445129', nameEn:'Fatima Al-Mansoori',   nameAr:'فاطمة المنصوري',   phone:'+974 3344 7712', dob:'1992-07-22', insurer:'AXA',       policy:'AXA-Q-998812',eligible:true,  lastVisit:'2026-04-30', allergies:['Sulfa drugs'],                conditions:[],                                              notes:'Pregnant (24 weeks). Avoid X-rays.',              encounterHistory:[{date:'2026-04-30',doctor:'Dr. Reem Al-Thani',procedure:'Hydrafacial',notes:'Good outcome.'}] },
];
const STATUS_CFG = {
  booked:           { label:'Booked',         labelAr:'محجوز',   dot:'#A0B0AA', chip:['#E8EDEB','#2A3830']  },
  confirmed:        { label:'Confirmed',      labelAr:'مؤكد',    dot:'#3B82F6', chip:['#EFF6FF','#1D4ED8']  },
  arrived:          { label:'Arrived',        labelAr:'وصل',     dot:'#F59E0B', chip:['#FEF3C7','#92400E']  },
  'in-progress':    { label:'Ongoing',        labelAr:'جاري',    dot:'#10B981', chip:['#D1FAE5','#065F46']  },
  'treatment-done': { label:'Treatment done', labelAr:'انتهى',   dot:'#8B5CF6', chip:['#EDE9FE','#4C1D95']  },
  'payment-done':   { label:'Paid',           labelAr:'مدفوع',   dot:'#0D9488', chip:['#CCFBF1','#134E4A']  },
  cancelled:        { label:'Cancelled',      labelAr:'ملغى',    dot:'#EF4444', chip:['#FEF2F2','#991B1B']  },
  'no-show':        { label:'No-show',        labelAr:'لم يحضر', dot:'#DC2626', chip:['#FEE2E2','#991B1B']  },
};
const DOC_COLORS = {
  rose:    { left:'#F87171', bg:'#FFF5F5', initBg:'#FEE2E2', initFg:'#991B1B' },
  amber:   { left:'#F59E0B', bg:'#FFFBEB', initBg:'#FEF3C7', initFg:'#92400E' },
  teal:    { left:'#14B8A6', bg:'#F0FDFA', initBg:'#CCFBF1', initFg:'#134E4A' },
  violet:  { left:'#8B5CF6', bg:'#F5F3FF', initBg:'#EDE9FE', initFg:'#4C1D95' },
  sky:     { left:'#38BDF8', bg:'#F0F9FF', initBg:'#E0F2FE', initFg:'#075985' },
  emerald: { left:'#34D399', bg:'#ECFDF5', initBg:'#A7F3D0', initFg:'#064E3B' },
};
const DOCTOR_SCHEDULES = {
  d1:{ workStart:'09:00', workEnd:'17:00', offDays:['friday'],             breaks:[{start:'13:00',end:'14:00',label:'Lunch'}], vacations:[] },
  d2:{ workStart:'10:00', workEnd:'18:00', offDays:['friday','saturday'],  breaks:[{start:'13:00',end:'14:00',label:'Lunch'}], vacations:[{start:'2026-06-15',end:'2026-06-22',reason:'Annual leave'}] },
  d3:{ workStart:'09:00', workEnd:'18:00', offDays:['friday'],             breaks:[{start:'12:30',end:'13:30',label:'Prayer + lunch'}], vacations:[] },
  d4:{ workStart:'11:00', workEnd:'18:00', offDays:['friday','sunday'],    breaks:[{start:'13:00',end:'14:00',label:'Lunch'}], vacations:[] },
  d5:{ workStart:'12:00', workEnd:'18:00', offDays:['friday'],             breaks:[], vacations:[{start:'2026-05-28',end:'2026-05-30',reason:'Conference'}] },
  d6:{ workStart:'09:00', workEnd:'17:00', offDays:['friday'],             breaks:[{start:'13:00',end:'14:00',label:'Lunch'}], vacations:[] },
};
const TIME_SLOTS = Array.from({length:18},(_,i)=>{ const h=9+Math.floor(i/2); const m=i%2===0?'00':'30'; return `${String(h).padStart(2,'0')}:${m}`; });
const SEED_APPOINTMENTS = [
  {id:'a1',doctorId:'d1',patientId:'p3',start:'09:00',dur:45,procedure:'Cleaning & polish',    status:'payment-done',  nurseId:'n2',notes:'Standard cleaning.'},
  {id:'a2',doctorId:'d1',patientId:'p1',start:'10:30',dur:60,procedure:'Extraction',           status:'arrived',       nurseId:'n2',asstDoctorId:'d4',notes:'Anxious patient.'},
  {id:'a3',doctorId:'d2',patientId:'p2',start:'11:00',dur:30,procedure:'Braces adjustment',    status:'confirmed',     nurseId:null,notes:''},
  {id:'a4',doctorId:'d3',patientId:'p1',start:'14:00',dur:90,procedure:'Root canal treatment', status:'in-progress',   nurseId:'n2',notes:''},
  {id:'a5',doctorId:'d5',patientId:'p3',start:'15:30',dur:60,procedure:'Hydrafacial',          status:'booked',        nurseId:'n1',notes:'First hydrafacial.'},
  {id:'a6',doctorId:'d6',patientId:'p2',start:'10:00',dur:45,procedure:'Botox',                status:'treatment-done',nurseId:'n4',notes:'20U total.'},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt      = d => d.toLocaleDateString('en-GB',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});
const fmtShort = d => d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'});
const validateQID        = qid  => /^\d{11}$/.test(qid.replace(/\s/g,''));
const validateQatarPhone = p    => /^\+974\s?\d{4}\s?\d{4}$/.test(p);
const dayOfWeek          = d    => d.toLocaleDateString('en-GB',{weekday:'long'}).toLowerCase();
const slotToMin          = slot => { const [h,m]=slot.split(':').map(Number); return h*60+m; };

function isSlotBlocked(doctorId, date, slot) {
  const s=DOCTOR_SCHEDULES[doctorId]; if(!s) return false;
  if(s.offDays.includes(dayOfWeek(date))) return true;
  const ds=date.toISOString().slice(0,10);
  if(s.vacations.some(v=>ds>=v.start&&ds<=v.end)) return true;
  const sm=slotToMin(slot);
  if(sm<slotToMin(s.workStart)||sm>=slotToMin(s.workEnd)) return true;
  return s.breaks.some(b=>sm>=slotToMin(b.start)&&sm<slotToMin(b.end));
}
function blockedReason(doctorId, date, slot) {
  const s=DOCTOR_SCHEDULES[doctorId]; if(!s) return null;
  if(s.offDays.includes(dayOfWeek(date))) return `Off ${dayOfWeek(date)}`;
  const ds=date.toISOString().slice(0,10);
  for(const v of s.vacations) if(ds>=v.start&&ds<=v.end) return v.reason;
  const sm=slotToMin(slot);
  if(sm<slotToMin(s.workStart)) return `Before shift (${s.workStart})`;
  if(sm>=slotToMin(s.workEnd))  return `After shift (${s.workEnd})`;
  for(const b of s.breaks) if(sm>=slotToMin(b.start)&&sm<slotToMin(b.end)) return b.label;
  return null;
}
function nextFileNumber(patients) {
  const year=new Date().getFullYear(); let max=0;
  patients.forEach(p=>{ const m=p.fileNo&&p.fileNo.match(/^YC-(\d{4})-(\d{4})$/); if(m&&parseInt(m[1])===year) max=Math.max(max,parseInt(m[2])); });
  return `YC-${year}-${String(max+1).padStart(4,'0')}`;
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
const T      = { fontFamily:"'Manrope','Noto Sans Arabic',system-ui,sans-serif" };
const CANVAS = '#EAEDEB';
const card   = { background:'#fff', borderRadius:14, border:'1px solid #DCE4E0', boxShadow:'0 1px 3px rgba(15,31,26,.08)' };
const PrimaryBtn = ({onClick,disabled,children,style={}}) => <button onClick={onClick} disabled={disabled} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'none',background:CLINIC_CONFIG.primaryColor,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',opacity:disabled?.4:1,transition:'filter .13s',...style}}>{children}</button>;
const GhostBtn   = ({onClick,children,style={}}) => <button onClick={onClick} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'1px solid #DCE4E0',background:'#F5F8F7',fontSize:13,fontWeight:600,color:'#2A4840',cursor:'pointer',...style}}>{children}</button>;
function StatusChip({status,isAr}) {
  const cfg=STATUS_CFG[status]; if(!cfg) return null;
  const [bg,fg]=cfg.chip;
  return <span style={{fontSize:12,fontWeight:700,padding:'2px 7px',borderRadius:20,background:bg,color:fg,whiteSpace:'nowrap'}}>{isAr?cfg.labelAr:cfg.label}</span>;
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function ReceptionPrototype() {
  const [date,setDate]               = useState(new Date(2026,4,24));
  const [appointments,setAppts]      = useState(SEED_APPOINTMENTS);
  const [patients,setPatients]       = useState(MOCK_PATIENTS);
  const [bookingModal,setBookingModal] = useState(null);
  const [detailModal,setDetailModal] = useState(null);
  const [showSchedules,setShowSched] = useState(false);
  const [showCalendar,setShowCal]    = useState(false);
  const [fileViewer,setFileViewer]   = useState(null);
  const [locale,setLocale]           = useState('en');
  const [dragging,setDragging]       = useState(null);
  const [dragOver,setDragOver]       = useState(null);
  const isAr = locale==='ar';

  const stats = useMemo(()=>({
    total:     appointments.filter(a=>a.status!=='cancelled'&&a.status!=='no-show').length,
    arrived:   appointments.filter(a=>a.status==='arrived').length,
    ongoing:   appointments.filter(a=>a.status==='in-progress').length,
    done:      appointments.filter(a=>a.status==='payment-done').length,
  }),[appointments]);

  const [now, setNow]                     = useState(new Date());
  const [hSearch, setHSearch]             = useState('');
  const [hSearchOpen, setHSearchOpen]     = useState(false);
  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),30000); return ()=>clearInterval(t); },[]);

  // Current-time indicator — pixels from top of grid (09:00 = 0, each 30min = 56px)
  const SLOT_H = 56;
  const nowMin = now.getHours()*60+now.getMinutes();
  const gridStartMin = 9*60, gridEndMin = 18*60;
  const nowInGrid = nowMin>=gridStartMin && nowMin<gridEndMin;
  const nowPx = ((nowMin-gridStartMin)/30)*SLOT_H;

  // Next status map for one-click update
  const STATUS_NEXT = {'booked':'confirmed','confirmed':'arrived','arrived':'in-progress','in-progress':'treatment-done','treatment-done':'payment-done'};
  const cycleStatus = (e,aptId,cur) => { e.stopPropagation(); if(STATUS_NEXT[cur]) updateAppt(aptId,{status:STATUS_NEXT[cur]}); };

  // Header patient search
  const hResults = hSearch.length>1 ? patients.filter(p=>{
    const q=hSearch.toLowerCase();
    return p.nameEn.toLowerCase().includes(q)||p.qid.includes(q)||(p.fileNo&&p.fileNo.includes(q));
  }).slice(0,5) : [];

  const addAppt    = apt  => { setAppts(p=>[...p,{...apt,id:`a${Date.now()}`,status:'booked'}]); setBookingModal(null); };
  const updateAppt = (id,patch) => setAppts(p=>p.map(a=>a.id===id?{...a,...patch}:a));
  const addPatient = p    => { const fp={...p,id:`p${Date.now()}`,fileNo:nextFileNumber(patients),encounterHistory:[]}; setPatients(prev=>[...prev,fp]); return fp; };
  const updatePatient = (id,patch) => { setPatients(p=>p.map(x=>x.id===id?{...x,...patch}:x)); setFileViewer(p=>p&&p.id===id?{...p,...patch}:p); };
  const prevDay = () => setDate(d=>{ const n=new Date(d); n.setDate(d.getDate()-1); return n; });
  const nextDay = () => setDate(d=>{ const n=new Date(d); n.setDate(d.getDate()+1); return n; });

  const handleDragOver = (e,docId,slot) => { if(!dragging) return; e.preventDefault(); setDragOver({docId,slot}); };
  const handleDrop     = (e,docId,slot) => {
    e.preventDefault(); if(!dragging) return;
    if(isSlotBlocked(docId,date,slot)) { setDragging(null); setDragOver(null); return; }
    const ci=dragging.dur/30; const si=TIME_SLOTS.indexOf(slot);
    const conflict=appointments.some(a=>{ if(a.id===dragging.id||a.doctorId!==docId||a.status==='cancelled'||a.status==='no-show') return false; const as=TIME_SLOTS.indexOf(a.start); return si<as+a.dur/30&&si+ci>as; });
    if(!conflict) updateAppt(dragging.id,{doctorId:docId,start:slot});
    setDragging(null); setDragOver(null);
  };

  const NDAYS = DOCTORS.length;
  const cols = `80px repeat(${NDAYS},1fr)`;

  return (
    <div dir={isAr?'rtl':'ltr'} style={{...T,minHeight:'100vh',background:CANVAS,color:'#111814'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;}
        .mono{font-family:'IBM Plex Mono',monospace;font-feature-settings:'tnum';}
        *:focus-visible{outline:2px solid #0C6B5A;outline-offset:2px;border-radius:5px;}
        button{cursor:pointer;font-family:inherit;transition:filter .13s,background .13s;}
        button:not(:disabled):hover{filter:brightness(.93);}
        button:disabled{opacity:.4;cursor:not-allowed;}
        input,select,textarea{font-family:inherit;background:#F2F5F3;border:1.5px solid #C8D4CF;border-radius:8px;color:#111814;padding:8px 12px;font-size:13px;transition:all .13s;width:100%;}
        input:hover,select:hover{border-color:#7A9A90;background:#fff;}
        input:focus,select:focus,textarea:focus{outline:none;background:#fff;border-color:#0C6B5A;box-shadow:0 0 0 3px rgba(12,107,90,.12);}
        input::placeholder{color:#8AA8A0;}
        .grid-cell{position:relative;}
        .grid-cell:hover{background:rgba(12,107,90,.06);cursor:pointer;}
        .grid-cell:hover::after{content:'+';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:18px;font-weight:300;color:rgba(12,107,90,.35);pointer-events:none;}
        .grid-cell-blocked{background-image:repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(0,0,0,.03) 5px,rgba(0,0,0,.03) 6px);cursor:not-allowed;}
        .grid-cell-dragover{background:rgba(12,107,90,.1)!important;outline:2px dashed #0C6B5A;outline-offset:-2px;}
        .appt-btn{cursor:pointer;transition:box-shadow .13s,filter .13s!important;}.appt-btn:active{cursor:grabbing;}
        .appt-btn.dragging{opacity:.35;}
        .appt-btn:hover{box-shadow:0 2px 8px rgba(15,31,26,.14);filter:none!important;}
        .appt-grip{opacity:0;transition:opacity .13s;}
        .appt-btn:hover .appt-grip{opacity:1;}
        .doc-col-header{position:sticky;top:0;z-index:10;background:#F8FAF9;}
        .trow:hover{background:#F5F8F7;}
        .status-chip-btn{cursor:pointer;transition:filter .13s;}
        .status-chip-btn:hover{filter:brightness(.88);}
        @media(prefers-reduced-motion:reduce){*{transition:none!important;}}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{background:CLINIC_CONFIG.headerBg,borderBottom:'1px solid rgba(255,255,255,.07)'}}>
        <div style={{padding:'0 24px',height:54,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {CLINIC_CONFIG.logoUrl?<img src={CLINIC_CONFIG.logoUrl} alt={CLINIC_CONFIG.name} style={{height:34}}/>:<MedlyLogo/>}
            <div>
              <div style={{fontSize:16,fontWeight:800,letterSpacing:'-.5px',color:'#fff',lineHeight:1}}>medly <span style={{color:'#4EB896',fontWeight:500}}>· reception</span></div>
              <div style={{fontSize:12,color:'#8ECFBB',marginTop:3,fontWeight:600}}>{isAr?CLINIC_CONFIG.nameAr:CLINIC_CONFIG.name} · {CLINIC_CONFIG.city}</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={()=>setShowSched(true)} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,.14)',background:'rgba(255,255,255,.07)',fontSize:12.5,fontWeight:600,color:'#B0D0C8'}}>
              <Settings size={13}/>Doctor schedules
            </button>
            <button onClick={()=>setLocale(l=>l==='en'?'ar':'en')} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,.14)',background:'rgba(255,255,255,.07)',fontSize:12.5,fontWeight:600,color:'#B0D0C8'}}>
              <Globe size={13}/>{locale==='en'?'العربية':'English'}
            </button>
            {/* Patient search */}
            <div style={{position:'relative'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.14)',borderRadius:9,padding:'5px 10px',transition:'all .13s',minWidth:hSearchOpen?200:36}}>
                <Search size={14} color="#7AADA0" style={{flexShrink:0,cursor:'pointer'}} onClick={()=>setHSearchOpen(o=>!o)}/>
                {hSearchOpen&&<input autoFocus value={hSearch} onChange={e=>setHSearch(e.target.value)} placeholder="Patient name or QID…" onBlur={()=>{if(!hSearch)setHSearchOpen(false);}} style={{background:'transparent',border:'none',boxShadow:'none',padding:0,fontSize:12.5,color:'#fff',width:'100%'}}/>}
              </div>
              {hResults.length>0&&(
                <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,width:280,background:'#fff',borderRadius:10,border:'1px solid #DCE4E0',boxShadow:'0 8px 24px rgba(15,31,26,.14)',overflow:'hidden',zIndex:200}}>
                  {hResults.map(p=>(
                    <button key={p.id} onClick={()=>{setFileViewer(p);setHSearch('');setHSearchOpen(false);}} style={{width:'100%',textAlign:'left',padding:'10px 14px',background:'transparent',border:'none',borderBottom:'1px solid #F0EDE8',cursor:'pointer',display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:44,height: 44,borderRadius:'50%',background:'#E8F3F0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#0C6B5A',flexShrink:0}}>{p.nameEn.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'#111814'}}>{p.nameEn}</div>
                        <div style={{fontSize:12,color:'#6A8880',fontWeight:600}}>{p.fileNo} · {p.insurer||'Cash'}</div>
                      </div>
                      {p.allergies?.length>0&&<AlertTriangle size={12} color="#DC4F38" style={{marginLeft:'auto',flexShrink:0}}/>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button style={{position:'relative',width:44,height: 44,borderRadius:8,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',color:'#7AADA0'}}>
              <Bell size={15}/>
              <span style={{position:'absolute',top:7,right:7,width:7,height:7,borderRadius:'50%',background:'#DC4F38',border:'1.5px solid '+CLINIC_CONFIG.headerBg}}/>
            </button>
            {/* + Book appointment */}
            <button onClick={()=>setBookingModal({doctorId:DOCTORS[0].id,slot:TIME_SLOTS.find(sl=>!isSlotBlocked(DOCTORS[0].id,date,sl)&&!appointments.some(a=>a.doctorId===DOCTORS[0].id&&a.start===sl))||'09:00'})} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:9,border:'none',background:CLINIC_CONFIG.primaryColor,fontSize:13,fontWeight:700,color:'#fff'}}>
              <Plus size={14}/> Book
            </button>
            <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',padding:'5px 12px 5px 6px',borderRadius:20}}>
              <div style={{width:44,height: 44,borderRadius:'50%',background:CLINIC_CONFIG.primaryColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff'}}>R</div>
              <span style={{fontSize:12,color:'#C0D8D0',fontWeight:500}}>Rania M.</span>
            </div>
          </div>
        </div>

        {/* Stats + date strip */}
        <div style={{padding:'0 24px',borderTop:'1px solid rgba(255,255,255,.06)',height:46,display:'flex',alignItems:'center',gap:20}}>
          {/* Date nav */}
          <div style={{display:'flex',alignItems:'center',gap:6,position:'relative'}}>
            <Calendar size={14} color="#6A9080"/>
            <button onClick={prevDay} style={{width:44,height: 44,borderRadius:6,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',color:'#7AADA0'}}>
              <ChevronLeft size={13}/>
            </button>
            <button onClick={()=>setShowCal(s=>!s)} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:7,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',fontSize:12.5,fontWeight:600,color:'#D0E8E0'}}>
              <CalendarDays size={13}/>{fmt(date)}
            </button>
            <button onClick={nextDay} style={{width:44,height: 44,borderRadius:6,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',color:'#7AADA0'}}>
              <ChevronRight size={13}/>
            </button>
            <button onClick={()=>setDate(new Date(2026,4,24))} style={{padding:'4px 8px',borderRadius:6,fontSize:12,fontWeight:600,color:'#6A9080',background:'transparent',border:'none'}}>Today</button>
            {showCalendar&&<DatePickerPopover value={date} onSelect={d=>{setDate(d);setShowCal(false);}} onClose={()=>setShowCal(false)}/>}
          </div>
          <div style={{width:1,height:16,background:'rgba(255,255,255,.12)'}}/>
          {[['Total',stats.total,'#C0D8D0'],['Arrived',stats.arrived,'#FCD34D'],['Ongoing',stats.ongoing,'#34D399'],['Done',stats.done,'#5EEAD4']].map(([l,v,c])=>(
            <div key={l} style={{display:'flex',alignItems:'baseline',gap:5}}>
              <span style={{fontSize:16,fontWeight:800,letterSpacing:'-1px',color:c}}>{v}</span>
              <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.45)'}}>{l}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ── CALENDAR GRID ── */}
      <main style={{padding:'14px 24px'}}>
        <div style={{...card,overflow:'hidden',maxHeight:'calc(100vh - 168px)',overflowY:'auto'}}>
          {/* Doctor headers — sticky */}
          <div className="doc-col-header" style={{display:'grid',gridTemplateColumns:cols,borderBottom:'1px solid #DCE4E0',boxShadow:'0 1px 0 #DCE4E0'}}>
            <div style={{padding:'10px 14px',fontSize:12,fontWeight:700,color:'#6A8880',borderRight:'1px solid #DCE4E0',textTransform:'uppercase',letterSpacing:'.05em'}}>Time</div>
            {DOCTORS.map(doc=>{
              const dc=DOC_COLORS[doc.color];
              const initials=doc.nameEn.split(' ').filter(w=>w.startsWith('Dr.')?false:true).map(w=>w[0]).slice(0,2).join('');
              return(
                <div key={doc.id} style={{padding:'10px 14px',borderRight:'1px solid #DCE4E0',display:'flex',alignItems:'center',gap:9}}>
                  <div style={{width:44,height: 44,borderRadius:'50%',background:dc.initBg,color:dc.initFg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,flexShrink:0}}>
                    {initials}
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:'#111814',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{doc.nameEn.replace('Dr. ','')}</div>
                    <div style={{fontSize:12,fontWeight:600,color:'#5A7870',marginTop:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{doc.specialty.replace(' Dentistry','').replace(' Medicine','')}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          <div style={{position:'relative'}}>
            {/* Current time indicator */}
            {nowInGrid&&(
              <div style={{position:'absolute',top:nowPx,left:0,right:0,zIndex:5,pointerEvents:'none',display:'flex',alignItems:'center'}}>
                <div style={{width:80,display:'flex',justifyContent:'flex-end',paddingRight:8,flexShrink:0}}>
                  <span style={{fontSize:12,fontWeight:800,letterSpacing:'-.3px',color:'#0C6B5A',background:'#fff',padding:'1px 5px',borderRadius:4,border:'1px solid #0C6B5A'}}>{now.getHours().toString().padStart(2,'0')}:{now.getMinutes().toString().padStart(2,'0')}</span>
                </div>
                <div style={{flex:1,height:2,background:'linear-gradient(90deg,#0C6B5A,rgba(12,107,90,.2))',borderRadius:1}}/>
              </div>
            )}
            {TIME_SLOTS.map((slot,idx)=>(
              <div key={slot} style={{display:'grid',gridTemplateColumns:cols,borderBottom:'1px solid #EEF2F0',minHeight:SLOT_H}}>
                {/* Time label */}
                <div style={{padding:'0 14px',display:'flex',alignItems:'center',fontSize:12,fontWeight:idx%2===0?700:400,letterSpacing:idx%2===0?'-.3px':'normal',color:idx%2===0?'#3D5850':'#B0C4BC',borderRight:'1px solid #DCE4E0',background:'#FAFBFA',flexShrink:0}}>
                  {idx%2===0?slot:''}
                </div>
                {DOCTORS.map(doc=>{
                  const apt=appointments.find(a=>a.doctorId===doc.id&&a.start===slot&&a.status!=='cancelled'&&a.status!=='no-show');
                  if(apt) {
                    const patient=patients.find(p=>p.id===apt.patientId);
                    const cells=apt.dur/30;
                    const dc=DOC_COLORS[doc.color];
                    const isDrag=dragging?.id===apt.id;
                    const nurse=NURSES.find(n=>n.id===apt.nurseId);
                    return(
                      <button key={doc.id+slot}
                        onClick={()=>setDetailModal(apt)}
                        draggable onDragStart={()=>setDragging(apt)} onDragEnd={()=>{setDragging(null);setDragOver(null);}}
                        className={`appt-btn${isDrag?' dragging':''}`}
                        style={{
                          gridRow:`span ${cells}`,minHeight:`${cells*SLOT_H-2}px`,
                          margin:2,padding:'7px 10px',
                          borderRadius:8,border:`1px solid ${dc.left}30`,
                          borderLeft:`3px solid ${dc.left}`,
                          background:dc.bg,
                          textAlign:'left',display:'flex',flexDirection:'column',gap:3,
                          overflow:'hidden',position:'relative',
                        }}>
                        {/* Drag grip */}
                        <div className="appt-grip" style={{position:'absolute',top:4,right:4,display:'flex',gap:1.5,flexDirection:'column'}}>
                          {[0,1,2].map(i=><div key={i} style={{display:'flex',gap:1.5}}>{[0,1].map(j=><div key={j} style={{width:2.5,height:2.5,borderRadius:'50%',background:'rgba(0,0,0,.2)'}}/>)}</div>)}
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:4}}>
                          <div style={{fontSize:12.5,fontWeight:700,color:'#111814',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{patient?.nameEn}</div>
                          {/* Clickable status chip — advances without opening modal */}
                          <button className="status-chip-btn" onClick={e=>cycleStatus(e,apt.id,apt.status)} title={STATUS_NEXT[apt.status]?`→ ${STATUS_CFG[STATUS_NEXT[apt.status]]?.label}`:'Final status'} style={{flexShrink:0,border:'none',padding:0,background:'transparent'}}>
                            <StatusChip status={apt.status} isAr={isAr}/>
                          </button>
                        </div>
                        <div style={{fontSize:12,fontWeight:600,color:'#3D5850',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{apt.procedure}</div>
                        <div style={{display:'flex',alignItems:'center',gap:4,fontSize:12,color:'#6A8880',fontWeight:500}}>
                          <Clock size={10}/>{apt.start} · {apt.dur}m
                          {nurse&&<span style={{marginLeft:'auto',fontSize:12,fontWeight:600,color:'#4E6860'}}>{nurse.name.replace('Nurse ','')}</span>}
                        </div>
                      </button>
                    );
                  }
                  const occupied=appointments.some(a=>{ if(a.doctorId!==doc.id||a.status==='cancelled'||a.status==='no-show') return false; const s=TIME_SLOTS.indexOf(a.start); return TIME_SLOTS.indexOf(slot)>s&&TIME_SLOTS.indexOf(slot)<s+a.dur/30; });
                  if(occupied) return <div key={doc.id+slot} style={{borderRight:'1px solid #EEF2F0'}}/>;
                  const blocked=isSlotBlocked(doc.id,date,slot);
                  if(blocked) {
                    const reason=blockedReason(doc.id,date,slot);
                    return(
                      <div key={doc.id+slot} title={reason||'Unavailable'} className="grid-cell-blocked" style={{borderRight:'1px solid #EEF2F0',display:'flex',alignItems:'center',padding:'0 8px'}}>
                        {reason&&<span style={{fontSize:12,color:'#4E6860',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{reason}</span>}
                      </div>
                    );
                  }
                  const isDO=dragOver?.docId===doc.id&&dragOver?.slot===slot;
                  return(
                    <div key={doc.id+slot}
                      onClick={()=>setBookingModal({doctorId:doc.id,slot})}
                      onDragOver={e=>handleDragOver(e,doc.id,slot)}
                      onDrop={e=>handleDrop(e,doc.id,slot)}
                      className={`grid-cell${isDO?' grid-cell-dragover':''}`}
                      style={{borderRight:'1px solid #EEF2F0'}}/>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend strip — above grid */}
        <div style={{marginBottom:10,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {Object.entries(STATUS_CFG).map(([k,cfg])=>{
              const [bg,fg]=cfg.chip;
              return(
                <span key={k} style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,fontWeight:600,padding:'3px 9px',borderRadius:20,background:bg,color:fg}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:cfg.dot,display:'inline-block',flexShrink:0}}/>
                  {cfg.label}
                </span>
              );
            })}
          </div>
          <span style={{fontSize:12,color:'#4E6860',fontWeight:500}}>Click slot to book · Drag to reschedule · <span style={{fontFamily:"'IBM Plex Mono',monospace"}}>⌘</span> Hashed = unavailable</span>
        </div>
      </main>

      {/* ── MODALS ── */}
      {bookingModal&&<BookingModal isAr={isAr} doctor={DOCTORS.find(d=>d.id===bookingModal.doctorId)} slot={bookingModal.slot} date={date} patients={patients} onClose={()=>setBookingModal(null)} onConfirm={addAppt} onAddPatient={addPatient} onUpdatePatient={updatePatient}/>}
      {detailModal&&<AppointmentDetail isAr={isAr} appointment={detailModal} patient={patients.find(p=>p.id===detailModal.patientId)} onClose={()=>setDetailModal(null)} onUpdate={patch=>{updateAppt(detailModal.id,patch);setDetailModal({...detailModal,...patch});}} onViewFile={p=>{setDetailModal(null);setFileViewer(p);}}/>}
      {showSchedules&&<DoctorScheduleModal onClose={()=>setShowSched(false)}/>}
      {fileViewer&&<PatientFileViewer patient={fileViewer} onUpdate={updatePatient} onClose={()=>setFileViewer(null)}/>}
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ children, onClose, width=600 }) {
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(15,31,26,.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:24}}>
      <div style={{width:'100%',maxWidth:width,maxHeight:'90vh',overflowY:'auto',background:'#fff',borderRadius:16,boxShadow:'0 20px 60px rgba(15,31,26,.25)',position:'relative'}} onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
function ModalHeader({ title, sub, onClose }) {
  return(
    <div style={{padding:'18px 24px',borderBottom:'1px solid #EEF2F0',display:'flex',alignItems:'flex-start',justifyContent:'space-between',position:'sticky',top:0,background:'#fff',zIndex:1}}>
      <div><div style={{fontSize:15,fontWeight:800,color:'#111814',letterSpacing:'-.3px'}}>{title}</div>{sub&&<div style={{fontSize:12,color:'#3D5850',marginTop:2,fontWeight:600}}>{sub}</div>}</div>
      <button onClick={onClose} style={{width:44,height: 44,borderRadius:'50%',background:'#F5F8F7',border:'1px solid #DCE4E0',display:'flex',alignItems:'center',justifyContent:'center',color:'#6A8880',cursor:'pointer'}}><X size={14}/></button>
    </div>
  );
}
function FormField({ label, error, children }) {
  return(
    <div>
      <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#2E4840',marginBottom:5}}>{label}</div>
      {children}
      {error&&<div style={{fontSize:12,color:'#C04030',marginTop:4,fontWeight:600}}>{error}</div>}
    </div>
  );
}
function Grid2({ children }) { return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>{children}</div>; }
function SectionLabel({ children }) { return <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#2E4840',marginBottom:8}}>{children}</div>; }

// ─── Date picker popover ──────────────────────────────────────────────────────
function DatePickerPopover({ value, onSelect, onClose }) {
  const [view, setView] = useState(new Date(value.getFullYear(), value.getMonth(), 1));
  const yr=view.getFullYear(), mo=view.getMonth();
  const daysInMonth=new Date(yr,mo+1,0).getDate();
  const startDay=(new Date(yr,mo,1).getDay()+6)%7;
  const cells=Array.from({length:Math.ceil((startDay+daysInMonth)/7)*7},(_,i)=>{ const d=i-startDay+1; return d>=1&&d<=daysInMonth?new Date(yr,mo,d):null; });
  return(
    <div style={{position:'absolute',top:'calc(100% + 8px)',left:0,zIndex:200,background:'#fff',borderRadius:12,border:'1px solid #DCE4E0',boxShadow:'0 8px 24px rgba(15,31,26,.14)',padding:16,width:260}} onClick={e=>e.stopPropagation()}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <button onClick={()=>setView(new Date(yr,mo-1,1))} style={{background:'none',border:'none',cursor:'pointer',color:'#5A7870',padding:4}}><ChevronLeft size={15}/></button>
        <span style={{fontSize:13,fontWeight:700,color:'#111814'}}>{view.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</span>
        <button onClick={()=>setView(new Date(yr,mo+1,1))} style={{background:'none',border:'none',cursor:'pointer',color:'#5A7870',padding:4}}><ChevronRight size={15}/></button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:6}}>
        {['M','T','W','T','F','S','S'].map((d,i)=><div key={i} style={{fontSize:12,fontWeight:700,textAlign:'center',color:'#4E6860',padding:'2px 0'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const isToday=d.toDateString()===new Date().toDateString();
          const isSel=d.toDateString()===value.toDateString();
          return(
            <button key={i} onClick={()=>onSelect(d)} style={{padding:'6px 2px',borderRadius:7,fontSize:12,fontWeight:isSel||isToday?700:500,background:isSel?CLINIC_CONFIG.primaryColor:isToday?'#E8F3F0':'transparent',color:isSel?'#fff':isToday?CLINIC_CONFIG.primaryColor:'#2A3830',border:'none',cursor:'pointer'}}>{d.getDate()}</button>
          );
        })}
      </div>
      <button onClick={onClose} style={{marginTop:10,width:'100%',padding:'6px',borderRadius:7,border:'1px solid #DCE4E0',background:'#F5F8F7',fontSize:12,fontWeight:600,color:'#5A7870',cursor:'pointer'}}>Close</button>
    </div>
  );
}

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ isAr, doctor, slot, date, patients, onClose, onConfirm, onAddPatient, onUpdatePatient }) {
  const [step, setStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [newPatient, setNewPatient] = useState(null);
  const [procedure, setProcedure] = useState('');
  const [customName, setCustomName] = useState('');
  const [customDur, setCustomDur] = useState(30);
  const [customPrice, setCustomPrice] = useState(0);
  const [nurseId, setNurseId] = useState('');
  const [asstDoctorId, setAsstDoctorId] = useState('');
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState(slot);
  const dc = DOC_COLORS[doctor?.color];
  const procList = PROCEDURES[doctor?.specialty]||[];
  const procObj = procedure==='custom'?{name:customName,dur:customDur,price:customPrice,needsNurse:false}:(procList.find(p=>p.name===procedure)||null);
  const handleConfirm = () => {
    if(!selectedPatient||!procObj) return;
    onConfirm({doctorId:doctor.id,patientId:selectedPatient.id,start:time,dur:procObj.dur,procedure:procObj.name,status:'booked',nurseId:nurseId||null,asstDoctorId:asstDoctorId||null,notes});
  };
  const results = patients.filter(p=>{ if(!searchQ) return true; const q=searchQ.toLowerCase(); return p.nameEn.toLowerCase().includes(q)||p.qid.includes(q)||(p.fileNo&&p.fileNo.includes(q))||p.phone.includes(q); });
  const STEP_LABELS = ['Patient','Procedure','Confirm'];

  return(
    <Modal onClose={onClose} width={680}>
      <ModalHeader title={`New booking — ${doctor?.nameEn}`} sub={`${fmtShort(date)} · ${slot}`} onClose={onClose}/>
      {/* Stepper */}
      <div style={{padding:'14px 24px 0',display:'flex',alignItems:'center',gap:0,borderBottom:'1px solid #EEF2F0'}}>
        {STEP_LABELS.map((lbl,i)=>(
          <React.Fragment key={lbl}>
            <button onClick={()=>i<step-1&&setStep(i+1)} style={{display:'flex',alignItems:'center',gap:7,background:'transparent',border:'none',padding:'8px 0',cursor:i<step-1?'pointer':'default',marginBottom:-1,borderBottom:`2.5px solid ${step===i+1?CLINIC_CONFIG.primaryColor:'transparent'}`}}>
              <div style={{width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,background:step>i+1?CLINIC_CONFIG.primaryColor:step===i+1?CLINIC_CONFIG.primaryColor:'#EEF2F0',color:step>=i+1?'#fff':'#6A8880'}}>
                {step>i+1?<CheckCircle2 size={11}/>:i+1}
              </div>
              <span style={{fontSize:13,fontWeight:step===i+1?700:500,color:step===i+1?'#111814':'#6A8880'}}>{lbl}</span>
            </button>
            {i<2&&<div style={{flex:1,height:1,background:'#EEF2F0',margin:'0 8px'}}/>}
          </React.Fragment>
        ))}
      </div>

      <div style={{padding:'20px 24px'}}>
        {/* Step 1: Patient */}
        {step===1&&(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <FormField label="Search patient">
              <div style={{position:'relative'}}>
                <Search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#4E6860'}}/>
                <input value={searchQ} onChange={e=>{setSearchQ(e.target.value);setNewPatient(null);}} placeholder="Name, QID, file number or phone…" style={{paddingLeft:34}}/>
              </div>
            </FormField>
            {/* Patient results */}
            {results.length>0&&(
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {results.map(p=>(
                  <button key={p.id} onClick={()=>{setSelectedPatient(p);setSearchQ('');setNewPatient(null);}} style={{padding:'11px 14px',borderRadius:10,border:`2px solid ${selectedPatient?.id===p.id?CLINIC_CONFIG.primaryColor:'#DCE4E0'}`,background:selectedPatient?.id===p.id?'#F0FAF6':'#fff',textAlign:'left',cursor:'pointer',transition:'all .13s'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div>
                        <div style={{fontSize:13.5,fontWeight:700,color:'#111814'}}>{p.nameEn}</div>
                        <div style={{fontSize:12,color:'#5A7870',fontFamily:"'IBM Plex Mono',monospace",marginTop:2,fontWeight:600}}>{p.fileNo} · {p.qid}</div>
                        <div style={{fontSize:12,color:'#5A7870',marginTop:1,fontWeight:600}}>{p.phone} · {p.insurer}</div>
                      </div>
                      {p.allergies.length>0&&<div style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:8,background:'#FEF4F2',border:'1px solid #FECACA'}}>
                        <AlertTriangle size={11} color="#DC4F38"/>
                        <span style={{fontSize:12,fontWeight:700,color:'#B02A1E'}}>{p.allergies.join(', ')}</span>
                      </div>}
                    </div>
                    {p.notes&&<div style={{fontSize:12,color:'#4E6860',marginTop:5,fontStyle:'italic',fontWeight:600}}>{p.notes}</div>}
                  </button>
                ))}
              </div>
            )}
            {searchQ&&results.length===0&&(
              <div style={{padding:'14px',borderRadius:10,border:'1px solid #DCE4E0',background:'#F5F8F7',textAlign:'center',fontSize:13,color:'#5A7870',fontWeight:600}}>
                No patient found — <button onClick={()=>setNewPatient({nameEn:'',nameAr:'',qid:'',phone:'',dob:'',insurer:'',policy:''})} style={{color:CLINIC_CONFIG.primaryColor,fontWeight:700,background:'none',border:'none',cursor:'pointer'}}>register new patient</button>
              </div>
            )}
            {newPatient&&<NewPatientForm form={newPatient} setForm={setNewPatient} onSave={p=>{const np=onAddPatient(p);setSelectedPatient(np);setNewPatient(null);}} onCancel={()=>setNewPatient(null)}/>}
            {selectedPatient&&!newPatient&&(
              <div style={{padding:'12px 14px',borderRadius:10,background:'#F0FAF6',border:'1px solid #B8DDD6',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:13,fontWeight:700,color:'#0A6040',display:'flex',alignItems:'center',gap:6}}><CheckCircle2 size={14}/>Selected: {selectedPatient.nameEn}</span>
                <button onClick={()=>setSelectedPatient(null)} style={{background:'none',border:'none',color:'#4E6860',cursor:'pointer'}}><X size={14}/></button>
              </div>
            )}
            <div style={{display:'flex',justifyContent:'flex-end',paddingTop:4}}>
              <PrimaryBtn onClick={()=>setStep(2)} disabled={!selectedPatient}>Next: Procedure →</PrimaryBtn>
            </div>
          </div>
        )}

        {/* Step 2: Procedure */}
        {step===2&&(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <FormField label="Procedure">
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {procList.map(p=>(
                  <button key={p.name} onClick={()=>{setProcedure(p.name);setTime(slot);}} style={{padding:'10px 14px',borderRadius:9,border:`2px solid ${procedure===p.name?CLINIC_CONFIG.primaryColor:'#DCE4E0'}`,background:procedure===p.name?'#F0FAF6':'#fff',textAlign:'left',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',transition:'all .13s'}}>
                    <div><span style={{fontSize:13,fontWeight:700,color:'#111814'}}>{p.name}</span><span style={{marginLeft:10,fontSize:12,color:'#5A7870',fontWeight:600}}>{p.dur}min</span></div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:13,fontWeight:700,color:CLINIC_CONFIG.primaryColor}}>QAR {p.price.toLocaleString()}</span>
                      {p.needsNurse&&<span style={{fontSize:12,fontWeight:700,padding:'2px 7px',borderRadius:20,background:'#EDE9FE',color:'#4C1D95'}}>+ nurse</span>}
                    </div>
                  </button>
                ))}
                <button onClick={()=>setProcedure('custom')} style={{padding:'10px 14px',borderRadius:9,border:`2px dashed ${procedure==='custom'?CLINIC_CONFIG.primaryColor:'#C8D4CF'}`,background:procedure==='custom'?'#F0FAF6':'transparent',textAlign:'left',cursor:'pointer',fontSize:13,fontWeight:600,color:procedure==='custom'?CLINIC_CONFIG.primaryColor:'#5A7870',display:'flex',alignItems:'center',gap:6}}>
                  <Plus size={14}/> Custom procedure
                </button>
              </div>
            </FormField>
            {procedure==='custom'&&(
              <div style={{padding:'14px',background:'#F5F8F7',borderRadius:10,border:'1px solid #DCE4E0',display:'flex',flexDirection:'column',gap:10}}>
                <Grid2>
                  <FormField label="Procedure name"><input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="e.g. Special bleaching"/></FormField>
                  <FormField label="Duration (min)"><input type="number" value={customDur} onChange={e=>setCustomDur(parseInt(e.target.value)||30)} style={{fontFamily:"'IBM Plex Mono',monospace"}}/></FormField>
                  <FormField label="Price (QAR)"><input type="number" value={customPrice} onChange={e=>setCustomPrice(parseInt(e.target.value)||0)} style={{fontFamily:"'IBM Plex Mono',monospace"}}/></FormField>
                </Grid2>
              </div>
            )}
            {procedure&&procedure!=='custom'&&(
              <Grid2>
                <FormField label="Start time"><input value={time} onChange={e=>setTime(e.target.value)} type="time" style={{fontFamily:"'IBM Plex Mono',monospace"}}/></FormField>
                <FormField label="Nurse (optional)">
                  <select value={nurseId} onChange={e=>setNurseId(e.target.value)}>
                    <option value="">— No nurse —</option>
                    {NURSES.map(n=><option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Assistant doctor (optional)">
                  <select value={asstDoctorId} onChange={e=>setAsstDoctorId(e.target.value)}>
                    <option value="">— None —</option>
                    {DOCTORS.filter(d=>d.id!==doctor?.id).map(d=><option key={d.id} value={d.id}>{d.nameEn}</option>)}
                  </select>
                </FormField>
              </Grid2>
            )}
            <FormField label="Appointment notes (optional)">
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Any instructions for the doctor or reception…" style={{resize:'none'}}/>
            </FormField>
            <div style={{display:'flex',justifyContent:'space-between',paddingTop:4}}>
              <GhostBtn onClick={()=>setStep(1)}><ChevronLeft size={13}/>Back</GhostBtn>
              <PrimaryBtn onClick={()=>setStep(3)} disabled={!procedure||(procedure==='custom'&&!customName)}>Review booking →</PrimaryBtn>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step===3&&selectedPatient&&procObj&&(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{padding:'14px 18px',background:'#F5F8F7',borderRadius:12,border:'1px solid #DCE4E0',display:'flex',flexDirection:'column',gap:8}}>
              <SectionLabel>Booking summary</SectionLabel>
              {[
                ['Doctor',   doctor?.nameEn],
                ['Patient',  `${selectedPatient.nameEn} — ${selectedPatient.fileNo}`],
                ['Date/time',`${fmtShort(date)} at ${time}`],
                ['Procedure',`${procObj.name} · ${procObj.dur}min`],
                ['Price',    `QAR ${procObj.price.toLocaleString()}`],
                nurseId&&['Nurse', NURSES.find(n=>n.id===nurseId)?.name||''],
                asstDoctorId&&['Assistant', DOCTORS.find(d=>d.id===asstDoctorId)?.nameEn||''],
                notes&&['Notes', notes],
              ].filter(Boolean).map(([l,v])=>(
                <div key={l} style={{display:'flex',gap:16}}>
                  <span style={{fontSize:12.5,fontWeight:700,color:'#5A7870',width:90,flexShrink:0}}>{l}</span>
                  <span style={{fontSize:12.5,fontWeight:600,color:'#111814'}}>{v}</span>
                </div>
              ))}
            </div>
            {selectedPatient.allergies.length>0&&(
              <div style={{padding:'10px 14px',background:'#FEF4F2',border:'1px solid #FECACA',borderRadius:9,display:'flex',alignItems:'flex-start',gap:8}}>
                <AlertTriangle size={14} color="#DC4F38" style={{flexShrink:0,marginTop:1}}/>
                <div>
                  <div style={{fontSize:12.5,fontWeight:700,color:'#B02A1E'}}>Allergy alert</div>
                  <div style={{fontSize:12,fontWeight:600,color:'#B02A1E',marginTop:2}}>{selectedPatient.allergies.join(' · ')}</div>
                </div>
              </div>
            )}
            {selectedPatient.notes&&(
              <div style={{padding:'10px 14px',background:'#FEF9EC',border:'1px solid #FDE68A',borderRadius:9,fontSize:12.5,fontWeight:600,color:'#78400A'}}>
                Note: {selectedPatient.notes}
              </div>
            )}
            <div style={{display:'flex',justifyContent:'space-between',paddingTop:4}}>
              <GhostBtn onClick={()=>setStep(2)}><ChevronLeft size={13}/>Back</GhostBtn>
              <PrimaryBtn onClick={handleConfirm}><CheckCircle2 size={14}/>Confirm booking</PrimaryBtn>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── New Patient Form ─────────────────────────────────────────────────────────
function NewPatientForm({ form, setForm, onSave, onCancel }) {
  const qidOk    = validateQID(form.qid||'');
  const phoneOk  = validateQatarPhone(form.phone||'');
  const canSave  = form.nameEn&&qidOk&&phoneOk&&form.dob;
  return(
    <div style={{padding:'16px',background:'#F5F8F7',borderRadius:12,border:'1px solid #DCE4E0',display:'flex',flexDirection:'column',gap:12}}>
      <SectionLabel>New patient registration</SectionLabel>
      <Grid2>
        <FormField label="Full name (English)" error={!form.nameEn&&'Required'}><input value={form.nameEn} onChange={e=>setForm({...form,nameEn:e.target.value})} placeholder="First Last"/></FormField>
        <FormField label="Full name (Arabic)"><input value={form.nameAr} onChange={e=>setForm({...form,nameAr:e.target.value})} placeholder="الاسم بالعربي" dir="rtl"/></FormField>
        <FormField label="Qatar ID (11 digits)" error={form.qid&&!qidOk?'Must be 11 digits':undefined}><input value={form.qid} onChange={e=>setForm({...form,qid:e.target.value})} placeholder="28XXXXXXXXX" className="mono"/></FormField>
        <FormField label="Mobile" error={form.phone&&!phoneOk?'Format: +974 XXXX XXXX':undefined}><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+974 5XXX XXXX"/></FormField>
        <FormField label="Date of birth"><input type="date" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})}/></FormField>
        <FormField label="Insurer">
          <select value={form.insurer||''} onChange={e=>setForm({...form,insurer:e.target.value})}>
            <option value="">None / Cash</option>
            {['QLM','AXA','Daman','Allianz','MedNet','Other'].map(i=><option key={i}>{i}</option>)}
          </select>
        </FormField>
        {form.insurer&&<FormField label="Policy number"><input value={form.policy||''} onChange={e=>setForm({...form,policy:e.target.value})} placeholder="Policy #"/></FormField>}
      </Grid2>
      <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
        <GhostBtn onClick={onCancel} style={{padding:'7px 14px',fontSize:12}}>Cancel</GhostBtn>
        <PrimaryBtn onClick={()=>onSave(form)} disabled={!canSave} style={{padding:'7px 14px',fontSize:12}}><Save size={12}/>Register patient</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Appointment Detail ───────────────────────────────────────────────────────
function AppointmentDetail({ isAr, appointment, patient, onClose, onUpdate, onViewFile }) {
  const [status, setStatus] = useState(appointment.status);
  const [notes,  setNotes]  = useState(appointment.notes||'');
  const doc = DOCTORS.find(d=>d.id===appointment.doctorId);
  const nurse = NURSES.find(n=>n.id===appointment.nurseId);
  const dc = DOC_COLORS[doc?.color];
  const STATUSES = Object.entries(STATUS_CFG);
  return(
    <Modal onClose={onClose} width={520}>
      <ModalHeader title={appointment.procedure} sub={`${doc?.nameEn} · ${appointment.start} · ${appointment.dur}min`} onClose={onClose}/>
      <div style={{padding:'18px 24px',display:'flex',flexDirection:'column',gap:14}}>
        {/* Patient strip */}
        <div style={{padding:'12px 14px',background:'#F5F8F7',borderRadius:10,border:'1px solid #DCE4E0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:13.5,fontWeight:700,color:'#111814'}}>{patient?.nameEn}</div>
            <div style={{fontSize:12,color:'#5A7870',marginTop:2,fontWeight:600,fontFamily:"'IBM Plex Mono',monospace"}}>{patient?.fileNo} · {patient?.qid}</div>
            {patient?.allergies?.length>0&&<div style={{display:'flex',alignItems:'center',gap:5,marginTop:4,fontSize:12,fontWeight:700,color:'#B02A1E'}}><AlertTriangle size={11}/>Allergies: {patient.allergies.join(', ')}</div>}
          </div>
          <button onClick={()=>patient&&onViewFile(patient)} style={{fontSize:12,fontWeight:600,color:CLINIC_CONFIG.primaryColor,background:'#F0FAF6',border:'1px solid #B8DDD6',padding:'5px 10px',borderRadius:7,display:'flex',alignItems:'center',gap:4,cursor:'pointer'}}>
            <FileText size={12}/>View file
          </button>
        </div>

        {/* Status */}
        <div>
          <SectionLabel>Update status</SectionLabel>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
            {STATUSES.map(([k,s])=>{
              const [bg,fg]=s.chip;
              return(
                <button key={k} onClick={()=>setStatus(k)} style={{padding:'7px 6px',borderRadius:8,border:`2px solid ${status===k?CLINIC_CONFIG.primaryColor:'#DCE4E0'}`,background:status===k?'#F0FAF6':bg,cursor:'pointer',fontSize:12,fontWeight:700,color:status===k?CLINIC_CONFIG.primaryColor:fg,transition:'all .13s'}}>
                  {isAr?s.labelAr:s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Care team */}
        {(nurse||appointment.asstDoctorId)&&(
          <div style={{padding:'10px 12px',background:'#F5F8F7',borderRadius:8,border:'1px solid #DCE4E0'}}>
            <SectionLabel>Care team</SectionLabel>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {doc&&<div style={{fontSize:12.5,fontWeight:600,color:'#3D5850',display:'flex',alignItems:'center',gap:5}}><div style={{width:8,height:8,borderRadius:'50%',background:dc?.left}}/>{doc.nameEn}</div>}
              {appointment.asstDoctorId&&<div style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>{DOCTORS.find(d=>d.id===appointment.asstDoctorId)?.nameEn} (asst.)</div>}
              {nurse&&<div style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>{nurse.name}</div>}
            </div>
          </div>
        )}

        {/* Notes */}
        <FormField label="Appointment notes">
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} style={{resize:'none'}}/>
        </FormField>

        {patient?.notes&&<div style={{padding:'9px 12px',background:'#FEF9EC',border:'1px solid #FDE68A',borderRadius:8,fontSize:12.5,fontWeight:600,color:'#78400A'}}>Patient note: {patient.notes}</div>}

        <div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:4}}>
          <GhostBtn onClick={onClose}>Discard</GhostBtn>
          <PrimaryBtn onClick={()=>{ onUpdate({status,notes}); onClose(); }}><Save size={13}/>Save changes</PrimaryBtn>
        </div>
      </div>
    </Modal>
  );
}

// ─── Patient File Viewer ──────────────────────────────────────────────────────
function PatientFileViewer({ patient, onUpdate, onClose }) {
  const [notes, setNotes] = useState(patient.notes||'');
  const [saved, setSaved] = useState(false);
  const saveNotes = () => { onUpdate(patient.id,{notes}); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  return(
    <Modal onClose={onClose} width={700}>
      <ModalHeader title={patient.nameEn} sub={`${patient.fileNo} · QID ${patient.qid}`} onClose={onClose}/>
      <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:16}}>
        {/* Identity */}
        <div>
          <SectionLabel>Patient details</SectionLabel>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[['Arabic name',patient.nameAr],['Date of birth',patient.dob],['Phone',patient.phone],['Insurance',patient.insurer+(patient.policy?` / ${patient.policy}`:'')],['Last visit',patient.lastVisit||'—'],['File number',patient.fileNo]].map(([l,v])=>(
              <div key={l} style={{padding:'8px 12px',background:'#F5F8F7',borderRadius:8,border:'1px solid #DCE4E0'}}>
                <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#6A8880',marginBottom:3}}>{l}</div>
                <div style={{fontSize:13,fontWeight:600,color:'#111814',fontFamily:l==='File number'||l==='Date of birth'?"'IBM Plex Mono',monospace":'inherit'}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {patient.allergies.length>0&&(
          <div style={{padding:'12px 14px',background:'#FEF4F2',border:'1px solid #FECACA',borderRadius:10,display:'flex',gap:10}}>
            <AlertTriangle size={16} color="#DC4F38" style={{flexShrink:0,marginTop:1}}/>
            <div><div style={{fontSize:12.5,fontWeight:700,color:'#B02A1E',marginBottom:3}}>Allergies</div>{patient.allergies.map(a=><div key={a} style={{fontSize:12.5,fontWeight:600,color:'#B02A1E',marginBottom:1}}>· {a}</div>)}</div>
          </div>
        )}
        {patient.conditions?.length>0&&(
          <div><SectionLabel>Medical conditions</SectionLabel>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {patient.conditions.map(c=><span key={c} style={{padding:'4px 10px',borderRadius:8,border:'1px solid #DCE4E0',background:'#F5F8F7',fontSize:12.5,fontWeight:600,color:'#3D5850'}}>{c}</span>)}
            </div>
          </div>
        )}

        {/* Encounter history */}
        {patient.encounterHistory?.length>0&&(
          <div>
            <SectionLabel>Encounter history</SectionLabel>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {patient.encounterHistory.map((e,i)=>(
                <div key={i} className="trow" style={{padding:'10px 14px',borderRadius:8,border:'1px solid #EEF2F0',background:'#fff',display:'flex',gap:14,alignItems:'flex-start'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#5A7870',width:80,flexShrink:0}}>{e.date}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12.5,fontWeight:600,color:'#111814'}}>{e.procedure}</div>
                    <div style={{fontSize:12,color:'#5A7870',marginTop:1,fontWeight:600}}>{e.doctor}</div>
                    {e.notes&&<div style={{fontSize:12,color:'#4E6860',marginTop:2,fontStyle:'italic',fontWeight:600}}>{e.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reception notes */}
        <div>
          <SectionLabel>Reception notes</SectionLabel>
          <textarea value={notes} onChange={e=>{setNotes(e.target.value);setSaved(false);}} rows={3} style={{resize:'none'}}/>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:8}}>
            <PrimaryBtn onClick={saveNotes} disabled={notes===patient.notes&&!saved} style={{padding:'7px 14px',fontSize:12,background:saved?'#0A6040':undefined}}>
              {saved?<><CheckCircle2 size={12}/>Saved</>:<><Save size={12}/>Save notes</>}
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Doctor Schedule Modal ────────────────────────────────────────────────────
function DoctorScheduleModal({ onClose }) {
  return(
    <Modal onClose={onClose} width={640}>
      <ModalHeader title="Doctor schedules" sub="Working hours, breaks, off-days, vacations" onClose={onClose}/>
      <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:12}}>
        {DOCTORS.map(doc=>{
          const s=DOCTOR_SCHEDULES[doc.id];
          const dc=DOC_COLORS[doc.color];
          return(
            <div key={doc.id} style={{padding:'12px 16px',borderRadius:10,border:'1px solid #DCE4E0',background:'#fff',borderLeft:`3px solid ${dc.left}`}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{width:44,height: 44,borderRadius:'50%',background:dc.initBg,color:dc.initFg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,flexShrink:0}}>
                  {doc.nameEn.split(' ').filter(w=>!w.startsWith('Dr.')).map(w=>w[0]).slice(0,2).join('')}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:'#111814'}}>{doc.nameEn}</div>
                  <div style={{fontSize:12,fontWeight:600,color:'#5A7870'}}>{doc.specialty}</div>
                </div>
              </div>
              <div style={{display:'flex',gap:16,flexWrap:'wrap',fontSize:12.5,fontWeight:600,color:'#3D5850'}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace"}}>{s.workStart}–{s.workEnd}</span>
                {s.offDays.length>0&&<span style={{color:'#C05820'}}>Off: {s.offDays.join(', ')}</span>}
                {s.breaks.length>0&&<span>Break: {s.breaks.map(b=>`${b.start}–${b.end} ${b.label}`).join(', ')}</span>}
                {s.vacations.length>0&&s.vacations.map(v=><span key={v.start} style={{color:'#8B5CF6'}}>Vacation: {v.start} to {v.end} ({v.reason})</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
