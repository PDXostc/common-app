PROJECT = html5_UI_POC

VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

INSTALL_FILES = News.wgt
INSTALL_DIR = ${DESTDIR}/opt/usr/apps/.preinstallWidgets

all: common
	zip -r News.wgt config.xml css icon.png index.html js images

clean:
	rm -rf js/services
	rm -rf css/car
	rm -rf css/user
	rm -f News.wgt

common: ../_common
	cp -r ../_common/js/* js/
	cp -r ../_common/css/* css/

../_common:
	echo "Please checkout Common Assests"
	exit 1
