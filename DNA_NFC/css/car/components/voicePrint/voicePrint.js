/*
 * Main Voice Print file to create DIVs at runtime
 */

/*
 * Global Variables
 */
var userInfo = {
		gender:'',
		name:''
	};
var gCountDownTimer = 600;
var gNoOfCreatedProfile = null;
var gAddedUserProfile = new Array();
var gIndexOfProfile = null;
var bDeleteAll = false;
var bState = true;
var bSelectUserProfile = true;

/* ------------------------------- VoiceOption Control ------------------------------- */

/*
 * Function to create Div for VoicePrintOptions HomeScreen
 */
function createVoicePrintOptions() {
	console.log("creation of Voice Print Options screen invoked");
	var parentDiv = document.getElementById('mainDiv');
	parentDiv.innerHTML = "";
	{
		var divVoicePrintOpt = document.createElement('div');
	    divVoicePrintOpt.id = "voiceHomeScreenBg";
	    {
		    var divInsidelabel = document.createElement('div');
		    divInsidelabel.id = "homeScreenLabel";
		    divInsidelabel.innerHTML = "<h1>VOICEPRINT OPTIONS</h1>";
		    
		    var divRecall = document.createElement('div');
		    divRecall.id = "recallExisting";
		    divRecall.className = "homeScreenButtons";
		    divRecall.addEventListener("click", recallUser.bind(this,divRecall.id), false);
		    divRecall.innerHTML = "<p>Open Profiles</p>";
		    
		    var divCreate = document.createElement('div');
		    divCreate.id = "createNew";
		    divCreate.className = "homeScreenButtons";
		    divCreate.addEventListener("click", createNewUser.bind(this,divCreate.id), false);
		    divCreate.innerHTML = "<p>Create New Profile</p>";
		    //divCreate.onclick = createNewUser();
		    
		    var divEditExisting = document.createElement('div');
		    divEditExisting.id = "editExisting";
		    divEditExisting.className = "homeScreenButtons";
		    divEditExisting.addEventListener("click", editExisting.bind(this,divEditExisting.id), false);
		    divEditExisting.innerHTML = "<p>Delete Profile</p>";
	    }
	}
    divVoicePrintOpt.appendChild(divInsidelabel);
    divVoicePrintOpt.appendChild(divRecall);
    divVoicePrintOpt.appendChild(divCreate);
    divVoicePrintOpt.appendChild(divEditExisting);
    parentDiv.appendChild(divVoicePrintOpt);
}

/*
 * Function: Voice Option Click Handler
 */
function voicePrintOptHandlr(params) {
	console.log("VoicePrint Option ClickHandler called with "+params);
	switch(params)
	{
	case 'recallExisting':
		console.log("Recall Called");
		recallUser();
		break;
	case 'createNew':
		console.log("Create New Called");
		createNewUser();
		break;
	case 'editExisting':
		console.log("Edit Called");
		editExisting();
		break;
	default:
		break;
	}
}

/* ------------------------------- EnterUserInfo Control ------------------------------- */

/*
 * Function to create Div for Taking User Info
 */
