RA.launcher.ammo_types=[RA.models.projectiles.basic, RA.models.projectiles.light];
RA.launcher.ammo_index=0;

RA.launcher.setAmmoIndex=function(index)
	{
	RA.launcher.ammo_index=Math.abs(index%RA.launcher.ammo_types.length);
	// Set #ammo_display to proper image of current ammo
	console.log("Ammo type:"+RA.launcher.ammo_index);
	};
	
RA.launcher.incrementAmmoIndex=function()
	{
	RA.launcher.setAmmoIndex(RA.launcher.ammo_index+1);
	};

RA.launcher.decrementAmmoIndex=function()
	{
	RA.launcher.setAmmoIndex(RA.launcher.ammo_index-1);
	};

RA.launcher.setLauncherPosition = function(x, y)
	{
	launcher_style = RA.projectile_div.style;
	launcher_style.left = x - RA.projectile_size + "px";
	launcher_style.top = y - RA.projectile_size + "px";
	};
	
RA.launcher.launchProjectile=function(fromX, fromY)
	{
	if(RA.goals.projectiles_left!=0 && RA.goals.isProjectileStopped())
		{
		var x = fromX / RA.scale;
		var y = fromY / RA.scale;
		
		var x_impulse = (RA.canvas.width / 2 - fromX) / RA.scale;
		var y_impulse = (RA.canvas.height * (7 / 8)  - fromY) / RA.scale;
		
		var body=RA.physics.add(RA.world, RA.launcher.ammo_types[RA.launcher.ammo_index], x, y, 0, -1);
		body.launched_projectile=true;
		body.in_catapult=true;
		RA.events.callLaunch(body);
		
		RA.goals.current_projectile=body;
		}
	};