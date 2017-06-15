// getting all the dependencies
var express = require('express'),
    router = express.Router();
    request = require('request');
var moment = require('moment-timezone');
var conf = require('../conf');


router.post('/applogin', applogin);
router.post("/notifapp",notifapp)
router.post("/custeventlist",custeventlist)
router.post("/eventdetails",eventdetails)
router.post('/custsummaryforapp', custsummaryforapp);


function applogin(req, res) {
  console.log('***applogin fe function')
  console.log(req.body);
  if(!req.body.domain || !req.body.username || !req.body.password)
    return res.send(conf.res.invalid);

  else {
    console.log(conf.beServer+"applogin");
    
    request.post({
      url:conf.beServer+"login/applogin",
      form:req.body
    }, function(e,resp,body){
      body = JSON.parse(body);
      console.log(body);
      var response = conf.res.invalid;
      if(e)
        return res.send(response);
      else{
        switch(body.statusCode){
          case 200:
            response = conf.res.ok;
            response["data"] = body.data;
          break;
          case 404:
            response = conf.res.noData;
          break;
          case 400:
            response = conf.res.invalid;
          break;
        }
      }
      return res.send(response);

    });
  }
};

function notifapp(req, res){
  console.log("notifapp called");
  console.log("body",req.body)
  if(!req.body.apikey1 || !req.body.apikey2)
    return res.send(conf.res.invalid);
  var query = {};
  var limit = 50;
  var skip = 0;
  var sort = -1;
  
  query["gid"] = req.body.apikey2;
  query["event"] = {$in:["feedback","visit"]};

  if(req.body.events)
    query["event"] = {$in:req.body.events};
  if(req.body.offset)
    limit = req.body.offset;  
  if(req.body.offset && req.body.page)
    skip = req.body.offset*req.body.page;
    if(req.body.sort){
    switch(req.body.sort){
      case "ascending":
        sort = 1;
      break;
      case "descending":
        sort = -1;
      break;
    }
  }
  if(req.body.fromdate || req.body.todate)
    query["ts"] = {};
  if(req.body.fromdate){
    var myDate1=req.body.fromdate;
    console.log(myDate1);
    myDate1=myDate1.split("-");
    var newDate1=myDate1[1]+"/"+myDate1[2]+"/"+myDate1[0];
    var fromts = new Date(newDate1).getTime()/1000;
    console.log(fromts);
    query["ts"]["$gt"] = fromts;      
  }
  if(req.body.todate){
    var myDate2=req.body.todate;
    console.log(myDate2);
    myDate2=myDate2.split("-");
    var newDate2=myDate2[1]+"/"+myDate2[2]+"/"+myDate2[0];
    var tots = new Date(newDate2).getTime()/1000;
    tots = tots+86400;
    console.log(tots);
    query["ts"]["$lt"] = tots;
  }
  if(req.body.senti)
    query["sentiment"] = req.body.senti;
  if(req.body.regions){
    query["loc"] = {$in:req.body.regions};
    cmpltnotifapp(query, limit, skip, sort, req, res);
  }
  else{
    console.log("No regions specified. Searching user's regions...")
    var users = conf.rytdb.collection('users');
    users.find({"apikey":req.body.apikey1},{_id:0,regions:1}).toArray(function(err,d){
      if(err){
        console.log("error in finding user's regions.")
        cmpltnotifapp(query, limit, skip, sort, req, res);
      }
      if(d){
        console.log(d);
        if(d[0].regions)
          query["loc"] = {$in: d[0].regions};
        cmpltnotifapp(query, limit, skip, sort, req, res);
      }
    });
  }
};

function cmpltnotifapp(query, limit, skip, sort, req, res){
  console.log("cmpltnotifapp req comes here",query,limit,skip);
  var events = conf.events.collection('events');
  events.find(query,{_id:0}).limit(limit).skip(skip).sort({"ts":sort}).toArray(function(e,data){
    if(e)
      return res.send(conf.res.invalid)
    if(data){
      var playerids = [];
      var eventtypes = [];
      var playerobj = {};
      var eventobj = {};
      for(var i=0; i<data.length; i++){
        //console.log(i);
        if(eventtypes.indexOf(data[i].event)>-1)
          eventobj[data[i].event]["indexes"].push(i);
        else{
          //console.log(data[i].event,"not present in eventtypes")
          eventtypes.push(data[i].event);
          eventobj[data[i].event]={"indexes":[]};
          eventobj[data[i].event]["indexes"].push(i);  
        }
        if(playerids.indexOf(data[i].playerid)>-1){
          playerobj[data[i].playerid]["indexes"].push(i);
        }
        else{
          playerids.push(data[i].playerid);
          playerobj[data[i].playerid]={"indexes":[]};
          playerobj[data[i].playerid]["indexes"].push(i);
        }
      }
      //console.log("playerobj",playerobj);
      var customers = conf.rytdb.collection('customers');
      var constants = conf.events.collection('constants');
      //console.log("playerids",playerids);
      //console.log("eventtypes",eventtypes);
      //console.log("")
      customers.find({custid:{$in:playerids}},{_id:0,gid:0}).toArray(function(err,d){
        if(err)
          return res.send(conf.res.invalid)
        if(d){
          //console.log(d);
          constants.find({event:{$in:eventtypes}},{_id:0,msg:1,event:1}).toArray(function(er,dat){
            if(er)
              return res.send(conf.res.invalid)
            if(dat){
              //console.log("eventtypes result",dat)
              var response = conf.ok();
              for(var i=0; i<d.length; i++){
                if(playerobj[d[i].custid]["indexes"]){
                  for(var j=0; j<playerobj[d[i].custid]["indexes"].length;j++){
                    data[playerobj[d[i].custid]["indexes"][j]].custdata = d[i];
                  }
                }
              }
              for(var k=0; k<dat.length; k++){
                if(eventobj[dat[k].event]["indexes"]){
                  var temp  = dat[k]
                  for(var l=0; l<eventobj[temp.event]["indexes"].length; l++){
                    data[eventobj[temp.event]["indexes"][l]]["msg"] = temp.msg;
                  }
                }
              }
              response.eventdata = [];
              response.eventdata = data;
              return res.send(response);
            } 
          });
        }  
      })
    }
  });
}

