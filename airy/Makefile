all: jwt.pem jwt.pem.pub

messages.pot:
	pybabel extract -F ./babel.cfg -k _l -o messages.pot .

jwt.pem:
	ssh-keygen -t rsa -b 4096 -m PEM -f jwt.pem -q -N ""

jwt.pem.pub: jwt.pem
	openssl rsa -in jwt.pem -pubout -outform PEM -out jwt.pem.pub
