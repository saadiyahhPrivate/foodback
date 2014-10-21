QUnit.test("Fake Test", function (assert) {
	assert.ok(true, 'Tests that first param is true.');
    assert.equal('1', 1, 'Tests that first two params are equal (may cast).');
    assert.strictEqual(5, 5, 'Tests that first two params are strictly equal.');
});

// Saadiyah
// QUnit.asyncTest("Post Test", function (assert) {
//
// });

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
        success: function (data, status) {
            assert.ok(data.success, 'Check for success.')
            assert.deepEqual(data.content, [], 'Array is empty.');
            console.log(data);
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
