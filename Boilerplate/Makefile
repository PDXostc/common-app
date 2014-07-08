PROJECT = Boilerplate
PROJECT_SIG = gnipnignbkkkjeglidcdnedabpekbiah
INSTALL_FILES = images js icon.png index.html
WRT_FILES = common css icon.png index.html setup config.xml images js
VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

INSTALL_DIR = $(DESTDIR)/opt/usr/apps/.preinstallWidgets

ifndef TIZEN_IP
TIZEN_IP=192.168.1.253
endif

dev: clean dev-common
	zip -r $(PROJECT).wgt $(WRT_FILES)
	
$(PROJECT).wgt : dev

deploy: $(PROJECT).wgt
	scp $(PROJECT).wgt app@$(TIZEN_IP):/home/app

all:
	@echo "Nothing to build"

wgtPkg: common
	zip -r $(PROJECT).wgt $(WRT_FILES)

clean:
	rm -rf js/services
	rm -rf common
	rm -rf css/car
	rm -rf css/user
	rm -f $(PROJECT).wgt

common: /opt/usr/apps/_common
	cp -r /opt/usr/apps/_common/js/* js/
	cp -r /opt/usr/apps/_common/css/* css/

/opt/usr/apps/_common:
	@echo "Please install Common Assets"
	exit 1

dev-common: ../_common
	cp -r ../_common/js/* js/
	cp -r ../_common/css/* css/
	cp -rf ../_common common

../_common:
	@echo "Please checkout Common Assets"
	exit 1

$(INSTALL_DIR) :
	mkdir -p $(INSTALL_DIR)/

install: $(INSTALL_DIR)
	@echo "Installing $(PROJECT), stand by..."
	cp $(PROJECT).wgt $(INSTALL_DIR)/

install_xwalk: $(INSTALL_DIR)
	@echo "Installing $(PROJECT), stand by..."
	cp $(PROJECT).wgt $(INSTALL_DIR)/
	export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/5000/dbus/user_bus_socket"
	su app -c"xwalk -i $(INSTALL_DIR)/$(PROJECT).wgt"

dist:
	tar czf ../$(PROJECT).tar.bz2 .

