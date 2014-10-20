PROJECT = DNA
INSTALL_FILES = images js icon.png index.html

VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

SEND := ~/send

wgtPkg:
	cp -rf ../DNA_common .
	zip -r $(PROJECT).wgt config.xml css icon.png index.html js images DNA_common
clean:
	rm $(PROJECT).wgt
	rm -rf DNA_common
