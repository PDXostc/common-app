/** 
 * @module Weather
 */
/**
 * Reference to instance of  class object this class is inherited from dataModel {@link CarIndicator}
@property carInd {Object}
 */
var carInd;
/**
 * Reference to instance of ThemeEngine class object
 * @property te {Object}
 */
var te;

/**
 * Array of signals who want subscribe in carInd 
 * @property carIndicatorSignals {string[]}
 */
var carIndicatorSignals =  [
                            "IviPoC_NightMode"
                            ];

var myScroll;

function fixscroll(){ console.log("FIX IT!");
	if(typeof($(".locListItem")[0]) == typeof(undefined)) return;
	if($(".locListItem")[0].style.cssText.split('translate(')[1].split(', ')[0] == '0px')
		$(".locListItem").css('transform', 'translate(-1076px, 0px) translateZ(0px)');
}


console.log("start of weather index.html template");

var WeatherTemplate = document.getElementById("listItemTemplate").cloneNode(true).innerHTML = document.getElementById("listItemTemplate").cloneNode(true).innerHTML + ("locListItemInner");

/**
 * Initialize plugins, register events for Store app.
 * @method init
 * @static
 **/
var init = function () {
/*    var bootstrap = new Bootstrap(function (status) {
    $("#topBarIcons").topBarIconsPlugin('init', 'weather');
    $("#clockElement").ClockPlugin('init', 5);  
    $("#clockElement").ClockPlugin('startTimer');
    $('#bottomPanel').bottomPanel('init');

    if (tizen.speech) {
        setupSpeechRecognition();
    } else {
        console.log("Store: Speech Recognition not running, voice control will be unavailable");
    }
        
    bootstrap.themeEngine.addStatusListener(function (eData) {
        // setThemeImageColor();
    });
    });*/
};

/**
 * Calls initialization fuction after document is loaded.
 * @method $(document).ready
 * @param init {function} Callback function for initialize Store.
 * @static
 **/
$(document).ready(init);

/**
 * Applies selected theme to application icons 
 * @method setThemeImageColor
 * @static
 **/
function setThemeImageColor() {
    var imageSource;
    $('body').find('img').each(function() {
        var self = this;
        imageSource = $(this).attr('src');

        if (typeof(imageSource) !== 'undefined' && $(this.parentElement).hasClass('themeImage') == false) {
            console.log(imageSource);

            var img = new Image();
            var ctx = document.createElement('canvas').getContext('2d');

            img.onload = function () {
                var w = ctx.canvas.width = img.width;
                var h = ctx.canvas.height = img.height;
                ctx.fillStyle = ThemeKeyColor;
                ctx.fillRect(0, 0, w, h);
                ctx.globalCompositeOperation = 'destination-in';
                ctx.drawImage(img, 0, 0);

                $(self).attr('src', ctx.canvas.toDataURL());
                $(self).hide(0, function() { $(self).show();});
            };

            img.src = imageSource;
        }
    });
}

function setupSpeechRecognition() {
    console.log("Store setupSpeechRecognition");
    Speech.addVoiceRecognitionListener({
        onapplicationinstall : function() {
            console.log("Speech application install invoked");
            if (_applicationDetail.id !== undefined) {
                StoreLibrary.installApp(_applicationDetail.id);
            }
        },
        onapplicationuninstall : function() {
            console.log("Speech application uninstall invoked");
            if (_applicationDetail.id !== undefined) {
                StoreLibrary.uninstallApp(_applicationDetail.id);
            }
        }

    });
}

function getLocationKeyFromLatLong(){
	
	var coords = getCurrentLatLong();
	var geoposition = "http://apidev.accuweather.com/locations/v1/cities/geoposition/search.json?q="+coords.lat+","+coords.long+"&apikey="+apiKey;	
	
	$.ajax({
		type: "GET",
		url: geoposition,
		dataType: "jsonp",
		success:function(response){
			var locationObject = {
				"Key":response.Key,
				"LocalizedName":response.LocalizedName,
				"currentLocation":true
			}

			var locations = getLocations();

			
			if(locations[0] == undefined || locations[0].currentLocation == undefined ){
				locations.unshift(locationObject);
			}else if(locations[0].Key != locationObject.Key){
				locations[0] = locationObject;
			}

			saveLocationsList(locations);
			
			//Forces update of the display
			if($(".currentLocation").length == 0){
				addLocationsToDisplay();				
			}else if($(".currentLocation").attr("id") != "_"+locationObject.Key){
				$(".currentLocation").attr("id","_"+locationObject.Key);
				$(".currentLocation .locName").html(locationObject.LocalizedName);
				setupTimers(locationObject.Key);
				//destroy old interval
				
				
			}
		}
	});
}

