#!/bin/bash
# Opretter /etc/enkeltoverblik/site-contact.env med SMTP-oplysningerne fra
# madappens /opt/enkeltoverblik/app/data/notify.json (besked@enkeltoverblik.dk).
# Viser aldrig passwordet. Kør på serveren fra repo-roden:
#   sudo bash deploy/contact-env-from-notify.sh
set -euo pipefail
NOTIFY=/opt/enkeltoverblik/app/data/notify.json
OUT=/etc/enkeltoverblik/site-contact.env
[[ "$(id -u)" -eq 0 ]] || { echo "kør med sudo" >&2; exit 1; }
[[ -f "$NOTIFY" ]] || { echo "$NOTIFY findes ikke" >&2; exit 1; }
[[ ! -e "$OUT" ]] || { echo "$OUT findes allerede — slet den først, hvis den skal laves om" >&2; exit 1; }
umask 077
NOTIFY="$NOTIFY" OUT="$OUT" node -e '
const fs = require("fs")
const n = JSON.parse(fs.readFileSync(process.env.NOTIFY, "utf8"))
const s = n.smtp || {}
const bad = (v) => typeof v !== "string" || !v.trim() || /[\r\n]/.test(v)
if (bad(s.host) || bad(s.user) || bad(s.pass)) { console.error("smtp.host/user/pass mangler i notify.json"); process.exit(1) }
const q = (v) => "\"" + String(v).replace(/[\\"$`]/g, (c) => "\\" + c) + "\""
const lines = [
  "# Oprettet af deploy/contact-env-from-notify.sh — samme postkasse som madappen.",
  "SMTP_HOST=" + s.host.trim(),
  "SMTP_PORT=" + (Number(s.port) || 587),
  "SMTP_USER=" + s.user.trim(),
  "SMTP_PASS=" + q(s.pass),
  "MAIL_FROM=" + q("Enkelt Overblik <" + s.user.trim() + ">"),
  "CONTACT_TO=henrik@vores-it.dk",
  "PORT=3100",
  "DAILY_LIMIT=50",
]
fs.writeFileSync(process.env.OUT, lines.join("\n") + "\n", { mode: 0o600 })
console.log("SMTP_HOST=" + s.host.trim())
console.log("SMTP_PORT=" + (Number(s.port) || 587))
console.log("SMTP_USER=" + s.user.trim())
console.log("SMTP_PASS=(sat, " + s.pass.length + " tegn)")
'
chown root:root "$OUT"; chmod 0600 "$OUT"
ls -l "$OUT"
