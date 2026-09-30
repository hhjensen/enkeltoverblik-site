# enkeltoverblik-site

Produktsiden for **Enkelt Overblik** på https://enkeltoverblik.dk.
Et rent statisk site (Vite + React). Ingen database, ingen API, ingen login.

Flyttet ud af `hhjensen/mad` (Madtilmelding), hvor siden tidligere blev leveret
af madappens server. Se `deploy/README.md` for omlægningen.

## Rediger siden

| Hvad | Hvor |
|---|---|
| Al tekst, sektioner, priser, FAQ, illustrationer | `src/PlatformHome.tsx` |
| Udseende (farver, layout, mørk tilstand) | `src/PlatformHome.css` |
| Versionshistorik og funktionsoversigt (`#versioner`) | `src/version.ts` |
| Titel, beskrivelse, søgemaskine-indstillinger | `index.html` |

`src/version.ts` er en kopi af Madtilmeldings versionshistorik pr. 30/9-2026.
Den opdateres her i hånden, når der er nyt at fortælle.

Siden har `noindex` i `index.html` (som før flytningen). Fjern
`robots`-linjen, når siden skal kunne findes på Google.

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
