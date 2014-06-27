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
#include <map>
#include <vector>

using std::string;
using std::map;

namespace DeviceAPI
{
namespace Most
{
/**
*  \brief Provides the means to insert a value received from setTone, setBalance, etc. into ASCII MOST command strings.
*
*/
class CommandBuilder
{
public:
	CommandBuilder() {}

	virtual ~CommandBuilder() {}

	/**
	* \brief Ctor for CommandBuilder; parameter is ASCII command string for Optolyzer/MOST containing value markers.
	*
	*	Ctor: pass in a string that contains placeholders for substitution when operator() is called.
	*	Example: pass in "+87000FFF018600220046D0090100XX000000000000\r\n". When operator()(3) is called to set
	*	the volume level to 3, the XX  will al be changed to 03, and this string returned;
	*	"+87000FFF018600220046D009010003000000000000\r\n"
	*
	*	If only a single XX is in the pattern string, then the default substitution function is used. For strings with
	*	more complex substitution rules, derive from CommandBuilder an override operator() and convert().
	*
	*/
	CommandBuilder(string _cmdString);

	/** \brief Apply the substitution algorithm using convert() to replace XX in the commandString with the values from level or increment.
	*
	*/
	virtual string operator()(int level, int increment=0);
	virtual string operator()(bool level, string mode=0);



protected:
	/** \brief Apply a substitution algorithm to replace XX in the commandString with the values from level or increment.
	*/
	virtual string convert(int level, int increment=0);

	string commandString;

};

/** \brief Customized CommandBuilder that replaces 7 pairs of XX with the value supplied in convert()
 */
class VolumeCmdBuilder : public CommandBuilder
{
	public:

	VolumeCmdBuilder() {}

	VolumeCmdBuilder(string _cmdString);

	string operator()(int level, int increment=0);
	string convert(int level, int increment=0);

};
/**
*  \brief Class for associating a control (bass, treble, volume, etc.) with a command string.
*
*	Associates a control string name with the ASCII string sent to the Optolyzer/MOST.
*/
class ControlDesc
{
public:

	/** \brief Ctor: pass in control name, it's command string, and an optional CommandBuilder.
	 */
	ControlDesc(string _dest, string& _cmdString);

	/** \brief Dtor.
	 */
	virtual ~ControlDesc(void);

	/**	\brief Set the min/max valid values so that set(int) can check for a valid value.
	*/
	void set(int min, int max);

	/** \brief set a control to a given level.
	*/
	string set(int value);

	/** \brief set a control to a given state.
	*/
	string  set(bool state, string mode="");

	/** \brief Get the ControlDesc object for a given control.
	*/
	static ControlDesc* getDesc(string _dest);

private:
	string dest, cmdString;
	int minVal, maxVal;
	CommandBuilder* cmdBuilder;

	static 	map<string, ControlDesc*> cntrlDescriptorMap;
};

} // namespace Most

} // namespace DeviceAPI
