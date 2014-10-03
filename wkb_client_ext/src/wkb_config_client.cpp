
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

#include "wkb_config_client.h"
#include "wkb-ibus-defs.h"

#include <Eldbus.h>
#include <Ecore.h>
#include <Ecore_Evas.h>
#include <string>
#include <exception>
#include <sstream>

#include <syslog.h>
#include <pthread.h>
//#include <glib-unix.h>

class wkb_client_exception : public std::exception
{
public:
    wkb_client_exception(std::string what) : std::exception(), _what(what)
        {
            std::stringstream ss; ss << "Weekeyboard client: " << what;
            syslog(LOG_USER | LOG_ERR, ss.str().c_str());
        }
    virtual const char* what() const throw() { return _what.c_str(); }

private:
    std::string _what;
};


WeekeyboardConfigClient::WeekeyboardConfigClient()
    : conn(NULL),
      initstate(none),
      log_domain(-1)
{}

WeekeyboardConfigClient::~WeekeyboardConfigClient()
{
    if (initstate != none)
    {
        Cleanup();
    }
}

void
WeekeyboardConfigClient::Cleanup()
{
    switch (initstate)
    {
        case all:
            
            syslog(LOG_USER | LOG_DEBUG, "RE: wkb_client - cleanup - all.");
            eldbus_connection_unref(conn);
            initstate = eldbus;

        case eldbus:
            syslog(LOG_USER | LOG_DEBUG, "RE: wkb_client - cleanup - eldbus.");
            eldbus_shutdown();
            initstate = ecore;
            /*
        case ecore:
            syslog(LOG_USER | LOG_DEBUG, "RE: wkb_client - cleanup - ecore.");
            ecore_shutdown();
            initstate = none;

        case eina:
//            eina_log_domain_unregister(log_domain);
            eina_shutdown();
            
            syslog(LOG_USER | LOG_DEBUG, "RE: wkb_client - cleanup - eina.");
            */
            initstate = none;
            
        case none:
            ;
    }
    
    initstate = none;
}

//static pthread_t _ecore_loop_thread
/*
void*
WeekeyboardConfigClient::loop(void* _this_void)
{

    WeekeyboardConfigClient* _this = (WeekeyboardConfigClient*)_this_void;
    try
    {
        if (_this->initstate != none)
        {
            return NULL;
        }
    
        if (eina_init() <= 0)
        {
            throw wkb_client_exception("Unable to init eina");
        }   
        _this->initstate = eina;

        _this->log_domain = eina_log_domain_register("wkb_client", EINA_COLOR_CYAN);
        if (_this->log_domain < 0)
        {
            throw wkb_client_exception("Unable to create 'client' log domain");
        }
    
        if (ecore_init() <= 0)
        {
            throw wkb_client_exception("Unable to initialize ecore");
        }
        _this->initstate = ecore;

        if (eldbus_init() <= 0)
        {
            throw wkb_client_exception("Unable to initialize eldbus");
        }
        _this->initstate = eldbus;

        // get the connection address. Yes, it only comes from a command line application
        FILE* fp = popen("ibus address", "r");
        if (! fp)
        {
            throw wkb_client_exception("Unable to find ibus address");
        }
    
        char address[PATH_MAX];
        if (! fgets(address, PATH_MAX - 1, fp))
        {
            throw wkb_client_exception("Unable to find ibus address");
        }
        // and strip out the newline at the end
        address[strlen(address) - 1] = '\0';
        pclose (fp);
    
        _this->conn = eldbus_address_connection_get(address);
        if (! _this->conn)
        {
            throw wkb_client_exception("Cannot establish eldbus connection");
        }

        _this->initstate = all;

        syslog(LOG_USER | LOG_DEBUG, "RE:WeekeyboardClient start ecore_loop");
        ecore_main_loop_begin();
        syslog(LOG_USER | LOG_DEBUG, "RE:WeekeyboardClient end ecore_loop");
    }
    catch (std::exception& e)
    {
        syslog(LOG_USER | LOG_ERR, "RE:wkb_client: exception during initialization!");
        syslog(LOG_USER | LOG_ERR, e.what());
    }

    return NULL;
}
    */
 /*
GMainLoop* g_wkb_client_main_loop;

void*
gmainloop_thread(void* data)
{
    syslog(LOG_USER | LOG_DEBUG, "RE: wkb_client - starting g_main_loop.");
    g_wkb_client_main_loop = g_main_loop_new(NULL, FALSE);
    g_main_loop_run(g_wkb_client_main_loop);
    pthread_exit(NULL);
}
 */

