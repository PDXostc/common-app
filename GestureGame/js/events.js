RA.events.callEvent=function(eventName, object, event)
	{
	if(object.model && object.model[eventName])
		{
		return object.model[eventName].call(object, event);
		}
	};

RA.events.setupEvents=function(world)
	{
	var world_events=["LevelStart", "LevelEnd", "TurnStart", "TurnEnd"];
	for(index in world_events)
		{
		(function(index){
			world["call"+world_events[index]]=function()
				{
				for (var object = world.m_bodyList; object; object = object.m_next)
					{
					RA.events.callEvent("on"+world_events[index], object);
					}
				};
		})(index);
		}
	};
	
(function()
	{
	var events=["Launch", "Projectile", "Collision", "ScreenExit", "Tap", "Slide", "Frame", "FrameInterval", "Destroyed"];
	for(index in events)
		{
		(function(index){
			RA.events["call"+events[index]]=function(object, event)
				{
				return RA.events.callEvent("on"+events[index], object, event);
				};
		})(index);
		}
	})();