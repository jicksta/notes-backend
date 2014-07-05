var querystring = require('querystring'),
    secrets = require("../config/secrets"),
    _ = require("underscore"),
    RSVP = require("rsvp"),
    OAuth = require("../vendor/jsOAuth.js").OAuth;

module.exports = EvernoteAuth;

function EvernoteAuth(options) {
  this.options = _.defaults(options, {
    sandbox: true,
    consumerKey: secrets.evernote.consumerKey,
    consumerSecret: secrets.evernote.consumerSecret,
    callbackUrl: "http://localhost:4000/api/v1/oauth/finish",
    signatureMethod: "HMAC-SHA1"
  });

  this.oauth = OAuth(this.options);
}

EvernoteAuth.prototype = {

  evernoteHostName: function() {
    return this.options.sandbox? "https://sandbox.evernote.com" : "https://www.evernote.com";
  },

  oauthURL: function() {
    return this.evernoteHostName() + '/oauth';
  },

  redirectURLFromToken: function(token) {
    return this.evernoteHostName() + '/OAuth.action?oauth_token=' + token;
  },

  oauthSetup: function() {
    var self = this;
    return new RSVP.Promise(function(resolve, reject) {
      self.oauth.request({
        url: self.oauthURL(),
        method: 'GET',
        failure: reject,
        success: function(response) {
          var responseParams = querystring.parse(response.text);
          resolve({
            oauthToken: responseParams.oauth_token,
            oauthTokenSecret: responseParams.oauth_token_secret,
            redirectTo: self.redirectURLFromToken(responseParams.oauth_token)
          });
        }
      });
    });
  },

  oauthFinish: function(oauthVerifier, oauthToken, oauthSecret) {
    var self = this;
    return new RSVP.Promise(function(resolve, reject) {
      self.oauth.setVerifier(oauthVerifier);
      self.oauth.setAccessToken([oauthToken, oauthSecret]);

      self.oauth.request({
        method: 'GET',
        url: self.oauthURL(),
        failure: reject,
        success: function(response) {
          var parsed = querystring.parse(response.text),
              prettified = self.prepareSessionParams(parsed);
          resolve(prettified);
        }
      });
    });
  },

  prepareSessionParams: function(result) {
    return {
      evernote: {
        userID: result.edam_userId,
        shard: result.edam_shard,
        expires: result.edam_expires,
        token: result.oauth_token,
        notestore: result.edam_noteStoreUrl,
        webapi: result.edam_webApiUrlPrefix
      }
    };
  }


};

//function oauthFinishURL() {
//  return require("./routes").oauthFinishPath;
//}
