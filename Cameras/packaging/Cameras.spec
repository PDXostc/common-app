Name:       Cameras
Summary:    A HTML5 application for controlling multiple cameras
Version:    0.0.1
Release:    1
Group:      Applications/System
License:    Apache-2.0
URL:        http://www.tizen.org
Source0:    %{name}-%{version}.tar.bz2
BuildRequires:  common
BuildRequires:  zip
BuildRequires:  pkgconfig(libtzplatform-config)

BuildArchitectures: noarch

%description
A HTML5 application for controlling multiple cameras such as IP, Analog, and USB

%prep
%setup -q

%build
make wgtPkg

%install
rm -rf %{buildroot}
%make_install

%post

%postun

%files
%defattr(-,root,root,-)
%manifest %{name}.manifest
/opt/usr/apps/.preinstallWidgets/%{name}.wgt
