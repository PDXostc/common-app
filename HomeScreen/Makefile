PROJECT = HomeScreen
PROJECT_SIG = gnipnignbkkkjeglidcdnedabpekbiah
INSTALL_FILES = images js icon.png index.html
WRT_FILES = common css icon.png index.html setup config.xml images js manifest.json
VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

INSTALL_DIR = $(DESTDIR)/opt/usr/apps/.preinstallWidgets

ifndef TIZEN_IP
TIZEN_IP=TizenNuc
endif

dev: clean dev-common
	zip -r $(PROJECT).wgt $(WRT_FILES)
	
$(PROJECT).wgt : dev

wgt:
	zip -r $(PROJECT).wgt $(WRT_FILES)

run: install
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'Home Screen' | awk '{print $1}' | xargs --no-run-if-empty xwalk-launcher"

install: deploy
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'Home Screen' | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u"
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl -i /home/app/HomeScreen.wgt"

$(PROJECT).wgt : wgt

deploy: dev
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
	git clean -f

common: /opt/usr/apps/common
	cp -r /opt/usr/apps/common/js/* js/
	cp -r /opt/usr/apps/common/css/* css/

/opt/usr/apps/common:
	@echo "Please install Common Assets"
	exit 1

dev-common: ../common
	#cp -r ../common/js/* js/
	#cp -r ../common/css/* css/
	cp -rf ../common .

../common:
	@echo "Please checkout Common Assets"
	exit 1

$(INSTALL_DIR) :
	mkdir -p $(INSTALL_DIR)/

install_xwalk: $(INSTALL_DIR)
	@echo "Installing $(PROJECT), stand by..."
	cp $(PROJECT).wgt $(INSTALL_DIR)/
	export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/5000/dbus/user_bus_socket"
	su app -c"xwalk -i $(INSTALL_DIR)/$(PROJECT).wgt"

dist:
	tar czf ../$(PROJECT).tar.bz2 .

