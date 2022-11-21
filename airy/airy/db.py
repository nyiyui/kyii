import secrets
import time
from datetime import datetime, timedelta
from hashlib import sha256
from typing import Optional, Set, Tuple

from authlib.integrations.sqla_oauth2 import (
    OAuth2AuthorizationCodeMixin,
    OAuth2ClientMixin,
    OAuth2TokenMixin,
)
from blake3 import blake3
from flask import session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_utils import EmailType  # TODO: use UUIDType
from sqlalchemy_utils import JSONType
import sqlalchemy
from sqlalchemy.ext.hybrid import hybrid_property

db = SQLAlchemy()


def gen_id():
    return secrets.token_urlsafe(24)


class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.String(32), primary_key=True, nullable=False, default=gen_id)
    slug = db.Column(db.String(128), unique=True)  # null if unset
    name = db.Column(db.Unicode(256))
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    email_id = db.Column(db.String(32), db.ForeignKey("email.id"))
    email = db.relationship("Email", backref=db.backref("user", lazy=True))
    groups = db.relationship(
        "Group",
        secondary="user_groups",
        lazy="subquery",
        backref=db.backref("users", lazy=True),
    )

    def __str__(self):
        return self.slug

    @property
    def all_groups(self):
        return self.groups

    # for flask-login

    @property
    def is_authenticated(self):
        return self.is_active

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return self.id

    # for Authlib
    def get_user_id(self):
        return self.id

    @property
    def perms(self) -> Set[str]:
        return set(perm for g in self.groups for perm in g.perms)

    def add_le(self, log_entry: "LogEntry") -> None:
        log_entry.user = self
        log_entry.sid2 = LogEntry.get_sid2()
        db.session.add(log_entry)
        db.session.commit()


class UserGroups(db.Model):
    __tablename__ = "user_groups"
    user_id = db.Column(db.String(32), db.ForeignKey("user.id"), primary_key=True)
    group_id = db.Column(db.String(32), db.ForeignKey("group.id"), primary_key=True)


class Group(db.Model):
    __tablename__ = "group"
    id = db.Column(db.String(32), primary_key=True, nullable=False, default=gen_id)
    slug = db.Column(db.String(128), unique=True, nullable=False)
    name = db.Column(db.Unicode(256))
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    @hybrid_property
    def perms(self):
        return [gp.perm_name for gp in self.perms_]

    @perms.setter
    def perms(self, perms):
        perms = list(filter(lambda a: a is not "", perms))
        for perm in perms:
            gp = GroupPerms.query.filter_by(group=self, perm_name=perm).first()
            if gp is None:
                gp = GroupPerms()
            gp.group = self
            gp.perm_name = perm
        for gp in GroupPerms.query.filter_by(group=self):
            if gp.perm_name not in perms:
                GroupPerms.query.filter_by(group=self, perm_name=gp.perm_name).delete()

    def __str__(self):
        return self.slug


class GroupPerms(db.Model):
    __tablename__ = "group_perms"
    group_id = db.Column(db.String(32), db.ForeignKey("group.id"), primary_key=True)
    group = db.relationship("Group", backref="perms_", foreign_keys=[group_id])
    perm_name = db.Column(db.String(128), primary_key=True)


class Email(db.Model):
    __tablename__ = "email"
    id = db.Column(db.String(32), primary_key=True, nullable=False, default=gen_id)
    email = db.Column(EmailType, unique=True, nullable=False)
    is_verified = db.Column(db.Boolean, nullable=False, default=False)
    verify_token = db.Column(db.String(256), unique=True, nullable=True, default=None)
    group_id = db.Column(
        db.Integer, db.ForeignKey("group.id"), nullable=True, default=None
    )
    group = db.relationship(
        "Group", backref="emails", uselist=False, foreign_keys=[group_id]
    )

    def unverify(self):
        self.is_verified = False
        self.verify_token = None


