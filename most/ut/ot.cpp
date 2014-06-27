#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/types.h>
#include <sys/stat.h>

// #include <thread>
#include "../src/Optolyzer.h"
#include "../src/AudioMost.h"

using namespace DeviceAPI;
using namespace Most;
using namespace std;

const char FIFOName[] = "/tmp/OptolyzerStatusFIFO";

class MyCB : public OptolyzerRecvCB
{
public:

	MyCB() {}
	 void userCB(string& recvStr, int status, void* data) 
	 { 
	 	printf("REC(%d): %s", recvStr.size(), recvStr.c_str());
	 }
};

int main(int argc, char* argv[] )
{

	// Pass in an empty array to force use of defaults.
	vector<StringAndDelay> cmds;
	string path("/dev/ttyS0");

	MyCB mycb;

	OptolyzerImpl::addRecvCB(mycb);

	if(argc > 1) 
	{

		struct stat sbuf;
		int s = -1;

		// FIFO does not yet exist.
/*
		while(s=stat(FIFOName, &sbuf))
		{
			printf("Waiting for FIFO creation.\n");
			sleep(1);
		}
			
		fflush(stdout);
		int fd = open(FIFOName, O_APPEND | O_RDWR );

		if( fd < 0 )
		{
			printf("CLIENT: Open of fifo fails.\n");
			exit (0);
		}

		char buff[44];

			printf("CLIENT: waiting for YES\n");
				write(fd, "??", 2);
*/
//				while(1)
//				{
/* OptolyzerImpl does this polling now.
 *
 */
				OptolyzerImpl::create(path, cmds);
					printf("Waiting for init state\n");
					OptolyzerImpl::instance();

					printf("Got instance\n");
					sleep(3);

	/*
					int cnt = read(fd, buff, 2);
					buff[2] = 0;
					if( cnt >= 2 )
					{
						printf("Reader: read from fifo: %s\n", buff);
	
						if( (buff[0] == 'Y') && (buff[1] == 'E'))
						{
							printf("Reader saw YES\n");
							write(fd, "??", 2);
							usleep(100000);
						}
						else
						{
							write(fd, "??", 2);
							usleep(400000);
						}
					}
//					usleep(100000);
 */

//				}

		exit(0);

	}

	OptolyzerImpl::create(path, cmds);

//	sleep(3);

	printf("pre instance call\n");
	AudioMostImpl am(OptolyzerImpl::instance());
	printf("After instance call\n");

/*
	printf("pre 2nd instance call\n");
	AudioMostImpl am2(OptolyzerImpl::instance());
	printf("After instance2 call\n");

	AudioMostImpl am3(OptolyzerImpl::instance());
	AudioMostImpl am4(OptolyzerImpl::instance());
	AudioMostImpl am5(OptolyzerImpl::instance());
*/
	string s1("+87000FFF018600220046D0090100B8B8B8B8B8B8B8\r\n");
	string s2("+87010FFF018000C00410120101\r\n");
	string s3("+87020FFF0186002200111206010000010203\r\n");
	am.send(s1, 0);
	am.send(s2, 0);
	am.send(s3, 0);

	sleep(2);
	printf("Exiting...\n");
	fflush(stdout);

	return 0;
}
