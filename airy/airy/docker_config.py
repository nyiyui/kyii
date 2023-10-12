def init_app(app):
    app.config["UPLOAD_PATH"] = "/var/kankin-upload"
    app.config["SILICA_IMAGES_TMP_PATH"] = "/tmp"
