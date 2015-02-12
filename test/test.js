/*global describe, it, before, after */
'use strict';

var mongoose = require('mongoose');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

var scheduler = require('../');

chai.use(chaiAsPromised);
chai.should();

describe('randah-scheduler node module', function () {

  var task = {};
  var userId = '54dbdd9f863dba796188d72e';

  before(function() {
    mongoose.connect('mongodb://localhost/scheduler-test');
  });


  after(function() {
    task.remove();
  });


  it('must create a task', function (done) {
    scheduler().createTask('Test Task', userId)
      .then(function(res, err) {
        if (err) throw err;
        task = res;
        done();
      });
  });

  it('must save user id', function () {
    return task.should.have.property('userId')
      .and.equal(userId);
  });


  it('must disable a task', function () {
    return scheduler().disableTask(task)
      .should.eventually.equal(true);
  });


  it('must enable a task', function () {
    return scheduler().enableTask(task)
      .should.eventually.equal(true);
  });


  it('must add time to the log', function () {
    return scheduler()
      .addTime(task, 100, 50, Date.now())
      .should.eventually.have.property('log')
      .and.length(1);
  });


});
