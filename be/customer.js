/*********************************************
Customer APIs:

Author : Rahul Mishra
email : rahul@rytangle.com

All the restful apis for Customer DB.
*********************************************/
// getting all the dependencies
var express = require('express'),
    router = express.Router();
var conf = require('../conf');
var util = require('../utils/util.js');
var request = require('request');
var moment = require('moment-timezone');
var excel = require('exceljs');
var tempfile = require('tempfile');
// general constants
var player = 'customer';
var app = 'customer';
var event = '';
var tz= "ASIA/KOLKATA";

// all routes of the page ///////////////////
router.post('/', post);
router.get("/summary", summary);
router.get("/", get);
router.get("/detail/:id", detail);
router.get("/custsummary/:id", custsummary);
router.get("/events/:id", events);
router.get("/report", report);
//Middleware ////////////////////

router.use(function(req,res){
  res.send(conf.res.notImplemented);
});

// function definitions //////////////////
// --- excel ------------

function report(req, res){
  console.log("customer report called");
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  console.log(req.query);
  var offset= req.query.offset || 0;
  offset=parseInt(offset);
  var query={gid:req.session.gid};
  if(req.session.user.role>1 && req.session.user.hasOwnProperty('regions'))
  {
    if(req.query.loc)
    {
      if(req.session.user.regions.indexOf(req.query.loc)>-1)
        query.loc = req.query.loc;
      else {
        return res.send(conf.res.invalid)
      }
    }
    else {
      query.loc = {"$in":[]};
      query.loc['$in'] = req.session.user.regions;
    }
  }
  if(req.query.fromts || req.query.tots)
    query["tsepoch"] = {};
  for(var i in req.query)
  {
    if(i=="fromts")
      query["tsepoch"]["$gt"] = parseInt(req.query[i]);      
    else if(i=="tots")
      query["tsepoch"]["$lt"] = parseInt(req.query[i]);
    else if( i!='offset' && i!="fromts" && i!="tots" )
      query[i] = req.query[i];
  }
  console.log("Feedback report query",query)
  var customers = conf.rytdb.collection('customers');
  customers.find(query).sort({ts:-1}).toArray(function(e,d){

    if(e)
      return res.send(conf.res.serverError);
    var tempFilePath = tempfile('.xlsx');
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet('Customers');
    var foo =[
      {header:'Name', key:'name'},
      {header:'Phone', key:'phone'},
      {header:'Email', key:'email'},
      {header:'Rating', key:'rating'},
      {header:'NPS', key:'nps'},
      {header:'Lead Source', key:'leadsource'},
      {header:'Interactions', key:'interactions'},
      {header:'Last Visited Location', key:'loc'},
      {header:'Last Visited Date', key:'date'},
    ];
    if(!d.length)
    {
      worksheet.columns = foo;
      workbook.xlsx.writeFile(tempFilePath).then(function() {
          console.log('file is written', tempFilePath);
          res.sendFile(tempFilePath, function(err){
              if(err)
                console.log('---------- error downloading file: ' + err);
              else {
                console.log("success");
              }
          });
      });
    }
    else {
            worksheet.columns = foo;
            for(var i in d)
              {
                var row = {};
                row.name = d[i].name;
                row.phone = d[i].phone;
                row.email = d[i].email;
                row.rating = d[i].rating;
                row.nps = d[i].nps || 0;
                row.loc = d[i].loc;
                row.leadsource = d[i].leadsource;
                row.interactions = d[i].interactions;
                row.date = row.date =moment(d[i].lastTs*1000).tz(tz).format('DD MMM YYYY');
                console.log("customer report row",row);
                worksheet.addRow(row)
              }
          }
              workbook.xlsx.writeFile(tempFilePath).then(function() {
                  console.log('file is written', tempFilePath);
                  res.sendFile(tempFilePath, function(err){
                      if(err)
                        console.log('---------- error downloading file: ' + err);
                      else {
                        console.log("success");
                      }
                  });
              });
  });

};

//-------------custsummary ----------

