Name:       cameras-xwalk-extension
Summary:    JLRCameras extension for Tizen IVI
Version:    1.0.1
Release:    1
Group:      Development/Libraries
License:    Apache-2.0
Source0:    %{name}-%{version}.tar.gz

BuildRequires:  pkgconfig(dpl-efl)
BuildRequires:  pkgconfig(dpl-event-efl)
BuildRequires:  dleyna
BuildRequires:  expat-devel
BuildRequires:  cmake
BuildRequires:  gettext-devel
BuildRequires:  boost-devel
BuildRequires:  boost-thread
BuildRequires:  boost-system
BuildRequires:  boost-filesystem
BuildRequires:  pkgconfig(json-glib-1.0)
Requires:       speech-recognition
Requires:       crosswalk

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
%define PREFIX "%{_libdir}/tizen-extensions-crosswalk"

export LDFLAGS+="-Wl,--rpath=%{PREFIX} -Wl,--as-needed"

cmake cameras_ext/ -DCMAKE_INSTALL_PREFIX=%{_prefix} -DDPL_LOG="ON" -DENABLE_TIME_TRACER="OFF"

make %{?jobs:-j%jobs} VERBOSE=1

%install
rm -rf %{buildroot}
%make_install

%post

%postun


%files
%{_libdir}/tizen-extensions-crosswalk/*
/usr/etc/tizen-apis/*

%files devel
%{_includedir}/*
%{_libdir}/pkgconfig/*
