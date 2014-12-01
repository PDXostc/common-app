/*
 * Main VoicePrintManager file: Creating DIVs, Calling WRT Calls And Managing Data
 */

/*
 * Global Variables Declaration
 */

var userIDManagerMap = new Array();
var tmpUserIDManagerMap = new Array();
var noOfUserProfiles = 0;
var noOfRecPerUser = 1;
var MAX_USER_COUNT = 9;
var MIN_REC_COUNT = 1;
var MAX_REC_COUNT = 5;
var REC_COUNT = MAX_REC_COUNT;
var SUCCESS = true;
var STATE_OF_SYSTEM = null;
var USER_ALREADY_EXIST = false;
var TESTING = false;
var userMetaData = null;
var addUserMetaData = null;
var tmpUserMetaData = null;
var foundUserInfo = {
		gender:'',
		name:''
	};
var tempUserIDObject = {
		gender :'',
		name :''
};
if(TESTING)
{
	var boolFlag = false;
}

/*
 * Manager function to take care New User ID Creation
 */
function createNewUser(){ 
    console.log("Create New User Called");
    STATE_OF_SYSTEM = "CreateNew";
    var tmpCheck = checkForExistingUsers();
    switch(tmpCheck)
    {
    case 'newUser':
    	//Load EnterUserInfo Screen
    	createEnterUserInfoScreen();
    	break;
    case 'maxReached':
    	//Show Max Reached Dialog
    	popUpMessageHandler("state1","maxReached");
    	setTimeout(_timer.bind(this, "errorCase"), 2000);    	
    	break;
    case 'alreadyExist':
    	//Show Already Exist Dialog
    	popUpMessageHandler("state1","alreadyExist");
    	setTimeout(_timer.bind(this, "errorCase"), 2000);
    	break;
    default:
    	console.warn("Invalid params : "+ tmpCheck);
    break;
    }
}

/*
 * Manager function for recalling the existing user
 */
function recallUser() 
{	
	console.log("Recall for the Existing User Called");
	if (/*noOfUserProfiles*/userIDManagerMap.length > 0 )
	{
		STATE_OF_SYSTEM = "Recall";
		loadVoiceScannerScreen();
	}
	else
	{
		//Show No User Profile Dialog
		popUpMessageHandler("state1","noUserProfile");
		setTimeout(_timer.bind(this, "errorCase"), 4000);		
	}
}

/*
 * Manager function for editing existing user
 */
function editExisting()
{
	console.log("Edit Existing User Called");
	if (userIDManagerMap.length > 0 )
	{		
		for(var i=0; i< userIDManagerMap.length; i++)
		{
			console.log("Data available is : "+ userIDManagerMap[i].name);
		}
				
		createUserIDScreen();
		genUID();
	}
	else
	{
		//Show No User Profile Dialog
		popUpMessageHandler("state1","noUserProfile");
		setTimeout(_timer.bind(this, "errorCase"), 2000);		
	}	
}

/*
 * Function for invoking the creation function for Voice Option Control 
 */
function loadVoicePrintOptionScreen(){     
    createVoicePrintOptions();
}

/*
 * Manager function for knowing the State of the system: Create New, Recall, etc
 */
function stateOfSystem(params) {
	STATE_OF_SYSTEM = params.optionToActivate;
	console.log("Current state : "+ STATE_OF_SYSTEM);
}

/*
 * Manager function for checking the number of users in the system 
 */
function checkForExistingUsers() {
	console.log("Checking for existing Users");
	// If no user exist in the the database, then create ID for a new User
	if (userIDManagerMap.length === 0 /*&& noOfUserProfiles === 0*/) {
		console.log("Adding First User");
		//eventMapper.sendEvent("enterUserInfo", null);
		return "newUser";
	}
	// If current user don't match with the existing user, but DB is full
	else if (userIDManagerMap.length === MAX_USER_COUNT
			/*&& noOfUserProfiles === MAX_USER_COUNT*/) {
		console.log("Maximum("
				+ MAX_USER_COUNT
				+ ") User Accounts Reached. Please Delete some existing user and add on top of it.")
		//eventMapper.sendEvent("genUserInfo", null);
		return "maxReached";
	}
	// If user already exist(match with exiting user), then prompts to info
	else if (USER_ALREADY_EXIST === 'true') {
		console.log("User Already Exist in the System");
		return "alreadyExist"
	}
	// If current user don't match with the existing user, then add in the datbase
	else {
		console.log("Adding New User");
		//eventMapper.sendEvent("enterUserInfo", null);
		return "newUser";
	}
}

/*
 * Function for invoking the creation function for Scanner Control 
 */
function loadVoiceScannerScreen(){
	bState = true;
	createScannerScreen();
}

