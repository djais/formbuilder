/*******************************************
**   USER APIs
**  User CURD operations and other basic opertions
**     performed by users like login/logout etc.
**
*********************************************/

// getting all the dependencies
var express = require('express'),
    router = express.Router();
var conf = require('../conf');
var request = require('request');
var moment = require('moment-timezone');
var geoip = require('geoip-lite');
var crypto = require('crypto');
var shell = require('shelljs');
var util = require('../utils/util.js');


// all routes of the page
router.get('/',get);
router.post('/',post);
router.post('/changepassword',changepassword);
router.delete('/', delUser);
router.put('/', put);
router.get('/validate/:api/:ts', validate);

// get user details
function get(req, res){
  if(!req.session.name)
    return res.send(conf.res.invalid)
  var response  = conf.ok();
  response.data = {name:req.session.name};
  return res.send(response);
}

// Post user : this will create a new user else respond with an error
function post(req, res){

  if(!(req.body.email && req.body.passwd && req.body.name && req.body.ph))
    return res.send(conf.res.invalid)
  var  usr = conf.rytdb.collection('users');

  req.body.email = req.body.email.toLowerCase();
  usr.find({email:req.body.email}).toArray(function (err, data) {
    if(err){
      console.log("xxxxx Server Error xxxx", err);
      return res.send(conf.res.serverError);
    }
    else {
      if(data.length)
      {
        console.log("xxxxx Conflict xxxx", err);
        return res.send(conf.res.conflict)
      }
      // if there is no conflict create a user
      createUser(req, res);
    }
  });//find
}

// delete user : this will create a new user else respond with an error
function delUser(req, res){
  // method not implemented
  res.send(conf.res.notImplemented);
}

// Update user user : this will create a new user else respond with an error
function put(req, res){
  // updates user data
  res.send(conf.res.notImplemented);
}

// validate user
function validate(req, res){
  res.send(conf.res.notImplemented);
}


/************ Secondary functions *********************/

function createUser(req, res){
  var  usr = conf.rytdb.collection('users');
  var ip = req.raw.req.headers["x-real-ip"];
  var geo = geoip.lookup(ip);
  req.body['country'] = geo.country;
  req.body['city'] = geo.city;
  req.body['regip'] = ip;
  req.body['creationTs'] = Date.now();

  req.body['actCode'] =  crypto.randomBytes(50).toString('hex');
  req.body['uid'] =  crypto.randomBytes(16).toString('hex');
  req.body['apikey'] =  crypto.randomBytes(50).toString('hex');
  // var salt = new Buffer(crypto.randomBytes(P.conf.crypto.keylen)).toString('hex');
  var salt = new Buffer(crypto.randomBytes(conf.crypto.keylen)).toString('hex');
  var hash=new Buffer(crypto.pbkdf2Sync(req.payload['passwd'],salt, conf.crypto.iterations, conf.crypto.keylen), 'binary').toString('base64')


  req.body['passwd'] = hash;
  req.body['salt'] = salt;
  req.body['validated'] =  0;

  usr.insert(req.body, function(err, data){
    if(err){
      console.log("xxxx Server Error during insert in users xxxx", err);
      return res.send(conf.res.serverError);
    }
    // continue if no error. send mail to user for verify email
    var html = '<p>Hello ' + req.name + ',<br> Please click on the following link to complete the registration process.  <br>';
      html += "https://app.rytangle.com/api/user/validate/"+req.actCode+"/"+Date.now() ;
      html +="<br>if the link does not redirect you. Please copy and paste it in the browser.<br>Thank you for your interest in Rytangle."

    var text = 'Hello '+req.name+",\n Please click on the following link to complete the registration process \n";
    text += "https://app.rytangle.com/api/user/validate/"+req.actCode+"/"+Date.now() ;
    text += '\n if the link does not redirect you. Please copy and paste it in the browser.\nThank you for your interest in Rytangle.';

      var message = {
        from: 'Rytangle <support@rytangle.com>',
        to: '"'+ req.name +'" <'+ req.email +'>',
        subject: 'Email Validation for Rytangle',
        text: text,
        html: html,
        status : 0,
        attmpt:0,
        type: "email",
        tags: "EMAIL_VERIF",
        msg:"",
        reqTS:moment().unix(),
        uid: req.body.uid
      };
      sendMail(message);
      res.send(conf.ok());

  });// insert in users data
}

function changepassword(req, res){
  if(!req.session.name)
    return res.send(conf.res.invalid)
  var  usr = conf.rytdb.collection('users');
  var salt = new Buffer(crypto.randomBytes(conf.crypto.keylen)).toString('hex');
  var hash=new Buffer(crypto.pbkdf2Sync(req.body['password1'],salt, conf.crypto.iterations, conf.crypto.keylen), 'binary').toString('base64')

  req.body = {};
  req.body['passwd'] = hash;
  req.body['salt'] = salt;
  // req.body['validated'] =  0;
  var set = {$set: req.body}
  usr.update({"uid":req.session.uid},set, function(err, data){
    if(err){
      console.log("xxxx Server Error during insert in users xxxx", err);
      return res.send(conf.res.serverError);
    }
    // continue if no error. send mail to user for verify email
    // var html = '<p>Hello ' + req.name + ',<br> Please click on the following link to complete the registration process.  <br>';
    //   html += "https://app.rytangle.com/api/user/validate/"+req.actCode+"/"+Date.now() ;
    //   html +="<br>if the link does not redirect you. Please copy and paste it in the browser.<br>Thank you for your interest in Rytangle."

    // var text = 'Hello '+req.name+",\n Please click on the following link to complete the registration process \n";
    // text += "https://app.rytangle.com/api/user/validate/"+req.actCode+"/"+Date.now() ;
    // text += '\n if the link does not redirect you. Please copy and paste it in the browser.\nThank you for your interest in Rytangle.';

    //   var message = {
    //     from: 'Rytangle <support@rytangle.com>',
    //     to: '"'+ req.name +'" <'+ req.email +'>',
    //     subject: 'Email Validation for Rytangle',
    //     text: text,
    //     html: html,
    //     status : 0,
    //     attmpt:0,
    //     type: "email",
    //     tags: "EMAIL_VERIF",
    //     msg:"",
    //     reqTS:moment().unix(),
    //     uid: req.body.uid
    //   };
    //   sendMail(message);
      console.log(data)
      res.send(conf.ok());

  });// insert in users data
}


/***********************
send Mail
************************/

function sendMail(data){
  var notif = conf.rytdb.collection('notifiations');
  notif.insert(data, function(err, docs) {
      if(err)
      {
        console.log('xxxx Server Error in insert : Notifcation xxxx', err);
      }
      // do nothing! If notifications entry is not created we need to check it.
    });
}



module.exports = router;
