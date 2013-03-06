var _ = require('lib/underscore')._;
var Answer = require('models/answer');

var Record = new Ti.App.joli.model({
  table : 'records',
  columns : {
    id : 'INTEGER PRIMARY KEY',
    response_id : 'INTEGER',
    category_id : 'INTEGER',
    web_id : 'INTEGER'
  },

  methods : {
    createRecord : function(attributes){
      var record = this.newRecord(attributes);
      record.save();
      return record;
    },

    deleteOrphanRecords : function() {
      var orphanRecords = new Ti.App.joli.query()
        .select()
        .from('records')
        .where('response_id is NULL')
        .execute();
      _(orphanRecords).each(function(record) {
        Ti.API.info("Orphan record : " + record.id);
        record.destroy();
      });
    }
  },
  objectMethods : {
    update : function(recordData, responseID) {
      var self = this;
      self.set('response_id', responseID);
      self.save();
      _(recordData).each(function(answerData) {
        var id = answerData.id;
        Answer.updateOrCreateById(id, answerData, self.response_id);
      });
    },

    sync : function() {
      var self = this;
      
      if(self.web_id) {
        Ti.App.fireEvent('record.sync.' + self.id, {
          has_error : false,
          id : self.id
        });
        return;
      }
      
      var url = Ti.App.Properties.getString('server_url') + '/api/records';
      var params = { category_id : this.category_id };

      var client = Ti.Network.createHTTPClient({
        onload : function() {
          Ti.API.info("success!");
          var response = JSON.parse(this.responseText);
          self.set('web_id', response['id']);
          self.save();
          Ti.App.fireEvent('record.sync.' + self.id, {
            has_error : false,
            id : self.id
          });
        },
        onerror : function() {
          Ti.API.info("error!");
          Ti.API.info(this.responseText);
          Ti.App.fireEvent('record.sync.' + self.id, {
            has_error : true,
            id : self.id
          });
        }
      });
      client.open('POST', url);
      client.setRequestHeader("Content-Type", "application/json");
      client.send(JSON.stringify(params));
    }
  }
});

Ti.App.joli.models.initialize();
module.exports = Record;
