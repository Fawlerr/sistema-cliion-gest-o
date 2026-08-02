import uuid
from datetime import datetime, date, timedelta
from django.utils import timezone
from django.db.models import Sum, Count
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User, Patient, Service, Appointment,
    AppointmentLink, Payment, Expense, MedicalRecord
)
from .serializers import (
    UserSerializer, RegisterSerializer, PatientSerializer,
    ServiceSerializer, AppointmentSerializer, AppointmentLinkSerializer,
    PaymentSerializer, ExpenseSerializer, MedicalRecordSerializer
)


def api_success(data, meta=None, status_code=status.HTTP_200_OK):
    res = {"data": data}
    if meta is not None:
        res["meta"] = meta
    return Response(res, status=status_code)


def api_error(message, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"error": {"message": message}}, status=status_code)


class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, "role", 2) == 1)


class IsDoctorOrAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, "role", 2) in [1, 2])


# --- AUTH VIEWS ---

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        if not email or not password:
            return api_error("Email e senha são obrigatórios.")

        try:
            from django.db.models import Q
            user = User.objects.filter(Q(email__iexact=email) | Q(email__iexact=f"{email}@cliion.com")).first()
            if not user:
                return api_error("Credenciais inválidas.", status_code=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            return api_error("Credenciais inválidas.", status_code=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return api_error("Credenciais inválidas.", status_code=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        return api_success({
            "token": str(refresh.access_token),
            "user": user_data
        })


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        total_users = User.objects.count()
        bootstrap_mode = total_users == 0

        if not bootstrap_mode:
            if not request.user or not request.user.is_authenticated:
                return api_error("Autenticação necessária para registrar novos usuários.", status_code=status.HTTP_401_UNAUTHORIZED)
            if request.user.role != 1:
                return api_error("Apenas administradores podem cadastrar novos usuários.", status_code=status.HTTP_403_FORBIDDEN)

        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)
            return api_error(err_msg)

        data = serializer.validated_data
        target_role = 1 if bootstrap_mode else data.get("role", 2)

        if User.objects.filter(email__iexact=data["email"]).exists():
            return api_error("Já existe um usuário cadastrado com este e-mail.", status_code=status.HTTP_409_CONFLICT)

        user = User.objects.create_user(
            email=data["email"],
            password=data["password"],
            name=data["name"],
            role=target_role
        )

        return api_success(UserSerializer(user).data, status_code=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return api_success(UserSerializer(request.user).data)


# --- HEALTH CHECK ---

class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            "status": "ok",
            "timestamp": timezone.now().isoformat(),
            "environment": "django"
        })


# --- USERS VIEWS ---

class UserListView(APIView):
    permission_classes = [IsDoctorOrAdminRole]

    def get(self, request):
        users = User.objects.all().order_by("-created_at")
        serializer = UserSerializer(users, many=True)
        return api_success(serializer.data, meta={"count": users.count()})


class UserDetailView(APIView):
    permission_classes = [IsDoctorOrAdminRole]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            return api_success(UserSerializer(user).data)
        except User.DoesNotExist:
            return api_error("Usuário não encontrado.", status_code=status.HTTP_404_NOT_FOUND)


# --- PATIENTS VIEWS ---

class PatientListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        patients = Patient.objects.all().order_by("-created_at")
        serializer = PatientSerializer(patients, many=True)
        return api_success(serializer.data, meta={"count": patients.count()})

    def post(self, request):
        if request.user.role not in [1, 2]:
            return api_error("Permissão negada.", status_code=status.HTTP_403_FORBIDDEN)

        serializer = PatientSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error(str(serializer.errors))

        patient = serializer.save()
        return api_success(PatientSerializer(patient).data, status_code=status.HTTP_201_CREATED)


class PatientDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            patient = Patient.objects.get(pk=pk)
            return api_success(PatientSerializer(patient).data)
        except Patient.DoesNotExist:
            return api_error("Paciente não encontrado.", status_code=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        if request.user.role not in [1, 2]:
            return api_error("Permissão negada.", status_code=status.HTTP_403_FORBIDDEN)

        try:
            patient = Patient.objects.get(pk=pk)
        except Patient.DoesNotExist:
            return api_error("Paciente não encontrado.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = PatientSerializer(patient, data=request.data, partial=True)
        if not serializer.is_valid():
            return api_error(str(serializer.errors))

        patient = serializer.save()
        return api_success(PatientSerializer(patient).data)

    def delete(self, request, pk):
        if request.user.role != 1:
            return api_error("Apenas administradores podem remover pacientes.", status_code=status.HTTP_403_FORBIDDEN)

        try:
            patient = Patient.objects.get(pk=pk)
            patient.delete()
            return api_success({"message": "Paciente removido com sucesso."})
        except Patient.DoesNotExist:
            return api_error("Paciente não encontrado.", status_code=status.HTTP_404_NOT_FOUND)


class PatientMedicalRecordListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        records = MedicalRecord.objects.filter(patient_id=pk).order_by("-date")
        serializer = MedicalRecordSerializer(records, many=True)
        return api_success(serializer.data, meta={"count": records.count()})

    def post(self, request, pk):
        if request.user.role not in [1, 2]:
            return api_error("Permissão negada.", status_code=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        data["patientId"] = pk
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())
        if "date" not in data or not data["date"]:
            data["date"] = timezone.now().isoformat()

        serializer = MedicalRecordSerializer(data=data)
        if not serializer.is_valid():
            return api_error(str(serializer.errors))

        record = serializer.save()
        return api_success(MedicalRecordSerializer(record).data, status_code=status.HTTP_201_CREATED)


# --- SERVICES VIEWS ---

class ServiceListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        services = Service.objects.all().order_by("name")
        serializer = ServiceSerializer(services, many=True)
        return api_success(serializer.data, meta={"count": services.count()})

    def post(self, request):
        if not request.user or not request.user.is_authenticated or request.user.role != 1:
            return api_error("Apenas administradores podem criar serviços.", status_code=status.HTTP_403_FORBIDDEN)

        serializer = ServiceSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error(str(serializer.errors))

        service = serializer.save()
        return api_success(ServiceSerializer(service).data, status_code=status.HTTP_201_CREATED)


class ServiceDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            service = Service.objects.get(pk=pk)
            return api_success(ServiceSerializer(service).data)
        except Service.DoesNotExist:
            return api_error("Serviço não encontrado.", status_code=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        if not request.user or not request.user.is_authenticated or request.user.role != 1:
            return api_error("Apenas administradores podem editar serviços.", status_code=status.HTTP_403_FORBIDDEN)

        try:
            service = Service.objects.get(pk=pk)
        except Service.DoesNotExist:
            return api_error("Serviço não encontrado.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = ServiceSerializer(service, data=request.data, partial=True)
        if not serializer.is_valid():
            return api_error(str(serializer.errors))

        service = serializer.save()
        return api_success(ServiceSerializer(service).data)


# --- APPOINTMENTS VIEWS ---

class AppointmentAvailabilityView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        target_date = request.query_params.get("date")
        if not target_date:
            return api_error("Parâmetro 'date' é obrigatório (YYYY-MM-DD).")

        booked = Appointment.objects.filter(
            appointment_date=target_date
        ).exclude(status="CANCELLED").values_list("appointment_time", flat=True)

        return api_success({"bookedTimes": list(booked)})


class AppointmentPublicView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        patient_name = request.data.get("patientName") or request.data.get("name")
        patient_phone = request.data.get("phone")
        patient_email = request.data.get("email")
        service_id = request.data.get("serviceId")
        appt_date = request.data.get("appointmentDate") or request.data.get("date")
        appt_time = request.data.get("appointmentTime") or request.data.get("time")

        if not patient_name or not service_id or not appt_date or not appt_time:
            return api_error("Nome, serviço, data e horário são obrigatórios.")

        try:
            service = Service.objects.get(pk=service_id)
        except Service.DoesNotExist:
            return api_error("Serviço selecionado não existe.")

        patient, _ = Patient.objects.get_or_create(
            name=patient_name,
            defaults={"phone": patient_phone, "email": patient_email}
        )

        appointment = Appointment.objects.create(
            patient=patient,
            service=service,
            appointment_date=appt_date,
            appointment_time=appt_time,
            status="CONFIRMED",
            notes=request.data.get("notes", "")
        )

        return api_success(AppointmentSerializer(appointment).data, status_code=status.HTTP_201_CREATED)


class AppointmentListView(APIView):
    permission_classes = [IsDoctorOrAdminRole]

    def get(self, request):
        appointments = Appointment.objects.all().order_by("-appointment_date", "-appointment_time")
        serializer = AppointmentSerializer(appointments, many=True)
        return api_success(serializer.data, meta={"count": appointments.count()})

    def post(self, request):
        data = request.data.copy()
        if "patientId" not in data and "patient_id" in data:
            data["patientId"] = data["patient_id"]

        serializer = AppointmentSerializer(data=data)
        if not serializer.is_valid():
            return api_error(str(serializer.errors))

        appointment = serializer.save()
        return api_success(AppointmentSerializer(appointment).data, status_code=status.HTTP_201_CREATED)


class AppointmentDetailView(APIView):
    permission_classes = [IsDoctorOrAdminRole]

    def get(self, request, pk):
        try:
            appt = Appointment.objects.get(pk=pk)
            return api_success(AppointmentSerializer(appt).data)
        except Appointment.DoesNotExist:
            return api_error("Agendamento não encontrado.", status_code=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            appt = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return api_error("Agendamento não encontrado.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = AppointmentSerializer(appt, data=request.data, partial=True)
        if not serializer.is_valid():
            return api_error(str(serializer.errors))

        appt = serializer.save()
        return api_success(AppointmentSerializer(appt).data)

    def delete(self, request, pk):
        if request.user.role != 1:
            return api_error("Apenas administradores podem apagar agendamentos.", status_code=status.HTTP_403_FORBIDDEN)

        try:
            appt = Appointment.objects.get(pk=pk)
            appt.delete()
            return api_success({"message": "Agendamento removido."})
        except Appointment.DoesNotExist:
            return api_error("Agendamento não encontrado.", status_code=status.HTTP_404_NOT_FOUND)


class AppointmentCancelView(APIView):
    permission_classes = [IsDoctorOrAdminRole]

    def patch(self, request, pk):
        try:
            appt = Appointment.objects.get(pk=pk)
            appt.status = "CANCELLED"
            appt.save()
            return api_success(AppointmentSerializer(appt).data)
        except Appointment.DoesNotExist:
            return api_error("Agendamento não encontrado.", status_code=status.HTTP_404_NOT_FOUND)


# --- DASHBOARD & FINANCIAL VIEWS ---

class DashboardView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        today = date.today()
        total_patients = Patient.objects.count()
        today_appointments = Appointment.objects.filter(appointment_date=today).count()
        total_revenue = Payment.objects.filter(status="PAID").aggregate(total=Sum("amount"))["total"] or 0.0
        total_expenses = Expense.objects.aggregate(total=Sum("amount"))["total"] or 0.0

        seven_days_ago = today - timedelta(days=6)
        appts_by_day = Appointment.objects.filter(
            appointment_date__gte=seven_days_ago
        ).values("appointment_date").annotate(total=Count("id")).order_by("appointment_date")

        appointments_by_day_list = [
            {
                "label": item["appointment_date"].strftime("%d %b"),
                "date": item["appointment_date"].isoformat(),
                "total": item["total"]
            }
            for item in appts_by_day
        ]

        return api_success({
            "kpis": {
                "totalPatients": total_patients,
                "appointmentsToday": today_appointments,
                "monthlyRevenue": total_revenue,
                "totalExpenses": total_expenses
            },
            "charts": {
                "revenueTimeline": [],
                "appointmentsByDay": appointments_by_day_list
            }
        })


class PaymentListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        payments = Payment.objects.all().order_by("-created_at")
        serializer = PaymentSerializer(payments, many=True)
        return api_success(serializer.data, meta={"count": payments.count()})

    def post(self, request):
        serializer = PaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error(str(serializer.errors))
        payment = serializer.save()
        return api_success(PaymentSerializer(payment).data, status_code=status.HTTP_201_CREATED)


class PaymentDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk)
            return api_success(PaymentSerializer(payment).data)
        except Payment.DoesNotExist:
            return api_error("Pagamento não encontrado.", status_code=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk)
        except Payment.DoesNotExist:
            return api_error("Pagamento não encontrado.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = PaymentSerializer(payment, data=request.data, partial=True)
        if not serializer.is_valid():
            return api_error(str(serializer.errors))
        payment = serializer.save()
        return api_success(PaymentSerializer(payment).data)


class ExpenseListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        expenses = Expense.objects.all().order_by("-expense_date")
        serializer = ExpenseSerializer(expenses, many=True)
        return api_success(serializer.data, meta={"count": expenses.count()})

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error(str(serializer.errors))
        expense = serializer.save()
        return api_success(ExpenseSerializer(expense).data, status_code=status.HTTP_201_CREATED)


class ExpenseDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        try:
            expense = Expense.objects.get(pk=pk)
            return api_success(ExpenseSerializer(expense).data)
        except Expense.DoesNotExist:
            return api_error("Despesa não encontrada.", status_code=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            expense = Expense.objects.get(pk=pk)
        except Expense.DoesNotExist:
            return api_error("Despesa não encontrada.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if not serializer.is_valid():
            return api_error(str(serializer.errors))
        expense = serializer.save()
        return api_success(ExpenseSerializer(expense).data)


class BillingView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        total_payments = Payment.objects.aggregate(total=Sum("amount"))["total"] or 0.0
        total_expenses = Expense.objects.aggregate(total=Sum("amount"))["total"] or 0.0
        return api_success({
            "totalPayments": total_payments,
            "totalExpenses": total_expenses,
            "balance": total_payments - total_expenses
        })

    def post(self, request):
        # Lançamento financeiro rápido
        amount = request.data.get("amount")
        description = request.data.get("description", "Lançamento Financeiro")
        entry_type = request.data.get("type", "PAYMENT")

        if not amount:
            return api_error("Valor 'amount' é obrigatório.")

        if entry_type == "EXPENSE":
            expense = Expense.objects.create(
                description=description,
                amount=float(amount),
                expense_date=date.today()
            )
            return api_success(ExpenseSerializer(expense).data, status_code=status.HTTP_201_CREATED)
        else:
            payment = Payment.objects.create(
                amount=float(amount),
                status="PAID",
                paid_at=timezone.now()
            )
            return api_success(PaymentSerializer(payment).data, status_code=status.HTTP_201_CREATED)


# --- APPOINTMENT LINKS VIEWS ---

class AppointmentLinkPublicDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            link = AppointmentLink.objects.get(token=token, active=True, used=False)
            return api_success(AppointmentLinkSerializer(link).data)
        except AppointmentLink.DoesNotExist:
            return api_error("Link de agendamento inválido ou expirado.", status_code=status.HTTP_404_NOT_FOUND)


class AppointmentLinkPublicAvailabilityView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            link = AppointmentLink.objects.get(token=token, active=True)
        except AppointmentLink.DoesNotExist:
            return api_error("Link inválido.", status_code=status.HTTP_404_NOT_FOUND)

        target_date = request.query_params.get("date", date.today().isoformat())
        booked = Appointment.objects.filter(
            appointment_date=target_date
        ).exclude(status="CANCELLED").values_list("appointment_time", flat=True)

        return api_success({"bookedTimes": list(booked)})


class AppointmentLinkPublicBookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, token):
        try:
            link = AppointmentLink.objects.get(token=token, active=True, used=False)
        except AppointmentLink.DoesNotExist:
            return api_error("Link inválido ou já utilizado.", status_code=status.HTTP_400_BAD_REQUEST)

        patient_name = request.data.get("patientName") or request.data.get("name")
        patient_phone = request.data.get("phone")
        patient_email = request.data.get("email")
        appt_date = request.data.get("appointmentDate") or request.data.get("date")
        appt_time = request.data.get("appointmentTime") or request.data.get("time")

        service = link.service
        if not service:
            service_id = request.data.get("serviceId")
            if service_id:
                service = Service.objects.filter(pk=service_id).first()

        if not service:
            return api_error("Serviço não especificado.")

        patient, _ = Patient.objects.get_or_create(
            name=patient_name,
            defaults={"phone": patient_phone, "email": patient_email}
        )

        appointment = Appointment.objects.create(
            patient=patient,
            service=service,
            appointment_date=appt_date,
            appointment_time=appt_time,
            status="CONFIRMED",
            notes=request.data.get("notes", "Agendado via Link Único")
        )

        link.used = True
        link.save()

        return api_success(AppointmentSerializer(appointment).data, status_code=status.HTTP_201_CREATED)


class AppointmentLinkAdminView(APIView):
    permission_classes = [IsDoctorOrAdminRole]

    def get(self, request):
        links = AppointmentLink.objects.all().order_by("-created_at")
        serializer = AppointmentLinkSerializer(links, many=True)
        return api_success(serializer.data, meta={"count": links.count()})

    def post(self, request):
        token_val = request.data.get("token") or str(uuid.uuid4())[:8]
        service_id = request.data.get("serviceId")

        service = Service.objects.filter(pk=service_id).first() if service_id else None

        link = AppointmentLink.objects.create(
            token=token_val,
            service=service,
            creator=request.user,
            config=request.data.get("config", {})
        )

        return api_success(AppointmentLinkSerializer(link).data, status_code=status.HTTP_201_CREATED)


class AppointmentLinkDeactivateView(APIView):
    permission_classes = [IsAdminUserRole]

    def patch(self, request, pk):
        try:
            link = AppointmentLink.objects.get(pk=pk)
            link.active = False
            link.save()
            return api_success(AppointmentLinkSerializer(link).data)
        except AppointmentLink.DoesNotExist:
            return api_error("Link não encontrado.", status_code=status.HTTP_404_NOT_FOUND)
