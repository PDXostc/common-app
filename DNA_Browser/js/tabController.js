/* global Tab */
/**
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */
/**
 * This class provides methods to manage tabs Object {{#crossLink "BrowserApplication.Tab"}}{{/crossLink}}. [JQuery](http://jquery.com/) library is used for document traversal and manipulation with html elements.
 * 
 * @class TabController
 * @module BrowserApplication
 * @namespace BrowserApplication
 * @static
 */

function TabController() {
	"use strict";
}

/**
 * This property holds empty URL string.
 * 
 * @property EMPTY_URL {Number}
 * @static
 * @default 'www.'
 */
TabController.EMPTY_URL = 'www.';

/**
 * This property holds maximum count of opened tabs.
 * 
 * @property TABS_COUNT_LIMIT {Number}
 * @static
 * @default 5
 */
TabController.TABS_COUNT_LIMIT = 5;

/**
 * This property holds array of opened tabs.
 * 
 * @property tabs {Array}
 * @default []
 * @static
 */
TabController.tabs = [];

/**
 * This property holds active tab.
 * 
 * @property activeTab {BrowserApplication.Tab}
 * @default null
 * @static
 */
TabController.activeTab = null;

/**
 * Method to set a tab as active one. It triggers {{#crossLink "BrowserApplication.TabController/activeTabChanged:event"}}activeTabChanged{{/crossLink}} event, once the tab is activated.
 * 
 * @method setActiveTab
 * @param tab {BrowserApplication.Tab} A tab to be set as active.
 * @static
 */
TabController.setActiveTab = function(tab) {
	"use strict";
	TabController.activeTab = tab;
	if (tab && !tab.active) {
		tab.activate();
	}
	TabController.calculateTabMaxWidth();
	/**
	 * Triggers when {{#crossLink "BrowserApplication.TabController/setActiveTab:method"}}TabController.setActiveTab(tab){{/crossLink}}
	 * is called. It's standard [jQuery](http://jquery.com/) event and it is triggered on **#tabBar** element.
	 * 
	 * @event activeTabChanged
	 * @param activeTab {BrowserApplication.Tab} Current active tab.
	 */
	$('#tabBar').trigger('activeTabChanged', TabController.activeTab);
};

/**
 * Method  to set active tab by its index in {{#crossLink "BrowserApplication.TabController/tabs:property"}}TabController.tabs{{/crossLink}} array. It triggers 
 * {{#crossLink "BrowserApplication.TabController/activeTabChanged:event"}}activeTabChanged{{/crossLink}} event, once the tab is activated.
 * In case of invalid index, tab with highest index will be activated.
 * 
 * @method setActiveTabByIndex
 * @param index {Number} Index of the tab to be activated.
 * @static
 */
TabController.setActiveTabByIndex = function(index) {
	"use strict";
	var tab;

	if (index >= 0 && index < TabController.tabs.length) {
		tab = TabController.tabs[index];
	} else {
		tab = TabController.tabs[TabController.tabs.length - 1];
	}

	TabController.activeTab = tab;
	if (tab && !tab.active) {
		tab.activate();
	}
	$('#tabBar').trigger('activeTabChanged', TabController.activeTab);
};

/**
 * Method to return active tab.
 * 
 * @method getActiveTab
 * @return {BrowserApplication.Tab} Currently active tab.
 * @static
 */
TabController.getActiveTab = function() {
	"use strict";
	return TabController.activeTab;
};

/**
 * Returns index of active tab from
 * {{#crossLink "BrowserApplication.TabController/tabs:property"}}TabController.tabs{{/crossLink}} array.
 * 
 * @method getActiveTabIndex
 * @return {Number} Index of active tab if the tab is found, otherwise it returns -1.
 * @static
 */
TabController.getActiveTabIndex = function() {
	"use strict";
	for ( var i = 0; i < TabController.tabs.length; i++) {
		if (TabController.tabs[i] === TabController.activeTab) {
			return i;
		}
	}
	return -1;
};

/**
 * Returns index of the tab specified as an agument to the function from 
 * {{#crossLink "BrowserApplication.TabController/tabs:property"}}TabController.tabs{{/crossLink}} array.
 * 
 * @method getTabIndex
 * @param tab {BrowserApplication.Tab} A tab for which an index is to be searched for.
 * @return {Number} An index of the tab if the tab is found, otherwise it returns -1.
 * @static
 */
TabController.getTabIndex = function(tab) {
	"use strict";
	for ( var i = 0; i < TabController.tabs.length; i++) {
		if (TabController.tabs[i] === tab) {
			return i;
		}
	}
	return -1;
};

/**
 * Method to initialize TabController at startup of the application.
 * 
 * @method initialize
 * @static
 */
TabController.initialize = function() {
	"use strict";
	$('#tabBar #addTabBtn').on('click', function(e) {
		TabController.addTab(TabController.EMPTY_URL);
	});
};

/**
 * Provides functionality to add new tab into 
 * {{#crossLink "BrowserApplication.TabController/tabs:property"}}TabController.tabs{{/crossLink}} array.
 * 
 * @method addTab
 * @param url {String} A url of a tab to be added to the array.
 * @static
 */