function createEnterUserInfoScreen() {
	console.log("Create structure for User ID Input Control");
	var parentDiv = document.getElementById('mainDiv');
	parentDiv.innerHTML = "";
	{
		var divEnterUserInfo = document.createElement('div');
		divEnterUserInfo.className = "container";
		divEnterUserInfo.id = "inputContainer";
		{
			var divUserInputBackButton = document.createElement('div');
			divUserInputBackButton.id = "userInputBackButton";
			divUserInputBackButton.className = "voiceBack";
			divUserInputBackButton.addEventListener("click", enterUserInfoClickHandler.bind(this,divUserInputBackButton.id), false);
			
			for(var i=0; i<2; i++)
			{
				var divUserProfile = document.createElement('div');
				divUserProfile.id = "inputProfileStruct"+i;
				{
					var inputProfileName = document.createElement('input');
					inputProfileName.type = "text";
					inputProfileName.maxLength = "8";
					inputProfileName.className = "testBoxInput";
					inputProfileName.id = "testBoxInput"+i;
					inputProfileName.readOnly = true;
					inputProfileName.addEventListener("blur", enterUserInfoClickHandler.bind(this,inputProfileName.id), false);
				}
				divUserProfile.appendChild(inputProfileName);
				divUserProfile.addEventListener("click", enterUserInfoClickHandler.bind(this,divUserProfile.id), false);
				//Appending UserProfile child to the parent
				divEnterUserInfo.appendChild(divUserProfile);
			}
			var divInsidelabel = document.createElement('div');
			divInsidelabel.id = "inputLabelForContainer";
			
			var replacementText = document.createElement('p');
			replacementText.innerHTML = "Choose an avatar for your profile.";
			replacementText.id = "inputLabelForText";
			divInsidelabel.appendChild(replacementText);
		
			var divDoneButton = document.createElement('div');
			divDoneButton.id = "doneButton"
			divDoneButton.addEventListener("click", enterUserInfoClickHandler.bind(this,divDoneButton.id), false);
			divDoneButton.style.visibility = 'hidden';
			divDoneButton.innerHTML = "<p>Create Profile</p>";
		}
		divEnterUserInfo.appendChild(divUserInputBackButton);
		divEnterUserInfo.appendChild(divInsidelabel);
		divEnterUserInfo.appendChild(divDoneButton);
	}
	// attach control to parent
	parentDiv.appendChild(divEnterUserInfo);
	console.log("appendChild done");
	
	$("#testBoxInput0").keyup(function(event){
	    if(event.keyCode == 13){
	    	enterDone('0');
	    }
	});
	
	$("#testBoxInput1").keyup(function(event){
	    if(event.keyCode == 13){
	    	enterDone('1');
	    }
	});
/*
	if($("#testBoxInput0").blur(function()
	{
		console.log("Check for the netered Text");
		var inp = $("#testBoxInput0");
		if (inp.val().length > 0) 
		{
		    //enabling done button
			enterDone('0');
		}
	});
	
	$("#testBoxInput1").blur(function()
	{
		console.log("Check for the netered Text");
		var inp = $("#testBoxInput1");
		if (inp.val().length > 0) 
		{
			//enabling done button
			enterDone('1');
		}
	});
	*/
//	
//	if ($("#id").is(":focus")) {
//		  alert('focus');
//		}
	/*
	if ($("#testBoxInput0").is(":focus")) 
	{
		alert('focus');
		console.log("Waiting for the user input text");
	}
	else
	{
		alert('Out of focus');
		//Out of focus... Check for the entered Text
		var inp = $("#testBoxInput0");
		if (inp.val().length > 0) 
		{
		    //enabling done button
			enterDone('0');
		}
	}
	*/
}

/*
 * Function to handle InputBox 'Enter' Key Press
 */
function enterDone(id) {
	console.log("Text Box enter done : "+id);
	if (id === '0' || id === '1')
	{
		var divInputName = document.getElementById('testBoxInput'+id);
		if(divInputName.value.length>7){
			divInputName.value=divInputName.value.substr(0,8).toUpperCase();
			document.getElementById('testBoxInput'+id).value=document.getElementById('testBoxInput'+id).value.substr(0,7);
		}
		var userName = divInputName.value;
		if(userName === "")
		{
			console.log("Entered name is Null!!!");
			$("#inputProfileStruct0").css({ opacity: 1 });
			$("#inputProfileStruct1").css({ opacity: 1 });
			$("#inputLabelForText").html("Choose an avatar for your profile.");
		}
		else
		{
			var userName = divInputName.value; 
			divInputName.value = userName.toUpperCase();
			userInfo["name"] = divInputName.value; 
			var divToBeDisabled;
			if (id == '0')
			{
				userInfo["gender"] = 'F';
				divToBeDisabled = document.getElementById("inputProfileStruct1");
			}
			else
			{
				userInfo["gender"] = 'M';
				divToBeDisabled = document.getElementById("inputProfileStruct0");
			}
			divToBeDisabled.style.visibility = "hidden";			
			document.getElementById("doneButton").style.visibility = "visible";
		}
		var textID = '#testBoxInput'+id;
		$(textID).blur();
	}
	else
	{
		console.log("Something else");
	}
		
}

