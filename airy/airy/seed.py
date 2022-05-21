import base64

from passlib.hash import django_pbkdf2_sha256

from .db import AF, AP, Group, User, db, gen_uuid, GroupPerms


def init_app(app):
    @app.cli.command("seed")
    def seed():
        for table in reversed(db.metadata.sorted_tables):
            db.session.execute(table.delete())
        nyiyui = User(
            id=gen_uuid(), slug="nyiyui", name="Yui Shibata", email_verified=False
        )
        db.session.add(nyiyui)

        sus = Group(slug="sus", name="Superusers", email_verified=False)
        sus.users.append(nyiyui)
        db.session.add(sus)
        db.session.commit()
        gp = GroupPerms(group_id=sus.id, perm_name="_.admin")
        print(gp, gp.group_id, gp.perm_name)
        db.session.add(gp)

        af1 = AF(
            name="One", user=nyiyui, verifier="pw", gen_params=dict(password="abc")
        )
        db.session.add(af1)

        af2 = AF(name="Two", user=nyiyui, verifier="otp_totp", gen_params={})
        af2.name += af2.params["secret_key"]
        db.session.add(af2)

        af3 = AF(
            name="Legacy",
            user=nyiyui,
            verifier="pw",
            gen_params=dict(password="placeholder"),
        )
        af3.params = dict(
            hash=base64.b64encode(
                django_pbkdf2_sha256.hash("def".encode("utf-8")).encode("ascii")
            ).decode("ascii"),
            compat="django_pbkdf2_sha256",
        )
        db.session.add(af3)

        ap1 = AP(name="Basic", user=nyiyui, reqs=[af1])
        db.session.add(ap1)

        ap2 = AP(name="Two", user=nyiyui, reqs=[af1, af2])
        db.session.add(ap2)

        ap3 = AP(name="Legacy", user=nyiyui, reqs=[af3])
        db.session.add(ap3)

        db.session.commit()
