/*********************************************
Feedback APIs:

Author : Rahul Mishra
email : rahul@rytangle.com

All the restful apis for feedback DB.
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
var app = 'feedback';
var tz= "ASIA/KOLKATA";

// all routes of the page ///////////////////
router.post('/', post);
router.get("/", get);
router.post('/sync', sync);
router.get("/detail/:id", detail);
router.get("/summary", summary);
router.get("/rating", rating);
router.get("/nps", nps);
router.get("/source", source);
router.get("/report", report);
router.get("/fbperloc", fbperloc);
router.get("/concerncount", concerncount);
router.get("/ratingtrend", ratingtrend);
router.get("/npstrend", npstrend);
//Middleware ////////////////////

router.use(function(req,res){
  res.send(conf.res.notImplemented);
});

// function definitions //////////////////
// --- excel ------------

function report(req, res){
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
  var feedbacks = conf.rytdb.collection('userFeedbacks.db');
  feedbacks.find(query).sort({ts:-1}).toArray(function(e,d){

    if(e)
      return res.send(conf.res.serverError);
    var tempFilePath = tempfile('.xlsx');
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet('Feedbacks');
    var foo =[
      {header:'Date', key:'date'},
      {header:'Time', key:'time'},
      {header:'Location', key:'loc'},
      {header:'Sentiment', key:'sentiment'}
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

              for(var i in d[0].user)
              {
                if(i!='id')
                  foo.push({header:i, key:i})
              }
              for(var i in d[0].parameters)
              {
                foo.push({header:d[0].parameters[i].que, key:i});
              }
              worksheet.columns = foo;

              for(var i in d)
              {
                var row = {};
                row.date =moment(d[i].ts*1000).tz(tz).format('DD MMM YYYY');
                row.time = moment(d[i].ts*1000).tz(tz).format('h:mm a');
                row.loc = d[i].loc;
                row.sentiment = d[i].sentiment;
                for(var j in d[i].parameters)
                {
                  row[j] = d[i].parameters[j].val || 'Unanswered';
                }
                for(var j in d[i].user)
                {
                  if(i!='id')
                    row[j] = d[i].user[j] || '-';
                }
                worksheet.addRow(row)
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
    }
  });

};

///  ------source ----------------
function source(req, res){
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  var query = {};
  query.gid = req.session.gid;
  var current = moment().unix();
  var ts, day = 60*60*24;
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
  if(req.session.role>1)
  {
    if(req.session.user.regions.length)
      query.loc={'$in':req.session.user.regions}
  }
  if(req.query.loc){
    //req.query.loc = req.query.loc.replace(/ /g, "_") 
    query.loc = req.query.loc;
  }

    if(ts)
      query.ts={$gt:ts};
    if(gt)
      query.ts["$gt"] = gt;
    if(lt)
      query.ts["$lt"] = lt;
    var feedback = conf.rytdb.collection('userFeedbacks.db');
    var response = conf.ok();
    response.data = {};
        feedback.aggregate([{$match:query}, { $group:{"_id":"$source",  count: { $sum: 1 }}}],function(e,d){
            if(e)
              return res.send(conf.res.serverError);
            if(!d.length)
            {
              response.data= "-";
              return res.send(response);
            }
            response.data=d[0]._id;
            return res.send(response);
          });//
};// source

//---------------get detail ------------------

function detail(req,res){
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  if(!req.params.id)
    return res.send(conf.res.invalid);
  var feedbacks = conf.rytdb.collection('userFeedbacks.db');
  feedbacks.find({fdid:req.params.id},{_id:0}).toArray(function(err, data){
      if(err)
        return res.send(conf.res.serverError);
      if(!data.length)
        return res.send(conf.res.noData);
      var response = conf.ok();
      response.data = data[0];
      res.send(response);
      delete response.data;
      return;
  });
  // need to add current customer detail on feedback user detail from custid
};// detail

// ------------get --------------

function get(req, res){
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  var offset= req.query.offset || 0;
  offset=parseInt(offset);
  console.log(offset);
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
    else if(i=="concerns")
      query["concerns"] = {"$in":[req.query.concerns]};
    else if( i!='offset' && i!="fromts" && i!="tots" )
      query[i] = req.query[i];
  }
  // console.log("feedback search query",query)
  var feedbacks = conf.rytdb.collection('userFeedbacks.db');
  feedbacks.find(query,{source:1, id:1, fdid:1, rating:1, nps:1, sentiment:1, concerns:1, ts:1, loc:1}).sort({ts:-1}).skip(offset).limit(50).toArray(function(e,d){
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

function ratingtrend(req, res){
  console.log("ratingnpstrends called")
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  var query = {};
  query.gid = req.session.gid;
  var current = moment().tz(tz).unix();
  var ts, day = 60*60*24;
  var hour = 60*60;
  var gt, lt = null;
  var tsarray = [];
  if(req.query.of)
  {
    switch(req.query.of)
    {
      case 'day':
      case 'forever':
        ts = current - (1*day);
        var todaymorng = moment().tz(tz).startOf('day').unix();
        for(var i=0; i<25; i++){
          var hourts = todaymorng+(i*hour);
          if(hourts>current)
            break;
          tsarray.push(hourts);
        }
        // console.log("ratingnpstrends array",tsarray)
      break;
      case 'week':
        ts = current - 7*day;
        for(var i=0; i<8; i++){
          var weekts = ts+(i*day);
          if(weekts>current)
            break;
          tsarray.push(weekts);
        }
        // console.log("ratingnpstrends array",tsarray)
      break;
      case 'month':
        ts = current - 30*day;
        for(var i=0; i<31; i++){
          var monthts = ts+(i*day);
          if(monthts>current)
            break;
          tsarray.push(monthts);
        }
        // console.log("ratingnpstrends array",tsarray)
      break;
      case 'custom':
        query["ts"] = {};
        if(req.query.gt)
          gt = parseInt(req.query.gt);
        if(req.query.lt)
          lt = parseInt(req.query.lt);
        var itrval = ((lt-gt)/86400)+1;
        if(itrval>30)
          itrval=30;
        // console.log("ratingnpstrends itrval",itrval)
        if(req.query.gt && req.query.lt){
          for(var i=0; i<itrval; i++){
            var customts = gt+(i*day);
            if(customts>lt)
              break;
            tsarray.push(customts);
          } 
        }
        // console.log("ratingnpstrends array",tsarray)
      break;
      default:
        ts = '';
      break;
    }
  }
  if(req.session.role>1){
    if(req.session.user.regions.length)
      query.loc={'$in':req.session.user.regions}
  }
  if(req.query.loc){
    //req.query.loc = req.query.loc.replace(/ /g, "_") 
    query.loc = req.query.loc;
  }
  if(ts)
    query.ts={};
  var response = conf.ok();
  response.graphdata=[];
  response.graphlabel=[];
  cmpltratingtrend(0,query,tsarray,response,req,res);
}

function cmpltratingtrend(i,query,tsarray,response,req,res){
  query.ts["$gt"] = tsarray[i];
  query.ts["$lt"] = tsarray[i+1];
  // console.log(i,query,tsarray,response);
  var feedbacks = conf.rytdb.collection('userFeedbacks.db');
  feedbacks.aggregate([{$match:query}, { $group:{"_id":null,  rating: { $avg: "$rating" }}}],function(e,d){
    if(e)
      return res.send(conf.res.serverError);
    // console.log("ratingnpstrends data",d);
    if(!d.length){
      response.graphdata.push(0);
      response.graphlabel.push(tsarray[i]);
      if(i==(tsarray.length-2)){
        console.log("ratingnpstrends response",response);
        return res.send(response);
      }
      i++;
      cmpltratingtrend(i,query,tsarray,response,req,res);
    }
    else{
      var avgrating = parseFloat(d[0].rating.toFixed(1));
      response.graphdata.push(avgrating);
      response.graphlabel.push(tsarray[i]);
      if(i==(tsarray.length-2)){
        console.log("ratingnpstrends response",response);
        return res.send(response);
      }
      i++;
      cmpltratingtrend(i,query,tsarray,response,req,res);
    }
  });  
}


function npstrend(req, res){
  console.log("npstrend called")
  if(!(req.session.uid && req.session.gid))
    return res.send(conf.res.invalid);
  var query = {};
  query.gid = req.session.gid;
  var current = moment().tz(tz).unix();
  var ts, day = 60*60*24;
  var hour = 60*60;
  var gt, lt = null;
  var tsarray = [];
  if(req.query.of)
  {
    switch(req.query.of)
    {
      case 'day':
      case 'forever':
        ts = current - (1*day);
        var todaymorng = moment().tz(tz).startOf('day').unix();
        for(var i=0; i<25; i++){
          var hourts = todaymorng+(i*hour);
          if(hourts>current)
            break;
          tsarray.push(hourts);
        }
        // console.log("npstrend array",tsarray)
      break;
      case 'week':
        ts = current - 7*day;
        for(var i=0; i<8; i++){
          var weekts = ts+(i*day);
          if(weekts>current)
            break;
          tsarray.push(weekts);
        }
        // console.log("npstrend array",tsarray)
      break;
      case 'month':
        ts = current - 30*day;
        for(var i=0; i<31; i++){
          var monthts = ts+(i*day);
          if(monthts>current)
            break;
          tsarray.push(monthts);
        }
        // console.log("npstrend array",tsarray)
      break;
      case 'custom':
        query["ts"] = {};
        if(req.query.gt)
          gt = parseInt(req.query.gt);
        if(req.query.lt)
          lt = parseInt(req.query.lt);
        var itrval = ((lt-gt)/86400)+1;
        if(itrval>30)
          itrval=30;
        // console.log("ratingnpstrends itrval",itrval)
        if(req.query.gt && req.query.lt){
          for(var i=0; i<itrval; i++){
            var customts = gt+(i*day);
            if(customts>lt)
              break;
            tsarray.push(customts);
          } 
        }
        // console.log("npstrend array",tsarray)
      break;
      default:
        ts = '';
      break;
    }
  }
  if(req.session.role>1){
    if(req.session.user.regions.length)
      query.loc={'$in':req.session.user.regions}
  }
  if(req.query.loc){
    //req.query.loc = req.query.loc.replace(/ /g, "_") 
    query.loc = req.query.loc;
  }
  if(ts)
    query.ts={};
  var response = conf.ok();
  response.graphdata=[];
  response.graphlabel=[];
  cmpltnpstrend(0,query,tsarray,response,req,res);
}

function cmpltnpstrend(i,query,tsarray,response,req,res){
  query.ts["$gt"] = tsarray[i];
  query.ts["$lt"] = tsarray[i+1];
  // console.log(i,query,tsarray,response);
  var feedbacks = conf.rytdb.collection('userFeedbacks.db');
  feedbacks.aggregate([{$match:query}, { $group:{"_id":null,  nps: { $avg: "$nps" }}}],function(e,d){
    if(e)
      return res.send(conf.res.serverError);
    // console.log("cmpltnpstrend data",d);
    if(!d.length){
      response.graphdata.push(0);
      response.graphlabel.push(tsarray[i]);
      if(i==(tsarray.length-2)){
        console.log("npstrend response",response);
        return res.send(response);
      }
      i++;
      cmpltnpstrend(i,query,tsarray,response,req,res);
    }
    else{
      var avgrating = parseFloat(d[0].nps.toFixed(1));
      response.graphdata.push(avgrating);
      response.graphlabel.push(tsarray[i]);
      if(i==(tsarray.length-2)){
        console.log("npstrend response",response);
        return res.send(response);
      }
      i++;
      cmpltnpstrend(i,query,tsarray,response,req,res);
    }
  });  
}



// --------------- nps: returns nps score ---------

function nps(req, res){
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
  if(req.session.role>1)
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
    var feedback = conf.rytdb.collection('userFeedbacks.db');
    var response = conf.ok();
    response.data = {};
    feedback.aggregate([{$match:{gid:req.session.gid}}, { $group:{"_id":"$nps",  count: { $sum: 1 } }}],function(e,d){
      console.log("nps aggregate ==", d, e);
      if(e)
        return res.send(conf.res.serverError);
      if(!d.length)
      {
        response.data={net:0, nps:0, trend:'neutral'};
        return res.send(response);
      }
      if(d.length==1 && d[0]._id==null)
      {
        response.data={net:0, nps:0, trend:'neutral'};
        return res.send(response);
      }
      var bar = {detractor:0, passive:0, promoter:0};

      for(var i in d)
        {
          if(d[i]._id<7)
            bar.detractor += parseInt(d[i].count);
          if(d[i]._id==7 || d[i]._id==8)
            bar.passive += parseInt(d[i].count);
          if(d[i]._id==9 || d[i]._id==10)
            bar.promoter += parseInt(d[i].count);
        }
        var tot = bar.detractor + bar.passive + bar.promoter;
        var pr = bar.promoter*100/tot;
        var det = bar.detractor*100/tot;
        bar.nps = pr - det;
        response.data.net = bar.nps;
      feedback.aggregate([{$match:query}, { $group:{"_id":"$nps",  count: { $sum: 1 } }}],
        function(err,data){
          if(err)
            return res.send(conf.res.serverError);
            if(!data.length)
            {
              response.data= {net:0,nps:0,trend:'neutral'};
              return res.send(response);
            }
          var foo = {detractor:0, passive:0, promoter:0};
          for(var i in data)
          {
            if(data[i]._id<7)
              foo.detractor += parseInt(data[i].count);
            if(data[i]._id==7 || data[i]._id==8)
              foo.passive += parseInt(data[i].count);
            if(data[i]._id==9 || data[i]._id==10)
              foo.promoter += parseInt(data[i].count);
          }
          var total = foo.detractor + foo.passive + foo.promoter;
          var prom = foo.promoter*100/total;
          var detr = foo.detractor*100/total;
          foo.nps = prom - detr;
          response.data.nps = foo.nps;
          if(response.data.nps > response.data.net)
            response.data.trend = 'positive';
          else if(response.data.nps < response.data.net){
            response.data.trend = 'negative';
          }
          else {
            response.data.trend = 'neutral';
          }
          return res.send(response);
    });// NPS score
  }); // total NPS
};// end nps


// --------------- rating: returns average rating ---------

function rating(req, res){
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
  if(req.session.role>1){
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
    var feedback = conf.rytdb.collection('userFeedbacks.db');
    var response = conf.ok();
    response.data = {};
    feedback.aggregate([{$match:{gid:req.session.gid}}, { $group:{"_id":null,  rating: { $avg: "$rating" }}}],
      function(err,data){
        if(err)
          return res.send(conf.res.serverError);
        if(!data.length)
        {
          response.data= {net:0,rating:0,trend:'neutral'};
          return res.send(response);
        }
        response.data.net = data[0].rating;
        feedback.aggregate([{$match:query}, { $group:{"_id":null,  rating: { $avg: "$rating" }}}],function(e,d){
            if(e)
              return res.send(conf.res.serverError);
            if(!d.length)
            {
              response.data= {net:0,rating:0,trend:'neutral'};
              return res.send(response);
            }
            response.data.rating = d[0].rating;
            if(response.data.rating > response.data.net)
              response.data.trend = 'positive';
            else if(response.data.rating < response.data.net){
              response.data.trend = 'negative';
            }
            else {
              response.data.trend = 'neutral';
            }
            return res.send(response);
          })
  });// overall average
};// end average rating

// --------------- summary ---------

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
    var feedback = conf.rytdb.collection('userFeedbacks.db');
    feedback.aggregate([{$match:query}, {$group:{"_id":"$sentiment", count: { $sum: 1 } } }],function(e,d){
      var response = conf.ok();
      response.data = {};
      response.data= {total:0, negative:0, positive:0, graphlabels:[], graphdata:[]}
      for(var i in d)
      {
        //if(d[i]._id=="positive" || d[i]._id=="negative"){
          response.data[d[i]._id] = d[i].count;
          response.data.total += d[i].count;
          response.data.graphdata.push(d[i].count);
          response.data.graphlabels.push(d[i]._id);        
      //  }
      }
      return res.send(response);
    })
};// end summary

// --------------- fbperloc ---------

function fbperloc(req, res){
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
    var feedback = conf.rytdb.collection('userFeedbacks.db');
    feedback.aggregate([{$match:query}, {$group:{"_id":"$loc", "loccount": {$sum:1}}}],function(e,d){
      var response = conf.ok();
      response.data = [];
      console.log("fbperloc e", e)
      console.log("fbperloc d", d)
      if(e)
        return res.send(conf.res.serverError);
      if(d){
        var response = conf.ok();
        response.graphdata = [];
        response.graphlabels = [];
        for(var i=0; i<d.length; i++){
          response.graphdata.push(d[i].loccount);
          response.graphlabels.push(d[i]._id);
        }
        return res.send(response);        
      }
      return res.send(response);
    })
};// end fbperloc

// --------------- concerncount ---------

function concerncount(req, res){
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
    query["concerns"] = {$exists: true, $ne: []}
    console.log("concerncount query", query);
    var feedback = conf.rytdb.collection('userFeedbacks.db');
    feedback.aggregate( [{$match:query}, { $unwind: "$concerns" }, {$group:{"_id":"$concerns", "concerncount": {$sum:1} }}, {$sort:{"concerncount":-1}}],function(e,d){
      console.log("concerncount e", e)
      console.log("concerncount d", d)
      if(e)
        return res.send(conf.res.serverError);
      if(d){
        var response = conf.ok();
        response.graphdata = [];
        response.graphlabels = [];
        for(var i=0; i<d.length; i++){
          if(i==0){
            response.concerncount= d[i].concerncount;
            response.mostconcern = d[i]._id;
          }
          else if(response.concerncount<d[i].concerncount)
            response.mostconcern = d[i]._id;            
          response.graphdata.push(d[i].concerncount);
          response.graphlabels.push(d[i]._id);
        }
        console.log("concerncount response ",response)
        return res.send(response);        
      }
    })
};// end concerncount


// --------------post -----------------
function post(req, res){
  /*
  ** every feedback should have following fields else it will be considered invalid
  ** gid, user, source, either rating or nps or both.
  ** for wifi and apps did is a mandatory field.
  **  if location is not sent from the source and needed, we are fetching it from backend DB
  */
    if(!(req.body.gid && req.body.user && req.body.source))
      {
        console.log('point 1');
        return res.send(conf.res.invalid);
      }