/*
 * Function: User Info Click Handler
 */
function enterUserInfoClickHandler(params) {
	console.log("ClickHandler called with "+params);
	switch(params)
	{
	case 'inputProfileStruct0':
		console.log("hide called for Male Profile");
		$("#inputProfileStruct0").css({ opacity: 1 });
		$("#testBoxInput0").focus();
		$("#inputLabelForText").html("Enter an eight character name for the profile.");
		//$("#testBoxInput0").val("Anuja");		
		$("#inputProfileStruct1").css({ opacity: 0.3 });
//		var inp = $("#testBoxInput0");
//		if (inp.val().length > 0) {
//		    //enabling done button
//			enterDone('0');
//		}
		break;
	case 'inputProfileStruct1':
		console.log("hide called for Female Profile");
		$("#inputProfileStruct1").css({ opacity: 1 });
		$("#testBoxInput1").focus();
		$("#inputLabelForText").html("Enter an eight character name for the profile.");
		//$("#testBoxInput1").val("Hemant");
		$("#inputProfileStruct0").css({ opacity: 0.3 });
//		var inp = $("#testBoxInput1");
//		if (inp.val().length > 0) {
//		    //enabling done button
//			enterDone('1');
//		}
		break;
	case 'userInputBackButton':
		console.log("Back is pressed");
		tmpUserIDManagerMap.length = 0;
		loadVoicePrintOptionScreen();
		break;
	case 'testBoxInput0':
		console.log("Check for the Entered Text");
		var inp = $("#testBoxInput0");
		if (inp.val().length > 0) 
		{
		    //enabling done button
			enterDone('0');
		}
		else
		{
			console.log("No Text Entered");
		}
		break;
	case 'testBoxInput1':
		console.log("Check for the Entered Text");
		var inp = $("#testBoxInput1");
		if (inp.val().length > 0) 
		{
			//enabling done button
			enterDone('1');
		}
		else
		{
			console.log("No Text Entered");
		}
		break;	
	case "doneButton":
		console.log("Entered User Name: " + userInfo.name + " and Gender: "+ userInfo.gender);
		var tempUserIDObjectTemp = {
				gender :'',
				name :''
		};
		tempUserIDObjectTemp.name = userInfo.name;
		tempUserIDObjectTemp.gender = userInfo.gender;
		tmpUserMetaData = userInfo.name + "_" + userInfo.gender;
		var userValidation = true;
		noOfRecPerUser = 1;
		for(var i=0; i< userIDManagerMap.length; i++)
		{
			if(userIDManagerMap[i].name === userInfo.name && userIDManagerMap[i].gender === userInfo.gender)
				userValidation= false;
		}
		if(userValidation)
		{
			tmpUserIDManagerMap.push(tempUserIDObjectTemp);
			loadVoiceScannerScreen();
		}
		else
		{
			//Show Already Exist Dialog
	    	popUpMessageHandler("state1","alreadyExist");
	    	setTimeout(_timer.bind(this, "reenterUserInfo"), 4000);
		}
		break;
	default:
		break;
	}
}

/* ------------------------------- Scanner Control ------------------------------- */
/*
 * Function to create Div for Scanner Screen
 */
