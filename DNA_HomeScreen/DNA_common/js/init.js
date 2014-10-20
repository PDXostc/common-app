
function includeJs(jsFilePath) {
	console.log("includeJs"+jsFilePath);
    var js = document.createElement("script");

    js.type = "text/javascript";
    js.src = jsFilePath;
    //js.defer = true;
    //js.async = true;

	try {
		document.head.appendChild(js);
	}
	catch (err){
		console.log("includeJs: "+err.message);
	}
}

includeJs("/DNA_common/components/car/js/car.js");
includeJs("/DNA_common/js/user.js");
includeJs("/DNA_common/js/bootstrap.js");
includeJs("/DNA_common/components/knockout/knockout.js");
includeJs("/DNA_common/components/jsViews/jsrender.js");
includeJs("/DNA_common/components/jsViews/template.js");
includeJs("/DNA_common/components/audioPlayer/most.js");
includeJs("/DNA_common/components/bottomPanel/jquery.nouislider.js");
includeJs("/DNA_common/components/bottomPanel/bottomPanel.js");
includeJs("/DNA_common/components/progressBar/progressBar.js");
includeJs("/DNA_common/components/buttonControls/buttonControls.js");
includeJs("/DNA_common/components/audioPlayer/audioPlayer.js");
includeJs("/DNA_common/components/topBarIcons/topBarIcons.js");
includeJs("/DNA_common/components/dateTime/dateTime.js");
includeJs("/DNA_common/components/uri/uri.js");
includeJs("/DNA_common/components/boxCaption/boxCaption.js");
includeJs("/DNA_common/components/alphabetBookmark/alphabetBookmark.js");
//includeJs("/DNA_common/components/keyboard/keyboard.js");
includeJs("/DNA_common/components/library/library.js");
includeJs("/DNA_common/components/weather/weather.js");
