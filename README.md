# Flight Strip Task Tracker

Ein leichtgewichtiger Task-Tracker, der sich am Handling von Flight Strips orientiert. Aufgaben werden direkt im Browser verwaltet, bleiben dank `localStorage` erhalten und lassen sich per Drag & Drop priorisieren.

## Funktionen

- Neue Aufgaben über ein Modal erfassen (Titel Pflicht, Ansprechpartner optional, Eingang optional).
- Aufgaben erscheinen automatisch oben in der Liste, lassen sich per Drag & Drop umsortieren und können per ✏️ erneut bearbeitet werden.
- Aufgaben können per `✕` archiviert werden; ein Vollbild-Archiv verwaltet abgeschlossene Einträge inklusive Löschfunktion.
- Light/Dark-Mode-Umschalter (🌙 / 🌞) mit Speicherung der letzten Auswahl.
- Datenmanagement (💾): Export als JSON sowie Import inklusive automatischem Reload.
- Alle Daten verbleiben lokal im Browser (kein Backend, keine externen Dienste).

## Schnellstart

1. Repository klonen oder herunterladen.
2. `index.html` im Browser öffnen (Doppelklick oder via `http-server`/ähnlichem Tool).
3. Aufgaben direkt im UI pflegen – eine zusätzliche Build- oder Server-Umgebung ist nicht erforderlich.

## Bedienung

- **Neue Aufgabe**: Button `Neue Aufgabe` öffnet das Formular. Titel ist Pflicht; Ansprechpartner und Datum sind optional.
- **Bearbeiten**: In jeder Karte öffnet das ✏️-Icon das Formular mit vorausgefüllten Daten. Änderungen speichern den Eintrag an gleicher Position.
- **Archiv**: Button `Archiv` öffnet die Archiv-Ansicht im Vollbild. Archivierte Aufgaben lassen sich dort dauerhaft löschen.
- **Theme & Daten**: Rechts oben wechselt der Emoji-Button zwischen Light- (🌞) und Dark-Mode (🌙). Der 💾-Button öffnet den Export/Import-Dialog.
- **Drag & Drop**: Aufgaben können in der aktiven Liste per Drag & Drop neu sortiert werden.
- **Speicherung**: Aufgaben sowie Archiv behalten ihren Zustand nach Browser-Neustart dank `localStorage`. Zum Zurücksetzen den Browser-Storage für die Domain löschen.

## Projektstruktur

- `index.html` – Grundgerüst der Anwendung, steuert Modals und Templates.
- `styles.css` – Layout, Theme-Variablen und Responsive Styles.
- `app.js` – UI-Logik für Aufgabenverwaltung, Drag & Drop, Persistenz und Theme.

## Technologie & Voraussetzungen

- HTML5, CSS3, Vanilla JavaScript.
- Läuft in modernen Browsern ohne zusätzliche Abhängigkeiten.

## Weiterentwicklungsideen

- Wiederherstellen-Funktion für archivierte Aufgaben.
- Validierung und visuelles Feedback bei fehlendem Pflichteingabefeld.
