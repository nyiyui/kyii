#!/bin/env python3
import requests

BASE_URL = 'http://localhost:8000/'


class Client:
    def __init__(self):
        self.csrf_token = None
        self.s = requests.Session()

    def __csrf_token(self):
        url = BASE_URL + 'csrf_token'
        r = self.s.get(url)
        r.raise_for_status()
        self.csrf_token = r.json()['csrf_token']

    def __ensure_csrf_token(self):
        if self.csrf_token is None:
            self.__csrf_token()
    
    def login_start(self, username):
        self.__ensure_csrf_token()
        url = BASE_URL + 'login/start'
        r = self.s.post(url, data={'username': username}, headers={'X-CSRFToken': self.csrf_token})
        r.raise_for_status()
        return r.json()
    
    def login_choose(self, ap_uuid):
        self.__ensure_csrf_token()
        url = BASE_URL + 'login/choose'
        data = {'ap_uuid': ap_uuid}
        r = self.s.post(url, data=data, headers={'X-CSRFToken': self.csrf_token})
        r.raise_for_status()
        return r.json()
    
    def login_attempt(self, af_uuid, challenge_response):
        self.__ensure_csrf_token()
        url = BASE_URL + 'login/attempt'
        data = {'af_uuid': af_uuid, 'challenge_response': challenge_response}
        r = self.s.post(url, data=data, headers={'X-CSRFToken': self.csrf_token})
        r.raise_for_status()
        return r.json()
    
    def login_stop(self):
        self.__ensure_csrf_token()
        url = BASE_URL + 'login/stop'
        r = self.s.post(url, headers={'X-CSRFToken': self.csrf_token})
        r.raise_for_status()
        return r.json()

    def status(self):
        self.__ensure_csrf_token()
        url = BASE_URL + 'status'
        r = self.s.get(url, headers={'X-CSRFToken': self.csrf_token})
        r.raise_for_status()
        return r.json()

c = Client()
USERNAME = 'nyiyui'
username = USERNAME or input("username: ")
try:
    aps = c.login_start(username)["aps"]
    print("aps:\n\t", '\n\t'.join(f'{i} {str(ap)}' for i, ap in enumerate(aps)))
    ap_i = int(input("ap index: "))
    ap = aps[ap_i]
    afs = c.login_choose(ap['uuid'])['afs']
    print("afs:\n\t", '\n\t'.join(f'{i} {str(af)}' for i, af in enumerate(afs)))
    while True:
        af_i = int(input("af index: "))
        af = afs[af_i]
        print("af:", af)
        resp = c.login_attempt(af['uuid'], input("challenge_response: "))
        if resp['done'] == True:
            print("done")
            break
    print('status:', c.status())
except Exception as e:
    c.login_stop()
    raise
