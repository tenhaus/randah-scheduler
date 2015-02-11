'use strict';

var q = require('q');
var mongoose = require('mongoose');

var TaskModel = mongoose.model(
  'Task',
  {
    name: String,
    enabled: Boolean,
    log: [{
      duration: Number,
      worked: Number,
      date: Date
    }]
  }
);

module.exports = function () {

  return {

    createTask : function(name) {
      var task = new TaskModel({name:name, enabled: true});

      return q.Promise(function(resolve, reject) {
        task.save(function(err, savedTask) {
          if(err) {
            reject(err);
          }
          else {
            resolve(savedTask);
          }
        });
      });
    },

    disableTask : function(task) {
      return q.Promise(function(resolve, reject) {
        task.enabled = false;
        task.save(function(err, savedTask) {
          if(err) {
            reject(err);
          }
          else {
            resolve(!savedTask.enabled);
          }
        });
      });
    },

    enableTask : function(task) {
      return q.Promise(function(resolve, reject) {
        task.enabled = true;
        task.save(function(err, savedTask) {
          if(err) {
            reject(err);
          }
          else {
            resolve(savedTask.enabled);
          }
        });
      });
    },

    addTime : function(task, duration, worked, date) {
      var log = {
        duration:duration, worked:worked, date:date
      };

      task.log.push(log);

      return q.Promise(function(resolve, reject) {
        task.save(function(err, savedTask) {
          if(err) {
            reject(err);
          }
          else {
            resolve(savedTask);
          }
        });
      });
    }

  };

};
