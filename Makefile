app_list = \
           DNA_HomeScreen \
           DNA_News \
           DNA_Phone \
           DNA_HVAC \
           DNA_Dashboard \
           DNA_Navigation \
           DNA_NFC \
           DNA_MOST_AudioSettings \
           DNA_Browser \
           DNA_Weather

not_installed =\
           DNA_HelloTizen \
           DNA_RVITest \

extension_list = extension_common wkb_client_ext most
TIZEN_IP=TizenVTC
#TIZEN_IP=192.168.6.11

#to avoid typing a password for each scp or ssh command you need to copy
#your public key over 
#
# ssh-copy-id app@TizenNuc
#
# This command will require your password and then you will be able to 
# use ssh and scp without a password from that user.

all: apps extensions

apps:
	$(foreach app,$(app_list), make -C $(app);)
	#cd  HomeScreen && make
	#cd  Browser && make
	#cd  Boilerplate && make
	#cd  News && make

extensions:
	$(foreach extension,$(extension_list), make -C $(extension);)

install_apps:
	$(foreach app,$(app_list), make -C $(app) install TIZEN_IP=$(TIZEN_IP);)

deploy: deploy_apps 

deploy_apps:
	$(foreach app,$(app_list), make -C $(app) deploy TIZEN_IP=$(TIZEN_IP);)
	#cd HomeScreen && make deploy TIZEN_IP=192.168.6.53
	#cd Browser && make deploy TIZEN_IP=192.168.6.53
	#cd Boilerplate && make deploy TIZEN_IP=192.168.6.53
	#cd News && make deploy TIZEN_IP=192.168.6.53
	scp InstallWgts.sh app@$(TIZEN_IP):/home/app/
	ssh app@$(TIZEN_IP) ./InstallWgts.sh

deploy_extensions:
	$(foreach extension,$(extension_list), make -C $(extension) deploy TIZEN_IP=$(TIZEN_IP);)

run:
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'Home Screen' | awk '{print $1}' | xargs --no-run-if-empty xwalk-launcher -d"

clean: clean_apps clean_extensions

clean_apps:
	$(foreach app,$(app_list), make -C $(app) clean;)
	#cd HomeScreen && make clean
	#cd Boilerplate && make clean
	#cd Browser && make clean
	#cd News && make clean
	cd Leap && make clean
	#cd GestureGame && make clean

clean_extensions: 
	$(foreach extension,$(extension_list), make -C $(extension) clean;)

install:
	cd HomeScreen && make install

update.extention: 
	-ssh root@$(TIZEN_IP) "zypper -n rr updated_repo"
	#ssh root@$(TIZEN_IP) "zypper -n addrepo -G https://download.tizen.org/releases/daily/tizen/ivi/latest/repos/atom/packages/ updated_repo"
	ssh root@$(TIZEN_IP) "zypper -n addrepo -G https://download.tizen.org/releases/daily/tizen/ivi/tizen-ivi_20150115.2/repos/atom/packages/ updated_repo"
	ssh root@$(TIZEN_IP) "zypper -n refresh"
	ssh root@$(TIZEN_IP) "zypper -n install tizen-extensions-crosswalk"


