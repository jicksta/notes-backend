var RSVP = require('rsvp');

module.exports = function(label) {
  label = (label || "SpyPromise").toString();

  var resolve, reject;
  var promise = new RSVP.Promise(function(yep, nope) {
    resolve = yep;
    reject = nope;
  }, label);

  promise.resolve = resolve;
  promise.reject = reject;

  promise.label = label;
  promise.settled = false;

  promise.finally(function() {
    promise.settled = true;
  });

  return promise;
};
