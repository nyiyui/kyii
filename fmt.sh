#!/bin/sh

(
	AIRY_CHANGED=$(git diff --name-only --cached | grep 'airy/') &&
	if [ -z "$AIRY_CHANGED" ]; then
		echo noice
	else
		(pipenv run black --check $AIRY_CHANGED)
	fi
) &

(cd ./yuui && npm run lint) &

wait
