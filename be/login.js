var express = require('express'),
    router = express.Router();
var conf = require('../conf');
var util = require('../utils/util.js');
var request = require('request');
var moment = require('moment-timezone');
var crypto = require('crypto');
var shell = require('shelljs');

// all routes of the page ///////////////////
//router.post('/', post);
router.post('/', post)
router.post('/applogin', applogin)

// function definitions /////////////////////////

//---------- post ----------
function post(req, res){

  console.log(req.body);
  var users = conf.rytdb.collection('users');
  if(!req.body.gid)
    return res.send(conf.res.invalid)
  if(!(req.body.email && req.body.passwd))
    return res.send(conf.res.invalid)
  var user = conf.rytdb.collection('users');
  var ts = {$set:{lastaccessTs:moment().unix()}};
  var query = {email:req.body.email};
  if(req.body.email != 'rahul@rytangle.com')
  {
    query.gid = req.body.gid;
  }
  users.findAndModify(query,{},ts,{},function(err, data){
    data = data.value;
    if(err)
      return res.send(conf.res.serverError);
    // email validation needs to be done
    if(data) {
        var salt = data.salt;
        var hash=new Buffer(crypto.pbkdf2Sync(req.body.passwd,salt, conf.crypto.iterations, conf.crypto.keylen), 'binary').toString('base64')     ;
        ;
        console.log(hash);
        if(hash == data.passwd){
          var response = conf.ok();
          response.data = data;
          return res.send(response);
        } else
            return res.send(conf.res.invalid);
        } else
            return res.send(conf.res.noData);

  });// user login

};// post

function applogin(req, res){
  console.log("applogin be function******")
  console.log(req.body);
  var groups = conf.rytdb.collection('groups'); 
  var query = {};
  query["subdomain"] = req.body.domain;
  groups.findOne(query,{_id:0,gid:1},function(err,data){
    if(err)
      return res.send(conf.res.serverError);
    if(data) {
      console.log(data);
      var users = conf.rytdb.collection('users');
      var ts = {$set:{lastaccessTs:moment().unix()}};
      query = {email:req.body.username};
      if(req.body.username != 'rahul@rytangle.com')
      {
        query.gid = data;
      }
      users.findAndModify(query,{},ts,{},function(err, dat){
        var d = dat.value;
        if(err)
          return res.send(conf.res.serverError);
        // email validation needs to be done
        if(d) {
            console.log("")
            var salt = d.salt;
            var hash=new Buffer(crypto.pbkdf2Sync(req.body.password,salt, conf.crypto.iterations, conf.crypto.keylen), 'binary').toString('base64');
            console.log(hash);
            if(hash == d.passwd){
              console.log(d)
              var response = conf.ok();
              response.data = {};
              response.data["name"] = d.name;
              response.data["regions"] = [];
              response.data["apikey1"] = d.apikey;
              response.data["apikey2"] = data.gid;
              if(d.regions){
                response.data["regions"] = d.regions;
                return res.send(response);
              }
              else{
                var locquery={gid:data.gid};
                var locations = conf.rytdb.collection('location');
                locations.find(locquery,{_id:0,displayname:1}).toArray(function(e,d1){
                  if(e){
                    response.data["regions"] = [];
                    return res.send(response);
                  }
                  if(!d1.length){
                    response.data["regions"] = [];
                    return res.send(response);
                  }
                  else {
                    console.log("loc response in applogin",d1);
                    for(var i=0;i<d1.length;i++){
                      response.data["regions"].push(d1[i].displayname);
                    }
                    return res.send(response);
                  }
                });
              }
            } else
                return res.send(conf.res.invalid);
        } 
        else
          return res.send(conf.res.noData);
      });
    }
    else
      return res.send(conf.res.noData);    
  });
};// app login


module.exports = router;
