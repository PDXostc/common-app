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
				$("#settingsMenu").remove();
				$("#settingsicon").remove();
				$("#bottomPanelLogoImg").remove();
				$("#volumeSlider").remove();
				$("#volume").remove();
				var CloseButton='';
                if (!backButtonDisabled) {
                    CloseButton='<img id="closeApp" src="./DNA_common/images/Kill_App_Off.png" onclick="$(\'#' + this.attr('id') + '\').bottomPanel(\'onBackButtonClick\');">';
                }
               	this.append(
						'<div id="settingsMenu">' +
							'<img src="./DNA_common/images/BluTooth_Off.png" onclick="Settings(0)">' +
							'<img src="./DNA_common/images/WiFi_Off.png" onclick="Settings(1)">' +
							CloseButton +
						'</div>');

						this.append('<img id="settingsicon" onclick="$(\'#settingsMenu\').toggle();" src="./DNA_common/images/icongear.png" width="87px" height="89px">');
						this.append('<img id="bottomPanelLogoImg" src="./DNA_common/images/JLR-Logo.png" onclick="launchApplication(\'intelPoc10.HomeScreen\')">');
                
                if($('#volumeControl').length == 0){
	                if(!volumeSliderDisabled){
						$("#volumeSlider").remove();
	                	this.append(
						'<div id="volumeSlider" onmousedown="console.warn(\'mousedown on volumeslider\')">' +
							'<div id="volumeChannel"><div id="volumeSlideCrop">' +
								'<img id="volumeIndicator2" src="./DNA_common/images/VolSlideFull.png">' +
							'</div></div><br clear="all">' +
							'<div id="volumeKnob">' +
								'<img src="./DNA_common/images/VolSlideCtrl.png">' +
							'</div>' +
							'<span id="VolLabel">Volume</span>' +
						'</div>');

	                	this.append(
						'<div id="volume" onclick="$(\'#volumeSlider\').toggle();">' +
							'<div id="volumeCrop">' +
								'<img id="volumeIndicator" src="./DNA_common/images/VolFull.png">' +
							'</div>' +
						'</div>');
	                	
	                    $("#noVolumeSlider").noUiSlider({
	                    	range: [0, 24],
	                    	step: 1,
	    				   start: 12,
	    				   handles: 1,
	    				   connect: "lower",
	    				   orientation: "vertical",
	    				   slide :function(){
	
// WRT -> XW:					if(tizen.most)
	    						{
	    							var n = 255 - (( 24- ($(".noVolumeSlider").val()) * 1) / 2)*8;	
	    	
	    							var i = Math.floor(n+0.5);   // Volume.
	
	    							// For XW, encode the WRT api name, destination, and volume level/increment parameters into JSON
	    							// and send to the MOST plugin's asynch interface.
	    							var jsonenc = {api:"setTone", dest:"volume", level:i, incr:0};
									console.log("JE: volume stringify is "+JSON.stringify(jsonenc));
									most.mostAsync(JSON.stringify(jsonenc), volumeSetCB);
									 
	    							
	/* WRT -> XW:    							tizen.most.setTone("volume", i, 0, function(result) {
	                 						console.log(result.message);
	                    			} );
   */	                    			               			
	    						}
	    					}
	    				});
    
    var Slide=[];
	$("body").mouseup(function(e){
		Slide.mousedown=0; Slide.button=0;
		console.warn("mouseup on body");
	});

	$("#volumeSlider").mousedown(function(e){
		Slide.mousedown=1; Slide.button=1;
		console.warn("mousedown on volumeslider");
	});
	$("#volumeSlider").mouseout(function(e){
		Slide.mousedown=0;
		console.warn("mouseout on volumeslider");
	});
	$("#volumeSlider").mouseover(function(e){
		if(Slide.button)
			Slide.mousedown=1;
	});
	$("#volumeSlider").mousemove(function(e){
		if(Slide.mousedown){
			//pull some coordinates and percentages
			var parentOffset = $(this).offset();
			var relY = Math.floor((e.pageY - parentOffset.top)/8.96);
			//quick and dirty math
			if(relY<1) relY=1;
			if(relY>100) relY=100;
			var invY = 100-relY;
			jqY = Math.floor((invY+1)*0.92+163);
			//update appropriate onscreen widgets
			$("#volumeCrop").width(invY+'%');
			$("#volumeSlideCrop").height(invY+'%');
			$("#volumeKnob").css('top',(relY*8.80-70)+'px');
			console.log('Inv'+invY+'Rel'+relY);
			
			//encode some stringified json (jqY = level 163 to 255) and send to most
			//var jsonenc = {"api":"setTone","dest":"volume","level":jqY,"incr":0};
			//most.mostAsync(JSON.stringify(jsonenc), volumeQueryCB);
		}
	});
	                    // tizen.most.volume query here reads the MOST volume setting and applies it to the slider.
       // WRT -> XW:   	if( tizen.most)
	                	{
	                		// For XW, encode the WRT api name, and volumeQuery destination parameters into JSON
							// and send to the MOST plugin's asynch interface.
	                		// Under WRT it was a little unreliable, so try multiple times.
							var jsonenc = {api:"setTone", dest:"volumeQuery", level:0, incr:0};
							 console.log("JE: volume stringify is "+JSON.stringify(jsonenc));
							 most.mostAsync(JSON.stringify(jsonenc), volumeQueryCB);
							 
							var jsonenc = {api:"setTone", dest:"volumeQuery", level:0, incr:0};
							console.log("JE: volume stringify is "+JSON.stringify(jsonenc));
							most.mostAsync(JSON.stringify(jsonenc), volumeQueryCB);
/* WRT way:							
	                		// It's a little unreliable, so try multiple times.
	                		tizen.most.setTone("volumeQuery", 0, 0, function(result) {
	                				console.log(result.message);
	                				
	                		} ); 
	                		tizen.most.setTone("volumeQuery", 0, 0, function(result) {
	            				console.log(result.message);
	            				
	                		} ); 
*/	                		
// For crosswalk, this code must be moved to the callback:
	                //		var st = tizen.most.volume;
	                //		var sl = (tizen.most.volume - 159)/4;
	
	               // 		$(".noVolumeSlider").val(sl);
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
var previousVolume = -1, curVolume=0;

// This is called by a peiodic timer to cause a volumeQuery command to be sent to MOST. This is done so that when
// navigating from screen to screen, the volume control slider on the visible screen will stay in synch with the
// current MOST volume setting.
//
function refreshVolume() {
								
	var jsonenc = {api:"setTone", dest:"volumeQuery", level:0, incr:0};
	console.log("JE: refreshVolume query");
	//most.mostAsync(JSON.stringify(jsonenc), volumeQueryCB);
	
}
// One or both of these will need to set the variable which holds the latest updated volume
// received from the MOST.
var volumeQueryCB = function(response) {
	 console.log("JE js: volumeQueryCB " + response);
	 curVolume = response;
	var sl = (curVolume - 159)/4;
		
	$(".noVolumeSlider").val(sl);
};
	
var volumeSetCB = function(response) {
	  console.log("JE js: volumeSetCB " + response);
};	
