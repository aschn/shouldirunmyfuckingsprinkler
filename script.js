
function setLoading(maxPrecipVal) {
	// select destination for answer
	var dest = $("#answer");

	// set answer based on raininess
	dest.addClass("alert alert-info").text("hold your fucking horses...");
}

function precipStats(forecast) {
	var maxPrecipProb = Math.max.apply(Math,forecast.hourly.data.map(function(d){return d.precipProbability;}));
	var nowPrecipProb = forecast.currently.precipProbability;
	var result = {'max': maxPrecipProb, 'now': nowPrecipProb};
	return result;
}

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
			var result = precipStats(data);
			showAnswer(result);
		},
		error: function() {
			showAnswer(0);
		}
	});
}

var rainingNow = [
	"You've got to be kidding me, go look out the fucking window at the rain! NO.",
	"No! Are you in a fucking windowless room? It's raining right now!",
	"No fucking no! It's raining right the fuck now!",
	"For fuck's sake, no! That stuff falling from the sky is fucking WATER.",
	"What the fuck, no! Go play in the fucking rain instead.",
	"Uh, thanks for asking, but look out your window... It's fucking raining! NO.",
];

var rainingSoon = [
	"No, you fool! There's a fucking {0}% chance of rain in the next couple of days!",
	"No way in hell! There's a fucking {0}% chance of rain in the next couple of days.",
];

var notRainingSoon = [
	"Not if you ran it fucking yesterday! We're in a fucking drought you know!",
	"No, your fucking lawn isn't special. Go buy some drought resistant plants instead!",
	"Ok, but only if you didn't have a shower today, you smelly fucking bastard. We're in a fucking drought!",
	"Ok, but only if you haven't flushed the toilet lately. We're in a fucking drought!",
];

function setMesasge(choices, data, alertLevel) {
	// select destination for answer
	var dest = $("#answer");

	// choose random message
	var i = Math.floor(Math.random()*choices.length);
	var template = choices[i];

	// make substitution
	var msg = template.replace("{0}", data);

	// set message
	dest.addClass("alert alert-"+alertLevel).text(msg);
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

function reload() {
	setLoading();
	start();
}

$(function() {
	// load page
	reload();

	// button click
	$("#again").on("click", function(e) {reload();});
});