function showLocationDetails(locationElement){
	//$(locationElement).find(".moreInfo").css("opacity",100);
	
	var info = $(locationElement).next(".moreInfo");

	if($(info).css('opacity') == 1){
		$(info).css("opacity",0);
	}else{
		$(info).css("opacity",1);
	}
}

function saveLocationsList(locations){
	localStorage.setItem("locations",JSON.stringify(locations));
}

function getLocations(){

	var locations = JSON.parse(localStorage.getItem("locations"));
	if(locations == null) locations = [];
	return locations;
}

function generateLocListItem(locationObject,isCurrent){
	
	var wrapper = $(document.createElement('div')).addClass("locListItemInner").attr("id","_"+locationObject.Key);
	if(isCurrent == true){
		wrapper.addClass("currentLocation");
	}
	
	var trio = $(document.createElement('ul')).addClass("locListItem");
	
	var hourly = $(document.createElement('li')).addClass('forecastGrid hourlyBlock').append('<div class="forecastGrid_load"></div>');
	var main = $(document.createElement('li')).addClass('listItem');
	var weekly = $(document.createElement('li')).addClass('forecastGrid fiveDayBlock').append('<div class="forecastGrid_load"></div>');
	
	
	var leftArrow = '<div class="condImage">'+
					'<div class="L_indicator arrow-left"></div><img class="weatherIcon" src="">'+
					'</div>';
	
	var rightArrow = '<div class="tempBox" onclick="event.stopPropagation">'+
						'<span class="temp"><span class="tempVal">--</span><sup>°<span class="tempMeasurement">F</span></sup></span>'+
						'<div class="R_indicator arrow-right"></div>'+
					'</div>';
	
	var centerSection = $(document.createElement('div')).addClass('itemText').click(function(ev){showLocationDetails(ev.target)});
	if(isCurrent != true){
		var removeControl = $(document.createElement('div')).addClass('removeLocationControl').click(function(){removeFromStoredLocations(this)});
	}
	
	centerSection.append(removeControl);
	
	var locationName = $(document.createElement('span')).addClass('locName').html(locationObject.LocalizedName);
	var moreInfo = 	$(document.createElement('div')).addClass('moreInfo').css("opacity","1");	
	var currentDetails = $(document.createElement('div')).addClass('currentDetails');
	var ptag = $(document.createElement('p'));
	var humidity = $(document.createElement('span')).addClass('humidityData').html("--");
	var wind = $(document.createElement('span')).addClass('windData').html("--");
	var rain = $(document.createElement('span')).addClass('rainData').html("  ");
	var realFeel = $(document.createElement('span')).addClass('rfData').html("--");
	
	ptag.append(humidity,wind,'<br>',rain,realFeel);
	currentDetails.append(ptag);
	moreInfo.append(currentDetails);
	//locationName.append(moreInfo);
	centerSection.append(locationName,moreInfo);
	
	var awxWrapper = $(document.createElement('div')).addClass("awxCurrentConditions");
	awxWrapper.append(leftArrow,centerSection,rightArrow);
	
	main.append(awxWrapper);
	//awxWrapper.append(main);
	
	trio.append(hourly,main,weekly);
	wrapper.append(trio);
	
	return wrapper;
}

function addLocationsToDisplay(){
	fixscroll();
	var locations = getLocations();
	//$("#locListInner").empty();
	$(locations).each(function(i){
		
		if(document.getElementById("_"+locations[i].Key) == null){
			//Generate and attach elements.
			var wrapper = generateLocListItem(locations[i],locations[i].currentLocation);
			
			if(locations[i].currentLocation != undefined){
				$("#locListInner").prepend(wrapper);
			}else{
				$("#locListInner").append(wrapper);				
			}
			
			//Fire initial ajax calls for locations
			var hourly = setTimeout('awxGetHourlyForecast("'+[locations[i].Key]+'")',i*1600);
			var weekly = setTimeout('awxGetFiveDayForecast("'+[locations[i].Key]+'")',i*1600);
			var current = setTimeout('awxGetCurrentWeather("'+[locations[i].Key]+'")',i*1600);
			
			//Set updating calls for locations every 5 minutes.
			hourlyTimer = setInterval('awxGetHourlyForecast("'+[locations[i].Key]+'")',300000);
			weeklyTimer = setInterval('awxGetFiveDayForecast("'+[locations[i].Key]+'")',300000);
			currentTimer = setInterval('awxGetCurrentWeather("'+[locations[i].Key]+'")',300000);
			
			//Implement Swipe feature for locations.
			var res = new IScroll("#_"+locations[i].Key, 
		    	    {
		    	        scrollX: true, 
		    	        scrollY: false, 
		    	        startX: -1076,
		    	        snap: true, 
		    	        click: true
		    	    });
		}
	});
	toggleAddRemoveButtons();
	fixscroll();
}

