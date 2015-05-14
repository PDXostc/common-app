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

$(document).ready(function() {

  $("#close-sota").click(function() {
    console.log("closed the sota updates box");
    if ($("#updates").hasClass("open")) {
      $("#updates").removeClass("open").addClass("hidden");
    }
  });

  $("#close-sota").click(function() {
    console.log("closed the sota progress-bar");
    if ($("#progress-bar").hasClass("open")) {
      $("#progress-bar").removeClass("open").addClass("hidden");
    }
  });

  $("#close-sota").click(function() {
    console.log("closed the sota confirmation box");
    if ($("#sota-complete").hasClass("open")) {
      $("#sota-complete").removeClass("open").addClass("hidden");
    }
  });

  sota = new sotaUpdater();

});

var sotaUpdateElements={};
sotaUpdateElements.TemplateHTML = "components/sota/sota.html";
sotaUpdateElements.includeHTML = function(){
  
}


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
        console.log("update response");
        if(data.result.length > 0){
          for(i in data.result){
            
            $("")
            //console.log(data.result[i].uuid);
          }
        }else{
          console.log("no updates");
        }
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

}
