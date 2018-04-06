#!/bin/bash
echo build umd
tsc -p ./config/tsconfig.umd.json
echo build es2015
tsc -p ./config/tsconfig.es2015.json
echo "bundle for  browser"
rollup dist/es2015/logupts.js --o dist/browser/logupts.js --f iife --name "logupts"
rollup dist/es2015/logupts.js --o dist/browser/es2015/logupts.js --f es --name "logupts"
rollup dist/es2015/logupts.js --o dist/browser/amd/logupts.js --f amd --name "logupts"