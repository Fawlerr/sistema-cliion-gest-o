from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Patient, Service


class ApiTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["status"], "ok")

    def test_bootstrap_register_and_login(self):
        # Primeiro registro = Bootstrap Admin
        reg_response = self.client.post("/api/auth/register", {
            "name": "Admin Cliion",
            "email": "admin@cliion.com",
            "password": "Password123!"
        }, format="json")
        self.assertEqual(reg_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(reg_response.json()["data"]["role"], 1)

        # Login com admin
        login_response = self.client.post("/api/auth/login", {
            "email": "admin@cliion.com",
            "password": "Password123!"
        }, format="json")
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        token = login_response.json()["data"]["token"]
        self.assertTrue(token)

        # Testar me
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        me_response = self.client.get("/api/auth/me")
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.json()["data"]["email"], "admin@cliion.com")

    def test_services_and_patients(self):
        # Admin setup
        admin_user = User.objects.create_user(
            email="doc@cliion.com",
            password="Password123!",
            name="Dr. Cliion",
            role=1
        )
        self.client.force_authenticate(user=admin_user)

        # Criar serviço
        srv_res = self.client.post("/api/services", {
            "name": "Consulta Fisioterapia",
            "price": 150.0,
            "durationMinutes": 50
        }, format="json")
        self.assertEqual(srv_res.status_code, status.HTTP_201_CREATED)

        # Criar paciente
        pat_res = self.client.post("/api/patients", {
            "name": "João da Silva",
            "email": "joao@gmail.com",
            "phone": "11999998888"
        }, format="json")
        self.assertEqual(pat_res.status_code, status.HTTP_201_CREATED)

        # Listar pacientes
        list_res = self.client.get("/api/patients")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.json()["data"]), 1)
