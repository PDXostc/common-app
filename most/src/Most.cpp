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
*/

/*
 * Created by: Jeff Eastwood
 * Purpose: Provides implementation of top level api used by the JSMost JavaScript interface.
 * Description:
 * This is the C++ interface to the MOST plugin. It is made accessible to the widget application through
 * the intermediation of the bridge code in JSMost.cpp and .h (for WRT plugins; for XW,
 * the JavaScript interface is in most_instance.cpp). Essentially, the members of tizen.most (for WRT; just most for XW)
 * visible in the widget application JavaScript will correspond with the member functions declared here.
 *
 * MostMaster makes use of the OptolyzerImpl singleton to access the serial port for sending commands to
 * the MOST hardware.
 */

#include "Most.h"

#include <stdexcept>
#include <memory>

#include <stdlib.h>
#include <unistd.h>
#include <syslog.h>

#include "Optolyzer.h"
#include "AudioMost.h"


#define TIZEN_PREFIX            "org.tizen"

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



static	MyCB mycb;

std::unique_ptr<AudioMostImpl> am;


/**
 * This class is the top level of the native WRT plugin. It's only duties are to create the
 * OptolyzerImpl singleton and pass on strings received in sendCmd to the OptolyzerImpl
 * send() function.
 *
 * Dependencies: uses class AudioMostImpl for sending commands to the audio hardware.
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
	// OptolyzerImpl::create(path, cmds);
	string config = OptolyzerImpl::getConfig(SERIAL_PORT);
	OptolyzerImpl::create(config, cmds);
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
 *
 * Parameters (purpose and usage):
 * str: contains the ASCII string that will be sent to the Optolyzer.
 * errorCallback: currently unused, but provides a way to communicate an error state back
 * 					to the JavaScript.
 * context: currently unused, part of the JSMost to JavaScript parameter mechanism.
*/
void MostMaster::sendCmd(std::string str, JSObjectRef errorCallback, JSContextRef context)
{

	// This sends additional one time initialization commands to the MOST hardware
	// along with creating the single AudioMostImplinstance to which all commands are sent.
	// Doing this now lets the WRT Widget startup and display, and you incur a delay
	// only on the first control activation if init. is not yet complete.

	if(!am)
	{
		am = std::unique_ptr<AudioMostImpl>(new AudioMostImpl(OptolyzerImpl::instance()));
	}

	// We have done all the one-time initializations and creations;
	// go ahead and send the string to the MOST (via the Optolyzer).
	am->send(str, 0);
}
/**
 * High level API: set tone control (bass, treble, sub woofer, volume)
 * Applies an absolute level or an incremental change to the level of the selected tone control.
 *
 * Parameters (purpose and usage):
 * dest: contains the destination audio control for this command; bass, treble, sub woofer, volume, or volume.
 * level: an absolute level to set the tone control to. If 0, the increment parameter is sent instead.
 * increment: if level is 0, then the increment value is applied to the current tone setting to increase or decrease it.
 * errorCallback: currently unused, but provides a way to communicate an error state back
 * 					to the JavaScript.
 * context: currently unused, part of the JSMost to JavaScript parameter mechanism.
*/
void MostMaster::setTone(std::string dest, int level, int increment, JSObjectRef errorCallback, JSContextRef context)
{
	if(!am)
	{
		am = std::unique_ptr<AudioMostImpl>(new AudioMostImpl(OptolyzerImpl::instance()));
	}
	am->setTone(dest, level, increment);

}
/**
 * High level API: set toneRange (bass, treble, sub woofer, volume)
 * Sets the valid range for tone control values passed to setTone.
 *
 * Parameters (purpose and usage):
 * min: the minimum allowed tone value.
 * max: the maximum allowed tone value.
  * errorCallback: currently unused, but provides a way to communicate an error state back
 * 					to the JavaScript.
 * context: currently unused, part of the JSMost to JavaScript parameter mechanism.
*/
void MostMaster::setToneRange(std::string dest, int min, int max, JSObjectRef errorCallback, JSContextRef context)
{
	// TODO: this can go away once concurrent init code is added.
	if(!am)
	{
		am = std::unique_ptr<AudioMostImpl>(new AudioMostImpl(OptolyzerImpl::instance()));
	}
	am->setToneRange(dest, min, max);
}
/**
 * High level API: set balance (balance, fade)
 * Applies an absolute level or an incremental change to the level of the selected balance control.
 *
 * Parameters (purpose and usage):
 * dest: contains the destination audio control for this command; balance (right/left) or fade (front/rear)
 * level: an absolute level to set the balance control to. If 0, the increment parameter is sent instead.
 * increment: if level is 0, then the increment value is applied to the current balance setting to increase or decrease it.
 * errorCallback: currently unused, but provides a way to communicate an error state back
 * 					to the JavaScript.
 * context: currently unused, part of the JSMost to JavaScript parameter mechanism.
*/
void MostMaster::setBalance(std::string dest, int level, int increment, JSObjectRef errorCallback, JSContextRef context)
{
	// TODO: this can go away once concurrent init code is added.
	if(!am)
	{
		am = std::unique_ptr<AudioMostImpl>(new AudioMostImpl(OptolyzerImpl::instance()));
	}
	am->setBalance(dest, level, increment);
}
/**
 * High level API: set balanceRange (bass, treble, sub woofer, volume)
 * Sets the valid range for balance control values passed to setBalance.
 *
 * Parameters (purpose and usage):
 * min: the minimum allowed balance value.
 * max: the maximum allowed balance value.
  * errorCallback: currently unused, but provides a way to communicate an error state back
 * 					to the JavaScript.
 * context: currently unused, part of the JSMost to JavaScript parameter mechanism.
*/
void MostMaster::setBalanceRange(std::string dest, int min, int max, JSObjectRef errorCallback, JSContextRef context)
{
	// TODO: this can go away once concurrent init code is added.
	if(!am)
	{
		am = std::unique_ptr<AudioMostImpl>(new AudioMostImpl(OptolyzerImpl::instance()));
	}
	am->setBalanceRange(dest, min, max);
}
/**
 * High level API: set surround mode (dolby, dts, stereo, etc.)
 *
 * Parameters (purpose and usage):
 * dest: the surround sound control to be changed.
 * state: true for on, false for off.
 * errorCallback: currently unused, but provides a way to communicate an error state back
 * 					to the JavaScript.
 * context: currently unused, part of the JSMost to JavaScript parameter mechanism.
*/
void MostMaster::setSurround(std::string dest, bool state, std::string mode, JSObjectRef errorCallback, JSContextRef context)
{
	// TODO: this can go away once concurrent init code is added.
	if(!am)
	{
		am = std::unique_ptr<AudioMostImpl>(new AudioMostImpl(OptolyzerImpl::instance()));
	}
	am->setSurround(dest, state, mode);
}

/**
 * Get current value of a control; only volume is currently supported.
 *
 * Parameters (purpose and usage):
 * dest: the control to be queried.
 *
 * Return value:
 * The string returns contains the current value of the volume control as last reported by the audio hardware.
 */
std::string MostMaster::curValue(std::string dest)
{
	if(!am)
	{
	//	am = new AudioMostImpl(OptolyzerImpl::instance());
		am = std::unique_ptr<AudioMostImpl>(new AudioMostImpl(OptolyzerImpl::instance()));
	}
	return am->curValue(dest);

}
} // MOST
} // DeviceAPI

