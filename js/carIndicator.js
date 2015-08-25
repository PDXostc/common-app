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
 *
 */

/**
 * @module Services
 */

/**
 * Class provides AMB related functionality utilizing `tizen.vehicle` API for signals used in HTML applications. This component is usually initialized by {{#crossLink "Bootstrap"}}{{/crossLink}} class
 * and can be later accessed using {{#crossLink "Bootstrap/carIndicator:property"}}{{/crossLink}} property. Signals recognized by this class needs to be registered in property
 * {{#crossLink "CarIndicator/_mappingTable:property"}}{{/crossLink}}.
 *
 * To attach and detach to particular property register new callback object using {{#crossLink "Bootstrap/carIndicator:addListener"}}{{/crossLink}} method, e.g.:
 *
 *     var listenerId = bootstrap.carIndicator.addListener({
 *        onSteeringWheelAngleChanged: function(newValue){
 *           // Process new value
 *        },
 *        onWheelBrakeChanged : function(newValue){
 *           // Process new value
 *        }
 *     });
 *
 *     // Unregister listener
 *     bootstrap.carIndicator.removeListener(listenerId);
 *
 * Currently following signals are recognized:
 *
 * * SteeringWheelAngle
 *   * SteeringWheelAngle
 * * WheelBrake
 *   * Engaged
 * * TirePressure
 *   * leftFront
 *   * rightFront
 *   * leftRear
 *   * rightRear
 * * DoorStatus
 *   * ChildLockStatus
 * * WindowStatus
 *   * FrontDefrost
 *   * RearDefrost
 * * HVAC
 *   * FanSpeed
 *   * TargetTemperatureRight
 *   * TargetTemperatureLeft
 *   * SeatHeaterRight
 *   * SeatHeaterLeft
 *   * AirConditioning
 *   * AirRecirculation
 *   * AirflowDirection
 * * LightStatus
 *   * Hazard
 *   * Head
 *   * Parking
 * * BatteryStatus
 * * FullBatteryRange
 * * ExteriorTemperature
 *   * Exterior
 * * InteriorTemperature
 *   * Interior
 * * WheelInformation
 *   * FrontWheelRadius
 * * AvgKW
 *   * AvgKW
 * * VehicleSpeed
 * * Odometer
 * * Transmission
 *   * ShiftPosition
 * * ExteriorBrightness
 * * NightMode
 * * DirectionIndicationINST
 * * DirectionIndicationMS
 * * ACCommand
 * * RecircReq
 * * FrontTSetRightCmd
 * * FrontTSetLeftCmd
 * * FrontBlwrSpeedCmd
 * * HeatedSeatFRModeRequest
 * * HeatedSeatFRRequest
 * * HeatedSeatFLModeRequest
 * * HeatedSeatFLRequest
 * * FLHSDistrCmd
 * * FRHSDistrCmd
 *
 * @class CarIndicator
 * @constructor
 */

var logit=0;  // Set to 1 to enable AMB log output.
var ambFailCnt=10; // If AMB not installed or ambd not running, don;t fill up the log with failure messages.

var CarIndicator = function() {
	"use strict";
	console.info("Starting up service CarIndicator");
    $(document).trigger("carIndicatorReady");
};

function parseInteger(value) {
	"use strict";
	return parseInt(value, 10);
}

function parseTirePressure(value) {
	"use strict";
	var floatValue = parseFloat(value).toFixed(2);
	if (floatValue > 180 && floatValue < 220) {
		floatValue = "OK";
	}
	return floatValue;
}

/**
 * Array of registered listeners
 * @type Object
 * @property _listeners
 * @private
 */
CarIndicator.prototype._listeners = {};

/*
 * Array of registered listener IDs.
 * @type Array
 * @property _listenerIDs
 * @private
 */
CarIndicator.prototype._listenerIDs = [];

// Set by first call to addListener, it provides a way for the promise in getFunction to access _mappingTable.
var GlobalSelf=0;

/**
 * Signal mapping table.
 * Each entry should form an object
 * @property _mappingTable
 * @private
 * @type Object
 */
