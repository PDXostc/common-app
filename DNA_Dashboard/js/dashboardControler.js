/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/** 
 * @module DashboardApplication
 */

/** 
 * Class which provides methods to fill content of dashboard's UI.
 * @class dashBoardControler
 * @static
 */

var dashBoardControler = function() {
	"use strict";
	this.initInfos();
};

/** 
 * Method handles click event on rear left indicator.
 * @method onRearLDisplayClick
 */
dashBoardControler.prototype.onRearLDisplayClick = function() {
	"use strict";
	if (this.RearLDispaly) {
		$('#rearLButtonText').removeClass("fontColorSelected");
		$('#rearLButtonText').addClass("fontColorNormal");
		$('#rearLButtonText').empty();
		$('#rearLButtonText').append("OFF");
		this.RearLDispaly = false;
	} else {
		$('#rearLButtonText').removeClass("fontColorNormal");
		$('#rearLButtonText').addClass("fontColorSelected");
		$('#rearLButtonText').empty();
		$('#rearLButtonText').append("ON");
		this.RearLDispaly = true;
	}
};

/** 
 * Method handles click event on rear right indicator.
 * @method onRearRDisplayClick
 */
dashBoardControler.prototype.onRearRDisplayClick = function() {
	"use strict";
	if (this.RearRDispaly) {
		$('#rearRButtonText').removeClass("fontColorSelected");
		$('#rearRButtonText').addClass("fontColorNormal");
		$('#rearRButtonText').empty();
		$('#rearRButtonText').append("OFF");
		this.RearRDispaly = false;
	} else {
		$('#rearRButtonText').removeClass("fontColorNormal");
		$('#rearRButtonText').addClass("fontColorSelected");
		$('#rearRButtonText').empty();
		$('#rearRButtonText').append("ON");
		this.RearRDispaly = true;
	}
};

/** 
 * Method is setting status of child lock.
 * @method onChildLockChanged
 * @param newStatus {Boolean} New status of child lock of the car.
 */
dashBoardControler.prototype.onChildLockChanged = function(newStatus) {
	"use strict";
	if (newStatus === false || newStatus === "false") {
		$('#leftPadlock').removeClass("padlocActive");
		$('#leftPadlock').addClass("padlocInactive");
		$('#rightPadlock').removeClass("padlocActive");
		$('#rightPadlock').addClass("padlocInactive");
		$('#childLockText').removeClass("fontColorSelected");
		$('#childLockText').addClass("fontColorNormal");
		$('#childLockText').empty();
		$('#childLockText').append("CHILD LOCK DEACTIVATED");
	} else {
		$('#leftPadlock').removeClass("padlocInactive");
		$('#leftPadlock').addClass("padlocActive");
		$('#rightPadlock').removeClass("padlocInactive");
		$('#rightPadlock').addClass("padlocActive");
		$('#childLockText').removeClass("fontColorNormal");
		$('#childLockText').addClass("fontColorSelected");
		$('#childLockText').empty();
		$('#childLockText').append("CHILD LOCK ACTIVATED");
	}
};

/** 
 * Method is setting status of front lights of the car.
 * @method onFrontLightsChanged
 * @param newStatus {Boolean} New status of front lights of car.
 */
dashBoardControler.prototype.onFrontLightsChanged = function(newStatus) {
	"use strict";
	if (newStatus === false || newStatus === "false") {
		$('#frontLightsButton').css("opacity", "0");
		$("#frontLightsImage").css("opacity", "0");
	} else {
		$('#frontLightsButton').css("opacity", "1");
		$("#frontLightsImage").css("opacity", "1");
	}
};

/** 
 * Method is setting value of trasmission gear of the car.
 * @method onGearChanged
 * @param newStatus {String} New status value for trasmission gear.
 */
dashBoardControler.prototype.onGearChanged = function(newStatus) {
	"use strict";
	$("#engineStatus #gearboxStatus").text(newStatus);
};