/*
 * Function for starting the recording through the Mic input 
 */
function startRecording() 
{
	console.log("Manager: start recording received "+tmpUserMetaData +" "+noOfRecPerUser);	
	if(STATE_OF_SYSTEM === "CreateNew")
		{
			userMetaData = tmpUserMetaData + "_" + noOfRecPerUser;
			addUserMetaData = tmpUserMetaData;
		}
	else
		userMetaData = "detect";
	console.log("GUI: Start Recording calling for- "+ userMetaData);
	/* 										TODO
	 * ############## Recording and Plotting the live audio user sample ##############
	 */	
	// onsuccess
	function onSuccess(value) {		
		console.log(noOfRecPerUser+" Recording: Successful :)");				
		recordingComplete("SUCCESS");
	}
	// onerror
	function onError(e) {
		console.log("Recording: Failed :(");
		recordingComplete("FAILED");
	}
	console.log("Calling LIB for RECORD");
	if (!TESTING)
		tizen.voiceplugin.record(userMetaData,onSuccess, onError);	
	
	if (TESTING)
	{
		var delay = 5000;// 5 seconds
		setTimeout(_timer.bind(this, "timerForCompletion"), delay);
	}
}

/*
 * Function for handling the Mic Recording, when its complete
 */
function recordingComplete (params) {
	console.log("Manager Recording complete : state - "+params);
	console.log("Current No of Rec per user : " + noOfRecPerUser);
	changeMicState("2");

	if(!TESTING)
	{
		console.log("Expecting Rec Success from the LIB!!");
		if(params === "SUCCESS")
			SUCCESS = true;
		else
			SUCCESS = false;
	}
	
	if (STATE_OF_SYSTEM === 'CreateNew') 
	{
		console.log("STATE Of the System is: "+STATE_OF_SYSTEM + "With result as: "+ SUCCESS );
		
		console.log("noOfRecPerUser "+noOfRecPerUser);
		
		console.log("REC_COUNT "+REC_COUNT);
		
		// If Success
		if (SUCCESS) {
			console.log("success, SUCCESS "+SUCCESS);
			console.log("Success, noOfRecPerUser "+noOfRecPerUser);
			console.log("success, REC_COUNT "+REC_COUNT);
			console.log("Inside Success" );
			if(noOfRecPerUser == REC_COUNT )
			{
				// onsuccess
				function onSuccess(value) {		
					console.log("User Added Successfully :)");					
					userIDManagerMap.push.apply(userIDManagerMap,tmpUserIDManagerMap);
					console.log("Global Map length after adding user: "+ userIDManagerMap.length)
					tmpUserIDManagerMap.length = 0;					
					recordingSuccess();
				}
				// onerror
				function onError(e) {
					console.log("Adding User Failed :(");
					recordingFailed();
				}
				
				console.log(noOfRecPerUser + " no. of Rec Done. Calling LIB for AddNewPerson");				
				if (!TESTING)
					tizen.voiceplugin.addNewPerson(addUserMetaData,onSuccess, onError);
				if(TESTING)
				{
					userIDManagerMap.push.apply(userIDManagerMap,tmpUserIDManagerMap);
					console.log("Global Map length after adding user: "+ userIDManagerMap.length)
					tmpUserIDManagerMap.length = 0;					
					delay = 2000;// 2 seconds
					setTimeout(_timer.bind(this, "timerForRecordSuccess"), delay);
				}
			}
			else if(noOfRecPerUser > REC_COUNT)
			{
				console.log("MAX Reached...!!!");
				noOfRecPerUser=1;
				setTimeout(_timer.bind(this, "errorCase"), 1000);
			}
			else
			{
				console.log(noOfRecPerUser + " no. of Rec Done."+(REC_COUNT-noOfRecPerUser)+" more required!!");
				noOfRecPerUser++;
				setTimeout(_timer.bind(this, "popUpMsg"), 2000);		
				var delay = 4000;// 2 seconds
				setTimeout(_timer.bind(this, "counterNewRec"), delay);
			}
		} else // Failure Case
		{
			console.log("Recording Itself Failed");
			if(TESTING)
			{
				delay = 3000;// 3 seconds
				setTimeout(_timer.bind(this, "timerForRecordFailed"), delay);
			}
			
		}
	}
	else if (STATE_OF_SYSTEM === 'Recall') 
	{
		var usrFound = false;
		if (SUCCESS) 
		{	    	
			// Verification with the Alize Lib
			// onsuccess
			function onsuccess(value) 
			{
				console.log("Verify: Successful :)");
				console.log("Verified User Name: " + value.name);
				console.log("Verified User Gender: " + value.gender);
				for(var i=0; i<userIDManagerMap.length; i++)
				{
					if(userIDManagerMap[i].name === value.name
							&& userIDManagerMap[i].gender === value.gender)
					{
						console.log("HURRAY..!! USER FOUND :)");
						usrFound = true;
						foundUserInfo.name = value.name;
				    	foundUserInfo.gender = value.gender;				    	
				    	break;
					}
				}
				if(usrFound)
				{
					noOfRecPerUser = 1;
					setTimeout(_timer.bind(this,"timerForRecallingUser"),1000);
					//recordFound();
				}
				else
				{
					console.log("STRANGE: Got Success for User Found from Alize Lib. But the found user doesn't exist in the system");
					setTimeout(_timer.bind(this, "timerForRecordFailed"), 1000);				
				}
			}
			// onerror
			function onerror(e) 
			{
				console.log("Verify: Failed :(");
				//recordingFailed();
				setTimeout(_timer.bind(this, "timerForRecordFailed"), 1000);
			}
	    	
			console.log("Calling LIB for DETECT");			
			if(!TESTING)
				tizen.voiceplugin.detect(onsuccess, onerror);			
			if(TESTING)
	    	{
				if(boolFlag)
				{
					foundUserInfo.name = "JOHN DOE";
					foundUserInfo.gender = "M";
					delay=2000;//2 seconds
					setTimeout(_timer.bind(this,"timerForRecallingUser"),delay);
				}
				else
				{
					console.log("Recording Itself Failed");
					delay = 3000;// 3 seconds
					setTimeout(_timer.bind(this, "timerForRecordFailed"), delay);
				}
	    	}
		} else // Failure Case
		{
			if(TESTING)
			{
				console.log("Recording Itself Failed");
				delay = 3000;// 3 seconds
				setTimeout(_timer.bind(this, "timerForRecordFailed"), delay);
			}
		}
	}
	else 
	{
		console.log("Error in Params");
	}	
	
}

