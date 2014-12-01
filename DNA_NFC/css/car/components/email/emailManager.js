var stubTesting = false; // Make it true to Test only the GUI Screens

var currentScreenLoaded = null;
var selectedAccountType = null;
var count = 0;
var FIXED = 0;
var currentEmailAccountSelected = null;
var currentMailId = null;
var currentServiceId = null;
var INBOX = "Inbox : ";
var syncId = null;
var gMessagesListenerId = null;
var accountInfo = [ {
	id : "1",
	name : "name"
}, {
	id : "2",
	name : "name2"
} ];
// var accountInfo = new Array();

var accountDetails = new Array();
var draftMailTypeCounter = 0;
var filesArray = new Array();
var fileAttached = new Array();
var fileCounter = 0;

var poll_account_availability = null;
var lastAccountId = 0;
/** **********Services Variables Declaration************************** */
var emailService = new Array();
var selectedService = {};

/** **********End of Services Variables ************************** */

/** useful globals **/
var mail_folders=new Array();
var inboxFolderID=0;
var draftsFolderID=0;
var currentFolder=0;

// Messages for Stub testing //TODO: Can be remove later
var mailMessages = [ {
	to : [ "dasda", "uiouiou", "mnmlk" ],
	from : "fromAddress first",
	date : "02nd March 2013",
	mailBody : "Mail Body of the first mail",
	subject : "Subject of First Mail",
	isRead : false,
	mailId : "1",
	folderId : "9",
	hasAttachment : true,
	attachments : [ {
		filePath : "abc/defr",
		mimeType : "img",
		id : 1
	}, {
		filePath : "abc/defr",
		mimeType : "img",
		id : 2
	}, {
		filePath : "abc/defr",
		mimeType : "img",
		id : 3
	}, {
		filePath : "abc/defr",
		mimeType : "img",
		id : 4
	} ]
}, {
	to : "toAddress Second",
	from : "fromAddress second",
	date : "03nd March 2013",
	mailBody : "Mail Body of the second mail",
	subject : "Subject of Second Mail",
	isRead : true,
	mailId : "2",
	folderId : "9",
	hasAttachment : false,
	attachments : [ {
		filePath : "abc/defr",
		name : "filename3"
	} ]
}, {
	to : "toAddress third",
	from : "fromAddress third",
	date : "04nd March 2013",
	mailBody : "Mail Body of the third mail",
	subject : "Subject of Third Mail",
	isRead : false,
	mailId : "3",
	folderId : "9",
	hasAttachment : false,
	attachments : [ {
		filePath : "abc/defr",
		name : "filename5"
	} ]
}, {
	to : "toAddress fourth",
	from : "fromAddress fourth",
	date : "05nd March 2013",
	mailBody : "Mail Body of the fourth mail",
	subject : "Subject of Fourth Mail",
	isRead : true,
	mailId : "4",
	folderId : "6",
	hasAttachment : false,
	attachments : [ {
		filePath : ""
	}, {
		filePath : ""
	} ]
} ];

// Messages for Stub testing //TODO: Can be remove later
var searchedmailMessages = [ {
	to : "toAddress",
	from : "fromAddress",
	date : "02nd March 2013",
	mailBody : "Mail Body of the first mail for search result",
	subject : "Search result : Subject Line one ",
	isRead : true,
	mailId : "1"
}, {
	to : "toAddress",
	from : "fromAddress",
	date : "02nd March 2013",
	mailBody : "Mail Body of the second mail for search result",
	subject : "Search result : Subject Line two",
	isRead : true,
	mailId : "2"
}, {
	to : "toAddress",
	from : "fromAddress",
	date : "02nd March 2013",
	mailBody : "Mail Body of the third mail for search result",
	subject : "Search result : Subject Line three",
	isRead : true,
	mailId : "3"
} ];

