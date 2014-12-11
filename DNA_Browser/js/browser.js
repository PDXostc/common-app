/* global HistoryModel, TabController, showMessage, Tab, validateURL*/
/** 
 * This class provides methods to browsing in web browser.
 * Browser class use this modules:
 * * {{#crossLink "BrowserApplication.HistoryModel"}}{{/crossLink}} module. This module is used for rendering and manipulation with browser history.
 *
 * Example of usage with default setting. Input box id is #inputBrowser and home page is http://www.bing.com:
 *     browser = new Browser();
 *
 * Example of usage with custom settings:
 * browser = new Browser( custom home page, custom input box selector );
 *
 * This class use [jQuery](http://jquery.com/) for manipulating with html elements.
 * @class Browser
 * @module BrowserApplication
 * @namespace BrowserApplication
 * @constructor
 * @param {String} [defaultHomePage] default home page. The home page is open on first application launch.
 * @param {String} [inputBrowserSelector] input element selector. This is selector for input element where url address is entered.
 */
console.log('Browser.js start');


function validateURL(value){
      return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
    }
    
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var Browser = function(defaultHomePage, inputBrowserSelector) {
	"use strict";
	var self = this;
	this.historyModel = new HistoryModel("");
	this.initializeBrowser = true;
	this.maxBrowserHistoryElement = 50;
	this.maxTabsHistoryElement = 10;
	this.inputBrowserSelector = inputBrowserSelector || "inputBrowser";
	this.defaultHomePage = defaultHomePage || "http://www.bing.com";
	this.searchEngineUrl = "http://www.bing.com";
	this.localStorageBrowserHistoryKey = "browserHistory";
	this.localStorageTabsUrlBrowserKey = "browserTabsURL";
	this.ActiveTabIndexKey = "browserActiveTabIndex";

	this.loadBrowserHistory();

	this.checkOnlineWifiNetwork();
	window.setInterval(function() {
		self.checkOnlineWifiNetwork();
	}, 30000);

	$('#tabBar').on("activeTabChanged", function(event) {
		self.activeTab = TabController.getActiveTab();
		self.activeTabIndex = TabController.getActiveTabIndex();
		if (self.activeTab !== undefined) {
			self.historyModel.inputValue(self.getValidInput(self.activeTab.url));
			if (self.browserHistory !== null) {
				self.renderBrowserHistory(self.browserHistory);
			}
			self.saveCurrentTabs();
			self.enableDisableControlButton();
		}
	});

	$('#tabBar').on('tabRemoved', function(event, index) {
		self.removeTabHistory(index);
	});

	$('#tabBar').on('tabAdded', function(event, newTab) {
		var newUrl = self.getValidInput(newTab.url);
		self.historyModel.inputValue(newUrl);
		self.addCurrentTabHistory(newUrl);
		self.addHistory(newUrl);
		$("#" + self.inputBrowserSelector).focus();
	});

	for ( var i = 0; i < TabController.TABS_COUNT_LIMIT; i++) {
		var emptyArray = [];
		this.tabsHistory.push(emptyArray);
		this.tabsHistoryCurrentPosition[i] = 0;
	}

	$('#tabBar').on('activeTabLoaded', function(event, object) {
		var url;
		if (!self.moveInHistory[object.index] && object.content.URL !== "data:text/html,chromewebdata" && object.content.URL !== "about:blank") {
			url = object.content.URL.toString().trim().toLowerCase();
			if (url.search("error.html") === -1 && url.search("file") === -1) {
				url = self.getValidInput(url);
				self.historyModel.inputValue(url);
			}
		}
		self.moveInHistory[object.index] = false;
	});
	$('#tabBar').on('tabLoaded', function(event, object) {
		var url = object.content.URL.toString().trim().toLowerCase();
		if (!self.initializeBrowser && url !== "data:text/html,chromewebdata" && url !== "about:blank") {
			url = self.getValidInput(url);
			self.addTabHistory(url, object.index);
			self.addHistory(url);
			self.moveInHistory[object.index] = false;
		}
	});
	$("#tabBar").on("linkClicked", function(event, url) {
		if (url !== undefined) {
			self.moveInHistory[self.activeTabIndex] = false;
			url = self.getValidInput(url);
			self.historyModel.inputValue(url);
			self.addTabHistory(url, self.activeTabIndex);
			self.addHistory(url);
		}
	});
	document.getElementById("searchButton").onclick =function(event, object) {
		browser.goToUrl();
	};

	this.historyModel.filteredItemsUnique.subscribe(function(history) {
		self.updateHistoryBoxHeight();
	});
	this.renderBrowserHistory(this.browserHistory);
	this.loadCurrentTabs();
	this.historyModel.inputValue(this.getValidInput(this.activeTab.url));
	this.initializeBrowser = false;
};
/**
 * This property holds information about progressing initialization of browser process.
 * @property initializeBrowser {Bool}
 * @default null
 * @private
 */
