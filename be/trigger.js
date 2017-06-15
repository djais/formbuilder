/*********************************************
trigger APIs:

Author : Rahul Mishra
email : rahul@rytangle.com

Restful apis for trigger queries.
*********************************************/
// getting all the dependencies
var express = require('express'),
    router = express.Router();
var conf = require('../conf');
var util = require('../utils/util.js');
var crypto = require('crypto');
var request = require('request');
var moment = require('moment-timezone');

// all routes of the page ///////////////////
router.get("/", get);
router.post("/addoredittrigger", addoredittrigger);
router.post("/removetrig", removetrig);

//Middleware ////////////////////

router.use(function(req,res){
  res.send(conf.res.notImplemented);
});

// function definitions //////////////////
function get(req, res){
  console.log("trigger get called")
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);

  var query={gid:req.session.gid};
  if(req.session.user.role>1 && req.session.user.hasOwnProperty('regions'))
  {
    query.name={"$in":req.session.user.regions}
  }
  var triggers = conf.rytdb.collection('triggers');
  console.log("query",query)
  triggers.find(query,{_id:0,gid:0}).toArray(function(e,d){
    if(e)
      return res.send(conf.res.serverError);
    if(!d.length)
      return res.send(conf.res.noData);
    else {
      console.log(d);
        var response = conf.ok();
        response.data=[];
        for(var i in d)
        {
          response.data.push(d[i]);
        }
        return res.send(response);
    }
  });
};// end get

function addoredittrigger(req, res){
  console.log("addoredittrigger called",req.body);
  if(!(req.session.uid && req.session.gid && req.body.loc && req.body.event))
    return res.send(conf.res.invalid);
  var query = {gid:req.session.gid};
  if(!req.body.trigid){
    req.body["trigid"] = crypto.randomBytes(10).toString('hex');
    query["loc"] = req.body.loc;
    query["event"] = req.body.event;
  }
  else
    query["trigid"] = req.body.trigid;

  var update = req.body;

  console.log(query,update)
  var triggers = conf.rytdb.collection('triggers');
  triggers.update(query,{$set:update},{upsert:true},function(e,d){
    if(e)
      return res.send(conf.res.serverError);
    if(!d.length){
      console.log("no d")
      return res.send(conf.res.noData);
    }
    else {
        console.log(d);
        var response = conf.ok();
        response.data=[];
        for(var i in d)
        {
          response.data.push(d[i].name);
        }
        console.log(response)
        return res.send(response);
    }
  });

}

function removetrig(req, res){
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  console.log("removetrig body",req.body)
  var query = {gid:req.session.gid, trigid:req.body.trigid};
  var triggers = conf.rytdb.collection('triggers');
  triggers.remove(query,function(e,d){
    if(e)
      return res.send(conf.res.serverError);
    if(!d.length){
      console.log("no d")
      return res.send(conf.res.noData);
    }
    else {
        console.log(d);
        var response = conf.ok();
        response.data=[];
        for(var i in d)
        {
          response.data.push(d[i].name);
        }
        console.log(response)
        return res.send(response);
    }
  });

}

//export router
module.exports = router;