function createScannerScreen() {
	console.log("Create structure for Scanner Control");
	
	var parentDiv = document.getElementById('mainDiv');
	parentDiv.innerHTML = "";
	{
	    var divOutlier = document.createElement('div');
	    divOutlier.className = "container";
	    divOutlier.id = "scannerContainer";
	    //divOutlier.style.border = "white 1px solid";
	    {
	    	var divBackButton = document.createElement('div');
		divBackButton.id = "scannerBackButton";
		divBackButton.className = "voiceBack";
		divBackButton.addEventListener("click", scannerClickHandler.bind(this,divBackButton.id), false);
			
		    var divCanvas = document.createElement('div');
		    divCanvas.className = "VoiceScanner";
		    //divCanvas.style.border = "black 1px solid";
		    {
			    var canvas = document.createElement('canvas');
			    canvas.className = "RecorderCanvas";
			    canvas.id = 'recorderCanvasFailed';
			    var ctx=canvas.getContext("2d");
				ctx.moveTo(0,0);
				ctx.lineTo(canvas.width,canvas.height);
				ctx.moveTo(0,canvas.height);
				ctx.lineTo(canvas.width,0)
				ctx.strokeStyle = "white";
				ctx.stroke();
			    canvas.style.visibility='hidden';
    
			    var canvasWave = document.createElement('canvas');
			    canvasWave.className = "RecorderCanvas";
			    canvasWave.id = 'recorderCanvasWave';
			    canvasWave.style.visibility='visible';
			    //canvas.style.border = "yellow 1px solid";
    
			    for(var i=0; i<2; i++)
				{
					var divUserProfile = document.createElement('div');
					divUserProfile.id = "foundUserProfile"+i;
					{
						var foundUserName = document.createElement('input');
						foundUserName.className = "textFoundName";
						foundUserName.id = "textFoundName"+i;
						foundUserName.readOnly = true;
					}
					divUserProfile.appendChild(foundUserName);
					divUserProfile.style.visibility='hidden';
					//Appending UserProfile child to the parent
					divCanvas.appendChild(divUserProfile);
				}
		    }   
		    divCanvas.appendChild(canvas);
		    divCanvas.appendChild(canvasWave);
		    
		if(STATE_OF_SYSTEM!="Recall")
		{	
		    	var divCounter = document.createElement('div');
		    	divCounter.className = "VoiceCounter";
		    	{
				var counterLabel = document.createElement('div');
				counterLabel.id = "counterLabel";
				counterLabel.innerText =  (noOfRecPerUser + " OF "+REC_COUNT );
				divCounter.appendChild(counterLabel);
				var counterTimerLabel = document.createElement('div');
				counterTimerLabel.id = "recorderCanvasTimer";
				counterTimerLabel.innerText =  ("6.00s");
				divCounter.appendChild(counterTimerLabel);
			}	
	    		divOutlier.appendChild(divCounter);
		}
		    var divLabel = document.createElement('div');
		    divLabel.className = "StartLabelInfo";
		    divLabel.id = "labelForScanner";
			divLabel.innerHTML = "<p>Press voice record <strong>microphone</strong> to begin recording.</p>";
    
		    var divButton = document.createElement('div');
		    divButton.className = "RecordButton";
		    divButton.id = "scannerRecButton";
		    divButton.addEventListener("click", scannerClickHandler.bind(this,"startRecording"), false);
	    }
	    divOutlier.appendChild(divBackButton);
	    divOutlier.appendChild(divLabel);
	    divOutlier.appendChild(divCanvas);
	    
	    divOutlier.appendChild(divButton);	    
	    //divBackButton.style.border = "white 1px solid";
    }    
    // attach control to parent
    parentDiv.appendChild(divOutlier);	
}


/*
 * Function: Scanner Click Handler
 */
