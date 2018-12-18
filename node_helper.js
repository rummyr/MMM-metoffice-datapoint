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
});
