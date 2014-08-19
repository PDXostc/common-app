RA.graphics.splash_images=[];
RA.graphics.splash_locations=[];
RA.graphics.catapult_sling=null;
RA.graphics.projectile_image=null;

RA.graphics.setDebugDraw = function(world, canvas)
	{
	var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

	//setup debug draw
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(canvas);
	debugDraw.SetDrawScale(RA.scale);
	debugDraw.SetFillAlpha(0.3);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	world.SetDebugDraw(debugDraw);
	}

RA.graphics.drawWorld = function(world, context, frame)
	{
	
	context.clearRect(0, 0, RA.canvas.width-1, RA.canvas.height-1);

	var b;

	if(RA.flags.DRAW_IMAGES)
		{
		for (b = world.m_bodyList; b; b = b.m_next)
			{
			RA.graphics.drawImage(world, context, b, frame);
			}
		}
	if(RA.flags.DRAW_PHYSICS)
		{
		for (b = world.m_bodyList; b; b = b.m_next)
			{
			RA.graphics.drawPhysics(world, context, b);
			}
		}
	}

RA.graphics.drawImage=function(world, context, body, frame)
	{
	var xf = body.m_xf;
	if(body.model && body.model.image)
		{
		if(!body.model.image.image)
			{
			RA.graphics.loadImages(body);
			}
		if(body.image_index==undefined)
			{
			RA.graphics.chooseAlternateImage(body);
			}
		context.save();
		context.translate(xf.position.x*RA.scale, xf.position.y*RA.scale);
		context.rotate(body.GetAngle());
		if(body.model.image.path!="images/block-explode-sprite1.png")
			{
			if(body.image_index==-1)
				{
				context.drawImage(body.model.image.image, body.model.image.offset_x, body.model.image.offset_y, body.model.image.scaled_width, body.model.image.scaled_height);
				}
			else
				{
				context.drawImage(body.model.images[body.image_index].image, body.model.image.offset_x, body.model.image.offset_y, body.model.image.scaled_width, body.model.image.scaled_height);
				}
			}
		else
			{
			body.model.sprites= new Image();
			body.model.sprites.src="images/block-explode-sprites.png";
			context.drawImage(body.model.sprites, (Math.floor(frame/5)%7)*84*0, 0, 84, 84, -28-15, -28-15, 84, 84);
			}
		context.restore();
		}
	else
		{
		if(!RA.flags.DRAW_PHYSICS)
			{
			RA.graphics.drawPhysics(world, context, body);
			}
		}
	}

RA.graphics.loadImages=function(body)
	{
	if(typeof(body.model.image.path)=="string")
		{
		body.model.image.image = new Image();
		body.model.image.image.src=body.model.image.path;
		body.model.image.scaled_width=body.model.image.width*RA.scale;
		body.model.image.scaled_height=body.model.image.height*RA.scale;
		body.model.image.offset_x*=RA.scale;
		body.model.image.offset_y*=RA.scale;
		body.model.image.offset_x+=-body.model.image.scaled_width/2;
		body.model.image.offset_y+=-body.model.image.scaled_height/2;
		}
	else
		{
		var pathes=body.model.image.path[1];
		var probabilities=body.model.image.path[0];
		var probability_unit=0;
		body.model.images = [];
		for(i in pathes)
			{
			body.model.images[i] = {};
			body.model.images[i].image = new Image();
			body.model.images[i].image.src=pathes[i];
			probability_unit+=probabilities[i];
			}
		body.model.image.probabilities=[];
		probability_unit=1/probability_unit;
		for(i in probabilities)
			{
			if(i==0)
				{
				body.model.image.probabilities[i]=0;
				}
			else
				{
				body.model.image.probabilities[i]=probabilities[i-1]*probability_unit + (body.model.image.probabilities[i-1] || 0);
				}
			}
		body.model.image.image=true;
		body.model.image.scaled_width=body.model.image.width*RA.scale;
		body.model.image.scaled_height=body.model.image.height*RA.scale;
		body.model.image.offset_x*=RA.scale;
		body.model.image.offset_y*=RA.scale;
		body.model.image.offset_x+=-body.model.image.scaled_width/2;
		body.model.image.offset_y+=-body.model.image.scaled_height/2;

		}
	}

RA.graphics.loadSplashImages=function()
	{
	var splashes=new Image();
	splashes.src="images/splish-sprites.png";
	
	var splash_frame, canvas, context;
	for(var i=0;i<8;i++)
		{
		canvas = document.createElement("canvas");
		canvas.width = 150;
		canvas.height = 85;
		
		context=canvas.getContext("2d");
		context.drawImage(splashes, i*150, 0, 150, 85, 0, 0, 150, 85);
		//context.drawImage(splashes, 0, 0);
		
		splash_frame=new Image();
		splash_frame.src = canvas.toDataURL("image/png");
		RA.graphics.splash_images[i]=splash_frame;
		}
	}

RA.graphics.loadCatapultImage=function()
	{
	RA.graphics.catapult_sling=new Image();
	RA.graphics.catapult_sling.src="images/ui/slingshot-seat.png";
	RA.graphics.projectile_image=new Image();
	RA.graphics.projectile_image.src="images/ball.png";
	}