CarIndicator.prototype._mappingTable = {
	/*
	ZONE_None   = 000000;
	ZONE_Front  = 000001;
	ZONE_Middle = 000010;
	ZONE_Right  = 000100;
	ZONE_Left   = 001000;
	ZONE_Rear   = 010000;
	ZONE_Center = 100000;
	*/

	/* this is for steeringWheel game controler */
	"SteeringWheelAngle" : {
		propertyName : "SteeringWheelAngle",
		callBackPropertyName : "SteeringWheelAngle",
		subscribeName : "SteeringWheelAngle",
		conversionFunction : function(value) {
			"use strict";
			value = parseInt(value, 10);
			var returnValue = 0;
			if (value <= 180 && value > 0) {
				returnValue = (1 * (value / 6)) - 30;
			} else if (value <= 360 && value > 180) {
				returnValue = ((value - 179) / 6);
			} else if (value === 0) {
				returnValue = -30;
			}
			return returnValue;
		},
		zone : "000000",
		curValue: 0,
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				navigator.vehicle.steeringWheelAngle.get(zone).then(
						function (steeringWheelAngle) {
							GlobalSelf._mappingTable["SteeringWheelAngle"].curValue = steeringWheelAngle.value;
						},
						function (error) {
							console.log("AMB: There was an error on the steeringWheelAngle get: " + error);
						});
			} catch(ex) {
				console.log("AMB: There was an error on the steeringWheelAngle get: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.steeringWheelAngle.subscribe(
						function (steeringWheelAngle) {
						});
			} catch (ex) {
				console.log("AMB: There was an error on the steeringWheelAngle subscribe: ", ex);
			}
		}
	},

	/*
	"YawRate" : {
		propertyName : "YawRate",
		callBackPropertyName : "YawRate",
		subscribeName : "YawRate",
		zone : "000000",
		curValue: 0,
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				tizen.vehicle.yawRate.get(zone).then(function (YawRate) {
							GlobalSelf._mappingTable["YawRate"].curValue = YawRate.value;
							console.log("AMB: YawRate  get sees value as: " + YawRate.value);
						},
						function (error) {
							console.log("AMB: There was an error on the YawRate get: " + error);
						});
			} catch (ex) {
				console.log("AMB: There was an error on the YawRate get: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				console.log("AMB: in YawRate steeringWheelAngle subscribeFunc.");
				tizen.vehicle.yawRate.subscribe(function (YawRate) {
					console.log("AMB steeringWheelAngle  changed to: " + YawRate.value);
					//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);

				});
			} catch (ex) {
				console.log("AMB: There was an error on the YawRate subscribe: ", ex);
			}
		}
	},
	*/

	"WheelBrake" : {
		propertyName : "Engaged",
		callBackPropertyName : "WheelBrake",
		subscribeName : "WheelBrake",
		zone : "000000",
			curValue: 0,
			getFunction : function() {
				"use strict";
				try {
					var zone = new Zone([]);
					navigator.vehicle.wheelBrake.get(zone).then(function (WheelBrake) {
								GlobalSelf._mappingTable["WheelBrake"].curValue = WheelBrake.value;
							},
							function (error) {
								console.log("AMB: There was an error on the WheelBrake get: " + error);
							});
				} catch (ex) {
					console.log("AMB: There was an error on the WheelBrake get: ", ex);
				}
			},
			subscribeFunction : function() {
				"use strict";
				try {
					navigator.vehicle.wheelBrake.subscribe(function (WheelBrake) {
					});
				} catch (ex) {
					console.log("AMB: There was an error on the WheelBrake subscribe: ", ex);
				}
			}
	},

	/* end steeringWheel game controler*/
	"TyrePressureFLMS" : {
		propertyName : "TyrePressureFLMS",
		callBackPropertyName : "tirePressureLeftFront",
		conversionFunction : parseTirePressure,
		zone : "000000",
		curValue: 0,
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				navigator.vehicle.tyrePressureFLMS.get(zone).then(function (tirePressure) {
							GlobalSelf._mappingTable["TyrePressureFLMS"].curValue = tirePressure.tyrePressureFLMS;
						},
						function (error) {
							console.log("AMB: There was an error on the TyrePressureFLMS get: " + error);
							ambFailCnt--;
						});
			} catch (ex) {
				console.log("AMB: There was an error on the TyrePressureFLMS get: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.tyrePressureFLMS.subscribe(function (tirePressure) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the TyrePressureFLMS subscribe: ", ex);
			}
		}
	},

	"TyrePressureFRMS" : {
		propertyName : "TyrePressureFRMS",
		callBackPropertyName : "tirePressureRightFront",
		conversionFunction : parseTirePressure,
		zone : "000000",
		curValue: 0,
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				navigator.vehicle.tyrePressureFRMS.get(zone).then(function (tirePressure) {
							GlobalSelf._mappingTable["TyrePressureFRMS"].curValue = tirePressure.tyrePressureFRMS;
						},
						function (error) {
							console.log("AMB: There was an error on the TyrePressureFRMS get: " + error);
						});
			} catch (ex) {
				console.log("AMB: There was an error on the TyrePressureFRMS get: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.tyrePressureFRMS.subscribe(function (tirePressure) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the TyrePressureFRMS subscribe: ", ex);
			}
		}
	},

	"TyrePressureRLMS" : {
		propertyName : "TyrePressureRLMS",
		callBackPropertyName : "tirePressureLeftRear",
		conversionFunction : parseTirePressure,
		zone : "000000",
		curValue: 0,
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				navigator.vehicle.tyrePressureRLMS.get(zone).then(function (tirePressure) {
							GlobalSelf._mappingTable["TyrePressureRLMS"].curValue = tirePressure.tyrePressureRLMS;
						},
						function (error) {
							console.log("AMB: There was an error on the TyrePressureRLMS get: " + error);
						});
			} catch (ex) {
				console.log("AMB: There was an error on the TyrePressureRLMS get: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.tyrePressureRLMS.subscribe(function (tirePressure) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the TyrePressureRLMS subscribe: ", ex);
			}
		}
	},

	"TyrePressureRRMS" : {
		propertyName : "TyrePressureRRMS",
		callBackPropertyName : "tirePressureRightRear",
		conversionFunction : parseTirePressure,
		zone : "000000",
		curValue: 0,
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				navigator.vehicle.tyrePressureRRMS.get(zone).then(function (tirePressure) {
							GlobalSelf._mappingTable["TyrePressureRRMS"].curValue = tirePressure.tyrePressureRRMS;
						},
						function (error) {
							console.log("AMB: There was an error on the TyrePressureRRMS get: " + error);
						});
			} catch (ex) {
				console.log("AMB: There was an error on the TyrePressureRRMS get: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.tyrePressureRRMS.subscribe(function (tirePressure) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the TyrePressureRRMS subscribe: ", ex);
			}
		}
	},

	"ChildLock" : {
		propertyName : "ChildLockStatus",
		callBackPropertyName : "childLock",
		subscribeName : "DoorStatus",
		zone : "000000",
		curValue: 0,
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				navigator.vehicle.ChildLockStatus.get(zone).then(function (childLock) {
							GlobalSelf._mappingTable["ChildLock"].curValue = childLock.value;
						},
						function (error) {
							console.log("AMB: There was an error on the childLock get: " + error);
						});
			} catch (ex) {
				console.log("AMB: There was an error on the childLock get: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.childLockStatus.subscribe(function (childLock) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the childLock subscribe: ", ex);
			}
		}
	},

	"FrontDefrost" : {
		propertyName : "Defrost",
		callBackPropertyName : "frontDefrost",
		subscribeName : "WindowStatus",
		zone : "000001"
	},

	"RearDefrost" : {
		propertyName : "Defrost",
		callBackPropertyName : "rearDefrost",
		subscribeName : "WindowStatus",
		zone : "010000"
	},

	"FanSpeed" : {
		propertyName : "FanSpeed",
		callBackPropertyName : "fanSpeed",
		subscribeName : "HVAC",
		conversionFunction : parseInteger,
		zone : "000000"
	},

	"TargetTemperatureRight" : {
		propertyName : "TargetTemperature",
		callBackPropertyName : "targetTemperatureRight",
		subscribeName : "HVAC",
		conversionFunction : parseInteger,
		zone : "000100"
	},

	"TargetTemperatureLeft" : {
		propertyName : "TargetTemperature",
		callBackPropertyName : "targetTemperatureLeft",
		subscribeName : "HVAC",
		conversionFunction : parseInteger,
		zone : "001000"
	},

	"Hazard" : {
		propertyName : "Hazard",
		callBackPropertyName : "hazard",
		subscribeName : "LightStatus",
		zone : "000000"
	},

	"Head" : {
		propertyName : "Head",
		callBackPropertyName : "frontLights",
		subscribeName : "LightStatus",
		zone : "000000"
	},

	"SeatHeaterRight" : {
		propertyName : "SeatHeater",
		callBackPropertyName : "seatHeaterRight",
		subscribeName : "HVAC",
		zone : "000101"
	},

	"SeatHeaterLeft" : {
		propertyName : "SeatHeater",
		callBackPropertyName : "seatHeaterLeft",
		subscribeName : "HVAC",
		zone : "001001"
	},

	"Parking" : {
		propertyName : "Parking",
		callBackPropertyName : "rearLights",
		subscribeName : "LightStatus",
		zone : "000000"
	},

	"AirConditioning" : {
		propertyName : "AirConditioning",
		callBackPropertyName : "fan",
		subscribeName : "HVAC",
		zone : "000000"
	},

	"AirRecirculation" : {
		propertyName : "AirRecirculation",
		callBackPropertyName : "airRecirculation",
		subscribeName : "HVAC",
		zone : "000000"
	},

	"AirflowDirection" : {
		propertyName : "FLHSDistrCmd",
		callBackPropertyName : "airflowDirection",
		subscribeName : "FLHSDistrCmd",
		conversionFunction : parseInteger,
		zone : "000000",
		curValue: 0,
		setFunction : function(val) {
			"use strict";
			try {
				var zone = new Zone([]);
				if (logit) {
					console.log("AMB: AirflowDirection-FLHSDistrCmd setFunc called .");
				}

				// Must change this to different access method: curValue = val;
				navigator.vehicle.fLHSDistrCmd.set({"FLHSDistrCmd": val}, zone).then(
						function () {
							if (logit) {
								console.log("AMB: AirflowDirection-FLHSDistrCmd set success.");
							}
						},
						function (failure) {
							console.log("AMB: There was an error on the AirflowDirection-FLHSDistrCmd set: " + failure);
						}
				);
			} catch (ex) {
				console.log("AMB: There was an error on the AirflowDirection-FLHSDistrCmd set: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.fLHSDistrCmd.subscribe(function (speed) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the AirflowDirection-FLHSDistrCmd subscribe: ", ex);
			}
		}
	},

	"BatteryStatus" : {
		propertyName : "BatteryStatus",
		callBackPropertyName : "batteryStatus",
		conversionFunction : parseInteger,
		zone : "000000"
	},

	"FullBatteryRange" : {
		propertyName : "FullBatteryRange",
		callBackPropertyName : "fullBatteryRange",
		conversionFunction : parseInteger,
		zone : "000000"
	},

 	"AmbientTemp" : {
		propertyName : "AmbientTemp",
		callBackPropertyName : "outsideTemp",
		conversionFunction : parseInteger,
		zone : "000000",
		curValue: 0,
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				navigator.vehicle.ambientTemp.get(zone).then(function (temp) {
							GlobalSelf._mappingTable["AmbientTemp"].curValue = temp.ambientTemp;
						},
						function (error) {
							console.log("AMB: There was an error on the AmbientTemp get: " + error);
						});
			} catch (ex) {
				console.log("AMB: There was an error on the AmbientTemp get: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.ambientTemp.subscribe(function (temp) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the AmbientTemp subscribe: ", ex);
			}
		}
	},

	"InCarTemp" : {
		propertyName : "InCarTemp",
		callBackPropertyName : "insideTemp",
		conversionFunction : parseInteger,
		zone : "000000",
		curValue: 0,
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				navigator.vehicle.inCarTemp.get(zone).then(function (temp) {
							GlobalSelf._mappingTable["InCarTemp"].curValue = temp.inCarTemp;
						},
						function (error) {
							console.log("AMB: There was an error on the InCarTemp get: " + error);
						});
			} catch (ex) {
				console.log("AMB: There was an error on the InCarTemp get: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.inCarTemp.subscribe(function (temp) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the InCarTemp subscribe: ", ex);
			}
		}
	},

	"FuelLevelIndicatedMS" : {
		propertyName : "FuelLevelIndicatedMS",
		callBackPropertyName : "FuelLevel",
		conversionFunction : parseInteger,
		zone : "000000",
		curValue: 0,
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				navigator.vehicle.fuelLevelIndicatedMS.get(zone).then(function (level) {
							GlobalSelf._mappingTable["FuelLevelIndicatedMS"].curValue = level.fuelLevelIndicatedMS;
						},
						function (error) {
							console.log("AMB: There was an error on the FuelLevelIndicatedMS get: " + error);
						});
			} catch (ex) {
				console.log("AMB: There was an error on the FuelLevelIndicatedMS get: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.fuelLevelIndicatedMS.subscribe(function (level) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the FuelLevelIndicatedMS subscribe: ", ex);
			}
		}
	},

	"DistanceToEmpty" : {
		propertyName : "DistanceToEmpty",
		callBackPropertyName : "DistanceToEmpty",
		conversionFunction : parseInteger,
		zone : "000000",
		curValue: 0,
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				navigator.vehicle.distanceToEmpty.get(zone).then(function (dist) {
							GlobalSelf._mappingTable["DistanceToEmpty"].curValue = dist.distanceToEmpty;
						},
						function (error) {
							console.log("AMB: There was an error on the DistanceToEmpty get: " + error);
						});
			} catch (ex) {
				console.log("AMB: There was an error on the DistanceToEmpty get: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.distanceToEmpty.subscribe(function (dist) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the DistanceToEmpty subscribe: ", ex);
			}
		}
	},

	"ODORollingCount2101" : {
		propertyName : "ODORollingCount2101",
		callBackPropertyName : "odoMeter",
		conversionFunction : parseInteger,
		zone : "000000",
		curValue: 0,
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				navigator.vehicle.oDORollingCount2101.get(zone).then(function (dist) {
							GlobalSelf._mappingTable["ODORollingCount2101"].curValue = dist.oDORollingCount2101;
						},
						function (error) {
							console.log("AMB: There was an error on the ODORollingCount2101 get: " + error);
						});
			} catch (ex) {
				console.log("AMB: There was an error on the ODORollingCount2101 get: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.oDORollingCount2101.subscribe(function (dist) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the ODORollingCount2101 subscribe: ", ex);
			}
		}
	},

	"WheelAngle" : {
		propertyName : "FrontWheelRadius",
		callBackPropertyName : "wheelAngle",
		subscribeName : "WheelInformation",
		conversionFunction : parseInteger,
		zone : "000000"
	},

	"Weather" : {
		propertyName : "Weather",
		callBackPropertyName : "weather",
		conversionFunction : parseInteger,
		zone : "000000"
	},

	"AvgKW" : {
		propertyName : "AvgKW",
		callBackPropertyName : "avgKW",
		subscribeName : "AvgKW",
		conversionFunction : function(newValue) {
			"use strict";
			return parseFloat(newValue).toFixed(2);
		},
		zone : "000000"
	},

	"VehicleSpeed" : {
		propertyName : "VehicleSpeed",
		callBackPropertyName : "speed",
		conversionFunction : parseInteger,
		zone : "000000",
		curValue: 0,
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				navigator.vehicle.vehicleSpeed.get(zone).then(function (vehicleSpeed) {
							GlobalSelf._mappingTable["VehicleSpeed"].curValue = vehicleSpeed.speed;
						},
						function (error) {
							console.log("AMB: There was an error on the speed get: " + error);
							ambFailCnt--;
						});
			} catch (ex) {
				console.log("AMB: There was an error on the speed get: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.vehicleSpeed.subscribe(function (vehicleSpeed) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the speed subscribe: ", ex);
			}
		}
	},

	"Odometer" : {
		propertyName : "Odometer",
		callBackPropertyName : "odoMeter",
		conversionFunction : parseInteger,
		zone : "000000"
	},

	"TransmissionShiftPosition" : {
		propertyName : "ShiftPosition",
		callBackPropertyName : "gear",
		conversionFunction : function(value) {
			"use strict";
			switch (value) {
			case 0:
				value = "N";
				break;
			case 64:
				value = "C";
				break;
			case 96:
				value = "D";
				break;
			case 128:
				value = "R";
				break;
			case 255:
				value = "P";
				break;
			}
			return value;
		},
		subscribeName : "Transmission",
		zone : "000000"
	},

	"Randomize" : {
		propertyName : "Randomize",
		callBackPropertyName : "randomize",
		subscribeName : "Randomize",
		zone : "000000"
	},

	"ExteriorBrightness" : {
		propertyName : "ExteriorBrightness",
		callBackPropertyName : "exteriorBrightness",
		zone : "000000"
	},

	"NightMode" : {
		propertyName : "NightMode",
		callBackPropertyName : "nightMode",
		zone : "000000"
	},

	// JLR can signals
	"DirectionIndicationINST" : {
		propertyName : "DirectionIndicationINST",
		callBackPropertyName : "DirectionIndicationINST",
		subscribeName : "DirectionIndicationINST",
		zone : "000000",
		curValue: 0,
		setFunction : function(val) {
			"use strict";
			try {
				var zone = new Zone([]);
				if (logit) {
					console.log("AMB: called DirectionIndicationINST set with value " + val);
				}
				// Must change this to different access method: curValue = val;
				navigator.vehicle.directionIndicationINST.set({"DirectionIndicationINST": val}, zone).then(
						function () {
							if (logit) {
								console.log("AMB: DirectionIndicationINST set success.");
							}
						},
						function (failure) {
							console.log("AMB: There was an error on the DirectionIndicationINST set: " + failure);
						}
				);
			} catch (ex) {
				console.log("AMB: There was an error on the DirectionIndicationINST set: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.directionIndicationINST.subscribe(function (speed) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the DirectionIndicationINST subscribe: ", ex);
			}
		}
	},

	"DirectionIndicationMS" : {
		propertyName : "DirectionIndicationMS",
		callBackPropertyName : "DirectionIndicationMS",
		subscribeName : "DirectionIndicationMS",
		zone : "000000",
		curValue: 0,
		setFunction : function(val) {
			"use strict";
			try {
				var zone = new Zone([]);
				// Must change this to different access method: curValue = val;
				navigator.vehicle.directionIndicationMS.set({"DirectionIndicationMS": val}, zone).then(
						function () {
							if (logit) {
								console.log("AMB: DirectionIndicationMS set success.");
							}
						},
						function (failure) {
							console.log("AMB: There was an error on the DirectionIndicationMS set: " + failure);
						}
				);
			} catch (ex) {
				console.log("AMB: There was an error on the DirectionIndicationMS set: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.directionIndicationMS.subscribe(function (speed) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the DirectionIndicationMS subscribe: ", ex);
			}
		}
	},

	"ACCommand" : {
		propertyName : "ACCommand",
		callBackPropertyName : "ACCommand",
		subscribeName : "ACCommand",
		zone : "000000",
		curValue: 0,
		setFunction : function(val) {
			"use strict";
			try {
				var zone = new Zone([]);
				if (logit) {
					console.log("AMB: called ACCommand set with value " + val);
				}

				// Must change this to different access method: curValue = val;
				navigator.vehicle.aCCommand.set({"ACCommand": val}, zone).then(
						function () {
							if (logit) {
								console.log("AMB: ACCommand set success.");
							}
						},
						function (failure) {
							console.log("AMB: There was an error on the ACCommand set: " + failure);
						}
				);
			} catch (ex) {
				console.log("AMB: There was an error on the ACCommand set: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.aCCommand.subscribe(function (speed) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the ACCommand subscribe: ", ex);
			}
		}
	},

	"RecircReq" : {
		propertyName : "RecircReq",
		callBackPropertyName : "RecircReq",
		subscribeName : "RecircReq",
		zone : "000000",
		setFunction : function(val) {
			"use strict";
			try {
				var zone = new Zone([]);
				// Must change this to different access method: curValue = val;
				navigator.vehicle.recircReq.set({"RecircReq": val}, zone).then(
						function () {
							if (logit) {
								console.log("AMB: RecircReq set success.");
							}
						},
						function (failure) {
							console.log("AMB: There was an error on the RecircReq set: " + failure);
						}
				);
			} catch (ex) {
				console.log("AMB: There was an error on the RecircReq set: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				console.log("AMB: in RecircReq  subscribeFunc.");
				navigator.vehicle.recircReq.subscribe(function (speed) {
					console.log("AMB RecircReq  changed to: " + speed.value);
				});
			} catch (ex) {
				console.log("AMB: There was an error on the RecircReq subscribe: ", ex);
			}
		}
	},

	"FrontTSetRightCmd" : {
		propertyName : "FrontTSetRightCmd",
		callBackPropertyName : "FrontTSetRightCmd",
		subscribeName : "FrontTSetRightCmd",
		zone : "000000",
		setFunction : function(val) {
			"use strict";
			try {
				var zone = new Zone([]);
				if (logit) {
					console.log("AMB: called FrontTSetRightCmd set with value " + val);
				}

				// Must change this to different access method: curValue = val;
				navigator.vehicle.frontTSetRightCmd.set({"FrontTSetRightCmd": val}, zone).then(
						function () {
							if (logit) {
								console.log("AMB: FrontTSetRightCmd set success.");
							}
						},
						function (failure) {
							console.log("AMB: There was an error on the FrontTSetRightCmd set: " + failure);
						}
				);
			} catch (ex) {
				console.log("AMB: There was an error on the FrontTSetRightCmd set: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.frontTSetRightCmd.subscribe(function (speed) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the FrontTSetRightCmd subscribe: ", ex);
			}
		}
	},

	"FrontTSetLeftCmd" : {
		propertyName : "FrontTSetLeftCmd",
		callBackPropertyName : "FrontTSetLeftCmd",
		subscribeName : "FrontTSetLeftCmd",
		zone : "000000",
		setFunction : function(val) {
			"use strict";
			try {
				var zone = new Zone([]);
				if (logit) {
					console.log("AMB: called FrontTSetLeftCmd set with value " + val);
				}
				// Must change this to different access method: curValue = val;
				navigator.vehicle.frontTSetLeftCmd.set({"FrontTSetLeftCmd": val}, zone).then(
						function () {
							if (logit) {
								console.log("AMB: FrontTSetLeftCmd set success.");
							}
						},
						function (failure) {
							console.log("AMB: There was an error on the FrontTSetLeftCmd set: " + failure);
						}
				);
			} catch (ex) {
				console.log("AMB: There was an error on the FrontTSetLeftCmd set: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.frontTSetLeftCmd.subscribe(function (speed) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the FrontTSetLeftCmd subscribe: ", ex);
			}
		}
	},

	"FrontBlwrSpeedCmd" : {
		propertyName : "FrontBlwrSpeedCmd",
		callBackPropertyName : "FrontBlwrSpeedCmd",
		subscribeName : "FrontBlwrSpeedCmd",
		zone : "000000",
		curValue: 0,
		setFunction : function(val) {
			"use strict";
			try {
				var zone = new Zone([]);
				// Must change this to different access method: curValue = val;
				if (logit) {
					console.log("AMB: called FrontBlwrSpeedCmd set with value " + val);
				}
				navigator.vehicle.frontBlwrSpeedCmd.set({"FrontBlwrSpeedCmd": val}, zone).then(
						function () {
							if (logit) {
								console.log("AMB: FrontBlwrSpeedCmd set success.");
							}
						},
						function (failure) {
							console.log("AMB: There was an error on the FrontBlwrSpeedCmd set: " + failure);
						}
				);
			} catch (ex) {
				console.log("AMB: There was an error on the FrontBlwrSpeedCmd set: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				console.log("AMB: in FrontBlwrSpeedCmd  subscribeFunc.");
				navigator.vehicle.frontBlwrSpeedCmd.subscribe(function (speed) {
					console.log("AMB FrontBlwrSpeedCmd  changed to: " + speed.value);
				});
			} catch (ex) {
				console.log("AMB: There was an error on the FrontBlwrSpeedCmd subscribe: ", ex);
			}
		}
	},

	"HeatedSeatFRModeRequest" : {
		propertyName : "HeatedSeatFRModeRequest",
		callBackPropertyName : "HeatedSeatFRModeRequest",
		subscribeName : "HeatedSeatFRModeRequest",
		zone : "000000"
	},

	"HeatedSeatFRRequest" : {
		propertyName : "HeatedSeatFRRequest",
		callBackPropertyName : "HeatedSeatFRRequest",
		subscribeName : "HeatedSeatFRRequest",
		zone : "000000",
		setFunction : function(val) {
			"use strict";
			try {
				var zone = new Zone([]);
				if (logit) {
					console.log("AMB: called HeatedSeatFRRequest set with value " + val);
				}
				// Must change this to different access method: curValue = val;
				navigator.vehicle.heatedSeatFRRequest.set({"HeatedSeatFRRequest": val}, zone).then(
						function () {
							if (logit) {
								console.log("AMB: HeatedSeatFRRequest set success.");
							}
						},
						function (failure) {
							console.log("AMB: There was an error on the HeatedSeatFRRequest set: " + failure);
						}
				);
			} catch (ex) {
				console.log("AMB: There was an error on the HeatedSeatFRRequest set: ", ex);
			}
		},
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				if (typeof(navigator.vehicle) !== "undefined") {
					navigator.vehicle.heatedSeatFRRequest.get(zone).then(function (value) {
								GlobalSelf._mappingTable["HeatedSeatFRRequest"].curValue = value.value;
							},
							function (error) {
								console.log("AMB: There was an error on the HeatedSeatFRRequest get: " + error);
							});
				}
			} catch (ex) {
				console.log("AMB: There was an error on the HeatedSeatFRRequest get: " + ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.heatedSeatFRRequest.subscribe(function (speed) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the HeatedSeatFRRequest subscribe: ", ex);
			}
		}
	},

	"HeatedSeatFLModeRequest" : {
		propertyName : "HeatedSeatFLModeRequest",
		callBackPropertyName : "HeatedSeatFLModeRequest",
		subscribeName : "HeatedSeatFLModeRequest",
		zone : "000000"
	},

	"HeatedSeatFLRequest" : {
		propertyName : "HeatedSeatFLRequest",
		callBackPropertyName : "HeatedSeatFLRequest",
		subscribeName : "HeatedSeatFLRequest",
		zone : "000000",
		setFunction : function(val) {
			"use strict";
			try {
				var zone = new Zone([]);
				if (logit) {
					console.log("AMB: called HeatedSeatFLRequest set with value " + val);
				}
				// Must change this to different access method: curValue = val;
				navigator.vehicle.heatedSeatFLRequest.set({"HeatedSeatFLRequest": val}, zone).then(
						function () {
							if (logit) {
								console.log("AMB: HeatedSeatFLRequest set success.");
							}
						},
						function (failure) {
							console.log("AMB: There was an error on the HeatedSeatFLRequest set: " + failure);
						}
				);
			} catch (ex) {
				console.log("AMB: There was an error on the HeatedSeatFLRequest set: ", ex);
			}
		},
		getFunction : function() {
			"use strict";
			try {
				var zone = new Zone([]);
				if (typeof(navigator.vehicle) !== "undefined") {
					navigator.vehicle.heatedSeatFLRequest.get(zone).then(function (value) {
								GlobalSelf._mappingTable["HeatedSeatFLRequest"].curValue = value.value;
							},
							function (error) {
								console.log("AMB: There was an error on the HeatedSeatFLRequest get: " + error);
							});
				}
			} catch (ex) {
				console.log("AMB: There was an error on the HeatedSeatFLRequest get: " + ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.heatedSeatFLRequest.subscribe(function (speed) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the HeatedSeatFLRequest subscribe: ", ex);
			}
		}
	},

	"FLHSDistrCmd" : {
		propertyName : "FLHSDistrCmd",
		callBackPropertyName : "FLHSDistrCmd",
		subscribeName : "FLHSDistrCmd",
		zone : "000000",
		curValue: 0,
		setFunction : function(val) {
			"use strict";
			try {
				var zone = new Zone([]);
				// Must change this to different access method: curValue = val;
				navigator.vehicle.fLHSDistrCmd.set({"FLHSDistrCmd": val}, zone).then(
						function () {
							if (logit) {
								console.log("AMB: FLHSDistrCmd set success.");
							}
						},
						function (failure) {
							console.log("AMB: There was an error on the FLHSDistrCmd set: " + failure);
						}
				);
			} catch (ex) {
				console.log("AMB: There was an error on the FLHSDistrCmd set: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.fLHSDistrCmd.subscribe(function (speed) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the FLHSDistrCmd subscribe: ", ex);
			}
		}
	},

	"FRHSDistrCmd" : {
		propertyName : "FRHSDistrCmd",
		callBackPropertyName : "FRHSDistrCmd",
		subscribeName : "FRHSDistrCmd",
		zone : "000000",
		curValue: 0,
		setFunction : function(val) {
			"use strict";
			try {
				var zone = new Zone([]);
				// Must change this to different access method: curValue = val;
				navigator.vehicle.fRHSDistrCmd.set({"FRHSDistrCmd": val}, zone).then(
						function () {
							if (logit) {
								console.log("AMB: FRHSDistrCmd set success.");
							}
						},
						function (failure) {
							console.log("AMB: There was an error on the FRHSDistrCmd set: " + failure);
						}
				);
			} catch (ex) {
				console.log("AMB: There was an error on the FRHSDistrCmd set: ", ex);
			}
		},
		subscribeFunction : function() {
			"use strict";
			try {
				navigator.vehicle.fRHSDistrCmd.subscribe(function (speed) {
				});
			} catch (ex) {
				console.log("AMB: There was an error on the FRHSDistrCmd subscribe: ", ex);
			}
		}
	}
};

/**
 * This method adds listener object for car events. Object should define function callbacks taking signal names from mapping table, e.g.:
 * @example
 *     {
 *        onBatteryChange: function(newValue, oldValue) {}
 *     }
 * Methods are called back with new and last known values.
 * @method addListener
 * @param callback {Object} object with callback functions.
 * @return {Integer} WatchID for later removal of listener.
 */
var cbID=0; // For use by testFunc().

CarIndicator.prototype.addListener = function(aCallbackObject) {
	"use strict";
	var id = Math.floor(Math.random() * 1000000);
	cbID = id; // For use by testFunc().

	var self = this;
	GlobalSelf = this;
	this._listeners[id] = aCallbackObject;
	this._listenerIDs.push(id);
	var subscribeCallback = function(data) {
		self.onDataUpdate(data, self);
	};


	/* Example entry in _mappingTable:
	 * 	"VehicleSpeed" : {
		propertyName : "VehicleSpeed",
		callBackPropertyName : "speed",

		in aCallbackObject:
		    onSpeedChanged : function(newValue) {
            dashBoardIndicator.onSpeedChanged(newValue);

		Outer tag (in this case "VehicleSpeed") needs to match the property name.
	 */
	for ( var i in aCallbackObject) {
		if (aCallbackObject.hasOwnProperty(i)) {
			var prop = i.replace("on", "").replace("Changed", "");  /* prop goes from "onSpeedChanged" to "Speed". */

			for ( var signal in this._mappingTable) {		/* signal will have the top level name in the object, such as  "VehicleSpeed". */
				if (this._mappingTable.hasOwnProperty(signal)) {
					var mapping = this._mappingTable[signal];
					var zone = parseInt(mapping.zone, 2);
					var subscribeName = signal;

					if (mapping.subscribeName !== undefined) {
						subscribeName = mapping.subscribeName;
					}
				//	console.log("AMB: subscribe loop for: "+signal);
					if (mapping.callBackPropertyName.toLowerCase() === prop.toLowerCase() && !mapping.subscribeCount) {
						mapping.subscribeCount = typeof (mapping.subscribeCount) === 'undefined' ? 0 : mapping.subscribeCount++;
				//		if (typeof (tizen) !== 'undefined') {
							console.log(tizen);

							if (!(subscribeName.toString().trim().toLowerCase() === "nightmode" && id === this._listenerIDs[0]))
							{
								var setUpData = 0;//tizen.vehicle.get(subscribeName, zone);

								// New XW API subscribe call:
								if( mapping.subscribeFunction !== undefined)
								{
									mapping.subscribeFunction();
									var tag = signal.toString();
									// Create an object containing the zone, signal name, and signal value, in a format that onDataUpdate can parse:
									var o = {zone: '000000', signalAndValue: { signalName: signal, signalVal: mapping.curValue }  };
									if(logit) { console.log("AMB: calling subscribeFunction and onUpdate for "+signal.toString()+" "+ mapping.curValue+" id: "+id); }

									self.onDataUpdate(o, self, id);
								}
								else
								{
									console.log("AMB: no subscribe function for "+signal);
								}
								// WRT: self.onDataUpdate(setUpData, self, id);
							}
							else
							{
								console.log("AMB: subscribeFunc undef for "+signal.toString());
							}

							//TODO: tizen.vehicle.subscribe(subscribeName, subscribeCallback, zone);
			//			} else {
			//				console.warn("AMB: Tizen API is not available, cannot subscribe to signal", signal);
			//			}

					}
				}
			}
		}
	}
	console.log("addListener End");
	return id;
};
/**
 * This method is call as callback if data oon tizen.vehicle was change onDataUpdate
 * @method onDataUpdate
 * @param data {object} object whit new data.
 * @param self {object} this carIndicator Object.
 * @param lisenersID {int} id of listener.
 */
CarIndicator.prototype.onDataUpdate = function(data, self, lisenersID) {
	"use strict";
	if (data !== undefined) {
	// ORG: 	var zone = "2";//data.zone.toString(2);
		var zone = data.zone.toString(2);
		var mapping;

		for ( var property in data) {
			if (data.hasOwnProperty(property)) {

				mapping = undefined;
				if (property !== "time" && property !== "zone" && property.search("Sequence") === -1) {

					for ( var element in self._mappingTable) {
						if (self._mappingTable.hasOwnProperty(element)) {

							// ORG: if (self._mappingTable[element].propertyName.toLowerCase() === property.toLowerCase()) {
							if(typeof(property) !== 'undefined')
							{
							//	console.log("AMB: onUpdate upper compare: "+self._mappingTable[element].propertyName+" "+data[property].signalName);
							  if (self._mappingTable[element].propertyName.toLowerCase() === data[property].signalName.toLowerCase()) {

								/* jshint bitwise: false */
								if (!(zone ^ self._mappingTable[element].zone)) {
									/* jshint bitwise: true */

									mapping = self._mappingTable[element];
									 if(logit) { console.log("AMB: onDataUpdate mapping for "+self._mappingTable[element].propertyName+", "+data[property].signalName); }
									break;
								}
							  }
							}
							else
							{
								console.log("AMB: onDataUpdate property undefined. ");
								return;
							}
						}
						else
						{
							console.log("AMB: onDataUpdate self._mappingTable.hasOwnProperty(element) fails "+element);
						}
					}

					if (typeof (mapping) !== 'undefined') {

							var value = data[property].signalVal;
							value = mapping.conversionFunction ? mapping.conversionFunction(value) : value;

							var oldValue = self.status[mapping.callBackPropertyName];
							//console.log("AMB: onDataUpdate value, oldvalue: "+value +" "+oldValue);

						    if (oldValue !== value || data[property].signalName.toUpperCase() === "nightMode".toUpperCase()) {

						    if(logit) { console.info("AMB property '" + data[property].signalName + "' has changed to new value:" + value); }
							self.status[mapping.callBackPropertyName] = value;

							var callbackName = "on" + mapping.callBackPropertyName[0].toUpperCase() + mapping.callBackPropertyName.substring(1) + "Changed";
							var listener;

							if (lisenersID !== undefined) {
								listener = self._listeners[lisenersID];

								if (typeof (listener[callbackName]) === 'function') {
									try {
										if(logit) { console.log("AMB: about to call onUpdate cb name: "+callbackName+" id: "+lisenersID); }
										listener[callbackName](value, oldValue);
									} catch (ex) {
										console.error("Error occured during executing listener: ", ex);
									}
								}
							} else {
								for ( var i in self._listeners) {
									if (self._listeners.hasOwnProperty(i)) {
										listener = self._listeners[i];

										if (typeof (listener[callbackName]) === 'function') {
											try {
												listener[callbackName](value, oldValue);
											} catch (ex) {
												console.error("Error occured during executing listener: ", ex);
											}
										}
									}
								}
							}
						}

					} else {
						console.warn("AMB: Mapping for property '" + property + "' is not defined");
					}
				}
			}
			else
			{
				console.log("AMB: onDataUpdate does not have own property "+data);
			}
		}
	}
};

/**
 * This method removes previosly added listener object. Use WatchID returned from addListener method.
 * @method removeListener
 * @param aId {Integer} WatchID.
 */
CarIndicator.prototype.removeListener = function(aId) {
	"use strict";
	var listener = this._listeners[aId];

	for ( var i in listener) {
		if (listener.hasOwnProperty(i)) {
			var prop = i.replace("on", "").replace("Changed", "");

			for ( var signal in this._mappingTable) {
				if (this._mappingTable.hasOwnProperty(signal)) {
					var mapping = this._mappingTable[signal];

					if (mapping.subscribeCount === 0) { // Last signal, unscubscribe
						navigator.vehicle.unsubscribe(signal);
						mapping.subscribeCount = undefined;
					} else if (typeof (mapping.subscribeCount) !== 'undefined') {
						mapping.subscribeCount--;
					}
				}
			}
		}
	}

	this._listeners[aId] = undefined;
};

/**
 * status object
 * @property status
 * @type Object
 * @private
 */
CarIndicator.prototype.status = {
	fanSpeed : 0,
	targetTemperatureRight : 0,
	targetTemperatureLeft : 0,
	hazard : false,
	frontDefrost : false,
	rearDefrost : false,
	frontLeftwhell : "",
	frontRightwhell : "",
	rearLeftwhell : "",
	rearRightwhell : "",
	childLock : false,
	frontLights : false,
	rearLights : false,
	fan : false,
	seatHeaterRight : 0,
	seatHeaterLeft : 0,
	airRecirculation : false,
	airflowDirection : 0,
	batteryStatus : 58,
	fullBatteryRange : 350,
	outsideTemp : 74.2,
	insideTemp : 68.2,
	wheelAngle : 0,
	weather : 1,
	avgKW : 0.28,
	speed : 65,
	odoMeter : 75126,
	gear : "D",
	nightMode : false,
	randomize : false,
	exteriorBrightness : 1000
};

/**
 * This method return status object in callback
 * @method getStatus
 * @param callback {function} callback function.
 */
CarIndicator.prototype.getStatus = function(callback) {
	"use strict";
	callback(this.status);
};

/**
 * this method set status for property in tizen.vehicle and status object
 * @method setStatus
 * @param indicator {string} indicator name.
 * @param status {??} ??.
 * @param text_status {string} new status .
 * @param callback {function} callback function.
 */
CarIndicator.prototype.setStatus = function(indicator, newValue, callback, zone) {
	"use strict";
	var mappingElement, mappingProperty;

	for ( var element in this._mappingTable) {
		if (this._mappingTable.hasOwnProperty(element)) {
			mappingProperty = undefined;
			if (this._mappingTable[element].callBackPropertyName.toLowerCase() === indicator.toLowerCase()) {
				mappingElement = this._mappingTable[element];
				mappingProperty = this._mappingTable[element].propertyName;
				break;
			}
		}
	}

	// this.status[indicator] = status === "true";
	if (mappingProperty !== undefined) {
		var objectName = mappingElement.subscribeName;
		var propertyZone = parseInt(mappingElement.zone, 2);
		var propertyValue = {};
		propertyValue[mappingProperty] = newValue;
		propertyValue.zone = propertyZone;

        // TODO: remove this code when either xwalk version of AMB becomes available or HVAC is made to work with Bluemonkey
        var oldValue = this.status[mappingElement.callBackPropertyName];
        if (typeof(oldValue) !== 'undefined' || mappingProperty.toUpperCase() === "nightMode".toUpperCase()) {
           // console.info("AMB property '" + mappingProperty + "' has changed to new value:" + newValue);
            this.status[mappingElement.callBackPropertyName] = newValue;

            var callbackName = "on" + mappingElement.callBackPropertyName[0].toUpperCase() + mappingElement.callBackPropertyName.substring(1) + "Changed";

            for(var l in this._listenerIDs){
            	var listener=this._listeners[this._listenerIDs[l]];

				if (typeof (listener[callbackName]) === 'function')
                	listener[callbackName](newValue);
            }

            /*
            var listener=this._listeners[this._listenerIDs[0]];
            if (typeof (listener[callbackName]) === 'function')
                listener[callbackName](newValue);
            */
        }
        // TODO: remove up to here

		//tizen.vehicle.set(objectName, propertyValue, function(msg) {
		//	console.error("Set error: " + msg);
		//});

        // XW HVAC April 2015: Call the object's setFunction.
        if( this._mappingTable[mappingProperty].setFunction !== undefined)
        {
        	console.log("AMB: calling set2 on "+mappingProperty);
        	this._mappingTable[mappingProperty].setFunction(newValue);
        }
        else
        {
            console.log("AMB: no setFunction defined for "+mappingProperty);
        }
	}
	else
	{
		console.log("TEMP: setStatus indicator not defined: "+indicator);
	}

	if (!!callback) {
		callback();
	}
};


/**
 * Adding this to hold the values of the things in the HVAC ui that aren't part of standard car indicator
 */
CarIndicator.prototype.extras = {
	controlAuto : false,
	defrostMax : false
};

// This function polls AMB properties and sends them to the UI; should not need to do this, but AMB version being used is in
// flux, so revisit this when a "final" AMB version is selected.
var carIndicator = new CarIndicator();

uiUpdateFunc = function() {

	var o;

	if(logit) {console.info("AMB: uiUpdateFunc 11 called.");}

	// If Speed and TyrePressure AMB get calls are failing, try N times then stop filling up the log with error messages.
	if (ambFailCnt > 0) {
		GlobalSelf._mappingTable["VehicleSpeed"].getFunction();
		if(logit) { console.log("AMB: testFunc VehicleSpeed, get rets: " + GlobalSelf._mappingTable["VehicleSpeed"].curValue); }
		o = {zone: '000000', signalAndValue: { signalName: "VehicleSpeed", signalVal: GlobalSelf._mappingTable["VehicleSpeed"].curValue }  };
		GlobalSelf.onDataUpdate(o, GlobalSelf, cbID);

		GlobalSelf._mappingTable["TyrePressureFLMS"].getFunction();
		if(logit) {console.log("AMB: testFunc TyrePressureFLMS, get rets: " + GlobalSelf._mappingTable["TyrePressureFLMS"].curValue); }
		o = {zone: '000000', signalAndValue: { signalName: "TyrePressureFLMS", signalVal: GlobalSelf._mappingTable["TyrePressureFLMS"].curValue }  };
		GlobalSelf.onDataUpdate(o, GlobalSelf, cbID);

		GlobalSelf._mappingTable["TyrePressureFRMS"].getFunction();
		if(logit) { console.log("AMB: testFunc TyrePressureFRMS, get rets: " + GlobalSelf._mappingTable["TyrePressureFRMS"].curValue); }
		o = {zone: '000000', signalAndValue: { signalName: "TyrePressureFRMS", signalVal: GlobalSelf._mappingTable["TyrePressureFRMS"].curValue }  };
		GlobalSelf.onDataUpdate(o, GlobalSelf, cbID);

		GlobalSelf._mappingTable["TyrePressureRLMS"].getFunction();
		if(logit) {console.log("AMB: testFunc TyrePressureRLMS, get rets: " + GlobalSelf._mappingTable["TyrePressureRLMS"].curValue); }
		o = {zone: '000000', signalAndValue: { signalName: "TyrePressureRLMS", signalVal: GlobalSelf._mappingTable["TyrePressureRLMS"].curValue }  };
		GlobalSelf.onDataUpdate(o, GlobalSelf, cbID);

		GlobalSelf._mappingTable["TyrePressureRRMS"].getFunction();
		if(logit) {console.log("AMB: testFunc TyrePressureRRMS, get rets: " + GlobalSelf._mappingTable["TyrePressureRRMS"].curValue); }
		o = {zone: '000000', signalAndValue: { signalName: "TyrePressureRRMS", signalVal: GlobalSelf._mappingTable["TyrePressureRRMS"].curValue }  };
		GlobalSelf.onDataUpdate(o, GlobalSelf, cbID);

		GlobalSelf._mappingTable["ODORollingCount2101"].getFunction();
		if(logit) {console.log("AMB: testFunc ODORollingCount2101, get rets: " + GlobalSelf._mappingTable["ODORollingCount2101"].curValue); }
		o = {zone: '000000', signalAndValue: { signalName: "ODORollingCount2101", signalVal: GlobalSelf._mappingTable["ODORollingCount2101"].curValue }  };
		GlobalSelf.onDataUpdate(o, GlobalSelf, cbID);

		GlobalSelf._mappingTable["FuelLevelIndicatedMS"].getFunction();
		if(logit) {console.log("AMB: testFunc FuelLevelIndicatedMS, get rets: " + GlobalSelf._mappingTable["FuelLevelIndicatedMS"].curValue); }
		o = {zone: '000000', signalAndValue: { signalName: "FuelLevelIndicatedMS", signalVal: GlobalSelf._mappingTable["FuelLevelIndicatedMS"].curValue }  };
		GlobalSelf.onDataUpdate(o, GlobalSelf, cbID);

		GlobalSelf._mappingTable["AmbientTemp"].getFunction();
		if(logit) {console.log("AMB: testFunc AmbientTemp, get rets: " + GlobalSelf._mappingTable["AmbientTemp"].curValue); }
		o = {zone: '000000', signalAndValue: { signalName: "AmbientTemp", signalVal: GlobalSelf._mappingTable["AmbientTemp"].curValue }  };
		GlobalSelf.onDataUpdate(o, GlobalSelf, cbID);

		GlobalSelf._mappingTable["DistanceToEmpty"].getFunction();
		if(logit) {console.log("AMB: testFunc DistanceToEmpty, get rets: " + GlobalSelf._mappingTable["DistanceToEmpty"].curValue); }
		o = {zone: '000000', signalAndValue: { signalName: "DistanceToEmpty", signalVal: GlobalSelf._mappingTable["DistanceToEmpty"].curValue }  };
		GlobalSelf.onDataUpdate(o, GlobalSelf, cbID);

		GlobalSelf._mappingTable["InCarTemp"].getFunction();
		if(logit) {console.log("AMB: testFunc InCarTemp, get rets: " + GlobalSelf._mappingTable["InCarTemp"].curValue); }
		o = {zone: '000000', signalAndValue: { signalName: "InCarTemp", signalVal: GlobalSelf._mappingTable["InCarTemp"].curValue }  };
		GlobalSelf.onDataUpdate(o, GlobalSelf, cbID);
	}
	else if(ambFailCnt == 0)
	{
		console.log("AMB system not running; check installation, and that ambd is running.");
		ambFailCnt = -1;
	}

};

var uiUpdateTimer = setInterval(uiUpdateFunc, 2000);
