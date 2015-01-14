/* Copyright (C) Jaguar Land Rover - All Rights Reserved
*
* Proprietary and confidential
* Unauthorized copying of this file, via any medium, is strictly prohibited
*
* THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY 
* KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
* PARTICULAR PURPOSE.
*
* Filename:	 			header.txt
* Version:              1.0
* Date:                 September 2014
* Project:              Media Manager
* Contributors:         XXXXXXX
*                       xxxxxxx
*
* Incoming Code:        GStreamer 0.93, <link>
*
*/


var options = [];
var songs = [];

//Containers where addAll and PlayAll should be shown
var addAllAllowed = ["album"]; //,"person","genre"

//Containers that should not be shown on the root level.
var rootHide = ["Genres","/"];

var Indexer;
var Browser;
var Player;
var rootLevelItems;
var options;
var songs;
var hold;


function mminit(){
	console.log("media manager init");
	Indexer = new MediaManager.Indexer();
	Browser = new MediaManager.Browser();
	Player = new MediaManager.Player();
	playlistCookie = "/706c61796c69737473";
	activePlayQueueIndex = 0;
	playQueue = [];

    $("#libraryCloseSubPanelButton").data("breadcrumb_trail",JSON.stringify(["root"]));


	setRootContainer();
    //generatePlaylistElements();
    generatePlaylistElementsPromise({}); 
    updateRepeatButton("REPEAT");

    MediaManager.registerNotificationHandler (function (method, params) {
        switch (method) {
            case "CurrentTrack":
                populateCurrentlyPlaying($($("#media-carousel-content li")[params]).data());
            break;
            case "PlaybackStatus":
                updatePlayButton(params);
            break;
            case "Shuffle":
                updateShuffleButton(params);
            break;
            case "Repeat":
                updateRepeatButton(params);
            break;            
            default:
                console.log(method,params);
            break;
        }
    });


    //setup playback progress.
    setInterval(function(){updatePlayback()},1000);
}

function setRootContainer(){
	
	manager = {"DisplayName":"Root"};
	Browser.discoverMediaManagers(function(obj,err){ 
		manager.Path = obj[0];

        var rootVal = JSON.stringify([manager.Path]);

        $("#libraryCloseSubPanelButton").data("root",rootVal);
        $("#libraryCloseSubPanelButton").data("nested",rootVal);

        //getChildren(manager.Path);
        generateRootListing(manager); 
	});
}

function generateRootListing(path){
    $.when(getRootItems(path))
        .then(function(res){ 
            console.log("rootItems resolved");
            return addGenresForRoot(res); })
        .then(function(res2){ 
            console.log("addGenresForRoot resolved");
            listItems(res2);
        });
}


function getRootItems(pathObj){
    var rootPromise = new $.Deferred();

    Browser.listContainers(pathObj,0,100,["DisplayName","Path","Type","TypeEx"],
        function(obj,err){
            rootPromise.resolve(obj);
    });

    return rootPromise;
}

//Requires root list input
function addGenresForRoot(rootItemsList){
    var genresPromise = new $.Deferred();
    for(container in rootItemsList){
        if(rootItemsList[container].DisplayName == 'Genres'){

            Browser.listContainers(rootItemsList[container],0,100,["*"],
                function(obj,err){
                    for(cont in obj){
                        obj[cont].TypeEx = "genre";
                        rootItemsList.push(obj[cont]);
                    }

                    genresPromise.resolve(rootItemsList);
                });
        }
    }
    return genresPromise;
}




