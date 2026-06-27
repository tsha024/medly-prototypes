import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, Shield, CreditCard, Banknote, Smartphone, Receipt,
  CheckCircle2, AlertCircle, FileText, Send, X, Plus, Calendar,
  Printer, Download, Mail, MessageSquare, Building2, ArrowRight,
  Edit3, Percent, Tag, RotateCcw, Search, ChevronDown, User
} from 'lucide-react';

const CLINIC_CONFIG = {
  name: 'Yasmeen Clinic', nameAr: 'عيادة الياسمين', city: 'Doha, Qatar',
  logoUrl: null, primaryColor: '#0C6B5A', headerBg: '#0f1f1a',
};
function MedlyLogo({ size = 34 }) {
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

import { useCharges, chargesForQid } from './chargeStore';

// Map a doctor-posted charge to a checkout line item. Insurance charges keep the
// insurer split (coveragePct = 100 − copay%); cash charges bake the discount into
// the price the patient pays.
function chargeToItem(ch) {
  const dental = !/aesthetic/i.test(ch.specialty || '');
  const base = { id:'dc-'+ch.id, fromDoctor:true, code:ch.code||'—', specialty:dental?'dental':'aesthetic', doctor:ch.postedBy||'Doctor' };
  if (ch.payMode === 'insurance') {
    return { ...base, label:ch.treatment, price:ch.insurancePrice, insurable:true, coveragePct:Math.max(0,100-(ch.copayPct||0)), authNumber:null };
  }
  return { ...base, label:ch.treatment + (ch.discount ? ` (−${ch.discount}% cash)` : ''), price:ch.patientPays, insurable:false, coveragePct:0 };
}
function normLabel(s) { return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,''); }
function recomputeEnc(items, paid) {
  const total = items.reduce((s,i)=>s+i.price,0);
  const insured = items.filter(i=>i.insurable).reduce((s,i)=>s+Math.round(i.price*i.coveragePct/100),0);
  const patientDue = total - insured;
  return { totalAmount:total, patientDue, balance:patientDue-(paid||0) };
}

const PATIENT = {
  id:'p1', fileNo:'YC-2024-0142', qid:'28934567812',
  nameEn:'Aisha Al-Kuwari', nameAr:'عائشة الكواري',
  phone:'+974 5512 4488', email:'aisha.alk@example.qa',
  insurer:'QLM', policy:'QLM-447821',
};

const ALL_ENCOUNTERS = [
  { id:'enc1', date:'2026-05-24', status:'payment_required', doctors:['Dr. Layla Al-Mahmoud','Dr. Reem Al-Thani'],
    items:[
      { id:'i1', code:'D2391', label:'Composite filling — tooth #16', specialty:'dental', doctor:'Dr. Layla Al-Mahmoud', price:600, insurable:true, coveragePct:80, authNumber:'QLM-PA-118822' },
      { id:'i2', code:'D0274', label:'Bitewing X-rays (4 films)', specialty:'dental', doctor:'Dr. Layla Al-Mahmoud', price:220, insurable:true, coveragePct:80, authNumber:'QLM-PA-118822' },
      { id:'i3', code:'M0023', label:'Botox 20U — glabellar', specialty:'aesthetic', doctor:'Dr. Reem Al-Thani', price:1800, insurable:false, coveragePct:0 },
    ], totalAmount:2620, patientDue:1820, paid:0, balance:1820, payments:[] },
  { id:'enc2', date:'2026-04-10', status:'partial_payment', doctors:['Dr. Yusuf Hassan'],
    items:[{ id:'j1', code:'D6010', label:'Implant consultation + X-ray', specialty:'dental', doctor:'Dr. Yusuf Hassan', price:1200, insurable:true, coveragePct:80 }],
    totalAmount:1200, patientDue:240, paid:120, balance:120,
    payments:[{ id:'pay1', method:'card', amount:120, ref:'TX441829', date:'2026-04-10', type:'downpayment' }] },
  { id:'enc3', date:'2026-03-01', status:'paid', doctors:['Dr. Reem Al-Thani'],
    items:[{ id:'k1', code:'M0055', label:'Dermal filler — tear trough', specialty:'aesthetic', doctor:'Dr. Reem Al-Thani', price:2400, insurable:false, coveragePct:0 }],
    totalAmount:2400, patientDue:2400, paid:2400, balance:0,
    payments:[{ id:'pay2', method:'apple', amount:1200, ref:'TX338812', date:'2026-03-01', type:'payment' },{ id:'pay3', method:'card', amount:1200, ref:'TX338813', date:'2026-03-01', type:'payment' }] },
  { id:'enc4', date:'2026-02-14', status:'paid', doctors:['Dr. Layla Al-Mahmoud'],
    items:[{ id:'l1', code:'D1110', label:'Cleaning & polish', specialty:'dental', doctor:'Dr. Layla Al-Mahmoud', price:400, insurable:true, coveragePct:80 }],
    totalAmount:400, patientDue:80, paid:80, balance:0,
    payments:[{ id:'pay4', method:'cash', amount:80, ref:'TX223614', date:'2026-02-14', type:'payment' }] },
  { id:'enc5', date:'2025-12-10', status:'no_charge', doctors:['Dr. Reem Al-Thani'],
    items:[{ id:'m1', code:'M0001', label:'Aesthetic consultation', specialty:'aesthetic', doctor:'Dr. Reem Al-Thani', price:0, insurable:false, coveragePct:0 }],
    totalAmount:0, patientDue:0, paid:0, balance:0, payments:[] },
];

const PAYMENT_METHODS = [
  { id:'card',  label:'Card (Visa/Mada)', icon:CreditCard },
  { id:'cash',  label:'Cash (QAR)',        icon:Banknote  },
  { id:'apple', label:'Apple Pay',         icon:Smartphone},
  { id:'naps',  label:'NAPS transfer',     icon:Building2 },
];

const STATUS_CFG = {
  payment_required:{ label:'Payment required', dot:'#F59E0B', chip:['#FEF3DC','#92600A'] },
  partial_payment: { label:'Balance remaining', dot:'#F97316', chip:['#FEF0E8','#A04020'] },
  paid:            { label:'Paid',              dot:'#0C6B5A', chip:['#D4F1E4','#0A6040'] },
  no_charge:       { label:'No charge',         dot:'#9CA3AF', chip:['#EEF2F0','#4A6860'] },
};

const qar = n => `QAR ${Number(n).toLocaleString()}`;
const methodLabel = id => PAYMENT_METHODS.find(m=>m.id===id)?.label ?? id;

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
const T = { fontFamily:"'Manrope','Noto Sans Arabic',system-ui,sans-serif" };
const CANVAS = '#EAEDEB';
const card = { background:'#fff', borderRadius:14, border:'1px solid #DCE4E0', boxShadow:'0 1px 3px rgba(15,31,26,.08)' };
const cardHd = { padding:'14px 20px 12px', borderBottom:'1px solid #EEF2F0', display:'flex', alignItems:'flex-start', justifyContent:'space-between' };
const cardBd = { padding:'16px 20px' };

