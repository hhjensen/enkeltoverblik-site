#!/bin/bash
# Flytter enkeltoverblik.dk + www fra madappen (port 3000) til det statiske site.
# Kør på serveren: sudo bash /tmp/nginx-cutover.sh
# Tager backup, tester med nginx -t og ruller selv tilbage hvis testen fejler.
set -euo pipefail
AV=/etc/nginx/sites-available
OLD="$AV/enkeltoverblik"
NEW="$AV/enkeltoverblik-site"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="$AV/enkeltoverblik.bak-$TS-pre-site"
FROM='server_name enkeltoverblik.dk www.enkeltoverblik.dk admin.enkeltoverblik.dk;'
TO='server_name admin.enkeltoverblik.dk;'

[[ "$(id -u)" -eq 0 ]] || { echo "kør med sudo" >&2; exit 1; }
[[ -f /var/www/enkeltoverblik-site/current/index.html ]] || { echo "ingen release i current/" >&2; exit 1; }
[[ -f /tmp/nginx-enkeltoverblik-site.conf ]] || { echo "mangler /tmp/nginx-enkeltoverblik-site.conf" >&2; exit 1; }
[[ ! -e "$NEW" ]] || { echo "$NEW findes allerede" >&2; exit 1; }
[[ "$(grep -cF "$FROM" "$OLD")" -eq 1 ]] || { echo "forventet server_name-linje ikke fundet præcis én gang i $OLD" >&2; exit 1; }

cp -a "$OLD" "$BACKUP"
echo "backup: $BACKUP"

rollback() {
  echo "ROLLBACK" >&2
  cp -a "$BACKUP" "$OLD"
  rm -f "$NEW" /etc/nginx/sites-enabled/enkeltoverblik-site
  nginx -t && systemctl reload nginx
  exit 1
}

sed -i "s|$FROM|$TO|" "$OLD"
install -o root -g root -m 0644 /tmp/nginx-enkeltoverblik-site.conf "$NEW"
ln -s "$NEW" /etc/nginx/sites-enabled/enkeltoverblik-site

nginx -t || rollback
systemctl reload nginx
echo "cutover=ok"
echo "rollback: sudo cp -a $BACKUP $OLD && sudo rm /etc/nginx/sites-enabled/enkeltoverblik-site $NEW && sudo nginx -t && sudo systemctl reload nginx"
