"""
This module provides sessions for Airy.

Keys
====

- :code:`API_V1_UID`: user.id of logging in user.
- :code:`API_V1_APID`: ap.id of logging in user.
- :code:`API_V1_SOLVED`: list of solved AF.ids.
"""
from flask_session import Session

session = Session()

API_V1_UID = "api_v1_uid"
API_V1_APID = "api_v1_apid"
API_V1_SOLVED = "api_v1_solved"
SILICA_ULIDS = "silica_ulids"
SILICA_CURRENT_ULID = "silica_current_ulid"
SILICA_UL_MAP = "silica_ul_map"