Browser.prototype.initializeBrowser = null;
/**
 * The property holds current active tab in browser.
 * @property activeTab {Object}
 * @default null
 * @private
 */
Browser.prototype.activeTab = null;
/**
 * This property holds current index of active tab in browser.
 * @property activeTabIndex {Integer}
 * @default null
 * @private
 */
Browser.prototype.activeTabIndex = null;

/**
 * This property holds history object for all open tabs in browser.
 * @property tabsHistory {Array}
 * @default []
 */
Browser.prototype.tabsHistory = [];
/**
 * This property holds maximum amount pages in tabs history for next, back button.
 * @property maxTabsHistoryElement {String}
 * @default null
 */
Browser.prototype.maxTabsHistoryElement = null;
/**
 * This property holds position in history for all open tabs in browser.
 * @property tabsHistoryCurrentPosition {Array}
 * @default []
 * @private
 */
Browser.prototype.tabsHistoryCurrentPosition = [];

/**
 * This property holds maximum amount of pages in browser history.
 * @property maxBrowserHistoryElement {Integer}
 * @default null
 */
Browser.prototype.maxBrowserHistoryElement = null;
/**
 * Reference to instance of HistoryModel class. This class is used for rendering and manipulating with browser history.
 * @property historyModel {Object}
 * @default null
 */
Browser.prototype.historyModel = null;
/**
 * The property holds default home page. This home page is open on 
 * first application launch.
 * @property defaultHomePage {String}
 * @default null

 */
Browser.prototype.defaultHomePage = null;
/**
 * This property holds input element selector. This is selector for input element where url address is entered.
 * @property inputBrowserSelector {String}
 * @default null
 * @private
 */

Browser.prototype.inputBrowserSelector = null;
/**
 * This property holds browsing history array. Browser history array is shown in historyBox.
 * @property browserHistory {Array}
 * @default ["www.dsl.sk", "dsl", "www.bing.com", "www.ixonos.com", "www.bbc.com", "www.cnn.com", "slovakia", "cnn"]
 * @private
 */
Browser.prototype.browserHistory = [ "www.dsl.sk", "dsl", "www.bing.com", "www.ixonos.com", "www.bbc.com", "www.cnn.com", "slovakia", "cnn" ];
/**
 * This property holds key of browsing history array in local storage.
 * @property localStorageBrowserHistoryKey {Array}
 * @default null
 * @private
 */
Browser.prototype.localStorageBrowserHistoryKey = null;
/**
 * This property holds key of Tabs browser url array in local storage.
 * @property localStorageTabsUrlBrowserKey {Array}
 * @default null
 * @private
 */
Browser.prototype.localStorageTabsUrlBrowserKey = null;

/**
 * This property holds array of tabs history browsing indicator. It is true if the button for moving in tab history is pressed.
 * @property moveInHistory {Array}
 * @default []
 * @private
 */
Browser.prototype.moveInHistory = [];
/**
 * This property holds online status for browser.
 * @property isOnline {Bool}
 * @default false
 * @private
 */
Browser.prototype.isOnline = false;
/**
 * This property holds key of current active tab in local storage.
 * @property ActiveTabIndexKey {Integer}
 * @default null
 * @private
 */
Browser.prototype.ActiveTabIndexKey = null;
/**
 * This property holds url for search engine.
 * @property searchEngineUrl {String}
 * @default null
 */
Browser.prototype.searchEngineUrl = null;

/** 
 * The method provides show/hide browser history box in the UI and fills it with browserHistory array.
 * @method showHistory
 * @param [newStatus] {Boolean} Defines if the history box will be shown or not.
 */
