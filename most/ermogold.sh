#
rpm --erase wrt-plugins-ivi-most-devel-0.8.6-1.i586
rpm --erase wrt-plugins-ivi-most-0.8.6-1.i586

cp /usr/src/packages/RPMS/i586/wrt-plugins-ivi-most-0.8.6-1.i586.rpm.gold /usr/src/packages/RPMS/i586/wrt-plugins-ivi-most-0.8.6-1.i586.rpm
cp /usr/src/packages/RPMS/i586/wrt-plugins-ivi-most-devel-0.8.6-1.i586.rpm.gold /usr/src/packages/RPMS/i586/wrt-plugins-ivi-most-devel-0.8.6-1.i586.rpm

rpm --install /usr/src/packages/RPMS/i586/wrt-plugins-ivi-most-0.8.6-1.i586.rpm
rpm --install /usr/src/packages/RPMS/i586/wrt-plugins-ivi-most-devel-0.8.6-1.i586.rpm
