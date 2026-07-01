// ─── Patient file → letterheaded PDF ────────────────────────────────────────────
// Admin-only export. Builds a PDF of the same unified patient file shown on
// screen, stamped with the clinic's letterhead (name, logo, address, license)
// and a faint logo watermark — both driven by the branding set once in
// Admin ▸ Settings ▸ Clinic branding (clinicConfigStore.js), so the exported
// document always matches whatever is configured, with no code changes needed
// per clinic.
//
// jsPDF ships as a bundled dependency (not a CDN lazy-load) so PDF export works
// even on a clinic network that blocks third-party CDNs.
import { jsPDF } from 'jspdf';
import { getClinicConfig } from './clinicConfigStore';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

const PAGE_W = 210, PAGE_H = 297, MARGIN = 16;
const INK = [17, 24, 20], MUTED = [90, 120, 112], LINE = [220, 228, 224];

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [12, 107, 90];
}

const s = v => (v === null || v === undefined || v === '') ? '—' : String(v);

// ─── Manual table renderer (no autoTable dependency) ────────────────────────────
// Draws a simple bordered table with a colored header row, wrapping cell text to
// column width and paginating (re-drawing the watermark + continuing the header
// row) when content runs past the bottom margin.
function drawTable(doc, { startY, columns, rows, primary, drawChrome, emptyLabel }) {
  const fontSize = 8.5;
  const padX = 2.2, padY = 1.6, lineH = 3.6;
  const tableW = columns.reduce((s, c) => s + c.w, 0);
  let y = startY;

  const colX = [];
  let x = MARGIN;
  columns.forEach(c => { colX.push(x); x += c.w; });

  const drawHeader = () => {
    doc.setFillColor(...primary);
    doc.rect(MARGIN, y, tableW, 7, 'F');
    doc.setFont(undefined, 'bold'); doc.setFontSize(fontSize); doc.setTextColor(255, 255, 255);
    columns.forEach((c, i) => doc.text(c.label, colX[i] + padX, y + 4.8, { maxWidth: c.w - padX * 2 }));
    y += 7;
  };

  drawHeader();

  if (!rows.length) {
    doc.setFont(undefined, 'normal'); doc.setFontSize(fontSize); doc.setTextColor(...MUTED);
    doc.text(emptyLabel || 'No records.', MARGIN + padX, y + 6);
    y += 10;
    doc.setDrawColor(...LINE); doc.rect(MARGIN, startY, tableW, y - startY);
    return y;
  }

  doc.setFont(undefined, 'normal');
  rows.forEach((row, ri) => {
    const wrapped = columns.map((c, i) => doc.splitTextToSize(s(row[i]), c.w - padX * 2));
    const rowLines = Math.max(...wrapped.map(w => w.length), 1);
    const rowH = rowLines * lineH + padY * 2;

    if (y + rowH > PAGE_H - MARGIN - 12) {
      doc.addPage();
      drawChrome();
      y = MARGIN;
      drawHeader();
    }

    if (ri % 2 === 1) { doc.setFillColor(247, 249, 248); doc.rect(MARGIN, y, tableW, rowH, 'F'); }
    doc.setFontSize(fontSize); doc.setTextColor(...INK);
    wrapped.forEach((lines, i) => doc.text(lines, colX[i] + padX, y + padY + 2.6));
    y += rowH;
  });

  return y;
}

// ─── Letterhead + watermark chrome (redrawn on every page) ──────────────────────
// `logo`, when present, is { src: dataURL, width, height } — a plain data URL is
// passed to addImage() (rather than an HTMLImageElement) since that's what this
// jsPDF version reliably rasterizes; width/height (from a pre-loaded Image) are
// used only for aspect-ratio math.
function drawChrome(doc, cfg, logo, primary, pageLabel) {
  // Watermark — faint, centered, rotated. Uses the clinic logo if one is set,
  // otherwise falls back to the clinic name as text so every export is watermarked.
  if (doc.setGState && doc.GState) doc.setGState(new doc.GState({ opacity: 0.06 }));
  if (logo) {
    const size = 130;
    doc.addImage(logo.src, 'PNG', (PAGE_W - size) / 2, (PAGE_H - size) / 2, size, size, undefined, 'FAST', -30);
  } else {
    doc.setFont(undefined, 'bold'); doc.setFontSize(52); doc.setTextColor(...primary);
    doc.text((cfg.name || 'MEDLY').toUpperCase(), PAGE_W / 2, PAGE_H / 2, { align: 'center', angle: 30 });
  }
  if (doc.setGState && doc.GState) doc.setGState(new doc.GState({ opacity: 1 }));

  // Footer
  doc.setFont(undefined, 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTED);
  doc.text(`Confidential — property of ${cfg.name || 'the clinic'}. Generated electronically via Medly.`, MARGIN, PAGE_H - 10);
  doc.text(pageLabel, PAGE_W - MARGIN, PAGE_H - 10, { align: 'right' });
}

