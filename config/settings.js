module.exports = {
  oauthSuccessRedirectURL: "/notes",
  oauthCallbackURL: "http://localhost:4000/api/v1/oauth/finish",
  sandbox: true,
  logEvernoteResponses: true,
  concurrentRequests: 10
};
