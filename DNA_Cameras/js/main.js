/* Copyright (C) Jaguar Land Rover - All Rights Reserved
*
* Proprietary and confidential
* Unauthorized copying of this file, via any medium, is strictly prohibited
*
* THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY 
* KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
* PARTICULAR PURPOSE.
*
* Filename:	 main.js
* Version:              1.0.1
* Date:                 March 2014
* Project:              JLR POC - Cameras
* Contributors:         -
*                       -
*
* Incoming Code:        -
*
*/

/*global Bootstrap */

/**
  * Boilerplate application provides starting point for new applications and provides basic layout and infrastructure:
  *
  * * {{#crossLink "Bootstrap"}}{{/crossLink}} component
  * * {{#crossLink "BottomPanel"}}{{/crossLink}} component
  * * {{#crossLink "TopBarIcons"}}{{/crossLink}} component
  *
  * Update following code for new applications built from this code:
  *
  * * `config.xml` - update `/widget/@id`, `/widget/tizen:application/@id`, `/widget/tizen:application/@name`, `/widget/name`
  * * `icon.png` - application icon
  *
  * @module BoilerplateApplication
  * @main BoilerplateApplication
 **/
var bootstrap;
/**
 * Reference to instance of  class object this class is inherited from dataModel {@link CarIndicator}
@property carInd {Object}
 */
var carInd;
/**
 * Reference to instance of ThemeEngine class object
 * @property te {Object}
 */
var te;

/**
 * Array of signals who want subscribe in carInd 
 * @property carIndicatorSignals {string[]}
 */
var carIndicatorSignals =  [
                            "IviPoC_NightMode"
                            ];

/**
 * Initialize application components and register button events.
 * 
 * @method init
 * @static
 */

var init = function () {
     "use strict";
     bootstrap = new Bootstrap(function (status) {
	$("#clockElement").ClockPlugin('init', 60);
	$("#clockElement").ClockPlugin('startTimer');

        $("#topBarIcons").topBarIconsPlugin('init');
	$('#bottomPanel').bottomPanel('init');
	
	window.setTimeout(function() {
		JLRCameras.startApp();
	}, 2000);
    });
}

/**
 * Calls initialization fuction after document is loaded.
 * @method $(document).ready
 * @param init {function} Callback function for initialize Store.
 * @static
 **/
$(document).ready(init);

/**
 * Applies selected theme to application icons 
 * @method setThemeImageColor
 * @static
 **/
function setThemeImageColor() {
	var imageSource;
	$('body').find('img').each(function() {
		var self = this;
		imageSource = $(this).attr('src');

	    if (typeof(imageSource) !== 'undefined' && $(this.parentElement).hasClass('themeImage') == false) {
	        console.log(imageSource);

	        var img = new Image();
	        var ctx = document.createElement('canvas').getContext('2d');

	        img.onload = function () {
	            var w = ctx.canvas.width = img.width;
	            var h = ctx.canvas.height = img.height;
	            ctx.fillStyle = ThemeKeyColor;
	            ctx.fillRect(0, 0, w, h);
	            ctx.globalCompositeOperation = 'destination-in';
	            ctx.drawImage(img, 0, 0);

	            $(self).attr('src', ctx.canvas.toDataURL());
	            $(self).hide(0, function() { $(self).show();});
	        };

	        img.src = imageSource;
	    }
	});
}

function setupSpeechRecognition() {
	console.log("Store setupSpeechRecognition");
	Speech.addVoiceRecognitionListener({
		onapplicationinstall : function() {
			console.log("Speech application install invoked");
			if (_applicationDetail.id !== undefined) {
				StoreLibrary.installApp(_applicationDetail.id);
			}
		},
		onapplicationuninstall : function() {
			console.log("Speech application uninstall invoked");
			if (_applicationDetail.id !== undefined) {
				StoreLibrary.uninstallApp(_applicationDetail.id);
			}
		}

	});
}
