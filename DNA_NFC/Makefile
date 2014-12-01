PROJECT = NFC
INSTALL_FILES = $(PROJECT).wgt
COMPONENTS =  config.xml icon.png index.html images components icon.png DNA_common css js
VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

INSTALL_DIR = $(DESTDIR)/opt/usr/apps/.preinstallWidgets

ifndef TIZEN_IP
TIZEN_IP=TizenNuc
endif

dev:	clean $(PROJECT).wgt
#dev-common 

run: install
	@echo "============= Run =============================="
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e '$(PROJECT)' | awk '{print $1}' | xargs --no-run-if-empty xwalk-launcher -d"

install: deploy
	@echo "============= Uninstall the old ================"
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e '$(PROJECT)' | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u"
	@echo "============= Install the new =================="
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl -i $(PROJECT).wgt"

deploy: dev
	scp $(PROJECT).wgt app@$(TIZEN_IP):

$(PROJECT).wgt:
	zip -r $(PROJECT).wgt $(COMPONENTS)

all:
	@echo "Nothing to build"

wgtPkg: DNA_common $(PROJECT).wgt

clean:
	rm -rf DNA_common
	rm -f $(PROJECT).wgt

DNA_common: /opt/usr/apps/DNA_common
	cp -r /opt/usr/apps/DNA_common .

/opt/usr/apps/common:
	echo "Please install Common Assets"
	exit 1

dev-common: ../../DNA_common
	cp -r ../../DNA_common .

../DNA_common:
	@echo "Please fetch ../DNA_common"
	exit 1;

dist:
	tar czf ../$(PROJECT).tar.bz2 .

