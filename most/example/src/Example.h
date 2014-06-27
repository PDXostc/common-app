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
* Filename:	 Example.h
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
	This is the header for the C++ implementation of your WRT plugin.

	Typically, you will define a single class here (ExampleMaster below) that is the 
	interface to the JavaScript interface code defined in JSExample.h and .cpp.

	tizen.example.<member function name> calls in from the Widget application invoke
	code in the JSExample class, which in turn invokes the appropriate function here.
*/
#ifndef EXAMPLE_H
#define EXAMPLE_H

#include <string>
#include <dpl/mutex.h>
#include <dpl/shared_ptr.h>
#include <JavaScriptCore/JavaScript.h>
#include <gio/gio.h>
#include <map>

namespace DeviceAPI {
namespace Example {

/**
 *  \brief An example of the top level C++ interface for JavaScript to native/C++/WRT plugin use.
 */
class ExampleMaster
{
public:

	ExampleMaster();
	~ExampleMaster();

	// Define here the functions that are to be accessible from JSExample.
	void initExample(std::string str, JSObjectRef errorCallback, JSContextRef context);
	void sendCmd(std::string str, JSObjectRef errorCallback, JSContextRef context);

};

typedef DPL::SharedPtr<ExampleMaster> ExamplePtr;

} // Example
} // DeviceAPI

#endif // EXAMPLE_H

