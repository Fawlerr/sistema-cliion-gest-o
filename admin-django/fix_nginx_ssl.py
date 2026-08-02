import sys
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


def fix_ssl():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname=VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)

    # 1. Limpar link quebrado do default
    run_remote(client, "rm -f /etc/nginx/sites-enabled/default")

    # 2. Verificar certificados SSL existentes em /etc/letsencrypt/live/
    print("\n--- CERTIFICADOS SSL EXISTENTES ---")
    run_remote(client, "ls -la /etc/letsencrypt/live/ || true")

    # 3. Escrever configuração Nginx limpa para cliion.cloud
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
    write_cmd = f"""
    cat << 'EOF' > /etc/nginx/sites-available/cliion.cloud.conf
{nginx_conf}
EOF
    ln -sf /etc/nginx/sites-available/cliion.cloud.conf /etc/nginx/sites-enabled/cliion.cloud.conf
    nginx -t && systemctl reload nginx
    """
    run_remote(client, write_cmd)

    # 4. Se certbot estiver instalado, rodar certbot para habilitar SSL em cliion.cloud
    print("\n--- CONFIGURANDO/EXPANDINDO CERTIFICADO SSL COM CERTBOT ---")
    run_remote(client, "certbot --nginx -d cliion.cloud -d www.cliion.cloud --non-interactive --agree-tos -m admin@cliion.com --redirect || certbot --nginx -d cliion.cloud -d www.cliion.cloud --reinstall --redirect || true")

    # 5. Testar saúde da API na porta 8000
    print("\n--- TESTANDO API LOCAL ---")
    run_remote(client, "curl -s http://127.0.0.1:8000/api/health")

    client.close()


if __name__ == "__main__":
    fix_ssl()