function listItems(itemSet){
	$(".musicContentListedItems").empty();
	var t = document.querySelector("#media-content-list");	
    var trail = JSON.parse($("#libraryCloseSubPanelButton").data("breadcrumb_trail"));

    //var showImages = (addAllAllowed.indexOf(trail[trail.length-1]) >= 0)? true: false;



	for(item in itemSet){

        //console.log(itemSet[item].TypeEx);

        if(itemSet[item].TypeEx.indexOf(".") != -1){
            var typeEx = itemSet[item].TypeEx.split(".")[1];    
        }else{
            var typeEx = itemSet[item].TypeEx;
        }
        

		t.content.querySelector(".artist-track-title").innerHTML = itemSet[item].DisplayName;
		//t.content.querySelector(".content-listing").setAttribute("data-item_path",itemSet[item].Path);
		
		var clone = document.importNode(t.content,true);

        clone.querySelector(".content-listing").setAttribute("data-item_typeex",typeEx);

        if(itemSet[item].Type == "container"){
        
            if(rootHide.indexOf(itemSet[item].DisplayName) != -1){
                continue;
            }

            if(addAllAllowed.indexOf(typeEx) == -1){ //!showImages
                $(clone.querySelector(".content-listing")).addClass("no-images");    
            }
            
            clone.querySelector(".content-listing").setAttribute("data-item_path",itemSet[item].Path);
/*
            var artwork = getAlbumImage(itemSet[item].Artist);
            clone.querySelector(".content-listing img.albumArt").setAttribute("src",artwork);
*/            
            var nested = $("#libraryCloseSubPanelButton").data("nested");
            var root = $("#libraryCloseSubPanelButton").data("root");
            

            if(root == nested){
                clone.querySelector(".content-listing img.albumArt").style.visibility = "hidden";
            }else{
                var artwork = getAlbumImage(itemSet[item].Artist);
                clone.querySelector(".content-listing img.albumArt").setAttribute("src",artwork);                
            }
            
            clone.querySelector(".content-listing").addEventListener("tap",function(ev){
                console.log("displayChildren");
                displayChildren(ev);
            });            

        }else if(itemSet[item].Type == "music"){

            clone.querySelector(".content-listing").setAttribute("data-item_path",itemSet[item].Path);
            clone.querySelector(".content-listing").setAttribute("data-item_url",itemSet[item]["Resources"][1]["URL"]);
            clone.querySelector(".content-listing").setAttribute("data-artist_name",itemSet[item].Artist);
            clone.querySelector(".content-listing").setAttribute("data-song_title",itemSet[item].DisplayName);
            clone.querySelector(".content-listing").setAttribute("data-artwork",itemSet[item].AlbumArtURL);
            clone.querySelector(".content-listing").setAttribute("data-song_duration",itemSet[item].Duration);

            var artwork = getAlbumImage(itemSet[item].AlbumArtURL);
            clone.querySelector(".content-listing img.albumArt").setAttribute("src",artwork);
        }

        clone.querySelector(".play-now-btn").addEventListener("tap",function(ev){addPlayPromiseCall(ev)});
        clone.querySelector(".add-to-playlist-btn").addEventListener("tap",function(ev){addPlayPromiseCall(ev)}); //queueItemsFromElement(ev)
        clone.querySelector(".content-listing").setAttribute("data-item_type",itemSet[item].Type);

		$(".musicContentListedItems").append(clone);
        libraryScroll.refresh();
	}
}

function addPlayPromiseCall(ev){
    var song_data = $(ev.target).closest("li.content-listing").data();
    song_data.callingElement = ev.target;

    //A variable to pass down on whether or not we should empty and play this.
    song_data.playNow = ($(ev.target).hasClass("play-now-btn"))? true:false;

    /*
    //show user a note of an item added to queue
    $(event.target).click(function() {
        if (!$(this).hasClass("play-now-btn")) {
            $(this).addClass("hideMe");
            $(this).siblings(".addedNote").removeClass("hideMe");
        }
    });
    */

    $.when(cleanQueuePromise(song_data))
    .then(function(res){return queueItemsFromElement(res)})
    .then(function(res){return generatePlaylistElementsPromise(res)})
    .then(function(input_data){
            if(input_data.playNow == true){

                Player.next(function(msg, error) {
                    play();
                    if (error)
                        logError("Error going next: " + error.message);
                });
            }             
        });

    //event.stopPropogation throws an undefined error for some reason, using this instead.
    ev.cancelBubble = true;
}

function cleanQueuePromise(data){
    myPromise = new $.Deferred();
    if(data.playNow == true){
        Player.emptyPlayQueue(function(r){
            myPromise.resolve(data);
        });
    }else{
        myPromise.resolve(data);
    }
    return myPromise;
}


