var init = {};

function includeJs(jsFilePath, callback, async) {
	//console.log("includeJs "+jsFilePath);
    var js = document.createElement("script");

    js.onload = function(e) {
		if(typeof(callback) !== typeof undefined)
		callback();
	}
	js.onerror = function() {console.log("error loading "+jsFilePath);};
    js.type = "text/javascript";
    js.src = jsFilePath;
    if(async == 1){
		js.defer = true;
		js.async = true;
	}

	try {
		document.head.appendChild(js);
	}
	catch (err){
		console.error("init.js error in loadScript: "+err.message);
	}
}

function includeHTML(htmlFilePath,onload,onerror,id,name) {
	console.log("includeHTML "+htmlFilePath);
    var html = document.createElement("link");

    html.rel = "import";
    html.href = htmlFilePath;
    html.onload = function(e) {
		if(typeof(name) !== typeof undefined)
			$("#"+name).append($(document.querySelector('#'+id).import.querySelector("#"+name)).children());
		if(typeof(onload) !== typeof undefined)
			onload(e);
	};
    html.onerror = onerror;
	html.id = id;

	try {
		document.head.appendChild(html);
	}
	catch (err){
		console.log("includeHTML: "+err.message);
	}
}

includeJs("DNA_common/components/jQuery/jquery-1.8.2.js", function(){
	//Import common libraries
		//includeJs("DNA_common/jQuery/jquery-ui.js", function(){});
		//includeJs("DNA_common/jQuery/jquery.mobile-1.4.5.js", function(){});

	//Import the topBar and bottomBar
	//	includeJs("DNA_common/components/topBar/js/topBar.js", function(){});
	//	includeJs("DNA_common/components/bottomBar/js/bottomBar.js", function(){});
});

//includeJs("DNA_common/components/knockout/knockout.js");
includeJs("DNA_common/components/jQuery/jquery.nouislider.js");
//includeJs("DNA_common/components/incomingCall/incomingCall.js");

includeJs("DNA_common/components/jsViews/jsrender.js");
includeJs("DNA_common/components/jsViews/template.js");
includeJs("DNA_common/components/boxCaption/boxCaption.js");
includeJs("DNA_common/components/car/js/car.js");
includeJs("DNA_common/components/configuration/js/configuration.js");
includeJs("DNA_common/js/carIndicator.js");
includeJs("DNA_common/js/user.js");
includeJs("DNA_common/js/bootstrap.js");
includeJs("DNA_common/components/rvi/js/ej.js");
includeJs("DNA_common/components/rvi/js/wse.js");
includeJs("DNA_common/components/rvi/js/rvi.js");
includeJs("DNA_common/components/topBar/js/topBar.js", function(){});
includeJs("DNA_common/components/bottomBar/js/bottomBar.js", function(){});
includeJs("DNA_common/components/settings/js/settings.js");
includeJs("DNA_common/components/wifi/js/wifi.js");
includeJs("DNA_common/components/bluetooth/js/bluetooth.js");
includeJs("DNA_common/components/dateTime/js/dateTime.js");

includeJs("DNA_common/components/audioPlayer/most.js");
includeJs("DNA_common/components/knockout/knockout.js");
includeJs("DNA_common/components/jsViews/jsrender.js");
includeJs("DNA_common/components/jsViews/template.js");
includeJs("DNA_common/components/progressBar/progressBar.js");
/*includeJs("DNA_common/components/keyboard/keyboard.js");*/
includeJs("DNA_common/components/settings/js/wifi.js");

//includeJs("DNA_common/components/buttonControls/buttonControls.js");
//includeJs("DNA_common/components/uri/uri.js");
includeJs("DNA_common/components/weather/weather.js");
//includeJs("DNA_common/components/audioPlayer/audioPlayer.js");
//includeJs("DNA_common/components/alphabetBookmark/alphabetBookmark.js");
includeJs("DNA_common/components/library/js/library.js");
