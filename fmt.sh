#!/bin/sh

(cd ./airy && pipenv run black --safe ./airy) &
(cd ./yuui && npm run format) &

wait
