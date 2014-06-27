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
* Filename:	 JSExample.h
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
	This file defines the Widget application JavaScript to C++ interface.
	in the Widget application Javascript, tizen.example.<member function name> calls
	invoke the correspondingly named functions in class JSExample below.

	Much of the code in this file is generic boilerplate to support the JavaScript to C++ interface.
	*/
#ifndef JSEXAMPLE_H
#define JSEXAMPLE_H

#include "Example.h"
#include <dpl/shared_ptr.h>
#include <JavaScriptCore/JavaScript.h>
#include <CommonsJavaScript/JSPendingOperationPrivateObject.h>
#include <CommonsJavaScript/PrivateObject.h>

namespace DeviceAPI {
namespace Example {

typedef WrtDeviceApis::CommonsJavaScript::PrivateObject<ExamplePtr, WrtDeviceApis::CommonsJavaScript::NoOwnership> ExamplePrivObject;

/*! \class DeviceAPI::Example::JSExample
 * \brief A Class that implements \b tizen.example object 
 *
 * A Class that implements \b tizen.example object
 *
 * It defines the following methods:
 * <ul>
 * initExample
 * sendCmd
 * </ul>
 */
class JSExample
{
public:
        /**
         * Gets the Call Definition.
         * @see getClassRef()
         */
        static const JSClassDefinition* getClassInfo();

        /**
         * Method to create (if it's not yet created) and return this class reference. Used by the plugin loader to load this plugin.
         * @see getClassInfo()
         */
        static const JSClassRef getClassRef();

// WRT Plugin example: these are two non-boilerplate functions that are
// callable from the WIdget application JavaScript:
static JSValueRef initExample(JSContextRef context,
                               JSObjectRef object,
                               JSObjectRef thisObject,
                               size_t argumentCount,
                               const JSValueRef arguments[],
                               JSValueRef* exception);

static JSValueRef sendCmd(JSContextRef context,
                               JSObjectRef object,
                               JSObjectRef thisObject,
                               size_t argumentCount,
                               const JSValueRef arguments[],
                               JSValueRef* exception);

// Everything below is boilerplate.

private:
        /**
         * The callback invoked when an object is first created.
         */
        static void initialize(JSContextRef context,
                               JSObjectRef object);

        /**
         * The callback invoked when an object is finalized.
         */
        static void finalize(JSObjectRef object);

        /**
         * Getters for properties
         */
        static JSValueRef getProperty(JSContextRef context,
                                      JSObjectRef object,
                                      JSStringRef propertyName,
                                      JSValueRef* exception);

        /**
         * The callback invoked when an object is used as the target of an 'instanceof' expression.
         */
        static bool hasInstance(JSContextRef ctx,
                                JSObjectRef constructor,
                                JSValueRef possibleInstance,
                                JSValueRef* exception);

	
        /**
         * This structure contains properties and callbacks that define a type of object.
         */
        static JSClassDefinition m_classInfo;

        /**
         * This structure describes a statically declared function.
         */
        static JSStaticFunction m_function[];

        /**
         * This member variable contains the initialization values for the 
         * properties of this class. The values are given according to the
         * data structure JSPropertySpec.
         */
        static JSStaticValue m_property[];

        static JSClassRef m_jsClassRef;
};


} // Example
} // DeviceAPI

#endif // JSEXAMPLE_H

