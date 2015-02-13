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


  it('must reject a duplicate task', function() {
    return scheduler().createTask('Test Task', userId)
    .should.eventually.be.rejected;
  });


  it('must save a task', function() {
    return scheduler().saveTask(task)
    .should.eventually.have.property('_id')
    .and.deep.equal(task._id);
  });


  it('must load a task by id', function() {
    return scheduler().getTask(task._id)
    .should.eventually.have.property('_id')
    .and.deep.equal(task._id);
  });


  it('must save user id', function () {
    return task.should.have.property('userId')
      .and.deep.equal(userId);
  });


  it('must disable a task', function () {
    return scheduler().disableTask(task._id)
    .should.eventually.have.property('enabled')
    .and.deep.equal(false);
  });


  it('must enable a task', function () {
    return scheduler().enableTask(task._id)
    .should.eventually.have.property('enabled')
    .and.deep.equal(true);
  });


  // it('must give level 1 for no logged time', function() {
  //   return scheduler().getSkillLevelForTask(task._id)
  //     .should.eventually.equal(1);
  // });


  it('must add time to the log', function () {
    return scheduler()
      .addTime(task._id, 500, 500, Date.now())
      .should.eventually.have.property('log')
      .and.length(1);
  });


  it('must level up', function() {
    return scheduler().getTask(task._id)
    .should.eventually.have.property('level')
    .and.equal(2);
  });


  it('must get the total time logged', function() {
    return scheduler().getTotalTime(task._id)
    .should.eventually.equal(500);
  });


  it('must add time to the log again', function () {
    return scheduler()
      .addTime(task._id, 10000, 500, Date.now())
      .should.eventually.have.property('log')
      .and.length(2);
  });





  // it('must calculate level', function() {
  //   return scheduler().getSkillLevelForTask(task._id)
  //     .should.eventually.equal(100);
  // });



});