function setupTimers(key){

	var hourly = setTimeout('awxGetHourlyForecast("'+key+'")',1600);
	var weekly = setTimeout('awxGetFiveDayForecast("'+key+'")',1600);
	var current = setTimeout('awxGetCurrentWeather("'+key+'")',1600);
	
	//Set updating calls for locations every 5 minutes.
	hourlyTimer = setInterval('awxGetHourlyForecast("'+key+'")',300000);
	weeklyTimer = setInterval('awxGetFiveDayForecast("'+key+'")',300000);
	currentTimer = setInterval('awxGetCurrentWeather("'+key+'")',300000);
}

function toggleAddRemoveButtons(){
	var locations = getLocations();
	if(locations.length < 5){
		$("#addLocation").show();
	}else{
		$("#addLocation").hide();
	}
	if(locations.length > 1){
		$("#removeLocation").show();
	}else{
		$("#removeLocation").hide();
	}
}

function addToStoredLocations(element){
	var locKey = $(element).attr("data-locationKey");
	var locName = $(element).attr("data-locationName");
	
	var newLocation = {
			"LocalizedName":locName,
			"Key":locKey
	}
	
	existingLocations = getLocations();
	if(existingLocations.length <= 4){
		existingLocations.push(newLocation);
		saveLocationsList(existingLocations);
		addLocationsToDisplay();
	}
}

function removeFromStoredLocations(element){
	
	var rid = $(element).closest(".locListItemInner")[0].id;
	rid = rid.substr(1,rid.length);

	var existingLocations = getLocations();

	for(e in existingLocations){
		if(existingLocations[e].Key == rid){
			existingLocations.splice(e,1);
			saveLocationsList(existingLocations);
			$("#_"+rid).remove();
			toggleAddRemoveButtons();
			continue;
		}
	}
}

function showLocationModal(){
	$(".removeLocationControl").hide();
	$("#locationModal").show();
}

function hideLocationModal(){
	$("#locationModal").hide();
}

function toggleRemoveControl(){
	$(".removeLocationControl").toggle();
	if($(".removeLocationControl")[1].style.cssText == "display: block;")
		$(".locListItem").css('transform', 'translate(-1076px, 0px)');
}

function populateListItem(weatherData,locationKey){
	fixscroll();
	detail = weatherData[0];
//	console.log(weatherData);
//	console.log(locationKey);
	/*
	humidity = detail.CurrentConditions.RelativeHumidity;        
	windDirection = detail.CurrentConditions.Wind.Direction.Localized;
	windSpeed = detail.CurrentConditions.Wind.Speed.Value;
	windSpeedUnit = detail.CurrentConditions.Wind.Speed.Unit;
	wind = windDirection + " " + windSpeed + windSpeedUnit;
	rain = detail.CurrentConditions.PrecipitationSummary.Precipitation.Value;
	RealFeelValue = detail.CurrentConditions.RealFeelTemperature.Value;
	RealFeelUnit  = detail.CurrentConditions.RealFeelTemperature.Unit;
	realFeel = RealFeelValue + "&deg;" + RealFeelUnit; 
	*/			
	//Set temperature for this location
	$("#_"+locationKey+" .tempVal").html(detail.Temperature.Imperial.Value);
	$("#_"+locationKey+" .weatherIcon").attr("src","images/Accuweather_icons/" + detail.WeatherIcon + "-s.png");
	
	$("#_"+locationKey+" .humidityData").html("Humidity: "+detail.RelativeHumidity+"% ");
	$("#_"+locationKey+" .windData").html(" Wind: "+detail.Wind.Direction.Localized+ " " + detail.Wind.Speed.Imperial.Value+detail.Wind.Speed.Imperial.Unit);
	//$("#_"+locationKey+" .rainData").html("Chance of Rain: "+rain);
	$("#_"+locationKey+" .rfData").html("RealFeel&#174;: "+detail.RealFeelTemperature.Imperial.Value+detail.RealFeelTemperature.Imperial.Unit);
	fixscroll();
}


