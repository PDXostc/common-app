/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*global google*/

// The first support methods that don't (yet) exist in v3
google.maps.LatLng.prototype.distanceFrom = function (newLatLng) {
	"use strict";
	var EarthRadiusMeters = 6378137.0; // meters
	var lat1 = this.lat();
	var lon1 = this.lng();
	var lat2 = newLatLng.lat();
	var lon2 = newLatLng.lng();
	var dLat = (lat2 - lat1) * Math.PI / 180;
	var dLon = (lon2 - lon1) * Math.PI / 180;
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = EarthRadiusMeters * c;
	return d;
};

google.maps.LatLng.prototype.latRadians = function () {
	"use strict";
	return this.lat() * Math.PI / 180;
};

google.maps.LatLng.prototype.lngRadians = function () {
	"use strict";
	return this.lng() * Math.PI / 180;
};

/**
 * Returns the length of a path in metres.
 * @method Distance
 */
google.maps.Polygon.prototype.Distance = function () {
	"use strict";
	var dist = 0, i = 0;
	for (i = 1; i < this.getPath().getLength(); i++) {
		dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
	}
	return dist;
};

/**
 * Returns GLatLng of the point at the given distance along the path. Returns null if the path is shorter than the specified distance.
 * @method GetPointAtDistance
 * @param metres {Integer} distance in metres
 */
google.maps.Polygon.prototype.GetPointAtDistance = function (metres) {
	"use strict";
	// some awkward special cases
	if (metres === 0) {
		return this.getPath().getAt(0);
	}
	if (metres < 0) {
		return null;
	}
	if (this.getPath().getLength() < 2) {
		return null;
	}

	var dist = 0, olddist = 0, i = 0;

	for (i = 1; (i < this.getPath().getLength() && dist < metres); i++) {
		olddist = dist;
		dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
	}
	if (dist < metres) {
		return null;
	}
	var p1 = this.getPath().getAt(i - 2);
	var p2 = this.getPath().getAt(i - 1);
	var m = (metres - olddist) / (dist - olddist);
	return new google.maps.LatLng(p1.lat() + (p2.lat() - p1.lat()) * m, p1.lng() + (p2.lng() - p1.lng()) * m);
};

/**
 * Returns the Vertex number at the given distance along the path. Returns null if the path is shorter than the specified distance.
 * @method GetIndexAtDistance
 * @param metres {Integer} distance in metres
 */
google.maps.Polygon.prototype.GetIndexAtDistance = function (metres) {
	"use strict";
	// some awkward special cases
	if (metres === 0) {
		return this.getPath().getAt(0);
	}
	if (metres < 0) {
		return null;
	}
	var dist = 0, i = 0;
	for (i = 1; (i < this.getPath().getLength() && dist < metres); i++) {
		dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
	}
	if (dist < metres) {
		return null;
	}
	return i;
};

// Copy all the above functions to GPolyline
google.maps.Polyline.prototype.Distance             = google.maps.Polygon.prototype.Distance;
google.maps.Polyline.prototype.GetPointAtDistance   = google.maps.Polygon.prototype.GetPointAtDistance;
google.maps.Polyline.prototype.GetIndexAtDistance   = google.maps.Polygon.prototype.GetIndexAtDistance;





