/* ---------------------- */
/* TYPE 2 Building Blocks */
/* ---------------------- */

RA.models.block_1x1_type2 =
	{
		shape : RA.physics.Rectangle(1, 1),
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : false,
		image :
			{
				path : "images/block_1x1_type2.png",
				path : [[4, 1], ["images/block_1x1_type2.png", "images/block_1x1_alt.png"]],
				width : 1.03,
				height : 1.03,
				offset_x : 0,
				offset_y : 0
			}
	};

RA.models.block_1x3_type2 =
	{
		shape : RA.physics.Rectangle(3, 1),
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : false,
		image :
			{
				path : [[1, 1], ["images/block_1x3_type2.png", "images/block_1x3_alt.png"]],
				width : 3,
				height : 1.15,
				offset_x : 0,
				offset_y : 0.03
			}
	};

RA.models.capital_1x3_type2 =
	{
		shape : RA.physics.Rectangle(3, 1),
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : false,
		image :
			{
				path : [[1, 1], ["images/capital_1x3_type2.png", "images/capital_1x3_alt.png"]],
				width : 3.06,
				height : 1.06,
				offset_x : 0,
				offset_y : 0
			}
	};

RA.models.pillar_2x1_type2 =
	{
		shape : RA.physics.Rectangle(1, 2),
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : false,
		image :
			{
				path : [[2, 1], ["images/pillar_2x1_type2.png", "images/pillar_2x1_alt.png"]],
				width : 1.13,
				height : 2.03,
				offset_x : 0,
				offset_y : 0
			}
	};

RA.models.arch_2x3_type2 =
{
		shape : [ RA.physics.Rectangle(3, 1, 0, -.5),
				RA.physics.Rectangle(.8, 1, -1, .5),
				RA.physics.Rectangle(.8, 1, 1, .5) ],
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : false,
		image :
			{
				path : [[1, 5], ["images/arch_2x3_type2.png", "images/arch_2x3_alt.png"]],
				width : 3.03,
				height : 2.15,
				offset_x : 0,
				offset_y : 0
			}
	};

RA.models.roof_1x3_type2 =
{
		shape : RA.physics.Polygon([ [ 1.5, .5 ], [ -1.5, .5 ], [ 0, -.5 ] ],
				.5, .5),
		density : 10.0,
		friction : 0.2,
		restitution : 0.2,
		fixed : false,
		image :
			{
				path : [[1, 2], ["images/roof_1x3_type2.png", "images/roof_1x3_alt.png"]],
				width : 3.06,
				height : 1.87,
				offset_x : 0,
				offset_y : -0.4
			}
	};

RA.models.roof_1x1_type2 =
{
		shape : RA.physics.Polygon([ [ .5, .5 ], [ -.5, .5 ], [ 0, -.5 ] ], .5,
				.5),
		density : 10.0,
		friction : 0.01,
		restitution : 0.2,
		fixed : false,
		image :
			{
				path : [[2, 1], ["images/roof_1x1_type2.png", "images/roof_1x1_alt.png"]],
				width : 1.07,
				height : 1.13,
				offset_x : 0,
				offset_y : 0
			}
	};

/* ---------------------- */
/* Islands in the sky */
/* ---------------------- */

RA.models.island_2x3 =
	{
		shape : RA.physics.Rectangle(3, 1),
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : true,
		image :
			{
				path : [[4, 1], ["images/island_2x3.png", "images/island_2x3_alt.png"]],
				width : 3.18,
				height : 2.27,
				offset_x : 0,
				offset_y : .52
			}
	};

RA.models.island_1x1 =
	{
		shape : RA.physics.Rectangle(1, 1),
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : true,
		image :
			{
				path : "images/island_1x1.png",
				width : 1.17,
				height : 1.03,
				offset_x : 0,
				offset_y : -0.1

			}
	};

RA.models.cloud_1x1 =
	{
		shape : RA.physics.Rectangle(1, 1),
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : true,
		onCollision : function(event)
			{
			var velocityA=event.m_fixtureA.m_body.GetLinearVelocity();
			var velocityB=event.m_fixtureB.m_body.GetLinearVelocity();
			var length=Math.pow(velocityA.x-velocityB.x, 2)+Math.pow(velocityA.y-velocityB.y, 2);
			if(length>25){ this.destroyed = true; }
			},
		onProjectile : function()
			{
			//this.destroyed = true;
			},
		image :
			{
				path : "images/cloud_1x1.png",
				width : 1.17,
				height : 1.17,
				offset_x : 0,
				offset_y : -.2
			}
	};

/* ---------------------- */
/* Projectiles */
/* ---------------------- */

RA.models.projectiles = {};

RA.models.projectiles.basic =
	{
		shape : RA.physics.Circle(.5),
		density : 5,
		friction : 0.5,
		restitution : .5,
		fixed : false,
		image :
			{
				path : "images/ball.png",
				width : 1,
				height : 1,
				offset_x : 0,
				offset_y : 0
			},/*
		onLaunch : function()
			{
			var self = this;
			setTimeout(function()
				{
				RA.physics.applyImpulse(self, 0, -100);
				}, 1500);
			},*/
		onCollision : function()
			{
			//RA.physics.applyImpulse(this, 0, -100);
			}
	};

