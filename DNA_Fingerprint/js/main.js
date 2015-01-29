/* Copyright (C) Jaguar Land Rover - All Rights Reserved
*
* Proprietary and confidential
* Unauthorized copying of this file, via any medium, is strictly prohibited
*
* THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
* KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
* PARTICULAR PURPOSE.
*
* Filename:  header.txt
* Version:              1.0
* Date:                 January 2013
* Project:              Widget incorporation
* Contributors:         XXXXXXX
*                       xxxxxxx
*
* Incoming Code:        GStreamer 0.93, <link>
*
*/

/*global Bootstrap */
/**
 * Show Hide Div function
**/


/**
  * Boilerplate application provides starting point for new applications and provides basic layout and infrastructure:
  *
  * * {{#crossLink "Bootstrap"}}{{/crossLink}} component
  * * {{#crossLink "BottomPanel"}}{{/crossLink}} component
  * * {{#crossLink "TopBarIcons"}}{{/crossLink}} component
  *
  * Update following code for new applications built from this code:
  *
  * * `config.xml` - update `/widget/@id`, `/widget/tizen:application/@id`, `/widget/tizen:application/@name`, `/widget/name`
  * * `icon.png` - application icon
  *
  * @module BoilerplateApplication
  * @main BoilerplateApplication
 **/

/**
 * Reference to instance of  class object this class is inherited from dataModel {@link CarIndicator}
@property carInd {Object}
 */
var carInd;
/**
 * Reference to instance of ThemeEngine class object
 * @property te {Object}
 */
var te;

/**
 * Array of signals who want subscribe in carInd
 * @property carIndicatorSignals {string[]}
 */
var carIndicatorSignals =  [
                            "IviPoC_NightMode"
                            ];

function deleteItemClick(item) {
  console.log(item.target);
  console.log(item.data.html());
  item.data.remove();
}
// Handler function invoked from the Crosswalk extension
// when  bp.bpAsync is called.
var callback = function(response) {
console.log("bp callback js: Async>>> " + response);
};

function addItemClick(item) {
  console.log('addItemClick()');
  console.log(item);
  console.log($("input[name='item_title']").val());
  console.log($("textarea[name='item_description']").val());
  console.log($("[name='item_template']").contents());

  // Capture the title and description data to be sent to the extension later.
  var ti=$("input[name='item_title']").val();
  var descr=$("textarea[name='item_description']").val();

  var newItemTemplate = $($("[name='item_template']").html());
  console.log(newItemTemplate);
  newItemTemplate.find("td[name='item_title_field']").text($("input[name='item_title']").val());
  newItemTemplate.find("td[name='item_description_field']").text($("textarea[name='item_description']").val());
  console.log(newItemTemplate);
  var newItem = newItemTemplate.clone();
  newItem.find("input[name='delete_item']").click(newItem,deleteItemClick);
  $("tbody[name='item_list_body']").append(newItem);
  $("form[name='add_item_form']")[0].reset();

  // Send the title and description to the extension:
  var jsonenc = {api:"handleItem", dest:"Item Consumer", title:ti, desc:descr};
  console.log("stringify before bp.bpAsynch is "+JSON.stringify(jsonenc));
  bp.bpAsync(JSON.stringify(jsonenc), callback);
}

function themeErrorCB (msg) {
    console.log("Theme Error Callback: " + msg);
}

function smallClick(item) {
    console.log('smallClick()');

    var jsonenc = {api:"setTheme", theme:"/usr/share/weekeyboard/blue_600.edj"};
    console.log("RE: setTheme stringify: "+JSON.stringify(jsonenc));
    wkb_client.clientSync(JSON.stringify(jsonenc), themeErrorCB);
}

function bigClick(item) {
    console.log('bigClick()');

    var jsonenc = {api:"setTheme", theme:"/usr/share/weekeyboard/blue_1080.edj"};
    console.log("RE: setTheme stringify: "+JSON.stringify(jsonenc));
    wkb_client.clientSync(JSON.stringify(jsonenc), themeErrorCB);
}

/**
 * Initialize application components and register button events.
 *
 * @method init
 * @static
 */

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
    console.log("Right index hit");
    var jsonenc = { api: 'scanFinger', name: name, gender: gender, fingertypename: 'RIGHT_INDEX' };
    var res = fingerprint.clientSync(JSON.stringify(json), function(err) {console.log(err);});
    console.log(res.msg);
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
  console.log("Calling finger print web runtime lib for initializing...");
  fingerprint.clientSync(JSON.stringify({ api: 'init' }), function(err) {
      console.log('error: ' + err);
  });
};
$(document).ready(fingerPrintInit);

var user = {
  gender : 'M',
  name : null,
  selectedFinger : null
};

var currentAvtar = null;

