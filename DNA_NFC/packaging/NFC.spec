Name: NFC
Summary: A proof of concept HTML5 UI for the Tizen NFC API
Version: 0.0.1
Release: 1
Group: Applications/System
License: Apache-2.0
URL: http://www.tizen.org
Source0: %{name}-%{version}.tar.bz2
BuildRequires: common
BuildRequires: zip
BuildRequires:  desktop-file-utils
Requires:   wrt-installer
Requires:   wrt-plugins-ivi


%description
A proof of concept HTML5 UI for the Tizen NFC API

%prep
%setup -q -n %{name}-%{version}

%build
cd wgt;
make wgtPkg

%install
cd wgt;
%make_install

%post
if [ -f /opt/usr/apps/.preinstallWidgets/preinstallDone ]; then
	    wrt-installer -i /opt/usr/apps/.preinstallWidgets/NFC.wgt;
fi

%postun
wrt-installer -un intelPoc22.NFC

%files
%defattr(-,root,root,-)
/opt/usr/apps/.preinstallWidgets/NFC.wgt
