import os
import sys
import django
from datetime import date, timedelta
from django.utils import timezone

# Configurar stdout para UTF-8 no Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import (
    User, Patient, Service, Appointment,
    AppointmentLink, Payment, Expense, MedicalRecord
)


def seed():
    print("--- Iniciando o Seeding do banco de dados Django ---")

    # 1. Dev Admin
    dev_admin, created = User.objects.get_or_create(
        email="admin@cliion.com",
        defaults={
            "name": "Dev Admin",
            "role": 1,
            "is_staff": True,
            "is_superuser": True
        }
    )
    dev_admin.set_password("admin")
    dev_admin.role = 1
    dev_admin.is_staff = True
    dev_admin.is_superuser = True
    dev_admin.save()
    print("  [+] Dev Admin: admin@cliion.com | Senha: admin (Role: 1 - Admin/Dev)")

    # 2. Usuários reais do sistema
    real_users = [
        {"name": "Master Admin", "email": "master@clinica.com", "password": "admin123", "role": 1},
        {"name": "João Paulo", "email": "joaopaulofisio9@gmail.com", "password": "Jpcliion775#", "role": 1},
        {"name": "Funcionário Teste", "email": "funcionario.teste@cliion.com", "password": "Funccliion775#", "role": 2},
        {"name": "Alice Queiroz", "email": "alicequeiroz91@outlook.com", "password": "fisio3101", "role": 2},
        {"name": "Matheus Domingos Torres", "email": "matheusdomingostorres@gmail.com", "password": "fisio2408", "role": 2},
        {"name": "Gleidyani", "email": "Gleidyani19@outlook.com", "password": "Ane12196", "role": 2},
    ]

    for u_info in real_users:
        u, _ = User.objects.get_or_create(
            email=u_info["email"],
            defaults={"name": u_info["name"], "role": u_info["role"]}
        )
        u.set_password(u_info["password"])
        u.name = u_info["name"]
        u.role = u_info["role"]
        u.save()
        print(f"  [+] Usuario: {u.email} | Role: {u.role}")

    # 3. Serviços Base
    services_data = [
        {"name": "Avaliação fisioterapêutica", "description": "Avaliação inicial para entender histórico, queixa principal e plano terapêutico.", "price": 180.0, "duration_minutes": 60},
        {"name": "Sessão de fisioterapia", "description": "Atendimento individual com foco em reabilitação, mobilidade e controle de dor.", "price": 150.0, "duration_minutes": 60},
        {"name": "Osteopatia", "description": "Atendimento manual para avaliação e tratamento de disfunções corporais.", "price": 220.0, "duration_minutes": 60},
        {"name": "Fisioterapia pélvica", "description": "Atendimento especializado para saúde pélvica e funcionalidade.", "price": 200.0, "duration_minutes": 60},
    ]

    created_services = []
    for s_info in services_data:
        s, _ = Service.objects.get_or_create(
            name=s_info["name"],
            defaults={
                "description": s_info["description"],
                "price": s_info["price"],
                "duration_minutes": s_info["duration_minutes"]
            }
        )
        created_services.append(s)
        print(f"  [+] Servico: {s.name} - R$ {s.price}")

    # 4. Pacientes Exemplo
    patients_data = [
        {"name": "Maria Oliveira Santos", "email": "maria.oliveira@gmail.com", "phone": "(11) 98765-4321", "birth_date": date(1992, 4, 15), "address": "Rua das Flores, 123 - SP"},
        {"name": "Carlos Eduardo Lima", "email": "carlos.lima@hotmail.com", "phone": "(11) 97654-3210", "birth_date": date(1985, 8, 22), "address": "Av. Paulista, 1000 - SP"},
        {"name": "Fernanda Souza", "email": "fernanda.souza@gmail.com", "phone": "(11) 96543-2109", "birth_date": date(1998, 12, 5), "address": "Rua Augusta, 450 - SP"},
    ]

    created_patients = []
    for p_info in patients_data:
        p, _ = Patient.objects.get_or_create(
            name=p_info["name"],
            defaults={
                "email": p_info["email"],
                "phone": p_info["phone"],
                "birth_date": p_info["birth_date"],
                "address": p_info["address"]
            }
        )
        created_patients.append(p)
        print(f"  [+] Paciente: {p.name}")

    # 5. Agendamentos
    today = date.today()
    if created_patients and created_services:
        appts = [
            {"patient": created_patients[0], "service": created_services[0], "user": dev_admin, "date": today, "time": "09:00", "status": "CONFIRMED", "notes": "Primeira avaliação"},
            {"patient": created_patients[1], "service": created_services[1], "user": dev_admin, "date": today, "time": "11:00", "status": "CONFIRMED", "notes": "Sessão de manutenção"},
            {"patient": created_patients[2], "service": created_services[2], "user": dev_admin, "date": today + timedelta(days=1), "time": "14:00", "status": "PENDING", "notes": "Osteopatia pós-treino"},
        ]

        for a_info in appts:
            appt, _ = Appointment.objects.get_or_create(
                patient=a_info["patient"],
                appointment_date=a_info["date"],
                appointment_time=a_info["time"],
                defaults={
                    "service": a_info["service"],
                    "user": a_info["user"],
                    "status": a_info["status"],
                    "notes": a_info["notes"]
                }
            )
            print(f"  [+] Agendamento: {appt.patient.name} - {appt.appointment_date} as {appt.appointment_time}")

            if a_info["status"] == "CONFIRMED":
                Payment.objects.get_or_create(
                    appointment=appt,
                    defaults={
                        "amount": a_info["service"].price,
                        "method": "PIX",
                        "status": "PAID",
                        "paid_at": timezone.now()
                    }
                )

    # 6. Despesas
    expenses = [
        {"description": "Material descartavel de fisioterapia", "amount": 350.0, "expense_date": today - timedelta(days=2)},
        {"description": "Manutencao dos equipamentos de pilates", "amount": 420.0, "expense_date": today - timedelta(days=5)},
    ]
    for e_info in expenses:
        Expense.objects.get_or_create(
            description=e_info["description"],
            expense_date=e_info["expense_date"],
            defaults={"amount": e_info["amount"]}
        )
    print("  [+] Despesas registradas.")

    # 7. Prontuários Médicos
    if created_patients:
        MedicalRecord.objects.get_or_create(
            patient=created_patients[0],
            type="Avaliação Traumato-Ortopédica",
            defaults={
                "date": timezone.now(),
                "notes": "Paciente relata dor na regiao lombar apos esforco fisico.",
                "data": {
                    "mainComplaint": "Dor lombar L4-L5",
                    "painLevel": 7,
                    "treatmentPlan": "Mobilização articular + TENS + Fortalecimento de core"
                }
            }
        )
        print("  [+] Prontuario medico criado.")

    print("\n--- SEEDING CONCLUIDO COM SUCESSO ---")


if __name__ == "__main__":
    seed()
