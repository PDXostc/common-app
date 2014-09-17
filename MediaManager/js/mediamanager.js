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

var Indexer;
var Browser;
var Player;
var rootLevelItems;
var options;
var songs;


function mminit(){
	console.log("media manager init");
	Indexer = new MediaManager.Indexer();
	Browser = new MediaManager.Browser();
	Player = new MediaManager.Player();
	playlistCookie = "/706c61796c69737473";
	activePlayQueueIndex = 0;
	playQueue = [];

	setRootContainer();

    //setup playback progress.
    setInterval(function(){updatePlayback()},1000);


}

function setRootContainer(){
	
	manager = {"DisplayName":"Root"};
	Browser.discoverMediaManagers(function(obj,err){ 
		manager.Path = obj[0];
		Browser.listContainers(manager,0,100,["DisplayName","Path","Type"],
			function(obj,err){

                $("#libraryCloseSubPanelButton").data("root",JSON.stringify([manager.Path]));

				options = obj;
				listItems(options);
		});
	});
}

function setSongsList(ob){
	Browser.listItems(ob,0,100,["DisplayName","Path"],function(obj,err){
	 songs = obj;
	});
}

function listItems(itemSet){
	$(".musicContentListedItems").empty();
	var t = document.querySelector("#media-content-list");	

	for(item in itemSet){

		t.content.querySelector(".artist-track-title").innerHTML = itemSet[item].DisplayName;
		//t.content.querySelector(".content-listing").setAttribute("data-item_path",itemSet[item].Path);
		
		var clone = document.importNode(t.content,true);
		
        if(itemSet[item].Type == "container"){

            $(clone.querySelector(".content-listing")).addClass("no-images");

            clone.querySelector(".content-listing").setAttribute("data-item_path",itemSet[item].Path);

            clone.querySelector(".content-listing").addEventListener("click",function(ev){
                console.log("displayChildren");
                displayChildren(ev);
            });            
        }else if(itemSet[item].Type == "music"){

            clone.querySelector(".content-listing").setAttribute("data-item_path",itemSet[item].Path);
            clone.querySelector(".content-listing").setAttribute("data-item_url",itemSet[item]["Resources"][1]["URL"]);
            clone.querySelector(".content-listing").setAttribute("data-artist_name",itemSet[item].Artist);
            clone.querySelector(".content-listing").setAttribute("data-song_title",itemSet[item].DisplayName);

            clone.querySelector(".play-now-btn").addEventListener("click",function(ev){playSongFromElement(ev)});
            clone.querySelector(".add-to-playlist-btn").addEventListener("click",function(ev){
                queueItemsFromElement(ev);
            });

            //carousel-items-template
        }

		$(".musicContentListedItems").append(clone);
	}
}


function queueItemsFromElement(ev){
    //var tc = document.querySelector("#carousel-items-template");
    var song_data = $(ev.target).closest("li.content-listing").data();
    //reintroduce when passing a url doesn't cause a segfault.
    //Player.enqueueUri(song_data.item_url,function(r,e){
        addElementToQueue(song_data);
    //});
}

function addElementToQueue(itemData){
        var t = document.querySelector("#carousel-items-template");
        t.content.querySelector(".carousel-item-container");

        var clone = document.importNode(t.content,true);
        clone.querySelector(".carousel-item-container").setAttribute("data-item_url",itemData.item_url);

        clone.querySelector(".song-title-carousel").innerHTML = itemData.song_title;
        clone.querySelector(".artist-name-carousel").innerHTML = itemData.artist_name;
        clone.querySelector(".song-title-carousel").setAttribute("data-song_title",itemData.song_title);
        clone.querySelector(".artist-name-carousel").setAttribute("data-artist_name",itemData.artist_name);

        $("#media-carousel-content").append(clone);
}


function playSongFromElement(playEvent){

    var song_data = $(playEvent.target).closest("li.content-listing").data();
    addElementToQueue(song_data);

    Player.openUri(song_data.item_url,function(obj,err){
       //set path to empty.
       Player.play(function(r){
            //updatePlayButton();
            var back = $("#libraryCloseSubPanelButton")
            back.data("nested",back.data("root"));
            goToPreviousList();
       });
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



//The event handler call for getChildren()
function displayChildren(tapEvent){
    var path = $(tapEvent.target).data("item_path");
    getChildren(path);
}

function getChildren(path){

	Browser.listContainers({"Path":path},0,1000,['DisplayName','Type','Path'],function(obj,err){
		if(obj.length > 0){
            var nestedPath = pushPath(path); //pushes path to items
			listItems(obj);
		}else{
            
            Browser.listItems({"Path":path},0,1000,['*'],function(obj,err){
                //var nestedPath = pushPath(path); //pushes path to items
                
                if(obj.length > 0){
                    var nestedPath = pushPath(path); //pushes path to items
                    listItems(obj);
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
    }else{
        Browser.listContainers({"Path":path},0,1000,["DisplayName","Path","Type"],function(obj,err){
            if(obj.length > 0){

                var newScreen = path;
                listItems(obj);

            }
        });
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

function updatePlayButton(){
    Player.getPlaybackStatus(function(r){
        if(r == "PAUSED"){
            $("#playButton").addClass("pause-on");
        }else{
            $("#playButton").removeClass("pause-on");
        }
    });
}


function updatePlayback(){
    var songLength = 240; //This will be provided by the data available on Playback, but for the time being, it'll be a constant.

    Player.getPosition(function(p){
        var seconds = p/1000000;
        var ratio = 100/(songLength/seconds);

        $(".progressPot").css("width",ratio+"%");
    });

}

function pause() {
    Player.pause(function(msg, error) {
        updatePlayButton();
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

        updatePlayButton();
        if (error)
            logError("Error playing: " + error.message);
    });
}

function playPause() {
    Player.playPause(function(msg, error) {
        updatePlayButton();
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