function queueItemsFromElement(song_data){

    //create a new deferred object
    queuePromise = new $.Deferred();

    if(song_data.item_type =="container"){
        Browser.listItems({"Path":song_data.item_path},0,1000,["*"],function(r,e){
            for(song in r){
                Player.enqueueUri(r[song].Path,function(x,err){
                    //if this is the last item, resolve the deferred object
                    if(song == r.length-1){
                        queuePromise.resolve(song_data);
                    }
                });
            }
        });
    }else{
        Player.enqueueUri(song_data.item_path,function(r,e){
            $(song_data.callingElement).addClass("hideMe");
            $(song_data.callingElement).siblings(".addedNote").removeClass("hideMe");

            queuePromise.resolve(song_data);
        });        
    }

    
    return queuePromise;
}

function generatePlaylistElementsPromise(input_data){
    playlistElementsOb = new $.Deferred();

    Player.getCurrentPlayQueue(function(r,e){
        $("#media-carousel-content").empty();
        for(song in r){
            song_object = {
                "item_url":r[song].URLs[0],
                "item_path":r[song].Path,
                "artwork":r[song].AlbumArtURL,
                "song_title":r[song].DisplayName,
                "artist_name":r[song].Artist,
                "album_title":r[song].Album
            }

            addElementToCarousel(song_object);
        }
        playlistElementsOb.resolve(input_data);
        coverScroll.refresh();
    }); 
    return playlistElementsOb;
}

//Returns a local webserver 
function getAlbumImage(filepath){
    if(filepath != undefined && filepath != "undefined"){
        var fragment = filepath.substring(filepath.lastIndexOf("/"),filepath.length);
        return "http://127.0.0.1:8000"+fragment;    
    }else{
        return "images/cover_album.png";
    }
}


function addElementToCarousel(itemData){
        var t = document.querySelector("#carousel-listed-items"); //carousel-items-template
        
        artwork = getAlbumImage(itemData.artwork);

        var clone = document.importNode(t.content,true);
        clone.querySelector("li").setAttribute("data-item_url",itemData.item_url);
        clone.querySelector("li").setAttribute("data-song_title",itemData.song_title);
        clone.querySelector("li").setAttribute("data-artist_name",itemData.artist_name);
        clone.querySelector("li").setAttribute("data-artwork",itemData.artwork);
        clone.querySelector("li").setAttribute("data-album_title",itemData.album_title);
        clone.querySelector("li").setAttribute("data-song_duration",itemData.Duration);

        clone.querySelector("img").setAttribute("src",artwork);
        clone.querySelector(".song-title-carousel").innerHTML = itemData.song_title;
        clone.querySelector(".artist-name-carousel").innerHTML = itemData.artist_name;
        clone.querySelector(".song-title-carousel").setAttribute("data-song_title",itemData.song_title);
        clone.querySelector(".artist-name-carousel").setAttribute("data-artist_name",itemData.artist_name);

        $("#media-carousel-content").append(clone);
        //var playlistLength = $("#media-carousel-content li").length;
        //$("#media-carousel-content").css("width",playlistLength*200);
        coverScroll.refresh();
}

//Populates the "Now playing section of the application"
function populateCurrentlyPlaying(song_data){

    $("#current-artist-name").html(song_data.artist_name);
    $("#current-album-title").html(song_data.album_title);
    $("#current-song-title").html(song_data.song_title);

    $("#thumbnail").attr("src",getAlbumImage(song_data.artwork));
    
    setTimeout(function(){
        Player.getDuration(function(r,e){
            $("#songProgress").data("track_length",r);
        });
    },700);
    
}