/** 
 * Method is setting value of speed of the car.
 * @method onSpeedChanged
 * @param newStatus {Number} New value for the speed.
 */
dashBoardControler.prototype.onSpeedChanged = function(newStatus) {
	"use strict";
	$("#bigSpeed").text(newStatus);// Add on "MPH"
};

/** 
 * Method is setting value of odometer of the car.
 * @method onOdoMeterChanged
 * @param newStatus {Number} New value for the odoMeter.
 */
dashBoardControler.prototype.onOdoMeterChanged = function(newStatus) {
	"use strict";
//	$("#engineStatus #statusIndicator").text(newStatus + " mi");
	console.log("AMB: onOdoMeterChanged UI setting called.")
	$("#OdometerValue").text(newStatus);
};

/** 
 * Method  is setting status of rear lights of the car.
 * @method onRearLightsChanged
 * @param newStatus {Boolean} New status of rear lights of car.
 */
dashBoardControler.prototype.onRearLightsChanged = function(newStatus) {
	"use strict";
	if (newStatus === false || newStatus === "false") {
		$('#rearLightsButton').css("opacity", "0");
		$("#rearLightsImage").css("opacity", "0");
	} else {
		$('#rearLightsButton').css("opacity", "1");
		$("#rearLightsImage").css("opacity", "1");
	}
};
/** 
 * Method  is setting status of break lights of the car.
 * @method onBreakLightsChanged
 * @param newStatus {Boolean} New status of break lights of car.
 */
dashBoardControler.prototype.onBreakLightsChanged = function(newStatus) {
	"use strict";
	if (newStatus === false || newStatus === "false") {
		$("#breakLightsImage").css("opacity", "0");
	} else {
		$("#breakLightsImage").css("opacity", "1");
	}
};
/** 
 * Method  is setting status of fan in the car.
 * @method onFanChanged
 * @param newStatus {Boolean} New status of fan in the car.
 */
dashBoardControler.prototype.onFanChanged = function(newStatus) {
	"use strict";
	if (newStatus === false || newStatus === "false") {
		$('#fanCircle').css("opacity", "0");
		$("#fanIcon").css("opacity", "0");
		$("#fanIcon").css("-webkit-transform", "rotate(0deg)");
		$("#fanIcon").css("-moz-transform", "rotate(0deg)");
		$("#fanIcon").css("-ms-transform", "rotate(0deg)");
		$("#fanIcon").css("-o-transform", "rotate(0deg)");
		$('#fanStatus').removeClass("fontColorSelected");
		$('#fanStatus').addClass("fontColorNormal");
	} else {
		$('#fanCircle').css("opacity", "1");
		$("#fanIcon").css("opacity", "1");
		$("#fanIcon").css("-webkit-transform", "rotate(720deg)");
		$("#fanIcon").css("-moz-transform", "rotate(720deg)");
		$("#fanIcon").css("-ms-transform", "rotate(720deg)");
		$("#fanIcon").css("-o-transform", "rotate(720deg)");
		$('#fanStatus').removeClass("fontColorNormal");
		$('#fanStatus').addClass("fontColorSelected");
	}
};

/** 
 * Method is setting status of exterior brightness .
 * @method onExteriorBrightnessChanged
 * @param newStatus {Boolean} New exterior brightness value.
 */
dashBoardControler.prototype.onExteriorBrightnessChanged = function(newValue) {
	"use strict";
	var newValueP = (Math.abs(newValue) / 5000) * 100;
	if (newValueP > 100) {
		newValueP = 100;
	}
	$("#exteriorBrightnessProgressBar").progressBarPlugin('setPosition', newValueP);
};

/** 
 * Method is setting new value of battery status.
 * @method onBatteryStatusChanged
 * @param newValue {Integer} New battery status value.
 * @param status {bootstrap.carIndicator.status} Current status object.
 */
