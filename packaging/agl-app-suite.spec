Name:       agl-app-suite	
Summary:    A collection of IVI software
Version:    0.0.1
Release:    2
Group:      Applications/Web Applications
License:    Apache-2.0
URL:        http://www.tizen.org2
Source0:    %{name}-%{version}.tar.bz2

BuildRequires:  zip
BuildRequires:  desktop-file-utils

Requires:       media-manager
# Install requires existence of app user, who is created in meta-ivi
Requires:       meta-ivi

%description
A collection of IVI software

%prep

%setup -q -n %{name}-%{version}

%build
make "OBS=1" apps

%install
make "OBS=1" install_obs DESTDIR="%{?buildroot}"
mkdir -p %{?buildroot}%{_bindir}
mkdir -p %{?buildroot}%{_unitdir_user}
mkdir -p %{?buildroot}%{_unitdir_user}/tizen-user-middleware.target.wants/
mkdir -p %{?buildroot}/home
mkdir -p %{?buildroot}/home/app
install -m 0755 systemd/DNA_launcher.sh %{?buildroot}%{_bindir}
install -m 0644 systemd/DNA_Homescreen* %{?buildroot}%{_unitdir_user}
install -m 0755 app_install.sh %{?buildroot}/home/app/
#install -m 0644 weston-genivi.ini %{?buildroot}/home/app/
ln -sf %{_unitdir_user}/DNA_Homescreen-launchpad-ready.path %{?buildroot}%{_unitdir_user}/tizen-user-middleware.target.wants/

%post
#for app in /opt/usr/apps/.preinstallWidgets/*.wgt; do
#	su app -c'xwalkctl -i '${app}'';
#done
for app in /opt/usr/apps/.preinstallWidgets/*.wgt; do
    su app -c "pkgcmd -i -t wgt -p $app -q"
done


%preun
for app in `su app -c "pkgcmd -l | grep JLRPOCX" | awk -F ' ' '{print substr($6,2,length($6)-2)}'`; do
    su app -c "pkgcmd -u -n $app -q"
done

%files
%defattr(-,root,root,-)
/opt/usr/apps/.preinstallWidgets/*.wgt
/home/app/app_install.sh
#/home/app/weston-genivi.ini
%{_bindir}/DNA_launcher.sh
%{_unitdir_user}/DNA_Homescreen-launchpad-ready.path
%{_unitdir_user}/tizen-user-middleware.target.wants/DNA_Homescreen-launchpad-ready.path
%{_unitdir_user}/DNA_Homescreen.service

