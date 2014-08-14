/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/** 
 * @module Store
 */
/**
 * Reference to instance of  class object this class is inherited from dataModel {@link CarIndicator}
@property carInd {Object}
 */
var carInd;
/**
 * Reference to instance of ThemeEngine class object
 * @property te {Object}
 */
var te;

/**
 * Array of signals who want subscribe in carInd 
 * @property carIndicatorSignals {string[]}
 */
var carIndicatorSignals =  [
                            "IviPoC_NightMode"
                            ];

/* initialize iScroll scrollers for one-finger touch scrolling 
   of articles and article lists
*/

var topScroll;
var entScroll;
var sportsScroll;
function loaded() {
    setTimeout(function () {
        topScroll = new iScroll('topArticleList', { hScrollbar: false, vScrollbar: false });
        entScroll = new iScroll('entertainArticleList', { hScrollbar: false, vScrollbar: false });
        sportsScroll = new iScroll('sportsArticleList', { hScrollbar: false, vScrollbar: false });
        }, 1000);
}
window.addEventListener('load', loaded, false);

// build the HTML for each list item in a given feed's article list

function BuildItemHTML(itemPhoto,itemTitle,itemDesc){
    output = '';
    output += '<li id=\"'+ itemGuid +'\">';
    output += '<div class=\"articleListItem textBgColorThemeTransparent\">';
    output += '<div class=\"thumbnail\" ontouchend=\"showArticle(\''+ itemFeed +'/did='+ itemGuid +'\')\"><img src=\"'+ itemPhoto +'\" width=\"180px\" \/></div>';
    output += '<div class=\"itemText\"><span class=\"itemDate fontSizeXXSmall fontColorTheme\">'+ d + m + y +'</span><br/><span ontouchend=\"showArticle(\''+ itemFeed +'/did='+ itemGuid +'\')\" class=\"itemTitle fontSizeSmall fontColorNormal\">'+ itemTitle +'</span><br/>';
    output += '<span class=\"itemDesc fontSizeXSmall fontColorNormal\">'+ itemDesc +'</span>';
    output += '</div><div class=\"itemTextGradFade\"></div></div>';
    output += '</li>';
    return output;
}

/**
 * Initialize plugins, register events for Store app.
 * @method init
 * @static
 **/
var init = function () {
    var bootstrap = new Bootstrap(function (status) {
        $("#topBarIcons").topBarIconsPlugin('init', 'news');
	$("#clockElement").ClockPlugin('init', 5);
	$("#clockElement").ClockPlugin('startTimer');
	$('#bottomPanel').bottomPanel('init',false,false);

	if (tizen.speech) {
	    setupSpeechRecognition();
	} else {
	    console.log("Store: Speech Recognition not running, voice control will be unavailable");
	}
		
	bootstrap.themeEngine.addStatusListener(function (eData) {
		// setThemeImageColor();
	});
    });
};

/**
 * Calls initialization fuction after document is loaded.
 * @method $(document).ready
 * @param init {function} Callback function for initialize Store.
 * @static
 **/
$(document).ready(init);

/**
 * Applies selected theme to application icons 
 * @method setThemeImageColor
 * @static
 **/
function setThemeImageColor() {
	var imageSource;
	$('body').find('img').each(function() {
		var self = this;
		imageSource = $(this).attr('src');

	    if (typeof(imageSource) !== 'undefined' && $(this.parentElement).hasClass('themeImage') == false) {
	        console.log(imageSource);

	        var img = new Image();
	        var ctx = document.createElement('canvas').getContext('2d');

	        img.onload = function () {
	            var w = ctx.canvas.width = img.width;
	            var h = ctx.canvas.height = img.height;
	            ctx.fillStyle = ThemeKeyColor;
	            ctx.fillRect(0, 0, w, h);
	            ctx.globalCompositeOperation = 'destination-in';
	            ctx.drawImage(img, 0, 0);

	            $(self).attr('src', ctx.canvas.toDataURL());
	            $(self).hide(0, function() { $(self).show();});
	        };

	        img.src = imageSource;
	    }
	});
}

