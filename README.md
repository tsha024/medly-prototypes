# Medly — Clinic System Prototypes

Interactive prototypes for stakeholder review. Covers the four role-based interfaces for a dental + aesthetic clinic in Doha, Qatar.

## Modules

| Module | Description | Audience |
|---|---|---|
| Reception & Booking | Multi-doctor calendar, appointment booking, patient search by QID | Reception staff |
| Doctor Portal | SOAP notes, odontogram, full-body injection map, prescriptions | Doctors & nurses |
| Patient Checkout | Line-item billing, split payments, bilingual receipt, insurance claims | Reception staff |
| Admin Dashboard | Revenue, costs, doctor productivity, claims pipeline | Clinic owner |

---

## Deploy in 5 minutes

### Step 1 — Push to GitHub

```bash
# From inside this folder
git init
git add .
git commit -m "Initial prototype"
git branch -M main

# Create a new repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/medly-prototypes.git
git push -u origin main
```

### Step 2 — Deploy to Vercel (one click)

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub
2. Click **Add New → Project**
3. Import the `medly-prototypes` repo
4. Leave all settings as default — Vercel detects Vite automatically
5. Click **Deploy**

Your prototype is live at `https://medly-prototypes.vercel.app` (or similar) in ~30 seconds.

### Step 3 — Share

Send the Vercel URL to anyone you want feedback from. No login required.

---

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Tech stack

- [Vite](https://vitejs.dev) + [React 18](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Lucide React](https://lucide.dev) icons
- Zero backend — all data is mocked

## Notes

- This is a **prototype only** — no real patient data, no API connections.
- Each prototype uses simulated data to demonstrate workflows.
- The Arabic/English toggle in the reception and doctor portals demonstrates bilingual support.

---

*Yasmeen Clinic, Doha · Dental & Aesthetic Medicine · Prototype v1.0 · May 2026*
