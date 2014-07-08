all:
	cd  HomeScreen && make

deploy:
	cd HomeScreen && make deploy TIZEN_IP=192.168.1.214
	cd Browser && make deploy TIZEN_IP=192.168.1.214
	cd Boilerplate && make deploy TIZEN_IP=192.168.1.214

clean:
	cd HomeScreen && make clean
	cd Boilerplate && make clean
	cd Browser && make clean
	cd Leap && make clean
	cd GestureGame && make clean

install:
	cd HomeScreen && make install

