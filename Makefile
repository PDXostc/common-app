all:
	cd  HomeScreen && make
	cd  Browser && make
	cd  Boilerplate && make

deploy:
	cd HomeScreen && make deploy TIZEN_IP=192.168.1.214
	cd Browser && make deploy TIZEN_IP=192.168.1.214
	cd Boilerplate && make deploy TIZEN_IP=192.168.1.214
	scp InstallWgts.sh root@192.168.1.214:/root/

clean:
	cd HomeScreen && make clean
	cd Boilerplate && make clean
	cd Browser && make clean
	cd Leap && make clean
	cd GestureGame && make clean

install:
	cd HomeScreen && make install

