import base64
import json

from passlib.hash import django_pbkdf2_sha256

from .db import AF, AP, Group, GroupPerms, OAuth2Client, User, db, gen_id


def init_app(app):
    @app.cli.command("seed")
    def seed():
        for table in reversed(db.metadata.sorted_tables):
            db.session.execute(table.delete())
        sus = Group(slug="sus", name="Superusers")
        db.session.add(sus)

        db.session.commit()
        # email = Email(email="root@nyiyui.ca", is_verified=True, group=sus)
        # db.session.add(email)

        nyiyui = User(
            id=gen_id(),
            slug="nyiyui",
            name="Yui Shibata",
            groups=[sus],
        )
        db.session.add(nyiyui)
        db.session.commit()
        gp = GroupPerms(group_id=sus.id, perm_name="admin")
        print(gp, gp.group_id, gp.perm_name)
        db.session.add(gp)

        asuna_g = Group(slug="asuna", name="Superusers")
        db.session.add(asuna_g)
        asuna = User(
            id=gen_id(),
            slug="asuna",
            name="Yuuki Asuna",
            groups=[asuna_g],
        )
        db.session.add(asuna)
        db.session.commit()

        af0 = AF(name="Zero", user=asuna, verifier="pw")
        af0.regen(gen_params=dict(password="yuuki"))
        db.session.add(af0)

        ap0 = AP(name="Primary", user=asuna, reqs=[af0])
        db.session.add(ap0)

        af1 = AF(name="One", user=nyiyui, verifier="pw")
        af1.regen(gen_params=dict(password="abc"))
        db.session.add(af1)

        af2 = AF(name="Two", user=nyiyui, verifier="otp_totp")
        af2.regen(gen_params={})
        af2.name = f"Two with secret key {af2.params['secret_key']}"
        print(af2, af2.params, af2.state)
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

        af4 = AF(name="Remote", user=nyiyui, verifier="remote", gen_done=True, params={})
        db.session.add(af4)

        ap1 = AP(name="Basic", user=nyiyui, reqs=[af1])
        db.session.add(ap1)

        ap2 = AP(name="Two", user=nyiyui, reqs=[af1, af2])
        db.session.add(ap2)

        ap3 = AP(name="Legacy", user=nyiyui, reqs=[af3])
        db.session.add(ap3)

        ap4 = AP(name="Remote", user=nyiyui, reqs=[af4])
        db.session.add(ap4)

        mctf = OAuth2Client(
            id="9b540566-c278-4968-bf18-8cdb29fb9b08",
            user=nyiyui,
            client_id="yLEG3BmYr6UL6xT5VNuFTApY",
            client_secret="zv7pEjvyH0g6Bhkc7egFN2HanJ244Qxd9xwjDYGeU6vfzbYC",
            client_id_issued_at=1653174311,
            client_secret_expires_at=0,
            _client_metadata=json.dumps(
                {
                    "client_name": "mCTF",
                    "client_uri": "http://localhost:8001",
                    "grant_types": ["authorization_code"],
                    "redirect_uris": [
                        "http://localhost:8001/accounts/kyii/login/callback/"
                    ],
                    "response_types": ["code"],
                    "scope": "openid profile",
                    "token_endpoint_auth_method": "client_secret_post",
                },
            ),
        )
        db.session.add(mctf)

        db.session.commit()
