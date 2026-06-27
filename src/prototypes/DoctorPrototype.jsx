import React, { useState, useRef } from 'react';
import {
  ChevronLeft, ChevronDown, ChevronRight, Shield, AlertTriangle,
  CheckCircle2, FileText, Plus, Edit3, Save, X, Bell, Pill,
  Stethoscope, Sparkles, Tag, ExternalLink, AlertCircle, Receipt,
  Calendar, Search, BarChart2, Users,
  ShieldCheck, ShieldAlert, Upload, Download, FileSignature, PenLine
} from 'lucide-react';
import { findConsent, consentsForQid, useConsents, normalizeTreatment } from './consentStore';
import { useTreatments, insurerPricing } from './treatmentStore';
import { setChargesForQid } from './chargeStore';

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
  dental:    { doctor:'Dr. Layla Al-Mahmoud', specialty:'General Dentistry', procedure:'Filling — tooth #16', consent:'signed', time:'10:30', dur:60, chiefComplaint:'Sensitivity to cold on upper-right back tooth, started 4 days ago.' },
  aesthetic: { doctor:'Dr. Reem Al-Thani', specialty:'Aesthetic Medicine', procedure:'Botox + dermal filler review', consent:'missing', time:'15:30', dur:60, chiefComplaint:'Wants to refresh Botox from November and discuss tear-trough filler.' },
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
  { id:'p1', qid:'28934567812', nameEn:'Aisha Al-Kuwari',     nameAr:'عائشة الكواري', age:37, sex:'F', dob:'1989-03-14', nationality:'Qatari', marital:'Married', phone:'+974 5512 4488', email:'aisha.kuwari@gmail.com', address:'Al Waab, Doha', insurer:'QLM',     insNo:'QLM-884512', fileNo:'YC-2024-0142', registered:'2024-02-10', bloodType:'O+',  allergies:['Penicillin','Latex'], conditions:['Type 2 diabetes','Hypertension'], lastVisit:'2026-06-26',
    encounters:[
      { date:'2026-06-25', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Root canal',        tooth:'16', note:'prep stage', fee:900 },
      { date:'2026-06-15', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Cleaning + polish',  tooth:'',   note:'',          fee:380 },
      { date:'2026-04-02', doctor:'Dr. Omar Farouk',      kind:'aesthetic', treatment:'Botox — glabella', tooth:'',  note:'24 units',  fee:1600 },
    ],
    payments:[
      { date:'2026-06-25', invoiceNo:'INV-26418', description:'Root canal #16 (prep)', amount:900,  method:'Insurance + cash', insurerPaid:630, patientPaid:270, status:'paid' },
      { date:'2026-06-15', invoiceNo:'INV-26201', description:'Cleaning + polish',     amount:380,  method:'Insurance',       insurerPaid:380, patientPaid:0,   status:'paid' },
      { date:'2026-04-02', invoiceNo:'INV-25677', description:'Botox — glabella',      amount:1600, method:'Cash',            insurerPaid:0,   patientPaid:1600,status:'paid' },
    ] },
  { id:'p2', qid:'29012345671', nameEn:'Mohammed Al-Rashidi', nameAr:'محمد الراشدي', age:44, sex:'M', dob:'1982-07-22', nationality:'Qatari', marital:'Married', phone:'+974 5523 1122', email:'m.rashidi@outlook.com', address:'West Bay, Doha', insurer:'AXA',     insNo:'AXA-552310', fileNo:'YC-2024-0089', registered:'2024-01-08', bloodType:'A+',  allergies:[], conditions:['Hypertension'], lastVisit:'2026-06-26',
    encounters:[
      { date:'2026-06-24', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Composite filling', tooth:'11', note:'', fee:550 },
      { date:'2026-06-24', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Composite filling', tooth:'12', note:'', fee:550 },
      { date:'2026-06-10', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Abscess drainage',   tooth:'',   note:'emergency', fee:250 },
    ],
    payments:[
      { date:'2026-06-24', invoiceNo:'INV-26390', description:'Composite fillings #11, #12', amount:1100, method:'Insurance + cash', insurerPaid:770, patientPaid:330, status:'paid' },
      { date:'2026-06-10', invoiceNo:'INV-26155', description:'Emergency — abscess drainage', amount:250, method:'Cash', insurerPaid:0, patientPaid:250, status:'paid' },
    ] },
  { id:'p3', qid:'27891234562', nameEn:'Fatima Hassan',       nameAr:'فاطمة حسن', age:29, sex:'F', dob:'1997-11-05', nationality:'Egyptian', marital:'Single', phone:'+974 5534 8877', email:'fatima.h@gmail.com', address:'Al Sadd, Doha', insurer:'Daman',   insNo:'DMN-771029', fileNo:'YC-2025-0204', registered:'2025-03-19', bloodType:'B+',  allergies:['Aspirin'], conditions:[], lastVisit:'2026-06-26',
    encounters:[
      { date:'2026-06-25', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Extraction',        tooth:'28', note:'', fee:350 },
      { date:'2026-06-12', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Composite filling', tooth:'21', note:'', fee:550 },
      { date:'2026-06-23', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Consultation',      tooth:'',   note:'+ OPG', fee:380 },
    ],
    payments:[
      { date:'2026-06-25', invoiceNo:'INV-26412', description:'Extraction #28',          amount:350, method:'Insurance', insurerPaid:280, patientPaid:70, status:'paid' },
      { date:'2026-06-12', invoiceNo:'INV-26188', description:'Composite filling #21',   amount:550, method:'Insurance', insurerPaid:440, patientPaid:110,status:'pending' },
    ] },
  { id:'p4', qid:'30123456783', nameEn:'Sara Al-Jaber',       nameAr:'سارة الجابر', age:52, sex:'F', dob:'1974-01-30', nationality:'Qatari', marital:'Married', phone:'+974 5545 3344', email:'sara.jaber@gmail.com', address:'Al Rayyan, Doha', insurer:'QLM',     insNo:'QLM-330918', fileNo:'YC-2023-0318', registered:'2023-09-11', bloodType:'AB-', allergies:[], conditions:['Osteoporosis'], lastVisit:'2026-06-25',
    encounters:[
      { date:'2026-06-25', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Crown', tooth:'26', note:'impression', fee:1400 },
      { date:'2026-06-20', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Crown', tooth:'25', note:'seat',       fee:1400 },
      { date:'2026-06-05', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Crown', tooth:'25', note:'prep',       fee:1200 },
    ],
    payments:[
      { date:'2026-06-20', invoiceNo:'INV-26301', description:'Crown #25 (seat)', amount:1400, method:'Insurance + cash', insurerPaid:980, patientPaid:420, status:'paid' },
      { date:'2026-06-05', invoiceNo:'INV-26044', description:'Crown #25 (prep)', amount:1200, method:'Insurance + cash', insurerPaid:840, patientPaid:360, status:'paid' },
    ] },
  { id:'p5', qid:'28765432104', nameEn:'Khalid Al-Mansouri',  nameAr:'خالد المنصوري', age:38, sex:'M', dob:'1988-05-17', nationality:'Qatari', marital:'Married', phone:'+974 5556 6655', email:'k.mansouri@gmail.com', address:'Al Gharrafa, Doha', insurer:'MedNet',  insNo:'MDN-119284', fileNo:'YC-2024-0271', registered:'2024-05-22', bloodType:'O-',  allergies:[], conditions:['Type 1 diabetes'], lastVisit:'2026-06-25',
    encounters:[
      { date:'2026-06-25', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Composite filling', tooth:'14', note:'', fee:410 },
      { date:'2026-06-25', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Composite filling', tooth:'15', note:'', fee:410 },
      { date:'2026-06-08', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Root canal',         tooth:'36', note:'', fee:1100 },
    ],
    payments:[
      { date:'2026-06-25', invoiceNo:'INV-26405', description:'Fillings #14, #15', amount:820,  method:'Insurance', insurerPaid:574, patientPaid:246, status:'pending' },
      { date:'2026-06-08', invoiceNo:'INV-26098', description:'Root canal #36',    amount:1100, method:'Insurance + cash', insurerPaid:770, patientPaid:330, status:'paid' },
    ] },
  { id:'p6', qid:'29876543215', nameEn:'Nora Al-Thani',       nameAr:'نورة آل ثاني', age:31, sex:'F', dob:'1995-09-08', nationality:'Qatari', marital:'Single', phone:'+974 5567 9900', email:'nora.thani@gmail.com', address:'The Pearl, Doha', insurer:'QLM',     insNo:'QLM-665201', fileNo:'YC-2025-0387', registered:'2025-06-30', bloodType:'A-',  allergies:[], conditions:[], lastVisit:'2026-06-24',
    encounters:[
      { date:'2026-06-24', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Cleaning',          tooth:'', note:'+ fluoride', fee:420 },
      { date:'2026-06-18', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Composite filling', tooth:'36', note:'', fee:600 },
    ],
    payments:[
      { date:'2026-06-24', invoiceNo:'INV-26388', description:'Cleaning + fluoride',  amount:420, method:'Insurance', insurerPaid:420, patientPaid:0,  status:'paid' },
      { date:'2026-06-18', invoiceNo:'INV-26266', description:'Composite filling #36', amount:600, method:'Insurance', insurerPaid:480, patientPaid:120,status:'paid' },
    ] },
  { id:'p7', qid:'27654321096', nameEn:'Ali Hassan Al-Marri', nameAr:'علي حسن المري', age:55, sex:'M', dob:'1971-02-25', nationality:'Qatari', marital:'Married', phone:'+974 5578 1234', email:'ali.marri@outlook.com', address:'Al Khor, Qatar', insurer:'Allianz', insNo:'ALZ-443098', fileNo:'YC-2022-0056', registered:'2022-04-15', bloodType:'B-',  allergies:['Codeine'], conditions:['Hypertension','Ischemic heart disease'], lastVisit:'2026-06-24',
    encounters:[
      { date:'2026-06-24', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Consultation',   tooth:'', note:'emergency', fee:200 },
      { date:'2026-06-18', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Routine check',  tooth:'', note:'+ X-rays',  fee:300 },
      { date:'2026-06-02', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Denture reline', tooth:'', note:'',          fee:800 },
    ],
    payments:[
      { date:'2026-06-18', invoiceNo:'INV-26261', description:'Routine check + X-rays', amount:300, method:'Insurance', insurerPaid:240, patientPaid:60, status:'paid' },
      { date:'2026-06-02', invoiceNo:'INV-25988', description:'Denture reline',         amount:800, method:'Insurance + cash', insurerPaid:560, patientPaid:240, status:'paid' },
    ] },
  { id:'p8', qid:'28811223344', nameEn:'Hamad Al-Sulaiti',    nameAr:'حمد السليطي', age:41, sex:'M', dob:'1985-06-12', nationality:'Qatari', marital:'Married', phone:'+974 5501 7788', email:'hamad.s@gmail.com', address:'Al Wakrah, Qatar', insurer:'QLM',     insNo:'QLM-201845', fileNo:'YC-2023-0142', registered:'2023-02-28', bloodType:'O+', allergies:[], conditions:[], lastVisit:'2026-05-28',
    encounters:[
      { date:'2026-05-28', doctor:'Dr. Omar Farouk',      kind:'dental', treatment:'Crown',        tooth:'46', note:'seat', fee:1400 },
      { date:'2026-05-14', doctor:'Dr. Omar Farouk',      kind:'dental', treatment:'Crown',        tooth:'46', note:'prep', fee:1200 },
    ],
    payments:[
      { date:'2026-05-28', invoiceNo:'INV-25744', description:'Crown #46 (seat)', amount:1400, method:'Insurance + cash', insurerPaid:980, patientPaid:420, status:'paid' },
    ] },
  { id:'p9', qid:'29933445566', nameEn:'Layla Ahmed',         nameAr:'ليلى أحمد', age:26, sex:'F', dob:'2000-04-19', nationality:'Jordanian', marital:'Single', phone:'+974 5502 9911', email:'layla.ahmed@gmail.com', address:'Al Mansoura, Doha', insurer:'Daman',   insNo:'DMN-339102', fileNo:'YC-2025-0455', registered:'2025-08-12', bloodType:'A+', allergies:['Ibuprofen'], conditions:[], lastVisit:'2026-06-09',
    encounters:[
      { date:'2026-06-09', doctor:'Dr. Layla Al-Mahmoud', kind:'aesthetic', treatment:'Filler — lips', tooth:'', note:'1 ml', fee:1800 },
      { date:'2026-05-02', doctor:'Dr. Layla Al-Mahmoud', kind:'dental',    treatment:'Cleaning',      tooth:'', note:'',     fee:380 },
    ],
    payments:[
      { date:'2026-06-09', invoiceNo:'INV-26117', description:'Lip filler — 1 ml', amount:1800, method:'Cash', insurerPaid:0, patientPaid:1800, status:'paid' },
    ] },
  { id:'p10', qid:'27744556677', nameEn:'Yousef Al-Emadi',    nameAr:'يوسف العمادي', age:49, sex:'M', dob:'1977-12-03', nationality:'Qatari', marital:'Married', phone:'+974 5503 4422', email:'y.emadi@outlook.com', address:'Al Dafna, Doha', insurer:'MedNet',  insNo:'MDN-447821', fileNo:'YC-2022-0311', registered:'2022-11-04', bloodType:'B+', allergies:[], conditions:['Hypertension'], lastVisit:'2026-06-01',
    encounters:[
      { date:'2026-06-01', doctor:'Dr. Omar Farouk', kind:'dental', treatment:'Extraction',  tooth:'18', note:'surgical', fee:650 },
      { date:'2026-03-20', doctor:'Dr. Omar Farouk', kind:'dental', treatment:'Routine check', tooth:'', note:'',         fee:180 },
    ],
    payments:[
      { date:'2026-06-01', invoiceNo:'INV-25981', description:'Surgical extraction #18', amount:650, method:'Insurance', insurerPaid:520, patientPaid:130, status:'paid' },
    ] },
  { id:'p11', qid:'30055667788', nameEn:'Maryam Al-Naimi',    nameAr:'مريم النعيمي', age:34, sex:'F', dob:'1992-08-27', nationality:'Qatari', marital:'Married', phone:'+974 5504 6633', email:'maryam.naimi@gmail.com', address:'Al Aziziyah, Doha', insurer:'QLM',     insNo:'QLM-558210', fileNo:'YC-2024-0398', registered:'2024-07-19', bloodType:'AB+', allergies:[], conditions:[], lastVisit:'2026-06-16',
    encounters:[
      { date:'2026-06-16', doctor:'Dr. Layla Al-Mahmoud', kind:'aesthetic', treatment:'Botox — forehead', tooth:'', note:'20 units', fee:1400 },
      { date:'2026-04-28', doctor:'Dr. Layla Al-Mahmoud', kind:'dental',    treatment:'Composite filling', tooth:'24', note:'', fee:520 },
    ],
    payments:[
      { date:'2026-06-16', invoiceNo:'INV-26240', description:'Botox — forehead', amount:1400, method:'Cash', insurerPaid:0, patientPaid:1400, status:'paid' },
    ] },
  { id:'p12', qid:'27066778899', nameEn:'Abdullah Al-Khalifa', nameAr:'عبدالله الخليفة', age:60, sex:'M', dob:'1966-03-09', nationality:'Bahraini', marital:'Married', phone:'+974 5505 8844', email:'a.khalifa@gmail.com', address:'Onaiza, Doha', insurer:'AXA',     insNo:'AXA-660112', fileNo:'YC-2021-0078', registered:'2021-10-01', bloodType:'O+', allergies:['Penicillin'], conditions:['Diabetes','Hypertension'], lastVisit:'2026-05-19',
    encounters:[
      { date:'2026-05-19', doctor:'Dr. Omar Farouk', kind:'dental', treatment:'Denture reline', tooth:'', note:'full upper', fee:900 },
      { date:'2026-02-11', doctor:'Dr. Omar Farouk', kind:'dental', treatment:'Extraction',     tooth:'27', note:'',          fee:350 },
    ],
    payments:[
      { date:'2026-05-19', invoiceNo:'INV-25688', description:'Denture reline — upper', amount:900, method:'Insurance + cash', insurerPaid:630, patientPaid:270, status:'partial' },
    ] },
  { id:'p13', qid:'30177889900', nameEn:'Reem Al-Hajri',      nameAr:'ريم الهاجري', age:22, sex:'F', dob:'2004-01-15', nationality:'Qatari', marital:'Single', phone:'+974 5506 1199', email:'reem.hajri@gmail.com', address:'Al Thumama, Doha', insurer:'Daman',   insNo:'DMN-771840', fileNo:'YC-2025-0512', registered:'2025-11-23', bloodType:'A-', allergies:[], conditions:[], lastVisit:'2026-06-21',
    encounters:[
      { date:'2026-06-21', doctor:'Dr. Layla Al-Mahmoud', kind:'dental', treatment:'Cleaning', tooth:'', note:'+ polish', fee:380 },
    ],
    payments:[
      { date:'2026-06-21', invoiceNo:'INV-26333', description:'Cleaning + polish', amount:380, method:'Insurance', insurerPaid:380, patientPaid:0, status:'paid' },
    ] },
  { id:'p14', qid:'28288990011', nameEn:'Saif Al-Dosari',     nameAr:'سيف الدوسري', age:45, sex:'M', dob:'1981-10-30', nationality:'Qatari', marital:'Married', phone:'+974 5507 3300', email:'saif.dosari@outlook.com', address:'Muaither, Doha', insurer:'Allianz', insNo:'ALZ-882017', fileNo:'YC-2023-0267', registered:'2023-06-08', bloodType:'B+', allergies:[], conditions:[], lastVisit:'2026-06-04',
    encounters:[
      { date:'2026-06-04', doctor:'Dr. Omar Farouk', kind:'dental', treatment:'Root canal', tooth:'26', note:'', fee:1100 },
      { date:'2026-03-15', doctor:'Dr. Omar Farouk', kind:'dental', treatment:'Composite filling', tooth:'25', note:'', fee:520 },
    ],
    payments:[
      { date:'2026-06-04', invoiceNo:'INV-26010', description:'Root canal #26', amount:1100, method:'Insurance + cash', insurerPaid:770, patientPaid:330, status:'paid' },
    ] },
  { id:'p15', qid:'29399001122', nameEn:'Huda Al-Emadi',      nameAr:'هدى العمادي', age:39, sex:'F', dob:'1987-05-21', nationality:'Qatari', marital:'Married', phone:'+974 5508 5511', email:'huda.emadi@gmail.com', address:'Al Hilal, Doha', insurer:'QLM',     insNo:'QLM-990187', fileNo:'YC-2024-0203', registered:'2024-03-30', bloodType:'O+', allergies:['Latex'], conditions:[], lastVisit:'2026-06-13',
    encounters:[
      { date:'2026-06-13', doctor:'Dr. Layla Al-Mahmoud', kind:'aesthetic', treatment:'Filler — cheeks', tooth:'', note:'2 ml', fee:3200 },
      { date:'2026-05-09', doctor:'Dr. Layla Al-Mahmoud', kind:'dental',    treatment:'Cleaning',        tooth:'', note:'',     fee:380 },
    ],
    payments:[
      { date:'2026-06-13', invoiceNo:'INV-26198', description:'Cheek filler — 2 ml', amount:3200, method:'Cash', insurerPaid:0, patientPaid:3200, status:'paid' },
    ] },
  { id:'p16', qid:'27400112233', nameEn:'Tariq Mahmoud',      nameAr:'طارق محمود', age:33, sex:'M', dob:'1993-07-07', nationality:'Sudanese', marital:'Single', phone:'+974 5509 7722', email:'tariq.m@gmail.com', address:'Najma, Doha', insurer:'MedNet',  insNo:'MDN-110298', fileNo:'YC-2025-0334', registered:'2025-05-17', bloodType:'A+', allergies:[], conditions:[], lastVisit:'2026-06-07',
    encounters:[
      { date:'2026-06-07', doctor:'Dr. Omar Farouk', kind:'dental', treatment:'Routine check', tooth:'', note:'+ X-rays', fee:300 },
    ],
    payments:[
      { date:'2026-06-07', invoiceNo:'INV-26072', description:'Routine check + X-rays', amount:300, method:'Insurance', insurerPaid:240, patientPaid:60, status:'pending' },
    ] },
];

// ─── Patient document builder (medical history, consent forms, others) ─────────
const DOC_TYPE = {
  medical: { label:'Medical history', bg:'#EFF6FF', color:'#1D4ED8', Icon:FileText },
  consent: { label:'Consent form',    bg:'#F0FAF6', color:'#0C6B5A', Icon:FileSignature },
  other:   { label:'Other',           bg:'#FAF5FF', color:'#7C3AED', Icon:FileText },
};

function buildDocuments(p) {
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
ALL_PATIENTS.forEach(p=>{ p.documents = buildDocuments(p); });

// Map appointment patientId -> QID (the shared key with the Reception portal)
const QID_BY_PID = {};
ALL_PATIENTS.forEach(p=>{ QID_BY_PID[p.id] = p.qid; });

// A treatment is consented if Reception captured a matching consent (shared
// store, by QID + treatment); otherwise fall back to the seeded status.
function consentState(qid, procedure, seed) {
  if (qid && findConsent(qid, procedure)) return 'signed';
  return seed || 'signed';
}

const MY_SCHEDULE = [
  { id:'s1',  date:'2026-06-26', time:'09:00', dur:30, patientId:'p2', patientName:'Mohammed Al-Rashidi', procedure:'Routine check + X-rays',         status:'done',        consent:'signed',  kind:'dental', fileNo:'YC-2024-0089' },
  { id:'s2',  date:'2026-06-26', time:'09:45', dur:15, patientId:'p3', patientName:'Fatima Hassan',       procedure:'Post-op review — extraction #28', status:'done',        consent:'signed',  kind:'dental', fileNo:'YC-2025-0204' },
  { id:'s3',  date:'2026-06-26', time:'10:30', dur:60, patientId:'p1', patientName:'Aisha Al-Kuwari',     procedure:'Filling — tooth #16',             status:'in-progress', consent:'missing', kind:'dental', fileNo:'YC-2024-0142' },
  { id:'s4',  date:'2026-06-26', time:'12:00', dur:45, patientId:'p4', patientName:'Sara Al-Jaber',       procedure:'Crown prep — tooth #26',          status:'booked',      consent:'missing', kind:'dental', fileNo:'YC-2023-0318' },
  { id:'s5',  date:'2026-06-26', time:'13:00', dur:30, patientId:'p5', patientName:'Khalid Al-Mansouri',  procedure:'Emergency — toothache #36',       status:'booked',      consent:'signed',  kind:'dental', fileNo:'YC-2024-0271' },
  { id:'s6',  date:'2026-06-26', time:'14:00', dur:60, patientId:'p6', patientName:'Nora Al-Thani',       procedure:'Scaling & root planing',          status:'booked',      consent:'pending', kind:'dental', fileNo:'YC-2025-0387' },
  { id:'s7',  date:'2026-06-26', time:'15:30', dur:30, patientId:'p7', patientName:'Ali Hassan Al-Marri', procedure:'Consultation + treatment plan',   status:'booked',      consent:'missing', kind:'dental', fileNo:'YC-2022-0056' },
  { id:'s8',  date:'2026-06-25', time:'09:00', dur:60, patientId:'p1', patientName:'Aisha Al-Kuwari',     procedure:'Root canal — #16 prep',           status:'done',        consent:'signed',  kind:'dental', fileNo:'YC-2024-0142' },
  { id:'s9',  date:'2026-06-25', time:'10:30', dur:30, patientId:'p3', patientName:'Fatima Hassan',       procedure:'Extraction #28',                  status:'done',        consent:'signed',  kind:'dental', fileNo:'YC-2025-0204' },
  { id:'s10', date:'2026-06-25', time:'11:30', dur:45, patientId:'p5', patientName:'Khalid Al-Mansouri',  procedure:'Filling #14 + #15',               status:'done',        consent:'signed',  kind:'dental', fileNo:'YC-2024-0271' },
  { id:'s11', date:'2026-06-25', time:'13:30', dur:30, patientId:'p7', patientName:'Ali Hassan Al-Marri', procedure:'Routine check',                   status:'no-show',     consent:'signed',  kind:'dental', fileNo:'YC-2022-0056' },
  { id:'s12', date:'2026-06-25', time:'14:30', dur:60, patientId:'p4', patientName:'Sara Al-Jaber',       procedure:'Crown impression #26',            status:'done',        consent:'signed',  kind:'dental', fileNo:'YC-2023-0318' },
  { id:'s13', date:'2026-06-24', time:'09:30', dur:60, patientId:'p2', patientName:'Mohammed Al-Rashidi', procedure:'Composite fillings #11, #12',      status:'done',        consent:'signed',  kind:'dental', fileNo:'YC-2024-0089' },
  { id:'s14', date:'2026-06-24', time:'11:00', dur:30, patientId:'p6', patientName:'Nora Al-Thani',       procedure:'Cleaning + fluoride',             status:'done',        consent:'signed',  kind:'dental', fileNo:'YC-2025-0387' },
  { id:'s15', date:'2026-06-24', time:'13:00', dur:45, patientId:'p1', patientName:'Aisha Al-Kuwari',     procedure:'Bitewing X-rays',                 status:'done',        consent:'signed',  kind:'dental', fileNo:'YC-2024-0142' },
  { id:'s16', date:'2026-06-24', time:'15:00', dur:30, patientId:'p7', patientName:'Ali Hassan Al-Marri', procedure:'Emergency — broken crown #36',    status:'done',        consent:'signed',  kind:'dental', fileNo:'YC-2022-0056' },
];

const PROCEDURE_REPORT = [
  // Each row = one treatment type on one tooth (teeth bundled in a visit are split out).
  // `treatment` is the normalized type; `teeth` is the tooth number(s) it was done on.
  { id:'pr1',  date:'2026-06-25', patientName:'Aisha Al-Kuwari',     treatment:'Root canal',       teeth:['16'], note:'prep',       code:'D3310', amount:900,  kind:'dental', insurer:'QLM'     },
  { id:'pr2',  date:'2026-06-25', patientName:'Fatima Hassan',       treatment:'Extraction',       teeth:['28'], note:'',           code:'D7210', amount:350,  kind:'dental', insurer:'Daman'   },
  { id:'pr3',  date:'2026-06-25', patientName:'Khalid Al-Mansouri',  treatment:'Composite filling', teeth:['14'], note:'',           code:'D2391', amount:410,  kind:'dental', insurer:'MedNet'  },
  { id:'pr4',  date:'2026-06-25', patientName:'Khalid Al-Mansouri',  treatment:'Composite filling', teeth:['15'], note:'',           code:'D2391', amount:410,  kind:'dental', insurer:'MedNet'  },
  { id:'pr5',  date:'2026-06-25', patientName:'Sara Al-Jaber',       treatment:'Crown',            teeth:['26'], note:'impression', code:'D2752', amount:1400, kind:'dental', insurer:'QLM'     },
  { id:'pr6',  date:'2026-06-24', patientName:'Mohammed Al-Rashidi', treatment:'Composite filling', teeth:['11'], note:'',           code:'D2391', amount:550,  kind:'dental', insurer:'AXA'     },
  { id:'pr7',  date:'2026-06-24', patientName:'Mohammed Al-Rashidi', treatment:'Composite filling', teeth:['12'], note:'',           code:'D2391', amount:550,  kind:'dental', insurer:'AXA'     },
  { id:'pr8',  date:'2026-06-24', patientName:'Nora Al-Thani',       treatment:'Cleaning',         teeth:[],     note:'+ fluoride', code:'D1110', amount:420,  kind:'dental', insurer:'QLM'     },
  { id:'pr9',  date:'2026-06-24', patientName:'Aisha Al-Kuwari',     treatment:'X-rays',           teeth:[],     note:'bitewing',   code:'D0274', amount:220,  kind:'dental', insurer:'QLM'     },
  { id:'pr10', date:'2026-06-24', patientName:'Ali Hassan Al-Marri', treatment:'Consultation',     teeth:[],     note:'emergency',  code:'D9110', amount:200,  kind:'dental', insurer:'Allianz' },
  { id:'pr11', date:'2026-06-23', patientName:'Fatima Hassan',       treatment:'Consultation',     teeth:[],     note:'+ OPG',      code:'D0330', amount:380,  kind:'dental', insurer:'Daman'   },
  { id:'pr12', date:'2026-06-23', patientName:'Khalid Al-Mansouri',  treatment:'Routine check',    teeth:[],     note:'',           code:'D0120', amount:180,  kind:'dental', insurer:'MedNet'  },
  { id:'pr13', date:'2026-06-20', patientName:'Mohammed Al-Rashidi', treatment:'Scaling & polish', teeth:[],     note:'',           code:'D1110', amount:380,  kind:'dental', insurer:'AXA'     },
  { id:'pr14', date:'2026-06-20', patientName:'Sara Al-Jaber',       treatment:'Crown',            teeth:['25'], note:'seat',       code:'D2752', amount:1400, kind:'dental', insurer:'QLM'     },
  { id:'pr15', date:'2026-06-18', patientName:'Nora Al-Thani',       treatment:'Composite filling', teeth:['36'], note:'',           code:'D2391', amount:600,  kind:'dental', insurer:'QLM'     },
  { id:'pr16', date:'2026-06-18', patientName:'Ali Hassan Al-Marri', treatment:'Routine check',    teeth:[],     note:'+ X-rays',   code:'D0120', amount:300,  kind:'dental', insurer:'Allianz' },
  { id:'pr17', date:'2026-06-15', patientName:'Aisha Al-Kuwari',     treatment:'Cleaning',         teeth:[],     note:'+ polish',   code:'D1110', amount:380,  kind:'dental', insurer:'QLM'     },
  { id:'pr18', date:'2026-06-12', patientName:'Fatima Hassan',       treatment:'Composite filling', teeth:['21'], note:'',           code:'D2391', amount:550,  kind:'dental', insurer:'Daman'   },
  { id:'pr19', date:'2026-06-10', patientName:'Mohammed Al-Rashidi', treatment:'Abscess drainage', teeth:[],     note:'emergency',  code:'D9110', amount:250,  kind:'dental', insurer:'AXA'     },
  { id:'pr20', date:'2026-06-08', patientName:'Khalid Al-Mansouri',  treatment:'Root canal',       teeth:['36'], note:'',           code:'D3330', amount:1100, kind:'dental', insurer:'MedNet'  },
  { id:'pr21', date:'2026-06-05', patientName:'Sara Al-Jaber',       treatment:'Crown',            teeth:['25'], note:'prep',       code:'D2750', amount:1200, kind:'dental', insurer:'QLM'     },
  { id:'pr22', date:'2026-06-02', patientName:'Ali Hassan Al-Marri', treatment:'Denture reline',   teeth:[],     note:'',           code:'D5730', amount:800,  kind:'dental', insurer:'Allianz' },
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
  const [activeApt, setActiveApt]             = useState(null);
  const isDental = mode === 'dental';

  const openEncounter = apt => { if (apt?.kind) setMode(apt.kind); setActiveApt(apt||null); setView('encounter'); setViewingEnc(null); };
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
          <PatientBanner patient={PATIENT} appointment={{...TODAYS_APT[mode], ...(activeApt||{})}} mode={mode}/>
          {viewingEnc?(
            <PastEncounterView enc={viewingEnc} onBack={()=>setViewingEnc(null)}/>
          ):(
            <EncounterPanel mode={mode} isDental={isDental} onView={setViewingEnc} appointment={activeApt}/>
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
  useConsents();
  const apts = MY_SCHEDULE.filter(a=>a.date===date).sort((a,b)=>a.time.localeCompare(b.time));
  const ST = {
    'done':        {bg:'#D1FAE5',color:'#065F46',label:'Done',        bar:'#34D399'},
    'in-progress': {bg:'#F0FAF6',color:'#0C6B5A',label:'In progress', bar:CLINIC_CONFIG.primaryColor},
    'booked':      {bg:'#F5F8F7',color:'#5A7870',label:'Booked',      bar:'#C8D4CF'},
    'no-show':     {bg:'#FEF2F2',color:'#991B1B',label:'No-show',     bar:'#FCA5A5'},
    'cancelled':   {bg:'#FFF7ED',color:'#92400E',label:'Cancelled',   bar:'#FCD34D'},
  };
  const CONSENT = {
    signed:  {bg:'#D1FAE5',color:'#065F46',short:'Consent',   label:'Consent signed & uploaded',         Icon:ShieldCheck},
    pending: {bg:'#FEF3C7',color:'#92600A',short:'Pending',   label:'Consent form awaiting signature',   Icon:Shield},
    missing: {bg:'#FEE2E2',color:'#991B1B',short:'No consent', label:'No consent form — do not begin',    Icon:ShieldAlert},
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
            const cm=CONSENT[consentState(QID_BY_PID[apt.patientId], apt.procedure, apt.consent)]||CONSENT.signed; const CI=cm.Icon;
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
                <span title={cm.label} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 9px',borderRadius:20,background:cm.bg,color:cm.color,fontSize:11,fontWeight:700,flexShrink:0,whiteSpace:'nowrap'}}><CI size={12}/>{cm.short}</span>
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
function PatientSearchTab({ onOpenPatient }) {
  const [query, setQuery] = useState('');
  const q = query.trim();
  const active = q.length>=2;
  const shown = active ? ALL_PATIENTS.filter(p=>
    p.nameEn.toLowerCase().includes(q.toLowerCase()) ||
    p.qid.includes(q) ||
    p.fileNo.toLowerCase().includes(q.toLowerCase())
  ) : [];
  const initials = n => n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{position:'relative'}}>
        <Search size={15} color="#8AA8A0" style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search all clinic records — name, QID, or file number..." style={{paddingLeft:40,fontSize:13.5}} autoFocus/>
      </div>

      {!active?(
        <div style={{...card,padding:'52px 24px',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
          <div style={{width:48,height:48,borderRadius:'50%',background:'#F0F5F3',display:'flex',alignItems:'center',justifyContent:'center'}}><Search size={20} color="#7A9A90"/></div>
          <div style={{fontSize:14,fontWeight:700,color:'#3D5850'}}>Search the clinic patient registry</div>
          <div style={{fontSize:12.5,fontWeight:600,color:'#8AA8A0',maxWidth:340,lineHeight:1.5}}>Type a patient&#x2019;s name, QID, or file number to look up their full record &#x2014; across all {ALL_PATIENTS.length} registered patients, not just your own.</div>
        </div>
      ):shown.length===0?(
        <div style={{...card,padding:'48px 20px',textAlign:'center',color:'#5A7870',fontSize:13,fontWeight:600}}>No patients match &#x201C;{q}&#x201D;</div>
      ):(
        <>
          <div style={{fontSize:12,fontWeight:700,color:'#5A7870',padding:'0 2px'}}>{shown.length} {shown.length===1?'result':'results'}</div>
          <div style={card}>
            {shown.map((pt,i)=>(
              <div key={pt.id} className="pt-row" onClick={()=>onOpenPatient(pt)}
                style={{display:'flex',alignItems:'center',gap:12,padding:'13px 18px',borderBottom:i<shown.length-1?'1px solid #EEF2F0':'none',cursor:'pointer'}}>
                <div style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#E3EEEA,#CFE3DC)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#0C6B5A',flexShrink:0}}>{initials(pt.nameEn)}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13.5,fontWeight:700,color:'#111814'}}>{pt.nameEn}</div>
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
            ))}
          </div>
        </>
      )}
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
    (txFilter==='all'||p.treatment===txFilter)
  );

  const totalRev = filtered.reduce((s,p)=>s+p.amount,0);
  const avgRev   = filtered.length?Math.round(totalRev/filtered.length):0;
  const uniqueTx = [...new Set(PROCEDURE_REPORT.map(p=>p.treatment))].sort();

  // group by treatment type
  const gmap = {};
  filtered.forEach(p=>{ (gmap[p.treatment] = gmap[p.treatment]||[]).push(p); });
  const groups = Object.keys(gmap).map(name=>{
    const rows = gmap[name].slice().sort((a,b)=>b.date.localeCompare(a.date));
    return {
      name, rows,
      revenue: rows.reduce((s,p)=>s+p.amount,0),
      teeth:   rows.reduce((n,p)=>n+(p.teeth?p.teeth.length:0),0),
    };
  }).sort((a,b)=>b.revenue-a.revenue);

  const COLS = '88px 1fr 86px 64px 96px 76px';

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Filter bar */}
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
        <select value={txFilter} onChange={e=>setTx(e.target.value)} style={{flex:1,maxWidth:240,fontSize:12.5,padding:'6px 12px',width:'auto'}}>
          <option value="all">All treatments</option>
          {uniqueTx.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Custom date range */}
      {period==='custom'&&(
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'#F5F8F7',borderRadius:10,border:'1px solid #DCE4E0',flexWrap:'wrap'}}>
          <span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>From</span>
          <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} style={{width:165,fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}/>
          <span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>To</span>
          <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} style={{width:165,fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}/>
        </div>
      )}

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
        {[['Procedures',filtered.length,'#111814'],['Total revenue','QAR '+totalRev.toLocaleString(),'#0C6B5A'],['Treatment types',groups.length,'#1D4ED8']].map(([l,v,col])=>(
          <div key={l} style={{padding:'12px 16px',background:'#fff',borderRadius:12,border:'1px solid #DCE4E0'}}>
            <div style={{fontSize:20,fontWeight:800,color:col,letterSpacing:'-0.5px'}}>{v}</div>
            <div style={{fontSize:11.5,fontWeight:700,color:'#5A7870',textTransform:'uppercase',letterSpacing:'.06em',marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Grouped table */}
      {groups.length===0?(
        <div style={{...card,padding:'48px 20px',textAlign:'center',color:'#5A7870',fontSize:13,fontWeight:600}}>No procedures in this period</div>
      ):(
        groups.map(g=>(
          <div key={g.name} style={{...card,overflow:'hidden'}}>
            {/* Group header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 18px',background:'#F3F7F5',borderBottom:'1px solid #E3EBE7'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:13.5,fontWeight:800,color:'#111814',letterSpacing:'-.2px'}}>{g.name}</span>
                <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10,background:'#fff',border:'1px solid #DCE4E0',color:'#5A7870'}}>{g.rows.length} {g.rows.length===1?'procedure':'procedures'}</span>
                {g.teeth>0&&<span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10,background:'#EFF6FF',color:'#1D4ED8'}}>{g.teeth} {g.teeth===1?'tooth':'teeth'}</span>}
              </div>
              <span style={{fontSize:13.5,fontWeight:800,color:'#0C6B5A',letterSpacing:'-0.3px'}}>QAR {g.revenue.toLocaleString()}</span>
            </div>
            {/* Column headers */}
            <div style={{display:'grid',gridTemplateColumns:COLS,padding:'7px 18px',background:'#F8FAF9',borderBottom:'1px solid #EEF2F0'}}>
              {['Date','Patient','Tooth','Code','Amount','Insurer'].map(h=>(
                <div key={h} style={{fontSize:10.5,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#2E4840'}}>{h}</div>
              ))}
            </div>
            {/* Rows */}
            {g.rows.map((p,i)=>(
              <div key={p.id} style={{display:'grid',gridTemplateColumns:COLS,padding:'10px 18px',borderBottom:i<g.rows.length-1?'1px solid #EEF2F0':'none',alignItems:'center'}}>
                <div style={{fontSize:12,fontWeight:600,color:'#5A7870',fontFamily:"'IBM Plex Mono',monospace"}}>{fmtDateShort(p.date)}</div>
                <div style={{fontSize:13,fontWeight:600,color:'#111814',paddingRight:8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {p.patientName}
                  {p.note&&<span style={{fontSize:11,fontWeight:600,color:'#8AA8A0',marginLeft:6}}>{p.note}</span>}
                </div>
                <div>
                  {p.teeth&&p.teeth.length>0?(
                    <span style={{display:'inline-flex',gap:3,flexWrap:'wrap'}}>
                      {p.teeth.map(t=>(
                        <span key={t} style={{fontSize:11.5,fontWeight:600,padding:'1px 6px',borderRadius:5,background:'#EEF3F1',color:'#2E4840',fontFamily:"'IBM Plex Mono',monospace"}}>#{t}</span>
                      ))}
                    </span>
                  ):(
                    <span style={{fontSize:12,color:'#C8D4CF'}}>&#x2014;</span>
                  )}
                </div>
                <div style={{fontSize:12,fontWeight:600,color:'#4E6860',fontFamily:"'IBM Plex Mono',monospace"}}>{p.code}</div>
                <div style={{fontSize:13,fontWeight:800,color:'#111814',letterSpacing:'-0.3px'}}>QAR {p.amount.toLocaleString()}</div>
                <div style={{fontSize:12,fontWeight:600,color:'#5A7870'}}>{p.insurer}</div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

// ─── Patient File View ─────────────────────────────────────────────────────────
function PatientFileView({ patient, onBack, onOpenEncounter }) {
  const [tab, setTab] = useState('overview');
  const [docFilter, setDocFilter] = useState('all');
  useConsents();
  const todayApt  = MY_SCHEDULE.find(a=>a.date===TODAY&&a.patientId===patient.id);
  // Consents captured at Reception (shared store) attach to the patient file here.
  const recConsents = consentsForQid(patient.qid).map(cc=>({
    id:cc.id, type:'consent', name:'Consent — '+cc.treatment, treatment:cc.treatment, date:cc.date,
    fileType:'PDF', sizeKB:90, uploadedBy:(cc.capturedBy||'Reception'), signed:true, signMethod:cc.method, source:'reception',
  }));
  const recTreat    = new Set(recConsents.map(cc=>normalizeTreatment(cc.treatment)));
  const builtinDocs = (patient.documents||[]).filter(d=> !(d.type==='consent' && recTreat.has(normalizeTreatment(d.treatment||d.name))));
  const allDocs     = [...recConsents, ...builtinDocs].sort((a,b)=>b.date.localeCompare(a.date));
  const docFiltered = docFilter==='all' ? allDocs : allDocs.filter(d=>d.type===docFilter);
  const encs      = (patient.encounters||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
  const pays      = (patient.payments||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
  const initials  = patient.nameEn.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const totalBilled  = pays.reduce((s,p)=>s+p.amount,0);
  const outstanding  = pays.filter(p=>p.status!=='paid').reduce((s,p)=>s+p.patientPaid,0);
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
  return (
    <div style={{maxWidth:860,margin:'0 auto',padding:'20px 24px'}}>
      {/* Patient header */}
      <div style={{...card,padding:'18px 20px',marginBottom:16,display:'flex',alignItems:'flex-start',gap:16,flexWrap:'wrap'}}>
        <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#E3EEEA,#CFE3DC)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:'#0C6B5A',flexShrink:0}}>{initials}</div>
        <div style={{flex:1,minWidth:200}}>
          <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <span style={{fontSize:17,fontWeight:800,color:'#111814',letterSpacing:'-.3px'}}>{patient.nameEn}</span>
            {patient.nameAr&&<span style={{fontSize:14,fontWeight:600,color:'#5A7870',fontFamily:"'Noto Sans Arabic',sans-serif"}}>{patient.nameAr}</span>}
          </div>
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
          <div style={{fontSize:24,fontWeight:800,color:'#111814',letterSpacing:'-0.5px'}}>{encs.length}</div>
          <div style={{fontSize:11,fontWeight:700,color:'#5A7870',textTransform:'uppercase',letterSpacing:'.06em'}}>Encounters</div>
        </div>
      </div>

      {/* Today CTA + consent gate */}
      {todayApt&&(()=>{
        const cs = consentState(patient.qid, todayApt.procedure, todayApt.consent);
        const ok = cs==='signed';
        return (
          <div style={{marginBottom:16}}>
            {!ok&&(
              <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'12px 16px',background:'#FEF2F2',border:'1px solid #FBC9C2',borderRadius:'12px 12px 0 0',borderBottom:'none'}}>
                <ShieldAlert size={17} color="#DC2626" style={{flexShrink:0,marginTop:1}}/>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:'#991B1B'}}>{cs==='pending'?'Consent form awaiting signature':'No signed consent form on file'}</div>
                  <div style={{fontSize:12,fontWeight:600,color:'#B02A1E',marginTop:2,lineHeight:1.45}}>Do not begin treatment until the consent form for &#x201C;{todayApt.procedure}&#x201D; is signed at reception.</div>
                </div>
              </div>
            )}
            <div style={{padding:'13px 18px',background:ok?'#F0FAF6':'#FFF7F6',border:'1px solid '+(ok?'#B8DDD6':'#FBC9C2'),borderRadius:ok?12:'0 0 12px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
              <div>
                <div style={{fontSize:13.5,fontWeight:700,color:ok?'#0A6040':'#9A3412'}}>Today &#xB7; {todayApt.time} &#x2014; {todayApt.procedure}</div>
                <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3}}>
                  {ok?<ShieldCheck size={13} color="#0A6040"/>:<ShieldAlert size={13} color="#DC2626"/>}
                  <span style={{fontSize:12,fontWeight:700,color:ok?'#0A6040':'#991B1B'}}>{ok?'Consent signed & uploaded':cs==='pending'?'Consent pending signature':'Consent missing'}</span>
                  <span style={{fontSize:12,fontWeight:600,color:'#8AA8A0',textTransform:'capitalize'}}>&#xB7; {todayApt.status}</span>
                </div>
              </div>
              {ok?(
                <PrimaryBtn onClick={()=>onOpenEncounter(todayApt)}><FileText size={13}/>Open encounter</PrimaryBtn>
              ):(
                <button onClick={()=>onOpenEncounter(todayApt)} style={{display:'inline-flex',alignItems:'center',gap:7,padding:'9px 16px',borderRadius:9,border:'1px solid #E4A8A0',background:'#fff',color:'#9A3412',fontSize:13,fontWeight:700,cursor:'pointer'}}><AlertTriangle size={13}/>Open anyway</button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Sub-tabs */}
      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {TABS.map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'7px 16px',fontSize:12.5,fontWeight:tab===id?700:600,borderRadius:8,border:'1px solid '+(tab===id?CLINIC_CONFIG.primaryColor:'#DCE4E0'),background:tab===id?CLINIC_CONFIG.primaryColor:'#fff',color:tab===id?'#fff':'#4A6860',cursor:'pointer'}}>{lbl}</button>
        ))}
      </div>

      {/* Overview */}
      {tab==='overview'&&(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {[['Total billed','QAR '+totalBilled.toLocaleString(),'#111814'],['Outstanding','QAR '+outstanding.toLocaleString(),outstanding>0?'#9A3412':'#065F46'],['Patient since',fmtDateShort(patient.registered),'#1D4ED8']].map(([l,v,col])=>(
              <div key={l} style={{padding:'12px 16px',background:'#fff',borderRadius:12,border:'1px solid #DCE4E0'}}>
                <div style={{fontSize:18,fontWeight:800,color:col,letterSpacing:'-0.4px'}}>{v}</div>
                <div style={{fontSize:11,fontWeight:700,color:'#5A7870',textTransform:'uppercase',letterSpacing:'.06em',marginTop:3}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={cardHd}><div style={{fontSize:14,fontWeight:700}}>Recent encounters</div></div>
            {encs.slice(0,3).map((e,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 18px',borderBottom:i<Math.min(encs.length,3)-1?'1px solid #EEF2F0':'none'}}>
                <div style={{width:84,fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:600,color:'#5A7870',flexShrink:0}}>{fmtDateShort(e.date)}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#111814'}}>{e.treatment}{e.tooth&&<span style={{fontWeight:600,color:'#5A7870'}}> &#xB7; #{e.tooth}</span>}</div>
                  <div style={{fontSize:11.5,fontWeight:600,color:'#8AA8A0',marginTop:1}}>{e.doctor}{e.note&&' &#xB7; '+e.note}</div>
                </div>
                <span style={{fontSize:10.5,fontWeight:700,padding:'2px 8px',borderRadius:10,background:e.kind==='aesthetic'?'#FCE7F3':'#E0F2FE',color:e.kind==='aesthetic'?'#9D174D':'#075985',textTransform:'capitalize'}}>{e.kind}</span>
              </div>
            ))}
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
                <div style={{fontSize:11.5,fontWeight:600,color:'#8AA8A0',marginTop:2}}>{e.doctor}{e.note&&' &#xB7; '+e.note}</div>
              </div>
              <div style={{fontSize:13,fontWeight:800,color:'#111814',letterSpacing:'-0.3px',flexShrink:0}}>QAR {e.fee.toLocaleString()}</div>
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
                  <span>Insurer paid: <span style={{color:'#0A6040'}}>QAR {p.insurerPaid.toLocaleString()}</span></span>
                  <span>Patient paid: <span style={{color:'#111814'}}>QAR {p.patientPaid.toLocaleString()}</span></span>
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
                return <button key={k} onClick={()=>setDocFilter(k)} style={{padding:'6px 13px',fontSize:12.5,fontWeight:docFilter===k?700:500,border:'none',background:docFilter===k?CLINIC_CONFIG.primaryColor:'#fff',color:docFilter===k?'#fff':'#4A6860',cursor:'pointer',whiteSpace:'nowrap'}}>{lbl} <span style={{opacity:.65,fontWeight:700}}>{n}</span></button>;
              })}
            </div>
            <div style={{flex:1}}/>
            <button style={{display:'inline-flex',alignItems:'center',gap:7,padding:'7px 14px',borderRadius:8,border:'1px dashed #9BC0B6',background:'#F0FAF6',color:'#0C6B5A',fontSize:12.5,fontWeight:700,cursor:'pointer'}}><Upload size={13}/>Upload document</button>
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
              <Row label="Full name" value={patient.nameEn}/>
              <Row label="QID" value={patient.qid} mono/>
              <Row label="Date of birth" value={fmtDate(patient.dob)} mono/>
              <Row label="Age / Sex" value={patient.age+'y · '+patient.sex}/>
              <Row label="Nationality" value={patient.nationality}/>
              <Row label="Marital status" value={patient.marital}/>
              <Row label="Blood type" value={patient.bloodType}/>
            </div>
          </div>
          <div style={card}>
            <div style={cardHd}><div style={{fontSize:14,fontWeight:700}}>Contact &amp; insurance</div></div>
            <div style={{padding:'4px 18px 12px'}}>
              <Row label="Phone" value={patient.phone} mono/>
              <Row label="Email" value={patient.email}/>
              <Row label="Address" value={patient.address}/>
              <Row label="Insurer" value={patient.insurer}/>
              <Row label="Insurance no." value={patient.insNo} mono/>
              <Row label="File number" value={patient.fileNo} mono/>
              <Row label="Registered" value={fmtDate(patient.registered)} mono/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Encounter Panel — 3-tab layout replacing the old 3-column grid ─────────────
function EncounterPanel({ mode, isDental, onView, appointment }) {
  const [tab, setTab] = useState('soap');
  const apt = TODAYS_APT[mode];
  useConsents();
  // Consent reflects the appointment the doctor actually opened — patient + treatment
  // matched against the shared store (consent captured at reception/nurse).
  const cQid     = appointment ? QID_BY_PID[appointment.patientId] : PATIENT.qid;
  const cProc    = appointment ? appointment.procedure : apt.procedure;
  const consent  = consentState(cQid, cProc, appointment ? appointment.consent : apt.consent);
  const cRec     = findConsent(cQid, cProc);

  const TABS = [
    { id: 'history',   label: 'History' },
    { id: 'soap',      label: 'SOAP' },
    { id: 'treatment', label: 'Treatment' },
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '16px 20px' }}>
      {consent==='missing'&&(
        <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'13px 16px',background:'#FEF2F2',border:'1px solid #FBC9C2',borderRadius:12,marginBottom:16}}>
          <ShieldAlert size={18} color="#DC2626" style={{flexShrink:0,marginTop:1}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13.5,fontWeight:800,color:'#991B1B'}}>Consent not signed &#x2014; do not begin treatment</div>
            <div style={{fontSize:12,fontWeight:600,color:'#B02A1E',marginTop:2,lineHeight:1.45}}>There is no signed consent form for &#x201C;{cProc}&#x201D;. Ask reception to capture the patient&#x2019;s consent before proceeding.</div>
          </div>
        </div>
      )}
      {consent==='pending'&&(
        <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'13px 16px',background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:12,marginBottom:16}}>
          <Shield size={18} color="#B45309" style={{flexShrink:0,marginTop:1}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13.5,fontWeight:800,color:'#92600A'}}>Consent awaiting signature &#x2014; do not begin treatment</div>
            <div style={{fontSize:12,fontWeight:600,color:'#92600A',marginTop:2,lineHeight:1.45}}>Reception has started the consent form for &#x201C;{cProc}&#x201D; but the patient has not signed yet.</div>
          </div>
        </div>
      )}
      {consent==='signed'&&(
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'9px 14px',background:'#F0FAF6',border:'1px solid #CDE7E0',borderRadius:10,marginBottom:16}}>
          <ShieldCheck size={15} color="#0A6040" style={{flexShrink:0}}/>
          <span style={{fontSize:12.5,fontWeight:700,color:'#0A6040'}}>Consent signed &amp; uploaded for {cProc}</span>
          {cRec&&<span style={{fontSize:11.5,fontWeight:600,color:'#3D6B5E'}}>&#xB7; {cRec.method} &#xB7; {cRec.capturedBy||'Reception'} &#xB7; {cRec.date}</span>}
        </div>
      )}
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
  const insurer = PATIENT.insurer;
  const all = useTreatments();
  const active = all.filter(t => t.active);
  const DEFAULTS = mode==='dental'
    ? [{id:'d1',label:'Composite filling — tooth #16',code:'D2391',price:600,specialty:'General Dentistry',payMode:'cash'},{id:'d2',label:'Bitewing X-rays (4 films)',code:'D0274',price:220,specialty:'General Dentistry',payMode:'cash'}]
    : [{id:'a1',label:'Botox 20U — glabellar + frontalis',code:'M0023',price:1800,specialty:'Aesthetic Medicine',payMode:'cash'}];
  const [items, setItems] = useState(DEFAULTS.map(i=>({...i,editPrice:i.price})));
  const [showAdd, setShowAdd]   = useState(false);
  const [selTxId, setSelTxId]   = useState('');
  const [discPct, setDiscPct]   = useState(0);
  const [discReason, setDiscReason] = useState('');
  const [showDisc, setShowDisc] = useState(false);
  const [posted, setPosted]     = useState(false);
  const dirty = () => setPosted(false);

  const specs = [...new Set(active.map(t => t.specialty))];
  const selTx  = active.find(t => t.id === selTxId) || null;
  const selCov = selTx ? insurerPricing(selTx, insurer) : null;

  const itemPatient = it => it.payMode==='insurance' ? Math.round(it.editPrice*(it.copayPct||0)/100) : it.editPrice;
  const billed         = items.reduce((s,i)=>s+i.editPrice,0);
  const patientSubtotal= items.reduce((s,i)=>s+itemPatient(i),0);
  const insuranceCovers= billed - patientSubtotal;
  const cashPatient    = items.filter(i=>i.payMode!=='insurance').reduce((s,i)=>s+i.editPrice,0);
  const discAmt        = Math.round(cashPatient*discPct/100);
  const total          = patientSubtotal - discAmt;

  const addFromCatalog = () => {
    const t = active.find(x => x.id === selTxId); if(!t) return;
    const cov = insurerPricing(t, insurer);
    const base = { id:`r${Date.now()}`, txId:t.id, label:t.name, code:t.code||'', specialty:t.specialty, grossPrice:t.grossPrice };
    const it = cov
      ? { ...base, payMode:'insurance', price:cov.insurancePrice, editPrice:cov.insurancePrice, copayPct:cov.copayPct }
      : { ...base, payMode:'cash', price:t.cashPrice, editPrice:t.cashPrice };
    setItems(prev=>[...prev, it]); setSelTxId(''); setShowAdd(false); dirty();
  };

  const postToCheckout = () => {
    const recs = items.map(it => it.payMode==='insurance'
      ? (()=>{ const pPays=Math.round(it.editPrice*(it.copayPct||0)/100);
          return { qid:PATIENT.qid, patientName:PATIENT.nameEn, date:TODAY, treatment:it.label, code:it.code, specialty:it.specialty||'', payMode:'insurance', grossPrice:it.grossPrice||it.editPrice, insurer, insurancePrice:it.editPrice, copayPct:it.copayPct||0, patientPays:pPays, insurerPays:it.editPrice-pPays, postedBy:CURRENT_DOCTOR.name }; })()
      : (()=>{ const pPays=Math.round(it.editPrice*(1-discPct/100));
          return { qid:PATIENT.qid, patientName:PATIENT.nameEn, date:TODAY, treatment:it.label, code:it.code, specialty:it.specialty||'', payMode:'cash', grossPrice:it.grossPrice||it.editPrice, cashPrice:it.editPrice, discount:discPct, patientPays:pPays, insurerPays:0, postedBy:CURRENT_DOCTOR.name }; })());
    setChargesForQid(PATIENT.qid, recs); setPosted(true);
  };

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
                <input type="number" value={item.editPrice} onChange={e=>{setItems(p=>p.map(i=>i.id===item.id?{...i,editPrice:parseInt(e.target.value)||0}:i));dirty();}} style={{width:72,textAlign:'right',fontFamily:"'IBM Plex Mono',monospace",padding:'4px 7px',fontSize:13,fontWeight:700}}/>
                <button onClick={()=>{setItems(p=>p.filter(i=>i.id!==item.id));dirty();}} style={{background:'none',border:'none',color:'#C8D4CF',cursor:'pointer',padding:2}}><X size={12}/></button>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4,flexWrap:'wrap'}}>
              {item.payMode==='insurance'
                ? <span style={{fontSize:11,fontWeight:700,color:'#0A6040'}}>{insurer} · copay {item.copayPct}% · patient QAR {itemPatient(item).toLocaleString()}</span>
                : <span style={{fontSize:11,fontWeight:700,color:'#92600A'}}>Cash · patient pays full</span>}
              {item.editPrice!==item.price&&<span style={{fontSize:11,fontWeight:600,color:'#C05820',display:'flex',alignItems:'center',gap:4}}><Edit3 size={10}/>edited from QAR {item.price.toLocaleString()}</span>}
            </div>
          </div>
        ))}
      </div>

      {!showAdd?<button onClick={()=>setShowAdd(true)} style={{width:'100%',padding:'7px',borderRadius:8,border:'1.5px dashed #C8D4CF',background:'transparent',fontSize:12.5,fontWeight:600,color:'#5A7870',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5,marginBottom:8}}><Plus size={13}/>Add treatment</button>:(
        <div style={{padding:'10px 12px',background:'#F5F8F7',borderRadius:9,border:'1px solid #DCE4E0',marginBottom:8,display:'flex',flexDirection:'column',gap:7}}>
          <select value={selTxId} onChange={e=>setSelTxId(e.target.value)}>
            <option value="">Select treatment from price list…</option>
            {specs.map(s=>(
              <optgroup key={s} label={s}>
                {active.filter(t=>t.specialty===s).map(t=><option key={t.id} value={t.id}>{t.name}{t.code?` (${t.code})`:''}</option>)}
              </optgroup>
            ))}
          </select>
          {selTx&&(
            <div style={{fontSize:11.5,fontWeight:600,color:'#5A7870'}}>
              Cash QAR {selTx.cashPrice.toLocaleString()}
              {selCov ? ` · ${insurer} copay ${selCov.copayPct}% → patient QAR ${Math.round(selCov.insurancePrice*selCov.copayPct/100).toLocaleString()}` : ` · not covered by ${insurer} (cash)`}
            </div>
          )}
          <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
            <GhostBtn onClick={()=>{setShowAdd(false);setSelTxId('');}} style={{padding:'5px 12px',fontSize:12}}>Cancel</GhostBtn>
            <PrimaryBtn onClick={addFromCatalog} disabled={!selTxId} style={{padding:'5px 12px',fontSize:12}}><Plus size={11}/>Add</PrimaryBtn>
          </div>
        </div>
      )}

      {!showDisc?<button onClick={()=>setShowDisc(true)} style={{width:'100%',padding:'7px',borderRadius:8,border:'1.5px dashed #C8D4CF',background:'transparent',fontSize:12.5,fontWeight:600,color:'#5A7870',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5,marginBottom:8}}><Tag size={13}/>Add discount (cash)</button>:(
        <div style={{padding:'10px 12px',background:'#F5F8F7',borderRadius:9,border:'1px solid #DCE4E0',marginBottom:8}}>
          <div style={{display:'flex',gap:8,marginBottom:6}}>
            <div style={{width:64}}><div style={{...SEC,marginBottom:4}}>% Off</div><input type="number" min={0} max={100} value={discPct} onChange={e=>{setDiscPct(Math.min(100,Math.max(0,parseInt(e.target.value)||0)));dirty();}} style={{fontFamily:"'IBM Plex Mono',monospace"}}/></div>
            <div style={{flex:1}}><div style={{...SEC,marginBottom:4}}>Reason</div><input value={discReason} onChange={e=>setDiscReason(e.target.value)} placeholder="e.g. Staff family"/></div>
            <button onClick={()=>{setShowDisc(false);setDiscPct(0);setDiscReason('');dirty();}} style={{alignSelf:'flex-end',marginBottom:2,background:'none',border:'none',color:'#4E6860',cursor:'pointer'}}><X size={14}/></button>
          </div>
          {discPct>0&&<div style={{fontSize:12,fontWeight:700,color:'#0A6040'}}>Saves patient QAR {discAmt.toLocaleString()} (cash items)</div>}
        </div>
      )}

      <div style={{paddingTop:10,borderTop:'1px solid #EEF2F0',display:'flex',flexDirection:'column',gap:5}}>
        <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#3D5850'}}>Billed</span><span style={{fontSize:12.5,fontWeight:700}}>QAR {billed.toLocaleString()}</span></div>
        {insuranceCovers>0&&<div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#0A6040'}}>Insurance covers</span><span style={{fontSize:12.5,fontWeight:700,color:'#0A6040'}}>-QAR {insuranceCovers.toLocaleString()}</span></div>}
        {discPct>0&&<div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12.5,fontWeight:600,color:'#0A6040'}}>Cash discount ({discPct}%)</span><span style={{fontSize:12.5,fontWeight:700,color:'#0A6040'}}>-QAR {discAmt.toLocaleString()}</span></div>}
        <div style={{display:'flex',justifyContent:'space-between',paddingTop:6,marginTop:2,borderTop:'1px solid #DCE4E0'}}><span style={{fontSize:13,fontWeight:700}}>Patient pays</span><span style={{fontSize:14,fontWeight:800,letterSpacing:'-0.5px'}}>QAR {total.toLocaleString()}</span></div>
      </div>

      <div style={{marginTop:10,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
        {posted
          ? <span style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:700,color:'#0A6040'}}><CheckCircle2 size={14}/>Posted to checkout</span>
          : <span style={{fontSize:11.5,fontWeight:600,color:'#8AA8A0'}}>Flows to the patient&#x2019;s checkout bill.</span>}
        <PrimaryBtn onClick={postToCheckout} disabled={!items.length} style={{padding:'6px 14px',fontSize:12.5}}><Receipt size={12}/>{posted?'Update bill':'Post to checkout'}</PrimaryBtn>
      </div>
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
