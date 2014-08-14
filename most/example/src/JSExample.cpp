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
* Filename:	 JSExample.cpp
* Version:              1.0
* Date:                 Feb. 2014
* Project:              
* Contributors:         
*                       
*
* Incoming Code:        
*
*/
#include "JSExample.h"
#include "Example.h"

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
namespace Example {

using namespace DPL;
using namespace DeviceAPI::Common;
using namespace WrtDeviceApis::Commons;
using namespace WrtDeviceApis::CommonsJavaScript;

#define EXAMPLE_ACTIVECALL_PROP "activeCall"

JSClassDefinition JSExample::m_classInfo = {
    0,
    kJSClassAttributeNone,
    "Example",
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

// Example WRT Plugin: add your JavaScript to C++ functions to this array:
JSStaticFunction JSExample::m_function[] = {
	{"initExample", JSExample::initExample, kJSPropertyAttributeNone },
	{"sendCmd", JSExample::sendCmd, kJSPropertyAttributeNone },
    { 0, 0, 0 }
};

JSStaticValue JSExample::m_property[] = {
	{EXAMPLE_ACTIVECALL_PROP,  getProperty, NULL, kJSPropertyAttributeNone},
    	{ 0, 0, 0, 0 }
};

JSValueRef JSExample::initExample(JSContextRef context,
                               JSObjectRef object,
                               JSObjectRef thisObject,
                               size_t argumentCount,
                               const JSValueRef arguments[],
                               JSValueRef* exception)
{
    LoggerD("JSExample: Entered initExample");

    ExamplePrivObject* privateObject = static_cast<ExamplePrivObject*>(JSObjectGetPrivate(thisObject));
    if (NULL == privateObject)
    {
        LoggerE("example private object is null");
        return JSValueMakeUndefined(context);
    }

	ExamplePtr example(privateObject->getObject());
	JSContextRef gContext = privateObject->getContext();

	ArgumentValidator validator(context, argumentCount, arguments);
    std::string initStr = validator.toString(0);
    LoggerD("example initStr: data, arg cnt: " << initStr << " " << argumentCount);

    JSObjectRef errorCallback = validator.toFunction(1, false);

    JSValueProtect(context, errorCallback);

    example->initExample(initStr, errorCallback, gContext);

    return JSValueMakeUndefined(context);
}
JSValueRef JSExample::sendCmd(JSContextRef context,
                               JSObjectRef object,
                               JSObjectRef thisObject,
                               size_t argumentCount,
                               const JSValueRef arguments[],
                               JSValueRef* exception)
{
    LoggerD("JSExample: Entered sendCmd");

    ExamplePrivObject* privateObject = static_cast<ExamplePrivObject*>(JSObjectGetPrivate(thisObject));
    if (NULL == privateObject)
    {
        LoggerE("example private object is null");
        return JSValueMakeUndefined(context);
    }

	ExamplePtr example(privateObject->getObject());
	JSContextRef gContext = privateObject->getContext();

	ArgumentValidator validator(context, argumentCount, arguments);
    std::string cmd = validator.toString(0);
    LoggerD("example sendCmd: data, arg cnt: " << cmd << " " << argumentCount);

    JSObjectRef errorCallback = validator.toFunction(1, false);

    JSValueProtect(context, errorCallback);

    example->sendCmd(cmd, errorCallback, gContext);

 	return JSValueMakeUndefined(context);
 }
const JSClassRef JSExample::getClassRef()
{
    if (!m_jsClassRef)
    {
        m_jsClassRef = JSClassCreate(&m_classInfo);
    }
    return m_jsClassRef;
}

const JSClassDefinition* JSExample::getClassInfo()
{
    return &m_classInfo;
}

JSValueRef JSExample::getProperty(JSContextRef context, JSObjectRef object, JSStringRef propertyName, JSValueRef* exception)
{
    LoggerD("Enter JSExample::getProperty");

    ExamplePrivObject* privateObject = static_cast<ExamplePrivObject*>(JSObjectGetPrivate(object));
    if (NULL == privateObject)
    {
        LoggerE("Example private object is null");
        return JSValueMakeUndefined(context);
    }
    return JSValueMakeUndefined(context);
}

JSClassRef JSExample::m_jsClassRef = JSClassCreate(JSExample::getClassInfo());

void JSExample::initialize(JSContextRef context, JSObjectRef object)
{
    LoggerD("Entered JSExample::initialize");

    ExamplePrivObject* priv = static_cast<ExamplePrivObject*>(JSObjectGetPrivate(object));
    if (!priv)
    {
        ExamplePtr example(new ExampleMaster());
        priv = new ExamplePrivObject( context, example);
        if(!JSObjectSetPrivate(object, static_cast<void*>(priv)))
        {
            LoggerE("Object can't store private example data.");
            delete priv;
        }
    }

    LoggerD("JSExample::initialize ");
}

void JSExample::finalize(JSObjectRef object)
{
 	LoggerD("Entered JSExample::finalize");
    ExamplePrivObject* priv = static_cast<ExamplePrivObject*>(JSObjectGetPrivate(object));
    JSObjectSetPrivate(object, NULL);
    delete priv;
}

bool JSExample::hasInstance(JSContextRef context,
                          JSObjectRef constructor,
                          JSValueRef possibleInstance,
                          JSValueRef* exception)
{
    return JSValueIsObjectOfClass(context, possibleInstance, getClassRef());
}
} // Example
} // DeviceAPI