//searchAndDisplay
function searchAndDisplay(searchTerm){
    console.log("searchAndDisplay");
    var lastContainer = JSON.parse($("#libraryCloseSubPanelButton").data("nested"));
    //var searchPath = lastContainer[lastContainer.length-1];
    var searchPath = lastContainer[0];

    var searchCategories = ["Artist","Artists","Album","Albums"];
    var set = JSON.parse($("#libraryCloseSubPanelButton").data("breadcrumb_trail"));

    var c = set.length+1;
    var cat = -1;
    while(c >= 0){
        categoryIndex = searchCategories.indexOf(set[c]);
        if(categoryIndex > -1){
            cat = categoryIndex;
            break;
        }
        c--;
    }


  /*  
    var i = set.length+1;
    while(i >= 0){

        i--;
    }

    var cat = searchCategories.indexOf(searchCategories);
    
    searchString = "";
    */
    console.log(cat);

    switch(cat){
        case 0:
        case 1:
            searchString = "Artist contains \""+searchTerm+"\"";                
        break;
        case 2:
        case 3:
            searchString = "Album contains \""+searchTerm+"\"";    
        break;        
        case -1:
            searchString = "DisplayName contains \""+searchTerm+"\"";    
        break;
    }    

	console.log("Path:"+searchPath+"String:"+searchString);
    Browser.searchObjects({"Path":searchPath},0,1000,["*"],searchString,function(re,err){
        if(re.length > 0){
            listItems(re);
        }else{
            console.log("no items found");
            console.log(err);
        }
    });
}


//Adds the supplied path to the stack stored in the back button for navigation.
function pushPath(path){
    var nested = JSON.parse($("#libraryCloseSubPanelButton").data("nested"));
    nested.push(path);
    $("#libraryCloseSubPanelButton").data("nested",JSON.stringify(nested));
    return nested;
}

//Removes (and returns the )
function popPath(){
    var nested = JSON.parse($("#libraryCloseSubPanelButton").data("nested"));
    var last = nested.pop();
    $("#libraryCloseSubPanelButton").data("nested",JSON.stringify(nested));
    return nested[nested.length-1];
}


//Adds an item to the Breadcrumb, which we'll use for filtering
function pushCrumb(crumb){
    var trail = JSON.parse($("#libraryCloseSubPanelButton").data("breadcrumb_trail"));
    trail.push(crumb);
    $("#libraryCloseSubPanelButton").data("breadcrumb_trail",JSON.stringify(trail));

    return trail;
}

//Removes the last item from the Breadcrumb
function popCrumb(){
   var trail = JSON.parse($("#libraryCloseSubPanelButton").data("breadcrumb_trail"));
    var lastCrumb = trail.pop();
    $("#libraryCloseSubPanelButton").data("breadcrumb_trail",JSON.stringify(trail));
    
    return trail[trail.length-1];
}


//The event handler call for getChildren()
function displayChildren(tapEvent){
    var path = $(tapEvent.target).closest("li.content-listing").data("item_path");
    var crumbName = $(tapEvent.target).closest("li.content-listing").children("p").html();

    pushCrumb(crumbName);
    getChildren(path);
}

function getChildren(path){

	Browser.listContainers({"Path":path},0,1000,['DisplayName','Type','Path','AlbumArtURL','TypeEx'],function(obj,err){
		if(obj.length > 0){
            var nestedPath = pushPath(path); //pushes path to items
			listItems(obj);
		}else{
            
            Browser.listItems({"Path":path},0,1000,['*'],function(tracks,err){
                //var nestedPath = pushPath(path); //pushes path to items
                
                if(tracks.length > 0){
                    var nestedPath = pushPath(path); //pushes path to items
                    listItems(tracks);
                }
            });
        }
	});
}


function goToPreviousList(){
    //var nested = $("#libraryCloseSubPanelButton").data("nested");
    var path = popPath();
    if(path == undefined){
        $('#musicLibrary').removeClass('toShow');
        //$(".musicContentListedItems").empty();
    }else{
        popCrumb();

        if(path == JSON.parse($("#libraryCloseSubPanelButton").data("nested"))[0]){
            generateRootListing({"Path":path});
        }else{
            
            Browser.listContainers({"Path":path},0,1000,["*"],function(obj,err){
                if(obj.length > 0){
                    var newScreen = path;
                    listItems(obj);
                }
            });            
        }
    }
}


