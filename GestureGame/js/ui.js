RA.ui.animation=false;

RA.ui.goalCompleted=function(goal)
	{
	$("#star_"+goal).show();
	};
	
RA.ui.updateDOM=function()
	{
	$("#empty_div").toggle();
	}

RA.ui.updateProjectileCounter=function()
	{
	$("#projectile_number").html(Math.min(6-RA.goals.projectiles_left, 5));
	}

RA.ui.roundStartBanner=function(callback)
	{
	$("#start_round_popup").show();
	RA.ui.animation=true;
	window.setTimeout(function(){ $("#start_round_popup").hide(); RA.ui.animation=false; if(callback){ callback(); } }, 2000);
	};
	
RA.ui.roundEndBanner=function(callback)
	{
	$("#end_round_popup").show();

	// Show minions
	if(RA.goals.goals_completed["minions"])
		{
		$("#fin_fail_minions").hide();
		$("#fin_success_minions").show();
		}
	else
		{
		$("#fin_success_minions").hide();
		$("#fin_fail_minions").show();
		}
	// Show bigbad
	if(RA.goals.goals_completed["bigbad"])
		{
		$("#fin_fail_bigbad").hide();
		$("#fin_success_bigbad").show();
		}
	else
		{
		$("#fin_success_bigbad").hide();
		$("#fin_fail_bigbad").show();
		}
	// Show minions
	if(RA.goals.goals_completed["coins"])
		{
		$("#fin_fail_bonus").hide();
		$("#fin_success_bonus").show();
		}
	else
		{
		$("#fin_success_bonus").hide();
		$("#fin_fail_bonus").show();
		}
	
	// Show win or lose
	if(RA.goals.goals_completed["minions"] && RA.goals.goals_completed["bigbad"])
		{
		$("#fin_lost").hide();
		$("#fin_fail_starbottle").hide();
		$("#fin_won").show();
		$("#fin_success_starbottle").show();
		$("#button_next_level").html("NEXT LEVEL");
		}
	else
		{
		$("#fin_won").hide();
		$("#fin_success_starbottle").hide();
		$("#fin_lost").show();
		$("#fin_fail_starbottle").show();
		$("#button_next_level").html("NEW GAME");
		}
	};
	
RA.ui.nextLevel=function()
	{
	if(RA.goals.goals_completed["minions"] && RA.goals.goals_completed["bigbad"])
		{
		$("#end_round_popup").hide();
		// create a new level
		init_level();
		}
	else
		{
		// go back to the homescreen
		location.href="index.html";
		}
	};

	
RA.ui.updateLevelNumber=function()
	{
	$("#level_number").html(RA.goals.level_number);
	};
	
RA.ui.hideStars=function()
	{
	$("#star_minions").hide();
	$("#star_bigbad").hide();
	$("#star_coins").hide();
	};

RA.ui.turnStartBanner=function(callback)
	{
	$("#start_turn_popup").html("Turn "+RA.goals.turn_count);
	$("#start_turn_popup").show();
	RA.ui.animation=true;
	window.setTimeout(function(){ $("#start_turn_popup").hide(); RA.ui.animation=false; if(callback){ callback(); } }, 2000);
	};