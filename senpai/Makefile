oidc-private.key:
	openssl genrsa -out oidc-private.key 4096

oidc-public.key: oidc-private.key
	openssl rsa -in oidc-private.key -pubout > oidc-public.key

devrun: oidc-private.key
	OIDC_RSA_PRIVATE_KEY_PATH="./oidc-private.key" \
		./manage.py runserver

.PHONY: devrun
