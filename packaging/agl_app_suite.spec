Name:       agl_app_suite	
Summary:    A HTML Home Screen application
Version:    0.0.1
Release:    1
Group:      Applications/System
License:    ASL 2.0
URL:        http://www.tizen.org2
Source0:    %{name}-%{version}.tar.bz2
#BuildRequires:  common
BuildRequires:  zip
BuildRequires:  desktop-file-utils
#Requires:  speech-recognition
#Requires:   wrt-installer
#Requires:   wrt-plugins-ivi

%description
A proof of concept pure html5 UI

%prep
%setup -q -n %{name}-%{version}

%build
cd HomeScreen
make
#cd ../Boilerplate
#make
#cd ../Browser
#make

%install
#rm -rf %{buildroot}
cd HomeScreen
%make_install
#cd ../Boilerplate
#%make_install
#cd ../Browser
#%make_install

%post
#export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/5000/dbus/user_bus_socket"
#su app -c"xwalk -i $(INSTALL_DIR)/$(PROJECT).wgt"
#if [ -f /opt/usr/apps/.preinstallWidgets/preinstallDone ]; then
#    wrt-installer -i /opt/usr/apps/.preinstallWidgets/HomeScreen.wgt;
#fi

%postun
#    wrt-installer -un intelPoc10.HomeScreen

%files
%defattr(-,root,root,-)
/opt/usr/apps/.preinstallWidgets/HomeScreen.wgt
#/opt/usr/apps/.preinstallWidgets/Boilerplate.wgt
#/opt/usr/apps/.preinstallWidgets/Browser.wgt

