
all: lib

install: lib
	make -C src install

test: api

lib: 
	make -C src

api:
	make -C ut api

clean:
	make -C src clean
	make -C ut clean


.PHONY: all prepare clean

