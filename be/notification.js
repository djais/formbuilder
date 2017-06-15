/*********************************************
Notification APIs:

Author : Rahul Mishra
email : rahul@rytangle.com

All the restful apis for mails and messages
*********************************************/

// getting all the dependencies
var express = require('express'),
    router = express.Router();
var conf = require('../conf');
var util = require('../utils/util.js');
var request = require('request');


module.exports = router;
