/*********************************************
device APIs:

Author : Rahul Mishra
email : rahul@rytangle.com

All the restful apis for devices.
*********************************************/
// getting all the dependencies
var express = require('express'),
    router = express.Router();
var conf = require('../conf');
var util = require('../utils/util.js');
var request = require('request');
var moment = require('moment-timezone');


// all routes of the page ///////////////////
router.post('/', post);
router.get("/", get);
router.get("/summary",summary);
router.get("/detail/:id", detail);
router.post("/status", status);


//////-----Function Definitions ------///////////

// ------ summary() get device summary -----

function summary(req, res){
  console.log("here");
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  var group = conf.rytdb.collection("groups");
  var devices = conf.rytdb.collection("devices");
  var response = conf.ok();
  group.find({gid:req.session.gid}, {devices:1}).toArray(function(err, docs){
    if(err)
      return res.send(conf.res.serverError);
    if(!docs.length)
    {
      response.data={total:0,graphlabels:[]};
      return res.send(response);
    }
    if(req.session.role>1)
    {
      response.data = {total:0};
      for(var i in docs[0].devices)
      {
        if(req.session.user.regions.indexOf(docs[0].devices[i].loc)>-1)
        {
          response.data.total = response.data.total+1;
        }
      }
    }
    else
      response.data={total:docs[0].devices.length};
    if(response.data.total>0)
      response.data["graphlabels"] = ["Online","Oflline"];
    else
      response.data["graphlabels"] = [];
    return res.send(response);
  });
}


// --------Status() get device status alternate for socket -------

function status(req, res){
    if(!(req.session.uid && req.session.gid))
      return res.send(conf.res.invalid);
    if(!req.body.devids)
      return res.send(conf.res.invalid);
    devices = conf.rytdb.collection('devices');
    console.log(req.body);
    devices.aggregate([
    {$match:{gid:req.session.gid,
             devid:{$in:req.body.devids}}
             },
     {$sort: { ts: -1} },
     {$group:{_id: "$devid",
           status: { $first: "$event" }} }
   ], function(err, data){
     if(err)
      return res.send(conf.res.serverError)
     var response = conf.ok();
     response.data = [];
     for(var i in data)
     {
       if(data[i].status=="ONLINE")
        response.data.push(data[i]._id)
     }
     console.log(data, response);
     return res.send(response);
   });// end aggregate
};// status

// POST device --------
function post(req, res){
  res.send(conf.ok());
};//post

// GET device ------////////////

function get(req, res){
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  var user = conf.rytdb.collection('users');
  var group = conf.rytdb.collection('groups');
  var response = conf.ok();
  response.data = [];
  var regions = [];
  var temp = [];
  console.log("here in get devices...", req.session);
  // get user information
  if(req.session.role>1)
  {
    // checkout the role and devices to be shown
      if(req.session.user.hasOwnProperty("regions"))
      {
        regions = req.session.user.regions;
      }
      group.find({gid:req.session.gid}).toArray(function(e, docs){
        if(e)
          return res.send(conf.res.serverError);
        if(!docs.length)
          return res.send(conf.res.noData)

        for(var i in docs[0].devices)
        {
          if(temp[docs[0].devices[i]["loc"]])
          {
            temp[docs[0].devices[i]["loc"]].push(docs[0].devices[i]);
          }
          else
          {
            temp[docs[0].devices[i]["loc"]]=[];
            temp[docs[0].devices[i]["loc"]].push(docs[0].devices[i]);
          }
        }
        for(var i in regions)
        {
          if(temp[regions[i]])
            response.data=response.data.concat(temp[regions[i]]);
        }
        return res.send(response);
      });// group find
  }
  else{
      group.find({gid:req.session.gid},{devices:1,_id:0}).toArray(function(err, data){

        if(err)
          return res.send(conf.res.serverError);
        if(!data.length)
        {
          return res.send(response);
        }
        if(!data[0].devices.length)
        {
          return res.send(response);
        }
        else {
          var response = conf.ok();
          for(var i in data[0].devices)
          {
            delete data[0].devices[i].data; delete data[0].devices[i].apps; delete data[0].devices[i].admins; delete data[0].devices[i].apikey;
          }
          response.data = data[0].devices;
          return res.send(response);
        }
      });
    }
};// get


///------- GET device detail /detail/:id --------

function detail(req, res){
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  if(!req.params.id)
    return res.send(conf.res.invalid);
  var grp = conf.rytdb.collection('groups');
  grp.find({"devices.deviceid":req.params.id, gid:req.session.gid},{devices:{$elemMatch:{deviceid:req.params.id}}})
    .toArray(function(err, data){
      if(err)
        return res.send(conf.res.serverError);
      if(!data.length)
        return res.send(conf.res.noData);
      var response = conf.ok();
      response.data = data[0].devices[0];
      return res.send(response);
  });
}

/////////-- Export Router --------///////////
module.exports = router;
