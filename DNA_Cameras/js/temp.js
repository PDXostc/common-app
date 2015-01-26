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

var tempInit = function() {
	loadCameras("usb", 6);
	loadCameras("analog", 4);
	loadCameras("ip", 6);
}

$(document).ready(tempInit);

// Camera Panel Tabs 
$(document).on("click", ".slider-button", function() {
	$(this).siblings().removeClass("active");
	$(this).addClass("active");

	var cameraType = $(this).data("buttonid");
	var camerasPanelId = "#" + cameraType + "-cameras";
	$(camerasPanelId).siblings().removeClass("active").addClass("hidden");
	$(camerasPanelId).removeClass("hidden").addClass("active");
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