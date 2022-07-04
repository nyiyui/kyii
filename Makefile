fmt:
	(cd ./yuui && npm run format)
	(cd ./airy && pipenv run black --safe .)

.PHONY: fmt
