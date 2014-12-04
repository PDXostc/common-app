console.log("start of wifi.js");
var WifiSettings={};
WifiSettings.TemplateHTML = "DNA_common/components/wifi/wifi.html";

WifiSettings.pageUpdate = function() {
	console.log("wifi pageUpdate()");

	if (!$('#settingsPage').length) {
		setTimeout(WifiSettings.pageUpdate,1000);
	}
	else {
		$("#settingsPage").append(WifiSettings.import.getElementById('WifiPage'));
		Settings.addUpdateSettingsPage('wifi','settings',function(){ console.log('wifi page click();');$('#WifiPage').toggle();});
	}
};

WifiSettings.includeHTMLSucess = function(linkobj) {
   console.log("loaded wifi.html");
   WifiSettings.import = linkobj.path[0].import;
   WifiSettings.wifiPageHTML = WifiSettings.import.getElementById('WifiPage');
   WifiSettings.WifiDeviceHTML = WifiSettings.import.getElementById('WifiDeviceTemplate');
   $("#settingsPage").append(WifiSettings.import.getElementById('WifiPage'));
   WifiSettings.pageUpdate();
};
		


WifiSettings.includeHTMLFailed = function(linkobj) {
	console.log("load wifi.html failed");
	console.log(linkobj);
};


includeHTML(WifiSettings.TemplateHTML, WifiSettings.includeHTMLSucess, WifiSettings.includeHTMLFailed);

console.log("end of wifi.js");
