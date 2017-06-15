// getting all the dependencies
var express = require('express'),
    router = express.Router(),
    request = require('request');
var conf = require('../conf');

// all routes of the page
router.get('/:name', general);
//function definition



//general function
function general(req, res){
  var group = conf.rytdb.collection('groups');
  group.find({subdomain:req.params.name},{name:1, subdomain:1, gid:1}).toArray(function(err,data){
    if(err || !data.length)
      return res.render('404.html');
    req.session.subdomain = req.params.name;
    req.session.gid = data[0].gid;
    if(!req.session.uid)
      res.render('login.html');
    else
      res.render('dashboard.html');
  });// find group
};
//export router

module.exports = router;
