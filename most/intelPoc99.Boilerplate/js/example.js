
// Example WRT Plugin: This code creates the Example object that is the interface from Widget application code
// to the C++ WRT plugin code.
var Example = (function() {
	"use strict";

	function Example() {
		console.log("Example.js Example ctor called."); 
		var self = this;
		if (typeof(tizen.example) !== 'undefined') {
			this.example = tizen.example;
			console.log("this.example assigned.");
		} else {
			console.log("this.example set to null.");
			this.example = null;
		}		
	}
	
	window.__example = undefined === window.__example ? new Example() : window.__example; 
	
	console.log("new Example created.");
	return window.__example;
})();
