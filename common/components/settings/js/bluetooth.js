/*
 * Copyright (c) 2014, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/* global Configuration, Settings, hideLoadingSpinner, showLoadingSpinner, ko, $, loadTemplate */

/**
 * Bluetooth class provides list view of nearby and known Bluetooth devices, detailed information view about Bluetooth device, 
 * functionality to pair and unpair remote Bluetooth device, mark phone as selected for incoming calls, contacts and
 * call history, turn on and off Bluetooth adapter.
 *
 * This class requires following components:
 *
 * * {{#crossLink "Tabs"}}{{/crossLink}} component
 * * {{#crossLink "Configuration"}}{{/crossLink}} component
 * * {{#crossLink "Settings"}}{{/crossLink}} component
 * 
 * @class Bluetooth
 * @module Settings
 * @constructor
 */

// Make the timeout for scanning about 10 seconds.
const DeviceDisplayInterval = 20000;

var Bluetooth = function() {
	"use strict";
	var self = this;

	self.loadDefaultAdapter();
	self.registerDefaultAdapterChangeListener();

//	self.loadBluetoothConfig();
//	Configuration.addUpdateListener(function() {
//		self.loadBluetoothConfig();
//	});

	self.registerSelectedRemoteDeviceChangeListener();
	self.loadSelectedRemoteDevice();

	self._setRefreshDevicesInterval();

	Settings.domElement.on('eventClick_hidePage', function() {
		self.isVisible(false);
		var attempts = 0;
		function stopScanning() {
			console.log("attempts: ", attempts);
			if (attempts < 3) {
				attempts++;
				self.stopScan(function(err) {
					if (!!err) {
						setTimeout(function() {
							stopScanning();
						}, 1000);
					}
				}, false);
			}
		}
		stopScanning();
	});

	Settings.domElement.on('eventClick_showPage', function() {		
		if ($(".bluetoothContent").length || $(".deviceInfoContent").length) {
			self.isVisible(true);
			var diff = -1;

			// Remove any known devices first, to cath any devices that have been disconnected from BT.
			// Show scanning spinner since we will always be scanning upon entry to the BT window.
			self.removeForRefresh();
			
			if (!!self.lastSync()) {
				diff = new Date().getTime() - self.lastSync();
			}
			if (!self.scanning() && (diff === -1 || diff > DeviceDisplayInterval || !self.devices().length)) {
				self.clearDevices();
				self.showBluetoothLoadingSpinner("Scanning");
				self.scan(true);
			}
			if (self.scanning()) {
				self.showBluetoothLoadingSpinner();
			}
		}

	});

	/**
	 * Sets the state of a Bluetooth adapter to on or off by sending a request to Bluetooth hardware to change the power state. 
	 * After Bluetooth adapter is enabled it starts scanning for nearby and known Bluetooth devices.
	 * 
	 * @method togglePower
	 */
	this.togglePower = function() {
		console.log("Bluetooth: toggle power called.");
		//self.loadDefaultAdapter();
		if (!!self.adapter() && !self.togglePowerLocked()) {
			self.togglePowerLocked(true);
			if (self.adapter().powered) {
				showLoadingSpinner("Turning off");
				self.stopScan(function(err) {
					console.log('setPowered(false) called');
					self.adapter().setPowered(false, function() {
						console.log('Successfully disable bluetooth subsystem.');
						self.togglePowerLocked(false);
						//self.loadDefaultAdapter();
						hideLoadingSpinner("Turning off");
					}, function(err) {
						var error = "An error occured while turning bluetooth off.";
						console.log(error, err);
						alert(error);
						self.togglePowerLocked(false);
						//self.loadDefaultAdapter();
						hideLoadingSpinner("Turning off");
					});
				}, false);
			} else {
				showLoadingSpinner("Turning on");
				self.stopScan(function(err) {
					console.log('setPowered(true) called');
					self.adapter().setPowered(true, function() {
						console.log('Successfully enable bluetooth subsystem');
						self.togglePowerLocked(false);
						//self.loadDefaultAdapter();
						self.clearDevices();
						self.scanning(false);
						setTimeout(function() {
							hideLoadingSpinner("Turning on");
							self.scan(true);
						}, 1000);
					}, function(err) {
						var error = "An error occured while turning bluetooth on.";
						console.log(error, err);
						alert(error);
						self.togglePowerLocked(false);
						//self.loadDefaultAdapter();
						hideLoadingSpinner("Turning on");
					});
				});
			}
		}
	};

	/**
	 * Creates a bond with a remote device by initiating the bonding process with peer device using the given device's MAC address or destroys 
	 * the bond with a remote device (initiates the process of removing the specified address from the
	 * list of bonded devices).
	 * 
	 * Fixed a defect where pair/unpaired and selected/un-selected states would be displayed inconsistently, 
	 * and also unpairing from one device and pairing/selecting to another was unreliable, by calling toggleSelectionOfSelectedDevice
	 * before unpairing a selected device.
	 * 
	 * @method togglePair
	 * @param device {Object} Object representing remote Bluetooth device to be paired or unpaired according to current device state.
	 */	
	this.togglePair = function(device) {
		console.log("Bluetooth: toggle connection called.");
		console.log(device);
		if (!!device) {
			//self.loadDefaultAdapter();
			self._clearRefreshDevicesInterval();
			if (!device.isBonded) {
				console.log('bluetooth pair to device: ' + device.address);
				showLoadingSpinner("Pairing");
				self.adapter().createBonding(device.address, function() {
					console.log('bluetooth paired with ' + device.address);
					self._restartRefreshDevicesInterval();
					hideLoadingSpinner("Pairing");
				}, function(e) {
					console.log('Error: bluetooth pair failed: ', e);
					self._restartRefreshDevicesInterval();
					//alert("An error occured while pairing with " + device.name);
					hideLoadingSpinner("Pairing");
				});
			} else {
				console.log('Bluetooth disconnect from device: ' + device.address);
				
				// First, un-select if it was currently selected. This makes re-pairing and selecting later much more reliable.
				if (self.isDeviceSelected(device) )	
				{
					self.toggleSelectionOfSelectedDevice();  
				}
				
				showLoadingSpinner("Unpairing");
				self.adapter().destroyBonding(device.address, function() {
					console.log('bluetooth unpaired from ' + device.address);
					self._restartRefreshDevicesInterval();
					hideLoadingSpinner("Unpairing");
				}, function(e) {
					console.log('Error: bluetooth unpairing failed: ' + e);
					self._restartRefreshDevicesInterval();
					//alert("An error occured while unpairing from " + device.name);
					hideLoadingSpinner("Unpairing");
				});
			}
		}
	};

	/**
	 * Starts discovering nearby and known remote Bluetooth devices or stops an active discovery session.
	 * 
	 * @method toogleScanDevices
	 */
	this.toogleScanDevices = function() {
		console.log("Bluetooth: toggle scan devices called.");
		if (self.scanning()) {
			console.log("Bluetooth: stop scan called.");
			self.stopScan(function(err) {
				if (!!err) {
					alert("An error occured while stopping bluetooth discovery.");
				}
			}, true);
		} else {
			// Remove any known devices first, to detect any devices that have been disconnected from BT.
			console.log("Bluetooth: scan called.");		
			self.removeForRefresh();
			self.clearDevices();
			self.scan(true);
		}
	};

	/**
	 * Shows more information about given remote Bluetooth device (like name, address, device class, bond, trusted, connection state) in a new view. 
	 * That in addition allows to mark phone as selected for incoming calls and pair/unpair remote
	 * Bluetooth device.
	 * 
	 * @method openDeviceDetails
	 * @param device {Object} Object representing remote Bluetooth device to be showed in detailed information view.
	 */
	this.openDeviceDetails = function(device) {
		console.log("Bluetooth: open device details called: ", device);
		self.selectedDevice(null);
		if (!!device) {
			self.selectedDevice(device);
			var subpanelModel = {
				textTitle : "DEVICE INFO",
				textSubtitle : device.name.toUpperCase(),
				actionName : "BACK",
				action : function() {
					console.log("bluetooth openDeviceDetails");
					Settings.openSetting(Settings.selectedSetting);
				}
			};

			var createDeviceInfoElement = function(key, value, deviceInfoContent) {
				var deviceInfoElement = '<div class="wifiNetworkInfoElement fontSizeLarge fontWeightBold fontColorNormal">';
				deviceInfoElement += '<span>';
				deviceInfoElement += key;
				deviceInfoElement += ": ";
				deviceInfoElement += '</span>';
				deviceInfoElement += '<span data-bind="text:' + value + '">';
				deviceInfoElement += '</span>';
				deviceInfoElement += '</div>';
				return deviceInfoElement;
			};

			var loadDeviceInfoUI = function() {
				if (!$("#bluetoothDeviceInfoBox").length) {
					var button = "";
					button += '<div id="wifiAutoConnectButton" class="toggleButton subPanelToggleButton subPanelToggleButtonWide" data-bind="with: Settings.Bluetooth.selectedDevice, click: Settings.Bluetooth.toggleSelectionOfSelectedDevice, style: { display: Settings.Bluetooth.isSelectedDeviceSelectable() ? \'block\' : \'none\'}">';
					button += '<div class="bgColorThemeTransparent boxShadowInset toggleButtonBackground"></div>';
					button += '<div class="fontColorNormal fontSizeMedium fontWeightBold toggleButtonText" data-bind="text: \'SELECTED\', css: { fontColorSelected: Settings.Bluetooth.isDeviceSelected($data) }"></div>';
					button += '</div>';
					$(button).appendTo($('.tabsTopSubPanel'));

					var deviceInfo = '<div id="bluetoothDeviceInfoBox" data-bind="with: Settings.Bluetooth.selectedDevice">';
					deviceInfo += createDeviceInfoElement("Device name", "name");
					deviceInfo += createDeviceInfoElement("Device address", "address");
					deviceInfo += createDeviceInfoElement("Device class", "Settings.Bluetooth.getDeviceClassStr(deviceClass)");
					deviceInfo += createDeviceInfoElement("Paired", "isBonded ? 'Yes' : 'No'");
					deviceInfo += createDeviceInfoElement("Connected", "isConnected ? 'Yes' : 'No'");
					deviceInfo += createDeviceInfoElement("Trusted", "isTrusted ? 'Yes' : 'No'");
					deviceInfo += '<div id="networkConnectButton" class="toggleButton networkConnectButton" data-bind="click: Settings.Bluetooth.togglePair">';
					deviceInfo += '<div class="bgColorThemeTransparent boxShadowInset toggleButtonBackground"></div>';
					deviceInfo += '<div class="fontColorNormal fontSizeMedium fontWeightBold toggleButtonText" data-bind="text: isBonded ? \'UNPAIR\' : \'PAIR\'"></div>';
					deviceInfo += '</div>';
					deviceInfo += '</div>';
					$(deviceInfo).appendTo($('.' + deviceInfoContent));
					ko.applyBindings(window.Settings);
				}
			};

			var deviceInfoContent = "deviceInfoContent";
			Settings.domElement.tabs("clearContent");
			Settings.domElement.tabs("changeContentClass", deviceInfoContent);
			Settings.domElement.tabs("subpanelContentTemplateCompile", subpanelModel, loadDeviceInfoUI);
		}
	};

	/**
	 * Returns major Bluetooth device class in human readable form.
	 * 
	 * @method getDeviceClassStr
	 * @param deviceClass {Object} Object representing Bluetooth device class information.
	 * @return {String} Major Bluetooth device class.
	 */
	this.getDeviceClassStr = function(deviceClass) {
		var classStr = "";
		switch (deviceClass.major) {
		case tizen.bluetooth.deviceMajor.MISC:
			classStr = "MISC";
			break;
		case tizen.bluetooth.deviceMajor.COMPUTER:
			classStr = "COMPUTER";
			break;
		case tizen.bluetooth.deviceMajor.PHONE:
			classStr = "PHONE";
			break;
		case tizen.bluetooth.deviceMajor.NETWORK:
			classStr = "NETWORK";
			break;
		case tizen.bluetooth.deviceMajor.AUDIO_VIDEO:
			classStr = "AUDIO/VIDEO";
			break;
		case tizen.bluetooth.deviceMajor.PERIPHERAL:
			classStr = "PERIPHERAL";
			break;
		case tizen.bluetooth.deviceMajor.IMAGING:
			classStr = "IMAGING";
			break;
		case tizen.bluetooth.deviceMajor.WEARABLE:
			classStr = "WEARABLE";
			break;
		case tizen.bluetooth.deviceMajor.TOY:
			classStr = "TOY";
			break;
		case tizen.bluetooth.deviceMajor.HEALTH:
			classStr = "HEALTH";
			break;
		case tizen.bluetooth.deviceMajor.UNCATEGORIZED:
			classStr = "UNCATEGORIZED";
			break;
		default:
			classStr = "UNKNOWN";
			break;
		}
		return classStr;
	};

	/**
	 * Tests if supplied remote Bluetooth device is marked as selected for incoming calls.
	 * 
	 * @method isDeviceSelected
	 * @param device {Object} Object representing remote Bluetooth device to be checked for selection state.
	 * @return {Boolean} True if Bluetooth device is selected otherwise false.
	 */
	this.isDeviceSelected = function(device) {
		if (!!device && !!self.selectedPhone() && self.selectedPhone() === device.address) {
			return true;
		}
		return false;
	};

	/**
	 * Tests if remote Bluetooth device opened in detail view is selectable for incoming calls (only Bluetooth devices of class Phone can be selected).
	 * 
	 * @method isSelectedDeviceSelectable
	 * @return {Boolean} True if remote Bluetooth device is selectable otherwise false.
	 */
	this.isSelectedDeviceSelectable = function() {
		if (!!self.selectedDevice()) {
			if (self.isDeviceSelected(self.selectedDevice())) {
				return true;
			}
			if (!!self.selectedDevice().isBonded && !!self.selectedDevice().address && !!self.selectedDevice().deviceClass && self.selectedDevice().deviceClass.major === tizen.bluetooth.deviceMajor.PHONE) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Marks and unmarks remote Bluetooth device opened in detail view as selected for incoming calls.
	 * 
	 * @method toggleSelectionOfSelectedDevice
	 */
	this.toggleSelectionOfSelectedDevice = function() {
		console.log("bluetooth: toggle select device called", self.selectedDevice());
		if (self.isDeviceSelected(self.selectedDevice())) {
			self.unselectRemoteDevice();
		} else {
			if (!!self.selectedPhone()) {
				self.unselectRemoteDevice();
			}
			self.selectRemoteDevice(self.selectedDevice());
		}
	};
};

/**
 * Contains array of nearby and known remote Bluetooth devices.
 * 
 * @property devices
 * @public
 * @type ko.observableArray
 * @default []
 */
Bluetooth.prototype.devices = ko.observableArray([]);
/**
 * Provides access to control the device's Bluetooth adapter.
 * 
 * @property adapter
 * @public
 * @type ko.observable
 * @default null
 */
Bluetooth.prototype.adapter = ko.observable(null);
/**
 * Represents remote Bluetooth device showed in detail view.
 * 
 * @property selectedDevice
 * @public
 * @type ko.observable
 * @default null
 */
Bluetooth.prototype.selectedDevice = ko.observable(null);
/**
 * Indicates if there is active discovery session for nearby and known remote Bluetooth devices.
 * 
 * @property scanning
 * @public
 * @type ko.observable
 * @default false
 */
Bluetooth.prototype.scanning = ko.observable(false);
/**
 * Indicates if Bluetooth settings view is visible (in a viewport).
 * 
 * @property isVisible
 * @public
 * @type ko.observable
 * @default false
 */
Bluetooth.prototype.isVisible = ko.observable(false);
/**
 * Defines Bluetooth hardware address of phone marked as selected for incoming calls, contacts and call history.
 * 
 * @property selectedPhone
 * @public
 * @type ko.observable
 * @default null
 */
Bluetooth.prototype.selectedPhone = ko.observable(null);
/**
 * Holds information about last synchronisation of nearby and known remote Bluetooth devices with local offline storage.
 * 
 * @property lastSync
 * @public
 * @type ko.observable
 * @default null
 */
Bluetooth.prototype.lastSync = ko.observable(null);
/**
 * Indicates if Bluetooth power button is clickable.
 * 
 * @property togglePowerLocked
 * @public
 * @type ko.observable
 * @default false
 */
Bluetooth.prototype.togglePowerLocked = ko.observable(false);

Bluetooth.prototype._refreshDevicesInterval = null;
Bluetooth.prototype._setRefreshDevicesInterval = function() {
	"use strict";
	var self = this;
	self._clearRefreshDevicesInterval();
	self._refreshDevicesInterval = setInterval(function() {
		if (!!self.adapter() && self.isVisible() && !self.scanning() && !document.webkitHidden) {
			self.refreshDevices();
			
		}
	}, 10000);
};
Bluetooth.prototype._clearRefreshDevicesInterval = function() {
	"use strict";
	var self = this;
	if (!!self._refreshDevicesInterval) {
		clearInterval(self._refreshDevicesInterval);
		self._refreshDevicesInterval = null;
	}
};

/**
 * Loads saved remote Bluetooth devices from local offline storage.
 * 
 * @method loadBluetoothConfig
 */
Bluetooth.prototype.loadBluetoothConfig = function() {
	"use strict";
	var self = this;
	self._clearRefreshDevicesInterval();
	var bluetooth = Configuration.get("bluetooth");

	//self.loadDefaultAdapter();
	if (!!bluetooth) {
		self.lastSync(bluetooth.lastSync);
		if (!!self.adapter() && self.adapter().powered && !!bluetooth.devices) {
			for (var i = 0 ; bluetooth.devices.length ; i++)
			{
				var newD = bluetooth.devices[i];
				self.adapter().getDevice(newD.address, function(dev) {
					self.addUpdateDevice(dev, false);
					self.sortDevices();
					self.saveBluetooth();
					if (self.selectedDevice().address === dev.address) {
						self.selectedDevice(dev);
					}
				}, function(error) {
					self.removeDevice(device.address);
					self.sortDevices();
					self.saveBluetooth();
				});
			}	

//			self.devices(bluetooth.devices);
			self.refreshDevices();
			self._setRefreshDevicesInterval();
		}
	}
};

/**
 * Updates or adds Bluetooth device for a given device's hardware address.
 * 
 * @method getDevice
 * @param device {Object} Object representing Bluetooth device information to be updated or added.
 */
Bluetooth.prototype.getDevice = function(device) {
	"use strict";
	var self = this;

	self.adapter().getDevice(device.address, function(dev) {
		self.addUpdateDevice(dev, false);
		self.sortDevices();
		self.saveBluetooth();
		if (!self.selectedDevice() || self.selectedDevice().address === dev.address) {
			self.selectedDevice(dev);
		}
	}, function(error) {
		self.removeDevice(device.address);
		self.sortDevices();
		self.saveBluetooth();
	});
};

/**
 * Loads the default local Bluetooth adapter.
 * 
 * @method loadDefaultAdapter
 */
Bluetooth.prototype.loadDefaultAdapter = function() {
	"use strict";
	var self = this;
	if (typeof (tizen.bluetooth) !== 'undefined' && typeof (tizen.bluetooth.getDefaultAdapter) !== 'undefined') {
		try {
			var adapter = tizen.bluetooth.getDefaultAdapter();
			if (adapter === null) {
				console.log('Error: Bluetooth adapter not found');
			} else {
				self.adapter(adapter);
			}
		} catch (err) {
			console.log(err);
		}
	} else {
		console.log("Bluetooth API is not available.");
	}
};

/**
 * Sets the listener to receivce notifications about changes of Bluetooth adapter.
 * 
 * @method registerDefaultAdapterChangeListener
 */
Bluetooth.prototype.registerDefaultAdapterChangeListener = function() {
	"use strict";
	var self = this;
	if (!!self.adapter() && typeof (self.adapter().setChangeListener) !== 'undefined') {
		try {
			self.adapter().setChangeListener({
				onstatechanged : function(powered) {
					console.log("Power state is changed into: " + powered);
					self.loadDefaultAdapter();
					if (!powered) {
						self.clearDevices();
						self.scanning(false);
						self.hideBluetoothLoadingSpinner();
						hideLoadingSpinner("Scanning");
						self.saveBluetooth();
					}
				},
				onnamechanged : function(name) {
					console.log("Name is changed to: " + name);
					//self.loadDefaultAdapter();
				},
				onvisibilitychanged : function(visible) {
					console.log("Visibility is changed into: " + visible);
					//self.loadDefaultAdapter();
				}
			});
		} catch (err) {
			console.log(err);
		}
	} else {
		console.log("adapter.setChangeListener API not available.");
	}
};

/**
 * Shows list view of nearby and known remote Bluetooth devices and allows to trigger rediscovering, open detail view, pair on unpair selected Bluetooth device, turn on or off Bluetooth adapter.
 * 
 * @method show
 */
Bluetooth.prototype.show = function(successCallback) {
	"use strict";
	var self = this;
	console.log("Bluetooth show called");
	self.isVisible(true);
	var subpanelModel = {
		textTitle : "SETTINGS",
		textSubtitle : "BLUETOOTH",
		actionName : "BACK",
		action : function() {
			self.isVisible(false);
			Settings.renderSettingsView();
		}
	};

	var loadBluetoothDevicesUI = function() {
		if (!$("#bluetoothDevicesList").length) {
			var bluetoothDevicesList = '<div id="bluetoothDevicesList" data-bind="template: { name: \'';
			bluetoothDevicesList += templateName;
			bluetoothDevicesList += '\', foreach: Settings.Bluetooth.devices }"></div>';
			$(bluetoothDevicesList).prependTo($('.' + bluetoothContent));

			var button = "";
			button += '<div class="buttonsArea">';
			button += '<div id="bluetoothRefreshButton" class="toggleButton bluetoothRefreshButton" data-bind="click: Settings.Bluetooth.toogleScanDevices, style: { display: Settings.Bluetooth.adapter().powered ? \'block\' : \'none\' }">';
			button += '<div class="bgColorThemeTransparent boxShadowInset toggleButtonBackground"></div>';
			button += '<div class="fontColorNormal fontSizeMedium fontWeightBold toggleButtonText" data-bind="text: Settings.Bluetooth.scanning() ? \'STOP\' : \'SCAN\'"></div>';
			button += '</div>';
			button += '</div>';
			$(button).appendTo($('.' + bluetoothContent));

			button = '<div id="wifiPowerButton" class="toggleButton subPanelToggleButton subPanelToggleButtonWide" data-bind="with: Settings.Bluetooth.adapter, click: Settings.Bluetooth.togglePower">';
			button += '<div class="bgColorThemeTransparent boxShadowInset toggleButtonBackground"></div>';
			button += '<div class="fontColorNormal fontSizeMedium fontWeightBold toggleButtonText" data-bind="text: powered ? \'TURN OFF\' : \'TURN ON\'"></div>';
			button += '</div>';
			$(button).appendTo($('.tabsTopSubPanel'));
			ko.applyBindings(window.Settings);

			var diff = -1;
			if (!!self.lastSync()) {
				diff = new Date().getTime() - self.lastSync();
			}
			// Remove any known devices first, to cath any devices that have been disconnected from BT.
			self.removeForRefresh();
			
			if (!self.scanning() && (diff === -1 || diff > DeviceDisplayInterval || !self.devices().length)) {	
				self.clearDevices();
				self.scan(true);
			}
			if (self.scanning()) {
				self.showBluetoothLoadingSpinner();
			}
		}
	};

	var bluetoothContent = "bluetoothContent";
	var templateName = "template-bluetooth";
	Settings.domElement.tabs("clearContent");
	Settings.domElement.tabs("changeContentClass", bluetoothContent);
	Settings.domElement.tabs("subpanelContentTemplateCompile", subpanelModel, function() {
		loadTemplate(Settings.SETTINGS_TEMPLATES_PATH, templateName, loadBluetoothDevicesUI);
	});
	if (!Settings.domElement.find(".bluetoothPINCode").length) {
		var pinCode = "<div class='bluetoothPINCode fontSizeXXSmall fontWeightBold fontColorTheme'>Default bluetooth pincode / passkey: 123456</div>";
		$(pinCode).appendTo(Settings.domElement);
	}
};

/**
 * Shows small loading spinner in header during active discovery session.
 * 
 * @method showBluetoothLoadingSpinner
 */
Bluetooth.prototype.showBluetoothLoadingSpinner = function() {
	"use strict";
	if ($(".bluetoothContent").length) {
		if (!$("#loadingSpinnerBluetooth").length) {
			var spinner = '';
			spinner += '<div id="loadingSpinnerBluetooth" class="loadingSpinnerBluetooth loading-container loading-container-small">';
			spinner += '<div class="loading loading-small"></div>';
			spinner += '</div>';
			$(spinner).appendTo($(".tabsTopSubPanel"));
		}
		$("#loadingSpinnerBluetooth").show();
	}
};

/**
 * Hides small loading spinner in header.
 * 
 * @method hideBluetoothLoadingSpinner
 */
Bluetooth.prototype.hideBluetoothLoadingSpinner = function() {
	"use strict";
	if ($("#loadingSpinnerBluetooth").length) {
		$("#loadingSpinnerBluetooth").hide();
	}
};

/**
 * Discovers nearby Bluetooth devices if any, that is, devices within proximity to the local device and gets all the known devices that have information stored in the local Bluetooth adapter.
 * 
 * Since this does nothing to detect phones that turn their Bluetooth off and remove them from the list, toogleScanDevices, loading of the Blutooth settings page, and 
 * acitvating the Scan button all now call removeFor Refresh, which forces discovery of disabled BT devices. 
 * 
 * The call to stopScan and the internal function passed to it comprises the bulk of the this scan function; the internal function interacts with the
 * native layer's BluetoothAdapter object (contained in the  wrt-plugins-tizen-bt) to halt  BT discovery, retrieve the list of previously discovered devices
 * (and note that this list will be incorrect when a BT device is turned off, the list still containing the actually unavailable device), and also calling discoverDevices,
 * to add new devices to the devices list (but again, not removing devices now unavailable.
 * 
 * Note that these BluetoothAdapter calls occur from JavaScript code that was called in turn from the native layer; yes, there is recursion from JavaScript into the native layer, 
 * and back into JavaScript, and again back into the native layer, and once again back into JavaScript.
 * *
 * @method scan
 * @param showSpinner? {Boolean} Indicates if full screen loading spinner should be visible during active discovery session.
 */

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}


Bluetooth.prototype.scan = function(showSpinner) {
	"use strict";
	var self = this;
	showSpinner = typeof (showSpinner) === 'undefined' ? true : showSpinner;
	if (self.scanning()) {
		self.showBluetoothLoadingSpinner();
		if (showSpinner) {
			showLoadingSpinner("Scanning");
		}
		return;
	}
	//self.loadDefaultAdapter();
	self.stopScan(function(err) {
		if (!!self.adapter() && self.adapter().powered) {
			console.log("Bluetooth: discoverDevices called");
			if (showSpinner) {
				showLoadingSpinner("Scanning");
			}
			self.showBluetoothLoadingSpinner();
			self.scanning(true);
			self.lastSync(new Date().getTime());
					
			self.adapter().getKnownDevices(function(devices) {
				if (devices.length) {
					for ( var i = 0; i < devices.length; ++i) {
							console.log("Known device name: " + devices[i].name + ", Address: " + devices[i].address);
							self.addUpdateDevice(devices[i]);
					}
					self.sortDevices();
					self.saveBluetooth();
					hideLoadingSpinner("Scanning");
				}
			}, function(error) {
				console.log("Could not get known devices: ", error);
			});
			
			var discoveryTimeout = null;
			var clearDiscoveryTimeout = function() {
				if (!!discoveryTimeout) {
					clearTimeout(discoveryTimeout);
					discoveryTimeout = null;
				}
			};
			var errorDiscoveryCallback = function(error) {
				console.log('An error occured while discovering bluetooth devices: ', error);
				self.stopScan(function() {
					clearDiscoveryTimeout();
					self.scanning(false);
					self.clearDevices();  // Takes care of case where device is gone but getKnownDevices insists it is still around.
					hideLoadingSpinner("Scanning");
					self.hideBluetoothLoadingSpinner();
				}, false);
			};

			// Workaround due to https://bugs.tizen.org/jira/browse/TIVI-2565
			discoveryTimeout = setTimeout(function() {
				errorDiscoveryCallback("Bluetooth adapter busy.");
			}, 30000);

			self.adapter().discoverDevices({
				onstarted : function() {
					console.log("Device discovery started.");
				},
				ondevicefound : function(device) {
//					var device = clone(newDevice);
					console.log("Found device - name: " + device.name + ", Address: " + device.address);
					clearDiscoveryTimeout();
					self.addUpdateDevice(device);
					self.sortDevices();
					self.saveBluetooth();
					hideLoadingSpinner("Scanning");
				},
				ondevicedisappeared : function(address) {
					console.log("Device disappeared: " + address);
					clearDiscoveryTimeout();
					self.removeDevice(address);
					self.sortDevices();
					self.saveBluetooth();
				},
				onfinished : function(devices) {
					console.log("Device discovery finished.");
					clearDiscoveryTimeout();
					for ( var i = 0; i < devices.length; ++i) {
						console.log("Name: " + devices[i].name + ", Address: " + devices[i].address);
						self.addUpdateDevice(devices[i]);
					}
					self.sortDevices();
					self.scanning(false);
					hideLoadingSpinner("Scanning");
					self.hideBluetoothLoadingSpinner();
				}
			}, function(err) {
				errorDiscoveryCallback(err);
			});
		}
	}, false);
};

/**
 * Stops an active device discovery session.
 * 
 * @method stopScan
 * @param callback {Function(error)} Callback function to be invoked when stopping ends.
 * @param showSpinner? {Boolean} Indicates if full screen spinner should be visible during stopping process.
 */
Bluetooth.prototype.stopScan = function(callback, showSpinner) {
	"use strict";
	var self = this;
	//self.loadDefaultAdapter();
	if (!!self.adapter() && self.adapter().powered) {
		showSpinner = typeof (showSpinner) === 'undefined' ? false : showSpinner;
		if (showSpinner) {
			showLoadingSpinner("Stopping");
		}
		self.adapter().stopDiscovery(function() {
			console.log("Stop discovery success.");
			self.scanning(false);
			hideLoadingSpinner("Stopping");
			self.hideBluetoothLoadingSpinner();
			if (!!callback) {
				callback();
			}				
		}, function(err) {
			console.log("An error occured while stopping bluetooth discovery.", err);
			hideLoadingSpinner("Stopping");
			if (!!callback) {
				callback(err);
			}
		});
	} else {
		if (!!callback) {
			callback();
		}
	}
};

/**
 * Adds or updates remote Bluetooth device in list of nearby and known remote Bluetooth devices.
 * 
 * @method addUpdateDevice
 * @param device {Object} Object representing Bluetooth device to be added or updated.
 * @param addDevice? {Boolean} Indicates if device should be added if it is not yet in the list of available and known Bluetooth devices.
 */
Bluetooth.prototype.addUpdateDevice = function(device, addDevice) {
	"use strict";
	var self = this;
	if (!!device && !!self.devices() && device.deviceClass.major==tizen.bluetooth.deviceMajor.PHONE) {
		var deviceExists = false;
		for ( var i = 0; i < self.devices().length; ++i) {
			var dev = self.devices()[i];
			if (dev.address === device.address) {
				self.devices()[i] = device;  // Even though we found it, copy it in since some fields may have changed on this device.
				deviceExists = true;
				break;
			}
		}
		addDevice = typeof (addDevice) === 'undefined' ? true : addDevice;
		if (!deviceExists && addDevice) {
			// device was not found above, so add it to devices.
			self.devices.push(device);
		}
	}
};

/**
 * Removes remote Bluetooth device from list of nearby and known remote Bluetooth devices.
 * 
 * @method removeDevice
 * @param deviceAddress {String} Bluetooth device hardware address to be removed.
 */
Bluetooth.prototype.removeDevice = function(deviceAddress) {
	"use strict";
	var self = this;
	if (!!deviceAddress && deviceAddress !== "" && !!self.devices() && self.devices().length) {
		self.devices.remove(function(device) {
			return device.address === deviceAddress;
		});
	}
};

// This function performs a remove on all devices, which allows rediscovery of those that are still available via Bluetooth.
Bluetooth.prototype.removeForRefresh = function() {
	"use strict";
	var self = this;
	
	// Seems like a kludge, but you do need to do the remove twice in order to reliably remove devices.
	for (var j=0; j < 2; ++j )
	{
		for ( var i = 0; i < self.devices().length; ++i) {
			
			var dev = self.devices()[i];
			
			if( dev.isBonded == false)
			{
/*
				self.adapter().removeDevice(dev.address, 
						function() {
							console.log("removeForRefresh: removeDevice succeeds ");
						},
						function(error) {
								console.log("removeForRefresh: removeDevice fails ", error);
						}
				);
*/
				self.removeDevice(dev.address);
			}
			else
			{
					console.log("Not removing device "+dev.address + " since it is bonded");
			}	
		}  // for self.devices().length
	}
};

/**
 * Clears list of nearby and known remote Bluetooth devices.
 * 
 * @method clearDevices
 */
Bluetooth.prototype.clearDevices = function() {
	"use strict";	
	this.devices.removeAll();	
	this.devices([]);
};

/**
 * Sorts nearby and known remote Bluetooth devices by attribute representing the bond state of remote device with the local device (paired firts).
 * 
 * @method sortDevices
 */
Bluetooth.prototype.sortDevices = function() {
	"use strict";
	var self = this;
	if (!!self.devices() && self.devices().length) {
		self.devices.sort(function(left, right) {
			return left.isBonded === right.isBonded ? 0 : left.isBonded ? -1 : 1;
		});
	}
};

/**
 * Saves Bluetooth adapter power state and nearby and known remote Bluetooth devices to local offline storage in order to keep same list of devices accross all the applications.
 * 
 * @method saveBluetooth
 */
Bluetooth.prototype.saveBluetooth = function() {
	"use strict";
    // do nothing. This is removed as it seems to serve no useful purpose. A possible implementation follows - the 
	// loadBluetoothConfig method should be changed to match
}

/*
	var devs = [];

	// clean bluetooth device objects from properties that do not need to be saved
	for ( var i = 0; i < this.devices().length; ++i) {
		var d = this.devices()[i];
		// the devices object cannot be turned to a string with JSON. Use a temp object
		var newD = { name: d.name, address: d.address, deviceClass: {major: d.deviceClass.major, minor: d.deviceClass.minor}};
		devs[i] = newD;
	}

	var newBluetoothConf = {
		devices : devs,
		lastSync : this.lastSync()
	};
	var savedBluetoothConf = Configuration.get("bluetooth");
	var savedBluetoothConfStr = JSON.stringify(savedBluetoothConf);
	var newBluetoothConfStr = JSON.stringify(newBluetoothConf);
	if (!savedBluetoothConf || newBluetoothConfStr !== savedBluetoothConfStr) {
		Configuration.set("bluetooth", newBluetoothConf, false);
	}
};
*/

/**
 * Loads Bluetooth device hardware address of phone marked as selected for incoming calls.
 * 
 * @method loadSelectedRemoteDevice
 */
Bluetooth.prototype.loadSelectedRemoteDevice = function() {
	"use strict";
	var self = this;
	if (typeof (tizen.phone) !== 'undefined' && typeof (tizen.phone.getSelectedRemoteDevice) !== 'undefined') {
		try {
			tizen.phone.getSelectedRemoteDevice(function(selectedRemoteDev) {
				console.log("selected remote device: ", selectedRemoteDev);
				if (!!selectedRemoteDev && selectedRemoteDev !== "") {
					self.selectedPhone(selectedRemoteDev);
				} else {
					self.selectedPhone(null);
				}
			});
		} catch (err) {
			console.log("An error occured while loading selected remote device ", err);
			self.selectedPhone(null);
		}
	}
};

/**
 * Marks a given remote Bluetooth device as selected for incoming calls.
 * 
 * @method selectRemoteDevice
 * @param device {Object} Object representing remote Bluetooth device to be selected.
 */
Bluetooth.prototype.selectRemoteDevice = function(device) {
	"use strict";
	var self = this;
	console.log("selectRemoteDevice called", device);
	if (!!device && !!device.address && !!device.deviceClass && device.deviceClass.major === tizen.bluetooth.deviceMajor.PHONE && typeof (tizen.phone) !== 'undefined' && typeof (tizen.phone.selectRemoteDevice) !== 'undefined') {
		showLoadingSpinner("Selecting");
		try {
			tizen.phone.selectRemoteDevice(device.address);
		} catch (err) {
			console.log("An error occured while selecting remote device ", err);
		}
	} else {
		console.log("tizen.phone.selectRemoteDevice API not available or supplied device is not valid.");
	}
};

/**
 * Unmarks previously selected remote Bluetooth device for incoming calls.
 * 
 * @method unselectRemoteDevice
 */
Bluetooth.prototype.unselectRemoteDevice = function() {
	"use strict";
	var self = this;
	console.log("unselectRemoteDevice called");
	if (typeof (tizen.phone) !== 'undefined' && typeof (tizen.phone.unselectRemoteDevice) !== 'undefined') {
		try {
			tizen.phone.unselectRemoteDevice();
		} catch (err) {
			console.log("An error occured while unselecting remote device ", err);
		}
	} else {
		console.log("tizen.phone.unselectRemoteDevice API not available.");
	}
};

/**
 * Sets the listener to receivce notifications when new remote Bluetooth device was marked as selected for incoming calls.
 * @method registerSelectedRemoteDeviceChangeListener
 */
Bluetooth.prototype.registerSelectedRemoteDeviceChangeListener = function() {
	"use strict";
	var self = this;

	if (typeof (tizen.phone) !== 'undefined' && typeof (tizen.phone.addRemoteDeviceSelectedListener) !== 'undefined') {
		try {
			tizen.phone.addRemoteDeviceSelectedListener(function(result) {
				console.log("addRemoteDeviceSelectedListener: ", result);
				if (!!result && !!result.error) {
					console.log("An error occured while selecting remote device: " + result.error);
					self.selectedPhone(null);
				} else if (!!result && !!result.value && result.value.toString().trim() !== "") {
					self.selectedPhone(result.value.toString().trim());
				} else {
					self.selectedPhone(null);
				}
				self._restartRefreshDevicesInterval();
				hideLoadingSpinner("Selecting");
			});
		} catch (err) {
			console.log("An error occured while registering remote device selected listener ", err);
		}
	} else {
		console.log("tizen.phone.addRemoteDeviceSelectedListener API not available.");
	}
};

/**
 * Reloads list of nearby and knwon remote Bluetooth devices and default local Bluetooth adapter.
 * 
 * @method refreshDevices
 */
Bluetooth.prototype.refreshDevices = function() {
	"use strict";
	var self = this;
	console.log("refreshDevices called");
	var devices = self.devices().slice(0);
	self.clearDevices();
	//self.loadDefaultAdapter();
	if (!!self.adapter() && self.adapter().powered) {
		self.devices(devices);
	}

	function updateDeviceInfo() {
		for ( var i = 0; i < self.devices().length; ++i) {
			var dev = self.devices()[i];
			if (!!self.selectedDevice() && self.selectedDevice().address === dev.address) {
				self.selectedDevice(dev);
			}
			if (dev.toString().indexOf("BluetoothDevice") === -1) {
				self.getDevice(dev);
			}
		}
		self.sortDevices();
		self.saveBluetooth();
	}
	if (self.devices().length) {
		self.adapter().getKnownDevices(function(devs) {
			if (devs.length) {
				for ( var i = 0; i < devs.length; ++i) {
					self.addUpdateDevice(devs[i], false);
				}
			}
			updateDeviceInfo();
		}, function(error) {
			console.log("Could not get known devices: ", error);
			updateDeviceInfo();
		});
	} else {
		updateDeviceInfo();
	}
};

Bluetooth.prototype._restartRefreshDevicesInterval = function() {
	"use strict";
	var self = this;
	self._clearRefreshDevicesInterval();
	self.refreshDevices();
	self._setRefreshDevicesInterval();
};
