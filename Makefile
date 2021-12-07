all: area bars sortable gallery gauge geojson

server:
	go build -ldflags '-s -w' -o server ./main.go

clean:
	rm -f */*.min.js*

run: all
	go run ./main.go

update_cases:
	$(MAKE) -B cases.csv

cases.csv:
	./getCases.sh

ESBUILD=./node_modules/.bin/esbuild --minify --bundle --sourcemap

area bars sortable gallery gauge geojson:
	@$(ESBUILD) --outfile="$@/$@.min.js" "$@/$@.js"

.PHONY: area bars sortable gallery gauge geojson */*.js
