#!/bin/bash
diri="./dist"
dir="./log"
if [ -d $diri ]
then
	echo "$diri found, delete it"
	rm -R $diri
else 
	echo "$diri not found"
fi
if [ -d $dir ]
then
	echo "$dir found, delete it"
	rm -R $dir
else 
	echo "$dir not found"
fi
mkdir $dir
mkdir $diri