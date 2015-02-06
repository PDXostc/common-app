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

#include "fingerprint_extension.h"
#include "fingerprint.h"

#include <syslog.h>

extern const char kSource_fingerprint_api[];

common::Extension* CreateExtension()
{
    return new FingerprintExtension();
}

FingerprintExtension::FingerprintExtension()
{
    SetExtensionName("fingerprint");
    SetJavaScriptAPI(kSource_fingerprint_api);

	syslog(LOG_USER | LOG_DEBUG, "RE:FingerprintExtension ctor");
}

FingerprintExtension::~FingerprintExtension()
{}

common::Instance* FingerprintExtension::CreateInstance()
{
	syslog(LOG_USER | LOG_DEBUG, "RE: CreateInstance");

    return new Fingerprint();
}
