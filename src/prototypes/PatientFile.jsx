import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, FileText, FileSignature, Upload, Download, PenLine,
  AlertCircle, ShieldCheck, ShieldAlert, Save, CheckCircle2, X, ChevronLeft,
} from 'lucide-react';
import { findConsent, consentsForQid, useConsents, normalizeTreatment } from './consentStore';

// ════════════════════════════════════════════════════════════════════════════
//  Unified Patient File
//  ────────────────────────────────────────────────────────────────────────────
//  One file, opened from everywhere — Reception, the Doctor portal and patient
//  search all render THIS component, so the patient's record looks and behaves
//  the same no matter who opens it (like a physical file passed around a clinic).
//
//  The only thing that changes by who is looking is permission to *act*:
//    • role="doctor"    → can open an encounter / add a treatment
//    • role="reception" → same file, view + reception notes, no treatment action
//
//  It accepts either patient data shape used in the prototypes (the Doctor
//  portal's rich `encounters/payments` records or Reception's `encounterHistory`)
//  and fills in the rest so every tab renders cleanly.
// ════════════════════════════════════════════════════════════════════════════

const PRIMARY = '#0C6B5A';
const card   = { background:'#fff', borderRadius:14, border:'1px solid #DCE4E0', boxShadow:'0 1px 3px rgba(15,31,26,.08)' };
const cardHd = { padding:'13px 18px 11px', borderBottom:'1px solid #EEF2F0', display:'flex', alignItems:'flex-start', justifyContent:'space-between' };

const fmtDate      = d => d ? new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmtDateShort = d => d ? new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short'}) : '—';

function ageFromDob(dob) {
  if (!dob) return null;
  const d = new Date(dob+'T12:00:00'); if (isNaN(d)) return null;
  const t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
  return a;
}

function guessKind(text) {
  return /botox|filler|hydrafacial|peel|laser|aesthetic|dermal/i.test(text||'') ? 'aesthetic' : 'dental';
}

// ─── Document builder (medical history, consent forms, radiographs) ────────────
export const DOC_TYPE = {
  medical: { label:'Medical history', bg:'#EFF6FF', color:'#1D4ED8', Icon:FileText },
  consent: { label:'Consent form',    bg:'#F0FAF6', color:PRIMARY,   Icon:FileSignature },
  other:   { label:'Other',           bg:'#FAF5FF', color:'#7C3AED', Icon:FileText },
};

export function buildDocuments(p) {
  const out = [];
  out.push({ id:p.id+'-md', type:'medical', name:'Medical history & intake form', date:p.registered, fileType:'PDF', sizeKB:128, uploadedBy:'Reception' });
  if (p.conditions && p.conditions.length) {
    const cd = (p.encounters && p.encounters[0]) ? p.encounters[0].date : p.registered;
    out.push({ id:p.id+'-md2', type:'medical', name:'Medical clearance — '+p.conditions[0], date:cd, fileType:'PDF', sizeKB:96, uploadedBy:(p.encounters&&p.encounters[0])?p.encounters[0].doctor:'Clinic' });
  }
  (p.encounters||[]).forEach((e,i)=>{
    const label = e.treatment + (e.tooth ? ' #'+e.tooth : '');
    out.push({ id:p.id+'-c'+i, type:'consent', name:'Consent — '+label, treatment:label, date:e.date, fileType:'PDF', sizeKB:84+i, uploadedBy:'Reception', signed:true, signMethod:(i%2===0?'iPad':'DigiSign') });
    if (/x-ray|check/i.test(e.treatment+' '+(e.note||''))) {
      out.push({ id:p.id+'-x'+i, type:'other', name:'Radiograph — '+(e.tooth?('#'+e.tooth):'panoramic'), date:e.date, fileType:'JPG', sizeKB:540+i*7, uploadedBy:e.doctor });
    }
  });
  return out;
}

