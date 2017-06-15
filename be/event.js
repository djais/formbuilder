/*********************************************
Event APIs:

Author : Rahul Mishra
email : rahul@rytangle.com

All the restful apis for events DB.
All the APIs are gid dependent which is equivalent to a client
*********************************************/
// getting all the dependencies
var express = require('express'),
    router = express.Router();
var conf = require('../conf');
var util = require('../utils/util.js');
var request = require('request');

// All the routes supported by the API
router.post('/', post); // events can be posted from any source
router.get("/", get); //needs gid in session
router.delete("/:eventid", del); // event with eventid will be tagged deleted.
// router.post('/filterforapp', filterforapp);

//Middleware

router.use(function(req,res){
  res.send(conf.res.notImplemented);
});
// function definitions

/* post : function definition
**  All post data is associated with a gid. It just calls the util.
** Mandatory fields : gid and player(who is the initiator of the event)
*********************************************************/
function post(req, res){
  util.logger("Event post "+ JSON.stringify(req.body));
  // expects app, event,  gid, playerid (userid / custid),eventId(id of the event like fdid for feedback)
  if(!(req.body.app && req.body.event && req.body.player&& req.body.detail && req.body.gid))
  {
    return res.send(conf.res.invalid);
  }

  req.body.playerid = req.body.playerid  || null;
  req.body.source = req.body.detail.source  || null;
  var grp = conf.rytdb.collection('groups');
  // check if it is a valid gid
  grp.find({gid:req.body.gid}).count(function(e,count){
    if(!count || e)
    {
      return res.send(conf.res.invalid)
    }
    else {
      util.addEvent(req.body.app,
        req.body.event, req.body.gid, req.body.player,
        req.body.playerid, req.body.detail, req.body.source);
      res.send(conf.ok()); // good faith assumption
    }
  });//find.count
};// post

function get(req, res){
  res.send(conf.ok())
};// get


function del(req, res){
  res.send(conf.res.notImplemented)
};// delete


//export router
module.exports = router;
