/*
 * Copyright (c) 2014, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*global Bootstrap, evalInstalledApps, appList:true, wrapper, viewPort */

/**
 * Home screen application is launched after system is completely booted up and provides access to available applications as well as to selected information from 
 * car CAN bus (via {{#crossLink "Bootstrap/carIndicator:property"}}{{/crossLink}} object). Hover and click on elements in images below to navigate to components of Home screen application.
 *
 * <img id="Image-Maps_1201312180420487" src="../assets/img/homescreen.png" usemap="#Image-Maps_1201312180420487" border="0" width="649" height="1152" alt="" />
 *   <map id="_Image-Maps_1201312180420487" name="Image-Maps_1201312180420487">
 *     <area shape="rect" coords="0,0,573,78" href="../classes/topbaricons.html" alt="top bar icons" title="Top bar icons" />
 *     <area shape="rect" coords="0,77,644,132" href="../classes/clock.html" alt="clock" title="Clock"    />
 *     <area shape="rect" coords="0,994,644,1147" href="../classes/bottompanel.html" alt="bottom panel" title="Bottom panel" />
 *     <area shape="rect" coords="0,159,644,961" href="../classes/actionCatcher.html" alt="Action catcher" title="Action catcher" />
 *     <area shape="rect" coords="573,1,644,76" href="../modules/Settings.html" alt="Settings" title="Settings"    />
 *   </map> 
 * @module HomescreenApplication
 * @main HomescreenApplication
 **/

/**
 * Provides inicialization of application and startup animations.
 * @class main
 * @static
 **/

var isPc = true,
    audioVolumeService,
    audioObj;

console.log("bootstrap created");
var bootstrap;

if (typeof tizen !== 'undefined') {
    isPc = false;
}
//main
if (!window.intelIVI) {
    window.intelIVI = {};
}
var animationOngoing = false;

/**
 * Initialize plugins, register events for Homescreen app.
 * @method init
 * @static
 **/
var init = function() {
    "use strict";

    bootstrap = new Bootstrap(function(status) {
        $('#dateTime').ClockPlugin('init', 60);
        $('#dateTime').ClockPlugin('startTimer');

        $('#bottomPanel').bottomPanel('init', true);
        $("#topBarIcons").topBarIconsPlugin('init', 'dashboard');

        evalInstalledApps();
        window.intelIVI.main.init();

        bootstrap.carIndicator.addListener({
            onBatteryStatusChanged: function(newValue) {
                var newBatteryStatus = newValue.toString() + "%";
                $('#batteryStatus').html(newBatteryStatus);
                var newBatteryRange = "~" + Math.round(((newValue / 100) * bootstrap.carIndicator.status.fullBatteryRange)).toString() + " MI";
                $('#batteryRange').html(newBatteryRange);
            },
            onOutsideTempChanged: function(newValue) {
                $("#weatherStatus").html(newValue + "°C");
            },
            onInsideTempChanged: function(newValue) {
                $("#fanStatus").html(newValue + "°C");
            },
            onSpeedChanged: function(newValue) {
                $("#homeScrSpeed").html(newValue);
            },
            onFullBatteryRange: function() {

            }
        });
        bootstrap.themeEngine.addStatusListener(function() {
            appList = [];
            evalInstalledApps();
        });

    });

    /* fixed webkit animation bugs */
    window.setTimeout(function() {
        window.setInterval(function() {
            $("#innerRing").removeClass("rollLeft");
            $("#outerRing").removeClass("rollRight");
            window.setTimeout(function() {
                $("#innerRing").addClass("rollLeft");
                $("#outerRing").addClass("rollRight");
            }, 50);

        }, 10000);
   }, 1000);
    window.setTimeout(function() {
        window.setInterval(function() {
          $('#wrapper .step9').removeClass('liveBg');
            window.setTimeout(function() {
                $('#wrapper .step9').addClass('liveBg');
            }, 50);

        }, 7000);
    }, 500);
    /* end fixed webkit animation bugs */
};

$(function() {
    "use strict";
    // debug mode - window.setTimeout("init()", 20000);
    init();
});

/**
 * Store state of audio plugin before application closing.
 * @method window.onbeforeunload
 * @static
 **/
window.onbeforeunload = function() {
    "use strict";
    $('#audioPlayer').audioAPI('setStatusAll');
};

/**
 * Provides inicialization of application content and starts animation.
 * @class intelIVI.main
 * @static
 **/
window.intelIVI.main = (window.intelIVI.main || {

    /**
     * Calls initialization of content.
     * @method init
     **/

    init: function() {
        "use strict";
        var viewPort = window.intelIVI.corpus.init();
        document.body.appendChild(viewPort);
        window.intelIVI.utility.startAnimation(1);
    },
    /**
     * Provides reloading of content.
     * @method counterEnd
     **/

    counterEnd: function() {
        "use strict";
        window.location.reload();
    }
});

function untouchable(param) {
    "use strict";

    setTimeout(function() {
        animationOngoing = false;
    }, param);
}

/**
 * Provides initialization of animated application components.
 * @class intelIVI.utility
 * @static
 **/
window.intelIVI.utility = (window.intelIVI.utility || {
    /**
     * Starts initial animations on Homescreen.
     * @method startAnimation
     **/

    startAnimation: function(index) {
        "use strict";
        $('#wrapper .step' + (index - 2)).css('opacity', '0');
        $('#wrapper .step' + index).css('opacity', '0.4');
        if (index === 10) {
            $('#indicator').addClass('showI');
            window.intelIVI.utility.showContent(1);
            return;
        }
        var time = 40;
        setTimeout(function() {
            index++;
            window.intelIVI.utility.startAnimation(index);
        }, time);
    },
    /**
     * Shows animated content pies one by one.
     * @method showContent
     **/

    showContent: function(index) {
        "use strict";
        $('#content_ul .sector' + index).css('opacity', '1');
        if (index === 4) {
            $('#bottomPanel').addClass('showBP');
            $('#dateTime').addClass('showDT');
            $('#topBarIcons').addClass('showTBI');
        }
        if (index === 8) {
            $('#wrapper .step9').css('opacity', '0.4');
            $('#wrapper .step9').addClass('liveBg');
            return;
        }
        setTimeout(function() {
            index++;
            window.intelIVI.utility.showContent(index);
        }, 80);
    }
});

/**
 * Provides initialization of pie.
 * @class intelIVI.corpus
 * @static
 **/
window.intelIVI.corpus = (window.intelIVI.corpus || {
    /**
     * Create HTML elements of pie.
     * @method init
     **/
    init: function() {
        "use strict";
        var i;
        for (i = 8; i < 10; i++) {
            var viewPortBg = document.createElement('div');
            viewPortBg.className = "backGround step" + i;
            /*global wrapper*/
            wrapper.appendChild(viewPortBg);
        }
        /* global viewPort*/
        wrapper.appendChild(viewPort);
        return wrapper;
    }
});
console.log("main.js end");
