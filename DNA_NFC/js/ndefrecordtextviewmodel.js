/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
   3  *
   4  * This program is licensed under the terms and conditions of the
   5  * Apache License, version 2.0.  The full text of the Apache License is at
   6  * http://www.apache.org/licenses/LICENSE-2.0

global ko */

/**
 * Class represents NDEF record that has the text type payload.
 * 
 * @module NFCApplication
 * @namespace NFCApplication
 * @class NDEFRecordTextViewModel
 * @constructor
 */
var NDEFRecordTextViewModel = function() {
    "use strict";
    var self = this;

    /**
     * The decoded text.
     * 
     * @property text
     * @type ko.observable
     * @default ""
     */
    this.text = ko.observable("");
    /**
     * The language code string value, followed by IANA[RFC 3066] (for example, en-US, ko-KR). By default, this property is set to en-US.
     * 
     * @property languageCode
     * @type ko.observable
     * @default "en-US"
     */
    this.languageCode = ko.observable("en-US");
    /**
     * The encoding type. By default, this property is set to UTF8.
     * 
     * @property encoding
     * @type ko.observable
     * @default "UTF8"
     */
    this.encoding = ko.observable("UTF8");

    /**
      * Return a NDFEFRecord that can be written back to the tag.
      */
    this.get = function() {
        var ndefTextRecord = new NDEFRecordText(encodeURIComponent(self.text()), 
                                                self.languageCode(), 
                                                self.encoding());

        console.log("New NDEF text record: ", ndefTextRecord);

        return ndefTextRecord;
	}

    /**
     * Sets text, languageCode and encoding properties from a given Tizen's NDEFRecordText object.
     * 
     * @method set
     * @param tizenNDEFRecordText {Object} Tizen's representation of NDEFRecordText to be set.
     */
    this.set = function(incomingRecordText) {

		return new Promise(
            function(resolve, reject) {

			    if (!incomingRecordText || ! incomingRecordText.type === "T") {
				    reject("Tag does not contain text message");
			    }
			    
			    
			    self.reset();
			    self.text(decodeURIComponent(incomingRecordText.text));
			    
			    resolve(self.text());
		    }
        );

/*

            if (!!incomingRecordText.languageCode && incomingRecordText.languageCode.toString().trim() !== "") {
                self.languageCode(incomingRecordText.languageCode);
            }

            if (!!incomingRecordText.encoding && incomingRecordText.encoding.toString().trim() !== "") {
                self.encoding(incomingRecordText.encoding);
            }
*/
    };

    /**
     * Resets all the properties to their default values.
     * 
     * @method reset
     */
    this.reset = function() {
        self.text("");
        self.languageCode("en-US");
        self.encoding("UTF8");
    };

};