/*
 * Function for invoking the Rec Success case
 */
function recordingSuccess (params) {
	console.log("Manager Recording Success");
	changeMicState("3");	
	noOfUserProfiles++;
	/*
	 * 										TODO 
	 * ############## Recording and Plotting the live audio user sample ##############
	 * 
	 */
	var delay = 2000;// 2 seconds
	setTimeout(_timer.bind(this, "afterRecSuccessOptnMenu"), delay);
}

/*
 * Function for invoking the Rec Failure case
 */
function recordingFailed (params) {
	console.log("Manager Recording Failed");
	changeMicState("4");
	noOfRecPerUser++;
	if(noOfRecPerUser <= REC_COUNT )
	{		
		var delay = 2000;// 2 seconds
		setTimeout(_timer.bind(this, "counterNewRec"), delay);
	}
	else
	{
		console.log("Max Failure Rec Reached");
		noOfRecPerUser = 1;		
		setTimeout(_timer.bind(this, "errorCase"), 2000);
	}
}

/*
 * Function for displaying the found user
 */
function recordFound() {
	console.log("Manager Record Found");
	changeMicState("5");
	
	var delay = 3000;// 2 seconds
	setTimeout(_timer.bind(this, "afterRecFound"), delay);
}

/*
 * Function for Deleting User Records 
 */
function deleteRecord (flagAll,index) 
{
	console.log("Manager Delete Records");	
	if(flagAll)
	{
		userMetaData = "DELETE_ALL";
	}
	else
	{
		userMetaData = userIDManagerMap[index].name + "_" + userIDManagerMap[index].gender;
	}
	// onsuccess
	function onSuccess(value) 
	{		
		console.log("Deletion: Successful :)");
		if(!flagAll)
		{
			console.log("ID deleted: "+ userIDManagerMap[index].name);	
			userIDManagerMap.splice(index,1);
			console.log("After deletion, number of user profiles: "+ userIDManagerMap.length);
			localStorage.MasterVoiceDB = JSON.stringify(userIDManagerMap);
			popUpMessageHandler("state1","deleteSuccess");
			var delay = 2000;// 2 seconds
			setTimeout(_timer.bind(this, "errorCase"), delay);
		}
		else
		{
			userIDManagerMap.length = 0;
			console.log("After deletion, number of user profiles: "+ userIDManagerMap.length);
			localStorage.MasterVoiceDB = JSON.stringify(userIDManagerMap);
			popUpMessageHandler("state1","deleteSuccess");
			var delay = 2000;// 2 seconds
			setTimeout(_timer.bind(this, "errorCase"), delay);
		}
	}
	// onerror
	function onError(e) 
	{
		console.log("Deletion: Failed :(");
		popUpMessageHandler("state1","deleteFailed");
		var delay = 2000;// 2 seconds
		setTimeout(_timer.bind(this, "errorCase"), delay);
	}
	
	if (!TESTING)
	{
		console.log("Calling LIB for Deleting User Record with params: "+ userMetaData);	
		tizen.voiceplugin.deleteProfile(userMetaData,onSuccess, onError);
	}
	else
	{
		if(!flagAll)
		{
			console.log("ID deleted: "+ userIDManagerMap[index].name);	
			userIDManagerMap.splice(index,1);
			console.log("After deletion, number of user profiles: "+ userIDManagerMap.length);
			localStorage.MasterVoiceDB = JSON.stringify(userIDManagerMap);
			popUpMessageHandler("state1","deleteSuccess");
			var delay = 2000;// 2 seconds
			setTimeout(_timer.bind(this, "errorCase"), delay);
		}
		else
		{
			userIDManagerMap.length = 0;
			console.log("After deletion, number of user profiles: "+ userIDManagerMap.length);
			localStorage.MasterVoiceDB = JSON.stringify(userIDManagerMap);
			popUpMessageHandler("state1","deleteSuccess");
			var delay = 2000;// 2 seconds
			setTimeout(_timer.bind(this, "errorCase"), delay);
		}
	}
}


