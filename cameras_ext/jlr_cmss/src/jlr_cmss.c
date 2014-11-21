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
 * Filename:             jlr_cmss.c
 * Version:              1.0.2
 * Date:                 April 2014
 * Project:              JLR POC - Cameras
 * Contributors:         - 
 *                      
 *
 * Incoming Code:        -
 *
*/

/*=========================================================================
                        EDIT HISTORY FOR MODULE

when      who       what, where, why
--------  --------  -------------------------------------------------------
03/06/2014  anosov  Initial version.
03/26/2014  anosov  Added cameras statuses notification functionality.
04/07/2014  anosov  Cameras notification functionality was updated.
==========================================================================*/

/*
 D-Bus verification:
 dbus-send --dest='com.jlr.JLRCameras' \
               /           \
              com.jlr.JLRCameras.CamerasInterface.CameraServerStatusChanged   \
              int32:1 int32:1

dbus-send   --system --type=method_call --dest=com.jlr.JLRCameras         \
                   /              \
                   com.jlr.JLRCameras.CamerasInterface.startCameraStreamingServer   \
                   int32:4 int32:8777

dbus-send   --system --type=method_call --dest=com.jlr.JLRCameras         \
                   /              \
                   com.jlr.JLRCameras.CamerasInterface.stopCameraStreamingServer   \
                   int32:4

*/

/*===========================================================================

                     INCLUDE FILES FOR MODULE

===========================================================================*/
#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <sys/types.h>        
#include <sys/stat.h>
#include <sys/wait.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>
#include <memory.h>
#include <pthread.h>
#include <syslog.h>

#include <gio/gio.h>
#include <glib.h>
#include <dbus/dbus.h>
#include <dbus/dbus-glib-lowlevel.h>

#include <dirent.h>
#include <fcntl.h>

#include <libxml/parser.h>
#include <libxml/uri.h>

#include <linux/videodev2.h>


/*===========================================================================

                 LOCAL CONSTANT AND MACRO DEFINITIONS

===========================================================================*/

#define APP_PREFIX "jlr_cmss: "

#define JLR_CMSS_LAUNCH_LOG_LEVEL 1

#if JLR_CMSS_LAUNCH_LOG_LEVEL < 1
#define LOG(a, ...)
#else 
#define LOG(a, ...) syslog(LOG_NOTICE, a, ##__VA_ARGS__)
#endif

// Description of com.jlr.JLRCameras.CamerasInterface interface.
// Required for D-Bus interface registrering.
static const gchar camera_xml[] =
  "<node>"
  "  <interface name='com.jlr.JLRCameras.CamerasInterface'>"
  "    <method name='startCameraStreamingServer'>"
  "      <arg type='i' name='cameraID' direction='in'/>"
  "      <arg type='i' name='port' direction='in'/>"
  "      <arg type='i' name='response' direction='out'/>"
  "    </method>"
  "    <method name='stopCameraStreamingServer'>"
  "      <arg type='i' name='searchstring' direction='in'/>"
  "    </method>"
  "    <method name='getCameraStatus'>"
  "      <arg type='i' name='cameraID' direction='in'/>"
  "      <arg type='i' name='response' direction='out'/>"
  "    </method>"
  "    <method name='getCameraStreamType'>"
  "      <arg type='i' name='cameraID' direction='in'/>"
  "      <arg type='i' name='response' direction='out'/>"
  "    </method>"
  "    <method name='findSignal'>"
  "      <arg type='s' name='searchstring' direction='in'/>"
  "      <arg type='b' name='response' direction='out'/>"
  "    </method>"
  "  </interface>"
  "</node>";

// Defines the main loop of the application.
static GMainLoop *main_loop = NULL;

pthread_t ip_cameras_status_thread;
pthread_t usb_cameras_status_thread;
pthread_t analog_cameras_status_thread;

pthread_mutex_t set_status_lock;
pthread_mutex_t get_attribute_lock;

pthread_cond_t ready = PTHREAD_COND_INITIALIZER;
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

// Success HTTP response.
char http_response[] = "HTTP/1.1 200 Connection established";

// Enum for cameras IDs.
enum cam_ids {
               CAMERA_USB0 = 0,
               CAMERA_USB1,
               CAMERA_USB2,
               CAMERA_USB3,
               CAMERA_USB4,
               CAMERA_USB5,
               CAMERA_USB_MAX,

               CAMERA_IP0,
               CAMERA_IP1,
               CAMERA_IP2,
               CAMERA_IP3,
               CAMERA_IP4,
               CAMERA_IP5,
               CAMERA_IP_MAX,

               CAMERA_ANALOG0,
               CAMERA_ANALOG1,
               CAMERA_ANALOG2,
               CAMERA_ANALOG3,
               CAMERA_ANALOG_MAX,

               CAMERA_ID_MAX
};

// Server statuses.
enum server_status {
             NONE = 0,

             // Server is waiting for connection.
             WAITING_FOR_CONNECTION,

             // Server is streaming media.
             STREAMING,

             // Server was stopped with stopCameraStreamingServer.
             SHUTDOWN,

             // Some error happened while streaming.
             EMERGENCY_SHUTDOWN
};

// Camera statuses.
enum camera_statuses {
             UNAVAILABLE = -1,

             CAMERA_SIGNAL_OFF = 0,
        
             CAMERA_SIGNAL_ON = 1 
};

// Stream server structure.
struct stream_server {
    
    // Thread ID in which server is working.
    pthread_t thread_id;

    // ID of the camera for which server is launched.
    int camera_id;

    // Camera type. One of the USB, IP, ANALOG
    char camera_type[20];

    // Video source. /dev/videoX in case of v4l2 devices,
    // http address in case of IP cameras.
    char source[256];

    //  Launch command for GStreamer
    char gst_launch_command[1024];

    // TCP port the server is listening on.
    int port;

    // Current server status.
    int status;

    // Socket descriptor server is listening on.
    int listener_socket;

    // Server socket. Media will be streaming using this socket.
    int server_socket;

    // These descriptors are used for getting media from the GStreamer.
    int filedes[2];

    // PID of GStreamer instance
    int gst_pid;

    // screenshot_stream
    int is_screenshot_stream;

    // Flag, indicated if request for stopping of the server 
    // was received.
    int exit_flag;    
};

struct stream_server servers[CAMERA_ID_MAX];

struct camera_status {

    // ID of the camera.
    int camera_id;

    // Camera status.
    // -1 - camera is not available (no config record or wrong input 
    //      for analog cameras)
    //  0 - no camera signal.
    //  1 - camera is available, signal is present
    int status;

};

struct camera_status cam_status[CAMERA_ID_MAX];

/*============================================================================

                        FUNCTION PROTOTYPES

===========================================================================*/

// D-Bus function prototypes
static void on_bus_acquired (GDBusConnection *connection, const gchar *name, gpointer user_data);
static void on_name_acquired (GDBusConnection *connection, const gchar *name, gpointer user_data);
static void on_name_lost (GDBusConnection *connection, const gchar *name, gpointer user_data);
static void handleMethodCall(GDBusConnection *connection, const gchar *sender, const gchar *object_path,
                             const gchar *interface_name, const gchar *method_name,  GVariant *parameters,
                             GDBusMethodInvocation *invocation, gpointer user_data);
static GVariant* getProperty(GDBusConnection* connection, const gchar* sender, const gchar* objectPath, 
                             const gchar* interfaceName, const gchar* propertyName, GError** error, gpointer userData);
static gboolean setProperty(GDBusConnection * connection, const gchar * sender, const gchar *objectPath,
                            const gchar *interfaceName, const gchar * propertyName, GVariant *value,
                            GError** error, gpointer userData);
static void registerDBusInterface(GDBusConnection *connection);

// Server function prototypes
static void *start_camera_stream_thread(void *args);
static int start_camera_stream_server(int cameraID, int port);
static void stop_camera_stream_server(int cameraID);
static void server_send_dbus_notification(int cameraID, int status);
static void server_set_status(int cameraID, int status);

// Camera status notification prototypes
static void *update_ip_cameras_status(void *args);
static void *update_usb_cameras_status(void *args);
static void *update_analog_cameras_status(void *args);
static int verifyRTSPStream(int sock, char *location);
static void setCameraStatus(int cameraID, int cameraStatus);

// v4l2 function prototypes
static char* v4l2_get_device_name(char *bus);
static int v4l2_getCurrentVideoInput(char *source);
static int v4l2_getCurrentVideoInputStatus(char *source, int input);
static int v4l2_setCurrentVideoInput(char *dev_name, int input);
static v4l2_std_id v4l2_convert_pal_standard(const char *str);
static v4l2_std_id v4l2_convert_ntsc_standard(const char *str);
static v4l2_std_id v4l2_convert_secam_standard(const char *str);