// Funtion to check whether Accounts already added
function checkAccountAvailablity() {
	if (stubTesting) {
		if (accountInfo.length > 0) {

			loadChangeAccountScreen();
			lastAccountId = accountInfo[accountInfo.length - 1].id;
		} else {
			$("#addAccountDiv").css({
				"visibility" : "visible"
			});
			$("#addAccountDetailsDiv").show();
		}
	} else {
		// TODO:
		tizen.messaging.getMessageServices("messaging.email", serviceListCB,
				errorCallbackAccount);

		$(".Sync").bind("vclick", registerListeners);
		console.log("Email Services have been read");

	}
}

// Save the user details and add the account
function saveDetails() {
	console.log("Save button Pressed");

	// alert("hi")
	var emailAddress = $("#EmailAddressTextbox").val();
	var userName = $("#UsernameTextbox").val();
	var password = $("#PasswordTextbox").val();
	var description = $("#DescriptionTextbox").val();
	var emailType = selectedAccountType;
	if (stubTesting) {
		try {
			var emailAddress = $("#EmailAddressTextbox").val();
			var userName = $("#UsernameTextbox").val();
			var password = $("#PasswordTextbox").val();
			var description = $("#DescriptionTextbox").val();

			console.log("Email Address :: " + emailAddress);
			console.log("User Name :: " + userName);
			console.log("Password :: " + password);
			console.log("Email Descriptions :: " + description);
			console.log("Email Type :: " + emailType);

			accountInfo.push({
				id : emailAddress,
				name : emailAddress
			});
			accountDetails.push({
				emailAddress : emailAddress,
				userName : userName,
				password : password,
				description : description,
				emailType : emailType
			})

			$("#progressDiv").css({
				"visibility" : "visible"
			});
		} catch (e) {
			// TODO: handle exception
			console.error(e);
		}
	} else {
		// TODO: Need to CALL WRT API and verify newly added Acount
		console.log("Email Address :: " + emailAddress);
		console.log("User Name :: " + userName);
		console.log("Password :: " + password);
		console.log("Email Descriptions :: " + description);
		console.log("Email Type :: " + emailType);

		console.log("WRT Plugin called for ");

		// Added to display visibility of progress div
		$("#progressDiv").css({
			"visibility" : "visible"
		});

		tizen.emailplugin.addAccount(emailAddress, userName, password,
				emailType, successCB, errorCB);

	}
}

var successCB = function() {
	console.log("Account Added succesfully");
	$("#progressDiv").css({
		"visibility" : "hidden"
	});

	$("#EmailAddressTextbox").val('');
	$("#UsernameTextbox").val('');
	$("#PasswordTextbox").val('');
	$("#DescriptionTextbox").val('');

	// Check for the newly added Account once every second
	poll_account_availability=setInterval(checkAccountAvailablity,1000);
	
}

var errorCB = function() {
	console.log("Account not added, returning to add account screen");
	loadAddAccountScreen();
}

// Retrieve mail list filtering filter key(If present else get all mail list)
var retrieveMail = function(folderid) {
	console.log("Inside Retrive mail, currentEmailAccountSelected :: " + currentEmailAccountSelected);
	if(!getMessagesFromFolder(folderid)) 
		console.log("Error! Wrong folder requested!!!");
	currentFolder=folderid;
}

function getCurrentDraftCount()
{
	if(selectedService)
	{
		getMessagesFromFolder(draftsFolderID, draftMsgArrayCB);
	}
}

function draftMsgArrayCB(messages)
{
	draftMailTypeCounter=messages.length;
	loadInboxScreen();
}

function getMessagesFromFolder(folderid, callback)
{
	if(typeof(callback)==='undefined')
		callback=messageArrayCB;

	if(mail_folders.length)
	{
		if(selectedService)
		{
			var sortMode = new tizen.SortMode("timestamp", "DESC");
			selectedService.messageStorage.findMessages(new tizen.AttributeFilter("folderId", "EXACTLY", folderid), callback, SearcherrorCallback, sortMode);
			function SearcherrorCallback(err) {
					console.log(err.name + " error: " + err.message);
			}
			console.log("findMessages called on " + folderid);
			return true;
		}
	}
	return false;
}