function scannerClickHandler(params) {
	console.log("ClickHandler called with "+ params);
	switch(params)
	{
	case 'scannerBackButton':
		noOfRecPerUser = 1;
		tmpUserIDManagerMap.length=0;
		loadVoicePrintOptionScreen();
		break;
	case 'startRecording':
		if(gCountDownTimer==600){
			$("#labelForScanner").html("<p>Say your pass phrase now.<br /><small>Example: The quick brown fox jumped over the lazy dog.</small></p>");
			var disableBack = document.getElementById("scannerBackButton"); 
			setTimeout(countDown.bind(this), 100);
			disableBack.style.visibility='hidden';
			changeMicState("1");
		}
		break;
	//case 'recallBackButton':
	//	loadVoicePrintOptionScreen();
	//	break;
		
	default:
		break;
	}	
}
function countDown(){
	if(gCountDownTimer>0){
		if(gCountDownTimer<100) color=" color='red'";
		else color="";
		gCountDownTimer=gCountDownTimer-10;
		timerSecs=Math.floor(gCountDownTimer/100);
		timerMillisecs=gCountDownTimer-(timerSecs*100);
		if(timerMillisecs===0) timerMillisecs="00";
		$("#recorderCanvasTimer").html("<font"+color+"'>"+timerSecs+"."+timerMillisecs+"s</font>");
		setTimeout(countDown.bind(this), 100);
	}else{
		changeMicState("2");
	}
}

/*
 * Prototype for changing the Mic button state
 */
function changeMicState(state)
{    
	console.log("GUI: Inside change Mic State : "+state);
	var divLabel = document.getElementById("labelForScanner");
	var divButton = document.getElementById("scannerRecButton");
	switch(state){
	case "0" :		
		divLabel.className = "StartLabelInfo";
		divButton.className = "RecordButton";
		var canvasFailed = document.getElementById("recorderCanvasFailed");
		var canvasStart = document.getElementById("recorderCanvasWave");
		var canvasTimer = document.getElementById("recorderCanvasTimer");
		canvasStart.style.visibility='visible';
		canvasTimer.style.visibility='visible';
		canvasFailed.style.visibility='hidden';
		var ctx = canvasStart.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		break;
	case "1" :
		divLabel.className = "InProgressLabelInfo";
		divButton.className = "InProgressButton"
		setTimeout(_timer.bind(this, "startRec"), 1000);		
		break;
	case "2" :
		//stopRecording();
		$("#labelForScanner").html("<p>Recording Complete<br /><small>To complete Voiceprint, re-record your passphrase now.</small></p>");
		noOfRecPerUser++;
		if(noOfRecPerUser > REC_COUNT){
			//Call function to escape recording screen!
			recallUser();
		}
		gCountDownTimer=600;
		$("#counterLabel").html( noOfRecPerUser + " OF "+REC_COUNT );
		//divLabel.className = "CompleteLabelInfo";
		divButton.className = "CompleteButton";
		break;
	case "3" :
		//saveAudio();
		divLabel.className = "RecordDoneLabelInfo";
		divButton.className = "CompleteButton";		
		//var canvasFinal = document.getElementById("recorderCanvasWave");
		//var blurContext = canvasFinal.getContext('2d'); 
		//blurContext.fillStyle = "grey";
		break;
	case "4" :
		var canvasFinal = document.getElementById("recorderCanvasWave");
		var blurContext = canvasFinal.getContext('2d'); 
		blurContext.fillStyle = "grey";
		var canvasFailed = document.getElementById("recorderCanvasFailed");
		canvasFinal.style.visibility='hidden';
		canvasFailed.style.visibility='visible';
		divLabel.className = "RecordFailedLabelInfo";
		divButton.className = "CompleteButton"
		break;
	case "5":
		divLabel.className = "RecordFoundLabelInfo";
		divButton.className = "CompleteButton";
		var userProfile;
		var foundUserName;
		if (foundUserInfo.gender === 'F')
		{
			userProfile = document.getElementById("foundUserProfile0");
			foundUserName = document.getElementById("textFoundName0");
			foundUserName.value = foundUserInfo.name.toUpperCase();
			userProfile.style.visibility='visible';
		}
		else if (foundUserInfo.gender === 'M')
		{
			userProfile = document.getElementById("foundUserProfile1");
			foundUserName = document.getElementById("textFoundName1");
			foundUserName.value = foundUserInfo.name.toUpperCase();
			userProfile.style.visibility='visible';
		}
		else
		{
			console.log("Something else!!!");
		}
		//var canvasFinal = document.getElementById("recorderCanvasWave");
		//var blurContext = canvasFinal.getContext('2d'); 
		//blurContext.fillStyle = "grey";
		break;
	default :
		break;
	}
}

