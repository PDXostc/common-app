PROJECT = DNA_NFC
APPNAME = NFC
WRT_FILES = DNA_common css icon.png index.html config.xml js images
VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

ifndef TIZEN_IP
TIZEN_IP=TizenVTC
endif

wgtPkg: clean common $(PROJECT).wgt

wgt: $(PROJECT).wgt

run: install
	@echo "================ Run ======================="
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e $(APPNAME) | awk '{print $1}' | xargs --no-run-if-empty xwalk-launcher -d"

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

