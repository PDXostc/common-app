
Copyright (c) 2014, Intel Corporation, Jaguar Land Rover

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Name: NFC(Near Field Communcation)
Version: XW_TizenIVI3_0_01FEB_AGL_05MAR2015
Maintainer: Jeffery Eastwood <jeastwo1@jaguarlandrover.com>
Mailing list: dev@lists.tizen.org

Build Instructions: 

	make apps - To build the wgt files for all release apps

Set the TIZEN_IP enviroment varable to the ip of target. or set TizenVTC host name to that ip.

	make deploy - To build and copy the wgt files to the platform

	make install.feb1 - To build and install wigits on the platform

	make run.feb1 - To build, install and run on the platform

KnownIssues: 
	Bug	TC-1243	Buxton must be used in package platform/core/connectivity/nfc-manager-neard
	Bug	TC-1178	Remove Flora license from package platform/core/connectivity/nfc-manager-neard
	Bug	TC-263	Neard bluetooth pairing does not work by default
	Bug	TC-48	[3.0] Kernel backtrace when tethering connection created
	Bug	TC-214	capi-system-sensor (and other capi packages) doesn't report its version number
	Bug	TC-199	Support emulator image builds for Tizen IVI
	Bug	TC-1248	Native keyboard doesn’t exit after entering text
