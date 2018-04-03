require("dotenv").config();
var keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var Request = require("request");
var fs = require("fs");

var command = process.argv[2];

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

main(command);

function main(command) {
	if (command === 'my-tweets') {
		myTweets();
	} else if (command === 'spotify-this-song') {
	var song = process.argv[3];
	spotifyThisSong(song);
	} else if (command === 'movie-this') {
		var movieName = process.argv[3];
	    movieThis(movieName)
	} else if (command === 'do-what-it-says') {
		doWhatItSays();
	}
}

function myTweets() {
	var params = {screen_name: 'avram_adam', count: '20'};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	  if (!error) {
		  	for (var i=0; i < tweets.length; i++) {
		  		console.log(tweets[i].created_at + ' ' + tweets[i].text);
			  	fs.appendFile("datafile.log", tweets[i].created_at + ' ' + tweets[i].text+"\r\n", function(err) {
		            if (err) {
		                return console.log(err);
		            }
		        });
			}
		      }
	});
}

function spotifyThisSong(song) {
	if (song === undefined) 
	    song = 'The Sign'
spotify.search({ type: 'track', query: song, limit: 10 }, function(err, data) {
  if (err) {
    return console.log('Error occurred: ' + err);
  }
	for (var i=0;i<data.tracks.items.length;i++) {
	   	var songInfo = data.tracks.items[i];
	   		if (songInfo.name === song.trim()) {
			    var dataInfo = ["Artist: "+songInfo.artists[0].name + "\r\n"]
			    dataInfo.push("Song Name: "+songInfo.name + "\r\n");
			    dataInfo.push("Preview URL: "+songInfo.preview_url + "\r\n");
			    dataInfo.push("Album Name: "+songInfo.album.name + "\r\n");
	
			    writeToFile(dataInfo);
			}
	}
});
} 

function movieThis(movieName) {
	if (movieName === undefined)
	    movieName = 'Mr Nobody';
	
	var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&tomatoes=true&apikey=trilogy";	
	Request(queryUrl, function(error, response, body) {

		//If the request is successful (i.e. if the response status code is 200)
		if (!error && response.statusCode === 200) {

		    var data = ["Title: " + JSON.parse(body).Title + "\r\n",
		                "Release Year: " + JSON.parse(body).Year + "\r\n",
		                "IMDB Rating: " + JSON.parse(body).imdbRating + "\r\n",
		                "Rotten Tomato Rating: " + JSON.parse(body).tomatoRating + "\r\n",
		                "Country : " + JSON.parse(body).Country + "\r\n",
		                "Language : " + JSON.parse(body).Language + "\n",
		                "Plot: " + JSON.parse(body).Plot + "\r\n",
		                "Actors : " + JSON.parse(body).Actors + "\r\n"]
		                writeToFile(data);               
		}
    });
}

function doWhatItSays() {
	fs.readFile("random.txt", "utf8", function(err, data) {
    if (err) {
      return console.log(err);
    } else {
    	data = data.split(",");
    	if (data.length <= 2) {
	    	action = data[0];
	    	command = data[1];
	    	if (action === 'my-tweets') {
	    		myTweets();
	    	} else if (action === 'spotify-this-song') {
	    		spotifyThisSong(command);
	    	} else if (action === 'movie-this') {
	    		movieThis(command);
	    	}
        } else {
        	console.log("ERROR: Wrong number of arguments :-(");
        }
	}

  });
}

function writeToFile(data) {
	for (var i=0;i<data.length;i++) {
		console.log(data[i]);
	  fs.appendFile("datafile.log", data[i], function(err) {
	    if (err) {
	      return console.log(err);
	    }
	  });
	}
} 