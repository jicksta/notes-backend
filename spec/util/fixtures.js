var fs = require('fs'),
    _ = require('underscore');

var CACHE = {},
    FIXTURE_DIR = fs.realpathSync("spec/fixtures"),
    WARNING_SIZE_IN_BYTES = 1024 * 50;

module.exports.load = load;
module.exports.save = save;
module.exports.exists = exists;
module.exports.remove = remove;
module.exports.fixtureDirExists = fixtureDirExists;
module.exports.fixturePath = fixturePath;
module.exports.prettify = prettify;

function load(fixtureName) {
  if(fixtureName in CACHE) {
    return _.clone(CACHE[fixtureName]);
  }

  var filepath = fixturePath(fixtureName);

  if(!exists(fixtureName)) {
    throw("Fixture " + fixtureName + " does not exist on the filesystem at " + filepath);
  }

  var contents = fs.readFileSync(filepath);
  var parsed = JSON.parse(contents);
  CACHE[fixtureName] = parsed;
  return _.clone(parsed);
}

function save(fixtureName, contents) {
  var json = _.isString(contents) ? contents : prettify(contents);
  checkFixtureWarnings(fixtureName, json);

  var filepath = fixturePath(fixtureName);
  fs.writeFileSync(filepath, json);
}

function remove(fixtureName) {
  var filepath = fixturePath(fixtureName);
  fs.unlinkSync(filepath);
}

function prettify(obj) {
  return JSON.stringify(obj, null, 4);
}

function fixturePath(fixtureName) {
  return FIXTURE_DIR + '/' + fixtureName + ".json";
}

function exists(fixtureName) {
  return fs.existsSync(fixturePath(fixtureName));
}

function checkFixtureWarnings(fixtureName, fixtureContent) {
  if(!_.isString(fixtureContent)) {
    throw("Must pass a string into this checkFixtureWarnings");
  }
  if(fixtureContent.length > WARNING_SIZE_IN_BYTES) {
    var sizeKB = (fixtureContent.length / 1024).toFixed(2);
    console.warn("WARNING: %s is getting too large! (%d kB)", fixtureName, sizeKB)
  }
}

function fixtureDirExists() {
  return fs.existsSync(FIXTURE_DIR);
}
