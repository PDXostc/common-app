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

#include "extension_common/log.h"

#include "cameras_extension.h"
#include "cameras_instance.h"

extern const char kSource_cameras_api[];

common::Extension* CreateExtension()
{
	return new CamerasExtension();
}

CamerasExtension::CamerasExtension()
{
	SetExtensionName("tizen.cameras");
	SetJavaScriptAPI(kSource_cameras_api);
    
	LOGD("CamerasExtension ctor");
}

common::Instance* CamerasExtension::CreateInstance()
{
	LOGD("CamerasExtension::CreateInstance");
    	return new CamerasInstance();
}
