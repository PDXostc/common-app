ECHO_CFLAGS=$(CFLAGS) -fPIC -Wall -std=c++0x 
SOURCES=src/AudioMost.cpp src/ControlDesc.cpp src/Most.cpp \
 src/Optolyzer.cpp src/most_extension.cpp src/most_instance.cpp src/most_api.cc common/extension.cc


all: libmost.so

most_api.cc:
	python tools/generate_api.py src/most_api.js kSource_most_api src/most_api.cc

libmost.so: prepare  most_api.cc
	$(CC) $(ECHO_CFLAGS) -shared -o build/libmost.so \
	$(SYSROOT_FLAGS) -I./ $(SOURCES)

prepare:
	mkdir -p build

install: libmost.so
	install -D build/libmost.so \
	$(DESTDIR)/$(PREFIX)/lib/tizen-extensions-crosswalk/libmost.so

clean:
	rm -Rf build
	rm src/most_api.cc

.PHONY: all prepare clean
