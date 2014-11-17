PROJECT = Browser
PROJECT_SIG = gnipnignbkkkjeglidcdnedabpekbiah
INSTALL_FILES = images js icon.png index.html
WRT_FILES = DNA_common config.xml css error.html icon.png images index.html js search.html  templates warning.html
VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

INSTALL_DIR = $(DESTDIR)/opt/usr/apps/.preinstallWidgets

ifndef TIZEN_IP
TIZEN_IP=TizenNuc
endif

dev: clean dev-common
	zip -r $(PROJECT).wgt $(WRT_FILES)
	
$(PROJECT).wgt : dev

deploy: $(PROJECT).wgt
	scp $(PROJECT).wgt app@$(TIZEN_IP):/home/app

all:
	@echo "Nothing to build"
	
wgtPkg: DNA_common
	zip -r $(PROJECT).wgt config.xml css icon.png index.html js image DNA_common

clean:
	rm -rf js/services
	rm -rf DNA_common
	rm -rf css/car
	rm -rf css/user
	rm -f $(PROJECT).wgt
	git clean -f

DNA_common: /opt/usr/apps/DNA_common
	cp -r /opt/usr/apps/DNA_common/js/* js/
	cp -r /opt/usr/apps/DNA_common/css/* css/

/opt/usr/apps/DNA_common:
	@echo "Please install Common Assets"
	exit 1

dev-common: ../DNA_common
	#cp -r ../common/js/* js/
	#cp -r ../common/css/* css/
	cp -rf ../DNA_common DNA_common

../DNA_common:
	@echo "Please checkout Common Assets"
	exit 1

$(INSTALL_DIR) :
	mkdir -p $(INSTALL_DIR)/

install: $(INSTALL_DIR)
	@echo "Installing $(PROJECT), stand by..."
	mkdir -p $(INSTALL_DIR)/
	cp $(PROJECT).wgt $(INSTALL_DIR)/

install_xwalk: $(INSTALL_DIR)
	@echo "Installing $(PROJECT), stand by..."
	cp $(PROJECT).wgt $(INSTALL_DIR)/
	export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/5000/dbus/user_bus_socket"
	su app -c"xwalk -i $(INSTALL_DIR)/$(PROJECT).wgt"

dist:
	tar czf ../$(PROJECT).tar.bz2 .

