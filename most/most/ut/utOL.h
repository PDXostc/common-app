
#include <stdlib.h>
#include <unistd.h>
#include <limits.h>
#include "gtest/gtest.h"
#include "Optolyzer.h"

using namespace DeviceAPI;
using namespace Most;
using namespace std;

StringAndDelay EmptyCmd = {"empty command", 200};

// Google Test test fixture class; sets up OptolyzerImpl object used by
// most of the unit tests.
class OptolyzerImplTest : public ::testing::Test
{
	public:

	OptolyzerImplTest()
	{}

	virtual void SetUp()
	{
		try {

				// Create a non-empty command list so that default won't be sent to serial port.
			//	cmds.push_back(*(new string("empty command")));
				cmds.push_back(EmptyCmd);
				OptolyzerImpl::create(*(new string("/dev/ttyS0")), cmds);

		}
		catch (OptolyzerImpl::CtorFails )
		{
			printf("OptolyzerImpl ctor failed!!! Exiting.\n");
			exit(-1);
		}
	}
	// Used to provide additional or non-default init commands for Optolyzer.

    vector<StringAndDelay> cmds;

};
