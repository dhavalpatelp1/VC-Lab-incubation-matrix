# VC Lab — Incubation Matrix (Neon PWA)

Dr.Venkata Chelikani Lab: Epigenetic Incubation Tracker "Tracking time, unlocking the epigenetic code"

## Quickstart (GitHub Pages — user: dhavalpatelp1)

1) Create a new **public** repository named **incubation-matrix** on GitHub under **dhavalpatelp1**.
2) Upload the contents of this folder to that repo (drag-and-drop on GitHub → Commit).
3) Wait 1–3 minutes for **Actions** to finish. Your site will be live at:
   **https://dhavalpatelp1.github.io/incubation-matrix/**

> The workflow is already configured. No extra settings required.

## Local dev

```bash
npm i
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Files

- `src/App.tsx` — main app
- `public/manifest.webmanifest` — PWA manifest
- `public/sw.js` — service worker (offline shell + runtime cache)
- `.github/workflows/deploy.yml` — GitHub Pages deploy workflow
- `tailwind.config.ts`, `postcss.config.js`, `src/index.css` — Tailwind setup

## Notes

- The workflow sets the correct Vite **base** automatically for Pages using the repo name.
- Service workers require HTTPS; Pages provides that.
- If you use a different repo name, the site URL will be `https://dhavalpatelp1.github.io/<that-repo-name>/`.
