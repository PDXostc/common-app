/*
 * Copyright (c) 2014, Intel Corporation, Jaguar Land Rover
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
 */

/**
 * Provides access to the NFC functionalities such as set the power of a default device NFC
 * adapter to either a on state or a off state,
 *
 * Registers a callback functions to be invoked when a NFC tag is attached or detached,
 * and reads the NDEF text data from the attached NFC tag.
 *
 * Writes the NDEF text data to the attached NFC Tag
 *
 * Throughout uses the W3C interface for NFC as implemented by Crosswalk:
 *          http://www.w3.org/TR/nfc/
 */


// The tag, if present
var _nfcTag = null;




var NFCViewModel = function() {
    "use strict";
    var self = this;

    ////////////////////////////////////////////////////////////////////
    // show the current state in the UI
    self.setState = function(state) {

        var placeTagOn = $('#tagNotifyHex').hasClass('on');
    
        console.log("setting state:", state);

        switch(state) {
        case "off":
            $('#msgOn').show();
            
            $('#msgAddTag').hide();
            $('#msgTagPresent').hide();
            
            $('#nfcText').val("");
            $('#nfcText').prop('disabled', true);
            
            $('#writeDataButton').prop('disabled', true);
            $('#writeDataButton').hide();

            $('#tagFoundMsg').text("");
            $('#tagNotifyHex').hide();
            break;
        case "on - no tag":
            $('#msgOn').hide();
            
            $('#msgAddTag').show();
            $('#msgTagPresent').hide();
            
            $('#nfcText').val("");
            $('#nfcText').prop('disabled', true);
            
            $('#writeDataButton').prop('disabled', true);
            $('#writeDataButton').hide();
            
            $('#tagFoundMsg').text("SEARCHING");            
            $('#tagNotifyHex').show();
            if (placeTagOn) {
                $('#tagNotifyHex').toggleClass('on off');
            }
            break;
        case "on - tag":
            $('#msgOn').hide();
            
            $('#msgAddTag').hide();
            $('#msgTagPresent').show();
            
            $('#nfcText').val(self.RecordView().Text());
            $('#nfcText').prop('disabled', false);
            
            $('#writeDataButton').prop('disabled', false);
            $('#writeDataButton').show();

            $('#tagFoundMsg').text("TAG FOUND");
            $('#tagNotifyHex').show();
            if (! placeTagOn) {
                console.log("toggling notify hex");
                $('#tagNotifyHex').toggleClass('on off');
            }
            break;
        }
        
        var toggleOn = $('#powerToggle').hasClass('on');
        if (toggleOn != self.powered()) {
            $('#powerToggle').toggleClass('on off')
        }
    }

    navigator.nfc.addEventListener('tagfound', function(event) {
        console.log("Tag found:", event);
       
        self.setState("on - tag");

        if (!!event.tag) {
            _nfcTag = event.tag;
            self.readNFCData();
        }
    } );

    navigator.nfc.addEventListener('taglost', function (event) {
        console.log("Tag lost");
        
        self.tag(null);

        self.setState("on - no tag");

        if (!! self.RecordText()) {
            self.RecordText().reset();
        }
    });

    //////////////////////////////////////////////////////////////////////
    // Methods to interact with the UI

    // Power:
    //
    // Interact with the UI elements for power - change the power
    // state of the NFC adapter to match the UI toggle switch and 
    // update the current state of the UI elements.
    self.setNFCPowered = function(powered) {

        // current UI state
        var toggleOn = $('#powerToggle').hasClass('on');

        // sync the device state with the UI
        if (self.powered() !== powered) {
            self.setPowered(powered, function() {
                console.log("NFC setNFCPowered succeed.");
            }, 
            function(error) {
                console.log("NFC setNFCPowered failed: ", error);
                
                //showMessage("THERE WAS AN ERROR WHILE TURNING NFC ADAPTER " + 
                //            (powered ? "ON" : "OFF") + 
                //            ". </ br>PLEASE TRY AGAIN...", "ERROR");
            });
        }

        // Update the UI elements to the new state

        if (self.powered() !== toggleOn) {
            $('#powerToggle').toggleClass('on off');
        }

        // set the UI state to on, but no tag present
        if (self.powered()) {
            self.setState("on - no tag");
        }
        else {
           self. setState("off");
        }         
    };

    // Read data from the NFC Tag
    //
    // Reads the data and updates the UI elements appropriately - including populating
    // the edit box and enabling the controls for changing the data.
    self.readNFCData = function() {

        self.readNDEF(
            function() {
                self.setState("on - tag");
            }, 
            function(msg) {
                self.setState("on - no tag");

                if (!!msg) {
                    showMessage("THERE WAS AN ERROR WHILE READING.</ br>READING NOT COMPLETE.</ br>PLEASE TRY AGAIN...", 
                                "ERROR");
                }
            }
        );
    };

    // Write data to the NFC Tag
    // 
    // Takes the string from the UI element and writes it to the NFC tag
    self.writeNFCData = function() {
        // get the text from the UI
        self.RecordView().SetText($('#nfcText').val());

        self.writeNDEF(
            function() {
                //showPopupMessage("OPERATION COMPLETED SUCCESSFULLY!");
            }, function(error) {
                if (!!error) {
                    //showMessage("THERE WAS AN ERROR WHILE WRITING.</ br>WRITING NOT COMPLETE.</ br>PLEASE TRY AGAIN...", "ERROR");
                }
            }
        );
   };

    // Capture the enter key to do a "write" operation
    self.writeNFCDataOnEnter = function(event) {
        if (event.keyCode === 13) {
            self.writeNFCData();
        }
        return true;
    };

    ////////////////////////////////////////////////////////////////////////
    // set up the power switch and state 
    _powered = navigator.nfc.powered;
    var toggleOn = $('#powerToggle').hasClass('on');

    if (toggleOn !== self.powered()) {
        $('#powerToggle').toggleClass('on off')
    }

    if (self.powered()) {
        self.setState("on - no tag");
    }
    else {
        self.setState("off");
    }

    // currently, we are only set up to read/write tags. 
    // TODO: add peers

    navigator.nfc.startPoll().then(
        function() { console.log("startPoll succeeded"); },
        function() { console.log("startPoll failed"); } );

};