/* ------------------------------- UserID List Control ------------------------------- */

/*
 * Function to create Div for User IDs
 */
function createUserIDScreen() {
	console.log("Create structure for User ID List Control");
	var parentDiv = document.getElementById('mainDiv');
	parentDiv.innerHTML = "";
	{
		var divOutlier = document.createElement('div');
	    divOutlier.className = "container";
	    divOutlier.id = "userIDContainer";
	    //divOutlier.style.border = "white 3px solid";
	    {
		    var divInsidelabel = document.createElement('div');
		    divInsidelabel.className = "chooseLabelForContainer";
		    //divInsidelabel.style.border = "white 2px solid";
	    	var divBackButtton = document.createElement('div');
			divBackButtton.id = "scannerBackButton";
			divBackButtton.className = "voiceBack";
			divBackButtton.addEventListener("click", scannerClickHandler.bind(this,divBackButtton.id), false);

		    
		    var divInsideBox = document.createElement('div');
		    divInsideBox.className = "boxForUserId";
		    //divInsideBox.style.border = "brown 2px solid";
		    {
		    	for(var i=0; i < 9; i++)
				{
					var divUserProfile = document.createElement('div');
					divUserProfile.id = "ProfileStruct"+i;
					//divUserProfile.style.border = "brown 1px solid"
					{
						var userName = document.createElement('input');
						userName.className = "textFoundName";
						userName.id = "textName"+i;
						userName.readOnly = true;
					}
					divUserProfile.appendChild(userName);
					divUserProfile.style.visibility='hidden';
					divUserProfile.addEventListener("click", userIDListClickHandler.bind(this,divUserProfile.id), false);
					//divUserProfile.style.visibility='hidden';
					//Appending UserProfile child to the parent
					divInsideBox.appendChild(divUserProfile);
				}
			    var divConfirmationBox = document.createElement('div');
			    divConfirmationBox.className = "ConfirmBox";
			    divConfirmationBox.id = "confirmBox";
			    //divConfirmationBox.style.border = "white 1px solid";
			    divConfirmationBox.style.visibility='hidden';
			    { 
				    var labelConfirmInfo = document.createElement('div');
				    labelConfirmInfo.className = "ConfirmMessage";
				    labelConfirmInfo.id = "confirmMsg";
				    //labelConfirmInfo.innerText = "ARE YOU SURE YOU WANT TO PERMANENTLY DELETE ALL VOICE PRINT RECORDS";
				    //labelConfirmInfo.style.border = "white 1px solid";
				    
				    var divYesButton = document.createElement('div');
				    divYesButton.className = "YesButton";
				    divYesButton.id = "yesButton";				    
				    //divYesButton.style.border = "white 1px solid";
				    divYesButton.addEventListener("click", userIDListClickHandler.bind(this,divYesButton.id), false);
				    
				    var divNoButton = document.createElement('div');
				    divNoButton.className = "NoButton";
				    divNoButton.id = "noButton";
				    //divNoButton.style.border = "white 1px solid";
				    divNoButton.addEventListener("click", userIDListClickHandler.bind(this,divNoButton.id), false);
			    }
			    divConfirmationBox.appendChild(labelConfirmInfo);
			    divConfirmationBox.appendChild(divYesButton);
			    divConfirmationBox.appendChild(divNoButton);
		    }   
		    divInsideBox.appendChild(divConfirmationBox);		    
		    
		    divDeleteAll = document.createElement('div');
		    divDeleteAll.className = "DeleteAllButton";
		    divDeleteAll.id = "deleteAllButton";
		    divDeleteAll.addEventListener("click", userIDListClickHandler.bind(this,divDeleteAll.id), false);
	    }
	    divOutlier.appendChild(divInsidelabel);
	    divOutlier.appendChild(divBackButtton);
	    divOutlier.appendChild(divInsideBox);
	    //divInsideBox.appendChild(divInsideBoxDisabled);
	    divOutlier.appendChild(divDeleteAll);
    }   
    // attach control to parent    
    parentDiv.appendChild(divOutlier);
    console.log("appendChild done");      	
}

