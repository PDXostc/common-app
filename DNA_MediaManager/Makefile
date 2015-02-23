PROJECT = DNA_MediaManager
INSTALL_FILES = media-manager-artwork images js icon.png index.html
WRT_FILES = DNA_common css media-manager-artwork images icon.png index.html setup config.xml js manifest.json
VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

SEND := ~/send

ifndef TIZEN_IP
TIZEN_IP=TizenVTC
endif

wgtPkg: clean
	cp -rf ../DNA_common .
	zip -r $(PROJECT).wgt $(WRT_FILES)
	
config:
	scp setup/weston.ini root@$(TIZEN_IP):/etc/xdg/weston/

$(PROJECT).wgt : dev

wgt:
	zip -r $(PROJECT).wgt $(WRT_FILES)

scan:
	ssh app@$(TIZEN_IP) "lightmediascannerctl scan"

stop:
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && ./mm stop"

run: install
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && ./mm start"
	#ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'DNA_MediaManager' | awk '{print $1}' | xargs --no-run-if-empty LD_LIBRARY_PATH=/opt/genivi/lib xwalk-launcher"

kill.xwalk:
	ssh root@$(TIZEN_IP) "pkill xwalk"

kill.feb1:
	ssh app@$(TIZEN_IP) "pkgcmd -k JLRPOCX001.HomeScreen"

install: deploy
ifndef OBS
	scp mm app@$(TIZEN_IP):
	scp -r media-manager-artwork app@$(TIZEN_IP):.cache/
	#ssh root@$(TIZEN_IP) "rpm --force -ivh weekeyboard-0.0.2-0.i686.rpm"
	ssh app@$(TIZEN_IP) "chmod +x mm"
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'JLRPOCX003.MediaManager' | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u"
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl -i /home/app/DNA_MediaManager.wgt"
endif

$(PROJECT).wgt : wgt

deploy: wgtPkg
ifndef OBS
	scp $(PROJECT).wgt app@$(TIZEN_IP):/home/app
endif

all:
	@echo "Nothing to build"

clean:
	-rm $(PROJECT).wgt
	-rm -rf DNA_common

