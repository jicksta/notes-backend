exports.me = function(req, res) {
  var accountParams = req.session.evernote;
  if (accountParams && accountParams.userID) {
    if(req.xhr) {
      res.json(accountParams);
    } else {
      res.render("me", accountParams);
    }
  } else {
    if (req.xhr) {
      res.json(401, {error: "Not authenticated!"});
    } else {
      res.redirect("/api/v1/oauth/start");
    }
  }
};

exports.logout = function(req, res) {
  res.session.destroy(function(err) {
    err ? res.json(500, err) : res.json({});
  });
};
