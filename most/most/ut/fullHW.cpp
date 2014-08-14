/**
* Google Test based unit tests for Optolyzer/MOST. This set of tests requires both Optoilyzer and MOST 
hardware to be connected and powerd on. 
*/

#include <stdlib.h>
#include <unistd.h>
#include <limits.h>
#include <algorithm>
#include "gtest/gtest.h"
#include "utOL.h"
#include "AudioMost.h"
#include <termios.h>

using namespace DeviceAPI;
using namespace Most;
using namespace std;


// Invoked by serialReadThrd when a message arrives from Optolyzer.
class MyCB : public OptolyzerRecvCB
{
	public:

    void userCB(string& recvStr, int status, void* data)
    {
		int foo = sizeof(data);
		foo++;
		status++;

		static int cnt=0;
		cnt++;

		// Save all response from Optolyzer.
		responses.push_back(recvStr);

		printf("REC(%d): %s", recvStr.size(), recvStr.c_str());
    }

	vector<string> responses;

    virtual bool filter( string& )
    {
//         return true; // filter all.
         return false; // filter none.
    }

};


// Google Test test fixture class; sets up OptolyzerImpl object used by
// most of the unit tests.
class OptolyzerImplTestFull : public OptolyzerImplTest
{
	public:

	OptolyzerImplTestFull() 
	{}
	void SetUp()
	{
		try {

				printf("creating OptolyzerImplTestFull \n");
				OptolyzerImpl::create(*(new string("/dev/ttyS0")), OptolyzerImplTest::cmds);

				OptolyzerImpl::addRecvCB(mycb);

		}
		catch (OptolyzerImpl::CtorFails )
		{
			printf("OptolyzerImpl ctor failed!!! Exiting.\n");
			exit(-1);
		}
	}

	// Used to provide additional or non-default init commands for Optolyzer.

	static MyCB mycb;	// Callback class for received commands.
	static int instanceCnt;


	// The Audio Most object. Needs an OptolyzerImpl passed in to its ctor.
//	AudioMostImpl& am;

};
MyCB OptolyzerImplTestFull::mycb;	// Callback class for received commands.


TEST_F(OptolyzerImplTestFull, InitMost)
{
	printf("OK1\n");
	AudioMostImpl am(OptolyzerImpl::instance());
	printf("OK2\n");

	//OptolyzerImpl::instance().setWait(100000);
	string s1("+87000FFF018600220046D0090100D8D8D8D8D8D8D8\r\n");
	string s2("+87010FFF018000C00410120101\r\n");
	string s3("+87020FFF0186002200111206010000010203\r\n");
	am.send(s1, 200000); // Adding explicit wait time now since OptolyzerImpl sets default to 1 after init.
	am.send(s2, 200000);
	am.send(s3, 200000);

	sleep(2);
	bool found=false;

	// Look for a *470250 in response:
	for_each(OptolyzerImplTestFull::mycb.responses.begin(), OptolyzerImplTestFull::mycb.responses.end(),
		[&found](string str) {
			if( str.find("*470250", 0, 7) != string::npos )  // After power up.
			{
				found = true;
			}
			else if( str.find("*470050", 0, 7) != string::npos ) // After already init.
			{
				found = true;
			}
		}
	);
	ASSERT_TRUE(found);
}
TEST_F(OptolyzerImplTestFull, setToneBass)
{
	AudioMostImpl am(OptolyzerImpl::instance());

	ASSERT_TRUE(am.setTone("bass", -10, 10));

}

