PROJECT = DNA_NFC
APPNAME = NFC
WRT_FILES = DNA_common css icon.png index.html config.xml js images README.txt
VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

ifndef TIZEN_IP
TIZEN_IP=TizenVTC
endif

wgtPkg: clean common $(PROJECT).wgt

wgt: $(PROJECT).wgt

kill.xwalk:
	ssh root@$(TIZEN_IP) "pkill xwalk"

kill.feb1:
	ssh app@$(TIZEN_IP) "pkgcmd -k JLRPOCX001.HomeScreen"

run: install
	@echo "================ Run ======================="
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e $(APPNAME) | awk '{print $1}' | xargs --no-run-if-empty xwalk-launcher -d"

run.feb1: install.feb1
	ssh app@$(TIZEN_IP) "app_launcher -s JLRPOCX034.NFC -d "

install.feb1: deploy
ifndef OBS
	-ssh app@$(TIZEN_IP) "pkgcmd -u -n JLRPOCX034.NFC -q"
	ssh app@$(TIZEN_IP) "pkgcmd -i -t wgt -p /home/app/DNA_NFC.wgt -q"
endif

install: deploy
ifndef OBS
	@echo "================ Uninstall ================="
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e $(APPNAME) | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u"
	@echo "================ Install ==================="
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl -i $(PROJECT).wgt"
endif

deploy: wgtPkg
ifndef OBS
	scp $(PROJECT).wgt app@$(TIZEN_IP):
endif

common: ../DNA_common
	cp -rf ../DNA_common .

$(PROJECT).wgt : 
	zip -r $(PROJECT).wgt $(WRT_FILES)

all: wgt

clean:
	-rm $(PROJECT).wgt
	-rm -rf DNA_common

