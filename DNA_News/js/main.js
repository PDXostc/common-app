/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/* Reference to instance of  class object this class is inherited from dataModel {@link CarIndicator}
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
var carIndicatorSignals = [
    "IviPoC_NightMode"
];

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
        onapplicationinstall: function() {
            console.log("Speech application install invoked");
            if (_applicationDetail.id !== undefined) {
                StoreLibrary.installApp(_applicationDetail.id);
            }
        },
        onapplicationuninstall: function() {
            console.log("Speech application uninstall invoked");
            if (_applicationDetail.id !== undefined) {
                StoreLibrary.uninstallApp(_applicationDetail.id);
            }
        }
    });
}

document.onreadystatechange = function() {
    if (document.readyState == "complete") {
        init();
    }
};

function init() {
    ['top', 'entertainment', 'sports'].forEach(generate);
}

function generate(section) {
    var request = new XMLHttpRequest();

    var mapping = {
        top: {
            url: 'http://mycricket.clearmode.com/FeedServiceBP/docs/fid=3e8',
            elem: '#topArticleListInner'
        },
        entertainment: {
            url: 'http://mycricket.clearmode.com/FeedServiceSP/docs/fid=3eb',
            elem: '#entertainArticleListInner'
        },
        sports: {
            url: 'http://mycricket.clearmode.com/FeedServiceSP/docs/fid=3e9',
            elem: '#sportsArticleListInner'
        }
    };

    var readyStateChanged = function(map) {
        return function() {
            if (request.readyState === 4 && request.status === 200) {
                var xml = request.responseXML.documentElement;
                var nodes = xml.querySelectorAll('item');
                var items = Array.prototype.slice.call(nodes);
                items.map(xml2html(mapping[map].url)).forEach(function(elem) {
                    var list = document.querySelector(mapping[map].elem);
                    list.appendChild(elem);
                });
            }
        };
    };

    request.onreadystatechange = readyStateChanged(section);
    request.open('GET', mapping[section].url, true);
    request.send(null);
}

function xml2html(url) {
    return function(xml) {
        var content = document.querySelector('#newsItem').content;

        var guid = xml.querySelector('guid').innerHTML;
        var enclosure = xml.querySelector('enclosure');
        var image = enclosure ? enclosure.attributes['url'].value : '//:0';
        var date = xml.querySelector('pubDate').innerHTML;
        var title = xml.querySelector('title').innerHTML;
        var desc = xml.querySelector('description').innerHTML;

        var href = "javascript:showArticle('";
        href += url;
        href += '/did=';
        href += guid;
        href += "');";

        content.querySelector('a').href = href;
        content.querySelector('img').src = image;
        content.querySelector('.itemDate').textContent = date;
        content.querySelector('.itemTitle').textContent = title;
        content.querySelector('.itemDesc').textContent = desc;

        return content.cloneNode(true);
    };
}

/* Close all function to hide (as opposed to display:none) all
   items of a given class, usually used to dismiss article div.
   Visibility:hidden used because iScroll scrollers don't react
   well to having parent elements' display property set to 'none'.
*/

function closeAll(className) {

	$("."+className).hide();

    //$('#articleClose').hide();

    /* Terminate jQuery-created DOM elements and iScroll instance
       with maximum predjudice upon closeAll.
    */

    if (typeof articleScroll !== typeof undefined) {
        articleScroll.destroy();
		$(".articleBody").empty();
		$(".articleBody").remove()
		$(".articleItem").remove();
		$("#articleScroller").remove();
	}
}

/* functions to show scrolling lists of thumbnail images, article
   headlines + summaries for each category
*/

function showTop() {
    closeAll('article');
    //setTimeout(function () {topScroll.refresh();}, 1000);

    document.getElementById('topArticleList').style.display = 'block';
    document.getElementById('entertainArticleList').style.display = 'none';
    document.getElementById('sportsArticleList').style.display = 'none';

    document.getElementById('top').className = 'orange-viv selected padRight';
    document.getElementById('entertain').className = 'orange-lt deselected padRight';
    document.getElementById('sports').className = 'orange-lt deselected';
}

function showEntertain() {
    closeAll('article');
    //setTimeout(function () {entScroll.refresh();}, 1000);

    document.getElementById('topArticleList').style.display = 'none';
    document.getElementById('entertainArticleList').style.display = 'block';
    document.getElementById('sportsArticleList').style.display = 'none';

    document.getElementById('top').className = 'orange-lt deselected padRight';
    document.getElementById('entertain').className = 'orange-viv selected padRight';
    document.getElementById('sports').className = 'orange-lt deselected';
}

function showSports() {
    closeAll('article');
    //setTimeout(function () {sportsScroll.refresh();}, 1000);

    document.getElementById('topArticleList').style.display = 'none';
    document.getElementById('entertainArticleList').style.display = 'none';
    document.getElementById('sportsArticleList').style.display = 'block';

    document.getElementById('top').className = 'orange-lt deselected padRight';
    document.getElementById('entertain').className = 'orange-lt deselected padRight';
    document.getElementById('sports').className = 'orange-viv selected';
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
        console.log("fire function to get article");

        myHTMLOutput = '';
        $('item',xml).each(function(i) {
            articleHead = $(this).find("title").text();
            articleBody = $(this).find("body").text();
            articleBody = articleBody.replace(/(?:^|[^"'])((ftp|http|https|file):\/\/[\S]+(\b|$))/gi, "<p><img width=\"627px\" class=\"articlePhoto\" src=\"$1\" />");
            itemId = $(this).find("id").text();
            console.log("each loop for article items");
        });

        myHTMLOutput = '<li class=\"articleItem\"><div class=\"articleBody orange-viv\">';
        myHTMLOutput += '<h4 class=\"articleHead orange-viv\">'+ articleHead +'</h4>'+ articleBody +'</div></li>';

        $("#articleScroller").append(myHTMLOutput);
        console.log("article html sent");

		
        //articleScroll = null;
        articleScroll = new iScroll('articleContainer', { hScrollbar: false, vScrollbar: false });

        setTimeout(function() {
            var element = document.getElementById("articleScroller");
            articleScroll.refresh();
        }, 1000);
        
    });

    // make article parent div and UI elements visible

    var container = document.getElementById('articleContainer');
    $("#articleContainer").show();
    $("#articleContainer").css('z-index', 0);
    //$("#articleClose").show();
}