/*    if(!(req.body.rating && req.body.hasOwnProperty('nps') && req.body.sentiment))
    {
      console.log('point 2');
      return res.send(conf.res.invalid);
    }*/
    if((req.body.source == 'wifi' || req.body.source == 'app') && !req.body.did)
    {
      //if the source is wifi and app without providing the devid. respond invalid
      console.log('point 3');
      return res.send(conf.res.invalid);
    }

    if(!req.body.tsepoch)
    {
      req.body.tsepoch = moment().unix();
      req.body.ts = req.body.tsepoch;
    }
    else {
      req.body.ts = req.body.tsepoch;
    }
    var grp = conf.rytdb.collection('groups');
    grp.find({gid:req.body.gid}).count(function(e,count){
      // if the gid is correct or not.
      if(e || !count)
      {
        console.log('point 4');
        return res.send(conf.res.invalid);
      }
      // proceed for correct gid

      // check if there is a template for the feedback
      var template = conf.rytdb.collection('templates');
      template.find({active:true,type:'fbapp', gid:req.body.gid}).toArray(function(err, docs){
        if(docs.length)
        {
          req.body.concerns = [];
          if(!req.body.sentiment)
            req.body.sentiment = 'positive';
          for(var i in docs[0].parameters)
          {
            console.log(docs[0].parameters[i].concernoptions.length);
            if(docs[0].parameters[i].concernoptions.length)
            {
              console.log("concern = ", req.body.parameters[i].name)
              if(docs[0].parameters[i].concernoptions.indexOf(req.body.parameters[i].val)>-1)
              {
                req.body.concerns.push(req.body.parameters[i].name);
                req.body.sentiment = 'negative'
              }
            }
            if(docs[0].parameters[i].head == 'rating')
            {
              req.body.rating = req.body.parameters[i].val;
            }
            if(docs[0].parameters[i].head == 'nps')
            {
              req.body.nps = req.body.parameters[i].val;
            }
          }
        }
        switch(req.body.source)
        {
          // if the source suggests a location is needed and does not have it, we'll fetch it from the backend
          case 'wifi':
              if(!req.body.loc)
              {
                grp.find({"devices.deviceid":req.body.devid},{devices:{$elemMatch:{deviceid:req.body.devid}}})
                  .toArray(function(e,data){
                      if(e || !data.length)
                        {
                          // write the feedback anyway. this should be a rare occurance;
                          writeFeedback(req, res)
                          return;
                        }
                      if(data[0].devices[0].loc)
                      {
                        req.body.loc = data[0].devices[0].loc;
                      }
                      writeFeedback(req, res);
                  });//find device location
              }
              else {
                writeFeedback(req,res);
              }
            break;
          case 'app':
              if(!req.body.loc)
              {
                var app = conf.rytdb.collection('app');
                app.find({devid:req.body.devid, gid: req.body.gid}).toArray(function(e, data){
                  if(e || !data.length)
                    {
                      // write the feedback anyway. this should be a rare occurance;
                      writeFeedback(req, res)
                      req.body.loc =  '';
                      return;
                    }
                  if(data[0].loc)
                  {
                    req.body.loc = data[0].loc;
                  }
                  else if(data[0].location)
                    req.body.loc = data[0].location;
                  else {
                      req.body.loc = '';
                  }
                  writeFeedback(req, res);
                });// find app location
              }
              else {
                writeFeedback(req,res);
              }
            break;
          default:
              writeFeedback(req, res);
            break;
        }

      });// template find

    });// grp find

};// end of post