function events(req,res){
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  if(!req.params.id)
    return res.send(conf.res.invalid);
  // fetches summary from events focusing on feedbacks, visits, average rating, average nps
  var events = conf.events.collection('events');
  var constants = conf.events.collection('constants');
  var query = {player:'customer', playerid:req.params.id}
  constants.find().toArray(function(error, rule){
    if(error)
      return res.send(conf.res.serverError);
    var rules = {};
    for(var i in rule)
    {
      rules[rule[i].event] = rule[i];
    }
    events.find(query).sort({ts:-1}).toArray(function(err, data){
      if(err)
        return res.send(conf.res.serverError);
      if(!data.length)
        return res.send(conf.res.noData);
      var response = {statusCode:200,	msg:'OK'};
      response.data= [];
      for(var i in data)
      {
        var foo = {}, details=[];
        if(data[i].event!='update')
        {
          foo.ref = data[i].ref;
          foo.event = data[i].event;
          foo.msg = rules[data[i].event].msg;
          foo.ts = data[i].ts;
          foo[rules[data[i].event].key] = foo.ref;
          if(rules[data[i].event].hasDetail)
            foo.hasDetail = true;
          for(var j in rules[data[i].event].details)
          {
            if(rules[data[i].event].details[j]=='loc')
              foo.loc = data[i][rules[data[i].event].details[j]];
            else
              details.push({name:rules[data[i].event].details[j], value:data[i][rules[data[i].event].details[j]]});
          }
          foo.details = details;
          response.data.push(foo);
        }
      }
      res.send(response);
      return;
  });

});// get constants

};// events

//-------------custsummary ----------

function custsummary(req,res){
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  if(!req.params.id)
    return res.send(conf.res.invalid);
  // fetches summary from events focusing on feedbacks, visits, average rating, average nps
  var events = conf.events.collection('events');
  var query = {player:'customer', playerid:req.params.id}
	//console.log([{$match:query},{$group:{"_id":"$event", rating:{$avg:"$rating"}, nps:{$avg:"$nps"},count:{$sum:1}}}]);
  events.aggregate([{$match:query},{$group:{"_id":"$event", rating:{$avg:"$rating"}, nps:{$avg:"$nps"},count:{$sum:1}}}],
    function(err, data){
      if(err)
        return res.send(conf.res.serverError);
      if(!data.length)
        return res.send(conf.res.noData);
      var response = {statusCode:200,	msg:'OK'};
      response.data= [];
      for(var i in data)
      {
        switch(data[i]["_id"])
        {
          case 'feedback':
            response.data.push({name:"Av. Rating", value:data[i].rating.toFixed(1)});
            response.data.push({name:"Av. NPS", value:data[i].nps.toFixed(1)});
            response.data.push({name:data[i]["_id"], value:data[i].count});
            break;
          case 'update':
            //do nothing
            break;
          default:
            response.data.push({name:data[i]["_id"], value:data[i].count});
            break;
        }
      }
      res.send(response);
      return;
  });

};// custsummary


// -----------detail -------------
function detail(req,res){
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  if(!req.params.id)
    return res.send(conf.res.invalid);
  var customer = conf.rytdb.collection('customers');
  customer.find({custid:req.params.id},{_id:0,nps:0, concerns:0,concern:0, rating:0, loc:0, gid:0, ref:0,sentiment:0, source:0, ts:0, lastTs:0, creationTs:0}).toArray(function(err, data){

      if(err)
        return res.send(conf.res.serverError);
      if(!data.length)
        return res.send(conf.res.noData);
      var response = {statusCode:200,	msg:'OK'};
      response.data = {};
      response.data.details = [];
      data = data[0];
      if(!data.pic)
        data.pic = "/assets/app/img/usericon.png";
      for(var i in data)
      {
        switch(i)
        {
          case 'lastTs':
            response.data.details.push({name:'Last Interaction', value:data[i], type:'ts'})
            break;
          case 'creationTs':
            response.data.details.push({name:'User Created', value:data[i], type:'ts'})
            break;
          case 'leadsource':
            response.data.details.push({name:'Lead Source', value:data[i]});
            break;
          case 'custid' :
          case 'pic':
          case 'name':
            response.data[i] = data[i];
            break;
          default:
            response.data.details.push({name:i, value:data[i]});
            break;
        }
      }
      res.send(response);
      return;
  });

};// detail

