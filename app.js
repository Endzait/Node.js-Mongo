var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hb = require('handlebars');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient
var assert = require('assert');
var url = 'mongodb://localhost:27017/myproject';


app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));

app.get('/', function (req, res) {
  var index = fs.readFileSync('./template.html');
  var comp = hb.compile(""+index);
  var data = {
    'data':[]
  }

  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    
    
    var getDocuments = function(db, callback) {
  // Get the documents collection
    var cursor =db.collection('documents').find( );
     cursor.each(function(err, doc) {
      assert.equal(err, null);

      if (doc != null) {
        data.data.push(doc);
          
      } else {
        callback();
      }

     });

    }

    getDocuments(db, function() {
  
      index = comp(data);
      fs.writeFileSync('./index.html',index);
      res.sendFile(__dirname + '/index.html');
      db.close();

    });

  });
    
    

});

app.get('/add', function (req, res) {
  var data = {
    'data':[]
  };
  req.query.id=(new Date).getTime();
  data.data.push(req.query);



// Use connect method to connect to the server
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    var insertDocuments = function(db, callback) {
  
      var collection = db.collection('documents');
      collection.insert(req.query, function(err, result) {
        console.log("Inserted");
      });
  }

    insertDocuments(db, function() {
      res.location('/');
      db.close();
    });

  });

});


app.delete('/delete/:id',function(req,res){
  var id = req.params.id;
  var data = {
    'data':[]
  };

    // Use connect method to connect to the server
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server");

      var deleteDocuments = function(db, callback) {
        var collection = db.collection('documents');

        collection.deleteOne(req.query, function(err, result) {
            console.log("deleted");
        });

      };

      deleteDocuments(db, function() {
        res.location('/');
        db.close();
      });

    });

})

app.get('/change/:id', function (req, res) {
  var id = req.params.id;
  req.query.id = req.params.id;
  
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Start update");

    var updateDocuments = function(db, callback) {
       console.log("update in progress"+ req.params.id);     
      db.collection('documents').updateOne({'id':req.params.id}, {$set: req.query});
      console.log("progress");
      callback();
    };

    updateDocuments(db, function() {
      res.location('/');
      db.close();
    });

  });
  
});


app.listen(3000);
console.log("Server running on port 3000");
