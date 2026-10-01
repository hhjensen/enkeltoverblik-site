# Omlægning: enkeltoverblik.dk → statisk site

I dag proxyer nginx `enkeltoverblik.dk` til madappen (port 3000), som via
host-routing viser forsiden. Madappen leverer på den host kun forsiden og
`/api/health`; intet andet forsvinder ved omlægningen.

Alle trin kræver Henriks godkendelse. Trin 3 er den eneste produktionsændring.

## 1. Server: mappe, bruger og publish-script

```bash
sudo adduser --system --group --home /var/www/enkeltoverblik-site --shell /bin/bash site-deploy
sudo install -d -o site-deploy -g site-deploy /var/www/enkeltoverblik-site/releases
sudo install -o root -g root -m 0755 deploy/site-publish /usr/local/bin/site-publish
```

Opret et nyt SSH-nøglepar kun til deploy. Den offentlige del i
`/var/www/enkeltoverblik-site/.ssh/authorized_keys` (ejer site-deploy, 0600).
I GitHub (Settings → Secrets and variables → Actions):

- secret `DEPLOY_SSH_KEY`: privat nøgle
- secret `DEPLOY_KNOWN_HOSTS`: output af `ssh-keyscan 46.62.206.77`
- variabel `DEPLOY_TARGET`: `site-deploy@46.62.206.77`

## 2. Første release uden at røre trafikken

Kør workflowet `Deploy` manuelt (workflow_dispatch) med `DEPLOY_ENABLED=true`.
Smoke-trinnet fejler forventeligt, indtil trin 3 er gjort, men filerne ligger nu i
`/var/www/enkeltoverblik-site/current`. Tjek:

```bash
ls -l /var/www/enkeltoverblik-site/current/index.html
```

## 3. nginx (produktionsændring)

1. Backup: `sudo cp -a /etc/nginx/sites-available/<fil> /root/nginx-<fil>-$(date +%F)`.
2. Erstat `location`-delen for `enkeltoverblik.dk www.enkeltoverblik.dk` med
   `root`/`location`-blokkene i `nginx-enkeltoverblik-site.conf` (via `nginx-cutover.sh`).
   Behold TLS-linjerne. Rør ikke andre hosts (`*.enkeltoverblik.dk`, `admin.`, `mad.`).
3. `sudo nginx -t && sudo systemctl reload nginx`.

Verifikation:

```bash
curl -sI https://enkeltoverblik.dk/ | head -5      # 200, ingen X-Powered-By fra node
curl -s https://enkeltoverblik.dk/ | grep -o '<title>.*</title>'   # Enkelt Overblik
curl -sI https://bakkefaldet.enkeltoverblik.dk/ | head -1          # uændret
curl -sI https://admin.enkeltoverblik.dk/ | head -1                # uændret
```

Rollback: kopiér backup-filen tilbage, `nginx -t`, `reload`. Madappen leverer
stadig forsiden, så rollback virker med det samme.

## 4. Oprydning i hhjensen/mad (separat PR, efter trin 3 er verificeret)

Fjern `src/pages/PlatformHome.*`, `src/marketing-entry.tsx` og
marketing-grenen i `src/main.tsx`. Behold `/om`-redirecten.

## Rollback af en release

```bash
ls -1t /var/www/enkeltoverblik-site/releases
sudo -u site-deploy ln -sfn releases/<forrige-id> /var/www/enkeltoverblik-site/current
```

## Kontaktformularen (`/api/kontakt`)

Formularen på siden sender til en lille Node-tjeneste (`server/contact-server.mjs`,
systemd `site-contact`, kun `127.0.0.1:3100`). Den sender fra
`besked@enkeltoverblik.dk` til `CONTACT_TO` (Svar går til kunden) og en kvittering
til kunden. Grænser: 3 pr. time pr. IP, `DAILY_LIMIT` pr. døgn, skjult felt og
minimum-udfyldningstid mod robotter; nginx begrænser derudover til 6/min pr. IP.

**Rækkefølge:** sæt serveren op *før* den side, der har formularen, udrulles. Ellers
får besøgende fejlbeskeden (med e-mail-reserven).

På serveren, i en checkout af repoet på den commit, der skal installeres:

```bash
git clone https://github.com/hhjensen/enkeltoverblik-site /tmp/site && cd /tmp/site && git checkout <commit>

# 1. Hemmeligheder (én gang): kopierer SMTP fra madappens notify.json uden at vise passwordet.
# Filen er root-only (0600); systemd læser den som root og giver værdierne til tjenesten.
sudo bash deploy/contact-env-from-notify.sh

# 2. Tjenesten (også ved senere opdateringer af server/)
sudo bash deploy/install-contact.sh                   # skal ende med contact=ok

# 3. nginx (produktionsændring; ruller selv tilbage ved fejl)
sudo bash deploy/nginx-add-contact.sh                 # skal ende med nginx-contact=ok
```

Test: send en rigtig henvendelse fra siden efter udrulning; tjek at begge mails kommer.
Log: `journalctl -u site-contact` (indeholder aldrig beskeder eller adresser).
Slå formularen fra: `sudo systemctl stop site-contact` (siden viser så fejlbeskeden med e-mail).
