all: jwt.pem jwt.pem.pub

jwt.pem:
	ssh-keygen -t rsa -b 4096 -m PEM -f jwt.pem -q -N ""

jwt.pem.pub:
	openssl rsa -in jwt.pem -pubout -outform PEM -out jwt.pem.pub
