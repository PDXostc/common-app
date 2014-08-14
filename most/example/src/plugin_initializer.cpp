//
// Tizen Web Device API
// Copyright (c) 2013 Intel Corporation
//
// Licensed under the Apache License, Version 2.0 (the License);
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

#include <Commons/plugin_initializer_def.h>
#include <Commons/WrtAccess/WrtAccess.h>
#include "JSExample.h"
#include <Logger.h>

namespace DeviceAPI {
namespace Example {

using namespace WrtDeviceApis;
using namespace WrtDeviceApis::Commons;

class_definition_options_t ConstructorClassOptions =
{
	JS_INTERFACE,
	CREATE_INSTANCE,
	NONE_NOTICE,
	USE_OVERLAYED, 
	NULL,
	NULL,
	NULL
};

void on_widget_start_callback(int widgetId) {
	LoggerD("[TIZEN\\Example] on_widget_start_callback ("<<widgetId<<")");
	Try
	{
		WrtAccessSingleton::Instance().initialize(widgetId);
	}
	Catch(Commons::Exception)
	{
		LoggerE("WrtAccess initialization failed");
	}
}

void on_widget_stop_callback(int widgetId) {
	LoggerD("[TIZEN\\Example] on_widget_stop_callback ("<<widgetId<<")");
	Try
	{
		WrtAccessSingleton::Instance().deinitialize(widgetId);
	}
	Catch(Commons::Exception)
	{
		LoggerE("WrtAccess deinitialization failed");
	}
}

PLUGIN_ON_WIDGET_START(on_widget_start_callback)
PLUGIN_ON_WIDGET_STOP(on_widget_stop_callback)

PLUGIN_CLASS_MAP_BEGIN
PLUGIN_CLASS_MAP_ADD_CLASS(WRT_JS_EXTENSION_OBJECT_TIZEN,
		"example",
		(js_class_template_getter)JSExample::getClassRef,
		NULL)

PLUGIN_CLASS_MAP_END

} // Example
} // DeviceAPI

