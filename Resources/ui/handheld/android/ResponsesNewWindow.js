function ResponsesNewWindow(surveyID, responseLocation) {
  // try {
  var ResponsesIndexView = require('ui/common/responses/ResponsesIndexView');
  var ResponsesNewView = require('ui/common/responses/ResponsesNewView');
  var ConfirmDialog = require('ui/common/components/ConfirmDialog');

  var self = Ti.UI.createWindow({
    navBarHidden : true,
    backgroundColor : "#fff"
  });
  var view = new ResponsesNewView(surveyID, responseLocation);
  self.add(view);

  view.addEventListener('ResponsesNewView:savedResponse', function() {
    Ti.App.fireEvent('ResponseNewWindow:closed');
    if(view) { view.cleanup(); }
    view = null;
    self.close();
  });

  var confirmDialog = new ConfirmDialog(L("confirm"), L("confirm_clear_answers"), onConfirm = function(e) {
    var Record = require('models/record');
    Record.deleteOrphanRecords();
    if(view) {
      view.cleanup();
    }
    view = null;
    self.close();
  });

  self.addEventListener('android:back', function() {
    require('helpers/Location').stop();
    confirmDialog.show();
  });

  return self;
  // }
  // catch(e) {
  //   var auditor = require('helpers/Auditor');
  //   auditor.writeIntoAuditFile(arguments.callee.name + " - " + e.toString());
  // }
}

module.exports = ResponsesNewWindow;
