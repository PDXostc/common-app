
include ../Makefile.in

OBJS= \
	fingerprint_extension.o \
	fingerprint.o \
	fingerprint_api.o

TARGET=libfingerprint.so

TARGET_DIR=../../lib

LIB_DIRS=-L../../lib -Lthirdparty

LIBS=-Wl,--whole-archive -lextension-common -Wl,--no-whole-archive

CFLAGS:=$(CFLAGS) $(LIB_DIRS) $(LIBS) #`pkg-config --cflags glib-2.0`

all: $(TARGET)

$(TARGET): prepare $(OBJS)
	$(CC) $(CFLAGS) -fPIC -shared -o $@ -I./ $(OBJS) -lfpif
	cp -f $(TARGET) $(TARGET_DIR)

.cpp.o:
	$(CC) $(CFLAGS) -c -o $@  -I./ $<

.cc.o:
	$(CC) $(CFLAGS) -c -o $@  -I./ $<

fingerprint_api.cc:  fingerprint.js
	python ../../extension_tools/generate_api.py fingerprint.js \
		kSource_fingerprint_api fingerprint_api.cc

prepare:
	mkdir -p $(TARGET_DIR)

install: $(TARGET)
	install -D $(TARGET_DIR)/$(TARGET) \
		$(DESTDIR)$(PREFIX)/lib/tizen-extensions-crosswalk/$(TARGET)

clean:
	rm -f *.o *.so
	rm -f $(TARGET_DIR)/$(TARGET)
	rm -f fingerprint_api.cc

.PHONY: all prepare clean
