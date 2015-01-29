CC=gcc
CFLAGS=-c -Wall

#All the header file locations should come here
INC_GLIB=/usr/include/glib-2.0/
INC_GLIBCONFIG=/usr/lib/glib-2.0/include/
INC_LIBUSB=/usr/include/libusb-1.0/

INC_DIR=-I./inc -I/usr/include -I$(INC_GLIB) -I$(INC_GLIBCONFIG) -I$(INC_LIBUSB)

#All Library directories
LIB_DIR=-L/usr/lib -L.
LDFLAGS=-lfprint -lm -lusb-1.0 -lnss3 -lnssutil3 -lsmime3 -lssl3 -lplds4 -lplc4 -lnspr4 -lgthread-2.0 -lrt -lgdk_pixbuf-2.0 -lgobject-2.0 -lglib-2.0

# The sources should get defined below
SOURCES=fp_if.c
#SOURCES=fp_if.c main.c

# The object files
OBJECTS=$(SOURCES:.c=.o)

# The executable to be generated
EXECUTABLE=libfpif.so

all: $(SOURCES) $(EXECUTABLE)

$(EXECUTABLE): $(OBJECTS)
	$(CC) $(OBJECTS) -fPIC -shared -Wl,-soname,libfpif.so.0 -o $@ $(INC_DIR) $(LIB_DIR) $(LDFLAGS)

.c.o:
	$(CC) -fPIC $< -o $@ $(CFLAGS) $(INC_DIR) $(LIB_DIR) $(LDFLAGS)

clean:
	rm -rfv $(OBJECTS)
	rm $(EXECUTABLE)