/* Setup the IBus connection to the weekeyboard client.
 */
void
WeekeyboardConfigClient::Init()
{
    syslog(LOG_USER | LOG_DEBUG, "wkb_client - Init.");
    if (initstate != none)
    {
        return ;
    }
/*
    if (eina_init() <= 0)
    {
        throw  wkb_client_exception("Unable to init eina");
    }   
    syslog(LOG_USER | LOG_DEBUG, "wkb_client - eina_init.");

//    log_domain = eina_log_domain_register("wkb_client", EINA_COLOR_CYAN);
//    if (log_domain < 0)
//    {
//        throw wkb_client_exception("Unable to create 'client' log domain");
//    }
//    syslog(LOG_USER | LOG_DEBUG, "wkb_client - eina_log_domain_register.");

    if (ecore_init() <= 0)
    {
        throw wkb_client_exception("Unable to initialize ecore");
    }
    
    syslog(LOG_USER | LOG_DEBUG, "wkb_client - ecore_init.");
    initstate = ecore;
*/  
    if (eldbus_init() <= 0)
    {
        throw wkb_client_exception("Unable to initialize eldbus");
    }
    syslog(LOG_USER | LOG_DEBUG, "wkb_client - eldbus_init.");
    initstate = eldbus;
    
    // get the connection address. Yes, it only comes from a command line application
    FILE* fp = popen("ibus address", "r");
    if (! fp)
    {
        throw wkb_client_exception("Unable to find ibus address");
    }
   
    char tmp_address[PATH_MAX];
    if (! fgets(tmp_address, PATH_MAX - 1, fp))
    {
        throw wkb_client_exception("Unable to find ibus address");
    }
    // and strip out the newline at the end
    int end = strlen(tmp_address) - 1;
    if (end < 0)
    {
        end = 0;
        throw wkb_client_exception("Cannot find the ibus address");
    }
    tmp_address[strlen(tmp_address) - 1] = '\0';
    pclose (fp);
    
    std::string address = tmp_address;
    //pthread_create(&thread, NULL, gmainloop_thread, NULL);
    
    {
        std::stringstream ss; ss << "wkb_client address = <" << address << ">";
        syslog(LOG_USER | LOG_ERR, ss.str().c_str());
    }
    conn = eldbus_address_connection_get(address.c_str());
    if (! conn)
    {
        throw wkb_client_exception("Cannot establish eldbus connection");
    }
    syslog(LOG_USER | LOG_DEBUG, "wkb_client - eldbus_address_connection_get.");

    initstate = all;
    /*
      if (pthread_create(&_ecore_loop_thread, NULL, loop, this))
    {
        throw wkb_client_exception("Unable to launch ecore_loop thread");
    }
        */
}

/* Send the SetTheme command to the weekeboard client
 */
void
WeekeyboardConfigClient::SetTheme(std::string theme)
{
    syslog(LOG_USER | LOG_DEBUG, "RE: wkb_client - set theme.");
    
    if (initstate != all)
    {
        throw wkb_client_exception("Weekeyboard Client is not initialized in SetTheme");
    }
    
    Eldbus_Object* obj = eldbus_object_get(conn, IBUS_SERVICE_CONFIG, IBUS_PATH_CONFIG);
    if (! obj)
    {
        throw wkb_client_exception("Cannot create eldbus object");
    }
    
    Eldbus_Proxy* proxy = eldbus_proxy_get(obj, IBUS_INTERFACE_CONFIG);
    if (! proxy)
    {
        eldbus_object_unref(obj);                       
        throw wkb_client_exception("Cannot create eldbus proxy");
    }
    
    eldbus_proxy_call(proxy, "SetTheme", NULL, NULL, -1, "s", theme.c_str());

    eldbus_proxy_unref(proxy);
    eldbus_object_unref(obj);

    
    syslog(LOG_USER | LOG_DEBUG, "RE: wkb_client - set theme - done.");
}
