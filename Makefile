serve-browser-js:
	python3 -m http.server

run-example-node:
	node examples/index.js

live-compile-typescript:
	tsc -w -p .
