/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
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
