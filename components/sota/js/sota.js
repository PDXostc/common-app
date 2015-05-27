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

/*Leave the "open" class for when we re-factor the modal to use 100% flex layout*/

conn = {}; //Generic Object that will be a websocket connection
sotaUpdateElements={};
sotaUpdateElements.TemplateHTML = "components/sota/sota.html";
currentApp = tizen.application.getCurrentApplication();

sotaUpdateElements.importSuccess = function(html){

  console.log("Appending SOTA components");
  var importSet = html.path[0].import;

  //attach SOTA modals to the interface.
  var update = importSet.getElementById('updates');
  var progress = importSet.getElementById('progress-bar');
  var complete = importSet.getElementById('sota-complete');


  $("#center-panel").append(update);
  $("#center-panel").append(progress);
  $("#center-panel").append(complete);

  //modal close handlers
  $("#updates #close-sota").click(function() {
    hideModal('updates');
  });

  $("#progress-bar #close-sota").click(function() {
    console.log("closed the sota progress-bar");
    hideModal('progress-bar');
  });

  $("#sota-complete #close-sota").click(function() {
    console.log("closed the sota confirmation box");
    hideModal('sota-complete');
    sota.startCheckUpdates();
  });

  $("button#sota-install").click(function(ev){
    sota.startUpdate();
    return false;
  });


}

function hideModal(modalId){
  if ($("#"+modalId).hasClass("open")) {
      $("#"+modalId).removeClass("open").addClass("hidden");
    }
}

function showModal(modalId){
  if ($("#"+modalId).hasClass("hidden")) {
      $("#"+modalId).removeClass("hidden").addClass("open");
    }
}


sotaUpdateElements.importFail = function(error){
  console.log("Error importing SOTA html");
  console.log(error);
}


function connectToSotaSocket(){

  conn = new WebSocket("ws://localhost:9000");
  conn.onopen = function(){
    console.log("Successfully connected to SOTA Web Socket");

    if(currentApp.appInfo.id == "JLRPOCX001.HomeScreen"){
      sota = new sotaUpdater(conn);
      sota.startCheckUpdates();  
    }
  }

  conn.onclose = function(closeEvent){
    console.log("SOTA Socket closed.");

    if(sota && sota.checkInterval != undefined){
      clearInterval(sota.checkInterval);
    }

    if(closeEvent.code == "1006"){
      //unintentional closing, set a timeout and try to connect again.
      if(connectRetries != 0){
        
        console.log("Connection Failed, Will attempt reconnection");
        setTimeout(connectToSotaSocket,5000);
        if(connectRetries > 0){
          connectRetries--;
        }

      }else{
        console.log("SOTA Socket not available. Abandoning connection attempts.");
      }
    }else{
      console.log("Unexpected websocket closure - see information below:");
      console.log(closeEvent);
    }
  }

  conn.onerror = function(errorEvent){
    //console.log("Error",errorEvent);
    console.log()
  }

  return conn;
}


$(document).ready(function() {
  connectRetries = -1; // -1 == infinitely retry.
  if(currentApp.appInfo.id == "JLRPOCX001.HomeScreen"){
    includeHTML("DNA_common/components/sota/sota.html",sotaUpdateElements.importSuccess,sotaUpdateElements.importFail);
  }

  sota = connectToSotaSocket();

});

function sotaUpdater(webSocket){
  
  var self = this
  this.conn = webSocket;
  this.idCounter = 0;
  this.idMap = {};
  this.checkInterval;

  self.conn.onmessage = function(message){
    var result = JSON.parse(message.data);
    self.receive(result);
  }

  this.receive = function(data){
    switch(self.idMap[data.id]){
      case 'checkUpdates':
        self.handleAvailableUpdate(data.result);
      break;

      case 'StartUpdate':
        self.handleStartUpdate(data.result);
      break;

      case 'GetCarSyncState':
        self.handleProgress(data.result);
      break;

      default:
        console.log("No method for handling RVI SOTA response");
        console.log(data);
      break;
    }
  }

  this.checkUpdates = function(){
    //console.log("Checking for updates");

    var mid = self.idCounter+1;
    self.idMap[mid] = "checkUpdates";

    //JSON-RPC request
    var request = {"method":"GetPendingUpdates","params":[],"id":mid};
    self.conn.send(JSON.stringify(request));
  }

  //When a response comes back from the web socket.
  this.handleAvailableUpdate = function(result){
    //console.log("update response");
    if(result.length > 0){
      
      //Avoid checking for updates while we're updating.
      clearTimeout(self.checkInterval);

      //Clear old listing
      $("#updates .box-content ul").empty();
      showModal('updates');
      
      //Populate Box
      for(i in result){
        var newItem = $(document.createElement("li")).html(result[i].uuid);
        $("#updates .box-content ul").append(newItem);
      }

    }else{
      //console.log("no updates");
    }
  }

  //Start a pending update
  this.startUpdate = function(){
    var mid = self.idCounter+1;
    self.idMap[mid] = "StartUpdate";

    var request = {"method":"StartUpdate","params":[],"id":mid};
    self.conn.send(JSON.stringify(request));
  }

  //Handle Start pending update response
  this.handleStartUpdate = function(result){
    hideModal('updates');
    showModal('progress-bar');

    //initiate get progess calls
    self.getProgress();
  }

  //Get progress for ongoing update.
  this.getProgress = function(){
    var mid = self.idCounter+1;
    self.idMap[mid] = "GetCarSyncState";

    var request = {"method":"GetCarSyncState","params":[],"id":mid};
    self.conn.send(JSON.stringify(request));
  }

  //Handle progress messages
  this.handleProgress = function(result){
    //console.log(result);
    if(result.state != "Idle"){
      $("progress").val(result.progress);

      setTimeout(self.getProgress,300);
    }else{
      hideModal("progress-bar");
      showModal("sota-complete");
    }
  }

  this.startCheckUpdates = function(){
    self.checkInterval = setInterval(function(){self.checkUpdates()},2000);
  }

}