function setupSpeechRecognition() {
	console.log("Store setupSpeechRecognition");
	Speech.addVoiceRecognitionListener({
		onapplicationinstall : function() {
			console.log("Speech application install invoked");
			if (_applicationDetail.id !== undefined) {
				StoreLibrary.installApp(_applicationDetail.id);
			}
		},
		onapplicationuninstall : function() {
			console.log("Speech application uninstall invoked");
			if (_applicationDetail.id !== undefined) {
				StoreLibrary.uninstallApp(_applicationDetail.id);
			}
		}

	});
}

$(document).ready(function () {

/* retrieve via ajax and parse XML from feeds to create article list views
   for each category (currently Top News, Entertainment and Sports)
*/

    // Top News
    $.get("http://wmodefeeds.wmpda.com/FeedServiceSP/docs/fid=3e8", function(xml) {
        myHTMLOutput = '';
        myHTMLOutput = '<ul id=\"topArticleListInner\">';
	$('item',xml).each(function(i) {
                itemFeed = "http://wmodefeeds.wmpda.com/FeedServiceSP/docs/fid=3e8";
                itemPhoto = $(this).find("enclosure").attr('url');
                itemDate = $(this).find("pubDate").text();
		itemTitle = $(this).find("title").text();
                itemDesc = $(this).find("description").text();
                itemGuid = $(this).find("guid").text();
                y = itemDate.substr(11,5);
                m = itemDate.substr(7,4);
                d = itemDate.substr(0,8);
                newDate = new Date(y, m, d);
                mydata = BuildItemHTML(itemPhoto,itemTitle,itemDesc);
                myHTMLOutput = myHTMLOutput + mydata;
        });
        myHTMLOutput += '</ul>';
        $("#topArticleList").append(myHTMLOutput);
    });

    // Entertainment
    $.get("http://wmodefeeds.wmpda.com/FeedServiceSP/docs/fid=3eb", function(xml) {
        myHTMLOutput = '';
        myHTMLOutput = '<ul id=\"entertainArticleListInner\">';
	$('item',xml).each(function(i) {
                itemFeed = "http://wmodefeeds.wmpda.com/FeedServiceSP/docs/fid=3eb";
                itemPhoto = $(this).find("enclosure").attr('url');
                itemDate = $(this).find("pubDate").text();
		itemTitle = $(this).find("title").text();
                itemDesc = $(this).find("description").text();
                itemGuid = $(this).find("guid").text();
                y = itemDate.substr(11,5);
                m = itemDate.substr(7,4);
                d = itemDate.substr(0,8);
                newDate = new Date(y, m, d);
                mydata = BuildItemHTML(itemPhoto,itemTitle,itemDesc);
                myHTMLOutput = myHTMLOutput + mydata;
        });
        myHTMLOutput += '</ul>';
        $("#entertainArticleList").append(myHTMLOutput);
    });

    // Sports
    $.get("http://wmodefeeds.wmpda.com/FeedServiceSP/docs/fid=3e9", function(xml) {
        myHTMLOutput = '';
        myHTMLOutput = '<ul id=\"sportsArticleListInner\">';
	$('item',xml).each(function(i) {
                itemFeed = "http://wmodefeeds.wmpda.com/FeedServiceSP/docs/fid=3e9";
                itemPhoto = $(this).find("enclosure").attr('url');
                itemDate = $(this).find("pubDate").text();
		itemTitle = $(this).find("title").text();
                itemDesc = $(this).find("description").text();
                itemGuid = $(this).find("guid").text();
                y = itemDate.substr(11,5);
                m = itemDate.substr(7,4);
                d = itemDate.substr(0,8);
                newDate = new Date(y, m, d);
                mydata = BuildItemHTML(itemPhoto,itemTitle,itemDesc);
                myHTMLOutput = myHTMLOutput + mydata;
        });
        myHTMLOutput += '</ul>';
        $("#sportsArticleList").append(myHTMLOutput);
    });
 
});