function setMailItemRead(mailID)
{
	if(selectedService)
	{
		// we need to updateSeenFlag first if we want to stay in sync with the server
		tizen.emailplugin.updateSeenFlag(selectedService.id,mailID,true,seenSuccessCB);
	}
}

function seenSuccessCB(mailID)
{
	console.log("updated seen flag successfully!");
	selectedService.messageStorage.findMessages(new tizen.AttributeFilter("id", "EXACTLY", mailID), setReadCB);
}

function setReadCB(messages)
{
	if(messages.length===1 && selectedService)
	{
		// set isRead to true for internal DB
		messages[0].isRead=true;
		console.log("setting message " + messages[0].id + " to read.");
		selectedService.messageStorage.updateMessages(messages,updateMsgCB,errorCallback);
	}
}

function updateMsgCB()
{
	console.log("messages updated successfully");
}

function fillMailItem(message)
{	
	var mailMsg = {};
	var attachments = new Array();
	mailMsg["subject"] = message.subject;
	console.log('Subject:: ' + mailMsg["subject"]);
	mailMsg["from"] = message.from;
	console.log('from:: ' + mailMsg["from"]);
	mailMsg["to"] = message.to;
	console.log('to:: ' + mailMsg["to"]);
	mailMsg["mailId"] = message.id;
	console.log('mailId:: ' + mailMsg["mailId"]);
	mailMsg["isRead"] = message.isRead;
	console.log('isRead:: ' + mailMsg["isRead"]);
	mailMsg["mailBody"] = message.body.htmlBody;
	console.log('mailBody:: ' + mailMsg["mailBody"]);
	mailMsg["date"] = message.timestamp.toString();
	console.log('date:: ' + mailMsg["date"]);
	mailMsg["folderId"] = message.folderId;
	console.log('folderId:: ' + mailMsg["folderId"]);

	mailMsg["hasAttachment"] = message.hasAttachment;
	console.log('hasAttachment:' + mailMsg["hasAttachment"]);

	console.log('message.attachments.length:  '
			+ message.attachments.length);

	for ( var j = 0; j < message.attachments.length; j++) {
		attachments.push({
			filePath : message.attachments[j].filePath,
			id : message.attachments[j].id,
			mimeType : message.attachments[j].mimeType
		})
		console.log("Attachment:"
				+ JSON.stringify(message.attachments[j]));
		console.log(j + ' file Path :'
				+ message.attachments[j].filePath);
		console.log(j + ' file id :' + message.attachments[j].id);
		console.log(j + ' mimeType :'
				+ message.attachments[j].mimeType);
	}

	mailMsg["attachments"] = attachments;
	mailMessages.push(mailMsg);

	return mailMsg;
}

// Retrieve mail list filtering with received message ID
var retriveMailFilterWithId = function(mailId) {

	loadMailFullViewScreen();
	var index = getArrayItemByProperty(mailMessages, "mailId", mailId);
	if (index.item) {
		setViewMails(index.item);
		if(!index.item.isRead)
			setMailItemRead(mailId);
	} else {
		console.log(mailId + " ::: MessageId received is incorrect");
	}
}

// Retrieve mail list filtering with next received message ID
var retriveMailFilterWithNextId = function() {
	var index = getArrayItemByProperty(mailMessages, "mailId", currentMailId);
	if (index.item !== null) {
		var nextMailItemIndex = index.index + 1;
		var nextMailItem = mailMessages[nextMailItemIndex];
		console.log("Next mail Item:" + JSON.stringify(nextMailItem))
		try {
			//if (nextMailItem.folderId != "4" || nextMailItem.folderId != "6")
			if (nextMailItem.folderId == "1" )
			{
				setViewMails(nextMailItem);
			} else {
				currentMailId = nextMailItem.mailId;
				retriveMailFilterWithNextId();
			}
		} catch (e) {
			console.log(currentMailId + " ::: is Last Mail from Inbox");
			return false;
		}

	} else {
		console.log(currentMailId + " ::: MessageId received is incorrect");
	}
	return true;
}

