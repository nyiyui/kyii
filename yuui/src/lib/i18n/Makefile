all: clean index.js

index.js:
	(cd gen; go run main.go \
		--config ./trs.toml \
		--dest ../index.js)
	prettier -w ./index.js

clean:
	rm -f ./index.js

.PHONY: clear
