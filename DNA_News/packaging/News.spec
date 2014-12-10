Name:       News
Summary:    A HTML News application
Version:    0.0.1
Release:    1
Group:      Applications/System
License:    Apache 2.0
URL:        http://www.tizen.org2
Source0:    %{name}-%{version}.tar.bz2
BuildRequires:  zip
BuildRequires:  desktop-file-utils
Requires:  speech-recognition
Requires:   wrt-installer
Requires:   wrt-plugins-ivi

%description
A HTML News application for display public news feeds.

%prep
%setup -q -n %{name}-%{version}

%build

make wgtPkg

#make %{?jobs:-j%jobs}

%install
rm -rf %{buildroot}
%make_install

%post
if [ -f /opt/usr/apps/.preinstallWidgets/preinstallDone ]; then
    wrt-installer -i /opt/usr/apps/.preinstallWidgets/DNA_News.wgt;
fi

%postun
    wrt-installer -un JLRPOCX007.News

%files
%defattr(-,root,root,-)
/opt/usr/apps/.preinstallWidgets/DNA_News.wgt
