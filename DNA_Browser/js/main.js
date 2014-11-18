/*global Bootstrap,Browser,TabController,ko,showLoadingSpinner */
/**
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/**
 * Browser application provides simple HTML browsing and implements following functionality: 
 *
 * * [go forward in history](../classes/BrowserApplication.Browser.html#method_nextButtonClick)
 * * [go back in history](../classes/BrowserApplication.Browser.html#method_backButtonClick),
 * * [reload page](../classes/BrowserApplication.Browser.html#method_refresh)
 * * [go to home page](../classes/BrowserApplication.Browser.html#method_goToHomePage)
 *
 * The home page is controlled by {{#crossLink "BrowserApplication.Browser/defaultHomePage:property"}}{{/crossLink}} property and by default it is set to [Bing search page](http://www.bing.com/).
 *
 * When the Browser application is launched for the first time, it opens first tab and navigates to home page. All subsequent opened
 * tabs are opened with blank page. Maximum amount of opened tabs is currently set to 5 and it can be changed by modified property
 * {{#crossLink "BrowserApplication.TabController/TABS_COUNT_LIMIT:property"}}{{/crossLink}}. In case that user requests new tab and tab limit was 
 * reached error message describing the issue is displayed.  
 *
 * Web pages are displayed by using [iFrame](http://www.w3.org/wiki/HTML/Elements/iframe) HTML5 element which imposes some limitations on the content
 * that can be displayed. All web pages that detects iFrames like [Facebook](http://www.facebook.com) cannot be displayed using Browser application. 
 * To detect and notify about such states, the application uses following procedure:
 *
 * 1. After entering URL into address bar URL is validated using {{#crossLink "BrowserApplication.Browser/getValidInput:method"}}{{/crossLink}}.
 *    In case that entered text is not valid URL, entered expression is searched by Bing search engine. Seach engine URL is controlled by property 
 *    {{#crossLink "BrowserApplication.Browser/searchEngineUrl:property"}}{{/crossLink}}.
 * 2. Browser application tries to load web page content using background Ajax request using `HEAD` directive.
 *    * In case that Ajax request returns error response or response doesn't come within time interval specified by 
 *      {{#crossLink "BrowserApplication.TabController/ERROR_TIMEOUT:property"}}{{/crossLink}} property error message will be displayed.
 *    * After getting response application checks web page using {{#crossLink "BrowserApplication.Tab/checkPage:method"}}{{/crossLink}}.
 *      In case page forbids to be used within iFrame (`X-Frame-Options` header) error message will be displayed.
 * 3. If web page can be loaded into the iFrame overlay loading message is displayed and iFrame starts loading the web page.
 * 4. After receiving `onLoad` event from iFrame web page is considered fully loaded.
 * 5. All links within loaded web pages are modified in order to allow opening and following in history. This includes changing links `window` targets to `_self`
 *    and attaching `click` and `touchstart` handlers to link elements in order to handle tap and long-tap events.
 * 6. After this processing is done loading overlay is hidden.
 *
 * Browser application supports URL history and each URL entered into address bar is saved into 
 * {{#crossLink "BrowserApplication.Browser/historyModel:property"}}{{/crossLink}} property. Length of the browser history is limited by 
 * property {{#crossLink "BrowserApplication.Browser/maxBrowserHistoryElement:property"}}{{/crossLink}} and it's implemented as FIFO buffer.
 * This information is then used for suggestion of web URLs during entering address into address bar.
 *
 * All user activities in all tabs are stored in to {{#crossLink "BrowserApplication.Browser/tabsHistory:property"}}{{/crossLink}} property. 
 * Length of the browser history is limited by property {{#crossLink "BrowserApplication.Browser/maxTabsHistoryElement:property"}}{{/crossLink}}
 * and it's implemented as FIFO buffer. This information is used to allow Back and Forward navigation within opened web pages in tab.
 *
 * Web browser uses these modules:
 * * {{#crossLink "BrowserApplication.Browser"}}{{/crossLink}} module.
 * * {{#crossLink "BrowserApplication.HistoryModel"}}{{/crossLink}} module.
 * * {{#crossLink "BrowserApplication.TabController"}}{{/crossLink}} module.
 * * {{#crossLink "BrowserApplication.Tab"}}{{/crossLink}} module.
 *
 * Common modules:
 * * {{#crossLink "Services.Bootstrap"}}{{/crossLink}} component
 * * {{#crossLink "CarTheme.BottomPanel"}}{{/crossLink}} component
 * * {{#crossLink "CarTheme.TopBarIcons"}}{{/crossLink}} component
 *
 *  <img id="Image-Maps_1201312180420487" src="../assets/img/browser.png" usemap="#imgmap201422510144" border="0" width="649" height="1152" alt="" />
 *  <map id="imgmap201422510144" name="imgmap201422510144">
 *		<area shape="rect" coords="0,0,573,78" href="../classes/CarTheme.TopBarIcons.html" alt="top bar icons" title="Top bar icons" />
 *     <area shape="rect" coords="573,1,644,76" href="../classes/Settings.Settings.html" alt="Settings" title="Settings" />
 *		<area shape="rect" coords="0,994,644,1147" href="../classes/CarTheme.BottomPanel.html" alt="bottom panel" title="Bottom panel" />
 *		<area  shape="rect" coords="2,78,70,145" alt="back button" title="back button" target="_self" href="../classes/BrowserApplication.Browser.html#method_backButtonClick"/>
 *		<area  shape="rect" coords="67,78,135,145" alt="next button" title="next button" target="_self" href="../classes/BrowserApplication.Browser.html#method_nextButtonClick"/>
 *		<area  shape="rect" coords="140,84,518,141" alt="goto URL" title="goto URL" target="_self" href="../classes/BrowserApplication.Browser.html#method_goToUrl"/>
 *		<area  shape="rect" coords="508,77,576,144" alt="reload button" title="reload button" target="_self" href="../classes/BrowserApplication.Browser.html#method_refresh"/>
 *		<area  shape="rect" coords="577,77,645,144" alt="home button" title="home button" target="_self" href="../classes/BrowserApplication.Browser.html#method_goToHomePage"/>
 *		<area  shape="rect" coords="0,148,488,222" alt="Tabcontroler" title="Tabcontroler" target="_self" href="../classes/BrowserApplication.TabController.html"/>
 *		<area  shape="rect" coords="508,152,576,219" alt="close tab" title="close tab" target="_self" href="../classes/BrowserApplication.Tab.html#method_close"/>
 *		<area  shape="rect" coords="575,152,643,219" alt="add tab" title="add tab" target="_self" href="../classes/BrowserApplication.TabController.html#method_addTab"/>
 *	</map>
 *
 * @module BrowserApplication
 * @namespace BrowserApplication
 * @main BrowserApplication
 * @class Browser
 */

