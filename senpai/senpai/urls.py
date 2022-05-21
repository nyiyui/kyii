from django.contrib import admin
from django.urls import include, path
from oauth2_provider import views as oauth2_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    path(
        ".well-known/openid-configuration/",
        oauth2_views.ConnectDiscoveryInfoView.as_view(),
        name="oidc-connect-discovery-info",
    ),
    path("", include("core.urls")),
]
