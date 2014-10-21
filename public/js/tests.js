// Saadiyah
QUnit.asyncTest("Post Test", function (assert) {
    var review = {
        author: 'abdihd',
        hall: 'simmons',
        period: 'brunch',
        rating: 5,
        content: 'The food was really good today!',
        tags: 'food,chef'
    }

    var user = {
        email: 'foodback@mit.edu',
        password: 'pa55w0rd',
        username: 'foodback'
    }

    function error(xhr) {
        console.log(xhr.responseText);
    }

    $.ajax({
        type: 'POST',
        url: '/users/login',
        data: user,
        dataType: 'json',
        success: function (data) {
            assert.ok(data.success, 'Login success.');
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
                    $.ajax({
                        type: 'GET',
                        url: '/reviews/simmons/brunch?tags=food,chef',
                        dataType: 'json',
                        success: function (data) {
                            var content = data.content[0];
                            assert.ok(data.success, 'Query success.');
                            assert.strictEqual(content.author, review.author, 'Check author.');
                            assert.strictEqual(content.hall, review.hall, 'Check hall.');
                            assert.strictEqual(content.period, review.period, 'Check period.');
                            assert.strictEqual(content.rating, review.rating, 'Check rating.');
                            assert.strictEqual(content.content, review.content, 'Check content.');
                            assert.deepEqual(content.tags, ['food', 'chef'], 'Check tags.');
                            $.ajax({
                                type: 'GET',
                                url: '/users/logout',
                                success: function (data) {
                                    var content = data.content;
                                    assert.ok(data.success, 'Logout success.');
                                },
                                error: error
                            });
                        },
                        error: error
                    });
                },
                error: error
            });
        },
        error: error
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
