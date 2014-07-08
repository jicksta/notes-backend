var ConcurrencyFunnel = require('../../lib/concurrency_funnel'),
    SpyPromise = require('../util/spy_promise'),
    RSVP = require('rsvp'),
    _ = require('underscore');

describe('ConcurrencyFunnel', function() {
  var limit;

  beforeEach(function() {
    limit = 3;
  });

  it('runs LIMIT at a time', function(done) {
    var items = [0, 1, 2, 3, 4, 5],
        length = items.length;
    var promises = items.map(makePromise),
        started = promises.map(_.constant(false));

    var factory = function() {
      var promise = promises[this];
      promise.started = true;
      return promise;
    };

    var finalResult,
        allSettled = false,
        funnel = new ConcurrencyFunnel(limit, items, factory),
        funnelPromise = funnel.start();

    funnelPromise.then(function(result) {
      allSettled = true;
      finalResult = result;
    });

    // All promises should be unsettled
    expectStates("settled", promises, false);

    // Only the first three should have been started by start()
    expectStates("started", promises.slice(0, 3), true);
    expectStates("started", promises.slice(3, length), false);

    // Let's resolve one of the first 3.
    promises[1].resolve("eins");
    promises[1].finally(function() {
      expectStates("settled", promises[1], true);

      // Now (only) the next promise should be started.
      expectStates("started", promises[3], true);
      expectStates("started", promises.slice(4, length), false);
      expectStates("settled", promises.slice(3, length), false);
    }).finally(done);

    // Now let's resolve all except the next-to-last one.
    promises[0].resolve("null");
    promises[2].resolve("zwei");
    promises[3].resolve("drei");
    promises[5].resolve("fuenf");

    RSVP.all([promises[0], promises[2], promises[3], promises[5]]).finally(function() {

      // All should be started now
      expectStates("started", promises, true);

      // We're not yet allSettled even though the last one in list is done.
      expect(allSettled).toEqual(false);

    }).finally(function() {

      // Let's resolve the last straggler.
      promises[4].resolve("vier");
      return promises[4];

    }).finally(function() {
      // And we're done!
      expect(allSettled).toEqual(true);
      expectStates("settled", promises, true);

      expect(finalResult.length).toEqual(length);
      var finalStates = _.pluck(finalResult, 'state');
      var finalValues = _.pluck(finalResult, 'value');

      expect(finalStates).toEqual(items.map(_.constant('fulfilled')));
      expect(finalValues).toEqual(["null", "eins", "zwei", "drei", "vier", "fuenf"]);

    }).finally(done);
  });

  describe("test helpers", function() {
    it("creates promises that can become resolved", function(done) {
      var promise = makePromise("test");
      expect(promise.settled).toEqual(false);
      promise.reject();
      promise.finally(function() {
        expect(promise.settled).toEqual(true);
      }).finally(done);
    });
  });

  function expectStates(property, promises, isSettled) {
    var allOrNone = isSettled ? _.every : none;
    if(!_.isArray(promises)) promises = [promises];

    var labels = _.pluck(promises, "label").join(","),
        thatIsTheQuestion = isSettled ? " to be " : " not to be ";
    var message = "Expected " + labels + thatIsTheQuestion + property;

    expect(allOrNone(_.pluck(promises, property))).toEqual(true, message);
  }

  function makePromise(label) {
    var promise = SpyPromise(label);
    promise.started = false;
    return promise;
  }

  // Opposite of _.every
  function none(items) {
    for (var i = 0; i < items.length; i++) {
      if (items[i]) return false;
    }
    return true;
  }

});