dashBoardControler.prototype.onBatteryStatusChanged = function(newValue, status) {
	"use strict";
	$("#batteryProgressBar").progressBarPlugin('setPosition', newValue);
	var newBatteryStatus = newValue.toString() + "%";
	$('#batteryStatus').empty();
	$('#batteryStatus').append(newBatteryStatus);
	var newBatteryRange = "~" + Math.round(((newValue / 100) * status.fullBatteryRange)).toString() + " MI";
	$('#batteryRange').empty();
	$('#batteryRange').append(newBatteryRange);
};

/** 
 * Method is setting new value of full battery range.
 * @method onBatteryRangeChanged
 * @param newValue {Integer} New full battery range value.
 * @param status {bootstrap.carIndicator.status} Current status object.
 */
dashBoardControler.prototype.onBatteryRangeChanged = function(newValue, status) {
	"use strict";
	var self = this;

	$('#batteryStatus').empty();

	$('#batteryStatus').append(newValue);
	var newBatteryRange = "~" + Math.round(((status.batteryStatus / 100) * newValue)).toString() + " MI";
	$('#batteryRange').empty();
	$('#batteryRange').append(newBatteryRange);
};

/** 
 * Method is setting new value of outside temperature.
 * @method onOutsiteTempChanged
 * @param newValue {Number} New outside temperature status value.
 */
dashBoardControler.prototype.onOutsideTempChanged = function(newValue) {
	"use strict";
/*	var newOutsiteTemp = newValue + "°C";
	$("#weatherStatus").empty();
	$("#weatherStatus").append(newOutsiteTemp);
*/
	console.log("AMB: onOutsideTempChanged UI setting called.")
	$("#OutdoorTemp").text(newValue);
};

/** 
 * Method is setting new value of Avg KW.
 * @method onAvgKWChanged
 * @param newValue {Number} New Avg KW status value.
 */
dashBoardControler.prototype.onAvgKWChanged = function(newValue) {
	"use strict";
	var newAvgKW = newValue + " KW-H / MI";
	$("#avgConsumptionCaption").empty();
	$("#avgConsumptionCaption").append(newAvgKW);
};

/** 
 * Method is setting new value of night mode indicator .
 * @method onNightModeChanged
 * @param newValue {Boolean} New value of day/night mode .
 */
dashBoardControler.prototype.onNightModeChanged = function(newValue) {
	"use strict";
	if (newValue) {
		$("#dayNight").removeClass("dashboardSunElement");
		$("#dayNight").addClass("dashboardMoonElement");
	} else {
		$("#dayNight").removeClass("dashboardMoonElement");
		$("#dayNight").addClass("dashboardSunElement");
	}

};

/** 
 * Method is setting new value of inside temperature.
 * @method onInsideTempChanged
 * @param newValue {Number} New inside temperature status value.
 */
dashBoardControler.prototype.onInsideTempChanged = function(newValue) {
	"use strict";
	/*
	var newInsiteTemp = newValue + "°F";
	$("#fanStatus").empty();
	$("#fanStatus").append(newInsiteTemp);
	*/
	console.log("AMB: onInsideTempChanged UI setting called.")
	$("#InCarTemp").text(newValue);
};

/** 
 * Method is setting new value of weather. Weather is coded to following values:
 *
 * * 1 - Cloudy weather
 * * 2 - Sunny weather
 * * 3 - Stormy weather
 *
 * @method onWeatherChanged
 * @param newWeater {Integer} New weather status value.
 */
