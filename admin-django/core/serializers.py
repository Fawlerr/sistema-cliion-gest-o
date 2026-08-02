from rest_framework import serializers
from .models import User, Patient, Service, Appointment, AppointmentLink, Payment, Expense, MedicalRecord


class UserSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "createdAt", "updatedAt"]


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    role = serializers.IntegerField(required=False, default=2)

    def validate_role(self, value):
        if value not in [1, 2]:
            raise serializers.ValidationError("Role inválida. Use 1 para Admin ou 2 para Colaborador/Médico.")
        return value


class PatientSerializer(serializers.ModelSerializer):
    birthDate = serializers.DateField(source="birth_date", required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Patient
        fields = ["id", "name", "email", "phone", "birthDate", "address", "createdAt"]
        extra_kwargs = {"id": {"required": False}}


class ServiceSerializer(serializers.ModelSerializer):
    durationMinutes = serializers.IntegerField(source="duration_minutes", required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Service
        fields = ["id", "name", "description", "price", "durationMinutes", "createdAt"]


class AppointmentSerializer(serializers.ModelSerializer):
    patientId = serializers.PrimaryKeyRelatedField(source="patient", queryset=Patient.objects.all(), required=False)
    serviceId = serializers.PrimaryKeyRelatedField(source="service", queryset=Service.objects.all(), required=False)
    userId = serializers.PrimaryKeyRelatedField(source="user", queryset=User.objects.all(), required=False, allow_null=True)
    
    patient = PatientSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    patientName = serializers.SerializerMethodField()
    serviceName = serializers.SerializerMethodField()
    userName = serializers.SerializerMethodField()

    appointmentDate = serializers.DateField(source="appointment_date")
    appointmentTime = serializers.CharField(source="appointment_time")
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    def get_patientName(self, obj):
        return obj.patient.name if obj.patient else ""

    def get_serviceName(self, obj):
        return obj.service.name if obj.service else ""

    def get_userName(self, obj):
        return obj.user.name if obj.user else ""

    class Meta:
        model = Appointment
        fields = [
            "id", "patientId", "patient", "serviceId", "service", "userId", "user",
            "patientName", "serviceName", "userName",
            "appointmentDate", "appointmentTime", "status", "notes", "createdAt"
        ]
        extra_kwargs = {"id": {"required": False}}


class AppointmentLinkSerializer(serializers.ModelSerializer):
    patientId = serializers.PrimaryKeyRelatedField(source="patient", queryset=Patient.objects.all(), required=False, allow_null=True)
    serviceId = serializers.PrimaryKeyRelatedField(source="service", queryset=Service.objects.all(), required=False, allow_null=True)
    createdBy = serializers.PrimaryKeyRelatedField(source="creator", queryset=User.objects.all(), required=False, allow_null=True)

    patient = PatientSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    creator = UserSerializer(read_only=True)

    expiresAt = serializers.DateTimeField(source="expires_at", required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = AppointmentLink
        fields = [
            "id", "token", "patientId", "patient", "serviceId", "service",
            "expiresAt", "used", "active", "config", "createdBy", "creator", "createdAt"
        ]
        extra_kwargs = {"id": {"required": False}, "token": {"required": False}}


class PaymentSerializer(serializers.ModelSerializer):
    appointmentId = serializers.PrimaryKeyRelatedField(source="appointment", queryset=Appointment.objects.all(), required=False, allow_null=True)
    paidAt = serializers.DateTimeField(source="paid_at", required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "appointmentId", "amount", "method", "status", "paidAt", "createdAt"]


class ExpenseSerializer(serializers.ModelSerializer):
    expenseDate = serializers.DateField(source="expense_date")
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Expense
        fields = ["id", "description", "amount", "expenseDate", "createdAt"]


class MedicalRecordSerializer(serializers.ModelSerializer):
    patientId = serializers.PrimaryKeyRelatedField(source="patient", queryset=Patient.objects.all())
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = MedicalRecord
        fields = ["id", "patientId", "type", "date", "notes", "data", "createdAt"]
        extra_kwargs = {"id": {"required": False}}
