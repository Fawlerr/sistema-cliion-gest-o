#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/cliion"

cd "$APP_DIR"

npm ci
node backend/seed.js || true
npm run build --workspace frontend
pm2 startOrReload ecosystem.config.cjs
