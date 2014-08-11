/**
 * @module CarTheme
 **/

(function ($) {
    "use strict";
    /**
     * Class which provides methods to fill content of bottom panel for JQuery plugin. Use following snippet to include component in your `index.html` file:
     * 
     *     <script type="text/javascript" src="./common/components/bottomPanel/bottomPanel.js"></script>
     *
     * and following code to initialize:
     *
     *     $('#bottomPanel').bottomPanel('init', true);
     *
     * @class BottomPanel
     * @constructor
     * @static
     */
    var BottomPanel = {
            /**
             * Holds current object of this JQuery plugin.
             * @property thisObj {Object}
             */
            thisObj: null,
            /** 
             * Initializes bottom panel.
             * @method init
             * @param backButtonDisabled {Bool} Indicates if bottom panel should contain back button.
             * @parama volumeSliderDisabled
             */
            init: function (backButtonDisabled,volumeSliderDisabled) {
            	
            	volumeSliderDisabled = (volumeSliderDisabled == undefined)? false:true;
            	
                if (!backButtonDisabled) {
                    this.append('<div class="bottomBackButton bottomBackButtonBackgroundImg" onclick="$(\'#' +
                            this.attr('id') + '\').bottomPanel(\'onBackButtonClick\');">' +
                            '</div>' + '<div class="bottomPanelLogo bottomPanelLogoImg">' +
                            '</div>');
                } else {
                    this.append('<div class="bottomPanelLogo bottomPanelLogoImg">' + '</div>');
                }
                
                if($('#volumeControl').length == 0){
	                if(!volumeSliderDisabled){
	                	this.append(
	                		'<div id="volumeControl" class="volumeControlClass">'+
		    					'<div id="VCicon"></div>'+
		    					'<div class="sliderStart"></div>'+
		    					'<div id="VCline" class="bgColorTheme"></div>'+
		    					'<div id="VCinner" class="bgColorTheme"></div>'+
		    					'<div class="noVolumeSlider"></div>'+
		    				'</div>');
	                	
	                    $(".noVolumeSlider").noUiSlider({
	                    	range: [0, 24],
	                    	step: 1,
	    				   start: 12,
	    				   handles: 1,
	    				   connect: "lower",
	    				   orientation: "horizontal",
	    				   slide :function(){
	
	    						if(tizen.most)
	    						{
	    							var n = 255 - (( 24- ($(".noVolumeSlider").val()) * 1) / 2)*8;	
	    	
	    							var i = Math.floor(n+0.5);   // Volume.
	
	    							console.log("noVolumeSlider "  + $(".noVolumeSlider").val().toString() + " " +i);
	    							
	    							tizen.most.setTone("volume", i, 0, function(result) {
	                 						console.log(result.message);
	                    			} );               			
	    						}
	    					}
	    				});
	                    // tizen.most.volume query here reads the MOST volume setting and applies it to the slider.
	                	if( tizen.most)
	                	{
	                		// It's a little unreliable, so try multiple times.
	                		tizen.most.setTone("volumeQuery", 0, 0, function(result) {
	                				console.log(result.message);
	                				
	                		} ); 
	                		tizen.most.setTone("volumeQuery", 0, 0, function(result) {
	            				console.log(result.message);
	            				
	                		} ); 
	                		var st = tizen.most.volume;
	                		var sl = (tizen.most.volume - 159)/4;
	
	                		$(".noVolumeSlider").val(sl);
	                	}
	                }
                }
                
                BottomPanel.thisObj = this;
            },
            /** 
             * Method is invoked after click on back button, fires clickOnBackButton event and causes application exit.
             * @method onBackButtonClick
             */
            onBackButtonClick: function () {
                BottomPanel.thisObj.trigger("clickOnBackButton");
                if (typeof tizen !== "undefined") {
                    tizen.application.getCurrentApplication().exit();
                }
            }
        };

    /** 
     * jQuery constructor for {{#crossLink "BottomPanel"}}{{/crossLink}} plugin.
     * @param method {Object|jQuery selector} Identificator (name) of method or jQuery selector.
     * @for jQuery
     * @method bottomPanel
     * @return Result of called method.
     */
    $.fn.bottomPanel = function (method) {
        // Method calling logic
        if (BottomPanel[method]) {
            return BottomPanel[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }

        if (typeof method === 'object' || !method) {
            return BottomPanel.init.apply(this, arguments);
        }

        $.error('Method ' +  method + ' does not exist on jQuery.infoPanelAPI');
    };
}(jQuery));


// Volume control update timer; this keeps the volume control slider synchronized
// when moving from widget to widget.

var volumeTimer = setInterval(refreshVolume, 2000);
var previousVolume = -1;

//JE: test for constant volume polling.
function refreshVolume() {
	if (typeof(tizen) == 'undefined') return false;
	if( tizen.most)
	{
		do {             			
				
	   		// It's a little unreliable, so try multiple times until
				// same volume value is received twice.
	   		tizen.most.setTone("volumeQuery", 0, 0, function(result) {
	   				console.log(result.message);
	   				
	   		} ); 
	   		var st1 = tizen.most.volume;
   		
	   		// If we are still at the same volume level, don't send the 2nd query and wait until next time to look again.
			if( st1 == previousVolume)
			{	
				return;
			}
			
	   		tizen.most.setTone("volumeQuery", 0, 0, function(result) {
					console.log(result.message);					
	   		} ); 
		   		
		   	var st2 = tizen.most.volume;
			
		} while ((st1 != st2) && (st1 + st2 == 0));				

		var sl = (st2 - 159)/4;
		
		$(".noVolumeSlider").val(sl);
		
		previousVolume = st2;

	}
}
