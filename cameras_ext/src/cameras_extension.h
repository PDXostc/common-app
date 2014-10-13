/* Copyright (C) 2014 Jaguar Land Rover - All Rights Reserved
 *
 * Proprietary and confidential
 * Unauthorized copying of this file, via any medium, is strictly prohibited
 *
 * THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 * KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 * PARTICULAR PURPOSE.
*/

#ifndef CAMERAS_EXTENSION_H
#define CAMERAS_EXTENSION_H

#include "extension_common/extension.h"

class CamerasExtension : public common::Extension
{
public:
	CamerasExtension();
	~CamerasExtension() override {}

private:
	common::Instance* CreateInstance() override;

};

#endif
