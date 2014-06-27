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
#include "ControlDesc.h"
#include <iostream>

//#include <Logger.h>

namespace DeviceAPI
{
namespace Most
{
using namespace std;

map<string, ControlDesc*> ControlDesc::cntrlDescriptorMap;


CommandBuilder::CommandBuilder(string _cmdString) : commandString(_cmdString)
{

}

/**
*	Apply the substitution algorithm using convert() to replace XX in the commandString with the values from level or increment.
*
*/
string CommandBuilder::operator()(int level, int increment)
{
	//cout << "in CommandBuilder::operator()() level is " << level << endl;
	return convert(level, increment);

}
/**
*	Apply the substitution algorithm using convert() to replace XX in the commandString with the values from state and mode.
*	For now, the surround sound commands are pure strings with no parameters, so just return the commandString member.
*/
string CommandBuilder::operator()(bool state, string mode)
{
//	cout << "in CommandBuilder::operator()() state is " << state << " mode is " << mode << endl;
	//return convert(state, mode);  // TODO: will need a custom converter.
	return commandString;

}
/**
*	Apply a substitution algorithm to replace XX in the commandString with the values from level or increment.
*	The default algorithm is: find the first instance of XX and replace it with the two digit hex representation
*	of level, or if increment is !=0 0, the hex. rep of increment.
*/
string CommandBuilder::convert(int level, int increment)
{
	// Find first instance of "XX":
	size_t pos = commandString.find("XX");

	if( pos == string::npos)
		 return ""; // Error!!!

	// Convert level or increment to a two digit hex value and build a return string that
	// substitutes this hex value for the XX.
	int val = increment ? increment : level;

	char buf[5];
	// A pretty funky specifier: want an upper case two digit hex value. The hh keeps negative
	// values from coming out FFFFFFXX.
	sprintf(buf, "%2.2hhX", val);  // TODO: not working for negative values.

	// Create result string:
	string result = commandString.substr(0, pos);
	result += string(buf) + commandString.substr(pos+2, string::npos);
//	printf("cmd str: %s\n, result str %s\n", commandString.c_str(), result.c_str());

	return result;
}


VolumeCmdBuilder:: VolumeCmdBuilder(string _cmdString) : CommandBuilder(_cmdString)
{
}
/**
*	Apply the substitution algorithm using convert() to replace 7 pairs of XX in the
*	commandString with the values from level. Volume may need this, although using the single XX
*	convertor seems to work on "the rig."
*
*/
string VolumeCmdBuilder::operator()(int level, int increment)
{
	return convert(level, increment);
}
/**
 * Assumes that there are 7 adjacent pairs of XX that will all be changed to the level value.
 */
string VolumeCmdBuilder::convert(int level, int increment)
{
	// Convert level or increment to a two digit hex value and build a return string that
	// substitutes this hex value for the XX.
	int val = level;

	char buf[5];
	// A pretty funky specifier: want an upper case two digit hex value. The hh keeps negative
	// values from coming out FFFFFFXX.
	sprintf(buf, "%2.2hhX", val);  // TODO: not working for negative values.

	// Find each instance of "XX" and replace with level
	size_t from=0, pos;
	string result;

	pos = commandString.find("XX", from);
	if( pos == string::npos)
		return ""; // ERROR: no XX found.

	// Put the cmd string up to the first XX into result:
	result = commandString.substr(0, pos);

	for( int i=0; i < 7; i++ )  // TODO: something more generic than "7" would be nice...
	{
		// Create result string:
		result += string(buf);  //+ commandString.substr(pos+2, string::npos);
	}
	result += commandString.substr(pos+14, string::npos);
	printf("VolumeCmdBuilder cmd str: %s\n, result str %s\n", commandString.c_str(), result.c_str());

	return result;
}
/** \brief Ctor: create a mapping from a destination string (name of a control) to pair of [ASCII string, ControlDesc*]
*	that is the Optolyzer command with XX in place of values, and a ControlDesc object, which knows how
*	to take the command string and a value and return the complete command string to send to the Optolyzer].
*/
ControlDesc::ControlDesc(string _dest, string& _cmdString) :
							dest(_dest), cmdString(_cmdString), minVal(0), maxVal(0), cmdBuilder(0)
{
	cntrlDescriptorMap.insert(pair<string, ControlDesc*>(dest,this));

	// Here is an example of using a specialized CommandBuilder instead of the standard one for a given control;
	if( _dest == "volume")
		cmdBuilder = new VolumeCmdBuilder(_cmdString);
	else
	{
		// Create a CommandBuilder for each ControlDesc.
		cmdBuilder = new CommandBuilder(_cmdString);
	}
}

/** \brief Dtor.
 */
ControlDesc::~ControlDesc(void)
{
	delete cmdBuilder;

}

/** \brief Set the min/max valid values so that set(int) can check for a valid value.
*/
void ControlDesc::set(int min, int max)
{
//	cout << "ControlDesc::set for " << dest << " called with range " << min << " " << max << endl;
	minVal=min;
	maxVal=max;

}

/** \brief: set a control to a given level.
*
*	Pass the value to CommandBuilder::operator() and get back a complete string that can be
*	sent to the Optolyzer.
*/
string  ControlDesc::set(int value)
{
	string cmd;

	// Only apply range checking if min/max range has been set.
	if( (minVal || maxVal) && ((value < minVal) || ( value > maxVal)) )
		return cmd;  // Return empty string as error indication.

	if(cmdBuilder)
		cmd = (*cmdBuilder)(value);
	else
		; //cout << "!!!null cmdBuilder!!!" << endl;  // TODO: what is an appropriate error response? Logging would be good.

	return cmd;
}

/** \brief: set a control to a given state.
*
*	Pass the state to CommandBuilder::operator() and get back a complete string that can be
*	sent to the Optolyzer.
*/
string  ControlDesc::set(bool state, string mode)
{
	string cmd;

	if(cmdBuilder)
		cmd = (*cmdBuilder)(state, mode);

	return cmd;
}
/** \brief Get the ControlDesc object for a given control.
*/
ControlDesc* ControlDesc::getDesc(string _dest)
{
	map<string, ControlDesc*>::iterator it = cntrlDescriptorMap.find(_dest);

	if( it != cntrlDescriptorMap.end() )
		return (*it).second;

	return 0; // Error!
}

} // namespace Most
} // namespace DeviceAPI
