#!/bin/bash
# Installerer/opdaterer kontaktformularens server fra en ren checkout af repoet.
# Kør på serveren fra repo-roden:  sudo bash deploy/install-contact.sh
# Rører ikke /etc/enkeltoverblik/site-contact.env (hemmeligheder) eller nginx.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/server"
DEST=/opt/enkeltoverblik-site-contact
[[ "$(id -u)" -eq 0 ]] || { echo "kør med sudo" >&2; exit 1; }
[[ -f "$SRC/contact-server.mjs" && -f "$SRC/package-lock.json" ]] || { echo "server/ mangler" >&2; exit 1; }
id site-contact >/dev/null 2>&1 || adduser --system --group --no-create-home site-contact
install -d -o root -g root -m 0755 "$DEST"
install -o root -g root -m 0644 "$SRC/contact-server.mjs" "$SRC/package.json" "$SRC/package-lock.json" "$DEST/"
(cd "$DEST" && npm ci --omit=dev --no-audit --no-fund --silent)
chown -R root:root "$DEST"
install -o root -g root -m 0644 "$ROOT/deploy/site-contact.service" /etc/systemd/system/site-contact.service
systemctl daemon-reload
if [[ -f /etc/enkeltoverblik/site-contact.env ]]; then
  systemctl enable --now site-contact
  systemctl restart site-contact
  sleep 1
  systemctl is-active site-contact
  code="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3100/api/kontakt || true)"
  [[ "$code" == "405" ]] && echo "contact=ok" || { echo "uventet svar: $code" >&2; journalctl -u site-contact -n 20 --no-pager >&2; exit 1; }
else
  echo "OBS: /etc/enkeltoverblik/site-contact.env mangler — opret den (se deploy/site-contact.env.example) og kør igen."
fi
