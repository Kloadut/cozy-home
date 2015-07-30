// Generated by CoffeeScript 1.9.3
var Application, NotificationsHelper, StackApplication, TIME_BETWEEN_UPDATE_CHECKS, async, checkUpdate, checkUpdates, createAppUpdateNotification, createStackUpdateNotification, localization, log, removeAppUpdateNotification, removeStackUpdateNotification,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

async = require('async');

NotificationsHelper = require('cozy-notifications-helper');

log = require('printit')({
  prefix: 'application updates'
});

Application = require('../models/application');

StackApplication = require('../models/stack_application');

localization = require('../lib/localization_manager');

TIME_BETWEEN_UPDATE_CHECKS = 1000 * 60 * 60 * 24;

checkUpdate = function(app, callback) {
  log.info(app.name + " - checking for an update...");
  return app.checkForUpdate(function(err, setUpdate) {
    var shouldBeUpdated;
    if (err != null) {
      log.error(app.name + " - Error while checking update.");
      log.raw(err);
    } else if (setUpdate) {
      log.info(app.name + " - update required.");
    } else {
      log.info(app.name + " - no update required.");
    }
    shouldBeUpdated = (err == null) && setUpdate;
    return callback(shouldBeUpdated);
  });
};

removeAppUpdateNotification = function(notifier, app) {
  var message, messageKey, notificationSlug;
  messageKey = 'update available notification';
  message = localization.t(messageKey, {
    appName: app.name
  });
  notificationSlug = "home_update_notification_app_" + app.name;
  return notifier.destroy(notificationSlug, function(err) {
    if (err != null) {
      return log.error(err);
    }
  });
};

removeStackUpdateNotification = function(notifier, app) {
  var message, messageKey, notificationSlug;
  messageKey = 'stack update available notification';
  message = localization.t(messageKey);
  notificationSlug = "home_update_notification_stack";
  return notifier.destroy(notificationSlug, function(err) {
    if (err != null) {
      return log.error(err);
    }
  });
};

createAppUpdateNotification = function(notifier, app) {
  var message, messageKey, notificationSlug;
  messageKey = 'update available notification';
  message = localization.t(messageKey, {
    appName: app.name
  });
  notificationSlug = "home_update_notification_app_" + app.name;
  return notifier.createOrUpdatePersistent(notificationSlug, {
    app: 'konnectors',
    text: message,
    resource: {
      app: 'home',
      url: "update/" + app.slug
    }
  }, function(err) {
    if (err != null) {
      return log.error(err);
    }
  });
};

createStackUpdateNotification = function(notifier) {
  var message, messageKey, notificationSlug;
  messageKey = 'stack update available notification';
  message = localization.t(messageKey);
  notificationSlug = "home_update_notification_stack";
  return notifier.createOrUpdatePersistent(notificationSlug, {
    app: 'konnectors',
    text: message,
    resource: {
      app: 'home',
      url: "update-stack"
    }
  }, function(err) {
    if (err != null) {
      return log.error(err);
    }
  });
};

checkUpdates = function() {
  var notifier;
  notifier = new NotificationsHelper('home');
  log.info('Checking if app updates are available...');
  return async.series({
    applications: Application.all,
    stackApplications: StackApplication.all
  }, function(err, results) {
    var applications, stackApplications;
    if (err != null) {
      log.error("Error when checking apps versions:");
      return log.raw(err);
    } else {
      applications = results.applications, stackApplications = results.stackApplications;
      return async.filterSeries(applications, checkUpdate, function(appsToUpdate) {
        var application, i, len;
        for (i = 0, len = applications.length; i < len; i++) {
          application = applications[i];
          if (indexOf.call(appsToUpdate, application) >= 0) {
            createAppUpdateNotification(notifier, application);
          } else {
            removeAppUpdateNotification(notifier, application);
          }
        }
        return async.some(stackApplications, checkUpdate, function(shouldBeUpdated) {
          if (shouldBeUpdated) {
            return createStackUpdateNotification(notifier);
          } else {
            return removeStackUpdateNotification(notifier);
          }
        });
      });
    }
  });
};

module.exports = function() {
  checkUpdates();
  return setInterval(checkUpdates, TIME_BETWEEN_UPDATE_CHECKS);
};
