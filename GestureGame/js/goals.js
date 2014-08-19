RA.goals.level_number=0;

RA.goals.goalCompleted=function(goal)
	{
	if(RA.goals.goals_completed[goal]!=undefined)
		{
		RA.goals.goals_completed[goal]=true;
		RA.ui.goalCompleted(goal);
		}
	};
	
RA.goals.isRoundEnded=function()
	{
	return (RA.goals.goals_completed["minions"] && RA.goals.goals_completed["bigbad"] && RA.goals.goals_completed["coins"]) || (RA.goals.projectiles_left==0 && RA.goals.isProjectileStopped());
	}

RA.goals.init=function()
	{
	RA.ui.hideStars();
	
	RA.goals.goals_completed={minions:false, bigbad:false, coins:false};

	RA.goals.minion_count=0;

	RA.goals.body_count=0;

	RA.goals.turn_count=1;

	RA.goals.projectiles_left=5;
	RA.ui.updateProjectileCounter();

	RA.goals.current_projectile=null;
	}

RA.goals.minionRemoved=function()
	{
	RA.goals.minion_count--;
	if(RA.goals.minion_count==0)
		{
		RA.goals.goalCompleted("minions");
		}
	};

RA.goals.checkDestroyedPercent=function()
	{
	if(!RA.goals.coins && RA.world.m_bodyCount/RA.goals.body_count<.25)
		{
		RA.goals.goalCompleted("coins");
		}
	};

	
RA.goals.isProjectileStopped=function()
	{
	if(RA.goals.current_projectile){
		var velocityA=RA.goals.current_projectile.GetLinearVelocity();
		var length=Math.pow(velocityA.x, 2)+Math.pow(velocityA.y, 2);
		if(length>0.001)
			{
			return false;
			}
		else
			{
			RA.goals.current_projectile=null;
			}
		}
	return true;
	};

RA.goals.endTurn=function()
	{
	RA.goals.turn_count++;
	RA.goals.projectiles_left--;
	RA.ui.updateProjectileCounter();
	};