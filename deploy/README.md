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
sudo install -o root -g root -m 0755 deploy/site-deploy-gate /usr/local/bin/site-deploy-gate
```

Opret et nyt SSH-nøglepar kun til deploy. Den offentlige del i
`/var/www/enkeltoverblik-site/.ssh/authorized_keys` (ejer site-deploy, 0600), låst
til `site-deploy-gate`, så nøglen kun kan køre `site-publish <id>` og intet andet:

```
restrict,command="/usr/local/bin/site-deploy-gate" ssh-ed25519 AAAA… github-deploy enkeltoverblik-site
```
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
