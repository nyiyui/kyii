from django.conf import settings
from django.urls import include, path

from . import views

urlpatterns = [
    path('csrf_token', views.csrf_token),
    path("login/testing", views.login_testing, name="login_testing"),
    path("login/redirect", views.login_redirect, name="login_redirect"),
    path("login/stop", views.LoginStopView.as_view(), name="login_stop"),
    path("login/start", views.LoginStartView.as_view(), name="login_start"),
    path("login/choose", views.LoginChooseView.as_view(), name="login_choose"),
    path("login/attempt", views.LoginAttemptView.as_view(), name="login_attempt"),
    path("status", views.StatusView.as_view(), name="status"),
    path("logout", views.LogoutView.as_view(), name="logout"),
]
