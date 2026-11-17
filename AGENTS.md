# Project Instructions

- `REQUIREMENTS.md` is the source of truth for product requirements. Read it carefully before planning or implementing changes.
- Do not change requirements without explicit instruction from the user.
- Keep the implementation simple and suitable for a beginner to understand.
- Use React + TypeScript + Vite.
- Build the first version as an interactive web app optimized for a portrait-oriented Android tablet, with large touch controls.
- Store every dart throw individually, linked to its training session and including its intended target and actual result zone as defined in `REQUIREMENTS.md`.
- Derive all statistics from raw throw data. Stored aggregates must not become the primary source of truth.
- Keep UI logic, training/statistics logic, and data storage logic separate.
- Use IndexedDB for local data storage. Save each dart immediately and support offline training.
- Support CSV export and complete JSON backup/restore of sessions, throws, and relevant application data.
- Do not add unnecessary libraries or architecture.
- Before making significant architectural changes, explain why they are needed.
- Add automated tests for statistics calculations, including the acceptance example in `REQUIREMENTS.md` and rolling calculations across session boundaries.
- Preserve the dark/red/gold UI direction defined in `REQUIREMENTS.md`: near-black backgrounds, dark panels, light primary text, red primary accents, gold secondary accents, and a subtle dartboard background that preserves readability.
- Keep initial implementation scope focused on Triple 20 Training. Follow `REQUIREMENTS.md` for its 13 result zones, session behavior, statistics, and future-feature boundaries.
