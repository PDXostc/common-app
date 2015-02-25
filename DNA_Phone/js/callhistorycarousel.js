/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */
/*global Phone, callContactCarousel*/

/** 
 */
 /**
 * This class provides methods to operate with call history carousel. It wrapps handling CarouFredSel object and provides
 * following operations:
 *
 * * Show placed, received and missed phone calls ordered by date of phone call
 * * For each call displays phone number, contact name, date and time of phone call
 *
 * @module PhoneApplication
 * @class Carousel
 * @constructor
 */
var Carousel = function() {
	"use strict";
	console.log("init Carousel");
	//this.initializeSwipe();
};
/**
* This property holds call history data array for show in html.
* @property callHistory {Array}
*/
Carousel.prototype.callHistory = [];
/**
* This property holds swipe object for internal use in carousel.
* @property swipe {Object}
* @private
*/
Carousel.prototype.swipe = null;
/**
* This property holds callback function which is called after current element in carousel is changed.
* @property indexChangeCallback {Object}
* @private
*/
Carousel.prototype.indexChangeCallback = null;
/** 
 * This method adds listener for current carousel element change.
 *
 * @method addIndexChangeListener
 * @param indexChangeCallback {function()} Callback function called after current carousel element changed.
 */
Carousel.prototype.addIndexChangeListener = function(indexChangeCallback) {
	"use strict";

	this.indexChangeCallback = indexChangeCallback;
};
/** 
 * This method initializes and configures carousel object
 *
 * @method initializeSwipe
 * @private
 */
Carousel.prototype.initializeSwipe = function() {
	"use strict";

	var self = this;
	if (!this.swipe) {
		this.swipe = $('#contactsCarousel').carouFredSel({
			auto : false,
			circular : false,
			infinite : false,
			width : 765,
			items : {
				visible : 3
			},
			swipe : {
				items : 1,
				duration : 150,
				onMouse : true,
				onTouch : true
			},
			scroll : {
				items : 1,
				duration : 150,
				onAfter : function(data) {
					if (!!self.indexChangeCallback) {
						self.indexChangeCallback(self.getCurrentPosition());
					}
				}
			}
		});
		if (!this.swipe.length) {
			this.swipe = null;
		}
	}
};
/**
 * This method provides the index of current selected item of the carousel.
 *
 * @method getCurrentPosition
 * @return Current {Integer} index position in carousel.
 */
Carousel.prototype.getCurrentPosition = function() {
	"use strict";
	var self = this;
	if (!!self.swipe) {
		var pos = parseInt(self.swipe.triggerHandler("currentPosition"), 10);
		return pos;
	}
	return null;
};
/**
 * This method moves current position of the carousel to the given index.
 *
 * @method slideTo
 * @param index {Integer}  New index position in carousel
 */
Carousel.prototype.slideTo = function(index) {
	"use strict";
	if (!!this.swipe && index >= 0 && index < this.callHistory.length) {
		this.swipe.trigger("slideTo", index);
	}
};
/**
 * This method fills carousel with call history data and resets its current position to start.
 *
 * @method loadCallHistory 
 * @param  callHistory {Array} Call history array.
 * @param  index {Integer} New index position in carousel.
 */
Carousel.prototype.loadCallHistory = function(callHistory, index) {
	"use strict";
	$("#contactsCarousel").html("");
	if (!this.CallHistoryItemTemplate) {
			this.CallHistoryItemTemplate = $("#CallHistoryItemTemplate").clone();
		}
	this.removeAllItems();
	this.callHistory = callHistory;
	this.insertPagesToSwipe();
	/*
	if (index >= 0 && index < this.callHistory.length && !!this.swipe) {
		this.swipe.trigger("slideTo", [ index, 0, {
			duration : 0
		} ]);
	}*/
};
/** 
 * This method creates one carousel item for swipe.
 *
 * @method createSwipeItem 
 * @param  callHistory {Array} Call history array.
 * @param  index {Integer} Carousel item index it is use as div id in html.
 * @return {String} New carousel item as html string. 
 * @private
 */
