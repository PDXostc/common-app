console.log("start of bluetooth.js");
var BluetoothSettingsPage={};
var Bluetooth = {}; //new BluetoothSettings();


BluetoothSettingsPage.TemplateHTML = "DNA_common/components/bluetooth/bluetooth.html";

BluetoothSettingsPage.ShowPage = function() { 
		console.log('bluetooth page show_click();');
		$('#settingsPageList').addClass('hidden');
		$('#bluetoothPage').removeClass('hidden');
	};

BluetoothSettingsPage.HidePage = function() { 
		console.log('bluetooth page hide_click();');
		$('#settingsPageList').removeClass('hidden');
		$('#bluetoothPage').addClass('hidden');
	};

BluetoothSettingsPage.pageUpdate = function() {
	console.log("bluetooth pageUpdate()");

	if (!$('#settingsPage').length) {
		setTimeout(BluetoothSettingsPage.pageUpdate,1000);
	}
	else {
		$("#settingsPage").append(BluetoothSettingsPage.import.getElementById('bluetoothPage'));
		Settings.addUpdateSettingsPage('bluetooth','settings',BluetoothSettingsPage.ShowPage);

		var close_button = document.getElementById('bluetoothBackArrow').onclick = BluetoothSettingsPage.HidePage;
		BluetoothSettingsPage.initialize();
	}
};

BluetoothSettingsPage.includeHTMLSucess = function(linkobj) {
   console.log("loaded bluetooth.html");
   BluetoothSettingsPage.import = linkobj.path[0].import;
   BluetoothSettingsPage.bluetoothPageHTML = BluetoothSettingsPage.import.getElementById('bluetoothPage');
   BluetoothSettingsPage.bluetoothDeviceHTML = BluetoothSettingsPage.import.getElementById('bluetoothDeviceTemplate');
   
   BluetoothSettingsPage.pageUpdate();
};

BluetoothSettingsPage.includeHTMLFailed = function(linkobj) {
	console.log("load bluetooth.html failed");
	console.log(linkobj);
};


includeHTML(BluetoothSettingsPage.TemplateHTML, BluetoothSettingsPage.includeHTMLSucess, BluetoothSettingsPage.includeHTMLFailed);


BluetoothSettingsPage.initialize = function(){
	Bluetooth = new BluetoothSettings();

	// Make the switch turn bluetooth on and off
	document.querySelector("#bluetoothPowerButton .switch").addEventListener("touchend",function(){
		console.log("touchend called on BT power.");
		Bluetooth.togglePowered();
	});

	document.querySelector("#bluetoothRefreshButton").addEventListener("touchend",function(){
		console.log("Touchend called on Refresh.");
		Bluetooth.findDevices();
	});


	//Update the powered switch on open.
	this.updatePoweredSwitch();

}


// Updates the visual display on the Bluetooth settings page.
BluetoothSettingsPage.updatePoweredSwitch = function(){
		var p = Bluetooth.adapter.powered;
		console.log("Updating Powered");

		if(p == true){
			$("#bluetoothPowerButton .switch").addClass("on").removeClass("off");
		}else{
			$("#bluetoothPowerButton .switch").addClass("off").removeClass("on");
		}
}



//Bluetooth settings interacts with the rest of the page. 
function BluetoothSettings(){
	
	this.adapter = tizen.bluetooth.getDefaultAdapter();
	this.devices = {}; //object to hold discovered devices.

	var self = this;
	//Toggles the powered state of the Bluetooth hardware.
	this.togglePowered = function(){
		var p = self.adapter.powered;
		
		if(p == true){
			self.adapter.setPowered(false,
				function(r){
					BluetoothSettingsPage.updatePoweredSwitch()
				},
				function(e){
					powerError(e);
				});
		}else{
			self.adapter.setPowered(true,
				function(r){
					BluetoothSettingsPage.updatePoweredSwitch();
				},
				function(e){
					powerError(e);
				});
		}

		function powerError(error){
			console.log("There was an error trying to change the state of Bluetooth Power: ");
			console.log(error);
		}
	}

	this.findDevices = function(){

		//search handler is passed into the adapter discoverDevices method as a success handler.
		var searchHandler = {
			onstarted: function(){
				console.log("Looking for devices");
			},
			ondevicefound: function(device){
				console.log(device);
				self.devices[device.address] = device;

				self.displayDevices();
			},
			ondevicedisappeared: function(address){
				console.log(address);
			},
			onfinished: function(devices){
				console.log("Finished looking for devices");
			}
		}

		self.adapter.discoverDevices(searchHandler,function(e) {
			console.log ("Failed to search devices: " + e.message + "(" + e.name + ")");
  		});
	}


	this.displayDevices = function(){
		
		for(device in self.devices){
			var d = BluetoothSettingsPage.bluetoothDeviceHTML.cloneNode();
			d.querySelector(".wifiElementTitle").innerHTML = device.name;
			d.querySelector(".wifiElementSubTitle").innerHTML = device.address;

			document.querySelector("#BluetoothNetworksList").appendChild(d);
		}
	}

	console.log("Instantiated BluetoothSettings");
	return this;
}


console.log("end of bluetooth.js");
