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

#ifndef CAMERAS_INSTANCE_H
#define CAMERAS_INSTANCE_H

#include "JLRCameras.h"
#include "extension_common/extension.h"
#include "extension_common/picojson.h"

class CamerasInstance : public common::Instance
{
public:
	CamerasInstance();
	~CamerasInstance() {}
    	
	// Called by JavaScript to pass in a message that will be executed asynchronously;
	// any return data will be sent back using the PostMessage call.
	void HandleMessage(const char* msg) override;
    
	// Called by JavaScript to pass in a message that will be executed synchronously.
	void HandleSyncMessage(const char* msg) override;
	void SendSignal(const std::string& signal_name, const picojson::value& msg);

private:
	void Subscribe(const picojson::value& msg);
	int  StartCamerasStreamingServer(const picojson::value& msg);
	void StopCamerasStreamingServer(const picojson::value& msg);	
	int  GetCameraProperty(const char *method_name,const picojson::value& msg);

	JLRCameras mCams;
	bool mError;
};

#endif
