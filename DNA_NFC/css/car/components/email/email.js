function deleteMail() {
	var element = document.getElementById('inboxScreen');
	element.style.opacity = "0.5";

	var element = document.getElementById('draftScreen');
	element.style.opacity = "0.5";

	var popUp = document.getElementById('deleteEmailPopDiv');
	popUp.style.visibility="visible";
}

function inboxButtonSeleted() {

	//Clear the search field if any pre - populated data available
	$("#searchMailText").val("");

	loadInboxScreen();
}

function deleteMailFromCompose() {
	var idToDelete = currentMailId;
	var status = retriveMailFilterWithNextId();
	var idToDeleteArray = [idToDelete];

	console.log(idToDeleteArray);
	deleteMailRequestByMailIds(idToDeleteArray);

	//Status false means deleted the last mail , Now redirecting to Inbox screen
	if(!status){
		inboxButtonSeleted();
	}
}

function deleteEmailYes() {
	$("#CheckBoxSelectAll").removeAttr("checked");
	var searchMailIDs = $("#inbox input:checkbox:checked").map(function(){
		return $(this).val();
	}).toArray();
	console.log(searchMailIDs);

	deleteMailRequestByMailIds(searchMailIDs);
	deleteEmailNo(); //called to change the load the remove the popUp once mail delete request sent

	if(currentScreenLoaded === "InboxScreen"){
		loadInboxScreen();
	}else if(currentScreenLoaded === "DraftScreen") {
		loadDraftScreen();
	}
}

function deleteEmailNo() {

	var element = document.getElementById('inboxScreen');
	element.style.opacity = "1";

	var element = document.getElementById('draftScreen');
	element.style.opacity = "1";

	var popUp = document.getElementById('deleteEmailPopDiv');
	popUp.style.visibility="hidden";
}

function homeSelected() {
	saveMailToDraft();
	loadChangeAccountScreen();
}

function useThisAccount() {
	console.log("Inside use This Account Function");
	currentEmailAccountSelected = $('#chooseEmailAccount').find('input[type=checkbox]:checked').filter(':last').val();
	console.log("Inside use This Account Function, currentEmailAccountSelected :: "+currentEmailAccountSelected);
	selectedService=getSelectedService();
	if(selectedService)
	{
		mail_folders.length=0;
		mailMessages.length=0;
		draftMailTypeCounter=0;
		selectedService.messageStorage.findFolders(new tizen.AttributeFilter("serviceId", "EXACTLY", selectedService.id), folderCB);
	}
}

function deleteAccountYes() {
	var searchIDs = $("#chooseEmailAccount input:checkbox:checked").map(function(){
		return $(this).val();
	}).toArray();
	console.log(searchIDs);

	deleteAccountRequest(searchIDs);
}

function deleteAccountNo() {
	loadChangeAccountScreen();
}

function deleteThisAccount() {

	loadDeleteAccConfirmationScreen();

}

function loadDraftScreen() {

	clearInboxMails();
	$("#addAccountDiv").hide();
	$("#addAccountDetailsDiv").hide();
	$("#chooseEmailAccount").hide();
	$("#inboxScreen").hide();
	$("#mailView").hide();
	$("#composeView").hide();
	$("#deleteAccountDiv").hide();
	$("#draftScreen").css({"visibility":"visible"});
	$("#draftScreen").show(400,populateDraft);
	$("#fileAttachment").hide();

	currentScreenLoaded = "DraftScreen";
	$("#searchMailText").val("");
}

function loadDeleteAccConfirmationScreen() {
	$("#addAccountDiv").hide();
	$("#addAccountDetailsDiv").hide();
	$("#chooseEmailAccount").hide();
	$("#inboxScreen").hide();
	$("#mailView").hide();
	$("#composeView").hide();
	$("#deleteAccountDiv").css({"visibility":"visible"});
	$("#deleteAccountDiv").show();
	$("#draftScreen").hide();
	$("#fileAttachment").hide();

	currentScreenLoaded = "DeleteAccConfirmationScreen";
	$("#searchMailText").val("");
}

