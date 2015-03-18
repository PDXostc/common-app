#!/bin/bash

## set some colors 
red='\033[0;31m'
NC='\033[0m' # No Color

## Test for correct user
TIZEN_USER="$(whoami)"

if [ $TIZEN_USER != "app" ]
    then 
        echo -e "${red}You must be logged in as the user 'app' to install the widgets${NC}"
    exit
fi

## Set some variables
LOCATION="/opt/usr/apps/.preinstallWidgets/"  
FILECOUNT=0
WIDGET_LIST="app_widgets.txt"

## Widget install function
WidgetInstall()
{
    pkgcmd -i -t wgt -p "$*" -q
    echo ""
    echo "********************************************"
    echo ""
    return
}


## Check for preinstalled widgets and generate list
for item in $LOCATION*
do

    if [ -f "$item" ]
        then
             ls -b $LOCATION > app_widgets.txt
        else
             echo -e "${red}No widgets installed${NC}"
        exit
    fi
done

## read the list and install all widgets
while read line
do
    Widget=$LOCATION$line
    echo "Now installing $Widget"
    WidgetInstall $Widget
done < $WIDGET_LIST

