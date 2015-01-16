#!/bin/sh
#
# Usage:
# mm {start|stop|restart}

action="$1"
case "$action" in
    stop)
        echo "Stopping media manager services..."
        killall media-manager
        killall rygel
        killall lightmediascannerd
        killall xwalk-launcher
        killall python
        ;;
    start)
        echo "Starting media manager services..."
		rm -f /home/app/.config/lightmediascannerd/*
		ls /home/app/.config/lightmediascannerd/
		rm -f /home/app/.cache/media-manager-artwork/*.jpg
		ls /home/app/.cache/media-manager-artwork/
        lightmediascannerd -S -D /mnt &
        sleep 2
        rygel -n lo &
        LD_LIBRARY_PATH=/opt/genivi/lib media-manager &
        cd /home/app/.cache/media-manager-artwork/ && python /home/app/.cache/media-manager-artwork/simpleserver.py &
        sleep 1
        LD_LIBRARY_PATH=/opt/genivi/lib xwalk-launcher -d  JLRPOCX003.MediaManager
        ;;
    restart)
        $0 stop
        sleep 3
        $0 start
        ;;
    *)
	echo "Usage $0 {start|stop|restart}"
        ;;
esac


