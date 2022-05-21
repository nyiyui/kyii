"""
This module provides sessions for Airy.

Keys
====

- :code:`AIRY_IORI_USERS`: list of users iori can switch to.
- :code:`API_V1_UID`: user.id of logging in user.
- :code:`API_V1_APID`: ap.id of logging in user.
- :code:`API_V1_SOLVED`: list of solved AF.ids.
"""
from flask_session import Session

session = Session()

AIRY_IORI_USERS = "airy_iori_users"
API_V1_UID = "api_v1_uid"
API_V1_APID = "api_v1_apid"
API_V1_SOLVED = "api_v1_solved"
