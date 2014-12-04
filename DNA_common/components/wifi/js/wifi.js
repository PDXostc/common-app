console.log("start of wifi.js");
var Wifi={};
Wifi.TemplateHTML = "DNA_common/components/wifi/wifi.html";

Wifi.includeHTMLSucess = function(linkobj) {
   console.log("loaded wifi.html");
   Wifi.import = linkobj.path[0].import;
   Wifi.wifiPageHTML = Wifi.import.getElementById('WifiPage');
   Wifi.WifiDeviceHTML = Wifi.import.getElementById('WifiDeviceTemplate');
   $("#settingsPage").append(Wifi.import.getElementById('WifiPage'));
   Wifi.pageUpdate();
};
		
Wifi.pageUpdate = function() {
	console.log("wifi pageUpdate()");

	if (!$('#settingsPage').length) {
		setTimeout(Wifi.pageUpdate,1000);
	}
	else {
		$("#settingsPage").append(Wifi.import.getElementById('WifiPage'));
		Settings.addUpdateSettingsPage('wifi','settings',function(){ console.log('wifi page click();');$('#WifiPage').toggle();});
	}
};


Wifi.includeHTMLFailed = function(linkobj) {
	console.log("load wifi.html failed");
	console.log(linkobj);
};


includeHTML(Wifi.TemplateHTML, Wifi.includeHTMLSucess, Wifi.includeHTMLFailed);

console.log("end of wifi.js");
