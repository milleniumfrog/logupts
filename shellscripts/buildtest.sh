#!/bin/bash
echo build es2015
tsc -p ./config/tsconfig.es2015.json
echo bundle for browser
rollup dist/es2015/logupts.js --o dist/browser/logupts.js --f iife --name "logupts"