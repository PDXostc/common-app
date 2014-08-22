#ifndef MOST_INSTANCE_H_
#define MOST_INSTANCE_H_

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
 Created by: Jeff Eastwood
 Purpose: Provides the implementation of the interface between a JavaScript application that needs to use the MOST
 plugin (aka Crosswalk extension) and the C++ code that implements the MOST API.

 Adapted from
 https://github.com/crosswalk-project/crosswalk/blob/master/extensions/test/echo_extension.c
 Copyright (c) 2013 Intel Corporation. All rights reserved.
 Use of this source code is governed by a BSD-style license
 that can be found in the LICENSE file.
*/


#include <string>

#include "common/extension.h"

// This class exists to provide the top level C++ interfaces between JavaScript and C++.
// The three methods defined here are
// required by the Crosswalk Extension architecture.
class MOSTInstance : public common::Instance {
 public:
  MOSTInstance();
  ~MOSTInstance();

  // common::Instance implementation

  // Called by JavaScript to pass in a message that will be executed asynchronously;
  // any return data will be sent back using the PostMessage call.
  void HandleMessage(const char* message);
  // Called by JavaScript to pass in a message that will be executed synchronously.
  void HandleSyncMessage(const char* message);

 private:
  // The implementation of HandleMessage and HandleSyncMessage call this function to format the reply
  // to be sent back to the JavaScript into JSON.
  std::string PrepareMessage(std::string msg) const;
};

#endif  // MOST_INSTANCE_H_
