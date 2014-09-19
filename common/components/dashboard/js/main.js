/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*global Bootstrap, dashBoardControler */

/** 
 * DashBoard application show information about vehicle from [tizen.vehicle API](https://raw.github.com/otcshare/automotive-message-broker/master/docs/amb.idl).
 * Uses mainly {{#crossLink "CarIndicator"}}{{/crossLink}} module from {{#crossLink "Bootstrap/carIndicator:property"}}{{/crossLink}}. Dashboard application uses following
 * AMB properties to show car data in display only mode:
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
 *
 *
 * Hover and click on elements in images below to navigate to components of Home screen application.
 *
 * <img id="Image-Maps_1201312180420487" src="../assets/img/dashboard.png" usemap="#Image-Maps_1201312180420487" border="0" width="649" height="1152" alt="" />
 *   <map id="_Image-Maps_1201312180420487" name="Image-Maps_1201312180420487">
 *     <area shape="rect" coords="0,0,573,78" href="../classes/TopBarIcons.html" alt="top bar icons" title="Top bar icons" />
 *     <area shape="rect" coords="0,77,644,132" href="../classes/Clock.html" alt="clock" title="Clock"    />
 *     <area shape="rect" coords="0,994,644,1147" href="../classes/BottomPanel.html" alt="bottom panel" title="Bottom panel" />
 *     <area shape="rect" coords="573,1,644,76" href="../modules/Settings.html" alt="Settings" title="Settings" />
 *     <area  shape="rect" coords="21,132,90,194" alt="Day/Night mode" title="Day/Night mode" target="_self" href="../classes/dashBoardControler.html#method_onNightModeChanged"     >
 *     <area  shape="rect" coords="415,128,648,173" alt="Exterior Brightness" title="Exterior Brightness" target="_self" href="../classes/dashBoardControler.html#method_onExteriorBrightnessChanged"     >
 *     <area  shape="rect" coords="372,173,638,279" alt="Weather" title="Weather" target="_self" href="../classes/dashBoardControler.html#method_onWeatherChanged"     >
 *     <area  shape="rect" coords="21,196,348,292" alt="Battery Level" title="Battery Level" target="_self" href="../classes/dashBoardControler.html#method_onBatteryStatusChanged"     >
 *     <area  shape="rect" coords="193,395,451,477" alt="Wheel radius" title="Wheel radius" target="_self" href="../classes/dashBoardControler.html#method_onWheelAngleChanged"     >
 *     <area  shape="rect" coords="224,320,425,398" alt="Front lights status" title="Front lights status" target="_self" href="../classes/dashBoardControler.html#method_onFrontLightsChanged"     >
 *     <area  shape="rect" coords="472,509,557,541" alt="Speed" title="Speed" target="_self" href="../classes/dashBoardControler.html#method_onSpeedChanged"     >
 *     <area  shape="rect" coords="556,509,613,558" alt="Transmission Gear" title="Transmission Gear" target="_self" href="../classes/dashBoardControler.html#method_onGearChanged"     >
 *     <area  shape="rect" coords="34,564,215,664" alt="Child lock status" title="Child lock status" target="_self" href="../classes/dashBoardControler.html#method_onChildLockChanged"     >
 *     <area  shape="rect" coords="9,904,212,940" alt="Average KW" title="Average KW" target="_self" href="..//classes/dashBoardControler.html#method_onAvgKWChanged"     >
 *     <area  shape="rect" coords="11,937,200,962" alt="Battery range" title="Battery range" target="_self" href="../classes/dashBoardControler.html#method_onBatteryRangeChanged"     >
 *     <area  shape="rect" coords="477,540,556,562" alt="Odometer" title="Odometer" target="_self" href="../classes/dashBoardControler.html#method_onOdoMeterChanged"     >
 *     <area  shape="rect" coords="204,767,441,805" alt="Rear lights" title="Rear lights" target="_self" href="../classes/dashBoardControler.html#method_onRearLightsChanged"     >
 *     <area  shape="rect" coords="205,823,442,861" alt="Break lights" title="Break lights" target="_self" href="../classes/dashBoardControler.html#method_onBreakLightsChanged"     >
 *     <area  shape="rect" coords="27,332,188,410" alt="Left front tire pressure" title="Left front tire pressure" target="_self" href="../classes/dashBoardControler.html#method_onTirePressureLeftFrontChanged"     >
 *     <area  shape="rect" coords="447,304,608,382" alt="Right front tire pressure" title="Right front tire pressure" target="_self" href="../classes/dashBoardControler.html#method_onTirePressureRightFrontChanged"     >
 *     <area  shape="rect" coords="18,676,179,754" alt="Left rear tire pressure" title="Left rear tire pressure" target="_self" href="../classes/dashBoardControler.html#method_onTirePressureLeftRearChanged"     >
 *     <area  shape="rect" coords="458,677,621,752" alt="Right rear tire pressure" title="Right rear tire pressure" target="_self" href="../classes/dashBoardControler.html#method_onTirePressureRightRearChanged"     >
 *   </map>
 * @module DashboardApplication
 * @main DashboardApplication
 * @class Dashboard
 */

