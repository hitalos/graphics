all: area bars gallery gauge

clean:
	rm -f */*.min.js* cases.csv

run: all
	go run ./main.go

update_cases:
	$(MAKE) -B cases.csv

cases.csv:
	./getCases.sh

ESBUILD=./node_modules/.bin/esbuild --minify --bundle --sourcemap

*/*.min.js:
	@$(ESBUILD) --outfile="$@" "$(@:.min.js=.js)"

area bars gallery gauge:
	$(MAKE) -B $@/$@.min.js

.PHONY: area bars gallery gauge */*.min.js
