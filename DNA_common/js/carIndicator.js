/*
 * Copyright (c) 2014, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
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
			var zone = new Zone([]);
			 tizen.vehicle.steeringWheelAngle.get(zone).then(function(steeringWheelAngle) 
			 {
				 var value2 = steeringWheelAngle.value;
				 // TODO: add != 0 conditional, or a try/catch.
				 GlobalSelf._mappingTable["SteeringWheelAngle"].curValue = steeringWheelAngle.value;
			     console.log("AMB: steeringWheelAngle  get sees value as: " + steeringWheelAngle.value);
			 },
			 function(error) {
			  console.log("AMB: There was an error on the steeringWheelAngle get.");
			 });	
		},
		subscribeFunction : function() { 
			"use strict";
			console.log("AMB: in steeringWheelAngle steeringWheelAngle subscribeFunc.");
			tizen.vehicle.steeringWheelAngle.subscribe(function(steeringWheelAngle) {
				console.log("AMB steeringWheelAngle  changed to: " + steeringWheelAngle.value);
		//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);
		  
			});
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
			var zone = new Zone([]);
			 tizen.vehicle.yawRate.get(zone).then(function(YawRate) 
			 {
				 var value2 = YawRate.value;
				 // TODO: add != 0 conditional, or a try/catch.
				 GlobalSelf._mappingTable["YawRate"].curValue = YawRate.value;
			     console.log("AMB: YawRate  get sees value as: " + YawRate.value);
			 },
			 function(error) {
			  console.log("AMB: There was an error on the YawRate get.");
			 });	
		},
		subscribeFunction : function() { 
			"use strict";
			console.log("AMB: in YawRate steeringWheelAngle subscribeFunc.");
			tizen.vehicle.yawRate.subscribe(function(YawRate) {
				console.log("AMB steeringWheelAngle  changed to: " + YawRate.value);
		//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);
		  
			});
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
				var zone = new Zone([]);
				 tizen.vehicle.wheelBrake.get(zone).then(function(WheelBrake) 
				 {
					 var value2 = WheelBrake.value;
					 // TODO: add != 0 conditional, or a try/catch.
					 GlobalSelf._mappingTable["WheelBrake"].curValue = WheelBrake.value;
				     console.log("AMB: WheelBrake  get sees value as: " + WheelBrake.value);
				 },
				 function(error) {
				  console.log("AMB: There was an error on the WheelBrake get.");
				 });	
			},
			subscribeFunction : function() { 
				"use strict";
				console.log("AMB: in WheelBrake steeringWheelAngle subscribeFunc.");
				tizen.vehicle.wheelBrake.subscribe(function(WheelBrake) {
					console.log("AMB WheelBrake  changed to: " + WheelBrake.value);
			//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);
			  
				});
			}
	},
	
	/* end steeringWheel game controler*/
	"TirePressureLeftFront" : {
//		propertyName : "leftFront",
		propertyName : "TirePressureLeftFront",
		callBackPropertyName : "tirePressureLeftFront",
	//	subscribeName : "TirePressureLeftFront",
		conversionFunction : parseTirePressure,
		zone : "000000",
		curValue: 0,
		getFunction : function() { 
			"use strict";
			var zone = new Zone([]);
			 tizen.vehicle.tirePressure.get(zone).then(function(tirePressure) 
			 {
				 var value2 = tirePressure.value;
				 // TODO: add != 0 conditional, or a try/catch.
				 GlobalSelf._mappingTable["TirePressureLeftFront"].curValue = tirePressure.value;
			     console.log("AMB: TirePressureLeftFront  get sees value as: " + tirePressure.value);
			 },
			 function(error) {
			  console.log("AMB: There was an error on the TirePressureLeftFront get.");
			 });	
		},
		subscribeFunction : function() { 
			"use strict";
			console.log("AMB: in TirePressureLeftFront  subscribeFunc.");
			tizen.vehicle.tirePressure.subscribe(function(tirePressure) {
				console.log("AMB TirePressureLeftFront  changed to: " + tirePressure.value);
		//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);
		  
			});
		}
	},
	"TirePressureRightFront" : {
		propertyName : "TirePressureRightFront",
		callBackPropertyName : "tirePressureRightFront",
	//	subscribeName : "TirePressure",
		conversionFunction : parseTirePressure,
		zone : "000000",
		curValue: 0,
		getFunction : function() { 
			"use strict";
			var zone = new Zone([]);
			 tizen.vehicle.tirePressure.get(zone).then(function(tirePressure) 
			 {
				 var value2 = tirePressure.value;
				 // TODO: add != 0 conditional, or a try/catch.
				 GlobalSelf._mappingTable["TirePressureReftFront"].curValue = tirePressure.value;
			     console.log("AMB: TirePressureReftFront  get sees value as: " + tirePressure.value);
			 },
			 function(error) {
			  console.log("AMB: There was an error on the TirePressureReftFront get.");
			 });	
		},
		subscribeFunction : function() { 
			"use strict";
			console.log("AMB: in TirePressureReftFront  subscribeFunc.");
			tizen.vehicle.tirePressure.subscribe(function(tirePressure) {
				console.log("AMB TirePressureReftFront  changed to: " + tirePressure.value);
		//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);
		  
			});
		}
	},
	"TirePressureLeftRear" : {
		propertyName : "TirePressureLeftRear",
		callBackPropertyName : "tirePressureLeftRear",
	//	subscribeName : "TirePressure",
		conversionFunction : parseTirePressure,
		zone : "000000",
		curValue: 0,
		getFunction : function() { 
			"use strict";
			var zone = new Zone([]);
			 tizen.vehicle.tirePressure.get(zone).then(function(tirePressure) 
			 {
				 var value2 = tirePressure.value;
				 // TODO: add != 0 conditional, or a try/catch.
				 GlobalSelf._mappingTable["TirePressureLeftRear"].curValue = tirePressure.value;
			     console.log("AMB: TirePressureLeftRear  get sees value as: " + tirePressure.value);
			 },
			 function(error) {
			  console.log("AMB: There was an error on the TirePressureLeftRear get.");
			 });	
		},
		subscribeFunction : function() { 
			"use strict";
			console.log("AMB: in TirePressureLeftRear  subscribeFunc.");
			tizen.vehicle.tirePressure.subscribe(function(tirePressure) {
				console.log("AMB TirePressureLeftRear  changed to: " + tirePressure.value);
		//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);
		  
			});
		}
	},
	"TirePressureRightRear" : {
		propertyName : "TirePressureRightRear",
		callBackPropertyName : "tirePressureRightRear",
		subscribeName : "TirePressure",
		conversionFunction : parseTirePressure,
		zone : "000000",
		curValue: 0,
		getFunction : function() { 
			"use strict";
			var zone = new Zone([]);
			 tizen.vehicle.tirePressure.get(zone).then(function(tirePressure) 
			 {
				 var value2 = tirePressure.value;
				 // TODO: add != 0 conditional, or a try/catch.
				 GlobalSelf._mappingTable["TirePressureRightRear"].curValue = tirePressure.value;
			     console.log("AMB: TirePressureRightRear  get sees value as: " + tirePressure.value);
			 },
			 function(error) {
			  console.log("AMB: There was an error on the TirePressureRightRear get.");
			 });	
		},
		subscribeFunction : function() { 
			"use strict";
			console.log("AMB: in TirePressureRightRear  subscribeFunc.");
			tizen.vehicle.tirePressure.subscribe(function(tirePressure) {
				console.log("AMB TirePressureRightRear  changed to: " + tirePressure.value);
		//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);
		  
			});
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
			var zone = new Zone([]);
			 tizen.vehicle.ChildLockStatus.get(zone).then(function(childLock) 
			 {
				 var value2 = tirePressure.value;
				 // TODO: add != 0 conditional, or a try/catch.
				 GlobalSelf._mappingTable["ChildLock"].curValue = childLock.value;
			     console.log("AMB: childLock  get sees value as: " + childLock.value);
			 },
			 function(error) {
			  console.log("AMB: There was an error on the childLock get.");
			 });	
		},
		subscribeFunction : function() { 
			"use strict";
			console.log("AMB: in childLock  subscribeFunc.");
			tizen.vehicle.childLockStatus.subscribe(function(childLock) {
				console.log("AMB childLock  changed to: " + childLock.value);
		//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);
		  
			});
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
		propertyName : "AirflowDirection",
		callBackPropertyName : "airflowDirection",
		subscribeName : "HVAC",
		conversionFunction : parseInteger,
		zone : "000000"
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
/* 	"Exterior" : { */
 	"ExteriorTemperature" : { 
		propertyName : "ExteriorTemperature",
		callBackPropertyName : "outsideTemp",
//		subscribeName : "ExteriorTemperature",
		conversionFunction : parseInteger,
		zone : "000000",
		curValue: 0,
		getFunction : function() { 
			"use strict";
			var zone = new Zone([]);
			 tizen.vehicle.AmbientTempQF.get(zone).then(function(temp) 
			 {
				 var value2 = tirePressure.value;
				 // TODO: add != 0 conditional, or a try/catch.
				 GlobalSelf._mappingTable["ExteriorTemperature"].curValue = temp.value;
			     console.log("AMB: ExteriorTemperature  get sees value as: " + temp.value);
			 },
			 function(error) {
			  console.log("AMB: There was an error on the ExteriorTemperature get.");
			 });	
		},
		subscribeFunction : function() { 
			"use strict";
			console.log("AMB: in ExteriorTemperature  subscribeFunc.");
			tizen.vehicle.InCarTemp.subscribe(function(temp) {
				console.log("AMB ExteriorTemperature  changed to: " + temp.value);
		//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);
		  
			});
		}
	},
/*	"Interior" : { */
	"InCarTemp" : {
		propertyName : "InCarTemp",
		callBackPropertyName : "insideTemp",
//		subscribeName : "InteriorTemperature",
		conversionFunction : parseInteger,
		zone : "000000",
		curValue: 0,
		getFunction : function() { 
			"use strict";
			var zone = new Zone([]);
			 tizen.vehicle.InCarTemp.get(zone).then(function(temp) 
			 {
				 var value2 = tirePressure.value;
				 // TODO: add != 0 conditional, or a try/catch.
				 GlobalSelf._mappingTable["InCarTemp"].curValue = temp.value;
			     console.log("AMB: InCarTemp  get sees value as: " + temp.value);
			 },
			 function(error) {
			  console.log("AMB: There was an error on the InCarTemp get.");
			 });	
		},
		subscribeFunction : function() { 
			"use strict";
			console.log("AMB: in InCarTemp  subscribeFunc.");
			tizen.vehicle.InCarTemp.subscribe(function(temp) {
				console.log("AMB InCarTemp  changed to: " + temp.value);
		//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);
		  
			});
		}
	},
	"FuelLevelIndicatedMS" : {
		propertyName : "FuelLevelIndicatedMS",
		callBackPropertyName : "FuelLevel",
//		subscribeName : "InteriorTemperature",
		conversionFunction : parseInteger,
		zone : "000000",
		curValue: 0,
		getFunction : function() { 
			"use strict";
			var zone = new Zone([]);
			 tizen.vehicle.FuelLevelIndicatedMS.get(zone).then(function(level) 
			 {
				 // TODO: add != 0 conditional, or a try/catch.
				 GlobalSelf._mappingTable["FuelLevelIndicatedMS"].curValue = FuelLevelIndicatedMS.value;
			     console.log("AMB: FuelLevelIndicatedMS  get sees value as: " + FuelLevelIndicatedMS.value);
			 },
			 function(error) {
			  console.log("AMB: There was an error on the FuelLevelIndicatedMS get.");
			 });	
		},
		subscribeFunction : function() { 
			"use strict";
			console.log("AMB: in FuelLevelIndicatedMS  subscribeFunc.");
			tizen.vehicle.InCarTemp.subscribe(function(level) {
				console.log("AMB FuelLevelIndicatedMS  changed to: " + level.value);
		//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);
		  
			});
		}
	},
	"DistanceToEmpty" : {
		propertyName : "DistanceToEmpty",
		callBackPropertyName : "DistanceToEmpty",
//		subscribeName : "InteriorTemperature",
		conversionFunction : parseInteger,
		zone : "000000",
		curValue: 0,
		getFunction : function() { 
			"use strict";
			var zone = new Zone([]);
			 tizen.vehicle.DistanceToEmpty.get(zone).then(function(dist) 
			 {
				 // TODO: add != 0 conditional, or a try/catch.
				 GlobalSelf._mappingTable["DistanceToEmpty"].curValue = DistanceToEmpty.value;
			     console.log("AMB: DistanceToEmpty  get sees value as: " + DistanceToEmpty.value);
			 },
			 function(error) {
			  console.log("AMB: There was an error on the DistanceToEmpty get.");
			 });	
		},
		subscribeFunction : function() { 
			"use strict";
			console.log("AMB: in DistanceToEmpty  subscribeFunc.");
			tizen.vehicle.DistanceToEmpty.subscribe(function(dist) {
				console.log("AMB DistanceToEmpty  changed to: " + dist.value);
		//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);
		  
			});
		}
	},
	"ODORollingCount2101" : {
		propertyName : "ODORollingCount2101",
		callBackPropertyName : "odoMeter",
//		subscribeName : "InteriorTemperature",
		conversionFunction : parseInteger,
		zone : "000000",
		curValue: 0,
		getFunction : function() { 
			"use strict";
			var zone = new Zone([]);
			 tizen.vehicle.ODORollingCount2101.get(zone).then(function(dist) 
			 {
				 // TODO: add != 0 conditional, or a try/catch.
				 GlobalSelf._mappingTable["ODORollingCount2101"].curValue = ODORollingCount2101.value;
			     console.log("AMB: ODORollingCount2101  get sees value as: " + ODORollingCount2101.value);
			 },
			 function(error) {
			  console.log("AMB: There was an error on the ODORollingCount2101 get.");
			 });	
		},
		subscribeFunction : function() { 
			"use strict";
			console.log("AMB: in ODORollingCount2101  subscribeFunc.");
			tizen.vehicle.DistanceToEmpty.subscribe(function(dist) {
				console.log("AMB ODORollingCount2101  changed to: " + dist.value);
		//		vehicle.steeringWheelAngle.unsubscribe(steeringWheelAngle);
		  
			});
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
			var zone = new Zone([]);
			 tizen.vehicle.vehicleSpeed.get(zone).then(function(vehicleSpeed) 
			 {
				 var value2 = vehicleSpeed.speed;
				 // TODO: add != 0 conditional, or a try/catch.
				 GlobalSelf._mappingTable["VehicleSpeed"].curValue = vehicleSpeed.speed;
				 speedCurVal += vehicleSpeed.speed;
			     console.log("AMB: vehicle speed get sees speed as: " + vehicleSpeed.speed);
			 },
			 function(error) {
			  console.log("AMB: There was an error on the speed get.");
			 });	
		},
		subscribeFunction : function() { 
			"use strict";
			console.log("AMB: in vehicleSpeed subscribeFunc.");
			tizen.vehicle.vehicleSpeed.subscribe(function(vehicleSpeed) {
				console.log("AMB vehicle speed changed to: " + vehicleSpeed.speed);
				vehicle.vehicleSpeed.unsubscribe(vehicleSpeedSub);
		  
			});
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
		zone : "000000"
	},
	"DirectionIndicationMS" : {
		propertyName : "DirectionIndicationMS",
		callBackPropertyName : "DirectionIndicationMS",
		subscribeName : "DirectionIndicationMS",
		zone : "000000"
	},
	"ACCommand" : {
		propertyName : "ACCommand",
		callBackPropertyName : "ACCommand",
		subscribeName : "ACCommand",
		zone : "000000"
	},
	"RecircReq" : {
		propertyName : "RecircReq",
		callBackPropertyName : "RecircReq",
		subscribeName : "RecircReq",
		zone : "000000"
	},
	"FrontTSetRightCmd" : {
		propertyName : "FrontTSetRightCmd",
		callBackPropertyName : "FrontTSetRightCmd",
		subscribeName : "FrontTSetRightCmd",
		zone : "000000"
	},
	"FrontTSetLeftCmd" : {
		propertyName : "FrontTSetLeftCmd",
		callBackPropertyName : "FrontTSetLeftCmd",
		subscribeName : "FrontTSetLeftCmd",
		zone : "000000"
	},
	"FrontBlwrSpeedCmd" : {
		propertyName : "FrontBlwrSpeedCmd",
		callBackPropertyName : "FrontBlwrSpeedCmd",
		subscribeName : "FrontBlwrSpeedCmd",
		zone : "000000"
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
		zone : "000000"
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
		zone : "000000"
	},
	"FLHSDistrCmd" : {
		propertyName : "FLHSDistrCmd",
		callBackPropertyName : "FLHSDistrCmd",
		subscribeName : "FLHSDistrCmd",
		zone : "000000"
	},
	"FRHSDistrCmd" : {
		propertyName : "FRHSDistrCmd",
		callBackPropertyName : "FRHSDistrCmd",
		subscribeName : "FRHSDistrCmd",
		zone : "000000"
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
CarIndicator.prototype.addListener = function(aCallbackObject) {
	"use strict";
	var id = Math.floor(Math.random() * 1000000);
	var self = this;
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
					if (mapping.callBackPropertyName.toLowerCase() === prop.toLowerCase() && !mapping.subscribeCount) {
						mapping.subscribeCount = typeof (mapping.subscribeCount) === 'undefined' ? 0 : mapping.subscribeCount++;
						if (typeof (tizen) !== 'undefined') {
							console.log(tizen);

							if (!(subscribeName.toString().trim().toLowerCase() === "nightmode" && id === this._listenerIDs[0])) {
								var setUpData = 0;//tizen.vehicle.get(subscribeName, zone);
								
								// New XW API subscribe call:
								if( mapping.subscribeFunction !== undefined)
								{
									mapping.subscribeFunction();
									var tag = signal.toString();
									// Create an object containing the zone, signal name, and signal value, in a format that onDataUpdate can parse:
									var o = {zone: '000000', signalAndValue: { signalName: signal, signalVal: mapping.curValue }  };
									console.log("AMB: calling subscribeFunction and onUpdate for "+signal.toString()+" "+ mapping.curValue+" id: "+id);

									self.onDataUpdate(o, self, id);	
																	}
								// WRT: self.onDataUpdate(setUpData, self, id);
							}
							else
								{
								console.log("AMB subscribeFunc undef for "+signal.toString());
								}

							//TODO: tizen.vehicle.subscribe(subscribeName, subscribeCallback, zone);
						} else {
							console.warn("Tizen API is not available, cannot subscribe to signal", signal);
						}
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
									console.log("AMB: onDataUpdate mapping for "+self._mappingTable[element].propertyName+", "+data[property].signalName);
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

						    if (oldValue !== value || data[property].signalName.toUpperCase() === "nightMode".toUpperCase()) {
						
							console.info("AMB property '" + data[property].signalName + "' has changed to new value:" + value);
							self.status[mapping.callBackPropertyName] = value;

							var callbackName = "on" + mapping.callBackPropertyName[0].toUpperCase() + mapping.callBackPropertyName.substring(1) + "Changed";
							var listener;

							if (lisenersID !== undefined) {
								listener = self._listeners[lisenersID];

								if (typeof (listener[callbackName]) === 'function') {
									try {
										console.log("AMB: about to call onUpdate cb name: "+callbackName+" id: "+lisenersID);
										listener[callbackName](value, oldValue);
									} catch (ex) {
										console.error("Error occured during executing listener", ex);
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
												console.error("Error occured during executing listener", ex);
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
						tizen.vehicle.unsubscribe(signal);
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
            console.info("AMB property '" + mappingProperty + "' has changed to new value:" + newValue);
            this.status[mappingElement.callBackPropertyName] = newValue;

            var callbackName = "on" + mappingElement.callBackPropertyName[0].toUpperCase() + mappingElement.callBackPropertyName.substring(1) + "Changed";
            var listener=this._listeners[this._listenerIDs[0]];
            if (typeof (listener[callbackName]) === 'function') 
                listener[callbackName](newValue);
        }
        // TODO: remove up to here

		//tizen.vehicle.set(objectName, propertyValue, function(msg) {
		//	console.error("Set error: " + msg);
		//});
	}
    
	if (!!callback) {
		callback();
	}
};

var carIndicator = new CarIndicator();

testFunc = function() {	
	
	console.info("testFunc called.");
//	var mapping = this._mappingTable["VehicleSpeed"];
	
	//mapping.getFunction();	
	this._mappingTable["VehicleSpeed"].getFunction();
	console.log("testFunc call time, get rets: " + GlobalSelf._mappingTable["VehicleSpeed"].curValue +" speedCurVal: "+speedCurVal );
	
	var o = {zone: '000000', VehicleSpeed: GlobalSelf._mappingTable["VehicleSpeed"].curValue};
	GlobalSelf.onDataUpdate(o, GlobalSelf, cbID);	
	
}
