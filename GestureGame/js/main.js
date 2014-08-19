function init_game()
	{
	RA.stats = new Stats();
	document.body.appendChild(RA.stats.domElement);

	RA.canvas = document.getElementById("game_canvas");
	RA.context = RA.canvas.getContext("2d");
	
	RA.animations_context = document.getElementById("animations_canvas").getContext("2d");
	
	RA.projectile_div=document.getElementById("projectile_div");
	RA.projectile_size=RA.projectile_div.offsetWidth/2;

	RA.launcher.setLauncherPosition(RA.canvas.width / 2, RA.canvas.height * (7 / 8)+84);
	
	//var body=document.getElementById("body");

	$("body").mousemove(RA.handlers.mouseMoveHandler);

	$("body").mousedown(RA.handlers.mouseDownHandler);

	$("body").mouseup(RA.handlers.mouseUpHandler);

	$("body").keypress(RA.handlers.keyPressHandler);//*/
	
	$("html").on("click", ".bottomPanelLogo", function(){ location.reload(); });
	
	$("#link_next_level").click(RA.ui.nextLevel);

	$("#ammo_index_inc").click(RA.launcher.incrementAmmoIndex);
	
	$("#ammo_index_dec").click(RA.launcher.decrementAmmoIndex);

	//audio.loadSounds();
	//audio.playSound('start.wav');

	init_level();
	}; // init()
	
function init_level()
	{
	RA.goals.init();
	RA.goals.level_number++;
	RA.ui.updateLevelNumber();
	
	RA.graphics.loadSplashImages();
	RA.graphics.loadCatapultImage();
	
	RA.launcher.setAmmoIndex(0);
	
	RA.world = RA.levelLoader.load(RA.canvas.width, RA.canvas.height);

	RA.graphics.setDebugDraw(RA.world, RA.context);
	
	RA.world.callLevelStart();
	
	// Give the world a second to load images
	//RA.graphics.drawWorld(RA.world, RA.context);
	//update();

	for(var i=0;i<3;i++)
		{
		window.setTimeout(function(){ RA.graphics.drawWorld(RA.world, RA.context); RA.ui.updateDOM(); }, 100*i);
		}
	
	RA.ui.roundStartBanner( update );
	
	}; // init()

function update()
	{
	var previously_asleep=RA.goals.isProjectileStopped();
	
	/* call onFrame callback */
	for (b = RA.world.m_bodyList; b; b = b.m_next)
		{
		RA.events.callFrame(b);
		if(b.model && b.model.onFrameInterval)
			{
			if(!b.frame_interval || b.frame_interval<1)
				{
				b.frame_interval=RA.events.callFrameInterval(b) || 60;
				}
			else
				{
				b.frame_interval--;
				}
			}
		}
	/* end call onFrame callback */
	
	// Accelerate the current projectile if it's still in the catapult
	if(RA.goals.current_projectile && RA.goals.current_projectile.in_catapult)
		{
		var current_projectile=RA.goals.current_projectile;
		var pos=current_projectile.m_xf.position;
		
		var x_impulse = (RA.canvas.width/ RA.scale / 2) - pos.x;
		var y_impulse = (RA.canvas.height * (7 / 8) / RA.scale) - pos.y;
		var mass=current_projectile.GetMass();
		var multiplier=50;
		current_projectile.ApplyForce(new Box2D.Common.Math.b2Vec2(x_impulse * mass * multiplier, y_impulse * mass * multiplier), current_projectile.GetWorldCenter());
		}
	
	RA.world.Step(1 / 60 //frame-rate
	, 20 //velocity iterations
	, 20 //position iterations
	);

	//RA.world.DrawDebugData();
	RA.frame_count++;
	RA.graphics.drawWorld(RA.world, RA.context, RA.frame_count);
	
	RA.world.ClearForces();
	
	RA.graphics.drawUIAnimations(RA.animations_context);
	
	/* delete destroyed and offscreen bodies (should be a function) */
	var destroyed=[], position;
	for (b = RA.world.m_bodyList; b; b = b.m_next)
		{
		/* mark bodies offscreen for destruction */
		position = b.m_xf.position;
		if(position.x<-4 || position.y<-4 || position.x>(RA.canvas.width/RA.scale)+4 || position.y>(RA.canvas.height/RA.scale)+12)
			{
			b.destroyed=true;
			}
		/* end mark bodies offscreen for destruction */
		
		if(b.destroyed)
			{
			RA.events.callDestroyed(b);
			destroyed.push(b);
			}
		}
	
	for(body in destroyed)
		{
		if(RA.goals.current_projectile==destroyed[body]){  RA.goals.current_projectile=null; }
		RA.world.DestroyBody(destroyed[body])
		}
	/* end delete destroyed and offscreen bodies */
	
	RA.goals.checkDestroyedPercent();

	RA.stats.update();
	
	if(RA.goals.isRoundEnded())
		{
		RA.ui.roundEndBanner();
		}
	else
		{
		if(RA.goals.isProjectileStopped() && !previously_asleep)
			{
			RA.goals.endTurn();
			}
		window.requestAnimationFrame(update);
		}
	}; // update()
	
$(document).ready(function()
	{
	//waitUtility.wait(true, init_game, true);
	init_game();
	//waitUtility.wait(true, init);
	});
