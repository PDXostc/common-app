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
* Filename:	 Most.h
* Version:              1.0
* Date:                 Feb. 2014
* Project:              
* Contributors:         
*                       
*
* Incoming Code:        
*
*/

/**
 * This is the C++ interface to the MOST WRT plugin. It is made accessible to the widget application through
 * the intermediation of the bridge code in JSMost.cpp and .h. Essentially, the members of tizen.most
 * visible in the widget application JavaScript will correspond with the member functions declared here.
 */

#ifndef MOST_H
#define MOST_H

#include <string>
#include <dpl/mutex.h>
#include <dpl/shared_ptr.h>
#include <JavaScriptCore/JavaScript.h>
#include <gio/gio.h>
#include <map>

class AbstractPropertyType;

namespace DeviceAPI {
namespace Most {


/*! \class DeviceAPI::Most::MostMaster
 * \brief One of two top level JavaScript-C++ bridge/wrapper classes for controlling the MOST audio hardware.
*   One of two top level JavaScript-C++ bridge/wrapper classes for controlling the MOST audio hardware, via the Optolyzer RS232 to fiber interface HW.
*
*	Used in conjunction with JSMost, which has a corresponding function for each member function below.
*/
class MostMaster
{
public:

	MostMaster();
	~MostMaster();

	/** \brief \brief Pass on strings received in sendCmd to the OptolyzerImpl send() function. */
	void sendCmd(std::string str, JSObjectRef errorCallback, JSContextRef context);
	/** \brief set tone (bass, treble, sub woofer, volume) */
	void setTone(std::string dest, int level, int increment, JSObjectRef errorCallback, JSContextRef context);
	/** \brief set tone range (bass, treble, sub woofer, volume) */
	void setToneRange(std::string dest, int min, int max, JSObjectRef errorCallback, JSContextRef context);
	/** \brief High level API: set balance (balance, fade) */
	void setBalance(std::string dest, int level, int increment, JSObjectRef errorCallback, JSContextRef context);
	/** \brief set balance range (bass, treble, sub woofer, volume) */
	void setBalanceRange(std::string dest, int min, int max, JSObjectRef errorCallback, JSContextRef context);
	/** \brief set surround mode (dolby, dts, stereo, etc.) */
	void setSurround(std::string dest, bool state, std::string mode, JSObjectRef errorCallback, JSContextRef context);
	/** \brief Get current value. */
	std::string  curValue(std::string dest);

	/** \brief Not used, left in for debug. */
	void initMost(std::string str, JSObjectRef errorCallback, JSContextRef context);
};

typedef DPL::SharedPtr<MostMaster> MostPtr;

} // Most
} // DeviceAPI

#endif // MOST_H

