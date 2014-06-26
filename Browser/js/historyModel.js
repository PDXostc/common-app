/* global ko,browser*/
/** 
 * This class provides browser history rendering, handling input events on elements in browser history and filtering.
 * It mainly uses [Knockoutjs](http://knockoutjs.com/) and [jQuery](http://jquery.com/) library for manipulation with HTML elements.
 * @class HistoryModel
 * @module BrowserApplication
 * @namespace BrowserApplication
 * @constructor
 */
var HistoryModel = function() {
	"use strict";
	var self = this;
	this.filteredItems = ko.computed(function() {
		if (!!self.inputValue()) {
			var inputValue = self.inputValue().toString().trim().toLowerCase();
			if (!!inputValue && inputValue !== "") {
				return ko.utils.arrayFilter(self.searchHistory, function(item) {
					if (item.toLowerCase().indexOf(inputValue) !== -1) {
						return true;
					}
					return false;
				});
			}
		}
		return self.searchHistory;
	});

	this.filteredItemsUnique = ko.computed(function() {
		return ko.utils.arrayGetDistinctValues(self.filteredItems()).slice(0, 10);
	});

	/** 
	 * Provides an action for click on the element in browser history model.
	 * @method clickOnBrowserHistory
	 * @param {Object} element An element which is clicked.
	 */
	this.clickOnBrowserHistory = function(element) {
		self.inputValue(element);
		if (!!browser) {
			browser.goToUrl();
		}
	};
};
/**
 * This property holds [Knockoutjs](http://knockoutjs.com/) observableArray.
 * @property searchHistory {Object}
 * @default ko.observableArray()
 */
HistoryModel.prototype.searchHistory = ko.observableArray();
/**
 * This property holds [Knockoutjs](http://knockoutjs.com/) key for search in browser history.
 * @property inputValue {Object}
 * @default ko.observable("")
 */
HistoryModel.prototype.inputValue = ko.observable("");
/**
 * This property holds [Knockoutjs](http://knockoutjs.com/) array of filtered items.
 * @property filteredItems {Object}
 * @default null
 * @private
 */
HistoryModel.prototype.filteredItems = null;
/**
 * This property holds [Knockoutjs](http://knockoutjs.com/) array of unique filtered items.
 * @property filteredItemsUnique {Integer}
 * @default null
 */
HistoryModel.prototype.filteredItemsUnique = null;

/** 
 * Provides rendering of browser history array.
 * @method renderBrowserHistory
 * @param {Array} newBrowserHistory An array of new browser history.
 */
HistoryModel.prototype.renderBrowserHistory = function(newBrowserHistory) {
	"use strict";
	this.searchHistory = newBrowserHistory;
};

