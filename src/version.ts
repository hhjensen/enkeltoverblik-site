/** App version shown in footer and on enkeltoverblik.dk */
export const APP_VERSION = '1.6.0'

export type VersionEntry = {
  version: string
  date: string
  title: string
  items: string[]
}

/** Newest first — update when shipping user-visible changes. */
export const VERSION_HISTORY: VersionEntry[] = [
  {
    version: '1.6.0',
    date: '2026-09-03',
    title: 'Udseende-toggle, tekststørrelse og header',
    items: [
      'Skift udseende med ét klik (Klassisk og Kartotek) uden at header-knapper hopper',
      'Tekststørrelse Normal/Stor (A+/A−) — layoutet forbliver responsivt',
      'Lys/mørk som simpel toggle i toppen',
      'Administrator-login ligger bag et diskret «Administrator?»-link',
      'Tilmeldings- og login-vinduer ligger over bundmenuen på mobil',
    ],
  },
  {
    version: '1.5.0',
    date: '2026-08-31',
    title: 'Udseende, admin-ugeoversigt og tema',
    items: [
      'Lys, mørk eller automatisk (følger enheden) — vælges i topbaren',
      'Admin: ugeoversigt med status for menu, tilmeldinger, deadline og madhold',
      'Admin kan markere hele ugen som «Ikke mad»',
      'Tydeligere tekst på admin-faner og i «Bestil varer» i mørkt tema',
    ],
  },
  {
    version: '1.4.0',
    date: '2026-08-24',
    title: 'Bestil varer: klar-mail, leveret og køkken pr. dag',
    items: [
      '«Klar til bestilling»: flueben ud fra dage med tal i skemaet (kan rettes manuelt)',
      'Mail til bestiller med kategoriseret liste + link til skemaet',
      '«Leveret»-flueben på bestillingsark og køkkenoversigt (synkroniseret)',
      'Køkkenoversigt: bestilte varer pr. dag, grupperet efter kategori',
      'Deadline-vælger altid 24-timers ur (ingen AM/PM)',
      'Tab/Enter-navigation i ugeskemaet; advarsel før overskrivning af eksisterende felter',
      'Udfyldte leverandørfelter markeres grønt; varenavn fremhæves når der er bestilling',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-08-12',
    title: 'Bestil varer (ugeskema)',
    items: [
      'Madhold/admin: «Bestil varer» med ugeskema (dag × leverandør)',
      'Kategorier, Colli, Fælleskøkken, Solhjul.dk, Nemlig.com og Køb selv',
      'Status: kladde → klar → bestilt',
      'Når ugen er bestilt: vareskema på Køkkenoversigt pr. dag (også i print)',
    ],
  },
  {
    version: '1.2.1',
    date: '2026-08-11',
    title: 'Notifikationer (e-mail + push)',
    items: [
      'Mit hus: «E-mail-beskeder» hedder nu «Notifikationer»',
      'Samme sted: pop-up (push) og e-mail under ét',
      'Push kan aktiveres pr. enhed (iPhone via hjemmeskærm-app)',
      'Admin: fanen «Notifikationer» i stedet for «Hus-mails»',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-08-10',
    title: 'E-mail-beskeder til huset',
    items: [
      'Mit hus: tilføj en eller flere e-mails under «E-mail-beskeder»',
      'Valgfri mail når ugens menu er klar (mindst tre fuldt udfyldte mad-dage)',
      'Valgfri påmindelse 5 timer før deadline, hvis huset slet ikke er tilmeldt',
      'Admin kan sætte de samme e-mailvalg pr. hus',
      'Staging-miljø (mad-stage) til test uden at påvirke production',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-08-04',
    title: 'Kosthensyn og menu-oprettelse',
    items: [
      'Standard-tilmelding: vælg om manglende vegetar/glutenfri betyder afmelding eller skift til standard',
      'Når madhold sætter «nej» til vegetar/glutenfri, anvendes husets valg automatisk',
      'Madhold kan oprette menu (svar ja/nej) også når standard-tilmeldinger allerede fylder ugen',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-08-04',
    title: 'Første brugertest',
    items: [
      'Ugens menu og deadline synlig for alle uden login',
      'Tilmelding pr. hus med kosthensyn (vegetar, glutenfri, begge)',
      'Madhold: menu, «Ikke mad», vegetar-/glutenfri-mulighed (ja/nej)',
      'Admin: pinkoder, bestiller og madregnskab, uge-styring',
      'Bestiller får Excel-klar oversigt når ugen er slut',
      'Uge-URL’er: /35 (nuværende år) og /2026/u35 (andre år)',
      'Banner på afholdte uger: «Denne mad er allerede spist»',
      'Hurtigere gem og mindre gæste-data',
      'Visuelt: Blæk & skema (skarpe kanter, højkontrast, mono)',
    ],
  },
]
