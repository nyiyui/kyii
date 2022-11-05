import os


def init_app(app):
    @app.cli.group()
    def tr():
        """Translation and localization commands."""
        pass

    @tr.command()
    def update():
        """Update all languages."""
        if os.system("pybabel extract -F babel.cfg -k _l -o messages.pot ."):
            raise RuntimeError("extract command failed")
        if os.system("pybabel update -i messages.pot -d airy/translations"):
            raise RuntimeError("update command failed")
        os.remove("messages.pot")

    @tr.command()
    def compile():
        """Compile all languages."""
        if os.system("pybabel compile -d airy/translations"):
            raise RuntimeError("compile command failed")
