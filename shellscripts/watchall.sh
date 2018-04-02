#!/bin/bash
tsc -p ./config/tsconfig.umd.json --watch &
tsc -p ./config/tsconfig.es2015.json --watch &
rollup dist/es2015/temp/logupts.js --watch --o dist/browser/logupts.js --f iife --name "logupts" &
rollup dist/es2015/temp/logupts.js --watch --o dist/es/logupts.js --f es --name "logupts"
wait