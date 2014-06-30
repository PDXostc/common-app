all:
	cd  HomeScreen && make

clean:
	cd HomeScreen && make clean
	cd Boilerplate && make clean
	cd Browser && make clean
	cd Leap && make clean
	cd GestureGame && make clean

install:
	cd HomeScreen && make install

