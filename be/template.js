/*********************************************
Template APIs:

Author : Rahul Mishra
email : rahul@rytangle.com

All the restful apis for Template DB.
*********************************************/
// getting all the dependencies
var express = require('express'),
    router = express.Router();
var moment = require('moment-timezone');
var conf = require('../conf');


// all routes of the page
router.get('/:gid/:type', get);
router.get('/getfordash', getfordash);
router.get('/getconcerns', getconcerns);
router.post('/getconcernsforapp', getconcernsforapp);
router.post('/post',post);
router.post('/createfb',createfb);

//version : get the current version of the app
function get(req, res){

  if(!(req.params.gid && req.params.type))
    return res.send(conf.res.invalid);
  var templates = conf.rytdb.collection("templates");
  query = {gid:req.params.gid, active:true, type:req.params.type};
  console.log(query);
  templates.find(query).toArray(function(err,data){
    console.log(data);
    if(err)
      return res.send(conf.res.serverError);
    if(!data.length)
      return res.send(conf.res.noData)
    var response = conf.ok();
    response.data =[];
    for(var i in data[0].parameters)
    {
      if(data[0].parameters[i].visible)
        response.data.push(data[0].parameters[i])
    }
    return res.send(response);
  })

};// get

//version : get the current version of the app for dashboard
function getfordash(req, res){
console.log("getfordash called^^^^^^^^^^^^^^^^^^^^")
  if(!req.session.gid || !req.query.type)
    return res.send(conf.res.invalid);
  var templates = conf.rytdb.collection("templates");
  query = {gid:req.session.gid, active:true, type:req.query.type};
  console.log("*************************************",query);
  templates.find(query).toArray(function(err,data){
    console.log(data);
    if(err)
      return res.send(conf.res.serverError);
    if(!data.length){
      var response = conf.ok();
      response.data = conf.modelparameters;
      return res.send(response);
    }
    var response = conf.ok();
    response.data =[];
    for(var i in data[0].parameters)
    {
      if(data[0].parameters[i].visible)
        response.data.push(data[0].parameters[i])
    }
    return res.send(response);
  })

};// get


//get the concernoptions in the current version of the app
function getconcerns(req, res){
  console.log("getconcerns called", req.query)
  if(!(req.session.uid && req.session.gid && req.query.type))
    return res.send(conf.res.invalid);
  var templates = conf.rytdb.collection("templates");
  query = {gid:req.session.gid, active:true, type:req.query.type};
  console.log("getconcerns query",query);

templates.find(query,{_id:0,parameters:1}).toArray(function(err,data){
    console.log("getconcerns data",data[0]);
    if(err)
      return res.send(conf.res.serverError);
    if(!data.length)
      return res.send(conf.res.noData)
    var response = conf.ok();
    response.data =[];
    for(var i=0; i<data[0].parameters.length;i++)
    {
      if(data[0].parameters[i].visible && data[0].parameters[i].concern){
          response.data.push(data[0].parameters[i].head);
      }
    }
    return res.send(response);
  })

};// get


//api for concernoptions from app
function getconcernsforapp(req, res){
  console.log("getconcerns called", req.body)
  if(!req.body.apikey1 || !req.body.apikey2 || !req.body.apptype)
    return res.send(conf.res.invalid);
  var templates = conf.rytdb.collection("templates");
  query = {gid:req.session.gid, active:true, type:req.body.apptype};
  // console.log("getconcerns query",query);
  templates.find(query).toArray(function(err,data){
    // console.log(data);
    if(err)
      return res.send(conf.res.serverError);
    if(!data.length)
      return res.send(conf.res.noData)
    var response = conf.ok();
    response.data =[];
    for(var i in data[0].parameters)
    {
      // console.log(i);
      // console.log(data[0].parameters[i]);
      if(data[0].parameters[i].visible && data[0].parameters[i].concern){
          response.data.push(i);
      }
    }
    console.log("getconcerns response",response)
    return res.send(response);
  })

};// get



function post(req,res){
  console.log("trying to post fb parameters");
  console.log(req.body);
  if(!req.session.uid ||!req.session.gid || !req.body.data || !req.body.type)
    return res.send(conf.res.invalid);
  query = {gid:req.session.gid, type:req.body.type};
  console.log(query);
  var update = {"gid":req.session.gid, "type":req.body.type, "parameters":[], "active":true}
  for(var i=0; i<req.body.data.length; i++){
    req.body.data[i]["dependsonparam"] = "";
    req.body.data[i]["dependsonval"] = "";
    req.body.data[i]["answered"] = false;
    req.body.data[i]["concern"] = false;
    req.body.data[i]["visible"] = true;
    req.body.data[i]["val"] = "";
    if(req.body.data[i].concernoptions.length)
      req.body.data[i]["concern"] = true;
    update["parameters"].push(req.body.data[i]);
    if(i+1==req.body.data.length){
      console.log("calling cmpltpost",i)
      cmpltpost(query,update,res);
    }
  }
}

function cmpltpost(query,update,res){
  console.log("cmpltpost called with query, update", query, update);
  var templates = conf.rytdb.collection("templates");
  templates.findOneAndReplace(query,update,{upsert:true,returnNewDocument:true},function(err,data){
    console.log("cmpltpost findOneAndUpdate",data);
    if(err)
      return res.send(conf.res.serverError);
    if(!data.value.parameters)
      return res.send(conf.res.noData)
    var response = conf.ok();
    response.data =[];
    for(var i in data.value.parameters)
    {
      if(data.value.parameters[i].visible)
        response.data.push(data.value.parameters[i])
    }
    return res.send(response);
  })
}

// function for creating form builder;createfb() begin
function createfb(req,res){
  console.log("create fb called");
}

// createfb(); end

module.exports = router;
