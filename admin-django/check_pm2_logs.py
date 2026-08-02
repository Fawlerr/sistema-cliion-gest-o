import sys
import paramiko

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

VPS_HOST = "177.7.52.70"
VPS_USER = "root"
VPS_PASS = "Rootcliion961084#"

def run_remote(client, cmd):
    print(f"\n⚡ EXEC: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=30)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out:
        print(out.strip())
    if err:
        print(f"⚠️ STDERR: {err.strip()}")
    return out

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname=VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)

run_remote(client, "pm2 status")
run_remote(client, "pm2 logs cliion-backend-django --lines 30 --raw")

client.close()
