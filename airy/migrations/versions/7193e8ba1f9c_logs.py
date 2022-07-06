"""logs

Revision ID: 7193e8ba1f9c
Revises: 3c8759cda5ca
Create Date: 2022-07-06 15:40:48.148757

"""
from alembic import op
import sqlalchemy_utils
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "7193e8ba1f9c"
down_revision = "3c8759cda5ca"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "log_entry",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("created", sa.DateTime(), nullable=False),
        sa.Column("renderer", sa.String(length=32), nullable=True),
        sa.Column("data", sqlalchemy_utils.types.json.JSONType(), nullable=True),
        sa.Column("user_id", sa.String(length=32), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("log_entry")
    # ### end Alembic commands ###