function addFingerprintMessageBox() {
  this.divMessageBox = document.createElement('div');
  this.divMessageBox.id = "MessageBox";
  this.divMessage = document.createElement('div');
  this.divMessage.id = "Message";
  this.divMessageBox.appendChild(this.divMessage);
}
function addFingerprintScanningEffect() {
  this.divScanningScreen = document.createElement('div');
  this.divScanningScreen.id = "template4";
  this.divScanline = document.createElement('marquee');
  this.divScanline.id = "Scanline";
  this.divScanline.behaviour = "scroll";
  this.divScanline.direction = "down";
  this.divScanline.scrolldelay = "1";
  this.divScanline.scrollamount = "10";
  this.divScanlineImage = document.createElement('div');
  this.divScanlineImage.id = "ScanlineImage";
  this.divScanline.appendChild(this.divScanlineImage);
  this.divScanningScreen.appendChild(this.divScanline);
}
function addFingerprintConfirmationBox() {
  this.divpopupback = document.createElement('div');
  this.divpopupback.id = "popupback";
  this.divpopup = document.createElement('div');
  this.divpopup.id = "popup";
  this.divpopup_heading = document.createElement('div');
  this.divpopup_heading.id = "popup_heading";
  this.divpopup.appendChild(this.divpopup_heading);
  this.divpopup_yes = document.createElement('div');
  this.divpopup_yes.id = "popup_yes";
  this.divpopup_yes.innerText = "YES";
  this.divpopup.appendChild(this.divpopup_yes);
  this.divpopup_no = document.createElement('div');
  this.divpopup_no.id = "popup_no";
  this.divpopup_no.innerText = "NO";
  this.divpopup.appendChild(this.divpopup_no);
  this.mainDiv.appendChild(this.divpopup);
  this.mainDiv.appendChild(this.divpopupback);
}
function fingerprintOptions() {
  this.mainDiv.innerHTML = "";
  this.divFingerprintOptions = document.createElement('div');
  this.divFingerprintOptions.id = "template1";
  this.divfingerprint_options = document.createElement('div');
  this.divfingerprint_options.id = "fingerprint_options";
  this.divfingerprint_options.innerText = "FINGERPRINT OPTIONS";
  this.divcreate_new = document.createElement('div');
  this.divcreate_new.id = "create_new";
  this.divcreate_new.innerText = "CREATE NEW";
  this.divedit_existing = document.createElement('div');
  this.divedit_existing.id = "edit_existing";
  this.divedit_existing.innerText = "EDIT EXISTING";
  this.divrecall_existing = document.createElement('div');
  this.divrecall_existing.id = "recall_existing";
  this.divrecall_existing.innerText = "RECALL EXISTING";
  this.divFingerprintOptions.appendChild(this.divfingerprint_options);
  this.divFingerprintOptions.appendChild(this.divcreate_new);
  this.divFingerprintOptions.appendChild(this.divedit_existing);
  this.divFingerprintOptions.appendChild(this.divrecall_existing);
  this.mainDiv.appendChild(this.divFingerprintOptions);
  this.divcreate_new.onclick = function() {
    _createNewFingerprintCheck();
  };
  this.divedit_existing.onclick = function() {
    _editExistingFingerprintCheck();
  };
  this.divrecall_existing.onclick = function() {
    _recallExistingFingerprintCheck();
  };
}
function createNewFingerprint(state, finger, userMap) {
  switch (state) {
  case 'state1':
    this.mainDiv.innerHTML = "";
    this.divCreateNewFingerprint = document.createElement('div');
    this.divCreateNewFingerprint.id = "template1";
    this.divchoose_avatar = document.createElement('div');
    this.divchoose_avatar.id = "choose_avatar";
    this.divchoose_avatar.innerText = "CHOOSE AN AVATAR FOR YOUR PROFILE AND FILL OUT AN 8 CHARACTER NAME USING THE KEYBOARD BELOW. WHEN FINISHED, PRESS THE DONE BUTTON TO SAVE THE PROFILE RECORD.";
    this.divCreateNewFingerprint.appendChild(this.divchoose_avatar);
    //
    this.divmale = document.createElement('div');
    this.divmale.id = "maleAvatar";
    this.divCreateNewFingerprint.appendChild(this.divmale);
    //
    this.divfemale = document.createElement('div');
    this.divfemale.id = "femaleAvatar";
    this.divCreateNewFingerprint.appendChild(this.divfemale);
    //
    this.divdone = document.createElement('div');
    this.divdone.id = "done";
    this.divdone.innerText = "DONE";
    this.divCreateNewFingerprint.appendChild(this.divdone);
    this.divback = document.createElement('div');
    this.divback.id = "fp_back";
    this.mainDiv.appendChild(this.divback);
    this.mainDiv.appendChild(this.divCreateNewFingerprint);
    this.divback.onclick = function() {
      createNewFingerprint('fpBack');
    };
    this.divmale.onclick = function() {
      createNewFingerprint('chooseMale');
    };
    this.divfemale.onclick = function() {
      createNewFingerprint('chooseFemale');
    };
    this.divdone.onclick = function() {
      createNewFingerprint('addUser');
    };

    document.getElementById("InputFemale").style.visibility = "visible";
    document.getElementById("InputMale").style.visibility = "visible";
    document.getElementById("InputMale").type = "text";
    document.getElementById("InputFemale").type = "text";

    document.getElementById("InputFemale").value = "";
    document.getElementById("InputMale").value = "";

    break;
  case 'chooseMale':
    if (!currentAvtar) {
      currentAvtar = 'm';
      document.getElementById("InputMale").value = '';
      document.getElementById("InputFemale").value = '';
      this.divfemale.style.visibility = "hidden";
      this.divfemale.style.opacity = 0.5;
      this.divmale.style.opacity = 1;
      user.gender = 'M';
      document.getElementById("InputFemale").type = null;
    }
    break;
  case 'chooseFemale':
    if (!currentAvtar) {
      currentAvtar = 'f';
      document.getElementById("InputFemale").value = '';
      document.getElementById("InputMale").value = '';
      this.divmale.style.visibility = "hidden";

      document.getElementById("InputMale").type = null;

      this.divmale.style.opacity = 0.5;
      this.divfemale.style.opacity = 1;
      user.gender = 'F';
    }
    break;
  case 'fpBack':
    currentAvtar = null;
    document.getElementById("InputMale").style.visibility = "hidden";
    document.getElementById("InputFemale").style.visibility = "hidden";
    fingerprintOptions();
    break;
  case 'addUser':
    currentAvtar = null;
    document.getElementById("InputMale").style.visibility = "hidden";
    document.getElementById("InputFemale").style.visibility = "hidden";
    if (user.gender == 'F')
      var tmp = document.getElementById("InputFemale").value;
    else
      var tmp = document.getElementById("InputMale").value;

    // Check size of name must be less than 8
    var tmpsize = tmp.length;

    console.log("Usermap");

    // working with only 7 user chars

    if (tmp != null && tmp != '') {
      user.name = tmp.replace(/\s+/g, '-').toUpperCase();
      if (user.name.length > 8) {
        createNewFingerprint('lengthMessage');
        setTimeout(function() {
          createNewFingerprint('removeLengthMessage')
        }, 2500);
      } else if (_verifyDuplicateUser(user) == true) {
        createNewFingerprint('dupliacteMessage');
        setTimeout(function() {
          createNewFingerprint('removeDuplicateMessage')
        }, 2500);
      } else
        createNewFingerprint('state2');
    } else {
      document.getElementById("InputMale").style.visibility = "visible";
      document.getElementById("InputFemale").style.visibility = "visible";
    }
    break;

  case 'state2':
    this.mainDiv.innerHTML = "";
    this.divCreateNewFingerprint = document.createElement('div');
    this.divCreateNewFingerprint.id = "template1";
    this.divback = document.createElement('div');
    this.divback.id = "fp_back";
    this.mainDiv.appendChild(this.divback);
    this.mainDiv.appendChild(this.divCreateNewFingerprint);
    this.divback.onclick = function() {
      fingerprintOptions();
    };
    //
    this.divrecord_heading = document.createElement('div');
    this.divrecord_heading.id = "record_heading";
    this.divheading_identity = document.createElement('div');
    this.divheading_identity.id = "heading_identity_male";
    this.divheading_identity_name = document.createElement('div');
    this.divheading_identity_name.id = "heading_identity_name";
    this.divheading_identity.appendChild(this.divheading_identity_name);
    this.divrecord_heading.appendChild(this.divheading_identity);
    this.divselect_finger = document.createElement('div');
    this.divselect_finger.id = "select_finger";
    this.divselect_finger.innerText = "SELECT THE FINGER YOU WISH TO SCAN";
    this.divrecord_heading.appendChild(this.divselect_finger);
    this.divCreateNewFingerprint.appendChild(this.divrecord_heading);
    // left records
    this.divleft_records = document.createElement('div');
    this.divleft_records.id = "left_records";
    this.divleft_records.innerText = "LEFT HAND";
    this.divclear = document.createElement('div');
    this.divclear.id = "clear";
    this.divleft_records.appendChild(this.divclear);
    this.divCreateNewFingerprint.appendChild(this.divleft_records);
    // right records
    this.divright_records = document.createElement('div');
    this.divright_records.id = "right_records";
    this.divright_records.innerText = "RIGHT HAND";
    this.divclear = document.createElement('div');
    this.divclear.id = "clear";
    this.divright_records.appendChild(this.divclear);
    this.divCreateNewFingerprint.appendChild(this.divright_records);
    //
    if (user.gender == 'F')
      this.divheading_identity.id = "heading_identity_female";
    else
      this.divheading_identity.id = "heading_identity_male";
    this.divheading_identity_name.innerText = user.name;
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "right_hand_index";
    if (userMap != null) {
      if (userMap.RightIndex == 1)
        this.divhand_finger.style.opacity = 0.5;
      else
        this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "RIGHT HAND INDEX"), false);
    } else
      this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "RIGHT HAND INDEX"), false);
    this.divright_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "right_hand_middle";
    if (userMap != null) {
      if (userMap.RightMiddle == 1)
        this.divhand_finger.style.opacity = 0.5;
      else
        this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "RIGHT HAND MIDDLE"), false);
    } else
      this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "RIGHT HAND MIDDLE"), false);
    this.divright_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "right_hand_ring";
    if (userMap != null) {
      if (userMap.RightRing == 1)
        this.divhand_finger.style.opacity = 0.5;
      else
        this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "RIGHT HAND RING"), false);
    } else
      this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "RIGHT HAND RING"), false);
    this.divright_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "right_hand_pinky";
    if (userMap != null) {
      if (userMap.RightPinky == 1)
        this.divhand_finger.style.opacity = 0.5;
      else
        this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "RIGHT HAND PINKY"), false);
    } else
      this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "RIGHT HAND PINKY"), false);
    this.divright_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "right_hand_thumb";
    if (userMap != null) {
      if (userMap.RightThumb == 1)
        this.divhand_finger.style.opacity = 0.5;
      else
        this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "RIGHT HAND THUMB"), false);
    } else
      this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "RIGHT HAND THUMB"), false);
    this.divhand_finger.style.float = "right";
    this.divright_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "left_hand_index";
    if (userMap != null) {
      if (userMap.LeftIndex == 1)
        this.divhand_finger.style.opacity = 0.5;
      else
        this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "LEFT HAND INDEX"), false);
    } else
      this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "LEFT HAND INDEX"), false);
    this.divleft_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "left_hand_middle";
    if (userMap != null) {
      if (userMap.LeftMiddle == 1)
        this.divhand_finger.style.opacity = 0.5;
      else
        this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "LEFT HAND MIDDLE"), false);
    } else
      this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "LEFT HAND MIDDLE"), false);
    this.divleft_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "left_hand_ring";
    if (userMap != null) {
      if (userMap.LeftRing == 1)
        this.divhand_finger.style.opacity = 0.5;
      else
        this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "LEFT HAND RING"), false);
    } else
      this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "LEFT HAND RING"), false);
    this.divleft_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "left_hand_pinky";
    if (userMap != null) {
      if (userMap.LeftPinky == 1)
        this.divhand_finger.style.opacity = 0.5;
      else
        this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "LEFT HAND PINKY"), false);
    } else
      this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "LEFT HAND PINKY"), false);
    this.divleft_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "left_hand_thumb";
    if (userMap != null) {
      if (userMap.LeftThumb == 1)
        this.divhand_finger.style.opacity = 0.5;
      else
        this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "LEFT HAND THUMB"), false);
    } else
      this.divhand_finger.addEventListener("click", createNewFingerprint.bind(this, "showStatus", "LEFT HAND THUMB"), false);
    this.divleft_records.appendChild(this.divhand_finger);
    break;
  case 'showStatus':
    user.selectedFinger = finger;
    var fin = null;
    addFingerprintMessageBox();
    this.divCreateNewFingerprint.appendChild(this.divMessageBox);
    this.divMessage.innerText = "RECORDING:\n" + finger + "\n\nPLEASE WAIT WHILE \nDEVICE IS ACTIVATED";
    if (finger != "RIGHT HAND INDEX") {
      fin = document.getElementById('right_hand_index');
      fin.style.opacity = 0.5;
    }
    if (finger != "RIGHT HAND MIDDLE") {
      fin = document.getElementById('right_hand_middle');
      fin.style.opacity = 0.5;
    }
    if (finger != "RIGHT HAND PINKY") {
      fin = document.getElementById('right_hand_pinky');
      fin.style.opacity = 0.5;
    }
    if (finger != "RIGHT HAND THUMB") {
      fin = document.getElementById('right_hand_thumb');
      fin.style.opacity = 0.5;
    }
    if (finger != "RIGHT HAND RING") {
      fin = document.getElementById('right_hand_ring');
      fin.style.opacity = 0.5;
    }
    if (finger != "LEFT HAND INDEX") {
      fin = document.getElementById('left_hand_index');
      fin.style.opacity = 0.5;
    }
    if (finger != "LEFT HAND MIDDLE") {
      fin = document.getElementById('left_hand_middle');
      fin.style.opacity = 0.5;
    }
    if (finger != "LEFT HAND PINKY") {
      fin = document.getElementById('left_hand_pinky');
      fin.style.opacity = 0.5;
    }
    if (finger != "LEFT HAND THUMB") {
      fin = document.getElementById('left_hand_thumb');
      fin.style.opacity = 0.5;
    }
    if (finger != "LEFT HAND RING") {
      fin = document.getElementById('left_hand_ring');
      fin.style.opacity = 0.5;
    }
    setTimeout(function() {
      createNewFingerprint('state3')
    }, 2000);
    break;
  case 'state3':
    this.mainDiv.innerHTML = "";
    this.divCreateNewFingerprint = document.createElement('div');
    this.divCreateNewFingerprint.id = "template1";
    this.divback.onclick = function() {
      fingerprintOptions();
    };
    this.divplace_finger = document.createElement('div');
    this.divplace_finger.id = "place_finger";
    this.divplace_finger.innerText = "PLACE FINGER UPON SCANNER TO RECORD FINGERPRINT ID";
    this.divCreateNewFingerprint.appendChild(this.divplace_finger);
    this.mainDiv.appendChild(this.divCreateNewFingerprint);
    setTimeout(function() {
      _addFingerprint(user.name, user.gender, user.selectedFinger)
    }, 2000);
    break;
  case 'state4':
    this.mainDiv.innerHTML = "";
    addFingerprintScanningEffect();
    this.divpls_wait = document.createElement('div');
    this.divpls_wait.id = "pls_wait";
    this.divScanningScreen.appendChild(this.divpls_wait);
    this.mainDiv.appendChild(this.divScanningScreen);
    break;
  case 'idRecorded':
    this.mainDiv.innerHTML = "";
    this.divCreateNewFingerprint = document.createElement('div');
    this.divCreateNewFingerprint.id = "template2";
    this.divid_recorded = document.createElement('div');
    this.divid_recorded.id = "id_recorded";
    this.divid_recorded.innerText = "ID RECORDED";
    this.divCreateNewFingerprint.appendChild(this.divid_recorded);
    this.divdone = document.createElement('div');
    this.divdone.id = "done";
    this.divdone.innerText = "DONE";
    this.divCreateNewFingerprint.appendChild(this.divdone);
    this.divnxt_finger = document.createElement('div');
    this.divnxt_finger.id = "nxt_finger";
    this.divnxt_finger.innerText = "NEXT FINGER";
    this.divCreateNewFingerprint.appendChild(this.divnxt_finger);
    this.mainDiv.appendChild(this.divCreateNewFingerprint);
    this.divdone.onclick = function() {
      fingerprintOptions();
    };
    this.divnxt_finger.addEventListener("click", createNewFingerprint.bind(this, "reRecord", null, {
      Name : user.name,
      Gender : user.gender
    }), false);
    break;
  case 'errorRecording':
    this.mainDiv.innerHTML = "";
    this.divCreateNewFingerprint = document.createElement('div');
    this.divCreateNewFingerprint.id = "template3";
    this.divErrorDialog = document.createElement('div');
    this.divErrorDialog.id = "ErrorDialog";
    this.divErrorDialog.innerText = "ERROR RECORDING";
    this.divCreateNewFingerprint.appendChild(this.divErrorDialog);
    this.mainDiv.appendChild(this.divCreateNewFingerprint);
    break;
  case 'userLimit':
    this.mainDiv.innerHTML = "";
    this.divCreateNewFingerprint = document.createElement('div');
    this.divCreateNewFingerprint.id = "template1";
    addFingerprintMessageBox();
    this.divCreateNewFingerprint.appendChild(this.divMessageBox);
    this.divMessage.innerText = "ALREADY 10 USERS PRESENT \nDELETE SOME \nEXISTING RECORD \nTO CREATE NEW";
    this.mainDiv.appendChild(this.divCreateNewFingerprint);
    break;
  case 'lengthMessage':
    this.divCreateNewFingerprint.style.opacity = 0.5;
    this.divback.style.opacity = 0.5;
    this.divpopupback = document.createElement('div');
    this.divpopupback.id = "popupback";
    this.divpopup = document.createElement('div');
    this.divpopup.id = "popup";
    this.divpopup_heading = document.createElement('div');
    this.divpopup_heading.id = "popup_heading";
    this.divpopup_heading.innerText = "USER NAME SHOULD BE \nLESS THAN 9 CHARACTERS";
    this.divpopup.appendChild(this.divpopup_heading);
    this.mainDiv.appendChild(this.divpopup);
    this.mainDiv.appendChild(this.divpopupback);
    break;
  case 'removeLengthMessage':