Browser.prototype.showHistory = function(newStatus) {
	"use strict";
	var self = this;
	if (newStatus === undefined) {
		if ($("#historyBox").hasClass("historyBoxHidden")) {
			newStatus = true;
		} else if ($("#historyBox").hasClass("historyBoxShow")) {
			newStatus = false;
		}
	}
	if (newStatus) {
		if ($("#historyBox").hasClass("historyBoxHidden")) {
			$("#historyBox").removeClass("historyBoxHidden");
		}
		if (!$("#historyBox").hasClass("historyBoxShow")) {
			$("#historyBox").addClass("historyBoxShow");
		}
	} else {
		if ($("#historyBox").hasClass("historyBoxShow")) {
			$("#historyBox").removeClass("historyBoxShow");
		}
		if (!$("#historyBox").hasClass("historyBoxHidden")) {
			$("#historyBox").addClass("historyBoxHidden");
		}
		self.updateHistoryBoxHeight();
	}
};

/** 
 * The method calculates and sets the height of history box according to the number of matching URLs and keywords from previous user entries.
 * @method updateHistoryBoxHeight
 */
Browser.prototype.updateHistoryBoxHeight = function() {
	"use strict";
	var self = this;
	if (!!self.historyModel) {
		if ($("#historyBox").hasClass("historyBoxShow")) {
			var historyBoxHeigth = 40 * self.historyModel.filteredItemsUnique().length;
			$("#historyBox").css("height", historyBoxHeigth + "px");
		} else {
			$("#historyBox").css("height", 0);
		}
	}
};

/** 
 * The method provides rendering browserHistory array. For rendering is used {{#crossLink "BrowserApplication.HistoryModel"}}{{/crossLink}}.
 * @method renderBrowserHistory
 * @param {Array} newBrowserHistory Array of browser history.
 * @private
 */
Browser.prototype.renderBrowserHistory = function(newBrowserHistory) {
	"use strict";
	this.historyModel.renderBrowserHistory(newBrowserHistory);
};
/** 
 * The method provides load browserHistory array from local storage.
 * @method loadBrowserHistory
 * @private
 */
Browser.prototype.loadBrowserHistory = function() {
	"use strict";
	if (typeof (window.localStorage) !== 'undefined') {
		var tmpHistory = window.localStorage.getItem(this.localStorageBrowserHistoryKey);
		if (tmpHistory !== "" && tmpHistory !== null) {
			this.browserHistory = JSON.parse(tmpHistory);
		}
	} else {
		throw "window.localStorage, not defined";
	}
};
/** 
 * The method provides save browserHistory array into local storage.
 * @method saveBrowserHistory
 * @private
 */
Browser.prototype.saveBrowserHistory = function() {
	"use strict";
	if (typeof (window.localStorage) !== 'undefined') {
		window.localStorage.setItem(this.localStorageBrowserHistoryKey, JSON.stringify(this.browserHistory));

	} else {
		console.log("window.localStorage, not defined");
	}
};
/** 
 * The method loads current url of all tabs in web browser from local storage.
 * @method loadCurrentTabs
 * @private
 */
Browser.prototype.loadCurrentTabs = function() {
	"use strict";
	var tmpTabs, tabsCount, i, browserExitedNormally;
	if (typeof (window.localStorage) !== 'undefined') {
		tmpTabs = window.localStorage.getItem(this.localStorageTabsUrlBrowserKey);
		browserExitedNormally = window.localStorage.getItem("browserExitedNormally");
		if (!!tmpTabs && tmpTabs !== "" && !!browserExitedNormally && browserExitedNormally === "true") {
			tmpTabs = JSON.parse(tmpTabs);
			tabsCount = tmpTabs.length;
			for (i = 0; i < tabsCount; i++) {
				if (tmpTabs[i][0] !== null && tmpTabs[i][0] !== undefined) {
					var tmpTabsHistoryLength = tmpTabs[i].length;

					if (validateURL(tmpTabs[i][tmpTabsHistoryLength - 1])) {
						TabController.addTab(this.getValidInput(tmpTabs[i][tmpTabsHistoryLength - 1]));
					} else if (tmpTabs[i][tmpTabsHistoryLength - 1] === TabController.EMPTY_URL) {
						TabController.addTab("");
					} else {
						TabController.addTab(this.searchEngineUrl + "/search?q=" + this.getValidInput(tmpTabs[i][tmpTabsHistoryLength - 1]));
					}
					this.tabsHistoryCurrentPosition[i] = tmpTabsHistoryLength - 1;
					this.tabsHistory[i] = tmpTabs[i];
				}
			}
			this.activeTabIndex = parseInt(window.localStorage.getItem(this.ActiveTabIndexKey), 10);
			if (this.activeTabIndex === "" || this.activeTabIndex === null || isNaN(this.activeTabIndex)) {
				this.activeTabIndex = 0;
			}
			TabController.setActiveTabByIndex(this.activeTabIndex);
		} else {
			window.localStorage.removeItem(this.localStorageTabsUrlBrowserKey);
			TabController.addTab(this.defaultHomePage);
			this.addCurrentTabHistory(this.defaultHomePage);
		}
	} else {
		console.log("window.localStorage, not defined");
	}
	this.activeTab = TabController.getActiveTab();
	this.historyModel.inputValue(this.getValidInput(this.activeTab.url));
};
/** 
 * The method saves current url of all tabs in web browser into local storage.
 * @method saveCurrentTabs
 * @private
 */