/*
 * Timer Function for maintaining the Internal State and invoking events after some durations 
 */
function _timer(timerParams) {
	console.log("Timer Called For : " + timerParams);
	switch (timerParams) {
	case "startRec":
		if (bState == true)
		{
			console.log("############ Button Enabled ###############");
			startRecording();
		}
		else
		{
			console.log("############ Button Disabled ###############");
		}
		bState = false;
		break;
	case "timerForCompletion":
		recordingComplete();
		break;
	case "timerForRecordSuccess":
		recordingSuccess();
		break;
	case "afterRecSuccessOptnMenu":
		console.log("Updating the Local Database with MagerMap with length of: "+ userIDManagerMap.length);
		localStorage.clear();
		localStorage.MasterVoiceDB = JSON.stringify(userIDManagerMap);				
		noOfRecPerUser = 1;
		loadVoicePrintOptionScreen();
		break;
	case "timerForRecordFailed":
		recordingFailed();
		break;
	case "timerForRecallingUser":
		recordFound();
		break;
	case "afterRecFound":
		loadVoicePrintOptionScreen();
		break;
	case "counterNewRec":
		loadVoiceScannerScreen();	
		break;
	case "popUpMsg":
		popUpMessageHandler("state1","moreRec");
		break;
	case "errorCase":
		loadVoicePrintOptionScreen();	
		break;
	case "reenterUserInfo":
		createEnterUserInfoScreen();
		break;
	default:
		break;
	}
}


/*
 * Testing Purpose : For generating user IDs
 */
function _genIDs() 
{
	console.log("############## Local GenID Called #############");
	for ( var i = 0; i < 7; i++) {
		if (i % 2 == '0') {
			var userIDObject = {
				gender : 'F',
				name : 'She' + i
			};
		} else {
			var userIDObject = {
				gender : 'M',
				name : 'He' + i
			};
		}
		noOfUserProfiles++;
		userIDManagerMap.push(userIDObject);
	}
}

/*
 * Function for reading the Local storage for the existing users in the system
 */
var voicePrintInit = function() 
{			
	console.log("Inside Voice Print Init...!!!");	
	
//	userIDManagerMap = JSON.parse(localStorage.MasterVoiceDB);
//	noOfUserProfiles = userIDManagerMap.length;
//	console.log('The total no of User IDs presents are : ' + noOfUserProfiles);
	
	if(localStorage.MasterVoiceDB)
	{				
		userIDManagerMap = JSON.parse(localStorage.MasterVoiceDB);		
		noOfUserProfiles = userIDManagerMap.length;
		console.log('The total no of User IDs presents are : ' + noOfUserProfiles);
	}
	else
	{
		console.log("No DB..!!");
	}	
	
	// onsuccess
	function onSuccess(value) {
		if(value)
		{
			if(value.noOfRec !== "")
			{
				console.log("Updating REC_COUNT to: "+ value.noOfRec);
				if(value.noOfRec > MIN_REC_COUNT || value.noOfRec <= MAX_REC_COUNT )
					REC_COUNT = value.noOfRec;
				console.log("Updated Record Count is: "+ REC_COUNT);
			}
			else
				console.log("Recieved value is NULL");
		}
		else
		{
			console.log("LIB not sending the REC_COUNT. Setting to DEFAULT(5)");
		}
		console.log("RESET Successfull :)");		
	}
	// onerror
	function onError(e) {
		console.log("RESET Failed :(");
	}
	
	//RESET Call for the LIB				
	if (!TESTING)
	{
		console.log("Calling LIB RESET Function...");
		tizen.voiceplugin.reset(onSuccess, onError);
	}
};

$(document).ready(voicePrintInit);