// General prototypes
static void signal_handler(int sig);
static int getGSTLaunchCommand(int camera_id, char *name, int buf_length);
static xmlChar *getCameraAttributeValue(int camera_id, char *attr_name);

static void set_streaming_mode(int camID);
/*============================================================================

                        FUNCTION DEFINITIONS

===========================================================================*/

/*===========================================================================

FUNCTION
    on_bus_acquired

DESCRIPTION
    This callback is invoked when the bus is acquired.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: connection - A GDBusConnection.
    IN: name - Name of a connection.
    IN: user_data - The user_data gpointer passed to g_bus_own_name().

RETURN VALUE
    None

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static void on_bus_acquired (GDBusConnection *connection, const gchar *name, gpointer user_data)
{
    LOG(APP_PREFIX "Registering DBus interface...\n");
    registerDBusInterface(connection);
}

/*===========================================================================

FUNCTION
    on_name_acquired

DESCRIPTION
    This callback is invoked when the name is acquired.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: connection - A GDBusConnection.
    IN: name - Name of a connection.
    IN: user_data - The user_data gpointer passed to g_bus_own_name().

RETURN VALUE
    None

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static void on_name_acquired (GDBusConnection *connection, const gchar *name, gpointer user_data)
{
    LOG(APP_PREFIX "Name acquired: %s\n", name);
}

/*===========================================================================

FUNCTION
    on_name_lost

DESCRIPTION
    This callback is invoked if a connection to the bus can't be made or 
    if the appropriate name can't be obtained.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: connection - A GDBusConnection. NULL if a connection to the bus can't be made.
    IN: name - Name of a connection.
    IN: user_data - The user_data gpointer passed to g_bus_own_name().

RETURN VALUE
    None

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static void on_name_lost (GDBusConnection *connection, const gchar *name, gpointer user_data)
{
        if(connection == NULL)
        { 
            LOG(APP_PREFIX "Connection is null\n");
        }
        LOG(APP_PREFIX "DBus: Lost bus name: %s\n", name);
        exit(-1);
}

/*===========================================================================

FUNCTION
    handleMethodCall

DESCRIPTION
    Handles D-Bus methods calls on com.jlr.JLRCameras.CamerasInterface 
    interface.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: connection - A GDBusConnection.
    IN: sender - The unique bus name of the remote caller.
    IN: object_path - The object path that the method was invoked on.
    IN: interface_name - The D-Bus interface name for the property.
    IN: method_name - The name of the method to be invoked.
    IN: parameters - Parameters of the method.
    IN: invocation - Object for handling remote calls.
    IN: user_data - The user_data gpointer passed to g_dbus_connection_register_object().

RETURN VALUE
    None

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static void handleMethodCall(GDBusConnection       *connection,
                             const gchar           *sender,
                             const gchar           *object_path,
                             const gchar           *interface_name,
                             const gchar           *method_name,
                             GVariant              *parameters,
                             GDBusMethodInvocation *invocation,
                             gpointer               user_data)
{

        LOG(APP_PREFIX "DBus method call from: %s, interface: %s, method: %s\n", sender, interface_name, method_name);

        if (g_strcmp0 (method_name, "startCameraStreamingServer") == 0)
        {
            // Request for execution of startCameraStreamingServer method was received on 
            // com.jlr.JLRCameras.CamerasInterface interface. Starting streaming server on appropriate port.
            gint cameraID;
            gint port;
            gint ret;

            g_variant_get (parameters, "(ii)", &cameraID, &port);

            LOG(APP_PREFIX "startCameraStreamingServer method was requested for camera %d on port %d. \n", cameraID, port);

            ret = start_camera_stream_server(cameraID, port);
            g_dbus_method_invocation_return_value (invocation, g_variant_new("(i)", ret));
        }
        else if (g_strcmp0 (method_name, "stopCameraStreamingServer") == 0)
        {
            // Request for execution of stopCameraStreamingServer method was received on 
            // com.jlr.JLRCameras.CamerasInterface interface. Stop streaming server on appropriate port.
            gint cameraID;

            g_variant_get (parameters, "(i)", &cameraID);

            LOG(APP_PREFIX "stopCameraStreamingServer method was requested for camera %d. \n", cameraID);

            stop_camera_stream_server(cameraID);
            g_dbus_method_invocation_return_value (invocation, NULL);
        }
        else if (g_strcmp0 (method_name, "getCameraStatus") == 0)
        {
            // Request for camera status was received on
            // com.jlr.JLRCameras.CamerasInterface interface.
            gint cameraID;
            gint ret;

            g_variant_get (parameters, "(i)", &cameraID);

            LOG(APP_PREFIX "getCameraStatus method was requested for camera %d. \n", cameraID);

            if(cameraID < CAMERA_USB0 ||
               cameraID >= CAMERA_ANALOG_MAX)
            {
                ret = -1;
            }
            else
            {
                ret = cam_status[cameraID].status;
                LOG(APP_PREFIX "Return value is %d\n", ret);
            }

            g_dbus_method_invocation_return_value (invocation, g_variant_new("(i)", ret));
        }
        else if(g_strcmp0(method_name, "getCameraStreamType")==0)
        {
            gint cameraID;
            gint ret;

            g_variant_get (parameters, "(i)", &cameraID);

            LOG(APP_PREFIX "getCameraStreamType method was requested for camera %d. \n", cameraID);

            ret = servers[cameraID].is_screenshot_stream;
            LOG(APP_PREFIX "Return value is %d\n", ret);

            g_dbus_method_invocation_return_value (invocation, g_variant_new("(i)", ret));
        }
        else if(g_strcmp0 (method_name, "findSignal") == 0)
        {
            // Request for execution of findSignal method was received on
            // com.jlr.JLRCameras.CamerasInterface interface. Seraching for appropriate signal.
            GVariant *result;
            gchar* signalName;

            g_variant_get(parameters,"(s)",&signalName);

            if(g_strcmp0 (signalName, "CameraServerStatusChanged") == 0 ||
               g_strcmp0 (signalName, "CameraStatusChanged") == 0)
            {
                result = g_variant_new ("(b)", TRUE);
            }
            else
            {
                result = g_variant_new ("(b)", FALSE);
            }

            g_dbus_method_invocation_return_value(invocation, result);
        }
    else
    {
        // Unknown method was requested.
        g_dbus_method_invocation_return_error(invocation, G_DBUS_ERROR,G_DBUS_ERROR_UNKNOWN_METHOD, "Unknown method.");
    }
}

/*===========================================================================

FUNCTION
    getProperty

DESCRIPTION
    The type of the get_property function in GDBusInterfaceVTable.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: connection - A GDBusConnection.
    IN: sender - The unique bus name of the remote caller.
    IN: object_path - The object path that the method was invoked on.
    IN: interface_name - The D-Bus interface name for the property.
    IN: property_name - The name of the property to get the value of.
    OUT: error - Return location for error.
    IN: user_data - The user_data gpointer passed to g_dbus_connection_register_object().

RETURN VALUE
    A GVariant with the value for property_name or NULL if error is set. 
    If the returned GVariant is floating, it is consumed - otherwise its reference count is decreased by one.

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static GVariant* getProperty(GDBusConnection* connection, const gchar* sender, const gchar* objectPath, 
                             const gchar* interfaceName, const gchar* propertyName, GError** error, gpointer userData)
{
    return NULL;
}

/*===========================================================================

FUNCTION
    setProperty

DESCRIPTION
    The type of the set_property function in GDBusInterfaceVTable.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: connection - A GDBusConnection.
    IN: sender - The unique bus name of the remote caller.
    IN: object_path - The object path that the method was invoked on.
    IN: interface_name - The D-Bus interface name for the property.
    IN: property_name - The name of the property to get the value of.
    IN: value - The value to set the property to.
    OUT: error - Return location for error.
    IN: user_data - The user_data gpointer passed to g_dbus_connection_register_object().

RETURN VALUE
    TRUE if the property was set to value, FALSE if error is set.

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static gboolean setProperty(GDBusConnection * connection, const gchar * sender, const gchar *objectPath,
                            const gchar *interfaceName, const gchar * propertyName, GVariant *value,
                            GError** error, gpointer userData)
{
    return FALSE;
}


// Virtual table for handling properties and method calls for 
// com.jlr.JLRCameras.CamerasInterface D-Bus interface.
static const GDBusInterfaceVTable interfaceVTable =
{
    handleMethodCall,
    getProperty,
    setProperty
};

/*===========================================================================

FUNCTION
    registerDBusInterface

DESCRIPTION
    Registers D-Bus com.jlr.JLRCameras.CamerasInterface interface of a system bus.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: connection - System bus D-Bus connection.
    
RETURN VALUE
    None

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static void registerDBusInterface(GDBusConnection *connection)
{
    GError* error = NULL;
    guint regId;

    GDBusNodeInfo* camera_node_info = g_dbus_node_info_new_for_xml(camera_xml, &error);

    g_assert (camera_node_info != NULL);

    GDBusInterfaceInfo* mInterfaceInfo = g_dbus_node_info_lookup_interface(camera_node_info, "com.jlr.JLRCameras.CamerasInterface");

    regId = g_dbus_connection_register_object(connection, "/", mInterfaceInfo, &interfaceVTable, NULL, NULL, &error);
    g_dbus_node_info_unref(camera_node_info);

    if(error)
    {
        LOG(APP_PREFIX "Unable to register D-bus object\n");
        g_error_free(error);
    }

    g_assert(regId > 0);
}

/*===========================================================================

FUNCTION
    server_set_status

DESCRIPTION
    Change status of the streaming server and notifies client using D-Bus CameraServerStatusChanged
    event on com.jlr.JLRCameras.CamerasInterface.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: cameraID - ID of a camera.
    IN: status - Server status. May be one of the following:
         WAITING_FOR_CONNECTION - Server is waiting for connection.
         STREAMING - Server is streaming.
         SHUTDOWN - Server is shutting down.
    
RETURN VALUE
    None

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static void server_set_status(int cameraID, int status)
{
    if(servers[cameraID].status != status)
    {
        servers[cameraID].status = status;
        LOG(APP_PREFIX "Server for camera %d: changing status to %d\n", cameraID, status);
        g_dbus_connection_emit_signal (g_bus_get_sync(G_BUS_TYPE_SYSTEM, NULL,NULL),
                                       NULL, "/", "com.jlr.JLRCameras.CamerasInterface", "CameraServerStatusChanged",
                                       g_variant_new("(ii)", cameraID, status), NULL);

        if(status == SHUTDOWN || status == EMERGENCY_SHUTDOWN)
        {
            if(servers[cameraID].thread_id != 0)
            {
                if(servers[cameraID].server_socket != -1)
                {
                    close(servers[cameraID].server_socket);
                }
                if(servers[cameraID].listener_socket != -1)
                {
                    close(servers[cameraID].listener_socket);
                }
                if(servers[cameraID].filedes[0] != -1)
                {
                    close(servers[cameraID].filedes[0]);
                }
                if(servers[cameraID].filedes[1] != -1)
                {
                    close(servers[cameraID].filedes[1]);
                }
      
                if(servers[cameraID].gst_pid != 0)
                {
                    LOG(APP_PREFIX "killing gstreamer...\n");
                    // Send SIGTERM to the GStreamer process.
                    kill(servers[cameraID].gst_pid, SIGTERM);
                }
            }     
            memset(&servers[cameraID], 0, sizeof(struct stream_server));
        }
    } 
}

/*===========================================================================

FUNCTION
    start_camera_stream_server

DESCRIPTION
    Starts camera streaming server.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: cameraID - ID of a camera for which server should be started.
    IN: port - TCP port number to listen on.
    
RETURN VALUE
    0 - Server was sucessfully started.
   -1 - Otherwise.

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static int start_camera_stream_server(int cameraID, int port)
{
    int i;
    char buffer[128];
    xmlChar *value;
    xmlChar *screenshot_stream;

    LOG(APP_PREFIX "start_camera_stream_server Entered\n");

    // Check incoming parameters.
    if(cameraID < 0 || cameraID >= CAMERA_ID_MAX ||
       port < 0 || port > 65535)
    {
        LOG(APP_PREFIX "Invalid cameraID or port parameter\n");
        return -1;
    }

    if(servers[cameraID].thread_id != 0 || servers[cameraID].status != NONE)
    {
        // Thread is already launched.
        LOG(APP_PREFIX "Server for the requested camera is already launched\n");
        return -1;
    }

    if(getGSTLaunchCommand(cameraID, servers[cameraID].gst_launch_command, sizeof(servers[cameraID].gst_launch_command)) < 0)
    {
        LOG(APP_PREFIX "Unable to get camera name\n");
        // Unable to get camera name from the system.
        return -1; 
    }


    // Get camera's type from the config.xml
    if((value = getCameraAttributeValue(cameraID, "type")) != NULL)
    {
        strncpy(servers[cameraID].camera_type, value, sizeof(servers[cameraID].camera_type) - 1);
        servers[cameraID].camera_type[sizeof(servers[cameraID].camera_type) - 1] = '\0';
        xmlFree(value);
    }
    else
    {
        LOG(APP_PREFIX "Unable to get camera %d type\n", cameraID);
        return -1;
    }

    if(strcmp(servers[cameraID].camera_type, "ANALOG") == 0)
    {
        // Video from one ANALOG camera can be streamed at a time.
        // Check if video from the ANALOG camera is streaming already.
        for(i = 0; i < CAMERA_ID_MAX; i++)
        {
            if(servers[i].thread_id != 0 && cameraID != i)
            {
                if(strcmp(servers[i].camera_type, "ANALOG") == 0)
                {
                    LOG(APP_PREFIX "Video from ANALOG camera is already streaming\n");
                    return -1;
                }
            }
        }
    }

    // Get camera's location from the config.xml
    if((value = getCameraAttributeValue(cameraID, "location")) != NULL)
    {
        if(strcmp(servers[cameraID].camera_type, "USB") == 0 || 
           strcmp(servers[cameraID].camera_type, "ANALOG") == 0)
        {
            char *v4l2_dev_name = v4l2_get_device_name(value);
            if(v4l2_dev_name != NULL)
            {
                strncpy(servers[cameraID].source, v4l2_dev_name, sizeof(servers[cameraID].source) - 1);
                servers[cameraID].source[sizeof(servers[cameraID].source) - 1] = '\0';
            }
            else
            {
                LOG(APP_PREFIX "Unable to get v4l2 device name for camera %d type on bus %s\n", cameraID, value);
                xmlFree(value);
                return -1;      
            }             
     
        }
        else if(strcmp(servers[cameraID].camera_type, "IP") == 0)
        {
            strncpy(servers[cameraID].source, value, sizeof(servers[cameraID].source) - 1);
            servers[cameraID].source[sizeof(servers[cameraID].source) - 1] = '\0';         
            LOG(APP_PREFIX "source: %s, launch_cmd: %s\n", servers[cameraID].source, servers[cameraID].gst_launch_command);
        }

        xmlFree(value);
    }
    else
    {
        LOG(APP_PREFIX "Unable to get camera %d location\n", cameraID);
        return -1;
    }

    servers[cameraID].camera_id = cameraID;
    servers[cameraID].port = port;
    servers[cameraID].exit_flag = 0;
    servers[cameraID].gst_pid = 0;
    servers[cameraID].listener_socket = -1;
    servers[cameraID].server_socket = -1;
    servers[cameraID].filedes[0] = -1;
    servers[cameraID].filedes[1] = -1;
    set_streaming_mode(cameraID);

    // Start camera thread
    pthread_create(&servers[cameraID].thread_id, NULL, start_camera_stream_thread, (void*)&servers[cameraID]);
    return 0;
}


/*===========================================================================

FUNCTION
    stop_camera_stream_server

DESCRIPTION
    Stops camera streaming server.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: cameraID - ID of a camera for which server should be stopped..
    
RETURN VALUE
    None

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static void stop_camera_stream_server(int cameraID)
{
    LOG(APP_PREFIX "stop_camera_stream_server entered");

    // Check incoming parameters.
    if(cameraID >= 0 & cameraID < CAMERA_ID_MAX)
    {
        if(servers[cameraID].status == WAITING_FOR_CONNECTION)
        {
            // Server is waiting for connection. Terminate it.
            close(servers[cameraID].listener_socket);
            pthread_cancel(servers[cameraID].thread_id);
            server_set_status(cameraID, SHUTDOWN);
            memset(&servers[cameraID], 0, sizeof(struct stream_server));
        }
        else if(servers[cameraID].status == STREAMING)
        {
            pthread_mutex_lock(&lock);
            servers[cameraID].exit_flag = 1;
            pthread_cond_signal(&ready);
            pthread_mutex_unlock(&lock);
            LOG(APP_PREFIX "signaling waiting thread...\n");
        }
    }
    return;
}

/*===========================================================================

FUNCTION
    v4l2_getCurrentVideoInputStatus

DESCRIPTION
    Gets current status for the requested video input of v4l2 device 
      
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: source - v4l2 device name of the MPX-855 video capture card,
    i.e. /dev/videoX

    IN: input - video input to get status on.
        
RETURN VALUE
    video input status >=0, if it was sucessfully obtained, -1 otherwise. 

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static int v4l2_getCurrentVideoInputStatus(char *source, int input)
{
    int fd;
    struct v4l2_input v_input;
 
    if(source == NULL)
    {
        return -1;
    }

    if((fd = v4l2_open(source, O_RDONLY)) < 0)
    {
        LOG(APP_PREFIX "Failed to open %s: %s\n", source, strerror(errno));
        return -1;    
    }

    v_input.index = input; 

    if(v4l2_ioctl(fd, VIDIOC_ENUMINPUT, &v_input) < 0)
    {
        LOG(APP_PREFIX "Unable to get video input status for device %s: %s\n", source, strerror(errno));
        return -1;
    }

    v4l2_close(fd);

    return v_input.status;
}

/*===========================================================================

FUNCTION
    v4l2_getCurrentVideoInput

DESCRIPTION
    Gets current video input of v4l2 device.
      
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: source - v4l2 device name of the MPX-855 video capture card,
    i.e. /dev/videoX

RETURN VALUE
    video input >=0, if it was sucessfully obtained, -1 otherwise. 

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static int v4l2_getCurrentVideoInput(char *source)
{
    int fd;
    int curr_input;

    if(source == NULL)
    {
        return -1;
    }

    if((fd = v4l2_open(source, O_RDONLY)) < 0)
    {
        LOG(APP_PREFIX "Failed to open %s: %s\n", source, strerror(errno));
        return -1;    
    }

    if(v4l2_ioctl(fd, VIDIOC_G_INPUT, &curr_input) < 0)
    {
        LOG(APP_PREFIX "Unable to get current video input for device %s: %s\n", source, strerror(errno));
        return -1;
    }
    
    v4l2_close(fd);

    return curr_input;
}

/*===========================================================================

FUNCTION
    v4l2_setCurrentVideoInput

DESCRIPTION
    Sets current video input of v4l2 device.
      
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: source - v4l2 device name of the MPX-855 video capture card,
    i.e. /dev/videoX
    IN: input - video input to set.

RETURN VALUE
    0, if it was sucessfully set, -1 otherwise. 

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static int v4l2_setCurrentVideoInput(char *dev_name, int input)
{
    int fd;

    if(dev_name == NULL)
    {
        return -1;
    }

    if((fd = v4l2_open(dev_name, O_RDONLY)) < 0)
    {
        LOG(APP_PREFIX "Failed to open %s: %s\n", dev_name, strerror(errno));
        return -1;    
    }

    if(v4l2_ioctl(fd, VIDIOC_S_INPUT, &input) < 0)
    {
        LOG(APP_PREFIX "Unable to set video input %d for device %s: %s\n", input, dev_name, strerror(errno));
        return -1;
    }
    
    v4l2_close(fd);

    return 0;
}

/*===========================================================================

FUNCTION
    v4l2_convert_pal_standard

DESCRIPTION
    Converts PAL standard, represented by string, to v4l2_std_id.
      
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: str - PAL standard name, i.e. PAL-H, PAL-B, PAL-Nc, etc..

RETURN VALUE
    v4l2_std_id >= 0, if standard was recognized, -1 otherwise.

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static v4l2_std_id v4l2_convert_pal_standard(const char *str)
{
    if(str[0] == '-')
    {
        switch(str[1])
        {
            case 'B':
            case 'G':
                return V4L2_STD_PAL_BG;
            case 'H':
                return V4L2_STD_PAL_H;
            case 'I':
                return V4L2_STD_PAL_I;
            case 'D':
            case 'K':
                return V4L2_STD_PAL_DK;
            case 'M':
                return V4L2_STD_PAL_M;
            case 'N':
                if(str[2] == 'c')
                {
                    return V4L2_STD_PAL_Nc;                 
                }
                return V4L2_STD_PAL_N;
            case '6':
                return V4L2_STD_PAL_60;
        }
    }
    return -1;
}

/*===========================================================================

FUNCTION
    v4l2_convert_ntsc_standard

DESCRIPTION
    Converts NTSC standard, represented by string, to v4l2_std_id.
      
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: str - NTSC standard name, i.e. NTSC-M, NTSC-K, NTSC-J, etc..

RETURN VALUE
    v4l2_std_id >= 0, if standard was recognized, -1 otherwise.

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static v4l2_std_id v4l2_convert_ntsc_standard(const char *str)
{
    if(str[0] == '-')
    {
        switch(str[1])
        {
            case 'M':
                return V4L2_STD_NTSC_M;
            case 'K':
                return V4L2_STD_NTSC_M_KR;
            case 'J':
                return V4L2_STD_NTSC_M_JP;
        }
    }
    return -1;
}

/*===========================================================================

FUNCTION
    v4l2_convert_secam_standard

DESCRIPTION
    Converts SECAM standard, represented by string, to v4l2_std_id.
      
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: str - SECAM standard name, i.e. SECAM-B, SECAM-D, SECAM-Lc, etc..

RETURN VALUE
    v4l2_std_id >= 0, if standard was recognized, -1 otherwise.

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static v4l2_std_id v4l2_convert_secam_standard(const char *str)
{
    if(str[0] == '-')
    {
        switch(str[1])
        {
            case 'B':
            case 'G':
            case 'H':
                return V4L2_STD_SECAM_B | V4L2_STD_SECAM_G | V4L2_STD_SECAM_H;
            case 'D':
            case 'K':
                return V4L2_STD_SECAM_DK;
            case 'L':
                if(str[2] == 'c')
                {
                    return V4L2_STD_SECAM_LC;                 
                }
                return V4L2_STD_SECAM_L;
        }
    }
    return -1;
}

/*===========================================================================

FUNCTION
    v4l2_setCurrentVideoStandard

DESCRIPTION
    Sets current video standard(i.e. pal, ntsc, secam) of v4l2 device.
      
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: source - v4l2 device name of the MPX-855 video capture card,
    i.e. /dev/videoX
    IN: standard - video input standard. 
        Execute "v4l2-ctl -d /dev/videoX --list-standards" to verify  
        list of standards available.

RETURN VALUE
    0, if standard was sucessfully set, -1 otherwise. 

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static int v4l2_setCurrentVideoStandard(char *dev_name, char *standard)
{
    int fd;
    v4l2_std_id std = -1;

    if(dev_name == NULL)
    {
        return -1;
    }

    if((fd = v4l2_open(dev_name, O_RDONLY)) < 0)
    {
        LOG(APP_PREFIX "Failed to open %s: %s\n", dev_name, strerror(errno));
        return -1;    
    }

    if(strncmp(standard, "NTSC", 4) == 0)
    {
        if(strlen(standard) == 4)
        {
            std = V4L2_STD_NTSC;
        }
        else
        {
            std = v4l2_convert_ntsc_standard(standard + 4);
        }
    }
    else if(strncmp(standard, "PAL", 3) == 0)
    {
        if(strlen(standard) == 3)
        {
            std = V4L2_STD_PAL;
        }
        else
        {
            std = v4l2_convert_pal_standard(standard + 3);
        }
    }
    else if(strncmp(standard, "SECAM", 5) == 0)
    {
        if(strlen(standard) == 5)
        {
            std = V4L2_STD_SECAM;
        }
        else
        {
            std = v4l2_convert_secam_standard(standard + 5);
        }
    }

    if(std == -1)
    {
        LOG(APP_PREFIX "Unknown standard: %s. Please launch \"v4l2-ctl -d /dev/videoX --list-standards\" for standards supported\n", standard);
        return -1;
    }

    if(v4l2_ioctl(fd, VIDIOC_S_STD, &std) < 0)
    {
        LOG(APP_PREFIX "Unable to set video standard %08llx for device %s: %s\n", std, dev_name, strerror(errno));
        return -1;
    }
    else
    {
        LOG(APP_PREFIX "Standard for %s set to %08llx\n", dev_name, (unsigned long long)std);
    }
    
    v4l2_close(fd);

    return 0;
}

/*===========================================================================

FUNCTION
    v4l2_get_device_name

DESCRIPTION
    Gets v4l2 device's name in /dev directory buy the bus path.
      
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: bus - bus path of the video device.
        
RETURN VALUE
    v4l2 device name, if found, for example /dev/video0, NULL otherwise.
    Caller is responsible for freeing the obtained buffer.

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static char* v4l2_get_device_name(char *bus)
{
    DIR *dir_ptr;
    struct dirent *dir_entry;
    char *v4l2_dev_name = NULL;

    dir_ptr = opendir("/dev");
    if (dir_ptr == NULL) 
    {
        LOG(APP_PREFIX "Couldn't open /dev directory\n");
        return NULL;
    }

    // Look into /dev directory and search for v4l2 devices(started with "video")
    while ((dir_entry = readdir(dir_ptr)))
    {  
        if(memcmp(dir_entry->d_name, "video", 5) == 0)
        {
            int fd;
            char dev_name[64];
            struct v4l2_capability vcap;
    
            memcpy(dev_name, "/dev/", 5);
            strncpy(dev_name + 5, dir_entry->d_name, strlen(dir_entry->d_name));
            dev_name[5 + strlen(dir_entry->d_name)] = '\0';

            // Query v4l2 device information
            fd = v4l2_open(dev_name, O_RDWR);
            v4l2_ioctl(fd, VIDIOC_QUERYCAP, &vcap);
            v4l2_close(fd);

            if(strcmp(bus, vcap.bus_info) == 0)
            {
                // Appropriate /dev/videoX node for the bus is found.
                v4l2_dev_name = malloc(strlen(dev_name) + 1);
                if(v4l2_dev_name)
                {
                    strncpy(v4l2_dev_name, dev_name, strlen(dev_name));
                    v4l2_dev_name[strlen(dev_name)] = '\0';
                    break;
                }
            }

        }            
    }
    closedir(dir_ptr);

    return v4l2_dev_name;
}


/*===========================================================================

FUNCTION
    getCameraAttributeValue

DESCRIPTION
    Parses config.xml and gets value for the requested attribute.
      
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: camera_id - ID of a camera.
    IN: attr_name - attribute name
    
RETURN VALUE
    Attribute's value, if the value was sucessfully obtained, 
    NULL otherwise.

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static xmlChar *getCameraAttributeValue(int camera_id, char *attr_name)
{
    xmlDoc         *document;
    xmlNode        *root, *first_child, *node;
    xmlChar        *key_value = NULL;
    int            ret = -1;

    pthread_mutex_lock(&get_attribute_lock);

    // Document should be placed in the right place
    document = xmlReadFile("/etc/jlr_cmss/config.xml", NULL, 0);

    if(document == NULL)
    {
        LOG(APP_PREFIX "Unable to open /etc/jlr_cmss/config.xml file: %s\n", strerror(errno));
        return NULL;
    }

    root = xmlDocGetRootElement(document);

    if(root == NULL)
    {
        LOG(APP_PREFIX "Unable to get root element in config.xml\n");
        xmlFreeDoc(document);
        return NULL;
    }

    first_child = root->children;
    
    // Looking for camera nodes    
    for (node = first_child; node; node = node->next) 
    {
        if (!xmlStrcmp(node->name, (const xmlChar *) "camera")) 
        {
            // Found camera config
            xmlChar *id;

            id = xmlGetProp(node, "id");
            if(camera_id == atoi(id))
            {
                // Found config for the requested camera
                xmlNodePtr cur = node->xmlChildrenNode;

                while (cur != NULL) 
                {          
                    if (xmlStrcmp(cur->name, (const xmlChar *) attr_name) == 0)
                    {
                        key_value = xmlNodeListGetString(document, cur->xmlChildrenNode, 1);
                        break; 
                    }
                    cur = cur->next;
                }
            }
            xmlFree(id);
        }
    }

    // These functions are not re-enterable.
    // Need to lock on mutex while using them.
    xmlFreeDoc(document);

    pthread_mutex_unlock(&get_attribute_lock);

    return key_value;
}

/*===========================================================================

FUNCTION
    getGSTLaunchCommand

DESCRIPTION
    Gets launch command for gstreamer with the video source, but without the sink, for example:
    /usr/bin/gst-launch-1.0 -q rtspsrc camera_source rtph264depay ! h264parse ! mp4mux fragment-duration=10000 streamable=1
    Sink will be added when the pipe between GSTLauncher and GStreamer will be created.
      
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: camera_id - ID of a camera.
    IN: name - Buffer for GStreamer launch command.
    IN: buf_length - length of the buffer provided.
    
RETURN VALUE
    0, if the command was successfully constructed, -1 otherwise.
    Command will be copied to the name buffer on success.

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static int getGSTLaunchCommand(int camera_id, char *name, int buf_length)
{
    xmlChar        *camera_type = NULL;
    xmlChar        *camera_location = NULL;
    xmlChar        *gst_launch_command = NULL;
    char           *video_source = NULL;
    int            ret = -1;

    camera_type = getCameraAttributeValue(camera_id, "type");
    camera_location = getCameraAttributeValue(camera_id, "location");
    gst_launch_command = getCameraAttributeValue(camera_id, "gst_launch_cmd");

    // Check if all parameters for camera are present in the config file,
    // and if the provided buffer is big enough.
    if(camera_type != NULL && camera_location != NULL && gst_launch_command != NULL)
    {
        ret = 0;
    }

    if(ret == 0)
    {
        ret = -1;

        if (xmlStrcmp(camera_type, (const xmlChar *) "USB") == 0 || 
            xmlStrcmp(camera_type, (const xmlChar *) "ANALOG") == 0)
        { 
            // For v4l2 devices need to find it's name in /dev directory
            // by the bus path
            video_source  =  v4l2_get_device_name(camera_location);
        }
        else
        {  
            // For other devices keep the location as is.
            video_source = malloc(strlen(camera_location) + 1);
            strncpy(video_source, camera_location, strlen(camera_location));
            video_source[strlen(camera_location)] = '\0';
        }

        if(video_source != NULL)
        {
            int gst_cmd_length = xmlStrlen(gst_launch_command) + xmlStrlen(video_source) -
                                 xmlStrlen("video_source") + 2; 

            // Check if provided buffer is big enough
            if(gst_cmd_length <= buf_length)
            {
                ret = 0;

                char *ptr = strtok (gst_launch_command, " ");
                name[0] = '\0';
                if(ptr == NULL)
                {
                    strcat(name, gst_launch_command);
                }
                else
                {
                    while (ptr != NULL)
                    {  
                        // Change video_source parameter on a proper one. 
                        if(strcmp(ptr,"video_source") == 0)
                        {   
                            strcat(name, video_source);
                        }
                        else
                        {
                            strcat(name, ptr);
                        }

                        strcat(name, " ");
                        ptr = strtok (NULL, " ");
                    }
                    name[strlen(name) - 1] = '\0';
                }
            }
        }       
    }

    if(video_source != 0)
    {
        free(video_source);
    }

    if(camera_type != NULL)
    {
        xmlFree(camera_type); 
    }
    
    if(camera_location != NULL)
    {
        xmlFree(camera_location); 
    }
  
    if(gst_launch_command != NULL) 
    {
        xmlFree(gst_launch_command); 
    }

    return ret;
}

/*===========================================================================

FUNCTION
    start_camera_stream_thread

DESCRIPTION
    Main thread streaming function. 
    After D-Bus request for new streaming server creation is received, it creates the server listening 
    on appropriate port and waits for connections. When request for new connection is received, it 
    starts new GStreamer process, creates pipe between parent process and the newly created GStreamer 
    instance and starts streaming camera video from GStreamer to the client via TCP protocol.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: args - server_addr data.
    
RETURN VALUE
    None

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static void *start_camera_stream_thread(void *args)
{
    struct stream_server *params = (struct stream_server*)args;
    struct sockaddr_in server_addr;
    int    listener, sock;
    char   buffer[115200];
    int    bytes_read, bytes_sent;
    int    filedes[2];
    int    retval;
    struct timeval tv;
    fd_set rfds;
    char   cl_rf[2];
    int    cameraID = params->camera_id;
    char   *v4l2_dev_name = NULL;
    xmlChar *value;
 
    cl_rf[0] = 0x0D;
    cl_rf[1] = 0x0A;

    LOG(APP_PREFIX "Camera stream for camera %d (%s) started\n", cameraID, params->camera_type);
    LOG(APP_PREFIX "Camera source: %s\n", params->source);


    if(!params->is_screenshot_stream)
    {
        if((listener = socket(AF_INET, SOCK_STREAM, 0)) < 0)
        {
            LOG(APP_PREFIX "Cannot create listening socket\n");
            server_set_status(cameraID, EMERGENCY_SHUTDOWN);
            return NULL;
        }

        memset(&server_addr, 0, sizeof(server_addr));
        server_addr.sin_family      = AF_INET;
        server_addr.sin_addr.s_addr = htonl(INADDR_ANY);
        server_addr.sin_port        = htons(params->port);

        if(bind(listener, (struct sockaddr *) &server_addr, sizeof(server_addr)) < 0)
        {
            // ToDo: Need to notify client that selected address is busy.
            LOG(APP_PREFIX "Cannot bind listening socket: %s\n", strerror(errno));
            server_set_status(cameraID, EMERGENCY_SHUTDOWN);
            return NULL;
        }
     
        if(listen(listener, 1) < 0)
        {
            LOG(APP_PREFIX "Cannot bind listening socket\n");
            server_set_status(cameraID, EMERGENCY_SHUTDOWN);
            return NULL;
        }

        params->listener_socket = listener;

        server_set_status(cameraID, WAITING_FOR_CONNECTION);

        sock = accept(listener, NULL, NULL);
        if(sock < 0)
        {
        LOG(APP_PREFIX "Unable to accept listening socket\n");
        server_set_status(cameraID, EMERGENCY_SHUTDOWN);
            return NULL;
        }

        params->server_socket = sock; 
    }

    // Check if thread handles analog camera's video.
    if(strcmp(params->camera_type, "ANALOG") == 0)
    {
        // Get camera's input from the config.
        if((value = getCameraAttributeValue(cameraID, "standard")) != NULL)
        {
            LOG(APP_PREFIX "Set analog camera standard to %s\n", value);

            // Set video standard for the camera.
            if(v4l2_setCurrentVideoStandard(params->source, (char*)value) < 0)
            {
                LOG(APP_PREFIX "Unable to set camera %d standard to %s\n", cameraID, value);
                server_set_status(cameraID, EMERGENCY_SHUTDOWN);
                xmlFree(value);
                close(sock);
                close(listener);
                return NULL;
            }

            xmlFree(value);
        }
        else
        {
            LOG(APP_PREFIX "Unable to get camera standard for camera %d\n", cameraID);
            server_set_status(cameraID, EMERGENCY_SHUTDOWN);
            close(sock);
            close(listener);
            return NULL;
        }

        // Get camera's input from the config.
        if((value = getCameraAttributeValue(cameraID, "input")) != NULL)
        {
            int input = atoi(value);

            LOG(APP_PREFIX "Set analog camera input to %d\n", input);
 
            // Set video input for the camera.
            if(v4l2_setCurrentVideoInput(params->source, input) < 0)
            {
                LOG(APP_PREFIX "Unable to set camera %d input to %d\n", cameraID, input);
                server_set_status(cameraID, EMERGENCY_SHUTDOWN);
                xmlFree(value);
                close(sock);
                close(listener);
                return NULL;
            }

            xmlFree(value);
        }
        else
        {
            LOG(APP_PREFIX "Unable to get camera input for camera %d\n", cameraID);
            server_set_status(cameraID, EMERGENCY_SHUTDOWN);
            close(sock);
            close(listener);
            return NULL;
        }
    }


    if(!params->is_screenshot_stream)
    {
        // Send HTTP 200 OK response to the client
        bytes_read = recv(sock, buffer, sizeof(buffer), 0);
        bytes_sent = send(sock, http_response, strlen(http_response), 0);
        bytes_sent = send(sock, cl_rf, 2, 0);
        bytes_sent = send(sock, cl_rf, 2, 0);

        if (pipe(filedes) == -1) 
        {
            LOG(APP_PREFIX "Unable to create pipe\n");
            server_set_status(cameraID, EMERGENCY_SHUTDOWN);
            return NULL;
        }

        params->filedes[0] = filedes[0];
        params->filedes[1] = filedes[1];
    }

    // Fork to start GStreamer process
    pid_t pid = fork();
    if (pid == -1)
    {
        LOG(APP_PREFIX "Unable to fork child process\n");
        server_set_status(cameraID, EMERGENCY_SHUTDOWN);
        return NULL;
    } 
    else if (pid == 0) 
    {
        // New process. GStreamer instance will replace it.
        char location[128];
        char launch_path[512];
        int count = 0;
        char *ptr;
        int i = 0;


        // GStreamer parameters will be provided as one string. Parameters will be separated 
        // by one space. So, calculate the number of GStreamer parameters.
        // It will be required for building arguments array for exec command.
        for(i = 0; i <= strlen(params->gst_launch_command); i++)
        {
            if(params->gst_launch_command[i] == ' ') count++;
        } 

        // Get GStreamer's binary path.
        ptr = strtok (params->gst_launch_command, " ");

        if(strlen(ptr) > sizeof(launch_path))
        {
            LOG(APP_PREFIX "Launch command is too long. Check configuration file. CMD: %s\n", ptr);
            _exit(0);
        }

        // Remember GStreamer's binary path
        strncpy(launch_path, ptr, strlen(ptr));
        launch_path[strlen(ptr)] = '\0';

        // Allocate memory for GStreamer parameters.
        // These parameters will be passed to the exec command. 
        char **args = (char **)malloc((count + 4) * sizeof(char *));

        count = 0;
        
        // Build GStreamer's arguments array
        while (ptr != NULL)
        {  
           ptr = strtok (NULL, " ");

           if(ptr != NULL)
           {
               args[count] = (char *)malloc((strlen(ptr) + 1) * sizeof(char));
               //LOG(APP_PREFIX "args[%d]=%s\n", count, ptr);
               strncpy(args[count], ptr, strlen(ptr));
               args[count][strlen(ptr)] = '\0';
               count++;
           }           
        }

        if(!params->is_screenshot_stream)
        {
            char fd_outp[10];
            sprintf(fd_outp, "fd=%d\n", filedes[1]);

            // It is required to add pipe's file descriptor as a GStreamer sink,
            // so we can receive media data from GStreamer.
            args[count] = (char *)malloc(50 * sizeof(char));
            strncpy(args[count], "!", sizeof("!"));
            args[count][strlen("!")] = '\0';

            count++;
            args[count] = (char *)malloc(50 * sizeof(char));
            strncpy(args[count], "fdsink", sizeof("fdsink"));
            args[count][strlen("fdsink")] = '\0';

            count++;
            args[count] = (char *)malloc(50 * sizeof(char));
            strncpy(args[count], fd_outp, strlen(fd_outp));
            args[count][strlen(fd_outp)] = '\0';
        }

        // Arguments array should be NULL-terminated.
        count++;
        args[count] = NULL;

        // Execute GStreamer
        int retval = execv(launch_path, args);

        LOG(APP_PREFIX "Exit from the process\n");
        _exit(0);
    }

    params->gst_pid = pid;

    if(!params->is_screenshot_stream)
    {
        while(1)
        {
            FD_ZERO(&rfds);
            FD_SET(filedes[0], &rfds);

            tv.tv_sec = 5;
            tv.tv_usec = 0;

            // Waiting for data from the GStreamer. Timeout value is 5 seconds.
            retval = select(filedes[0] + 1, &rfds, NULL, NULL, &tv);

            if (retval == -1)
            {
               // Just ignore Interrupted system call error.
               if (errno != EINTR)
               {
                   server_set_status(cameraID, EMERGENCY_SHUTDOWN);
                   break;                   
               }
            }
            else if (retval)
            {
               // Read chunk of media data from the GStreamer 
               ssize_t count = read(filedes[0], buffer, sizeof(buffer));

               if(count > 0)
               {
                  ssize_t sent;

                  if(params->status == WAITING_FOR_CONNECTION)
                  {
                      server_set_status(cameraID, STREAMING);
                  }

                      // Send media data to the HTTP client 
                  sent = send(sock, buffer, count, 0);
                  if(sent < 0)
                  {
                      LOG(APP_PREFIX "Camera #%d: Send error: %s\n", cameraID, strerror(errno));
                      server_set_status(cameraID, EMERGENCY_SHUTDOWN);
                      break;
                  }

                  if(params->exit_flag)
                  {
                      server_set_status(cameraID, SHUTDOWN);
                      break; 
                  }                 
               }
               else // Unable to read data from the GStreamer
               {
                   LOG(APP_PREFIX "Exiting...\n");
                   server_set_status(cameraID, EMERGENCY_SHUTDOWN);
                   break;
               }
            }
            else  // Timeout for waiting of GStreamer data
            {
               LOG(APP_PREFIX "No data within 5 seconds.\n");
               setCameraStatus(cameraID, CAMERA_SIGNAL_OFF);
               server_set_status(cameraID, EMERGENCY_SHUTDOWN);
               break;
            }
        }
    }
    else
    {
        server_set_status(cameraID, WAITING_FOR_CONNECTION);
        LOG(APP_PREFIX "setting screenshot camera to streaming...");
        server_set_status(cameraID, STREAMING);

        pthread_mutex_lock(&lock);
        while(!params->exit_flag)
          pthread_cond_wait(&ready, &lock);
        pthread_mutex_unlock(&lock);
        LOG(APP_PREFIX "Shutting down screenshot stream for gst with pid=%d.\n", params->gst_pid);
        server_set_status(cameraID, SHUTDOWN);
    }

    LOG(APP_PREFIX "Camera stream is closed\n");
    return NULL;
}


/*===========================================================================

FUNCTION
    signal_handler

DESCRIPTION
    When new request to get media from the camera is received by the server, it starts 
    new GStreamer process as a child process. Newly created pipe is used for getting media from the GStreamer.
    If the pipe is closed for some reason(camera was detached from the system, for example), 
    SIGPIPE signal is received by the server. Default behavior in this case is to kill the process.
    We don't want our server to be killed on receiving SIGPIPE signal, so need to handle it ourselves.
    
    SIGCHLD signal is recived when GStreamer process is closed. We need to handle this situation properly 
    using wait() method, so GStream instance don't become zombie process.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: sig - signal identifier.
    
RETURN VALUE
    None

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
void signal_handler(int sig)
{
    int status;
    int i;

    LOG(APP_PREFIX "Caught signal %d\n", sig);

    switch (sig)
    {
        case SIGCHLD:
            wait(&status);
            break;       
        case SIGPIPE:
            break;
        case SIGTERM:
        case SIGINT:
        case SIGKILL:
            for(i = 0; i < CAMERA_ID_MAX; i++)
            {
                if(servers[i].thread_id != 0)
                {
                    kill(servers[i].gst_pid, SIGTERM);
                    server_set_status(i, EMERGENCY_SHUTDOWN);
                }
            }
            LOG(APP_PREFIX "Exiting...\n");
            exit(0);
         default:
            break;
    }
}

/*===========================================================================

FUNCTION
    setCameraStatus

DESCRIPTION
    Sets appropriate status for the camera and emits CameraStatusChanged DBus signal.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: cameraID - id of the camera.
    IN: cameraStatus - status of the camera.
    
RETURN VALUE
    None

SIDE EFFECTS
    None

NOTE
    None
===========================================================================*/
static void setCameraStatus(int cameraID, int cameraStatus)
{
    pthread_mutex_lock(&set_status_lock);
    if(cameraStatus != cam_status[cameraID].status)
    {
        if(cameraStatus != CAMERA_SIGNAL_ON)
        {
            server_set_status(cameraID, EMERGENCY_SHUTDOWN);
        }
        LOG(APP_PREFIX "Status of camera %d changed to %d\n", cameraID, cameraStatus);
        cam_status[cameraID].status = cameraStatus;
        g_dbus_connection_emit_signal (g_bus_get_sync(G_BUS_TYPE_SYSTEM, NULL,NULL),
                                       NULL, "/", "com.jlr.JLRCameras.CamerasInterface", "CameraStatusChanged",
                                       g_variant_new("(ii)", cameraID, cameraStatus), NULL);
    }
    pthread_mutex_unlock(&set_status_lock);
}

