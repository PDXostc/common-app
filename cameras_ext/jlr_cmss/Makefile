# Define required macros here
SHELL = /bin/sh

MODULE = jlr_cmss
CC = gcc

all:
	${CC} ${CFLAGS} `pkg-config --cflags dbus-1 dbus-glib-1 glib-2.0` -c src/${MODULE}.c
	${CC} ${LDFLAGS} `pkg-config --libs dbus-1 dbus-glib-1 glib-2.0 libxml-2.0` -lpthread -lgio-2.0 -lv4l2 ${MODULE}.o -o ${MODULE}

clean:
	-rm -f *.o core *.core

.cpp.o: 
	${CC} ${CFLAGS} ${INCLUDES} -c $<

install:
	install -m 755 ${MODULE} -D ${DESTDIR}/sbin/${MODULE}
	install -m 644 config/config.xml -D ${DESTDIR}/etc/${MODULE}/config.xml
	install -m 644 service/com.jlr.JLRCameras.service -D ${DESTDIR}/usr/share/dbus-1/system-services/com.jlr.JLRCameras.service
	install -m 644 service/jlr_cmss.service -D ${DESTDIR}/usr/lib/systemd/system/jlr_cmss.service
