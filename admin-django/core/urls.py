from django.urls import path
from .views import (
    HealthCheckView,
    LoginView, RegisterView, MeView,
    DashboardView,
    UserListView, UserDetailView,
    PatientListView, PatientDetailView, PatientMedicalRecordListView,
    ServiceListView, ServiceDetailView,
    AppointmentAvailabilityView, AppointmentPublicView,
    AppointmentListView, AppointmentDetailView, AppointmentCancelView,
    PaymentListView, PaymentDetailView,
    ExpenseListView, ExpenseDetailView,
    BillingView,
    AppointmentLinkPublicDetailView, AppointmentLinkPublicAvailabilityView,
    AppointmentLinkPublicBookView, AppointmentLinkAdminView, AppointmentLinkDeactivateView
)

urlpatterns = [
    # Health Check
    path("health", HealthCheckView.as_view(), name="health"),

    # Auth
    path("auth/login", LoginView.as_view(), name="auth-login"),
    path("auth/register", RegisterView.as_view(), name="auth-register"),
    path("auth/me", MeView.as_view(), name="auth-me"),

    # Dashboard
    path("dashboard", DashboardView.as_view(), name="dashboard"),

    # Users
    path("users", UserListView.as_view(), name="user-list"),
    path("users/<int:pk>", UserDetailView.as_view(), name="user-detail"),

    # Patients
    path("patients", PatientListView.as_view(), name="patient-list"),
    path("patients/<str:pk>", PatientDetailView.as_view(), name="patient-detail"),
    path("patients/<str:pk>/medical-records", PatientMedicalRecordListView.as_view(), name="patient-medical-records"),

    # Services
    path("services", ServiceListView.as_view(), name="service-list"),
    path("services/<int:pk>", ServiceDetailView.as_view(), name="service-detail"),

    # Appointments
    path("appointments/availability", AppointmentAvailabilityView.as_view(), name="appointment-availability"),
    path("appointments/public", AppointmentPublicView.as_view(), name="appointment-public"),
    path("appointments", AppointmentListView.as_view(), name="appointment-list"),
    path("appointments/<str:pk>", AppointmentDetailView.as_view(), name="appointment-detail"),
    path("appointments/<str:pk>/cancel", AppointmentCancelView.as_view(), name="appointment-cancel"),

    # Financial: Payments, Expenses, Billing
    path("payments", PaymentListView.as_view(), name="payment-list"),
    path("payments/<int:pk>", PaymentDetailView.as_view(), name="payment-detail"),
    path("expenses", ExpenseListView.as_view(), name="expense-list"),
    path("expenses/<int:pk>", ExpenseDetailView.as_view(), name="expense-detail"),
    path("billing", BillingView.as_view(), name="billing"),

    # Appointment Links
    path("appointment-links/public/appointment-links/<str:token>", AppointmentLinkPublicDetailView.as_view(), name="appointment-link-public-detail"),
    path("appointment-links/public/appointment-links/<str:token>/availability", AppointmentLinkPublicAvailabilityView.as_view(), name="appointment-link-public-availability"),
    path("appointment-links/public/appointment-links/<str:token>/book", AppointmentLinkPublicBookView.as_view(), name="appointment-link-public-book"),
    path("appointment-links", AppointmentLinkAdminView.as_view(), name="appointment-link-admin-list"),
    path("appointment-links/<str:pk>/deactivate", AppointmentLinkDeactivateView.as_view(), name="appointment-link-deactivate"),
]
