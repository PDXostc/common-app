/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 3  *
 4  * This program is licensed under the terms and conditions of the
 5  * Apache License, version 2.0.  The full text of the Apache License is at
 6  * http://www.apache.org/licenses/LICENSE-2.0

 * global showMessage, showLoadingSpinner, hideLoadingSpinner, ko, NDEFRecordTextViewModel, showPopupMessage  */

/**
 * Provides access to the NFC functionalities such as set the power of a default device NFC adapter to either a on state or a off state,
 * register a callback functions to be invoked when a NFC tag is attached or detached,
 * read the NDEF text data from the attached NFC tag,
 * write the NDEF text data to the attached NFC Tag through the [navigator.nfc](https://developer.tizen.org/dev-guide/2.2.0/org.tizen.web.device.apireference/tizen/nfc.html) interface.
 *
 * @module NFCApplication
 * @namespace NFCApplication
 * @class NFCViewModel
 * @constructor
 */
var NFCViewModel = function() {
    "use strict";
    var self = this;

    navigator.nfc.addEventListener('tagfound', function(event) {
        console.log("Tag found");
        if (!!event.tag) {
            self.setTag(event.tag);
            self.readNFCData();
        }
    } );

    navigator.nfc.addEventListener('taglost', function (event) {
        console.log("Tag lost");
        self.tag(null);
        if (!! self.RecordText()) {
            self.SetRecordText(null);
        }
        hideLoadingSpinner();
    });

    self.powered = navigator.nfc.powered;

    // currently, we are only set up to read/write tags. 
    // TODO: add peers
    // navigator.nfc.addEventListener('peerfound', peerFound);
    // navigator.nfc.addEventListener('peerlost', peerLost);

    navigator.nfc.startPoll().then(
        function() { console.log("startPoll succeeded"); },
        function() { console.log("startPoll failed"); } );


    /**
     * In case power state of plugged in/connected NFC adapter is not the same as a given state it calls {{#crossLink "NFCApplication.NFCViewModel/setPowered:method"}}{{/crossLink}} method
     * in order to change the power state of adapter. Additionally it shows a loading spinner and message dialog when an error occurs during setting a new power state.
     *
     * Function is intended to be called/binded to the UI.
     *
     * @method setNFCPowered
     * @param powered {Boolean} Power state to be set.
     */
    self.setNFCPowered = function(powered) {
        console.log("togglePower called: " + powered);
        if (self.powered !== powered) {
            showLoadingSpinner(powered ? "TURNING ON" : "TURNING OFF");
            self.setPowered(powered, function() {
                console.log("NFC setNFCPowered succeed.");
                hideLoadingSpinner(powered ? "TURNING ON" : "TURNING OFF");
            }, function(error) {
                console.log("NFC setNFCPowered failed: ", error);
                hideLoadingSpinner(powered ? "TURNING ON" : "TURNING OFF");
                showMessage("THERE WAS AN ERROR WHILE TURNING NFC ADAPTER " + (powered ? "ON" : "OFF") + ". </ br>PLEASE TRY AGAIN...", "ERROR");
            });
        }
    };

    /**
     * Starts reading of NDEF record text from attached NFC tag by calling {{#crossLink "NFCApplication.NFCViewModel/readNDEF:method"}}{{/crossLink}} method.
     * Additionally it shows a loading spinner and message dialog when an error occurs during reading.
     *
     * Function is intended to be called/binded to the UI.
     *
     * @method readNFCData
     */
    self.readNFCData = function() {
        console.log("readNFCData called");
        showLoadingSpinner("READING");
        self.readNDEF(
            function() {
                hideLoadingSpinner("READING");
            }, 
            function(error) {
                hideLoadingSpinner("READING");
                if (!!error) {
                    showMessage("THERE WAS AN ERROR WHILE READING.</ br>READING NOT COMPLETE.</ br>PLEASE TRY AGAIN...", 
                                "ERROR");
                }
            }
        );
    };

    /**
     * Starts writing the NDEF record text to attached NFC tag by calling {{#crossLink "NFCApplication.NFCViewModel/writeNDEF:method"}}{{/crossLink}} method.
     * Additionally it shows a loading spinner and message dialog when an error occurs during writing.
     *
     * Function is intended to be called/binded to the UI.
     *
     * @method writeNFCData
     */
    self.writeNFCData = function() {
        console.log("writeNFCData called");
        showLoadingSpinner("WRITING");
        
        self.writeNDEF(
            function() {
                hideLoadingSpinner("WRITING");
                showPopupMessage("OPERATION COMPLETED SUCCESSFULLY!");
            }, function(error) {
                hideLoadingSpinner("WRITING");
                if (!!error) {
                    showMessage("THERE WAS AN ERROR WHILE WRITING.</ br>WRITING NOT COMPLETE.</ br>PLEASE TRY AGAIN...", "ERROR");
                }
            }
        );
        if ($("#inputNDEFRecordText").length) {
            $("#inputNDEFRecordText").blur();
        }
    };

    /**
     * Calls {{#crossLink "NFCApplication.NFCViewModel/writeNFCData:method"}}{{/crossLink}} method in case the pressed key is enter (keyCode is 13).
     *
     * Function is intended to be called/binded to the UI on a key press event.
     *
     * @method writeNFCDataOnEnter
     */
    self.writeNFCDataOnEnter = function(data, event) {
        console.log("writeNFCDataOnEnter called");
        if (event.keyCode === 13) {
            self.writeNFCData();
        }
        return true;
    };
};


/**
 * Represents NFC tag attached to the device's default NFC adapter. Provides information about the NFC tag, such as type, size of NDEF message stored in the tag and methods
 * to read and write NDEF message.
 *
 * @property tag
 * @public
 * @type ko.observable
 * @default null
 */


