/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*global disconnectCall, Bootstrap, Carousel, ContactsLibrary, getAppByID, disconnectCall, Configuration, Speech, Phone, changeCssBgImageColor, ThemeKeyColorSelected */
//includeJs("./js/main.js");
//includeJs("./js/callhistorycarousel.js");
//includeJs("./js/phone.js");
//includeJs("./js/contacts_library.js");

//includeJs("./DNA_common/js/predefAppModel.js");
//includeJs("./DNA_common/js/installedApps.js");
//includeJs("./DNA_common/js/keyControl.js");
//includeJs("./DNA_common/js/actionCatcher.js");
//includeJs("./DNA_common/js/HomeScreenMain.js");
includeJs("js/contacts_library.js");

includeJs("js/callhistorycarousel.js",function(){
			if (!callHistoryCarousel) {

				callHistoryCarousel = new Carousel();
			}
	});
	    onDepenancy("knockout.js",function(){
				includeJs("js/phone.js");
			},"phone");


/** 
 * This application provides voice call from paired Bluetooth phone. Application uses following APIs:
 *
 * * {{#crossLink "Phone"}}{{/crossLink}} library
 * * [tizen.bt]() as replacement of [tizen.bluetooth](https://developer.tizen.org/dev-guide/2.2.0/org.tizen.web.device.apireference/tizen/bluetooth.html) API due to 
 *   conficts in underlying framework 
 *
 * Application supports multiple connected devices, however only one of the devices can be selected at the time. 
 * Selection is done from {{#crossLink "Bluetooth"}}{{/crossLink}} UI. In case that phone has active call additional {{#crossLink "Carousel"}}{{/crossLink}} 
 * element is replaced by {{#crossLink "CallDuration"}}{{/crossLink}} element. 
 *
 * Application allows following operations:
 *
 * * {{#crossLink "Phone/acceptCall:method"}}Place call{{/crossLink}}
 * * Handles incoming calls passed from {{#crossLink "IncomingCall"}}{{/crossLink}} widget
 * * Display {{#crossLink "Carousel"}}call history{{/crossLink}}
 * * Display {{#crossLink "ContactsLibrary"}}contact list{{/crossLink}}
 * * Mute/unmute call - not working due to [TIVI-2448](https://bugs.tizen.org/jira/browse/TIVI-2448)
 *
 * Additionaly application can be controlled using speech recognition via {{#crossLink "Speech"}}{{/crossLink}} component.
 *
 * Hover and click on elements in images below to navigate to components of Phone application.  
 *   
 * <img id="Image-Maps_1201312180420487" src="../assets/img/phone.png" usemap="#Image-Maps_1201312180420487" border="0" width="649" height="1152" alt="" />
 *   <map id="_Image-Maps_1201312180420487" name="Image-Maps_1201312180420487">
 *     <area shape="rect" coords="0,0,573,78" href="../classes/TopBarIcons.html" alt="top bar icons" title="Top bar icons" />
 *     <area shape="rect" coords="0,77,644,132" href="../classes/Clock.html" alt="clock" title="Clock"    />
 *     <area shape="rect" coords="0,994,644,1147" href="../classes/BottomPanel.html" alt="bottom panel" title="Bottom panel" />
 *     <area shape="rect" coords="573,1,644,76" href="../modules/Settings.html" alt="Settings" title="Settings"    />
 *     <area shape="rect" coords="552,136,646,181" href="../classes/ContactsLibrary.html" alt="Contacts library" title="Contacts library" />
 *     <area shape="rect" coords="95,345,164,491" href="../classes/Phone.html#method_acceptCall" alt="Call button" title="Call button" />
 *     <area shape="rect" coords="1,668,644,984" href="../classes/Carousel.html" alt="" title="History carousel" />
 *     <area shape="rect" coords="171,181,471,635" alt=""   href="../classes/keyboard.html" alt="Keyboard input" title="Keyboard input"    >
 *   </map>
 *
 * @module PhoneApplication
 * @main PhoneApplication
 * @class Phone
 */

