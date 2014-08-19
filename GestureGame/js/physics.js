RA.physics.applyImpulse=function(object, x, y)
	{
	object.ApplyImpulse(new Box2D.Common.Math.b2Vec2(x, y), object.GetWorldCenter());
	}

RA.physics.applyForce=function(object, x, y)
	{
	object.ApplyForce(new Box2D.Common.Math.b2Vec2(x, y), object.GetWorldCenter());
	}

RA.physics.add=function(world, prototype, x, y, x_impulse, y_impulse)
	{
	x_impulse=x_impulse || 0;
	y_impulse=y_impulse || 0;
	
	var b2Vec2 = Box2D.Common.Math.b2Vec2, b2BodyDef = Box2D.Dynamics.b2BodyDef, b2Body = Box2D.Dynamics.b2Body, b2FixtureDef = Box2D.Dynamics.b2FixtureDef, b2Fixture = Box2D.Dynamics.b2Fixture, b2World = Box2D.Dynamics.b2World, b2MassData = Box2D.Collision.Shapes.b2MassData, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape, b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
	
	if(!prototype.fixtureDef)
		{
		prototype.fixtureDef = new Box2D.Dynamics.b2FixtureDef;
		prototype.fixtureDef.density = prototype.density;
		prototype.fixtureDef.friction = prototype.friction;
		prototype.fixtureDef.restitution = prototype.restitution;
		}

	var bodyDef = new b2BodyDef;
	bodyDef.type = prototype.fixed ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
	bodyDef.position.x = x;
	bodyDef.position.y = y;
	
	body = world.CreateBody(bodyDef);
	body.model=prototype;

	if(!Array.isArray(prototype.shape))
		{
		prototype.shape=[prototype.shape];
		}
	for(shape in prototype.shape)
		{
		prototype.fixtureDef.shape=prototype.shape[shape];
		body.CreateFixture(prototype.fixtureDef);
		}
	var mass=body.GetMass();
	body.ApplyImpulse(new b2Vec2(x_impulse * mass, y_impulse * mass), body.GetWorldCenter());
	
	RA.goals.body_count++;
	
	return body;
	}

RA.physics.createBoundaries=function(world, width, height, density, friction, restitution)
	{
	var b2Vec2 = Box2D.Common.Math.b2Vec2, b2BodyDef = Box2D.Dynamics.b2BodyDef, b2Body = Box2D.Dynamics.b2Body, b2FixtureDef = Box2D.Dynamics.b2FixtureDef, b2Fixture = Box2D.Dynamics.b2Fixture, b2World = Box2D.Dynamics.b2World, b2MassData = Box2D.Collision.Shapes.b2MassData, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape, b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

	var fixDef = new b2FixtureDef;
	fixDef.density = density;
	fixDef.friction = friction;
	fixDef.restitution = restitution;
	
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_staticBody;
	
	// the top wall and bottom sensor
	bodyDef.position.x = width / 2 / RA.scale;
	fixDef.shape = new b2PolygonShape();
	fixDef.shape.SetAsBox((width / RA.scale) / 2, (10 / RA.scale) / 2);

	// the top wall
	bodyDef.position.y = 0;
	world.CreateBody(bodyDef).CreateFixture(fixDef);
	
	// the bottom sensor
	fixDef.isSensor=true;
	bodyDef.position.y = (height+5) / RA.scale;
	world.CreateBody(bodyDef).CreateFixture(fixDef);
	
	// side walls
	bodyDef.position.y = height / 2 / RA.scale;
	fixDef.isSensor=false;
	fixDef.shape = new b2PolygonShape();
	fixDef.shape.SetAsBox((10 / RA.scale) / 2, (height / RA.scale) / 2);
	
	// the right wall
	bodyDef.position.x = width / RA.scale;
	world.CreateBody(bodyDef).CreateFixture(fixDef);
	
	// the left wall
	bodyDef.position.x = 0;
	world.CreateBody(bodyDef).CreateFixture(fixDef);
	}

RA.physics.Circle=function(radius, x, y)
	{
	var circle=new Box2D.Collision.Shapes.b2CircleShape(radius);
	circle.SetLocalPosition(new Box2D.Common.Math.b2Vec2(x || 0, y|| 0));
	return circle;
	}

RA.physics.Rectangle=function(width, height, x, y)
	{
	var shape = new Box2D.Collision.Shapes.b2PolygonShape;
	shape.SetAsOrientedBox(width / 2, height / 2, new Box2D.Common.Math.b2Vec2(x || 0, y|| 0));
	return shape;
	}

RA.physics.Polygon=function(points, x, y)
	{
	var shape = new Box2D.Collision.Shapes.b2PolygonShape;
	var x_offset=x || 0, y_offset=y || 0;
	var list=points.map(function(element){ return new Box2D.Common.Math.b2Vec2(element[0]+x_offset-.5, element[1]+y_offset-.5); });
	shape.SetAsArray(list);
	return shape;
	}