#
# Build the plugin into a RPM package that be installed on the NDIS
rm -fr wrt-plugins-ivi-example-0.8.6
cp -r example wrt-plugins-ivi-example-0.8.6

cd wrt-plugins-ivi-example-0.8.6
rm -fr CMakeCache.txt CMakeFiles cmake_install.cmake Makefile
cd ..
tar czf wrt-plugins-ivi-example-0.8.6.tar.gz wrt-plugins-ivi-example-0.8.6

cp wrt-plugins-ivi-example-0.8.6.tar.gz /usr/src/packages/SOURCES/

cd example/packaging
rpmbuild -ba wrt-plugins-ivi-example.spec