/* 
   function to execute tapping a place name to show more 
   information beneath it such as humidity, precip chance,
   wind, etc. Takes a css id as a req'd arg.
*/

function showMore(id) {
    var slot = document.getElementById(id);
    if (slot.style.opacity == '100'){
        slot.style.opacity = '0';
    }else{
        slot.style.opacity = '100';
    }
}

language = 'en';
var apiKey ='9db0cdaee186459f981212bb806d0c80';

var awxGetFiveDayForecast = function (locationKey)  {
	console.log("awxGetFiveDayForecast("+locationKey+")");
    fiveDayForecastUrl = "http://apidev.accuweather.com/forecasts/v1/daily/5day/" +
    locationKey + ".json?language=" + language + "&apikey=" + apiKey;
    $.ajax({
      type: "GET",
      url: fiveDayForecastUrl,
      dataType: "jsonp",
      cache: true,                    // Use cache for better reponse times
      jsonpCallback: "awxCallback3",   // Prevent unique callback name for better reponse times
      success: function (data) {

        var html = '';
        var forecastHeadline = data.Headline.Text;
        $("#awxHeadline").html(forecastHeadline);
        //console.log(forecastHeadline);                       
        //console.log(data.DailyForecasts.length); 
          var weekday=new Array(7);
              weekday[0]="Sunday";
              weekday[1]="Monday";
              weekday[2]="Tuesday";
              weekday[3]="Wednesday";
              weekday[4]="Thursday";
              weekday[5]="Friday";
              weekday[6]="Saturday";

          var monthname=new Array(11);
              monthname[0]="January";
              monthname[1]="February";
              monthname[2]="March";
              monthname[3]="April";
              monthname[4]="May";
              monthname[5]="June";
              monthname[6]="July";
              monthname[7]="August";                                
              monthname[8]="September";
              monthname[9]="October";
              monthname[10]="November";
              monthname[11]="December";   

          $("#_"+locationKey+" .fiveDayBlock .forecastGrid_load").empty();
              
          for (var i=0; i<data.DailyForecasts.length; i++) {  
            //console.log(dailyForecasts=JSON.stringify(data.DailyForecasts));
            var date = new Date(data.DailyForecasts[i].Date); // outputs Mon Mar 24 2014 07:00:00 GMT-0700 (Pacific Daylight Time)
            var object_date = date.toDateString(); // outputs "Mon Mar 24 2014"
            var today = new Date().toDateString(); // outputs "Mon Mar 24 2014"                                    
            var mmm = monthname[date.getMonth()];
            var dt = date.getDate();
            // test for whether or not the day of the week should ouput "Today" string rather than day of week
            if(object_date == today)  {
              var day = "TODAY";
            }
            else  {
              var day = weekday[date.getDay()];
            }

            //var fulldate = day + " " + mmm + " " + dt; 
            //console.log(fulldate);
            var max = data.DailyForecasts[i].Temperature.Maximum;
            var min = data.DailyForecasts[i].Temperature.Minimum;
            var maxTempValue = max.Value;
            var maxTempUnit = max.Unit;
            var minTempValue = min.Value;
            var minTempUnit = max.Unit;
            var maxTemp = maxTempValue + "&deg;" + maxTempUnit;
            var minTemp = "Lo " + minTempValue + "&deg;" + minTempUnit;
            var icon = "<img src='images/Accuweather_icons/" + data.DailyForecasts[i].Day.Icon + "-s.png' class='icon'>";
            var iconPhrase = data.DailyForecasts[i].Day.IconPhrase;

            // render HTML
            fiveDayForecast ='<div class="fiveDay"><p class="weekday">' + day + '</p><p>' + mmm + ' ' + dt + '</p>' 
              + icon + '<div class="iconPhrase">' + iconPhrase + '</div><p><span class="hour_temp">' + maxTemp + '</span> ' 
              + minTemp + '</p></div>';
            $("#_"+locationKey+" .fiveDayBlock .forecastGrid_load").append(fiveDayForecast);
         }                    
      } 
    }); 
  };

