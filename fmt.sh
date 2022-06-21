#!/bin/sh

(cd ./airy && pipenv run black ./airy) &
(cd ./yuui && npm run format) &

wait
