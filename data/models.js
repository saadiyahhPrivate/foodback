var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var halls = [
    'Baker',
    'Maseeh',
    'McCormick',
    'Next',
    'Simmons'
];

var periods = [
    'breakfast',
    'brunch',
    'lunch',
    'dinner',
    'late night'
];

var userSchema = new Schema({
    firstname: String,
    lastname: String,
    username: String,
    password: String, // may remove when cert. auth. up
    joined: Date,
    reputation: Number,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
    // votes: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'Vote'
    // }]
});

var reviewSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    scope: {
        type: Schema.Types.ObjectId,
        ref: 'Scope'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    voters: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    rank: Number,
    content: String,
    posted: Date,
    edited: Boolean
});

var scopeSchema = new Schema({
    hall: {
        type: String,
        enum: halls
    },
    period: {
        type: String,
        enum: periods
    },
    numStars: Number,
    totalReviews: Number
});

// var voteSchema = new Schema({
//     voter: {
//         type: Schema.Types.ObjectID,
//         ref: 'User'
//     },
//     review: {
//         type: Schema.Types.ObjectID,
//         ref: 'Review'
//     },
//     vote: Number
// });

var User = mongoose.model('User', userSchema),
    Review = mongoose.model('Review', reviewSchema),
    Scope = mongoose.model('Scope', scopeSchema);
    // Vote = Model('Vote', voteSchema);

// Vote.schema.path('vote').validate(function (val) {
//     return Math.abs(val) === 1;
// }, 'Vote must be +1 or -1.');

module.exports.User = User;
module.exports.Review = Review;
module.exports.Scope = Scope;
// moduel.exports.Vote = Vote;
