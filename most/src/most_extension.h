#ifndef MOST_EXTENSION_H_
#define MOST_EXTENSION_H_

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
 * plplugin (aka Crosswalk extension) and the C++ code that implements the MOST API.

  Adapted from
  https://github.com/crosswalk-project/crosswalk/blob/master/extensions/test/echo_extension.c
  Copyright (c) 2013 Intel Corporation. All rights reserved.
  Use of this source code is governed by a BSD-style license
  that can be found in the LICENSE file.
*/


#include "common/extension.h"

// This class exists to create an instance of the MOSTInstance object; This behavior
// is required by the Crosswalk Extension architecture.
class MOSTExtension : public common::Extension {
 public:
  MOSTExtension();
  virtual ~MOSTExtension();

 private:
  // common::Extension implementation.
  virtual common::Instance* CreateInstance();  // Creates the MOSTInstance object,
};

#endif  // MOST_EXTENSION_H_
