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
 * Purpose: Provides part of the interface between a JavaScript application that needs to use the MOST
 * plugin (aka Crosswalk extension) and the C++ code that implements the MOST API.
 */
#include "src/most_extension.h"
#include "src/most_instance.h"
#include <syslog.h>

common::Extension* CreateExtension() {
  return new MOSTExtension();
}

extern const char kSource_most_api[];

MOSTExtension::MOSTExtension() {
  SetExtensionName("most");
  SetJavaScriptAPI(kSource_most_api);
	syslog(LOG_USER | LOG_DEBUG, "JE:  MOSTExtension ctor");
}

MOSTExtension::~MOSTExtension() {}

common::Instance* MOSTExtension::CreateInstance() {
	syslog(LOG_USER | LOG_DEBUG, "JE:  CreateInstance");
  return new MOSTInstance();
}