Browser.prototype.saveCurrentTabs = function() {
	"use strict";
	var i, tabsCount;
	var tabsUrl = [];
	if (typeof (window.localStorage) !== 'undefined') {
		if (!this.initializeBrowser) {
			window.localStorage.setItem(this.localStorageTabsUrlBrowserKey, JSON.stringify(this.tabsHistory));
			window.localStorage.setItem(this.ActiveTabIndexKey, this.activeTabIndex);
		}
	} else {
		console.log("window.localStorage, not defined");
	}
};

/** 
 * The method shows home page in current browser tab.
 * @method goToHomePage
 */
Browser.prototype.goToHomePage = function() {
	"use strict";
	this.activeTab.changeUrl(this.defaultHomePage);
	this.addCurrentTabHistory(this.defaultHomePage);
	this.addHistory(this.defaultHomePage);
	this.historyModel.inputValue(this.defaultHomePage);
};
/** 
 * The method adds new history entry of current tab to tabsHistory array.
 * @method addCurrentTabHistory
 * @param {String} newUrl New url string.
 */

Browser.prototype.addCurrentTabHistory = function(newUrl) {
	"use strict";
	this.addTabHistory(newUrl, this.activeTabIndex);
};
/** 
 * This method adds new history entry of all tabs to tabsHistory array.
 * @method addTabHistory
 * @param {String} newUrl New url string.
 * @param {Integer} index Index Of Tab.
 */
Browser.prototype.addTabHistory = function(newUrl, index) {
	"use strict";
	newUrl = newUrl.toString().trim().toLowerCase();
	var theTabHistory = this.tabsHistory[index];
	var i;
	if (!this.moveInHistory[index]) {
		if (theTabHistory[this.tabsHistoryCurrentPosition[index]] !== newUrl && newUrl.search("error.html") === -1 && newUrl.search("warning.html") === -1 && newUrl.search("file") === -1) {
			//before push element, delete all entry with rather index as current element ( it is mean ,  i'm in history and add new url. Younger element as current is delete.)
			if (this.tabsHistoryCurrentPosition[index] !== theTabHistory.length - 1) {
				for (i = (this.tabsHistoryCurrentPosition[index] + 1); i <= theTabHistory.length; i++) {
					theTabHistory.pop();
				}
			}

			if (theTabHistory[0] === null || theTabHistory[0] === undefined) {
				theTabHistory[0] = newUrl;
			} else {
				theTabHistory.push(newUrl);
			}

			// after adding elements delete all the old elements so that the length of the list was maxTabsHistoryElement
			if (theTabHistory.length > this.maxTabsHistoryElement) {
				for (i = 0; i <= (theTabHistory.length - this.maxTabsHistoryElement); i++) {
					theTabHistory.shift();
				}
			}

			this.tabsHistory[index] = theTabHistory;
			this.tabsHistoryCurrentPosition[index] = theTabHistory.length - 1;
		}
	}
	this.enableDisableControlButton();
	this.saveCurrentTabs();
};
/** 
 * The method adds enable/disable back and next buttons.
 * @method enableDisableControlButton
 */
