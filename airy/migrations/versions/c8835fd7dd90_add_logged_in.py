"""add logged_in column for login/taf unification

Revision ID: c8835fd7dd90
Revises: 520cf1b93bc6
Create Date: 2023-07-08 04:58:49.536418

"""
from alembic import op
import sqlalchemy_utils
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c8835fd7dd90'
down_revision = '520cf1b93bc6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user_login', schema=None) as batch_op:
        batch_op.add_column(sa.Column('logged_in', sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user_login', schema=None) as batch_op:
        batch_op.drop_column('logged_in')

    # ### end Alembic commands ###
