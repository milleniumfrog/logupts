#!/bin/bash
echo build umd
tsc -p ./config/tsconfig.umd.json
echo build es2015
tsc -p ./config/tsconfig.es2015.json
rollup dist/es2015/temp/logupts.js --o dist/es/logupts.js --f es --name "logupts"
echo build browser
rollup dist/es2015/temp/logupts.js --o dist/browser/logupts.js --f iife --name "logupts"