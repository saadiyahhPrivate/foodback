// Saadiyah
QUnit.asyncTest("Post Test", function (assert) {
    var review = {
        author: 'abdihd',
        hall: 'simmons',
        period: 'brunch',
        rating: 5,
        content: 'The food was really good today!',
        tags: 'food,chef',
    }

    $.ajax({
        type: 'POST',
        url: '/reviews/post',
        data: review,
        dataType: 'json',
        success: function (data) {
            var content = data.content;
            assert.ok(data.success, 'Post success.');
            assert.strictEqual(content.author, review.author, 'Check author.');
            assert.strictEqual(content.hall, review.hall, 'Check hall.');
            assert.strictEqual(content.period, review.period, 'Check period.');
            assert.strictEqual(content.rating, review.rating, 'Check rating.');
            assert.strictEqual(content.content, review.content, 'Check content.');
            assert.deepEqual(content.tags, ['food', 'chef'], 'Check tags.');
        }
    });
});

// Sophia
// QUnit.asyncTest("Vote Test", function (assert) {
//
// });

QUnit.asyncTest("Search Test", function (assert) {
    // search by dining hall only, no tags

    // $.ajax({
    //     type: 'GET',
    //     url: '/reviews/simmons',
    //     dataType: 'json'
    // });

    // search by dining hall and meal period, no tags
    $.ajax({
        type: 'GET',
        url: '/reviews/simmons/brunch',
        dataType: 'json',
        success: function (data) {
            assert.ok(data.success, 'Check for success.')
            assert.deepEqual(data.content, [], 'Array is empty.');
        }
    });

    // search by dining hall only, with tags
    // $.ajax({
    //     type: 'GET',
    //     url: '/reviews/simmons?tags=atmosphere,chef',
    //     dataType: 'json'
    // });

    // search by dining hall and meal period, with tags
    // $.ajax({
    //     type: 'GET',
    //     url: '/reviews/simmons/brunch?tags=atmosphere,chef',
    //     dataType: 'json'
    // });
});
