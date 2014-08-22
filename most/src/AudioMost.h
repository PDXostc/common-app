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
* Created by: Jeff Eastwood
* Purpose: Provides MOST hardware specific classes and API for use by MostMaster to send
* audio related commands to the MOST hardware, via the Optolyzer.
*
* Uses the Optolyzer object to communicate to the MOST hardware via the Optolyzer serial-to optical-hardware.
*
* Provides mapping classes to map API calls to Optolyzer ASCII strings, and also to encode API parameters into these strings.
*
*/

#ifndef AUDIOMOST_H
#define AUDIOMOST_H

#include <string>
#include <map>
#include <vector>


namespace DeviceAPI {
namespace Most {

using std::string;
using std::map;

class OptolyzerImpl;
class ControlDesc;

/**
*  \brief Top level class for controlling the MOST audio hardware, via the Optolyzer RS232 to fiber interface HW.
*
*	Uses an OptolyzerImpl instance; will wait for that instance to complete its initialization of the
*	Optolyzer HW as necessary.
*/
class AudioMostImpl
{

public:

	~AudioMostImpl();

	/** \brief Ctor; requires an Optolyzer object.
	*
	*	Creates a ControlDescriptionDesc for every entry in CmdMap.
	*/
	AudioMostImpl(OptolyzerImpl& _theOptolyzer);

	/** \brief setTone: set level of or incr/decr a tone control. */
	bool setTone(const string& control, int level, int increment=0);

    /** \brief setToneRange: set allowed range for setTone level. */
	bool setToneRange(const string& control, int min, int max, int stepSz=0);

	/** \brief setBalance: set level of or incr/decr a balance control. */
	bool setBalance(const string& control, int level, int increment=0);

	/** \brief setBalanceRange: set allowed range for setBalance level. */
	bool setBalanceRange(const string& control, int min, int max, int stepSz=0);

	/** \brief setSurround: set a surround sound state (on/off) with optional mode value. */
	bool setSurround(const string& control, bool state, string mode="");

	/** \brief set: generic set interface for future controls. */
	bool set(const string& control, int level, int increment=0);
	/** \brief set: generic set interface for future controls. */
	bool set(const string& control, const string& mode);

	/** \brief send: send an ASCII string directly to the Optolyzer/MOST */
   	int send(std::string& cmd, unsigned int wait=0);

   	/** \brief getDescriptior: given the name of a destination control, return the ControlDesc object for it. */
   	ControlDesc* getDescriptor(string key);

   	/** \brief curValue: poll the MOST (or internal cache) for the current value of a control. */
   	string curValue(std::string dest);
	

private:

	OptolyzerImpl& theOptolyzer;
		
	AudioMostImpl(AudioMostImpl&);
	AudioMostImpl& operator=(AudioMostImpl&);
	AudioMostImpl();

};


} // Most
} // DeviceAPI

#endif // AUDIOMOST_H
