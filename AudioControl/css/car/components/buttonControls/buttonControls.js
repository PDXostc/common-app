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

/**
 * @module CarTheme
 **/
(function ($) {
    "use strict";
    /**
     * Represents data UI control element that is used to display audio controls to operate {{#crossLink "AudioPlayer"}}{{/crossLink}} class.
     * UI control reacts to mouse click events and to keyboard events with following mapping:
     *
     * * Play/Pause button - question mark, slash character and `h`     
     * * Previous - &lt; (less than character), comma character and `g`
     * * Next button - &gt; (greater than character), dot character and `k`
     * * Shuffle button - `{` (opening brace), `]` (closing bracket) and `j`
     * * Repeat button - `}` (closing brace), `[` (opening bracket) and `l`
     *
     * Use following snippet to include component in your `index.html` file: 
     *
     *     <script type="text/javascript" src="./css/car/components/buttonControls/buttonControls.js"></script>
     * 
     * and following code to initialize:
     * 
     *      $("#buttons").buttonControls('initAudioPlayerButtons');
     *
     * @class ButtonControlsObj
     * @static
     */
    var ButtonControlsObj = {
            /**
             * Holds play button element.
             * @property playButton {Object}
             */
            playButton : null,
            /**
             * Holds shuffle button element.
             * @property shuffleButton {Object}
             */
            shuffleButton : null,
            /**
             * Holds repeat button element.
             * @property repeatButton {Object}
             */
            repeatButton : null,
            /**
             * Holds next button element.
             * @property nextButton {Object}
             */
            nextButton : null,
            /**
             * Holds previous button element.
             * @property prevButton {Object}
             */
            prevButton : null,
            /**
             * Holds this object.            
             * @property thisObj {Object}
             */
            thisObj : null,
            /** 
             * Method is invoked when carousel is moving left.
             * @method show
             * @param what {Boolean} If what is true UI control is including shuffle and repeat buttons sontrols.
             */
            show: function (what) {
                ButtonControlsObj.thisObj.empty();
                var id = ButtonControlsObj.thisObj.attr('id');
                ButtonControlsObj.thisObj.append('<div id="prevButton" class=\"button previousBtn controlsBtn\" onclick=\"' +
                        '$(\'#' + id + '\').buttonControls(\'touch\',\'prev\')\"></div>' +
                        '<div id="playButton" class=\"button pauseBtn controlsBtn\" onclick=\"' +
                        '$(\'#' + id + '\').buttonControls(\'touch\',\'play\')\"></div>' +
                        '<div  id="nextButton" class=\"button nextBtn controlsBtn\" onclick=\"' +
                        '$(\'#' + id + '\').buttonControls(\'touch\',\'next\')\"></div>');
                if (what) {
                    ButtonControlsObj.thisObj.append('<div id="shuffleButton" class=\"button shuffleBtn\" onclick=\"' +
                            '$(\'#' + id + '\').buttonControls(\'touch\',\'shuffle\')\"></div>' +
                            '<div id="repeatButton"  class=\"button repeatBtn\" onclick=\"' +
                            '$(\'#' + id + '\').buttonControls(\'touch\',\'repeat\')\"></div>');
                }
                ButtonControlsObj.playButton = $('#playButton');
                ButtonControlsObj.shuffleButton = $('#shuffleButton');
                ButtonControlsObj.repeatButton = $('#repeatButton');
                ButtonControlsObj.nextButton = $('#nextButton');
                ButtonControlsObj.prevButton = $('#prevButton');
                $(document).keypress(function (event) {
                    console.log("event.keyCode = " + event.keyCode);
                    console.log("event.which = " + event.which);
                    switch (event.keyCode) {
                    case 103:
                    case 60:
                    case 44:
                        if (!ButtonControlsObj.prevButton.hasClass("prevBtnInactive")) {
                            ButtonControlsObj.thisObj.trigger('previousSong'); // < 
                        }
                        break;
                    case 106:
                    case 62:
                    case 46:
                        if (!ButtonControlsObj.nextButton.hasClass("nextBtnInactive")) {
                            ButtonControlsObj.thisObj.trigger('nextSong');  // >
                        }
                        break;
                    case 104:
                    case 63:
                    case 47:
                        ButtonControlsObj.thisObj.trigger('playSong');  // ? 
                        break;
                    case 107:
                    case 123:
                    case 91:
                        ButtonControlsObj.thisObj.trigger('shuffleSong');  // [
                        break;
                    case 108:
                    case 125:
                    case 93:
                        ButtonControlsObj.thisObj.trigger('repeatSong');  // ] 
                        break;
                    default:
                        break;
                    }
                    //event.preventDefault();
                });
            },
            /** 
             * Initializes button controls UI.
             * @method initAudioPlayerButtons
             */
            initAudioPlayerButtons: function () {
                ButtonControlsObj.thisObj = this;
                ButtonControlsObj.show(true);
                ButtonControlsObj.buttonRepeatInactive();
                ButtonControlsObj.buttonShuffleInactive();
                ButtonControlsObj.buttonPreviousActive();
                ButtonControlsObj.buttonNextActive();
                ButtonControlsObj.buttonPlayActive();
            },
            /** 
             * Method renders active button for play.
             * @method buttonPlayActive
             */
            buttonPlayActive: function () {
                if (ButtonControlsObj.playButton !== null) {
                    ButtonControlsObj.playButton.removeClass("pauseBtn");
                    ButtonControlsObj.playButton.addClass("playBtn");
                }
            },
            /** 
             * Method renders active button for pause.
             * @method buttonPauseActive
             */
            buttonPauseActive: function () {
                ButtonControlsObj.playButton.removeClass("playBtn");
                ButtonControlsObj.playButton.addClass("pauseBtn");
            },
            /** 
             * Method renders active button for shuffle.
             * @method buttonShuffleActive
             */
            buttonShuffleActive: function () {
                if (ButtonControlsObj.shuffleButton !== null) {
                    ButtonControlsObj.shuffleButton.removeClass("shuffleBtn");
                    ButtonControlsObj.shuffleButton.addClass("shuffleBtnActive");
                }
            },
            /** 
             * Method renders inactive button for shuffle.
             * @method buttonShuffleInactive
             */
            buttonShuffleInactive: function () {
                if (ButtonControlsObj.shuffleButton !== null) {
                    ButtonControlsObj.shuffleButton.removeClass("shuffleBtnActive");
                    ButtonControlsObj.shuffleButton.addClass("shuffleBtn");
                }
            },
            /** 
             * Method renders active button for repeat.
             * @method buttonRepeatActive
             */
            buttonRepeatActive: function () {
                if (ButtonControlsObj.repeatButton !== null) {
                    ButtonControlsObj.repeatButton.removeClass("repeatBtn");
                    ButtonControlsObj.repeatButton.addClass("repeatBtnActive");
                }
            },
            /** 
             * Method renders inactive button for repeat.
             * @method buttonRepeatInactive
             */
            buttonRepeatInactive: function () {
                if (ButtonControlsObj.repeatButton !== null) {
                    ButtonControlsObj.repeatButton.removeClass("repeatBtnActive");
                    ButtonControlsObj.repeatButton.addClass("repeatBtn");
                }
            },
            /** 
             * Method renders active button for next.
             * @method buttonNextActive
             */
            buttonNextActive: function () {
                ButtonControlsObj.nextButton.removeClass("nextBtnInactive");
            },
            /** 
             * Method renders inactive button for next.
             * @method buttonNextInactive
             */
            buttonNextInactive: function () {
                ButtonControlsObj.nextButton.addClass("nextBtnInactive");
            },
            /** 
             * Method renders active button for previous.
             * @method buttonPreviousActive
             */
            buttonPreviousActive: function () {
                ButtonControlsObj.prevButton.removeClass("prevBtnInactive");
            },
            /** 
             * Method renders inactive button for previous.
             * @method buttonPreviousInactive
             */
            buttonPreviousInactive: function () {
                ButtonControlsObj.prevButton.addClass("prevBtnInactive");
            },
            /** 
             * Method is invoked after touch on button controls.
             * @method touch
             * @param param {String} Which button was pressed: 'prev', 'play', 'next', 'shuffle', 'repeat'.
             */
            touch: function (param) {
                switch (param) {
                case 'prev':
                    if (!ButtonControlsObj.prevButton.hasClass("prevBtnInactive")) {
                        ButtonControlsObj.thisObj.trigger('previousSong');
                    }
                    break;
                case 'play':
                    ButtonControlsObj.thisObj.trigger('playSong');
                    break;
                case 'next':
                    if (!ButtonControlsObj.nextButton.hasClass("nextBtnInactive")) {
                        ButtonControlsObj.thisObj.trigger('nextSong');
                    }
                    break;
                case 'shuffle':
                    ButtonControlsObj.thisObj.trigger('shuffleSong');
                    break;
                case 'repeat':
                    ButtonControlsObj.thisObj.trigger('repeatSong');
                    break;
                default:
                    break;
                }
            }
        };
    /** 
     * jQuery extension method for {{#crossLink "ButtonControlsObj"}}{{/crossLink}} plugin.
     * @param method {Object|jQuery selector} Identificator (name) of method or jQuery selector.
     * @method buttonControls
     * @for jQuery
     * @return Result of called method.
     */
    $.fn.buttonControls = function (method) {
        // Method calling logic
        if (ButtonControlsObj[method]) {
            return ButtonControlsObj[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return ButtonControlsObj.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.buttonControls');
        }
    };
}(jQuery));
