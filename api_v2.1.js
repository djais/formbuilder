
var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var redis   = require("redis");
var session = require("express-session");
var redisStore = require('connect-redis')(session);
var cookieParser = require('cookie-parser');
var client  = redis.createClient();
var multer = require('multer');
var mkdirp = require('mkdirp');
var conf = require('./conf.js');
var app = express();
var newfilename = "";
var fs = require('fs');
var dir = "";
//var ttl = 2*60*60; // 2 hrs

app.set('views', __dirname + '/views');

app.engine('html', require('ejs').renderFile);

app.use("/assets", express.static(__dirname + '/views/assets'));
app.use('/partials', express.static(__dirname + '/views/partials'))

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser());
app.use(session({
    secret: 'aefca18ef129da82034ba0893',
    // create new redis store.
    store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl : conf.sessionValidity}),
    saveUninitialized: false,
    resave: false
}));
//connect to MongoDB
MongoClient.connect(conf.database.rytdb.url, function(err, d){
  if(err)
  {
    console.log('ERROR: Not able to connect to MongoDb', err);
    process.exit();
  }
  else {
    conf.rytdb = d;
  }
})

MongoClient.connect(conf.database.rytbot.url, function(err, d){
  if(err)
  {
    console.log('ERROR: Not able to connect to MongoDb', err);
    process.exit();
  }
  else {
    conf.rytbot = d;
  }
})

MongoClient.connect(conf.database.events.url, function(err, d){
  if(err)
  {
    console.log('ERROR: Not able to connect to MongoDb', err);
    process.exit();
  }
  else {
    conf.events = d;
  }
})

MongoClient.connect(conf.database.logs.url, function(err, d){
  if(err)
  {
    console.log('ERROR: Not able to connect to MongoDb', err);
    process.exit();
  }
  else {
    conf.logs = d;
  }
})


var storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, dir);
  },
  filename: function (req, file, cb) {
	console.log(file);
    newfilename = req.params.fdid+ '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
    cb(null, newfilename);
  }
});

var upload = multer({storage: storage},{limits : {fieldSize : 10}}).single('file');
/** API path that will upload images */
app.post('/upload/:gid/:fdid', function(req, res) {
dir = conf.filedest+req.params.gid;
	console.log(dir)
  if (!fs.existsSync(dir)){
	console.log("DIR does not exists")
    //fs.mkdirSync(dir);
	mkdirp(dir, function (e) {
    		if (e) 
			return console.error(e)
    		else
		{
  		upload(req,res,function(err){
    		if(err){
      			res.json({"statusCode":500,"err_desc":err});
      			return;
    		}
    		else{
      			console.log(newfilename)
			return res.send({"statusCode":200,"err_desc":null,"newfilename":newfilename});
    			}
  		});
		}
	});
  }
	else
	{
	console.log("DIR exists")
  	upload(req,res,function(err){
	console.log("upload done")
    	if(err){
		console.log("err----", err)
      		res.json({"statusCode":500,"err_desc":err});
      		return;
    	}	
	    else{
	      console.log(newfilename)
	      res.send({"statusCode":200,"err_desc":null,"newfilename":newfilename});
	    }
	  });
	}

});


app.use('/api', require('./be'));
app.use("/", require("./fe"))
app.set('conf', conf);

// Middleware to redirect
app.use(function(req,res){
  res.render('404.html')
})

app.listen(conf.port, function () {
  console.log('App listening on port '+ conf.port);
});

process.on('uncaughtException', function(err) {
                    // handle the error safely
                     console.log(err);
                    });
