# Repository Guidelines

## Project Structure & Modules
- `index.html` – Seiten-Layout, Modals, Templates; Einstiegspunkt für lokale Nutzung.
- `styles.css` – Theme-Variablen, Layout, Drag-&-Drop-States, Light/Dark-Styles.
- `app.js` – Vanilla-JS Logik (IIFE) für Aufgaben, Drag & Drop, Archiv, Export/Import, Theme, `localStorage`.
- `AGENTS.md` – dieser Leitfaden. Weitere Dateien nur bei Bedarf ergänzen; keine Build-Tooling-Ordner vorhanden.

## Run & Develop
- Kein Build nötig; öffne `index.html` direkt im Browser.
- Optionaler lokaler Server (für saubere relative Pfade): `python -m http.server 8000` und `http://localhost:8000`.
- Datenpersistenz läuft im Browser über `localStorage`; zum Reset Storage für die Domain leeren.

## Coding Style & Naming
- 2 Leerzeichen Einrückung, Semikolons setzen, strikt ES2015+ ohne Frameworks.
- Konstanten in `SCREAMING_SNAKE_CASE`; Funktionen/Variablen in `camelCase`.
- CSS folgt BEM-ähnlichen Klassen (`task-card__title`); bitte beibehalten.
- UI-Texte sind aktuell deutsch; neue Strings konsistent halten.
- Default-Dummy-Tasks in `app.js` nutzen gleiche Datenformate (`received` ISO-String).

## Testing & QA
- Keine automatisierten Tests vorhanden. Führe manuelle Checks im Browser durch:
  - Neue Aufgabe anlegen (Titel Pflicht), optional Ansprechpartner/Datum.
  - Bearbeiten: ✏️ klicken, Felder ändern, speichern; Änderungen müssen bestehen bleiben.
  - Drag & Drop sortieren; Reihenfolge muss nach Reload bestehen bleiben.
  - Archiv öffnen, Eintrag archivieren und dauerhaft löschen können.
  - Export/Import (JSON) prüfen; nach Import Reload erwartet.
  - Theme-Toggle (🌞/🌙) und Persistenz verifizieren.
- Vor PR: lokalen Storage leeren und Smoke-Test erneut ausführen.

## Commit & Pull Request Guidelines
- Commits: Präsens, kurz (≤72 Zeichen), z. B. `Add archive delete confirmation`.
- Änderungen klein schneiden; UI-Änderungen mit Screenshot/GIF belegen.
- PR-Text: Kurzbeschreibung, Motivation/Use-Case, Testschritte (s. QA), bekannte Einschränkungen.
- Vermeide unnötige Format-Only-Commits; falls Styling-Fixes nötig, kombiniere mit betroffener Logik.

## Security & Data Handling
- Keine Backends oder externen Aufrufe – bitte keine Third-Party-Skripte nachladen.
- Export-Dateien enthalten Nutzerdaten; kommuniziere das in UI-Texten falls geändert.
- Speichere keine Secrets im Repo; `.env` wird nicht benötigt.

## Agent Notes
- Architektur ist bewusst simpel (reines HTML/CSS/JS). Bevor du Tooling hinzufügst (z. B. Bundler, Test-Framework), kurz begründen und Aufwand/Nutzen abwägen.
- Halte Drag-&-Drop- und Storage-Funktionen rückwärtskompatibel; neue Felder defensiv behandeln, damit bestehende Exporte importierbar bleiben.
