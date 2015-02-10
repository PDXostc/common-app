var templates = document.getElementById('templates').import;

function Template(id) {
	this.template = templates.getElementById(id);
	this.templateContent = document.importNode(this.template.content, true);
};

Template.prototype.addTo = function(target) {
	$(this.templateContent).appendTo(target);
};

var cameraViewDataset = function(cameraView) {
	return cameraView.templateContent.querySelector(".camera-view").dataset;
};

function setCameraDataType(cameraView, cameraType) {
	cameraViewDataset(cameraView).cameraType = cameraType;
};

function setCameraDataId(cameraView, cameraId) {
	cameraViewDataset(cameraView).cameraId = cameraId;
};

function loadCameraTitle(cameraView, options) {
	var content = cameraView.templateContent;
	content.querySelector(".camera-view .camera-title .camera-id").innerText = options.cameraId;
	content.querySelector(".camera-view .camera-title .camera-type").innerText = options.cameraType;
};

function loadCameras(cameraType, count) {
	for (var i = 1; i <= count; i++) {
		var cameraView = new Template('camera-view-template');
		setCameraDataType(cameraView, cameraType);
		setCameraDataId(cameraView, i);
		loadCameraTitle(cameraView, {
			cameraType: cameraType,
			cameraId: i
		});
		
		targetPanelId = "#" + cameraType + "-cameras"
		targetList = $(targetPanelId).find(".cameras-list");
		cameraView.addTo(targetList);
	};
};

function getCameraId(cameraType) {
	return cameraType + "-cameras";
};

function setActiveTab(tabID) {
	var tab = document.getElementById(tabID);
	$(tab).siblings().removeClass("active");
	$(tab).addClass("active");
};

function scrollToPanel(panel) {
	var sliderParent = $("#cameras-slider");
	var leftScroll = sliderParent.scrollLeft() + $(panel).position().left;
	sliderParent.animate({ scrollLeft: leftScroll }, 250);
};

function setActivePanel(tab) {
	var cameraType = $(tab).data("tabid");
	var camerasPanelId = getCameraId(cameraType);
	$(camerasPanelId).siblings().removeClass("active");
	$(camerasPanelId).addClass("active");
	// Slides selected panel into view
	var panel = document.getElementById(camerasPanelId); 
	scrollToPanel(panel);
};

function switchPanels(tab) {
	setActiveTab(tab.id);
	setActivePanel(tab);
};

function touchSlidePanel() {
	var sliderParent = $("#cameras-slider");
	var panelCount = sliderParent.children().length;
	var scrollPosition = sliderParent.scrollLeft();
	var sliderWidth = sliderParent.width();
	var dominentPanelIndex = Math.round(scrollPosition / sliderWidth );
	var dominentPanel = sliderParent.children()[dominentPanelIndex];
	var tabID = dominentPanel.dataset.panelid + "-tab";

	scrollToPanel(dominentPanel);
	setActiveTab(tabID);
};

var activeCamera = function() {
	return document.getElementById("active-camera");
}

var selectedCameraActive = function(selectedCamera) {
	var activeCameraView = $(activeCamera).find(".camera-view");
	var typeMatch = selectedCamera.data().cameraType === activeCameraView.data().cameraType;
	var idMatch = selectedCamera.data().cameraId === activeCameraView.data().cameraId;
	return typeMatch && idMatch;
}

function toggleOffActive() {
	$(".camera-on").removeClass("camera-on");
};

function toggleOnCameras(cameras) {
	cameras.toggleClass("camera-on");
}

function resetMirroring() {
	$(activeCamera).find(".mirror-on").removeClass("mirror-on");
}

function powerCamera(camera) {
	cameraView = $(camera).closest(".camera-view");
	var cameraScreens = generateCameraSelector(cameraView);
	if (!selectedCameraActive(cameraView)) {
		toggleOffActive();
		resetMirroring();
	};
	toggleOnCameras(cameraScreens);
};

function expandCamera(camera) {
	var cameraView = $(camera).closest(".camera-view");
	var enlargement = cameraView.clone();
	enlargement.addClass("enlarged-view");
	enlargement.id += "-enlarged";
	$("#active-camera .camera-view").replaceWith(enlargement);
	if (!inEnlargedView()) {
		$(".cameras-panel").addClass("panel-minimized");
		$("#active-camera").toggleClass("hidden");
	}
};

function contractCamera() {
	$("#active-camera .camera-view").empty();
	$("#active-camera").toggleClass("hidden");
	$(".cameras-panel").toggleClass("panel-minimized");
};

var inEnlargedView = function() {
	return window.getComputedStyle(activeCamera()).display !== "none";
};

function generateCameraSelector(camera) {
	var cameraData = camera.data();
	var typeFilter = "[data-camera-type='" + cameraData.cameraType + "']";
	var idFilter = "[data-camera-id='" + cameraData.cameraId + "']";	
	return $(".camera-view" + typeFilter + idFilter);
};

function mirrorCameraView(touchNode) {
	var cameraView = $(touchNode).closest("#active-camera").find(".camera-view");
	var cameras = generateCameraSelector(cameraView);
	$(cameras).find(".camera-screen").toggleClass("mirror-on");
	$(cameras).siblings().find(".camera-mirror").toggleClass("mirror-on");
};

var tempInit = function() {
	loadCameras("usb", 6);
	loadCameras("analog", 4);
	loadCameras("ip", 6);
	// Clears timer for development only
	setTimeout(function() { clearInterval(uiUpdateTimer)}, 1000);
};

$(document).ready(tempInit);

// Camera Panel Tabs 
$(document).on("click", ".slider-tab", function() {
	switchPanels(this);
});
// Camera Panel Touch Scroll
$(document).on("touchend", "#cameras-slider", function() {
	touchSlidePanel();
});
// Power Toggle
$(document).on("click", ".camera-screen", function() {
	powerCamera(this);
	expandCamera(this);
});
// Clone and Expand camera view
$(document).on("click", ".expand-icon", function() {
	expandCamera(this);
});
// Removes expanded view
$(document).on("click", ".contract-icon", function() {
	contractCamera();
});
// Mirroring
$(document).on("click", ".camera-mirror", function(){
	mirrorCameraView(this);
});


// EOF