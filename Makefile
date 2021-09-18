all: updates gauge/gauge.min.js bars/bars.min.js area/area.min.js

clean:
	rm -f */*.min.js* cases.csv

run: all
	go run ./main.go

updates: cases.csv

cases.csv:
	./getCases.sh

ESBUILD=./node_modules/.bin/esbuild --minify --bundle --sourcemap

gauge/gauge.min.js:
	$(ESBUILD) --outfile=gauge/gauge.min.js gauge/gauge.js

bars/bars.min.js:
	$(ESBUILD) --outfile=bars/bars.min.js bars/bars.js

area/area.min.js:
	$(ESBUILD) --outfile=area/area.min.js area/area.js

.PHONY: cases.csv gauge/gauge.min.js bars/bars.min.js area/area.min.js