/*===========================================================================

FUNCTION
    verifyRTSPStream

DESCRIPTION
    Verifies if RTSP stream is available by the url provided.
    Verification is done by sending DESCRIBE rtsp request to the server.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: sock - socket descriptor. Note: socket should be already connected to the rtsp server.
    IN: location - location of the rtsp stream, i.e. rtsp://<server>:554/live1.sdp
    
RETURN VALUE
    1, if stream is exist by the reqested url, 0 - otherwise

SIDE EFFECTS
    None

NOTE
    Passed socket should be connected to the rtsp server, the stream is checking on.
===========================================================================*/
static int verifyRTSPStream(int sock, char *location)
{
    int length;
    char resp[2048];
    int count = 0;
    char cseq[] = "CSeq: 1";
    char user_agent[] = "JLRCameras Media Streaming Server (JLRMSS)";
    char cl_rf[2] = {0x0D, 0x0A};
    char *rtsp_options_req = malloc(strlen("DESCRIBE ") + strlen(location) + strlen(" RTSP/1.0") + 2);
    int ret = 0;

    sprintf(rtsp_options_req, "DESCRIBE %s RTSP/1.0", location);

    send(sock, rtsp_options_req, strlen(rtsp_options_req), 0);
    send(sock, cl_rf, 2, 0);
    send(sock, cseq, strlen(cseq), 0);
    send(sock, cl_rf, 2, 0);
    send(sock, user_agent, strlen(user_agent), 0);
    send(sock, cl_rf, 2, 0);
    send(sock, cl_rf, 2, 0);

    count = recv(sock, resp, sizeof(resp), 0);
    if(count > 0 )
    {
        if(strncmp(resp + 9, "200 OK", 6) == 0)
        {
            ret = 1;
        }
    }
    free(rtsp_options_req);
    return ret;
}