// ------------get ----------------
function get(req, res){
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  // console.log(req.query)
  var offset= req.query.offset || 0;
  offset=parseInt(offset);
  // console.log(offset);
  var query={gid:req.session.gid};
  if(req.session.user.role>1 && req.session.user.hasOwnProperty('regions'))
  {
    if(req.query.loc)
    {
      if(req.session.user.regions.indexOf(req.query.loc)>-1)
        query.loc = req.query.loc;
      else {
        return res.send(conf.res.invalid)
      }
    }
    else {
      query.loc = {"$in":[]};
      query.loc['$in'] = req.session.user.regions;
    }
  }
  if(req.query.fromts || req.query.tots)
    query["lastTs"] = {};
  for(var i in req.query)
  {
    if(i=="fromts")
      query["lastTs"]["$gt"] = parseInt(req.query[i]);      
    else if(i=="tots")
      query["lastTs"]["$lt"] = parseInt(req.query[i]);
    else if( i!='offset' && i!="fromts" && i!="tots" )
      query[i] = req.query[i];
  }
  console.log("customer get query",query);
  var customer = conf.rytdb.collection('customers');
  customer.find(query,{custid:1, name:1, email:1, phone:1, interactions:1, lastTs:1, leadsource:1, loc:1}).sort({lastTs:-1}).skip(offset).limit(50).toArray(function(e,d){
    if(e)
      return res.send(conf.res.serverError);
    if(!d.length)
      return res.send(conf.res.noData);
    else {
        var response = conf.ok();
        response.data=[];
        var foo = {};
        for(var i in d)
        {
          response.data.push(d[i])
        }
        res.send(response);
        delete response.data ;
        return;
    }
  });

};//end of get


