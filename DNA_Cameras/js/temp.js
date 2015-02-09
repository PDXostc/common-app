var templates = document.getElementById('templates').import;

function Template(id) {
	this.template = templates.getElementById(id);
	this.templateContent = document.importNode(this.template.content, true);
}

Template.prototype.addTo = function(target) {
	$(this.templateContent).appendTo(target);
}

var cameraViewDataset = function(cameraView) {
	return cameraView.templateContent.querySelector(".camera-view").dataset;
}

function setCameraType(cameraView, cameraType) {
	cameraViewDataset(cameraView).cameraType = cameraType;
}

function setCameraId(cameraView, cameraId) {
	cameraViewDataset(cameraView).cameraId = cameraId;
}

function loadCameraTitle(cameraView, options) {
	var content = cameraView.templateContent;
	content.querySelector(".camera-view .camera-title .camera-id").innerText = options.cameraId;
	content.querySelector(".camera-view .camera-title .camera-type").innerText = options.cameraType;
}

function loadCameras(cameraType, count) {
	for (var i = 1; i <= count; i++) {
		var cameraView = new Template('camera-view-template');
		setCameraType(cameraView, cameraType);
		setCameraId(cameraView, i);
		loadCameraTitle(cameraView, {
			cameraType: cameraType,
			cameraId: i
		});
		
		targetPanelId = "#" + cameraType + "-cameras"
		targetList = $(targetPanelId).find(".cameras-list");
		cameraView.addTo(targetList);
	}
}

function getCameraId(cameraType) {
	return cameraType + "-cameras";
};

function setActiveTab(tabID) {
	var tab = document.getElementById(tabID);
	$(tab).siblings().removeClass("active");
	$(tab).addClass("active");
}

function scrollToPanel(panel) {
	var sliderParent = $("#cameras-slider");
	var leftScroll = sliderParent.scrollLeft() + $(panel).position().left;
	sliderParent.animate({ scrollLeft: leftScroll }, 250);
};

var tempInit = function() {
	loadCameras("usb", 6);
	loadCameras("analog", 4);
	loadCameras("ip", 6);
	// Clears timer for development only
	// setTimeout(function() { clearInterval(uiUpdateTimer)}, 1000);
}

$(document).ready(tempInit);

// Camera Panel Tabs 
$(document).on("click", ".slider-tab", function() {
	// Sets active view of tab
	setActiveTab(this.id);

	// sets active view of panels
	var cameraType = $(this).data("tabid");
	var camerasPanelId = getCameraId(cameraType);
	$(camerasPanelId).siblings().removeClass("active");
	$(camerasPanelId).addClass("active");

	// Slides selected panel into view
	var panel = document.getElementById(camerasPanelId); 
	scrollToPanel(panel);
})

// Camera Panel Touch Scroll
$(document).on("touchend", "#cameras-slider", function() {
	var sliderParent = $("#cameras-slider");
	var panelCount = sliderParent.children().length;
	var scrollPosition = sliderParent.scrollLeft();
	var sliderWidth = sliderParent.width();
	var dominentPanelIndex = Math.round(scrollPosition / sliderWidth );
	var dominentPanel = sliderParent.children()[dominentPanelIndex];
	var tabID = dominentPanel.dataset.panelid + "-tab";

	scrollToPanel(dominentPanel);
	setActiveTab(tabID);

})

// Power Toggle
$(document).on("click", ".camera-power", function() {
	var cameraScreen = $(this).closest(".camera-view").find(".camera-screen");
	cameraScreen.toggleClass("camera-ready camera-on");
});

// Clone and Expand camera view
$(document).on("click", ".expand-icon", function() {
	var cameraView = $(this).closest(".camera-view");
	var enlargement = cameraView.clone();
	enlargement.addClass("enlarged-view");
	enlargement.find(".camera-scale").removeClass("expand-icon").addClass("contract-icon");
	$(".active-camera").html(enlargement);
	$(".cameras-list").addClass("scrollable-x");
});

$(document).on("click", ".contract-icon", function() {
	$(this).closest(".camera-view").empty();
	$(".cameras-list").removeClass("scrollable-x");
});