var mail_items_to_delete=new Array();

// delete Mail Success call back
function deleteSuccessCallback() {
	console.log("Messages were deleted");
	syncEmails();
}

// Deleting the "messages.length" number of mails
function deleteMessageArrayCB(messages) {
	var deletethese=new Array();
	for(var i=0; i<messages.length; ++i) 
	{
		for(var j=0; j<mail_items_to_delete.length; ++j)
		{
			if(mail_items_to_delete[j]===messages[i].id)
			{
				console.log("deleting message... " + JSON.stringify(mail_items_to_delete[j]));
				deletethese.push(messages[i]);
				break;
			}
		}

	}
	selectedService.messageStorage.removeMessages(deletethese,
			deleteSuccessCallback, errorCallback);
	mail_items_to_delete.length=0;
}

// Delete mail request matching with mail Id
function deleteMailRequestByMailIds(mailIDs) {
	if (stubTesting) {
		for ( var i = 0; i < mailIDs.length; i++) {
			var index = getArrayItemByProperty(mailMessages, "mailId",
					mailIDs[i]);
			if (index.index > -1) {
				mailMessages.splice(index.index, 1);
			}
		}
	} 
	else 
	{
		console.log("Inside the Delete mail by ID Function");
		// Called delete mails Web API
		mail_items_to_delete=mailIDs.slice(0);
		try {
				console.log("Mail Ids to be deleted are :" + JSON.stringify(mailIDs));
				var filter = new tizen.AttributeFilter("type", "EXACTLY", "messaging.email");
				selectedService.messageStorage.findMessages(filter,
						deleteMessageArrayCB);
		} catch (e) {
			console.log(e);
		}
	}
}

// Delete Account request
function deleteAccountRequest(searchIDs) {
	if (stubTesting) {
		for ( var i = 0; i < searchIDs.length; i++) {
			var index = getArrayItemByProperty(accountInfo, "id", searchIDs[i]);
			if (index.index > -1) {
				accountInfo.splice(index.index, 1);
			}
		}

	} else {
		// TODO: Need to call delete account WRT Plug-in calls
		for ( var i = 0; i < searchIDs.length; i++) {
			console.log("JSON stringify :: " + JSON.stringify(accountInfo))
			console.log("searchIDs[i] ID :: " + searchIDs[i]);
			var index = getArrayItemByProperty(accountInfo, "id", searchIDs[i]);
			if (index && index.index > -1) {
				console.log("Index of Service ID for deletion :: "
						+ index.index)
				console.log("Calling Delete Account WRT with ID :: "
						+ accountInfo[index.index].id);
				tizen.emailplugin.deleteAccount(accountInfo[index.index].id,
						deleteAccSuccessCB, deleteErrCB);
				if(currentEmailAccountSelected==accountInfo[index.index].id)
					currentEmailAccountSelected=null;
				accountInfo.splice(index.index, 1);
			}
		}

	}
	if (accountInfo.length > 0) {
		loadChangeAccountScreen();
	} else {
		loadAddAccountScreen();
	}
}

var deleteAccSuccessCB = function() {
	console.log("Account deleted succes");
	if (accountInfo.length > 0) {
		loadChangeAccountScreen();
	} else {
		loadAddAccountScreen();
	}
}

var deleteErrCB = function() {
	console.log("Account not deleted");
}

/*
 * get array item by property value search the data list for an item containing
 * certain data @param String data - the data string to look for @return Object {
 * itemId:Number, item:Object }
 */