/* close all function to hide (as opposed to display:none) all 
   items of a given class, usually used to dismiss article div.
   Visibility:hidden used because iScroll scrollers don't react
   well to having parent elements' display property set to 'none'.
*/

function closeAll(className) {
    var elements = document.getElementsByClassName(className);
    for(var i = 0, length = elements.length; i < length; i++) {
          elements[i].style.visibility = 'hidden';
    }
    document.getElementById('articleClose').style.display='none';

    /* Terminate jQuery-created DOM elements and iScroll instance
       with maximum predjudice upon closeAll.
    */

    if (typeof articleScroll === 'undefined') {
    } else {
        articleScroll.destroy();
    }
    $(".articleBody").empty();
    $(".articleBody").remove()
    $(".articleItem").remove();
    $("#articleScroller").remove();
}

/* functions to show scrolling lists of thumbnail images, article
   headlines + summaries for each category
*/

function showTop() {
    closeAll('article');

    document.getElementById('topArticleList').style.visibility='visible';
    document.getElementById('entertainArticleList').style.visibility='hidden';
    document.getElementById('sportsArticleList').style.visibility='hidden';

    document.getElementById('top').className='fontColorNormal';
    document.getElementById('entertain').className='fontColorTheme';
    document.getElementById('sports').className='fontColorTheme';
}

function showEntertain() {
    closeAll('article');

    document.getElementById('topArticleList').style.visibility='hidden';
    document.getElementById('entertainArticleList').style.visibility='visible';
    document.getElementById('sportsArticleList').style.visibility='hidden';

    document.getElementById('top').className='fontColorTheme';
    document.getElementById('entertain').className='fontColorNormal';
    document.getElementById('sports').className='fontColorTheme';
}

function showSports() {
    closeAll('article');

    document.getElementById('topArticleList').style.visibility='hidden';
    document.getElementById('entertainArticleList').style.visibility='hidden';
    document.getElementById('sportsArticleList').style.visibility='visible';

    document.getElementById('top').className='fontColorTheme';
    document.getElementById('entertain').className='fontColorTheme';
    document.getElementById('sports').className='fontColorNormal';
}


/* for a given full text article's url, get it via ajax,
   then parse and display it
*/

function showArticle(url) {

    /* re-create articleSroller <ul> element to force
       iScroll instance to re-get the correct height
    */

    if ($('#articleScroller').length == 0) {
        addScr = '<ul id=\"articleScroller\">';
    	$("#articleContainer").append(addScr);
    } else {
    }

    /* ajax article call, receives 'url' constructed in 
       BuildItemHTML function
    */

    $.get(url, function(xml) {

        myHTMLOutput = '';
	$('item',xml).each(function(i) {
            articleHead = $(this).find("title").text();
            articleBody = $(this).find("body").text();
            articleBody = articleBody.replace(/(?:^|[^"'])((ftp|http|https|file):\/\/[\S]+(\b|$))/gi, "<p><img width=\"627px\" class=\"articlePhoto\" src=\"$1\" />");
            itemId = $(this).find("id").text();
        });

        myHTMLOutput = '<li class=\"articleItem\"><div class=\"articleBody fontSizeLarge fontColorNormal\">';
        myHTMLOutput += '<span class=\"articleHead fontSizeLarger fontColorNormal\">'+ articleHead +'</span>'+ articleBody +'</div></li>';

        $("#articleScroller").append(myHTMLOutput);

        articleScroll = null;
        articleScroll = new iScroll('articleContainer', { hScrollbar: false, vScrollbar: false });

        setTimeout(function() {
            var element = document.getElementById("articleScroller"); 
            element.style.height = document.defaultView.getComputedStyle(element,"").getPropertyValue("height");
	    articleScroll.refresh();
	},1000);
    });

    // make article parent div and UI elements visible

    document.getElementById('articleContainer').style.visibility='visible';
    document.getElementById('articleClose').style.display='block';
}
