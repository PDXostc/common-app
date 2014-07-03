all:
	cd  HomeScreen && make

deploy:
	cd HomeScreen && make deploy
	cd Browser && make deploy
	cd Boilerplate && make deploy

clean:
	cd HomeScreen && make clean
	cd Boilerplate && make clean
	cd Browser && make clean
	cd Leap && make clean
	cd GestureGame && make clean

install:
	cd HomeScreen && make install

