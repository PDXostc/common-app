
function includeJs(jsFilePath) {
    var js = document.createElement("script");

    js.type = "text/javascript";
    js.src = jsFilePath;

    document.body.appendChild(js);
}

includeJs("/common/components/knockout/knockout.js");
includeJs("/common/components/jsViews/jsrender.js");
includeJs("/common/components/jsViews/template.js");
includeJs("/common/css/car.js");
includeJs("/common/js/bootstrap.js");
includeJs("/common/components/audioPlayer/most.js");
includeJs("/common/components/bottomPanel/jquery.nouislider.js");
includeJs("/common/components/bottomPanel/bottomPanel.js");
includeJs("/common/components/progressBar/progressBar.js");
includeJs("/common/components/buttonControls/buttonControls.js");
includeJs("/common/components/audioPlayer/audioPlayer.js");
includeJs("/common/components/topBarIcons/topBarIcons.js");
includeJs("/common/components/dateTime/dateTime.js");