function userIDListClickHandler(params) {
	console.log("ClickHandler called with "+ params);
	switch(params)
	{
	    case "ProfileStruct0":
	    case "ProfileStruct1":
	    case "ProfileStruct2":
	    case "ProfileStruct3":
	    case "ProfileStruct4":
	    case "ProfileStruct5":
	    case "ProfileStruct6":
	    case "ProfileStruct7":
	    case "ProfileStruct8":
	    	if(bSelectUserProfile)
	    	{	    		
	    		gIndexOfProfile = params.substr(13,1);
	    		console.log("User Profile selected ID: "+ gIndexOfProfile);
	    		bDeleteAll = false;	    	
	    		enableConfirmBox('single');
	    	}
	    	break;
	    case "yesButton":
	    	console.log("Yes Clicked!!!");
	    	bSelectUserProfile = true;
	    	deleteRecord(bDeleteAll,gIndexOfProfile);
	    	break;
	    case "noButton":
	    	console.log("No Clicked!!!");
	    	bSelectUserProfile = true;
	    	if(bDeleteAll)
	    	{
	    		flipUsersIDs("ENABLE","deleteAllButton");
	    	}
	    	else
	    	{
	    		flipUsersIDs("ENABLE","ProfileStruct"+gIndexOfProfile);
	    	}
	    	disableConfirmBox();
	    	break;
	    case "deleteAllButton":
	    	console.log("Delete for All Profiles called");
	    	bDeleteAll = true;
	    	enableConfirmBox('all');
	    	break;
	    case "userIDBackButton":
	    	params = {optionToActivate : "BackButton"}
	    	console.log("Control : Go Back");
	    	break;
		default:
			console.log("Error!!! In Handler Impl");
    		break;
	}
	
}

//Prototype for Generating User Ids
function genUID()
{    
	gNoOfCreatedProfile = userIDManagerMap.length;
	console.log("No of users: " + gNoOfCreatedProfile);
    for(var i = 0; i<userIDManagerMap.length; i++)
    {
    	var visibleProfiles = document.getElementById('ProfileStruct' + i);    	    
    	var divForUserName = document.getElementById('textName' + i);
    	console.log("User gender is: " + userIDManagerMap[i].gender);
    	if(userIDManagerMap[i].gender === 'M')
    	{    	
    		visibleProfiles.className = "male";
    	}
    	else
    	{
    		visibleProfiles.className = "female";    		
    	}
    	if(userIDManagerMap[i].name)
    	{
    		console.log("User Name is: " + userIDManagerMap[i].name);
    		divForUserName.value = userIDManagerMap[i].name;
    	}
    	else
    	{
    		console.log("User Name is NULL :(");
    	}
    	//gAddedUserProfile.push(userIDManagerMap[i]);
    	visibleProfiles.style.visibility='visible';
    }
}

