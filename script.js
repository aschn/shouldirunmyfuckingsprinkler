/*********************/
/* GLOBAL VARIABLES  */
/*********************/

var cache = {
	'date': new Date(),
	'precipStats': null,
	'timeOut': 5*1000*60, // timeout in 5 minutes
};

var rainingNow = [
	"Hey sucka, go look out the fucking window at the rain! NO.",
	"No! Are you in a fucking windowless room? It's raining right now!",
	"No fucking no! It's raining right the fuck now!",
	"For fuck's sake, no! That stuff falling from the sky is fucking WATER.",
	"What the fuck, no! Go play in the fucking rain instead.",
	"Uh, thanks for asking, but look out your window... It's fucking raining! NO.",
];

var rainingSoon = [
	"No, fool! There's a fucking {0}% chance of rain in the next couple of days!",
	"No way in hell! There's a fucking {0}% chance of rain in the next couple of days.",
	"No, you see those fucking clouds? There's a {0}% chance of rain in the next couple of days!",
	"Don't do it! Mr. T pities the fool who waters their fucking lawn when there's a {0}% chance of rain.",
	"Nope, there's a fucking {0}% chance of rain in the next couple of days! Maybe next week?",
];

var notRainingSoon = [
	"Not if you ran it fucking yesterday! Conserve some water, yo.",
	"Not if you're going to run it tomorrow! Better yet, use fucking greywater.",
	"No, your fucking lawn isn't special. Grow some drought resistant plants!",
	"Ok, but only if you didn't shower today! Drought is dirty fucking business.",
	"Ok, but only if you haven't flushed the toilet lately! It'll be fucking dry later this week.",
];

var loading = [
	"hold your fucking horses...",
];

/*********************/
/* HELPER FUNCTIONS  */
/*********************/

function cacheInvalid() {
	if (cache.precipStats === null) {
		// if no precip stats, invalid
		return true;
	} else {
		// cache age in milliseconds
		var cache_age = (new Date()).getTime() - cache.date.getTime();
		return (cache_age > cache.timeOut);
	}
}

function precipStats(forecast) {
	// compute stats from forecast
	var maxPrecipProb = Math.max.apply(Math,forecast.hourly.data.map(function(d){return d.precipProbability;}));
	var nowPrecipProb = forecast.currently.precipProbability;

	// return result
	var result = {'max': maxPrecipProb, 'now': nowPrecipProb};
	return result;
}

function setLoading() {
	// show loading message
	setMesasge(loading, [], "info");
}

function setMesasge(choices, data, alertLevel) {
	// select destination for answer
	var dest = $("#answer");

	// choose random message
	var i = Math.floor(Math.random()*choices.length);
	var template = choices[i];

	// make substitution
	var msg = template.replace("{0}", data);

	// adjust class
	dest.removeClass("alert-info alert-warning alert-danger").addClass("alert alert-"+alertLevel);

	// set message
	dest.text(msg);
}

/*********************/
/* LOGIC FLOW        */
/*********************/

function start() {
	// step 1 is get location
	$.ajax({
		url: "http://freegeoip.net/json/"+myip,
		jsonp: "callback",
		dataType: "jsonp",
		success: function(data) {
			var latlon = data.latitude + "," + data.longitude;
			getForecast(latlon);
		},
		error: function(e) {
			console.log(e);
		}
	});
}

function getForecast(latlon) {
	// step 2 is get forecast

	// set up url
	var url = "https://api.forecast.io/forecast/1cddcbfc9bd6d9848215a76d514042e4/"+latlon;

	// call to API
	$.ajax({
		url: url,
		jsonp: "callback",
		dataType: "jsonp",
		success: function(data) {
			// compute forecast stats
			var result = precipStats(data);

			// update cache
			cache.precipStats = result;
			cache.date = new Date();

			// return
			showAnswer(result);
		},
		error: function() {
			showAnswer(0);
		}
	});
}

function showAnswer(data) {
	// step 3 is show answer

	// set answer based on raininess
	if (data.now > 0.9) {
		setMesasge(rainingNow, [], 'danger');
	} else if (data.max > 0.3) {
		var percentChance = (data.max * 100).toFixed(0);
		setMesasge(rainingSoon, percentChance, 'danger');
	} else {
		setMesasge(notRainingSoon, [], 'warning');
	}
}

/*********************/
/* MAIN              */
/*********************/

function reload() {
	if (cacheInvalid()) {
		// get and show new data
		setLoading();
		start();
	} else {
		// show answer based on cached data
		showAnswer(cache.precipStats);
	}
}

$(function() {
	// load page
	reload();

	// button click
	$("#again").on("click", function(e) {reload();});
});
