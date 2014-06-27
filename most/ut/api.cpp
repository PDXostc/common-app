
/**
* Google Test based unit tests for MOST highlevel api. This set of tests requires both Optoilyzer and MOST 
hardware to be connected and powerd on. 
*/

#include <stdlib.h>
#include <unistd.h>
#include <limits.h>
#include <algorithm>
#include <vector>
#include "gtest/gtest.h"
#include "utOL.h"
#include "Optolyzer.h"
#include "AudioMost.h"
#include "ControlDesc.h"
#include <termios.h>

using namespace DeviceAPI;
using namespace Most;
using namespace std;


// Invoked by serialReadThrd when a message arrives from Optolyzer.
class CurrentVolume : public OptolyzerRecvCB
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
class TestAPI : public OptolyzerImplTest
{
	public:

	TestAPI()
	{}

	void SetUp()
	{
		try {

				OptolyzerImpl::create(*(new string("/dev/ttyS0")), OptolyzerImplTest::cmds);

			//	OptolyzerImpl::addRecvCB(mycb);

		}
		catch (OptolyzerImpl::CtorFails )
		{
			printf("OptolyzerImpl ctor failed!!! Exiting.\n");
			exit(-1);
		}
	}

//	AudioMostImpl am;


};


TEST_F(TestAPI, InitMost)
{
	AudioMostImpl am(OptolyzerImpl::instance());

	// OptolyzerImpl should not be needing initialization at this point.
	ASSERT_FALSE(OptolyzerImpl::instance().needInit());
	//am.setTone(string("volume"), 6);
}
TEST_F(TestAPI, setToneVolume)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.setTone(string("volume"), 230, 0));
}
TEST_F(TestAPI, setToneIncr)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.setTone(string("volume"), 0, 5));
}
TEST_F(TestAPI, setToneQuiet)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.setTone(string("volume"), 190, 0));
}
TEST_F(TestAPI, setToneTreble)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.setTone(string("treble"), 12, 0));
}
TEST_F(TestAPI, setBalanceFade)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.setBalance(string("fade"), 10, 0));
}
TEST_F(TestAPI, setBalanceBalance)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.setBalance(string("balance"), 10, 0));
}
TEST_F(TestAPI, setToneRangeVolume)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.setBalanceRange(string("volume"), -6, 6));
}
TEST_F(TestAPI, setToneRangeVolumeIn)
{
	// Set volume within the current range limits.
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.setTone(string("volume"), -3, 0));
}
TEST_F(TestAPI, setToneRangeVolumeOut)
{
	// Set volume outside the current range limits.
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_FALSE(am.setTone(string("volume"), 7, 0));
}
TEST_F(TestAPI, setBalanceRange)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.setBalanceRange(string("fade"), -6, 6));
}
TEST_F(TestAPI, setToneRangeBalanceIn)
{
	// Set fade within the current range limits.
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.setTone(string("fade"), 3, 0));
}
TEST_F(TestAPI, setToneRangeBalanceOut)
{
	// Set fade outside the current range limits.
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_FALSE(am.setTone(string("fade"), -7, 0));
}
TEST_F(TestAPI, setBalanceIncr)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.setBalanceRange(string("fade"), 0, -8));
}
TEST_F(TestAPI, setSurround)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.setSurround(string("dolby2D"), true));
}
TEST_F(TestAPI, setGeneral1)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.set(string("volume"), 3, 0));
}
TEST_F(TestAPI, setGeneral2)
{
	// Expected to fail, since string parameter for volume is not yet supported.
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_FALSE(am.set(string("volume"), string("mode")));
}
TEST_F(TestAPI, setGeneral3)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	ASSERT_TRUE(am.set(string("volume"), 0, 2));
}
TEST_F(TestAPI, sendCmdString)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	string str("+87000FFF032200220020320108\r\n");  // Actual treble cmd string.
	ASSERT_NE(0, am.send(str, 100));
}

TEST_F(TestAPI, ControlDescGet)
{
	AudioMostImpl am(OptolyzerImpl::instance());

	ControlDesc* volDesc = am.getDescriptor("volume");

	ASSERT_NE(0, (int)volDesc);
	//ASSERT_FALSE(am.setTone(string("volume"), 12)); // Should fail after bounds are +/- 8
}
TEST_F(TestAPI, ControlDescGetBad)
{
	AudioMostImpl am(OptolyzerImpl::instance());

	ControlDesc* volDesc = am.getDescriptor("blrfge");

	ASSERT_EQ(0, (int)volDesc);
}
TEST_F(TestAPI, ControlDescSet)
{
	AudioMostImpl am(OptolyzerImpl::instance());

	ControlDesc* volDesc = am.getDescriptor("volume");

	ASSERT_NE(0, (int)volDesc);

	string builtCmd = volDesc->set(-2);

	ASSERT_NE(0, builtCmd.size());
	//ASSERT_FALSE(am.setTone(string("volume"), 12)); // Should fail after bounds are +/- 8
}
TEST_F(TestAPI, ControlDescSetMode)
{
	AudioMostImpl am(OptolyzerImpl::instance());

	ControlDesc* dolbyDesc = am.getDescriptor("dolby2D");

	ASSERT_NE(0, (int)dolbyDesc);

	string builtCmd = dolbyDesc->set(true, "abc");

	ASSERT_NE(0, builtCmd.size());
	//ASSERT_FALSE(am.setTone(string("volume"), 12)); // Should fail after bounds are +/- 8
}

TEST_F(TestAPI, getVolume)
{
	AudioMostImpl am(OptolyzerImpl::instance());
	string curVol = am.curValue("volume");
	cout << "curVol = " << curVol << endl;
}





