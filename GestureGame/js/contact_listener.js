// Manager for all collsions
RA.contact_listener.ContactListener = function(){};

RA.contact_listener.ContactListener.prototype = new Box2D.Dynamics.b2ContactListener();

RA.contact_listener.ContactListener.prototype.BeginContact = function(contact)
	{
	var fixtureA = contact.GetFixtureA();
	var fixtureB = contact.GetFixtureB();
	var bodyA = fixtureA.GetBody();
	var bodyB = fixtureB.GetBody();
	if(!fixtureA.IsSensor() && !fixtureB.IsSensor())
		{
		RA.events.callCollision(bodyA, contact);
		RA.events.callCollision(bodyB, contact);
		if(bodyB.launched_projectile){ RA.events.callProjectile(bodyA, contact); }
		if(bodyA.launched_projectile){ RA.events.callProjectile(bodyB, contact); }
		}
	else
		{
		if(!fixtureA.IsSensor() && fixtureB.IsSensor())
			{
			RA.graphics.createSplash(bodyA);
			}
		else if(fixtureA.IsSensor() && !fixtureB.IsSensor())
			{
			RA.graphics.createSplash(bodyB);
			}
		}
	/*var pair_list;
	if ((pair_list = this.isPair(contact, RA.objects.fixed.TrackSegment,
			RA.objects.Car)) != null)
		{
		this.hitTrackSegment(pair_list[0], pair_list[1]);
		}
	else if ((pair_list = this.isPair(contact, RA.objects.fixed.TrackSegment,
			RA.objects.Tire)) != null)
		{
		this.tireHitTrackSegment(pair_list[0], pair_list[1]);
		}
	else if ((pair_list = this.isPair(contact, RA.objects.fixed.Hazard,
			RA.objects.Tire)) != null)
		{
		this.hitHazard(pair_list[0], pair_list[1]);
		}
	else if ((pair_list = this.isPair(contact, RA.objects.Powerup,
			RA.objects.Car)) != null)
		{
		this.hitPowerup(pair_list[1], pair_list[0]);
		}
	else if ((pair_list = this.isPair(contact, RA.objects.Powerup,
			RA.objects.Tire)) != null)
		{
		this.hitPowerup(pair_list[1].car, pair_list[0]);
		}
	
	pair_list=this.getDataPair(contact);
	for(var i=0;i<2;++i)
		{
		if(pair_list[i] instanceof RA.objects.Car)
			{
			if(this.collidedByZ(pair_list[i], pair_list[1-i]))
				{
				this.carHitSurface(pair_list[1-i], pair_list[i]);
				}
			}
		
		if(pair_list[i] instanceof RA.objects.Tire)
			{
			if(!this.collidedByZ(pair_list[i], pair_list[1-i]))
				{
				this.addTireZSegment(pair_list[i], pair_list[1-i]);
				}
			else
				{
				this.tireHitSurface(pair_list[1-i], pair_list[i]);
				}
			}
		}*/
	}


RA.contact_listener.ContactListener.prototype.PreSolve = function(contact)
	{
	/*
	var pair_list=this.getDataPair(contact);
	if(!this.collidedByZ(pair_list[0], pair_list[1]))
		{
		contact.SetEnabled(false);
		}*/
	};

RA.contact_listener.ContactListener.prototype.EndContact = function(contact)
	{
	/*
	var pair_list;

	if ((pair_list = this.isPair(contact, RA.objects.fixed.TrackSegment, RA.objects.Tire)) != null)
		{
		this.tireLeftTrackSegment(pair_list[0], pair_list[1]);
		}
	else if((pair_list = this.isPair(contact, RA.objects.fixed.Hazard, RA.objects.Tire)) != null)
		{
		this.leftHazard(pair_list[0], pair_list[1]);
		}

	pair_list=this.getDataPair(contact);
	for(var i=0;i<2;++i)
		{
		if(pair_list[i] instanceof RA.objects.Tire)
			{
			this.removeTireZSegment(pair_list[i], pair_list[1-i]);
			}
		}
		*/
	};
