// Libs
includeJs("js/lib/handlebars-1.0.0.beta.6.js");
includeJs("js/lib/ember-1.0.pre.min.js");
includeJs("js/lib/iscroll-lite.js");

includeJs("js/app/Flags.js");

//  Framework 
includeJs("js/ffw/Framework.js");
includeJs("js/ffw/WebSocket.js");
includeJs("js/ffw/RPCObserver.js");
includeJs("js/ffw/RPCClient.js");
includeJs("js/ffw/ButtonsRPC.js");
includeJs("js/ffw/NavigationRPC.js");
includeJs("js/ffw/UIRPC.js");
includeJs("js/ffw/TTSRPC.js");
includeJs("js/ffw/VRRPC.js");
includeJs("js/ffw/VehicleInfoRPC.js");
includeJs("js/ffw/BasicCommunicationRPC.js");

//  APP 
includeJs("js/app/SDLApp.js");
//  locales 
includeJs("js/locale/eng.js");
includeJs("js/locale/locale.js");
includeJs("js/app/view/WarningView.js");

//  UI controlls 
includeJs("js/app/controlls/Button.js");
includeJs("js/app/controlls/Label.js");
includeJs("js/app/controlls/ScrollBar.js");
includeJs("js/app/controlls/List.js");
includeJs("js/app/controlls/Indicator.js");
includeJs("js/app/controlls/MenuList.js");
includeJs("js/app/controlls/ScrollableText.js");

includeJs("js/app/controlls/sdl/PresetButton.js");

//  utils 
includeJs("js/app/util/Audio.js");
includeJs("js/app/util/StreamAudio.js");

//  Models 

includeJs("js/app/model/media/CDModel.js");

includeJs("js/app/model/PhoneModel.js");

//  SDL models 
includeJs("js/app/model/sdl/VehicleInfoModel.js");
includeJs("js/app/model/sdl/AppModel.js");
includeJs("js/app/model/sdl/NonMediaModel.js");
includeJs("js/app/model/sdl/MediaModel.js");
includeJs("js/app/model/sdl/Model.js");
//  SDL models END 

//  Controllers 
includeJs("js/app/controller/MediaController.js");
includeJs("js/app/controller/PhoneController.js");
includeJs("js/app/controller/InfoController.js");
includeJs("js/app/controller/SettingsController.js");

includeJs("js/app/controller/sdl/Controller.js");
includeJs("js/app/controller/sdl/RPCController.js");
includeJs("js/app/controller/sdl/AppController.js");  
includeJs("js/app/controller/sdl/NonMediaController.js");  
includeJs("js/app/controller/sdl/MediaController.js");  

//  Mixins 
includeJs("js/app/mixins/PresetEvents.js");
includeJs("js/app/mixins/PresetEventCustom.js");

//  Views 

//  phone views 
includeJs("js/app/view/phone/dialpadView.js");

//  media views 
includeJs("js/app/view/media/sdl/controllsView.js");
includeJs("js/app/view/media/common/LeftMenuView.js");
includeJs("js/app/view/media/playerView.js");
includeJs("js/app/view/media/sdlmediaView.js");

//  info views 
includeJs("js/app/view/info/servicesView.js");
includeJs("js/app/view/info/travelLinkView.js");
includeJs("js/app/view/info/calendarView.js");
includeJs("js/app/view/info/appsView.js");
includeJs("js/app/view/info/devicelistView.js");
includeJs("js/app/view/info/nonMediaView.js");

//  settings views 
includeJs("js/app/view/settings/policies/appPermissionsListView.js");
includeJs("js/app/view/settings/policies/appPermissionsView.js");
includeJs("js/app/view/settings/policies/deviceConfigView.js");
includeJs("js/app/view/settings/policies/deviceStateChangeView.js");
includeJs("js/app/view/settings/policies/statisticsInfoView.js");
includeJs("js/app/view/settings/policies/systemErrorView.js");
includeJs("js/app/view/settings/policiesView.js");

includeJs("js/app/view/homeView.js");
includeJs("js/app/view/mediaView.js");
includeJs("js/app/view/infoView.js");
includeJs("js/app/view/climateView.js");
includeJs("js/app/view/phoneView.js");
includeJs("js/app/view/navigationView.js");
includeJs("js/app/view/settingsView.js");
includeJs("js/app/view/navigationApp/baseNavigationView.js");
includeJs("js/app/view/navigationAppView.js");

//  home views 
includeJs("js/app/view/home/controlButtons.js");

includeJs("js/app/view/home/topControls.js");
includeJs("js/app/view/home/bottomControls.js");

includeJs("js/app/view/home/statusMediaView.js");
includeJs("js/app/view/home/statusPhoneView.js");
includeJs("js/app/view/home/statusInfoView.js");
includeJs("js/app/view/home/statusNavigationView.js");
includeJs("js/app/view/home/statusClimateView.js");
	//  SDL views 
includeJs("js/app/view/sdl/shared/AbstractView.js");
includeJs("js/app/view/sdl/shared/interactionChoicesView.js");
includeJs("js/app/view/sdl/shared/sliderView.js");
includeJs("js/app/view/sdl/shared/optionsView.js");
includeJs("js/app/view/sdl/shared/scrollableMessage.js");
includeJs("js/app/view/sdl/shared/turnByTurnView.js");
includeJs("js/app/view/sdl/shared/tbtTurnList.js");
includeJs("js/app/view/sdl/TTSPopUp.js");
includeJs("js/app/view/sdl/AlertPopUp.js");
includeJs("js/app/view/sdl/PopUp.js");
includeJs("js/app/view/sdl/AlertManeuverPopUp.js");
includeJs("js/app/view/sdl/AudioPassThruPopUp.js");
includeJs("js/app/view/sdl/VRPopUp.js");
includeJs("js/app/view/sdl/VehicleInfoView.js");
includeJs("js/app/view/sdl/tbtClientStateView.js");
includeJs("js/app/view/sdl/driverDistraction.js");
includeJs("js/app/view/sdl/SystemRequestView.js");
includeJs("js/app/StateManager.js");

//  STATE MACHINE 
includeJs("js/app/AppViews.js");

// Main js
includeJs("js/main.js")