function loadMailFullViewScreen() {
	$("#addAccountDiv").hide();
	$("#addAccountDetailsDiv").hide();
	$("#chooseEmailAccount").hide();
	$("#inboxScreen").hide();
	$("#mailView").css({"visibility":"visible"});
	$("#mailView").show();
	$("#composeView").hide();
	$("#deleteAccountDiv").hide();
	$("#draftScreen").hide();
	$("#fileAttachment").hide();

	currentScreenLoaded = "MailFullViewScreen";
	$("#searchMailText").val("");
}



function loadInboxScreen(type) {
	
	console.log("Inside Load Inbox screen");
	console.log("Inside Load Inbox screen, type : "+type);
	if(!type){
		saveMailToDraft();
	}
	clearInboxMails();
	$("#addAccountDiv").hide();
	$("#addAccountDetailsDiv").hide();
	$("#chooseEmailAccount").hide();
	$("#inboxScreen").css({"visibility":"visible"});
	$("#inboxScreen").show(400,populateInbox);
	$("#mailView").hide();
	$("#composeView").hide();
	$("#deleteAccountDiv").hide();
	$("#draftScreen").hide();
	$("#fileAttachment").hide();

	currentScreenLoaded = "InboxScreen";
}

function loadAddAccountScreen() {
	saveMailToDraft();
	$("#addAccountDiv").css({"visibility":"visible"});
	$("#addAccountDiv").show();
	$("#addAccountDetailsDiv").hide();
	$("#chooseEmailAccount").hide();
	$("#inboxScreen").hide();
	$("#mailView").hide();
	$("#composeView").hide();
	$("#deleteAccountDiv").hide();
	$("#draftScreen").hide();
	$("#fileAttachment").hide();
	currentScreenLoaded = "AddAccountScreen";
	$("#searchMailText").val("");
}

function loadChangeAccountScreen() {
	saveMailToDraft();
	clearChooseAccounts();
	$("#addAccountDiv").hide();
	$("#addAccountDetailsDiv").hide();
	$("#chooseEmailAccount").css({"visibility":"visible"});
	$("#chooseEmailAccount").show(400,function () {
		chooseEmailAccount();
	});

	$("#inboxScreen").hide();
	$("#mailView").hide();
	$("#composeView").hide();
	$("#deleteAccountDiv").hide();
	$("#draftScreen").hide();
	$("#fileAttachment").hide();
	currentScreenLoaded = "ChangeAccountScreen";
	$("#searchMailText").val("");
}

function addAccount(accountType)
{
	saveMailToDraft();
	selectedAccountType = accountType;
	console.log("Accont type Selected is :: "+selectedAccountType);
	$("#addAccountDiv").css({"visibility":"hidden"});
	$("#addAccountDiv").hide();
	$("#composeView").hide();
	$("#deleteAccountDiv").hide();
	$("#addAccountDetailsDiv").css({"visibility":"visible"});
	$("#addAccountDetailsDiv").show();
	$("#draftScreen").hide();
	$("#fileAttachment").hide();
	currentScreenLoaded = "AddAccount";
	$("#searchMailText").val("");
	
}

function loadComposeScreen(type){
	saveMailToDraft();
	populateComposeScreen(type);
	$("#addAccountDiv").hide();
	$("#addAccountDetailsDiv").hide();
	$("#chooseEmailAccount").hide();
	$("#inboxScreen").hide();
	$("#mailView").hide();
	$("#deleteAccountDiv").hide();
	$("#composeView").css({"visibility":"visible"});
	$("#composeView").show();
	$("#draftScreen").hide();
	$("#fileAttachment").hide();
	fillDraftCount();
	currentScreenLoaded = "ComposeScreen";
	$("#searchMailText").val("");
}

function loadAttachmentScreen(){

	$("#addAccountDiv").hide();
	$("#addAccountDetailsDiv").hide();
	$("#chooseEmailAccount").hide();
	$("#inboxScreen").hide();
	$("#mailView").hide();
	$("#deleteAccountDiv").hide();
	$("#composeView").hide();
	$("#composeView").hide();
	$("#draftScreen").hide();
	$("#fileAttachment").css({"visibility":"visible"});
	$("#fileAttachment").show(400,listAllFiles);
	currentScreenLoaded = "AddAttachment";
	$("#searchMailText").val("");
}



