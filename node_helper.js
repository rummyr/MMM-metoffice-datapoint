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
	    info: true,
	    error: true,
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
                // this.debug(response.statusCode); // for checking
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
	this.debug("Received notification:" + notification);
        if (notification === 'GET_METOFFICE_DATAPOINT') {
            this.getWeather(payload.url);
        }
	if (notification === 'GET_METOFFICE_REGIONAL_TEXT') {
	    this.getRegionalText(payload.url);
	}
        if (notification === 'CONFIG') {
            this.config = payload;
        }

	if (notification == "FIND_METOFFICE_SITE_ID_BY_NAME") {
		// key and name should be present
		// need to fire off 2 searches one to resolve name to siteId
		// one to resolve the found regionCode to regionId
		var siteName = payload.siteName;
		this.debug("Looking for " + payload.siteName + "by making call to " + payload.url);
	        request({
		url: payload.url,
            	method: 'GET'
        	}, (error, response, body) => {
            		if (!error && response.statusCode == 200) {
        	    		var result = JSON.parse(body);
				// this.debug(response.statusCode);
				//this.debug("Body" + body);
				// this.debug(response.statusCode);
				var info = this.getSiteByName(siteName,result.Locations.Location);
				if (!info || !info.siteId || !info.region) {
					this.info("Couldn't find " + siteName);
					this.sendSocketNotification("METOFFICE_PROBLEM" , { msg: "Couldn't find '" + siteName + "'"});
				} else {
					this.debug("siteID:" + info.siteId + " region:" + info.region);
					this.sendSocketNotification("METOFFICE_SITE_ID_LOOKEDUP", { 'siteId': info.siteId, 'regionCode': info.region} );
				}
			} // end not error status 200
			else if (error) {
				this.error("Got an error " + error + " for " + payload.url);
				this.sendSocketNotification("METOFFICE_PROBLEM", { msg: 'An error ocurred getting the site list:' + error});
			} else {
				this.error("Got a failed response code " + response.statusCode + " for " + payload.url
					+ "\n BODY:" + body); 
				this.sendSocketNotification("METOFFICE_PROBLEM", { msg: 'An error response was returned:' + body + 'Status:' + response.statusCode})
			}
		});
		// expect an immediate request to grab the regionId
	}
	if (notification == "FIND_METOFFICE_REGION_ID_BY_CODE") {
		// key and name should be present
		// need to fire off 2 searches one to resolve name to siteId
		// one to resolve the found regionCode to regionId
		var regionCode = payload.regionCode;
		this.debug("Looking for " + payload.regionCode + "by making call to " + payload.url);
	        request({
			url: payload.url,
            		method: 'GET'
        	}, (error, response, body) => {
            		if (!error && response.statusCode == 200) {
        	    		var result = JSON.parse(body);
				// this.debug(response.statusCode);
				//this.debug("Body" + body);
				//this.debug(response.statusCode);
				var info = this.getRegionIdByCode(regionCode,result.Locations.Location);
				if (!info || !info.regionId) {
					this.verbose("Couldn't find " + regionCode);
					this.sendSocketNotification("METOFFICE_PROBLEM" , { msg: "Couldn't find region by code '" + regionCode + "'"});
				} else {
					this.debug("region found:" + info.regionId);
					this.sendSocketNotification("METOFFICE_REGION_ID_LOOKEDUP", { 'regionId': info.regionId} );
				}
			} // end not error status 200
			else if (error) {
				this.sendSocketNotification("METOFFICE_PROBLEM", { msg: 'An error ocurred getting the regional site list:' + error});
			} else {
				this.sendSocketNotification("METOFFICE_PROBLEM", { msg: 'An error response was returned:' + body + 'Status:' + response.statusCode})
			}
		});
		// expect an immediate request to grab the regionId
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
			//this.debug(response.statusCode);
			//this.debug("Body" + body);
			//this.debug(response.statusCode);
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
   info: function(str) {
	if (this.config && this.config.info) {
		    console.log(new Date().toISOString().substring(11) + ":INFO:" + this.name + " " + str);
	    }
    },
    error: function(str) {
 	    if (this.config && this.config.error) {
		    console.log(new Date().toISOString().substring(11) + ":ERROR:" + this.name + " " + str);
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
  getSiteByName: function(name, arry) {
	this.debug("getNearestSite called, name:" + name + " and an array of length:" + arry.length);
	var siteId = "unfound";
	var siteRegion = "unfound";
	for (var i=0;i<arry.length;i++) {
		if (arry[i].name.toUpperCase() == name.toUpperCase()) {
			siteId = arry[i].id;
			siteRegion = arry[i].region;
			this.debug("Found Site: " + siteId + " in region " + siteRegion);
			return { 'siteId': siteId, 'region': siteRegion };
		}
	}
	this.debug("Couldnt find site " + name);
	return ;
   },
   getRegionIdByCode: function(region, arry) {
	this.debug("Looking up " + region + " in the array of length " + arry.length);
	for (var i=0;i<arry.length;i++) {
		if (arry[i]['@name'].toUpperCase() == region.toUpperCase()) {
			this.debug("found regionId: " + arry[i]['@id']);
			return { 'regionId': arry[i]['@id'] } ;
		}
	}
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
			//this.debug(response.statusCode);
			//this.debug("Body" + body);
			//this.debug(response.statusCode);
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