/**
 * Holds object of input for dialing phone number.
 *
 * @property telInput {Object}
 */
var telInput;
/**
 * Instance of class Bootstrap, this class provides unified way to boot up the HTML applications by loading shared components in proper order.
 * * {{#crossLink "Bootstrap"}}{{/crossLink}}
 *
 * @property bootstrap {Object}
 */
var bootstrap;

/**
* Instance of class Carousel, this class provides methods to operate with hystory carousel.
* * {{#crossLink "Carousel"}}{{/crossLink}}
*
* @property callHistoryCarousel {Object}
*/
var callHistoryCarousel = null;

/**
* This property holds information about accept Phone call from Other widgets. 
* If is true, phone call came from another widget.
* @property acceptPhoneCallFromOtherWidget {Boolean} 
*/
var acceptPhoneCallFromOtherWidget = false;

/**
 * Class handling user input from keyboard
 *
 * @class keyboard
 * @static
 */
var keyboard = {
    /**
     * property holding Interval within which next click on the same key is considered as rotating associated characters with the given key.
     *
     * @property clickInterval {int}
     */
    clickInterval: 1000,

    /**
     * property holding info about last pressed key
     *
     * @property pressedKey {string}
     */
    pressedKey: "-1",

    /**
     * Array of input object holding info about main key character, all associated characters with the given key and index of currently used key
     *
     * @property inputs {Array of Object}
     */
    inputs: [{
        key: "1",
        values: ["1"],
        index: 0
    }, {
        key: "2",
        values: ["2", "A", "B", "C"],
        index: 0
    }, {
        key: "3",
        values: ["3", "D", "E", "F"],
        index: 0
    }, {
        key: "4",
        values: ["4", "G", "H", "I"],
        index: 0
    }, {
        key: "5",
        values: ["5", "J", "K", "L"],
        index: 0
    }, {
        key: "6",
        values: ["6", "M", "N", "O"],
        index: 0
    }, {
        key: "7",
        values: ["7", "P", "Q", "R", "S"],
        index: 0
    }, {
        key: "8",
        values: ["8", "T", "U", "V"],
        index: 0
    }, {
        key: "9",
        values: ["9", "W", "X", "Y", "Z"],
        index: 0
    }, {
        key: "*",
        values: ["*"],
        index: 0
    }, {
        key: "0",
        values: ["0", "+"],
        index: 0
    }, {
        key: "#",
        values: ["#"],
        index: 0
    }],

    /**
     * property holding time of clickedInterval started
     *
     * @property startedTime {Date}
     */
    startedTime: null,

    /**
     * property holding input object associated with last pressed key
     *
     * @property selectedInput {Object}
     */
    selectedInput: null,

    /**
     * function starting clickInterval
     *
     * @method startTimer
     */
    startTimer: function() {
        "use strict";
        keyboard.startedTime = new Date();
    },

    /**
     * function testing if clickInterval expired
     *
     * @method intervalExpired
     * @param currTime {Date}
     */
    intervalExpired: function(currTime) {
        "use strict";
        if (currTime - keyboard.startedTime > keyboard.clickInterval) {
            keyboard.resetIndices();
            return true;
        }
        return false;
    },

    /**
     * function reseting indices for all input objects to 0
     *
     * @method resetIndices
     */
    resetIndices: function() {
        "use strict";
        for (var i in keyboard.inputs) {
            if (keyboard.inputs.hasOwnProperty(i)) {
                keyboard.inputs[i].index = 0;
            }
        }
    },

    /**
     * function cycling associated input characters within clickInterval
     *
     * @method nextKey
     */
    nextKey: function() {
        "use strict";
        for (var i in keyboard.inputs) {
            if (keyboard.pressedKey === keyboard.inputs[i].key) {
                if (keyboard.inputs[i].values.length > 1) {
                    if (keyboard.inputs[i].index < keyboard.inputs[i].values.length - 1) {
                        keyboard.inputs[i].index += 1;
                    } else {
                        keyboard.inputs[i].index = 0;
                    }
                } else {
                    keyboard.inputs[i].index = 0;
                }
                keyboard.selectedInput = keyboard.inputs[i];
                return keyboard.inputs[i].values[keyboard.inputs[i].index];
            }
        }
        return keyboard.pressedKey;
    },

    /**
     * function setting selected input object based on last pressed key
     *
     * @method selectInput
     */
    selectInput: function() {
        "use strict";
        for (var i in keyboard.inputs) {
            if (keyboard.pressedKey === keyboard.inputs[i].key) {
                keyboard.selectedInput = keyboard.inputs[i];
            }
        }
    }
};

