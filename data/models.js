var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Model = mongoose.model;

var halls = [
    'Baker',
    'Maseeh',
    'McCormick',
    'Next',
    'Simmons'
];

var periods = [
    'breakfast',
    'brunch,'
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
    }],
    votes: [{
        type: Schema.Types.ObjectId,
        ref: 'Vote'
    }]
});

var reviewSchema = new Schema({
    author: {
        type: Schema.Types.ObjectID,
        ref: 'User'
    },
    scope: {
        type: Schema.Types.ObjectID,
        ref: 'Scope'
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
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
    }
});

var voteSchema = new Schema({
    voter: {
        type: Schema.Types.ObjectID,
        ref: 'User'
    },
    review: {
        type: Schema.Types.ObjectID,
        ref: 'Review'
    },
    vote: Number
});

var User = Model('User', userSchema),
    Review = Model('Review', reviewSchema),
    Scope = Model('Scope', scopeSchema),
    Vote = Model('Vote', voteSchema);

Vote.schema.path('vote').validate(function (val) {
    return Math.abs(val) === 1;
}, 'Vote must be +1 or -1.');

module.exports.User = User;
moduel.exports.Review = Review;
moduel.exports.Scope = Scope;
moduel.exports.Vote = Vote;
