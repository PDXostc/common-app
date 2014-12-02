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
 * Filename:             JLRCameras.h
 * Version:              2.0
 * Date:                 October 2014
 * Project:              JLR POC - Cameras
 * Contributors:         Zoltan Podolyak
*/

#ifndef JLRCAMERAS_H
#define JLRCAMERAS_H

#include <string>
#include <gio/gio.h>

class CamerasInstance;

class JLRCameras
{
public:
	JLRCameras();
	
private: 
	GDBusProxy* getJLRCamerasManager();
	GDBusProxy* mJLRCamerasManager;
	gboolean findSignal(const std::string& signalName);
	static void signalCallback(GDBusConnection *connection,
				 const gchar *sender_name,
				 const gchar *object_path,
				 const gchar *interface_name,
				 const gchar *signal_name,
				 GVariant *parameters,
				 gpointer user_data);

public:
	/**
	 * Subscribe function for events from com.jlr.JLRCameras.CamerasInterface D-Bus interface 
         * of JLR Camera Media Streaming Server. 
	 */
	bool subscribe(const std::string& object_name, CamerasInstance* user_data);

	/**
	 * Exposes com.jlr.JLRCameras.CamerasInterface.startCameraStreamingServer D-Bus interface 
         * of JLR Camera Media Streaming Server to the Web Runtime.
	 */
	int startCameraStreamingServer(int cameraID, int port);

	/**
	 * Exposes com.jlr.JLRCameras.CamerasInterface.stopCameraStreamingServer D-Bus interface 
         * of JLR Camera Media Streaming Server to the Web Runtime.
	 */
	bool stopCameraStreamingServer(int cameraID);

	int getCameraProperty(const char *method_name, int cameraID);
};

#endif // JLRCAMERAS_H
