var TopLevelView = require('ui/common/components/TopLevelView');
var ButtonView = require('ui/common/components/ButtonView');
var SeparatorView = require('ui/common/components/SeparatorView');
var Palette = require('ui/common/components/Palette');
var loginHelper = require('helpers/LoginHelper');
var ConfirmDialog = require('ui/common/components/ConfirmDialog');
var Measurements = require('ui/common/components/Measurements');

function LoginView() {

  var topLevelView = new TopLevelView('Login');

  var self = Ti.UI.createView({
    layout : 'vertical',
    top : '120dip'
  });
  topLevelView.add(self);

  var emailField = Ti.UI.createTextField({
    width : '80%',
    hintText : 'Email',
    top : 20
  });

  var passwordField = Ti.UI.createTextField({
    width : '80%',
    hintText : 'Password',
    passwordMask : true
  });

  var loginButton = new ButtonView('Login', {
    width : '60%'
  });

  var activityIndicator = Ti.UI.Android.createProgressIndicator({
    message : 'Logging in...',
    location : Ti.UI.Android.PROGRESS_INDICATOR_DIALOG,
    type : Ti.UI.Android.PROGRESS_INDICATOR_INDETERMINANT
  });

  topLevelView.networkServerUnreachable =  function() {
    activityIndicator.hide();
  };

  Ti.App.addEventListener('network.server.unreachable', topLevelView.networkServerUnreachable);

  topLevelView.networkOffline = function() {
    activityIndicator.hide();
  };

  Ti.App.addEventListener('network.offline', topLevelView.networkOffline);

  topLevelView.loginDone = function() {
    activityIndicator.hide();
  };

  Ti.App.addEventListener('login.done', topLevelView.loginDone);

  var populateUserName = function() {
    var oldEmail = Ti.App.Properties.getString('email');
    var loggedIn = Ti.App.Properties.getString('loggedIn');
    if (oldEmail && loggedIn)
      emailField.setValue(oldEmail);
  }();


  self.add(activityIndicator);
  self.add(emailField);
  self.add(passwordField);
  self.add(new SeparatorView(Palette.SECONDARY_COLOR_LIGHT, Measurements.PADDING_SMALL));
  self.add(loginButton);

  loginButton.addEventListener('click', function() {
    var email = emailField.getValue().trim();
    var old_email = Ti.App.Properties.getString('email');
    var password = passwordField.getValue();
    if (old_email && (email.toLowerCase() !== old_email.toLowerCase())) {
      var confirmDialog = new ConfirmDialog("Login", "This will clear the surveys.\n Are you sure?", onConfirm = function(e) {
        var DatabaseHelper = require("helpers/DatabaseHelper");
        DatabaseHelper.clearDownloadedData();
        activityIndicator.show();
        loginHelper.login(email, password, topLevelView);
      });
      confirmDialog.show();
    } else {
      activityIndicator.show();
      loginHelper.login(email, password, topLevelView);
    }
  });

  return topLevelView;
}

module.exports = LoginView;
