var async = require('async');
var rss_parser = require('rss-parser');
var moment = require('moment');
var credentials = require('./credentials');

var mongoose = require('mongoose');
var mongoDB = 'mongodb://' + credentials.username + ":" + credentials.password + '@ds115569.mlab.com:15569/regularfeach';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Episode = require('./models/episode')

var episodes = [];
var counter = 0;
var savedCount = 0;
function episodeCreate(episode_rss) {
    // see if an episode with the same timestamp already exists
    Episode.findOne({ 'date': episode_rss.isoDate }).exec(function (err, found_date) {
        if (err) { return next(err); }
        // if the episode already exists, don't save the new one
        if (found_date) {
            // console.log('episode from: ' + found_date.date + ' already exists');
            counter++;
            // console.log(counter);
        }

        // otherwise save it to the database
        else {
            var episode = new Episode({ rss: episode_rss });

            episode.save().then(function (episode) {
                if (err) {
                    console.log('error saving episode: ', err);
                    console.log('episode: ' + JSON.stringify(episode));
                }
                // console.log('episode saved: ' + episode.fullTitle);
                episodes.push(episode);
                counter++;
                savedCount++;
                // console.log(counter);
            });

        }
    });

}

//rss parser setup
let rss = new rss_parser();
let numitems = 0;
rss.parseURL('http://feeds.soundcloud.com/users/soundcloud:users:39773595/sounds.rss', function (err, feed) {
    //    console.log(feed.title);
    numitems = feed.items.length;
    async.forEach(feed.items, function (item, callback) {
        episodeCreate(item);
        callback();
    }, function (err) {
        if (err) {
            console.log('there was an error while parsing the RSS feed:\n');
            console.log(JSON.stringify(err));
        }
        else {
            //            console.log('all done');
        }
    });
    async.until(function () {
        return counter >= numitems;
    }, function (callback) {
        setTimeout(callback, 1000);
    }, function (err) {
        mongoose.connection.close();
        let timestamp = moment();
        if (savedCount <= 0) {
            console.log('no updates on ' + timestamp.format('MMMM Do YYYY, h:mm:ss a'));
        }
        else {
            console.log(savedCount + ' episode(s) saved to the database on ' + timestamp.format('MMMM Do YYYY, h:mm:ss a'));
            if (episodes.length > 0) {
                episodes.forEach(function (episode) {
                    console.log(episode.fullTitle + '\n');
                });
            }
        }
        process.exit();
    });
}
);
