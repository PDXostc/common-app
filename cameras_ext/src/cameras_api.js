/* Copyright (C) 2014 Jaguar Land Rover - All Rights Reserved
 *
 * Proprietary and confidential
 * Unauthorized copying of this file, via any medium, is strictly prohibited
 *
 * THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 * KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 * PARTICULAR PURPOSE.
*/

var _callbacks = {};
var _nextReplyId = 0;

function postMessage(msg, callback) {
	  var replyId = getNextReplyId();
	    _callbacks[replyId] = callback;
	      msg.replyId = replyId;
	        extension.postMessage(JSON.stringify(msg));
}

var sendSyncMessage = function(msg) {
	  return JSON.parse(extension.internal.sendSyncMessage(JSON.stringify(msg)));
};

extension.setMessageListener(function(msg) {
	var m = JSON.parse(msg);
  	var replyId = m.replyId;
  	var callback = _callbacks[replyId];

  	if (m.cmd === 'signal') {
    		if (!m.signal_name) {
      			console.error('Invalid signal from Phone api');
      			return;
    		}

    	if (m.signal_name === 'RemoteDeviceSelected') {
      		handleRemoteDeviceSelectedSignal(m);
    	} else if (m.signal_name === 'CallChanged') {
      		handleCallChangedSignal(m);
    	} else if (m.signal_name === 'CallHistoryEntryAdded') {
      		handleCallHistoryEntryAddedSignal(m);
    	} else if (m.signal_name === 'CallHistoryChanged') {
      		handleCallHistoryChangedSignal(m);
    	} else if (m.signal_name === 'ContactsChanged') {
      		handleContactsChangedSignal(m);
    	}
  } else if (!isNaN(parseInt(replyId)) && (typeof(callback) === 'function')) {
  	callback(m);
    	delete m.replyId;
    	delete _callbacks[replyId];
  } else {
    	console.error('Invalid replyId from Phone api: ' + replyId);
  }
});