//////////////////////////////////////////////////////////////////////////////
// Internal methods - the following methods have no interaction with the UI


// Interface to the NFC Tag
NFCViewModel.prototype.tag = function() {
    "use strict";
    return _nfcTag;
}

// Is the tag present?
NFCViewModel.prototype.hasTag = function() {
    "use strict";
    return _nfcTag != null;
}

// The RecordText view encapsolates a NDEF Record as defined
// by the NFC spec - this is what is read/writen from the tag.

// Interface to the NDEF Record View
var _recordView = new NDEFRecordTextViewModel();

NFCViewModel.prototype.RecordView = function () {
    "use strict";
    return _recordView;
}

// Power state of the NFC reader
var _powered = false;

NFCViewModel.prototype.powered = function() {
    "use strict";

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
    
    _powered = navigator.nfc.powered;

    if (self.powered() === state) {
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
/* the promise isn't coming back. This should read:
        navigator.nfc.powerOn().then( 
            function() { 
                _powered = navigator.nfc.powered; 
                if (!! successCallback) { successCallback(); } 
            },
            function() { 
                _powered = navigator.nfc.powered; 
                if (!! errorCallback) { errorCallback("NFC Power On failed"); } 
            });
*/
        navigator.nfc.powerOn();
        _powered = true;
    } 
    else {
/* the promise does not return. This should read:
        navigator.nfc.powerOff().then( 
            function() { 
                _powered = navigator.nfc.powered; 
                if (!! successCallback) { successCallback(); } 
            },
            function() { 
                _powered = navigator.nfc.powered; 
                if (!! errorCallback) { errorCallback("NFC Power Off failed"); } 
            });
*/
        navigator.nfc.powerOff();
        _powered = false;
    }

/* remove when promise works: */
    if (!! successCallback) { successCallback(); }
};


/**
 * Reads the NDEF data from the detected/attached NFC tag and puts it into the RecordView
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
        console.log("no tag, exiting");
        self.SetRecordView().reset;
        return ;
    }

    try {
        console.log("Reading NDEF");
        self.tag().readNDEF().then(
            function(ndefMessage) {
                console.log("NFC tag.readNDEF succeed: ", ndefMessage);
                
                self.RecordView().set(ndefMessage).then(
                    function(message) {
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
 * Writes the NDEF record text from the RecordView to the NFC tag.
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
/*
Currently, the write operation succeeds, but does not invoke the callbacks.
It should read:
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
*/

        self.tag().writeNDEF(new NDEFMessage([textRecord]));

        console.log("NFC tag.writeNDEF succeed.");
        if (!!writeCallback) {
            writeCallback();
        }

    } 
    catch (err) {
        error = err.message;
        console.log("NFC tag.writeNDEF error: ", err);
        if (!!errorCallback) {
            errorCallback(error);
        }
    }
};
