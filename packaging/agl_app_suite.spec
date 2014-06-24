Name: agl_app_suite
Version: 0.0.1
Release: 1
Source: %{name}-%{version}.tar.bz2
Summary: A collection of demonstration apps.
Group: Applications/System
%description
This is a collection of HTML5/CSS3 demonstration apps for the tizen os.
BuildRequires:  zip
BuildRequires:  desktop-file-utils
Requires:  speech-recognition
Requires:   wrt-installer
Requires:   wrt-plugins-ivi


%prep
%setup -q -n %{name}-%{version}

%build
cd HomeScreen
make

%install
rm -rf %{buildroot}
cd HomeScreen
%make_install

%post
if [ -f /opt/usr/apps/.preinstallWidgets/preinstallDone ]; then
    wrt-installer -i /opt/usr/apps/.preinstallWidgets/HomeScreen.wgt;
fi

%postun
    wrt-installer -un intelPoc10.HomeScreen

%files
%defattr(-,root,root,-)
/opt/usr/apps/.preinstallWidgets/HomeScreen.wgt