//    this.divCreateNewFingerprint.style.opacity = 1;
//    this.divback.style.opacity = 1;
//    this.divpopup.style.visibility = 'hidden';
//    this.divpopupback.style.visibility = 'hidden';
    createNewFingerprint('state1');
    break;
  case 'dupliacteMessage':
    this.divCreateNewFingerprint.style.opacity = 0.5;
    this.divback.style.opacity = 0.5;
    this.divpopupback = document.createElement('div');
    this.divpopupback.id = "popupback";
    this.divpopup = document.createElement('div');
    this.divpopup.id = "popup";
    this.divpopup_heading = document.createElement('div');
    this.divpopup_heading.id = "popup_heading";
    this.divpopup_heading.innerText = "USER ALREADY EXISTS \nPLEASE SELECT A DIFFERENT USERNAME & GENDER";
    this.divpopup.appendChild(this.divpopup_heading);
    this.mainDiv.appendChild(this.divpopup);
    this.mainDiv.appendChild(this.divpopupback);
    break;
  case 'removeDuplicateMessage':
//    this.divCreateNewFingerprint.style.opacity = 1;
//    this.divback.style.opacity = 1;
//    this.divpopup.style.visibility = 'hidden';
//    this.divpopupback.style.visibility = 'hidden';
    createNewFingerprint('state1');
    break;
  case 'reRecord':
    var tempUserMap = _getUserRecord(userMap.Name, userMap.Gender);
    if (tempUserMap.RightIndex == 1 && tempUserMap.RightMiddle == 1 && tempUserMap.RightRing == 1 && tempUserMap.RightPinky == 1 && tempUserMap.RightThumb == 1 && tempUserMap.LeftIndex == 1
        && tempUserMap.LeftMiddle == 1 && tempUserMap.LeftRing == 1 && tempUserMap.LeftPinky == 1 && tempUserMap.LeftThumb == 1) {
      createNewFingerprint('fingerLimit');
      setTimeout(fingerprintOptions, 2500);
    } else
      createNewFingerprint('state2', null, tempUserMap);
    break;
  case 'fingerLimit':
    this.mainDiv.innerHTML = "";
    this.divCreateNewFingerprint = document.createElement('div');
    this.divCreateNewFingerprint.id = "template1";
    addFingerprintMessageBox();
    this.divCreateNewFingerprint.appendChild(this.divMessageBox);
    this.divMessage.innerText = "ALL FINGERS FOR " + user.name + " HAVE BEEN RECORDED.";
    this.mainDiv.appendChild(this.divCreateNewFingerprint);
    break;
  default:
    break;
  }
}
function recallExistingFingerprint(state, user, gender) {
  switch (state) {
  case 'state1':
    this.mainDiv.innerHTML = "";
    this.divRecallExistingFingerprint = document.createElement('div');
    this.divRecallExistingFingerprint.id = "template1";
    this.divswipe_finger = document.createElement('div');
    this.divswipe_finger.id = "swipe_finger";
    this.divswipe_finger.innerText = "PLACE FINGER UPON SCANNER TO RECALL FINGERPRINT ID";
    this.divRecallExistingFingerprint.appendChild(this.divswipe_finger);
    this.mainDiv.appendChild(this.divRecallExistingFingerprint);
    break;
  case 'noUser':
    this.mainDiv.innerHTML = "";
    this.divRecallExistingFingerprint = document.createElement('div');
    this.divRecallExistingFingerprint.id = "template1";
    addFingerprintMessageBox();
    this.divRecallExistingFingerprint.appendChild(this.divMessageBox);
    this.divMessage.innerText = "NO USER PRESENT \nCREATE A NEW USER FIRST";
    this.mainDiv.appendChild(this.divRecallExistingFingerprint);
    break;
  case 'state2':
    this.mainDiv.innerHTML = "";
    addFingerprintScanningEffect();
    this.divscanning = document.createElement('div');
    this.divscanning.id = "scanning";
    this.divScanningScreen.appendChild(this.divscanning);
    this.mainDiv.appendChild(this.divScanningScreen);
    break;
  case 'matchFound':
    this.mainDiv.innerHTML = "";
    this.divRecallExistingFingerprint = document.createElement('div');
    this.divRecallExistingFingerprint.id = "template2";
    this.divVerified_Heading = document.createElement('div');
    this.divVerified_Heading.id = "Verified_Heading";
    this.divVerified_Heading.innerText = "ID VERIFIED !";
    this.divRecallExistingFingerprint.appendChild(this.divVerified_Heading);
    //
    this.divUserDetails = document.createElement('div');
    if (gender == 'M')
      this.divUserDetails.id = "UserDetailsMale";
    else
      this.divUserDetails.id = "UserDetailsFemale";
    this.divheading_identity_name = document.createElement('div');
    this.divheading_identity_name.id = "heading_identity_name";
    this.divheading_identity_name.innerText = user;
    this.divUserDetails.appendChild(this.divheading_identity_name);
    //
    this.divRecallExistingFingerprint.appendChild(this.divUserDetails);
    this.mainDiv.appendChild(this.divRecallExistingFingerprint);
    break;
  case 'noMatchFound':
    this.mainDiv.innerHTML = "";
    this.divRecallExistingFingerprint = document.createElement('div');
    this.divRecallExistingFingerprint.id = "template3";
    this.divNomatchDialog = document.createElement('div');
    this.divNomatchDialog.id = "NomatchDialog";
    this.divNomatchDialog.innerText = "NO ID MATCH FOUND";
    this.divRecallExistingFingerprint.appendChild(this.divNomatchDialog);
    this.mainDiv.appendChild(this.divRecallExistingFingerprint);
    break;
  default:
    break;
  }
}
function editExistingFingerprint(state, userMap) {
  switch (state) {
  case 'state1':
    this.mainDiv.innerHTML = "";
    this.divEditExistingFingerprint = document.createElement('div');
    this.divEditExistingFingerprint.id = "template1";
    this.divchoose_fingerprint = document.createElement('div');
    this.divchoose_fingerprint.id = "choose_fingerprint";
    this.divchoose_fingerprint.innerText = "CHOOSE A FINGERPRINT RECORD TO EDIT OR PRESS DELETE ALL TO CLEAR ALL FINGERPINT RECORD";
    this.divEditExistingFingerprint.appendChild(this.divchoose_fingerprint);
    this.divall_identities = document.createElement('div');
    this.divall_identities.id = "all_identities";
    this.divEditExistingFingerprint.appendChild(this.divall_identities);
    this.divpress_to_delete = document.createElement('div');
    this.divpress_to_delete.id = "press_to_delete";
    this.divpress_to_delete.addEventListener("click", editExistingFingerprint.bind(this, 'deleteAllConfirmation'), false);
    this.divEditExistingFingerprint.appendChild(this.divpress_to_delete);
    this.divback = document.createElement('div');
    this.divback.id = "fp_back";
    this.divEditExistingFingerprint.appendChild(this.divback);
    this.divback.onclick = function() {
      fingerprintOptions();
    };
    this.mainDiv.appendChild(this.divEditExistingFingerprint);
    //
    for ( var i = 0; i < userMap.length; i++) {
      if (userMap[i].Gender == 'M') {
        this.divmale_identity = document.createElement('div');
        this.divmale_identity.id = "male_identity";
        this.divmale_identity.addEventListener("click", editExistingFingerprint.bind(this, 'showFingerprintRecordsForUser', userMap[i]), false);
        this.dividentity_name = document.createElement('div');
        this.dividentity_name.id = "identity_name";
        this.dividentity_name.innerText = userMap[i].Name;
        this.divmale_identity.appendChild(this.dividentity_name);
        this.divall_identities.appendChild(this.divmale_identity);
      } else if (userMap[i].Gender == 'F') {
        this.divfemale_identity = document.createElement('div');
        this.divfemale_identity.id = "female_identity";
        this.divfemale_identity.addEventListener("click", editExistingFingerprint.bind(this, 'showFingerprintRecordsForUser', userMap[i]), false);
        this.dividentity_name = document.createElement('div');
        this.dividentity_name.id = "identity_name";
        this.dividentity_name.innerText = userMap[i].Name;
        this.divfemale_identity.appendChild(this.dividentity_name);
        this.divall_identities.appendChild(this.divfemale_identity);
      }
    }
    break;
  case 'noUser':
    this.mainDiv.innerHTML = "";
    this.divEditExistingFingerprint = document.createElement('div');
    this.divEditExistingFingerprint.id = "template1";
    addFingerprintMessageBox();
    this.divEditExistingFingerprint.appendChild(this.divMessageBox);
    this.divMessage.innerText = "NO USER PRESENT \nCREATE A NEW USER FIRST";
    this.mainDiv.appendChild(this.divEditExistingFingerprint);
    break;
  case 'deleteAllConfirmation':
    addFingerprintConfirmationBox();
    this.divall_identities.style.opacity = 0.6;
    this.divback.style.opacity = 0.6;
    this.divpress_to_delete.style.opacity = 0;
    this.divpopup_heading.innerText = 'ARE YOU SURE YOU \nWANT TO \nPERMANENTLY DELETE \nALL FINGERPRINT \nRECORDS';
    this.divpopup_yes.addEventListener("click", _deleteFingerprint.bind(this, {
      user : 'ALL',
      gender : null,
      finger : 'ALL'
    }), false);
    this.divpopup_no.addEventListener("click", editExistingFingerprint.bind(this, 'deleteAllRemoveConfirmation'), false);
    break;
  case 'deleteAllRemoveConfirmation':
    this.divpress_to_delete.style.opacity = 1;
    this.divback.style.opacity = 1;
    this.divall_identities.style.opacity = 1;
    this.divpopup.style.visibility = 'hidden';
    this.divpopupback.style.visibility = 'hidden';
    break;
  case 'deleteUserConfirmation':
    addFingerprintConfirmationBox();
    this.divright_records.style.opacity = 0.6;
    this.divleft_records.style.opacity = 0.6;
    this.divpress_to_delete.style.opacity = 0;
    this.divpopup_heading.innerText = "ARE YOU SURE YOU WANT TO PERMANENTLY DELETE THE ENTIRE RECORD: " + userMap.Name;
    this.divpopup_yes.addEventListener("click", _deleteFingerprint.bind(this, {
      user : userMap.Name,
      gender : userMap.Gender,
      finger : userMap.Finger
    }), false);
    this.divpopup_no.addEventListener("click", editExistingFingerprint.bind(this, 'deleteUserRemoveConfirmation'), false);
    break;
  case 'deleteUserRemoveConfirmation':
    this.divright_records.style.opacity = 1;
    this.divleft_records.style.opacity = 1;
    this.divpress_to_delete.style.opacity = 1;
    this.divpopup.style.visibility = 'hidden';
    this.divpopupback.style.visibility = 'hidden';
    break;
  case 'deleteThisFingerprintConfirmation':
    addFingerprintConfirmationBox();
    this.divright_records.style.opacity = 0.6;
    this.divleft_records.style.opacity = 0.6;
    this.divpress_to_delete.style.opacity = 0;
    this.divpopup_heading.innerText = "ARE YOU SURE YOU WANT TO EDIT " + userMap.Finger + " FINGERPRINT RECORD?";
    this.divpopup_yes.addEventListener("click", _deleteFingerprint.bind(this, {
      user : userMap.User,
      gender : userMap.Gender,
      finger : userMap.Finger
    }), false);
    this.divpopup_no.addEventListener("click", editExistingFingerprint.bind(this, 'deleteThisFingerprintRemoveConfirmation'), false);
    break;
  case 'deleteThisFingerprintRemoveConfirmation':
    this.divright_records.style.opacity = 1;
    this.divleft_records.style.opacity = 1;
    this.divpress_to_delete.style.opacity = 1;
    this.divpopup.style.visibility = 'hidden';
    this.divpopupback.style.visibility = 'hidden';
    break;
  case 'reRecordThisFingerprintConfirmation':
    addFingerprintConfirmationBox();
    user.gender = userMap.Gender;
    user.name = userMap.Name;
    this.divright_records.style.opacity = 0.6;
    this.divleft_records.style.opacity = 0.6;
    this.divpress_to_delete.style.opacity = 0;
    this.divpopup_heading.innerText = "DO YOU WANT TO RECORD REMAINING FINGERPRINTS FOR " + userMap.Name + " ?";
    this.divpopup_yes.addEventListener("click", createNewFingerprint.bind(this, "reRecord", null, {
      Name : userMap.Name,
      Gender : userMap.Gender
    }), false);
    this.divpopup_no.addEventListener("click", editExistingFingerprint.bind(this, 'deleteThisFingerprintRemoveConfirmation'), false);
    break;
  case 'showFingerprintRecordsForUser':
    this.mainDiv.innerHTML = "";
    this.divShowFingerprintRecordsForUser = document.createElement('div');
    this.divShowFingerprintRecordsForUser.id = "ShowFingerprintRecordsForUser";
    this.divrecord_heading = document.createElement('div');
    this.divrecord_heading.id = "record_heading";
    this.divheading_identity = document.createElement('div');
    this.divheading_identity.id = "heading_identity_male";
    this.divheading_identity_name = document.createElement('div');
    this.divheading_identity_name.id = "heading_identity_name";
    this.divheading_identity.appendChild(this.divheading_identity_name);
    this.divrecord_heading.appendChild(this.divheading_identity);
    this.divselect_individual = document.createElement('div');
    this.divselect_individual.id = "select_individual";
    this.divselect_individual.innerText = "SELECT AN INDIVIDUAL FINGERPRINT RECORD TO DELETE AND RE-RECORD FROM THE OPTIONS BELOW.";
    this.divrecord_heading.appendChild(this.divselect_individual);
    this.divShowFingerprintRecordsForUser.appendChild(this.divrecord_heading);
    this.divback = document.createElement('div');
    this.divback.id = "fp_back";
    this.divShowFingerprintRecordsForUser.appendChild(this.divback);
    this.divback.onclick = function() {
      fingerprintOptions();
    };
    // left records
    this.divleft_records = document.createElement('div');
    this.divleft_records.id = "left_records";
    this.divleft_records.innerText = "LEFT RECORDS";
    this.divclear = document.createElement('div');
    this.divclear.id = "clear";
    this.divleft_records.appendChild(this.divclear);
    this.divShowFingerprintRecordsForUser.appendChild(this.divleft_records);
    // right records
    this.divright_records = document.createElement('div');
    this.divright_records.id = "right_records";
    this.divright_records.innerText = "RIGHT RECORDS";
    this.divright_records.appendChild(this.divclear);
    this.divShowFingerprintRecordsForUser.appendChild(this.divright_records);
    this.divpress_to_delete = document.createElement('div');
    this.divpress_to_delete.id = "press_to_delete";
    this.divShowFingerprintRecordsForUser.appendChild(this.divpress_to_delete);
    this.mainDiv.appendChild(this.divShowFingerprintRecordsForUser);
    this.divpress_to_delete.addEventListener("click", editExistingFingerprint.bind(this, 'deleteUserConfirmation', {
      Name : userMap.Name,
      Gender : userMap.Gender,
      Finger : 'ALL'
    }), false);
    //
    if (userMap.Gender == 'F')
      this.divheading_identity.id = "heading_identity_female";
    else
      this.divheading_identity.id = "heading_identity_male";
    this.divheading_identity_name.innerText = userMap.Name;
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "right_hand_index";
    if (userMap.RightIndex == 1) {
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "deleteThisFingerprintConfirmation", {
        User : userMap.Name,
        Gender : userMap.Gender,
        Finger : "RIGHT HAND INDEX"
      }), false);
    } else {
      this.divhand_finger.style.opacity = 0.5;
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "reRecordThisFingerprintConfirmation", {
        Name : userMap.Name,
        Gender : userMap.Gender
      }), false);
    }
    this.divright_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "right_hand_middle";
    if (userMap.RightMiddle == 1) {
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "deleteThisFingerprintConfirmation", {
        User : userMap.Name,
        Gender : userMap.Gender,
        Finger : "RIGHT HAND MIDDLE"
      }), false);
    } else {
      this.divhand_finger.style.opacity = 0.5;
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "reRecordThisFingerprintConfirmation", {
        Name : userMap.Name,
        Gender : userMap.Gender
      }), false);
    }
    this.divright_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "right_hand_ring";
    if (userMap.RightRing == 1) {
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "deleteThisFingerprintConfirmation", {
        User : userMap.Name,
        Gender : userMap.Gender,
        Finger : "RIGHT HAND RING"
      }), false);
    } else {
      this.divhand_finger.style.opacity = 0.5;
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "reRecordThisFingerprintConfirmation", {
        Name : userMap.Name,
        Gender : userMap.Gender
      }), false);
    }
    this.divright_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "right_hand_pinky";
    if (userMap.RightPinky == 1) {
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "deleteThisFingerprintConfirmation", {
        User : userMap.Name,
        Gender : userMap.Gender,
        Finger : "RIGHT HAND PINKY"
      }), false);
    } else {
      this.divhand_finger.style.opacity = 0.5;
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "reRecordThisFingerprintConfirmation", {
        Name : userMap.Name,
        Gender : userMap.Gender
      }), false);
    }
    this.divright_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "right_hand_thumb";
    if (userMap.RightThumb == 1) {
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "deleteThisFingerprintConfirmation", {
        User : userMap.Name,
        Gender : userMap.Gender,
        Finger : "RIGHT HAND THUMB"
      }), false);
    } else {
      this.divhand_finger.style.opacity = 0.5;
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "reRecordThisFingerprintConfirmation", {
        Name : userMap.Name,
        Gender : userMap.Gender
      }), false);
    }
    this.divhand_finger.style.float = "right";
    this.divright_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "left_hand_index";
    if (userMap.LeftIndex == 1) {
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "deleteThisFingerprintConfirmation", {
        User : userMap.Name,
        Gender : userMap.Gender,
        Finger : "LEFT HAND INDEX"
      }), false);
    } else {
      this.divhand_finger.style.opacity = 0.5;
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "reRecordThisFingerprintConfirmation", {
        Name : userMap.Name,
        Gender : userMap.Gender
      }), false);
    }
    this.divleft_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "left_hand_middle";
    if (userMap.LeftMiddle == 1) {
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "deleteThisFingerprintConfirmation", {
        User : userMap.Name,
        Gender : userMap.Gender,
        Finger : "LEFT HAND MIDDLE"
      }), false);
    } else {
      this.divhand_finger.style.opacity = 0.5;
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "reRecordThisFingerprintConfirmation", {
        Name : userMap.Name,
        Gender : userMap.Gender
      }), false);
    }
    this.divleft_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "left_hand_ring";
    if (userMap.LeftRing == 1) {
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "deleteThisFingerprintConfirmation", {
        User : userMap.Name,
        Gender : userMap.Gender,
        Finger : "LEFT HAND RING"
      }), false);
    } else {
      this.divhand_finger.style.opacity = 0.5;
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "reRecordThisFingerprintConfirmation", {
        Name : userMap.Name,
        Gender : userMap.Gender
      }), false);
    }
    this.divleft_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "left_hand_pinky";
    if (userMap.LeftPinky == 1) {
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "deleteThisFingerprintConfirmation", {
        User : userMap.Name,
        Gender : userMap.Gender,
        Finger : "LEFT HAND PINKY"
      }), false);
    } else {
      this.divhand_finger.style.opacity = 0.5;
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "reRecordThisFingerprintConfirmation", {
        Name : userMap.Name,
        Gender : userMap.Gender
      }), false);
    }
    this.divleft_records.appendChild(this.divhand_finger);
    //
    this.divhand_finger = document.createElement('div');
    this.divhand_finger.id = "left_hand_thumb";
    if (userMap.LeftThumb == 1) {
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "deleteThisFingerprintConfirmation", {
        User : userMap.Name,
        Gender : userMap.Gender,
        Finger : "LEFT HAND THUMB"
      }), false);
    } else {
      this.divhand_finger.style.opacity = 0.5;
      this.divhand_finger.addEventListener("click", editExistingFingerprint.bind(this, "reRecordThisFingerprintConfirmation", {
        Name : userMap.Name,
        Gender : userMap.Gender
      }), false);
    }
    this.divleft_records.appendChild(this.divhand_finger);
    break;
  case 'idDeleted':
    this.mainDiv.innerHTML = "";
    this.divIdDeleted = document.createElement('div');
    this.divIdDeleted.id = "template1";
    this.divDeleteDialog = document.createElement('div');
    this.divDeleteDialog.id = "DeleteDialog";
    this.divDeleteDialog.innerText = "RECORD DELETED";
    this.divIdDeleted.appendChild(this.divDeleteDialog);
    this.mainDiv.appendChild(this.divIdDeleted);
    break;
  default:
    break;
  }
}