function Chip({ label, color }) {
  const [bg,fg] = STATUS_CFG[color]?.chip || ['#EEF2F0','#4A6860'];
  return <span style={{ fontSize:12, fontWeight:700, padding:'3px 9px', borderRadius:20, background:bg, color:fg }}>{label}</span>;
}
function MethodBadge({ method }) {
  const MAP = { card:['#EFF6FF','#1D4ED8'], cash:['#ECFDF5','#065F46'], apple:['#F8FAFC','#334155'], naps:['#F5F3FF','#5B21B6'], Insurance:['#FFFBEB','#92400E'] };
  const [bg,fg] = MAP[method] || ['#EEF2F0','#4A6860'];
  return <span style={{ fontSize:12, fontWeight:600, padding:'2px 8px', borderRadius:20, background:bg, color:fg }}>{methodLabel(method)}</span>;
}
function PrimaryBtn({ onClick, disabled, children, style={} }) {
  return <button onClick={onClick} disabled={disabled} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:9, border:'none', background:CLINIC_CONFIG.primaryColor, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity:disabled?.4:1, transition:'filter .13s', ...style }}>{children}</button>;
}
function GhostBtn({ onClick, children, style={} }) {
  return <button onClick={onClick} style={{ padding:'9px 18px', borderRadius:9, border:'1px solid #DCE4E0', background:'#F5F8F7', fontSize:13, fontWeight:600, color:'#2A4840', cursor:'pointer', ...style }}>{children}</button>;
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function CheckoutPrototype() {
  const [activeTab,     setActiveTab]     = useState('checkout');
  const [selectedEncId, setSelectedEncId] = useState('enc1');
  const [step,          setStep]          = useState(1);
  const [encounters,    setEncounters]    = useState(ALL_ENCOUNTERS);
  const [paymentType,   setPaymentType]   = useState('full');
  const [itemOverrides, setItemOverrides] = useState({});
  const [discounts,     setDiscounts]     = useState({});
  const [splitsByEnc,   setSplitsByEnc]   = useState({});

  const charges = useCharges();
  useEffect(() => {
    const live = chargesForQid(PATIENT.qid).map(chargeToItem);
    const liveKeys = new Set(live.map(i => normLabel(i.label)));
    const seed = ALL_ENCOUNTERS.find(x => x.id === 'enc1').items;
    setEncounters(prev => prev.map(e => {
      if (e.id !== 'enc1') return e;
      const baseItems = seed.filter(i => !liveKeys.has(normLabel(i.label)));
      const items = [...baseItems, ...live];
      return { ...e, items, ...recomputeEnc(items, e.paid) };
    }));
  }, [charges]);

  const encounter = encounters.find(e=>e.id===selectedEncId);
  const items = useMemo(()=>{ if(!encounter) return []; const ov=itemOverrides[selectedEncId]||{}; return encounter.items.map(i=>({ ...i, covered: ov[i.id]!==undefined?ov[i.id]:i.insurable })); },[encounter,itemOverrides,selectedEncId]);
  const discount = discounts[selectedEncId]||{pct:0,reason:''};
  const setDiscount = d => setDiscounts(p=>({...p,[selectedEncId]:d}));
  const splits = splitsByEnc[selectedEncId]||[];
  const setSplits = fn => setSplitsByEnc(p=>({...p,[selectedEncId]:typeof fn==='function'?fn(p[selectedEncId]||[]):fn}));
  const subtotal = items.reduce((s,i)=>s+i.price,0);
  const insuredPortion = items.filter(i=>i.covered).reduce((s,i)=>s+(i.price*i.coveragePct/100),0);
  const patientPortion = subtotal-insuredPortion;
  const discountAmount = patientPortion*(discount.pct/100);
  const totalDueToday  = patientPortion-discountAmount;
  const alreadyPaid    = encounter?.paid||0;
  const balance        = Math.max(0,totalDueToday-alreadyPaid);
  const paidSoFar      = splits.reduce((s,p)=>s+p.amount,0);
  const remaining      = Math.max(0,balance-paidSoFar);
  const toggleCoverage = itemId => setItemOverrides(p=>{ const e=p[selectedEncId]||{}; const cur=e[itemId]!==undefined?e[itemId]:items.find(i=>i.id===itemId)?.insurable; return {...p,[selectedEncId]:{...e,[itemId]:!cur}}; });
  const addSplit = (amount,methodId,ref) => setSplits(p=>[...p,{methodId,amount,ref:ref||`TX${Date.now().toString().slice(-6)}`}]);
  const markPaid = () => { const tot=paidSoFar; setEncounters(p=>p.map(e=>e.id===selectedEncId?{...e,paid:(e.paid||0)+tot,balance:Math.max(0,e.balance-tot),status:Math.max(0,e.balance-tot)<=0?'paid':'partial_payment',payments:[...e.payments,...splits.map(s=>({...s,date:'2026-05-24',type:paymentType}))]}:e)); setStep(3); };
  const pending = encounters.filter(e=>e.status==='payment_required'||e.status==='partial_payment');

  return (
    <div style={{...T, minHeight:'100vh', background:CANVAS, color:'#111814'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;}
        .mono{font-family:'IBM Plex Mono',monospace;font-feature-settings:'tnum';}
        *:focus-visible{outline:2px solid #0C6B5A;outline-offset:2px;border-radius:5px;}
        button{cursor:pointer;font-family:inherit;transition:filter .13s,opacity .13s;}
        button:not(:disabled):hover{filter:brightness(.93);}
        button:disabled{opacity:.4;cursor:not-allowed;}
        input,select,textarea{font-family:inherit;background:#F2F5F3;border:1.5px solid #C8D4CF;border-radius:8px;color:#111814;padding:8px 12px;font-size:13px;transition:all .13s;width:100%;}
        input:hover,select:hover{border-color:#7A9A90;background:#fff;}
        input:focus,select:focus,textarea:focus{outline:none;background:#fff;border-color:#0C6B5A;box-shadow:0 0 0 3px rgba(12,107,90,.12);}
        input::placeholder{color:#8AA8A0;}
        .enc-item:hover{background:#F5F8F7;}
        .trow:hover{background:#F0F5F3;}
        @media(prefers-reduced-motion:reduce){*{transition:none!important;}}
      `}</style>

      {/* Header */}
      <header style={{background:CLINIC_CONFIG.headerBg, borderBottom:'1px solid rgba(255,255,255,.07)'}}>
        <div style={{padding:'0 24px', height:54, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <button style={{width:44,height: 44,borderRadius:8,background:'rgba(255,255,255,.08)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',color:'#7AADA0'}}>
              <ChevronLeft size={16}/>
            </button>
            {CLINIC_CONFIG.logoUrl ? <img src={CLINIC_CONFIG.logoUrl} alt={CLINIC_CONFIG.name} style={{height:34}}/> : <MedlyLogo/>}
            <div>
              <div style={{fontSize:16,fontWeight:800,letterSpacing:'-.5px',color:'#fff',lineHeight:1}}>medly <span style={{color:'#4EB896',fontWeight:500}}>· checkout</span></div>
              <div style={{fontSize:12,color:'#8ECFBB',marginTop:3,fontWeight:600}}>{CLINIC_CONFIG.name} · {CLINIC_CONFIG.city}</div>
            </div>
          </div>
          {/* Stepper */}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {['Review','Payment','Complete'].map((lbl,i)=>(
              <React.Fragment key={lbl}>
                <div style={{display:'flex',alignItems:'center',gap:7}}>
                  <div style={{width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,background:step===i+1?CLINIC_CONFIG.primaryColor:step>i+1?'#D4F1E4':'rgba(255,255,255,.12)',color:step===i+1?'#fff':step>i+1?'#0A6040':'rgba(255,255,255,.5)'}}>
                    {step>i+1?<CheckCircle2 size={12}/>:i+1}
                  </div>
                  <span style={{fontSize:12,fontWeight:step===i+1?700:500,color:step===i+1?'#fff':'rgba(255,255,255,.4)'}}>{lbl}</span>
                </div>
                {i<2&&<span style={{color:'rgba(255,255,255,.2)',fontSize:12}}>›</span>}
              </React.Fragment>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',padding:'5px 12px 5px 6px',borderRadius:20}}>
            <div style={{width:44,height: 44,borderRadius:'50%',background:CLINIC_CONFIG.primaryColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff'}}>R</div>
            <span style={{fontSize:12,color:'#C0D8D0',fontWeight:500}}>Rania M.</span>
          </div>
        </div>

        {/* Tab bar + patient strip */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',borderTop:'1px solid rgba(255,255,255,.06)'}}>
          <div style={{display:'flex'}}>
            {[['checkout','Checkout'],['history','Patient history']].map(([id,lbl])=>(
              <button key={id} onClick={()=>{setActiveTab(id);setStep(1);}} style={{padding:'11px 18px',fontSize:13,fontWeight:activeTab===id?700:500,color:activeTab===id?'#fff':'rgba(255,255,255,.4)',background:'transparent',border:'none',borderBottom:`2.5px solid ${activeTab===id?CLINIC_CONFIG.primaryColor:'transparent'}`,marginBottom:-1,transition:'all .13s'}}>
                {lbl}
              </button>
            ))}
          </div>
          {/* Patient identity */}
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0'}}>
            <div style={{width:44,height: 44,borderRadius:'50%',background:'rgba(255,255,255,.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#C0D8D0'}}>AK</div>
            <div>
              <div style={{fontSize:12.5,fontWeight:700,color:'#fff'}}>{PATIENT.nameEn} <span style={{fontSize:12,fontWeight:500,color:'rgba(255,255,255,.4)',fontFamily:"'IBM Plex Mono',monospace"}}>{PATIENT.fileNo}</span></div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.4)',fontFamily:"'IBM Plex Mono',monospace",marginTop:1}}>QID {PATIENT.qid} · {PATIENT.insurer} {PATIENT.policy}</div>
            </div>
            {pending.length>0&&<span style={{fontSize:12,fontWeight:700,padding:'2px 9px',borderRadius:20,background:'rgba(249,158,48,.2)',color:'#F59E0B',border:'1px solid rgba(249,158,48,.3)'}}>{pending.length} pending</span>}
          </div>
        </div>
      </header>

      <main style={{padding:'16px 24px', maxWidth:1280, margin:'0 auto'}}>
        {activeTab==='checkout' && (
          <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:16}}>
            {/* Encounter list */}
            <EncounterList encounters={encounters} selectedId={selectedEncId} onSelect={id=>{setSelectedEncId(id);setStep(1);setSplits([]);}} step={step}/>
            {/* Flow */}
            <div>
              {encounter&&step===1&&<ReviewStep encounter={encounter} items={items} toggleCoverage={toggleCoverage} discount={discount} setDiscount={setDiscount} subtotal={subtotal} insuredPortion={insuredPortion} patientPortion={patientPortion} discountAmount={discountAmount} totalDueToday={totalDueToday} alreadyPaid={alreadyPaid} balance={balance} onContinue={()=>setStep(2)}/>}
              {encounter&&step===2&&<PaymentStep encounter={encounter} balance={balance} paidSoFar={paidSoFar} remaining={remaining} splits={splits} setSplits={setSplits} addSplit={addSplit} paymentType={paymentType} setPaymentType={setPaymentType} onBack={()=>setStep(1)} onComplete={markPaid} insuredPortion={insuredPortion} paidEncounters={encounters.filter(e=>e.status==='paid')}/>}
              {step===3&&<CompleteStep patient={PATIENT} encounter={encounter} items={items} splits={splits} paymentType={paymentType} totalDueToday={totalDueToday} insuredPortion={insuredPortion} onNewCheckout={()=>{setStep(1);setSelectedEncId('enc1');setSplits([]);}}/>}
            </div>
          </div>
        )}
        {activeTab==='history' && <PatientHistoryView patient={PATIENT} encounters={encounters} onStartCheckout={id=>{setActiveTab('checkout');setSelectedEncId(id);setStep(1);}}/>}
      </main>
    </div>
  );
}

// ─── Encounter List ───────────────────────────────────────────────────────────
function EncounterList({ encounters, selectedId, onSelect }) {
  return (
    <div style={{...card,overflow:'hidden',position:'sticky',top:16,alignSelf:'start'}}>
      <div style={{padding:'12px 16px',borderBottom:'1px solid #EEF2F0'}}>
        <div style={{fontSize:13,fontWeight:700,color:'#111814'}}>Encounters</div>
      </div>
      <div style={{maxHeight:'calc(100vh - 200px)',overflowY:'auto'}}>
        {encounters.map(enc=>{
          const cfg=STATUS_CFG[enc.status];
          const isPending=enc.status==='payment_required'||enc.status==='partial_payment';
          const isSelected=enc.id===selectedId;
          return isPending?(
            <button key={enc.id} onClick={()=>onSelect(enc.id)} className="enc-item" style={{width:'100%',textAlign:'left',padding:'12px 16px',background:isSelected?'#F0FAF6':'transparent',border:'none',borderLeft:`3px solid ${isSelected?CLINIC_CONFIG.primaryColor:'transparent'}`,borderBottom:'1px solid #EEF2F0',cursor:'pointer'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:700,color:'#111814'}}>{enc.date}</span>
                <Chip label={cfg.label} color={enc.status}/>
              </div>
              <div style={{fontSize:12,color:'#3D5850',marginBottom:4,fontWeight:600}}>{enc.doctors.join(', ')}</div>
              <div style={{fontSize:12,color:'#5A7870'}}>{enc.items.map(i=>i.label).join(' · ')}</div>
              <div style={{marginTop:6,fontSize:13,fontWeight:800,letterSpacing:'-0.4px',color:'#C05820'}}>Balance: {qar(enc.balance)}</div>
            </button>
          ):(
            <div key={enc.id} style={{padding:'12px 16px',borderLeft:'3px solid transparent',borderBottom:'1px solid #EEF2F0',opacity:.55}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:600,color:'#4A6860'}}>{enc.date}</span>
                <Chip label={cfg.label} color={enc.status}/>
              </div>
              <div style={{fontSize:12,color:'#6A8880'}}>{enc.items.map(i=>i.label).join(' · ')}</div>
              {enc.status==='paid'&&<div style={{marginTop:4,fontSize:12,fontWeight:700,color:'#0A6040'}}>{qar(enc.paid)} paid</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Review Step ──────────────────────────────────────────────────────────────
function ReviewStep({ encounter, items, toggleCoverage, discount, setDiscount, subtotal, insuredPortion, patientPortion, discountAmount, totalDueToday, alreadyPaid, balance, onContinue }) {
  const [editDisc, setEditDisc] = useState(false);
  const [draftDisc, setDraftDisc] = useState({pct:discount.pct,reason:discount.reason});
  const isPending = encounter.status==='payment_required'||encounter.status==='partial_payment';
  const isNoCharge = encounter.status==='no_charge'||totalDueToday===0;
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:16}}>
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <div style={card}>
          <div style={cardHd}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:'#111814'}}>{encounter.date} visit</div>
              <div style={{fontSize:12,color:'#3D5850',marginTop:2,fontWeight:600}}>{encounter.doctors.join(' · ')}</div>
            </div>
            <Chip label={STATUS_CFG[encounter.status].label} color={encounter.status}/>
          </div>
          <div style={cardBd}>
            {alreadyPaid>0&&(
              <div style={{marginBottom:12,padding:'10px 14px',background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:9,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:12.5,fontWeight:600,color:'#1E40AF'}}>Part-payment already collected</span>
                <span style={{fontSize:13,fontWeight:800,letterSpacing:'-0.4px',color:'#1E40AF'}}>{qar(alreadyPaid)}</span>
              </div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {items.map(item=>(
                <div key={item.id} style={{padding:'12px 14px',border:`1px solid ${item.covered?'#B8DDD6':'#DCE4E0'}`,borderRadius:10,background:item.covered?'#F0FAF6':'#fff'}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13.5,fontWeight:600,color:'#111814',display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>{item.label}{item.fromDoctor&&<span style={{fontSize:10.5,fontWeight:700,padding:'1px 7px',borderRadius:10,background:'#F0FAF6',color:'#0C6B5A',border:'1px solid #B8DDD6'}}>from doctor</span>}</div>
                      <div style={{fontSize:12,color:'#3D5850',marginTop:2,fontWeight:600}}>{item.doctor} · <span style={{fontFamily:"'IBM Plex Mono',monospace"}}>{item.code}</span></div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontSize:14,fontWeight:800,letterSpacing:'-0.5px',color:'#111814'}}>{qar(item.price)}</div>
                      {item.insurable&&item.covered&&<div style={{fontSize:12,color:'#0A6040',fontWeight:700,marginTop:2}}>{item.coveragePct}% insured · patient {qar(Math.round(item.price*(1-item.coveragePct/100)))}</div>}
                    </div>
                  </div>
                  {item.insurable&&(
                    <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid #EEF2F0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:12.5,fontWeight:600,color:'#2A4840'}}>
                        <input type="checkbox" checked={item.covered} onChange={()=>toggleCoverage(item.id)} style={{width:15,height:15,flexShrink:0}}/>
                        Bill to QLM insurance
                      </label>
                      {item.authNumber&&<span style={{fontSize:12,color:'#6A8880',fontWeight:600}}>{item.authNumber}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!editDisc?(
              <button onClick={()=>setEditDisc(true)} style={{marginTop:10,width:'100%',padding:'9px',borderRadius:9,border:'1.5px dashed #C8D4CF',background:'transparent',fontSize:13,fontWeight:600,color:'#5A7870',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                <Tag size={13}/>{discount.pct>0?`Discount: ${discount.pct}% (${discount.reason})`:'Apply discount'}
              </button>
            ):(
              <div style={{marginTop:10,padding:14,background:'#F5F8F7',borderRadius:10,border:'1px solid #DCE4E0'}}>
                <div style={{display:'flex',gap:10,marginBottom:10}}>
                  <div style={{width:80}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#2E4840',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Discount %</div>
                    <input type="number" min={0} max={100} value={draftDisc.pct} onChange={e=>setDraftDisc({...draftDisc,pct:Math.min(100,Math.max(0,parseInt(e.target.value)||0))})} style={{fontFamily:"'IBM Plex Mono',monospace"}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#2E4840',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Reason</div>
                    <input value={draftDisc.reason} onChange={e=>setDraftDisc({...draftDisc,reason:e.target.value})} placeholder="e.g. Staff family, loyalty..."/>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                  <GhostBtn onClick={()=>setEditDisc(false)} style={{padding:'6px 14px',fontSize:12}}>Cancel</GhostBtn>
                  <PrimaryBtn onClick={()=>{setDiscount(draftDisc);setEditDisc(false);}} disabled={draftDisc.pct>0&&!draftDisc.reason} style={{padding:'6px 14px',fontSize:12}}>Apply</PrimaryBtn>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={{...card,alignSelf:'start',position:'sticky',top:16}}>
        <div style={cardHd}><div style={{fontSize:14,fontWeight:700}}>Invoice summary</div></div>
        <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:8}}>
          {[
            ['Subtotal',       qar(subtotal),       null],
            insuredPortion>0&&['Insurance covers', `-${qar(insuredPortion)}`, '#0A6040'],
            ['Patient portion', qar(patientPortion), null],
            discount.pct>0&&[`Discount (${discount.pct}%)`, `-${qar(discountAmount)}`, '#0A6040'],
          ].filter(Boolean).map(([l,v,c])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12.5,color:'#3D5850',fontWeight:600}}>{l}</span>
              <span style={{fontSize:13,fontWeight:600,color:c||'#111814'}}>{v}</span>
            </div>
          ))}
          <div style={{borderTop:'1.5px solid #DCE4E0',paddingTop:10,marginTop:2,display:'flex',flexDirection:'column',gap:6}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:13,fontWeight:700}}>Total</span>
              <span style={{fontSize:15,fontWeight:800,letterSpacing:'-0.8px'}}>{qar(totalDueToday)}</span>
            </div>
            {alreadyPaid>0&&<div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,color:'#3D5850',fontWeight:600}}>Already paid</span><span style={{fontSize:13,fontWeight:700,color:'#0A6040'}}>-{qar(alreadyPaid)}</span></div>}
            <div style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:8,background:balance>0?'#FEF3DC':'#D4F1E4'}}>
              <span style={{fontSize:13,fontWeight:700,color:balance>0?'#92600A':'#0A6040'}}>Balance due</span>
              <span style={{fontSize:15,fontWeight:800,letterSpacing:'-0.8px',color:balance>0?'#92600A':'#0A6040'}}>{qar(balance)}</span>
            </div>
          </div>
          {isNoCharge&&<div style={{padding:'10px 12px',background:'#EEF2F0',borderRadius:8,fontSize:12.5,fontWeight:600,color:'#3D5850',display:'flex',alignItems:'center',gap:7}}><CheckCircle2 size={14}/>No charge — complimentary</div>}
          {isPending&&<PrimaryBtn onClick={onContinue} style={{width:'100%',justifyContent:'center',marginTop:4}}>Proceed to payment <ArrowRight size={14}/></PrimaryBtn>}
          {encounter.status==='paid'&&<GhostBtn style={{width:'100%',justifyContent:'center',marginTop:4,display:'flex',alignItems:'center',gap:6}}><FileText size={13}/>View invoice</GhostBtn>}
        </div>
      </div>
    </div>
  );
}

// ─── Payment Step ─────────────────────────────────────────────────────────────
function PaymentStep({ encounter, balance, paidSoFar, remaining, splits, setSplits, addSplit, paymentType, setPaymentType, onBack, onComplete, insuredPortion, paidEncounters }) {
  const [method,       setMethod]       = useState('card');
  const [splitMode,    setSplitMode]    = useState(false);
  const [tempAmt,      setTempAmt]      = useState('');
  const [downAmt,      setDownAmt]      = useState('');
  const [instPlan,     setInstPlan]     = useState({count:3,frequency:'monthly',firstDate:'2026-06-01'});
  const [refundEnc,    setRefundEnc]    = useState(paidEncounters[0]?.id||'');
  const [refundAmt,    setRefundAmt]    = useState('');
  const [refundReason, setRefundReason] = useState('');
  const fullySettled = remaining<=.01||paymentType==='downpayment'||paymentType==='installments';
  const perInst = instPlan.count>0?Math.ceil(balance/instPlan.count):0;
  const refEnc = paidEncounters.find(e=>e.id===refundEnc);
  const canComplete = paymentType==='refund'?(refundAmt&&refundReason):paymentType==='downpayment'?!!downAmt:paymentType==='installments'?!!instPlan.firstDate:fullySettled;
  const handleComplete = () => {
    if(paymentType==='downpayment'&&downAmt) addSplit(parseFloat(downAmt),method);
    else if(paymentType==='installments') addSplit(perInst,method,'INST-1');
    else if(paymentType==='refund') addSplit(-Math.abs(parseFloat(refundAmt)),method,`REF-${Date.now().toString().slice(-6)}`);
    onComplete();
  };
  const TYPES = [['full','Full payment','Collect entire balance'],['downpayment','Downpayment','Partial now, rest later'],['installments','Installments','Set up a schedule'],['refund','Refund','Process a refund']];
  const secStyle = { marginBottom:12, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'#2E4840' };
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:16}}>
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <div style={card}>
          <div style={cardHd}><div style={{fontSize:14,fontWeight:700}}>Payment type</div></div>
          <div style={cardBd}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:20}}>
              {TYPES.map(([id,lbl,desc])=>(
                <button key={id} onClick={()=>{setPaymentType(id);setSplits([]);}} style={{padding:'12px 10px',borderRadius:10,border:`2px solid ${paymentType===id?CLINIC_CONFIG.primaryColor:'#DCE4E0'}`,background:paymentType===id?'#F0FAF6':'#fff',textAlign:'center',cursor:'pointer',transition:'all .13s'}}>
                  <div style={{fontSize:12.5,fontWeight:700,color:paymentType===id?CLINIC_CONFIG.primaryColor:'#111814',marginBottom:3}}>{lbl}</div>
                  <div style={{fontSize:12,color:'#5A7870',fontWeight:600,lineHeight:1.3}}>{desc}</div>
                </button>
              ))}
            </div>

            {/* Method picker */}
            {paymentType!=='refund'&&(
              <div style={{marginBottom:20}}>
                <div style={secStyle}>Payment method</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                  {PAYMENT_METHODS.map(m=>{ const Icon=m.icon; return (
                    <button key={m.id} onClick={()=>setMethod(m.id)} style={{padding:'10px 8px',borderRadius:9,border:`2px solid ${method===m.id?CLINIC_CONFIG.primaryColor:'#DCE4E0'}`,background:method===m.id?'#F0FAF6':'#fff',display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer',transition:'all .13s'}}>
                      <Icon size={16} color={method===m.id?CLINIC_CONFIG.primaryColor:'#4A6860'}/>
                      <span style={{fontSize:12,fontWeight:600,color:method===m.id?CLINIC_CONFIG.primaryColor:'#3D5850',textAlign:'center',lineHeight:1.3}}>{m.label}</span>
                    </button>
                  );})}
                </div>
              </div>
            )}

            {/* Full payment */}
            {paymentType==='full'&&(
              <div>
                {!splitMode&&!fullySettled&&(
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    <PrimaryBtn onClick={()=>addSplit(remaining,method)} style={{width:'100%',justifyContent:'center',padding:'12px'}}>
                      <CheckCircle2 size={15}/> Charge full balance — {qar(remaining)}
                    </PrimaryBtn>
                    <GhostBtn onClick={()=>setSplitMode(true)} style={{width:'100%',display:'flex',justifyContent:'center',gap:6}}>
                      <Plus size={13}/> Split across payment methods
                    </GhostBtn>
                  </div>
                )}
                {splitMode&&!fullySettled&&(
                  <div style={{padding:14,background:'#F5F8F7',borderRadius:10,border:'1px solid #DCE4E0'}}>
                    <div style={secStyle}>Add partial payment</div>
                    <div style={{display:'flex',gap:8}}>
                      <input type="number" value={tempAmt} onChange={e=>setTempAmt(e.target.value)} placeholder={`Max ${qar(remaining)}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}/>
                      <PrimaryBtn onClick={()=>{addSplit(parseFloat(tempAmt),method);setTempAmt('');setSplitMode(false);}} style={{whiteSpace:'nowrap',padding:'8px 16px'}}>Add</PrimaryBtn>
                      <GhostBtn onClick={()=>setSplitMode(false)} style={{padding:'8px 14px'}}>×</GhostBtn>
                    </div>
                  </div>
                )}
                {fullySettled&&splits.length>0&&<div style={{padding:'12px 16px',background:'#D4F1E4',borderRadius:10,display:'flex',alignItems:'center',gap:8}}><CheckCircle2 size={16} color="#0A6040"/><span style={{fontSize:13,fontWeight:700,color:'#0A6040'}}>Fully collected — ready to finalize</span></div>}
              </div>
            )}

            {/* Downpayment */}
            {paymentType==='downpayment'&&(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{padding:'10px 14px',background:'#FEF3DC',borderRadius:9,border:'1px solid #FDE68A',fontSize:12.5,fontWeight:600,color:'#92600A'}}>Patient pays a portion now. Remaining balance saved for a future visit.</div>
                <div>
                  <div style={secStyle}>Amount to collect now (QAR)</div>
                  <input type="number" value={downAmt} onChange={e=>setDownAmt(e.target.value)} placeholder={`Max: ${balance}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}/>
                </div>
                {downAmt&&(
                  <div style={{padding:'10px 14px',background:'#F5F8F7',borderRadius:9,border:'1px solid #DCE4E0',display:'flex',flexDirection:'column',gap:6}}>
                    <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>Collecting now</span><span style={{fontSize:13,fontWeight:800,letterSpacing:'-0.4px'}}>{qar(parseFloat(downAmt)||0)}</span></div>
                    <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>Saved as balance</span><span style={{fontSize:13,fontWeight:800,letterSpacing:'-0.4px',color:'#C05820'}}>{qar(Math.max(0,balance-(parseFloat(downAmt)||0)))}</span></div>
                  </div>
                )}
              </div>
            )}

            {/* Installments */}
            {paymentType==='installments'&&(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{padding:'10px 14px',background:'#EFF6FF',borderRadius:9,border:'1px solid #BFDBFE',fontSize:12.5,fontWeight:600,color:'#1E40AF'}}>First instalment collected now. Remaining tracked for future visits.</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    <div style={secStyle}>Number of instalments</div>
                    <div style={{display:'flex',gap:6}}>
                      {[2,3,6,12].map(n=>(
                        <button key={n} onClick={()=>setInstPlan({...instPlan,count:n})} style={{flex:1,padding:'8px 4px',borderRadius:7,border:`2px solid ${instPlan.count===n?CLINIC_CONFIG.primaryColor:'#DCE4E0'}`,background:instPlan.count===n?CLINIC_CONFIG.primaryColor:'#fff',color:instPlan.count===n?'#fff':'#111814',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={secStyle}>Frequency</div>
                    <select value={instPlan.frequency} onChange={e=>setInstPlan({...instPlan,frequency:e.target.value})}>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <div style={secStyle}>First payment date</div>
                    <input type="date" value={instPlan.firstDate} onChange={e=>setInstPlan({...instPlan,firstDate:e.target.value})}/>
                  </div>
                  <div style={{padding:'12px',background:'#F0FAF6',borderRadius:9,border:'1px solid #B8DDD6',display:'flex',flexDirection:'column',justifyContent:'center'}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#3D5850',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:4}}>Per instalment</div>
                    <div style={{fontSize:22,fontWeight:800,letterSpacing:'-1px',color:'#111814'}}>{qar(perInst)}</div>
                    <div style={{fontSize:12,fontWeight:600,color:'#5A7870'}}>{instPlan.count}× {instPlan.frequency}</div>
                  </div>
                </div>
                <div style={{padding:'12px 14px',background:'#F5F8F7',borderRadius:9,border:'1px solid #DCE4E0'}}>
                  <div style={secStyle}>Schedule preview</div>
                  {Array.from({length:Math.min(instPlan.count,4)},(_,i)=>{ const d=new Date(instPlan.firstDate); if(instPlan.frequency==='monthly') d.setMonth(d.getMonth()+i); else if(instPlan.frequency==='biweekly') d.setDate(d.getDate()+i*14); else d.setDate(d.getDate()+i*7); return(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:i<Math.min(instPlan.count,4)-1?'1px solid #EEF2F0':'none'}}>
                      <span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>#{i+1} — {d.toISOString().slice(0,10)}</span>
                      <span style={{fontSize:12.5,fontWeight:700,letterSpacing:'-0.3px'}}>{qar(i<instPlan.count-1?perInst:balance-perInst*(instPlan.count-1))}</span>
                    </div>
                  );})}
                  {instPlan.count>4&&<div style={{fontSize:12,color:'#4E6860',marginTop:4,fontWeight:600}}>+ {instPlan.count-4} more instalments</div>}
                </div>
              </div>
            )}

            {/* Refund */}
            {paymentType==='refund'&&(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{padding:'10px 14px',background:'#FEF4F2',borderRadius:9,border:'1px solid #FECACA',fontSize:12.5,fontWeight:600,color:'#B02A1E'}}>Refunds are audit-logged and cannot be deleted. Always enter a reason.</div>
                <div>
                  <div style={secStyle}>Encounter to refund</div>
                  <select value={refundEnc} onChange={e=>setRefundEnc(e.target.value)}>
                    {paidEncounters.map(e=><option key={e.id} value={e.id}>{e.date} — {e.items[0]?.label} — {qar(e.paid)} paid</option>)}
                  </select>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    <div style={secStyle}>Refund amount (QAR)</div>
                    <input type="number" value={refundAmt} onChange={e=>setRefundAmt(e.target.value)} placeholder={`Max: ${refEnc?.paid||0}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}/>
                  </div>
                  <div>
                    <div style={secStyle}>Payment method</div>
                    <select value={method} onChange={e=>setMethod(e.target.value)}>
                      {PAYMENT_METHODS.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <div style={secStyle}>Reason (required)</div>
                  <input value={refundReason} onChange={e=>setRefundReason(e.target.value)} placeholder="e.g. Treatment not completed..."/>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collected list */}
        {splits.length>0&&(
          <div style={card}>
            <div style={cardHd}><div style={{fontSize:14,fontWeight:700}}>Collected</div></div>
            <div>
              {splits.map((s,i)=>{ const m=PAYMENT_METHODS.find(m=>m.id===s.methodId); const Icon=m?.icon||CreditCard; return(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 20px',borderBottom:'1px solid #EEF2F0'}}>
                  <Icon size={16} color="#4A6860"/>
                  <span style={{flex:1,fontSize:13,fontWeight:500,color:'#2A3830'}}>{m?.label}</span>
                  <span style={{fontSize:12,color:'#4E6860',fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>{s.ref}</span>
                  <span style={{fontSize:14,fontWeight:800,letterSpacing:'-0.5px',color:s.amount<0?'#C04030':'#0A6040'}}>{s.amount<0?'-':''}{qar(Math.abs(s.amount))}</span>
                  <button onClick={()=>setSplits(p=>p.filter((_,idx)=>idx!==i))} style={{width:44,height: 44,borderRadius:'50%',background:'#FEF4F2',border:'1px solid #FECACA',display:'flex',alignItems:'center',justifyContent:'center',color:'#C04030',cursor:'pointer'}}><X size={12}/></button>
                </div>
              );})}
            </div>
          </div>
        )}
      </div>

      {/* Status sidebar */}
      <div style={{...card,alignSelf:'start',position:'sticky',top:16}}>
        <div style={cardHd}><div style={{fontSize:14,fontWeight:700}}>Payment status</div></div>
        <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:8}}>
          {paymentType==='full'&&(
            <>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>Balance due</span><span style={{fontSize:13,fontWeight:800,letterSpacing:'-0.4px'}}>{qar(balance)}</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>Collected</span><span style={{fontSize:13,fontWeight:700,color:'#0A6040'}}>-{qar(paidSoFar)}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:8,background:remaining>0?'#FEF3DC':'#D4F1E4',marginTop:4}}>
                <span style={{fontSize:13,fontWeight:700,color:remaining>0?'#92600A':'#0A6040'}}>Remaining</span>
                <span style={{fontSize:15,fontWeight:800,letterSpacing:'-0.8px',color:remaining>0?'#92600A':'#0A6040'}}>{qar(remaining)}</span>
              </div>
              <div style={{height:6,borderRadius:4,background:'#EEF2F0',overflow:'hidden',marginTop:2}}>
                <div style={{height:'100%',borderRadius:4,background:CLINIC_CONFIG.primaryColor,width:`${Math.min(100,balance>0?(paidSoFar/balance)*100:100)}%`,transition:'width .3s ease'}}/>
              </div>
            </>
          )}
          {paymentType==='downpayment'&&(
            <>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>Total balance</span><span style={{fontSize:13,fontWeight:800,letterSpacing:'-0.4px'}}>{qar(balance)}</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>Collecting now</span><span style={{fontSize:13,fontWeight:800,letterSpacing:'-0.4px',color:'#0A6040'}}>{qar(parseFloat(downAmt)||0)}</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>Saved as balance</span><span style={{fontSize:13,fontWeight:800,letterSpacing:'-0.4px',color:'#C05820'}}>{qar(Math.max(0,balance-(parseFloat(downAmt)||0)))}</span></div>
            </>
          )}
          {paymentType==='installments'&&(
            <>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>Total balance</span><span style={{fontSize:13,fontWeight:800,letterSpacing:'-0.4px'}}>{qar(balance)}</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>First instalment</span><span style={{fontSize:13,fontWeight:800,letterSpacing:'-0.4px',color:'#0A6040'}}>{qar(perInst)}</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>Remaining</span><span style={{fontSize:13,fontWeight:800,letterSpacing:'-0.4px',color:'#C05820'}}>{instPlan.count-1}× {qar(perInst)}</span></div>
            </>
          )}
          {paymentType==='refund'&&(
            <div style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:8,background:'#FEF4F2'}}>
              <span style={{fontSize:13,fontWeight:700,color:'#B02A1E'}}>Refund amount</span>
              <span style={{fontSize:15,fontWeight:800,color:'#B02A1E',letterSpacing:'-0.5px'}}>{refundAmt?`-${qar(parseFloat(refundAmt))}`:'—'}</span>
            </div>
          )}
          {insuredPortion>0&&paymentType!=='refund'&&(
            <div style={{paddingTop:10,marginTop:4,borderTop:'1px solid #EEF2F0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600,color:'#3D5850'}}><Shield size={13}/>QLM claim</span>
              <span style={{fontSize:12.5,fontWeight:700,letterSpacing:'-0.3px'}}>{qar(insuredPortion)}</span>
            </div>
          )}
        </div>
        <div style={{padding:'14px 20px',borderTop:'1px solid #EEF2F0',display:'flex',gap:8}}>
          <GhostBtn onClick={onBack} style={{padding:'8px 14px',fontSize:12}}>Back</GhostBtn>
          <PrimaryBtn onClick={handleComplete} disabled={!canComplete} style={{flex:1,justifyContent:'center',padding:'10px'}}>
            {paymentType==='refund'?'Process refund':paymentType==='installments'?'Confirm schedule':'Finalize visit'} <ArrowRight size={14}/>
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Complete Step ────────────────────────────────────────────────────────────
function CompleteStep({ patient, encounter, items, splits, paymentType, totalDueToday, insuredPortion, onNewCheckout }) {
  const [sent, setSent] = useState({sms:true,email:false});
  const invNum = useMemo(()=>`INV-2026-${String(Math.floor(Math.random()*9000)+1000)}`,[]);
  const collected = splits.filter(s=>s.amount>0).reduce((s,p)=>s+p.amount,0);
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:16}}>
      {/* Invoice */}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={card}>
          <div style={{padding:'20px 24px',borderBottom:'1px solid #EEF2F0',background:'#F5F8F7',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:'#111814'}}>Yasmeen Clinic</div>
              <div style={{fontSize:12,color:'#3D5850',fontWeight:600,marginTop:2}}>West Bay, Doha, Qatar · Tax ID 100012345</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:14,fontWeight:700,color:'#111814'}}>{patient.nameEn}</div>
              <div style={{fontSize:12,fontWeight:600,color:'#3D5850',marginTop:1,fontFamily:"'IBM Plex Mono',monospace"}}>{patient.fileNo}</div>
            </div>
          </div>
          <div style={{padding:'14px 24px',borderBottom:'1px solid #EEF2F0',display:'flex',gap:24}}>
            {[['Invoice',invNum,true],['Date','2026-05-24',true],['Patient',patient.nameEn,false]].map(([l,v,mono])=>(
              <div key={l}><div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#5A7870',marginBottom:4}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:'#111814',fontFamily:mono?"'IBM Plex Mono',monospace":'inherit'}}>{v}</div></div>
            ))}
          </div>
          <div style={{padding:'16px 24px'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1.5px solid #DCE4E0'}}>
                  {['Item','Code','Amount','Insured','Patient'].map(h=><th key={h} style={{textAlign:h==='Item'?'left':'right',padding:'0 0 8px',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#2E4840'}}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map(item=>{ const ins=item.covered?item.price*item.coveragePct/100:0; const pat=item.price-ins; return(
                  <tr key={item.id} style={{borderBottom:'1px solid #EEF2F0'}}>
                    <td style={{padding:'10px 0',fontSize:12.5}}><div style={{fontWeight:600}}>{item.label}</div><div style={{fontSize:12,color:'#5A7870',fontWeight:600}}>{item.doctor}</div></td>
                    <td style={{padding:'10px 0',textAlign:'right',fontSize:12,fontFamily:"'IBM Plex Mono',monospace",color:'#4E6860',fontWeight:600}}>{item.code}</td>
                    <td style={{padding:'10px 0',textAlign:'right',fontSize:12.5,fontWeight:600}}>{item.price.toLocaleString()}</td>
                    <td style={{padding:'10px 0',textAlign:'right',fontSize:12.5,color:ins>0?'#0A6040':'#C8D8D0',fontWeight:600}}>{ins>0?ins.toLocaleString():'—'}</td>
                    <td style={{padding:'10px 0',textAlign:'right',fontSize:12.5,fontWeight:700}}>{pat.toLocaleString()}</td>
                  </tr>
                );})}
                <tr style={{borderTop:'2px solid #DCE4E0'}}>
                  <td colSpan={4} style={{padding:'10px 0',fontSize:13,fontWeight:700,textAlign:'right'}}>Total</td>
                  <td style={{padding:'10px 0',fontSize:15,fontWeight:800,letterSpacing:'-0.8px',textAlign:'right',color:'#0A6040'}}>{qar(totalDueToday)}</td>
                </tr>
              </tbody>
            </table>
            <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid #EEF2F0'}}>
              <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#2E4840',marginBottom:6}}>Payment</div>
              {splits.map((s,i)=>{ const m=PAYMENT_METHODS.find(m=>m.id===s.methodId); return(<div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:12,color:'#3D5850',fontWeight:600}}>{m?.label} · <span style={{fontFamily:"'IBM Plex Mono',monospace"}}>{s.ref}</span></span><span style={{fontSize:12.5,fontWeight:700,letterSpacing:'-0.3px',color:s.amount<0?'#C04030':'#111814'}}>{s.amount<0?'-':''}{qar(Math.abs(s.amount))}</span></div>);})}
            </div>
            {insuredPortion>0&&<div style={{marginTop:10,padding:'10px 14px',background:'#EFF6FF',borderRadius:8,border:'1px solid #BFDBFE',fontSize:12,fontWeight:600,color:'#1E40AF'}}>Insurance claim: {qar(insuredPortion)} to {patient.insurer} (policy {patient.policy})</div>}
            <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid #EEF2F0',textAlign:'center',fontSize:12,fontWeight:600,color:'#4E6860'}}>Thank you for visiting Yasmeen Clinic</div>
          </div>
        </div>
        <div style={{...card,padding:'12px 20px',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:12.5,fontWeight:600,color:'#3D5850',marginRight:6}}>Send receipt:</span>
          {[['sms',MessageSquare,'SMS',patient.phone],['email',Mail,'Email',patient.email]].map(([id,Icon,lbl,sub])=>(
            <button key={id} onClick={()=>setSent(p=>({...p,[id]:!p[id]}))} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:8,border:`1.5px solid ${sent[id]?CLINIC_CONFIG.primaryColor:'#DCE4E0'}`,background:sent[id]?'#F0FAF6':'#fff',fontSize:12,fontWeight:600,color:sent[id]?CLINIC_CONFIG.primaryColor:'#4A6860',cursor:'pointer'}}>
              <Icon size={13}/>{lbl} <span style={{fontSize:12,color:'#4E6860'}}>{sub}</span>
            </button>
          ))}
          <button style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:8,border:'1px solid #DCE4E0',background:'#F5F8F7',fontSize:12,fontWeight:600,color:'#2A4840',cursor:'pointer'}}><Download size={13}/>PDF</button>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={{...card,overflow:'hidden'}}>
          <div style={{padding:'16px 20px',background:'#D4F1E4',display:'flex',alignItems:'flex-start',gap:12}}>
            <CheckCircle2 size={22} color="#0A6040" style={{flexShrink:0,marginTop:1}}/>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:'#0A6040'}}>Visit complete</div>
              <div style={{fontSize:12,fontWeight:600,color:'#0D6B4A',marginTop:3}}>Invoice {invNum} · Payment recorded{insuredPortion>0?' · Claim queued':''}</div>
            </div>
          </div>
          <div style={{padding:'14px 20px',borderTop:'1px solid #B8DDD6'}}>
            <PrimaryBtn onClick={onNewCheckout} style={{width:'100%',justifyContent:'center'}}>Close & return to calendar</PrimaryBtn>
          </div>
        </div>
        {insuredPortion>0&&(
          <div style={card}>
            <div style={cardHd}><div style={{fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:7}}><Send size={13}/>Insurance claim</div></div>
            <div style={{padding:'14px 20px',display:'flex',flexDirection:'column',gap:8}}>
              {[['Claim record created',true],['Queued for submission to '+patient.insurer,true],['Awaiting submission (5 min)',false],['Awaiting adjudication (3–10 days)',false]].map(([l,done])=>(
                <div key={l} style={{display:'flex',alignItems:'center',gap:8}}>
                  {done?<CheckCircle2 size={14} color="#0A6040"/>:<div style={{width:14,height:14,borderRadius:'50%',border:'1.5px solid #DCE4E0',flexShrink:0}}/>}
                  <span style={{fontSize:12.5,fontWeight:600,color:done?'#111814':'#4E6860'}}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Patient history ──────────────────────────────────────────────────────────
function PatientHistoryView({ patient, encounters, onStartCheckout }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Search bar */}
      <div style={{...card,padding:'12px 18px',display:'flex',alignItems:'center',gap:10}}>
        <Search size={16} color="#4E6860"/>
        <input placeholder={`Showing ${patient.nameEn} (${patient.fileNo}) — search for another patient`} style={{flex:1,background:'transparent',border:'none',boxShadow:'none',fontSize:13.5,color:'#111814',padding:0}} readOnly/>
      </div>
      {/* Patient card */}
      <div style={card}>
        <div style={{padding:'16px 20px',display:'flex',alignItems:'flex-start',gap:14}}>
          <div style={{width:48,height:48,borderRadius:'50%',background:'#EEF2F0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#4A6860',flexShrink:0}}>AK</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
              <span style={{fontSize:15,fontWeight:800,color:'#111814'}}>{patient.nameEn}</span>
              <span style={{fontSize:13,color:'#3D5850',fontWeight:600,fontFamily:"'IBM Plex Mono',monospace"}}>{patient.fileNo}</span>
            </div>
            <div style={{fontSize:12,fontWeight:600,color:'#5A7870',marginTop:3,fontFamily:"'IBM Plex Mono',monospace"}}>QID {patient.qid} · {patient.phone} · {patient.insurer} {patient.policy}</div>
          </div>
          <div style={{textAlign:'right',flexShrink:0}}>
            <div style={{fontSize:12,fontWeight:700,color:'#4E6860',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:4}}>All-time billed</div>
            <div style={{fontSize:20,fontWeight:800,letterSpacing:'-1px',color:'#111814'}}>{qar(encounters.reduce((s,e)=>s+e.totalAmount,0))}</div>
            <div style={{fontSize:12,fontWeight:700,color:'#0A6040',marginTop:2}}>{qar(encounters.reduce((s,e)=>s+e.paid,0))} collected</div>
          </div>
        </div>
      </div>

      {/* Encounter history */}
      <div style={card}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid #EEF2F0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontSize:14,fontWeight:700,color:'#111814'}}>All encounters</div>
          <div style={{fontSize:12,fontWeight:600,color:'#5A7870'}}>{encounters.length} total · {encounters.filter(e=>e.status==='paid').length} paid · {encounters.filter(e=>e.status==='payment_required'||e.status==='partial_payment').length} outstanding</div>
        </div>
        <div>
          {encounters.map(enc=>{
            const cfg=STATUS_CFG[enc.status];
            const isOpen=expanded===enc.id;
            const isPending=enc.status==='payment_required'||enc.status==='partial_payment';
            return(
              <div key={enc.id}>
                <button onClick={()=>setExpanded(isOpen?null:enc.id)} className="enc-item" style={{width:'100%',textAlign:'left',padding:'12px 20px',background:'transparent',border:'none',borderBottom:'1px solid #EEF2F0',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:cfg.dot,flexShrink:0}}/>
                  <div style={{width:100,fontSize:12.5,fontWeight:600,color:'#2E4840',flexShrink:0}}>{enc.date}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:'#111814',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{enc.items.map(i=>i.label).join(', ')}</div>
                    <div style={{fontSize:12,fontWeight:600,color:'#5A7870',marginTop:1}}>{enc.doctors.join(' · ')}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:13,fontWeight:700}}>{qar(enc.totalAmount)}</div>
                    {isPending&&<div style={{fontSize:12,fontWeight:700,color:'#C05820',marginTop:1}}>Balance: {qar(enc.balance)}</div>}
                    {enc.status==='paid'&&<div style={{fontSize:12,fontWeight:700,color:'#0A6040',marginTop:1}}>{qar(enc.paid)} paid</div>}
                  </div>
                  <Chip label={cfg.label} color={enc.status}/>
                  <ChevronDown size={15} color="#4E6860" style={{transform:isOpen?'rotate(180deg)':'none',transition:'transform .15s',flexShrink:0}}/>
                </button>
                {isOpen&&(
                  <div style={{padding:'14px 20px',background:'#F8FAF9',borderBottom:'1px solid #EEF2F0'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:12}}>
                      {enc.items.map(i=><div key={i.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:12.5,fontWeight:500,color:'#2A3830'}}>{i.label} <span style={{fontSize:12,color:'#4E6860',fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>{i.code}</span></span><span style={{fontSize:13,fontWeight:700,letterSpacing:'-0.3px'}}>{qar(i.price)}</span></div>)}
                    </div>
                    {enc.payments.length>0&&(
                      <div style={{marginBottom:12,paddingBottom:12,borderBottom:'1px solid #EEF2F0'}}>
                        <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#2E4840',marginBottom:7}}>Payment records</div>
                        {enc.payments.map(p=>{ const m=PAYMENT_METHODS.find(m=>m.id===p.method); return(<div key={p.id} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}><MethodBadge method={p.method}/><span style={{fontSize:12,fontWeight:600,color:'#3D5850',fontFamily:"'IBM Plex Mono',monospace"}}>{p.ref} · {p.date}</span>{p.type!=='payment'&&<span style={{fontSize:12,fontWeight:700,padding:'1px 6px',borderRadius:20,background:'#FEF3DC',color:'#92600A'}}>{p.type}</span>}<span style={{marginLeft:'auto',fontSize:13,fontWeight:700,letterSpacing:'-0.3px'}}>{qar(p.amount)}</span></div>);})}
                      </div>
                    )}
                    <div style={{display:'flex',gap:8}}>
                      {isPending&&<PrimaryBtn onClick={()=>onStartCheckout(enc.id)} style={{padding:'7px 14px',fontSize:12}}><CreditCard size={13}/>Collect payment</PrimaryBtn>}
                      {enc.status==='partial_payment'&&<GhostBtn style={{padding:'7px 14px',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Printer size={13}/>Print receipt</GhostBtn>}
                      {enc.status==='paid'&&<><GhostBtn style={{padding:'7px 14px',fontSize:12,display:'flex',alignItems:'center',gap:6}}><FileText size={13}/>View invoice</GhostBtn><GhostBtn style={{padding:'7px 14px',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Printer size={13}/>Print receipt</GhostBtn></>}
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
