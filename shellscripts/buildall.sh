#!/bin/bash
echo build umd
tsc -p ./config/tsconfig.umd.json
echo build es2015
tsc -p ./config/tsconfig.es2015.json
rollup dist/temp/es2015/logupts.js --o dist/es2015/logupts.js --f es --name "logupts"
echo build browser
rollup dist/temp/es2015/logupts.js --o dist/browser/logupts.js --f iife --name "logupts"