//Prototype for Enabling the Confirmation Box for Deletion
function enableConfirmBox(params) 
{
	bSelectUserProfile = false;
	if(params === 'single')
	{
		console.log("Delete Single User Recieved!!! " + "ProfileStruct"+gIndexOfProfile);
		var divID1 = document.getElementById('ProfileStruct'+gIndexOfProfile);
		var divDeleteButton = document.getElementById('deleteAllButton');
		divDeleteButton.style.visibility = 'hidden';
		flipUsersIDs("DISABLE","ProfileStruct"+gIndexOfProfile);
		var confirmationBox = document.getElementById('confirmBox');		
		var confirmMessage = document.getElementById('confirmMsg');
		confirmMessage.innerText = "ARE YOU SURE YOU \nWANT TO \nPERMANENTLY DELETE \nTHE VOICE ID: \n"+userIDManagerMap[gIndexOfProfile].name;
		confirmationBox.style.visibility='visible';
	}
	else if(params === 'all')
		{
			console.log("DeleteAll Recieved!!!");
	    	flipUsersIDs("DISABLE",'deleteAllButton');
	    	var confirmationBox = document.getElementById('confirmBox');
	    	confirmationBox.style.visibility='visible';
	    	var confirmMessage = document.getElementById('confirmMsg');
			confirmMessage.innerText = "ARE YOU SURE YOU \nWANT TO \nPERMANENTLY DELETE \nALL VOICE ID";
	    	var divDeleteButton = document.getElementById('deleteAllButton');
			divDeleteButton.style.visibility = 'hidden';
		}
	else
		{
			console.log("error!!!");
		}	
}


//Prototype for Disabling the Confirmation Box for Deletion
function disableConfirmBox()
{
	var confirmationBox = document.getElementById('confirmBox');
	confirmationBox.style.visibility='hidden';
	var divDeleteButton = document.getElementById('deleteAllButton');
	divDeleteButton.style.visibility = 'visible';
}

//Prototype for disabling other unselected profiles
function flipUsersIDs(TYPE,params)
{
	console.log("Disabling other IDs called");
	for(var i=0; i<userIDManagerMap.length; i++)
		{			
			if((params != ('ProfileStruct'+i)) || (params === 'deleteAllButton'))
				{
					console.log("Disabling other IDS");
					var userProfileID = "#ProfileStruct"+i;
					if(TYPE === "DISABLE")
						$(userProfileID).css({opacity: 0.3});
					else
						$(userProfileID).css({opacity: 1});
				}
		}
}


/* ------------------------------- POPUP Message Handler ------------------------------- */

//Prototype for Displaying Pop Up Messages: Generic One
function popUpMessageHandler(state,type) {
	console.log("Pop Up Msghandlr called");
	switch (state) 
	{
	case 'state1':
		var parentDiv = document.getElementById('mainDiv');
		parentDiv.innerHTML = "";			    
		{    
			var divOutlier = document.createElement('div');
			divOutlier.className = "container";
			divOutlier.id = "MsgOneMoreRec";
			addVoiceMessageBox();
			divOutlier.appendChild(divMessageBox);
			if(type === "moreRec")
				divMessage.innerText = "For training, at least five recordings are needed";
			else if(type === "noUserProfile")
				divMessage.innerHTML = "<p>No user profile exists. \nPlease <strong>create new profile.</strong></p>";
			else if(type === "maxReached")
				divMessage.innerText = "Max user profile reached \nEdit/Delete existing user profile";
			else if(type === "alreadyExist")
				divMessage.innerText = "User with given name already exists \nPlease give another name";
			else if(type === "deleteSuccess")
			{
				if(bDeleteAll)
					divMessage.innerText = "\nAll voice ID's deleted";
				else
					divMessage.innerText = "\nVoice ID deleted";
			}
			else if(type === "deleteFailed")
				divMessage.innerText = "\nDeletion failed \nPlease try again";
			else
				dinMessage.innerText = "Dummy data";		     
		}	    
		// attach control to parent    
		parentDiv.appendChild(divOutlier);
		break;
	default:
		break;
	}
}

//Prototype for Creating Message Box: Generic One (Used within the scope of POPUP Message Handler)
function addVoiceMessageBox() {
	console.log("Inside Msg Box");
	divMessageBox = document.createElement('div');
	divMessageBox.id = "MessageBack";
	divMessage = document.createElement('div');
	divMessage.id = "Message";
	divMessageBox.appendChild(divMessage);
}
