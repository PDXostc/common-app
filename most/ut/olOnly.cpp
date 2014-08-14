/**
* Google Test unit test for Optolyzer; does not require MOST to be present.
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
};


// Google Test test fixture class; sets up OptolyzerImpl object used by
// most of the unit tests.
class OptolyzerImplTestOL : public OptolyzerImplTest
{
	public:

	OptolyzerImplTestOL() 
	{}
	void SetUp()
	{
		try {

				printf("creating OptolyzerImplTestOL \n");
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
MyCB OptolyzerImplTestOL::mycb;	// Callback class for received commands.


/**
* Check that a string of the form 222BC3070111051206, length 21, is received as the first
* (or among the first) status responses from Optolyzer.
*/
TEST_F(OptolyzerImplTestOL, ReceiveSNR)
{
	// Make sure we are initialized.
	OptolyzerImpl::instance();
	bool found=false;

	// This sleep is a kludge; better to not need it.
	sleep(2);

	// Check that at least one status message has arrived,
	// and that it is a time stamp message.
	ASSERT_TRUE(OptolyzerImplTestOL::mycb.responses.size() > 0);

	for_each(OptolyzerImplTestOL::mycb.responses.begin(), OptolyzerImplTestOL::mycb.responses.end(),
		[&found](string str) {
			if( str.find("*98", 0, 3) != string::npos )
			{
				found = true;
			}
		}
	);
	ASSERT_TRUE(found);

}

TEST_F(OptolyzerImplTest, needInit)
{
	// OptolyzerImpl should not be needing initialization at this point.
	ASSERT_FALSE(OptolyzerImpl::instance().needInit());
}

// Send a command string with bad syntax and confirm that the mute
// command response is >>not<< seen.
// ***NOTE*** These failure tests are performed before the sendMute test so that
// the entire mycb.responses array can be scanned for results. Don't move
// the sendMute test in front of these, lest the failure tests become unable to operate correctly.
TEST_F(OptolyzerImplTest, sendMuteFails)
{

	OptolyzerImpl& ol=OptolyzerImpl::instance();

	string muteCmd="+4102\r\n";  // Improper mute command syntax.
	bool found=false;

	ol.send(muteCmd);

	// Give response from Optolyzer some time to arrive.
	sleep(2);

	for_each(OptolyzerImplTestOL::mycb.responses.begin(), OptolyzerImplTestOL::mycb.responses.end(),
		[&muteCmd, &found](string str) {
			// A little funky: compare the response strings starting from char[1],
			// against the command string sent also offset by 1, to  avoid
			// comparing '*' in the response to '+' in the command.
			if( str.find(muteCmd.c_str()+1, 1, 4) != string::npos )
			{
				found = true;
			}
		}
	);

	ASSERT_FALSE(found);

}

// Send a command string with bad syntax and confirm that the
// error response is  seen.
TEST_F(OptolyzerImplTest, sendMuteFails2)
{

	OptolyzerImpl& ol=OptolyzerImpl::instance();

	string muteCmd="+4102\r\n";  // Improper mute command syntax.
	bool found=false;

	ol.send(muteCmd);

	// Give response from Optolyzer some time to arrive.
	sleep(2);

	for_each(OptolyzerImplTestOL::mycb.responses.begin(), OptolyzerImplTestOL::mycb.responses.end(),
		[&muteCmd, &found](string str) {
			// A little funky: compare the response strings starting from char[1],
			// against the command string sent also offset by 1, to  avoid
			// comparing '*' in the response to '+' in the command.

			if( str.find("*6941", 0, 5) != string::npos )
			{
				found = true;
			}
		}
	);

	ASSERT_TRUE(found);

}
TEST_F(OptolyzerImplTest, sendMute)
{

	OptolyzerImpl& ol=OptolyzerImpl::instance();

	string muteCmd="+4100\r\n";
	bool found=false;

	ol.send(muteCmd);

	// Give response from Optolyzer some time to arrive.
	sleep(2);

	for_each(OptolyzerImplTestOL::mycb.responses.begin(), OptolyzerImplTestOL::mycb.responses.end(),
		[&muteCmd, &found](string str) {
			// A little funky: compare the response strings starting from char[1],
			// against the command string sent also offset by 1, to  avoid
			// comparing '*' in the response to '+' in the command.
			if( str.find(muteCmd.c_str()+1, 1, 4) != string::npos )
			{
				found = true;
			}
		}
	);

	ASSERT_TRUE(found);

}




