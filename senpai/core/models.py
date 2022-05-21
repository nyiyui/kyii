from django.db import models
from django.contrib.sessions.models import Session

import uuid
import secrets
from django.contrib.auth.models import Permission
from django.contrib.auth.models import AbstractUser
from django.conf import settings

from rest_framework.authtoken.models import Token

from oauth2_provider.models import AbstractApplication


def gen_sub() -> str:
    return secrets.token_hex(nbytes=settings.KYII['PROFILE_SUB_GEN_LENGTH'])


class User(AbstractUser):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    sub = models.CharField(max_length=256, default=gen_sub)

    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    @property
    def public_aps(self):
        return [ap.public for ap in self.aps.all()]

    @property
    def login_allowed(self):
        return self.is_active


class Group(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    name = models.CharField(max_length=256)
    description = models.TextField()
    perms = models.ManyToManyField(Permission, related_name='groups')

    def __str__(self):
        return self.slug

class UserSession(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=256)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_sessions')
    against = models.ForeignKey('AP', on_delete=models.RESTRICT, related_name='user_sessions')
    session = models.OneToOneField(Session, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.name} for {self.user}'

class AP(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    name = models.CharField(max_length=256)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='aps')
    requires = models.ManyToManyField('AF', related_name='required_by')

    def __str__(self):
        return f'{self.slug} for {self.user} requires {self.requires}'

    @property
    def public(self):
        return {
            'uuid': str(self.uuid),
            'slug': self.slug,
            'name': self.name,
        }

    @property
    def public_requires(self):
        return [af.public for af in self.requires.all()]

class AF(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    name = models.CharField(max_length=256)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='af')
    class VerifierChoices(models.TextChoices):
        PW_ARGON2ID = 'pw_argon2id', 'Password (argon2id)'
        OTP_TOTP = 'otp_totp', 'TOTP'
        EXT_OIDC = 'ext_oidc', 'OIDC'
        EXT_EMAIL = 'ext_email', 'Email'
        ENV_IP = 'env_ip', 'IP'
    verifier = models.SlugField(max_length=100, choices=VerifierChoices.choices)
    params = models.JSONField(default=None)

    def __str__(self):
        return f'{self.slug} for {self.user} using {self.verifier}'

    @property
    def public(self):
        return {
            'uuid': str(self.uuid),
            'slug': self.slug,
            'name': self.name,
            'verifier': self.verifier,
        }
