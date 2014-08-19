function generateArray(element, length)
	{
	var array = [];
	for ( var i = 0; i < length; i++)
		{
		var element=element instanceof Object ? Object.create(element) : element;
		array.push(element);
		}
	return array;
	}

RA.levelLoader.load=function(width, height)
	{
	var b2Vec2 = Box2D.Common.Math.b2Vec2, b2BodyDef = Box2D.Dynamics.b2BodyDef, b2Body = Box2D.Dynamics.b2Body, b2FixtureDef = Box2D.Dynamics.b2FixtureDef, b2Fixture = Box2D.Dynamics.b2Fixture, b2World = Box2D.Dynamics.b2World, b2MassData = Box2D.Collision.Shapes.b2MassData, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape, b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
	
	var world=new b2World
		(
		new b2Vec2(0, 10) //gravity
		, false //allow sleep
		);

	RA.physics.createBoundaries(world, width, height, 1.0, 0.5, 0.5);

	var height=9;
	var width=11;
	
	// create castle outline
	var castle_top=generateArray(0, width);
	if(Math.random()>.5)
		{
		var r=Math.random();
		if(r<.2)
			{
			castle_top[Math.floor(width*(1/5))-1]=3;
			castle_top[Math.floor(width*(2/5))-1]=3;
			castle_top[Math.floor(width*(3/5))-1]=3;
			castle_top[Math.floor(width*(4/5))-1]=3;
			}
		else if(r<.6)
			{
			castle_top[Math.floor(width*(1/5))-1]=3;
			castle_top[Math.floor(width*(4/5))-1]=3;
			}
		else
			{
			castle_top[Math.floor(width*(2/5))-1]=3;
			castle_top[Math.floor(width*(3/5))-1]=3;
			}
		}
	else
		{
		if(Math.random()<.4)
			{
			castle_top[0]=3;
			castle_top[Math.floor(width*(1/4))-1]=3;
			castle_top[Math.floor(width*(1/2))-1]=3;
			castle_top[Math.floor(width*(3/4))-1]=3;
			castle_top[width-1]=3;
			}
		else
			{
			if(Math.random()<.4)
				{
				castle_top[0]=3;
				castle_top[Math.floor(width*(1/2))-1]=3;
				castle_top[width-1]=3;
				}
			else
				{
				castle_top[Math.floor(width*(1/4))-1]=3;
				castle_top[Math.floor(width*(1/2))-1]=3;
				castle_top[Math.floor(width*(3/4))-1]=3;
				}
			}
		}
	
	/*for(index in castle_top)
		{
		if(castle_top[index])
			{
			RA.physics.add(world, RA.models.line, index*4+4, 5);
			}
		}*/
	//var castle=[[castle_top, generateArray({}, width)]];
	var castle=[[castle_top, generateArray({}, width)]];
	var floor_height=[];
	for(var i=0; i<height;i++)
		{
		floor_height[i]=height-1-Math.floor(Math.random()*3);
		}
	
	//var castle=[[[1, 0, 0, 0, 1, 0, 0, 0, 1], []]];
	for(var i=0;i<height-1;i++)
		{
		castle.push([generateArray(0, width), generateArray({}, width)]);
		}
	
	var chooseIsland=function(percent){ return Math.random()<percent ? 2 : 1; }
	for(var i=1;i<height;i++)
		{
		if(i>=floor_height[i])
			{
			for(var j=0;j<width;j++)
				{
				if(castle[i-1][0][j]==1 || castle[i-1][0][j]==3)
					{
					// always an island
					castle[i][0][j]=2;
					}
				}
			}
		else
			{
			if(castle[i-1][0][0]==1 || castle[i-1][0][0]==3)
				{
				for(var k=0;k<width && (castle[i-1][0][k]==1 || castle[i-1][0][k]==3);k+=2)
					{
					// choose island
					castle[i][0][k]=chooseIsland(.2);
					}
				}
			if( (castle[i-1][0][8]==1 || castle[i-1][0][8]==3) && castle[i][0][8]!=1)
				{
				for(var k=8;k>=0 && (castle[i-1][0][k]==1 || castle[i-1][0][k]==3);k-=2)
					{
					// choose island
					castle[i][0][k]=chooseIsland(.2);
					}
				}
			//console.log(castle[i-1][0]+" -> "+castle[i][0]);
			for(var j=0;j<width;j++)
				{
				if( (castle[i-1][0][j]==1 || castle[i-1][0][j]==3) && castle[i][0][j]==0)
					{
					if( (castle[i][0][j-2]!=0 && castle[i][0][j-2]!=undefined) || (castle[i][0][j+2]!=0 && castle[i][0][j+2]!=undefined) )
						{
						// choose island
						castle[i][0][j]=chooseIsland(.2);
						}
					else if( (castle[i][0][j-1]!=0 && castle[i][0][j-1]!=undefined) || (castle[i][0][j+1]!=0 && castle[i][0][j+1]!=undefined) )
						{
						// choose island
						castle[i][0][j+1]=castle[i][0][j+1]==0 ? chooseIsland(.2) : castle[i][0][j+1];
						castle[i][0][j-1]=castle[i][0][j-1]==0 ? chooseIsland(.2) : castle[i][0][j-1];
						}
					else
						{
						//choose pillar
						if(Math.random()<.5)
							{
							// choose island
							castle[i][0][j+1]=chooseIsland(.2);
							castle[i][0][j-1]=chooseIsland(.2);
							}
						else
							{
							// choose island
							castle[i][0][j]=chooseIsland(.2);
							}
						}
					}
				else if(castle[i-1][0][j]==0 && (castle[i-1][0][j-1]==0 || castle[i-1][0][j-1]==undefined) && (castle[i-1][0][j+1]==0 || castle[i-1][0][j+1]==undefined) &&
						(castle[i][0][j-1]==0 || castle[i][0][j-1]==undefined) && (castle[i][0][j+1]==0 || castle[i][0][j+1]==undefined) )
					{
					// choose exist
					if(Math.random()<.05)
						{
						castle[i][0][j]=3;
						}
					}
				}
			}
		}
	

	// Here we should go through every roof.
	// If there are less than 4 (<4), regenerate.
	// If there are more, choose 4 of them to be the big bad and minion spots.

	rooves=[];
	for(var i=0;i<height;i++)
		{
		for(var index=0;index<width;index++)
			{
			if(castle[i][0][index]==3)
				{
				rooves.push({x:index, y:i});
				}
			}
		}
	var bbi;
	if(false)//rooves.length<4)
		{
		console.log("LEVEL DOESN'T HAVE ENOUGH ROOVES!");
		}
	else
		{
		var max_rooves=Math.min(rooves.length, 4);
		var bbi_num=Math.floor(Math.random()*max_rooves);
		for(var i=0;i<max_rooves;i++)
			{
			var index=Math.floor(Math.random()*rooves.length);
			castle[rooves[index].y][0][rooves[index].x]=5;
			if(bbi_num==i){bbi=rooves[index];}
			rooves.splice(index, 1);
			}
		}
	
	
	for(var i=0;i<height;i++)
		{
		for(var index=0;index<width;index++)
			{
			// 001, 010, and 001 can be supported by themselves or 111
			// 001 and 100 can be supported by 101
			// 101 can be supported by 101 or 111
			// 111 can be supported by 101
			function getSupport(string)
				{
				if(string=="001"){ return ["001", "111"]; }
				else if(string=="100"){ return ["100", "111"]; }
				else if(string=="010"){ return ["111"]; }
				else if(string=="101"){ return ["101", "111"]; }
				else if(string=="111"){ return ["101"]; }
				else if(string=="404"){ return ["404"]; }
				console.log("No support for "+string);
				}

			var anything=["001", "100", "101", "010", "111"];
			
			var anything_roof=["003", "300", "303", "030", "333"];
			
			var randomElement=function(list)
				{
				return list[Math.floor(Math.random()*.9999*list.length)];
				}
			
			if(i!=0)
				{
				var supporting;
				if(castle[i-1][0][index]==1 || castle[i-1][0][index]==3 || castle[i-1][0][index]==5)
					{
					supporting=castle[i-1][1][index].bottom;
					}
				else
					{
					var left=(castle[i-1][0][index-1]==5 || castle[i-1][0][index-1]==3 || castle[i-1][0][index-1]==1) ? "1" : "0";
					var right=(castle[i-1][0][index+1]==5 || castle[i-1][0][index+1]==3 || castle[i-1][0][index+1]==1) ? "1" : "0";
					supporting=left+"0"+right;
					if(supporting=="101"){ supporting="404"; }
					}
				}
			
			if(i!=height-1){ var supported=castle[i+1][0][index]==1 || castle[i+1][0][index]==2; }
			
			if(castle[i][0][index]==0)
				{
				castle[i][1][index].top="000";
				castle[i][1][index].bottom="000";
				}
			else if(castle[i][0][index]==5)
				{
				// if the top is the big bad, it's "555"
				// if it's a minion, it's 500, 050, or 005
				
				if(i==bbi.y && index==bbi.x)
					{
					castle[i][1][index].top="555";
					}
				else
					{
					castle[i][1][index].top=randomElement(["500", "050", "005"]);
					}
				
				if(supported)
					{
					// if the top is 111, the bottom is 101 or 010
					// if the top is 001 or 100, the bottom is 001, 100, 101, or 111
					// if the top is 010, the bottom is 010 or 111
					// if the top is 101, the bottom is 101 or 111 or 010
					if(castle[i][1][index].top=="555")
						{
						castle[i][1][index].bottom="101";
						}
					else if(castle[i][1][index].top=="050")
						{
						castle[i][1][index].bottom=randomElement(["111", "010"]);
						}
					else if(castle[i][1][index].top=="005")
						{
						castle[i][1][index].bottom=randomElement(["001", "111", "101"]);
						}
					else if(castle[i][1][index].top=="500")
						{
						castle[i][1][index].bottom=randomElement(["100", "111", "101"]);
						}
					}
				else
					{
					// the bottom can be 101 or 111
					
					
					// if the top is 010, then the bottom is 111
					// else, the bottom can be either 101 or 111
					if(castle[i][1][index].top=="050")
						{
						castle[i][1][index].bottom="111";
						}
					else
						{
						castle[i][1][index].bottom=randomElement(["101", "111"]);
						}
					}
				}
			else if(castle[i][0][index]==3)
				{
				if(supported)
					{
					// the top can be anything
					castle[i][1][index].top=randomElement(anything_roof);

					// if the top is 111, the bottom is 101 or 010
					// if the top is 001 or 100, the bottom is 001, 100, 101, or 111
					// if the top is 010, the bottom is 010 or 111
					// if the top is 101, the bottom is 101 or 111 or 010
					if(castle[i][1][index].top=="333")
						{
						castle[i][1][index].bottom="101";
						}
					else if(castle[i][1][index].top=="030")
						{
						castle[i][1][index].bottom=randomElement(["111", "010"]);
						}
					else if(castle[i][1][index].top=="303")
						{
						castle[i][1][index].bottom=randomElement(["101", "111", "010"]);
						}
					else if(castle[i][1][index].top=="003")
						{
						castle[i][1][index].bottom=randomElement(["001", "111", "101"]);
						}
					else if(castle[i][1][index].top=="300")
						{
						castle[i][1][index].bottom=randomElement(["100", "111", "101"]);
						}
					}
				else
					{
					// the bottom can be 101 or 111
					castle[i][1][index].bottom=randomElement(["101", "111"]);
					
					// if 101, the top can be 101 or 111 or 100 or 001
					// if 111, the top can be anything
					if(castle[i][1][index].bottom=="111")
						{
						castle[i][1][index].top=randomElement(anything_roof);
						}
					else
						{
						castle[i][1][index].top=randomElement(["300", "003", "333", "303"]);
						}
					}
				}
			else if(castle[i][0][index]==2)
				{
				// the top can be anything in getSupport(supporting)
				castle[i][1][index].top=randomElement(getSupport(supporting));
				
				// if the top is 001 or 100, the bottom is 002 or 200
				// if the top is 111, the bottom is 202
				// if the top is 010, the bottom can be 020 or 222
				// if the top is 101, the bottom can be 202 or 222

				if(castle[i][1][index].top=="001")
					{
					castle[i][1][index].bottom="002";
					}
				else if(castle[i][1][index].top=="100")
					{
					castle[i][1][index].bottom="200";
					}
				else if(castle[i][1][index].top=="111")
					{
					castle[i][1][index].bottom="202";
					}
				else if(castle[i][1][index].top=="010")
					{
					castle[i][1][index].bottom=randomElement(["222", "020"]);
					}
				else if(castle[i][1][index].top=="404")
					{
					castle[i][1][index].bottom="020";
					}
				else if(castle[i][1][index].top=="101")
					{
					castle[i][1][index].bottom=randomElement(["222", "202"]);
					}
				}
			else if(castle[i][0][index]==1)
				{
				// the top can be anything in getSupport(supporting)
				castle[i][1][index].top=randomElement(getSupport(supporting));

				// if the top is 001 or 100, the bottom is 001, 100, 101, or 111
				// if the top is 010, the bottom is 010 or 111
				// if the top is 101, the bottom is 101 or 111 or 010
				// if the top is 111, the bottom is 101 or 010
				if(castle[i][1][index].top=="111")
					{
					castle[i][1][index].bottom="101";
					}
				else if(castle[i][1][index].top=="010")
					{
					if(supported)
						{
						castle[i][1][index].bottom=randomElement(["111", "010"]);
						}
					else
						{
						castle[i][1][index].bottom="111";
						}
					}
				else if(castle[i][1][index].top=="101")
					{
					castle[i][1][index].bottom=randomElement(["101", "111"]);
					}
				else if(castle[i][1][index].top=="404")
					{
					if(supported)
						{
						castle[i][1][index].bottom="010";
						}
					else
						{
						castle[i][1][index].bottom="101";
						}
					}
				else if(castle[i][1][index].top=="001")
					{
					castle[i][1][index].bottom=randomElement(["001", "111", "101"]);
					}
				else if(castle[i][1][index].top=="100")
					{
					castle[i][1][index].bottom=randomElement(["100", "111", "101"]);
					}
				}
			}
		}
	
	var generateBlock=function(x, y, top_string, bottom_string, type)
		{
		// 000 on top and bottom means an empty block
		
		// matching singles (001, 010, 001) on top and bottom means a skinny tower
		
		// 010 on bottom and 101 or 111 on top means a reverse arch
		// 101 on bottom and 101 on top means an arch in the middle
		// 101 on bottom and 111 on top means two blocks on the bottom and an arch on top
		// 111 on bottom means a wide block
		
		// 111 on top means a wide block
		// a 1 in any other position on top means a block
		
		// 333 on top means a wide triangle
		// any other 3 on top always means a ball (small triangle)
		
		// 222 on bottom means a wide island
		// any other 2 on bottom means a single island in that position
		
		//console.log(top_string+" t "+bottom_string+" b "+type);
		
		if(type==0)
			{
			return;
			}
		else if(type==2)
			{
			if(bottom_string=="111")
				{
				RA.physics.add(world, RA.models.island_2x3, x, y);
				}
			else if(bottom_string=="100")
				{
				RA.physics.add(world, (Math.random()<.75 ? RA.models.cloud_1x1 : RA.models.island_1x1), x-1, y);
				}
			else if(bottom_string=="001")
				{
				RA.physics.add(world, (Math.random()<.75 ? RA.models.cloud_1x1 : RA.models.island_1x1), x+1, y);
				}
			else if(bottom_string=="010")
				{
				RA.physics.add(world, (Math.random()<.75 ? RA.models.cloud_1x1 : RA.models.island_1x1), x, y);
				}
			else if(bottom_string=="101")
				{
				if(top_string=="111")
					{
					RA.physics.add(world, (Math.random()<.75 ? RA.models.cloud_1x1 : RA.models.island_1x1), x-1, y+1);
					RA.physics.add(world, (Math.random()<.75 ? RA.models.cloud_1x1 : RA.models.island_1x1), x+1, y+1);
					}
				else
					{
					RA.physics.add(world, (Math.random()<.75 ? RA.models.cloud_1x1 : RA.models.island_1x1), x-1, y);
					RA.physics.add(world, (Math.random()<.75 ? RA.models.cloud_1x1 : RA.models.island_1x1), x+1, y);
					}
				}
			}
		else if(type==3)
			{
			if(top_string=="111")
				{
				RA.physics.add(world, RA.models.roof_1x3_type2, x, y-1);
				if(bottom_string=="101")
					{
					RA.physics.add(world, RA.models.block_1x1_type2, x-1, y);
					RA.physics.add(world, RA.models.block_1x1_type2, x+1, y);
					}
				}
			else if(top_string=="100")
				{
				RA.physics.add(world, RA.models.roof_1x1_type2, x-1, y-1);
				}
			else if(top_string=="001")
				{
				RA.physics.add(world, RA.models.roof_1x1_type2, x+1, y-1);
				}
			else if(top_string=="010")
				{
				RA.physics.add(world, RA.models.roof_1x1_type2, x, y-1);
				}
			else if(top_string=="101")
				{
				RA.physics.add(world, RA.models.roof_1x1_type2, x-1, y-1);
				RA.physics.add(world, RA.models.roof_1x1_type2, x+1, y-1);
				}
			}
		else if(type==5)
			{
			if(top_string=="555")
				{
				RA.physics.add(world, RA.models.bigbad_hat, x, y-2);
				RA.physics.add(world, RA.models.bigbad, x, y-1);
				RA.physics.add(world, RA.models.block_1x3_type2, x, y+1);
				}
			else if(top_string=="500")
				{
				RA.goals.minion_count++;
				RA.physics.add(world, RA.models.minion, x-1, y-1);
				}
			else if(top_string=="005")
				{
				RA.goals.minion_count++;
				RA.physics.add(world, RA.models.minion, x+1, y-1);
				}
			else if(top_string=="050")
				{
				RA.goals.minion_count++;
				RA.physics.add(world, RA.models.minion, x, y-1);
				}
			}

		if(type!=3 && type!=5)
			{
			// generate a top
			if(top_string=="111" && bottom_string=="101")
				{ // arch on top
				RA.physics.add(world, RA.models.arch_2x3_type2, x, y-.5);
				}
			else if(top_string=="100")
				{
				RA.physics.add(world, RA.models.block_1x1_type2, x-1, y-1);
				}
			else if(top_string=="010")
				{
				RA.physics.add(world, RA.models.block_1x1_type2, x, y-1);
				}
			else if(top_string=="001")
				{
				RA.physics.add(world, RA.models.block_1x1_type2, x+1, y-1);
				}
			else if(top_string=="404" && bottom_string=="010")
				{
				RA.physics.add(world, RA.models.capital_1x3_type2, x, y-1);
				}
			else if(top_string=="404" && bottom_string=="404")
				{
				RA.physics.add(world, RA.models.block_1x1_type2, x-1, y-1);
				RA.physics.add(world, RA.models.block_1x1_type2, x+1, y-1);
				}
			else if(top_string=="101")
				{
				RA.physics.add(world, RA.models.block_1x1_type2, x-1, y-1);
				RA.physics.add(world, RA.models.block_1x1_type2, x+1, y-1);
				}
			else
				{
				RA.physics.add(world, RA.models.block_1x3_type2, x, y-1);
				}
			}
		
		if(type!=2 && top_string!="555")
			{
			// generate a bottom
			if(top_string=="100" && bottom_string=="100")
				{
				RA.physics.add(world, RA.models.pillar_2x1_type2, x-1, y+.5);
				}
			else if(top_string=="010" && bottom_string=="010")
				{
				RA.physics.add(world, RA.models.pillar_2x1_type2, x, y+.5);
				}
			else if(top_string=="001" && bottom_string=="001")
				{
				RA.physics.add(world, RA.models.pillar_2x1_type2, x+1, y+.5);
				}
			else if(top_string=="100" && bottom_string=="111")
				{
				RA.physics.add(world, RA.models.block_1x1_type2, x, y);
				RA.physics.add(world, RA.models.block_1x1_type2, x-1, y);
				RA.physics.add(world, RA.models.block_1x3_type2, x, y+1);
				}
			else if(top_string=="001" && bottom_string=="111")
				{
				RA.physics.add(world, RA.models.block_1x1_type2, x, y);
				RA.physics.add(world, RA.models.block_1x1_type2, x+1, y);
				RA.physics.add(world, RA.models.block_1x3_type2, x, y+1);
				}
			else if(top_string=="010" && bottom_string=="111")
				{
				RA.physics.add(world, RA.models.block_1x1_type2, x, y);
				RA.physics.add(world, RA.models.block_1x3_type2, x, y+1);
				}
			else if(top_string=="101" && bottom_string=="101")
				{ // arch on bottom
				RA.physics.add(world, RA.models.arch_2x3_type2, x, y+.5);
				}
			else if(top_string=="404" && bottom_string=="010")
				{
				RA.physics.add(world, RA.models.pillar_2x1_type2, x, y+.5);
				}
			else if(top_string=="404" && bottom_string=="101")
				{
				RA.physics.add(world, RA.models.arch_2x3_type2, x, y+.5);
				}
			else if(top_string=="111" && bottom_string=="101")
				{ // arch on top
				RA.physics.add(world, RA.models.block_1x1_type2, x-1, y+1);
				RA.physics.add(world, RA.models.block_1x1_type2, x+1, y+1);
				}
			else if(bottom_string=="101")
				{
				if(top_string=="100")
					{
					RA.physics.add(world, RA.models.roof_1x1_type2, x+1, y);
					RA.physics.add(world, RA.models.block_1x1_type2, x+1, y+1);
					RA.physics.add(world, RA.models.pillar_2x1_type2, x-1, y+.5);
					}
				else if(top_string=="001")
					{
					RA.physics.add(world, RA.models.pillar_2x1_type2, x+1, y+.5);
					RA.physics.add(world, RA.models.roof_1x1_type2, x-1, y);
					RA.physics.add(world, RA.models.block_1x1_type2, x-1, y+1);
					}
				else
					{
					if(Math.random()>.5)
						{
						RA.physics.add(world, RA.models.block_1x1_type2, x-1, y);
						RA.physics.add(world, RA.models.block_1x1_type2, x-1, y+1);
						}
					else
						{
						RA.physics.add(world, RA.models.pillar_2x1_type2, x-1, y+.5);
						}
					if(Math.random()>.5)
						{
						RA.physics.add(world, RA.models.block_1x1_type2, x+1, y);
						RA.physics.add(world, RA.models.block_1x1_type2, x+1, y+1);
						}
					else
						{
						RA.physics.add(world, RA.models.pillar_2x1_type2, x+1, y+.5);
						}
					}
				}
			else
				{
				RA.physics.add(world, RA.models.block_1x1_type2, x-1, y);
				RA.physics.add(world, RA.models.block_1x1_type2, x+1, y);
				RA.physics.add(world, RA.models.block_1x3_type2, x, y+1);
				}
			}
		}
	
	for(var i=0;i<height;i++)
		{
		for(var index=0;index<width;index++)
			{
			generateBlock(index*2+4, (i+1)*3+2, castle[i][1][index].top.replace(/3/g, "1"), castle[i][1][index].bottom.replace(/2/g, "1"), castle[i][0][index])
			}
		}
	
	RA.events.setupEvents(world);
	
	world.SetContactListener(new RA.contact_listener.ContactListener());
	
	return world;
	}