var _tag = null;

NFCViewModel.prototype.tag = function() {
    return _tag;
}

NFCViewModel.prototype.setTag = function(newTag) {
    _tag = newTag;
}

/**
 * Represents NDEF text record of attached NFC tag.
 *
 * @property RecordText
 * @public
 * @type ko.observable
 * @default NDEFRecordTextViewModel
 */
var _recordView = new NDEFRecordTextViewModel();

NFCViewModel.prototype.RecordView = function () {
    return _recordView;
}

var _powered = false;

NFCViewModel.prototype.powered = function() {
    return _powered;
}


/**
 * Sets the power of an NFC adapter to either a on state or a off state.
 *
 * @method setPowered
 * @param state {Boolean} The state of NFC adapter, true means on, false means off;
 * @param successCallback {Function} The method to call when NFC adapter is enabled or disabled successfully.
 * @param errorCallback {Function} The method to call when an error occurs.
 */
NFCViewModel.prototype.setPowered = function(state, successCallback, errorCallback) {
    "use strict";
    console.log("NFC setPowered called: " + state);
    var self = this;
    var error = null;
    
    self.powered = navigator.nfc.powered;

    if (self.powered === state) {
        return ;
    }

    if (typeof(navigator) === 'undefined' || typeof(navigator.nfc) === 'undefined') {
        error = "NFC interface is not available";
        console.log(error);
        if (!! errorCallback) {
            errorCallback(error);
        }
        return ;
    }

    if (state) {
        navigator.nfc.powerOn().then( 
            function() { 
                self.powered = navigator.nfc.powered; 
                if (!! successCallback) { successCallback(); } 
            },
            function() { 
                self.powered = navigator.nfc.powered; 
                if (!! errorCallback) { errorCallback("NFC Power On failed"); } 
            });
    } 
    else {
        navigator.nfc.powerOff().then( 
            function() { 
                self.powered = navigator.nfc.powered; 
                if (!! successCallback) { successCallback(); } 
            },
            function() { 
                self.powered = navigator.nfc.powered; 
                if (!! errorCallback) { errorCallback("NFC Power Off failed"); } 
            });
        navigator.nfc.powerOff();
        self.powered = false;
    }
};


/**
 * Reads the NDEF data from the detected/attached NFC tag and sets it to {{#crossLink "NFCApplication.NFCViewModel/ndefRecordView:property"}}{{/crossLink}} property.
 *
 * @method readNDEF
 * @param readCallback {Function} The method invoked in case of successfully reading the NDEF Data.
 * @param errorCallback {Function} The method invoked in case of any error during reading the NDEF Data.
 */
NFCViewModel.prototype.readNDEF = function(readCallback, errorCallback) {
    "use strict";
    console.log("NFC readNDEF called");
    var self = this;
    var error = null;

    if (! self.tag()) {
        self.SetRecordView().reset;
        return ;
    }

    try {
        self.tag().readNDEF().then(
            function(ndefMessage) {
                console.log("NFC tag.readNDEF succeed: ", ndefMessage);
                
                self.RecordView().set(ndefMessage).then(
                    function(message) {
                        console.log("NFC tag is text, message: ", message);
                        if (!! readCallback) {
                            readCallback();
                        }
                    },
                    function(err) {
                        console.log(err);
                    }
                );
            }, 
            function(err) {
                error = err.message;
                console.log("NFC tag.readNDEF failed: ", err);
                if (!!errorCallback) {
                    errorCallback(error);
                }
            });
    }
    catch (err) {
        error = err.message;
        console.log("NFC tag.readNDEF error: ", err);
        if (!!errorCallback) {
            errorCallback(error);
        }
    }
};

/**
 * Writes the NDEF record text {{#crossLink "NFCApplication.NFCViewModel/ndefRecordView:property"}}{{/crossLink}} to the detected/attached NFC tag.
 *
 * @method writeNDEF
 * @param writeCallback {Function} The method invoked in case of successfully writing the NDEF Data.
 * @param errorCallback {Function} The method invoked in case of any error during writing the NDEF Data.
 */
NFCViewModel.prototype.writeNDEF = function(writeCallback, errorCallback) {
    "use strict";
    console.log("NFC writeNDEF called");
    var self = this;
    var error = null;

    if (!self.tag()) {
        error = "NFC tag is not detected/attached.";
    }
    if (!self.RecordView()) {
        error = "NFC NDEFRecordView is undefined.";
    }
    if (typeof (self.tag().writeNDEF) === 'undefined') {
        error = "NFC tag.writeNDEF is not available.";
    }

    if (!!error) {
        console.log(error);
        if (!!errorCallback) {
            errorCallback(error);
        }
        return ;
    }
    
    try {
        var textRecord = self.RecordView().get();
/* From the demo app:
        var tag = self.tag();

        var text = new NDEFRecordView("hello world", "en-US", "UTF-8");
        tag.writeNDEF(new NDEFMessage([text])).then(function(){ console.log("writeTextNDEF Succeeded"); },
                                                    function(){ console.log("writeTextNDEF Failed"); });

currently, the write operation succeeds, but does not invoke the callbacks.
*/
        self.tag().writeNDEF(new NDEFMessage([textRecord])).then(
            function() {
                console.log("NFC tag.writeNDEF succeed.");
                if (!!writeCallback) {
                    writeCallback();
                }
            }, 
            function(err) {
                error = err.message;
                console.log("NFC tag.writeNDEF failed: ", err);
                if (!!errorCallback) {
                    errorCallback(error);
                }
            }
        );
    } 
    catch (err) {
        error = err.message;
        console.log("NFC tag.writeNDEF error: ", err);
        if (!!errorCallback) {
            errorCallback(error);
        }
    }
};
