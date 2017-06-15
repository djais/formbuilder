// getting all the dependencies
var express = require('express'),
    router = express.Router(),
    request = require('request');
var conf = require('../conf');
var util = require('../utils/util.js');
var redis = require('redis').createClient();


// all routes of the page
router.post('/', post);
router.get("/logout", get)
//function definition


function get(req,res){
  var sudomain = req.session.subdomain;
  redis.del(req.session.id);
  req.session.destroy();
  res.redirect('/');
}

// signup function
function post(req, res) {
  console.log('here', req.body)
  if(!req.session.gid)
    res.render('404.html');
  else {
    console.log(conf.beServer+"login");
    req.body.gid = req.session.gid;
    console.log(req.session, req.body);

    request.post({
      url:conf.beServer+"login",
      form:req.body
    }, function(e,resp,body){
      body = JSON.parse(body);
      console.log(body);
      var file = 'invalid.html'
      if(e)
        res.render("404.html");
      else{
        switch(body.statusCode){
          case 200:
          req.session.uid = body.data.uid;
          req.session.name = body.data.name;
          req.session.role = body.data.role || 1;
          req.session.user = body.data;
          req.session.id = util.genId(20);
          redis.hmset(req.session.id, body.data);
          redis.expire(req.session.id, conf.sessionValidity);
          file = 'dashboard.html'
  	       res.redirect('/');
           return;
          case 404:
            file = 'doesNotExist.html'
            break;
          case 400:
            file = 'invalid.html'
            break;
        }
      }
      res.render(file);

    });
  }
};

//export router
module.exports = router;
