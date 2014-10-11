PROJECT = DNA
INSTALL_FILES = images js icon.png index.html

VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

SEND := ~/send

wgtPkg:
	zip -r $(PROJECT).wgt config.xml css icon.png index.html js images common
clean:
	rm $(PROJECT).wgt
