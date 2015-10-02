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

/**
 * @module Services
 */

console.log("start of rvi settings template");
var rviSettingsPage = {};
rviSettingsPage.TemplateHTML = "DNA_common/components/rvi/rvi.html";

rviSettingsPage.ShowPage = function () {
    console.log('rvi page show_click();');
    $('#settingsPageList').addClass('hidden');
    $('#rviPage').removeClass('hidden');

    // display or hide the contents of the tabbed sections when tapped,
    // and let the tab display a selected state.
    $("#setup-tab").click(function () {
        console.log("clicked the Setup Tab");
        if ($("#setup-content").hasClass("hidden")) {
            $("#setup-content").removeClass("hidden");
            $("#setup-tab").addClass("tab-selected");
            $("#apps-content").addClass("hidden");
            $("#apps-tab").removeClass("tab-selected");
        }
    });

    $("#apps-tab").click(function () {
        console.log("clicked the Apps Tab");
        if ($("#apps-content").hasClass("hidden")) {
            $("#setup-content").addClass("hidden");
            $("#setup-tab").removeClass("tab-selected");
            $("#apps-content").removeClass("hidden");
            $("#apps-tab").addClass("tab-selected");
        }
    });

};

rviSettingsPage.HidePage = function () {
    console.log('rvi page hide_click();');
    $('#settingsPageList').removeClass('hidden');
    $('#rviPage').addClass('hidden');
};

rviSettingsPage.pageUpdate = function () {
    console.log("rvi pageUpdate()");

    if (!$('#settingsPageList').length) {
        setTimeout(rviSettingsPage.pageUpdate, 1000);
    }
    else {
        $("#settingsPage").append(rviSettingsPage.import.getElementById('rviPage'));
        var close_button = document.getElementById('rviBackArrow').onclick = rviSettingsPage.HidePage;
        Settings.addUpdateSettingsPage('rvi', 'settings', rviSettingsPage.ShowPage);

        rvi = new rviSettings();
        rviSettingsPage.initialize();
        rvi.loaded.done(function () {
            console.log("rviSettings object loaded");
            rviSettingsPage.displayValues();
            rvi.wsConnect();
        });
    }
};

rviSettingsPage.includeHTMLSucess = function (linkobj) {
    console.log("loaded rvi.html");
    rviSettingsPage.import = linkobj.path[0].import;
    rviSettingsPage.rviPageHTML = rviSettingsPage.import.getElementById('rviPage');
    rviSettingsPage.rviDeviceHTML = rviSettingsPage.import.getElementById('rviDeviceTemplate');
    //$("#settingsPage").append(rviSettingsPage.import.getElementById('rviPage'));
    //$("body").append(rviSettingsPage.import.getElementById('rviPage'));
    onDepenancy("Settings.settingsPage", rviSettingsPage.pageUpdate, "Rvi");
    //rviSettingsPage.pageUpdate();
};

rviSettingsPage.includeHTMLFailed = function (linkobj) {
    console.log("load rvi.html failed");
    console.log(linkobj);
};

rviSettingsPage.initialize = function () {

    $(".setup").click(function (ev) {
        $("#resultMessage").hide();
        $("#setupForm").show();

        $("#messageOverlay").css("display", "block");
        $("#inputBox").css("display", "inline-block");
    });

    $("#cancel").click(function (ev) {
        $("#messageOverlay").css("display", "none");
        $("#inputBox").css("display", "none");
    });

    $("#saveRviSettings").click(function (ev) {
        console.log("save rvi settings button");
        rviSettingsPage.saveSettings();
    });

    $("#resultMessage").click(function (ev) {
        $("#messageOverlay").css("display", "none");
        $("#inputBox").css("display", "none");
    });

};


includeHTML(rviSettingsPage.TemplateHTML, rviSettingsPage.includeHTMLSucess, rviSettingsPage.includeHTMLFailed);

rviSettingsPage.displayValues = function () {
    console.log("calling display values");
    document.querySelector("#vinNumber").value = rvi.settings.vin;
};

rviSettingsPage.saveSettings = function () {
    var vin = document.querySelector("#vinNumber").value;
    //document.querySelector("")

    formattedSettings = {"vin": vin};

    rvi.setRviSettings(formattedSettings);
    rvi.setVin(vin);
    //rviSettingsPage.displayValues();
};