/*===========================================================================

FUNCTION
    update_ip_cameras_status

DESCRIPTION
    Verifies and updates IP cameras statuses for each 3 seconds.
    Should be launched in separate thread.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: args - Not used.
    
RETURN VALUE
    None.

SIDE EFFECTS
    None

NOTE
    Should be launched in separate thread.
===========================================================================*/
static void *update_ip_cameras_status(void *args)
{
    int ip_cameras_num = CAMERA_IP_MAX - CAMERA_IP0;
    int sock[ip_cameras_num];
    struct sockaddr_in addr[ip_cameras_num];
    xmlURIPtr uri[ip_cameras_num];
    xmlChar *location[ip_cameras_num];
    int i;



    while(1)
    {
        fd_set fdset;
        FD_ZERO(&fdset);

        for(i = 0; i < ip_cameras_num; i++)
        {
            sock[i] = -1;
        }

        for(i = 0; i < ip_cameras_num; i++)
        {
            if((location[i] = getCameraAttributeValue(i + CAMERA_IP0, "location")) != NULL)
            {
                if((uri[i] = xmlParseURI(location[i])) != NULL)
                {
                    sock[i] = socket(AF_INET, SOCK_STREAM, 0);
                    if(sock[i] >= 0)
                    {
                        addr[i].sin_family = AF_INET;
                        addr[i].sin_port = htons(uri[i]->port);
                        addr[i].sin_addr.s_addr = inet_addr(uri[i]->server);
                        fcntl(sock[i], F_SETFL, O_NONBLOCK);
                        FD_SET(sock[i], &fdset);
                    }
                }
                else
                {
                    // Unable to parse camera's location.
                    setCameraStatus(i + CAMERA_IP0, UNAVAILABLE);
                }
            }
            else
            {
                // Unable to read config for the camera.
                setCameraStatus(i + CAMERA_IP0, UNAVAILABLE);
            }
        }

        for(i = 0; i < ip_cameras_num; i++)
        {
            if(sock[i] >= 0) 
            {
                // Non-blocking invocation. Should immediately return -1 with error code EWOULDBLOCK
                connect(sock[i], (struct sockaddr *)&addr[i], sizeof(addr[i]));
            }
        }

        for(;;)
        {
            int retval;
            struct timeval tv;

            tv.tv_sec = 3;
            tv.tv_usec = 0;

            retval = select(FD_SETSIZE, NULL, &fdset, NULL, &tv);
            if(retval > 0)
            {
                for(i = 0; i < ip_cameras_num; i++)
                {
                    if(sock[i] >= 0)
                    {
                        if(FD_ISSET(sock[i], &fdset))
                        {
                            int so_error;
                            socklen_t len = sizeof(so_error);

                            getsockopt(sock[i], SOL_SOCKET, SO_ERROR, &so_error, &len);

                            if (so_error == 0) 
                            {
                                // Set socket to blocking mode.  
                                int flags = fcntl(sock[i], F_GETFL, 0);

                                flags &= ~O_NONBLOCK;                            
                                fcntl(sock[i], F_SETFL, flags);

                                // Verify if the RTSP stream is availabe by the address, 
                                // provided in config.xml            
                                if(verifyRTSPStream(sock[i], location[i]))
                                {
                                    setCameraStatus(i + CAMERA_IP0, CAMERA_SIGNAL_ON);
                                }
                                else
                                {
                                    setCameraStatus(i + CAMERA_IP0, CAMERA_SIGNAL_OFF);                                 
                                }                            
                            }
                            else
                            {
                                // Some error happened while trying to connect.
                                setCameraStatus(i + CAMERA_IP0, CAMERA_SIGNAL_OFF);
                            }
                            FD_CLR(sock[i], &fdset);
                            close(sock[i]);
                            sock[i] = -1;
                        }
                    }
                }

                // We have to re-init fdset structure. 
                // It doesn't work for the second time otherwise.
                FD_ZERO(&fdset);
                for(i = 0; i < ip_cameras_num; i++)
                {
                    if(sock[i] >= 0)
                    {
                        FD_SET(sock[i], &fdset);
                    }
                }

                // Check if we have sockets to connect.
                for(i = 0; i < ip_cameras_num; i++)
                {
                    if(sock[i] >= 0) break;
                }
                
                if(i == ip_cameras_num)
                {
                    break;
                }
               
            }
            else if(retval == 0)
            {
                // Timeout happened. Check sockets that were not connected.
                for (i = 0; i < ip_cameras_num; i++)
                {
                     if(sock[i] >= 0)
                     {
                         setCameraStatus(i + CAMERA_IP0, CAMERA_SIGNAL_OFF);
                         close(sock[i]);
                         sock[i] = -1;
                     }
                }
                break;
            }
            else if(retval < 0)
            {
                // Some error happened. Check sockets that were not connected.
                for (i = 0; i < ip_cameras_num; i++)
                {
                     if(sock[i] >= 0)
                     {
                         setCameraStatus(i + CAMERA_IP0, CAMERA_SIGNAL_OFF);
                         close(sock[i]);
                         sock[i] = -1;
                     }
                }
                break;
            }
        }
        for(i = 0; i < ip_cameras_num; i++)
        {
            if(location[i] != NULL)
            {
                xmlFree(location[i]);
                location[i] = NULL;
            }
            if(uri[i] != NULL)
            {
                xmlFreeURI(uri[i]);
                uri[i] = NULL;
            }
        }
        // Wait for 3 seconds before next checking of IP cameras availability
        usleep(3000 * 1000);
    }
}

