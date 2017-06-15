// configuration data for API suite

var Conf = function(){
	this.sessionValidity = 3600;
	this.ok = function(){
		return ({statusCode:200,	msg:'OK'});
	};
	this.crypto = {
                keylen :50,
                iterations:2500
        };
	this.checkin = "true";
	this.beServer = "http://127.0.0.1:12004/api/";
	this.database={
		rytdb:{
			url:'mongodb://localhost:27017/rytDBtest'
		},
		rytbot:{
			url:'mongodb://localhost:27017/rytbot'
		},
		events:{
			url:'mongodb://localhost:27017/events'
		},
		logs:{
			url:'mongodb://localhost:27017/logs'
		}
	};
	this.port = 12004;
	this.res = {
		notImplemented:{
			statusCode:501,
			msg:'Method not implemented'
		},
		invalid:{
			statusCode:400,
			msg:'Bad Request'
		},
		serverError:{
			statusCode:500,
			msg:'Internal Server Error'
		},
		ok:{
			statusCode:200,	msg:'OK'
		},
		noData:{
			statusCode:404,
			msg:'No Data found'
		},
		failure:{
			statusCode:402,
			msg:'Request Failed'
		},
		conflict:{
			statusCode:409,
			msg:'Data already exists'
		}
	}
	
	this.filedest = "/var/www/fbpics/"//please include local absolute filepath in server where image to be stored;
	this.modelparameters = [{
            "head" : "comments4",
            "type" : "longtext",
            "required" : false,
            "que" : "Comments",
            "options" : [],
            "concernoptions" : [],
            "dependsonparam" : "",
            "dependsonval" : "",
            "answered" : false,
            "concern" : false,
            "active" : true,
            "visible" : true,
            "val" : ""
        }, 
        {
            "head" : "nps",
            "type" : "nps",
            "required" : false,
            "que" : "How likely are you to recommend us to others?",
            "options" : [ 
                "1", 
                "2", 
                "3", 
                "4", 
                "5", 
                "6", 
                "7", 
                "8", 
                "9", 
                "10"
            ],
            "concernoptions" : [ 
                "7", 
                "8", 
                "9", 
                "10"
            ],
            "dependsonparam" : "",
            "dependsonval" : "",
            "answered" : false,
            "concern" : true,
            "active" : true,
            "visible" : true,
            "val" : ""
        }, 
        {
            "head" : "rating",
            "type" : "rating",
            "required" : true,
            "que" : "Please rate your overall experience",
            "options" : [ 
                "1", 
                "2", 
                "3", 
                "4", 
                "5"
            ],
            "concernoptions" : [ 
                "1", 
                "2", 
                "3"
            ],
            "dependsonparam" : "",
            "dependsonval" : "",
            "answered" : false,
            "concern" : true,
            "active" : true,
            "visible" : true,
            "val" : ""
        }]
}

function ok(){
	return ({statusCode:200,	msg:'OK'});
}


module.exports = new Conf();