var rviSettings = function () {

    self = this;
    this.loaded = new $.Deferred();
    this.comm = new RVI();

    //Load setting when they're available.

    this.getRviSettings = function () {

        Configuration.reload(function () {

            var saved = Configuration.get("Settings.rvi");
            if (saved != undefined) {
                self.settings = saved;
            } else {
                self.settings = {};
            }


            //Make sure this is defined if it hasn't been previously.
            if (self.settings.services == undefined) self.settings.services = [];

            //resolve the promise for initial setup.

            self.getVin().done(function () {
                if (self.loaded.state() != "resolved") {
                    self.loaded.resolve();
                }
            });
        });

    }

    this.setRviSettings = function (settings) {
        console.log("Saving entered values");

        if (settings == undefined) {
            console.log("Not settings provided");
            return false;
        }

        Configuration.set("Settings.rvi", settings);
        Configuration.save();

        this.getRviSettings();
    };

    this.getVin = function () {
        var vinRetrieved = new $.Deferred();
        var vin = "";
        tizen.filesystem.resolve("documents/vin", function (file) {
            file.openStream("r", function (fs) {
                self.settings.vin = fs.read(file.fileSize);
                vinRetrieved.resolve();
            });
        },function(errorResponse) {
            vinRetrieved.reject(errorResponse.message);
        });
        return vinRetrieved;
    };

    this.setVin = function (vin) {

        var vinWrite = new $.Deferred();
        tizen.filesystem.resolve("documents/vin", function (file) {

            file.openStream("w", function (fs) {
                console.log(fs.write(vin.trim() + "\n"));

            }, function (writeError){
                console.log("Error Writing to file");
                console.log(writeError.message);
            });
        },function (error){
            console.log("=== Error message for file resolve on setVin ===");
            console.log(error.message);
        });
    };


    this.rviError = function (message) {
        console.log(message);
    };

    this.rviConnect = function (message) {
        console.log("RVI Connected: " + message);
        depenancyMet("rvi.loaded");
    };

    this.wsConnect = function () {
        console.log("Connecting the websocket to rvi core");
        self.comm.on_connect = self.rviConnect;
        self.comm.on_error = self.rviError;

        self.comm.connect("ws://127.0.0.1:8818/websession");//, self.rviConnect, self.rviError);
    };

    this.rviRegisterServices = function (serviceList) {
        console.log("Registering RVI services");
        for (service in serviceList) {
            // If this is not in settings and we want it to be
            if (self.settings.services.indexOf(serviceList[service]) == -1) {
                self.comm.register_service(serviceList[service].name, serviceList[service].callback);
                console.log("Registering " + serviceList[service].name);
            }
        }

        Configuration.save("Settings.rvi", self.settings);
    };

    this.getRviSettings();
};

