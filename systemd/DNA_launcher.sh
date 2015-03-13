#!/bin/sh

function pkle(){
	sleep 2
	pkill LauncherExtensi
}
function go(){
	echo -ne $STR
	app_launcher -s $STR
}
STR="JLRPOCX001.HomeScreen";go;sleep 4
pkle
