/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
   3  *
   4  * This program is licensed under the terms and conditions of the
   5  * Apache License, version 2.0.  The full text of the Apache License is at
   6  * http://www.apache.org/licenses/LICENSE-2.0/

*global Bootstrap, NFCViewModel, ko */

/**
 * NFC application allows user to set the power of a default device NFC adapter to either a on state or a off state, 
 * automatically read the NDEF text data from NFC tag once it is attached to NFC adapter,
 * write the NDEF text data to the attached NFC Tag through the [tizen.nfc](https://developer.tizen.org/dev-guide/2.2.0/org.tizen.web.device.apireference/tizen/nfc.html) interface.
 * 
 * Data binding is achieved via [Knockoutjs](http://knockoutjs.com/) library and [jQuery](http://jquery.com/) is used for manipulation with HTML elements.
 * 
 * Hover and click on elements in images below to navigate to components of NFC application.
 *
 * <img id="Image-Maps_1201312180420487" src="../assets/img/nfc.png" usemap="#Image-Maps_1201312180420487" border="0" width="649" height="1152" alt="" />
 *   <map id="_Image-Maps_1201312180420487" name="Image-Maps_1201312180420487">
 *     <area shape="rect" coords="0,0,573,78" href="../classes/CarTheme.TopBarIcons.html" alt="top bar icons" title="Top bar icons" />
 *     <area shape="rect" coords="0,77,644,132" href="../classes/CarTheme.Clock.html" alt="clock" title="Clock" />
 *     <area shape="rect" coords="0,994,644,1147" href="../classes/CarTheme.Bottompanel.html" alt="bottom panel" title="Bottom panel" />
 *     <area shape="rect" coords="573,1,644,76" href="../classes/Settings.Settings.html" alt="Settings" title="Settings" />
 *     <area shape="rect" coords="238, 219, 411, 269" href="../classes/NFCApplication.NFCViewModel.html#method_setNFCPowered" alt="Set power state" title="Set power state" />
 *     <area shape="rect" coords="149, 306, 497, 376" href="../classes/NFCApplication.NFCViewModel.html#property_ndefRecordText" alt="NDEF text record" title="NDEF text record" />
 *     <area shape="rect" coords="223, 459, 426, 513" href="../classes/NFCApplication.NFCViewModel.html#method_writeNFCData" alt="Write data" title="Write data" />
 *     <area shape="rect" coords="147, 549, 504, 880" href="../classes/NFCApplication.NFCViewModel.html#property_detectedNFCtag" alt="Attached NFC tag" title="Attached NFC tag" />
 *   </map>
 *
 * @module NFCApplication
 * @namespace NFCApplication
 * @main NFCApplication
 * @class NFC
 */

var nfc = null;

/**
 * Initialize application components.
 * 
 * @method init
 * @static
 */
function nfc_init() {
	"use strict";

	console.log("NFC application init() called");

	nfc = new NFCViewModel();
}

function writeData() {
    nfc.writeNFCData();
}

function togglePower() {
    var toggleOn = $('#powerToggle').hasClass('on');

    nfc.setNFCPowered(! toggleOn);
}

function onNFCTextKeyUp(event) {
    nfc.writeNFCDataOnEnter(event);
}

$(document).ready(function() {
    "use strict";
 
	console.log("NFC application startup");

	nfc_init();

    $('#writeDataButton').click(writeData);
    $('#powerToggle').click(togglePower);
    $('#nfcText').keypress(onNFCTextKeyUp);
});