/*
RA.ContactListener.prototype.hitPowerup = function(car, powerup)
	{
	car.hitPowerup();
	powerup.remove=true;
	};

RA.ContactListener.prototype.addTireZSegment = function(tire, data)
	{
	// Using the same logic as we do for track segments, this logic needs to be applied to anything with a z
	var index = tire.zSegments.indexOf(data);
	if (index != 0)
		{
		if (index != -1)
			{
			tire.zSegments.splice(index, 1);
			}
		tire.zSegments.unshift(data);
		}
	};

RA.ContactListener.prototype.removeTireZSegment = function(tire, data)
	{
	var index = tire.zSegments.indexOf(data);
	if (index != -1)
		{
		// At the position of index, remove one item
		tire.zSegments.splice(index, 1);
		}
	};

RA.ContactListener.prototype.collidedByZ = function(dataA, dataB)
	{
	if(dataA == null || dataB == null)
		{
		return true;
		}
	else
		{
		var heightA=0;
		var heightB=0;
		if(dataA.z==undefined){ dataA.z=0; }
		if(dataB.z==undefined){ dataB.z=0; }
		if(dataA.getHeightAt !== undefined)
			{
			var positionB=dataB.body.GetPosition();
			heightA=dataA.getHeightAt(positionB.x, positionB.y);
			//console.log(heightA);
			}
		else
			{
			if(dataA.height==undefined){ dataA.height=RA.constants.height_bounds; }
			heightA+=dataA.height;
			}
		if(dataB.getHeightAt !== undefined)
			{
			var positionA=dataA.body.GetPosition();
			heightB=dataB.getHeightAt(positionA.x, positionA.y);
			//console.log(heightB);
			}
		else
			{
			if(dataB.height==undefined){ dataB.height=RA.constants.height_bounds;; }
			heightB+=dataB.height;
			}
		
		//if(dataA.getHeightAt)
		if(heightA<dataB.z+RA.constants.tire_give || heightB<dataA.z+RA.constants.tire_give)
			{
			return false;
			}
		else
			{
			return true;
			}
		}
	};

RA.ContactListener.prototype.getDataPair = function(contact)
	{
	var fixtureA = contact.GetFixtureA();
	var fixtureB = contact.GetFixtureB();
	var bodyA = fixtureA.GetBody();
	var bodyB = fixtureB.GetBody();
	var dataA = bodyA.GetUserData();
	var dataB = bodyB.GetUserData();
	return [dataA, dataB];
	};

RA.ContactListener.prototype.isPair = function(contact, type1, type2)
	{
	var pair=this.getDataPair(contact);
	if(pair[0] instanceof type1 && pair[1] instanceof type2)
		{
		return [pair[0], pair[1]];
		}
	else if(pair[1] instanceof type1 && pair[0] instanceof type2)
		{
		return [pair[1], pair[0]];
		}
	else
		{
		return null;
		}
	};

RA.ContactListener.prototype.hitTrackSegment = function(lap_marker, car)
	{
	// TODO:: if the car isn't on a track segment, set angle to null
	if (car.lap_markers + 1 == lap_marker.marker_number)
		{
		car.lap_markers++;
		car.wrong_segment = false;
		}
	else if (car.lap_markers == lap_marker.marker_number || car.lap_markers-1 == lap_marker.marker_number)
		{
		car.wrong_segment = false;
		}
	else if (car.lap_markers == RA.current_track.number_of_segments && lap_marker.marker_number == 1)
		{
		car.lap_markers = 1;
		car.lap_number++;
		car.wrong_segment = false;
		RA.audio_engine.playSound('lap.wav');
		RA.draw_engine.redraw_overlay=true;
		}
	else if(lap_marker.marker_number != -1)
		{
		car.wrong_segment = true;
		}
	};

RA.ContactListener.prototype.carHitSurface = function(wall, car)
	{
	if(car.audio_cooldown.collision==0)
		{
		car.audio_cooldown.collision=100;
		if(wall instanceof RA.objects.Car)
			{
			RA.audio_engine.playSound('hitcar.wav');
			}
		else
			{
			RA.audio_engine.playSound('hitwall.wav');
			}
		}
	};

RA.ContactListener.prototype.tireHitSurface = function(wall, tire)
	{
	this.carHitSurface(wall, tire.parent);
	};

RA.ContactListener.prototype.tireHitTrackSegment = function(lap_marker, tire)
	{
	if (!this.collidedByZ(lap_marker, tire))
		{
		var index = tire.segments.indexOf(lap_marker);
		// If this element is not already the first element
		if (index != 0)
			{
			if (index != -1)
				{
				// At the position of index, remove one item
				tire.segments.splice(index, 1);
				}
			// Unshift adds the element to the start of the array, rather than
			// the end, like push would.
			tire.segments.unshift(lap_marker);
			}
		}
	};

RA.ContactListener.prototype.tireLeftTrackSegment = function(lap_marker, tire)
	{
	var index = tire.segments.indexOf(lap_marker);
	if (index != -1)
		{
		// At the position of index, remove one item
		tire.segments.splice(index, 1);
		}
	};

RA.ContactListener.prototype.hitHazard = function(hazard, tire)
	{
	// TODO:: Switch these to use the same sort of logic that tireHitTrackSegment uses
	tire.ground_drag=hazard.drag;
	tire.ground_friction=hazard.friction;
	};
RA.ContactListener.prototype.leftHazard = function(hazard, tire)
	{
	// TODO:: Switch these to use the same sort of logic that tireHitTrackSegment uses
	tire.ground_drag=0;
	tire.ground_friction=1;
	};
*/