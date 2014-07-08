require('../../config/environment').set('test');

var matchers = require('../support/matchers'),
    settings = require('../../config/settings');

beforeEach(function() {
  this.addMatchers(matchers);
});
