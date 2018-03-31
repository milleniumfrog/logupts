#!/bin/bash
dir="./log"

if [ -d $dir ]
then
	echo "$dir found, delete it"
	rm -R $dir
else 
	echo "$dir not found"
fi
mkdir $dir