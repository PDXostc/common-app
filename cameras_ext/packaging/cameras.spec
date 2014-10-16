Name:       cameras-xwalk-extension
Summary:    JLRCameras extension for Tizen IVI
Version:    1.0.1
Release:    1
Group:      Development/Libraries
License:    Apache-2.0
Source0:    %{name}-%{version}.tar.gz

BuildRequires:  cmake
BuildRequires:	python
BuildRequires:  pkgconfig(gio-2.0)
BuildRequires:  pkgconfig(glib-2.0)
BuildRequires:  pkgconfig(dbus-glib-1)
BuildRequires:  pkgconfig(json-glib-1.0)
Requires:  crosswalk

%description
JLRCameras extension for Crosswalk.

%package devel
Summary:    cameras-xwalk-extension development headers
Group:      Development/Libraries
Requires:   %{name} = %{version}

%description devel
cameras project crosswalk extension development headers

%prep
%setup -q

%build
%{__python} %{_builddir}/%{name}-%{version}/extension_tools/generate_api.py %{_builddir}/%{name}-%{version}/cameras_ext/src/cameras_api.js kSource_cameras_api %{_builddir}/%{name}-%{version}/cameras_ext/src/cameras_api.cc
%define PREFIX "%{_libdir}/tizen-extensions-crosswalk"

export LDFLAGS+="-Wl,--rpath=%{PREFIX} -Wl,--as-needed"

cmake ./cameras_ext -DCMAKE_INSTALL_PREFIX=%{_prefix} -DENABLE_TIME_TRACER="OFF"

make %{?_smp_mflags} VERBOSE=1

%install
rm -rf %{buildroot}
%make_install

%post

%postun


%files
%{_libdir}/tizen-extensions-crosswalk/*

%files devel
%{_includedir}/*
%{_libdir}/pkgconfig/*
