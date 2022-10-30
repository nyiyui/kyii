all:

install:
	cp ./nginx.conf /etc/nginx/sites-available/kyii.conf
	echo 'NOTE: /etc/nginx/sites-available/kyii.conf must be edited!'

install-enable:
	ln -s /etc/nginx/sites-available/kyii.conf /etc/nginx/sites-enabled/kyii.conf

uninstall:
	rm /etc/nginx/sites-available/kyii.conf
