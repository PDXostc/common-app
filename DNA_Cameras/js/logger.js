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
* Filename:             logger.js
* Version:              1.0
* Date:                 March 2014
* Project:              JLR POC - Cameras
* Contributors:         -
*
* Incoming Code:        -
*
*/


/**
 * This script defines logging functionality.
 */

var preCacheLog = [];
window.alert1 = function(str) {
    preCacheLog.push(str);
}

console.log1 = console.log;
console.log = function(str) {
    alert1('Console: ' + str);
    console.log1.apply(this, arguments);
}
console.error = console.debug = console.info =  console.log;

window.onerror = function(message, source, lineno) {
    alert1('OnError: ' + message);
    alert1('line: ' + lineno + ' in file: ' + source);
}

window.onload = function() {
    $('#debug_txt').hide();
    $('#debug_div').click(function() {
        $('#debug_txt').toggle();
    });
    
    window.alert1 = function(str) {
      var tx = document.getElementById('debug_txt');
      tx.innerHTML = tx.innerHTML + '\n' + str;
    }
    alert1('hello');
    
    while (preCacheLog.length > 0) {
      alert1(preCacheLog.shift());
    }
    console.log('test console');
}


function log(type, message) {
    
    if(arguments.length > 2) {
        message = arguments;
        /* arguments is like an array but has no its regular methods */
        message.shift = function() {return Array.prototype.pop.call(this);}
        type = message.shift();
        message.shift = undefined;
    }
    else if (!message && typeof type === 'string') {
        message = type;
        type = undefined;
    }

    switch(type) {
        case 'error':
        case 'err':
            console.error(message);
            break;
        case 'warn':
        case 'warning':
            console.warn(message);
            break;
        case 'info':
            console.info(message);
            break;
        default:
            console.oldLog(message);
                
    }
    
    /* Re-define the behavior here */
    /* i.e. send log message to server and write to file */
    
    
    /* Send log message to Node JS */
    $.ajax({
        type: 'POST',
        url: 'http://localhost:8881/logger',
        data: JSON.stringify({message: message}),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(res) {console.oldLog('nodejs handled log')},
        error: function(jq, ts, err) { }
    });
}


/* Init function set new handler for console.log */
/* 
(function(con) {
    con.oldLog = con.log;
    con.log = log;
    
    con.log('logger connected');
})(console);
*/
