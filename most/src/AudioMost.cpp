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
*
* Created by: Jeff Eastwood
* Purpose: Provides MOST hardware specific classes and API for use by MostMaster to send
* audio related commands to the MOST hardware, via the Optolyzer.
*
* Uses the Optolyzer object to communicate to the MOST hardware via the Optolyzer serial-to optical-hardware.
*
* Provides mapping classes to map API calls to Optolyzer ASCII strings, and also to encode API parameters into these strings.
*/

#include "AudioMost.h"
#include "Optolyzer.h"
#include "ControlDesc.h"

//#include <Logger.h>

#include <stdexcept>
#include "fcntl.h"
#include <termios.h>
#include "unistd.h"
#include <string>
#include <map>
#include <algorithm>
#include <iostream>
#include <mutex>
#include <syslog.h>

namespace DeviceAPI
{
namespace Most
{

// protects access to CmdMap["volumeQuery"];
using namespace std;


// Describes common attributes of a MOST command: it's ASCII string, min and max values for those commands
// that take parameters, and the current value of the MOST control that is controlled by the command. This
// might be a cached value (i.e., what the last value sent to the control was), but for those MOST controls
// that are queryable, it holds the value queried from the control, for use in by the curValue function as
// it responds to JavaScript property queries.
struct CmdDesc
{
	string cmd; int min, max, curVal;
};

map<string, CmdDesc> CmdMap
{
	{"volume", {"+87000FFF018600220046D0090100XXXXXXXXXXXXXX\r\n", -128, 0, 0}},
	{"bass", {"+87000FFF0322002200202201XX\r\n", -12, 12, 0}},
	{"treble", {"+87000FFF0322002200203201XX\r\n", -12, 12, 0}},
	{"subwoofer", {"+87000FFF0322002200E09201XX\r\n", -12, 12, 0}},
	{"balance", {"+87000FFF0322002200200201XX\r\n", -12, 12, 0}},
	{"fade", {"+87000FFF0322002200204201XX\r\n", -12, 12, 0}},
	{"dolby2D", {"+87000FFF018600220AE05003020003\r\n", -12, 12, 0}},
	{"dolby3D", {"+87000FFF018600220AE05003020004\r\n", -12, 12, 0}},
	{"dolbyAuto", {"+87000FFF018600220AE05003020004\r\n", -12, 12, 0}},
	{"dts2D", {"+87000FFF018600220AE05003020006\r\n", -12, 12, 0}},
	{"dts3D", {"+87000FFF018600220AE0500302000B\r\n", -12, 12, 0}},
	{"dtsNeo6", {"+87000FFF018600220AE05003020005\r\n", -12, 12, 0}},
	{"dtsAuto", {"+87000FFF018600220AE05003020007\r\n", -12, 12, 0}},
	{"3CH", {"+87000FFF018600220AE05003020001\r\n", -12, 12, 0}},
	{"DPL2", {"+87000FFF018600220AE05003020002\r\n", -12, 12, 0}},
	{"meridian2D", {"+87000FFF0322002200E05203020001\r\n", -12, 12, 0}},
	{"meridian3D", {"+87000FFF0322002200E05203020009\r\n", -12, 12, 0}},
	{"stereo", {"+87000FFF018600220AE05003020000\r\n", -12, 12, 0}},
	{"volumeQuery", {"+87000FFF018600220046D102\r\n", 0, 0, 0}}

};


/** Ctor; requires an Optolyzer object.
 *
 *	Creates a ControlDescriptionDesc for every entry in CmdMap.
 */
AudioMostImpl::AudioMostImpl(OptolyzerImpl& _theOptolyzer) : theOptolyzer(_theOptolyzer)
{
	 for_each(CmdMap.begin(), CmdMap.end(),
			[this](pair<string, struct CmdDesc> destCmd) {
				new ControlDesc(destCmd.first, destCmd.second.cmd);
		}
	);
	// OptolyzerImpl::addRecvCB(curVolCB);

	// Final MOST initialization.

	string si1("+87010FFF018000C00410120101\r\n");
	string si2("+87020FFF0186002200111206010000010203\r\n");

	send(si1, 200000);
	send(si2, 200000);
}

/**  send: wraps Optolyzer::send()
*
*/
int AudioMostImpl::send(std::string& cmd, unsigned int wait)
{
	syslog(LOG_USER | LOG_DEBUG, "JE: AudioMostImpl::send %s\n", cmd.c_str());

	return theOptolyzer.send(cmd, wait);
}

AudioMostImpl::~AudioMostImpl()
{

}
/** setTone: set level of or incr/decr a tone control. Also supports query commands.
 * control: "bass", "treble", "volume" or "subwoofer"
 * level: -12 to +12
 * increment: changes level by supplied value.
 */
bool AudioMostImpl::setTone(const string& control, int level, int increment)
{
	syslog(LOG_USER | LOG_DEBUG, "JE: AudioMostImpl::setTone %s %d %d\n", control.c_str(), level, increment);

	if( control == "volumeQuery")
	{
		string inStr;
		inStr.reserve(100);

		// Send volume query command to Optolyzer.
		 CmdDesc cd = CmdMap["volumeQuery"];
		 send(cd.cmd, 0);

		 // Need to look for the response twice in order to get a reliable volume setting value.
		 for(int j=0; j < 2; j++ )
		 {
			 // Poll for response strings enough times to be sure the volume response is not missed.
			 for(int i=0; i < 100; i++ )
			 {
				 // Wait for the next string from Optolyzer.
				 int cnt=OptolyzerImpl::instance().recv(inStr, 100, '\r');

				 // This means no chars are available from the serial port; keep looking.
				 if( cnt < 0 )
				 {
					 break;
				 }

				 // Is this the volume response string?
				if( (inStr.size() > 25) && (inStr[9]=='2') &&  (inStr[10]=='2') && (inStr[13]=='4') && (inStr[14]=='6') && (inStr[15]=='D') &&
						(inStr[16]=='C') && (inStr[17]=='0') && (inStr[18]=='9') && (inStr[19]=='0') &&  (inStr[20]=='1') && (inStr[21]=='0') && (inStr[22]=='0') )
				{
						char buf[3];
						buf[0] = inStr[23];
						buf[1] = inStr[24];
						buf[2] = 0;
						int val=0;
						sscanf(buf, "%2X", &val);
						CmdMap["volumeQuery"].curVal = val;

						inStr.clear();
						break;
				}

				 inStr.clear();
			 }
		 }

		 return true;
	}

	return set(control, level, increment);

}
/**  setToneRange: set allowed range for setTone level.
 * control: "bass", "treble", "volume" or "subwoofer"
 * min, max: limits to apply to setTone()
 */
bool AudioMostImpl::setToneRange(const string& control, int min, int max, int stepSz)
{
	bool retval = false;
	ControlDesc *cd = ControlDesc::getDesc(control);
	if(cd)
	{
		cd->set(min, max);
		retval=true;
	}

	return retval;
}
/** setBalance: set level of or incr/decr balance or fade control.
 * control: "balance" or "fade"
 * level: -12 to +12
 * increment: changes level by supplied value.
 */
bool AudioMostImpl::setBalance(const string& control, int level, int increment)
{
	return set(control, level, increment);
}

/**  setBalanceRange: set allowed range for setBalance level.
 * control: "balance" or "fade"
 * min, max: limits to apply to setTone()
 */
bool AudioMostImpl::setBalanceRange(const string& control, int min, int max, int stepSz)
{
	bool retval = false;
	ControlDesc *cd = ControlDesc::getDesc(control);
	if(cd)
	{
		cd->set(min, max);
		retval=true;
	}
	return retval;
}
/**  setSurround: set a surround sound state (on/off) with optional mode value.
 */
bool AudioMostImpl::setSurround(const string& control, bool state, string mode)
{
	bool retVal=false;

	ControlDesc *cd = ControlDesc::getDesc(control);
	if(cd)
	{
		string cmd = cd->set(state, mode);

		if( cmd.size() > 0)
		{
			send(cmd, 100);  // TODO: what value to use for after send() wait? 100 usec seems pretty reasonable...
			retVal=true;
		}
	}
	else
	{
		// TODO: add logging.
	}
	return retVal;
}
/**  set: generic set interface for future controls.
 */
bool AudioMostImpl::set(const string& control, int level, int increment)
{
	bool retVal=false;
	ControlDesc *cd = ControlDesc::getDesc(control);

	if(cd && (level || increment) )
	{
		string cmd = cd->set(increment ? increment : level);
		if( cmd.size() > 0)
		{
			send(cmd, 100);

			retVal=true;
		}
	}

	return retVal;
}
/**  set: generic set interface for future controls.
 */
bool AudioMostImpl::set(const string& control, const string& mode)
{
	return false;
}
/** getDescriptior: given the name of a destination control, return the ControlDesc object for it.
*/
ControlDesc* AudioMostImpl::getDescriptor(string key)
{
	return ControlDesc::getDesc(key);
}

/** Poll the MOST for the current value of a control. */
string AudioMostImpl::curValue(std::string dest)
{
	int curVal=0;

	if( dest == "volume")
	{
		curVal=CmdMap["volumeQuery"].curVal;

		if(curVal == 0 )
		{
			syslog(LOG_USER | LOG_DEBUG, "JE  curValue 0");
		}

		return to_string(curVal);  // TODO: find first to avoid exception.
	}

	return "0";
}

/*  Removed due to problems with the serial receive thread being somehow started with the pid of a previously
    started widget app.
*/
#if 0

