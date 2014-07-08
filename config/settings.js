var _ = require('underscore'),
    assert = require('assert'),
    env = require('./environment')();

var defaults = {
  sandbox: true,
  logEvernoteResponses: true,
  concurrentAPIRequests: 25,

  paginationPageSizeDefault: 20,
  paginationPageSizeMax: 100,

  // gibberish: true,

  oauthStartPath: "/api/oauth/start",
  oauthCallbackURL: "http://localhost:4000/api/oauth/finish",
  oauthSuccessRedirectURL: "/notes"
};

var overrides = {
  development: {
    sandbox: false
  }
};

var settings = module.exports = _.extend(defaults, overrides[env]);

// Collect any assertions below here. //
assert.ok(env !== "test" || settings.sandbox); // Require sandbox:true in test env
assert.ok(settings.paginationPageSizeDefault <= settings.paginationPageSizeMax);
