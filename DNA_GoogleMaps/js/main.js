/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
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
 *
 */

/*jshint eqnull:true*/
/*global google*/

/** 
 * Google Maps application allows user to use Google Maps to navigate around in predefined set of waypoints in Places library with Text-To-Speech feature
 * (via {{#crossLink "Speech"}}{{/crossLink}} object). Nvigation doesn't use GPS but updates position of marker along the route in periodic intervals.
 * Default navigation waypoints are defined by:
 *
 * * start point: {{#crossLink "NavigationGoogle/originAddress:property"}}{{/crossLink}} property 
 * * end point: {{#crossLink "NavigationGoogle/destinationAddress:property"}}{{/crossLink}} property 
 *
 * To add additional places or update existing ones please change property {{#crossLink "NavigationGoogle/places:property"}}{{/crossLink}}. 
 *
 * Hover and click on elements in images below to navigate to components of Navigation application.
 * 
 * <img id="Image-Maps_1201312180420487" src="../assets/img/navigation.png" usemap="#Image-Maps_1201312180420487" border="0" width="650" height="1148" alt="" />
 *   <map id="_Image-Maps_1201312180420487" name="Image-Maps_1201312180420487">
 *     <area shape="rect" coords="0,0,573,78" href="../classes/topbaricons.html" alt="Top bar icons" title="Top bar icons" /> 
 *     <area shape="rect" coords="0,994,644,1147" href="../classes/bottompanel.html" alt="Bottom panel" title="Bottom panel" />
 *     <area shape="rect" coords="521,133,645,186" href="../classes/Library.html" alt="Places library" title="Places library"    />
 *     <area shape="poly" coords="1,78,512,80,514,191,648,192,646,291,0,292," href="../classes/NavigationGoogle.html#method_updateNavigationPanel" alt="Navigation panel" title="Navigation panel"   />
 *     <area shape="poly" coords="1,298,648,301,644,890,530,887,528,970,648,969,647,1022,3,1022," href="../classes/NavigationGoogle.html#method_animate" alt="Animate along waypoints" title="Animate along waypoints"   />
 *     <area shape="rect" coords="530,888,631,965" href="../classes/NavigationGoogle.html#method_switchMapSatelliteView" alt="Switch map mode" title="Switch map mode"    />
 *   </map> 
 * @module NavigationGoogleApplication
 * @main NavigationGoogleApplication
 * @class NavigationGoogle
 */

/**
 * Reference to instance of class object this class is inherited from dataModel {@link CarIndicator}.
 * @property carInd {Object}
 */
var carInd;

/**
 * Array of destination addresses used in places library list.
 * @property places {Object[String]}
 * @for NavigationGoogle
 */
var places = [
              {destinationAddress: "Golden Gate Bridge, San Francisco, CA 94129, USA"},
              {destinationAddress: "Coit Tower, San Francisco, CA 94133, USA"},
              {destinationAddress: "The Exploratorium, Pier 15, San Francisco, CA 94111, USA"},
              {destinationAddress: "Steinhart Aquarium, 55 Music Concourse Drive, San Francisco, CA 94122, USA"}
             ];

/**
 * Holds origin address value.
 * @for NavigationGoogle
 * @property originAddress {String}
 */
var originAddress = "Fell Street, San Francisco, CA, United States";

/**
 * Holds destination address value.
 * @for NavigationGoogle
 * @property destinationAddress {String}
 */
var destinationAddress = "75 Hagiwara Tea Garden Dr San Francisco, CA 94118";

/**
 * Holds origin object value.
 * @for NavigationGoogle
 * @private
 * @property origin {String}
 */
var origin = null;

/**
 * Holds destination object value.
 * @for NavigationGoogle
 * @private
 * @property destination {String}
 */
var destination = null;

/**
 * Holds map object.
 * @for NavigationGoogle
 * @private
 * @property map {Object}
 */
var map;

/**
 * Holds geocoder object.
 * @for NavigationGoogle
 * @private
 * @property geocoder {Object}
 */
var geocoder = null;

/**
 * Holds direction service method.
 * @for NavigationGoogle
 * @private
 * @property directionsService {Object}
 */
var directionsService = null;

/**
 * Holds direction renderer method.
 * @for NavigationGoogle
 * @private
 * @property directionRenderer {Object}
 */
var directionRenderer = null;

/**
 * Holds polyline method.
 * @for NavigationGoogle
 * @private
 * @property polyline {Object}
 */
var polyline = null;

/**
 * Holds route object method.
 * @for NavigationGoogle
 * @private
 * @property route {Object}
 */
