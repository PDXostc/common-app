var userMap = new Array();
var userIDmanager = new Array();

function _createNewFingerprintCheck() {
	var totalUsers;
	totalUsers = userMap.length;
	//
	if (totalUsers == 10) {
		createNewFingerprint('userLimit');
		setTimeout(fingerprintOptions, 2500);
	} else
		createNewFingerprint('state1');
}
function _recallExistingFingerprintCheck() {
	var totalUsers;
	totalUsers = userMap.length;
	//
	if (totalUsers == 0) {
		recallExistingFingerprint('noUser');
		setTimeout(fingerprintOptions, 2500);
	} else {
		recallExistingFingerprint('state1');
		setTimeout(_recallFingerprint, 2500);
	}
}
function _editExistingFingerprintCheck() {
	if (userMap.length > 0) {
		editExistingFingerprint('state1', userMap);
	} else {
		editExistingFingerprint('noUser');
		setTimeout(fingerprintOptions, 2500);
	}
}
function _addUser(name, gender) {
	var tempUserMap = {
		Name : name,
		Gender : gender,
		RightIndex : 0,
		RightMiddle : 0,
		RightRing : 0,
		RightPinky : 0,
		RightThumb : 0,
		LeftIndex : 0,
		LeftMiddle : 0,
		LeftRing : 0,
		LeftPinky : 0,
		LeftThumb : 0
	};
	userMap.push(tempUserMap);
	return;
}
function _addFingerprint(name, gender, finger) {
	// createNewFingerprint('state4');
	var present = false;
	var mapToSend = null;
	for ( var i = 0; i < userMap.length; i++) {
		if (userMap[i].Name == name && userMap[i].Gender == gender) {
			present = true;
			break;
		}
	}
	if (!present) {
		console.log("_addFingerprint : Adding User");
		_addUser(name, gender);
	}
	console.log("_addFingerprint : Else Part");
	for ( var i = 0; i < userMap.length; i++) {
		if (userMap[i].Name == name && userMap[i].Gender == gender)
			break;
	}
	console.log("_addFingerprint : Sending Data");
	if (finger == 'RIGHT HAND INDEX') {
		userMap[i].RightIndex = 1;
		tizen.fingerprintplugin.ScanFinger(name, gender, 'RIGHT_INDEX',
				onsuccess, onerror);
	} else if (finger == 'RIGHT HAND MIDDLE') {
		userMap[i].RightMiddle = 1;
		tizen.fingerprintplugin.ScanFinger(name, gender, 'RIGHT_MIDDLE',
				onsuccess, onerror);
	} else if (finger == 'RIGHT HAND RING') {
		userMap[i].RightRing = 1;
		tizen.fingerprintplugin.ScanFinger(name, gender, 'RIGHT_RING',
				onsuccess, onerror);
	} else if (finger == 'RIGHT HAND PINKY') {
		userMap[i].RightPinky = 1;
		tizen.fingerprintplugin.ScanFinger(name, gender, 'RIGHT_LITTLE',
				onsuccess, onerror);
	} else if (finger == 'RIGHT HAND THUMB') {
		userMap[i].RightThumb = 1;
		tizen.fingerprintplugin.ScanFinger(name, gender, 'RIGHT_THUMB',
				onsuccess, onerror);
	} else if (finger == 'LEFT HAND INDEX') {
		userMap[i].LeftIndex = 1;
		tizen.fingerprintplugin.ScanFinger(name, gender, 'LEFT_INDEX',
				onsuccess, onerror);
	} else if (finger == 'LEFT HAND MIDDLE') {
		userMap[i].LeftMiddle = 1;
		tizen.fingerprintplugin.ScanFinger(name, gender, 'LEFT_MIDDLE',
				onsuccess, onerror);
	} else if (finger == 'LEFT HAND RING') {
		userMap[i].LeftRing = 1;
		tizen.fingerprintplugin.ScanFinger(name, gender, 'LEFT_RING',
				onsuccess, onerror);
	} else if (finger == 'LEFT HAND PINKY') {
		userMap[i].LeftPinky = 1;
		tizen.fingerprintplugin.ScanFinger(name, gender, 'LEFT_LITTLE',
				onsuccess, onerror);
	} else if (finger == 'LEFT HAND THUMB') {
		userMap[i].LeftThumb = 1;
		tizen.fingerprintplugin.ScanFinger(name, gender, 'LEFT_THUMB',
				onsuccess, onerror);
	}
	mapToSend = userMap[i];
	// onsuccess
	function onsuccess(value) {
		console.log("Recording: Successful :)");
		createNewFingerprint('idRecorded');

		// Added to add the user in Database
		console.log("Updating the Local Database"+ userMap.length);
		localStorage.clear();
		localStorage.MasterFingerDB = JSON.stringify(userMap);
	}
	// onerror
	function onerror(e) {
		console.log("Recording: Failed :(");
		createNewFingerprint('errorRecording');
		setTimeout(function() {
			createNewFingerprint('state3', null, mapToSend);
		}, 2500);
	}
}
function _recallFingerprint() {
	// recallExistingFingerprint('state2');
	tizen.fingerprintplugin.VerifyFinger(onsuccess, onerror);
	// onsuccess
	function onsuccess(value) {
		console.log("Verify: Successful :)");
		console.log("Verified User Name: " + value.name);
		console.log("Verified User Gender: " + value.gender);
		recallExistingFingerprint('matchFound', value.name, value.gender);
		setTimeout(fingerprintOptions, 3000);
	}// onerror
	function onerror(e) {
		console.log("Verify: Failed :(");
		recallExistingFingerprint('noMatchFound');
		setTimeout(fingerprintOptions, 3000);
	}
}
function _getUserRecord(name, gender) {
	for ( var i = 0; i < userMap.length; i++) {
		if (userMap[i].Name == name && userMap[i].Gender == gender)
			break;
	}
	return userMap[i];
}
function _deleteFingerprint(map) {
	if (map.user == 'ALL') {
		userMap.splice(0, userMap.length);
		tizen.fingerprintplugin.DeleteFinger(null, null, null,
				'DEL_ALL_RECORDS', onsuccess, onerror);
	} else {
		for ( var i = 0; i < userMap.length; i++) {
			if (userMap[i].Name == map.user && userMap[i].Gender == map.gender)
				break;
		}
		if (map.finger == 'ALL') {
			userMap.splice(i, 1);
			tizen.fingerprintplugin.DeleteFinger(map.user, map.gender, null,
					'DEL_USER', onsuccess, onerror);
		} else {
			if (map.finger == 'RIGHT HAND INDEX') {
				userMap[i].RightIndex = 0;
				tizen.fingerprintplugin.DeleteFinger(map.user, map.gender,
						'RIGHT_INDEX', 'DEL_FINGER', onsuccess, onerror);
			} else if (map.finger == 'RIGHT HAND MIDDLE') {
				userMap[i].RightMiddle = 0;
				tizen.fingerprintplugin.DeleteFinger(map.user, map.gender,
						'RIGHT_MIDDLE', 'DEL_FINGER', onsuccess, onerror);
			} else if (map.finger == 'RIGHT HAND RING') {
				userMap[i].RightRing = 0;
				tizen.fingerprintplugin.DeleteFinger(map.user, map.gender,
						'RIGHT_RING', 'DEL_FINGER', onsuccess, onerror);
			} else if (map.finger == 'RIGHT HAND PINKY') {
				userMap[i].RightPinky = 0;
				tizen.fingerprintplugin.DeleteFinger(map.user, map.gender,
						'RIGHT_PINKY', 'DEL_FINGER', onsuccess, onerror);
			} else if (map.finger == 'RIGHT HAND THUMB') {
				userMap[i].RightThumb = 0;
				tizen.fingerprintplugin.DeleteFinger(map.user, map.gender,
						'RIGHT_THUMB', 'DEL_FINGER', onsuccess, onerror);
			} else if (map.finger == 'LEFT HAND INDEX') {
				userMap[i].LeftIndex = 0;
				tizen.fingerprintplugin.DeleteFinger(map.user, map.gender,
						'LEFT_INDEX', 'DEL_FINGER', onsuccess, onerror);
			} else if (map.finger == 'LEFT HAND MIDDLE') {
				userMap[i].LeftMiddle = 0;
				tizen.fingerprintplugin.DeleteFinger(map.user, map.gender,
						'LEFT_MIDDLE', 'DEL_FINGER', onsuccess, onerror);
			} else if (map.finger == 'LEFT HAND RING') {
				userMap[i].LeftRing = 0;
				tizen.fingerprintplugin.DeleteFinger(map.user, map.gender,
						'LEFT_RING', 'DEL_FINGER', onsuccess, onerror);
			} else if (map.finger == 'LEFT HAND PINKY') {
				userMap[i].LeftPinky = 0;
				tizen.fingerprintplugin.DeleteFinger(map.user, map.gender,
						'LEFT_PINKY', 'DEL_FINGER', onsuccess, onerror);
			} else if (map.finger == 'LEFT HAND THUMB') {
				userMap[i].LeftThumb = 0;
				tizen.fingerprintplugin.DeleteFinger(map.user, map.gender,
						'LEFT_THUMB', 'DEL_FINGER', onsuccess, onerror);
			}
		}
	}
	// onsuccess
	function onsuccess(value) {
		console.log("Delete: Successful :)");
		editExistingFingerprint('idDeleted');
		setTimeout(fingerprintOptions, 2500);

		//added to delete the Local storage 
		console.log("After deletion, number of user profiles: "+ userMap.length);
		localStorage.MasterFingerDB = JSON.stringify(userMap);
	}
	function onerror(e) {
		console.log("Delete: Failed :(");
		fingerprintOptions();
	}
}
function _verifyDuplicateUser(user) {
	var duplicate = false;
	for ( var i = 0; i < userMap.length; i++) {
		if (userMap[i].Name == user.name && userMap[i].Gender == user.gender) {
			duplicate = true;
			break;
		}
	}
	return duplicate;
}
var fingerPrintInit = function() {
	console.log("FingerPrint Manager Loaded. Wait, doing fprint lib initialization..");

	//Local storage
	//Needs Work
	if(localStorage.MasterFingerDB)
	{				
		userMap = JSON.parse(localStorage.MasterFingerDB);		
		noOfUserProfiles = userMap.length;
		console.log('The total no of User IDs presents are : ' + noOfUserProfiles);
	}
	else
	{
		console.log("No DB..!!");
	}	

	function onsuccess(value) {
		console.log("Init: Successful :)");
	}
	function onerror(e) {
		console.log("Init: Failed :(");
	}
	console.log("Caliing finger print web runtime lib for initializing...");
	tizen.fingerprintplugin.Init(onsuccess, onerror);
};
$(document).ready(fingerPrintInit);