// --------------post -----------------
function sync(req, res){
  /*
  ** every feedback should have following fields else it will be considered invalid
  ** gid, user, source, either rating or nps or both.
  ** for wifi and apps did is a mandatory field.
  **  if location is not sent from the source and needed, we are fetching it from backend DB
  */

    if(!(req.body.gid && req.body.feedbacks))
      {
        console.log('point 1');
        return res.send(conf.res.invalid);
      }
    if((req.body.source == 'wifi' || req.body.source == 'app') && !req.body.did)
    {
      //if the source is wifi and app without providing the devid. respond invalid
      console.log('point 3');
      return res.send(conf.res.invalid);
    }
    var grp = conf.rytdb.collection('groups');
    grp.find({gid:req.body.gid}).count(function(e,count){
      // if the gid is correct or not.
      if(e || !count)
      {
        console.log('point 4');
        return res.send(conf.res.invalid);
      }
      // proceed for correct gid
      switch(req.body.source)
      {
        // if the source suggests a location is needed and does not have it, we'll fetch it from the backend
        case 'wifi':
            if(!req.body.loc)
            {
              grp.find({"devices.deviceid":req.body.devid},{devices:{$elemMatch:{deviceid:req.body.devid}}})
                .toArray(function(e,data){
                    if(e || !data.length)
                      {
                        // write the feedback anyway. this should be a rare occurance;
                        writeMany(req, res)
                        return;
                      }
                    if(data[0].loc)
                    {
                      req.body.loc = data[0].loc;
                    }
                    writeMany(req, res);
                });//find device location
            }
            else {
              writeMany(req,res);
            }
          break;
        case 'app':
            if(!req.body.loc)
            {
              var app = conf.rytdb.collection('app');
              app.find({devid:req.body.devid, gid: req.body.gid}).toArray(function(e, data){
                if(e || !data.length)
                  {
                    // write the feedback anyway. this should be a rare occurance;
                    writeMany(req, res)
                    req.body.loc =  '';
                    return;
                  }
                if(data[0].loc)
                {
                  req.body.loc = data[0].loc;
                }
                else if(data[0].location)
                  req.body.loc = data[0].location;
                else {
                    req.body.loc = '';
                }
                writeMany(req, res);
              });// find app location
            }
            else {
              writeMany(req,res);
            }
          break;
        default:
            writeMany(req, res);
          break;
      }

    });// grp find

};// end of post

