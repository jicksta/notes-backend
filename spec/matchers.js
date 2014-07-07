var _ = require('underscore');

module.exports = {

  toBeInstanceOf: function(klass) {
    return this.actual instanceof klass;
  },

  toBeEmpty: function() {
    return _.isEmpty(this.actual);
  },

  toBePromise: function() {
    return typeof this.actual.then === 'function';
  },

  toFinish: function(done) {
    if(arguments[1]) throw("Do NOT pass a callback to toFinish(). Use toFinishWith() instead");
    var isNot = this.isNot;
    expect(this.actual).toBePromise();
    if(isNot) {
      var spy = jasmine.createSpy("for promise NOT toFinish()");
      this.actual.then(spy).finally(function() {
        expect(spy).not.toHaveBeenCalled();
        done()
      });
    } else {
      expect(this.actual).toFinishWith(done, noop);
    }
    return !isNot;
  },

  toFinishWith: function(done, fn) {
    if(this.isNot) throw("expect().not negation not allowed for .toFinishWith()");

    this.actual.then(fn).catch(function(err) {
      var errMessage = err.stack ? err.stack : err.toString();
      expect(err).not.toBeDefined(err, "Promise rejected with error: " + errMessage);
    }).finally(done);

    return true;
  },

};

function noop() {}