Carousel.prototype.createSwipeItem = function(callHistoryEntry, index) {
	"use strict";
	var self = this;
	//console.log("callHistoryCarousel.createSwipeItem()", callHistoryEntry);
	if (!!callHistoryEntry) {
		//console.log("!!callHistoryEntry true");
		var carouselItem = this.CallHistoryItemTemplate.clone()[0];

		var contact = null;
		if (!!callHistoryEntry.remoteParties && callHistoryEntry.remoteParties.length) {
			contact = Phone.getContactByPersonId(callHistoryEntry.remoteParties[0].personId);
		}

		var id = "";
		var name = "Unknown";
		var photoURI = "";
		var phoneNumber = "";
		var startTime = callHistoryEntry.startTime || "";
		var direction = callHistoryEntry.direction || "";

		if (!!callHistoryEntry.remoteParties && callHistoryEntry.remoteParties.length) {
			// personId = phoneNumber
			phoneNumber = callHistoryEntry.remoteParties[0].personId;
		}

		if (!!contact) {
			//console.log("contact true");
			if (!!contact.id) {
				id = contact.id;
			}
			if (!!contact.photoURI) {
				photoURI = contact.photoURI;
			}
			if (phoneNumber === "" && !!contact.phoneNumbers && contact.phoneNumbers.length) {
				phoneNumber = contact.phoneNumbers[0].number;
			}
			name = Phone.getDisplayNameStr(contact);
		} else {
			//console.log("contact false");
		}
		
		if (callHistoryEntry.remoteParties[0].remoteParty) {
			name = callHistoryEntry.remoteParties[0].remoteParty;
		}

		if (name === "") {
			name = "Unknown";
		}
		//carouselItem.attr("id","carouselBox_"+index);
		carouselItem.id = "carouselBox_"+index
		//carouselItem.attr("data-id",index);
		carouselItem.setAttribute("data-id",index);
		//carouselItem.children("name=contactName").text(name);
		carouselItem.querySelector("[name=contactName]").innerText=name;
		//carouselItem.children("name=contactPhone").text(phoneNumber);
		carouselItem.querySelector("[name=contactPhone]").innerText=phoneNumber;
		//carouselItem.children("name=callTime").text(startTime);
		//carouselItem.querySelector("[name=callTime]").innerText=moment(startTime).format("MMM/DD/YYYY HH:mm");//startTime;
		carouselItem.querySelector("[name=callTime]").innerText=startTime;
		//carouselItem.children("name=callDirection").text(direction);
		carouselItem.querySelector("[name=callDirection]").innerText=direction;
		/*
		carouselItem.onclick = function() {
				var contact = {
					phoneNumbers : [ {
						number : phoneNumber
					} ]
				};
				callContactCarousel(contact);
			};*/
		//carouselItem.data("callhistory", callHistoryEntry);
		carouselItem.setAttribute("data-callhistory",JSON.stringify(callHistoryEntry));
		//carouselItem.data("contact", contact);
		carouselItem.setAttribute("data-contact",JSON.stringify(contact));

/*		carouselItem = '<li>';
		carouselItem += '<div id="carouselBox_' + index + '" class="carouselBox" data-id="' + id + '">';
		carouselItem += '<div class="carouselPhotoArea">';
		carouselItem += '<div class="carouselPhotoBox noContactPhoto">';
		carouselItem += '<img class="carouselPhoto" src="' + photoURI + '" /></div></div>';
		carouselItem += '<div class="carouselInfoBox carouselName fontSizeLarger">' + '<strong>' + name + '</strong>' + '</div>';
		carouselItem += '<div class="carouselInfoBox carouselNumber fontSizeSmall">' + '<strong>' + phoneNumber + '</strong>' + '</div>';
		carouselItem += '<div class="callHistoryElement">';
		carouselItem += '<div class="missedNewCallIcon callHistoryIcon callHistoryIconGen"></div>';
		carouselItem += '<div class="callHistoryDetails">';
		carouselItem += '<div class="fontSizeXXSmall">' + startTime + '</div>';
		carouselItem += '<div class="fontSizeXXSmall">' + '<strong>' + direction + '</strong>' + '</div></div></div></div>';
		carouselItem += '</li>';

		carouselItem = $(carouselItem);
		carouselItem.data("callhistory", callHistoryEntry);
		carouselItem.data("contact", contact);
		carouselItem.click(function() {
			self.swipe.trigger("slideTo", [ $(this), -1 ]);
			var hystoryEntry = $(this).data("callhistory");
			var contactEntry = $(this).data("contact");
			var contact = {
				name : {
					displayName : contactEntry.name.displayName,
					firstName : contactEntry.name.firstName,
					lastName : contactEntry.name.lastName
				},
				photoURI : contactEntry.photoURI,
				phoneNumbers : [ {
					number : hystoryEntry.remoteParties[0].personId
				} ]

			};
			callContactCarousel(contact);
		});
		* */
		//console.log("createSwipeItem ",carouselItem);
		return carouselItem;
	} else {
		console.log("!!callHistoryEntry false");
	}

	return null;
};
/** 
 * This method inserts pages whit carousel elements to swipe.
 *
 * @method insertPagesToSwipe 
 * @private
 */
Carousel.prototype.insertPagesToSwipe = function() {
	"use strict";
	console.log("callHistoryCarousel.insertPagesToSwipe()");
	var self = this;
	var carouselItem;
	//for ( var index = this.callHistory.length - 1; index >= 0; --index) {
	for ( var index = 0; index < this.callHistory.length; index++) {
		carouselItem = this.createSwipeItem(this.callHistory[index], index);
		//console.log("carouselItem ",carouselItem);
		$("#contactsCarousel").append(carouselItem);
		/*
		if (!!carouselItem && !!this.swipe) {
			this.swipe.trigger("insertItem", [ carouselItem, 0 ]);
		}*/
	}
	//this.addCarouselEdges();
};
/** 
 * This method removes all item from carousel.
 *
 * @method removeAllItems 
 */
Carousel.prototype.removeAllItems = function() {
	"use strict";
	var carouselItem;

	if (!!this.swipe) {
		for ( var index = this.callHistory.length + 1; index >= 0; --index) {
			this.swipe.trigger("removeItem", index);
		}
	}
};
/**
 * This method adds emty carousel items to the beginning and the end of the carousel 
 * (to make sure first and last visible items appear in the middle of screen instead of at the edges when swiped to edges of carousel).
 * @method addCarouselEdges
 */
Carousel.prototype.addCarouselEdges = function() {
	"use strict";
	if (!!this.swipe) {
		var html = "<li><div class='carouselEdgeBox'></div></li>";
		this.swipe.trigger("insertItem", [ html, 0 ]);
		this.swipe.trigger("insertItem", [ html, "end", true ]);
	}
};
