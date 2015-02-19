'use strict';

var q = require('q');
var mongoose = require('mongoose');
var _ = require('lodash-node');
var randahLeveler = require('randah-leveler');

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
      date: Date
    }]
  }
);

module.exports = function () {

    return {


    createTask : function(name, userId) {
      var deferred = q.defer();
      var query  = TaskModel.where(
        { name: name.trim(), userId: userId }
      );

      // Make sure there isn't already a task
      // with this name
      q.ninvoke(query, 'findOne')
      .then(function(task) {
        if(task) {
          deferred.reject(
            new Error('There\'s already a task with this name')
          );
          return true;
        }

        return false;
      })

      // If we didn't find a task then we're
      // creating a new one
      .then(function(wasRejected) {
        if(wasRejected) return;

        new TaskModel({
            name:name.trim(),
            userId: userId,
            level: 1,
            enabled: true
        })
        .save(function(err, savedTask) {
          if (err) deferred.reject(err);
          else deferred.resolve(savedTask);
        });
      })
      .fail(function(err) {
        deferred.reject(new Error(err));
      });

      return deferred.promise;
    },


    deleteTask : function(taskId) {
      return this.getTask(taskId)
      .then(function(task, err) {
        if(err) throw err;        
        return task.remove();
      });
    },


    schedule : function(amountOfTime) {
      return q.Promise(function(resolve, reject) {
        if(amountOfTime <= 0 ||
           amountOfTime === undefined) {
             reject('Must provide an amount of time');
        }
        else {
          console.log(amountOfTime);
          resolve([]);
        }
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

        var previousWorked = 0;

        _.forEach(task.log, function(log) {
          previousWorked += log.worked;
        });

        // Level maybe
        var leveler = randahLeveler();
        leveler.increment(previousWorked + worked);

        // Update the level
        task.level = leveler.level();

        // Add the data to the log
        task.log.push(
          {duration: duration, worked: worked, date: date}
        );

        // Save the task
        return self.saveTask(task);
      });
    },


    resetTime: function(taskId) {
      var self = this;

      return this.getTask(taskId)
      .then(function(task, err) {
        if(err) throw err;

        // Reset the log
        task.log = [];
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