TabController.addTab = function(url) {
	"use strict";
	if (TabController.tabs.length <= TabController.TABS_COUNT_LIMIT) {
		var tabId, tab;

		tabId = TabController.generateTabId();
		$('#tabBar #addTabBtn').before('<div id="tab_' + tabId + '" class="tab boxShadowInset"></div>');
		$('#browserContent').append('<iframe id="content_' + tabId + '" name="content_' + tabId + '" class="jlrIFrame"></iframe>');
		for ( var i = 0; i < TabController.tabs.length; i++) {
			TabController.tabs[i].deactivate();
		}
		tab = new Tab(tabId, url);
		TabController.tabs.push(tab);
		TabController.setActiveTab(tab);
		tab.activate();

		if (TabController.tabs.length >= TabController.TABS_COUNT_LIMIT) {
			$('#tabBar #addTabBtn').css('display', 'none');
		}
		TabController.calculateTabMaxWidth();

		/**
		 * Triggers when {{#crossLink "BrowserApplication.TabController/addTab:method"}}TabController.addTab(url?){{/crossLink}} is called.
		 * It's standard [jQuery](http://jquery.com/) event and it is triggered on **#tabBar** element.
		 * 
		 * @event tabAdded
		 * @param tab {Tab} Added tab.
		 */
		$('#tabBar').trigger('tabAdded', tab);
	}
};

/**
 * Method to remove a tab specificied by its 
 * {{#crossLink "BrowserApplication.Tab/id:property"}}BrowserApplication.Tab.id{{/crossLink}} from
 * {{#crossLink "BrowserApplication.TabController/tabs:property"}}TabController.tabs{{/crossLink}} array.
 * 
 * @method removeTab
 * @param tabId {String} An ID of the tab to be removed.
 * @static
 */
TabController.removeTab = function(tabId) {
	"use strict";
	var removedIndex;

	for ( var i = 0; i < TabController.tabs.length; i++) {
		if (TabController.tabs[i].id === tabId) {
			removedIndex = i;
			TabController.tabs.splice(i, 1);
			if (TabController.tabs.length > 0) {
				if (i >= TabController.tabs.length) {
					i--;
				}
				TabController.tabs[i].activate();
			}
			break;
		}
	}
	if (TabController.tabs.length < TabController.TABS_COUNT_LIMIT) {
		$('#tabBar #addTabBtn').css('display', 'block');
	}
	TabController.calculateTabMaxWidth();

	/**
	 * Triggers when {{#crossLink "BrowserApplication.TabController/removeTab:method"}}TabController.removeTab(tabId){{/crossLink}} is called.
	 * It's standard [jQuery](http://jquery.com/) event and it is triggered on **#tabBar** element.
	 * 
	 * @event tabRemoved
	 * @param tabIndex {Number} Removed tab index.
	 */
	$('#tabBar').trigger('tabRemoved', (removedIndex !== undefined) ? removedIndex : -1);
};

/**
 * Generates unique tab ID string and verifies that generated ID is not used in
 * {{#crossLink "BrowserApplication.TabController/tabs:property"}}TabController.tabs{{/crossLink}} array.
 * This method is used in {{#crossLink "BrowserApplication.TabController/addTab:method"}}TabController.addTab(){{/crossLink}} 
 * to get unique ID for new tab.
 * 
 * @method generateTabId
 * @return {String} Generated unique tab identifier.
 * @static
 */
TabController.generateTabId = function() {
	"use strict";
	var id;

	id = Math.floor((Math.random() + 1) * 65536);
	id = id.toString(16).substring(1);

	for ( var i = 0; i < TabController.tabs.length; i++) {
		if (id === TabController.tabs[i].id) {
			return TabController.generateTabId();
		}
	}

	return id;
};

/**
 * Provides sizing functionality for 
 * {{#crossLink "BrowserApplication.Tab/tabView:property"}}Tab.tabView{{/crossLink}} of all tabs. 
 * Width depends on count of the tabs in
 * {{#crossLink "BrowserApplication.TabController/addTab:method"}}TabController.addTab(){{/crossLink}} array.
 * 
 * @method calculateTabMaxWidth
 * @static
 */
TabController.calculateTabMaxWidth = function() {
	"use strict";
	var tabContainerWidth, temp;

	tabContainerWidth = $('#tabBar').width();
	if (TabController.tabs.length < TabController.TABS_COUNT_LIMIT) {
		tabContainerWidth -= $('#tabBar #addTabBtn').width();
	}
	if ((tabContainerWidth / TabController.tabs.length) < 200) {
		$('.tabBar .tab.active').css('width', '200px');
		$('.tabBar .tab.active .text').css('width', '119px');
		tabContainerWidth -= 200/*$('.tabBar .tab.active').width()*/;
		temp = (tabContainerWidth / (TabController.tabs.length - 1));
		$('.tabBar .tab').not('.active').css('width', temp + 'px');
		$('.tabBar .tab').not('.active').find('.text').css('width', (temp - 31) + 'px');
	} else {
		temp = (tabContainerWidth / TabController.tabs.length);
		$('.tabBar .tab').css('width', temp + 'px');
		$('.tabBar .tab.active .text').css('width', (temp - 81) + 'px');
		$('.tabBar .tab').not('.active').find('.text').css('width', (temp - 31) + 'px');
	}
};
