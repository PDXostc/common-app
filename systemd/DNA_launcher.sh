#!/bin/sh

function pkle(){
	sleep 2
	pkill LauncherExtensi
}
function go(){
	echo -ne $STR
	app_launcher -s $STR
	pkle
}
STR="JLRPOCX007.News";go
STR="JLRPOCX008.HVAC";go
STR="JLRPOCX015.Navigation";go
STR="JLRPOCX030.Browser";go
STR="JLRPOCX033.Dashboard";go
STR="JLRPOCX034.NFC";go
STR="JLRPOCX035.Weather";go
STR="JLRPOCX001.HomeScreen";go
pkle;pkle;pkle;pkle
