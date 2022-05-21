from django.shortcuts import render
from django.contrib.auth import REDIRECT_FIELD_NAME
import urllib.parse

from django.views import View
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
import json
from .models import User, UserSession
from . import verifiers
from uuid import UUID
from django.contrib.auth import login
from django.contrib.sessions.models import Session
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication, TokenAuthentication

from django.shortcuts import redirect

from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@ensure_csrf_cookie
def csrf_token(request):
    if request.method != 'GET':
        return HttpResponse(status=405)
    return JsonResponse({
        'csrf_token': get_token(request),
    })


def login_testing(request):
    user = User.objects.get(username='nyiyui')
    login(request, user)
    return redirect(request.GET.get('next'))

class AccessMixin:
    """
    Abstract CBV mixin that gives access mixins the same customizable
    functionality.
    """
    login_url = None
    permission_denied_message = ''
    raise_exception = False
    redirect_field_name = REDIRECT_FIELD_NAME

    def get_login_url(self):
        """
        Override this method to override the login_url attribute.
        """
        login_url = self.login_url or settings.LOGIN_URL
        if not login_url:
            raise ImproperlyConfigured(
                '{0} is missing the login_url attribute. Define {0}.login_url, settings.LOGIN_URL, or override '
                '{0}.get_login_url().'.format(self.__class__.__name__)
            )
        return str(login_url)

    def get_permission_denied_message(self):
        """
        Override this method to override the permission_denied_message attribute.
        """
        return self.permission_denied_message

    def handle_no_permission(self):
        if self.raise_exception:
            raise PermissionDenied(self.get_permission_denied_message())
        return HttpResponse(self.get_permission_denied_message(), status=403)


def login_redirect(request):
    params = "?" + urllib.parse.urlencode({**({'next': request.GET['next']} if 'next' in request.GET.keys() else {})})
    return HttpResponseRedirect(settings.KYII_CLIENT_URL + "/login" + params)



class LoginRequiredMixin(AccessMixin):
    """Verify that the current user is authenticated."""
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)


class LoginStartView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        print("login_start", )
        print("attempt", list(request.session.items()))
        data = request.POST
        user = None
        if (username := data.get('username')) is not None:
            user = User.objects.filter(username=username).first()
        elif (uuid := data.get('uuid')) is not None:
            user = User.objects.filter(uuid=uuid).first()
        else:
            return HttpResponse('', status=400)
        if user is None:
            return HttpResponse('', status=404)
        if not user.login_allowed:
            return HttpResponse('login is not allowed', status=403)
        request.session['user_id'] = str(user.uuid)
        return JsonResponse({
            'aps': user.public_aps,
        })

class LoginChooseView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.POST
        if 'user_id' not in request.session:
            return HttpResponse('session doesn\'t have user_id', status=401)
        user = User.objects.get(uuid=request.session['user_id'])
        if user is None:
            return HttpResponse('user doesn\'t exist', status=404)
        if not user.login_allowed:
            return HttpResponse('login is not allowed', status=403)
        ap_uuid = data.get('ap_uuid')
        if ap_uuid is None:
            return HttpResponse('ap_uuid is not given', status=400)
        ap_uuid = UUID(ap_uuid)
        ap = user.aps.filter(uuid=ap_uuid).first()
        if ap is None:
            return HttpResponse('ap doesn\'t exist', status=404)
        request.session['ap_uuid'] = str(ap.uuid)
        request.session['solved_afs'] = []
        return JsonResponse({
            'afs': ap.public_requires,
        })



class LoginAttemptView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.POST
        if 'user_id' not in request.session:
            return HttpResponse('session doesn\'t have user_id', status=401)
        if 'ap_uuid' not in request.session:
            return HttpResponse('session doesn\'t have ap_uuid', status=401)
        if 'solved_afs' not in request.session:
            return HttpResponse('session doesn\'t have solved_afs', status=401)
        user = User.objects.get(uuid=request.session['user_id'])
        if user is None:
            return HttpResponse('user doesn\'t exist', status=404)
        ap = user.aps.filter(uuid=UUID(request.session['ap_uuid'])).first()
        if ap is None:
            return HttpResponse('ap doesn\'t exist', status=404)
        solved_afs = set(request.session['solved_afs'])
        af_uuid = str(UUID(data.get('af_uuid')))
        if af_uuid in solved_afs:
            return HttpResponse('already solved', status=400)
        af = ap.requires.filter(uuid=af_uuid).first()
        if af is None:
            return HttpResponse('af doesn\'t exist', status=404)
        challenge_response = data.get('challenge_response')
        if challenge_response is None:
            return HttpResponse('challenge_response is not given', status=400)
        full_attempt = verifiers.FullAttempt(
            challenge_response=challenge_response,
            request=request,
            verifier=af.verifier,
            params=af.params,
        )
        ok, msg, new_params = full_attempt.verify()
        if not ok:
            return JsonResponse({'msg': msg}, status=403)
        solved_afs.add(af_uuid)
        request.session['solved_afs'] = list(solved_afs)
        af.params = new_params
        af.save()
        done = len(solved_afs) == len(ap.requires.all())
        if not done:
            return JsonResponse({
                'done': False,
            })
        login(request, user)
        request.session.set_expiry(2*7*24*60*60)
        s = Session.objects.get(session_key=request.session.session_key)
        replacee = UserSession.objects.filter(session=s)
        if replacee.exists():
            replacee.delete()
        user_session = UserSession(user=user, against=ap, session=Session.objects.get(session_key=request.session.session_key))
        user_session.save()
        print("attempt", list(request.session.items()))
        del request.session['user_id']
        del request.session['ap_uuid']
        del request.session['solved_afs']
        return JsonResponse({
            'done': True,
        })

class LoginStopView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if 'user_id' in request.session:
            del request.session['user_id']
        if 'ap_uuid' in request.session:
            del request.session['ap_uuid']
        if 'solved_afs' in request.session:
            del request.session['solved_afs']
        return JsonResponse({}, status=200)

class StatusView(View):
    def get(self, request):
        print("status", list(request.session.items()))
        try:
            user_session = UserSession.objects.get(session=Session.objects.get(session_key=request.session.session_key), user=request.user)
        except Session.DoesNotExist:
            return JsonResponse({}, status=403)
        except UserSession.DoesNotExist:
            return JsonResponse({}, status=403)
        return JsonResponse({
            'user': {
                'username': request.user.username,
                'uuid': str(request.user.uuid),
            },
            'user_session': {
                'uuid': str(user_session.uuid),
                'name': user_session.name,
                'against': user_session.against.public,
            },
        })

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_session = UserSession.objects.get(session=Session.objects.get(session_key=request.session.session_key), user=request.user)
        user_session.delete()
        logout(request)
        return JsonResponse({}, status=200)
