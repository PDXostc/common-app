PROJECT = DNA_Browser
INSTALL_FILES = images css js icon.png index.html templates
WRT_FILES = DNA_common css icon.png setup images js templates config.xml error.html index.html search.html warning.html manifest.json README.txt
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

kill.xwalk:
	ssh root@$(TIZEN_IP) "pkill xwalk"

kill.feb1:
	ssh app@$(TIZEN_IP) "pkgcmd -k JLRPOCX030.Browser"

run: install
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'DNA Browser' | awk '{print $1}' | xargs --no-run-if-empty xwalk-launcher -d"

run.feb1: install.feb1
	ssh app@$(TIZEN_IP) "app_launcher -s JLRPOCX030.Browser -d "

install.feb1: deploy
ifndef OBS
	-ssh app@$(TIZEN_IP) "pkgcmd -u -n JLRPOCX030.Browser -q"
	ssh app@$(TIZEN_IP) "pkgcmd -i -t wgt -p /home/app/DNA_Browser.wgt -q"
endif

install: deploy
ifndef OBS
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'DNA Browser' | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u"
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl -i /home/app/DNA_Browser.wgt"
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

