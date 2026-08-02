#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/cliion"

cd "$APP_DIR"

git pull origin main

# Django Backend Setup
cd "$APP_DIR/admin-django"
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python manage.py migrate --noinput
./venv/bin/python seed.py || true
./venv/bin/python manage.py collectstatic --noinput || true

# Frontend Build
cd "$APP_DIR"
npm ci
npm run build --prefix frontend

# PM2 Server Restart
pm2 startOrReload ecosystem.config.cjs
