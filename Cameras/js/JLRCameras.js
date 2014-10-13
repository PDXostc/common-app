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
 * Filename:             JLRCameras.js
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
 * @private
 * @enum {number}
 * Supported Camera signal status events list
 */
CAMERA_STATUS_EVENT = {
    UNAVAILABLE: -1,
    CAMERA_SIGNAL_OFF: 0,
    CAMERA_SIGNAL_ON: 1,
};

/**
 * @private
 * @enum {number}
 * Supported Cameras Server states events list
 */
CAMERA_SERVER_STATUS_EVENT = {
    NONE: 0,
    WAITING_FOR_CONNECTION: 1,
    STREAMING: 2,
    SHUTDOWN: 3,
    EMERGENCY_SHUTDOWN: 4
};

/**
 * @private
 * @enum {number}
 * Supported camera's input UI element states list
 */
CAMERA_UI_STATE = {
    VIDEO_LIVE: 0,
    VIDEO_DISABLED: 1,
    WARNING: 2,
    WAITING: 3,
    READY_FOR_REQUEST_CONNECTION: 4
};

/**
 * @private
 * @enum {number}
 * Supported user event list
 */
USER_EVENT = {
    SET_LIVE: 0,
    SET_OFF: 1,
    FLIP: 2,
    BIG_SMALL: 3
};

/** 
 * @class
 * Javascript JLRCameras object, which  is used for initialisation 
 * Cameras application  and storing internal Cameras application logic.
 */
