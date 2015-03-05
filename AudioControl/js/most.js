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

// Instantiates the tizen.most object, causing the MOST WRT plugin library to be loaded and
// its API available.
var Most = (function() {
	"use strict";

	function Most() {
//		console.log("most.js Most ctor called."); 
		var self = this;
		if (typeof(tizen.most) !== 'undefined') {
			this.most = tizen.most;
//			console.log("this.most assigned.");
		} else {
			this.most = null;
		}		
	}

	Most.prototype.callInitMost = function() {

		var self = this;
	
	};
	
	window.__most = undefined === window.__most ? new Most() : window.__most; 
	
//	console.log("new Most called.");
	return window.__most;
})();
