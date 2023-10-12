shell = /bin/sh
prefix = /usr/local

.suffixes:

all: jwt.pem jwt.pem.pub

run:
	python3 -m flask run

.PHONY: run

install: install-main install-service

install-main:
	$(PRE_INSTALL)
	useradd -m -c "Kyii Airy" -d "/opt/kankin-airy-home" kankin-airy
	$(NORMAL_INSTALL)
	cp -r . /opt/kankin-airy-home/airy
	cp -r ./deploy/* /opt/kankin-airy-home/
	chown kankin-airy:kankin-airy /opt/kankin-airy-home/ -R
	chmod u+x /opt/kankin-airy-home/start.sh
	$(POST_INSTALL)
	su -s /bin/bash -c 'bash /opt/kankin-airy-home/setup.sh' kankin-airy

install-service:
	$(NORMAL_INSTALL)
	cp ./deploy/kankin-airy.service /usr/lib/systemd/system/kankin-airy.service
	$(POST_INSTALL)
	systemctl daemon-reload
	systemctl enable kankin-airy.service

uninstall: uninstall-main uninstall-service

uninstall-main:
	userdel kankin-airy
	rm -r /opt/kankin-airy-home

uninstall-service:
	rm /usr/lib/systemd/system/kankin-airy.service

messages.pot:
	pybabel extract -F ./babel.cfg -k _l -o messages.pot .

jwt.pem:
	ssh-keygen -t rsa -b 4096 -m PEM -f jwt.pem -q -N ""

jwt.pem.pub: jwt.pem
	openssl rsa -in jwt.pem -pubout -outform PEM -out jwt.pem.pub