var awxGetHourlyForecast = function (locationKey) {
	console.log("awxGetHourlyForecast("+locationKey+")");
	hourlyForecastUrl = "http://apidev.accuweather.com/forecasts/v1/hourly/12hour/" + 
	locationKey + ".json?language=" + language + "&apikey=" + apiKey;
        //console.log(hourlyForecastUrl);
    $.ajax({
      type: "GET",
      url: hourlyForecastUrl,
      dataType: "jsonp",
      cache: true,                    // Use cache for better reponse times
      jsonpCallback: "awxCallback4",   // Prevent unique callback name for better reponse times
      success: function (data) {

		var html = '';
		var date = null;
		
		$("#_"+locationKey+" .hourlyBlock .forecastGrid_load").empty();
		
        //DateTime, IconPhrase, WeatherIcon, Temperature.Value, Temperature.Unit
        for (var i=0; i<6; i++) {
        	//convert the date string to a format getHours() can read
        	date = new Date(data[i].DateTime);
        	hour = date.getHours(); // outputs a number 0-23
        	hourIcon = data[i].WeatherIcon; // needs conversion to graphic
        	hourIconPhrase = data[i].IconPhrase; 
        	hourTempValue = data[i].Temperature.Value; //number
        	hourTempUnit = data[i].Temperature.Unit; //"F"
        	hourIconImage = "<img src='images/Accuweather_icons/" + hourIcon + "-s.png' />";
		
        	if ( (hour == 24) || (hour < 12)) {
        		hour += "am";
        	} else if (hour == 12) {
        		hour += "pm";
        	} else {
        		hour -= 12;
        		hour += "pm"; 
        	}
		
        	HourlyTemperature = hourTempValue + "&deg;" + hourTempUnit + " ";
		
		  // render HTML
        	hourlyForecast = '<div class="hourly"><p class="hour">' + hour + 
        	'</p>' + hourIconImage + '<div class="iconPhrase">' + hourIconPhrase + '</div><p class="hour_temp">'+ 
        	HourlyTemperature + '</p></div>';
        	$("#_"+locationKey+" .hourlyBlock .forecastGrid_load").append(hourlyForecast);
        	//$("#awxHourlyForecast").append(hourlyForecast);  
        }
        //$("#awxHourlyForecast").wrap("<div class='forecastGrid_load'></div>");
      }
    });
  };

var awxGetCurrentWeather = function (locationKey) {
	console.log("awxGetCurrentWeather("+locationKey+")");
    currentDetailsUrl = "http://apidev.accuweather.com/currentconditions/v1/" + 
    locationKey + ".json?language=" + language + "&apikey=" + apiKey + "&details=true";
	$.ajax({
	  type: "GET",
	  url: currentDetailsUrl,
	  dataType: "jsonp",
//	  cache: true,                    // Use cache for better reponse times
	  jsonpCallback: "awxCallback2",   // Prevent unique callback name for better reponse times
	  success: function (detail) {
		  populateListItem(detail,locationKey);
	  }
    });
};