/**
 * Holds status of calling panel initialization.
 *
 * @property callingPanelInitialized {Boolean}  if is true, calling panel is initialized
 * @default false 
 */
var callingPanelInitialized = false;

/**
 * Class which provides initialize call info.
 *
 * @method initializeCallInfo
 * @param contact {Object} Contact object.
 * @for Phone
 */
function initializeCallInfo(contact) {
    "use strict";
    var callNumber;
    console.log(contact);
    if ( !! contact) {

        if ( !! contact.name) {
            var nameStr;
            if (contact.name.displayName) {
                nameStr = contact.name.displayName;
            } else {
                nameStr = !! contact.name.firstName ? contact.name.firstName : "";
                nameStr += !! contact.name.lastName ? " " + contact.name.lastName : "";
            }
            $("#callName").html(nameStr.trim());
        } else {
            $("#callName").html("Unknown");
        }

        if ( !! contact.phoneNumbers && contact.phoneNumbers.length) {
            callNumber = !! contact.phoneNumbers[0].number ? contact.phoneNumbers[0].number : "";
            $("#callNumber").html(callNumber);
        } else {
            $("#callNumber").html("Unknown");
        }

        if ( !! contact.photoURI) {
            $("#callPhoto").attr("src", contact.photoURI);
        }
    } else {
        $("#callName").html("Unknown");
        $("#callNumber").html("Unknown");
    }

    if (!callingPanelInitialized) {
        $(".noVolumeSlider").noUiSlider({
            range: [0, 100],
            step: 1,
            start: 50,
            handles: 1,
            connect: "lower",
            orientation: "horizontal",
            slide: function() {
                var VolumeSlider = parseInt($(".noVolumeSlider").val(), 10);
                console.log("noVolumeSlider" + VolumeSlider);
            }
        });
        callingPanelInitialized = true;
    }

    if ($("#callButton").hasClass("callingFalse")) {
        $("#callButton").removeClass("callingFalse");
        $("#callButton").addClass("callingTrue");
    }
}

/**
 * Class which provides methods to operate with call duration. Component show information about current call (call number or call contact, time duration of call). 
 *
 * @class CallDuration
 * @static
 */
