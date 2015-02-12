'use strict';

var q = require('q');
var mongoose = require('mongoose');

// var skillLevelCap = 60;

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
            if(err) reject(err);
            else resolve(savedTask);
          });
      });
    },


    addTime : function(task, duration, worked, date) {
      task.log.push(
        {duration: duration, worked: worked, date: date}
      );

      return q.Promise(function(resolve, reject) {
        task.save(function(err, savedTask) {
          if(err) reject(err);
          else resolve(savedTask);
        });
      });
    },


    getSkillLevel : function() {

    },


    toggleTaskEnabled : function(task, isEnabled) {
      task.enabled = isEnabled;
      return q.Promise(function(resolve, reject) {
        task.save(function(err, savedTask) {
          if(err) reject(err);
          else resolve(savedTask.enabled === isEnabled);
        });
      });
    },


    enableTask : function(task) {
      return this.toggleTaskEnabled(task, true);
    },


    disableTask : function(task) {
      return this.toggleTaskEnabled(task, false);
    },

  };

};
