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
};


var _text = "";
NDEFRecordTextViewModel.prototype.Text = function() { 
    return _text;
}
NDEFRecordTextViewModel.prototype.text = function() { 
    return _text;
}

NDEFRecordTextViewModel.prototype.SetText = function(newT) {
    _text = newT;
}

/**
 * The language code string value, followed by IANA[RFC 3066] (for example, en-US, ko-KR). By default, this property is set to en-US.
 * 
 * @property languageCode
 * @type ko.observable
 * @default "en-US"
 */

var _languageCode = "en-US";
NDEFRecordTextViewModel.prototype.LanguageCode = function () { 
    return _languageCode;
}
NDEFRecordTextViewModel.prototype.SetLanguageCode = function (newL) { 
    _languageCode = newL;
}


/**
 * The encoding type. By default, this property is set to UTF8.
 * 
 * @property encoding
 * @type ko.observable
 * @default "UTF8"
 */
var _encoding = "UTF8";
NDEFRecordTextViewModel.prototype.Encoding = function() {
    return _encoding;
}

NDEFRecordTextViewModel.prototype.SetEncoding = function(newE) {
    _encoding = newE;
}
/**
 * The decoded text.
 * 
 * @property text
 * @type ko.observable
 * @default ""
 */
/**
 * Return a NDFEFRecord that can be written back to the tag.
 */
NDEFRecordTextViewModel.prototype.get = function() {
    "use strict";
    self = this;

    var ndefTextRecord = new NDEFRecordText(encodeURIComponent(self.text()), 
                                            self.LanguageCode(), 
                                            self.Encoding());

    console.log("New NDEF text record: ", ndefTextRecord);

    return ndefTextRecord;
}

/**
 * Sets text, languageCode and encoding properties from a given Tizen's NDEFRecordText object.
 * 
 * @method set
 * @param tizenNDEFRecordText {Object} Tizen's representation of NDEFRecordText to be set.
 */
NDEFRecordTextViewModel.prototype.set = function(incomingRecordText) {

    var self = this;

    console.log("setting new incoming record text");

	return new Promise(
        function(resolve, reject) {

            console.log("resolving promise");

			if (!incomingRecordText || incomingRecordText.type !== "T") {
				reject("Tag does not contain text message");
			}
			
			self.reset();
			self.SetText(decodeURIComponent(incomingRecordText.text));
			
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
NDEFRecordTextViewModel.prototype.reset = function() {
    var self = this;

    self.SetText("");
    self.SetLanguageCode("en-US");
    self.SetEncoding("UTF8");
};


