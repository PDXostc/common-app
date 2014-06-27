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
* Filename:	 JSMost.h
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

#ifndef JSMOST_H
#define JSMOST_H

#include "Most.h"
#include <dpl/shared_ptr.h>
#include <JavaScriptCore/JavaScript.h>
#include <CommonsJavaScript/JSPendingOperationPrivateObject.h>
#include <CommonsJavaScript/PrivateObject.h>

namespace DeviceAPI {
namespace Most {

typedef WrtDeviceApis::CommonsJavaScript::PrivateObject<MostPtr, WrtDeviceApis::CommonsJavaScript::NoOwnership> MostPrivObject;

/*! \class DeviceAPI::Most::JSMost
 * \brief A Class that implements \b tizen.most object 
 *
 * A Class that implements \b tizen.most object to 
 *
 * It defines the following methods:
 * <ul>
 * </ul>
 */
class JSMost
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

		/**
		*  Place holder for initialization; so far not used, and will probably be removed.
		*/
        static JSValueRef initMost(JSContextRef context,
                               JSObjectRef object,
                               JSObjectRef thisObject,
                               size_t argumentCount,
                               const JSValueRef arguments[],
                               JSValueRef* exception);
		/**
		*  Sends string to Optolyzer to command MOST.
		*/
        static JSValueRef sendCmd(JSContextRef context,
                               JSObjectRef object,
                               JSObjectRef thisObject,
                               size_t argumentCount,
                               const JSValueRef arguments[],
                               JSValueRef* exception);
		/**
		*  High level API used by JavaScript: setTone, setBalance, setSurround, along with
		*  range setting for each control.
		*/
        static JSValueRef setTone(JSContextRef context,
                               JSObjectRef object,
                               JSObjectRef thisObject,
                               size_t argumentCount,
                               const JSValueRef arguments[],
                               JSValueRef* exception);
		/**
		*  High level API used by JavaScript:setBalance
		*/
        static JSValueRef setBalance(JSContextRef context,
                               JSObjectRef object,
                               JSObjectRef thisObject,
                               size_t argumentCount,
                               const JSValueRef arguments[],
                               JSValueRef* exception);
		/**
		*  High level API used by JavaScript: setSurround
		*/
        static JSValueRef setSurround(JSContextRef context,
                               JSObjectRef object,
                               JSObjectRef thisObject,
                               size_t argumentCount,
                               const JSValueRef arguments[],
                               JSValueRef* exception);

		/**
		*  High level API used by JavaScript: setToneRange, setBalanceRange.
		*
		*/
        static JSValueRef setToneRange(JSContextRef context,
                               JSObjectRef object,
                               JSObjectRef thisObject,
                               size_t argumentCount,
                               const JSValueRef arguments[],
                               JSValueRef* exception);
		/**
		*  High level API used by JavaScript:setBalanceRange
		*/
        static JSValueRef setBalanceRange(JSContextRef context,
                               JSObjectRef object,
                               JSObjectRef thisObject,
                               size_t argumentCount,
                               const JSValueRef arguments[],
                               JSValueRef* exception);

        // Everything below is boilerplate:

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


} // Most
} // DeviceAPI

#endif // JSMOST_H

