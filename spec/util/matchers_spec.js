var RSVP = require('rsvp');

describe('Custom matchers', function() {

  describe('toBeInstanceOf', function() {
    it('works with objects', function() {
      var obj = new Buffer(0);
      expect(obj).toBeInstanceOf(Buffer);
    });
  });

  describe('toFinish (async)', function() {

    it('executes the done callback if the promise is resolved', function(done) {
      var promise = new RSVP.Promise(function(resolve) {
        resolve();
      });
      expect(promise).toFinish(done);
    });

    it('does not report an error when expected not to finish', function(done) {
      var promise = new RSVP.Promise(function(resolve, reject) {
        reject("FAIL!");
      });
      expect(promise).not.toFinish(done);
    });

  });

});