function populateComposeScreen(type) {
	var to = $("#to").text();
<<<<<<< HEAD
	var from = $("#from").text();
	var date = $("#emailDate").text();
	var subject = $("#subject").text();
=======
	var from = $("#from").val();
	var date = $("#date").text();
	var subject = $("#composeBcc").text();
>>>>>>> Adds resources from Email repo to common
	var mailBody = $("#mailBody").text();
	var attachmentSrc = $("#attachmentDiv").attr('src');
	switch(type){
	case "replyAll":
		clearAttachmentsCompose();
		var allToAddress = from+","+to;
		$("#composeTo").val(allToAddress);
		$("#composeCc").val('');
		$("#composeBcc").val('');
		mailBody = "\n\n\n\n\n\n\n\n\n\n--------------------------------------------------------------------\nFrom : "+from+"\n"+"To : "+to+"\n\n\n"+subject+"\n\n"+date+"\n\n\n"+mailBody+"";
		$("#composeBody").val(mailBody);
		subject = "Re:"+subject;
		$("#composeBcc").val(subject);
		break;
	case "reply":
		clearAttachmentsCompose();
		$("#composeTo").val(from);
		$("#composeCc").val('');
		$("#composeBcc").val('');
		mailBody = "\n\n\n\n\n\n\n\n\n\n--------------------------------------------------------------------\nFrom : "+from+"\n"+"To : "+to+"\n\n\n"+subject+"\n\n"+date+"\n\n\n"+mailBody+"";
		$("#composeBody").val(mailBody);
		subject = "Re:"+subject;
		$("#composeBcc").val(subject);
		break;
	case "forward":
		$("#composeTo").val('');
		$("#composeCc").val('');
		$("#composeBcc").val('');
		mailBody = "\n\n\n\n\n\n\n\n\n\n--------------------------------------------------------------------\nFrom : "+from+"\n"+"To : "+to+"\n\n\n"+subject+"\n\n"+date+"\n\n\n"+mailBody+"";
		$("#composeBody").val(mailBody);
		subject = "Fw:"+subject;
		$("#composeBcc").val(subject);
		clearAttachmentsCompose();
		break;
	case "draft":
		//Do nothing
		break;
	default :
		$("#composeTo").val('');
	$("#composeCc").val('');
	$("#composeBcc").val('');
	$("#composeBcc").val('');
	$("#composeBody").val('');
	clearAttachmentsCompose();
	break;
	}
}

function populateAttachFilesOnCompose(array) {
	fileAttached = array;

	var output = document.getElementById('composeAttach');
	var i  = array.length - 1 ;
	var val="";
	while(i>=0) {
		var template = document.getElementById("emailAttachTemplate");
		var ele = template.cloneNode(true);
		ele.removeAttribute("id");
		ele.removeAttribute("class");
		// var ele = document.createElement("div");
		// ele.style.top = "10%";
		// ele.style.left = (1+(i*30))+"%";
		// ele.className = "attachDivClass";
		// var eleImage = document.createElement("div");
		// eleImage.style.left = "8%";
		// eleImage.style.top = "1%";
		// eleImage.style.height = "70%";
		// eleImage.style.width = "40%";

		//This Functionality is called for the Image adding for different contexts 
		var attachment = array[i];
		if(attachment.indexOf("pdf")!=-1) {
			ele.className = "pdf-file";
		} else if(attachment.indexOf("txt")!=-1) {
			ele.className = "text-file";
		} else if(attachment.indexOf("gif")!=-1) {
			ele.className = "gif-file";
		} else if(attachment.indexOf("jpeg")!=-1 || attachment.indexOf("jpg")!=-1 || attachment.indexOf("png")!=-1) {
			ele.className = "jpeg-file";
		} else {
			// called in Default
			ele.className = "text-file";
		}

		var localFileNameIndex = getArrayItemByProperty(filesArray,"fullPath",array[i]);
		var fileName = "";
		if (localFileNameIndex) {
			fileName = filesArray[localFileNameIndex.index].name;
		}

		// var eleText = ele.querySelector("p");
		ele.innerHTML = fileName;

		console.log('Account Name:' + ele.innerHTML);
		// eleText.style.left = "8%";
		// eleText.style.top = "80%";
		// eleText.style.height = "8%";
		// eleText.style.width = "60%";
		// eleText.className = "attachName";

		// ele.appendChild(eleText);
		// ele.appendChild(eleImage);
		output.appendChild(ele);

		i--;
	}
	loadComposeScreen("draft");
}