/**
 * Reference to instance of bootstrap class this class help booting theme, config ...
 * @property bootstrap {Bootstrap}
 * @private
 */
var bootstrap;

/**
 * Reference to instance of Browser class this class provides mainly functionality of browser application.
 * @property bootstrap {Bootstrap}
 * @private
 */
var browser;

/**
 * Initialize application components and registers button events.
 *
 * @method init
 * @static
 */
function init() {
	"use strict";
	console.log("init() called");

	$('#bottomPanel').bottomPanel('init');
	$('#bottomPanel').on("clickOnBackButton", function() {
		showLoadingSpinner("SAVING");
		if (typeof (window.localStorage) !== 'undefined') {
			window.localStorage.setItem("browserExitedNormally", "true");
		}
	});
	$("#topBarIcons").topBarIconsPlugin('init');
	$(".disableBox").click(function(event) {
		event.stopPropagation();
		return false;
	});
	window.setInterval(function() {
		var wait = document.getElementById("loadingDots");
		if (wait.innerHTML.length >= 3) {
			wait.innerHTML = "";
		} else {
			wait.innerHTML += ".";
		}
	}, 300);
	browser = new Browser();
	ko.applyBindings(browser.historyModel);
	TabController.initialize();
	window.localStorage.setItem("browserExitedNormally", "false");
}

$(document).ready(function() {
	"use strict";

	bootstrap = new Bootstrap(function(status) {
		setTimeout(function() {
			init();
		}, 0);
	});
});
