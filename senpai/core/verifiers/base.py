from django.http import HttpRequest

class Attempt:
    challenge_response: dict
    request: HttpRequest

    def __init__(self, challenge_response: dict, request: HttpRequest):
        self.challenge_response = challenge_response
        self.request = request
