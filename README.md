# Cliion Dashboard

Dashboard clinico preparado para producao com backend Node.js/Express, frontend React/Vite e PostgreSQL, pronto para rodar em VPS Ubuntu com PM2 e Nginx no dominio `cliion.cloud`.

## Stack

- Backend: Node.js, Express, `pg`
- Frontend: React, Vite, Tailwind CSS
- Banco: PostgreSQL
- Produção: PM2 + Nginx + Certbot

## Estrutura

```text
backend/
  src/
    config/
    controllers/
    db/
    lib/
    middleware/
    routes/
    services/
frontend/
  src/
deploy/
  nginx/
  scripts/
ecosystem.config.cjs
.env.example
```

## Variaveis de ambiente

Copie `.env.example` para `.env` e ajuste:

- `PORT=3000`
- `FRONTEND_PUBLIC_URL=https://cliion.cloud`
- `CORS_ORIGINS=https://cliion.cloud,https://www.cliion.cloud`
- `JWT_SECRET=...`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `VITE_API_URL=/api`

O backend tambem aceita `DATABASE_URL`, inclusive no formato `prisma+postgres://...`, mas em VPS o recomendado aqui e usar as variaveis explicitas de PostgreSQL.

## Desenvolvimento local

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/api/health`

## Build de producao

```bash
npm install
npm run build --workspace frontend
```

O frontend gera os arquivos estaticos em `frontend/dist`.

## PM2

1. Instale PM2 globalmente:

```bash
npm install -g pm2
```

2. Na pasta do projeto:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

3. Comandos uteis:

```bash
pm2 list
pm2 logs cliion-backend
pm2 restart cliion-backend
pm2 startOrReload ecosystem.config.cjs
```

## Nginx

Arquivo de exemplo: [deploy/nginx/cliion.cloud.conf](/C:/Users/alvan/OneDrive/Documentos/programação/clinic-dashboard-demo/deploy/nginx/cliion.cloud.conf)

Passos comuns no Ubuntu:

```bash
sudo cp deploy/nginx/cliion.cloud.conf /etc/nginx/sites-available/cliion.cloud
sudo ln -s /etc/nginx/sites-available/cliion.cloud /etc/nginx/sites-enabled/cliion.cloud
sudo nginx -t
sudo systemctl reload nginx
```

## HTTPS com Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cliion.cloud -d www.cliion.cloud
```

Depois valide o renovador:

```bash
sudo systemctl status certbot.timer
```

## Deploy sugerido na VPS Ubuntu

1. Instale dependencias base:

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

2. Prepare a aplicacao:

```bash
sudo mkdir -p /var/www/cliion
sudo chown -R $USER:$USER /var/www/cliion
git clone <repo> /var/www/cliion
cd /var/www/cliion
cp .env.example .env
```

3. Configure o PostgreSQL:

```bash
sudo -u postgres psql
CREATE DATABASE cliion;
CREATE USER cliion_user WITH ENCRYPTED PASSWORD 'change-me';
GRANT ALL PRIVILEGES ON DATABASE cliion TO cliion_user;
\q
```

4. Ajuste o `.env`, depois rode:

```bash
npm ci
npm run build --workspace frontend
pm2 start ecosystem.config.cjs
```

5. Configure Nginx e HTTPS.

## Endpoint de saude

- `GET /api/health`

Resposta:

```json
{
  "status": "ok",
  "timestamp": "2026-05-13T00:00:00.000Z",
  "environment": "production"
}
```
