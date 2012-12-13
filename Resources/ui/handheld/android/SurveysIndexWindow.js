//Application Window Component Constructor
function SurveysIndexWindow() {
  //load component dependencies
  var SurveysIndexView = require('ui/common/surveys/SurveysIndexView');
  var SettingsWindow = require('ui/handheld/android/SettingsWindow');
  var Survey = require('models/survey');
  var Question = require('models/question');
  var ResponsesIndexWindow = require('ui/handheld/android/ResponsesIndexWindow');
  var ResponsesNewWindow = require('ui/handheld/android/ResponsesNewWindow');
  var settingsWindow = SettingsWindow();
  var loginWindow = require('ui/handheld/android/LoginWindow');
  var surveysIndexView = new SurveysIndexView();
  var loggedIn = require('helpers/LoginHelper').loggedIn;
  var loginHelper = require('helpers/LoginHelper');
  var progressBarView = require("ui/common/components/ProgressBar");

  //ID Constants

  var FETCH_SURVEYS = 1;
  var SYNC_RESPONSES = 2;

  var LOGIN = 42;
  var LOGOUT = 43;

  //create component instance
  var self = Ti.UI.createWindow({
    backgroundColor : '#fff',
    navBarHidden : true,
    exitOnClose : true,
    activity : {
      onCreateOptionsMenu : function(e) {
        var menu = e.menu;
        var menuItemFetch = menu.add({
          title : "Fetch Surveys",
          groupId : FETCH_SURVEYS
        });

        menuItemFetch.addEventListener('click', function() {
          surveysIndexView.addErrorListener();
          surveysIndexView.addSurveysProgressCompleteListener();
          var progressBar = progressBarView;
          Survey.fetchAllQuestionsCount(function(number){
            surveysIndexView.add(progressBar);
            progressBar.init('surveys.sync.completed', number);
            progressBar.setMessage("Fetching surveys...");
            progressBar.addEventListener('surveys.sync.completed', function(){
              surveysIndexView.remove(progressBar);
            });
            Survey.fetchSurveys(progressBar.incrementValue);
          });
        });
        menuItemFetch.setIcon("/images/fetch.png");

        var menuItemSync = menu.add({
          title : "Sync Responses",
          groupId : SYNC_RESPONSES
        });

        menuItemSync.addEventListener('click', function() {
          surveysIndexView.syncAllResponses();
        });

        menuItemSync.setIcon("/images/refresh.png");

        var login = menu.add({
          title : "Login",
          groupId : LOGIN
        });
        login.addEventListener('click', function() {
          new loginWindow().open();
        });
        login.setIcon("/images/login.png");

        var logout = menu.add({
          title : "Logout",
          groupId : LOGOUT
        });
        logout.setIcon("/images/logout.png");
        logout.addEventListener('click', function() {
          loginHelper.logout();
        });

        var menuItemSettings = menu.add({
          title : "Settings"
        });
        menuItemSettings.addEventListener('click', function() {
          settingsWindow.open();
        });
        menuItemSettings.setIcon("/images/settings.png");
      },

      onPrepareOptionsMenu : function(e) {
        var menu = e.menu;
        menu.setGroupEnabled(SYNC_RESPONSES, (Survey.allResponsesCount() !== 0) && loggedIn());
        // Allow syncing responses if logged in AND there are some surveys in the DB.
        menu.setGroupEnabled(FETCH_SURVEYS, loggedIn());
        // Allow fetching surveys if logged in.

        menu.setGroupVisible(LOGIN, !loggedIn());
        //Remove the Login button
        menu.setGroupVisible(LOGOUT, loggedIn());
        //Remove the Logout button
      }
    }
  });

  Ti.App.addEventListener('settings_saved', function() {
    settingsWindow.close();
  });

  var activityIndicator = Ti.UI.createActivityIndicator({
    message : 'Loading...'
  });
  self.add(activityIndicator);

  surveysIndexView.addEventListener('surveys_index_view.table_row_clicked', function(e) {
    activityIndicator.show();
    ResponsesIndexWindow(e.surveyID).open();
    activityIndicator.hide();
  });

  surveysIndexView.addEventListener('surveys_index_view.add_response_clicked', function(e) {
    activityIndicator.show();
    ResponsesNewWindow(e.surveyID).open();
    activityIndicator.hide();
  });

  var disableBackButton = function() {
    // intentionally do nothing to block it
  };

  surveysIndexView.addEventListener('progress.start', function(e) {
    self.addEventListener('android:back', disableBackButton);
  });

  surveysIndexView.addEventListener('progress.finish', function(e) {
    self.removeEventListener('android:back', disableBackButton);
  });

  self.addEventListener('focus', function() {
    surveysIndexView.refresh();
  });
  //construct UI
  self.add(surveysIndexView);

  return self;
}

//make constructor function the public component interface
module.exports = SurveysIndexWindow;
