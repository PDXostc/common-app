PROJECT = JLRPOCX031.Phone
PROJECT_SIG = gnipnignbkkkjeglidcdnedabpekbiah
INSTALL_FILES = images js icon.png index.html
WRT_FILES = DNA_common css data icon.png index.html setup config.xml images js manifest.json templates
VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

INSTALL_DIR = $(DESTDIR)/opt/usr/apps/.preinstallWidgets

ifndef TIZEN_IP
TIZEN_IP=TizenVTC
endif

dev: clean dev-common
	zip -r $(PROJECT).wgt $(WRT_FILES)
	
$(PROJECT).wgt : dev

wgt:
	zip -r $(PROJECT).wgt $(WRT_FILES)

kill.xwalk:
	ssh root@$(TIZEN_IP) "pkill xwalk"

kill.feb1:
	ssh app@$(TIZEN_IP) "pkgcmd -k JLRPOCX031.Phone"

run: install
	#ssh root@$(TIZEN_IP) "systemctl stop bluetooth"
	#ssh root@$(TIZEN_IP) "systemctl start bluetooth"
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'Phone' | awk '{print $1}' | xargs --no-run-if-empty xwalk-launcher -d"

run.feb1: install.feb1
	ssh app@$(TIZEN_IP) "app_launcher -s JLRPOCX031.Phone -d "

install.feb1: deploy
ifndef OBS
	-ssh app@$(TIZEN_IP) "pkgcmd -u -n JLRPOCX031.Phone -q"
	ssh app@$(TIZEN_IP) "pkgcmd -i -t wgt -p /home/app/JLRPOCX031.Phone.wgt -q"
endif

install: deploy
ifndef OBS
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'Phone' | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u"
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl -i /home/app/JLRPOCX031.Phone.wgt"
endif

$(PROJECT).wgt : wgt

update.extention: 
	#ssh root@$(TIZEN_IP) "zypper -n rr updated_repo"
	#ssh root@$(TIZEN_IP) "zypper -n addrepo http://download.tizen.org/releases/daily/tizen/ivi/latest/repos/atom/packages/ updated_repo"
	#ssh root@$(TIZEN_IP) "zypper -n refresh"
	#ssh root@$(TIZEN_IP) "zypper -n install tizen-extensions-crosswalk"

deploy: dev
ifndef OBS
	scp $(PROJECT).wgt app@$(TIZEN_IP):/home/app
endif

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

dev-common: ../DNA_common
	cp -rf ../DNA_common .

../DNA_common:
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

