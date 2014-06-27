/* Copyright (C) 2014 Jaguar Land Rover - All Rights Reserved
*
* Proprietary and confidential
* Unauthorized copying of this file, via any medium, is strictly prohibited
*
* THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY 
* KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
* PARTICULAR PURPOSE.
*
* Filename:	 Most.cpp
* Version:              1.0
* Date:                 Feb. 2014
* Project:              
* Contributors:         
*                       
*
* Incoming Code:        
*
*/

/*
 * This is the implementation of the C++ interface to the MOST WRT plugin. It is made accessible to the
 * widget application through
 * the intermediation of the bridge code in JSMost.cpp and .h. Essentially, the members of tizen.most
 * visible in the widget application JavaScript will correspond with the member functions defined here.
 *
 * MostMaster makes use of the OptolyzerImpl singleton to access the serial port for sending commands to
 * the MOST hardware.
 */

#include "Most.h"
#include <gio/gio.h>
#include <stdexcept>
#include <Logger.h>

#include <Commons/ThreadPool.h>
#include <CommonsJavaScript/Converter.h>
#include <json-glib/json-gvariant.h>

#include <stdlib.h>
#include <unistd.h>
#include <syslog.h>

#include "Optolyzer.h"
#include "AudioMost.h"


#define TIZEN_PREFIX            "org.tizen"
#define PHONE_SERVICE           TIZEN_PREFIX ".phone"
#define PHONE_IFACE             TIZEN_PREFIX ".Phone"
#define PHONE_OBJ_PATH          "/"

#define DEFAULT_PINCODE         "123456"
#define DEFAULT_PASSKEY          123456

namespace DeviceAPI
{
namespace Most
{

// Mainly a debug mechanism; this callback class prints to the console any messages received
// from the Optolyzer.
class MyCB : public OptolyzerRecvCB
{
public:
     void userCB(string& recvStr, int status, void* data)
     {
		  // TODO: dynamically enable/disable this.
          // LoggerE("REC(" << recvStr.size() << "): " <<  recvStr.c_str());
     }
};

using namespace WrtDeviceApis::Commons;
using namespace WrtDeviceApis::CommonsJavaScript;

static	MyCB mycb;

AudioMostImpl* am=0;

/**
 * This class is the top level of the native WRT plugin. It's only duties are to create the
 * OptolyzerImpl singleton and pass on strings received in sendCmd to the OptolyzerImpl
 * send() function.
 */
MostMaster::MostMaster()
{
    syslog(LOG_USER | LOG_DEBUG, "MostMaster ctor");
	// Pass in an empty array to force use of defaults.
    vector<StringAndDelay> cmds;

	// TODO: read from a config file, and use this hardwired string just as the default.
	string path("/dev/ttyS0");

    // Need to register any callback objects before creation if you want to be sure to
	// catch all strings sent by the Optolyzer.
	// Comment the addRecvCB in and add code to MyCB::userCB above to enable this callback.
	// OptolyzerImpl::addRecvCB(mycb);

    // Create the OptolyzerImpl instance. OptolyzerImpl::instance() calls will block until
	// Optolyzer has finished its initialization; about 6 seconds.
	OptolyzerImpl::create(path, cmds);
}

MostMaster::~MostMaster()
{
}

// Unused for now.
void MostMaster::initMost(std::string str, JSObjectRef errorCallback, JSContextRef context)
{

}

/**
 * Pass on strings received in sendCmd to the OptolyzerImpl
 * send() function.
*/
void MostMaster::sendCmd(std::string str, JSObjectRef errorCallback, JSContextRef context)
{

	// This sends additional one time initialization commands to the MOST hardware
	// along with creating the single AudioMostImplinstance to which all commands are sent.
	// Doing this now lets the WRT Widget startup and display, and you incur a delay
	// only on the first control activation if init. is not yet complete.

	if(!am)
	{
		am = new AudioMostImpl(OptolyzerImpl::instance());
	}

	// We have done all the one-time initializations and creations;
	// go ahead and send the string to the MOST (via the Optolyzer).
	am->send(str, 0);
}
/**
 * High level API: set tone (bass, treble, sub woofer, volume)
*/
void MostMaster::setTone(std::string dest, int level, int increment, JSObjectRef errorCallback, JSContextRef context)
{
	// TODO: this can go away once concurrent init code is added.
	if(!am)
	{
		am = new AudioMostImpl(OptolyzerImpl::instance());
	}
	am->setTone(dest, level, increment);

}
/**
 * High level API: set toneRange (bass, treble, sub woofer, volume)
*/
void MostMaster::setToneRange(std::string dest, int min, int max, JSObjectRef errorCallback, JSContextRef context)
{
	// TODO: this can go away once concurrent init code is added.
	if(!am)
	{
		am = new AudioMostImpl(OptolyzerImpl::instance());
	}
	am->setToneRange(dest, min, max);
}
/**
 * High level API: set balance (balance, fade)
*/
void MostMaster::setBalance(std::string dest, int level, int increment, JSObjectRef errorCallback, JSContextRef context)
{
	// TODO: this can go away once concurrent init code is added.
	if(!am)
	{
		am = new AudioMostImpl(OptolyzerImpl::instance());
	}
	am->setBalance(dest, level, increment);
}
/**
 * High level API: set balanceRange (bass, treble, sub woofer, volume)
*/
void MostMaster::setBalanceRange(std::string dest, int min, int max, JSObjectRef errorCallback, JSContextRef context)
{
	// TODO: this can go away once concurrent init code is added.
	if(!am)
	{
		am = new AudioMostImpl(OptolyzerImpl::instance());
	}
	am->setBalanceRange(dest, min, max);
}
/**
 * High level API: set surround mode (dolby, dts, stereo, etc.)
*/
void MostMaster::setSurround(std::string dest, bool state, std::string mode, JSObjectRef errorCallback, JSContextRef context)
{
	// TODO: this can go away once concurrent init code is added.
	if(!am)
	{
		am = new AudioMostImpl(OptolyzerImpl::instance());
	}
	am->setSurround(dest, state, mode);
}

/**
 * Get current value of a control; volume is currently supported.
 */
std::string MostMaster::curValue(std::string dest)
{
	if(!am)
	{
		am = new AudioMostImpl(OptolyzerImpl::instance());
	}
	return am->curValue(dest);

}
} // MOST
} // DeviceAPI

