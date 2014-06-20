#!/bin/bash

# extra wait time before first start-up
# this is a workaroud for some strange behaviour of webkit/WebProcess(?)
# note from testing: range 6 to 12 is unsafe and will break webkit/webProcess(?) behaviour (reason unknown)
sleep 2

# start intelPoc10.HomeScreen app
/usr/bin/wrt-launcher -s intelPoc10.HomeScreen

# check if app is up and running after 10s, if not try to start it again
sleep 10
while true; do
    proc=`ps aux | grep i[n]telPoc10.HomeScreen` # [] used to exclude grep itself
    set -- $proc
    if [ -z "$2" ]; then
        # the application is not running - start it again
        /usr/bin/wrt-launcher -s intelPoc10.HomeScreen
    else
        break
    fi
    sleep 5 # check every 5 second
done
