from core.models import *
import core.verifiers as verifiers

if not User.objects.filter(username='nyiyui').exists():
    print('creating user')
    p = Profile()
    p.save()
    User(username='nyiyui', profile=p).save()
nyiyui = User.objects.get(username='nyiyui')
nyiyui.is_superuser = True
nyiyui.is_active = True
nyiyui.is_staff = True
nyiyui.set_unusable_password()
nyiyui.save()
print(f'user {nyiyui}')
if not AF.objects.filter(user=nyiyui, slug='password').exists():
    print('creating password')
    pw = AF(name='', slug='password', user=nyiyui, verifier='pw_argon2id', params=verifiers.pw_argon2id.gen({'password': 'abc'}))
    pw.save()
else:
    print('password exists')
pw = AF.objects.get(user=nyiyui, slug='password')
if not AF.objects.filter(user=nyiyui, slug='totp').exists():
    print('creating totp')
    otp = AF(name='', slug='totp', user=nyiyui, verifier='otp_totp', params=verifiers.otp_totp.gen({}))
    otp.save()
else:
    print('totp exists')
otp = AF.objects.get(user=nyiyui, slug='totp')
if not AP.objects.filter(user=nyiyui, slug='primary').exists():
    print('creating primary')
    primary = AP(name='Primary', slug='primary', user=nyiyui)
    primary.save()
    primary.requires.add(pw)
    #primary.requires.add(otp)
    primary.save()
else:
    print('primary exists')
    primary = AP.objects.get(user=nyiyui, slug='primary')
    primary.requires.remove(otp)
