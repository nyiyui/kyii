#!/bin/sh

find ./airy -type f -name '*' | grep -v flask_session | grep -v mypy_cache | xargs wc -l | sort -nr
