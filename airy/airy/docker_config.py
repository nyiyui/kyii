def init_app(app):
    app.config["UPLOAD_PATH"] = "/var/kyii-upload"
    app.config["SILICA_IMAGES_TMP_PATH"] = "/tmp"
