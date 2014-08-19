var RA=
	{
	canvas:null,
	context:null,
	animations_context:null,
	world:null,
	stats:null,
	projectile_div:null,
	projectile_size:0,
	scale : 24,
	input_state :
		{
		clicking : false
		},
	flags :
		{
		DRAW_IMAGES:true,
		DRAW_PHYSICS:false
		},
	frame_count:0,
		
		
	handlers:{}, /* filled in by handlers.js */
	levelLoader:{}, /* filled in by levelLoader.js */
	graphics:{}, /* filled in by graphics.js */
	launcher:{}, /* filled in by launcher.js */
	ui:{}, /* filled in by ui.js */
	events:{}, /* filled in by events.js */
	models:{}, /* filled in by model.js */
	audio:{}, /* filled in by audio.js */
	goals:{}, /* filled in by goals.js */
	contact_listener:{}, /* filled in by audio.js */
	physics:{} /* filled in by physics.js */
	};