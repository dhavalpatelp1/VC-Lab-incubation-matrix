# EpiLab Incubation Matrix

A browser-based incubation matrix for planning, monitoring, and documenting laboratory samples across multiple experimental conditions.

## Purpose

The project was created to make multi-sample incubation work easier to organise. It combines timing, sample metadata, status tracking, calendar export, and offline storage in a single lightweight application.

## Features

- Create and edit incubation records
- Track scheduled, running, completed, and overdue samples
- Record temperature, location, start/end time, and notes
- Search and filter active experiments
- Export schedules as ICS calendar files
- Open prefilled Google Calendar events
- Export sample records as CSV
- Local browser storage
- Offline-capable Progressive Web App
- Responsive research-focused interface

## Technology

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- LocalStorage
- Progressive Web App service worker

## Quick start

```bash
npm install
npm run dev
```

Open the local address shown by Vite, normally `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

## GitHub Pages

A deployment workflow is included under `.github/workflows/`. GitHub Pages can be enabled from the repository settings after confirming the workflow and base path match the repository name.

## Intended use

This application is suited to small research groups and individual researchers who need a simple visual overview of incubation schedules without deploying a full laboratory information management system.

## Research-use note

The tool supports planning and record organisation but does not replace validated laboratory procedures, institutional record systems, or independent verification of experimental conditions.

## Project role

Conceptualised, specified, tested, and iteratively developed to improve laboratory scheduling and reproducibility.
