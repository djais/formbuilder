var express = require('express'),
    router = express.Router();
var conf = require('../conf');
var util = require('../utils/util.js');
var request = require('request');
var moment = require('moment-timezone');


// all routes of the page ///////////////////
//router.post('/', post);
router.get("/", get);

// function definitions /////////////////////////

function get(req, res){
  if(!req.session.subdomain)
    return res.send(conf.res.invalid);
  else
  {
    var group = conf.rytdb.collection('groups');
    group.find({subdomain:req.session.subdomain},{name:1, subdomain:1}).toArray(function(err,data){
      if(err)
        return res.send(conf.res.serverError);
      var response = conf.ok();
      response.data = data[0];
      res.send(response);
    });// find group
  }
};// get

module.exports = router;
