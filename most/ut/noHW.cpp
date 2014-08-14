/**
* Google Test based unit tests for Optolyzer/MOST. This set of tests just tests the serial port configuration
* so does not require an Optolyzer nor MOST hardware.
*/

#include <stdlib.h>
#include <unistd.h>
#include <limits.h>
#include "gtest/gtest.h"
#include "utOL.h"
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

		printf("REC(%d): %s", recvStr.size(), recvStr.c_str());
    }
};

/* Force create() throw an exception.
*/
//class OptolyzerImplTestCreateFails : public ::testing::Test
class OptolyzerImplTestCreateFails
{
	public:

	OptolyzerImplTestCreateFails()
	{}

	virtual void SetUp()
	{
		// Create a non-empty command list so that default won't be sent to serial port.
		// This should fail, since there won't be a tty device so named:
		OptolyzerImpl::create(*(new string("/dev/ttyS99aq7")), cmds);
	}

	// Used to provide additional or non-default init commands for Optolyzer.
    vector<StringAndDelay> cmds = {{"empty command", 1000}};
};

// Test that create being passed a bad tty device will throw.
TEST(OptolyzerImplTestCreateFails, CreatedFail)
{
	OptolyzerImplTestCreateFails badObject;
	bool exceptionOccured=false;

	try {
		badObject.SetUp();
	}

	catch (OptolyzerImpl::CtorFails )
	{
		exceptionOccured=true;
	}
	ASSERT_TRUE(exceptionOccured);

}

// Test creation of singleton OptolyzerImpl.
TEST_F(OptolyzerImplTest, Created)
{
 	ASSERT_NO_THROW(OptolyzerImpl::instance());
}

// Test fetch of instance after singleton already created.
TEST_F(OptolyzerImplTest, Created2)
{
	ASSERT_NO_THROW(OptolyzerImpl::instance());
}


TEST_F(OptolyzerImplTest, GoodTTYsettings)
{
	// Test that the tty port settings are as expected.
	OptolyzerImpl& ol = OptolyzerImpl::instance();

	ASSERT_NE(ol.getPort(), -1);

	 // Setup tty speed and modes:
        struct termios settings;
	int stat = tcgetattr(ol.getPort(), &settings);

	printf("%o  %o  %o\n", settings.c_cflag & 00010000, settings.c_cflag & 00000010, settings.c_cflag & 07);
	// Set to 115200 baud?
	printf("Checking baud rate == 115200:\n");
	ASSERT_TRUE( (settings.c_cflag & 00010000) && ((settings.c_cflag & 07) == 2));

	printf("Checking IXON=0, INLCR=1, ECHO=0, IGNCR=0:\n");
	ASSERT_FALSE( settings.c_iflag & IXON ); 
	ASSERT_TRUE( settings.c_iflag & INLCR ); 
	ASSERT_FALSE( settings.c_iflag & ECHO ); 
	ASSERT_FALSE( settings.c_iflag & IGNCR ); 

}

TEST_F(OptolyzerImplTest, wait)
{
	OptolyzerImpl::instance().setWait(59);
	ASSERT_TRUE(OptolyzerImpl::instance().getWait() == 59);

	OptolyzerImpl::instance().setWait(3);
	ASSERT_TRUE(OptolyzerImpl::instance().getWait() == 3);
}

TEST_F(OptolyzerImplTest, needInit)
{
	// OptolyzerImpl will be staying in the "needs initialization" state
	// since we never get back a time/datestamp from the Optolyzer.
	// ***NOTE*** if you run this after the other unit tests that initialize
	// the Optolyzer, or after running a widget app that use the Optolyzer,
	// then this test will fail.
	printf("Failure expected if you are connected to the Optolyzer and it has been previously initialized.\n");
	ASSERT_TRUE(OptolyzerImpl::instance().needInit());
}


