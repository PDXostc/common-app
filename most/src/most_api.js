/*
 * Modified by: Jeff Eastwood
 * Purpose: Part of XW infrastructure to link javaScript to C++ plugin code.
 * Description:
 * Provides the three generic interfaces from C++ plugin to JavaScript: synchronous and asynch. calls
 * from javaScript to C++, and a listener method that receives return messages sent from the C++ plugin.
  */
var mostListener = null;

extension.setMessageListener(function(json) {
	
	  var message = JSON.parse(json);
	  var msg = message.msg;

	  if (mostListener instanceof Function) {
		  mostListener(msg);

	  } else {
	    console.log("JE js api: mostListener not set.");
	  }
	
});

// Unlike the example code (echo) this was taken from, msg will already be stringified json.
exports.mostAsync = function (msg, callback) {
	
	  mostListener = callback;
	  
//	  var resp = {"msg": msg};
//	  extension.postMessage(JSON.stringify(resp));
	  extension.postMessage(msg);
	  
};

// Unlike the example code (echo) this was taken from, msg will already be stringified json.
exports.mostSync = function (msg) {
//	  var resp = {"msg": msg};
 // return extension.internal.sendSyncMessage(JSON.stringify(resp));
	return extension.internal.sendSyncMessage(msg);
};