function drawLetterhead(doc, cfg, logo, primary) {
  let y = MARGIN;
  if (logo) {
    const maxH = 16, maxW = 34;
    const ratio = Math.min(maxW / logo.width, maxH / logo.height);
    const w = logo.width * ratio, h = logo.height * ratio;
    doc.addImage(logo.src, 'PNG', MARGIN, y, w, h);
  } else {
    doc.setFillColor(...primary);
    doc.roundedRect(MARGIN, y, 14, 14, 3, 3, 'F');
    doc.setFont(undefined, 'bold'); doc.setFontSize(11); doc.setTextColor(255, 255, 255);
    doc.text((cfg.name || 'MC').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(), MARGIN + 7, y + 9.5, { align: 'center' });
  }

  const textX = MARGIN + 40;
  doc.setFont(undefined, 'bold'); doc.setFontSize(14); doc.setTextColor(...primary);
  doc.text(cfg.name || 'Clinic', textX, y + 6);
  doc.setFont(undefined, 'normal'); doc.setFontSize(9); doc.setTextColor(...MUTED);
  let ly = y + 11;
  if (cfg.tagline) { doc.text(cfg.tagline, textX, ly); ly += 4; }
  const line2 = [cfg.address, cfg.city].filter(Boolean).join(', ');
  if (line2) { doc.text(line2, textX, ly); ly += 4; }
  const line3 = [cfg.phone, cfg.email, cfg.license ? `License ${cfg.license}` : ''].filter(Boolean).join('   ·   ');
  if (line3) doc.text(line3, textX, ly);

  // Title block, right-aligned
  doc.setFont(undefined, 'bold'); doc.setFontSize(11); doc.setTextColor(...INK);
  doc.text('PATIENT FILE', PAGE_W - MARGIN, y + 6, { align: 'right' });
  doc.setFont(undefined, 'normal'); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
  const now = new Date();
  doc.text(`Generated ${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`, PAGE_W - MARGIN, y + 11, { align: 'right' });

  const bottom = y + 20;
  doc.setDrawColor(...primary); doc.setLineWidth(0.6);
  doc.line(MARGIN, bottom, PAGE_W - MARGIN, bottom);
  return bottom + 6;
}

function sectionTitle(doc, text, y) {
  doc.setFont(undefined, 'bold'); doc.setFontSize(10.5); doc.setTextColor(...INK);
  doc.text(text, MARGIN, y);
  return y + 5;
}

function ensureRoom(doc, y, needed, cfg, logo, primary, pageRef) {
  if (y + needed <= PAGE_H - MARGIN - 12) return y;
  doc.addPage();
  pageRef.n += 1;
  drawChrome(doc, cfg, logo, primary, `Page ${pageRef.n}`);
  return MARGIN;
}

