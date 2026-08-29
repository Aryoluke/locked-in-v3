# LOCKED IN V4

Private fitness + life lock-in system. One Flutter codebase targets Android, iOS/web, Windows and future desktop packaging.

## Phase 1 shipped in V4
- Offline-first local persistence
- Onboarding profile
- SLEEPER / BULK / HYBRID goal physique selection
- Dietary profile
- Workout logging
- Study lock-in / Pomodoro
- Life habit tracking
- Water logging
- XP + levels + streaks
- Local-only squad-safe empty states
- Dark premium UI
- Android / Windows / Web CI builds

## Architecture for the full system
The client is deliberately separated from the future sync boundary. All user writes are local-first. A production sync adapter should send mutations to the self-hosted API when online, with an idempotency key and per-field updated-at timestamp. Server is authoritative; clients reconcile using last-write-wins per field and explicit conflict UI for high-value conflicts.

### Native targets
- Android APK: `flutter build apk --release`
- Windows EXE: `flutter build windows --release` (installer/signing can be added separately)
- iPhone: Flutter Web/PWA now; App Store packaging requires an Apple/macOS build environment.

### Security rules
Never commit API keys, passwords, JWT secrets, private photos or real squad data. The repository should be private before deploying real user information.

### Health safety
The product is designed to be age-aware. For minors, avoid calorie-deficit coaching, body-fat targets/estimation, restrictive fasting challenges and unsafe supplement/training recommendations. Use educational, health-focused guidance and encourage trusted adults/professionals for medical questions.

## Roadmap
The requested full feature set is organized as modules: sync/auth/admin → training/variations/PRs → mind → nutrition → recovery → skin/life → AI/RAG → pose analysis → competitions/squad → integrations → exports/backup → polish. Each module should use real persisted data and explicit empty states; never fabricate activity.
