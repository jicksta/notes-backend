module.exports.install = function(router) {

  var oauth = require("../controllers/api/oauth"),
      accounts = require("../controllers/api/accounts"),
      notes = require("../controllers/api/notes");

  router.get("/api/v1/users/me", accounts.me);
  router.get("/api/v1/logout", accounts.logout);
  router.get("/api/v1/notebooks", notes.notebooks);
  router.get("/api/v1/oauth/start", oauth.oauthStart);
  router.get("/api/v1/oauth/finish", oauth.oauthFinish);

};