var route = null;

/**
 * Holds marker object.
 * @for NavigationGoogle
 * @private
 * @property marker {Object}
 */
var marker = null;

/**
 * Holds direction instructions objects array.
 * @for NavigationGoogle
 * @private
 * @property instructions {Object[]}
 */
var instructions = [];

/**
 * Holds status if metric system is used.
 * @for NavigationGoogle
 * @private
 * @property useMetricSystem {Boolean}
 */
var useMetricSystem = false;

/**
 * Holds step value in meters.
 * @for NavigationGoogle
 * @private
 * @property step {Integer}
 */
var step = 10; // metres

/**
 * Holds tick value in milliseconds.
 * @for NavigationGoogle
 * @private
 * @property tick {Integer}
 */
var tick = 200; // milliseconds

/**
 * Holds distance value.
 * @for NavigationGoogle
 * @private
 * @property distance {Integer}
 */
var polDistance = 0;

/**
 * Holds remaining distance value.
 * @for NavigationGoogle
 * @private
 * @property remainingDistance {Integer}
 */
var remainingDistance = 0;

/**
 * Holds remaining step distance value.
 * @for NavigationGoogle
 * @private
 * @property remainingStepDistance {Integer}
 */
var remainingStepDistance = 0;

/**
 * Holds remaining time value.
 * @for NavigationGoogle
 * @private
 * @property remainingTime {Integer}
 */
var remainingTime = 0;

/**
 * Holds route duration value.
 * @for NavigationGoogle
 * @private
 * @property routeDuration {Integer}
 */
var routeDuration = 0;

/**
 * Holds average speed value.
 * @for NavigationGoogle
 * @private
 * @property averageSpeed {Integer}
 */
var averageSpeed = 0;

/**
 * Holds instruction index value.
 * @for NavigationGoogle
 * @private
 * @property instructionIndex {Integer}
 */
var instructionIndex = 1;

/**
 * Holds status value if instruction changed.
 * @for NavigationGoogle
 * @private
 * @property instructionChanged {Boolean}
 */
var instructionChanged = true;

/**
 * Holds animation timer object.
 * @for NavigationGoogle
 * @private
 * @property timerHandle {Object}
 */
var timerHandle;

/**
 * Instance of class Bootstrap, this class provides unified way to boot up the HTML applications by loading shared components in proper order.
 * * {{#crossLink "Bootstrap"}}{{/crossLink}}
 *
 * @property bootstrap {Object}
 */
var bootstrap;

/** 
 * Strips the HTML code removing all the HTML marks from it.
 * @method strip
 * @for NavigationGoogle
 * @private
 * @param html {String} HTML code
 */
function strip(html) {
	"use strict";
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html.replace('<div',' <div');
    return tmp.textContent || tmp.innerText;
}
/** 
 * Method switches between satellite or classic map view. 
 * @method switchMapSatelliteView
 * @for NavigationGoogle
 */
function switchMapSatelliteView() {
	"use strict";
	console.log("CLICKED!");
	/*global google */
	if (map.getMapTypeId() === google.maps.MapTypeId.ROADMAP) {
		map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
		$(".map-icon").css('display', 'none');
		$(".satellite-icon").css('display', 'inherit');
	} else if (map.getMapTypeId() === google.maps.MapTypeId.SATELLITE) {
		map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
		$(".satellite-icon").css('display', 'none');
		$(".map-icon").css('display', 'inherit');
	} else {
		console.log("Other map type is " + map.getMapTypeId());
	}
	console.log(map.getMapTypeId());
}

/**
 * NMethod changes navigation arrow based on instruction text.
 * @method changeNavigationArrow
 * @for NavigationGoogle
 * @param instructionText {String} Instruction text.
 */
function changeNavigationArrow(instructionText) {
	"use strict";
	var turnRight = instructionText.indexOf("right");
	var turnLeft = instructionText.indexOf("left");

	if (turnRight > 0 && turnRight < 10) {
		//"left" or "right" is on the beginning of instruction step	
		$("#turn-arrow").css("background-image", "url('images/icon_arrow_right.png')");
	} else if (turnLeft > 0 && turnLeft < 10) {
		//"left" or "right" is on the beginning of instruction step	
		$("#turn-arrow").css("background-image", "url('images/icon_arrow_left.png')");
	} else {
		$("#turn-arrow").css("background-image", "url('images/icon_arrow_straight.png')");
	}
}

