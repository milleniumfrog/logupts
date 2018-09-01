#!/bin/bash
tsc -p tsconfig.es2015.json & tsc -p tsconfig.json
rollup -c 
uglifyjs dist/browser/logupts.js -o dist/browser/logupts.min.js