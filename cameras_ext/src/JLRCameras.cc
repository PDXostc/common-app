/* Copyright (C) Jaguar Land Rover - All Rights Reserved
 *
 * Proprietary and confidential
 * Unauthorized copying of this file, via any medium, is strictly prohibited
 *
 * THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 * KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 * PARTICULAR PURPOSE.
 *
 * Filename:             JLRCameras.cpp
 * Version:              2.0
 * Date:                 October 2014
 * Project:              JLR POC - Cameras
 * Contributors:         Zoltan Podolyak
 *
*/

#include <gio/gio.h>

#include "JLRCameras.h"
#include "cameras_instance.h"

#include "extension_common/log.h"
#include "extension_common/picojson.h"

namespace
{
	const char kObjectPath[]="/";
	const char kService[]="com.jlr.JLRCameras";
	const char kInterface[]="com.jlr.JLRCameras.CamerasInterface";
}
	
JLRCameras::JLRCameras() : mJLRCamerasManager(nullptr)
{

}

void JLRCameras::signalCallback(GDBusConnection *connection,
			 const gchar *sender_name,
			 const gchar *object_path,
			 const gchar *interface_name,
			 const gchar *signal_name,
			 GVariant *parameters,
			 gpointer user_data)
{
	gint param1;
	gint param2;
	picojson::value::object o;

	CamerasInstance* ci = static_cast<CamerasInstance*>(user_data);

        LOGD("Signal callback entered");

	if(!ci)
	{
		LOGE("Failed to cast to instance object");
		return;
	}

        // Get event parameters.
        g_variant_get (parameters, "(ii)", &param1, &param2);
	o["cam_id"]=picojson::value(static_cast<double>(param1));
	o["status"]=picojson::value(static_cast<double>(param2));

	LOGD("Got signal: %s, param1: %d, param2: %d", signal_name, param1, param2);

	ci->SendSignal(signal_name, picojson::value(o));
}

int JLRCameras::startCameraStreamingServer(int cameraID, int port)
{
	GDBusProxy* managerProxy = getJLRCamerasManager();

	GError *error = nullptr;
	
        // Invoke com.jlr.JLRCameras.CamerasInterface.startCameraStreamingServer method of JLRCMSS
	GVariant* objectPath = g_dbus_proxy_call_sync(managerProxy, "startCameraStreamingServer", g_variant_new("(ii)", cameraID, port), G_DBUS_CALL_FLAGS_NONE, -1, NULL, &error);

	if(error)
	{
		LOGD("error calling startCameraStreamingServer %s", error->message);
		g_error_free(error);
		return -1;
	}

        gint result;

	// Get result of com.jlr.JLRCameras.CamerasInterface.startCameraStreamingServer's invocation.
	g_variant_get(objectPath,"(i)", &result);

	LOGD("startCameraStreamingServer() returned: %d", result);

	g_variant_unref(objectPath);	

        // Return result to the application.
	return result;	
}

bool JLRCameras::stopCameraStreamingServer(int cameraID)
{
	GDBusProxy* managerProxy = getJLRCamerasManager();
	GError *error = nullptr;
	
        // Invoke com.jlr.JLRCameras.CamerasInterface.stopCameraStreamingServer method of JLRCMSS
	GVariant* objectPath = g_dbus_proxy_call_sync(managerProxy, "stopCameraStreamingServer", g_variant_new("(i)", cameraID), G_DBUS_CALL_FLAGS_NONE, -1, NULL, &error);

	g_variant_unref(objectPath);	

	if(error)
	{
		LOGD("error calling stopCameraStreamingServer %s", error->message);
		g_error_free(error);
		return false;
	}
	return true;
}

int JLRCameras::getCameraProperty(const char *method_name, int cameraID)
{
	GDBusProxy* managerProxy = getJLRCamerasManager();

	GError *error = nullptr;
	
	GVariant* objectPath = g_dbus_proxy_call_sync(managerProxy, method_name, g_variant_new("(i)", cameraID), G_DBUS_CALL_FLAGS_NONE, -1, NULL, &error);

	if(error)
	{
		LOGD("error calling %s %s", method_name, error->message);
		g_error_free(error);
		return -1;
	}

	gint result;
	g_variant_get(objectPath,"(i)", &result);

	LOGD("%s returned: %d", method_name, result);

	g_variant_unref(objectPath);	

        // Return result to the application.
	return result;	
}

GDBusProxy* JLRCameras::getJLRCamerasManager()
{
	LOGD("JLRCameras: getJLRCamerasManager() entered");
	
	if(mJLRCamerasManager) return mJLRCamerasManager;
	
        // Get D-Bus proxy object for com.jlr.JLRCameras.CamerasInterface interface.
	mJLRCamerasManager = g_dbus_proxy_new_for_bus_sync(G_BUS_TYPE_SYSTEM, G_DBUS_PROXY_FLAGS_NONE, NULL,
							 kService,
							 kObjectPath,
							 kInterface,
							 NULL,
							 NULL);
	
	return mJLRCamerasManager;
}

gboolean JLRCameras::findSignal(const std::string& signalName)
{
	LOGD("JLRCameras: findSignal() entered");

	GDBusProxy* managerProxy = getJLRCamerasManager();

	GError *error = nullptr;

	// Invoke com.jlr.JLRCameras.CamerasInterface.findSignal method of JLRCMSS
	// to check if interface can emit such signal.
	GVariant* objectPath = g_dbus_proxy_call_sync(managerProxy, "findSignal", g_variant_new("(s)", signalName.c_str()), G_DBUS_CALL_FLAGS_NONE, -1, NULL, &error);

	if(error)
	{
		LOGD("error calling findSignal %s", error->message);
		g_error_free(error);
		return false;
	}

	gboolean isExist;

	// Get result of com.jlr.JLRCameras.CamerasInterface.findSignal invocation
	g_variant_get(objectPath,"(b)", &isExist);

	LOGD("findSignal() returned: %d", (int)isExist);

	g_variant_unref(objectPath);	

	// Return result to the application
	return isExist;	
}

bool JLRCameras::subscribe(const std::string& signalName, CamerasInstance* user_data)
{
	LOGD("JLRCameras: subscribed() entered");

	if(!findSignal(signalName))
	{
		LOGE("Error findSignal failed for %s", signalName.c_str());
		return false;        
	}

	LOGD("JLRCameras: signal found: %s", signalName.c_str());

	// Subscribe on appropriate signal of com.jlr.JLRCameras.CamerasInterface interface.
	guint id = g_dbus_connection_signal_subscribe(g_bus_get_sync(G_BUS_TYPE_SYSTEM, NULL,NULL), kService, kInterface,
						  signalName.c_str(), kObjectPath, NULL, G_DBUS_SIGNAL_FLAGS_NONE,
						  signalCallback, user_data, NULL);

	LOGD("JLRCameras: subscribe identifier: %d", id);

	if(id<=0)
	{
	    LOGE("failed to subscribe to %s", signalName.c_str());
	    return false;
	}

	return true;
}
