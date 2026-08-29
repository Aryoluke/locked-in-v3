# LOCKED IN — V5CHAT

This branch is the production build track for LOCKED IN.

## Product target
One privacy-first app for a private 2–10 person squad. One account, one profile, one XP/streak history across Android, Windows and iPhone/web. Offline-first clients sync to a self-hosted source of truth.

## Build order
1. Core domain + local persistence + responsive app shell
2. Auth/invites/admin/privacy + self-hosted API
3. Sync engine + offline queue + field-level LWW conflict handling
4. Train: exercises, variations, sets, templates, PRs, 1RM, sports, skills, recovery
5. Mind: study, Pomodoro, tests, spaced repetition, focus sessions
6. Life: habits, routines, grooming/hygiene/life-skills education
7. Nutrition: food logging, pantry/meal planner/grocery system with age-safe defaults
8. Squad: chat, feed, reactions, challenges, duels, leagues, raids, rankings
9. AI: local Ollama/LM Studio first, then free-tier fallbacks; RAG; voice and vision where safe
10. Form/media: on-device pose analysis and private encrypted media
11. Integrations: Health Connect/Amazfit, Calendar, Strava, music, NFC, GPS
12. Native packaging, automated tests, CI builds, backups, monitoring and deployment docs

## Non-negotiables
- No fake data or fake AI responses.
- No ads, telemetry, subscriptions or paid features.
- Never commit API keys, passwords, JWT secrets or private user data.
- Private photos stay device-only unless the owner explicitly enables encrypted sync.
- Health/fitness guidance is age-aware. For minors, avoid restrictive dieting, fasting coaching, body-fat targets, appearance comparison and unsafe supplement/training guidance.
- The server is the source of truth; clients remain useful offline.
