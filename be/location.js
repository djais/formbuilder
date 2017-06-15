/*********************************************
Location APIs:

Author : Rahul Mishra
email : rahul@rytangle.com

Restful apis for Location queries.
*********************************************/
// getting all the dependencies
var express = require('express'),
    router = express.Router();
var conf = require('../conf');
var util = require('../utils/util.js');
var request = require('request');
var moment = require('moment-timezone');
var crypto = require('crypto');

// all routes of the page ///////////////////
router.get("/", get);
router.post("/addoreditlocation", addoreditlocation);
router.post("/removeloc", removeloc);

//Middleware ////////////////////

router.use(function(req,res){
  res.send(conf.res.notImplemented);
});

// function definitions //////////////////
function get(req, res){
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);

  var query={gid:req.session.gid};
  if(req.session.user.role>1 && req.session.user.hasOwnProperty('regions'))
  {
    query.name={"$in":req.session.user.regions};
  }
  var locations = conf.rytdb.collection('location');
  locations.find(query,{_id:0,gid:0}).toArray(function(e,d){
    if(e)
      return res.send(conf.res.serverError);
    if(!d.length)
      return res.send(conf.res.noData);
    else {
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

function addoreditlocation(req, res){
  if(!(req.session.uid && req.session.gid && req.body.name))
    return res.send(conf.res.invalid);

  var query = {"gid":req.session.gid,"name":req.body.name};

  if(!req.body.locid)
    req.body["locid"] = crypto.randomBytes(10).toString('hex');  
  else
    query["locid"] = req.body.locid;


  var update = req.body;

  console.log(query,update)
  var locations = conf.rytdb.collection('location');
  locations.update(query,{$set:req.body},{upsert:true},function(e,d){
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

function removeloc(req, res){
  if(!(req.session.uid && req.session.gid && req.body.name))
    return res.send(conf.res.invalid);

  var query = {gid:req.session.gid, locid:req.body.locid};
  var update = req.body;

  console.log(query,update)
  var locations = conf.rytdb.collection('location');
  locations.remove(query,function(e,d){
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
