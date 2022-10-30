shell = /bin/sh
prefix = /usr/local

.suffixes:

all: jwt.pem jwt.pem.pub

install: install-main install-service

install-main:
	$(PRE_INSTALL)
	useradd -m -c "Kyii Airy" -d "/opt/kyii-airy-home" kyii-airy
	$(NORMAL_INSTALL)
	cp -r . /opt/kyii-airy-home/airy
	cp -r ./deploy/* /opt/kyii-airy-home/
	chown kyii-airy:kyii-airy /opt/kyii-airy-home/ -R
	chmod u+x /opt/kyii-airy-home/start.sh
	$(POST_INSTALL)
	su -s /bin/bash -c 'bash /opt/kyii-airy-home/setup.sh' kyii-airy

install-service:
	$(NORMAL_INSTALL)
	cp ./deploy/kyii-airy.service /usr/lib/systemd/system/kyii-airy.service
	$(POST_INSTALL)
	systemctl daemon-reload
	systemctl enable kyii-airy.service

uninstall: uninstall-main uninstall-service

uninstall-main:
	userdel kyii-airy
	rm -r /opt/kyii-airy-home

uninstall-service:
	rm /usr/lib/systemd/system/kyii-airy.service

messages.pot:
	pybabel extract -F ./babel.cfg -k _l -o messages.pot .

jwt.pem:
	ssh-keygen -t rsa -b 4096 -m PEM -f jwt.pem -q -N ""

jwt.pem.pub: jwt.pem
	openssl rsa -in jwt.pem -pubout -outform PEM -out jwt.pem.pub
