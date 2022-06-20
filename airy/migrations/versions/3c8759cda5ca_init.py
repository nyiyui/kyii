"""init

Revision ID: 3c8759cda5ca
Revises: 
Create Date: 2022-06-02 16:12:00.246971

"""
from alembic import op
import sqlalchemy_utils
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "3c8759cda5ca"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "group",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("name", sa.Unicode(length=256), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_table(
        "email",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column(
            "email", sqlalchemy_utils.types.email.EmailType(length=255), nullable=False
        ),
        sa.Column("is_verified", sa.Boolean(), nullable=False),
        sa.Column("verify_token", sa.String(length=256), nullable=True),
        sa.Column("group_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["group_id"],
            ["group.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("verify_token"),
    )
    op.create_table(
        "group_perms",
        sa.Column("group_id", sa.String(length=32), nullable=False),
        sa.Column("perm_name", sa.String(length=128), nullable=False),
        sa.ForeignKeyConstraint(
            ["group_id"],
            ["group.id"],
        ),
        sa.PrimaryKeyConstraint("group_id", "perm_name"),
    )
    op.create_table(
        "user",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=True),
        sa.Column("name", sa.Unicode(length=256), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("primary_group_id", sa.String(length=32), nullable=True),
        sa.ForeignKeyConstraint(
            ["primary_group_id"],
            ["group.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_table(
        "af",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("name", sa.Unicode(length=256), nullable=True),
        sa.Column("user_id", sa.String(length=32), nullable=False),
        sa.Column("verifier", sa.String(length=64), nullable=False),
        sa.Column("params", sqlalchemy_utils.types.json.JSONType(), nullable=True),
        sa.Column("state", sqlalchemy_utils.types.json.JSONType(), nullable=True),
        sa.Column("gen_done", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "ap",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("name", sa.Unicode(length=256), nullable=True),
        sa.Column("user_id", sa.String(length=32), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "oauth2_client",
        sa.Column("client_id", sa.String(length=48), nullable=True),
        sa.Column("client_secret", sa.String(length=120), nullable=True),
        sa.Column("client_id_issued_at", sa.Integer(), nullable=False),
        sa.Column("client_secret_expires_at", sa.Integer(), nullable=False),
        sa.Column("client_metadata", sa.Text(), nullable=True),
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("user_id", sa.String(length=32), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_oauth2_client_client_id"), "oauth2_client", ["client_id"], unique=False
    )
    op.create_table(
        "oauth2_code",
        sa.Column("code", sa.String(length=120), nullable=False),
        sa.Column("client_id", sa.String(length=48), nullable=True),
        sa.Column("redirect_uri", sa.Text(), nullable=True),
        sa.Column("response_type", sa.Text(), nullable=True),
        sa.Column("scope", sa.Text(), nullable=True),
        sa.Column("nonce", sa.Text(), nullable=True),
        sa.Column("auth_time", sa.Integer(), nullable=False),
        sa.Column("code_challenge", sa.Text(), nullable=True),
        sa.Column("code_challenge_method", sa.String(length=48), nullable=True),
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("user_id", sa.String(length=32), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )
    op.create_table(
        "user_groups",
        sa.Column("user_id", sa.String(length=32), nullable=False),
        sa.Column("group_id", sa.String(length=32), nullable=False),
        sa.ForeignKeyConstraint(
            ["group_id"],
            ["group.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("user_id", "group_id"),
    )
    op.create_table(
        "ap_reqs",
        sa.Column("ap_id", sa.String(length=32), nullable=False),
        sa.Column("af_id", sa.String(length=32), nullable=False),
        sa.ForeignKeyConstraint(
            ["af_id"],
            ["af.id"],
        ),
        sa.ForeignKeyConstraint(
            ["ap_id"],
            ["ap.id"],
        ),
        sa.PrimaryKeyConstraint("ap_id", "af_id"),
    )
    op.create_table(
        "oauth2_token",
        sa.Column("token_type", sa.String(length=40), nullable=True),
        sa.Column("access_token", sa.String(length=255), nullable=False),
        sa.Column("refresh_token", sa.String(length=255), nullable=True),
        sa.Column("scope", sa.Text(), nullable=True),
        sa.Column("issued_at", sa.Integer(), nullable=False),
        sa.Column("access_token_revoked_at", sa.Integer(), nullable=False),
        sa.Column("refresh_token_revoked_at", sa.Integer(), nullable=False),
        sa.Column("expires_in", sa.Integer(), nullable=False),
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("user_id", sa.String(length=32), nullable=True),
        sa.Column("client_id", sa.String(length=48), nullable=True),
        sa.ForeignKeyConstraint(
            ["client_id"],
            ["oauth2_client.id"],
        ),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("access_token"),
    )
    op.create_index(
        op.f("ix_oauth2_token_refresh_token"),
        "oauth2_token",
        ["refresh_token"],
        unique=False,
    )
    op.create_table(
        "user_login",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("name", sa.Unicode(length=256), nullable=True),
        sa.Column("user_id", sa.String(length=32), nullable=False),
        sa.Column("extra", sqlalchemy_utils.types.json.JSONType(), nullable=True),
        sa.Column("against_id", sa.String(length=32), nullable=True),
        sa.Column("start", sa.DateTime(), nullable=False),
        sa.Column("last", sa.DateTime(), nullable=True),
        sa.Column("end", sa.DateTime(), nullable=True),
        sa.Column("reason_end", sa.String(length=32), nullable=True),
        sa.Column("token_hash", sa.String(length=512), nullable=True),
        sa.ForeignKeyConstraint(
            ["against_id"],
            ["ap.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("user_login")
    op.drop_index(op.f("ix_oauth2_token_refresh_token"), table_name="oauth2_token")
    op.drop_table("oauth2_token")
    op.drop_table("ap_reqs")
    op.drop_table("user_groups")
    op.drop_table("oauth2_code")
    op.drop_index(op.f("ix_oauth2_client_client_id"), table_name="oauth2_client")
    op.drop_table("oauth2_client")
    op.drop_table("ap")
    op.drop_table("af")
    op.drop_table("user")
    op.drop_table("group_perms")
    op.drop_table("email")
    op.drop_table("group")
    # ### end Alembic commands ###
