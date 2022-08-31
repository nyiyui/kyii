shell = /bin/sh
prefix = /usr/local

.suffixes:

all:
	npm install
	npm run build

install:
	useradd -m -c "Kyii Airy" -d "/opt/kyii/airy-home" kyii-airy
	cp -r $(srcdir)/airy /opt/kyii/airy-home/airy

.PHONY: fmt