function addPlaylist(displayName) {
    var playlists = Browser.RootObject(document.getElementById('serverid').value);
    playlists.Path = playlists.Path + playlistCookie;

    Browser.createContainer(playlists, displayName, function(msg, error) {
        if (error)
            logError("Error creating playlist: " + error.message);
    });
}

function discoverMediaManagers() {
    Browser.discoverMediaManagers(function(obj, error) {
        for (var i = 0; i < obj.length; i++) {
            logSuccess ("Found MediaManager: " + obj[i]);
        }
    });
}

function updatePlayButton(status){
    console.log("updating playbutton");

    if(status == "PAUSED"){
        $("#playButton").removeClass("btn-play-pause-pause");
    }else if(status == "PLAYING"){
        $("#playButton").addClass("btn-play-pause-pause");
    }

/*
    Player.getPlaybackStatus(function(r){
        console.log("Playback status returned");

        console.log(r);
    });
*/
}


function updatePlayback(){  
    var songLength = $("#songProgress").data("track_length");

    Player.getPosition(function(p,e){

        var ratio = 100/(songLength/p);
        var seconds = p/1000000;
        
        var timeSeconds = (seconds%60);
        var timeMinutes = Math.floor(seconds/60);
        var totalTime = timeSeconds + timeMinutes;

        if(String(timeSeconds).length == 1){ 
            timeSeconds = "0"+String(timeSeconds);
        }
        
        $("#songTime").html(timeMinutes+":"+timeSeconds);
        $(".progressPot").css("width",ratio+"%");
    });

}

function updateRepeatButton(repeatState){
    var states = ["REPEAT_SINGLE","NO_REPEAT","REPEAT"];
    var newState = states.indexOf(repeatState)+1;
    if(newState > 2){
        newState = 0;
    }

    $("#repeatButton").data("repeat_next_state",states[newState]);

    switch(repeatState){
        case "REPEAT":
            // change to all tracks.
            $("#repeatButton span").html("All Tracks");
            $("#repeatButton").addClass("btn-repeat-on");
        break;
        case "REPEAT_SINGLE":
            $("#repeatButton span").html("Current Track");
            $("#repeatButton").addClass("btn-repeat-on");
        break;
        case "NO_REPEAT":
            $("#repeatButton span").html("OFF");
            $("#repeatButton").removeClass("btn-repeat-on");
        break;
    }
}

function updateShuffleButton(shuffleStatus){

    if(shuffleStatus == true){
            $("#shuffleButton").addClass("btn-shuffle-on");
    }else if(shuffleStatus == false){
            $("#shuffleButton").removeClass("btn-shuffle-on");
    }
    //$("#shuffleButton").data("shuffle_state",shuffledStatus);

}

function fastSeek(direction){
    if(Date.now() - lastStamp > 500){
        console.log("seeking "+direction+""+Date.now())
        seek(direction * 10000000);
        lastStamp = Date.now();
    }
}

function setPlaybackPosition(xVal){
    var track_length = $("#songProgress").data("track_length");
    setPosition(Math.ceil(track_length*(xVal/720)));
    updatePlayback();
}




function pause() {
    Player.pause(function(msg, error) {
        //updatePlayButton();
        if (error)
            logError("Error pausing: " + error.message);
    });
}

function play() {
    Player.play(function(msg, error) {
        //TODO:
        // Set Album Art
        // Set Title
        // Setup progress bar.

        //updatePlayButton();
        if (error)
            logError("Error playing: " + error.message);
    });
}

function playPause() {
    Player.playPause(function(msg, error) {
        //updatePlayButton();
        if (error)
            logError("Error playPausing: " + error.message);
    });
}

function next() {
    Player.next(function(msg, error) {
        if (error)
            logError("Error going next: " + error.message);
    });
}

function previous() {
    Player.previous(function(msg, error) {
        if (error)
            logError("Error going previous: " + error.message);
    });
}

function mute() {
    Player.setMuted(true, function(msg, error) {
        if (error)
            logError("Error muting: " + error.message);
    });
}

function unmute() {
    Player.setMuted(false, function(msg, error) {
        if (error)
            logError("Error unmuting: " + error.message);
    });
}

