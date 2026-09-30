# enkeltoverblik-site

Produktsiden for **Enkelt Overblik** på https://enkeltoverblik.dk.
Et rent statisk site (Vite + React). Ingen database, ingen API, ingen login.

Flyttet ud af `hhjensen/mad` (Madtilmelding), hvor siden tidligere blev leveret
af madappens server. Se `deploy/README.md` for omlægningen.

## Rediger teksterne

Alle tekster ligger i mappen [`content/`](content) som Markdown-filer. Du kan
rette dem direkte på GitHub: åbn filen, klik på blyanten, ret og klik
**Commit changes**. Siden er live ca. 30 sekunder efter.

| Del af siden | Fil |
|---|---|
| Kontakt-e-mail, demo-link, menu, fanebladets titel | `content/indstillinger.md` |
| Toppen (overskrift, knapper, ✓-punkter) | `content/top.md` |
| "Sådan kommer I i gang" | `content/kom-i-gang.md` |
| Funktioner: overskrift / hver funktion | `content/funktioner.md` / `content/funktioner/*.md` |
| Madtilmelding: overskrift + foldbare lister / hver funktion | `content/madtilmelding.md` / `content/madtilmelding/*.md` |
| Roller og "Til alle aldre" | `content/roller.md` |
| Platformen (mørk boks) | `content/platform.md` |
| Priser | `content/priser.md` |
| "Se det i virkeligheden" | `content/i-brug.md` |
| Spørgsmål | `content/faq.md` |
| Afslutning og bunden | `content/afslutning.md`, `content/bund.md` |

**Sådan er en fil bygget op:** øverst mellem to `---`-linjer står felterne
(`overskrift: …`, lister med `- …`). Under den nederste `---` står brødteksten.

- `*ord*` giver *kursiv*, `**ord**` giver **fed**, `[tekst](https://…)` giver et link.
- Indeholder en tekst et `:` efterfulgt af mellemrum, eller starter den med `"`, `#`, `*`, `-` eller `@`, så sæt hele teksten i anførselstegn: `titel: "Pris: 100 kr."`.
- **Ny funktion:** kopiér fx `content/funktioner/05-filer.md` til `10-noget.md`. Tallet styrer rækkefølgen. `illustration:` skal være en af de eksisterende tegninger (se listen i fejlbeskeden, hvis du skriver forkert).
- **Nyt spørgsmål:** tilføj `## Spørgsmålet?` og svaret under i `content/faq.md`.

**Laver du en fejl** (et felt mangler, et anførselstegn er glemt), fejler
udrulningen med en besked som `FEJL I INDHOLD: content/priser.md: feltet
"planer 3 → pris" mangler`, og den gamle side bliver liggende. Se fejlen under
fanen **Actions**, ret filen og commit igen.

Illustrationerne og layoutet ligger i `src/PlatformHome.tsx` / `.css`.
Versionshistorikken (`#versioner`) ligger i `src/version.ts` (kopi af
Madtilmeldings historik pr. 30/9-2026).

## Lokalt

```bash
npm ci
npm run dev      # http://localhost:5173 – opdaterer mens du retter
npm run build    # byg til dist/
```

## Udrulning

Merge til `main` → GitHub Actions bygger og lægger siden på serveren
(`.github/workflows/deploy.yml`). Slået til med repo-variablen
`DEPLOY_ENABLED=true`. Hver udrulning er en ny mappe; rollback er at pege
`current` på den forrige (se `deploy/README.md`).
