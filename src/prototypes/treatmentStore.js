// ─── Shared treatment catalog & price list ─────────────────────────────────────
// Configured in the Admin portal (treatments + cash/insurance pricing) and read
// by the Doctor portal (treatment dropdown auto-fills the price). Persists to
// localStorage so the catalog is shared across both portals and survives reloads.
// In production this is an API-backed price book.
import { useEffect, useState } from 'react';

const KEY = 'medly.treatments.v1';

export const TREATMENT_INSURERS = ['QLM', 'AXA', 'Daman', 'MedNet', 'Allianz'];

// Each treatment carries a gross (list) price, a cash price, a default cash
// discount, and per-insurer pricing { name, insurancePrice, copayPct }.
const SEED = [
  { id:'t1',  name:'Consultation',         code:'D0140', specialty:'General Dentistry', dur:30, needsNurse:false, active:true,
    grossPrice:250,  cashPrice:220,  discount:0,
    insurers:[ {name:'QLM',insurancePrice:250,copayPct:20}, {name:'AXA',insurancePrice:240,copayPct:20}, {name:'Daman',insurancePrice:230,copayPct:25} ] },
  { id:'t2',  name:'Cleaning & polish',    code:'D1110', specialty:'General Dentistry', dur:45, needsNurse:true,  active:true,
    grossPrice:400,  cashPrice:360,  discount:0,
    insurers:[ {name:'QLM',insurancePrice:400,copayPct:20}, {name:'AXA',insurancePrice:390,copayPct:20}, {name:'Daman',insurancePrice:380,copayPct:25}, {name:'MedNet',insurancePrice:400,copayPct:30} ] },
  { id:'t3',  name:'Filling',              code:'D2391', specialty:'General Dentistry', dur:45, needsNurse:true,  active:true,
    grossPrice:600,  cashPrice:550,  discount:0,
    insurers:[ {name:'QLM',insurancePrice:600,copayPct:20}, {name:'AXA',insurancePrice:580,copayPct:20}, {name:'Daman',insurancePrice:560,copayPct:25}, {name:'MedNet',insurancePrice:600,copayPct:30} ] },
  { id:'t4',  name:'Extraction',           code:'D7210', specialty:'General Dentistry', dur:60, needsNurse:true,  active:true,
    grossPrice:800,  cashPrice:720,  discount:0,
    insurers:[ {name:'QLM',insurancePrice:800,copayPct:20}, {name:'AXA',insurancePrice:780,copayPct:20}, {name:'Daman',insurancePrice:760,copayPct:25} ] },
  { id:'t5',  name:'Crown',                code:'D2750', specialty:'General Dentistry', dur:60, needsNurse:true,  active:true,
    grossPrice:1400, cashPrice:1250, discount:0,
    insurers:[ {name:'QLM',insurancePrice:1400,copayPct:25}, {name:'AXA',insurancePrice:1350,copayPct:25}, {name:'Daman',insurancePrice:1300,copayPct:30} ] },
  { id:'t6',  name:'Root canal treatment', code:'D3310', specialty:'Endodontics',       dur:90, needsNurse:true,  active:true,
    grossPrice:2500, cashPrice:2200, discount:0,
    insurers:[ {name:'QLM',insurancePrice:2500,copayPct:25}, {name:'AXA',insurancePrice:2400,copayPct:25}, {name:'Daman',insurancePrice:2350,copayPct:30} ] },
  { id:'t7',  name:'Scaling & root planing', code:'D4341', specialty:'General Dentistry', dur:60, needsNurse:true, active:true,
    grossPrice:700,  cashPrice:630,  discount:0,
    insurers:[ {name:'QLM',insurancePrice:700,copayPct:20}, {name:'AXA',insurancePrice:680,copayPct:20}, {name:'Daman',insurancePrice:660,copayPct:25} ] },
  { id:'t8',  name:'Braces adjustment',    code:'D8090', specialty:'Orthodontics',       dur:30, needsNurse:true,  active:true,
    grossPrice:450,  cashPrice:420,  discount:0,
    insurers:[ {name:'QLM',insurancePrice:450,copayPct:30}, {name:'AXA',insurancePrice:440,copayPct:30} ] },
  { id:'t9',  name:'Teeth whitening',      code:'D9972', specialty:'Cosmetic Dentistry', dur:60, needsNurse:true,  active:true,
    grossPrice:1500, cashPrice:1350, discount:10, insurers:[] },
  { id:'t10', name:'Botox',                code:'AES-BTX', specialty:'Aesthetic Medicine', dur:45, needsNurse:true, active:true,
    grossPrice:1800, cashPrice:1650, discount:0, insurers:[] },
  { id:'t11', name:'Dermal filler',        code:'AES-FIL', specialty:'Aesthetic Medicine', dur:60, needsNurse:true, active:true,
    grossPrice:2400, cashPrice:2200, discount:0, insurers:[] },
  { id:'t12', name:'Hydrafacial',          code:'AES-HYD', specialty:'Aesthetic Medicine', dur:60, needsNurse:true, active:true,
    grossPrice:1200, cashPrice:1080, discount:0, insurers:[] },
];

function load() {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return SEED.map(t => ({ ...t }));
}

let treatments = load();
const listeners = new Set();

function persist() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(treatments));
  } catch (e) { /* ignore */ }
  listeners.forEach(l => l());
}

export function getTreatments() { return treatments.map(t => ({ ...t })); }
export function saveTreatments(list) { treatments = list.map(t => ({ ...t })); persist(); }
export function activeTreatments() { return treatments.filter(t => t.active); }
export function getTreatment(id) { return treatments.find(t => t.id === id) || null; }

// Find the insurer-specific pricing row for a treatment, or null if not covered.
export function insurerPricing(tx, insurer) {
  if (!tx || !tx.insurers) return null;
  return tx.insurers.find(i => i.name === insurer) || null;
}

// Compute the charge breakdown for a treatment given insurer + cash overrides.
export function priceBreakdown(tx, insurer, { payMode = 'insurance', cashPrice, discount = 0 } = {}) {
  if (!tx) return null;
  const ins = insurerPricing(tx, insurer);
  if (payMode === 'insurance' && ins) {
    const patientPays = Math.round(ins.insurancePrice * ins.copayPct / 100);
    return {
      mode: 'insurance', insurer, gross: tx.grossPrice, insurancePrice: ins.insurancePrice,
      copayPct: ins.copayPct, patientPays, insurerPays: ins.insurancePrice - patientPays,
    };
  }
  const base = cashPrice != null ? cashPrice : tx.cashPrice;
  const patientPays = Math.round(base * (1 - (discount || 0) / 100));
  return { mode: 'cash', gross: tx.grossPrice, cashPrice: base, discount: discount || 0, patientPays, insurerPays: 0 };
}

export function useTreatments() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force(x => x + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return treatments;
}
