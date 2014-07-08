var fixtures = require('../support/fixtures'),
    fs = require('fs');
describe("Fixtures", function() {

  var testFixtureName;
  beforeEach(function() {
    testFixtureName = "fixture_meta_spec";
  });

  afterEach(function() {
    if (fixtures.exists(testFixtureName)) {
      fixtures.remove(testFixtureName)
    }
  });

  it("can load what it saves (happy path)", function() {
    var content = {test: true};
    fixtures.save(testFixtureName, content);
    expect(fixtures.load(testFixtureName)).toEqual(content);
  });

  it("clones loaded fixtures", function() {
    fixtures.save(testFixtureName, {doesnt: "matter"});
    var first = fixtures.load(testFixtureName);
    first.polluted = true;
    expect(fixtures.load(testFixtureName).polluted).toBeUndefined();
  });

});
