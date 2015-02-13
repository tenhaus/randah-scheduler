'use strict';

var q = require('q');
var mongoose = require('mongoose');
var _ = require('lodash-node');
var exp = require('voxel-exp');

var minLevel = 1;
var maxLevel = 1000;

var expOptions = {
  minLevel:minLevel,
  maxLevel:maxLevel
};

var TaskModel = mongoose.model(
  'Task',
  {
    name: String,
    userId: String,
    enabled: Boolean,
    level: Number,
    log: [{
      duration: Number,
      worked: Number,
      date: Date,
      xp: Number
    }]
  }
);

function xpForTime(duration, worked, currentLevel)
{
  var percentWorked = worked / duration;
  var credited = duration * percentWorked;

  if(currentLevel < 10) {
    credited *= 0.10;
  }

  credited = 10000;
  return credited;
}

module.exports = function () {

    return {

    createTask : function(name, userId) {
      return q.Promise(function(resolve, reject) {
        new TaskModel({
            name:name,
            userId: userId,
            level: 1,
            enabled: true
          })
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

        var previousXp = 0;

        _.forEach(task.log, function(log) {
          previousXp += log.xp;
        });

        // Calculate the xp
        var xp = xpForTime(duration, worked, task.level);

        // Level maybe
        var leveler = exp('Tasks', expOptions);
        leveler.inc(previousXp + xp);

        task.level = leveler.currentLevel();

        // Add the data to the log
        task.log.push(
          {duration: duration, worked: worked, date: date, xp: xp}
        );

        // Save the task
        return self.saveTask(task);
      });
    },


    levelUp: function(taskId, level) {
      console.log('level up ' + level);
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


    // getSkillLevelForTask : function(taskId) {
    //   var self = this;
    //
    //   return q.Promise(function(resolve, reject) {
    //     this.getTotalTime(taskId)
    //     .then(function(time, err) {
    //       if (err) reject(err);
    //       else {
    //         exp('test', expOptions).inc(time);
    //       }
    //     });
    //   });
    // },





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
