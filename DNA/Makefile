PROJECT = DNA
INSTALL_FILES = images js icon.png index.html

VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

SEND := ~/send

wgtPkg:
	zip -r $(PROJECT).wgt config.xml css icon.png index.html js images common
	@echo -e '\e[0;31m'
	@[ -f ~/send ] && send $(PROJECT).wgt || sleep 0
	@echo -e '\e[0m'
clean:
	rm $(PROJECT).wgt