Browser.prototype.enableDisableControlButton = function() {
	"use strict";
	if (this.tabsHistoryCurrentPosition[this.activeTabIndex] === 0) {
		if ($(".backButtonBrowser .iconBrowser").hasClass("iconBackBrowser")) {
			$(".backButtonBrowser .iconBrowser").removeClass("iconBackBrowser");
			$(".backButtonBrowser .iconBrowser").addClass("iconBackBrowser_noHover");
			$(".backButtonBrowser .disableBox").show();
		}
	} else {
		if ($(".backButtonBrowser .iconBrowser").hasClass("iconBackBrowser_noHover")) {
			$(".backButtonBrowser .iconBrowser").removeClass("iconBackBrowser_noHover");
			$(".backButtonBrowser .iconBrowser").addClass("iconBackBrowser");
			$(".backButtonBrowser .disableBox").hide();
		}
	}
	if (this.tabsHistoryCurrentPosition[this.activeTabIndex] >= this.tabsHistory[this.activeTabIndex].length - 1) {
		if ($(".forwardButtonBrowser .iconBrowser").hasClass("iconForwardBrowser")) {
			$(".forwardButtonBrowser .iconBrowser").removeClass("iconForwardBrowser");
			$(".forwardButtonBrowser .iconBrowser").addClass("iconForwardBrowser_noHover");
			$(".forwardButtonBrowser .disableBox").show();
		}
	} else {
		if ($(".forwardButtonBrowser .iconBrowser").hasClass("iconForwardBrowser_noHover")) {
			$(".forwardButtonBrowser .iconBrowser").removeClass("iconForwardBrowser_noHover");
			$(".forwardButtonBrowser .iconBrowser").addClass("iconForwardBrowser");
			$(".forwardButtonBrowser .disableBox").hide();
		}
	}
};
/** 
 * The method removes tab history entry from tabsHistory array.
 * @method removeTabHistory
 * @param {Integer} index Index of remove tab.
 */
Browser.prototype.removeTabHistory = function(index) {
	"use strict";
	var i, tabsHistoryLength;
	if (index >= 0) {
		tabsHistoryLength = this.tabsHistory.length;
		for (i = index; i < this.tabsHistory.length - 1; i++) {
			this.tabsHistory[i] = this.tabsHistory[i + 1];
		}
		this.tabsHistory[tabsHistoryLength - 1] = [];
		this.saveCurrentTabs();
	}
};

/** 
 * The method provides action for back button click in browser.
 * @method backButtonClick
 */
Browser.prototype.backButtonClick = function() {
	"use strict";

	var theTabHistory = this.tabsHistory[this.activeTabIndex];
	var currentHistoryPosition = this.tabsHistoryCurrentPosition[this.activeTabIndex];
	currentHistoryPosition = currentHistoryPosition - 1;
	if (currentHistoryPosition < 0) {
		currentHistoryPosition = 0;
	}
	var newUrl = this.getValidInput(theTabHistory[currentHistoryPosition]);
	this.tabsHistoryCurrentPosition[this.activeTabIndex] = currentHistoryPosition;
	this.historyModel.inputValue(newUrl);
	this.goToUrl();
	this.enableDisableControlButton();
	this.moveInHistory[this.activeTabIndex] = true;
};
/** 
 * The method provides action for next button click in browser.
 * @method nextButtonClick
 */
Browser.prototype.nextButtonClick = function() {
	"use strict";
	var theTabHistory = this.tabsHistory[this.activeTabIndex];
	var currentHistoryPosition = this.tabsHistoryCurrentPosition[this.activeTabIndex];
	currentHistoryPosition = currentHistoryPosition + 1;
	if (currentHistoryPosition >= theTabHistory.length) {
		currentHistoryPosition = theTabHistory.length - 1;
	}
	var newUrl = this.getValidInput(theTabHistory[currentHistoryPosition]);
	this.tabsHistoryCurrentPosition[this.activeTabIndex] = currentHistoryPosition;

	this.historyModel.inputValue(newUrl);
	this.goToUrl();
	this.enableDisableControlButton();
	this.moveInHistory[this.activeTabIndex] = true;
};
/** 
 * The method adds new history entry to browser history array.
 * @method addHistory
 * @param {String} newUrl New url string.
 */
Browser.prototype.addHistory = function(newUrl) {
	"use strict";
	var browserHistorylength, i;
	if (!this.moveInHistory[this.activeTabIndex]) {
		browserHistorylength = this.browserHistory.length;
		if (this.browserHistory[0] !== newUrl && newUrl.search("error.html") === -1 && newUrl.toLowerCase().search("file") === -1) {
			if (this.browserHistory !== null) {
				this.browserHistory.unshift(newUrl);
			} else {
				this.browserHistory = [];
				this.browserHistory[0] = newUrl;
			}
			browserHistorylength = this.browserHistory.length;
			if (browserHistorylength > this.maxBrowserHistoryElement) {
				for (i = this.maxBrowserHistoryElement; i < browserHistorylength; i++) {
					this.browserHistory.pop();
				}
			}
		}
		this.saveBrowserHistory();
	}
};
/** 
 * The method shows the page of the entered url. If entered url isn't valid, then specified expression is searched on Bing.
 * @method goToUrl
 */