/** 
 * Method changes format of distance value text.
 * @method formatMeters
 * @for NavigationGoogle
 * @param meters {Integer} Distance value in meters.
 * @param fontSize {Integer} Font size.
 * @return {String} Distance in meters width changed font format.
 */
function formatMeters(meters) {
	"use strict";
	if (meters > 500) {
		return [(Math.round(meters / 100)) / 10, "km"];
	} else {
		return [Math.round(meters), "m"];
	}
}

/**
 * Method converts distance from meters to feets and changing formats of distance value text.
 * @method convertMetersToFeetsMiles
 * @for NavigationGoogle
 * @param meters {Integer} Distance value in meters.
 * @param fontSize {Integer} Font size.
 * @return {String} Distance in feets width changed font format.
 */
function convertMetersToFeetsMiles(meters) {
	"use strict";
	var feets = meters * 3.280839895;
	var number, unit;
	if (feets > 528) {
		 number = (Math.round(feets / 528)) / 10;
		 unit = "mi";
	} else {
		number = Math.round(feets);
		unit = "ft";
	}
	return [number, unit];
}

/** 
 * Method converts seconds to time.
 * @method secondsToTime
 * @for NavigationGoogle
 * @param secs {Integer} Time value in seconds.
 * @return {Object} Time in object with hours, minutes and second separated format.
 */
function secondsToTime(secs) {
	"use strict";
	var hours = Math.floor(secs / (60 * 60));

	var divisorForMinutes = secs % (60 * 60);
	var minutes = Math.floor(divisorForMinutes / 60);

	var divisorForSeconds = divisorForMinutes % 60;
	var seconds = Math.ceil(divisorForSeconds);

	var obj = {
			"h" : hours,
			"m" : minutes,
			"s" : seconds
		};
	return obj;
}

/** 
 * Method provides leading 0 to time value.
 * @method addLeading0ToTime
 * @for NavigationGoogle
 * @param time {Integer} Time value.
 * @return time {String} Time with leading 0.
 */
function addLeading0ToTime(time) {
	"use strict";
	if (time < 10) {
		return "0" + time;
	} else {
		return time;
	}
}

/** 
 * Method formats time to HHMM format.
 * @method formatTimeToHHMM
 * @for NavigationGoogle
 * @param seconds {Integer} Time value in seconds.
 * @return formatedTime {String} Time in format HHMM.
 */
function formatTimeToHHMM(seconds) {
	"use strict";
	var hours = secondsToTime(seconds).h;
	var minutes = secondsToTime(seconds).m;
	var formatedTime;

	if (hours > 0 || minutes > 0) {
		formatedTime = addLeading0ToTime(hours) + ":" + addLeading0ToTime(minutes);
	} else {
		formatedTime = ":" + seconds;
	}
	return formatedTime;
}

/** 
 * Method adds seconds to current time.
 * @method addSecondsToCurrentTime
 * @for NavigationGoogle
 * @param secs {Integer} Time value in seconds.
 * @return result {String} Time in format HHMM.
 */
function addSecondsToCurrentTime(secs) {
   "use strict";
   var todayDate = new Date();
   var hours = todayDate.getHours();
   var minutes = todayDate.getMinutes();
   var seconds = todayDate.getSeconds();
   var newSec = parseInt(seconds, 10) + parseInt(secs, 10);
   var newMin;
   var mins;
   var sec;
   var min;
   var newHrs;

   if (newSec > 59) {
      mins = parseInt(newSec / 60, 10);
      sec = newSec - mins * 60;
      newMin = parseInt(minutes, 10) + mins;

      if (newMin > 59) {
         var hrs = parseInt(newMin / 60, 10);
         min = newMin - (hrs * 60);
         newHrs = parseInt(hours, 10) + hrs;
      } else {
         newHrs = hours;
         min = newMin;
      }
   } else {
      newHrs = hours;
      min = minutes;
      sec = newSec;
   }

   var format = "AM";

   if (newHrs > 11) {
      format = "PM";
   }
   if (newHrs > 12) {
      newHrs = newHrs - 12;
   }
   if (newHrs === 0) {
      newHrs = 12;
   }
   if (min < 10) {
      min = "0" + min;
   }

   return newHrs + ":" + min + format;
}

/** 
 * Method update the navigation panel.
 * @method updateNavigationPanel
 * @for NavigationGoogle
 */
