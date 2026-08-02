import sys
import time
import paramiko

# Configurar stdout UTF-8
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

VPS_HOST = "177.7.52.70"
VPS_USER = "root"
VPS_PASS = "Rootcliion961084#"
REPO_URL = "https://github.com/Fawlerr/sistema-cliion-gest-o.git"


def run_remote(client, cmd, timeout=300):
    print(f"\n⚡ EXEC: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out:
        print(out.strip())
    if err and exit_status != 0:
        print(f"⚠️ STDERR: {err.strip()}")
    if exit_status != 0:
        raise Exception(f"Comando falhou com código {exit_status}: {cmd}")
    return out


def deploy():
    print(f"==================================================")
    print(f"🌐 DEPLOY AUTOMATIZADO VPS PARA DJANGO 6 + REACT")
    print(f"   Servidor: {VPS_USER}@{VPS_HOST}")
    print(f"==================================================")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(hostname=VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
        print("  ✓ Conexão SSH estabelecida com sucesso!")

        # 1. Atualizar pacotes de sistema e instalar Python3 / Node / Nginx / PM2 se necessário
        setup_cmds = """
        apt-get update -y
        apt-get install -y git curl python3 python3-pip python3-venv nginx
        if ! command -v node &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
        fi
        if ! command -v pm2 &> /dev/null; then
            npm install -g pm2
        fi
        """
        run_remote(client, setup_cmds)

        # 2. Clonar ou atualizar o repositório em /var/www/cliion
        repo_cmds = f"""
        mkdir -p /var/www/cliion
        if [ ! -d "/var/www/cliion/.git" ]; then
            git clone {REPO_URL} /var/www/cliion
        else
            cd /var/www/cliion && git fetch --all && git reset --hard origin/main
        fi
        """
        run_remote(client, repo_cmds)

        # 3. Configurar Backend Django 6 (Venv, Migrations, Seed, Collectstatic)
        django_cmds = """
        cd /var/www/cliion/admin-django
        python3 -m venv venv
        ./venv/bin/pip install --upgrade pip
        ./venv/bin/pip install -r requirements.txt
        ./venv/bin/pip install gunicorn
        ./venv/bin/python manage.py migrate --noinput
        ./venv/bin/python seed.py
        ./venv/bin/python manage.py collectstatic --noinput || true
        """
        run_remote(client, django_cmds)

        # 4. Build do Frontend React
        front_cmds = """
        cd /var/www/cliion
        npm ci
        npm run build --prefix frontend
        """
        run_remote(client, front_cmds)

        # 5. Configurar Nginx para servir Frontend estático e Proxy para Django na porta 8000
        nginx_conf = """
server {
    listen 80;
    server_name _;

    root /var/www/cliion/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/cliion/admin-django/staticfiles/;
    }
}
"""
        nginx_cmd = f"""
        cat << 'EOF' > /etc/nginx/sites-available/cliion
{nginx_conf}
EOF
        ln -sf /etc/nginx/sites-available/cliion /etc/nginx/sites-enabled/default
        nginx -t && systemctl reload nginx
        """
        run_remote(client, nginx_cmd)

        # 6. Iniciar/Reiniciar PM2 com Gunicorn
        pm2_cmd = """
        cd /var/www/cliion
        pm2 delete cliion-backend-django || true
        pm2 start ecosystem.config.cjs
        pm2 save
        """
        run_remote(client, pm2_cmd)

        # 7. Teste de Healthcheck em Produção
        print("\n--- 🌐 TESTANDO DEPLOY NA VPS EM PRODUÇÃO ---")
        time.sleep(3)
        health_cmd = "curl -s http://127.0.0.1:8000/api/health"
        out = run_remote(client, health_cmd)
        print(f"  [OK] Resposta de Produção: {out}")

        print("\n==================================================")
        print(f"✅ DEPLOY EM PRODUÇÃO CONCLUÍDO COM SUCESSO!")
        print(f"   Acesse o sistema em: http://{VPS_HOST}")
        print("==================================================")

    except Exception as e:
        print(f"\n❌ ERRO NO DEPLOY: {e}")
    finally:
        client.close()


if __name__ == "__main__":
    deploy()
