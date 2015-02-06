Name:       fingerprint
Summary:    An extension for the usage of biometric scanners
Version:    0.0.1
Release:    1
Group:      Development/Libraries
License:    Apache-2.0
URL:        http://www.tizen.org2
Source0:    %{name}-%{version}.tar.bz2

BuildRequires:  python
BuildRequires:  desktop-file-utils
BuildRequires:  pkgconfig(dpl-efl)
BuildRequires:  pkgconfig(json-glib-1.0)
BuildRequires:  libusb-devel
BuildRequires:	boost-devel
BuildRequires:  gdk-pixbuf-devel
BuildRequires:  nss-devel

%global plugin_list extension_common fingerprint_ext

%description
This is an extension that allows the usage of biometric scanners within Tizen

%prep
%setup -q -n %{name}-%{version}

%build
cd fingerprint_ext/src/thirdparty/libfprint/libfprint-0.5.1
./configure
make
cp -av ./libfprint/.libs/libfprint.so* %{_builddir}/%{name}-%{version}/fingerprint_ext/src/thirdparty
cd %{_builddir}/%{name}-%{version}/fingerprint_ext/src/thirdparty
make
cd %{_builddir}/%{name}-%{version}
for plugin in %{plugin_list}; do
    make -C ${plugin}
done

%install
cd %{_builddir}/%{name}-%{version}/fingerprint_ext
mkdir -p %{buildroot}%{_libdir}
cp -av src/thirdparty/libfprint.so* %{buildroot}%{_libdir}/
cp -r src/thirdparty/libfpif.so %{buildroot}%{_libdir}/
mkdir -p %{buildroot}%{_includedir}/fingerprint
cp -r src/thirdparty/inc/* %{buildroot}%{_includedir}/fingerprint
mkdir -p %{buildroot}/lib/udev/rules.d/
cp -r src/thirdparty/40-libfprint0.rules %{buildroot}/lib/udev/rules.d/
cd %{_builddir}/%{name}-%{version}
for plugin in %{plugin_list}; do
    make -C ${plugin} install DESTDIR=%{buildroot} PREFIX=%{_prefix}
done

%post
ldconfig

%postun
ldconfig

%files
/lib/udev/rules.d/40-libfprint0.rules
%{_includedir}/fingerprint/*
%{_libdir}/libfpif.so
%{_libdir}/libfprint.so*
%{_libdir}/tizen-extensions-crosswalk/libfingerprint.so
