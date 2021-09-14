all: gauge/gauge.min.js bars/bars.min.js area/area.min.js

gauge/gauge.min.js:
	./node_modules/.bin/esbuild --minify --bundle --outfile=gauge/gauge.min.js gauge/gauge.js

bars/bars.min.js:
	./node_modules/.bin/esbuild --minify --bundle --outfile=bars/bars.min.js bars/bars.js

area/area.min.js:
	./node_modules/.bin/esbuild --minify --bundle --outfile=area/area.min.js area/area.js

.PHONY: gauge/gauge.min.js bars/bars.min.js area/area.min.js
