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
		//$('#library').library("setSectionTitle", "PHONE CONTACTS");
		//$('#library').library("init");
		
		this.ContactTemplate = $("#ContactTemplate").clone();

		var tabMenuModel = {
			Tabs : [ {
				text : "CONTACTS A-Z",
				selected : true
			} ]
		};

		//$('#library').library("tabMenuTemplateCompile", tabMenuModel);

		//$('#library').bind('eventClick_GridViewBtn', function() {
		//	ContactsLibrary.showContacts();
		//});

		//$('#library').bind('eventClick_ListViewBtn', function() {
		//	ContactsLibrary.showContacts();
		//});

		//$('#library').bind('eventClick_SearchViewBtn', function() {
		//});

		//$('#library').bind('eventClick_menuItemBtn', function() {
		//	ContactsLibrary.showContacts();
		//});

		//$('#library').bind('eventClick_closeSubpanel', function() {
		//});

		//$("#alphabetBookmarkList").on("letterClick", function(event, letter) {
		//	console.log(letter);
		//	Phone.contactsAlphabetFilter(letter === "*" ? "" : letter);
		//});

		ContactsLibrary.showContacts();
	},
	/**
	 * Method unhides library page.
	 * 
	 * @method isHidden
	 */
	 isHidden : function() {
		 return $("#contactList").hasClass("hidden");
	 },
	/**
	 * Method unhides library page.
	 * 
	 * @method show
	 */
	show : function() {
		"use strict";
		//$('#library').library("showPage");
		$("#opencontactlist").addClass("visibility-hidden");
		$(".contact-list-wrapper").removeClass("visibility-hidden");
		$("#contactList").removeClass("hidden");
		$("#phone-keypad").addClass("hidden");
		$("#contactsCarousel").addClass("hidden");
	},
	/**
	 * Method hides library page.
	 * 
	 * @method hide
	 */
	hide : function() {
		"use strict";
		//$('#library').library("hidePage");
		$(".contact-list-wrapper").addClass("visibility-hidden");
		$(".contact-btn").removeClass("visibility-hidden");
		$("#contactList").addClass("hidden");
		$("#phone-keypad").removeClass("hidden");
		$("#contactsCarousel").removeClass("hidden");
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
		//$('#library').library("subpanelContentTemplateCompile", subpanelModel);
		//$('#library').library("clearContent");
		//$('#library').library("setContentDelegate", "templates/libraryContactDetailDelegate.html");
		//$('#library').library("contentTemplateCompile", contact, "contactDetail", function() {
		//	$("#contactDetailMobileTitle").boxCaptionPlugin('initSmall', "MOBILE");
		//	$("#contactDetailEmailTitle").boxCaptionPlugin('initSmall', "EMAIL");
		//	$("#contactDetailAddressTitle").boxCaptionPlugin('initSmall', "ADDRESS");
		//});
	},
	Favorite : false,
	Letter: null,
	Search: null,
	/**
	 * Method which Searches a contact for the Search string and returns true if found.
	 * 
	 * @method contactString
	 */
	 contactSearch: function(contact) {
		 var i = 0;
		 var found = false;
		 for (x in contact.name) {
			 console.log("x",x,"contact.name[x]",contact.name[x],"Search",this.Search);
			 if ((x!="nicknames")&&(contact.name[x]!=null)&&(contact.name[x].toLowerCase().indexOf(this.Search.toLowerCase())>=0)) {
				 return true;
			 }
		 }
		 for (i = 0; i< contact.name.nicknames.length; i++) {
			 if (contact.name.nicknames[i].toLowerCase().indexOf(this.Search.toLowerCase())>=0) {
				 return true;
			 }
		 }
		 for (i = 0; i< contact.phoneNumbers.length; i++) {
			 if (contact.phoneNumbers[i].number.indexOf(this.Search)>=0) { 
				 return true;
			 }
		 }
		 return false;
	 }
	,
	/**
	 * Method which handles contact phone number calling in grid or list view.
	 * 
	 * @method onDialContactNumber
	 */
	 onDialContactNumber: function(event) {
		var numberz = $(event.target).text();// check code!!!!
		console.log("check ",numberz);
		console.log("check ",$(event.target).data("phoneNumber"));
		if (numberz.length>0) {
			var contact = { phoneNumbers: [] };
			numberz = numberz.trim().replace(/\D/g, "");  // remove all non-digit characters, ie. 00123-123(123) => 00123123123
			console.log("check ",numberz);
			numberz = numberz.trim().replace(/^\+/, "");
			console.log("check ",numberz);
			
			if (numberz[0]==='1') {
					numberz = numberz.substr(1);
				}
			contact.phoneNumbers[0]={ number: numberz };
			console.log("check ",contact);
			console.log("DIAL ",$(event.target).text());
			tizen.phone.invokeCall(numberz, function(result) {
                    console.log(result.message);
                });			//acceptCall(contact);
		}
	 }
	,
	/**
	 * Method which shows contacts in grid or list view.
	 * 
	 * @method showContacts
	 */
	showContacts : function() {
		"use strict";
		console.debug("show contacts called",Phone.contacts);
		var view = "";
		$("#contactList").empty();
		$("#contactsLibraryFilter li").unbind("click");
		$("#contactsLibraryFilter li").addClass("dk-grey");
		for (i = 0; i < Phone.contacts.length; i++) {
			if (Phone.contacts[i].phoneNumbers.length>0) {
				var contact = this.ContactTemplate.clone();
				contact.attr("id","contact_"+i);
				if (Phone.contacts[i].isFavorite==true) {
					contact.addClass("Favorite");
				}
				console.log("showcontacts ",contact);
				//console.log("contacts.showContacts ",contact.find("[name='contactName']").text());
				var Name = Phone.getDisplayNameStr(Phone.contacts[i]);
				contact.find("[name='contactName']").text(Name);
				var displayPhone = Phone.getDisplayNumberStr(Phone.contacts[i],"mobile");
				$("#contactsLibraryFilterButton_"+Name.charAt(0).toUpperCase()).removeClass("dk-grey");
				$("#contactsLibraryFilterButton_"+Name.charAt(0).toUpperCase()).attr("onclick",'Events.LetterClick("'+Name.charAt(0).toLowerCase()+'")');
				if (displayPhone.length===0) {
					displayPhone = Phone.getDisplayNumberStr(Phone.contacts[i],0);
					contact.find("[name='phone-type-mobile'] span").text(displayPhone);
					contact.find("[name='phone-type-mobile'] span").data("phoneNumber",displayPhone);
					contact.find("[name='phone-type-mobile']").click(this.onDialContactNumber);
					//contact.find("[name='phone-type-mobile']").switchClass("");
				} else {
					contact.find("[name='phone-type-mobile'] span").text(displayPhone);
					contact.find("[name='phone-type-mobile'] span").data("phoneNumber",displayPhone);
					contact.find("[name='phone-type-mobile']").click(this.onDialContactNumber);
				}				
				
				displayPhone = Phone.getDisplayNumberStr(Phone.contacts[i],"home");
				if (displayPhone.length===0) {
					displayPhone = Phone.getDisplayNumberStr(Phone.contacts[i],1);
					contact.find("[name='phone-type-home'] span").text(displayPhone);
					contact.find("[name='phone-type-home'] span").data("phoneNumber",displayPhone);
					contact.find("[name='phone-type-home']").removeClass("fa-home");
					contact.find("[name='phone-type-home']").addClass("fa-phone");
					contact.find("[name='phone-type-home']").click(this.onDialContactNumber);
				} else {
					contact.find("[name='phone-type-home'] span").text(displayPhone);
					contact.find("[name='phone-type-home'] span").data("phoneNumber",displayPhone);
					contact.find("[name='phone-type-home']").click(this.onDialContactNumber);
				}
				displayPhone = Phone.getDisplayNumberStr(Phone.contacts[i],"work");
				if (displayPhone.length===0) {
					displayPhone = Phone.getDisplayNumberStr(Phone.contacts[i],2);
					contact.find("[name='phone-type-work'] span").text(displayPhone);
					contact.find("[name='phone-type-work'] span").data("phoneNumber",displayPhone);
					contact.find("[name='phone-type-work']").removeClass("fa-briefcase");
					contact.find("[name='phone-type-work']").addClass("fa-phone");
				} else {
					contact.find("[name='phone-type-work'] span").text(displayPhone);
					contact.find("[name='phone-type-work'] span").data("phoneNumber",displayPhone);
				}
				contact.find("[name='phone-type-work'] span").data("phoneNumber",displayPhone);
				contact.find("[name='phone-type-work']").click(this.onDialContactNumber);
				if (this.Favorite) {
					if (Phone.contacts[i].isFavorite) { 
						contact.appendTo("#contactList");
					}
				} else if (this.Letter!=null) {
					if (Phone.getDisplayNameStr(Phone.contacts[i]).toLowerCase().startsWith(this.Letter.toLowerCase())) {
						contact.appendTo("#contactList");
					}
				} else if (this.Search!=null) {
					if (this.contactSearch(Phone.contacts[i])) {
						contact.appendTo("#contactList");
					} else {
						console.log("Filtered:",this.Search,Phone.contacts[i]);
					}
				} else {
					contact.appendTo("#contactList");
				}
				/*
				if (((Favorite) &&(Phone.contacts[i].isFavorite==true))||(!Favorite)) {
					if (Letter!=null) {
						if (Phone.getDisplayNameStr(Phone.contacts[i]).toLowerCase().startsWidth(Letter)) {
							contact.appendTo("#contactList");
						}
					} else if (Search!=null) {
							if (Phone.contacts[i].toString().indexOf(Search)>=0) {
								contact.appendTo("#contactList");
							}
					} else {
						contact.appendTo("#contactList");
					}
				}*/
				//$("#contectList").
			}
		}
		/*
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
		}*/
		//$('#library').library('closeSubpanel');
		//$('#library').library("clearContent");
		//$('#library').library("changeContentClass", view);
		//loadTemplate("templates/", "template-contacts", function() {
			//var contactsElement = '<div data-bind="template: { name: \'template-contacts\', foreach: Phone.contacts }"></div>';
			//$(contactsElement).appendTo($('.' + view));
			//ko.applyBindings(Phone);
		//});
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
