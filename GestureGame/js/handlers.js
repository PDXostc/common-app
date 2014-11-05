RA.handlers={};

RA.handlers.mouseMoveHandler=function(event)
	{
		console.log("mouseMoveHandler ",RA.input_state.clicking);
	if (RA.input_state.clicking)
		{
			if(typeof(event.clientX) == typeof(undefined))
				RA.launcher.setLauncherPosition(event.touches[0].clientX, event.touches[0].clientY);
			else
				RA.launcher.setLauncherPosition(event.clientX, event.clientY);
		}
	//RA.ui.goalCompleted(1);
	};
	
RA.handlers.mouseDownHandler=function(event)
	{
		console.log("mouseDownHandler ",event.target.id);
	if (event.target.id == "projectile_div")
		{
		RA.input_state.clicking = true;
		}
	//RA.ui.goalCompleted(2);
	};
	
RA.handlers.mouseUpHandler=function(event)
	{
		console.log("mouseUpHandler ",RA.input_state.clicking);
	if (RA.input_state.clicking)
		{
		RA.input_state.clicking = false;
		RA.launcher.setLauncherPosition(RA.canvas.width / 2, RA.canvas.height * (7 / 8)+84);

		if(typeof(event.clientX) == typeof(undefined))
			RA.launcher.launchProjectile(event.changedTouches[0].clientX, event.changedTouches[0].clientY-84);
		else
			RA.launcher.launchProjectile(event.clientX, event.clientY-84);
		}
	//RA.ui.goalCompleted(0);
	};
	
RA.handlers.keyPressHandler=function(event)
	{
	var char=String.fromCharCode(event.keyCode);
	console.log(char+" was pressed. "+RA.flags.DRAW_IMAGES+" "+RA.flags.DRAW_PHYSICS);
	if(char=="1")
		{
		RA.flags.DRAW_IMAGES=!RA.flags.DRAW_IMAGES;
		}
	else if(char=="2")
		{
		RA.flags.DRAW_PHYSICS=!RA.flags.DRAW_PHYSICS;
		}
	};
