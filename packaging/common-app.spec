Name:       common-apps
Summary:    A HTML Common Components
Version:    0.0.1
Release:    1
Group:      Applications/System
License:    ASL 2.0
URL:        http://www.tizen.org2
Source0:    %{name}-%{version}.tar.bz2

BuildRequires:  desktop-file-utils


%description
A HTML Common Componets for Web Apps

%prep
%setup -q -n %{name}-%{version}

%build
make

%install
#rm -rf %{buildroot}
%make_install

%files
%defattr(-,root,root,-)
/opt/usr/apps/common-apps/*
