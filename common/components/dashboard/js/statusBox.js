/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/** 
 * @module DashboardApplication
 */

(function ($) {
	"use strict";
	/**
	 * Class which provides methods to fill content of status box for JQuery plugin.
	 * @class statusBoxPluginObj
	 * @static
	 */
	var statusBoxPluginObj = {
			/** 
			 * Method is initializing bottom panel.
			 * @method init
			 * @param caption {String} Caption of status box.
			 * @param title {String} Title of status box.
			 * @param status {String} Status info of status box.
			 */
			init: function (caption, title, status) {
				this.empty();
				var appendText = '<div id="leftTopCorner" class="corner leftTopCorner"></div>';
				appendText += '<div id="leftBottomCorner" class="corner leftBottomCorner"></div>';
				appendText += '<div id="rightTopCorner" class="corner rightTopCorner"></div>';
				appendText += '<div id="rightBottomCorner" class="corner rightBottomCorner"></div>';
				appendText += '<div id="captionIndicator' + this[0].id + '" class="boxIconText captionIndicator"></div>';
				appendText += '<div id="textIndicator" class="fontSizeSmall fontWeightBold fontColorNormal textIndicator">' + title.toUpperCase() + '</div>';
				appendText += '<div id="statusIndicator" class="fontSizeXSmall fontWeightBold fontColorDimmed statusIndicator">' + status.toUpperCase() + '</div>';
				this.append(appendText);
				$("#captionIndicator" + this[0].id).boxCaptionPlugin('initSmall', caption);
			}
		};
	/** 
	 * Class which provides acces to {{#crossLink "statusBoxPluginObj"}}{{/crossLink}} methods.
	 * @class statusBoxPlugin
	 * @constructor
	 * @param method {Object} Identificator (name) of method.
	 * @return Result of called method.
	 */
	$.fn.statusBoxPlugin = function (method) {
		// Method calling logic
		if (statusBoxPluginObj[method]) {
			return statusBoxPluginObj[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return statusBoxPluginObj.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.boxCaptionPlugin ');
		}
	};
}(jQuery));