/*===========================================================================

FUNCTION
    update_usb_cameras_status

DESCRIPTION
    Verifies and updates USB cameras statuses for each 2 seconds.
    Should be launched in separate thread.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: args - Not used.
    
RETURN VALUE
    None.

SIDE EFFECTS
    None

NOTE
    Should be launched in separate thread.
===========================================================================*/
static void *update_usb_cameras_status(void *args)
{
    int ret = 0;
    int i = 0;

    while(1)
    {
        for(i = CAMERA_USB0; i < CAMERA_USB_MAX; i++)
        {
            xmlChar *value = NULL;

            if((value = getCameraAttributeValue(i, "type")) != NULL)
            {
                xmlChar *location = NULL;
                if(xmlStrcmp(value, (const xmlChar*)"USB") == 0)
                {               
                    if((location = getCameraAttributeValue(i, "location")) != NULL)
                    {
                        char *v4l2_dev_name = v4l2_get_device_name(location);
                        if(v4l2_dev_name != NULL)
                        {
                            setCameraStatus(i, CAMERA_SIGNAL_ON);
                            free(v4l2_dev_name);
                        }
                        else
                        {
                            setCameraStatus(i, CAMERA_SIGNAL_OFF);
                        }
                        xmlFree(location);                        
                    }
                    else 
                    {
                        setCameraStatus(i, UNAVAILABLE);
                    }
                }
                else
                {
                    setCameraStatus(i, UNAVAILABLE);
                }
                xmlFree(value);
            }
            else
            {
                setCameraStatus(i, UNAVAILABLE);
            }
        }
        // Sleep for 2 seconds before next status verification
        usleep(2000 * 1000);
    }
}

