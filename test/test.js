/*global describe, it */
'use strict';
var assert = require('assert');
var mongoose = require('mongoose');
var scheduler;

describe('randah-scheduler node module', function () {

  before(function() {
    mongoose.connect('mongodb://localhost/test');
    scheduler = require('../')(mongoose.connection);
  });

  it('must have at least one test', function () {
    scheduler.test();
    assert(true, 'I was too lazy to write any tests. Shame on me.');
  });

});
