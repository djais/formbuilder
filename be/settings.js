// getting all the dependencies
var express = require('express'),
    router = express.Router();
var moment = require('moment-timezone');
var conf = require('../conf');


// all routes of the page
router.get('/:gid/location', loc);
router.post('/:gid/register/:devid/:apptype', register);
router.get('/:gid/version/:apptype', version);
router.get('/:gid/:constant', get);

//version : get the current version of the app

function version(req, res){
if(!(req.params.gid && req.params.apptype))
  return res.send(conf.res.invalid);
var group = conf.rytdb.collection("groups")
group.find({gid:req.params.gid},{_id:0, versions:1}).toArray(function(err,data){
  if(err)
    return res.send(conf.res.serverError)
  if(!data.length)
    return res.send(conf.res.noData);
  var response = conf.ok();
  try{
	if(!data[0].versions)
		return res.send(conf.res.noData);	
    if(data[0].versions[req.params.apptype])
      {
        response.data = data[0].versions[req.params.apptype];
        return res.send(response);
      }
    else {
      return res.send(conf.res.noData)
    }
  }catch(e){
    console.log(e);
    res.send(conf.res.noData);
  }
});// group.find

};// version

//menu : get all the constants of a specific set for the group.

function get(req, res){
  if(!(req.params.gid&&req.params.constant))
    return res.send(conf.res.invalid);
  var group = conf.rytdb.collection("constants")
  group.find({gid:req.params.gid, constant:req.params.constant},{_id:0, gid:0}).toArray(function(err, data){
    if(err)
      return res.send(conf.res.serverError);
    if(!data.length)
      return res.send(conf.res.noData);
    var response = conf.ok();
    response.data= data[0].values;
    res.send(response)
  });//find

}// menu



//location : get all locations

function loc(req, res){
console.log("here");
  if(!(req.params.gid))
    return res.send(conf.res.invalid);
  var group = conf.rytdb.collection("location")
  group.find({gid:req.params.gid},{_id:0, gid:0}).toArray(function(err, data){
	console.log(data)
    if(err)
      return res.send(conf.res.serverError);
    if(!data.length)
      return res.send(conf.res.noData);
    var response = conf.ok();
    response.data=[];
    for(var i in data)
    {
      response.data.push(data[i].displayname);
    }
    res.send(response)
  });//find

}// menu
//register : get all the locations set for the group.

function register(req, res){
  if(!(req.params.gid && req.params.devid))
    return res.send(conf.res.invalid);
  var app = conf.rytdb.collection("app");
  var set = {'devid': req.params.devid, 'gid':req.params.gid, "apptype":req.params.apptype, creationTs:moment().unix()};
  var details = req.body;
  details.ts = moment().unix();
  app.findAndModify({devid:req.params.devid, apptype:req.params.apptype, gid:req.params.gid},{},
    {$setOnInsert:set, $set:details},
    {upsert:true, new:true},function(err, data){
    if(err)
      return res.send(conf.res.serverError);
    var response = conf.ok();
    response.data = data;
    res.send(response)
  });//find

}// register

module.exports = router;
