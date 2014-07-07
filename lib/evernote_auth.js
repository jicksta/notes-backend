var secrets = require("../config/secrets"),
    settings = require("../config/settings"),
    _ = require("underscore"),
    RSVP = require("rsvp"),
    Evernote = require("evernote").Evernote;

module.exports = EvernoteAuth;

function EvernoteAuth(options) {
  this.options = _.defaults(options || {}, {
    sandbox: settings.sandbox,
    consumerKey: secrets.evernote.consumerKey,
    consumerSecret: secrets.evernote.consumerSecret,
    callbackUrl: settings.oauthCallbackURL,
    signatureMethod: "HMAC-SHA1"
  });
}

EvernoteAuth.prototype = {

  makeClient: function() {
    return new Evernote.Client({
      consumerKey: secrets.evernote.consumerKey,
      consumerSecret: secrets.evernote.consumerSecret,
      sandbox: this.options.sandbox
    });
  },

  oauthSetup: function() {
    var self = this,
        client = self.makeClient();

    return new RSVP.Promise(function(resolve, reject) {
      client.getRequestToken(self.options.callbackUrl, function(error, oauthToken, oauthTokenSecret) {
        if(error) {
          return reject(error);
        }
        resolve({
          oauthToken: oauthToken,
          oauthTokenSecret: oauthTokenSecret,
          redirectTo: client.getAuthorizeUrl(oauthToken)
        });
      });
    });
  },

  oauthFinish: function(oauthVerifier, oauthToken, oauthTokenSecret) {
    var self = this,
        client = self.makeClient();

    return new RSVP.Promise(function(resolve, reject) {
      client.getAccessToken(oauthToken, oauthTokenSecret, oauthVerifier,
          function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
            if(error) {
              reject(error);
            } else {
              resolve(self.prepareSessionParams(oauthAccessToken, oauthAccessTokenSecret, results));
            }
          });
    });
  },

  prepareSessionParams: function(oauthAccessToken, oauthAccessTokenSecret, result) {
    return {
      evernote: {
        accessToken: oauthAccessToken,
        accessTokenSecret: oauthAccessTokenSecret,
        userID: result.edam_userId,
        shard: result.edam_shard,
        expires: result.edam_expires,
        notestore: result.edam_noteStoreUrl,
        webapi: result.edam_webApiUrlPrefix
      }
    };
  }

};
