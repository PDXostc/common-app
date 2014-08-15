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

/*
 * Created by: Jeff Eastwood
 * Purpose: Provides the implementation of the interface between a JavaScript application that needs to use the MOST
 * plugin (aka Crosswalk extension) and the C++ code that implements the MOST API.
 */

#include "src/most_instance.h"
#include "common/picojson.h"
#include <syslog.h>

#include "Most.h"

static DeviceAPI::Most::MostMaster* mostMaster;
MOSTInstance::MOSTInstance() {
	syslog(LOG_USER | LOG_DEBUG, "JE:  MOSTInstance ctor");
	mostMaster = new DeviceAPI::Most::MostMaster;
}

MOSTInstance::~MOSTInstance() {
}

// Called by JavaScript to pass in a message that will be executed asynchronously;
// any return data will be sent back using the PostMessage call.
// The message parameter is handled as follows:
// messages arives as stringified json, formatted as:
// api: <sendCmd | setTone | setToneRange | setBalance | setBalanceRange | setSurround | curValue>
// dest: <volume>|<bass>|treble>|<subwoofer>|<balance>|<fade>|<dolby2D>|<dolby3D>|<dolbyAuto>|
//		<dts2D>|<dts3D>|<dtsNeo6>|<dtsAuto>|<3CH>|<DPL2>|<meridian2D>|<meridian3D>|<stereo>|<volumeQuery>
// Optionally followed by:
//	level:<level value> incr:<incr value>
// OR
// Optionally followed by state:<bool> mode:<val>
//
void MOSTInstance::HandleMessage(const char* message) {

	syslog(LOG_USER | LOG_DEBUG, "JE:  HandleMessage str is %s", message);

	// Parse json string into string, value pairs:
	picojson::value v;
	std::string err;
	picojson::parse(v, message, message + strlen(message), &err);
	if (!err.empty()) {
	    syslog(LOG_USER | LOG_DEBUG, "JE: HandleMessage is Ignoring message.\n");
	    return;
	}

	bool failed=true;
	do
	{

	  if( v.is<picojson::null>())
		  break;
	  syslog(LOG_USER | LOG_DEBUG, "JE: OK1\n");

	  std::string apiVal, destVal, paramVal1, paramVal2;

	  apiVal = v.get("api").to_str();
	  destVal = v.get("dest").to_str();
	  syslog(LOG_USER | LOG_DEBUG, "JE: HandleMessage sees get(api) as %s\n", apiVal.c_str());
	  syslog(LOG_USER | LOG_DEBUG, "JE: HandleMessage sees get(dest) as %s\n", destVal.c_str());

	  if(apiVal.empty() || destVal.empty())
		  break;

	  // Now we can do the mapping of the api tag to the supported MostMaster function calls:
	  if( apiVal == "setTone")
	  {
		  paramVal1 = v.get("level").to_str();
		  paramVal2 = v.get("incr").to_str();

		  mostMaster->setTone(destVal, stoi(paramVal1, 0), stoi(paramVal2, 0), 0, 0);

	  }
	  else if( apiVal == "setToneRange")
	  {
		  paramVal1 = v.get("min").to_str();
		  paramVal2 = v.get("max").to_str();

		  mostMaster->setToneRange(destVal, stoi(paramVal1, 0), stoi(paramVal2, 0), 0, 0);
	  }
	  else if( apiVal == "setBalance")
	  {
		  paramVal1 = v.get("level").to_str();
		  paramVal2 = v.get("incr").to_str();

		  mostMaster->setBalance(destVal, stoi(paramVal1, 0), stoi(paramVal2, 0), 0, 0);
	  }
	  else if( apiVal == "setBalanceRange")
	  {
		  paramVal1 = v.get("min").to_str();
		  paramVal2 = v.get("max").to_str();

		  mostMaster->setBalanceRange(destVal, stoi(paramVal1, 0), stoi(paramVal2, 0), 0, 0);
	  }
	  else if( apiVal == "setSurround")
	  {
		  paramVal1 = v.get("level").to_str();
		  paramVal2 = v.get("incr").to_str();

		  mostMaster->setSurround(destVal, paramVal1 == "true" ? true : false, paramVal2, 0, 0);
	  }
	  else if( apiVal == "curValue")
	  {
		  mostMaster->curValue(destVal);
	  }
	  else
	  {
		  syslog(LOG_USER | LOG_DEBUG, "JE: Unsupported api: %s\n", apiVal.c_str());
		  break;
	  }

	  failed=false;
	  break;

	} while(0);

	if(failed)
	{
	  syslog(LOG_USER | LOG_DEBUG, "JE: HandleMessage fails\n");
	  std::string msg;
			  std::string resp = PrepareMessage(msg);

			  picojson::object o;
			  o["msg"] = picojson::value(resp+"aaa");
			  picojson::value rv(o);
			  PostMessage(rv.serialize().c_str());
	  // Create and post a failure message
	}
	else
	{
	  std::string msg;
	  std::string resp = PrepareMessage(msg);

	  picojson::object o;
	  o["msg"] = picojson::value(resp);
	  picojson::value rv(o);
	  PostMessage(rv.serialize().c_str());
	}

}
// Called by JavaScript to pass in a message that will be executed synchronously.
void MOSTInstance::HandleSyncMessage(const char* message) {
	syslog(LOG_USER | LOG_DEBUG, "JE:  HandleSyncMessage str is %s", message);

	 picojson::value v;
	  std::string err;
	  picojson::parse(v, message, message + strlen(message), &err);

	  std::string msg;

	  if (!err.empty()) {
	    syslog(LOG_USER | LOG_DEBUG, "JE: HandleSyncMessage is Ignoring message.\n");
	    msg = std::string("JE: empty");

		  std::string resp = PrepareMessage(msg);

		  picojson::object o;
		  o["msg"] = picojson::value(resp);
		  picojson::value rv(o);

	    SendSyncReply(rv.serialize().c_str());
	    return;
	  }

	  msg = v.get("msg").to_str();
	  syslog(LOG_USER | LOG_DEBUG, "JE: HandleSyncMessage sees message string as %s\n", msg.c_str());

	  std::string resp = PrepareMessage(msg);

	  picojson::object o;
	  o["msg"] = picojson::value(resp+"bbb");
	  picojson::value rv(o);

  SendSyncReply(rv.serialize().c_str());
}

// The implementation of HandleMessage and HandleSyncMessage call this function to format the reply
// to be sent back to the JavaScript into JSON.
std::string MOSTInstance::PrepareMessage(std::string msg) const {
	syslog(LOG_USER | LOG_DEBUG, "JE:  PrepareMessage");
  return mostMaster->curValue("volume");
}
