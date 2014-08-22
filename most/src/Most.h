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
 */

#ifndef MOST_H
#define MOST_H

// Defining this replaces the WRT plugin types passed in from JSMost.
#define mostXW

#ifdef mostXW
typedef int JSObjectRef;
typedef int JSContextRef;
#endif

#include <string>
#include <map>

class AbstractPropertyType;

namespace DeviceAPI { // This namespace encapsulates all classes written for this plugin.
namespace Most { // This namespace encapsulates all MOST related classes written for this plugin.


/*! \class DeviceAPI::Most::MostMaster
 * \brief One of two top level JavaScript-C++ bridge/wrapper classes for controlling the MOST audio hardware.
*   One of two top level JavaScript-C++ bridge/wrapper classes for controlling the MOST audio hardware, via the Optolyzer RS232 to fiber interface HW.
*
*	Used in conjunction with JSMost, which has a corresponding function for each member function below.
*
*	Dependencies: none at the class level; see Most.cpp for implementation dependencies.
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



private:
	MostMaster(MostMaster&);
	MostMaster& operator=(MostMaster&);

	/** \brief This class contains no member variables/properties, but here is where they would be declared and
	 * described (their purpose and usage.)
	*/
};


} // Most
} // DeviceAPI

#endif // MOST_H