export async function downloadPatientFilePdf({ patient, encounters = [], payments = [], documents = [], notes = '', generatedBy = 'Admin' }) {
  const cfg = getClinicConfig();
  const primary = hexToRgb(cfg.primaryColor);
  let logo = null;
  if (cfg.logoUrl) {
    try {
      const img = await loadImage(cfg.logoUrl);
      logo = { src: cfg.logoUrl, width: img.naturalWidth || img.width, height: img.naturalHeight || img.height };
    } catch { logo = null; }
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageRef = { n: 1 };
  drawChrome(doc, cfg, logo, primary, `Page ${pageRef.n}`);
  let y = drawLetterhead(doc, cfg, logo, primary);

  // Patient identity strip — Arabic name is intentionally omitted here: jsPDF's
  // built-in fonts don't include Arabic glyphs, so it would render as boxes/mojibake
  // without embedding a custom font. It still shows on-screen in the app.
  doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.setTextColor(...INK);
  doc.text(patient.nameEn, MARGIN, y);
  y += 6;
  doc.setFont(undefined, 'normal'); doc.setFontSize(9); doc.setTextColor(...MUTED);
  const idLine = [patient.isInternational ? (patient.idNumber || 'Passport pending') : (patient.qid || 'QID pending'), patient.fileNo, patient.age != null ? `${patient.age}y ${patient.sex || ''}`.trim() : null, patient.insurer].filter(Boolean).join('   ·   ');
  doc.text(idLine, MARGIN, y);
  y += 6;

  if (patient.allergies?.length) {
    doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.setTextColor(176, 42, 30);
    doc.text(`Allergies: ${patient.allergies.join(', ')}`, MARGIN, y);
    y += 5;
  }
  if (patient.conditions?.length) {
    doc.setFont(undefined, 'normal'); doc.setFontSize(9); doc.setTextColor(...MUTED);
    doc.text(`Conditions: ${patient.conditions.join(', ')}`, MARGIN, y);
    y += 5;
  }
  y += 3;

  // Personal & contact
  y = ensureRoom(doc, y, 30, cfg, logo, primary, pageRef);
  y = sectionTitle(doc, 'Personal & contact', y);
  const facts = [
    ['Date of birth', patient.dob], ['Nationality', patient.nationality],
    ['Marital status', patient.marital], ['Blood type', patient.bloodType],
    ['Phone', patient.phone], ['Email', patient.email],
    ['Address', patient.address], ['Insurer', patient.insurer],
    ['Insurance no.', patient.insNo || patient.policy], ['Registered', patient.registered || patient.lastVisit],
  ];
  doc.setFontSize(9);
  const colW = (PAGE_W - MARGIN * 2) / 2;
  facts.forEach((f, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const fx = MARGIN + col * colW, fy = y + row * 5.5;
    doc.setFont(undefined, 'bold'); doc.setTextColor(...MUTED); doc.text(s(f[0]), fx, fy);
    doc.setFont(undefined, 'normal'); doc.setTextColor(...INK); doc.text(s(f[1]), fx + 32, fy, { maxWidth: colW - 34 });
  });
  y += Math.ceil(facts.length / 2) * 5.5 + 8;

  // Encounters
  y = ensureRoom(doc, y, 20, cfg, logo, primary, pageRef);
  y = sectionTitle(doc, `Encounter history (${encounters.length})`, y);
  y = drawTable(doc, {
    startY: y, primary, emptyLabel: 'No encounters recorded.',
    columns: [{ label: 'Date', w: 22 }, { label: 'Treatment', w: 62 }, { label: 'Doctor', w: 52 }, { label: 'Fee (QAR)', w: 42 }],
    rows: encounters.map(e => [e.date, e.treatment + (e.tooth ? ` #${e.tooth}` : '') + (e.note ? ` — ${e.note}` : ''), e.doctor, e.fee ? e.fee.toLocaleString() : '—']),
    drawChrome: () => drawChrome(doc, cfg, logo, primary, `Page ${++pageRef.n}`),
  });
  y += 8;

  // Payments
  y = ensureRoom(doc, y, 20, cfg, logo, primary, pageRef);
  y = sectionTitle(doc, `Payment history (${payments.length})`, y);
  y = drawTable(doc, {
    startY: y, primary, emptyLabel: 'No payments recorded.',
    columns: [{ label: 'Date', w: 20 }, { label: 'Description', w: 54 }, { label: 'Amount', w: 26 }, { label: 'Insurer paid', w: 26 }, { label: 'Patient paid', w: 26 }, { label: 'Status', w: 24 }],
    rows: payments.map(p => [p.date, p.description, (p.amount || 0).toLocaleString(), (p.insurerPaid || 0).toLocaleString(), (p.patientPaid || 0).toLocaleString(), p.status]),
    drawChrome: () => drawChrome(doc, cfg, logo, primary, `Page ${++pageRef.n}`),
  });
  y += 8;

  // Documents (metadata only — this is a record of what's on file, not the files themselves)
  y = ensureRoom(doc, y, 20, cfg, logo, primary, pageRef);
  y = sectionTitle(doc, `Documents on file (${documents.length})`, y);
  y = drawTable(doc, {
    startY: y, primary, emptyLabel: 'No documents on file.',
    columns: [{ label: 'Date', w: 20 }, { label: 'Document', w: 78 }, { label: 'Type', w: 30 }, { label: 'Uploaded by', w: 48 }],
    rows: documents.map(d => [d.date, d.name, d.type, d.uploadedBy]),
    drawChrome: () => drawChrome(doc, cfg, logo, primary, `Page ${++pageRef.n}`),
  });
  y += 8;

  // Reception notes
  if (notes) {
    y = ensureRoom(doc, y, 16, cfg, logo, primary, pageRef);
    y = sectionTitle(doc, 'Reception notes', y);
    doc.setFont(undefined, 'normal'); doc.setFontSize(9); doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(notes, PAGE_W - MARGIN * 2);
    doc.text(lines, MARGIN, y);
    y += lines.length * 4.2;
  }

  y = ensureRoom(doc, y, 10, cfg, logo, primary, pageRef);
  doc.setFont(undefined, 'italic'); doc.setFontSize(8); doc.setTextColor(...MUTED);
  doc.text(`Downloaded by ${generatedBy} for administrative/record-keeping purposes.`, MARGIN, y + 4);

  // Stamp final page numbers now that total page count is known
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFillColor(255, 255, 255);
    doc.rect(PAGE_W - MARGIN - 30, PAGE_H - 13, 30, 5, 'F');
    doc.setFont(undefined, 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text(`Page ${i} of ${total}`, PAGE_W - MARGIN, PAGE_H - 10, { align: 'right' });
  }

  doc.save(`${patient.fileNo || patient.id}-patient-file.pdf`);
}
