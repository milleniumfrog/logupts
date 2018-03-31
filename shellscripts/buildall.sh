#!/bin/bash
echo build umd
tsc -p ./config/tsconfig.umd.json
echo build es2015
tsc -p ./config/tsconfig.es2015.json