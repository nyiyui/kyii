"""add sid2 to UserLogin

Revision ID: d69a3ab80d73
Revises: 14c3f0cfbd44
Create Date: 2022-08-16T04:10:58+09:00

"""
from alembic import op
import sqlalchemy_utils
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd69a3ab80d73'
down_revision = '14c3f0cfbd44'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user_login', sa.Column('sid2', sa.String(length=64), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user_login', 'sid2')
    # ### end Alembic commands ###