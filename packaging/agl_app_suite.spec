Name:       agl_app_suite	
Summary:    A collection of IVI software
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
A collection of IVI software

%prep
%setup -q -n %{name}-%{version}

%build
for app in HomeScreen Boilerplate Browser; do
    make -C ${app}
done

%install
#rm -rf %{buildroot}
for app in HomeScreen Boilerplate Browser; do
    cd ${app}
    %make_install
    cd ..
done

%post
#export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/5000/dbus/user_bus_socket"
su app -c"xwalkctl -i $(INSTALL_DIR)/$(PROJECT).wgt"
#if [ -f /opt/usr/apps/.preinstallWidgets/preinstallDone ]; then
#    wrt-installer -i /opt/usr/apps/.preinstallWidgets/HomeScreen.wgt;
#fi

%postun
#    wrt-installer -un intelPoc10.HomeScreen

%files
%defattr(-,root,root,-)
/opt/usr/apps/.preinstallWidgets/HomeScreen.wgt
/opt/usr/apps/.preinstallWidgets/Boilerplate.wgt
/opt/usr/apps/.preinstallWidgets/Browser.wgt

