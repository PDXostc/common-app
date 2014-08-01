all:
	cd  HomeScreen && make
	cd  Browser && make
	cd  Boilerplate && make

deploy:
	cd HomeScreen && make deploy TIZEN_IP=192.168.6.53
	cd Browser && make deploy TIZEN_IP=192.168.6.53
	cd Boilerplate && make deploy TIZEN_IP=192.168.6.53
	scp InstallWgts.sh app@192.168.6.53:/home/app/

clean:
	cd HomeScreen && make clean
	cd Boilerplate && make clean
	cd Browser && make clean
	cd Leap && make clean
	cd GestureGame && make clean

install:
	cd HomeScreen && make install

