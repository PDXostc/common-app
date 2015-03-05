/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/*global Phone, callContactCarousel, GRID_TAB, LIST_TAB, loadTemplate, ko*/

/**
 * Class which provides methods to operate with contacts library which displays all contact information (name, phone number, photo) from paired device ordered by name. 
 * 
 * @class ContactsLibrary
 * @module PhoneApplication
 */
var ContactsLibrary = {
	currentSelectedContact : "",
	/**
	 * Method initializes contacts library.
	 * 
	 * @method init
	 */
	init : function() {
		"use strict";
		$('#library').library("setSectionTitle", "PHONE CONTACTS");
		$('#library').library("init");

		var tabMenuModel = {
			Tabs : [ {
				text : "CONTACTS A-Z",
				selected : true
			} ]
		};

		$('#library').library("tabMenuTemplateCompile", tabMenuModel);

		$('#library').bind('eventClick_GridViewBtn', function() {
			ContactsLibrary.showContacts();
		});

		$('#library').bind('eventClick_ListViewBtn', function() {
			ContactsLibrary.showContacts();
		});

		$('#library').bind('eventClick_SearchViewBtn', function() {
		});

		$('#library').bind('eventClick_menuItemBtn', function() {
			ContactsLibrary.showContacts();
		});

		$('#library').bind('eventClick_closeSubpanel', function() {
		});

		$("#alphabetBookmarkList").on("letterClick", function(event, letter) {
			console.log(letter);
			Phone.contactsAlphabetFilter(letter === "*" ? "" : letter);
		});

		ContactsLibrary.showContacts();
	},
	/**
	 * Method unhides library page.
	 * 
	 * @method show
	 */
	show : function() {
		"use strict";
		$('#library').library("showPage");
	},
	/**
	 * Method hides library page.
	 * 
	 * @method hide
	 */
	hide : function() {
		"use strict";
		$('#library').library("hidePage");
	},
	/**
	 * Method opens contact detail.
	 * 
	 * @method openContactDetail
	 * @param contact
	 *            {Object} Object representing contact's information.
	 */
	openContactDetail : function(contact) {
		"use strict";
		if (!!contact) {
			ContactsLibrary.currentSelectedContact  = contact;
			var history = Phone.getCallHistoryByPersonId(contact.personId);
			var formattedContact = ContactsLibrary.initContactDetail(contact);
			formattedContact.history = history;
			ContactsLibrary.renderContactDetailView(formattedContact);
		} else {
			console.log("Supplied contact is null.");
		}
	},
	/**
	 * Method renders search view.
	 * 
	 * @method renderContactDetailView
	 * @param contact
	 *            {Object} Contact object.
	 */
	renderContactDetailView : function(contact) {
		"use strict";
		console.log("open contact called");
		var subpanelModel = {
			textTitle : "CONTACT",
			textSubtitle : contact.name || "Unknown",
			actionName : "BACK",
			action : function() {
				console.log("back clicked");
				ContactsLibrary.showContacts();
				ContactsLibrary.currentSelectedContact = "";
			}
		};
		$('#library').library("subpanelContentTemplateCompile", subpanelModel);
		$('#library').library("clearContent");
		$('#library').library("setContentDelegate", "templates/libraryContactDetailDelegate.html");
		$('#library').library("contentTemplateCompile", contact, "contactDetail", function() {
			$("#contactDetailMobileTitle").boxCaptionPlugin('initSmall', "MOBILE");
			$("#contactDetailEmailTitle").boxCaptionPlugin('initSmall', "EMAIL");
			$("#contactDetailAddressTitle").boxCaptionPlugin('initSmall', "ADDRESS");
		});
	},
	/**
	 * Method which shows contacts in grid or list view.
	 * 
	 * @method showContacts
	 */
	showContacts : function() {
		"use strict";
		console.log("show contacts called");
		var view = "";
		switch ($('#library').library('getSelectetLeftTabIndex')) {
		case GRID_TAB:
			view = "contactsLibraryContentGrid";
			break;
		case LIST_TAB:
			view = "contactsLibraryContentList";
			break;
		default:
			view = "contactsLibraryContentList";
			break;
		}
		$('#library').library('closeSubpanel');
		$('#library').library("clearContent");
		$('#library').library("changeContentClass", view);
		loadTemplate("templates/", "template-contacts", function() {
			var contactsElement = '<div data-bind="template: { name: \'template-contacts\', foreach: Phone.contactsComputed }"></div>';
			$(contactsElement).appendTo($('.' + view));
			ko.applyBindings(Phone);
		});
	},
	/**
	 * Method which initializes contact detail.
	 * 
	 * @method initContactDetail
	 * @param contact
	 *            {Object} Contact object.
	 */
	initContactDetail : function(contact) {
		"use strict";
		var tempContact = {
			id : "",
			name : "",
			phoneNumber : "",
			email : "",
			photoURI : "",
			address : "",
			isFavorite : false,
			history : []
		};

		if (!!contact) {
			var str = "";

			if (!!contact.uid) {
				tempContact.id = contact.uid;
			}

			if (!!contact.name) {
				tempContact.name = Phone.getDisplayNameStr(contact);
			}

			if (!!contact.phoneNumbers && contact.phoneNumbers.length && !!contact.phoneNumbers[0].number) {
				tempContact.phoneNumber = contact.phoneNumbers[0].number.trim();
			}

			if (!!contact.emails && contact.emails.length && !!contact.emails[0].email) {
				tempContact.email = contact.emails[0].email.trim();
			}

			if (!!contact.photoURI) {
				tempContact.photoURI = contact.photoURI.trim();
			}

			if (!!contact.addresses && contact.addresses.length) {
				str = !!contact.addresses[0].streetAddress ? contact.addresses[0].streetAddress.trim() + "<br />" : "";
				str += !!contact.addresses[0].city ? contact.addresses[0].city.trim() + "<br />" : "";
				str += !!contact.addresses[0].country ? contact.addresses[0].country.trim() + "<br />" : "";
				str += !!contact.addresses[0].postalCode ? contact.addresses[0].postalCode.trim() : "";

				if (str.toString().trim() === "") {
					str = "-";
				}

				tempContact.address = str.trim();
			}

			tempContact.isFavorite = contact.isFavorite;
		}
		return tempContact;
	}
};
