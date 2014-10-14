/* Copyright (C) Jaguar Land Rover - All Rights Reserved
 *
 * Proprietary and confidential
 * Unauthorized copying of this file, via any medium, is strictly prohibited
 *
 * THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 * KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 * PARTICULAR PURPOSE.
 *
 * Filename:  JLRCameras.api.js
 * Version:              1.0.2
 * Date:                 March 2014
 * Project:              JLR POC - Cameras
 * Contributors:         -
 *                       
 *
 * Incoming Code:        -
 *
 */

/**
 * @class
 * Javascript JLRCameras.api object, which provides API to
 *  to access JLRCameras WRT plugin.
 */
JLRCameras.api = {
    
    /** 
     * This method enables camera feed.
     *
     * @method enableCamera
     * @param cameraID {Integer} camera ID.
     * @param port {Integer} TCP port number.
     * @return {Integer} error code.
     */
    enableCamera : function(cameraID, port) {
        return tizen.cameras.startCameraStreamingServer(cameraID, port);
    },

    /** 
     * This method disables camera feed.
     *
     * @method disableCamera
     * @param cameraID {Integer} camera ID.
     * @return {Integer} error code.
     */
    disableCamera : function(cameraID) {
         return tizen.cameras.stopCameraStreamingServer(cameraID);
    },

    /** 
     * This method subscribes signals, emitted by the JLRCMSS.
     *
     * @method setCamerasListener
     * @param signalName {string} name of the signal to subscribe on.
     * @param signalHandler {function(cameraID, status)} Callback function is invoked when the signal is emitted.
     * @return {Integer} error code.
     */
    setCamerasListener : function(signalName, signalHandler) {
        return tizen.cameras.subscribe(signalName, signalHandler);
    },
    
    /** 
     * This method returns signal status of camera.
     *
     * @method getCameraStatus
     * @param cameraID {Integer} camera ID.
     * @return {Integer} camera signal status.
     */
    getCameraStatus : function(cameraID) {
        return tizen.cameras.getCameraStatus(cameraID);
    }
    
}

