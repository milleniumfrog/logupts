#!/bin/bash
echo start watch
tsc -p ./config/tsconfig.es2015.json --watch &
tsc -p ./config/tsconfig.umd.json --watch &
rollup dist/es2015/logupts.js --watch --o dist/browser/logupts.js --f iife --name "logupts" &
rollup dist/es2015/logupts.js --watch --o dist/browser/es2015/logupts.js --f es --name "logupts" &
wait