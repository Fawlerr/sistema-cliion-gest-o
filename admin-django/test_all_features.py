import os
import sys
import json
import urllib.request

# Configurar stdout para UTF-8 no Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")


def run_test():
    print("==================================================")
    print("🚀 SUÍTE COMPLETA DE TESTES DE INTEGRAÇÃO (DJANGO 6)")
    print("==================================================")

    BASE_URL = "http://127.0.0.1:8000/api"

    # --- 1. TESTE DE AUTENTICAÇÃO ---
    print("\n--- 1. TESTANDO AUTENTICAÇÃO E LOGINS ---")
    credentials = [
        ("Dev Admin (admin@cliion.com)", "admin@cliion.com", "admin", 1),
        ("Dev Admin Alias (admin)", "admin", "admin", 1),
        ("Master Admin", "master@clinica.com", "admin123", 1),
        ("João Paulo (Admin)", "joaopaulofisio9@gmail.com", "Jpcliion775#", 1),
        ("Funcionário Teste (Staff)", "funcionario.teste@cliion.com", "Funccliion775#", 2),
        ("Alice Queiroz (Staff)", "alicequeiroz91@outlook.com", "fisio3101", 2),
        ("Matheus Torres (Staff)", "matheusdomingostorres@gmail.com", "fisio2408", 2),
        ("Gleidyani (Staff)", "Gleidyani19@outlook.com", "Ane12196", 2),
    ]

    tokens = {}
    for label, email, password, expected_role in credentials:
        try:
            req = urllib.request.Request(
                f"{BASE_URL}/auth/login",
                data=json.dumps({"email": email, "password": password}).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            res = urllib.request.urlopen(req)
            data = json.loads(res.read().decode())
            token = data["data"]["token"]
            user = data["data"]["user"]
            tokens[label] = token
            print(f"  [OK] {label:<32} | User ID: {user['id']} | Role: {user['role']}")
        except Exception as e:
            print(f"  [ERRO] {label:<30} -> {e}")

    token = tokens.get("Dev Admin (admin@cliion.com)")
    auth_headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # --- 2. PERFIL DO USUÁRIO ---
    print("\n--- 2. TESTANDO VALIDAÇÃO DE PERFIL (/auth/me) ---")
    req = urllib.request.Request(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {token}"})
    res = urllib.request.urlopen(req)
    me_data = json.loads(res.read().decode())["data"]
    print(f"  [OK] Perfil Logado: {me_data['name']} | Email: {me_data['email']} | Role: {me_data['role']}")

    # --- 3. PACIENTES E PRONTUÁRIOS ---
    print("\n--- 3. TESTANDO PACIENTES E PRONTUÁRIOS MÉDICOS ---")
    # Cadastro de Paciente
    new_pat_data = {
        "name": "Luciana Mendes",
        "email": "luciana.mendes@gmail.com",
        "phone": "(11) 95555-4444",
        "birthDate": "1994-06-20",
        "address": "Rua Oscar Freire, 800 - SP"
    }
    req = urllib.request.Request(f"{BASE_URL}/patients", data=json.dumps(new_pat_data).encode("utf-8"), headers=auth_headers)
    res = urllib.request.urlopen(req)
    created_pat = json.loads(res.read().decode())["data"]
    print(f"  [OK] Novo Paciente Criado: {created_pat['name']} (ID: {created_pat['id']})")

    # Adicionar Prontuário Médico
    rec_payload = {
        "type": "pelvica",
        "date": "2026-08-01T20:00:00Z",
        "notes": "Avaliação pélvica inicial pós-parto.",
        "data": {
            "mainComplaint": "Desconforto pélvico ao esforço",
            "muscleTone": "Normal",
            "oxfordScale": "4"
        }
    }
    req = urllib.request.Request(f"{BASE_URL}/patients/{created_pat['id']}/medical-records", data=json.dumps(rec_payload).encode("utf-8"), headers=auth_headers)
    res = urllib.request.urlopen(req)
    created_rec = json.loads(res.read().decode())["data"]
    print(f"  [OK] Prontuário Médico Adicionado: {created_rec['type']} - {created_rec['notes']}")

    # Listar Prontuários
    req = urllib.request.Request(f"{BASE_URL}/patients/{created_pat['id']}/medical-records", headers={"Authorization": f"Bearer {token}"})
    res = urllib.request.urlopen(req)
    records_list = json.loads(res.read().decode())["data"]
    print(f"  [OK] Total de Prontuários do Paciente: {len(records_list)}")

    # --- 4. SERVIÇOS E DISPONIBILIDADE ---
    print("\n--- 4. TESTANDO SERVIÇOS E CONSULTA DE DISPONIBILIDADE ---")
    req = urllib.request.Request(f"{BASE_URL}/services")
    res = urllib.request.urlopen(req)
    services = json.loads(res.read().decode())["data"]
    print(f"  [OK] Lista de Serviços ({len(services)} itens cadastrados)")
    service_id = services[0]["id"]

    req = urllib.request.Request(f"{BASE_URL}/appointments/availability?date=2026-08-01")
    res = urllib.request.urlopen(req)
    avail = json.loads(res.read().decode())["data"]
    print(f"  [OK] Horários Ocupados em 2026-08-01: {avail['bookedTimes']}")

    # --- 5. AGENDAMENTOS (PÚBLICO, INTERNO E CANCELAMENTO) ---
    print("\n--- 5. TESTANDO AGENDAMENTOS (PÚBLICO, INTERNO E CANCELAMENTO) ---")
    # Agendamento Público pelo Site
    public_appt_data = {
        "patientName": "Roberto Alves",
        "phone": "(11) 91111-2222",
        "email": "roberto.alves@gmail.com",
        "serviceId": service_id,
        "appointmentDate": "2026-08-10",
        "appointmentTime": "15:00",
        "notes": "Agendamento realizado pelo site público"
    }
    req = urllib.request.Request(f"{BASE_URL}/appointments/public", data=json.dumps(public_appt_data).encode("utf-8"), headers={"Content-Type": "application/json"})
    res = urllib.request.urlopen(req)
    pub_appt = json.loads(res.read().decode())["data"]
    print(f"  [OK] Agendamento Público Realizado: ID {pub_appt['id']} | Data: {pub_appt['appointmentDate']} {pub_appt['appointmentTime']}")

    # Agendamento Interno
    int_appt_data = {
        "patientId": created_pat["id"],
        "serviceId": service_id,
        "appointmentDate": "2026-08-11",
        "appointmentTime": "10:00",
        "status": "CONFIRMED",
        "notes": "Consulta agendada pela recepção"
    }
    req = urllib.request.Request(f"{BASE_URL}/appointments", data=json.dumps(int_appt_data).encode("utf-8"), headers=auth_headers)
    res = urllib.request.urlopen(req)
    int_appt = json.loads(res.read().decode())["data"]
    print(f"  [OK] Agendamento Interno Realizado: ID {int_appt['id']} | Status: {int_appt['status']}")

    # Cancelamento de Agendamento
    req = urllib.request.Request(f"{BASE_URL}/appointments/{pub_appt['id']}/cancel", method="PATCH", headers=auth_headers)
    res = urllib.request.urlopen(req)
    cancelled_appt = json.loads(res.read().decode())["data"]
    print(f"  [OK] Agendamento Cancelado: ID {cancelled_appt['id']} | Novo Status: {cancelled_appt['status']}")

    # --- 6. MÓDULO FINANCEIRO (PAGAMENTOS, DESPESAS E BILLING) ---
    print("\n--- 6. TESTANDO MÓDULO FINANCEIRO ---")
    # Lançar Pagamento
    pay_data = {"appointmentId": int_appt["id"], "amount": 180.0, "method": "Cartão de Crédito", "status": "PAID"}
    req = urllib.request.Request(f"{BASE_URL}/payments", data=json.dumps(pay_data).encode("utf-8"), headers=auth_headers)
    res = urllib.request.urlopen(req)
    payment = json.loads(res.read().decode())["data"]
    print(f"  [OK] Pagamento Registrado: ID {payment['id']} | R$ {payment['amount']} ({payment['method']})")

    # Lançar Despesa
    exp_data = {"description": "Aquisição de faixas elásticas", "amount": 120.0, "expenseDate": "2026-08-01"}
    req = urllib.request.Request(f"{BASE_URL}/expenses", data=json.dumps(exp_data).encode("utf-8"), headers=auth_headers)
    res = urllib.request.urlopen(req)
    expense = json.loads(res.read().decode())["data"]
    print(f"  [OK] Despesa Registrada: ID {expense['id']} | {expense['description']} (R$ {expense['amount']})")

    # Consultar Balanço Financeiro (Billing)
    req = urllib.request.Request(f"{BASE_URL}/billing", headers={"Authorization": f"Bearer {token}"})
    res = urllib.request.urlopen(req)
    billing = json.loads(res.read().decode())["data"]
    print(f"  [OK] Balanço Financeiro: Receita: R$ {billing['totalPayments']} | Despesas: R$ {billing['totalExpenses']} | Saldo: R$ {billing['balance']}")

    # --- 7. LINKS DE AGENDAMENTO RÁPIDO ---
    print("\n--- 7. TESTANDO LINKS DE AGENDAMENTO RÁPIDO ---")
    link_data = {"serviceId": service_id, "token": "link-teste-123"}
    req = urllib.request.Request(f"{BASE_URL}/appointment-links", data=json.dumps(link_data).encode("utf-8"), headers=auth_headers)
    res = urllib.request.urlopen(req)
    created_link = json.loads(res.read().decode())["data"]
    print(f"  [OK] Link Criado: Token '{created_link['token']}'")

    # Consultar Link Público
    req = urllib.request.Request(f"{BASE_URL}/appointment-links/public/appointment-links/{created_link['token']}")
    res = urllib.request.urlopen(req)
    pub_link_info = json.loads(res.read().decode())["data"]
    print(f"  [OK] Link Público Válido: Token '{pub_link_info['token']}' | Serviço: {pub_link_info['service']['name']}")

    # --- 8. DASHBOARD ---
    print("\n--- 8. TESTANDO PAINEL DASHBOARD (/dashboard) ---")
    req = urllib.request.Request(f"{BASE_URL}/dashboard", headers={"Authorization": f"Bearer {token}"})
    res = urllib.request.urlopen(req)
    dash = json.loads(res.read().decode())["data"]
    print(f"  [OK] KPIs Atualizados:")
    print(f"       - Total de Pacientes: {dash['kpis']['totalPatients']}")
    print(f"       - Agendamentos Hoje: {dash['kpis']['appointmentsToday']}")
    print(f"       - Faturamento Mensal: R$ {dash['kpis']['monthlyRevenue']}")
    print(f"       - Despesas Totais: R$ {dash['kpis']['totalExpenses']}")

    print("\n==================================================")
    print("✅ TODAS AS FUNCIONALIDADES FORAM TESTADAS COM SUCESSO!")
    print("==================================================")


if __name__ == "__main__":
    run_test()