var getArrayItemByProperty = function(array, property, value) {
	var item = null;

	for ( var i = 0; i < array.length; i++) {
		if (value == array[i][property]) {
			item = {
				index : i,
				item : array[i]
			};
			break;
		}
	}
	return item;
};

/**
 * ****************************Services
 * calls**********************************************
 */
// sync all emails at first startup
function syncAllEmails()
{
	console.log("Starting initial sync...");
	syncId=selectedService.sync(function() {
		console.log("Synching all folders at first start...");
		getCurrentDraftCount();	
		}, function(err) {
			console.log("Synchronization failed:" + err.message);
			
		});
	syncId=null;
}

// Sync with the Services
function syncEmails() {
	
	$("#syncDiv").css({
		"visibility" : "visible"
	});

	if(typeof(currentFolder)==='undefined')
	{
		folderId=inboxFolderID;
		currentFolder=folderId;
	}	
	folderId=currentFolder;

	if (!stubTesting) {
		console.log("Sync, inside function");
		console.log("Sync ID:" + syncId);
		if (syncId) {
			console.log("Other sync is in progress");
		} else {
			try {
				syncId = selectedService.sync(function() {
					console.log("Synchronization succeeded");
					retrieveMail(folderId);
					
					$("#syncDiv").css({
						"visibility" : "hidden"
					});
					
					syncId = null;
				}, function(err) {
					console.log("Synchronization failed:" + err.message);
					retrieveMail(folderId);
					
					$("#syncDiv").css({
						"visibility" : "hidden"
					});
					
					syncId = null;
				});
				console.log("Sync all started");
			} catch (exc) {
				console.log("Sync exc: " + exc.code + ":" + exc.message);
				syncId = null;
			}
		}
	}
}

// Define the error callback.
function errorCallbackAccount(err) {
	console.log(err.name + " error: " + err.message);
}

// Define the error callback.
function errorCallback(err) {
	console.log(err.name + " error: " + err.message);
}

function getSelectedService()
{
	var index = getArrayItemByProperty(emailService, "id", currentEmailAccountSelected);
	if (index)
		return emailService[index.index];
	return null;
}

var folderCB = function(folders) {
	console.log(folders.length + " folders(s) found!");
	for(var i=0; i<folders.length;++i)
	{
		console.log(i + ", folder: " + folders[i].name + " id: " + folders[i].id);
		if(folders[i].name.match(new RegExp("inbox","i")))
			inboxFolderID=folders[i].id;
		else if(folders[i].name.match(new RegExp("draft","i")))
			draftsFolderID=folders[i].id;
		mail_folders.push(folders[i]);
	}
	syncAllEmails();
}

// List of all the services available
function serviceListCB(services) {
	accountInfo = new Array();
	console.log("Service  :: " + services);
	console.log("Service JSON.stringify :: " + JSON.stringify(services));
	if (services.length > 0 && services[0].name) {

		console.log("Service callback :: " + services.length);

		for ( var i = 0; i < services.length; i++) {
			console.log("Service id :: " + services[i].id);
			console.log("Service name :: " + services[i].name);
			accountInfo.push({
				id : services[i].id,
				name : services[i].name
			});
			lastAccountId = services[i].id;
			console.log("lastAccountId  " + lastAccountId);
		}
		emailService = services;
		if(poll_account_availability)
		{
			clearInterval(poll_account_availability);
			poll_account_availability=null;
		}
		loadChangeAccountScreen();
	} else {
		// $("#addAccountDiv").css({"visibility":"visible"});
		// $("#addAccountDetailsDiv").show();
		loadAddAccountScreen();
		console.log("Email service not available or still retrying");
	}
}

