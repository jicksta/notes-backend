module.exports.install = function(router) {

  var oauth = require("../controllers/oauth"),
      accounts = require("../controllers/accounts");

  router.get("/api/v1/me", accounts.me);
  router.get("/api/v1/logout", accounts.logout);
  router.get("/api/v1/oauth/start", oauth.oauthStart);
  router.get("/api/v1/oauth/finish", oauth.oauthFinish);

  // router.oauthFinishPath = "/api/v1/oauth/finish";

};
