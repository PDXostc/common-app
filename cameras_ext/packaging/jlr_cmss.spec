#
# JLR Cameras Media Streaming Server spec file
#

Name:           jlr_cmss
Version:        1.0.2
Release:        1
Group:          Multimedia/Service
License:    	Apache-2.0
Summary:        JLR Cameras Media Streaming Server
Source0:        %{name}.tar.gz
BuildRoot:      %{_tmppath}/%{name}-%{version}-%{release}-root

BuildRequires:  pkgconfig(glib-2.0)
BuildRequires:  pkgconfig(dbus-1)
BuildRequires:  pkgconfig(dbus-glib-1)
BuildRequires:  pkgconfig(gio-2.0)
BuildRequires:  libxml2
BuildRequires:  libxml2-devel
BuildRequires:  libv4l
BuildRequires:  libv4l-devel


%description
JLR Cameras Media Streaming Server

%prep
%setup -q

%build
unset LD_AS_NEEDED
cd cameras_ext/jlr_cmss
make 

%install
cd cameras_ext/jlr_cmss
mkdir -p %{buildroot}/sbin
make install DESTDIR=%{buildroot}

%post

%postun

%files
/sbin/jlr_cmss

%config
%{_sysconfdir}/jlr_cmss/config.xml
%{_datarootdir}/dbus-1/system-services/com.jlr.JLRCameras.service
%{_prefix}/lib/systemd/system/jlr_cmss.service

%changelog
* Mon Apr 07 2014 Alexander Nosov <Alexander.Nosov@symphonyteleca.com> - 1.0.2
- Changed cameras notification algorithm.
* Fri Mar 28 2014 Alexander Nosov <Alexander.Nosov@symphonyteleca.com> - 1.0.1
- Added cameras status change notifications.
* Mon Mar 21 2014 Alexander Nosov <Alexander.Nosov@symphonyteleca.com> - 1.0.0
- Changed "License" to "JLR-CLOSED".
* Mon Mar 17 2014 Alexander Nosov <Alexander.Nosov@symphonyteleca.com> - 0.0.1
- Initial version.
