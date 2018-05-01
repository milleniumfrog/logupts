#!/bin/bash
echo build umd
tsc -p ./config/tsconfig.umd.json
echo build es2015
tsc -p ./config/tsconfig.es2015.json
echo "bundle for  browser"
rollup dist/es2015/logupts.js --o dist/browser/logupts.js --f iife --name "logupts"
rollup dist/es2015/logupts.js --o dist/browser/logupts.es2015.js --f es --name "logupts"
rollup dist/es2015/logupts.js --o dist/browser/logupts.amd.js --f amd --name "logupts"
uglifyjs dist/browser/logupts.js --compress --mangle -o dist/browser/logupts.min.js
uglifyjs dist/browser/logupts.es2015.js --compress --mangle -o dist/browser/logupts.es2015.min.js
uglifyjs dist/browser/logupts.amd.js --compress --mangle -o dist/browser/logupts.amd.min.js