// Search Mail from existing mail record call
// The search mail is modified to accept only mail Body items during search.
function searchMailCall() {
	console.log("Inside search mail call");
	// clearing the old displayed mail
	clearInboxMails();

	var searchItem = $("#searchMailText").val();
	console.log("Need to Search::: " + searchItem);

	if (searchItem) {
		if (stubTesting) {
			loadInboxScreen("mailSearch");
		} else {
			try {
				console.log("Need to Search::: " + searchItem);
				if (searchItem.startsWith("to:", 0)) {
					searchItem = searchItem.replace('to:', '');
					var filter = new tizen.AttributeFilter("to", "CONTAINS",
							searchItem);
				} else if (searchItem.startsWith("from:", 0)) {
					searchItem = searchItem.replace('from:', '');
					var filter = new tizen.AttributeFilter("from", "CONTAINS",
							searchItem);
				} else
					var filter = new tizen.AttributeFilter("body.plainBody",
							"CONTAINS", searchItem);
				selectedService.messageStorage.findMessages(filter,
						messageArrayCB, SearcherrorCallback);

				function SearcherrorCallback(err) {
					console.log(err.name + " error: " + err.message);
				}
			} catch (ex) {
				console.log("Get exception: " + ex.name + ":" + ex.message);
			}

		}
	} else {
		console.log("Please Add Text into search Box");
	}
}

// Load the mails on the screen
function messageArrayCB(messages) 
{
	mailMessages.length=0;	
	clearInboxMails();

	if(!messages.length)
	{
		syncEmails();
		return;
	}

	for(var i=0; i<messages.length; ++i)
	{
		var mailItem=fillMailItem(messages[i]);
			
		if (currentFolder === draftsFolderID) 
		{
			draftMailTypeCounter=messages.length;
			fillDraftCount();
			populateDraftScreen(mailItem);
		}
		else
		{ 
			populateInboxScreen(mailItem);
		}
	}
}

// Send mail matched with the mailId
function sendMailWithId(id) {

	console.log("Sending draft mail of mailID " + id);
	var index = getArrayItemByProperty(mailMessages, "mailId", id);
	if (index.item) {
		var to = [];
		var cc = [];
		var bcc = [];
		var from = index.item.from;
		var subject = index.item.subject;
		var mailbody = index.item.mailBody;
		var hasAttachment = index.item.hasAttachment;

		if (index.item.to) {
			to = index.item.to;
		} else {
			to = null;
		}

		if (index.item.cc) {
			cc = index.item.cc;
		} else {
			cc = null;
		}

		if (index.item.bcc) {
			bcc = index.item.bcc;
		} else {
			bcc = null;
		}
		console.log(to + " " + cc + " " + bcc + " " + from + " " + subject
				+ " " + mailbody);
		if (stubTesting) {
			deleteMailRequestByMailIds(id);
			loadDraftScreen();
		} else {
			var msg = new tizen.Message("messaging.email", {
				id : id
			});

			selectedService.sendMessage(msg, messageSentCallback, errorCallback);
			inboxButtonSeleted();
		}
	} else {
		console.log(mailId + " ::: MessageId is incorrect");
	}

}

// Send Mail from Compose screen
function sendMail() {
	console.log("Inside Send Mail Function");
	var to = [];
	var cc = [];
	var bcc = [];
	var from = $("#fromComposeDiv").text();
	;
	var subject = $("#subMember").val();
	var mailbody = $("#bodyDetails").val();
	var hasAttachment = false;
	var attachmentArray = new Array();

	if (fileAttached.length > 0) {
		hasAttachment = true;
	}

	if ($("#toMember").val()) {
		to = $("#toMember").val().split(',');
	} else {
		to = null;
	}

	if ($("#ccMember").val()) {
		cc = $("#ccMember").val().split(',');
	} else {
		cc = null;
	}

	if ($("#bccMember").val()) {
		bcc = $("#bccMember").val().split(',');
	} else {
		bcc = null;
	}

	if (stubTesting) {
		loadInboxScreen("saveToDraft");
	} else {
		console.log("To:" + to + "-CC:" + cc + "-bcc:" + bcc);
		var msg = new tizen.Message("messaging.email", {
			to : to,
			cc : cc,
			bcc : bcc,
			from : from,
			subject : subject,
			plainBody : mailbody,
			hasAttachment : hasAttachment
		});

		for ( var i = 0; i < fileAttached.length; i++) {
			attachmentArray.push(new tizen.MessageAttachment(fileAttached[i]));
		}
		msg.attachments = attachmentArray;

		selectedService.sendMessage(msg, messageSentCallback, errorCallback);

		// inboxButtonSeleted();
		loadInboxScreen("saveToDraft");
	}

}

