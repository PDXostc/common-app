/** 
 * SDL application integrates [Smart Device Link](http://projects.genivi.org/smartdevicelink/) sample HTML frontend
 * into Tizen IVI theme. Application requires smarphone with installed SDL application - for testing purposes following
 * applications for [Android](http://git.projects.genivi.org/?p=smartdevicelink.git;a=tree;f=SDL_Android/SmartDeviceLinkTester)
 * or [iOS](http://git.projects.genivi.org/?p=smartdevicelink.git;a=tree;f=SDL_iOS/SmartDeviceLinkTester) can be used.
 *
 * Application also relies on existing connection to smartphone via WiFi or Bluetooth. Such connection can be 
 * made using {{#crossLinkModule "Settings"}}{{/crossLinkModule}} module from each Tizen IVI application. When connection is
 * working and devices can see each other it's necessary to start SDL application on smartphone and 
 * [SDL Core](http://git.projects.genivi.org/?p=smartdevicelink.git;a=tree;f=SDL_Core) on head unit to initiate
 * SDL pairing. Intel Tizen IVI system image contains systemd service which starts SDL Core component during boot
 * sequence; status of service can be checked using command:
 *
 *     systemctl status sdl
 *
 * Please refer to document _Preparing system image from scratch_ for additional information about SDL infrastructure.
 * 
 * After service and smartphone app is running click on `Change devices` button to discover SDL applications. 
 *
 * Hover and click on elements in images below to navigate to components of SDL application.
 *
 * <img id="Image-Maps_1201312180420487" src="../assets/img/sdl.png" usemap="#Image-Maps_1201312180420487" border="0" width="649" height="1152" alt="" />
 *   <map id="_Image-Maps_1201312180420487" name="Image-Maps_1201312180420487">
 *     <area shape="rect" coords="0,0,573,78" href="../classes/TopBarIcons.html" alt="top bar icons" title="Top bar icons" /> 
 *     <area shape="rect" coords="0,994,644,1147" href="../classes/BottomPanel.html" alt="bottom panel" title="Bottom panel" />
 *     <area shape="rect" coords="573,1,644,76" href="../modules/Settings.html" alt="Settings" title="Settings" />
 *   </map>
 * @module SdlApplication
 * @main SdlApplication
 * @class Sdl
 */

/**
 * Reference to instance of bootstrap class this class help booting  theme , config and carIndicator
 * @property bootstrap {Bootstrap}
 * @private
 */
var bootstrap;

/** 
 * Method initializes user interface and create events listeners for status indicators. 
 * @method init
 */
var init = function () {
	bootstrap = new Bootstrap(function(status) {
		$("#topBar").topBarIconsPlugin("init", "smartdevicelink");
		$("#bottomBar").bottomPanel("init");
	});
};

$(document).ready(init);
