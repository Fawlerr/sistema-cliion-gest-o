import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O email é obrigatório.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", 1)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser precisa ter is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser precisa ter is_superuser=True.")
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None  # Usamos email como identificador único
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.IntegerField(default=2)  # 1=ADMIN, 2=DOCTOR, 3=RECEPTIONIST, 4=PATIENT
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.name} ({self.email})"


class Patient(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "patients"

    def __str__(self):
        return self.name


class Service(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    price = models.FloatField()
    duration_minutes = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "services"

    def __str__(self):
        return self.name


class Appointment(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="appointments")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="appointments")
    appointment_date = models.DateField()
    appointment_time = models.CharField(max_length=10)
    status = models.CharField(max_length=50, default="PENDING", null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "appointments"

    def __str__(self):
        return f"Agendamento {self.id} - {self.patient.name}"


class AppointmentLink(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    token = models.CharField(max_length=255, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True, related_name="appointment_links")
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True, related_name="appointment_links")
    expires_at = models.DateTimeField(null=True, blank=True)
    used = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    config = models.JSONField(null=True, blank=True)
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="appointment_links")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "appointment_links"

    def __str__(self):
        return f"Link {self.token}"


class Payment(models.Model):
    id = models.AutoField(primary_key=True)
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name="payments")
    amount = models.FloatField()
    method = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=50, null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "payments"

    def __str__(self):
        return f"Pagamento #{self.id} - R$ {self.amount}"


class Expense(models.Model):
    id = models.AutoField(primary_key=True)
    description = models.CharField(max_length=255)
    amount = models.FloatField()
    expense_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "expenses"

    def __str__(self):
        return f"Despesa #{self.id} - {self.description}"


class MedicalRecord(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="medical_records")
    type = models.CharField(max_length=100)
    date = models.DateTimeField()
    notes = models.TextField(null=True, blank=True)
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "medical_records"

    def __str__(self):
        return f"Prontuário {self.id} - {self.patient.name}"
