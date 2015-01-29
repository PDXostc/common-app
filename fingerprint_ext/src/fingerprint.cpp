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
#include <boost/uuid/uuid.hpp>
#include <boost/uuid/uuid_generators.hpp>
#include <boost/lexical_cast.hpp>
#include <boost/uuid/uuid_io.hpp>

#include "thirdparty/inc/fprint.h"
#include "thirdparty/inc/fp_if.h"

#include "fingerprint.h"

#include "extension_common/picojson.h"
#include <syslog.h>

std::map<std::string, fp_finger> fingertypes;

Fingerprint::Fingerprint() {}

Fingerprint::~Fingerprint() {}

// Called by JavaScript to pass in a message that will be executed asynchronously;
// any return data will be sent back using the PostMessage call.
// The message parameter is handled as follows:
// messages arives as stringified json, formatted as:
//
// api: <setTheme(string theme_path)>
//
void Fingerprint::HandleMessage(const char* message)
{
	syslog(LOG_USER | LOG_DEBUG, "RE:  HandleMessage str is %s", message);

	// Parse json string into string, value pairs:
	picojson::value v;
	std::string err;
	picojson::parse(v, message, message + strlen(message), &err);
	if (!err.empty())
    {
	    syslog(LOG_USER | LOG_DEBUG, "RE: HandleMessage message is empty, ignoring.");
	    return;
	}

    syslog(LOG_USER | LOG_DEBUG, "RE: HandleSyncMessage - no sync calls are supported. Returning error");
    std::string resp = "error";

    picojson::object o;
    o["msg"] = picojson::value(resp);
    picojson::value rv(o);

    PostMessage(rv.serialize().c_str());

}

void Fingerprint::HandleSyncMessage(char const* message) {
  syslog(LOG_USER | LOG_DEBUG, "RE: HandleSyncMessage str is %s", message);

  picojson::value v;
  std::string err;
  picojson::parse(v, message, message + strlen(message), &err);

  std::string msg;
  bool failed = false;
  failed = failed || v.is<picojson::null>();

  std::string apiVal;

  if (!failed) {
    apiVal = v.get("api").to_str();
    syslog(LOG_USER | LOG_DEBUG, "RE: HandleMessage sees get(api) as %s\n", apiVal.c_str());
  }

  failed = failed || apiVal.empty();
  if (!failed && apiVal == "setTheme") {
    // std::string paramVal1 = v.get("theme").to_str();
    // try
    // {
    //     _configInstance->SetTheme(paramVal1);
    // }
    // catch (std::exception& e)
    // {
    //     failed = true;
    //     syslog(LOG_USER | LOG_ERR, "RE:fingerprint: exception during set theme!");
    //     syslog(LOG_USER | LOG_ERR, e.what());
    // }
  } else if (!failed && apiVal == "init") {
    syslog(LOG_USER | LOG_DEBUG, "Fingerprint::init entered");

    fingertypes["LEFT_THUMB"] = LEFT_THUMB;
    fingertypes["LEFT_INDEX"] = LEFT_INDEX;
    fingertypes["LEFT_MIDDLE"] = LEFT_MIDDLE;
    fingertypes["LEFT_RING"] = LEFT_RING;
    fingertypes["LEFT_LITTLE"] = LEFT_LITTLE;
    fingertypes["RIGHT_THUMB"] = RIGHT_THUMB;
    fingertypes["RIGHT_INDEX"] = RIGHT_INDEX;
    fingertypes["RIGHT_MIDDLE"] = RIGHT_MIDDLE;
    fingertypes["RIGHT_RING"] = RIGHT_RING;
    fingertypes["RIGHT_LITTLE"] = RIGHT_LITTLE;

    libfprint_init();

    std::string resp = "done";
    picojson::object o;
    o["msg"] = picojson::value(resp);
    picojson::value rv(o);
    SendSyncReply(rv.serialize().c_str());
  } else if (!failed && apiVal == "deinit") {
    syslog(LOG_USER | LOG_DEBUG, "Fingerprint::deinit entered");
    libfprint_deinit();
  } else if (!failed && apiVal == "scanFinger") {
    auto name = v.get("name").to_str();
    auto gender = v.get("gender").to_str();
    auto fingertypename = v.get("fingertypename").to_str();

    if (name.empty() || gender.empty() || fingertypename.empty()) {
      syslog(LOG_USER | LOG_DEBUG, "Missing a parameter");
      failed = true;
      goto error;
    }

    char* strName = new char[name.length() + 1];
    strncpy(strName, name.c_str(), name.length());
    strName[name.length()] = '\0';

    enum gender eGender;
    if(gender == "M") {
      eGender = MALE;
    } else {
      eGender = FEMALE;
    }

    // which finger - convert string to type
    auto ft = fingertypes.find(fingertypename);
    if (fingertypes.end() == ft) {
      syslog(LOG_USER | LOG_DEBUG, "Invalid fingertype");
      failed = true;
      goto error;
    }
    fp_finger eFingerType = ft->second;

    enroll_finger(strName, eGender, eFingerType);

    delete[] strName;

    std::string resp = "done with scanning";
    picojson::object o;
    o["msg"] = picojson::value(resp);
    picojson::value rv(o);
    SendSyncReply(rv.serialize().c_str());
  } else if (!failed && apiVal == "verifyFinger") {
    auto name = v.get("name").to_str();
    auto gender = v.get("gender").to_str();

    verified_user stUserDetail;
    memset(&stUserDetail, 0, sizeof(verified_user));

    int rval = verify_finger(&stUserDetail);
    syslog(LOG_USER | LOG_DEBUG, "Return from verify_finger");

    if (rval > 0) {
      name = stUserDetail.user;

      if(stUserDetail.gen == MALE) {
        gender = "M";
      } else {
        gender = "F"; // default
      }
    } else {
      syslog(LOG_USER | LOG_DEBUG, "RE: Unsupported api: %s", apiVal.c_str());
      failed = true;
    }
	} else {
    syslog(LOG_USER | LOG_DEBUG, "RE: HandleMessage fails");

    // Create and post a failure message
    std::string resp = "error";

    picojson::object o;
    o["msg"] = picojson::value(resp);
    picojson::value rv(o);
    SendSyncReply(rv.serialize().c_str());
	}

 error:
  if (!failed) {
    // Create and post a success message
    std::string resp = "error";

    picojson::object o;
    o["msg"] = picojson::value(resp);
    picojson::value rv(o);
    SendSyncReply(rv.serialize().c_str());
  }
}