function updateNavigationPanel() {
	"use strict";
	if (instructionChanged) {
		var instruction = strip(instructions[instructionIndex].instruction);
		console.log("Instruction changed to '" + instruction + "'.");
		$("#navigation-panel").html(instruction);
		/* global Speech*/
		// Speech.vocalizeString(instruction);
		changeNavigationArrow(instruction);
		instructionChanged = false;
	}

	$("#destination-progress").progressBarPlugin('setPosition', (remainingDistance / polDistance) * 100);
	var remainingTime = Math.round(remainingDistance / averageSpeed); //time in seconds
	remainingTime = formatTimeToHHMM(remainingTime);	//seconds to hh:mm

	if (useMetricSystem === true) {
		remainingStepDistance = formatMeters(remainingStepDistance);
		remainingDistance = formatMeters(remainingDistance);
	} else {
		remainingStepDistance = convertMetersToFeetsMiles(remainingStepDistance);
		remainingDistance =  convertMetersToFeetsMiles(remainingDistance);
	}

	$("#distance-to > span").html(remainingStepDistance[0]);
	$("#distance-to > small").html(remainingStepDistance[1]);


	$("#still-to-go-time-and-distance > .time").html(remainingTime);
	$("#still-to-go-time-and-distance > .distance").html(remainingDistance[0]);
	$("#still-to-go-time-and-distance > small").html(remainingDistance[1]);
}

/** 
 * Method animates current position along the route.
 * @method animate
 * @for NavigationGoogle
 * @param d {Integer} 
 */
function animate(d) {
	"use strict";
	if (d + step > instructions[instructionIndex-1].distanceValue) {
		if (instructionIndex < instructions.length - 1) {
			instructionChanged = true;
			instructionIndex++;
		}
	}

	if (d > polDistance) {
		instructionIndex = instructions.length - 1;
		instructionChanged = false;

		remainingDistance = 0;
		remainingStepDistance = 0;
		remainingTime = 0;

		updateNavigationPanel();

		map.panTo(polyline.getPath().getAt(polyline.getPath().length - 1));
		marker.setPosition(polyline.getPath().getAt(polyline.getPath().length - 1));

		var option = {draggable: true};
		map.setOptions(option);
		return;
	}

	remainingDistance = polDistance - d;
	remainingStepDistance = instructions[instructionIndex-1].distanceValue - d;

	updateNavigationPanel();

	var p = polyline.GetPointAtDistance(d);
	map.panTo(p);
	marker.setPosition(p);
	timerHandle = setTimeout("animate(" + (d + step) + ")", tick);
}

/**
 * Method starts animation.
 * @method startAnimation
 * @for NavigationGoogle
 * @constructor
 */
function startAnimation() {
	"use strict";
	var option = {
			draggable: false
		};
	map.setOptions(option);

	marker = new google.maps.Marker();
	marker.setMap(map);
	marker.setPosition(polyline.getPath().getAt(0));
	map.setCenter(polyline.getPath().getAt(0));
	polDistance = polyline.Distance();

	console.log(polyline.getPath());
	console.log(polDistance);
	console.log(instructions);

	remainingDistance = polDistance;
	remainingStepDistance = instructions[instructionIndex].distanceValue;
	routeDuration = route.duration.value;
	remainingTime = routeDuration;
	averageSpeed = (route.distance.value / routeDuration);

	/* jshint camelcase: false */
	$("#destination-address").html(destination.formatted_address);
	$("#destination-address-town > small").html(destination.address_components[2].short_name + ", " + destination.address_components[3].short_name);
	/* jshint camelcase: true */

	var averageSpeedText;
	var speedUnit;

	if (useMetricSystem === true) {
		averageSpeedText = Math.round(averageSpeed * 3.6);
		speedUnit = "metric";
	} else {
		averageSpeedText = Math.round(averageSpeed * 2.2369362920544);
		speedUnit = "imperial";
	};

	$("#arrival-text > span").html(addSecondsToCurrentTime(routeDuration));
	$("#arrival-text > small").html(averageSpeedText).addClass(speedUnit);

	updateNavigationPanel();
	window.setTimeout(function(){
		animate(0);
		}, 2000); // Allow time for the initial map display
}

/** 
 * Method renders the route.
 * @method renderRoute
 * @for NavigationGoogle
 * @param origin {Object} Origin position object.
 * @param destination {Object} Destination position object.
 */
