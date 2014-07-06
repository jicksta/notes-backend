module.exports = {

  toFinish: function(done) {
    return expect(this.actual).toFinishWith(done, noop);
  },
  toFinishWith: function(done, fn) {
    var isNot = this.isNot;
    this.actual.then(fn).catch(function(err) {
      var expectation = expect(err);
      if(isNot) expectation = expectation.not;
      expectation.toBeDefined(err);
    }).finally(done);
  },

  toBeInstanceOf: function(klass) {
    return this.actual instanceof klass;
  }
};

function noop() {}