function populateAttachFilesOnViewMail(array){

	var output = document.getElementById('viewAttachment');
	var i  = array.length - 1 ;
	var val="";
	while(i>=0)
	{
		var ele = document.createElement("div");
		ele.style.top = "10%";
		ele.style.left = (1+(i*30))+"%";
		ele.className = "attachDivClass";
		var eleImage = document.createElement("div");
		eleImage.style.left = "8%";
		eleImage.style.top = "1%";
		eleImage.style.height = "70%";
		eleImage.style.width = "40%";

		//This Functionality is called for the Image adding for diffrent contexts 
		var tempName = array[i];
		if(tempName.indexOf("pdf")!=-1)
		{
			eleImage.id = "pdfIcon";
		}
		else if(tempName.indexOf("txt")!=-1)
		{
			eleImage.id = "textIcon";
		}
		else if(tempName.indexOf("gif")!=-1)
		{
			eleImage.id = "gifIcon";
		}
		else if(tempName.indexOf("jpeg")!=-1 || tempName.indexOf("jpg")!=-1 || tempName.indexOf("png")!=-1 ||tempName.indexOf("bmp")!=-1 ||tempName.indexOf("image")!=-1)
		{
			eleImage.id = "jpegIcon";
		}
		else
		{
			// called in Default
			eleImage.id = "textIcon";
		}

		console.log("eleImage.id ::: "+eleImage.id)


		var eleText = document.createElement("div");
		eleText.innerHTML=array[i];
		console.log('Account Name:' +eleText.innerHTML);
		eleText.style.left = "8%";
		eleText.style.top = "80%";
		eleText.style.height = "8%";
		eleText.style.width = "60%";
		eleText.className = "attachName";

		ele.appendChild(eleText);
		ele.appendChild(eleImage);
		output.appendChild(ele);

		i--;
	}
}


function populateAttachmentScreen() {


	var output = document.getElementById('attachFiles');
	var i =filesArray.length - 1;
	var val="";

	while(i >= 0) {
		var template = document.getElementById("attachmentTemplate");
		var ele = template.cloneNode(true);
		ele.removeAttribute("id");
		ele.removeAttribute("class");

		//This Functionality is called for the Image adding for diffrent contexts 
		var tempName = filesArray[i].name;
		if(tempName.indexOf("pdf")!=-1) {
			ele.className = "pdf-file";
		} else if(tempName.indexOf("txt")!=-1) {
			ele.className = "text-file";
		} else if(tempName.indexOf("gif")!=-1) {
			ele.className = "gif-file";
		} else if(tempName.indexOf("jpeg")!=-1 || tempName.indexOf("jpg")!=-1 || tempName.indexOf("png")!=-1) {
			ele.className = "jpeg-file";
		} else {
			// called in Default
			ele.className = "text-file";
		}

		var eleText = ele.querySelector("p");
		eleText.innerHTML = filesArray[i].name;
		console.log('Account Name:' +eleText.innerHTML);

		var attachCheckbox = ele.querySelector(".checkbox");
		attachCheckbox.setAttribute("value", filesArray[i].fullPath);

		output.appendChild(ele);

		i--;
	}

}

function draftSelected() {
	loadDraftScreen();
}

var populateDraft = function() {
	retrieveMail(draftsFolderID);
	fillDraftCount();
}

var populateInbox = function ()
{
	setInboxTitle();
	retrieveMail(inboxFolderID);
	fillDraftCount();
}

function fillDraftCount() {
	console.log("Inside fillDraft count :: "+draftMailTypeCounter);
	$("#draftButton .label").html(draftMailTypeCounter);
}

