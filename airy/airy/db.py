import secrets
from typing import Optional
from uuid import UUID
from typing import List
from marshmallow import Schema, fields, validate
from flask_login import current_user
import uuid
from datetime import datetime
from typing import List

from authlib.integrations.sqla_oauth2 import (
    OAuth2AuthorizationCodeMixin,
    OAuth2ClientMixin,
    OAuth2TokenMixin,
)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_utils import EmailType  # TODO: use UUIDType
from sqlalchemy import column
from sqlalchemy_utils import ChoiceType, JSONType, UUIDType

from . import verifiers
from .verifiers import Pw

db = SQLAlchemy()


def gen_uuid():
    return str(uuid.uuid4())


class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.String(32), primary_key=True, nullable=False, default=gen_uuid)
    slug = db.Column(db.String(128), unique=True)  # null if unset
    name = db.Column(db.Unicode(256))
    email = db.Column(EmailType, unique=True, nullable=True)
    email_verified = db.Column(db.Boolean, unique=False, nullable=False, default=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    groups = db.relationship(
        "Group",
        secondary="user_groups",
        lazy="subquery",
        backref=db.backref("users", lazy=True),
    )

    def __str__(self):
        return f"<User {self.id} {self.slug}>"

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

    def has_perms(self, perms: List[str]):
        # TODO: optimize…a lot
        gids = [a[1] for a in db.session.query(user_groups).filter_by(user_id=self.id)]
        return [
            gp.perm_name
            for gp in GroupPerms.query.filter(GroupPerms.group_id.in_(gids))
        ]


user_groups = db.Table(
    "user_groups",
    db.Column("user_id", db.String(32), db.ForeignKey("user.id"), primary_key=True),
    db.Column("group_id", db.String(32), db.ForeignKey("group.id"), primary_key=True),
)


class Group(db.Model):
    __tablename__ = "group"
    id = db.Column(db.String(32), primary_key=True, nullable=False, default=gen_uuid)
    slug = db.Column(db.String(128), unique=True, nullable=False)
    name = db.Column(db.Unicode(256))
    email = db.Column(EmailType, unique=True, nullable=True)
    email_verified = db.Column(db.Boolean, unique=True, nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    def __str__(self):
        return f"<Group {self.slug} {self.id}>"


class GroupPerms(db.Model):
    __tablename__ = "group_perms"
    group_id = db.Column(db.String(32), db.ForeignKey("group.id"), primary_key=True)
    perm_name = db.Column(db.String(128), primary_key=True)


class UserLogin(db.Model):
    __tablename__ = "user_login"
    id = db.Column(db.String(32), primary_key=True, default=gen_uuid)
    name = db.Column(db.Unicode(256))
    user_id = db.Column(db.String(32), db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User")
    extra = db.Column(JSONType)
    against_id = db.Column(db.String(32), db.ForeignKey("ap.id"), nullable=True)
    against = db.relationship("AP")
    start = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    last = db.Column(db.DateTime, nullable=True)
    end = db.Column(db.DateTime, nullable=True)
    reason_end = db.Column(db.String(32), nullable=True)
    token_hash = db.Column(
        db.String(512),
    )

    def gen_token(self) -> str:
        token = secrets.token_hex(32)  # 128 bits
        self.token_hash = Pw.gen(dict(password=token))[0]["hash"]
        return token

    def revoke(self, reason: str) -> None:
        self.end = datetime.utcnow()
        self.end_reason = reason

    @property
    def for_api_v1_trusted(self):
        return dict(
            uuid=self.id,
            name=self.name,
            extra=self.extra,
            against=dict(
                name=self.against.name,
                uuid=self.against_id,
            ) if self.against is not None else None,
            start=self.start,
            last=self.last,
            end=self.end,
        )


ap_reqs = db.Table(
    "ap_reqs",
    db.Column("ap_id", db.String(32), db.ForeignKey("ap.id"), primary_key=True),
    db.Column("af_id", db.String(32), db.ForeignKey("af.id"), primary_key=True),
)


class AP(db.Model):
    __tablename__ = "ap"
    id = db.Column(db.String(32), primary_key=True, default=gen_uuid)
    name = db.Column(db.Unicode(256))
    user_id = db.Column(db.String(32), db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User")
    reqs = db.relationship(
        "AF",
        secondary=ap_reqs,
        lazy="subquery",
        backref=db.backref("req_by", lazy=True),
    )

    @property
    def for_api_v1_trusted(self):
        return dict(
            uuid=self.id,
            name=self.name,
            reqs=list(af.id for af in self.reqs),
        )

    @property
    def for_api_v1(self):
        return dict(
            uuid=self.id,
            name=self.name,
        )


class AF(db.Model):
    __tablename__ = "af"
    id = db.Column(db.String(32), primary_key=True, default=gen_uuid)
    name = db.Column(db.Unicode(256))
    user_id = db.Column(db.String(32), db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User")
    verifier = db.Column(db.String(64), nullable=False)
    params = db.Column(
        JSONType
    )  # should be relatively long-lived (e.g. password hashes)
    state = db.Column(
        JSONType
    )  # should be shorter-lived (e.g. preventing "replay attacks")

    def __init__(self, name, user, verifier, gen_params):
        self.name = name
        self.user = user
        self.verifier = verifier
        self.regen_params(gen_params)

    def regen_params(self, gen_params: dict) -> Optional[dict]:
        self.params, feedback = verifiers.VERIFIERS[self.verifier].gen(gen_params)
        return feedback

    def verify(self, attempt: str):
        verifier = verifiers.VERIFIERS[self.verifier]
        new_params, new_state = verifier.verify(attempt, self.params, self.state)
        if new_params is None:
            raise TypeError("new_params is None")
        self.params = new_params
        self.state = new_state
        db.session.commit()

    @property
    def for_api_v1_trusted(self):
        return dict(
            uuid=self.id,
            name=self.name,
            verifier=self.verifier,
        )

    @property
    def for_api_v1(self):
        return dict(
            uuid=self.id,
            name=self.name,
            verifier=self.verifier,
        )


class APSchema(Schema):
    uuid = fields.UUID()  # TODO: validate
    name = fields.Str(required=True, validate=validate.Length(max=256))
    reqs = fields.List(fields.Int, required=True)

    def dbify(self, afids: List[UUID], user=current_user) -> UUID:
        if self.uuid != "":
            ap = AP.query.filter_by(id=uuid, user=user).one()
        else:
            ap = AP(user=user)
        ap.name = self.name
        self.reqs = map(afids.__getitem__, reqs)
        db.session.add(ap)


class AFSchema(Schema):
    uuid = fields.UUID()  # TODO: validate
    name = fields.Str(required=True, validate=validate.Length(max=256))
    verifier = fields.Str(required=True, validate=validate.Length(max=64))
    params = fields.Str(required=True)

    def dbify(self, user=current_user) -> UUID:
        if self.uuid != "":
            af = AF.query.filter_by(id=uuid, user=user).one()
        else:
            af = AF(user=user)
        af.name = self.name
        af.verifier = self.verifier
        af.params = self.params
        db.session.add(af)
        return af.id


class OAuth2Client(db.Model, OAuth2ClientMixin):
    __tablename__ = "oauth2_client"

    id = db.Column(db.String(32), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(32), db.ForeignKey("user.id", ondelete="CASCADE"))
    user = db.relationship("User")

    def as_dict(self):
        return {
            "user_id": self.user_id,
            "name": self.client_name,
            "uri": self.client_uri,
        }


class OAuth2AuthorizationCode(db.Model, OAuth2AuthorizationCodeMixin):
    __tablename__ = "oauth2_code"

    id = db.Column(db.String(32), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(32), db.ForeignKey("user.id", ondelete="CASCADE"))
    user = db.relationship("User")


class OAuth2Token(db.Model, OAuth2TokenMixin):
    __tablename__ = "oauth2_token"

    id = db.Column(db.String(32), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(32), db.ForeignKey("user.id", ondelete="CASCADE"))
    user = db.relationship("User")


def init_app(app):
    db.init_app(app)