Browser.prototype.goToUrl = function() {
	"use strict";
	var i;
	var inputValue = this.historyModel.inputValue();
	inputValue = document.getElementById('inputBrowser').value;
	var inputValueLowerCase = inputValue.toString().trim().toLowerCase();
	console.log("goToUrl "+inputValue);
	try {
		if (inputValue !== "" && inputValue !== TabController.EMPTY_URL) {
			if (inputValueLowerCase.indexOf("http") === -1 && inputValueLowerCase.indexOf("www") !== -1) {
				inputValue = "http://" + inputValue;
			}
			//this.addHistory(inputValue);

			if (validateURL(inputValue)) {
				this.activeTab.changeUrl(inputValue);
			} else {
				inputValue = this.searchEngineUrl + "/search?q=" + inputValue;
				this.activeTab.changeUrl(inputValue);
			}
			this.addCurrentTabHistory(inputValue);
			this.addHistory(inputValue);

			this.saveBrowserHistory();

			this.renderBrowserHistory(this.browserHistory);
		} else if (inputValue === TabController.EMPTY_URL) {
			this.activeTab.changeUrl(TabController.EMPTY_URL);
		}
		this.showHistory(false);
		this.enableDisableControlButton();
	} catch (err) {
		console.log(err);
	}
};
/** 
 * This method goes to entered url, when in the input box the Enter key is pressed.
 * @method goByEnter
 * @param e {Event} Event from keyboard action.
 */
Browser.prototype.goByEnter = function(e) {
	"use strict";
	if (e.keyCode === 13) {
		this.goToUrl();
	}
};
/** 
 * The method provides action for refresh button click in browser.
 * @method refresh
 */
Browser.prototype.refresh = function() {
	"use strict";
	this.historyModel.inputValue(this.getValidInput(this.activeTab.url));
	this.goToUrl();
};
/** 
 * The method formats url to valid format.
 * @method getValidInput
 * @param newUrl {String} Unformatted url to format.
 * @return {String} Valid url.
 */
Browser.prototype.getValidInput = function(newUrl) {
	"use strict";
	var url = newUrl.toString().trim().toLowerCase();
	if (url.endsWith("/")) {
		url = url.slice(0, url.length - 1);
	}
	if (url === "" || url.indexOf("data:text/html") >= 0) {
		url = TabController.EMPTY_URL;
	}
	/*else if (url.indexOf(this.searchEngineUrl + "/search?q=") >= 0) {
		var tmp = url.split(this.searchEngineUrl + "/search?q=");
		var tmp2 = tmp[1].split("&");
		url = tmp2[0];
	}*/
	return url;
};

/**
 * The method is used for network connection test.
 *
 * @method checkOnlineWifiNetwork
 */
Browser.prototype.checkOnlineWifiNetwork = function() {
	"use strict";
	var success = function(data, textStatus, jqXHR) {
			console.log("online Check successful");
			$("#messageWrapper").hide();
			self.isOnline = true;
			if ($("#onLineIndicator").hasClass("onLineIndicatorFalse")) {
				$("#onLineIndicator").removeClass("onLineIndicatorFalse");
				$("#onLineIndicator").addClass("onLineIndicatorTrue");
			}
		};
	var errror = function(jqXHR, textStatus, errorThrown) {
			console.log("online Check failed");
			if (self.isOnline) {
				showMessage("Unable to connect to internet", "Network conection error");
				
				$('#actionBlocker').removeAttr('style');
				for (var i = 0; i < TabController.tabs.length; i++) {
					if (TabController.tabs[i].isLoading) {
						TabController.tabs[i].contentView.attr('src', './error.html');
						TabController.tabs[i].tabView.find('.tabIcon').removeAttr('style');
					}
				}
				
				self.isOnline = false;
				if ($("#onLineIndicator").hasClass("onLineIndicatorTrue")) {
					$("#onLineIndicator").removeClass("onLineIndicatorTrue");
					$("#onLineIndicator").addClass("onLineIndicatorFalse");
				}
			}
		};
	var self = this;
	$.ajax({
		type : 'HEAD',
		url : "http://www.bing.com",
		timeout : 10000,
		//dataType: "html",
		success : success,
		error : success
	});
};
console.log('Browser.js end');
