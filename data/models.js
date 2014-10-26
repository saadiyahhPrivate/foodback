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
    'Breakfast',
    'Brunch',
    'Lunch',
    'Dinner',
    'Late Night'
];

var userSchema = new Schema({
    _id: {
        type: String,
        required: true
    }, // User objects have their Kerberos as the primary key
    name: String,
    password: String
});

var reviewSchema = new Schema({
    author: {
        type: String,
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
    content: String,
    tags: [String],
    score: Number,
    voters: [String]
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

var User = mongoose.model('User', userSchema),
    Review = mongoose.model('Review', reviewSchema),
    Scope = mongoose.model('Scope', scopeSchema);

module.exports.User = User;
module.exports.Review = Review;
module.exports.Scope = Scope;
