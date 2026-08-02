# Sistema Cliion - Gestão Clínica (Backend Unificado Django 6 + Frontend React)

Sistema completo de gestão clínica com backend unificado em **Django 6 (Python 3.14)** e **Django REST Framework (DRF)**, servindo uma aplicação SPA moderna em **React + Vite**.

---

## 🚀 Tecnologias (Stack)

- **Backend**: Python 3.14, Django 6, Django REST Framework (DRF), `djangorestframework-simplejwt`, `django-cors-headers`, `psycopg` (v3).
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts.
- **Banco de Dados**: SQLite3 (Ambiente de Desenvolvimento) e PostgreSQL (Produção via `DATABASE_URL`).
- **Orquestração e Deploy**: `concurrently`, PM2, Gunicorn, Nginx, Certbot (HTTPS).

---

## 📂 Estrutura do Projeto

```text
sistema-cliion-gest-o/
├── admin-django/            # Backend unificado em Django 6 (Python 3.14)
│   ├── config/              # Configurações globais (settings.py, urls.py, wsgi.py)
│   ├── core/                # App principal (models, serializers, views, urls)
│   ├── seed.py              # Script de população do banco de dados (Dev + Equipe)
│   ├── test_all_features.py # Suíte de testes de integração E2E da API
│   └── requirements.txt     # Dependências Python travadas
├── frontend/                # SPA Frontend em React 18 + Vite
│   ├── src/                 # Componentes, Páginas, Hooks e Libs de API
│   └── vite.config.js       # Configuração do Vite e Proxy da API
├── deploy/                  # Scripts e configurações para VPS Ubuntu
│   ├── nginx/               # Configuração do Nginx
│   └── scripts/             # Script automatizado de deploy (deploy.sh)
├── ecosystem.config.cjs     # Configuração de processos PM2 (Gunicorn / React)
├── package.json             # Orquestrador local com concurrently
└── README.md
```

---

## 🔑 Credenciais Iniciais de Acesso

Após executar o comando de seed, o sistema estará populado com as credenciais abaixo:

### Conta de Desenvolvedor (Dev Admin)
- **E-mail / Login**: `admin@cliion.com` (ou digite apenas `admin`)
- **Senha**: `admin`
- **Perfil**: `1` (Administrador / Dev)

### Equipe da Clínica
- **Master Admin**: `master@clinica.com` | Senha: `admin123` (Admin)
- **João Paulo**: `joaopaulofisio9@gmail.com` | Senha: `Jpcliion775#` (Admin)
- **Funcionário Teste**: `funcionario.teste@cliion.com` | Senha: `Funccliion775#` (Colaborador)
- **Alice Queiroz**: `alicequeiroz91@outlook.com` | Senha: `fisio3101` (Colaborador)
- **Matheus Torres**: `matheusdomingostorres@gmail.com` | Senha: `fisio2408` (Colaborador)
- **Gleidyani**: `Gleidyani19@outlook.com` | Senha: `Ane12196` (Colaborador)

---

## 💻 Desenvolvimento Local

### 1. Pré-requisitos
- Node.js 18+ ou 20+
- Python 3.14 instalado e no PATH

### 2. Configuração Inicial do Ambiente

Na raiz do projeto, instale as dependências do orquestrador e do frontend:
```bash
npm run install:all
```

Acesse a pasta do backend Django para preparar o ambiente virtual e popular o banco:
```bash
cd admin-django
python -m venv venv

# No Windows (PowerShell/CMD):
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe seed.py

# No Linux/macOS:
./venv/bin/pip install -r requirements.txt
./venv/bin/python manage.py migrate
./venv/bin/python seed.py
```

### 3. Executando o Projeto

Volte para a raiz do repositório e execute o orquestrador:
```bash
npm run dev
```

Este comando utilizará o `concurrently` para subir simultaneamente:
- **Frontend React**: `http://localhost:5173`
- **Backend Django**: `http://127.0.0.1:8000`

---

## 🧪 Testes Automatizados

Para rodar a suíte completa de testes de integração cobrindo todas as rotas (Autenticação, Pacientes, Prontuários, Serviços, Agendamentos, Financeiro e Links):

```bash
cd admin-django
.\venv\Scripts\python.exe test_all_features.py
```

---

## 🌐 Deploy em Produção (VPS Ubuntu)

### 1. Preparação do Servidor Ubuntu
Instale as ferramentas de sistema:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.14 python3.14-venv python3-pip nginx postgresql postgresql-contrib git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 2. Banco de Dados PostgreSQL (Opcional para Produção)
```bash
sudo -u postgres psql
CREATE DATABASE cliion;
CREATE USER cliion_user WITH ENCRYPTED PASSWORD 'SUA_SENHA_SEGURA';
GRANT ALL PRIVILEGES ON DATABASE cliion TO cliion_user;
\q
```

### 3. Deploy da Aplicação
Clone o repositório em `/var/www/cliion`:
```bash
sudo mkdir -p /var/www/cliion
sudo chown -R $USER:$USER /var/www/cliion
git clone <URL_DO_REPOSITORIO> /var/www/cliion
cd /var/www/cliion

# Rodar script automatizado de deploy
chmod +x deploy/scripts/deploy.sh
./deploy/scripts/deploy.sh
```

### 4. Configuração do Nginx & HTTPS (Certbot)
Copie as configurações do Nginx:
```bash
sudo cp deploy/nginx/cliion.cloud.conf /etc/nginx/sites-available/cliion.cloud
sudo ln -s /etc/nginx/sites-available/cliion.cloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Gere os certificados SSL gratuitos com Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cliion.cloud -d www.cliion.cloud
```

### 5. Monitoramento com PM2
```bash
pm2 status
pm2 logs cliion-backend-django
```

---

## 🏥 Healthcheck da API

- **Endpoint**: `GET /api/health`
- **Resposta**:
```json
{
  "status": "ok",
  "timestamp": "2026-08-01T21:00:00.000000+00:00",
  "environment": "django"
}
```
