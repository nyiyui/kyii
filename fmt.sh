#!/bin/sh

(
	AIRY_CHANGED=$(cd ./airy && git diff --name-only --cached | grep 'airy/' | cut -c 6-) &&
	if [ -z "$AIRY_CHANGED" ]; then
		echo '(*˘︶˘*).｡.:*♡'
	else
		(cd ./airy && pipenv run black --check $(echo $AIRY_CHANGED | grep '.py'))
	fi
) &

wait