/**
 * Reference to instance of dashBoardIndicator this class manage graphics elements on dasboard
 * @property dashBoardIndicator {dashBoardIndicator}
 */
var dashBoardIndicator;

/**
 * Reference to instance of bootstrap class this class help booting  theme , config and carIndicator
 * @property bootstrap {Bootstrap}
 * @private
 */
var bootstrap;

/** 
 * Method initializes user interface and create events listeners for status indicators. 
 * @method init
 */
var init = function () {
    "use strict";
    dashBoardIndicator = new dashBoardControler();
    bootstrap = new Bootstrap(function (status) {
        $('#clockElement').ClockPlugin('init', 60);
        $('#clockElement').ClockPlugin('startTimer');

        $('#bottomPanel').bottomPanel('init');
        $("#topBarIcons").topBarIconsPlugin('init');

        bootstrap.carIndicator.addListener({
            /* this si for steeringWheel game controler */
            onSteeringWheelAngleChanged : function(newValue){
                dashBoardIndicator.onWheelAngleChanged(newValue,bootstrap.carIndicator.status);
            },
            onWheelBrakeChanged : function(newValue){
                dashBoardIndicator.onBreakLightsChanged(newValue);
            },
            /* end steeringWheel game controler*/
            onTirePressureLeftFrontChanged : function (newValue){
                dashBoardIndicator.onTirePressureLeftFrontChanged(newValue);
            },
            onTirePressureRightFrontChanged : function (newValue){
                dashBoardIndicator.onTirePressureRightFrontChanged(newValue);
            },
            onTirePressureLeftRearChanged : function (newValue){
                dashBoardIndicator.onTirePressureLeftRearChanged(newValue);
            },
            onTirePressureRightRearChanged : function (newValue){
                dashBoardIndicator.onTirePressureRightRearChanged(newValue);
            },
            onChildLockChanged : function(newValue){
                dashBoardIndicator.onChildLockChanged(newValue);
            },
            onFrontLightsChanged : function(newValue){
                dashBoardIndicator.onFrontLightsChanged(newValue);
            },
            onRearLightsChanged : function(newValue){
                dashBoardIndicator.onRearLightsChanged(newValue);
            },
            onBatteryStatusChanged : function(newValue) {
                dashBoardIndicator.onBatteryStatusChanged(newValue,bootstrap.carIndicator.status);
            },
            onFullBatteryRange : function(newValue) {
                dashBoardIndicator.onBatteryRangeChanged(newValue,bootstrap.carIndicator.status);
            },
            onOutsideTempChanged : function(newValue) {
               dashBoardIndicator.onOutsiteTempChanged(newValue);
            },
            onInsideTempChanged : function(newValue) {
                dashBoardIndicator.onInsideTempChanged(newValue);
            },
            onWheelAngleChanged : function(newValue){
                dashBoardIndicator.onWheelAngleChanged(newValue,bootstrap.carIndicator.status);
            },
            onWeatherChanged : function(newValue){
                dashBoardIndicator.onWeatherChanged(newValue);
            },
            onSpeedChanged : function(newValue) {
                dashBoardIndicator.onSpeedChanged(newValue);
            },
            onOdoMeterChanged : function(newValue){
                dashBoardIndicator.onOdoMeterChanged(newValue);
            },
            onGearChanged : function(newValue){
                dashBoardIndicator.onGearChanged(newValue);
            },
            onRandomizeChanged : function(newValue) {
                dashBoardIndicator.onRandomizerChanged(newValue);
            },
            onNightModeChanged : function(newValue) {
                dashBoardIndicator.onNightModeChanged(newValue);
            },
            onExteriorBrightnessChanged : function(newValue) {
                dashBoardIndicator.onExteriorBrightnessChanged(newValue);
            },
            onAvgKWChanged : function(newValue) {
                dashBoardIndicator.onAvgKWChanged(newValue);
            }
        });
    });
};

$(document).ready(init);
