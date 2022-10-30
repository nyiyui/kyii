shell = /bin/sh
prefix = /usr/local

.suffixes:

all:

build:
	npm install
	npm run build

install: build
	$(PRE_INSTALL)
	useradd -m -c "Kyii Airy" -d "/opt/kyii/airy-home" kyii-airy
	$(NORMAL_INSTALL)
	cp -r $(srcdir)/build /var/www/yuui

.PHONY: fmt