function RVI() {

    console.log("Starting up service RVI");
    RVI.instance = this;

    this.is_connected = false;
    this.trans_id = 1;
    this.service_map = {};

    this.OK = 0;
    this.NOT_CONNECTED = 1;

    this.next_trans_id = function () {
        this.trans_id = this.trans_id + 1;
        return this.trans_id;
    };

    // Connect to an RVI node using
    // websockets
    this.connect = function (url) {
        if (this.is_connected)
            return;

        this.url = url;
        this.ws  = new WebSocket(url);

        this.ws.binaryType = "arraybuffer";
        this.ws.parent     = this;

        this.ws.onopen     = this.ws_on_open;
        this.ws.close      = this.ws_on_close;

        this.ws.onmessage  = this.ws_on_message;

        this.ws.onerror    = this.ws_on_error;
    };


    // Register a service.
    this.register_service = function (service, service_fun) {
        // Add a leading slash if necessary
        console.log("Registering service: " + service);
        if (service[0] != '/')
            service = '/' + service;

        // First, just save the callback method
        this.service_map[service] = {
            cb_fun: service_fun,
            full_name: undefined
        };

        // If we are not connected, just return.
        // Once the connection goes through, we will register all services
        if (!this.is_connected) {
            console.log("RVI: Deferring service registration: " + service);

            return this.OK
        }

        console.log("RVI: Registering RVI service: " + service);

        ////
        //// Redirect ws.onmessage to handle service registration replies
        ////
        //this.ws.onmessage = function (evt) {
        //    console.log("RVI: Register service result: " + JSON.parse(evt.data).service);
        //
        //    //// If this is a new service, set it up
        //    //if (typeof this.parent.service_map[service] === "undefined") {
        //    //    this.parent.service_map[service] = {
        //    //        cb_fun: service_fun,
        //    //        full_name: JSON.parse(evt.data).service
        //    //    };
        //    //
        //    //    console.log("Service: " + JSON.stringify(this.parent.service_map));
        //    //
        //    //} else // Update full name of existing service.
        //        this.parent.service_map[service].full_name = JSON.parse(evt.data).service;
        //

        //    // Reset the onmessage handler
        //    this.onmessage = function (evt) {
        //        this.parent.on_message(evt);
        //    }
        //};

        var transactionId = this.next_trans_id();

        this.service_map[service].trans_id = transactionId;

        this.ws.send(JSON.stringify({
            'json-rpc': "2.0",
            'id': transactionId,//this.next_trans_id(),
            method: "register_service",
            params: {
                service_name: service
            }
        }));

        return this.OK;
    };

    // Unregister a service
    this.unregister_service = function (service) {
        if (service[0] != '/')
            service = '/' + service;

        if (!this.is_connected)
            return this.NOT_CONNECTED;

        console.log("RVI: unregistering: " + service);

        delete this.service_map[service];

        this.ws.send(JSON.stringify({
            'json-rpc': "2.0",
            'id': this.next_trans_id(),
            method: "unregister_service",
            params: {
                service_name: service
            }
        }));

        return this.OK;
    };

    this.disconnect = function () {
        if (!this.is_connected)
            return this.NOT_CONNECTED;

        this.ws.close(); // Server will unregister all services on its end
        return this.OK;
    };

    this.send_message = function (service, timeout, payload) {
        console.log("RVI: message:  " + service);
        console.log("RVI: timeout:  " + timeout);
        console.log("RVI: params:   " + JSON.stringify(payload));

        // Redirect ws.onmessage to handle replies.

        if (!this.is_connected)
            return this.NOT_CONNECTED;

        //this.ws.onmessage = function (evt) {
        //    console.log("RVI: message result: " + JSON.parse(evt.data).status);
        //    console.log("RVI: message TID: " + JSON.parse(evt.data).transaction_id);
        //
        //    // Invoke provided callback
        //    if (!!callback)
        //        callback(JSON.parse(evt.data).result, JSON.parse(evt.data).transaction_id);
        //
        //    // Reset the onmessage handler
        //    this.onmessage = function (evt) {
        //        this.parent.on_message(evt);
        //    }
        //};

        this.ws.send(JSON.stringify({
            'json-rpc': "2.0",
            'id': this.next_trans_id(),
            method: "message",
            params: {
                service_name: service,
                timeout: timeout,
                parameters: payload
            }
        }));
    };

    // Retrieve the full service name for a service
    this.get_full_service_name = function (local_service_name) {
        return this.service_name[local_service_name].full_name;
    };

    this.ws_on_open = function (evt) {
        console.log("RVI connected to: " + this.url);

        this.parent.is_connected = true;

        // Register all services that have been
        // setup with register_service()
        for (svc in this.parent.service_map) {
            console.log("Will reg: " + JSON.stringify(svc));
            this.parent.register_service(svc, this.parent.service_map[svc].cb_fun)
        }

        // Invoke connect cb, if defined
        if (typeof this.parent.on_connect != "undefined")
            this.parent.on_connect(this.parent);
    };

    this.ws_on_close = function (evt) {
        console.log("RVI disconnected.");
        this.connected = false;

        this.parent.is_connected = false;
    };

    function methodIsRegisterServiceHack() {

    }

    this.ws_on_message = function (evt) {
        console.log("RVI: on_message: " + evt.data);

        var data = JSON.parse(evt.data);

        if (data.method === "register_service") {
            var serviceShortName;
            var serviceLongName;

            for (serviceShortName in this.parent.service_map) {
                var serviceMapObject = this.parent.service_map[serviceShortName];

                if (serviceMapObject.trans_id == JSON.parse(evt.data).id) {
                    serviceLongName  = JSON.parse(evt.data).service;
                    break;
                }
            }

            console.log("RVI: Register service result: " + serviceShortName);
            this.parent.service_map[serviceShortName].full_name = serviceLongName;

        } else if (data.method === "unregister_service") {
            var service = JSON.parse(evt.data).service;
            console.log("RVI: Unregister service result:  " + service);

        } else if (data.method === "message") {
            var svc = data.params.service_name;
            var parameters = data.params.parameters;
            var sending_node = data.params.parameters.sending_node;

            console.log("RVI: on_message result: " + JSON.parse(evt.data).status);
            console.log("RVI: on_message message TID: " + JSON.parse(evt.data).transaction_id);

            console.log("RVI: on_message data: " + JSON.stringify(data));
            console.log("RVI: on_message service: " + svc);
            console.log("RVI: on_message parameters: " + parameters);

            if (!!this.parent.service_map[svc]) {
                // Original tizen code had
                // window[this.service_map[svc].cb_fun](parameters);
                this.parent.service_map[svc].cb_fun(parameters);

            } else {
                console.warn("Service: " + svc + " not mapped to any callback. Ignore");
                console.log("Service: " + JSON.stringify(this.parent.service_map));
            }

            console.log("RVI Message completed");

        } else if (data.method === "services_available") {
            console.log("RVI service_available");
            this.parent.on_service_available(data.params.services);

        } else if (data.method === "services_unavailable") {
            console.log("RVI service_unavailable");
            this.parent.on_service_unavailable(data.params.services);

        }
    };

    this.ws_on_error = function (evt) {
        console.log("There was an error on the websocket: " + evt);

        if (typeof this.parent.on_error != undefined)
            this.parent.on_error(evt);

    };

    this.on_service_available = function () {
    };

    this.on_service_unavailable = function () {
    };
}

// display or hide the contents of the tabbed sections when tapped,
// and let the tab display a selected state.

/*$(document).ready(function(){
 $("#setup-tab").click(function() {
 console.log("clicked the Setup Tab");
 if ($("#setup-content").hasClass("hidden")) {
 $("#setup-content").removeClass("hidden");
 $("#setup-tab").addClass("tab-selected");
 $("#apps-content").addClass("hidden");
 $("#apps-tab").removeClass("tab-selected");
 }
 });

 $("#apps-tab").click(function() {
 console.log("clicked the Apps Tab");
 if ($("#apps-content").hasClass("hidden")) {
 $("#setup-content").addClass("hidden");
 $("#setup-tab").removeClass("tab-selected");
 $("#apps-content").removeClass("hidden");
 $("#apps-tab").addClass("tab-selected");
 }
 });
 });*/

console.log("end of rvi settings template");
