#!/bin/sh

function pkle(){
	sleep 2
	pkill LauncherExtensi
}
function go(){
	echo -ne $STR
	app_launcher -s $STR
}
STR="JLRPOCX007.News";go;pkle
STR="JLRPOCX008.HVAC";go;pkle
STR="JLRPOCX030.Browser";go
STR="JLRPOCX033.Dashboard";go;pkle
STR="JLRPOCX034.NFC";go;pkle
STR="JLRPOCX035.Weather";go;pkle
STR="JLRPOCX015.Navigation";go
STR="JLRPOCX001.HomeScreen";go;sleep 4
pkle;pkle;pkle;pkle
