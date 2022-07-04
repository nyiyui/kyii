#!/bin/sh

(
	AIRY_CHANGED=$(cd ./airy && git diff --name-only --cached | grep 'airy/' | cut -c 6-) &&
	if [ -z "$AIRY_CHANGED" ]; then
		echo noice
	else
		(cd ./airy && pipenv run black --check $AIRY_CHANGED)
	fi
) &

(cd ./yuui && npm run lint) &

wait
