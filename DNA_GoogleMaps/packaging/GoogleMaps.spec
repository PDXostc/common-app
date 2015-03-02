Name:       Google Maps
Summary:    A HTML Google Maps application
Version:    0.0.1
Release:    1
Group:      Applications/System
License:    ASL 2.0
URL:        http://www.tizen.org
Source0:    %{name}-%{version}.tar.bz2
BuildRequires:  common
BuildRequires:  zip
BuildRequires:  desktop-file-utils
Requires:  speech-recognition
Requires:   wrt-installer
Requires:   wrt-plugins-ivi

%description
A HTML Google Maps application for Directions and gps.

%prep
%setup -q -n %{name}-%{version}

%build

make wgtPkg

%install
rm -rf %{buildroot}
%make_install

%post
if [ -f /opt/usr/apps/.preinstallWidgets/preinstallDone ]; then
    wrt-installer -i /opt/usr/apps/.preinstallWidgets/GoogleMaps.wgt;
fi

%postun
    wrt-installer -un intelPoc??.GoogleMaps

%files
%defattr(-,root,root,-)
/opt/usr/apps/.preinstallWidgets/GoogleMaps.wgt
