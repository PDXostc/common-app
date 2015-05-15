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

sotaUpdateElements={};
sotaUpdateElements.TemplateHTML = "components/sota/sota.html";

sotaUpdateElements.importSuccess = function(html){

  console.log("Appending SOTA components");
  var importSet = html.path[0].import;

  var update = importSet.getElementById('updates');
  var progress = importSet.getElementById('progress-bar');
  var complete = importSet.getElementById('sota-complete');

  $("#center-panel").append(update);
  $("#center-panel").append(progress);
  $("#center-panel").append(complete);

  $("#updates #close-sota").click(function() {
    console.log("closed the sota updates box");
    if ($("#updates").hasClass("open")) {
      $("#updates").removeClass("open").addClass("hidden");
    }
  });

  $("#progress-bar #close-sota").click(function() {
    console.log("closed the sota progress-bar");
    if ($("#progress-bar").hasClass("open")) {
      $("#progress-bar").removeClass("open").addClass("hidden");
    }
  });

  $("#sota-complete #close-sota").click(function() {
    console.log("closed the sota confirmation box");
    if ($("#sota-complete").hasClass("open")) {
      $("#sota-complete").removeClass("open").addClass("hidden");
    }
  });
}

sotaUpdateElements.importFail = function(error){
  console.log("Error importing SOTA html");
  console.log(error);
}


$(document).ready(function() {

  sota = new sotaUpdater();
  includeHTML("DNA_common/components/sota/sota.html",sotaUpdateElements.importSuccess,sotaUpdateElements.importFail);  
});



function sotaUpdater(){
  
  var self = this
  this.conn = new WebSocket("ws://localhost:9000");
  this.idCounter = 0;
  this.idMap = {};

  self.conn.onmessage = function(message){
    var result = JSON.parse(message.data);
    self.receive(result);
  }

  this.receive = function(data){
    console.log(data);
    //TODO: switch statement for handling reponse cases.
    switch(self.idMap[data.id]){
      case 'checkUpdates':
        self.handleUpdateResponse(data.result);
      break;
      default:
        console.log(data.result);

      break;
    }
  }

  this.checkUpdates = function(){
    //JSON-RPC request

    var mid = self.idCounter+1;
    self.idMap[mid] = "checkUpdates";

    var request = {"method":"GetPendingUpdates","params":[],"id":mid};
    self.conn.send(JSON.stringify(request));
  }

  //When a response comes back from the web socket.
  this.handleUpdateResponse = function(result){
    console.log("update response");
    if(result.length > 0){
      
      $("#updates .box-content ul").empty();
      $("#updates").removeClass("hidden");
      
      for(i in result){
        var newItem = $(document.createElement("li")).html(result[i].uuid);
        $("#updates .box-content ul").append(newItem);
      }
    }else{
      console.log("no updates");
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


  }

  //Get progress for ongoing update.
  this.getProgress = function(){
    var mid = self.idCounter+1;
    self.idMap[mid] = "GetCarSyncState";

    var request = {"method":"GetCarSyncState","params":[],"id":mid};
    self.conn.send(JSON.stringify(request));
  }

  this.handleProgress = function(result){
    console.log(result);
//    result.progress
//    result.state
      
      if(result.state != "Idle"){
        setTimeout(self.getProcess,1000);
      }
  }

}
