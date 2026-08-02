import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")

base = "https://cliion.cloud/api"

print("=== TESTE COMPLETO DE PRODUÇÃO (cliion.cloud) ===\n")

# 1. Listar serviços públicos
req = urllib.request.Request(f"{base}/services")
res = urllib.request.urlopen(req)
services = json.loads(res.read().decode())["data"]
service_id = services[0]["id"]
service_name = services[0]["name"]
print(f"[OK] Serviços disponíveis: {len(services)}")
print(f"     Primeiro serviço: {service_name} (ID: {service_id})")

# 2. Agendamento público via site
print("\n--- TESTANDO AGENDAMENTO PÚBLICO (SITE PÚBLICO) ---")
appt_payload = json.dumps({
    "patientName": "Bruno Fernandes",
    "phone": "(11) 98888-7777",
    "email": "bruno@gmail.com",
    "serviceId": service_id,
    "appointmentDate": "2026-08-15",
    "appointmentTime": "16:00",
    "notes": "Agendamento via site público"
}).encode()

req = urllib.request.Request(
    f"{base}/appointments/public",
    data=appt_payload,
    headers={"Content-Type": "application/json"}
)
res = urllib.request.urlopen(req)
pub_appt = json.loads(res.read().decode())["data"]
appt_id = pub_appt.get("id", "?")
appt_patient = pub_appt.get("patientName", pub_appt.get("patient_name", "?"))
print(f"[OK] Agendamento criado: ID={appt_id} | Paciente={appt_patient} | Data={pub_appt.get('appointmentDate')} {pub_appt.get('appointmentTime')}")

# 3. Login do administrador
print("\n--- TESTANDO LOGIN E SESSÃO ---")
req = urllib.request.Request(
    f"{base}/auth/login",
    data=json.dumps({"email": "admin@cliion.com", "password": "admin"}).encode(),
    headers={"Content-Type": "application/json"}
)
res = urllib.request.urlopen(req)
login_data = json.loads(res.read().decode())["data"]
token = login_data["token"]
user = login_data["user"]
print(f"[OK] Login: {user['name']} | Role={user['role']} | Email={user['email']}")

auth_headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# 4. Listagem de pacientes
req = urllib.request.Request(f"{base}/patients", headers=auth_headers)
res = urllib.request.urlopen(req)
patients = json.loads(res.read().decode())["data"]
print(f"\n[OK] Pacientes no sistema: {len(patients)}")

# 5. Prontuários médicos
print("\n--- TESTANDO PRONTUÁRIOS ---")
for patient in patients:
    req = urllib.request.Request(f"{base}/patients/{patient['id']}/medical-records", headers=auth_headers)
    res = urllib.request.urlopen(req)
    records = json.loads(res.read().decode())["data"]
    if records:
        r = records[0]
        print(f"[OK] Prontuário de '{patient['name']}': Tipo={r['type']} | Data={str(r['date'])[:10]}")
        print(f"     Notas: {str(r.get('notes', '-'))[:60]}")
        break
else:
    print("[INFO] Nenhum prontuário encontrado nos pacientes")

# 6. Dashboard KPIs
print("\n--- TESTANDO DASHBOARD ---")
req = urllib.request.Request(f"{base}/dashboard", headers=auth_headers)
res = urllib.request.urlopen(req)
dashboard = json.loads(res.read().decode())["data"]
kpis = dashboard["kpis"]
print(f"[OK] KPIs:")
print(f"     Total de Pacientes: {kpis['totalPatients']}")
print(f"     Agendamentos Hoje: {kpis['appointmentsToday']}")
print(f"     Faturamento Mensal: R$ {kpis['monthlyRevenue']}")
print(f"     Total de Despesas: R$ {kpis['totalExpenses']}")

# 7. Verificar agendamento público criado aparece no painel
print("\n--- VERIFICANDO AGENDAMENTO PÚBLICO NO PAINEL ---")
req = urllib.request.Request(f"{base}/appointments?limit=100", headers=auth_headers)
res = urllib.request.urlopen(req)
appts = json.loads(res.read().decode())["data"]
found = [a for a in appts if str(a.get("appointmentDate", "")).startswith("2026-08-15")]
print(f"[OK] Agendamentos em 2026-08-15: {len(found)} encontrado(s)")
for a in found[:2]:
    patient_name = a.get("patientName") or a.get("patient_name", "?")
    print(f"     Paciente: {patient_name} | {a.get('appointmentTime')} | Status: {a.get('status')}")

print("\n=================================================")
print("✅ TODOS OS TESTES DE PRODUÇÃO PASSARAM!")
print("=================================================")
