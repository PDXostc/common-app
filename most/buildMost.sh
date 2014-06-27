#
# Build the plugin into a RPM package that be installed on the NDIS
rm -fr ../wrt-plugins-ivi-most-0.8.6
mkdir ../wrt-plugins-ivi-most-0.8.6
cp -r * ../wrt-plugins-ivi-most-0.8.6

pushd ../wrt-plugins-ivi-most-0.8.6
rm -fr CMakeCache.txt CMakeFiles cmake_install.cmake Makefile
cd ..
tar czf wrt-plugins-ivi-most-0.8.6.tar.gz wrt-plugins-ivi-most-0.8.6

mv wrt-plugins-ivi-most-0.8.6.tar.gz /usr/src/packages/SOURCES/

popd
cd packaging
rpmbuild -ba wrt-plugins-ivi-most.spec
cd ..
rm -fr ../wrt-plugins-ivi-most-0.8.6