RA.graphics.chooseAlternateImage=function(body)
	{
	if(typeof(body.model.image.path)=="string")
			{
		body.image_index=-1;
		}
	else
		{
		var index=Math.random();
		for(i in body.model.image.probabilities)
			{
			if(body.model.image.probabilities[i] < index && index < (body.model.image.probabilities[i+1] || 1))
				{
				body.image_index=i;
				}
			}
		}
	}

RA.graphics.drawPhysics=function(world, context, body)
	{
	var s;
	var xf=body.m_xf;
    var color = new Box2D.Common.b2Color(0, 0, 0);
	for (var f = body.GetFixtureList(); f; f = f.m_next)
		{
		s = f.GetShape();
		if (body.IsActive() == false)
			{
			color.Set(0.5, 0.5, 0.3);
			world.DrawShape(s, xf, color);
			}
		else if (body.GetType() == Box2D.Dynamics.b2Body.b2_staticBody)
			{
			color.Set(0.5, 0.9, 0.5);
			world.DrawShape(s, xf, color);
			}
		else if (body.GetType() == Box2D.Dynamics.b2Body.b2_kinematicBody)
			{
			color.Set(0.5, 0.5, 0.9);
			world.DrawShape(s, xf, color);
			}
		else if (body.IsAwake() == false)
			{
			color.Set(0.6, 0.6, 0.6);
			world.DrawShape(s, xf, color);
			}
		else
			{
			color.Set(0.9, 0.7, 0.7);
			world.DrawShape(s, xf, color);
			}
		}
	}

RA.graphics.drawUIAnimations=function(context)
	{
	var pole_y=875;
	var pole_left=260;
	var pole_right=460;

	var left, top;
	if(RA.goals.current_projectile && RA.goals.current_projectile.in_catapult)
		{
		RA.goals.current_projectile.in_catapult=RA.goals.current_projectile.m_xf.position.y>(pole_y/RA.scale);
		left=RA.goals.current_projectile.m_xf.position.x*RA.scale;
		top=RA.goals.current_projectile.m_xf.position.y*RA.scale;
		}
	else
		{
		var launcher_style = RA.projectile_div.style;
		left=parseInt(launcher_style.left)+RA.projectile_size;
		top=parseInt(launcher_style.top)-RA.projectile_size/2;
		}

	context.clearRect(0, 0, context.canvas.width-1, context.canvas.height-1);
	
	context.lineWidth="1";
	context.strokeStyle = '#000';
	context.fillStyle = '#0f0';
	

	context.beginPath();
	context.moveTo(pole_left, pole_y);
	context.lineTo(left-18, top-5);
	context.lineTo(left-18, top+5);
	context.lineTo(pole_left, pole_y);
	context.closePath();
	context.fill();
	
	context.beginPath();
	context.moveTo(pole_left, pole_y);
	context.lineTo(left-18, top-5);
	context.moveTo(left-18, top+5);
	context.lineTo(pole_left, pole_y);
	context.closePath();
	context.stroke();

	context.beginPath();
	context.moveTo(pole_right, pole_y);
	context.lineTo(left+18, top-5);
	context.lineTo(left+18, top+5);
	context.lineTo(pole_right, pole_y);
	context.closePath();
	context.fill();
	
	context.beginPath();
	context.moveTo(pole_right, pole_y);
	context.lineTo(left+18, top-5);
	context.moveTo(left+18, top+5);
	context.lineTo(pole_right, pole_y);
	context.closePath();
	context.stroke();
	

	// An image of the projectile
	if(RA.goals.projectiles_left!=0 && RA.goals.current_projectile==null)
		{
		//context.drawImage(RA.launcher.ammo_types[RA.launcher.ammo_index].image.image, left-RA.graphics.catapult_sling.width/2, top-RA.graphics.catapult_sling.height/2);
		context.drawImage(RA.graphics.projectile_image, left-RA.graphics.projectile_image.width/2, top-RA.graphics.projectile_image.height/2);
		}
	
	// Should be an image of the projectile
	context.drawImage(RA.graphics.catapult_sling, left-RA.graphics.catapult_sling.width/2, top-RA.graphics.catapult_sling.height/2);
	
	var splash_locations=RA.graphics.splash_locations;
	var deleted=[];
	var height, width;
	for(index in splash_locations)
		{
		height=splash_locations[index].height;
		width=splash_locations[index].width;
		splash_locations[index].frame++;
		if(splash_locations[index].frame>39){ deleted.push(index); }
		context.drawImage(RA.graphics.splash_images[Math.floor(splash_locations[index].frame/5)%8], splash_locations[index].x-width/2, 1000-height, width, height);
		}
	for(index in deleted)
		{
		splash_locations.splice(deleted[index], 1);
		}
	}

RA.graphics.createSplash=function(body)
	{
	var force=body.GetLinearVelocity();
	RA.graphics.splash_locations.push({x:body.m_xf.position.x*RA.scale, height:Math.abs(force.y)*5, width:150, frame:0});
	}