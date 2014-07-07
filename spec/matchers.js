var _ = require('underscore');

module.exports = {

  toBeInstanceOf: function(klass) {
    return this.actual instanceof klass;
  },

  toBeEmpty: function() {
    return _.isEmpty(this.actual);
  },

  toBeArray: function() {
    return _.isArray(this.actual);
  },

  toBeString: function() {
    return _.isString(this.actual);
  },

  toBePromise: function() {
    return typeof this.actual.then === 'function';
  },

  toBeObject: function() {
    return _.isObject(this.actual) && !_.isArray(this.actual);
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
    if(arguments.length !== 2) throw("You must pass two arguments to toFinishWith");

    this.actual.then(fn).catch(function(err) {
      var errMessage = err.stack ? err.stack : err.toString();
      expect(err).not.toBeDefined(err, "Promise rejected with error: " + errMessage);
    }).finally(done);

    return true;
  },

};

function noop() {}