/*===========================================================================

FUNCTION
    update_analog_cameras_status

DESCRIPTION
    Verifies and updates analog cameras statuses for each 2 seconds.
    Should be launched in separate thread.
    
DEPENDENCIES
    None

ARGUMENTS
    args
    IN: args - Not used.
    
RETURN VALUE
    None.

SIDE EFFECTS
    None

NOTE
    Should be launched in separate thread.
===========================================================================*/
static void *update_analog_cameras_status(void *args)
{
    int ret = 0;
    int i = 0;

    while(1)
    {
        for(i = CAMERA_ANALOG0; i < CAMERA_ANALOG_MAX; i++)
        {
            xmlChar *value = NULL;

            if((value = getCameraAttributeValue(i, "type")) != NULL)
            {
                xmlChar *location = NULL;
                if(xmlStrcmp(value, (const xmlChar*)"ANALOG") == 0)
                {               
                    if((location = getCameraAttributeValue(i, "location")) != NULL)
                    {
                         char *v4l2_dev_name = v4l2_get_device_name(location);
                        if(v4l2_dev_name != NULL)
                        {
                            xmlChar *input = NULL;
                            if((input = getCameraAttributeValue(i, "input")) != NULL)
                            {
                                if(v4l2_getCurrentVideoInput(v4l2_dev_name) == atoi(input))
                                {
                                    int status;
                                    if((status = v4l2_getCurrentVideoInputStatus(v4l2_dev_name, atoi(input))) == 0)
                                    {
                                        setCameraStatus(i, CAMERA_SIGNAL_ON);
                                    }
                                    else
                                    {
                                        setCameraStatus(i, CAMERA_SIGNAL_OFF);
                                    }
                                }
                                else
                                {
                                    setCameraStatus(i, UNAVAILABLE);
                                }
                                xmlFree(input);
                            }
                            else 
                            {
                                setCameraStatus(i, UNAVAILABLE);
                            }
                            free(v4l2_dev_name);
                        }
                        else
                        {
                            setCameraStatus(i, CAMERA_SIGNAL_OFF);
                        }
                        xmlFree(location);                        
                    }
                    else 
                    {
                        setCameraStatus(i, UNAVAILABLE);
                    }
                }
                else
                {
                    setCameraStatus(i, UNAVAILABLE);
                }
                xmlFree(value);
            }
            else
            {
                setCameraStatus(i, UNAVAILABLE);
            }
        }
        // Sleep for 2 seconds before next status verification
        usleep(2000 * 1000);
    }
}

