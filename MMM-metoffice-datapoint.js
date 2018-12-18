Module.register("MMM-metoffice-datapoint", {
	// limits: 5000 per day = roughly 1 per 20 seconds!
	// https://www.metoffice.gov.uk/binaries/content/assets/mohippo/pdf/3/0/datapoint_api_reference.pdf
	// TODO: add regional text forecast txt/wxfcs/regionalforecast/datatype/locationId	
	// TODO: add alerts if they can be foundA
	// TODO: find site nearest location
	// TODO: find region of location .. txt/wxfcs/regionalforecast/datatype/sitelist
	// TODO: check out https://www.metoffice.gov.uk/public/data/services/locations/v3/nearest/latlong?latitude=60.4322&longitude=-1.2992&n=6&filter=none

  defaults: {
    apiKey: "",
    apiBase: "http://datapoint.metoffice.gov.uk/public/data/",
    forecastPath :  "val/wxfcs/all/" + "json/" ,
    regionalTextPath : "txt/wxfcs/regionalforecast/" + "json/",
    units: config.units,
    language: config.language,
    twentyFourHourTime: true,
    showCurrent: false, // for the moment not available in metoffice (no weather warnings neither!
    showSummary: true,
    showPrecipitationPossibilityInRow: true,
    showDayInRow: true,
    showIconInRow: true,
    updateInterval: 10 * 60 * 1000, // every 10 minutes
    animationSpeed: 1000,
    initialLoadDelay: 0, // 0 seconds delay
    retryDelay: 2500,
    tempDecimalPlaces: 0, // round temperatures to this many decimal places
    geoLocationOptions: {
      enableHighAccuracy: true,
      timeout: 5000
    },
    latitude:  null,
    longitude: null,
    maxHoursForecast: 8,   // maximum number of rows (3 hour intervals so 8 = 1 full day) to show in forecast
    showHighWinds: true, // show a windy icon if Speed or gust is over the limits windGustOver OR windSpeedOver
    windGustOver: 40,
    windSpeedOver: 20,
    showWindSpeed: true,
    showWindGust: false,
    showWindUnits: false,
    showWindDirection: true,
    unitTable: {
      'default':  'auto',
      'metric':   'si',
      'imperial': 'us'
    },
    iconTable: {
      'clear-day':           'wi-day-sunny',
      'clear-night':         'wi-night-clear',
      'rain':                'wi-rain',
      'snow':                'wi-snow',
      'sleet':               'wi-sleet',
      'wind':                'wi-cloudy-gusts',
      'fog':                 'wi-fog',
      'cloudy':              'wi-cloudy',
      'partly-cloudy-day':   'wi-day-cloudy',
      'partly-cloudy-night': 'wi-night-alt-cloudy',
      'hail':                'wi-hail',
      'thunderstorm':        'wi-thunderstorm',
      'tornado':             'wi-tornado',
      // added 
      'cloud':		     'wi-cloud', // as opposed to cloudy
    },

    metOfficeToDarkSkyIcon: {
	    '0' : 'clear-night',// clear night
	    '1' : 'clear-day',
	    '2' : 'partly-cloudy-night',
	    '3' : 'partly-cloudy-day',
	    '4' : 'not used',
	    '5' : 'fog', // actually mist
	    '6' : 'fog',
	    '7' : 'cloudy', 
	    '8' : 'cloud',//Overcast
	    '9' : 'rain',//Light rain shower (night)
	    '10' : 'rain',//Light rain shower (day)
	    '11' : 'rain',//Drizzle
	    '12' : 'rain',//Light rain
	    '13' : 'rain',//Heavy rain shower (night)
	    '14' : 'rain',//Heavy rain shower (day)
	    '15' : 'rain',//Heavy rain
	    '16' : 'rain',//Sleet shower (night)
	    '17' : 'sleet',//Sleet shower (day)
	    '18' : 'sleet',//Sleet
	    '19' : 'hail',//Hail shower (night)
	    '20' : 'haii',//Hail shower (day)
	    '21' : 'hail',//Hail
	    '22' : 'snow',//Light snow shower (night)
	    '23' : 'snow',//Light snow shower (day)
	    '24' : 'snow',//Light snow
	    '25' : 'snow',//Heavy snow shower (night)
	    '26' : 'snow',//Heavy snow shower (day)
	    '27' : 'snow',//Heavy snow
	    '28' : 'thunderstorm',//Thunder shower (night)
	    '29' : 'thunderstorm',//Thunder shower (day)
	    '30' : 'thunderstorm',//Thunder
    },

    debug: false,
    pendingTimeoutID: undefined,
  },

  getTranslations: function () {
    return false;
  },

  getScripts: function () {
    return [
//      'jsonp.js',
      'moment.js'
    ];
  },

  getStyles: function () {
    return ["weather-icons.css", "MMM-metoffice-datapoint.css", "weather-icons-wind.css"];
  },

  shouldLookupGeolocation: function () {
    return this.config.locationId == null 
	   && this.config.latitude == null 
	   && this.config.longitude == null;
  },

  start: function () {
    Log.info("Starting module: " + this.name);

    if (this.shouldLookupGeolocation()) {
      this.getLocation();
    }
    this.scheduleUpdate(this.config.initialLoadDelay);
  },

  updateWeather: function () {
    if (this.geoLocationLookupFailed) {
      return;
    }
//    if (this.shouldLookupGeolocation() && !this.geoLocationLookupSuccess) {
//      this.scheduleUpdate(1000); // try again in one second
//      return;
//    }

    var units = this.config.unitTable[this.config.units] || 'auto';

    var url = this.config.apiBase+'/'+ this.config.forecastPath + this.config.locationId + "?res=3hourly&key=" + this.config.apiKey;
    var regionalURL = this.config.apiBase + '/'+ this.config.regionalTextPath + this.config.regionId + "?key=" + this.config.apiKey;
    Log.info("Asking for " + url);
    Log.info("Regional URL " + regionalURL);
    if (this.config.data) {
      // for debugging
      this.processWeather(this.config.data);
    } else {
      //TODO: should use node-helper.js!
	this.sendSocketNotification('GET_METOFFICE_DATAPOINT', { 'url': url });
	this.sendSocketNotification('GET_METOFFICE_REGIONAL_TEXT', {'url': regionalURL });
	this.scheduleUpdate();

      // metoffice doesn't support JSONP getJSONP(url, this.processWeather.bind(this), this.processWeatherError.bind(this));
    }
  },

  socketNotificationReceived: function(notification, payload) {
	if (notification === 'METOFFICE_REGIONAL_TEXT_RESULT') {
		this.regional  = {
			'headline' : payload.RegionalFcst.FcstPeriods.Period[0].Paragraph[0].$,
			'now' : {
				'detailText' : payload.RegionalFcst.FcstPeriods.Period[0].Paragraph[1].$,
				'detailTitle' : payload.RegionalFcst.FcstPeriods.Period[0].Paragraph[1].title,
			},
			'next' : {
				'detailText' : payload.RegionalFcst.FcstPeriods.Period[0].Paragraph[2].$,
				'detailTitle' : payload.RegionalFcst.FcstPeriods.Period[0].Paragraph[2].title,
			}

		}
		this.processTextForecast(this.regional);
		this.updateDom(this.config.animationSpeed);

	}
	if (notification === "METOFFICE_DATAPOINT_RESULT") {
		// convert payload to something that darksky would have presented
		var processedData = {
			'forecastDate': moment(payload.SiteRep.DV.dataDate),
			'alerts': 'alerts TBD',
			'currently': {
				//'temperature': -1,
				'icon' : "",
			},
			'hourly' : {
				'summary' : '',
				'icon' : "",
				'data' : [
				],

			},
		};
		var dayOffset = 0;
		var dayIntervals = payload.SiteRep.DV.Location.Period;
		for (dayOffset = 0; dayOffset < dayIntervals.length; dayOffset++) {
			var day = dayIntervals[dayOffset];
			var reps = day.Rep;

			for (repOffset = 0;repOffset < reps.length;repOffset++) {
				//var repOffset = 0;
				var rep = reps[repOffset];
				// sanity check the time .. metoffice seem to post data in the past!
				if (moment(day.value,"YYYY-MM-DDZ").add(rep.$,"minutes").isAfter(moment().subtract(4*60,"minutes"))) {

					var insert = processedData.hourly.data;
					insert.push({
						'time' :  moment(day.value,"YYYY-MM-DDZ").add(rep.$,"minutes").unix(),
						'offsetMins' : rep.$,
						'temperature' : rep.T,
						'precipProbability' : rep.Pp/100,
						'icon' : this.config.metOfficeToDarkSkyIcon[""+rep.W],
						'windSpeed' : rep.S,
						'windGust' : rep.G,
						'windCardinal' : rep.D, // e.g. WSW
						'feelsLike' : rep.F,
						'humidity' : rep.H,
						'UV' : rep.U,
						});
				} // end only insert if after 4 hours ago
			} // for each 3 hourly rep
		} // for each day
                //this.processWeather(payload);
		this.processWeather(processedData);
	        this.updateDom(this.config.animationSpeed);
	 }
         this.updateDom(this.config.initialLoadDelay);
  },

  processTextForecast: function (data) {
	  if (this.config.debug) {
		  console.log('textForecast',data);
	  }
	  this.textForecast = data;
	  this.updateDom(this.config.animationSpeed);
	  // -- the next update will come from processWeather
	  // this.scheduleUpdate();
  },

  processWeather: function (data) {
    if (this.config.debug) {
      console.log('weather data', data);
    }
    this.loaded = true;
    this.weatherData = data;
    this.temp = this.roundTemp(this.weatherData.currently.temperature);
    this.updateDom(this.config.animationSpeed);
    // this.scheduleUpdate();
  },

  processWeatherError: function (error) {
    if (this.config.debug) {
      console.log('process weather error', error);
    }
    // try later
    // this.scheduleUpdate();
  },

  notificationReceived: function(notification, payload, sender) {
    switch(notification) {
      case "DOM_OBJECTS_CREATED":
        break;
    }
  },

  getDom: function() {
    var wrapper = document.createElement("div");

    if (this.config.apiKey === "") {
      wrapper.innerHTML = "Please set the correct forcast.io <i>apiKey</i> in the config for module: " + this.name + ".";
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    if (this.geoLocationLookupFailed) {
      wrapper.innerHTML = "Geolocaiton lookup failed, please set <i>latitude</i> and <i>longitude</i> in the config for module: " + this.name + ".";
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    if (!this.loaded) {
      wrapper.innerHTML = this.translate('LOADING');
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    var currentWeather = this.weatherData.currently;
    var hourly         = this.weatherData.hourly;

    var large = document.createElement("div");
    large.className = "large light";

    var icon = currentWeather ? currentWeather.icon : hourly.icon;
    var iconClass = this.config.iconTable[icon];
    var icon = document.createElement("span");
    icon.className = 'big-icon wi ' + iconClass;
    large.appendChild(icon);

    var temperature = document.createElement("span");
    temperature.className = "bright";
    temperature.innerHTML = " " + this.temp + "&deg;";
    large.appendChild(temperature);

    var summaryText = hourly.summary;
    if (this.textForecast && this.textForecast.headline) {
	    summaryText = this.textForecast.headline
    } else {
	    summaryText = "";
    }
    var summary = document.createElement("div");
    summary.className = "small dimmed summary";
    summary.innerHTML = summaryText;

    if (this.textForecast && this.textForecast.now) {
	    var shortTermTitleText = this.textForecast.now.detailTitle;
	    var shortTermText = this.textForecast.now.detailText;
    	//TODO: actually put this somewhere
    }


    var dateOfForecast = document.createElement("div");
    dateOfForecast.className = "dimmed summary small"; // removed dimmed
    dateOfForecast.innerHTML = "@" + this.weatherData.forecastDate.format("HH:mm");
    dateOfForecast.innerHTML = "Updated about " + this.weatherData.forecastDate.fromNow();

//    wrapper.appendChild(dateOfForecast);

    if(this.config.showCurrent) {
	    wrapper.appendChild(large);
    }
    if (this.config.showSummary) {
	    wrapper.appendChild(summary);
    }

    wrapper.appendChild(this.renderWeatherForecast());
    wrapper.appendChild(dateOfForecast);
    return wrapper;
  },

  // Get current day from time
  getDayFromTime: function (time) {
    var dt = new Date(time * 1000);
    return moment.weekdaysShort(dt.getDay());
  },

  // Get current hour from time
  // Depending on config returns either
  //  - 23:00 - 24 hour format
  //  - 11pm  - 12 hour format
  getHourFromTime: function (time) {
    var dt = new Date(time * 1000);
    var hour = dt.getHours();
    if (this.config.twentyFourHourTime) {
      return hour + ":00";
    }
    else {
      var twentyFourHourFormat = "am";
      if (hour > 12) {
        twentyFourHourFormat = "pm";
      }
      return (hour % 12) + twentyFourHourFormat;
    }
  },  

  // A bunch of these make up the meat
  // In each row we can should display
  //  - time, icon, precip, temp
  renderForecastRow: function (data) {
    // Start off with our row
    var row = document.createElement("tr");
    row.className = "forecast-row";
    if (this.config.compact) {
	    row.className = "forecast-row compact";
    }

    // time - hours
    var hourTextSpan = document.createElement("span");
    hourTextSpan.className = "forecast-hour"
    hourTextSpan.innerHTML = this.getHourFromTime(data.time)
    
    // icon
    var iconClass = this.config.iconTable[data.icon];
    var icon = document.createElement("span");
    icon.className = 'wi weathericon ' + iconClass;

    // precipitation
    // extra check here is due to darksky precip being optional
    var precipPossibility = document.createElement("span");
    precipPossibility.innerHTML = "N/A"
    if (data.precipProbability != null) {
      precipPossibility.innerHTML = Math.round(data.precipProbability * 100) + "%";
    }
    precipPossibility.className = "precipitation"

    // temperature
    var temp = data.temperature;
    temp = Math.round(temp);
    var temperature = document.createElement("span");
    temperature.innerHTML = temp + "&deg;";
    temperature.className = "temp";

    var windSpeed = data.windSpeed;
    var windGust = data.windGust;
    var windDir = data.windCardinal;
    var windInfoNum = document.createElement("span");
    var wsText = "";
    if (this.config.showWindSpeed) {
        wsText += windSpeed;
    }
    if (this.config.showWindGust) {
	if (wsText != "") {
		wsText += '/';
	}
	wsText += windGust;
    }
    if (this.config.showWindUnits) {
	if (wsText != "") {
		wsText += "<small>mph</small>";
	}
    }
    windInfoNum.innerHTML = wsText;
    windInfoNum.className = "wind";

    var windDirIcon = document.createElement("span");
    // metoffice goes as fine as WNW .. aka 16 different directions
    windDirIcon.innerHtml = "";
    windDirIcon.className = "windDir wi wi-wind wi-from-" + windDir.toLowerCase();

    var windGustyIcon = document.createElement("span");
    if (this.config.windGustOver <= windGust || this.config.windSpeedOver <= windSpeed) {
	    windGustyIcon.className = "windStrong wi wi-strong-wind";
    }


    // Add what's necessary and return it
    row.appendChild(hourTextSpan)
    if (this.config.showIconInRow) { row.appendChild(icon); }
    if (this.config.showPrecipitationPossibilityInRow) { row.appendChild(precipPossibility) }
    row.appendChild(temperature)

    if (this.config.showWindDirection) {
	    row.append(windDirIcon);
    }
    if (this.config.showWindSpeed || this.config.showWindGust) {
	    row.append(windInfoNum);
	    row.append(windGustyIcon);
    }
    if (this.config.showHighWinds) {
	    row.append(windGustyIcon);
    }

    return row;
  },

  renderWeatherForecast: function () {
    // Placeholders
    var numHours =  this.config.maxHoursForecast;

    // Truncate for the data we need
    var filteredHours =
      this.weatherData.hourly.data.filter( function(d, i) { return (i <= numHours); });

    // Setup what we'll be displaying
    var display = document.createElement("table");
    display.className = "forecast";

    var days = [];

    // Cycle through and populate our table
    for (let i = 0; i < filteredHours.length; i++) {
      // insert day here if necessary
      var hourData = filteredHours[i];
      var row = this.renderForecastRow(hourData);

      let day = this.getDayFromTime(hourData.time);
      let daySpan = document.createElement("span");

      if (days.indexOf(day) == -1) {
        daySpan.innerHTML = day;
        days.push(day);
      }

      if (this.config.showDayInRow) { row.prepend(daySpan); }

      display.appendChild(row);
    }
    
    return display;
  },

  getLocation: function () {
    var self = this;
    navigator.geolocation.getCurrentPosition(
      function (location) {
        if (self.config.debug) {
          console.log("geolocation success", location);
        }
        self.config.latitude  = location.coords.latitude;
        self.config.longitude = location.coords.longitude;
        self.geoLocationLookupSuccess = true;
      },
      function (error) {
        if (self.config.debug) {
          console.log("geolocation error", error);
        }
        self.geoLocationLookupFailed = true;
        self.updateDom(self.config.animationSpeed);
      },
      this.config.geoLocationOptions);
  },

// Round the temperature based on tempDecimalPlaces
  roundTemp: function (temp) {
    var scalar = 1 << this.config.tempDecimalPlaces;

    temp *= scalar;
    temp  = Math.round( temp );
    temp /= scalar;

    return temp;
  },

  scheduleUpdate: function(delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }

    var self = this;
    if (this.pendingTimeoutID) {
	console.log("Cancelled pendingTimeoutID:" + this.pendingTimeoutID);
	clearTimeout(this.pendingTimeoutID);
    }
    this.pendingTimeoutID = setTimeout(function() {
      self.pendingTimeoutID = undefined;
      self.updateWeather();
    }, nextLoad);
  }

});
