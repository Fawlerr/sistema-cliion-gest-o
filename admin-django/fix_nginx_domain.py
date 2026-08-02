import sys
import time
import paramiko

# Configurar stdout UTF-8
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

VPS_HOST = "177.7.52.70"
VPS_USER = "root"
VPS_PASS = "Rootcliion961084#"


def run_remote(client, cmd):
    print(f"\n⚡ EXEC: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=120)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out:
        print(out.strip())
    if err and exit_status != 0:
        print(f"⚠️ STDERR: {err.strip()}")
    return out


def fix():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname=VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)

    print("--- 1. RESTAURAR NGINX ORIGINAL E CONFIGURAR DOMÍNIO cliion.cloud ---")
    
    # 1. Verificar sites existentes no Nginx
    run_remote(client, "ls -la /etc/nginx/sites-enabled/")

    # 2. Restaurar default se existia antes (ex: printfornece)
    run_remote(client, "rm -f /etc/nginx/sites-enabled/cliion /etc/nginx/sites-available/cliion")

    # 3. Configurar Nginx especificamente para o domínio cliion.cloud
    nginx_conf = """
server {
    listen 80;
    server_name cliion.cloud www.cliion.cloud;

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
    write_nginx = f"""
    cat << 'EOF' > /etc/nginx/sites-available/cliion.cloud.conf
{nginx_conf}
EOF
    ln -sf /etc/nginx/sites-available/cliion.cloud.conf /etc/nginx/sites-enabled/cliion.cloud.conf
    nginx -t && systemctl reload nginx
    """
    run_remote(client, write_nginx)

    print("\n--- 2. VERIFICAR GUNICORN / PM2 DJANGO ---")
    pm2_cmds = """
    cd /var/www/cliion
    pm2 delete cliion-backend || true
    pm2 delete cliion-backend-django || true
    pm2 start ecosystem.config.cjs
    pm2 save
    """
    run_remote(client, pm2_cmds)

    time.sleep(3)
    run_remote(client, "curl -s http://127.0.0.1:8000/api/health")

    client.close()


if __name__ == "__main__":
    fix()
