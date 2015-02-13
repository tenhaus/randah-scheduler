'use strict';

var q = require('q');
var mongoose = require('mongoose');
var _ = require('lodash-node');
var primality = require('primality');


var minLevel = 1;
var skillTimeDivisor = 5;

var TaskModel = mongoose.model(
  'Task',
  {
    name: String,
    userId: String,
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


    createTask : function(name, userId) {
      return q.Promise(function(resolve, reject) {
        new TaskModel({name:name, userId: userId, enabled: true})
          .save(function(err, savedTask) {
            if (err) reject(err);
            else resolve(savedTask);
          });
      });
    },


    getTask : function(taskId) {
      return q.Promise(function(resolve, reject) {
        var query  = TaskModel.where({ _id: taskId });
        query.findOne(function(err, task) {
          if (err) reject(err);
          else resolve(task);
        });
      });
    },


    saveTask : function(task) {
      return q.Promise(function(resolve, reject) {
        task.save(function(err, savedTask) {
          if (err) reject(err);
          else resolve(savedTask);
        });
      });
    },


    addTime : function(taskId, duration, worked, date) {
      var self = this;

      return this.getTask(taskId)
      .then(function(task, err) {
        if(err) throw err;

        // Add the data to the log
        task.log.push(
          {duration: duration, worked: worked, date: date}
        );

        // Save the task
        return self.saveTask(task);
      });
    },


    getTotalTime : function(taskId) {
      return this.getTask(taskId)
      .then(function(task, err) {
        if(err) throw err;

        var totalTime = 0;
        _.forEach(task.log, function(log) {
          totalTime += log.duration;
        });

        return totalTime;
      });
    },


    getSkillLevelForUser : function(userId) {
      var self = this;

      return q.Promise(function(resolve, reject) {
        var query  = TaskModel.where({ userId: userId });

        query.findOne(function(err, task) {
          if (err) reject(err);
          else resolve(self.calculateSkillLevelForTask(task));
        });
      });
    },


    calculateSkillLevelForTask : function(task) {
      if(task.log.length === 0) return minLevel;

      var totalTime = 0;

      _.forEach(task.log, function(log) {
        totalTime += log.duration;
      });

      // Scale the time
      var adjustedTime = Math.round(totalTime / skillTimeDivisor);

      // Find the lowest cousin prime if adjusted
      // isn't a prime
      while(!primality(adjustedTime)) {
        adjustedTime -= 1;
      }



      return adjustedTime;
    },


    toggleTaskEnabled : function(taskId, isEnabled) {
      var self = this;

      return this.getTask(taskId)
      .then(function(task) {

        // Toggle whether the task is enabled
        task.enabled = isEnabled;

        // Save the task
        return self.saveTask(task);
      });
    },


    enableTask : function(taskId) {
      return this.toggleTaskEnabled(taskId, true);
    },


    disableTask : function(taskId) {
      return this.toggleTaskEnabled(taskId, false);
    },

  };

};
