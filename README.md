# Dart Training

React + TypeScript + Vite foundation for the dart training app.

## Local development

Use Node.js 22.12 or newer and npm.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. Stop the server with Ctrl+C.

```powershell
npm run build
npm run lint
npm test
npm run preview
```

The app includes the start page and Triple 20 session recording with 13 result zones,
undo, live statistics, IndexedDB persistence and JSON backup download.
Active sessions resume after reloading. Statistics > View Sessions lists completed sessions
and shows individual session details, all 13 zones and high/low tendencies.
Full Statistics supports Last 50/100/500 and Lifetime distributions, history summaries,
and rolling 50/100/500-throw trends for accuracy, miss patterns and every result zone.
Saved active-session darts are included. CSV export, JSON restore
and an offline app cache will be added in later steps.

See REQUIREMENTS.md for product requirements and AGENTS.md for project instructions.
