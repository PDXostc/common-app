/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/* global ko, formatPhoneNumber, moment */

/** 
 * This class provides methods to operate with contacts and call history from [tizen.phone](./native/group__phoned.html).
 * Sample contact object looks like:
 *
 *     {
 *          uid: "JeremyMartinson15417543010",
 *          personId: "15417543010",
 *			name: {
 *				firstName: "Jeremy",
 *				lastName: "Martinson"
 *				displayName :"Jeremy Martinson"
 *			},
 *			phoneNumbers: {
 *				number:"1-541-754-3010"
 *			},
 *			emails: {
 *				email: "Jeremy.Martinson@gmail.com"
 *			},
 *			photoURI: {
 *				photoURI: "url://"
 *			},
 *			addresses: {
 *				streetAddress: "455 Larkspur Dr.",
 *				city: "San Jose",
 *				country: "California",
 *				postalCode: " "
 *			}
 *     }
 *
 * @class Phone
 * @module PhoneApplication
 * @constructor
 */
var	Phone = (function() {
	"use strict";
	function Phone() {
		var self = this;
		if (typeof(tizen.phone) !== 'undefined') {
			this.phone = tizen.phone;
		} else {
			this.phone = null;
		}

		this.contacts = [];
		//this.callHistory = ko.observableArray([]);
		this.callHistory = [];

		/*this.contactsAlphabetFilter = ko.observable("");

		this.contactsComputed = ko.computed(function() {
			if (self.contactsAlphabetFilter() !== "") {
				return ko.utils.arrayFilter(self.contacts(), function(contact) {
					if ( !! contact.name && !! contact.name.leftLastName) {
						return contact.name.lastName.toString().toLowerCase().trim().indexOf(
							self.contactsAlphabetFilter().toString().toLowerCase().trim()) === 0;
					}
					return false;
				});
			}
			return self.contacts();
		});*/
	}

/**
 * This method download contacts from tizen.phone. Using  API method tizen.phone.getContacts. 
 * @method loadContacts
 * @param callback {function(error)} Callback function called after method is finished. Parameter `error` will contain any error that was intercepted.
 */

	Phone.prototype.loadContacts = function(callback) {
		console.log("phone.loadContacts()");
		var self = this;
		var i, conntactsArrayLength;
		var contactsCallback = function ( data ) 
				{ 
					//self.contacts = data.contacts; 
					self.contacts = data; 
					console.log("contactsCallback ",self.contacts);
				}
		//callback(null);
		console.log("phone.loadContacts()");
		console.log("phone.loadContacts()");
		console.log("phone.loadContacts()");
		if ( !! self.phone) {
			$.getJSON( "data/contacts.json", contactsCallback);
			callback(null);
			self.phone.getContacts(0, function(contactsArray) {
				if (contactsArray.length<1) { // Mock contacts if no contacts/
					$.getJSON( "data/contacts.json", contactsCallback);
					callback(null);
				} else {
					console.log("loadContacts",contactsArray);
					//contactsArray = self.formatContacts(contactsArray);
					self.contacts = contactsArray;
					if ( !! callback) {
						callback(null);
					}
				}
			}, function(err) {
				console.log("Error(" + err.code + "): " + err.message);
				if ( !! callback) {
					$.getJSON( "data/contacts.json", contactsCallback); // Mock contacts if error
					callback(err);
				}
			});
		} else {
			if ( !! callback) {
				$.getJSON( "data/contacts.json", contactsCallback); // Mock contacts if no api
				callback("Phone API is not available.");
			}
		}
	};

	/** 
	 * This method provides compare contact by last name, it is use in observable array from [knockout library](http://knockoutjs.com/documentation/observableArrays.html).
	 * @method compareByLastName
	 * @param left {Object} left compare element
	 * @param right {Object} right compare element
	 */

	Phone.prototype.compareByLastName = function(left, right) {

		var leftLastName = "Unknown";
		if ( !!left.name && !!left.name.lastName && left.name.lastName !== "") {
			leftLastName = left.name.lastName;
		}
		leftLastName = leftLastName.toString().trim().toLowerCase();
		var rightLastName = "Unknown";
		if ( !!right.name && !!right.name.lastName && right.name.lastName !== "") {
			rightLastName = right.name.lastName;
		}
		rightLastName = rightLastName.toString().trim().toLowerCase();
		return leftLastName === rightLastName ? 0 : (leftLastName < rightLastName) ? -1 : 1;
	};
	/** 
	 * This method compares call history items by date, it is used in observable array from [knockout library](http://knockoutjs.com/documentation/observableArrays.html).
	 * @method compareHistoryByDate
	 * @param left {Object} left compare element
	 * @param right {Object} right compare element
	 */
	Phone.prototype.compareHistoryByDate = function(left, right) {

		var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

		var tmpLeftDateTime = left.startTime.toUpperCase().split(" ");
		var tmpLeftDate = tmpLeftDateTime[0].split("/");
		tmpLeftDate[0] = tmpLeftDate[0].indexOf(tmpLeftDate[0]) + 1;
		var tmpLeftTime = tmpLeftDateTime[1].split(":");
		var leftDate = new Date(parseInt(tmpLeftDate[0], 10), parseInt(tmpLeftDate[1], 10), parseInt(tmpLeftDate[2], 10), parseInt(tmpLeftTime[0], 10), parseInt(tmpLeftTime[1], 10));

		var tmpRightDateTime = right.startTime.toUpperCase().split(" ");
		var tmpRightDate = tmpRightDateTime[0].split("/");
		tmpRightDate[0] = tmpRightDate[0].indexOf(tmpRightDate[0]) + 1;
		var tmpRightTime = tmpRightDateTime[1].split(":");
		var rightDate = new Date(parseInt(tmpRightDate[0], 10), parseInt(tmpRightDate[1], 10), parseInt(tmpRightDate[2], 10), parseInt(tmpRightTime[0], 10), parseInt(tmpRightTime[1], 10));

		return leftDate === rightDate ? 0 : (leftDate > rightDate) ? -1 : 1;

	};
	/** 
	 * This method clear contacts array.
	 * @method clearContacts
	 */
	Phone.prototype.clearContacts = function() {

		var self = this;
		self.contacts.removeAll();
		self.contacts([]);
	};
	/** 
	 * This method searches contact in contacts list by id .
	 * @method getContactById
	 * @param id {String} search contact id
	 * @return {Object} if contact is found, return contact. Else return first element from contacts list.
	 */
	Phone.prototype.getContactById = function(id) {

		var self = this;
		var contact = ko.utils.arrayFirst(self.contacts(), function(contact) {
			return contact.uid === id;
		});
		return contact;
	};
	/** 
	 * This method searches contact in contacts list by personId.
	 * @method getContactByPersonId
	 * @param id {String} search contact personId
	 * @return {Object} if contact is found, return contact. Else return first element from contacts list.
	 */
	Phone.prototype.getContactByPersonId = function(personId) {

		var self = this;
		var contact;
		for (index = 0; index < self.contacts.length; index++) {
			contact = self.contacts[index];
			if (contact.personId) {
				var cpersonId = contact.personId.replace(/[ ()+-]/g,"");
				if (cpersonId === personId) {
					return contact;
				}
			}
			if ( !! contact.phoneNumbers && contact.phoneNumbers.length) {
				for (var i = 0; i < contact.phoneNumbers.length; ++i) {
					if ( !! contact.phoneNumbers[i].number && contact.phoneNumbers[i].number === personId) {
						return contact;
					}
				}
			}
		}
		return null;
	};
	/** 
	 * This method searches contact in contacts list by phoneNumber.
	 * @method getContactByPhoneNumber
	 * @param id {String} search contact phoneNumber
	 * @return {Object} if contact is found, return contact. Else return first element from contacts list.
	 */
	Phone.prototype.getContactByPhoneNumber = function(phoneNumber) {

		var self = this;
		if ( !! phoneNumber && phoneNumber !== "") {
			phoneNumber = formatPhoneNumber(phoneNumber);
			var foundContact = ko.utils.arrayFirst(self.contacts(), function(contact) {
				if ( !! contact.phoneNumbers && contact.phoneNumbers.length) {
					for (var i = 0; i < contact.phoneNumbers.length; ++i) {
						if ( !! contact.phoneNumbers[i].number && contact.phoneNumbers[i].number === phoneNumber) {
							return true;
						}
					}
				}
				return false;
			});
			return foundContact;
		}
		return null;
	};
	/** 
	 * This method composes display name from contact names.
	 * @method getDisplayNameStr
	 * @param contact {Object} contact object
	 * @return {String} contact name for display
	 */
	Phone.prototype.getDisplayNameStr = function(contact) {

		var self = this;
		if ( !! contact && !! contact.name) {
			var name = [];
			if ( !! contact.name.lastName && contact.name.lastName !== "") {
				name.push(contact.name.lastName);
			}
			if ( !! contact.name.firstName && contact.name.firstName !== "") {
				name.push(contact.name.firstName);
			}
			if (name.length === 0 && !! contact.name.displayName && contact.name.displayName !== "") {
				name.push(contact.name.displayName);
			}
			return name.join(" ");
		}
		return "Unknown";
	};
	/** 
 * This method downloads call history from tizen.phone. Using  API method tizen.phone.getCallHistory.
 
 * @method loadCallHistory
 * @param callback {function(error)} Callback function called after method is finished. Parameter `error` will contain any error that was intercepted.
 */
	Phone.prototype.loadCallHistory = function(callback) {

		var self = this;
		var i;
		var callHistoryArrayLength;
		var callHistoryCallback = function ( data ) 
						{ 
							//self.callHistory = data.history; 
							self.callHistory = data; 
							console.log("historyCallBack ",self.callHistory);
						};
		if ( !! self.phone) {
			self.phone.getCallHistory(25, function(callHistoryArray) {
				if (callHistoryArray.length < 1) {
					$.getJSON( "data/history.json", callHistoryCallback); // Mock history if no history
					callHistoryCarousel.loadCallHistory(self.callHistory,0);
					callback(null);
				} else {
					console.log("loadCallHistory",callHistoryArray);
					//callHistoryArray = self.formatCallHistory(callHistoryArray);

					self.callHistory = callHistoryArray;
					console.log("Phone.CallHistory",self.callHistory);
					callHistoryCarousel.loadCallHistory(self.callHistory,0);
					if ( !! callback) {
						callback(null);
					}
				}
			}, function(err) {
				console.log("Error(" + err.code + "): " + err.message);
				if ( !! callback) {
					$.getJSON( "data/history.json", callHistoryCallback); // Mock history if error
					callHistoryCarousel.loadCallHistory(self.callHistory,0);
					callback(err);
				}
			});
		} else {
			if ( !! callback) {
				$.getJSON( "data/history.json", callHistoryCallback); // Mock history if no api
				callHistoryCarousel.loadCallHistory(self.callHistory,0);
				callback("Phone API is not available.");
			}
		}
	};
	/** 
 * This method prepares contact data to be displayed in html.
 
 * @method formatContacts
 * @param contactsList {Array} list of contacts
 * @return {Array} list of contacts
 */
	Phone.prototype.formatContacts = function(contactsList) {
		var i, j;
		var contactsListLength;
		var phoneNumbersLength;
		contactsListLength = contactsList.length;
		for (i = 0; i < contactsListLength; i++) {
			if (!contactsList[i].photoURI) {
				contactsList[i].photoURI = null;
			}
			if (!contactsList[i].addresses) {
				contactsList[i].addresses = null;
			}

			if (!contactsList[i].emails) {
				contactsList[i].emails = null;
			}
			if ( !! contactsList[i].phoneNumbers) {
				phoneNumbersLength = contactsList[i].phoneNumbers.length;
				for (j = 0; j < phoneNumbersLength; j++) {
					contactsList[i].phoneNumbers[j].number = formatPhoneNumber(contactsList[i].phoneNumbers[j].number);
				}
			}
		}
		return contactsList;
	};
	/** 
 * This method prepares call history data to be displayed in html.
 
 * @method formatCallHistory
 * @param callHistoryList {Array} list of call history
 * @return {Array} call history array
 */
	Phone.prototype.formatCallHistory = function(callHistoryList) {

		var callHistoryListLength;
		var i;
		callHistoryListLength = callHistoryList.length;
		for (i = 0; i < callHistoryListLength; i++) {
			if ( !! callHistoryList[i].startTime) {
				var date = callHistoryList[i].startTime;
				callHistoryList[i].startTime = moment(date).format("MMM/DD/YYYY HH:mm");
			} else {
				callHistoryList[i].startTime = null;
			}
		}
		return callHistoryList;
	};
	/** 
	 * This method clears call history.
	 * @method clearCallHistory
	 */
	Phone.prototype.clearCallHistory = function() {

		var self = this;
		self.callHistory.removeAll();
		self.callHistory([]);
	};
	/** 
	 * This method searches call history by contact personID.
	 * @method getCallHistoryByPersonId
	 * @param personId {string} search contact personId
	 * @return {Array} call history array
	 */
	Phone.prototype.getCallHistoryByPersonId = function(personId) {

		var self = this;
		/*
		var callHistory = ko.utils.arrayFilter(self.callHistory(), function(callHistoryEntry) {
			if ( !! callHistoryEntry.remoteParties) {
				for (var i = 0; i < callHistoryEntry.remoteParties.length; ++i) {
					if (callHistoryEntry.remoteParties[i].personId === personId) {
						return true;
					}
				}
			}
			return false;
		});
		return callHistory;
		*/
		return null;
	};
	window.__phone = undefined === window.__phone ? new Phone() : window.__phone;
	return window.__phone;
})();

