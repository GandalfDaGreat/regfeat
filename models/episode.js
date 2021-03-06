var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var EpisodeSchema = new Schema(
    {
        title: { type: String, required: true },
        number: { type: Number },
        date: { type: Date, required: true, index: true },
        description: { type: String },
        member: [{ type: Schema.ObjectId, ref: 'Member' }],
        feature: [{ type: Schema.ObjectId, ref: 'Feature' }],
        jingle: [{ type: Schema.ObjectId, ref: 'Jingle' }],
        type: { type: String },
        tags: [{ type: String }],
        link: { type: String },
        imageURL: { type: String }
    }
);

EpisodeSchema.virtual('fullTitle').get(function () {
    return this.number ? this.number + ": " + this.title : this.title;
});

EpisodeSchema.virtual('fullTitle').set(function (title) {
    var parts = title.split(':');
    if (parts[1]) {
        if (parseFloat(parts[0])) {
            this.number = parseFloat(parts[0]);
            this.title = parts[1].trim();
        }
        else {
            this.title = title.trim();
        }
    }
    else {
        this.title = parts[0].trim();
    }
});

EpisodeSchema.virtual('rss').set(function (episode_rss) {
    this.fullTitle = episode_rss.title;
    this.date = episode_rss.isoDate;
    this.description = episode_rss.content;
    this.link = episode_rss.link;
    this.imageURL = episode_rss.itunes.image;
});

EpisodeSchema.virtual('url').get(function () {
    return '/episodes/' + this._id;
});

module.exports = mongoose.model('Episode', EpisodeSchema);