/** 
 * Fucntion for Switching Vehicle Graphics
 */

function switchVehicle() {
	var vehicleGraphic = document.getElementById('vehicle-graphic');
	var rangeRover = document.getElementById("rangeRoverButton");
	var lr4 = document.getElementById("lr4Button");
	var fType = document.getElementById("fTypeButton");

	rangeRover.addEventListener('click', rangeRoverSwitch.bind(vehicleGraphic, false));
	lr4.addEventListener('click', lr4Switch.bind(vehicleGraphic, false));
	fType.addEventListener('click', fTypeSwitch.bind(vehicleGraphic, false));
}

function rangeRoverSwitch(event) {
	this.className = 'rangeRoverVehicle';
} 

function lr4Switch(event) {
	this.className = 'lr4Vehicle';
} 

function fTypeSwitch(event) {
	this.className = 'fTypeVehicle';
} 

document.addEventListener("DOMContentLoaded", switchVehicle, false);