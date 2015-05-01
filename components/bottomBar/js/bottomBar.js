/* ==== ==== ==== init bottom bar js code ==== ==== ==== */

var Slide=[];
var homescreenTimeout;
var BottomBar = {};


BottomBar.TemplateHTML = "DNA_common/components/bottomBar/bottomBar.html";

BottomBar.LogoTimeoutMouseDown = function(e) {
  // console.log("BottomBar.LogoTimeoutMouseDown()");
  homescreenTimeout = setTimeout(function() {
    clearTimeout(homescreenTimeout);
    if (tizen.application.getCurrentApplication().appInfo.packageId != "JLRPOCX001") {
      tizen.application.getCurrentApplication().exit();
    }
  }, 2500);
}

BottomBar.LogoTimeoutMouseUp = function(e) {
  clearTimeout(homescreenTimeout);
}

BottomBar.pageUpdate = function() {
  $('#bottom-bar').replaceWith(BottomBar.bottomBarHTML.valueOf());
  $("#bbar-logo").mousedown(BottomBar.LogoTimeoutPress);
  $("#bbar-logo").mouseup(BottomBar.LogoTimeoutMouseUp);

  depenancyMet("BottomBar.settingsIcon");
}

BottomBar.includeHTMLSucess = function(linkobj) {
		//console.log("BottomBar.includeHTMLSucess()");
		BottomBar.import = linkobj.path[0].import;
		//console.log(BottomBar.import);
		BottomBar.bottomBarHTML = BottomBar.import.getElementById('bottom-bar');
		setTimeout(BottomBar.pageUpdate,2000);
	}

BottomBar.includeHTMLFailed = function(linkobj) {
	//console.log("load bottomBar.html failed");
	console.log(linkobj);
};
	
includeHTML(BottomBar.TemplateHTML, BottomBar.includeHTMLSucess, BottomBar.includeHTMLFailed);

/* ==== ==== ==== init volume slider js code ==== ==== ==== */

// Volume control update timer; this keeps the volume control slider synchronized
// when moving from widget to widget.

var volumeTimer = setInterval(refreshVolume, 2000);
var ignoreNext=0;  // Gets set when we change slider, so that a volume query reply that's now out of date will be ignored.

// This is called by a periodic timer to cause a volumeQuery command to be sent to MOST. This is done so that when
// navigating from screen to screen, the volume control slider on the visible screen will stay in synch with the
// current MOST volume setting.
//
function refreshVolume() {
	var jsonenc = {api:"setTone", dest:"volumeQuery", level:0, incr:0};
	
	if (typeof(most)!=="undefined") {
		most.mostAsync(JSON.stringify(jsonenc), volumeQueryCB);
	}	
}
// Sets the variable which holds the latest updated volume
// received from the MOST extension.
var volLogCntCB=0;

var volumeQueryCB = function(response) {

	volLogCntCB++;
	if(volLogCntCB == 10)
	{	
		 console.log("MOSTLOG: volumeQueryCB response " + response);
		 volLogCntCB=0;
	}

 	// Sometimes the query comes back as 0, so ignore these.
 	if( (response != 0) && (ignoreNext != 1) )
 	{
 		volSet(response);
 	}
 	ignoreNext=0; // Honor the next call to volumeQueryCB (unless setting the slider sets this var to 0 again.
};

// Call this when volumeQueryCB is set by the user.
function volGet(userVol){
	inverseVol=Math.abs(userVol-101);
	if(inverseVol>100) inverseVol=100;
	inverseVol = Math.floor(inverseVol*0.92+163);
	//0.92 is needed because there are 92 integers in the MOST range between 255 and 163 which must be mapped to 0-100

	//console.log("USER: Set volume to "+inverseVol+" ("+userVol+")!");

	//encode some stringified json (jqY = level 163 to 255) and send to most
	var jsonenc = {"api":"setTone","dest":"volume","level":inverseVol,"incr":0};
	most.mostAsync(JSON.stringify(jsonenc), volumeQueryCB);
	ignoreNext=1;
}

// Call this when volumeQueryCB is invoked by a reply from the MOST hardware; sets the slider on the UI.
function volSet(mostVol){
	 var inverseVol = Math.floor((mostVol-163)*1.087)-1;
 	//1.087 is 100/92, or the reciprocal of 92/100
 	var userVol = 100-inverseVol;
 	if(userVol<1) userVol=1;
 	if(userVol>100) userVol=100;
 
 	updateVol(level(inverseVol));
 	//console.log("MOST: Set volume to "+inverseVol+" ("+userVol+")!");
 }

// New Hex Slider Indicator JS

var level = function() {
	return parseInt($("#bbar-volume-input").val());
}

function updateVolOutput() {
  $("#bbar-volume-output").val(level);
  volGet(level());
}

function updateVol(num) {
  $("#bbar-volume-input").val(num);
}

function updateVolLevel() {
  $("#bbar-volume-level").css("width", level() + "%");
}

$(document).on("change", "#bbar-volume-input", function() {
  updateVolOutput();
});

$(document).on("input", "#bbar-volume-input", function() {
  updateVolLevel();
  updateVolOutput();
});

$(document).on("click", "#bbar-less-volume, #bbar-more-volume", function() {
  if ( $(this).attr("id") == "bbar-less-volume" ) {
    updateVol(level()-10);
  } else {
    updateVol(level()+10);
  }
  updateVolLevel();
  updateVolOutput();    
});
