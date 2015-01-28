Name:       agl-app-suite	
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

%global app_id_list cciaaojcnnbbpfioidejhigcboenjmmg kmmeobdkikjechfejkakmfmfgjldjkco gnipnignbkkkjeglidcdnedabpekbiah
%global OBS 1

%description
A collection of IVI software

%prep

%setup -q -n %{name}-%{version}

%build
make "OBS=1" apps

%install
#rm -rf %{buildroot}
make "OBS=1" install_obs DESTDIR="%{?buildroot}"

%post
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/5000/dbus/user_bus_socket"
for app in *.wgt; do
	su app -c'xwalkctl -i /opt/usr/apps/.preinstallWidgets/'${app}'
done

%postun
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/5000/dbus/user_bus_socket"
for app in %{app_id_list}; do
	su app -c'xwalkctl -u '${app}''
done
#    wrt-installer -un intelPoc10.HomeScreen

%files
%defattr(-,root,root,-)
/opt/usr/apps/.preinstallWidgets/*.wgt

