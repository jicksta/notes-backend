require('../config/environment').set('test');

var matchers = require('./matchers'),
    settings = require('../config/settings');

beforeEach(function() {
  this.addMatchers(matchers);
});
