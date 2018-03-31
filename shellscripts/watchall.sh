#!/bin/bash
tsc -p ./config/tsconfig.umd.json --watch &
tsc -p ./config/tsconfig.es2015.json --watch
wait