function custeventlist(req, res){
  console.log("custeventlist body",req.body)
  if(!req.body.apikey1 || !req.body.apikey2 || !req.body.custid)
    return res.send(conf.res.invalid);

  var events = conf.events.collection('events');
  var query = {};
  var limit = 50;
  var skip = 0;
  var sort = -1;
  query["gid"] = req.body.apikey2;
  query["playerid"] = req.body.custid;
  query["event"] = {$in:["feedback","visit"]};

  if (req.body.player)
    query["player"] = req.body.player;
  if(req.body.events)
    query["event"] = {$in:req.body.events};
  if(req.body.offset)
    limit = req.body.offset;
  if(req.body.sort){
    switch(req.body.sort){
      case "ascending":
        sort = 1;
      break;
      case "descending":
        sort = -1;
      break;
    }
  }
  if(req.body.offset && req.body.page){
    skip = req.body.offset*req.body.page;
  }
  if(req.body.regions){
    query["loc"] = {$in:req.body.regions};
    //console.log("query",query);  
    cmpltcusteventlist(query, limit, skip, sort, req, res);
  }
  else{
    //console.log("No regions specified. Searching user's regions...")
    var users = conf.rytdb.collection('users');
    users.find({"apikey":req.body.apikey1},{_id:0,regions:1}).toArray(function(err,d){
      if(err)
        return res.send(conf.res.invalid)
      if(d){
        //console.log(d);
        if(d[0].regions)
          query["loc"] = {$in: d[0].regions};
        //console.log("query",query);
        cmpltcusteventlist(query, limit, skip, sort, req, res);
      }  
    })
  }
};

function cmpltcusteventlist(query, limit, skip, sort, req, res){
  console.log("cmpltcusteventlist called",query);
    var events = conf.events.collection('events');
    events.find(query,{_id:0}).limit(limit).skip(skip).sort({ts:sort}).toArray(function(e,data){
    if(e)
      return res.send(conf.res.invalid)
    if(data){
      var response = conf.ok();
      response.data = data;
      return res.send(response);
    }
  });
}

function eventdetails(req, res){
  console.log("eventdetails body",req.body)
  if(!(req.body.apikey1 || req.body.apikey2 || req.body.eventref || req.body.eventtype))
    return res.send(conf.res.invalid);
  var db = "";
  var key = "";
  switch(req.body.eventtype){
    case "feedback":
      db = conf.rytdb.collection('userFeedbacks.db');
      key = "fdid";
      cmplteventdetails(db,key,req,res);
    break;
    default:
      return res.send(conf.res.invalid);
    break;
  }
}

function cmplteventdetails(db,key,req,res){
  console.log("cmplteventdetails called",db,key,req.body)
  var query = {};
  query[key] = req.body.eventref;
  //console.log(query);
  db.find(query,{_id:0}).toArray(function(err,data){
    if(err)
      return res.send(conf.res.invalid);
    if(data){
      //console.log("result",data)
      var response = conf.ok();
      response.data = data;
      return res.send(response);      
    }  
  })
}

//-------------custsummaryforapp ----------

function custsummaryforapp(req,res){
  console.log("custsummaryforapp called",req.body);
  if(!req.body.apikey1 || !req.body.apikey2 || !req.body.custid)
    return res.send(conf.res.invalid);
  // fetches summary from events focusing on feedbacks, visits, average rating, average nps
  var events = conf.events.collection('events');
  var query = {player:'customer', playerid: req.body.custid}
  //console.log([{$match:query},{$group:{"_id":"$event", rating:{$avg:"$rating"}, nps:{$avg:"$nps"},count:{$sum:1}}}]);
  events.aggregate([{$match:query},{$group:{"_id":"$event", rating:{$avg:"$rating"}, nps:{$avg:"$nps"},count:{$sum:1}}}],
    function(err, data){

      if(err)
        return res.send(conf.res.serverError);
      if(!data.length)
        return res.send(conf.res.noData);
      var response = {statusCode:200, msg:'OK'};
      response.data= [];
      //console.log(data);
      for(var i in data)
      {
        switch(data[i]["_id"])
        {
          case 'feedback':
            response.data.push({name:"Av. Rating", value:data[i].rating.toFixed(1)});
            response.data.push({name:"Av. NPS", value:data[i].nps.toFixed(1)});
            response.data.push({name:data[i]["_id"], value:data[i].count});
            if(data[i].nps>=9){
              response.data.push({name:"Behaviour", value:"Promoter"});
            }
            else if(data[i].nps>=6&&data[i].nps<9){
              response.data.push({name:"Behaviour", value:"Passive"});
            }
            else{
              response.data.push({name:"Behaviour", value:"Detractor"});
            }
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

};// custsummaryforapp
module.exports = router;