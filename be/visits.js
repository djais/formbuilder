

/*********************************************
Customer APIs:

Author : Rahul Mishra
email : rahul@rytangle.com

Restful apis for visits DB.
*********************************************/
// getting all the dependencies
var express = require('express'),
    router = express.Router();
var conf = require('../conf');
var util = require('../utils/util.js');
var request = require('request');
var moment = require('moment-timezone');

// general constants
var player = 'customer';
var app = 'visits';
var event = '';
// all routes of the page ///////////////////
router.get("/", get);

//Middleware ////////////////////

router.use(function(req,res){
  res.send(conf.res.notImplemented);
});

// function definitions //////////////////
function get(req, res){
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  var query = {};
  query.gid = req.session.gid;
  query.event = 'visit';
  var current = moment().unix();
  var ts, day = 60*60*24 ;
  var gt, lt = null;
  if(req.query.of)
  {
    switch(req.query.of)
    {
      case 'day':
        ts = current - (1*day);
        break;
      case 'week':
        ts = current - 7*day;
          break;
      case 'month':
        ts = current - 30*day;
        break;
      case 'custom':
        query["ts"] = {};
        if(req.query.gt)
          gt = parseInt(req.query.gt);
        if(req.query.lt)
          lt = parseInt(req.query.lt);
      break;
      default:
        ts = '';
        break;
    }
  }if(req.session.role>1)
  {
    if(req.session.user.regions.length)
      query.loc={'$in':req.session.user.regions}
  }
  if(req.query.loc){
    //req.query.loc = req.query.loc.replace(/ /g, "_") 
    query.loc = req.query.loc;
  }
    if(ts)
    {
      query.ts={$gt:ts};
    }
    if(gt)
      query.ts["$gt"] = gt;
    if(lt)
      query.ts["$lt"] = lt;
    
    var events = conf.events.collection('events');
    var response = conf.ok()
    response.data = {"graphlabels":[],"graphdata":[]};
    console.log(query);
    events.aggregate([{$match:query}, {$group:{"_id":"$visitcount",  count: { $sum: 1 } }}],
      function(err,data){
        if(err)
          return res.send(conf.res.serverError);
        console.log("visits data",data);
        response.data.total = 0;
        response.data.repeat = 0;
        response.data.new =0;
        for(var i in data)
        {
          if(data[i]._id>1){
            response.data.repeat += data[i].count;
          }
          else {
            response.data.new += data[i].count;
          }
        }
        response.data.total = response.data.new + response.data.repeat;
        if(response.data.new>0){
          response.data.graphlabels.push("New");
          response.data.graphdata.push(response.data.new);          
        }
        if(response.data.repeat>0){
          response.data.graphlabels.push("Repeat");
          response.data.graphdata.push(response.data.repeat);          
        }
        return res.send(response);
  });// overall average
};// end visits

//export router
module.exports = router;