// ─── Normalize either patient shape into the rich one the file expects ─────────
function normalizePatient(p) {
  const encounters = (p.encounters && p.encounters.length)
    ? p.encounters
    : (p.encounterHistory || []).map(e => ({
        date: e.date, doctor: e.doctor, kind: e.kind || guessKind(e.procedure),
        treatment: e.procedure, tooth: e.tooth || '', note: e.notes || '', fee: e.fee || 0,
      }));
  return {
    ...p,
    age:        p.age != null ? p.age : ageFromDob(p.dob),
    sex:        p.sex || '—',
    bloodType:  p.bloodType || '—',
    nationality:p.nationality || (p.isInternational ? (p.countryOfResidence || 'International') : '—'),
    marital:    p.marital || '—',
    email:      p.email || '—',
    address:    p.address || (p.isInternational ? (p.countryOfResidence || '—') : '—'),
    insurer:    p.insurer || (p.insurerCategory ? 'Pending' : 'Self-pay'),
    insNo:      p.insNo || p.policy || '—',
    registered: p.registered || p.lastVisit || '',
    allergies:  p.allergies || [],
    conditions: p.conditions || [],
    encounters,
    payments:   p.payments || [],
  };
}

// ════════════════════════════════════════════════════════════════════════════
export default function PatientFile({
  patient,
  role = 'reception',          // 'doctor' | 'reception'
  variant = 'page',            // 'page' (embedded) | 'overlay' (full-screen modal)
  todayAppointment = null,     // doctor: today's appt → "Open encounter" CTA
  onOpenEncounter,             // doctor: add-treatment action
  onSaveNotes,                 // reception: persist reception notes
  onClose,                     // overlay: close handler
}) {
  useConsents();               // re-render when a consent is captured elsewhere
  const norm = useMemo(() => normalizePatient(patient), [patient]);
  const canAddTreatment = role === 'doctor';

  const [tab, setTab]         = useState('overview');
  const [docFilter, setDocFilter] = useState('all');
  const [notes, setNotes]     = useState(patient.notes || '');
  const [saved, setSaved]     = useState(false);

  // Consents captured at Reception (shared store) attach to the file here.
  const recConsents = consentsForQid(norm.qid).map(cc => ({
    id:cc.id, type:'consent', name:'Consent — '+cc.treatment, treatment:cc.treatment, date:cc.date,
    fileType:'PDF', sizeKB:90, uploadedBy:(cc.capturedBy||'Reception'), signed:true, signMethod:cc.method, source:'reception',
  }));
  const recTreat    = new Set(recConsents.map(cc => normalizeTreatment(cc.treatment)));
  const seededDocs  = patient.documents || buildDocuments(norm);
  const builtinDocs = seededDocs.filter(d => !(d.type==='consent' && recTreat.has(normalizeTreatment(d.treatment||d.name))));
  const allDocs     = [...recConsents, ...builtinDocs].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const docFiltered = docFilter==='all' ? allDocs : allDocs.filter(d=>d.type===docFilter);

  const encs = norm.encounters.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const pays = norm.payments.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const initials = norm.nameEn.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const totalBilled = pays.reduce((s,p)=>s+p.amount,0);
  const outstanding = pays.filter(p=>p.status!=='paid').reduce((s,p)=>s+(p.patientPaid||0),0);

  const idLabel = norm.isInternational
    ? (norm.idNumber ? `${norm.idCountry||'Passport'} · ${norm.idNumber}` : 'Passport pending')
    : (norm.qid || 'QID pending');

  const PAY_ST = {
    paid:    {bg:'#D1FAE5',color:'#065F46',label:'Paid'},
    pending: {bg:'#FEF3C7',color:'#92600A',label:'Pending'},
    partial: {bg:'#FFEDD5',color:'#9A3412',label:'Partial'},
  };
  const TABS = [['overview','Overview'],['encounters','Encounters'],['payments','Payments'],['documents','Documents'],['details','Personal']];

  const Row = ({label,value,mono}) => (
    <div style={{display:'flex',justifyContent:'space-between',gap:16,padding:'9px 0',borderBottom:'1px solid #EEF2F0'}}>
      <span style={{fontSize:12.5,fontWeight:600,color:'#5A7870',flexShrink:0}}>{label}</span>
      <span style={{fontSize:13,fontWeight:600,color:'#111814',textAlign:'right',fontFamily:mono?"'IBM Plex Mono',monospace":'inherit'}}>{value}</span>
    </div>
  );

  const saveNotes = () => { onSaveNotes && onSaveNotes(notes); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  const body = (
    <div style={{maxWidth:860,margin:'0 auto',padding:'20px 24px'}}>
      {/* Patient header */}
      <div style={{...card,padding:'18px 20px',marginBottom:16,display:'flex',alignItems:'flex-start',gap:16,flexWrap:'wrap'}}>
        <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#E3EEEA,#CFE3DC)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:PRIMARY,flexShrink:0}}>{initials}</div>
        <div style={{flex:1,minWidth:200}}>
          <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <span style={{fontSize:17,fontWeight:800,color:'#111814',letterSpacing:'-.3px'}}>{norm.nameEn}</span>
            {norm.nameAr&&<span style={{fontSize:14,fontWeight:600,color:'#5A7870',fontFamily:"'Noto Sans Arabic',sans-serif"}}>{norm.nameAr}</span>}
            {norm.isInternational&&<span style={{fontSize:9.5,fontWeight:700,padding:'2px 7px',borderRadius:8,background:'#EFF6FF',color:'#1E40AF'}}>INT&apos;L</span>}
          </div>
          <div style={{fontSize:12.5,fontWeight:600,color:'#5A7870',marginTop:4,display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
            <span style={{fontFamily:"'IBM Plex Mono',monospace"}}>{idLabel}</span>
            {norm.age!=null&&<><span>&#xB7;</span><span>{norm.age}y {norm.sex}</span></>}
            {norm.bloodType!=='—'&&<><span>&#xB7;</span><span>{norm.bloodType}</span></>}
            <span>&#xB7;</span><span style={{color:'#0A6040'}}>{norm.insurer}</span>
            <span>&#xB7;</span><span style={{fontFamily:"'IBM Plex Mono',monospace"}}>{norm.fileNo}</span>
          </div>
          {norm.allergies.length>0&&(
            <div style={{display:'flex',alignItems:'center',gap:6,marginTop:7}}>
              <AlertTriangle size={12} color="#DC4F38"/>
              <span style={{fontSize:12,fontWeight:600,color:'#B02A1E'}}>Allergies: {norm.allergies.join(', ')}</span>
            </div>
          )}
          {norm.conditions.length>0&&(
            <div style={{fontSize:12,fontWeight:600,color:'#5A7870',marginTop:5}}>Conditions: {norm.conditions.join(' · ')}</div>
          )}
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <div style={{fontSize:24,fontWeight:800,color:'#111814',letterSpacing:'-0.5px'}}>{encs.length}</div>
          <div style={{fontSize:11,fontWeight:700,color:'#5A7870',textTransform:'uppercase',letterSpacing:'.06em'}}>Encounters</div>
        </div>
      </div>

      {/* Incomplete-record warning (shown to everyone) */}
      {(!norm.qid || !norm.dob) && !norm.isInternational && (
        <div style={{padding:'10px 14px',marginBottom:16,background:'#FEF9EC',border:'1px solid #FDE68A',borderRadius:9,display:'flex',alignItems:'flex-start',gap:8}}>
          <AlertTriangle size={14} color="#D97706" style={{flexShrink:0,marginTop:1}}/>
          <div>
            <div style={{fontSize:12.5,fontWeight:700,color:'#78400A'}}>Patient record incomplete</div>
            <div style={{fontSize:12,fontWeight:600,color:'#92600A',marginTop:2}}>
              {[!norm.qid&&'Qatar ID',!norm.dob&&'Date of birth'].filter(Boolean).join(' · ')} missing — please complete on arrival.
            </div>
          </div>
        </div>
      )}

      {/* Today CTA + consent gate — doctors only (add-treatment action) */}
      {canAddTreatment && todayAppointment && (()=>{
        const apt = todayAppointment;
        const cs = (norm.qid && findConsent(norm.qid, apt.procedure)) ? 'signed' : (apt.consent || 'signed');
        const ok = cs==='signed';
        return (
          <div style={{marginBottom:16}}>
            {!ok&&(
              <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'12px 16px',background:'#FEF2F2',border:'1px solid #FBC9C2',borderRadius:'12px 12px 0 0',borderBottom:'none'}}>
                <ShieldAlert size={17} color="#DC2626" style={{flexShrink:0,marginTop:1}}/>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:'#991B1B'}}>{cs==='pending'?'Consent form awaiting signature':'No signed consent form on file'}</div>
                  <div style={{fontSize:12,fontWeight:600,color:'#B02A1E',marginTop:2,lineHeight:1.45}}>Do not begin treatment until the consent form for &#x201C;{apt.procedure}&#x201D; is signed at reception.</div>
                </div>
              </div>
            )}
            <div style={{padding:'13px 18px',background:ok?'#F0FAF6':'#FFF7F6',border:'1px solid '+(ok?'#B8DDD6':'#FBC9C2'),borderRadius:ok?12:'0 0 12px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
              <div>
                <div style={{fontSize:13.5,fontWeight:700,color:ok?'#0A6040':'#9A3412'}}>Today &#xB7; {apt.time} &#x2014; {apt.procedure}</div>
                <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3}}>
                  {ok?<ShieldCheck size={13} color="#0A6040"/>:<ShieldAlert size={13} color="#DC2626"/>}
                  <span style={{fontSize:12,fontWeight:700,color:ok?'#0A6040':'#991B1B'}}>{ok?'Consent signed & uploaded':cs==='pending'?'Consent pending signature':'Consent missing'}</span>
                  {apt.status&&<span style={{fontSize:12,fontWeight:600,color:'#8AA8A0',textTransform:'capitalize'}}>&#xB7; {apt.status}</span>}
                </div>
              </div>
              {ok?(
                <button onClick={()=>onOpenEncounter&&onOpenEncounter(apt)} style={{display:'inline-flex',alignItems:'center',gap:7,padding:'9px 16px',borderRadius:9,border:'none',background:PRIMARY,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}><FileText size={13}/>Open encounter</button>
              ):(
                <button onClick={()=>onOpenEncounter&&onOpenEncounter(apt)} style={{display:'inline-flex',alignItems:'center',gap:7,padding:'9px 16px',borderRadius:9,border:'1px solid #E4A8A0',background:'#fff',color:'#9A3412',fontSize:13,fontWeight:700,cursor:'pointer'}}><AlertTriangle size={13}/>Open anyway</button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Sub-tabs — identical everywhere */}
      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {TABS.map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'7px 16px',fontSize:12.5,fontWeight:tab===id?700:600,borderRadius:8,border:'1px solid '+(tab===id?PRIMARY:'#DCE4E0'),background:tab===id?PRIMARY:'#fff',color:tab===id?'#fff':'#4A6860',cursor:'pointer'}}>{lbl}</button>
        ))}
      </div>

      {/* Overview */}
      {tab==='overview'&&(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {[['Total billed','QAR '+totalBilled.toLocaleString(),'#111814'],['Outstanding','QAR '+outstanding.toLocaleString(),outstanding>0?'#9A3412':'#065F46'],['Patient since',fmtDateShort(norm.registered),'#1D4ED8']].map(([l,v,col])=>(
              <div key={l} style={{padding:'12px 16px',background:'#fff',borderRadius:12,border:'1px solid #DCE4E0'}}>
                <div style={{fontSize:18,fontWeight:800,color:col,letterSpacing:'-0.4px'}}>{v}</div>
                <div style={{fontSize:11,fontWeight:700,color:'#5A7870',textTransform:'uppercase',letterSpacing:'.06em',marginTop:3}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={cardHd}><div style={{fontSize:14,fontWeight:700}}>Recent encounters</div></div>
            {encs.length===0?(
              <div style={{padding:'28px 20px',textAlign:'center',color:'#5A7870',fontSize:13,fontWeight:600}}>No encounters recorded</div>
            ):encs.slice(0,3).map((e,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 18px',borderBottom:i<Math.min(encs.length,3)-1?'1px solid #EEF2F0':'none'}}>
                <div style={{width:84,fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:600,color:'#5A7870',flexShrink:0}}>{fmtDateShort(e.date)}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#111814'}}>{e.treatment}{e.tooth&&<span style={{fontWeight:600,color:'#5A7870'}}> &#xB7; #{e.tooth}</span>}</div>
                  <div style={{fontSize:11.5,fontWeight:600,color:'#8AA8A0',marginTop:1}}>{e.doctor}{e.note&&' · '+e.note}</div>
                </div>
                <span style={{fontSize:10.5,fontWeight:700,padding:'2px 8px',borderRadius:10,background:e.kind==='aesthetic'?'#FCE7F3':'#E0F2FE',color:e.kind==='aesthetic'?'#9D174D':'#075985',textTransform:'capitalize'}}>{e.kind}</span>
              </div>
            ))}
          </div>

          {/* Reception notes — part of the shared file; editable by reception */}
          <div style={card}>
            <div style={cardHd}>
              <div style={{fontSize:14,fontWeight:700}}>Reception notes</div>
              {!onSaveNotes&&<span style={{fontSize:11,fontWeight:600,color:'#8AA8A0'}}>read-only</span>}
            </div>
            <div style={{padding:'14px 18px'}}>
              {onSaveNotes?(
                <>
                  <textarea value={notes} onChange={e=>{setNotes(e.target.value);setSaved(false);}} rows={3}
                    placeholder="Notes from reception — preferences, reminders, arrival instructions…"
                    style={{resize:'none',width:'100%',fontFamily:'inherit',fontSize:13,padding:'9px 12px',borderRadius:8,border:'1.5px solid #C8D4CF',background:'#F2F5F3',color:'#111814'}}/>
                  <div style={{display:'flex',justifyContent:'flex-end',marginTop:8}}>
                    <button onClick={saveNotes} disabled={notes===(patient.notes||'')&&!saved}
                      style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:9,border:'none',background:saved?'#0A6040':PRIMARY,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',opacity:(notes===(patient.notes||'')&&!saved)?.4:1}}>
                      {saved?<><CheckCircle2 size={12}/>Saved</>:<><Save size={12}/>Save notes</>}
                    </button>
                  </div>
                </>
              ):(
                <div style={{fontSize:13,fontWeight:600,color:notes?'#3D5850':'#8AA8A0',lineHeight:1.5,whiteSpace:'pre-wrap'}}>{notes||'No reception notes on file.'}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Encounters */}
      {tab==='encounters'&&(
        <div style={card}>
          <div style={cardHd}><div style={{fontSize:14,fontWeight:700}}>Encounter history</div><span style={{fontSize:12,fontWeight:600,color:'#8AA8A0'}}>{encs.length} total</span></div>
          {encs.length===0?(
            <div style={{padding:'36px 20px',textAlign:'center',color:'#5A7870',fontSize:13,fontWeight:600}}>No encounters recorded</div>
          ):encs.map((e,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'13px 18px',borderBottom:i<encs.length-1?'1px solid #EEF2F0':'none'}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:e.kind==='aesthetic'?'#EC4899':'#34D399',flexShrink:0}}/>
              <div style={{width:84,fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:600,color:'#5A7870',flexShrink:0}}>{fmtDateShort(e.date)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:'#111814'}}>{e.treatment}{e.tooth&&<span style={{fontSize:11.5,fontWeight:600,padding:'1px 6px',borderRadius:5,background:'#EEF3F1',color:'#2E4840',fontFamily:"'IBM Plex Mono',monospace",marginLeft:8}}>#{e.tooth}</span>}</div>
                <div style={{fontSize:11.5,fontWeight:600,color:'#8AA8A0',marginTop:2}}>{e.doctor}{e.note&&' · '+e.note}</div>
              </div>
              {e.fee>0&&<div style={{fontSize:13,fontWeight:800,color:'#111814',letterSpacing:'-0.3px',flexShrink:0}}>QAR {e.fee.toLocaleString()}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Payments */}
      {tab==='payments'&&(
        <div style={card}>
          <div style={cardHd}><div style={{fontSize:14,fontWeight:700}}>Payment history</div><span style={{fontSize:12,fontWeight:600,color:'#8AA8A0'}}>QAR {totalBilled.toLocaleString()} billed</span></div>
          {pays.length===0?(
            <div style={{padding:'36px 20px',textAlign:'center',color:'#5A7870',fontSize:13,fontWeight:600}}>No payments recorded</div>
          ):pays.map((p,i)=>{
            const st=PAY_ST[p.status]||PAY_ST.paid;
            return (
              <div key={i} style={{padding:'13px 18px',borderBottom:i<pays.length-1?'1px solid #EEF2F0':'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:'#111814'}}>{p.description}</div>
                    <div style={{fontSize:11.5,fontWeight:600,color:'#8AA8A0',marginTop:2}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace"}}>{p.invoiceNo}</span>
                      <span style={{margin:'0 6px'}}>&#xB7;</span>{fmtDateShort(p.date)}
                      <span style={{margin:'0 6px'}}>&#xB7;</span>{p.method}
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:13.5,fontWeight:800,color:'#111814',letterSpacing:'-0.3px'}}>QAR {p.amount.toLocaleString()}</div>
                    <span style={{fontSize:10.5,fontWeight:700,padding:'2px 8px',borderRadius:10,background:st.bg,color:st.color,display:'inline-block',marginTop:3}}>{st.label}</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:16,marginTop:7,fontSize:11.5,fontWeight:600,color:'#5A7870'}}>
                  <span>Insurer paid: <span style={{color:'#0A6040'}}>QAR {(p.insurerPaid||0).toLocaleString()}</span></span>
                  <span>Patient paid: <span style={{color:'#111814'}}>QAR {(p.patientPaid||0).toLocaleString()}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Documents */}
      {tab==='documents'&&(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
            <div style={{display:'flex',borderRadius:8,overflow:'hidden',border:'1px solid #DCE4E0'}}>
              {[['all','All'],['medical','Medical history'],['consent','Consent forms'],['other','Others']].map(([k,lbl])=>{
                const n = k==='all'?allDocs.length:allDocs.filter(d=>d.type===k).length;
                return <button key={k} onClick={()=>setDocFilter(k)} style={{padding:'6px 13px',fontSize:12.5,fontWeight:docFilter===k?700:500,border:'none',background:docFilter===k?PRIMARY:'#fff',color:docFilter===k?'#fff':'#4A6860',cursor:'pointer',whiteSpace:'nowrap'}}>{lbl} <span style={{opacity:.65,fontWeight:700}}>{n}</span></button>;
              })}
            </div>
            <div style={{flex:1}}/>
            <button style={{display:'inline-flex',alignItems:'center',gap:7,padding:'7px 14px',borderRadius:8,border:'1px dashed #9BC0B6',background:'#F0FAF6',color:PRIMARY,fontSize:12.5,fontWeight:700,cursor:'pointer'}}><Upload size={13}/>Upload document</button>
          </div>
          <div style={card}>
            {docFiltered.length===0?(
              <div style={{padding:'40px 20px',textAlign:'center',color:'#5A7870',fontSize:13,fontWeight:600}}>No documents in this category</div>
            ):docFiltered.map((d,i)=>{
              const meta = DOC_TYPE[d.type]||DOC_TYPE.other; const DI=meta.Icon;
              return (
                <div key={d.id} style={{display:'flex',alignItems:'center',gap:13,padding:'13px 18px',borderBottom:i<docFiltered.length-1?'1px solid #EEF2F0':'none'}}>
                  <div style={{width:38,height:38,borderRadius:9,background:meta.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><DI size={17} color={meta.color}/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:'#111814',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</div>
                    <div style={{fontSize:11.5,fontWeight:600,color:'#8AA8A0',marginTop:2,display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
                      <span style={{padding:'1px 7px',borderRadius:10,background:meta.bg,color:meta.color,fontWeight:700}}>{meta.label}</span>
                      <span className="mono">{d.fileType} &#xB7; {d.sizeKB} KB</span>
                      <span>&#xB7;</span><span>{fmtDateShort(d.date)}</span>
                      <span>&#xB7;</span><span>{d.uploadedBy}</span>
                      {d.source==='reception'&&<span style={{padding:'1px 7px',borderRadius:10,background:'#EEF6FF',color:'#1D4ED8',fontWeight:700}}>via Reception</span>}
                    </div>
                  </div>
                  {d.type==='consent'&&(d.signed?(
                    <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20,background:'#D1FAE5',color:'#065F46',flexShrink:0,whiteSpace:'nowrap'}}><PenLine size={11}/>Signed &#xB7; {d.signMethod}</span>
                  ):(
                    <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20,background:'#FEF3C7',color:'#92600A',flexShrink:0,whiteSpace:'nowrap'}}><AlertCircle size={11}/>Awaiting signature</span>
                  ))}
                  <button title="Download" style={{width:32,height:32,borderRadius:7,border:'1px solid #DCE4E0',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}><Download size={14} color="#5A7870"/></button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Personal details */}
      {tab==='details'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div style={card}>
            <div style={cardHd}><div style={{fontSize:14,fontWeight:700}}>Personal</div></div>
            <div style={{padding:'4px 18px 12px'}}>
              <Row label="Full name" value={norm.nameEn}/>
              <Row label={norm.isInternational?'Passport':'QID'} value={norm.isInternational?(norm.idNumber||'—'):(norm.qid||'—')} mono/>
              <Row label="Date of birth" value={fmtDate(norm.dob)} mono/>
              <Row label="Age / Sex" value={(norm.age!=null?norm.age+'y':'—')+' · '+norm.sex}/>
              <Row label="Nationality" value={norm.nationality}/>
              <Row label="Marital status" value={norm.marital}/>
              <Row label="Blood type" value={norm.bloodType}/>
            </div>
          </div>
          <div style={card}>
            <div style={cardHd}><div style={{fontSize:14,fontWeight:700}}>Contact &amp; insurance</div></div>
            <div style={{padding:'4px 18px 12px'}}>
              <Row label="Phone" value={norm.phone||'—'} mono/>
              <Row label="Email" value={norm.email}/>
              <Row label="Address" value={norm.address}/>
              {norm.isInternational&&<Row label="Country of residence" value={norm.countryOfResidence||'—'}/>}
              {norm.isInternational&&norm.departureDate&&<Row label="Departs Qatar" value={norm.departureDate} mono/>}
              <Row label="Insurer" value={norm.insurer}/>
              <Row label="Insurance no." value={norm.insNo} mono/>
              <Row label="File number" value={norm.fileNo} mono/>
              <Row label="Registered" value={fmtDate(norm.registered)} mono/>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Embedded in a portal page (Doctor) — parent provides the chrome/back button.
  if (variant === 'page') return body;

  // Full-screen overlay (Reception) — the same file, with its own slim chrome.
  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,background:'#EAEDEB',overflowY:'auto',fontFamily:"'Manrope','Noto Sans Arabic',system-ui,sans-serif",color:'#111814'}}>
      <div style={{position:'sticky',top:0,zIndex:10,background:'#0f1f1a',height:54,display:'flex',alignItems:'center',gap:12,padding:'0 20px'}}>
        <button onClick={onClose} style={{width:40,height:40,borderRadius:8,background:'rgba(255,255,255,.08)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',color:'#7AADA0',cursor:'pointer'}}><ChevronLeft size={16}/></button>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:800,color:'#fff',letterSpacing:'-.3px'}}>{norm.nameEn} <span style={{fontWeight:500,color:'#8ECFBB'}}>· Patient file</span></div>
          <div style={{fontSize:11.5,color:'#8ECFBB',fontWeight:600,fontFamily:"'IBM Plex Mono',monospace"}}>{norm.fileNo}</div>
        </div>
        <button onClick={onClose} title="Close" style={{width:40,height:40,borderRadius:8,background:'rgba(255,255,255,.08)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',color:'#7AADA0',cursor:'pointer'}}><X size={16}/></button>
      </div>
      {body}
    </div>
  );
}