var CallDuration = {
    /**
     * Holds value of seconds.
     *
     * @property sec {Integer}
     */
    sec: 0,
    /**
     * Holds value of minutes.
     *
     * @property min {Integer}
     */
    min: 0,
    /**
     * Holds value of hours.
     *
     * @property hour {Integer}
     */
    hour: 0,
    /**
     * Holds object of timer.
     *
     * @property timeout {Object}
     */
    timeout: null,
    /**
     * Method provides initialization of call timers.
     *
     * @method initialize
     */
    startWatch: function() {
        "use strict";
        var self = this;
        if (!this.timeout) {
            this.timeout = window.setInterval(function() {
                self.stopwatch();
            }, 1000);
        } else {
            this.resetIt();
            this.timeout = window.setInterval(function() {
                self.stopwatch();
            }, 1000);
        }
    },

    /**
     * Method provides reset call timers.
     *
     * @method resetIt
     */
    resetIt: function() {
        "use strict";
        CallDuration.sec = 0;
        CallDuration.min = 0;
        CallDuration.hour = 0;
        window.clearTimeout(CallDuration.timeout);
        var callStatus = tizen.phone.activeCall().state.toLowerCase();
        if (callStatus === "DIALING".toLowerCase()) {
            $("#callDuration").html("DIALING");
        } else if (callStatus === "DISCONNECTED".toLowerCase()) {
            $("#callDuration").html("ENDED");
        } else {
            $("#callDuration").html(
                ((CallDuration.min <= 9) ? "0" + CallDuration.min : CallDuration.min) + ":" + ((CallDuration.sec <= 9) ? "0" + CallDuration.sec : CallDuration.sec));
        }

    },
    /**
     * Method provides call stop watch.
     *
     * @method stopwatch
     */
    stopwatch: function() {
        "use strict";

        var callStatus = tizen.phone.activeCall().state.toLowerCase();
        if (callStatus === "DIALING".toLowerCase()) {
            $("#callDuration").html("DIALING");
        } else if (callStatus === "DISCONNECTED".toLowerCase()) {
            $("#callDuration").html("ENDED");

        } else {
            CallDuration.sec++;
            if (CallDuration.sec === 60) {
                CallDuration.sec = 0;
                CallDuration.min++;
            }

            if (CallDuration.min === 60) {
                CallDuration.min = 0;
                CallDuration.hour++;
            }
            $("#callDuration").html(
                ((CallDuration.min <= 9) ? "0" + CallDuration.min : CallDuration.min) + ":" + ((CallDuration.sec <= 9) ? "0" + CallDuration.sec : CallDuration.sec));
        }
    }
};

/**
* This property holds information about mute of call. If is true, phone call is mute. 
*
* @property VolumeMuteStatus
* @default false
*/
var VolumeMuteStatus = false;

/**
 * Class provides a muting of a call
 *
 * @method muteCall
 * @for Phone
 */
function muteCall() {
    "use strict";
    VolumeMuteStatus = VolumeMuteStatus ? false : true;

    // Not working due to TIVI-2448
    if (tizen.phone) {
        //tizen.phone.muteCall(VolumeMuteStatus);
    }
    if (VolumeMuteStatus) {
        changeCssBgImageColor(".muteButton", ThemeKeyColorSelected);
        $(".muteButton").addClass("fontColorSelected");
    } else {
        changeCssBgImageColor(".muteButton", "#FFFFFF");
        $(".muteButton").removeClass("fontColorSelected");
    }
}

/**
 * Class which provides methods to call contact.
 *
 * @method acceptCall
 * @param contact {Object} Contact object.
 * @for Phone 
 */
function acceptCall(contact) {
    "use strict";

    ContactsLibrary.hide();
    if ($("#settingsTabs").tabs) {
        $("#settingsTabs").tabs("hidePage");
    }
    $("#callBox").removeClass("callBoxHidden");
    $("#callBox").addClass("callBoxShow");
            $("#contactsCarousel").toggleClass("hide-element"); //kj added
    $('#contactsCarouselBox').removeClass("contactsCarouselBoxShow");
    $('#contactsCarouselBox').addClass("contactsCarouselBoxHide");
    if (tizen.phone) {
        CallDuration.resetIt();

        initializeCallInfo(contact);
        var callStatus = tizen.phone.activeCall().state.toLowerCase();
        if (callStatus !== "ACTIVE".toLowerCase() && callStatus !== "DIALING".toLowerCase()) {

            if (callStatus === "INCOMING".toLowerCase()) {
                tizen.phone.answerCall(function(result) {
                    console.log(result.message);
                });
            } else if (callStatus === "DISCONNECTED".toLowerCase()) {

                var callNumber = contact.phoneNumbers[0] && contact.phoneNumbers[0].number ? contact.phoneNumbers[0].number : "";
                tizen.phone.invokeCall(callNumber, function(result) {
                    console.log(result.message);
                });

            }

        } else if (callStatus === "ACTIVE".toLowerCase()) {
            CallDuration.startWatch();
        }
    }
}