// Define the success callback.
var messageSentCallback = function(recipients) {
	console.log("Message sent successfully to " + recipients.length
			+ " recipients.");
}

// Listener registered
function registerListeners() {
	var messagesChangeCB = {
		messagesadded : function(messages) {
			console.log("Tracking message :<br/>" + messages.length
					+ " message(s) added");
		},
		messagesupdated : function(messages) {
			console.log("Tracking message :<br/>" + messages.length
					+ " message(s) updated");
		},
		messagesremoved : function(messages) {
			console.log("Tracking message :<br/>" + messages.length
					+ " message(s) removed");
		}
	}

	try {

		gMessagesListenerId = selectedService.messageStorage
				.addMessagesChangeListener(messagesChangeCB);
		console.log("Listening for Messages Change started");

		$(".Sync").unbind("vclick", registerListeners);
		$(".Sync").bind("vclick", unregisterListeners);
		console.log("Tracking started");
	} catch (exc) {
		console.log("addChangeListeners error:" + exc.message);
	}
}

// Sync Listners unregistered
function unregisterListeners() {
	selectedService.messageStorage.removeChangeListener(gMessagesListenerId);
	$(".Sync").unbind("vclick", unregisterListeners);
	$(".Sync").bind("vclick", registerListeners);
	console.log("Tracking stopped");
}

// Filesystem Access : Success callback
function onsuccessFile(files) {
	console.log("There are " + files.length + " in the selected folder");
	for ( var i = 0; i < files.length; i++) {
		console.log(i + " :: Files content :: " + JSON.stringify(files[i]));
		if (files[i].isFile) {
			filesArray.push(files[i]);
			fileCounter = fileCounter + 1;
		}
	}
	console.log("Files count :: " + fileCounter);

	// Populate the files on the Files Attachment screen
	if (files.length > 0) {
		populateAttachmentScreen();
	}
}

// Error callback while listing files
function onerrorFile(error) {
	console.log("The error " + error.message
			+ " occurred when listing the files in the selected folder");
}

// List all the files from the root folders like
// "documents","downloads","images","music" and "videos"
function listAllFiles() {
	filesArray = new Array();
	fileCounter = 0;
	console.log("documents ListAllFiles Calling........");
	tizen.filesystem.resolve("documents", function(dir) {
		dir.listFiles(onsuccessFile, onerrorFile);
	}, function(e) {
		console.log("Error " + e.message);
	}, "r");
	console.log(" downloads ListAllFiles Calling........");
	tizen.filesystem.resolve("downloads", function(dir) {
		dir.listFiles(onsuccessFile, onerrorFile);
	}, function(e) {
		console.log("Error " + e.message);
	}, "r");
	console.log(" images ListAllFiles Calling........");
	tizen.filesystem.resolve("images", function(dir) {
		dir.listFiles(onsuccessFile, onerrorFile);
	}, function(e) {
		console.log("Error " + e.message);
	}, "r");
	console.log(" music ListAllFiles Calling........");
	tizen.filesystem.resolve("music", function(dir) {
		dir.listFiles(onsuccessFile, onerrorFile);
	}, function(e) {
		console.log("Error " + e.message);
	}, "r");
	console.log(" videos ListAllFiles Calling........");
	tizen.filesystem.resolve("videos", function(dir) {
		dir.listFiles(onsuccessFile, onerrorFile);
	}, function(e) {
		console.log("Error " + e.message);
	}, "r");
}

