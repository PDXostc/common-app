waitUtility={
	paused_callbacks:[],
	// this function looks to see if the chrome console is open (because you can only create profiles when the console is open)
	consoleOpen:function()
		{
		console.profile();
		console.profileEnd();
		if (console.clear){ console.clear(); }
		// if profile length is greater than 0, it means the console is open, because a profile was created/
		return console.profiles.length > 0;
		},
	
	wait:function(wait_for_console, callback, immediate)
		{
		if(immediate){ callback(); return; }
		var object={
			wait_for_console:wait_for_console,
			callback:callback,
			unpause:function()
				{
				// if we're no longer waiting, remove this wait object, and call the callback we've been given
				var index = waitUtility.paused_callbacks.indexOf(this);
				if (index > -1) { waitUtility.paused_callbacks.splice(index, 1); }
				console.log("removed");
				
				this.callback();
				}
		};
		waitUtility.paused_callbacks.push(object);
		waitUtility.waitCallback(object);
		},
		
	waitCallback:function(o)
		{
		var object=o;
		var index=waitUtility.paused_callbacks.indexOf(object);
		if(index > -1)
			{
			// if we're waiting on the console, and it's open, don't actually wait
			if(object.wait_for_console && waitUtility.consoleOpen() ){ o.unpause(); }
			else{ console.log("waiting on user input (call waitUtility.paused_callbacks["+index+"].unpause() )"); }
		
			// set a callback to check in a little bit
			setTimeout(function(){ waitUtility.waitCallback(object); }, 2000);
			return;
			}
		}
	}
//
// call this code to make a callback wait: waitUtility.wait(wait_for_console, callback);
// wait_for_console is a boolean that determines whether the code waits for a chrome debug session or user input
// callback is the function you want called back
//