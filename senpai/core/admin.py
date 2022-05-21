from django.contrib import admin
from core.models import *

admin.site.register(User, admin.ModelAdmin)
admin.site.register(UserSession, admin.ModelAdmin)
admin.site.register(AP, admin.ModelAdmin)
admin.site.register(AF, admin.ModelAdmin)
