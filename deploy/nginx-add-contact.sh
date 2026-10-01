#!/bin/bash
# Tilføjer /api/kontakt til nginx-konfigurationen for enkeltoverblik.dk.
# Kør på serveren fra repo-roden:  sudo bash deploy/nginx-add-contact.sh
# Viser forskellen, tager backup, tester med nginx -t og ruller selv tilbage ved fejl.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE=/etc/nginx/sites-available/enkeltoverblik-site
ZONE=/etc/nginx/conf.d/site-contact-ratelimit.conf
TS="$(date -u +%Y%m%dT%H%M%SZ)"
[[ "$(id -u)" -eq 0 ]] || { echo "kør med sudo" >&2; exit 1; }
[[ -f "$SITE" ]] || { echo "$SITE findes ikke" >&2; exit 1; }
systemctl is-active --quiet site-contact || { echo "site-contact kører ikke — kør install-contact.sh først" >&2; exit 1; }

NEW="$(mktemp)"; tr -d '\r' < "$ROOT/deploy/nginx-enkeltoverblik-site.conf" > "$NEW"
echo "--- ændringer i $SITE:"
diff -u "$SITE" "$NEW" || true

cp -a "$SITE" "$SITE.bak-$TS"
echo "backup: $SITE.bak-$TS"
rollback() {
  echo "ROLLBACK" >&2
  cp -a "$SITE.bak-$TS" "$SITE"
  rm -f "$ZONE"
  nginx -t && systemctl reload nginx
  exit 1
}
install -o root -g root -m 0644 "$NEW" "$SITE"
tr -d '\r' < "$ROOT/deploy/nginx-site-contact-ratelimit.conf" > "$ZONE"
chmod 0644 "$ZONE"
nginx -t || rollback
systemctl reload nginx
code="$(curl -s -o /dev/null -w '%{http_code}' https://enkeltoverblik.dk/api/kontakt || true)"
[[ "$code" == "405" ]] || { echo "uventet svar fra https://enkeltoverblik.dk/api/kontakt: $code" >&2; rollback; }
echo "nginx-contact=ok"
echo "rollback: sudo cp -a $SITE.bak-$TS $SITE && sudo rm $ZONE && sudo nginx -t && sudo systemctl reload nginx"
