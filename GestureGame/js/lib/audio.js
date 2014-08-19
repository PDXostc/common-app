audio=
	{
	audioSupport:(typeof webkitAudioContext != "undefined"),
	context : new webkitAudioContext(),
	buffers:[],
	out: null,
	files:['win.wav', 'bip.wav', 'nitro.wav', 'nitrospawn.wav', 'nitroget.wav', 'lap.wav', 'air.wav', 'land.wav', 'pause.wav', 'hitcar.wav', 'hitwall.wav', 'start.wav', 'rev.wav']
	};

audio.out=audio.context.createGainNode();
audio.out.gain.value=.25;
audio.out.connect(audio.context.destination);

audio.loadSounds=function()
	{
	for(var i=0;i<audio.files.length;++i)
		{
		audio.loadSound(audio.files[i]);
		}
	};

audio.loadSound=function(filename)
	{
		var request = new XMLHttpRequest();
		request.open('GET', "sounds/"+filename, true);
		request.responseType = 'arraybuffer';
	
		// Decode asynchronously
		request.onload = function() {
			console.log('loaded '+filename);
			audio.context.decodeAudioData(request.response, function(buffer) {
			audio.buffers[filename] = buffer;
			console.log('decoded '+filename);
			});
		};
		request.send();
	};

  // Function to play one instance of the
 // sound from the buffer.
audio.playSound=function(filename)
	{
	if(constants.mute)
		{
		return;
		}
	
    if (!audio.buffers[filename])
    	{
    	return; // not loaded yet
    	}

    // Buffer sources are throwaway objects
    var source = audio.context.createBufferSource();
    source.buffer = audio.buffers[filename];
    source.connect(audio.out);
    source.noteOn(0);
	}