static void set_streaming_mode(int camID)
{
    if(!(camID<CAMERA_ID_MAX))
        return;

    xmlChar *screenshot_stream = getCameraAttributeValue(camID, "screenshot_stream"); 
    servers[camID].is_screenshot_stream=(screenshot_stream && (strcmp(screenshot_stream, "1")==0))?1:0;
    LOG(APP_PREFIX "is_screenshot_stream=%d\n", servers[camID].is_screenshot_stream);
    xmlFree(screenshot_stream);
}

int main(int argc, char *argv[]) {

    guint owner_id;
    int i = 0; 

    LOG(APP_PREFIX "Launched\n");

    // Become a daemon application.
    // zoltan: don't become a daemon. systemd launches this app and we need it to launch for dbus services and not fork
    /*if ( daemon(0, 0) < 0 )
    {
        LOG(APP_PREFIX "Failed to became a background app. Error: %s\n", strerror(errno));
        return -1;
    }*/

    xmlInitParser();

    if (pthread_mutex_init(&set_status_lock, NULL) != 0)
    {
        LOG(APP_PREFIX "Initialization of set_status_lock mutex failed.\n");
        return -1;
    }

    if (pthread_mutex_init(&get_attribute_lock, NULL) != 0)
    {
        LOG(APP_PREFIX "Initialization of get_attribute_lock mutex failed.\n");
        return -1;
    }
    // Clear stream_server structures.
    memset(&servers, 0, sizeof(struct stream_server) * CAMERA_ID_MAX);

    // Clear camera statuses structures.
    memset(&cam_status, 0, sizeof(struct camera_status) * CAMERA_ID_MAX);
    for(i = 0; i < CAMERA_ID_MAX; i++)
    {
        cam_status[i].status = -2;
    }

    // Create new D-Bus object on a system bus using "com.jlr.JLRCameras" name.
    owner_id = g_bus_own_name (G_BUS_TYPE_SYSTEM,
                               "com.jlr.JLRCameras",
                               G_BUS_NAME_OWNER_FLAGS_NONE | G_BUS_NAME_OWNER_FLAGS_ALLOW_REPLACEMENT | G_BUS_NAME_OWNER_FLAGS_REPLACE,
                               on_bus_acquired,
                               on_name_acquired,
                               on_name_lost,
                               NULL,
                               NULL);
    
    // Initialize main loop of the application.
    main_loop = g_main_loop_new (NULL, FALSE);

    // Daemon shouldn't be killed after receiving SIGPIPE event,
    // so we need to handle this signal ourselves.
    signal(SIGPIPE, signal_handler);

    // Handle SIGGHLD event in order to wait for GStreamer child process termination
    // and not to become zombie.
    signal(SIGCHLD, signal_handler);

    // Subscribe to SIGTERM, SIGINT and SIGKILL signals to close 
    // streaming sockets properly
    signal(SIGKILL, signal_handler);
    signal(SIGTERM, signal_handler);
    signal(SIGINT, signal_handler);

    //Thread for polling of IP cameras' statuses.
    pthread_create(&ip_cameras_status_thread, NULL, update_ip_cameras_status, NULL);

    //Thread for polling of USB cameras' statuses.
    pthread_create(&usb_cameras_status_thread, NULL, update_usb_cameras_status, NULL);

    //Thread for polling of analog cameras' statuses.
    pthread_create(&analog_cameras_status_thread, NULL, update_analog_cameras_status, NULL);


    for(i=0;i<CAMERA_ID_MAX;++i)
        set_streaming_mode(i);
   
    // Enter the main loop of the application.
    g_main_loop_run (main_loop);

    xmlCleanupParser();

    return 0;
}