class UserLogin(db.Model):
    __tablename__ = "user_login"
    id = db.Column(db.String(32), primary_key=True, default=gen_id)
    name = db.Column(db.Unicode(256))
    user_id = db.Column(db.String(32), db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User", backref="logins", foreign_keys=[user_id])
    sid2 = db.Column(db.String(64))
    extra = db.Column(JSONType)
    against_id = db.Column(db.String(32), db.ForeignKey("ap.id"), nullable=True)
    against = db.relationship("AP", backref="logins", foreign_keys=[against_id])
    start = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    last = db.Column(db.DateTime, nullable=True)
    end = db.Column(db.DateTime, nullable=True)
    reason_end = db.Column(db.String(32), nullable=True)
    token_hash = db.Column(db.String(512))

    def __str__(self):
        return f"<UserLogin {self.id} for {self.user_id} against {self.against_id}>"

    @classmethod
    def get_sid2(cls) -> str:
        return sha256(str(session.sid).encode("ascii")).hexdigest()

    @classmethod
    def get_usable(cls) -> "UserLogin":
        return cls.query.filter_by(end=None, reason_end=None)

    @property
    def is_active(self):
        return self.end is None

    @property
    def is_anonymous(self):
        return False

    @property
    def is_authenticated(self):
        return True

    def gen_token(self) -> str:
        token = secrets.token_hex(32)  # 128 bits
        self.token_hash = blake3(token.encode("utf-8")).hexdigest()
        return token

    def verify_token(self, attempt_token: str) -> bool:
        attempt_hash = blake3(attempt_token.encode("utf-8")).hexdigest()
        return attempt_hash == self.token_hash

    def revoke(self, reason: str) -> None:
        self.token_hash = None
        self.end = datetime.utcnow()
        self.reason_end = reason

    def see(self):
        now = datetime.utcnow()
        if self.last is not None and now - self.last < timedelta(seconds=60):
            self.last = now
            return True
        return False

    @property
    def revoked(self):
        return self.end is not None

    @classmethod
    def q(cls, user: User):
        return cls.query.filter_by(user=user).order_by(cls.start)


ap_reqs = db.Table(
    "ap_reqs",
    db.Column("ap_id", db.String(32), db.ForeignKey("ap.id"), primary_key=True),
    db.Column("af_id", db.String(32), db.ForeignKey("af.id"), primary_key=True),
    db.Column("level", db.Integer, default=1),
    # Lower-level req must be solved before higher-level can be.
    # TODO: what does level 1 do?
)


class AP(db.Model):
    __tablename__ = "ap"
    id = db.Column(db.String(32), primary_key=True, default=gen_id)
    name = db.Column(db.Unicode(256))
    user_id = db.Column(db.String(32), db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User", backref="ap", foreign_keys=[user_id])
    reqs = db.relationship(
        "AF",
        secondary=ap_reqs,
        lazy="subquery",
        backref=db.backref("req_by", lazy=True),
        # foreign_keys=[ap_reqs.c.ap_id],
    )

    def afs(self, user_id):
        return (
            AF.query.filter_by(user_id=user_id, gen_done=True)
            .join(ap_reqs)
            .filter_by(ap_id=self.id)
        )


class AF(db.Model):
    __tablename__ = "af"
    id = db.Column(db.String(32), primary_key=True, default=gen_id)
    name = db.Column(db.Unicode(256))
    user_id = db.Column(db.String(32), db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User", backref="af", foreign_keys=[user_id])
    verifier = db.Column(db.String(64), nullable=False)
    params = db.Column(
        JSONType
    )  # should be relatively long-lived (e.g. password hashes)
    state = db.Column(
        JSONType
    )  # should be shorter-lived (e.g. preventing "replay attacks")
    gen_done = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
    )  # is generation done?

    def __init__(self, *args, gen_params=None, **kwargs):
        super().__init__(*args, **kwargs)
        if gen_params is not None:
            self.regen(gen_params)

    def regen(self, gen_params: dict) -> Optional[dict]:
        from . import verifiers

        self.params, self.state, feedback, self.gen_done = verifiers.gen(
            self.verifier, gen_params, self.state
        )
        return feedback

    def verify(self, attempt: str, **kwargs) -> Tuple[Optional[dict], bool]:
        from . import verifiers

        self.params, self.state, feedback, done = verifiers.verify(
            self.verifier, attempt, self.params, self.state, **kwargs
        )
        return feedback, done

    @property
    def public_params(self):
        from . import verifiers

        return verifiers.public_params(self.verifier, self.params)


class OAuth2Client(db.Model, OAuth2ClientMixin):
    __tablename__ = "oauth2_client"
    id = db.Column(db.String(32), primary_key=True, default=gen_id)
    user_id = db.Column(db.String(32), db.ForeignKey("user.id", ondelete="CASCADE"))
    user = db.relationship("User")

    def set_client_metadata(self, client_metadata):
        super().set_client_metadata(client_metadata)
        if "client_metadata" in self.__dict__:
            del self.__dict__["client_metadata"]

    def as_dict(self):
        return dict(
            client_id=self.client_id,
            user_id=self.user_id,
            user_name=self.user.name,
            name=self.client_name,
            uri=self.client_uri,
            logo_uri=self.logo_uri,
            tos_uri=self.tos_uri,
            policy_uri=self.policy_uri,
            contacts=self.contacts,
        )


def gen_pair(key, default):
    def setter(self, value):
        meta = self.client_metadata
        meta[key] = value
        self.set_client_metadata(meta)

    def getter(self):
        return self.client_metadata.get(key, default)

    return getter, setter


for key, default in (
    ("redirect_uris", []),
    ("token_endpoint_auth_method", None),
    ("grant_types", []),
    ("response_types", []),
    ("client_name", None),
    ("client_uri", None),
    ("logo_uri", None),
    ("scope", None),
    ("contacts", []),
    ("tos_uri", None),
    ("policy_uri", None),
    ("jwks_uri", None),
    ("jwks", []),
    ("software_id", None),
):
    setattr(OAuth2Client, key, property(*gen_pair(key, default)))


class OAuth2AuthorizationCode(db.Model, OAuth2AuthorizationCodeMixin):
    __tablename__ = "oauth2_code"
    id = db.Column(db.String(32), primary_key=True, default=gen_id)
    user_id = db.Column(db.String(32), db.ForeignKey("user.id", ondelete="CASCADE"))
    user = db.relationship("User")


class OAuth2Token(db.Model, OAuth2TokenMixin):
    __tablename__ = "oauth2_token"
    id = db.Column(db.String(32), primary_key=True, default=gen_id)
    user_id = db.Column(db.String(32), db.ForeignKey("user.id", ondelete="CASCADE"))
    user = db.relationship("User")
    client_id = db.Column(db.String(48), db.ForeignKey("oauth2_client.id"))
    client = db.relationship("OAuth2Client")

    def revoke(self):
        # TODO: properly implement
        self.expires_in = 0
        self.access_token_revoked_at = time.time()
        self.refresh_token_revoked_at = time.time()

    @classmethod
    def q(cls, user: User, direction: str = "n"):
        return cls.query.filter_by(user=user).order_by(
            cls.created if direction == "p" else cls.created.desc()
        )


class LogEntry(db.Model):
    __tablename__ = "log_entry"
    id = db.Column(db.String(32), primary_key=True, default=gen_id)
    created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    renderer = db.Column(db.String(32))
    sid2 = db.Column(db.String(64))
    data = db.Column(JSONType)

    user_id = db.Column(db.String(32), db.ForeignKey("user.id"))
    user = db.relationship("User", foreign_keys=[user_id])

    def generic_serialize(self):
        return dict(
            id=self.id,
            created=self.created.isoformat(),
            renderer=self.renderer,
            sid2=self.sid2,
            data=self.data,
        )

    @classmethod
    def get_sid2(cls) -> str:
        return sha256(str(session.sid).encode("ascii")).hexdigest()

    @classmethod
    def q(cls, user: User, direction: str = "n"):
        if user.is_anonymous:
            return cls.query.filter(sqlalchemy.sql.false())
        return cls.query.filter_by(user=user).order_by(
            cls.created if direction == "p" else cls.created.desc()
        )


def init_app(app):
    db.init_app(app)
