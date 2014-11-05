function includeJs(jsFilePath, callback, async) {
	//console.log("loadScript] "+jsFilePath);
    var js = document.createElement("script");

    js.type = "text/javascript";
    js.src = jsFilePath;
    if(async == 1){
		js.defer = true;
		js.async = true;
	}
    js.onload = function(e) {
		if(typeof(callback) !== typeof undefined)
		callback();
	}

	try {
		document.head.appendChild(js);
	}
	catch (err){
		console.error("init.js error in loadScript: "+err.message);
	}
}

function includeHTML(href, successcb, errorcb, id, name){
	//console.warn("name: "+name);
	var link = document.createElement('link');
	link.rel = 'import';
	link.id = id;
	link.href = href;
	link.onload = function(e) {
		//console.log($("head").html());
		//while($("#"+name).children().length<1){
		$("#"+name).append($(document.querySelector('#'+id).import.querySelector("#"+name)).children());
		//}
		if(typeof(successcb) !== typeof undefined)
			successcb(e);
	};
	link.onerror = function(e) {
		console.error("init.js error in includeHTML: "+e);
		if(typeof(errorcb) !== typeof undefined)
			errorcb(e);
	}
	document.head.appendChild(link);
}

function loadScript(path, callback) {
    "use strict";
    var scripts = document.getElementsByTagName("script"),
        i = 0,
        done = false,
        scriptElement;

    var tempPath = path;
    if (tempPath.substr(0,2)=="./") {
        tempPath = tempPath.substring(1);
    }

    for (i = 0; i < scripts.length; i++) {
        if (scripts[i].src.indexOf(tempPath) !== -1) {
            callback(path, "ok");
            return;
        }
    }

    scriptElement = document.createElement('script');

    function handleLoad() {
        if (!done) {
            done = true;
            if (callback !== null) {
                callback(path, "ok");
            }
        }
    }

    scriptElement.onload = handleLoad;

    scriptElement.onreadystatechange = function () {
        var state;

        if (!done) {
            state = scriptElement.readyState;
            if (state === "complete") {
                handleLoad();
            }
        }
    };

    scriptElement.onerror = function () {
        if (!done) {
            done = true;
            if (callback !== null) {
                callback(path, "error");
            }
        }
    };

    scriptElement.src = path;
    scriptElement.type = "text/javascript";

    document.getElementsByTagName('head')[0].appendChild(scriptElement);
}

//Bootstrap Includes

includeJs("DNA_common/js/jquery-1.8.2.js", function(){
	//loadScript('/DNA_common/components/settings/js/settings.js', function() {});
	//Import common libraries
		//includeJs("DNA_common/js/jquery-ui.js", function(){});
		//includeJs("DNA_common/js/jquery.mobile-1.4.5.js", function(){});

	//Import the topBar and bottomBar
		includeJs("DNA_common/components/topBar/js/topBar.js", function(){});
		includeJs("DNA_common/components/bottomBar/js/bottomBar.js", function(){});
});
