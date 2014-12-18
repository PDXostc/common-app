/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

// Instantiates the tizen.most object, causing the MOST WRT plugin library to be loaded and
// its API available.
var Most = (function() {
	"use strict";

	function Most() {
//		console.log("most.js Most ctor called."); 
		var self = this;
		if (typeof(tizen.most) !== 'undefined') {
			this.most = tizen.most;
//			console.log("this.most assigned.");
		} else {
			this.most = null;
		}		
	}

	Most.prototype.callInitMost = function() {

		var self = this;
	
	};
	
	window.__most = undefined === window.__most ? new Most() : window.__most; 
	
//	console.log("new Most called.");
	return window.__most;
})();

Most.init = function () {
	if (typeof (tizen.most) !== 'undefined') {
		console
				.log("main sees defined defined tizen.most object.");
	}

	initOff();  // Initialize to surround 2D mode.

	// Called when the Bass slider is moved; passes the new value on to the tizen.most API.
	$(".bassSlider")
			.noUiSlider(
				{ range : [ 0, 24 ], step : 1, start : 12, handles : 1, connect : "upper",
					orientation : "vertical", slide : 
					function() 
					{
						updateDisplay($(".bassSlider"), $('.bass_display'))
						if (tizen.most) {
							// Input Range is 0-24.
							// Output rang is same, but ceneterd around 0. 
							console.log("Bass input is: " + $(".bassSlider").val().toString());

							var curBass = 24 - $(".bassSlider").val();

							var n = curBass - 12;
							if (n < 0)
								n = 256 + n;

							tizen.most.setTone("bass", curBass - 12, 0, function(result) 
																		{
																			console.log(result.message);
																		});
						}
					}
				});
	// Called when the Treble slider is moved; passes the new value on to the tizen.most API.
	$(".trebleSlider")
			.noUiSlider(
					{ range : [ 0, 24 ], step : 1, start : 12, handles : 1, connect : "upper", 
						orientation : "vertical", slide : 
						function() 
						{
							updateDisplay( $(".trebleSlider"), $('.treble_display'))
							if (tizen.most) {
								// Input Range is 0-24.
								// Output rang is same, but ceneterd around 0. 

								var curTreble = 24 - $(".trebleSlider").val();

								var n = curTreble - 12;
								if (n < 0)
									n = 256 + n;

								tizen.most.setTone("treble", curTreble - 12, 0, function(result) 
																				{
																					console.log(result.message);
																				});

							}
						}
					});
	// Called when the Subwoofer slider is moved; passes the new value on to the tizen.most API.
	$(".subSlider")
			.noUiSlider(
					{ range : [ 0, 24 ], step : 1, start : 12, handles : 1, connect : "upper",
						orientation : "vertical", slide : 
						function() 
						{ 
							updateDisplay($(".subSlider"), $('.sub_display'))
							if (tizen.most) {

								var n = 255 - (($(".subSlider").val() * 1) / 2) * 8; // Ranges for subwoofer: input 24 to 0, output, -100 to 0.
							//	console.log("slider input: " + $(".subSlider").val().toString() + " cmd output: " + n.toString());
								i = n;

								tizen.most.setTone("subwoofer", i, 0, function(result) 
																	{
																		console.log(result.message);
																	});

							}
						}
					});
	function updateDisplay(targetSlider, targetDisplay) {
		targetDisplay.html(-(targetSlider.val() - 12));
	}

	function addSubtractOne(btnClicked, targetSlider, targetDisplay) 
	{
		btnClicked
				.mousedown(function() {
					var currentVal = Number(targetSlider
							.val());
					if ($(this).hasClass('plus') == true) {
						currentVal--;
						targetSlider.val(currentVal)
					} else {
						currentVal++;
						targetSlider.val(currentVal)
					}
					updateDisplay(targetSlider,
							targetDisplay);

					// When the buttons surrounding the balance and fader control are activated,
					// send the delta of +/- 1 to tizen.most.
					if (targetSlider.selector == ".bassSlider") {
						tizen.most.setTone("bass", 12 - targetSlider.val(), 0, function(result) 
																				{
																					console.log(result.message);
																				});
					} else if (targetSlider.selector == ".trebleSlider") {
						tizen.most .setTone("treble", 12 - targetSlider.val(), 0, function(result) 
																				  {
																					console.log(result.message);
																				  });
					} else if (targetSlider.selector == ".subSlider") {
						var n = 255 - ((targetSlider.val() * 2) / 3) * 8;
						var i = Math.floor(n + 0.5);
						tizen.most.setTone("volume", i, 0, function(result) 
															{
																console.log(result.message);
															});
					}
				});
	}
	addSubtractOne($('.bass'), $('.bassSlider'),
			$('.bass_display'))
	addSubtractOne($('.treble'), $('.trebleSlider'),
			$('.treble_display'))
	addSubtractOne($('.sub'), $('.subSlider'),
			$('.sub_display'))

	function addClassRemoveClassSibling(targetClass,
			theFunction) {
		targetClass.mousedown(function() {
			$(this).addClass('on').siblings().removeClass(
					'on');
			if (theFunction) {
				theFunction($(this));
			}
		});

	}
	addClassRemoveClassSibling($('.on_off_btn'),
			add3D2DStyling);
	addClassRemoveClassSibling($('.surround_btn'), null);

	function add3D2DStyling(targetClass) {
		if (targetClass.hasClass('off_btn') == true) {
			$('.dimension2D').addClass('on').siblings()
					.removeClass('on');
			$('.audioDimensionTxt').removeClass('on');
			//kj below
			$('.audioDimensionTxt').html("2D");
		} else {
			$('.dimension3D').addClass('on').siblings()
					.removeClass('on');
					$("#twod-threed-target").html(" ");
			$('.audioDimensionTxt').addClass('on').html("3D");

		}
	}
	var currentFade = 0;
	var currentBalance = 0;
	var prevFade = 0;
	var prevBalance = 0;
	// This is the handler for movement of the 2D thumb in the Fade/Balance control. When there are changes in
	// the vertical or horizontal position of the thumb, send the delta to tizen.most using the sendBalance 
	// or sendFade function.
	function moveLeftRightUpDown(theBtn) {
		theBtn
				.mousedown(function() {
					console.log('mouse down dir '+$(this).attr('class'));
					if ($(this).hasClass('up') == true) {
						if (currentFade > -13) {
							currentFade--;
						}
					} else if ($(this).hasClass('down') == true) {
						if (currentFade < 13) {
							currentFade++;
						}
					}

					if ($(this).hasClass('left') == true) {
						if (currentBalance > -13) {
							currentBalance--;
						}
					} else if ($(this).hasClass('right') == true) {
						if (currentBalance < 13) {
							currentBalance++;
						}
					}
					if ($(this).hasClass('left') == true
							|| $(this).hasClass('right') == true) {
						var theBalanceIncrement = (currentBalance * (90 / 25))
								- 50 + '%';
						$('.crosshair').css({
							left : theBalanceIncrement
						});
					} else if ($(this).hasClass('up') == true
							|| $(this).hasClass('down') == true) {
						var theFadeIncrement = (currentFade * (90 / 25))
								- 50 + '%';
						$('.crosshair').css({
							top : theFadeIncrement
						});
					}

					if ((prevBalance != currentBalance)
							|| !prevBalance) // Only send command to MOST on change.
					{
						sendBalance(currentBalance);
						prevBalance = currentBalance;
					}

					if ((prevFade != currentFade)
							|| !prevFade) // Only send command to MOST on change.		
					{
						sendFade(currentFade);
						prevFade = currentFade;
					}

				})
	}
	// Used by the moveLeftRightUpDown to send changes in balance settings to the tizen.most API.
	function sendBalance(curBal) {

		// Scale range of +/- 13 to 0C to F4

		var n = curBal;
		if (curBal < 0)
			n = 256 + curBal;

		if (tizen.most) {
			tizen.most.setBalance("balance", curBal, 0,
					function(result) {
						console.log(result.message);

					}
			);	
		}
	}
	// Used by the moveLeftRightUpDown to send changes in fade settings to the tizen.most API.
	function sendFade(curFade) {
		// Scale range of +/- 12 to 0C to F4
		// Need to reverse this to get front/rear sense correct.
		curFade = -curFade;
		var n = curFade;
		if (curFade < 0)
			n = 256 + curFade;
		if (tizen.most) {
			tizen.most.setBalance("fade", curFade, 0, 
					function(result) {
						console.log(result.message);
					}
			);
		}
	}
	// This is another handler for movement of the 2D thumb in the Fade/Balance control. When there are changes in
	// the vertical or horizontal position of the thumb, send the delta to tizen.most using the sendBalance 
	// or sendFade function.
	moveLeftRightUpDown($('.bf_btn'));
	function moveCrossHair(thisElem, theEvent) {
		theW = $('body').width();
		theH = $('body').height();
		var aHorizontalUnit = (theW * .29861111) / 25;
		var aVerticalUnit = (theH * .478) / 25;
		var parentOffset = thisElem.offset();
		//or $(this).offset(); if you really just want the current element's offset
		var relX = theEvent.pageX - parentOffset.left
				- thisElem.width() / 2;
		var relY = theEvent.pageY - parentOffset.top
				- thisElem.height() / 2;
		var xInc = (relX / aHorizontalUnit);
		var yInc = (relY / aVerticalUnit)
		if (xInc < -0.5) {
			currentBalance = Math.floor(xInc);
		} else if (xInc > 0.5) {
			currentBalance = Math.ceil(xInc);

		} else {
			currentBalance = 0;
		}

		if (yInc < -0.5) {
			currentFade = Math.floor(yInc);
		} else if (yInc > 0.5) {
			currentFade = Math.ceil(yInc);

		} else {
			currentFade = 0;
		}

		if ((prevBalance != currentBalance) || !prevBalance) // Only send command to MOST on change.
		{
			sendBalance(currentBalance);
			prevBalance = currentBalance;
		}

		if ((prevFade != currentFade) || !prevFade) // Only send command to MOST on change.		
		{
			sendFade(currentFade);
			prevFade = currentFade;
		}
		var theBalanceIncrement = (currentBalance * (90 / 25))
				- 50 + '%';
		$('.crosshair').css({
			left : theBalanceIncrement
		});

		var theFadeIncrement = (currentFade * (90 / 25))
				- 50 + '%';
		$('.crosshair').css({
			top : theFadeIncrement
		});
	}
	$(".crossHairContainer").mousedown(
			function(e) {
				moveCrossHair($(this), e)
				$(".crossHairContainer").bind('mousemove',
						function(e) {
							moveCrossHair($(this), e)
						});

			});
	$(document).mouseup(function() {
		$(".crossHairContainer").unbind('mousemove');
	});

	/////CHANGE THIS VARIABLE TO TRUE TO STYLE INTERFACE FOR 2D SURROUND ONLY
	var surround2D_only = true;

	// Enables/disable 2D/3D surround buttons.
	function surroundSoundModeSetup() {
		if (surround2D_only == true) {
			$('body').find('div').addClass("only2D");
		}
	}
	surroundSoundModeSetup();
}

// Takes the string sent from the buttons under the surround_btn_sets div below and
// passes it to the tizen.most API.
function surroundClick(id)
{
	console.log("button "+id);
	tizen.most.setSurround(id.toString(), true, "",  function(result) {
					console.log(result.message);
				 } );
}	

// By deafult, have the 2D surround sound mode/button enabled.
function initOff()
{
	$("on_off_btns off_btn").trigger("click");
}

/**
 * Calls initialization fuction after document is loaded.
 * @method $(document).ready
 * @param init {function} Callback function for initialize Store.
 * @static
 **/
$(document).ready(Most.init);

