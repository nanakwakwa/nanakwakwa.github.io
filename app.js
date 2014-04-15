
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');
var mongo = require('mongodb');
var app = express();

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/local';


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  mongo.Db.connect(mongoUri, function (err, db){
    db.collection("scores", function (er, col){
	var d = col.find().sort({score: -1}).toArray(function(err,scoreData){
	var indexPage = ""
        indexPage += "!DOCTYE html><html><head><title>2043 Scores</title>" +    
                     "<head><body><table><tr><th>Score</th><th>Username</th><th>Grid</th></tr>"
	if (!err){
          for(var count = 0; count < scoreData.length; count++){
	    indexPage += "<tr><td>" + scoreData[count].score + "</td><td>" + scoreData[count].username + "</td><td>" + scoreData[count].grid + "</td></tr>";
	  }
	  indexPage +="</table></body></html>";
	  res.send(indexPage);
	}
	else {
	  res.send("There was an error processing your request");
	}
      });
    });
  });
});


app.get('/scores.json', function (req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  mongo.Db.connect(mongoUri, function (err, db){
    db.collection("scores", function (er, col){
      var user = req.query.username;
      var d = col.find({"username":user}).toArray(function(err,scoreData){
        res.send(scoreData);
      });
    });
  });
});

app.post('/submit.json', function (req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  mongo.Db.connect(mongoUri, function (err, db){
    db.collection("scores", function (er, collection){
      var username = req.body.username;
      var score = req.body.score;
      var grid = req.body.grid;

      var tStamp = new Date();
	if(username != null && score != null && grid != null){
      collection.insert({"username":username, "score":score, "grid":grid, "created_at":tStamp}, function (err, r){
         res.send("Yeah, I got it. Be cool man.");
	});
 	} else {
	  res.send("You are missing some data, Jim.")
	}
    });
  });
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