// Configure our weather widget during jQuery.OnReady
$(document).ready(function() {
	console.log('onready');

  var isMetric = false;
  var locationUrl = "";
  var currentConditionsUrl = "";
  
  getLocationKeyFromLatLong();
  setInterval('getLocationKeyFromLatLong()',300000);
  addLocationsToDisplay();
  //loaded();
  

  var awxClearMessages = function() {
	  console.log("awxClearMessage()");
    $("#awxLocationInfo").html("...");
    $("#awxLocationInfo2").html("...");
    $("#awxLocationInfo3").html("...");
    $("#awxLocationUrl").html("...");
    //$("#awxWeatherInfo").html("...");
    //$("#awxWeatherUrl").html("...");
    //$("#awxWeatherText").html("..."); 
    //$("#awxTempValue").html("...");
    //$("#awxTempUnit").html("...");
    //$("#awxWeatherIcon").html("..."); 
    $("#awxHeadline").html("...");
    $("#awxFiveDayIcon").html("..."); 
    $("#awxFiveDayPhrase").html("...");  
    $("#awxFiveDayTempMinimum").html("...");   
    $("#awxFiveDayTempMaximum").html("...");
    $("#awxHour").html("...");
    $("#awxHourIcon").html("...");
    $("#awxHourIconPhrase").html("...");
    $("#awxHourTempValue").html("...");
    $("#awxHourTempUnit").html("...");
    $("#currentDetails").html(" ");

  }

  
  // Searches for a city with the name specified in freeText.
  // freeText can be something like:
  //          new york
  //          new york, ny
  //          paris
  //          paris, france
  // For more info about location API go to http://apidev.accuweather.com/developers/locations
  var awxCityLookUp = function (freeText) {
	  console.log("awxCityLookUp("+freeText+");");
    awxClearMessages();
    locationUrl = "http://apidev.accuweather.com/locations/v1/search?q=" + freeText + "&apikey=" + apiKey;
    $.ajax({
      type: "GET",
      url: locationUrl,
      dataType: "jsonp",
      cache: true,                    // Use cache for better reponse times
      jsonpCallback: "awxCallback",   // Prevent unique callback name for better reponse times
      success: function (data) { awxCityLookUpFound(data); }
    });
  };

  // Displays what location(s) were found.
  // Define new functions that use the locationKey after line 93
  var awxCityLookUpFound = function (data) {
	  console.log("awxCityLookUpFound("+data+");");
    var msg, locationKey = null;
    var msg2;
    var msg3;
    
    $("#awxLocationUrl").html("<a href=" + encodeURI(locationUrl) + ">" + locationUrl + "</a>");
    $("#searchResults").empty();
    
    if(data.length > 0){
    	for(loc in data){
			console.log("found("+data[loc].Key+");");
    		var searchItem = data[loc].LocalizedName+ " - " +data[loc].AdministrativeArea['LocalizedName']+" - "+data[loc].Country['LocalizedName']

    		$("#searchResults").append('<li data-locationKey="'+data[loc].Key+'" data-locationName="'+data[loc].LocalizedName+'" onclick="addToStoredLocations(this); hideLocationModal();">'+searchItem+"</li>");

    		if(loc == 2) break;
    	}
    }

    // add new location urls
    if(locationKey != null) {
        awxGetCurrentConditions(locationKey);
        awxGetFiveDayForecast(locationKey);
        awxGetHourlyForecast(locationKey);
        awxGetCurrentDetails(locationKey);
     
    }
    //location = data[0].LocalizedName;
  };

  // Gets current conditions for the location.

  // Get RelativeHumidity, Wind:Direction, Wind:Degrees, PrecipitationProbability, RealFeelTemperature:Value,
  // RealFeelTemperature:Unit,  
  var awxGetCurrentDetails = function (locationKey) {
    currentDetailsUrl = "http://apidev.accuweather.com/localweather/v1/" + 
        locationKey + ".json?language=" + language + "&apikey=" + apiKey + "&details=true";
    $.ajax({
      type: "GET",
      url: currentDetailsUrl,
      dataType: "jsonp",
      cache: true,                    // Use cache for better reponse times
      jsonpCallback: "awxCallback2",   // Prevent unique callback name for better reponse times
      success: function (detail) {
        var html;
        //console.log(currentDetailsUrl);
        humidity = detail.CurrentConditions.RelativeHumidity;        
        windDirection = detail.CurrentConditions.Wind.Direction.Localized;
        windSpeed = detail.CurrentConditions.Wind.Speed.Value;
        windSpeedUnit = detail.CurrentConditions.Wind.Speed.Unit;
        wind = windDirection + " " + windSpeed + windSpeedUnit;
        rain = detail.CurrentConditions.PrecipitationSummary.Precipitation.Value;
        RealFeelValue = detail.CurrentConditions.RealFeelTemperature.Value;
        RealFeelUnit  = detail.CurrentConditions.RealFeelTemperature.Unit;
        realFeel = RealFeelValue + "&deg;" + RealFeelUnit; 

        //render HTML
        $("#currentDetails").append('<p><span class="humidityData">Humidity: '+ humidity + '% </span>' +
         '<span class="windData"> Wind: ' + wind + '<br />' +
         //'<span class="rainData">Chance of Rain: ' + rain + '</span>' + 
         '<span class="rfData">RealFeel&#174;: ' + realFeel + '</span></class></p>');
      }
    });
  };



  $("#awxSearchTextBox").keypress(function (e) {
      if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
          var text = $("#awxSearchTextBox").val();
          awxCityLookUp(text);
          return false;
      } else {
          return true;
      }
  });
	console.log('onready search');
  $("#awxSearchButton").click(function () {
	  console.log('awxSearchButton click');
      var text = $("#awxSearchTextBox").val();
      awxCityLookUp(text);
  });
/*  
  $("#awxSearchButton").submit(function () {
      var text = $("#awxSearchTextBox").val();
      awxCityLookUp(text);
  });
*/
  $("#awxSearchTextBox").click(function() {
    var field = $(this);
    if (field.val()!=field.attr('defaultValue')) {
      field.val(' ');
    }
  })
});
