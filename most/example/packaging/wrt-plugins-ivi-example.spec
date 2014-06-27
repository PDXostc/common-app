Name:       wrt-plugins-ivi-example
Summary:    JavaScript plugin example access to WebRuntime
Version:    0.8.6
Release:    1
Group:      Development/Libraries
License:    Apache-2.0
Source0:    %{name}-%{version}.tar.gz

BuildRequires:  pkgconfig(ewebkit2)
BuildRequires:  pkgconfig(dpl-efl)
BuildRequires:  pkgconfig(dpl-event-efl)
BuildRequires:  pkgconfig(wrt-plugins-commons)
BuildRequires:  pkgconfig(wrt-plugins-commons-javascript)
BuildRequires:  wrt-plugins-tizen-devel
BuildRequires:  expat-devel
BuildRequires:  cmake
BuildRequires:  gettext-devel
BuildRequires:  pkgconfig(json-glib-1.0)

%description
JavaScript plugin to access Phone for WebRuntime

%package devel
Summary:    Wrt-plugins-ivi-example development headers
Group:      Development/Libraries
Requires:   %{name} = %{version}

%description devel
Wrt-plugins-ivi-example development headers

%prep
%setup -q

%build

%define PREFIX "%{_libdir}/wrt-plugins"

export LDFLAGS+="-Wl,--rpath=%{PREFIX} -Wl,--as-needed"

cmake . -DCMAKE_INSTALL_PREFIX=%{_prefix} -DDPL_LOG="ON" -DENABLE_TIME_TRACER="OFF"

make %{?jobs:-j%jobs} VERBOSE=1

%install
rm -rf %{buildroot}
%make_install

%post
wrt-installer -p

%postun

%files
%manifest wrt-plugins-ivi-example.manifest 
%{_libdir}/wrt-plugins/*
/usr/etc/tizen-apis/*

%files devel
%{_includedir}/*
%{_libdir}/pkgconfig/*
