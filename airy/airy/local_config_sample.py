def init_app(app):
    app.config["SECRET_KEY"] = "change me!"
    app.config["HOST"] = "localhost"
    app.config["UPLOAD_PATH"] = ".local/kyii-upload"
    app.config["VERIFIER_WEBAUTHN"] = dict(
        rp_id="http://localhost",
        rp_name="local testing airy",
    )
    app.config["CACHE_TYPE"] = "SimpleCache"
