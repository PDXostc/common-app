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

#include <string>

#include "JLRCameras.h"
#include "extension_common/picojson.h"
#include "extension_common/log.h"

#include "cameras_instance.h"

CamerasInstance::CamerasInstance() : mCams()
{

}

void CamerasInstance::HandleMessage(const char *msg)
{
	mError=false;
	picojson::value v;
	picojson::value::object resp;
	std::string err;
	picojson::parse(v, msg, msg + strlen(msg), &err);
	if (!err.empty())
	{
		LOGE("An error occured while handling async message: %s", err.c_str());
		return;
	}

	const std::string cmd=v.get("cmd").to_str();
	if(cmd=="subscribe")
		Subscribe(v);
	else if(cmd=="start_camera_streaming_server")
	{
		int result=StartCamerasStreamingServer(v);
		resp["value"]=picojson::value(static_cast<double>(result));
	}
	else if(cmd=="stop_camera_streaming_server")
		StopCamerasStreamingServer(v);
	else
	{
		LOGE("Unknown command received.");
		mError=true;
	}

	resp["error"]=picojson::value(mError);
	resp["reply_id"]=picojson::value(v.get("reply_id").get<double>());
	picojson::value re(resp);
	PostMessage(re.serialize().c_str());
}

void CamerasInstance::HandleSyncMessage(const char *msg)
{
	mError=false;
	picojson::value v;
	picojson::value::object resp;
	std::string err;
	picojson::parse(v, msg, msg + strlen(msg), &err);
	if (!err.empty())
	{
		LOGE("An error occured while handling sync message: %s", err.c_str());
		return;
	}

	const std::string cmd=v.get("cmd").to_str();
	if(cmd=="getCameraStatus" || cmd=="getCameraStreamType")
	{
		resp["value"]=picojson::value(static_cast<double>(GetCameraProperty(cmd.c_str(),v)));
		resp["error"]=picojson::value(mError);
		picojson::value re(resp);
		SendSyncReply(re.serialize().c_str());
	}
	else
		LOGE("unrecognized command %s", cmd.c_str());
}

void CamerasInstance::Subscribe(const picojson::value& msg)
{
	std::string name=msg.get("name").to_str();
	if(!mCams.subscribe(name,this))
		mError=true;
}

int CamerasInstance::StartCamerasStreamingServer(const picojson::value& msg)
{
	double camID=msg.get("cam_id").get<double>();
	double port=msg.get("port").get<double>();
	return mCams.startCameraStreamingServer((int)camID,(int)port);
}

void CamerasInstance::StopCamerasStreamingServer(const picojson::value& msg)
{
	double camID=msg.get("cam_id").get<double>();
	if(!mCams.stopCameraStreamingServer((int)camID))
		mError=true;
}

int CamerasInstance::GetCameraProperty(const char *method_name, const picojson::value& msg)
{
	LOGD("GetCameraProperty entered with %s", method_name);
	double camID=msg.get("cam_id").get<double>();
	return mCams.getCameraProperty(method_name,(int)camID);
}

void CamerasInstance::SendSignal(const std::string &signal_name, const picojson::value& msg)
{
	LOGD("SendSignal entered with %s", signal_name.c_str());
	picojson::value::object o;
	o["cmd"]=picojson::value("signal");
	o["signal_name"]=picojson::value(signal_name.c_str());
	o["cam_id"]=picojson::value(msg.get("cam_id").get<double>());
	o["status"]=picojson::value(msg.get("status").get<double>());
	picojson::value resp(o);
	PostMessage(resp.serialize().c_str());
}

