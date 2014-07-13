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
  // stubServiceSaving: true,
  stubSessionWithTestAccount: false,

  loginPath: "/api/oauth/start",
  oauthCallbackURL: "http://localhost:4000/api/oauth/finish",
  oauthSuccessRedirectURL: "http://localhost:4200/signin-success.html"
};

var overrides = {
//  development: { sandbox: false }
};

var settings = module.exports = _.extend(defaults, overrides[env]);

//// Collect any assertions below here.
assert.ok(!(env === "test" && !settings.sandbox), "Tests must be ran in sandbox mode!");
assert.ok(settings.paginationPageSizeDefault <= settings.paginationPageSizeMax, "Invalid paginationPageSizeDefault");
assert.ok(!(settings.stubSessionWithTestAccount && env === "production"), "Cannot stub sessions in production!");
//assert.ok(!(settings.gibberish && !stubServiceSaving), "Must stub service saving in gibberish mode!");