function renderRoute(origin, destination) {
	"use strict";
	if (directionsService === null) {
		directionsService = new google.maps.DirectionsService();
	}

	if (directionRenderer === null) {
		directionRenderer = new google.maps.DirectionsRenderer();
	}

	directionRenderer.setMap(map);

	var request = {
			origin: origin,
			destination: destination,
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		};

	directionsService.route(request, function (response, status) {
		console.log(status);
		console.log(response);
		if (status === google.maps.DirectionsStatus.OK && response.routes.length) {
			if (response.routes && response.routes[0] && response.routes[0].legs && response.routes[0].legs[0]) {
				polyline = new google.maps.Polyline({
					path : []
				});

				route = response.routes[0].legs[0];
				directionRenderer.setDirections(response);

				var steps = route.steps;
				var distanceStep = 0;
				var j;
				for (j = 0; j < steps.length; j++) {
					var latLngs = steps[j].path;
					distanceStep = distanceStep + (steps[j].distance.value || 0);

					var instruction = {
							distance: (steps[j].distance || 0),
							distanceValue: distanceStep,
							instruction: (steps[j].instructions ? steps[j].instructions.trim() : "")
						};

					instructions.push(instruction);
					var k;
					for (k = 0; k < latLngs.length; k++) {
						polyline.getPath().push(latLngs[k]);
					}
				}
				startAnimation();
			}
		} else {
			console.log('Route calculation failed: ' + status);
		}
	});
}

/**
 * Starts the navigation.
 * @method startNavigation
 * @for NavigationGoogle
 */
function startNavigation(){
	"use strict";
	try {
		if (geocoder == null) {
			geocoder = new google.maps.Geocoder();
		}
		geocoder.geocode({
			address: originAddress
		}, function (results, status) {
			if (status === "OK" && results.length) {
				origin = results[0] || null;
				map.setCenter(origin.geometry.location);
				geocoder.geocode({
					address: destinationAddress
				}, function (results, status) {
					if (status === "OK" && results.length) {
						destination = results[0] || null;

						if (origin && destination) {
							renderRoute(origin.geometry.location, destination.geometry.location);
						}
					} else {
						console.log("Destination not found. Unable to get the route.");
					}
				});
			} else {
				console.log("Origin not found. Unable to get the route.");
			}
		});
	} catch (error) {
		console.log(error.message);
	}
}
var bootstrap;
$(document).ready(function () {
	"use strict";
	/* global Bootstrap*/
	bootstrap = new Bootstrap(function (status) {
		// $(".keyboard").css('display', 'none');
		//$("#topBarIcons").topBarIconsPlugin('init', 'navigation');
		// $("#upNextRectangle").boxCaptionPlugin('init', 'up next');
		$("#destinationRectangle").boxCaptionPlugin('init', 'destination');
		$("#stillToGoRectangle").boxCaptionPlugin('init', 'still to go');
		//$('#bottomPanel').bottomPanel('init');

		var options = {
			backgroundColor: "transparent",
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false,
			streetViewControl: false,
			zoom: 18
		};

		map = new google.maps.Map(document.getElementById("map-inner"), options);

		startNavigation();

		// This isn't working, temporary script written in HTML

		$("#places-button, .closeLibraryButton, .placesElement").on("click", function() {
			$("#places-library").toggleClass("expanded");
		});

		$("#placesLibrary").library("setSectionTitle", "PLACES LIBRARY");
		$("#placesLibrary").library("init");
		$("#placesLibrary").library("hideAlphabet");
		$("#placesLibrary").library("setGridBtnDisabled", true);
		$("#placesLibrary").library("setSearchBtnDisabled", true);


		var tabMenuItems = [ {
			text : "DESTINATIONS",
			selected : true
		} ];

		var tabMenuModel = {
			Tabs : tabMenuItems
		};

		$("#placesLibrary").library("tabMenuTemplateCompile", tabMenuModel);
		$("#placesLibrary").library("setContentDelegate", "templates/placesListDelegate.html");
		$("#placesLibrary").library("contentTemplateCompile", places, "placesLibraryContentList");
	});
});

/** 
 * Restarts the navigation with a new destination address taken into account.
 * @method changeDestinationAddress
 * @for NavigationGoogle
 * @param newDestinationAddress {String} a new destination address
 */
function changeDestinationAddress(newDestinationAddress) {
	"use strict";
	$("#placesLibrary").library("hidePage");

	destinationAddress = newDestinationAddress;

	origin = null;
	destination = null;
	polyline = null;
	route = null;

	polDistance = 0;
	remainingDistance = 0;
	remainingStepDistance = 0;
	remainingTime = 0;
	routeDuration = 0;
	averageSpeed = 0;

	instructions = [];
	instructionIndex = 1;
	instructionChanged = true;

	marker.setMap(null);
	marker = null;

	clearTimeout(timerHandle);
    timerHandle = null;

    directionRenderer.setMap(null);
    directionRenderer = null;

    startNavigation();
}