RA.models.projectiles.light =
	{
		shape : RA.physics.Circle(.5),
		density : .1,
		friction : 0.5,
		restitution : 0.9,
		fixed : false,
		image :
			{
				path : "images/ball.png",
				width : 1,
				height : 1,
				offset_x : 0,
				offset_y : 0
			},/*
		onLaunch : function()
			{
			var self = this;
			setTimeout(function()
				{
				RA.physics.applyImpulse(self, 0, -100);
				}, 1500);
			},*/
		onCollision : function()
			{
			//RA.physics.applyImpulse(this, 0, -100);
			}
	};

/* ---------------------- */
/* CHARACTERS (bad guys)  */
/* ---------------------- */

RA.models.bigbad_hatted =
	{
		shape : RA.physics.Rectangle(2, 3),
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : false,
		image :
			{
				path : "images/bigbad.png",
				width : 1.95,
				height : 3,
				offset_x : 0,
				offset_y : 0.07
			}
	};

/* This guy is very short! should his height be less than 3 rectangles in physics?  */
RA.models.bigbad =
{
	shape : RA.physics.Rectangle(2, 2.5),
	density : 1.0,
	friction : 0.5,
	restitution : 0.5,
	fixed : false,
	onDestroyed: function()
		{
		RA.goals.goalCompleted("bigbad");
		},
	onProjectile: function()
		{
		this.destroyed=true;
		},
	onCollision : function(event)
		{
		var velocityA=event.m_fixtureA.m_body.GetLinearVelocity();
		var velocityB=event.m_fixtureB.m_body.GetLinearVelocity();
		var length=Math.pow(velocityA.x-velocityB.x, 2)+Math.pow(velocityA.y-velocityB.y, 2);
		if(length>25){ this.destroyed = true; }
		},
	image :
		{
			/*path : [[1, 1], ["images/bigbad.png", "images/bigbad_hatless.png"]],*/
			path : "images/bigbad_hatless.png",
			width : 2.03,
			height : 2.6,
			offset_x : 0,
			offset_y : 0
		}
};

RA.models.bigbad_hat =
	{
	shape : RA.physics.Rectangle(1, 1),
	density : 0.5,
	friction : 0.5,
	restitution : 0.5,
	fixed : false,
	image :
		{
			path : "images/hat.png",
			width : 1.27,
			height : 1,
			offset_x : 0,
			offset_y : 0.3
		}
	};
RA.models.minion =
	{
		shape : RA.physics.Rectangle(1, 2),
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : false,
		onDestroyed: function()
			{
			RA.goals.minionRemoved();
			},
		onProjectile: function()
			{
			this.destroyed=true;
			},
		image :
			{
				path : [[3, 2], ["images/minion.png", "images/minion_alt.png"]],
				width : 1.13,
				height : 2.03,
				offset_x : 0,
				offset_y : 0.13
			}
	}

/* ---------------------- */
/* TYPE 1 Building Blocks */
/* 

RA.models.block_1x1_type1 =
	{
		shape : RA.physics.Rectangle(1, 1),
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : false,
		image :
			{
				path : "images/block_1x1_type1.png",
				width : 1.1,
				height : 1.03,
				offset_x : 0,
				offset_y : -0.03
			}
	};

RA.models.block_1x3_type1 =
	{
		shape : RA.physics.Rectangle(3, 1),
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : false,
		image :
			{
				path : "images/block_1x3_type1.png",
				width : 3.1,
				height : 1.03,
				offset_x : 0,
				offset_y : 0
			}
	};

RA.models.capital_1x3_type1 =
	{
		shape : RA.physics.Rectangle(3, 1),
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : false,
		image :
			{
				path : "images/capital_1x3_type1.png",
				width : 3.03,
				height : 1.03,
				offset_x : 0,
				offset_y : 0
			}
	};

RA.models.pillar_2x1_type1 =
	{
		shape : RA.physics.Rectangle(1, 2),
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : false,
		image :
			{
				path : "images/pillar_2x1_type1.png",
				width : 1.1,
				height : 2,
				offset_x : 0,
				offset_y : 0
			}
	};

RA.models.arch_2x3_type1 =
{
		shape : [ RA.physics.Rectangle(3, 1, 0, -.5),
				RA.physics.Rectangle(.8, 1, -1, .5),
				RA.physics.Rectangle(.8, 1, 1, .5) ],
		density : 1.0,
		friction : 0.5,
		restitution : 0.5,
		fixed : false,
		image :
			{
				path : "images/arch_2x3_type1.png",
				width : 3.12,
				height : 2.03,
				offset_x : 0,
				offset_y : .03
			}
	};

RA.models.roof_1x3_type1 =
{
		shape : RA.physics.Polygon([ [ 1.5, .5 ], [ -1.5, .5 ], [ 0, -.5 ] ],
				.5, .5),
		density : 10.0,
		friction : 0.2,
		restitution : 0.2,
		fixed : false,
		image :
			{
				path : "images/roof_1x3_type1.png",
				width : 3.13,
				height : 1.03,
				offset_x : 0,
				offset_y : 2
			}
	};

RA.models.roof_1x1_type1 =
{
		shape : RA.physics.Polygon([ [ .5, .5 ], [ -.5, .5 ], [ 0, -.5 ] ], .5,
				.5),
		density : 10.0,
		friction : 0.2,
		restitution : 0.2,
		fixed : false,
		image :
			{
				path : "images/roof_1x1_type1.png",
				width : 1.1,
				height : 0.97,
				offset_x : 0,
				offset_y : 0
			}
	};
	
---------------------- */