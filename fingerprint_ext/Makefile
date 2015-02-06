
all: lib themes

install:
	make -C src install

lib:
	make -C src

themes:
	make -C themes

clean:
	make -C src clean

test: api

api:
	make -C api


.PHONY: all prepare clean
