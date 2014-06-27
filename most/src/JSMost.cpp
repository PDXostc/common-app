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
* Filename:	 JSMost.cpp
* Version:              1.0
* Date:                 Feb. 2014
* Project:              
* Contributors:         
*                       
*
* Incoming Code:        
*
*/

/*
 * This code is mostly boilerplate that implements the bridge between JavaScript running
 * in a widget application, and the C++ classes that make up the WRT plugin.
 *
 * The non-boilerplate functions will be listed in the JSMost::m_function array in JSMost.cpp.
 * Declarations for those functions are included below.
 */

#include "JSMost.h"
#include "Most.h"

#include <syslog.h>
#include <Logger.h>
#include <Commons/Exception.h>
#include <CommonsJavaScript/Utils.h>
#include <CommonsJavaScript/JSCallbackManager.h>
#include <JSWebAPIErrorFactory.h>
#include <ArgumentValidator.h>
#include <CommonsJavaScript/Converter.h>
#include <dpl/scoped_ptr.h>
#include <sstream>
#include <map>

#include <json-glib/json-gvariant.h>    

namespace DeviceAPI {
namespace Most {

using namespace DPL;
using namespace DeviceAPI::Common;
using namespace WrtDeviceApis::Commons;
using namespace WrtDeviceApis::CommonsJavaScript;

// #define MOST_ACTIVECALL_PROP "activeCall"
// #define MOST_ACTIVECALL_PROP2 "genProp"

JSClassDefinition JSMost::m_classInfo = {
    0,
    kJSClassAttributeNone,
    "Most",
    0,
    m_property,
    m_function,
    initialize,
    finalize,
    NULL, //HasProperty,
    NULL, //GetProperty,
    NULL, //SetProperty,
    NULL, //DeleteProperty,
    NULL, //GetPropertyNames,
    NULL, //CallAsFunction,
    NULL, //CallAsConstructor,
    hasInstance,
    NULL, //ConvertToType
};

// Add functions here that need to be callable from JavaScript in the widget application.
JSStaticFunction JSMost::m_function[] = {
	{"initMost", JSMost::initMost, kJSPropertyAttributeNone },
	{"sendCmd", JSMost::sendCmd, kJSPropertyAttributeNone },
	{"setTone", JSMost::setTone, kJSPropertyAttributeNone },
	{"setBalance", JSMost::setBalance, kJSPropertyAttributeNone },
	{"setSurround", JSMost::setSurround, kJSPropertyAttributeNone },
	{"setToneRange", JSMost::setToneRange, kJSPropertyAttributeNone },
	{"setBalanceRange", JSMost::setBalanceRange, kJSPropertyAttributeNone },
    { 0, 0, 0 }
};

// The strings below need are the same as in AudioMost.cpp::CmdMap, except where noted.
JSStaticValue JSMost::m_property[] = {
	{"volume",  getProperty, NULL, kJSPropertyAttributeNone},
	{"bass",  getProperty, NULL, kJSPropertyAttributeNone},
	{"treble",  getProperty, NULL, kJSPropertyAttributeNone},
	{"subwoofer",  getProperty, NULL, kJSPropertyAttributeNone},
	{"balance",  getProperty, NULL, kJSPropertyAttributeNone},
	{"fade",  getProperty, NULL, kJSPropertyAttributeNone},
	{"surround",  getProperty, NULL, kJSPropertyAttributeNone}, /* Not in CmdMap */
    	{ 0, 0, 0, 0 }
};
/** Not used; will probably be removed.
*
*/
JSValueRef JSMost::initMost(JSContextRef context,
                               JSObjectRef object,
                               JSObjectRef thisObject,
                               size_t argumentCount,
                               const JSValueRef arguments[],
                               JSValueRef* exception)
{
    LoggerD("JSMost: Entered initMost");

    MostPrivObject* privateObject = static_cast<MostPrivObject*>(JSObjectGetPrivate(thisObject));
    if (NULL == privateObject)
    {
        LoggerE("most private object is null");
        return JSValueMakeUndefined(context);
    }

	MostPtr most(privateObject->getObject());
	JSContextRef gContext = privateObject->getContext();

	ArgumentValidator validator(context, argumentCount, arguments);
    std::string initStr = validator.toString(0);
    LoggerD("most initStr: data, arg cnt: " << initStr << " " << argumentCount);

    JSObjectRef errorCallback = validator.toFunction(1, false);

    JSValueProtect(context, errorCallback);

    most->initMost(initStr, errorCallback, gContext);

    return JSValueMakeUndefined(context);
}

/** Sends ASCII command string to the Optolyzer.
 * This is a low level command interface; use of the API callsin AudioMost.cpp is preferred.
*
*/
JSValueRef JSMost::sendCmd(JSContextRef context,
                               JSObjectRef object,
                               JSObjectRef thisObject,
                               size_t argumentCount,
                               const JSValueRef arguments[],
                               JSValueRef* exception)
{
    MostPrivObject* privateObject = static_cast<MostPrivObject*>(JSObjectGetPrivate(thisObject));
    if (NULL == privateObject)
    {
        syslog(LOG_USER | LOG_DEBUG, "sendCmd: most private object is null");
        return JSValueMakeUndefined(context);
    }

	MostPtr most(privateObject->getObject());
	JSContextRef gContext = privateObject->getContext();

	ArgumentValidator validator(context, argumentCount, arguments);
    std::string cmd = validator.toString(0);

    JSObjectRef errorCallback = validator.toFunction(1, false);

    JSValueProtect(context, errorCallback);

    most->sendCmd(cmd, errorCallback, gContext);

 	return JSValueMakeUndefined(context);
}
/**
 * 	High level API: set tone (bass, treble, subwoofer, volume)
 */
JSValueRef JSMost::setTone(JSContextRef context,
                       JSObjectRef object,
                       JSObjectRef thisObject,
                       size_t argumentCount,
                       const JSValueRef arguments[],
                       JSValueRef* exception)
{

    MostPrivObject* privateObject = static_cast<MostPrivObject*>(JSObjectGetPrivate(thisObject));
    if (NULL == privateObject)
    {
    	syslog(LOG_USER | LOG_DEBUG, "setTone: most private object is null");
        return JSValueMakeUndefined(context);
    }

	MostPtr most(privateObject->getObject());
	JSContextRef gContext = privateObject->getContext();

	ArgumentValidator validator(context, argumentCount, arguments);
    std::string dest = validator.toString(0);
    int level = validator.toNumber(1);
    int incr = validator.toNumber(2);

    JSObjectRef errorCallback = validator.toFunction(3, false);

    JSValueProtect(context, errorCallback);

    most->setTone(dest, level, incr, errorCallback, gContext);

 	return JSValueMakeUndefined(context);
}
/**
 * 	High level API: set balance (balance, fade)
 */
JSValueRef JSMost::setBalance(JSContextRef context,
                       JSObjectRef object,
                       JSObjectRef thisObject,
                       size_t argumentCount,
                       const JSValueRef arguments[],
                       JSValueRef* exception)
{
    MostPrivObject* privateObject = static_cast<MostPrivObject*>(JSObjectGetPrivate(thisObject));
    if (NULL == privateObject)
    {
    	syslog(LOG_USER | LOG_DEBUG, "setBalance: most private object is null");
        return JSValueMakeUndefined(context);
    }

	MostPtr most(privateObject->getObject());
	JSContextRef gContext = privateObject->getContext();

	ArgumentValidator validator(context, argumentCount, arguments);
    std::string dest = validator.toString(0);
    int level = validator.toNumber(1);
    int incr = validator.toNumber(2);

    JSObjectRef errorCallback = validator.toFunction(3, false);

    JSValueProtect(context, errorCallback);

    most->setBalance(dest, level, incr, errorCallback, gContext);

 	return JSValueMakeUndefined(context);
}
/**
 * 	High level API: set surround mode.
 */
JSValueRef JSMost::setSurround(JSContextRef context,
                       JSObjectRef object,
                       JSObjectRef thisObject,
                       size_t argumentCount,
                       const JSValueRef arguments[],
                       JSValueRef* exception)
{
    MostPrivObject* privateObject = static_cast<MostPrivObject*>(JSObjectGetPrivate(thisObject));
    if (NULL == privateObject)
    {
    	syslog(LOG_USER | LOG_DEBUG, "setSurround: most private object is null");
        return JSValueMakeUndefined(context);
    }

	MostPtr most(privateObject->getObject());
	JSContextRef gContext = privateObject->getContext();

	ArgumentValidator validator(context, argumentCount, arguments);
    std::string dest = validator.toString(0);
    bool state = validator.toBool(1);
    std::string mode = validator.toString(2);

    JSObjectRef errorCallback = validator.toFunction(3, false);

    JSValueProtect(context, errorCallback);

    most->setSurround(dest, state, mode, errorCallback, gContext);

 	return JSValueMakeUndefined(context);
}
/**
 * 	High level API: set tone (bass, treble, subwoofer, volume)
 */
JSValueRef JSMost::setToneRange(JSContextRef context,
                       JSObjectRef object,
                       JSObjectRef thisObject,
                       size_t argumentCount,
                       const JSValueRef arguments[],
                       JSValueRef* exception)
{
    MostPrivObject* privateObject = static_cast<MostPrivObject*>(JSObjectGetPrivate(thisObject));
    if (NULL == privateObject)
    {
    	syslog(LOG_USER | LOG_DEBUG, "setToneRange: most private object is null");
        return JSValueMakeUndefined(context);
    }

	MostPtr most(privateObject->getObject());
	JSContextRef gContext = privateObject->getContext();

	ArgumentValidator validator(context, argumentCount, arguments);
    std::string dest = validator.toString(0);
    int min = validator.toNumber(1);
    int max = validator.toNumber(2);

    JSObjectRef errorCallback = validator.toFunction(3, false);

    JSValueProtect(context, errorCallback);

    most->setToneRange(dest, min, max, errorCallback, gContext);

 	return JSValueMakeUndefined(context);
}

/**
 * 	High level API: set tone (bass, treble, subwoofer, volume)
 */
JSValueRef JSMost::setBalanceRange(JSContextRef context,
                       JSObjectRef object,
                       JSObjectRef thisObject,
                       size_t argumentCount,
                       const JSValueRef arguments[],
                       JSValueRef* exception)
{
    //  MostPrivObject* privateObject = static_cast<MostPrivObject*>(JSObjectGetPrivate(object));
    MostPrivObject* privateObject = static_cast<MostPrivObject*>(JSObjectGetPrivate(thisObject));
    if (NULL == privateObject)
    {
    	syslog(LOG_USER | LOG_DEBUG, "setBalanceRange: most private object is null");
        return JSValueMakeUndefined(context);
    }

	MostPtr most(privateObject->getObject());
	JSContextRef gContext = privateObject->getContext();

	ArgumentValidator validator(context, argumentCount, arguments);
    std::string dest = validator.toString(0);
    int min = validator.toNumber(1);
    int max = validator.toNumber(2);

    JSObjectRef errorCallback = validator.toFunction(3, false);

    JSValueProtect(context, errorCallback);

    most->setBalanceRange(dest, min, max, errorCallback, gContext);

 	return JSValueMakeUndefined(context);
}
/**
 * 	All boilerplate below.
 */

const JSClassRef JSMost::getClassRef()
{
    if (!m_jsClassRef)
    {
        m_jsClassRef = JSClassCreate(&m_classInfo);
    }
    return m_jsClassRef;
}

const JSClassDefinition* JSMost::getClassInfo()
{
    return &m_classInfo;
}

JSValueRef JSMost::getProperty(JSContextRef context, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    MostPrivObject* privateObject = static_cast<MostPrivObject*>(JSObjectGetPrivate(object));
    if (NULL == privateObject)
    {
    	syslog(LOG_USER | LOG_DEBUG, "getProperty: most private object is null");
        return JSValueMakeUndefined(context);
    }


    // Only volume property currently supported.
   Try {

        if (JSStringIsEqualToUTF8CString(propertyName, "volume")) {
            MostPtr most(privateObject->getObject());

            JSStringRef state = JSStringCreateWithUTF8CString(most->curValue("volume").c_str());
            JSValueRef result = JSValueMakeString(context, state);
            return result;
        }
        else
        {
        	return JSValueMakeUndefined(context);
        }

    } catch (...) {
        return JSValueMakeUndefined(context);
    }

    return JSValueMakeUndefined(context);
}

JSClassRef JSMost::m_jsClassRef = JSClassCreate(JSMost::getClassInfo());

void JSMost::initialize(JSContextRef context, JSObjectRef object)
{
    openlog("JSMost", LOG_CONS|LOG_NDELAY, LOG_DEBUG);
    syslog(LOG_USER | LOG_DEBUG, "initialize");

    MostPrivObject* priv = static_cast<MostPrivObject*>(JSObjectGetPrivate(object));
    if (!priv)
    {
        MostPtr most(new MostMaster());
        priv = new MostPrivObject( context, most);
        if(!JSObjectSetPrivate(object, static_cast<void*>(priv)))
        {
        	syslog(LOG_USER | LOG_DEBUG, "initialize: Object can't store private most data.");
            delete priv;
        }
    }
}


void JSMost::finalize(JSObjectRef object)
{
	MostPrivObject* priv = static_cast<MostPrivObject*>(JSObjectGetPrivate(object));
    JSObjectSetPrivate(object, NULL);
    delete priv;
}

bool JSMost::hasInstance(JSContextRef context,
                          JSObjectRef constructor,
                          JSValueRef possibleInstance,
                          JSValueRef* exception)
{
    return JSValueIsObjectOfClass(context, possibleInstance, getClassRef());
}
} // Most
} // DeviceAPI

