/* global TabController, browser, validateURL, URI, isPopupMessageVisible, showPopupMessage */
/**
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/**
 * This class provides methods and properties to manage tab behaviour. [JQuery](http://jquery.com/) library is used for document traversal and manipulation with html elements.
 * 
 * @class Tab
 * @module BrowserApplication
 * @namespace BrowserApplication
 * @constructor
 * @param id {String} Unique tab identifier.
 * @param [url] {String} A url of the opened tab.
 */

function Tab(id, url) {
	"use strict";
	var that = this;

	this.id = id;
	this.tabView = $('#tab_' + id);
	this.contentView = $('#content_' + id);

	this.tabView.append('<div class="tabIcon"></div><div class="text fontWeightBold"></div><div class="closeTabBtn fontSizeXLarge"></div>');

	url = url || TabController.EMPTY_URL;
	this.changeUrl(url, true);

	// register events handlers
	this.tabView.on('click', function() {
		if (!that.active) {
			that.activate();
		}
	});
	this.tabView.find('.closeTabBtn').on('click', function() {
		that.close();
	});

	this.contentView.on('load', function() {
		var i, links, touchTimeout, link, iconUrl, iconUrls = [], title, index;

		//error on while page request handling
		if (that.contentView.contents()[0].URL !== 'about:blank') {
			that.isLoading = false;
			if (that.active) {
				$('#actionBlocker').removeAttr('style');
			}

			// favicon obtaining
			iconUrl = that.contentView.contents().find('link[rel*="icon"]');
			if (iconUrl.length) {
				iconUrl = iconUrl[0].href;
				iconUrls.push(iconUrl);
			}
			iconUrl = URI(that.contentView.contents()[0].baseURI);
			iconUrls.push(iconUrl.protocol().toString() + "://" + iconUrl.hostname().toString() + '/favicon.ico');
			Tab.checkFavicons(iconUrls, function(url) {
				that.tabView.find('.tabIcon').css('background-image', 'url(\'' + url + '\')');
			}, function() {
				that.tabView.find('.tabIcon').removeAttr('style');
			});

			title = that.contentView.contents().find('title').text();
			if (title) {
				that.tabView.find('.text').text(title);
			}

			// links href handling
			links = that.contentView.contents().find('[href]:not([href*="#"])');
			links.on('click', function(e) {
				if (!touchTimeout && !isPopupMessageVisible()) {
					if (!!e.currentTarget && !!e.currentTarget.href && validateURL(e.currentTarget.href)) {
						that.changeUrl(e.currentTarget.href, true);
						/**
						 * Triggers when active tab content is loaded. It's standard
						 * [jQuery](http://jquery.com/) event and it is triggered on **#tabBar** element.
						 * 
						 * @event linkClicked
						 * @param url {String} A url of clicked link obtained from **href** attribute.
						 */
						$('#tabBar').trigger('linkClicked', e.currentTarget.href);
						e.preventDefault();
						e.stopPropagation();
						return false;
					} else {
						console.log("Clicked link is undefined or is not properly formed URL.");
					}
				} else {
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
			});

			// longpress handling
			links.on('touchstart', function(e) {
				touchTimeout = setTimeout(function() {
					touchTimeout = null;
					if (!!e.currentTarget && !!e.currentTarget.href && validateURL(e.currentTarget.href)) {
						if (TabController.tabs.length < TabController.TABS_COUNT_LIMIT) {
							TabController.addTab(e.currentTarget.href);
						} else {
							showPopupMessage("MAXIMUM NUMBER OF OPENED TABS EXCEEDED.");
						}
					} else {
						showPopupMessage("REQUESTED LINK IS NOT SUPPORTED.");
					}
					e.preventDefault();
					e.stopPropagation();
					return false;
				}, 1000);
			});
			links.on('touchend', function(e) {
				if (!!touchTimeout) {
					clearTimeout(touchTimeout);
					touchTimeout = null;
				}
			});

			//links target translating
			links = that.contentView.contents().find('[href]').find('[target]');
			for (i = 0; i < links.length; i++) {
				link = $(links[i]);
				switch (link.attr('target')) {
				case '_blank':
				case 'blank':
				case '_top':
				case '_parent':
					link.attr('target', '_self');
					link.removeAttr('rel');
					break;
				}
			}

			index = TabController.getTabIndex(that);
			if (that.active) {
				/**
				 * Triggers when active tab content is loaded. It's standard
				 * [jQuery](http://jquery.com/) event and it is triggered on **#tabBar** element.
				 * 
				 * @event activeTabLoaded
				 * @param Object {Object} Object which contains two attributes, **content** and **index**. **Content** attribute contains loaded tab content. **Index** holds the index of loaded tab.
				 */
				$('#tabBar').trigger('activeTabLoaded', {
					content : that.contentView.contents()[0],
					index : index
				});
			}
			/**
			 * Triggers when tab content is loaded.
			 * It's standard [jQuery](http://jquery.com/) event and it is triggered on **#tabBar** element.
			 * 
			 * @event tabLoaded
			 * @param Object {Object} Object which contains two attributes, **content** and **index**. **Content** attribute contains loaded tab content. **Index** holds the index of loaded tab.
			 */
			$('#tabBar').trigger('tabLoaded', {
				content : that.contentView.contents()[0],
				index : index
			});
		}
	});
}

/**
 * An implicit timeout to be used by the functions with a **timeout** as one of their parameter. If the timeout parameter is not specified in calls of those functions, the implicit one is used.
 * 
 * @property ERROR_TIMEOUT {Number}
 * @static
 * @default 10000
 */
Tab.ERROR_TIMEOUT = 10000;
/**
 * This property holds unique tab identifier usually generated by {{#crossLink "BrowserApplication.TabController/generateTabId:method"}}TabController.generateTabId{{/crossLink}}
 * method.
 * 
 * @property id {String}
 * @default null
 */
Tab.prototype.id = null;
/**
 * This property holds tab url.
 * 
 * @property url {String}
 * @default null
 */
Tab.prototype.url = null;
/**
 * This property holds [jQuery](http://jquery.com/) dom element which represents tab in tabs view.
 * 
 * @property tabView {jQuery}
 * @default null
 */
Tab.prototype.tabView = null;
/**
 * This property holds [jQuery](http://jquery.com/) dom element which represents tab content.
 * Tab content container is an [iframe](http://www.w3schools.com/TAGS/tag_iframe.asp) html element.
 * 
 * @property contentView {jQuery}
 * @default null
 */
Tab.prototype.contentView = null;
/**
 * This property indicates whether tab is active, or not.
 * 
 * @property active {Boolean}
 * @default true
 */
Tab.prototype.active = true;
/**
 * This property indicates whether tab is in the state of loading it's content.
 * 
 * @property isLoading {Boolean}
 * @default false
 */
Tab.prototype.isLoading = false;

/**
 * Method to validate an existence of HEAD of specified url. If a specified url has defined a HEAD, it is returned as a parameter of successCB, otherwise errorCB is invoked.
 * 
 * @method checkHead
 * @param url {String} Url to validate an existence of HEAD, meaning the url is valid.
 * @param timeout {Number} Timeout to obtain HEAD of the url.
 * @param successCB {Function} Success callback. A callback to be invoked if the specified url contains a HEAD, which is returned as a parameter of the function.
 * @param successCB.data {Object} The data from the server.
 * @param successCB.textStatus {String} Describes status.
 * @param successCB.jqXHR {Object} XMLHttpRequest object.
 * @param errorCB {Function} Error callback to be invoked either when the specified url doesn't exist, or when a time given by timeout has passed.
 * @param errorCB.jqXHR {Object} XMLHttpRequest object.
 * @param errorCB.textStatus {String} Describes status.
 * @param errorCB.errorThrown  {String} Thrown error.
 * @static
 */
Tab.checkHead = function(url, timeout, successCB, errorCB) {
	"use strict";
	$.ajax({
		type : 'HEAD',
		async : true,
		url : url,
		timeout : timeout || Tab.ERROR_TIMEOUT,
		success : successCB,
		error : errorCB
	});
};

/**
 * Checks for existence of any of provided favicon urls and returns first valid url as a parameter of successCB function, otherwise errorCB is invoked.
 * 
 * @method checkFavicons
 * @param urls {Array} Array of favicon urls to be checked.
 * @param successCB {Function} Success callback. A callback to be invoked when first valid url is found.
 * @param successCB.url {String} Successfully validated url.
 * @param errorCB {Function} Error callback to be invoked when the array of provided favicons doesn't contain any valid url.
 * @static
 */
Tab.checkFavicons = function(urls, successCB, errorCB) {
	"use strict";
	if (urls.length) {
		var index = 0;

		var testFavicon = function(url) {
			Tab.checkHead(url, 1500, function() {
				if (!!successCB) {
					successCB(url);
				}
			}, function() {
				if (index + 1 < urls.length) {
					index++;
					testFavicon(urls[index]);
				} else {
					if (!!errorCB) {
						errorCB();
					}
				}
			});
		};

		testFavicon(urls[index]);
	} else {
		if (!!errorCB) {
			errorCB();
		}
	}
};

/**
 * Method to provide validation of web page specified by its url.
 * 
 * @method checkPage
 * @param url {string} A url of web page to be validated.
 */
Tab.prototype.checkPage = function(url) {
	"use strict";
	var that = this;

	Tab.checkHead(url, Tab.ERROR_TIMEOUT, function(message, text, response) {
		if (that.url === url) {
			if (!!response) {
				if (!!response.getResponseHeader("X-Frame-Options")) {
					that.contentView.attr('src', './warning.html');
					that.tabView.find('.tabIcon').removeAttr('style');
				} else {
					that.contentView.attr('src', url);
				}
			} else {
				that.contentView.attr('src', './error.html');
				that.tabView.find('.tabIcon').removeAttr('style');
			}
		}
	}, function(err) {
		if (that.url === url) {
			console.log(err);
			that.contentView.attr('src', './error.html');
			that.tabView.find('.tabIcon').removeAttr('style');
		}
	});
};

/**
 * Provides a functionality to change the tab url.
 * 
 * @method changeUrl
 * @param url {String} A url to be used as a new tab's url.
 * @param [keepContent] {Boolean} Determines if currently displayed content will be kept or
 * removed by setting **src** attribute of 
 * {{#crossLink "BrowserApplication.Tab/contentView:property"}}Tab.contentView{{/crossLink}} to "about:blank".
 */
Tab.prototype.changeUrl = function(url, keepContent) {
	"use strict";
	this.url = url;
	/*
	if (!keepContent) {
		this.contentView.attr('src', 'about:blank');
	}
	if (url === TabController.EMPTY_URL) {
		this.isLoading = false;
		$('#actionBlocker').removeAttr('style');
		this.tabView.find('.tabIcon').removeAttr('style');
		this.tabView.find('.text').text('New Tab');
	} else {
		this.isLoading = true;
		$('#actionBlocker').css('z-index', '10000');
		this.tabView.find('.tabIcon').css('background-image', 'url(\'./css/images/load.gif\')');
		this.tabView.find('.text').text(this.url.replace('http://', ''));
		this.checkPage(url);
	}*/
	//this.isLoading = true;
	//$('#actionBlocker').css('z-index', '10000');
	//this.checkPage(url);
	this.contentView[0].src = url;
	this.tabView.find('.text').text(this.url.replace('http://', ''));
	console.log("contentView Src = "+url);
	console.log(this.contentView);
};

/**
 * Hides the tab content and modifies tab header, ie. removes a close button from the header.
 * 
 * @method deactivate
 */
Tab.prototype.deactivate = function() {
	"use strict";
	this.contentView.css('display', 'none');
	this.tabView.removeClass('active bgColorThemeTransparent');
	this.tabView.find('.closeTabBtn').removeAttr('style');
	this.active = false;
};

/**
 * Shows tab content and modifies tab header, ie. makes close button visible.
 * 
 * @method activate
 */
Tab.prototype.activate = function() {
	"use strict";
	if (this.isLoading) {
		$('#actionBlocker').css('z-index', '10000');
	} else {
		$('#actionBlocker').removeAttr('style');
	}
	for ( var i = 0; i < TabController.tabs.length; i++) {
		if (TabController.tabs[i].active) {
			TabController.tabs[i].deactivate();
		}
	}
	this.contentView.css('display', 'block');
	this.tabView.addClass('active bgColorThemeTransparent');
	if (TabController.tabs.length > 1) {
		this.tabView.find('.closeTabBtn').css('display', 'block');
	}
	TabController.calculateTabMaxWidth();
	this.active = true;
	if (TabController.activeTab !== this) {
		TabController.setActiveTab(this);
	}
};

/**
 * Method to close a tab. It removes it's views, as well as removes the tab from {{#crossLink "BrowserApplication.TabController/tabs:property"}}TabController.tabs{{/crossLink}} array.
 * 
 * @method close
 */
Tab.prototype.close = function() {
	"use strict";
	this.tabView.remove();
	this.contentView.remove();
	this.tabView = null;
	this.contentView = null;
	TabController.removeTab(this.id);
};