 * Callback to get the response to the query volume level command.
 * Puts it into the CmdMap as the current value for the MOST volume.
 */

// Instantiate the volume query callback object.
static VolumeSettingCB curVolCB;
class VolumeSettingCB : public OptolyzerRecvCB
{
	public:

	// Uses the filter function (below) to filter out incoming strings that are not the volume query response.
    void userCB(string& recvStr, int status, void* data)
    {

/*  Removed due to problems with the serial receive thread being somehow started with the pid of a previously
    started widget app.
    	syslog(LOG_USER | LOG_DEBUG, "JE CB pre lock pid %d getpid %d", OptolyzerImpl::instance().pid, getpid() );

		char buf[3];
		buf[0] = recvStr[23];
		buf[1] = recvStr[24];
		buf[2] = 0;
		int val=0;
		sscanf(buf, "%2X", &val);
		//curVal = val;  // JE EXP.
		syslog(LOG_USER | LOG_DEBUG, "JE CB extracts val: %d pid is %d\n", val, getpid());

		CmdMap["volumeQuery"].curVal = val;
		syslog(LOG_USER | LOG_DEBUG, "JE CB setting val in CB to: %d\n", val);

		syslog(LOG_USER | LOG_DEBUG, "JE CB post unlock");

*/
    }

/*
    bool filter( string& recvStr )
    {
   // 	syslog(LOG_USER | LOG_DEBUG, "VolumeSettingCB filter sees: %s\n", recvStr.c_str());
        //  return true; // filter all.
    	return !((recvStr.size() > 25) && (recvStr[9]=='2') &&  (recvStr[10]=='2') && (recvStr[13]=='4') && (recvStr[14]=='6') && (recvStr[15]=='D')  );
        // return false; // filter none.
    }
*/

};
#endif
} // Most
} // DeviceAPI
