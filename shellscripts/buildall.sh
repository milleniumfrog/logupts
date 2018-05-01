#!/bin/bash
echo tsc
tsc -p ./config/tsconfig.umd.json &
tsc -p ./config/tsconfig.es2015.json
wait
echo "bundle for  browser"
echo bundle iife
rollup dist/es2015/logupts.js --o dist/browser/logupts.js --f iife --name "logupts"
echo bundle es
rollup dist/es2015/logupts.js --o dist/browser/logupts.es2015.js --f es --name "logupts"
echo bundle amd
rollup dist/es2015/logupts.js --o dist/browser/logupts.amd.js --f amd --name "logupts"
echo uglify iife
uglifyjs dist/browser/logupts.js --compress --mangle -o dist/browser/logupts.min.js
echo uglify es2015
uglifyjs dist/browser/logupts.es2015.js --compress --mangle -o dist/browser/logupts.es2015.min.js
echo uglify amd
uglifyjs dist/browser/logupts.amd.js --compress --mangle -o dist/browser/logupts.amd.min.js
echo copy typescript
mkdir -p dist/ts
cp src/logupts.ts dist/ts/logupts.ts
cp src/placeholders.ts dist/ts/placeholders.ts
cp src/logupts-transport-file.ts dist/ts/logupts-transport-file.ts
echo "finished building"