<<<<<<< HEAD
function chooseEmailAccount()
{
	var output = document.getElementById('emailAccounts');
	var i=accountInfo.length-1 ;

	var val="";
	while(i>=0)
	{

		var ele = document.createElement("div");
		ele.style.top = (5+(i*5))+"%";
		var eleImage = document.createElement("img");
		eleImage.style.top = (15+(i*90))+"%";
		eleImage.style.left = "25%";
		eleImage.className = "MessagIcon";
		var eleText = document.createElement("div");
		eleText.innerHTML=accountInfo[i].name;
		console.log('Account Name:' +eleText.innerHTML);
		eleText.style.top = (4+(i*90))+"%";
		eleText.style.left = "100%";
		eleText.className = "LabelCtrl";

		var emailCheckBox = document.createElement('input');
		emailCheckBox.type = "checkbox";
		emailCheckBox.className = "chooseEmailCheckBox";
		emailCheckBox.style.top = (20+(i*90))+"%";
		emailCheckBox.style.left = "600%";
		emailCheckBox.id = "chooseEmailCheckBox" + i;
		emailCheckBox.value = accountInfo[i].id;
		if(emailCheckBox.value==currentEmailAccountSelected)
			emailCheckBox.checked=true;
		console.log('Account ID:'+accountInfo[i].id);
		ele.className = "mailDivPart";
=======
>>>>>>> Adds resources from Email repo to common

function chooseEmailAccount() {
	var output = document.getElementById('emailAccounts');
	var i = accountInfo.length - 1;

	while(i>=0) {
		var template = document.getElementById("accountTemplate");
		var ele = template.cloneNode(true);
		ele.removeAttribute("id");
		ele.removeAttribute("class");
		ele.className = "account";
		var eleText = ele.querySelector("p");
		eleText.innerHTML = accountInfo[i].name;
		var emailCheckbox = ele.querySelector(".checkbox");
		emailCheckbox.dataset.id = i;
		emailCheckbox.setAttribute("value", accountInfo[i].id);

		output.appendChild(ele);

		i--;
	}
}

//Set Inbox Title
function setInboxTitle() {
	var currentEmailSelectedName = null;

	console.log("currentEmailAccountSelected:"+currentEmailAccountSelected);

	var index = getArrayItemByProperty(accountInfo,"id",currentEmailAccountSelected);

	//alert("Stringify of ACC = "+JSON.stringify(index));
	
	if(index && index.index != null)
	{
		currentEmailSelectedName = accountInfo[index.index].name;
	}else{
		currentEmailSelectedName = "";
	}

	var inboxHeader = document.getElementById('InboxLabelCtrl');
	inboxHeader.innerText = INBOX + currentEmailSelectedName;

	var inboxFullDiv = document.getElementById('InboxFullViewLabelCtrl');
	inboxFullDiv.innerText = INBOX + currentEmailSelectedName;

	var inboxComposeDiv = document.getElementById('InboxComposeLabelCtrl');
	inboxComposeDiv.innerText = INBOX + currentEmailSelectedName;

	var inboxComposeFrom = document.getElementById("composeFrom");
	inboxComposeFrom.value = currentEmailSelectedName;
}

function populateDraftScreen(msg) {
	var draftbox = document.getElementById('drafts');
	var draftItemTemplate = document.getElementById("draftItemTemplate");
	var itemClone = draftItemTemplate.cloneNode(true);
	itemClone.removeAttribute("id");
	itemClone.dataset.id = msg.mailId;
		
	var msgSubject = itemClone.querySelector('h3');
	msgSubject.innerText = msg.subject;

	var msgBody = itemClone.querySelector('h4');
	msgBody.innerText = msg.mailBody;

	var msgCheckBox = itemClone.querySelector('.checkbox');
	msgCheckBox.id = count;
	msgCheckBox.value = msg.mailId;
	msgCheckBox.addEventListener("click",
			selectCheckBox.bind(this, msg.mailId), false);

	draftbox.appendChild(itemClone);
}

function populateInboxScreen(msg) {
	var inbox = document.getElementById('inbox');
	var inboxItemTemplate = document.getElementById("inboxItemTemplate");
	var itemClone = inboxItemTemplate.cloneNode(true);
	itemClone.removeAttribute("id");
	itemClone.dataset.id = msg.mailId;

	if (msg.isRead) {
		itemClone.className += " unread";
	}

	var subject = itemClone.querySelector("h3");
	subject.innerHTML = msg.subject;
	subject.addEventListener("click",
			retriveMailFilterWithId.bind(this, msg.mailId), false);

	var msgBody = itemClone.querySelector("h4");
	msgBody.innerHTML = msg.mailBody;
	msgBody.addEventListener("click",
			retriveMailFilterWithId.bind(this, msg.mailId), false);

	var msgCheckBox = itemClone.querySelector("input[type='checkbox']");
	msgCheckBox.dataset.id = count;
	msgCheckBox.value = msg.mailId;
	msgCheckBox.addEventListener("click",
			selectCheckBox.bind(this, msg.mailId), false);

	inbox.appendChild(itemClone);
}

//Clear the populated mails if any
function clearInboxMails() {
	var el = document.getElementById('inbox');
	while (el.hasChildNodes()) {
		el.removeChild(el.lastChild);
	}

	var elDraft = document.getElementById('drafts');
	while (elDraft.hasChildNodes()) {
		elDraft.removeChild(elDraft.lastChild);
	}
	count = 0;
	FIXED = 0;
}

//Clear the populated mails if any
function clearChooseAccounts() {
	var el = document.getElementById('emailAccounts');
	while (el.hasChildNodes()) {
		el.removeChild(el.lastChild);
	}
}

//Clear the attachments from compose screen
function clearAttachmentsCompose() {

	console.log("Clearing....attach from compose");

	var el = document.getElementById('composeAttach');
	while (el.hasChildNodes()) {
		el.removeChild(el.lastChild);
	}
	fileAttached = new Array();
	var attachmentsList = document.getElementById('attachFiles');
	while (attachmentsList.hasChildNodes()) {
		attachmentsList.removeChild(attachmentsList.lastChild);
	}
}

//Clear the attachments from compose screen
function clearAttachmentsViewMail() {
	console.log("Clearing....attach from compose");
	var el = document.getElementById('viewAttachment');
	while (el.hasChildNodes()) {
		el.removeChild(el.lastChild);
	}
}

//Populated the Mail onto the View Mail Screen
function setViewMails(message){
	setInboxTitle();
	fillDraftCount();
	try{
		var messageFrom = message.from;
		var messageTo = message.to;
		var messageSubject = message.subject;
		var messageDate = message.date;
		var messageBody = message.mailBody;
		currentMailId = message.mailId;

		clearAttachmentsViewMail();
		var attachFilesArray = [];

		for(var i=0;i<message.attachments.length;i++){
			//attachFilesArray[i] = message.attachments[i].name;
			attachFilesArray[i] = message.attachments[i].mimeType;
			console.log("Attachment mimeType:" +attachFilesArray[i]);
		}

		if(message.hasAttachment){
			populateAttachFilesOnViewMail(attachFilesArray)
		}

		$("#from").val(messageFrom);
		$("#to").text(messageTo);
<<<<<<< HEAD
		$("#subject").text(messageSubject);
		$("#emailDate").text(messageDate);
=======
		$("#composeBcc").text(messageSubject);
		$("#date").text(messageDate);
>>>>>>> Adds resources from Email repo to common
		$("#mailBody").html(messageBody);

	}catch(e)
	{
		console.warn("Last Mail : Cannot do Next Operation")
	}
}

function selectCheckBox(type) {
	var checkboxes = $("#inbox input[type='checkbox']");
	if(type === "All"){
		if ($("#CheckBoxSelectAll").is(':checked')){
			checkboxes.attr("checked", "checked");
		} else {
			checkboxes.removeAttr("checked");
		}
	} else {
		$("#CheckBoxSelectAll").removeAttr("checked");
	}
}



function saveMailToDraft() {
	console.log("Inside Save mail to Draft");
	if(currentScreenLoaded === "ComposeScreen" && ($("#composeBcc").val() || $("#composeBody").val())){
		
		console.log("Drafts,Inside the Draft save mail");
		
		var to = [];
		var cc = [];
		var bcc = [];
		var from = $("#from").val();;
		var subject = $("#composeBcc").val();
		var mailbody = $("#composeBody").val();

		var hasAttachment = false;
		var attachmentArray = new Array();

		if(fileAttached.length>0){
			hasAttachment = true;
		}

		if($("#composeTo").val()){
			to = $("#composeTo").val().split(';');
		}else{
			to = null;
		}

		if($("#composeCc").val()){
			cc = $("#composeCc").val().split(';');
		}else{
			cc = null;
		}

		if($("#composeBcc").val()){
			bcc = $("#composeBcc").val().split(';');
		}else{
			bcc = null;
		}

		if(stubTesting){
			console.log("Mail message length "+mailMessages.length)
			var mailMsg = {};
			mailMsg["subject"] = subject;
			mailMsg["from"] = from;
			if(to){
				mailMsg["to"] = to[0];
			}
			if(mailMessages[mailMessages.length-1]){
				mailMsg["mailId"]= (parseInt(mailMessages[mailMessages.length-1].mailId)+1).toString();
			}else{
				mailMsg["mailId"]="1";
			}
			mailMsg["isRead"] = false;
			mailMsg["mailBody"] = mailbody;
			mailMsg["date"] = "3 march";
			mailMsg["folderId"] = "6";

			mailMessages.push(mailMsg);
		}
		else{

			var msg = new tizen.Message("messaging.email",{to:to,cc:cc,bcc:bcc,from:from,subject:subject,plainBody:mailbody,hasAttachment : hasAttachment}); 
			
			console.log("Drafts,Message saved in Drafts");

			for (var i = 0 ; i < fileAttached.length; i++){
				attachmentArray.push(new tizen.MessageAttachment(fileAttached[i]));
			}
			msg.attachments = attachmentArray;

			selectedService.messageStorage.addDraftMessage(msg, draftSentSuccessCallback, DrafterrorCallback);
		}
	}
}

function draftSentSuccessCallback() {
	console.log("Draft Saved Successfully");
	loadInboxScreen();
}

function DrafterrorCallback() {
	console.log("Error::"+error);
	loadInboxScreen();
}

function editContinueCompose() {

	var mailIdToEdit = $('#drafts').find('input[type=checkbox]:checked').filter(':last').val();

	var index = getArrayItemByProperty(mailMessages,
			"mailId", mailIdToEdit);
	if (index.item) {

		console.log("index.item.to:" +index.item.to);
		console.log("index.item.cc:" +index.item.cc);
		console.log("index.item.bcc:" +index.item.bcc);
		console.log("index.item.subject:" +index.item.subject);


		if(index.item.to){
			$("#composeTo").val(index.item.to);
		}else{
			$("#composeTo").val("");
		}

		if(index.item.cc){
			$("#composeCc").val(index.item.cc);
		}else{
			$("#composeCc").val("");
		}

		if(index.item.bcc){
			$("#composeBcc").val(index.item.bcc);
		}else{
			$("#composeBcc").val("");
		}

		$("#composeBody").val(index.item.mailBody);

		subject = "Re:"+subject;
		$("#composeBcc").val(index.item.subject);

		//While editing any old draft msg , attachment wont be available 
		clearAttachmentsCompose();

		loadComposeScreen("draft");

	} else {
		console.log(mailId
				+ " ::: MessageId received is incorrect");
	}

}

function sendDraftMail() {
	var mailIDsToSendMail = $("#drafts input:checkbox:checked").map(function(){
		return $(this).val();
	}).toArray();
	console.log(mailIDsToSendMail);
	for(var i = 0;i<mailIDsToSendMail.length;i++){
		sendMailWithId(mailIDsToSendMail[i]);
	}
}

function attachFile() {
	// console.log("Before:::: "+JSON.stringify(attachFiles));
	var attachmentsList = $("#attachFiles input:checkbox:checked").map(function(){
		return $(this).val();
	}).toArray();
	console.log(JSON.stringify(attachmentsList));
	populateAttachFilesOnCompose(attachmentsList);
	$("#attachFiles .checkbox").removeAttr("checked");
}

function cancelFileAttachment() {
	loadComposeScreen("draft");
}

var init = function() {
	checkAccountAvailablity();
}
$(document).ready(init);