var init = function () {
    var bootstrap = new Bootstrap(function (status) {
        $("#topBarIcons").topBarIconsPlugin('init', 'news');
        $("#clockElement").ClockPlugin('init', 5);
        $("#clockElement").ClockPlugin('startTimer');
        $('#bottomPanel').bottomPanel('init');

        if (tizen.speech) {
            setupSpeechRecognition();
        } else {
            console.log("Store: Speech Recognition not running, voice control will be unavailable");
        }

        bootstrap.themeEngine.addStatusListener(function (eData) {
            // setThemeImageColor();
        });
    });
};


/**
 * Calls initialization fuction after document is loaded.
 * @method $(document).ready
 * @param init {function} Callback function for initialize Store.
 * @static
 **/





$(document).ready(init);



function setupSpeechRecognition() {
  console.log("Store setupSpeechRecognition");
  Speech.addVoiceRecognitionListener({
    onapplicationinstall : function() {
      console.log("Speech application install invoked");
      if (_applicationDetail.id !== undefined) {
        StoreLibrary.installApp(_applicationDetail.id);
      }
    },
    onapplicationuninstall : function() {
      console.log("Speech application uninstall invoked");
      if (_applicationDetail.id !== undefined) {
        StoreLibrary.uninstallApp(_applicationDetail.id);
      }
    }

  });
}