dashBoardControler.prototype.onWeatherChanged = function(newValue) {
	"use strict";
	if (newValue === 1) {
		$("#dashBoardWeatherIcon").removeClass("dashBoardWeatherSun");
		$("#dashBoardWeatherIcon").removeClass("dashBoardWeatherCloudy");
		$("#dashBoardWeatherIcon").removeClass("dashBoardWeatherThunder");
		$("#dashBoardWeatherIcon").addClass("dashBoardWeatherCloudy");

	} else if (newValue === 2) {
		$("#dashBoardWeatherIcon").removeClass("dashBoardWeatherSun");
		$("#dashBoardWeatherIcon").removeClass("dashBoardWeatherCloudy");
		$("#dashBoardWeatherIcon").removeClass("dashBoardWeatherThunder");
		$("#dashBoardWeatherIcon").addClass("dashBoardWeatherSun");

	} else {
		$("#dashBoardWeatherIcon").removeClass("dashBoardWeatherSun");
		$("#dashBoardWeatherIcon").removeClass("dashBoardWeatherCloudy");
		$("#dashBoardWeatherIcon").removeClass("dashBoardWeatherThunder");
		$("#dashBoardWeatherIcon").addClass("dashBoardWeatherThunder");
	}
};

/** 
 * Method is setting new value of angle of front wheels.
 * @method onWheelAngleChanged
 * @param newAngle {Integer} New angle status value for wheels.
 */
dashBoardControler.prototype.onWheelAngleChanged = function(newAngle) {
	"use strict";
	var maxAngle = 30;
	if (newAngle > 30) {
		newAngle = (-1 * (360 - newAngle));
	}
	if (newAngle > maxAngle) {
		newAngle = maxAngle;
	} else if (newAngle < (-maxAngle)) {
		newAngle = -maxAngle;
	} else if (newAngle === "") {
		newAngle = 0;
	}

	var newDuration = Math.round(Math.abs(newAngle) / 10);
	if (newDuration === 0) {
		newDuration = 0.1;
	}
	newDuration = 0;
	$("#leftWheel").css("-webkit-transition", newDuration + "s");
	$("#leftWheel").css("-webkit-transform", "rotate(" + newAngle + "deg)");
	$("#rightWheel").css("-webkit-transition", newDuration + "s");
	$("#rightWheel").css("-webkit-transform", "rotate(" + newAngle + "deg)");

	$("#leftWheel").css("-moz-transition", newDuration + "s");
	$("#leftWheel").css("-moz-transform", "rotate(" + newAngle + "deg)");
	$("#rightWheel").css("-moz-transition", newDuration + "s");
	$("#rightWheel").css("-moz-transform", "rotate(" + newAngle + "deg)");

	$("#leftWheel").css("-ms-transition", newDuration + "s");
	$("#leftWheel").css("-ms-transform", "rotate(" + newAngle + "deg)");
	$("#rightWheel").css("-ms-transition", newDuration + "s");
	$("#rightWheel").css("-ms-transform", "rotate(" + newAngle + "deg)");

	$("#leftWheel").css("-o-transition", newDuration + "s");
	$("#leftWheel").css("-o-transform", "rotate(" + newAngle + "deg)");
	$("#rightWheel").css("-o-transition", newDuration + "s");
	$("#rightWheel").css("-o-transform", "rotate(" + newAngle + "deg)");
};

/** 
 * Method is setting new value of randomizer.
 * @method onRandomizerChanged
 * @param newStatus {Boolean} New randomizer status.
 */
dashBoardControler.prototype.onRandomizerChanged = function(newStatus) {
	"use strict";
	if (newStatus === false || newStatus === "false") {
		$('#randomizer').css("opacity", "0");
		$("#randomizer").css("opacity", "0");
	} else {
		$('#randomizer').css("opacity", "1");
		$("#randomizer").css("opacity", "1");
	}
};

dashBoardControler.prototype.onYawRateChanged = function(newStatus) {
	"use strict";
	console.log("AMB TEST: onYawRateChanged")
// $("#engineStatus #statusIndicator").text(newStatus + " mi");
};
/** 
 * Method initialize info status on HTML and jQuery plugins.
 * @method initInfos
 */
