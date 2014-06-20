Name:       _common 
Summary:    Common files for widgets
Version:    0.0.1
Release:    1
Group:      Applications/System
License:    Apache 2.0
URL:        http://www.tizen.org
Source0:    %{name}-%{version}.tar.bz2

%description
Common files upon which the widget components depend during their build.

%prep
%setup -q -n %{name}-%{version}

%build
make

%install
rm -rf %{buildroot}
%make_install

%files
%defattr(-,root,root,-)
/opt/usr/apps/_common/*