// common function definition

function writeMany(req, res){
  var feedback = conf.rytdb.collection('userFeedbacks.db');
  var grp = conf.rytdb.collection('groups');
  for(var i in req.body.feedbacks)
  {
    if(!req.body.feedbacks[i].loc)
      req.body.feedbacks[i].loc = req.body.loc;
  }
  var response = conf.ok();
  response.data = [];
  for(var i in req.body.feedbacks)
  {
    feedback.findAndModify({fdid:req.body.feedbacks[i].fdid},{},
      {$set:req.body.feedbacks[i]},
      {upsert:true, new:true},function(err, data){
          if(err)
          {
            console.log('unable to write feedback to the database ', err);
            return res.send(conf.res.serverError)
          }
          // app, appItemid, feedback, player, updateEvent(t/f), event
          data = data.value;
          util.addCustomer('feedback', 'feedback' , data.id, data, 'customer', true,'userFeedbacks.db', 'rytdb');
          response.data.push(data.fdid);
          if(response.data.length == req.body.feedbacks.length)
            return res.send(response);
      });// find and modify feedback
  }
}

// common function definition

function writeFeedback(req, res){
  var feedback = conf.rytdb.collection('userFeedbacks.db');
  var grp = conf.rytdb.collection('groups');
  if(!req.body.id)
  {
    if(req.body.fdid)
    {
      req.body.id = req.body.fdid;
    }
    else {
      req.body.id=util.genId(20);
    }
  }
  var query = {fdid : req.body.id};
  feedback.findAndModify(query,{},
    {$set:req.body},
    {upsert:true, new:true},function(err, data){
        if(err)
        {
          console.log('unable to write feedback to the database ', err);
          return res.send(conf.res.serverError)
        }
        // app, appItemid, feedback, player, updateEvent(t/f), event
        data = data.value;
        util.addCustomer('feedback', 'feedback' , data.id, data, 'customer', true,'userFeedbacks.db', 'rytdb');
        var response = conf.ok();
        response.data = [];
        response.data.push(data.fdid);
        return res.send(response);
    });// find and modify feedback
}

module.exports = router;