dashBoardControler.prototype.initInfos = function() {
	/* REVIEWERS: probably obsolete for DNA???
	"use strict";
	$("#weatherCaption").boxCaptionPlugin('init', 'weather');

	$("#exteriorBrightnessCaption").boxCaptionPlugin('init', 'Exterior Brightness');

	$("#exteriorBrightnessProgressBar").progressBarPlugin('init', 'progressBar');
	$("#exteriorBrightnessProgressBar").progressBarPlugin('setPosition', 30);

	$("#batteryLevelCaption").boxCaptionPlugin('init', 'Battery level');

	$("#batteryProgressBar").progressBarPlugin('init', 'progressBar');
	$("#batteryProgressBar").progressBarPlugin('setPosition', 82);

	$("#avgEConsumption").boxCaptionPlugin('init', 'avg e-consumtion');
	$("#rearLDisplay").boxCaptionPlugin('init', 'Rear l Display');
	$("#rearRDisplay").boxCaptionPlugin('init', 'Rear r Display');

	$("#leftFrontPressure").statusBoxPlugin('init', 'PRESSSURE LEVEL', 'L FRONT TIRE', 'OK');
	$("#rightFrontPressure").statusBoxPlugin('init', 'PRESSSURE LEVEL', 'R FRONT TIRE', 'ok');

	$("#leftRearPressure").statusBoxPlugin('init', 'PRESSSURE LEVEL', 'L Rear TIRE', 'OK');
	$("#rightRearPressure").statusBoxPlugin('init', 'PRESSSURE LEVEL', 'R Rear TIRE', 'ok');
*/
};
/** 
 * Method is setting new value of left front tire pressure.
 * @method onTirePressureLeftFrontChanged
 * @param newValue {FLoat} new tire pressure status. If is status between 1.8 and 2.2 new status value is string "OK".
 */
dashBoardControler.prototype.onTirePressureLeftFrontChanged = function(newValue) {
	"use strict";
	console.log("AMB: onTirePressureLeftFrontChanged called");
//	$("#leftFrontPressure").statusBoxPlugin('init', 'PRESSSURE LEVEL', 'L FRONT TIRE', newValue);
 	$("#psiFL").text(newValue);
	
};
/** 
 * Method is setting new value of right front tire pressure.
 * @method onTirePressureRightFrontChanged
 * @param newValue {FLoat} new tire pressure status. If is status between 1.8 and 2.2 new status value is string "OK".
 */
dashBoardControler.prototype.onTirePressureRightFrontChanged = function(newValue) {
	"use strict";
//	$("#rightFrontPressure").statusBoxPlugin('init', 'PRESSSURE LEVEL', 'R FRONT TIRE', newValue);
	$("#psiFR").text(newValue);
};
/** 
 * Method is setting new value of left rear tire pressure.
 * @method onTirePressureLeftRearChanged
 * @param newValue {FLoat} new tire pressure status. If is status between 1.8 and 2.2 new status value is string "OK".
 */
dashBoardControler.prototype.onTirePressureLeftRearChanged = function(newValue) {
	"use strict";
//	$("#leftRearPressure").statusBoxPlugin('init', 'PRESSSURE LEVEL', 'L Rear TIRE', newValue);
	$("#psiRL").text(newValue);
};
/** 
 * Method is setting new value of right rear tire pressure.
 * @method onTirePressureRightRearChanged
 * @param newValue {FLoat} new tire pressure status. If is status between 1.8 and 2.2 new status value is string "OK".
 */
dashBoardControler.prototype.onTirePressureRightRearChanged = function(newValue) {
	"use strict";
//	$("#rightRearPressure").statusBoxPlugin('init', 'PRESSSURE LEVEL', 'R Rear TIRE', newValue);
	$("#psiRR").text(newValue);
};
dashBoardControler.prototype.onFuelLevelChanged = function(newValue) {
	"use strict";
	console.log("AMB: onFuelLevelChanged called");
	$("#FuelLevel").text(newValue);
};
dashBoardControler.prototype.onDistanceToEmptyChanged = function(newValue) {
	"use strict";
	console.log("AMB: onDistanceToEmptyChanged called");
	$("#DistToEmpty").text(newValue);
};