/**
 * Class which provides disconnect call.
 *
 * @method disconnectCall
 * @for Phone
 */
function disconnectCall() {
    "use strict";
    $("#callButton").removeClass("callingTrue");
    $("#callButton").addClass("callingFalse");
            $("#contactsCarousel").removeClass("hide-element"); //kj added
    if (acceptPhoneCallFromOtherWidget !== true) {
        $("#callBox").removeClass("callBoxShow");
        $("#callBox").addClass("callBoxHidden");
        $('#contactsCarouselBox').removeClass("contactsCarouselBoxHide");
        $('#contactsCarouselBox').addClass("contactsCarouselBoxShow");
    }
    CallDuration.resetIt();
    if (tizen.phone) {
        tizen.phone.hangupCall(function(result) {
            console.log(result.message);
        });
    }
    $("#inputPhoneNumber").val('');
}

$(document).ready(
    function() {
        "use strict";
        setTimeout(function() {
            /* initialize phone widget by remote device status */
            if (tizen.phone) {
                tizen.phone.getSelectedRemoteDevice(function(selectedRemoteDevice){
                if (selectedRemoteDevice !== "") {
                    $("#noPairedDevice").hide();
                    $("#loadingHistorySpinnerWrapper").show();
                } else {
                    $("#noPairedDevice").show();
                }
                });
                /* initialize phone widget by active call status */
                var callStatus='DISCONNECTED'
                if (typeof(tizen.phone.activeCall().state)!=='undefined') {
					callStatus = tizen.phone.activeCall().state.toLowerCase();
				}
                if (callStatus === "INCOMING".toLowerCase() || callStatus === "DIALING".toLowerCase() || callStatus === "ACTIVE".toLowerCase()) {
                    var contact;
                    if (tizen.phone.callState) {
                        contact = tizen.phone.activeCall().contact;
                    }
                    acceptPhoneCallFromOtherWidget = true;
                    acceptCall(contact);
                } else if (callStatus === "DISCONNECTED".toLowerCase()) {
                    disconnectCall();
                }
            } else {
				console.log("tizen.phone not defined");
			}
            /* start keyboard timer */
            keyboard.startTimer();
            telInput = $("#inputPhoneNumber");
			/*
			if (!callHistoryCarousel) {

				callHistoryCarousel = new Carousel();
			}
			*/
			if (typeof Phone == "undefined") {
				console.log("Phone is undefined");
			}
			if (typeof Phone !== "undefined") {
				/* add listener to selected remote device */
				tizen.phone.addRemoteDeviceSelectedListener(function(returnID) {
					if ((!!returnID && !!returnID.error) || (!!returnID && !!returnID.value && returnID.value === "")) {
						$("#loadingHistorySpinnerWrapper").hide();
						$(".caroufredsel_wrapper").hide();
						$("#noPairedDevice").show();
					} else {
						$("#noPairedDevice").hide();
						$("#loadingHistorySpinnerWrapper").show();
						$(".caroufredsel_wrapper").show();
					}
				});
				/* initialize contacts and call history, if not accept phone call from another widget */
				if (acceptPhoneCallFromOtherWidget !== true) {
					window.setTimeout(function() {
						Phone.loadContacts(function(err) {
							if (!err) {
								ContactsLibrary.init();
								Phone.loadCallHistory(function(err) {
									if (!err) {
										//$("#loadingHistorySpinnerWrapper").hide();
										callHistoryCarousel.loadCallHistory(Phone.callHistory, 0);
									}
								});
							}
						});

					}, 2000);
				}
				/* add listener to change contacts list  */
				tizen.phone.addContactsChangedListener(function() {
					if (acceptPhoneCallFromOtherWidget !== true) {
						window.setTimeout(function() {
							Phone.loadContacts(function(err) {
								if (!err) {
									ContactsLibrary.init();
								}
							});
						}, 1000);
					}
				});
				/* add listener to change call history  */
				tizen.phone.addCallHistoryChangedListener(function() {
					$("#loadingHistorySpinnerWrapper").show();
					if (acceptPhoneCallFromOtherWidget !== true) {
						window.setTimeout(function() {
							Phone.loadCallHistory(function(err) {
								if (!err) {
									$("#loadingHistorySpinnerWrapper").hide();
									callHistoryCarousel.loadCallHistory(Phone.callHistory(), 0);

								}
							});
						}, 1000);
					}

				});
			}
			$("#contactsLibraryButton_All").bind('click', function() {

				ContactsLibrary.show();

			});
			console.log("Added click event for numbers");
//Changed the ID to class w/in the delegate() method but it isn't  needed as the data-id is used to distinguish anyway
			$(".numbersBox").delegate(".numberButton", "click", function() {
				console.log("Number button "+$(this).data("id"));
				var pressTime = new Date(),
					number, oneCharPX = 32;
				if (keyboard.intervalExpired(pressTime)) {
					number = telInput.attr("value") + $(this).data("id");
					telInput.attr("value", number);
					$('#inputPhoneNumber').scrollLeft(number.length * oneCharPX);
					keyboard.pressedKey = $(this).data("id").toString();

				} else {
					if (keyboard.pressedKey === "-1" || keyboard.pressedKey !== $(this).data("id").toString()) {
						number = telInput.attr("value") + $(this).data("id");
						telInput.attr("value", number);
						$('#inputPhoneNumber').scrollLeft(number.length * oneCharPX);
						keyboard.pressedKey = $(this).data("id").toString();
					} else {
						var phoneNumText = telInput.attr("value");
						if (keyboard.pressedKey === $(this).data("id").toString() && keyboard.selectedInput !== null && keyboard.selectedInput.values.length === 1) {
							number = telInput.attr("value") + $(this).data("id");
							telInput.attr("value", number);
							$('#inputPhoneNumber').scrollLeft(number.length * oneCharPX);
						} else {
							var numToUpdate = phoneNumText.slice(0, phoneNumText.length - 1);
							numToUpdate += keyboard.nextKey();
							telInput.attr("value", numToUpdate);

						}
					}
				}
				keyboard.selectInput();
				keyboard.startTimer();
				return false;
			});

			$(".inputPhoneNumberBox").delegate("#deleteButton", "click", function() {
				var number = telInput.attr("value");
				number = number.slice(0, number.length - 1);
				telInput.attr("value", number);
				return false;
			});
			console.log("Call buttion Click added");
			$('#callButton').bind('click', function() {
				console.log("Call Button Click "+$("#inputPhoneNumber").val());
				var phoneNumber = $("#inputPhoneNumber").val();
				if ($("#callBox").hasClass("callBoxShow")) {
					disconnectCall();
				} else if (phoneNumber !== "") {
					
					/*
					tizen.phone.invokeCall(phoneNumber, function(result) {
						console.log(result.message);
					});
					var contact = Phone.getContactByPhoneNumber(phoneNumber);
					if (contact === null) {

						contact = {
							phoneNumbers: [{
								number: phoneNumber
							}]
						};

					}
					acceptCall(contact);
					*/
					acceptCall({
							phoneNumbers: [{
								number: phoneNumber
							}]
						});
				}
			});
			$('.muteButton').bind('click', function() {
				muteCall();
			});
			if (tizen.phone) {
				/* add listener to change call history entry, because if call is ended tizen.phone give back only last history object */
				tizen.phone.addCallHistoryEntryAddedListener(function(contact) {
					if (acceptPhoneCallFromOtherWidget !== true) {


						var tmpCallHistory = Phone.callHistory();
						var tmpContact = [];
						tmpContact.push(contact);
						tmpContact = Phone.formatCallHistory(tmpContact);
						tmpCallHistory.unshift(tmpContact[0]);
						Phone.callHistory(tmpCallHistory);

						callHistoryCarousel.loadCallHistory(Phone.callHistory(), 0);

					}
				});
				/* add listener to change call state */
				tizen.phone.addCallChangedListener(function(result) {
					var contact;
					if ( !! result.contact.name) {
						contact = result.contact;
					} else {
						contact = {
							phoneNumbers: [{
								/* jshint camelcase: false */
								number: tizen.phone.activeCall().line_id
								/* jshint camelcase: true */
							}]

						};
					}

					console.log("result.state " + result.state);

					switch (result.state.toLowerCase()) {
						case "DISCONNECTED".toLowerCase():

							disconnectCall(contact);

							if (acceptPhoneCallFromOtherWidget === true) {

								window.setTimeout(function() {
									if (typeof tizen !== "undefined") {
										tizen.application.getCurrentApplication().exit();
									}
								}, 1000);
							}

							Configuration.set("acceptedCall", "false");

							break;
						case "ACTIVE".toLowerCase():
							if (Configuration._values.acceptedCall !== "true") {
								/* global self */
								self.incomingCall.acceptIncommingCall();
								CallDuration.startWatch();
								console.log("phone active");
								Configuration.set("acceptedCall", "true");
							}
							break;
						case "DIALING".toLowerCase():
							acceptCall(contact);
							break;
					}
				});
			}

            /* initialize bootstrap */
/*           
            bootstrap = new Bootstrap(function(status) {
                //telInput = $("#inputPhoneNumber");
                //$("#clockElement").ClockPlugin('init', 5);
                //$("#clockElement").ClockPlugin('startTimer');
                //$("#topBarIcons").topBarIconsPlugin('init', 'phone');
                //$('#bottomPanel').bottomPanel('init',false,false);


                $("#contactsLibraryButton").bind('click', function() {

                    ContactsLibrary.show();

                });
				
                $(".numbersBox").delegate("#numberButton", "click", function() {
					console.log("Number button "+$(this).data("id"));
                    var pressTime = new Date(),
                        number, oneCharPX = 32;
                    if (keyboard.intervalExpired(pressTime)) {
                        number = telInput.attr("value") + $(this).data("id");
                        telInput.attr("value", number);
                        $('#inputPhoneNumber').scrollLeft(number.length * oneCharPX);
                        keyboard.pressedKey = $(this).data("id").toString();

                    } else {
                        if (keyboard.pressedKey === "-1" || keyboard.pressedKey !== $(this).data("id").toString()) {
                            number = telInput.attr("value") + $(this).data("id");
                            telInput.attr("value", number);
                            $('#inputPhoneNumber').scrollLeft(number.length * oneCharPX);
                            keyboard.pressedKey = $(this).data("id").toString();
                        } else {
                            var phoneNumText = telInput.attr("value");
                            if (keyboard.pressedKey === $(this).data("id").toString() && keyboard.selectedInput !== null && keyboard.selectedInput.values.length === 1) {
                                number = telInput.attr("value") + $(this).data("id");
                                telInput.attr("value", number);
                                $('#inputPhoneNumber').scrollLeft(number.length * oneCharPX);
                            } else {
                                var numToUpdate = phoneNumText.slice(0, phoneNumText.length - 1);
                                numToUpdate += keyboard.nextKey();
                                telInput.attr("value", numToUpdate);

                            }
                        }
                    }
                    keyboard.selectInput();
                    keyboard.startTimer();
                    return false;
                });

                $(".inputPhoneNumberBox").delegate("#deleteButton", "click", function() {
                    var number = telInput.attr("value");
                    number = number.slice(0, number.length - 1);
                    telInput.attr("value", number);
                    return false;
                });

                $('#callButton').bind('click', function() {
					console.log("Call Button Click"+$("#inputPhoneNumber").val());
                    var phoneNumber = $("#inputPhoneNumber").val();
                    if ($("#callBox").hasClass("callBoxShow")) {
                        disconnectCall();
                    } else if (phoneNumber !== "") {
                        var contact = Phone.getContactByPhoneNumber(phoneNumber);
                        if (contact === null) {

                            contact = {
                                phoneNumbers: [{
                                    number: phoneNumber
                                }]
                            };

                        }
                        acceptCall(contact);
                    }
                });
                $('.muteButton').bind('click', function() {
                    muteCall();
                });
                if (tizen.phone) {
                    // add listener to change call history entry, because if call is ended tizen.phone give back only last history object 
                    tizen.phone.addCallHistoryEntryAddedListener(function(contact) {
                        if (acceptPhoneCallFromOtherWidget !== true) {


                            var tmpCallHistory = Phone.callHistory();
                            var tmpContact = [];
                            tmpContact.push(contact);
                            tmpContact = Phone.formatCallHistory(tmpContact);
                            tmpCallHistory.unshift(tmpContact[0]);
                            Phone.callHistory(tmpCallHistory);

                            callHistoryCarousel.loadCallHistory(Phone.callHistory(), 0);

                        }
                    });
                    // add listener to change call state 
                    tizen.phone.addCallChangedListener(function(result) {
                        var contact;
                        if ( !! result.contact.name) {
                            contact = result.contact;
                        } else {
                            contact = {
                                phoneNumbers: [{
                                    // jshint camelcase: false
                                    number: tizen.phone.activeCall().line_id
                                    //jshint camelcase: true
                                }]

                            };
                        }

                        console.log("result.state " + result.state);

                        switch (result.state.toLowerCase()) {
                            case "DISCONNECTED".toLowerCase():

                                disconnectCall(contact);

                                if (acceptPhoneCallFromOtherWidget === true) {

                                    window.setTimeout(function() {
                                        if (typeof tizen !== "undefined") {
                                            tizen.application.getCurrentApplication().exit();
                                        }
                                    }, 1000);
                                }

                                Configuration.set("acceptedCall", "false");

                                break;
                            case "ACTIVE".toLowerCase():
                                if (Configuration._values.acceptedCall !== "true") {
                                    // global self 
                                    self.incomingCall.acceptIncommingCall();
                                    CallDuration.startWatch();
                                    console.log("phone active");
                                    Configuration.set("acceptedCall", "true");
                                }
                                break;
                            case "DIALING".toLowerCase():
                                acceptCall(contact);
                                break;
                        }
                    });
                }

            if (typeof(Speech) !== 'undefined') {
                // add listener to voice recognition 
                Speech.addVoiceRecognitionListener({
                    oncall: function() {
                        if (ContactsLibrary.currentSelectedContact !== "" && $('#library').library("isVisible")) {
                            acceptCall(ContactsLibrary.currentSelectedContact);
                        }
                    }
                });
            } else {
                console.warn("Speech API is not available.");
            }
            });
*/
        }, 0);

    });

/**
 * Class which provides call contact carousel.
 *
 * @method callContactCarousel
 * @param contact {Object} Contact object.
 * @for Phone
 *   
 */

function callContactCarousel(contact) {
    "use strict";

    acceptCall(contact);
}

/**
 * Class which provides call by contact ID.
 *
 * @method callContactById
 * @param contactId {String} Contact id.
 * @for Phone
 */
function callContactById(contactId) {
    "use strict";
    $("#contactDetailMobile").addClass("fontColorSelected ");
    if (contactId !== "" && typeof contactId !== undefined) {

        var contactObject = Phone.getContactById(contactId);
        if ( !! contactObject) {
            window.setTimeout(function() {
                acceptCall(contactObject);
                $("#contactDetailMobile").removeClass("fontColorSelected ");
            }, 500);
        } else {
            console.log("contact not found");
            $("#contactDetailMobile").removeClass("fontColorSelected ");
        }
    }
}
