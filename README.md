# LOCKED IN V3

**Offline-first personal operating system for training, nutrition, mind, life, squad and glow-up progress.**

- Repository: https://github.com/Aryoluke/locked-in-v3
- Intended Pages URL: https://aryoluke.github.io/locked-in-v3/
- Storage: browser `localStorage` only; no network calls are required by the app.
- Scope: this README and build cover **v3 only**. v1 and v2 are not touched.

## Verified feature checklist

### Foundation
- [x] Responsive single-page HTML shell with LOCKED IN V3 title and bottom navigation.
- [x] Offline seed catalogue for exercises, workouts, meals, subjects, habits, recipes and skills.
- [x] First-run onboarding and local profile calibration.
- [x] Local save status, incognito mode, settings, privacy preference, JSON export and reset.
- [x] Hash routes for Today, Train, Fuel, Mind, Life, Squad and Advanced control room.

### Today and personal systems
- [x] Adaptive dashboard with streak, XP, hydration, insurance and completion rings.
- [x] Training workspace: workout templates, set logging, PR estimation, rest timer, mobility, custom exercises and body notes.
- [x] Nutrition workspace: food and meal logs, calories, protein, hydration, creatine, fasting, meals and grocery prompts.
- [x] Mind workspace: mood check-in, private journal, study subjects, Pomodoro, tests, screen-time review and recall prompts.
- [x] Life workspace: habits, tasks, routines, skills, relationships and personal reset prompts.

### Squad and gamification (`app-squad.js`)
- [x] Daily quests and XP.
- [x] Duels, combo chains, badges, leagues and raids.
- [x] Reactions, revenge rounds and weekly wraps.
- [x] Local leaderboards, personal records, shop rewards and trophies.
- [x] Photo accountability notes (filename/note only; never uploaded).
- [x] Local squad sessions and privacy-first accountability history.

### Advanced control room (`app-advanced.js`)
- [x] Competitions, rankings, runs and long-term arcs.
- [x] Goals, calendar markers and glow-up tracks.
- [x] Lock-in levels and local reminder list.
- [x] Admin toggle, privacy/visibility preference and device-only disclosure.
- [x] Import, export, reset and remaining plan-control surfaces.
- [ ] Native OS notifications, camera ingestion and real multi-device sync (native phase).
- [ ] Production backend, authentication and hosted multiplayer (deliberately deferred).

## Build phases

1. **Foundation — complete:** visual system, seed data, state persistence, onboarding and dashboard shell.
2. **Core workspaces — complete:** training, nutrition, mind and life views with local actions.
3. **Squad/gamification — complete in the static build:** quests, social game loops, accountability and rewards in local state.
4. **Advanced planning — complete in the static build:** competitions, arcs, goals, tracks, reminders, privacy and portability.
5. **Verification and static deployment — in progress:** syntax/reference review, GitHub Pages build and hosted smoke test.
6. **Flutter native packaging — next:** port the state model and views to Flutter, then produce Android APK and Windows EXE installers.

## Run locally by double-click

1. Download or clone this repository.
2. Open the repository folder.
3. Double-click `index.html`.
4. Complete onboarding. The app works from `file://` because it uses relative local assets and browser storage.
5. To reset, open Settings or Advanced → Reset local data.
6. To move data, use Settings/Advanced → Export, then Import the resulting `locked-in-v3-backup.json` on another browser profile or build.

A local server is optional. If your browser restricts a feature under `file://`, run `python3 -m http.server` in the folder and open `http://localhost:8000`.

## Flutter APK / Windows EXE next step

Create a Flutter project that mirrors the existing state contract (`profile`, `logs`, `tasks`, `records`, `squad`, `advanced`, `settings`) and replace browser storage with a small repository abstraction backed by `shared_preferences` or SQLite. Port each workspace as a screen, keep export/import as JSON, then build:

```bash
flutter pub get
flutter build apk --release
flutter build windows --release
```

The Android output is under `build/app/outputs/flutter-apk/`; the Windows release bundle is under `build/windows/x64/runner/Release/`. Native notifications, camera/photo permissions and optional sync belong in this phase, not in the offline static build.

## Validation notes

The current `main` branch is the source of truth. The HTML entrypoint references only local v3 files in dependency order. GitHub Pages must be configured from `main` / root and the deployed page must be smoke-tested for both the LOCKED IN title and rendered app UI before it is considered live.
