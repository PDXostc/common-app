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

/* Rob Erickson (rerickso@jaguarlandrover.com)
 *
 * Intererface to submit configuration changes to a Weekeyboard
 * daemon.
 */

#ifndef WEEKEYBOARD_CONFIG_CLIENT_H
#define WEEKEYBOARD_CONFIG_CLIENT_H

#include <string>

struct _Eldbus_Connection;
typedef _Eldbus_Connection Eldbus_Connection;

class WeekeyboardConfigClient
{
  public:
    WeekeyboardConfigClient();
    ~WeekeyboardConfigClient();
    
    void Init();
    void SetTheme(std::string theme);
    
  private:
    void Cleanup();

    Eldbus_Connection* conn;
    
    enum init_e
    {
        none, eina, ecore, eldbus, all
    };
    init_e initstate;

    int log_domain;
};

#endif
