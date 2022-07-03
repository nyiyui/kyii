#!/bin/sh

(cd ./airy && pipenv run black --check ./airy) &
(cd ./yuui && npm run lint) &

wait
