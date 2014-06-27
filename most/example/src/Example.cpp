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
* Filename:	 Example.cpp
* Version:              1.0
* Date:                 Feb. 2014
* Project:              
* Contributors:         
*                       
*
* Incoming Code:        
*
*/
#include "Example.h"
#include <gio/gio.h>
#include <stdexcept>
#include <Logger.h>

#include <Commons/ThreadPool.h>
#include <CommonsJavaScript/Converter.h>
#include <json-glib/json-gvariant.h>

#include <stdlib.h>
#include <unistd.h>


#define TIZEN_PREFIX            "org.tizen"

namespace DeviceAPI
{
namespace Example
{


using namespace WrtDeviceApis::Commons;
using namespace WrtDeviceApis::CommonsJavaScript;


ExampleMaster::ExampleMaster()
{
    LoggerD("entered ExampleMaster::ExampleMaster ctor");
}

ExampleMaster::~ExampleMaster()
{
    LoggerD("entered ExampleMaster::ExampleMaster dtor");
}

void ExampleMaster::initExample(std::string str, JSObjectRef errorCallback, JSContextRef context)
{
	LoggerD("Example initExample called.");
}

void ExampleMaster::sendCmd(std::string str, JSObjectRef errorCallback, JSContextRef context)
{
	LoggerD("Example sendCmd called: " << str );
}

} // Example
} // DeviceAPI