function getMuted() {
    Player.getMuted(function(msg, error) {
        if (error)
            logError("Error checking mute: " + error.message);
        else
            logSuccess ("Muted? " + msg);
    });
}

function getRepeated() {
    Player.getRepeated(function(msg, error) {
        if (error)
            logError("Error checking repeat: " + error.message);
        else
            logSuccess ("Repeat? " + msg);
    });
}
function getShuffled() {
    Player.getShuffled(function(msg, error) {
        if (error)
            logError("Error checking shuffled: " + error.message);
        else
            logSuccess ("Is shuffled? " + msg);
    });
}
function getRate() {
    Player.getRate(function(msg, error) {
        if (error)
            logError("Error checking rate: " + error.message);
        else
            logSuccess ("Rate: " + msg);
    });
}
function getVolume() {
    Player.getVolume(function(msg, error) {
        if (error)
            logError("Error checking volume: " + error.message);
        else
            logSuccess ("Volume: " + msg);
    });
}
function getCanGoNext() {
    Player.getCanGoNext(function(msg, error) {
        if (error)
            logError("Error checking if canGoNext: " + error.message);
        else
            logSuccess ("CanGoNext? " + msg);
    });
}
function getCanGoPrevious() {
    Player.getCanGoPrevious(function(msg, error) {
        if (error)
            logError("Error checking if getCanGoPrevious: " + error.message);
        else
            logSuccess ("getCanGoPrevious? " + msg);
    });
}
function getCanPause() {
    Player.getCanPause(function(msg, error) {
        if (error)
            logError("Error checking if CanPause: " + error.message);
        else
            logSuccess ("CanPause? " + msg);
    });
}
function getCanPlay() {
    Player.getCanPlay(function(msg, error) {
        if (error)
            logError("Error checking if CanPlay: " + error.message);
        else
            logSuccess ("CanPlay? " + msg);
    });
}
function getCanSeek() {
    Player.getCanSeek(function(msg, error) {
        if (error)
            logError("Error looking if we CanSeek: " + error.message);
        else
            logSuccess ("CanSeek? " + msg);
    });
}
function getCurrentTrack() {
    Player.getCurrentTrack(function(msg, error) {
        if (error)
            logError("Error getting CurrentTrack: " + error.message);
        else
            logSuccess ("Current Track: " + msg);
    });
}
function getPlaybackStatus() {
    Player.getPlaybackStatus(function(msg, error) {
        if (error)
            logError("Error getting playback status: " + error.message);
        else
            logSuccess ("Playback status " + msg);
    });
}
function getPosition() {
    Player.getPosition(function(msg, error) {
        if (error)
            logError("Error getting position: " + error.message);
        else
            logSuccess ("Position " + msg);
    });
}

function openPlaylist(container) {
    Player.openPlaylist(container, function(msg, error) {
        if (error)
            logError("Error opening playlist: " + error.message);
    });
}

function setShuffle(b) {
    Player.setShuffled(b, function(msg, error) {
        if (error)
            logError("Error setting shuffle: " + error.message);
    });
}

function setRepeat(b) {
    Player.setRepeated(b, function(msg, error) {
        if (error)
            logError("Error setting shuffle: " + error.message);
    });
}

function stop() {
    Player.stop(function(msg, error) {
        if (error)
            logError("Error stopping: " + error.message);
    });
}

function seek(delta) {
    Player.seek(delta, function(msg, error) {
        if (error)
            logError("Error seeking: " + error.message);
    });
}

function setPosition(pos) {
    Player.setPosition(pos, function(msg, error) {
        if (error)
            logError("Error setting position: " + error.message);
    });
}

function setRate(rate) {
    Player.setRate(rate, function(msg, error) {
        if (error)
            logError("Error setting rate: " + error.message);
    });
}

function emptyPlayQueue() {
    Player.emptyPlayQueue(function(msg, error) {
        if (error)
            logError("Error emptying play queue: " + error.message);
    });
}
function closeLibraryWindow() {
		$("#musicLibrary").removeClass("toShow");

        var rootVal = $("#libraryCloseSubPanelButton").data("root");
        $("#libraryCloseSubPanelButton").data("nested",rootVal);
}
