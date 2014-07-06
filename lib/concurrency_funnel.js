var RSVP = require('rsvp');

module.exports = ConcurrencyFunnel;

function ConcurrencyFunnel(limit, items, promiseFactoryFn) {
  this.limit = limit;
  this.promiseFactory = promiseFactoryFn;

  this.promises = [];
  this.remaining = items.slice(0); // clone

  this.numRunning = 0;
}

ConcurrencyFunnel.prototype = {

  // See RSVP.allSettled for a description of what gets passed to the downstream callbacks
  start: function() {
    var self = this;

    // The aggregatePromise will only be resolved, not rejected.
    var aggregatePromise = new RSVP.Promise(function(resolve) {
      self._startNext();
      self._resolve = resolve;
    });

    return aggregatePromise;
  },

  _startNext: function() {
    var self = this,
        nextItem = self.remaining.shift();

    if(typeof nextItem !== 'undefined') {
      var promise = self.promiseFactory.call(nextItem);

      self._promiseStarted(promise);

      promise.finally(function() {
        self._promiseFinished();
      });

      if(!self.atCapacity()) {
        return self._startNext(); // tail-call recursion optimized
      }
    }
  },

  atCapacity: function() {
    return this.numRunning >= this.limit;
  },

  _promiseStarted: function(promise) {
    this.promises.push(promise);
    this.numRunning++;
  },

  _promiseFinished: function() {
    this.numRunning--;
    if(!this.atCapacity()) {
      this._startNext();
    }
    if(this.numRunning === 0) {
      this._resolve(RSVP.allSettled(this.promises));
    }
  }

};