//--------summary -------------
function summary(req, res){
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  var query = {};
  query.gid = req.session.gid;
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
    
    var customers = conf.rytdb.collection('customers');
    var response = conf.ok()
    response.data = {graphlabels:[],graphdata:[]};
    customers.aggregate([{$match:query}, {$group:{"_id":"$interactions", count: { $sum: 1 } }}],
    // customers.aggregate([{$match:query}, {$group:{"_id":"$interactions", "custid":{$push:"$custid"}, count: { $sum: 1 } }}],
      function(err,data){
        if(err)
          return res.send(conf.res.serverError);
        //console.log("customer summary for dashboard data",data)
        response.data.total = 0;
        response.data.repeat = 0;
        response.data.new =0;
        // response.data.repeatcustids = [];
        // response.data.newcustids = []; 
        for(var i in data)
        {
          if(data[i]._id>1){
            response.data.repeat += data[i].count;
            // for(var j=0;j<data[i].custid.length;j++){
            //   response.data.repeatcustids.push(data[i].custid[j]);
            // }  
          }
          else {
            response.data.new += data[i].count;
            // for(var j=0;j<data[i].custid.length;j++){
            //   response.data.newcustids.push(data[i].custid[j]);
            // }
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
        //console.log("customer summary for dashboard response",response)
        return res.send(response);
  });// overall average
};// end get Summary


//post
function post(req, res){
  // create and update customer data
  //check for valid inputs
  util.logger("Customer post "+ JSON.stringify(req.body));
  var constants = conf.events.collection('sources');
  if(!(req.body.source && req.body.gid))
  {
    return res.send(conf.res.invalid);
  }
  if(!(req.body.source.name && req.body.source.id))
    return res.send(conf.res.invalid);

  var grp = conf.rytdb.collection('groups');
  var source = req.body.source.name;
  // check if it is a valid gid
  grp.find({gid:req.body.gid}).count(function(e,count){
    if(!count || e)
    {
      return res.send(conf.res.invalid)
    }
    else {
      constants.find({source:req.body.source.name}).toArray(function(e,dt){
        if(e || !dt.length || !dt[0].reliable)
        {
          //assume source is not reliable;
          req.body.lastTs = moment().unix();
          updateUnreliable(req,res, 'customer', source)
          return;
        }
        updateReliable(req,res,'customer', source);
      });
    }
  });//find.count
};// post


//export router
module.exports = router;


///////////////// General functions //////////////////////////////
function updateReliable(req, res, player, source){
  var customer  = conf.rytdb.collection('customers');
  var query = {gid:req.body.gid}; var newcust = util.genId(30);
  //query['$or'] = [];
  var data = req.body;
  //console.log(data);
  if(data.phone)
  {
    // if phone is provided update an existing record.
    query.phone = data.phone;
  }
  else if(data.source)
  {
    query['source.'+source+'.id'] = data.source.id;
  }
  var sort = {lastTs:-1};
  var sourceid = req.body.source.id;
  delete data.source;
  data.lastTs = moment().unix()
  //data.source[source] ={id:sourceid, lastTs:data.lastTs}
  // find if phone number exists or the reliable source Id exists.
  customer.find(query).sort(sort).toArray(function(err, dt){

    if(err)
      return res.send(conf.res.serverError); // do nothing
    if(!dt.length)
    {
      if(data.phone)
      {
        query = {};
        query['source.'+source+'.id'] = sourceid;
        customer.find(query).sort(sort).toArray(function(e, d){
          if(e)
            return res.send(conf.res.serverError);
          if(!d.length)
            {
              data.creationTs = data.lastTs;
              data.custid = newcust;
              data.leadsource = source;
              data.source = {};
              data.source[source]={"id":sourceid, lastTs:data.lastTs};
              customer.insert(data, function(e,d){
                if(!e)
                {
                  if(data.loc)
                  {
                    util.addEvent('visits', 'visit', data.gid, player, data.custid, data, source);
                  }
                  util.addEvent('customer', 'create' , data.gid, player, data.custid, data, source);
                  return res.send(conf.ok());
                }
                res.send(conf.res.serverError);
              })
            }else {
              var updates = [];
              for(var i in data)
              {
                if(d[0][i] && (i != 'loc' || i!='lastTs')) // loc of data update has no value in profile
                {
                  if(d[0][i] != data[i])
                    updates.push(i);
                }
              }
              data.updates = updates;
              data['source.'+source] = {id:sourceid, lastTs:data.lastTs};
              customer.update({custid:d[0].custid},{$set:data, $inc:{interactions:1}},{upsert:true}, function(e,response){
                if(!e)
                {
                  if(data.loc)
                  {
                    util.addEvent('visits', 'visit', data.gid, player, d[0].custid, data, source);
                  }
                  util.addEvent('customer', 'update' , data.gid, player, d[0].custid, data, source);
                  return res.send(conf.ok());
                }
                //console.log(e)
                return res.send(conf.res.serverError);
              });// update
            }//else
        });// check for source id
      }
      else {
        data.creationTs = data.lastTs;
        data.custid = newcust;
        data.leadsource = source;
        data.source = {};
        data.source[source]={"id":sourceid, lastTs:data.lastTs};
        customer.insert(data, function(e,d){
          if(!e)
          {
            if(data.loc)
            {
              util.addEvent('visits', 'visit', data.gid, player, data.custid, data, source);
            }
            util.addEvent('customer', 'create' , data.gid, player, data.custid, data, source);
            return res.send(conf.ok());
          }
          res.send(conf.res.serverError);
        })
      }
    }// if dt[0] - no data
    else {
      var updates = [];
      for(var i in data)
      {
        if(dt[0][i] && (i != 'loc' || i != 'lastTs')) // loc of data update has no value in profile
        {
          if(dt[0][i] != data[i])
            updates.push(i);
        }
      }
      data.updates = updates;
      data['source.'+source] = {id:sourceid, lastTs:data.lastTs};
      customer.update({custid:dt[0].custid},{$set:data,  $inc:{interactions:1}},{upsert:true}, function(e,d){
        if(!e)
        {
          if(data.loc)
          {
            util.addEvent('visits', 'visit', data.gid, player, dt[0].custid, data, source);
          }
          util.addEvent('customer', 'update' , data.gid, player, dt[0].custid, data, source);
          return res.send(conf.ok());
        }
        //console.log(e)
        res.send(conf.res.serverError);
      });// update
    }
  });// find record.
}// updateReliable

//------------updateUnreliable -----------------
function updateUnreliable(req, res, player, source){
  var customer  = conf.rytdb.collection('customers');
  var query = {gid:req.body.gid};
  var newcust = util.genId(30);
  var data = req.body;
  data.lastTs = moment().unix();
  if(data.phone)
  {
    // if phone is provided update an existing record.
    query.phone = data.phone;
  }
  else if(data.email) {
    // if email is provided check for last updated email record
    query.email = data.email;
  }
  else {
    query.source={};
    query["source."+source+".id"] = data.source.id;
  }
  var db={};
  db['$setOnInsert'] = {
    creationTs: data.lastTs,
    custid:newcust,
    leadsource: data.source.name,
    source:{}
  };
  db['$setOnInsert'].source[data.source.name] = {id: data.source.id, lastTs: data.lastTs };
  delete data.source;
  db['$set'] = data;
  db['$inc'] = {interactions:1};
  var sort = {lastTs:-1}
  customer.findAndModify(query,sort,db,
  {upsert:true,new:true}, function(err, dt){
    if(err)
    {
      //console.log("here in error", err)
      return res.send(conf.res.serverError);
    }
    if(data.loc)
    {
      util.addEvent('visits', 'visit', data.gid, player, dt.value.custid, data, source);
    }
    data.updates = [];
    util.addEvent('customer', 'update' , data.gid, player, dt.value.custid, data, source);
    return res.send(conf.ok());
  });//findAndModify

}// updateUnreliable
