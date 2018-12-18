/* Magic Mirror
 * Module: MMM-BMW-DS
 * 
 * By Mykle1
 *
 * MIT Licensed
 */
const NodeHelper = require('node_helper');
const request = require('request');



module.exports = NodeHelper.create({
    config: {
	    debug: true,
	    verbose: true,
    },

    start: function() {
        console.log("Starting node_helper for: " + this.name);
	this.verbose("Verbose enabled");
	this.debug("Debug enabled");
	console.log(this.name + " conf is " + JSON.stringify(this.config));
    },

    getWeather: function(url) {
	this.verbose("getting from URL:" + url);
        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
		var result = JSON.parse(body);
		//console.log(this.name + " " + response.statusCode); // for checking
                this.sendSocketNotification('METOFFICE_DATAPOINT_RESULT', result);
            } else if (error) {
		console.log(this.name + " there was an error:" + error);
	    } else {
		this.debug(" status code is " + response.statusCode);
		this.debug(" body is " + body);
	    }
        });
    },

    getRegionalText: function(url) {
        this.verbose("getting from URL:" + url);
        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
                this.debug(response.statusCode); // for checking
                this.sendSocketNotification('METOFFICE_REGIONAL_TEXT_RESULT', result);
            } else if (error) {
                console.log(this.name + " there was an error:" + error);
            } else {
                this.debug(" status code is " + response.statusCode);
                this.debug(" body is " + body);
            }
        });
	    
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_METOFFICE_DATAPOINT') {
	    this.debug("MMM-metoffice-datapoint: Notification received: " + notification);
            this.getWeather(payload.url);
        }
	if (notification === 'GET_METOFFICE_REGIONAL_TEXT') {
	    this.debug("Notification received: " + notification);
	    this.getRegionalText(payload.url);
	}
        if (notification === 'CONFIG') {
            this.config = payload;
        }
	    
	if (notification == 'FIND_METOFFICE_SITE') {
		var lat = payload.lat;
		var lon = payload.lon;
		var key = payload.key;
		this.debug("FIND_METOFFICE_SITE for " + lat + ":" + lon + ":" + key);
		var url =  'http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/sitelist?key=' + key;
		this.debug("Request:" + url);

	        request({
		url: url,
            	method: 'GET'
        	}, (error, response, body) => {
            	if (!error && response.statusCode == 200) {
        	    	 var result = JSON.parse(body);
			this.debug(response.statusCode);
			//this.debug("Body" + body);
			this.debug(response.statusCode);
			var info = this.getNearestSite(lat,lon,result.Locations.Location);
			this.debug("siteID:" + info.siteId + " region:" + info.region);
			this.sendSocketNotification("METOFFICE_SITE_ID_LOOKEDUP", { 'siteId': info.siteId} );
			// now need to get the regionId!
			this.getRegionId(info.region,key);
			this.debug("Sending regionId: " + info.regionId + " back");
			this.sendSocketNotification("METOFFICE_REGION_ID_LOOKEDUP", { 'regionId': info.regionId} );
                	// this.sendSocketNotification('METOFFICE_REGIONAL_TEXT_RESULT', result);
           	 } else if (error) {
                	console.log(this.name + " there was an error:" + error);
            	} else {
                	this.debug(" status code is " + response.statusCode);
                	this.debug(" body is " + body);
            	}	
        	});
	}

    },
    debug: function(str) {
	if (this.config && this.config.debug) {
		    console.log(new Date().toISOString().substring(11) + ":DEBUG:" + this.name + " " + str);
	    }
    },
    verbose: function(str) {
 	    if (this.config && this.config.debug) {
		    console.log(new Date().toISOString().substring(11) + ":VERBOSE:" + this.name + " " + str);
	    }
   },
	
   getNearestSite: function(lat,lon, arry) {
	this.debug("getNearestSite called, lat:" + lat + " lon:" + lon + "and an array of length:" + arry.length);
	var nearestDist = 10000;
	var nearestId = "unfound";
	var nearestRegion = "unfound";
	for (var i=0;i<arry.length;i++) {
		var dist = Math.abs(arry[i].longitude-lon) + Math.abs(arry[i].latitude-lat);
		if (dist < nearestDist) {
			nearestDist = dist;
			nearestId = arry[i].id;
			nearestRegion = arry[i].region;
		}
	}
	this.debug("Found Site: " + nearestId + " in region " + nearestRegion);
	return { siteId: nearestId, region: nearestRegion };
   },

   getRegionId: function(region,key) {
	   this.debug("Should get regionId for " + region);
		this.debug("FIND_METOFFICE_REGION for " + region + ":" + key);
		var url =  'http://datapoint.metoffice.gov.uk/public/data/txt/wxfcs/regionalforecast/json/sitelist?key=' + key;
		this.debug("Request:" + url);

	        request({
		url: url,
            	method: 'GET'
        	}, (error, response, body) => {
            	if (!error && response.statusCode == 200) {
        	    	 var result = JSON.parse(body);
			this.debug(response.statusCode);
			this.debug("Body" + body);
			this.debug(response.statusCode);
			var arry = result.Locations.Location;
			for (var i=0;i<arry.length;i++) {
				if (arry[i]['@name'] == region) {
					this.debug("found regionId: " + arry[i]['@id']);
					this.sendSocketNotification("METOFFICE_REGION_ID_LOOKEDUP", { 'regionId': arry[i]['@id']} );
					return;
				}
			}
			return;
			//this.sendSocketNotification("METOFFICE_REGION_ID_LOOKEDUP", { 'siteId': info.siteId} );
			// now need to get the regionId!
           	 } else if (error) {
                	console.log(this.name + " there was an error:" + error);
            	} else {
                	this.debug(" status code is " + response.statusCode);
                	this.debug(" body is " + body);
            	}	
        	});
   
   },
   
});
