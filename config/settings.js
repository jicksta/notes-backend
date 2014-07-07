var _ = require('underscore'),
    env = require('./environment')();

var defaults = {
  sandbox: true,
  logEvernoteResponses: true,
  concurrentAPIRequests: 10,

  oauthStartPath: "/api/oauth/start",
  oauthCallbackURL: "http://localhost:4000/api/oauth/finish",
  oauthSuccessRedirectURL: "/notes"
};

var overrides = {
  development: {
    sandbox: false
  }
};

module.exports =  _.extend(defaults, overrides[env]);