JLRCameras = {
    
    /** 
     * This method starts application components and attaches to JLRCameras WRT plugin.
     * @method startApp
     */
    startApp : function () {

        var selectedToWide, soloView = false;
        var typeCameras = ["ANALOG", "USB", "IP"];
        var currentCamerasPage = typeCameras[0];
        var camerasViewport = {
                "ANALOG" : "2%",
                "USB" : "-100%",
                "IP" : "-199.2%"
            };
        var DEFAULT_BTN = {
                ON_OFF : "enableButton",
                MIRROR : "mirrorOnButton",
                ENLARGE : "dislargeButton"
            };
            
        var cameraArray = [
                            {name:"USB0", active: false},
                            {name:"USB1", active: false},
                            {name:"USB2", active: false},
                            {name:"USB3", active: false},
                            {name:"USB4", active: false},
                            {name:"USB5", active: false},
                            {name:"USB_MAX"},
                            {name:"IP0", active: false},
                            {name:"IP1", active: false},
                            {name:"IP2", active: false},
                            {name:"IP3", active: false},
                            {name:"IP4", active: false},
                            {name:"IP5", active: false},
                            {name:"IP_MAX"},
                            {name:"ANALOG0", active: false},
                            {name:"ANALOG1", active: false},
                            {name:"ANALOG2", active: false},
                            {name:"ANALOG3", active: false}
                          ],
                       
            analogArray = [ {'camera-type':'ANALOG','camera-number':14,port:''},
                            {'camera-type':'ANALOG','camera-number':15,port:''},
                            {'camera-type':'ANALOG','camera-number':16,port:''},
                            {'camera-type':'ANALOG','camera-number':17,port:''}],
        
            usbArray = [{'camera-type':'USB','camera-number':0,port:''},
                        {'camera-type':'USB','camera-number':1,port:''},
                        {'camera-type':'USB','camera-number':2,port:''},
                        {'camera-type':'USB','camera-number':3,port:''},
                        {'camera-type':'USB','camera-number':4,port:''},
                        {'camera-type':'USB','camera-number':5,port:''}],
        
            ipArray = [ {'camera-type':'IP','camera-number':7,port:''},
                        {'camera-type':'IP','camera-number':8,port:''},
                        {'camera-type':'IP','camera-number':9,port:''},
                        {'camera-type':'IP','camera-number':10,port:''},
                        {'camera-type':'IP','camera-number':11,port:''},
                        {'camera-type':'IP','camera-number':12,port:''}];

            
        function setUiElementState(uiElement, newState) {
            uiElement.state = newState;
       }
        
        /** 
         * This method is call as callback when CAMERA_SERVER_STATUS_EVENTs is received
         * @method onReceivedServerEvent
         * @param uiElement {object} UI element assigned to camera feed that event from.
         * @param serverEvent {number} event from Cameras Server states events list.
         */
        function onReceivedServerEvent(uiElement, serverEvent) {
            var prevState = uiElement.state;
            switch(serverEvent)
            {
            case CAMERA_SERVER_STATUS_EVENT.WAITING_FOR_CONNECTION:
                setVideoOn(uiElement.cameraNumber);
                setUiElementState(uiElement, CAMERA_UI_STATE.VIDEO_LIVE);
                setButtonEventHandlers(uiElement, CAMERA_UI_STATE.VIDEO_LIVE);
              break;
            case CAMERA_SERVER_STATUS_EVENT.SHUTDOWN:
                  setVideoOff(uiElement.cameraNumber);
                  setUiElementState(uiElement, CAMERA_UI_STATE.VIDEO_DISABLED);
                  setButtonEventHandlers(uiElement, CAMERA_UI_STATE.VIDEO_DISABLED);
                  break;
            case CAMERA_SERVER_STATUS_EVENT.EMERGENCY_SHUTDOWN:
                  setWarning(uiElement.cameraNumber);
                  setUiElementState(uiElement, CAMERA_UI_STATE.WARNING);
                  setButtonEventHandlers(uiElement, CAMERA_UI_STATE.WARNING);
                  break;
            default:
              break;
            }
            if (prevState == uiElement.state) {
                return false;
            }
            return true;
            
        }

        /** 
         * This method is call as callback when CAMERA_STATUS_EVENTs is received
         * @method onReceivedSignalEvent
         * @param uiElement {object} UI element assigned to camera feed that event from.
         * @param signalEvent {number} event from Camera signal status events list.
         */
        function onReceivedSignalEvent(uiElement, signalEvent) {
            var prevState = uiElement.state;
            switch(signalEvent)
            {
            case CAMERA_STATUS_EVENT.CAMERA_SIGNAL_ON:
              setUiElementState(uiElement, CAMERA_UI_STATE.READY_FOR_REQUEST_CONNECTION); 
              setButtonEventHandlers(uiElement, CAMERA_UI_STATE.READY_FOR_REQUEST_CONNECTION);
              break;
            case CAMERA_STATUS_EVENT.UNAVAILABLE:
            case CAMERA_STATUS_EVENT.CAMERA_SIGNAL_OFF:
              setWarning(uiElement.cameraNumber);
              setUiElementState(uiElement, CAMERA_UI_STATE.WARNING);
              setButtonEventHandlers(uiElement, CAMERA_UI_STATE.WARNING);
              break;
            default:
            }
            if (prevState == uiElement.state) {
                return false;
            }
            return true;
        }
        
        /** 
         * This method is call as callback when USER_EVENTs is received
         * @method onReceivedUserEvent
         * @param uiElement {object} UI element assigned to camera feed that event from.
         * @param userEvent {number} event from user event list.
         */
        function onReceivedUserEvent(uiElement, userEvent) {
            var prevState = uiElement.state;
            switch(userEvent)
            {
            case USER_EVENT.SET_LIVE:
            if(uiElement.state != CAMERA_UI_STATE.VIDEO_LIVE) {
                  var err = requestVideoStream(uiElement);
                  if(err != -1) {
                      setUiElementState(uiElement, CAMERA_UI_STATE.WAITING);
                      setButtonEventHandlers(uiElement, CAMERA_UI_STATE.WAITING);
                  } else {
                      setWarning(uiElement.cameraNumber);
                      setUiElementState(uiElement, CAMERA_UI_STATE.WARNING);
                      setButtonEventHandlers(uiElement, CAMERA_UI_STATE.WARNING);
                  }
              }
              break;
            case USER_EVENT.SET_OFF:
              requestVideoDisable(uiElement.cameraNumber);
              setUiElementState(uiElement, CAMERA_UI_STATE.VIDEO_DISABLED);
              setButtonEventHandlers(uiElement, CAMERA_UI_STATE.VIDEO_DISABLED);
              break;
            case USER_EVENT.FLIP:
                var videoObj = getVideoObj(uiElement.cameraNumber);
                mirrorView(videoObj);
                break;
            case USER_EVENT.BIG_SMALL:
                if(isUiElementLarge(uiElement)){
                  switchToSmall(uiElement);
                } else {
                  switchToLarge(uiElement);
                }
                break;
            default:
            }
            if (prevState == uiElement.state) {
                return false;
            }
            return true;
        }
        
        /** 
         * This method is call if camera's input UI element state is changed
         * @method onStateChangeCompleted
         * @param uiElement {object} UI element assigned to camera feed.
         */
        function onStateChangeCompleted(uiElement) {
            
                if(uiElement.state == CAMERA_UI_STATE.WARNING){
                    setButtonImgs(uiElement,"empty");
                } else if(uiElement.state == CAMERA_UI_STATE.WAITING){
                    //setButtonImgs(uiElement,"video_disabled");
                } else if(uiElement.state == CAMERA_UI_STATE.VIDEO_LIVE){
                    cameraArray[uiElement.cameraNumber].active = true;
                    setButtonImgs(uiElement,"video_stream");
                } else if(uiElement.state == CAMERA_UI_STATE.VIDEO_DISABLED){
                    cameraArray[uiElement.cameraNumber].active = false;
                    setButtonImgs(uiElement,"video_disabled");
                } else if(uiElement.state == CAMERA_UI_STATE.READY_FOR_REQUEST_CONNECTION){
                if (cameraArray[uiElement.cameraNumber].active == true){
                    var err = requestVideoStream(uiElement);
                    if(err != -1) {
                        setUiElementState(uiElement, CAMERA_UI_STATE.WAITING);
                        setButtonEventHandlers(uiElement, CAMERA_UI_STATE.WAITING);
                    } else {
                        setWarning(uiElement.cameraNumber);
                        setUiElementState(uiElement, CAMERA_UI_STATE.WARNING);
                        setButtonEventHandlers(uiElement, CAMERA_UI_STATE.WARNING);
                        setButtonImgs(uiElement,"empty");
                    }
                } else {
                    setVideoOff(uiElement.cameraNumber);
                    setUiElementState(uiElement, CAMERA_UI_STATE.VIDEO_DISABLED);
                    setButtonEventHandlers(uiElement, CAMERA_UI_STATE.VIDEO_DISABLED);
                    setButtonImgs(uiElement,"video_disabled");
                }
            }
        }
        
        
        /** 
         * This method changes viewport to left or right 
         * @method showNextCamerasPage
         * @param direction {Boolean} if true viewport is shift to left? if false to right.
         */
        function showNextCamerasPage(direction) {
            var page = currentCamerasPage;
    
            for (var i_ = 0; i_ < typeCameras.length; i_++) {
                if (typeCameras[i_] === currentCamerasPage) {
                    if (direction && i_ > 0)
                        page = typeCameras[--i_];
                    else if (!direction && i_ < typeCameras.length - 1)
                        page = typeCameras[++i_];
                    
                    break;
                }
            }

            showCameras(page);
            setActiveMenu(page)
            currentCamerasPage = page;
        }
    
        /** 
         * This method sets swipe handler 
         * @method setSwipeHandler
         */
        function setSwipeHandler() {
            var swipedDiv = document.getElementById('swipedDiv');
            var swLength = (swipedDiv && swipedDiv.style.width && swipedDiv.style.height ) ? (parseInt(swipedDiv.style.width) + parseInt(swipedDiv.style.height)) * 0.1 : 100;
            var evtDownX = null;
            swipedDiv.addEventListener('mousedown', function(mouseDownEvt) {
                evtDownX = mouseDownEvt.pageX;
                swipedDiv.addEventListener('mouseup', function(mouseUpEvt) {
                    swipedDiv.removeEventListener('mouseup');
                    if ((evtDownX > 0 ) && (mouseUpEvt.pageX - evtDownX) * (mouseUpEvt.pageX - evtDownX) > swLength * swLength) {
                        showNextCamerasPage((mouseUpEvt.pageX - evtDownX) > 0 ? true : false);
                    }
                    evtDownX = -1;
                });
            });
        }
    
        /** 
         * This method sets application viewport to cameras page with input argument type
         * @param typeName {String} type of cameras page.
         * @method showCameras
         */
        function showCameras(typeName) {
            if(soloView){
                var largeUiElement = document.getElementById('divViewLarge');
                switchToSmall(largeUiElement);
            }
            $('.swipeContainer').css('left', camerasViewport[typeName]);
        }
        
        function getVideoObj(cameraNum) {
            return document.getElementById('itemVideo' + cameraArray[cameraNum].name);
        }
        
        function getMessageObj(cameraNum) {
            return document.getElementById('itemMessage' + cameraArray[cameraNum].name);
        }
    
        /** 
         * This method is call as callback when CAMERA_SERVER_STATUS_EVENTs is received
         * @method cameraServerEventHandler
         * @param cameraNum {number} camera ID.
         * @param status {number} status from Cameras Server states events list.
         */
        function cameraServerEventHandler(cameraNum, status) {
            var uiElement = getTargetElement(cameraNum);
            var isStateChanged = onReceivedServerEvent(uiElement, status);
            if (isStateChanged){
                onStateChangeCompleted(uiElement);
            }
        }
    
        /** 
         * This method is call as callback when CAMERA_STATUS_EVENTs is received
         * @method cameraSignalEventHandler
         * @param cameraNum {number} camera ID.
         * @param status {number} status from Camera signal status events list.
         */
        function cameraSignalEventHandler(cameraNum, status) {
            var uiElement = getTargetElement(cameraNum);
            var isStateChanged = onReceivedSignalEvent(uiElement, status);
            if (isStateChanged){
                onStateChangeCompleted(uiElement);
            }
        }
    
        /** 
         * This method is used when USER_EVENTs is received
         * @method userEventHandler
         * @param uiElement {object} UI element assigned to camera feed that event from.
         * @param userEvent {number} event from user event list.
         */
        function userEventHandler(uiElement, userEvent) {
            var isStateChanged = onReceivedUserEvent(uiElement, userEvent);
            if (isStateChanged){
                onStateChangeCompleted(uiElement);
            }
        }
    
        /** 
         * This method is used to request video stream for camera UI element
         * @method requestVideoStream
         * @param uiElement {object} UI element assigned to camera feed.
         */
        function requestVideoStream(uiElement) {
            var videoObj = getVideoObj(uiElement.cameraNumber);
            videoObj.portNumber = randomPortNumber();
            JLRCameras.api.enableCamera(uiElement.cameraNumber,videoObj.portNumber);
        }
        
        /** 
         * This method is used to request disable video stream for camera UI element
         * @method requestVideoDisable
         * @param uiElement {object} UI element assigned to camera feed.
         */
        function requestVideoDisable(cameraNum) {
            var uiElement = getTargetElement(cameraNum);
            JLRCameras.api.disableCamera(uiElement.cameraNumber);
        }

        /** 
         * This method applys "video disabled" state to cameras UI element
         * @method setVideoOff
         * @param cameraNum {number} camera ID.
         */
        function setVideoOff(cameraNum) {
            var videoObj = getVideoObj(cameraNum);
            var messageObj = getMessageObj(cameraNum);
             if (videoObj != undefined) {
                videoObj.setAttribute('src', '');
                videoObj.removeAttribute('autoplay');
                messageObj.innerText = "VIEW DISABLED!";
            }
        }
        
        /** 
         * This method applys "video live" state to cameras UI element
         * @method setVideoOn
         * @param cameraNum {number} camera ID.
         */
        function setVideoOn(cameraNum) {
            var videoObj = getVideoObj(cameraNum);
            var messageObj = getMessageObj(cameraNum);
            if (videoObj != undefined ) {
                videoObj.setAttribute('autoplay', true);
                videoObj.setAttribute('src', 'http://localhost:' + videoObj.portNumber);
                videoObj.setAttribute('autoplay', true);
                messageObj.innerText = "";
            }
        }
        
        /** 
         * This method applys "warning" state to cameras UI element
         * @method setWarning
         * @param cameraNum {number} camera ID.
         */
        function setWarning(cameraNum) {
            var videoObj = getVideoObj(cameraNum);
            var messageObj = getMessageObj(cameraNum);
             if (videoObj != undefined) {
                videoObj.setAttribute('src', '');
                videoObj.removeAttribute('autoplay');
                messageObj.innerText = "WARNING! NO INPUT DETECTED!";
                }
            }

        /** 
         * This method is used to apply background theme for controls of camera UI element
         * @method setButtonImgs
         * @param uiElement {object} UI element assigned to camera feed.
         * @param imgType {String} controls background theme.
         */
        function setButtonImgs(uiElement, imgType) {
            switch(imgType){
                case "video_stream":
                    $(uiElement).find('img .unavailableButton')
                    .removeClass('unavailableButton');
                    
                    $(uiElement).find('.controlOnOff').find('img')
                    .removeClass('enableButton')
                    .addClass('disableButton');
                    
                    $(uiElement).find('.controlLarge').find('img')
                    .removeClass('dislargeButton')
                    .addClass('enlargeButton');
                    
                    $(uiElement).find('.controlFlip').find('img')
                    .removeClass('mirrorOnButton')
                    .addClass('mirrorOffButton')
                    break;
                case "video_disabled":
                    $(uiElement).find('img .unavailableButton')
                    .removeClass('unavailableButton');
                    
                    $(uiElement).find('.controlOnOff').find('img')
                    .removeClass('disableButton')
                    .addClass('enableButton');
                    
                    if (isUiElementLarge(uiElement) == false){
                        $(uiElement).find('.controlLarge').find('img')
                        .removeClass('enlargeButton')
                        .addClass('dislargeButton');
                    }
                    
                    $(uiElement).find('.controlFlip').find('img')
                    .removeClass('mirrorOffButton')
                    .addClass('mirrorOnButton')
                    break;
                case "empty":
                    $(uiElement).find('.controlOnOff').find('img')
                    .removeClass('enableButton')
                    .removeClass('disableButton')
                    .addClass('unavailableButton');
                    
                    if (!isUiElementLarge(uiElement)){
                        $(uiElement).find('.controlLarge').find('img')
                        .removeClass('dislargeButton')
                        .removeClass('enlargeButton')
                        .addClass('unavailableButton');
                    }
                    
                    $(uiElement).find('.controlFlip').find('img')
                    .removeClass('mirrorOnButton')
                    .removeClass('mirrorOffButton')
                    .addClass('unavailableButton')
                    break;
                default:
            }
        }
    
        /** 
         * This method is used to manage event handlers of camera UI element controls
         * depending UI element state
         * @method setButtonEventHandlers
         * @param uiElement {object} UI element assigned to camera feed.
         * @param state {String} UI element state.
         */
        function setButtonEventHandlers(uiElement, state) {
            switch(uiElement.state){
                case CAMERA_UI_STATE.VIDEO_LIVE:
                    $(uiElement).find('.controlOnOff')
                    .unbind('click')
                    .bind('click', function(evt){
                        var targetElement = getTargetElement(uiElement.cameraNumber);
                        userEventHandler(targetElement, USER_EVENT.SET_OFF);
                    });
                    
                    $(uiElement).find('.controlLarge')
                    .unbind('click')
                    .bind('click', function(evt){
                        var targetElement = getTargetElement(uiElement.cameraNumber);
                        userEventHandler(targetElement, USER_EVENT.BIG_SMALL);
                     });
                    
                    $(uiElement).find('.controlFlip')
                    .unbind('click')
                    .bind('click', function(evt){
                        userEventHandler(uiElement, USER_EVENT.FLIP);
                     });
                     break;
                case CAMERA_UI_STATE.VIDEO_DISABLED:
                    $(uiElement).find('.controlOnOff')
                    .unbind('click')
                    .bind('click', function(evt){
                        userEventHandler(uiElement, USER_EVENT.SET_LIVE);
                    });
                    
                    if (!isUiElementLarge(uiElement)){
                        $(uiElement).find('.controlLarge')
                        .unbind('click');
                    }
                    
                    $(uiElement).find('.controlFlip')
                    .unbind('click');
                    break;
                case CAMERA_UI_STATE.WARNING:
                    $(uiElement).find('.controlOnOff')
                    .unbind('click');
                    
                    if (!isUiElementLarge(uiElement)){
                        $(uiElement).find('.controlLarge')
                        .unbind('click');
                    }
                    
                    $(uiElement).find('.controlFlip')
                    .unbind('click');
                    break;
                case CAMERA_UI_STATE.READY_FOR_REQUEST_CONNECTION:
                case CAMERA_UI_STATE.WAITING:
                     break;
                default:
                     break;
            }
        }
    
        /** 
         * This method creates camera input bank page
         * @method fillCamerasArray
         * @param arg {object} array of arguments contained camera type and ID.
         */
        function fillCamerasArray(arg) {
            list = document.getElementById(arg.id);
    
            for (var i = 0; i < arg.array.length; i++) {
                var listItem = document.createElement('div');
                listItem.index = i;
                listItem.cameraType = arg.array[i]['camera-type'];
                listItem.cameraNumber = arg.array[i]['camera-number'];
                listItem.cameraName = listItem.cameraType + listItem.index;
                var className = "type" + listItem.cameraType;
                $(listItem).addClass(className);
                $(listItem).addClass("cameraItem");
                listItem.cameraInfo = arg.array[i];
                //listItem.state = "off";
                listItem.setAttribute('id', listItem.cameraType + listItem.index);
    
                var liDiv = document.createElement('div');
                liDiv.setAttribute('class', 'divVideoSmall');
                liDiv.setAttribute('id', 'iDdivVideo' + listItem.cameraType + i);
    
                var disabledTxt = document.createElement('p');
                disabledTxt.setAttribute('id', 'itemMessage' + listItem.cameraType + i);
                disabledTxt.setAttribute('class', 'sourceNameTxt');
                disabledTxt.innerText = "";
                disabledTxt.setAttribute('style', 'color: #ffffff');
                liDiv.appendChild(disabledTxt);
    
                var videoSmall = document.createElement('video');
                videoSmall.setAttribute('id', 'itemVideo' + listItem.cameraType + i);
                videoSmall.setAttribute('class', 'itemVideo');
                videoSmall.setAttribute('preload', 'none');
                // videoSmall.setAttribute('controls', 'true');
                videoSmall.setAttribute('muted', true);
    
                videoSmall.portNumber = randomPortNumber();
                videoSmall.cameraNumber = arg.array[i]['camera-number'];
    
                var divControlsSmall = document.createElement('div');
                divControlsSmall.setAttribute('class', 'divControlsSmall');
    
                var divControls = document.createElement('div');
                divControls.setAttribute('class', 'divControlsBtnSmall');
                divControls.setAttribute('id', 'divControls' + listItem.cameraType + i);
                var divControl1 = document.createElement('div');
                var divControl2 = document.createElement('div');
                var divControl3 = document.createElement('div');
                var divControl4 = document.createElement('div');
    
                var divEmpty1 = document.createElement('div');
                var divEmpty2 = document.createElement('div');
                var divEmpty3 = document.createElement('div');
                divEmpty1.setAttribute('class', 'empty');
                divEmpty2.setAttribute('class', 'empty');
                divEmpty3.setAttribute('class', 'empty');
    
                divControl1.setAttribute('class', 'controlOnOff inputLabelBg');
                divControl2.setAttribute('class', 'controlLarge inputLabelBg');
                divControl3.setAttribute('class', 'controlFlip inputLabelBg');
                divControl4.setAttribute('class', 'controlTitle inputLabelBg');
    
                liDiv.appendChild(videoSmall);
    
                divControls.appendChild(divControl1);
                divControls.appendChild(divEmpty1);
                divControls.appendChild(divControl4);
                divControls.appendChild(divEmpty2);
                divControls.appendChild(divControl3);
                divControls.appendChild(divEmpty3);
                divControls.appendChild(divControl2);
    
                listItem.appendChild(liDiv);
    
                var liIcon = document.createElement('img');
    
                liIcon.setAttribute('class', 'controlImg ' + DEFAULT_BTN.ON_OFF);
    
                divControl1.appendChild(liIcon);
                var liIcon2 = document.createElement('img');
    
                liIcon2.setAttribute('class', 'controlImg ' + DEFAULT_BTN.ENLARGE);
                divControl2.appendChild(liIcon2);
    
                var liIcon3 = document.createElement('img');
    
                liIcon3.setAttribute('class', 'controlImg ' + DEFAULT_BTN.MIRROR);
                divControl3.appendChild(liIcon3);
    
                var camTitle = document.createElement('p');
                camTitle.setAttribute('class', 'sourceNameTxt');
    
                camTitle.innerText = arg.array[i]['camera-type'];
    
                divControl4.appendChild(camTitle);
    
                var litext = document.createElement('div');
    
                litext.setAttribute('class', 'sourceNameSmall');
                var divControlsEmpty = document.createElement('div');
                divControlsEmpty.setAttribute('class', 'controlsEmptySmall');
    
                divControlsSmall.appendChild(divControlsEmpty);
                divControlsSmall.appendChild(divControls);
                listItem.appendChild(divControls);
    
                var litextPrompt = document.createElement('p');
                litextPrompt.setAttribute('class', 'sourceNameTxt');
                litextPrompt.innerText = arg.array[i]['camera-type'];
                litext.appendChild(litextPrompt);
    
                list.appendChild(listItem);
            }
        }
    
        function connectVideoArray(arg) {
            var list = document.getElementById(arg.id);
    
            for (var i = 0; i < list.children.length; i++) {
                var listItem = list.children[i];
                var videoObj = getVideoObj(listItem.cameraNumber);

                var itemStatus = JLRCameras.api.getCameraStatus(listItem.cameraNumber);
                var isStateChanged = onReceivedSignalEvent(listItem, itemStatus);
                if (isStateChanged){
                    onStateChangeCompleted(listItem);
                }
            }
        }

        /** 
         * This method enlarges camera UI element to solo view on screen
         * @method switchToLarge
         * @param uiElement {object} UI element assigned to camera feed.
         */
        function switchToLarge(uiElement) {
            var shadow = $("<div />").attr('id', 'mainShadowDiv').appendTo('#mainDiv');
    
            var index = uiElement.index;
            selectedToWide =  $(uiElement);
            var videoToWide = $(getVideoObj(uiElement.cameraNumber)).detach();
            var messageToWide = $(getMessageObj(uiElement.cameraNumber)).detach();
    
            var large = $(uiElement).clone(true).removeAttr('id').attr('id', 'divViewLarge').css("display", "block").appendTo('#mainDiv');
            $(large[0].children[0]).prepend(messageToWide);
            $(large[0].children[0]).prepend(videoToWide);
            $(large).find('video')[0].play();
            large[0].cameraNumber = uiElement.cameraNumber;
            large[0].state = uiElement.state;
            large.index = index;
            soloView = true;
    
            $(uiElement.children).filter('.divControlsBtnSmall').hide();
            $(uiElement.children).filter('.divVideoSmall').hide();
            setButtonEventHandlers(large[0], large[0].state);
        }
    
        function mirrorView(videoObj) {
            if ($(videoObj).hasClass("mirror")) {
                $(videoObj).removeClass("mirror");
            } else {
                $(videoObj).addClass("mirror");
            }
        }
    
        /** 
         * This method returns solo viewed camera UI element to multipal view
         * @method switchToSmall
         * @param uiElement {object} UI element assigned to camera feed.
         */
        function switchToSmall(uiElement) {
            var videoToWide = $('#divViewLarge .divVideoSmall video').detach();
            var messageToWide = $('#divViewLarge .divVideoSmall p').detach();
            if (selectedToWide != undefined) {
                $(selectedToWide[0].children).filter('.divVideoSmall').prepend(messageToWide);
                $(selectedToWide[0].children).filter('.divVideoSmall').prepend(videoToWide);
                videoToWide[0].play();
                $(selectedToWide[0].children).filter('.divControlsBtnSmall').show();
                $(selectedToWide[0].children).filter('.divVideoSmall').show();
            }
            $('#mainShadowDiv').remove();
            $('#divViewLarge').remove();
            soloView = false;
            
            var targetElement = getTargetElement(uiElement.cameraNumber);
            targetElement.state = uiElement.state;
            setButtonEventHandlers(targetElement, uiElement.state);
            onStateChangeCompleted(targetElement);

            selectedToWide = undefined;
        }
    
        function randomPortNumber() {
            var min = 10000, max = 65000;
            var rand = min + Math.random() * (max + 1 - min);
            rand = rand ^ 0;
            return rand;
        }

        /** 
         * This method sets menu buttons
         * @method setActiveMenu
         * @param activeName {String} name of camera's input bank page.
         */
        function setActiveMenu(activeName) {
            var setItem = $('.menuItem > img').removeClass();
            
            var actItem = $(setItem.get(0));
            $('.menuItem').each(function() {
                if($(this).data('camType') === activeName) {
                    actItem = $(this).children();
                }
            });
            actItem.addClass('selectedMenu');
        }
    
        /** 
         * This method adds menu buttons on footer
         * @method addMenu
         */
        function addMenu() {
            function menuItemHandler() {
                var nextCamera = $(this).data('camType');
                console.log('menuItem click: ' + nextCamera);
                showCameras(nextCamera);
                setActiveMenu(nextCamera);
                currentCamerasPage = nextCamera;
            }
            
            var menuList = $('#menu > ul');
            for (var i_ = 0; i_ < typeCameras.length; i_++) {
                var menuItem = $('<li class=\'menuItem\'/>').appendTo(menuList);
                menuItem.data('camType', typeCameras[i_]);
                menuItem.click(menuItemHandler);
                $('<img />').appendTo(menuItem);
            }
        }
        
        /** 
         * This method returns camera UI element according camera ID
         * @method getTargetElement
         * @param cameraNum {number} camera ID.
         */
        function getTargetElement(cameraNum) {
            var uiElement;
            if (soloView){
                largeElement = document.getElementById('divViewLarge');
                if(largeElement.cameraNumber == cameraNum){
                    uiElement = largeElement;
                    return uiElement;
                }
            }

            uiElement = document.getElementById(cameraArray[cameraNum].name);
            return uiElement;
        }
        
        /** 
         * This method checks if camera UI element is enlarged
         * @method isUiElementLarge
         * @param uiElement {object} UI element assigned to camera feed.
         */
        function isUiElementLarge(uiElement) {
            if (soloView){
                largeElement = document.getElementById('divViewLarge');
                if(largeElement.cameraNumber == uiElement.cameraNumber){
                    return true;
                }
            }
            return false;
        }

        JLRCameras.api.setCamerasListener("onCameraServerStatusChanged", cameraServerEventHandler);
        JLRCameras.api.setCamerasListener("onCameraStatusChanged", cameraSignalEventHandler);

        fillCamerasArray({
            id : "listAnalogId",
            array : analogArray
        });
        
        fillCamerasArray({
            id : "listUsbId",
            array : usbArray
        });
        
        fillCamerasArray({
            id : "listIpId",
            array : ipArray
        });

        connectVideoArray({
            id : "listAnalogId",
        });
        
        connectVideoArray({
            id : "listUsbId",
        });
        
        connectVideoArray({
            id : "listIpId",
        }); 
    
        addMenu();
        showCameras(currentCamerasPage);
        setActiveMenu(currentCamerasPage);
        setSwipeHandler();
    }

};
