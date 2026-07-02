// ─── Shared patient records store ──────────────────────────────────────────────
// The clinic's patient file index. Seeded to match the Reception portal's records
// (same file numbers / QIDs) plus a few more so the Admin patient list looks like a
// real, populated clinic. Read by the Admin portal (Patients tab) for search and
// record lookup. Persists to localStorage. In production this is the EMR patient API.
import { useEffect, useState } from 'react';

const KEY = 'medly.patients.v1';

const SEED = [
  { id: 'p1', fileNo: 'YC-2024-0142', qid: '28934567812', nameEn: 'Aisha Al-Kuwari',    nameAr: 'عائشة الكواري',   phone: '+974 5512 4488', dob: '1989-03-14', gender: 'Female', insurer: 'QLM',       policy: 'QLM-447821',   eligible: true,  lastVisit: '2026-02-14', balance: 0,    allergies: ['Penicillin (rash)', 'Latex'], conditions: ['Type 2 diabetes (controlled)', 'Hypertension'], notes: 'Prefers afternoon. Anxious about dental work.', encounterHistory: [{ date: '2026-02-14', doctor: 'Dr. Layla Al-Mahmoud', procedure: 'Cleaning & polish', notes: 'Mild gingivitis lower right.' }, { date: '2025-11-22', doctor: 'Dr. Reem Al-Thani', procedure: 'Botox — glabellar', notes: '20U. Pleased at follow-up.' }, { date: '2025-08-03', doctor: 'Dr. Layla Al-Mahmoud', procedure: 'Consultation + X-rays', notes: 'Referred to endodontics.' }] },
  { id: 'p2', fileNo: 'YC-2024-0089', qid: '29612039874', nameEn: 'James Patterson',     nameAr: 'جيمس باترسون',   phone: '+974 7011 9923', dob: '1985-11-02', gender: 'Male',   insurer: 'Cash/Card', policy: null,           eligible: null,  lastVisit: '2025-11-08', balance: 450,  allergies: [],                              conditions: [],                                              notes: '', encounterHistory: [{ date: '2025-11-08', doctor: 'Dr. Omar Al-Sayed', procedure: 'Braces adjustment', notes: 'Progressing well.' }] },
  { id: 'p3', waConsent: false, fileNo: 'YC-2025-0317', qid: '28701445129', nameEn: 'Fatima Al-Mansoori',  nameAr: 'فاطمة المنصوري', phone: '+974 3344 7712', dob: '1992-07-22', gender: 'Female', insurer: 'AXA',       policy: 'AXA-Q-998812', eligible: true,  lastVisit: '2026-04-30', balance: 0,    allergies: ['Sulfa drugs'],                 conditions: [],                                              notes: 'Pregnant (24 weeks). Avoid X-rays.', encounterHistory: [{ date: '2026-04-30', doctor: 'Dr. Reem Al-Thani', procedure: 'Hydrafacial', notes: 'Good outcome.' }] },
  { id: 'p4', fileNo: 'YC-2023-0318', qid: '30123456783', nameEn: 'Sara Al-Jaber',       nameAr: 'سارة الجابر',    phone: '+974 5545 3344', dob: '1974-01-30', gender: 'Female', insurer: 'QLM',       policy: 'QLM-330918',   eligible: true,  lastVisit: '2026-06-20', balance: 1200, allergies: [],                              conditions: ['Osteoporosis'],                                notes: 'Crown in progress (#25, #26).', encounterHistory: [{ date: '2026-06-20', doctor: 'Dr. Layla Al-Mahmoud', procedure: 'Crown #25 seat', notes: 'Seated, occlusion checked.' }, { date: '2026-06-05', doctor: 'Dr. Layla Al-Mahmoud', procedure: 'Crown #25 prep', notes: 'Impression taken.' }] },
  { id: 'p6', fileNo: 'YC-2025-0387', qid: '29876543215', nameEn: 'Nora Al-Thani',       nameAr: 'نورة آل ثاني',   phone: '+974 5567 9900', dob: '1995-09-08', gender: 'Female', insurer: 'QLM',       policy: 'QLM-665201',   eligible: true,  lastVisit: '2026-06-24', balance: 0,    allergies: [],                              conditions: [],                                              notes: '', encounterHistory: [{ date: '2026-06-24', doctor: 'Dr. Layla Al-Mahmoud', procedure: 'Cleaning + fluoride', notes: 'Good oral hygiene.' }] },
  { id: 'p7', fileNo: 'YC-2022-0056', qid: '27654321096', nameEn: 'Ali Hassan Al-Marri', nameAr: 'علي حسن المري',  phone: '+974 5578 1234', dob: '1971-02-25', gender: 'Male',   insurer: 'Allianz',   policy: 'ALZ-443098',   eligible: true,  lastVisit: '2026-06-24', balance: 0,    allergies: ['Codeine'],                     conditions: ['Hypertension', 'Ischemic heart disease'],      notes: 'Cardiac history — confirm clearance before sedation.', encounterHistory: [{ date: '2026-06-24', doctor: 'Dr. Layla Al-Mahmoud', procedure: 'Emergency consultation', notes: 'Reviewed broken crown #36.' }] },
  { id: 'p8', fileNo: 'YC-2025-0204', qid: '29011224873', nameEn: 'Sara Nasser',         nameAr: 'سارة ناصر',      phone: '+974 6633 1120', dob: '1990-05-19', gender: 'Female', insurer: 'AXA',       policy: 'AXA-Q-771203', eligible: true,  lastVisit: '2026-05-24', balance: 2500, allergies: [],                              conditions: [],                                              notes: 'Root canal course in progress.', encounterHistory: [{ date: '2026-05-24', doctor: 'Dr. Priya Menon', procedure: 'Root canal treatment', notes: 'Session 1 of 2.' }] },
  { id: 'p9', fileNo: 'YC-2026-0028', qid: '30455678129', nameEn: 'Khalid Al-Emadi',     nameAr: 'خالد العمادي',   phone: '+974 5599 8420', dob: '1998-12-01', gender: 'Male',   insurer: 'Cash/Card', policy: null,           eligible: null,  lastVisit: '2026-05-24', balance: 0,    allergies: [],                              conditions: [],                                              notes: 'Aesthetic — regular Botox.', encounterHistory: [{ date: '2026-05-24', doctor: 'Dr. Reem Al-Thani', procedure: 'Botox', notes: '20U forehead.' }] },
  { id: 'p10', fileNo: 'YC-2024-0312', qid: '28822334415', nameEn: 'Mohammed Al-Ali',    nameAr: 'محمد العلي',     phone: '+974 5501 7788', dob: '1982-08-11', gender: 'Male',   insurer: 'MedNet',    policy: 'MED-118820',   eligible: true,  lastVisit: '2026-05-24', balance: 0,    allergies: ['Ibuprofen'],                   conditions: [],                                              notes: '', encounterHistory: [{ date: '2026-05-24', doctor: 'Dr. Marcus Chen', procedure: 'Dermal filler', notes: 'Cheek augmentation.' }] },
  { id: 'p11', fileNo: 'YC-2025-0418', qid: '29233445516', nameEn: 'Noura Al-Sulaiti',   nameAr: 'نورة السليطي',   phone: '+974 5544 2200', dob: '1993-04-27', gender: 'Female', insurer: 'Cash/Card', policy: null,           eligible: null,  lastVisit: '2026-05-24', balance: 0,    allergies: [],                              conditions: [],                                              notes: 'Whitening course.', encounterHistory: [{ date: '2026-05-24', doctor: 'Dr. Yusuf Hassan', procedure: 'Teeth whitening', notes: 'Shade improved 3 levels.' }] },
  { id: 'p12', fileNo: 'YC-2025-0137', qid: '28677889920', nameEn: 'Ahmed Al-Marri',     nameAr: 'أحمد المري',     phone: '+974 3300 5566', dob: '1979-10-05', gender: 'Male',   insurer: 'Daman',     policy: 'DMN-556677',   eligible: true,  lastVisit: '2026-05-24', balance: 600,  allergies: [],                              conditions: ['Asthma'],                                      notes: '', encounterHistory: [{ date: '2026-05-24', doctor: 'Dr. Layla Al-Mahmoud', procedure: 'Filling', notes: 'Composite, tooth #14.' }] },
].map(p => ({ waConsent: true, ...p })); // WhatsApp opt-in defaults on; p3 opts out above

function load() {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return SEED.map(p => ({ ...p }));
}

let patients = load();
const listeners = new Set();

function persist() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(patients));
  } catch (e) { /* ignore */ }
  listeners.forEach(l => l());
}

export function getPatients() { return patients.map(p => ({ ...p })); }
export function savePatients(list) { patients = list.map(p => ({ ...p })); persist(); }

export function usePatients() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force(x => x + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return patients;
}

// Patient age from dob, for display.
export function patientAge(dob) {
  if (!dob) return null;
  const b = new Date(dob + 'T00:00:00');
  const now = new Date('2026-06-30T00:00:00');
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
