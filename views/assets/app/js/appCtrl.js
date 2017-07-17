'use strict';
// console.log=function(){};
var rs={}

var app = angular.module('dashboard',['ngRoute','infinite-scroll','ui.bootstrap','chart.js']);
// var app = angular.module('dashboard',['ngRoute','infinite-scroll','ui.bootstrap', 'angularjs-dropdown-multiselect' ]);

app.config(function($routeProvider) {
  $routeProvider.when('/',                  {templateUrl: 'assets/views/dashboard.html', reloadOnSearch: false});
  $routeProvider.when('/advancefilterdb',   {templateUrl: 'assets/views/advancefilterdb.html', reloadOnSearch: false});
  $routeProvider.when('/advancefiltercust', {templateUrl: 'assets/views/advancefiltercust.html', reloadOnSearch: false});
  $routeProvider.when('/advancefilterfb',   {templateUrl: 'assets/views/advancefilterfb.html', reloadOnSearch: false});
  $routeProvider.when('/advancefiltertkt',  {templateUrl: 'assets/views/advancefiltertkt.html', reloadOnSearch: false});
  $routeProvider.when('/apps',              {templateUrl: 'assets/views/apps.html', reloadOnSearch: false});
  $routeProvider.when('/appdtls',           {templateUrl: 'assets/views/appdetails.html', reloadOnSearch: false});
  $routeProvider.when('/bots',              {templateUrl: 'assets/views/bots.html', reloadOnSearch: false});
  $routeProvider.when('/botdtls',           {templateUrl: 'assets/views/botdtls.html', reloadOnSearch: false});
  $routeProvider.when('/bulkupldctlgmnu',   {templateUrl: 'assets/views/bulkupldctlgmnu.html', reloadOnSearch: false});
  $routeProvider.when('/chatbot',           {templateUrl: 'assets/views/fbchat.html', reloadOnSearch: false});
  $routeProvider.when('/ctlgmnu',           {templateUrl: 'assets/views/catalogormenu.html', reloadOnSearch: false});
  $routeProvider.when('/ctlgmnudtls',       {templateUrl: 'assets/views/catalogormenudtls.html', reloadOnSearch: false});
  $routeProvider.when('/customers',         {templateUrl: 'assets/views/customers.html', reloadOnSearch: false});
  $routeProvider.when('/custdtls',          {templateUrl: 'assets/views/customerdtls.html', reloadOnSearch: false});
  $routeProvider.when('/dashboard',         {templateUrl: 'assets/views/dashboard.html', reloadOnSearch: false});
  $routeProvider.when('/devices',           {templateUrl: 'assets/views/devices.html', reloadOnSearch: false});
  $routeProvider.when('/devicedtls',        {templateUrl: 'assets/views/devicedtls.html', reloadOnSearch: false});
  $routeProvider.when('/dlscpns',           {templateUrl: 'assets/views/dealsorcoupons.html', reloadOnSearch: false});
  $routeProvider.when('/dlcpndtls',         {templateUrl: 'assets/views/dealsorcoupondtls.html', reloadOnSearch: false});
  $routeProvider.when('/feedbacks',         {templateUrl: 'assets/views/feedback.html', reloadOnSearch: false});
  $routeProvider.when('/fbdtls',            {templateUrl: 'assets/views/fbdtls.html', reloadOnSearch: false});
  $routeProvider.when('/formbuilder',       {templateUrl: 'assets/views/buildform.html', reloadOnSearch: false});
  $routeProvider.when('/insideapp',         {templateUrl: 'assets/views/insideapp.html', reloadOnSearch: false});
  $routeProvider.when('/settings',          {templateUrl: 'assets/views/settings.html', reloadOnSearch: false});
  $routeProvider.when('/locations',         {templateUrl: 'assets/views/locations.html', reloadOnSearch: false});
  $routeProvider.when('/locdtls',           {templateUrl: 'assets/views/locationdtls.html', reloadOnSearch: false});
  $routeProvider.when('/tickets',           {templateUrl: 'assets/views/tickets.html', reloadOnSearch: false});
  $routeProvider.when('/ticketdtls',        {templateUrl: 'assets/views/ticketdtls.html', reloadOnSearch: false});
  $routeProvider.when('/newtkt',            {templateUrl: 'assets/views/newtkt.html', reloadOnSearch: false});
  $routeProvider.when('/newdealorcoupon',   {templateUrl: 'assets/views/newdealorcoupon.html', reloadOnSearch: false});
  $routeProvider.when('/newcatalogormenu',  {templateUrl: 'assets/views/newcatalogormenu.html', reloadOnSearch: false});
  $routeProvider.when('/users',             {templateUrl: 'assets/views/users.html', reloadOnSearch: false});
  $routeProvider.when('/uploadexcel',       {templateUrl: 'assets/views/uploadexcel.html', reloadOnSearch: false});
  // $routeProvider.when('/addform',         {templateUrl: 'assets/views/buildform.html', reloadOnSearch: false});
  $routeProvider.when('/preview',           {templateUrl: 'assets/views/previewform.html', reloadOnSearch: false});



});

// ----------FACTORY definition for infinite scroll function--

app.factory('Rytapi', function($http, $rootScope) {
  var Rytapi = function(link, query) {
    this.items = [];
    this.busy = false;
    this.complete = false;
    this.offset = 0;
    this.link = link;
    this.query = query || [];
    this.nextPage();
  };

  Rytapi.prototype.nextPage = function() {
	if(this.complete) return;
    if (this.busy) return;
    this.busy = true;
    var url = location.origin+'/api/'+this.link+"?offset="+this.offset;
    for(var i in this.query)
    {
        if(this.query[i])
          url =url+"&"+i+"="+this.query[i];
    }
    console.log(url);
    $http.get(url).success(function(data,status) {
      var items = [];
	if(data.statusCode==200)
	{
	  items = data.data;
      for (var i = 0; i < items.length; i++) {
        this.items.push(items[i]);
      }
      this.offset = this.items.length;
      this.busy = false;
      if(items.length!=50)
      {
      	this.complete = true;
      }
	}
	else
		this.complete = true;
    }.bind(this));
  };

  return Rytapi;
});

//-------general functions-----


function initSock() {
//var socket = io.connect('localhost');
//var socket = io.connect('http://dmodx.com/');
var socket = io.connect('https://rytangle.com/');
socket.on('connect', function(data){
        console.log('connected');
       // socket.emit('subscribe', {channel:'realtime'});
      });

socket.on('error', function(data){
        console.log('socket error');
        console.log(data);
                /*alert("Session timeout");
                  window.location.assign("localhost/apps/web/login")*/
});
  socket.on('message', function (data) {
    if(data.h.msgType == "sendStats_resp") {
        updateStats(data)
    }
        if(data.h.msgType == 'ONLINE'){
                updateDev(data);
                }
        if(data.h.msgType == 'OFFLINE'){
                var idx = rs.onlineDev.indexOf(data.d.devids[0]);
                if(idx>-1)
                        rs.onlineDev.splice(idx,1);
                }
        rs.$digest();
//   socket.emit('my other event', { my: 'data' });
  });
}



function updateDev(data){
        for(var i in data.d.devids){
            if(rs.onlineDev.indexOf(data.d.devids[i])<0)
              rs.onlineDev.push(data.d.devids[i]);
        }
rs.$broadcast('devStatusUpdate');
}

function updateStats(data) {
    devices[data.ph.src] = data.d;
        rs.realtime.stats = data.d;
        rs.$broadcast('update',rs.realtime.stats);
}


//---------Filters ---------------

app.filter('comma2br', function($sce) {
    // This is my preferred way
    return function(input) {
      return $sce.trustAsHtml(input.replace(/,/g, "<br/>"))
    }
  });


///------------ app.run

app.run(function($rootScope, $http){
  rs = $rootScope;
  initSock();
  $rootScope.server = location.origin+'/api';
  $rootScope.for = 'month';
  $rootScope.onlineDev = [];
  $rootScope.locations = [];
  $rootScope.concerns = [];
  $http.get($rootScope.server+"/user")
    .success(function(d,status){
        if(d.statusCode==200)
        {
          $rootScope.user = d.data;
        }
    })
    .error(function(e){
      console.log('error', e)
    });//error

    // get locations for the user
    $http.get($rootScope.server+"/location")
      .success(function(d,status){
          if(d.statusCode==200)
          {
            $rootScope.locations = d.data;
          }
      })
      .error(function(e){
        console.log('error', e)
      });//error

    // get locations for the user
    $http.get($rootScope.server+"/template/getconcerns?type=fbapp")
      .success(function(d,status){
        console.log("get concerns success")
        console.log(d,status)
          if(d.statusCode==200)
          {
            $rootScope.concerns = d.data;
            console.log($rootScope.concerns);
          }
      })
      .error(function(e){
        console.log('error', e)
      });//error


    // get locations for the user
    $rootScope.sentiments = ["positive", "negative"];

}); // app.run

app.directive('disallowSpaces', function() {
  return {
    restrict: 'A',

    link: function($scope, $element) {
      $element.bind('input', function() {
        $(this).val($(this).val().replace(/ /g, ''));
      });
    }
  };
});
//disallow space directive
app.filter('unique', function() {
   return function(collection, keyname) {
      var output = [],
          keys = [];

      angular.forEach(collection, function(item) {
          var key = item[keyname];
          if(keys.indexOf(key) === -1) {
              keys.push(key);
              output.push(item);
          }
      });
      return output;
   };
});



//---------------Controllers-----------

app.controller('appCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){
    $rootScope.tempfilter = {};
  };

  $rootScope.route = function(page){
    console.log(page);
    $rootScope.sidebaractive = page;
    $location.path(page);
  };

  $rootScope.gofromdash = function(filter,page,senti){
    console.log(filter,page,senti)
    if(filter.fromdate){
      var myDate1=filter.fromdate;
      myDate1=myDate1.split("-");
      var newDate1=myDate1[1]+"/"+myDate1[2]+"/"+myDate1[0];
      filter.fromts = new Date(newDate1).getTime()/1000;
    }
    if(filter.todate){
      var myDate2=filter.todate;
      myDate2=myDate2.split("-");
      var newDate2=myDate2[1]+"/"+myDate2[2]+"/"+myDate2[0];
      filter.tots = new Date(newDate2).getTime()/1000;
      filter.tots = filter.tots+86400;
    }
    $rootScope.tempfilter = filter;
    $rootScope.tempfilter["sentiment"] = senti;
    $rootScope.route(page);
  }


  $rootScope.gotoDetail = function(item, type){
    var page = type;
    switch(type)
    {
      case 'feedback':
        page = '/fbdtls';
      break;
      case 'customer':
        page='/custdtls'
      break;
      case 'location':
        page='/locdtls'
      break;
      default:
        break;
    }
    $rootScope.selected = item;
    console.log($rootScope.selected);
    $location.path(page)
  }

  $rootScope.changetabview = function(item,view){
    console.log(item,view)
    $rootScope.selected = item;
    var page = "";
    switch(view)
    {
      case "trigger":
        page="assets/views/triggerdtls.html"
      break;
      default:
        break;
    }
    $rootScope.currentTab = page;
    console.log($rootScope.currentTab)
  }

  $rootScope.randomString = function (length, chars) {
    var mask = '';
    if (chars.indexOf('@') > -1) mask += 'abcdef';
    if (chars.indexOf('0') > -1) mask += '0123456789';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
  }

  $rootScope.details = function(part){
    for (var key in part){
      console.log(key)
      console.log(part[key])
    }
  }

  $rootScope.isOnline = function(devid){
    if($rootScope.onlineDev.indexOf(devid) > -1)
      return true;
    else
      return false;

  };//isOnline

  $rootScope.toString = function(item){
    console.log(item.toString);
    return item.toString();
  }

});// appCtrl

app.controller('sideBarCtrl',function($scope, $rootScope){
  $rootScope.sidebaractive = '';
  $scope.sidebarcontents = {
    "main" : [
                {"title":"Overview",
                 "contents":[
                              {"title":"Dashboard","url":"dashboard","icon":"fa fa-dashboard"},
                              {"title":"Feedbacks","url":"feedbacks","icon":"fa fa-share"},
                              {"title":"Customers","url":"customers","icon":"fa fa-users"},
                              // {"title":"Tickets","url":"tickets","icon":"fa fa-edit"},
                            ]
                },
                {"title":"Interfaces",
                 "contents":[
                              {"title":"WiFi Devices","url":"devices","icon":"fa fa-wifi"},
                              // {"title":"FB Chatbot","url":"bots","icon":"fa fa-facebook"},
                              // {"title":"Web Chatbot","url":"bots","icon":"fa fa-comments"},
                              // {"title":"App","url":"apps","icon":"fa fa-android"}
                            ]
                }
                ,
                {"title":"Admin",
                 "contents":[
                              {"title":"Settings","url":"settings","icon":"fa fa-cogs"},
                              {"title":"Locations","url":"locations","icon":"fa fa-map-marker"},
                              {"title":"Form-Builder","url":"formbuilder","icon":"fa fa-file-text"}
                            ]
                }
              ]
  }

});

app.controller('minidashCtrl',function($rootScope){
  // nothing happening in this TBD
});

app.controller('feedbackCtrl',function($rootScope,$scope,$location, $http, Rytapi){
  $scope.init = function(){
    $scope.filter=$rootScope.tempfilter;
    $scope.IsVisible = false;
    $rootScope.currentTab = 'assets/views/feedbacklist.html';
    // var loc = new Rytapi('location');
    // $rootScope.locations = loc.items;
    $scope.rytapi = new Rytapi('feedback',$scope.filter);
//     $scope.storehead = [
//       {name:'Position', fld:'source'},
//       {name:'Location', fld:'keyParam'},
//       {name:'Total Feedbacks', fld:'sentiment'},
//       {name:'positive', fld:'concerns'},
//       {name:'negative', fld:'location'},
//       {name:'NPS', fld:'time'},
//       {name:'Rating', fld:'date'}
//     ];
  };// init


  $scope.ShowHide = function () {
    $scope.IsVisible = $scope.IsVisible ? false : true;
    if(!$scope.IsVisible)
      $scope.filter = {};
  }

  $scope.search = function(){
    if($scope.filter.fromdate){
      var myDate1=$scope.filter.fromdate;
      myDate1=myDate1.split("-");
      var newDate1=myDate1[1]+"/"+myDate1[2]+"/"+myDate1[0];
      $scope.filter.fromts = new Date(newDate1).getTime()/1000;
      delete $scope.filter.fromdate;
    }
    if($scope.filter.todate){
      var myDate2=$scope.filter.todate;
      myDate2=myDate2.split("-");
      var newDate2=myDate2[1]+"/"+myDate2[2]+"/"+myDate2[0];
      $scope.filter.tots = new Date(newDate2).getTime()/1000;
      $scope.filter.tots = $scope.filter.tots+86400;
      delete $scope.filter.todate;
    }
    // if($scope.filter.loc)
    //   $scope.filter.loc = $scope.filter.loc.name;
    console.log($scope.filter)
    delete $scope.rytapi;
    $scope.rytapi = new Rytapi("feedback", $scope.filter)
  }

  $scope.report = function(){
    if($scope.filter.fromdate){
      var myDate1=$scope.filter.fromdate;
      myDate1=myDate1.split("-");
      var newDate1=myDate1[1]+"/"+myDate1[2]+"/"+myDate1[0];
      $scope.filter.fromts = new Date(newDate1).getTime()/1000;
      delete $scope.filter.fromdate;
    }
    if($scope.filter.todate){
      var myDate2=$scope.filter.todate;
      myDate2=myDate2.split("-");
      var newDate2=myDate2[1]+"/"+myDate2[2]+"/"+myDate2[0];
      $scope.filter.tots = new Date(newDate2).getTime()/1000;
      $scope.filter.tots = $scope.filter.tots+86400;
      delete $scope.filter.todate;
    }
    // if($scope.filter.loc)
    //   $scope.filter.loc = $scope.filter.loc.name;
    console.log($scope.filter)
    var url = $rootScope.server+"/feedback/report";
    var count = false;
    $scope.busy = true;
    for(var i in $scope.filter)
    {
      if($scope.filter[i])
      {
        if(!count)
        {
          url = url+"?"+i+"="+$scope.filter[i];
          count = true;
        }
        else {
          url = url+"&"+i+"="+$scope.filter[i];
        }
      }
    }
    console.log(url);

    $http.get(url,{ responseType: "arraybuffer" })
      .success(function(d,status){
        $scope.busy = false;
        var blob = new Blob([d], {
         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
           });
          saveAs(blob,'feedbackReport.xlsx');
            })
      .error(function(e){
        console.log('error', e)
      });//error
  }

});// end of feedbackCtrl

app.controller('dashboardCtrl',function($rootScope,$scope,$location, $http){

  $scope.init = function(){
    $scope.filter = {};
    $rootScope.for = "forever";


 $rootScope.toggle = true;


    $scope.$watch('toggle', function(){
        $scope.toggledash = $scope.toggle ? 'Number' : 'Chart';
    })


  // $scope.trendlabels = [1485887400,1485973800,1486060200,1486146600,1486233000];
  $scope.series = ['Series A'];
  // $scope.trenddata =
  //   [4, 4.8, 4.8, 3.8, 3.9];

  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
  $scope.options5 = {
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        }
      ]
    }
  };



    $scope.feedback={


                        "colours":['#f7464a', '#549c2f']



                    }


     $scope.customer={
                        "labels":["New", "Repeat"],

                        "colours":['#72C02C', '#3498DB', '#717984', '#F1C40F']



                    }
     $scope.visit={
                        "labels":["New", "Repeat"],

                        "colours":['#72C02C', '#3498DB', '#717984', '#F1C40F']



                    }
       $scope.wifi={
                        "labels":["New", "Repeat"],

                        "colours":['#72C02C', '#3498DB', '#717984', '#F1C40F']



                    }
    $scope.Topconcern={
                        "labels":["Food","Visit","Sanitation","Service"],
                        "data": [20,25,35,45],
                        "colours":['#72C02C', '#3498DB', '#717984', '#F1C40F']



                    }
    // $scope.labels = ["Positive", "Negative"];
    $scope.options = {legend: {display:false, position: 'right'},
                        animation: false,
                        showAllTooltips:true






                                };
     $scope.loc_feedback= {
        "labels" : ["kolkata", "Bangalore","Chennai","Delhi","Pune","Mysore"],
      "data":[50,100,200,300,75,50]
      };


    $scope.colours = ['#46BFBD', '#FDB45C', '#949FB1', '#3498DB', '#717984', '#F1C40F']
    console.log("summary.positive")
    // $scope.data= [372,125];
    $scope.getDash($rootScope.for);
  }

  $scope.ShowHide = function () {
    $scope.IsVisible = $scope.IsVisible ? false : true;
    if($scope.IsVisible)
      $rootScope.for = "custom";
  }

 // $scope.loading = true;

  $scope.getDash = function(fr){
    $scope.summary={total:-1, positive:-1, negative:-1};
    $scope.rating = {net:-1, rating:-1};
    $scope.nps = {nps:-1};
    $scope.visits = {total:-1, new:-1, repeat:-1};
    $scope.customers = {total:-1, new:-1, repeat:-1};
    $scope.devices = {total:-1, online:-1, offline:-1};
    $scope.source = null;
    $rootScope.for = fr;
    var gt = "";
    var lt = "";
    console.log($scope.filter)
    if($scope.filter.fromdate){
      var myDate1=$scope.filter.fromdate;
      myDate1=myDate1.split("-");
      gt=myDate1[1]+"/"+myDate1[2]+"/"+myDate1[0];
      gt = new Date(gt).getTime()/1000;
    }
    if($scope.filter.todate){
      var myDate2=$scope.filter.todate;
      myDate2=myDate2.split("-");
      lt=myDate2[1]+"/"+myDate2[2]+"/"+myDate2[0];
      lt = new Date(lt).getTime()/1000;
      lt = lt+86400;
    }
    if($scope.filter.loc)
      var loc = $scope.filter.loc;
    if(gt&&lt&&(gt>lt)){
      $scope.tserror = "Please check the dates";
      gt = "";
      lt = "";
      $scope.filter = {};
    }
    if(fr=="custom" && !gt && !lt)
      fr = "forever";
    var query = "?of="+fr;
    if(loc)
      query += "&loc="+loc;
    if(gt)
      query += "&gt="+gt
    if(lt)
      query += "&lt="+lt;
    // api feedbacks
    console.log("dashboard query", query)
    $http.get($rootScope.server+"/feedback/summary"+query)
    .success(function(d1,status){
      if(d1.statusCode==200){
        console.log("summary.. ",d1)
        $scope.summary = d1.data;
        $scope.feedback.data=[];
	$scope.j = 2;
        //$scope.feedback.data=$scope.summary.graphdata
        console.log($scope.summary.graphlabels)
         console.log($scope.summary.graphdata)

        $scope.feedback.labels=[];
         //$scope.feedback.labels=$scope.summary.graphlabels;
       for(var i=0;i<$scope.summary.graphlabels.length;i++)
        {
          if($scope.summary.graphlabels[i]=="positive")
          {
            $scope.feedback.labels[1]=$scope.summary.graphlabels[i];
             $scope.feedback.data[1]=$scope.summary.graphdata[i];
          }

          else if($scope.summary.graphlabels[i]=="negative")
          {
            $scope.feedback.labels[0]=$scope.summary.graphlabels[i];
             $scope.feedback.data[0]=$scope.summary.graphdata[i];
          }
	  else{
		if(i!=0&&i!=1)
		  var j = i;
		else
		 var j = $scope.j;

		$scope.j++;
		$scope.feedback.data[j]=$scope.summary.graphdata[i];
		$scope.feedback.labels[j]=$scope.summary.graphlabels[i];
		}
        }

console.log($scope.feedback);
      }
    })
    .error(function(e){
      console.log('error', e)
    });//error

    $http.get($rootScope.server+"/feedback/source"+query)
      .success(function(sdata,status){
        if(sdata.statusCode==200)
          $scope.source = sdata.data;
        else
          $scope.source = '-';
      })
      .error(function(e){
        $scope.source = '-';
        console.log('error', e)
      });//error

    $http.get($rootScope.server+"/feedback/rating"+query)
    .success(function(d2,status){
      if(d2.statusCode==200)
        $scope.rating = d2.data;
      else
        $scope.rating = {net:0, rating:0};
    })
    .error(function(e){
      $scope.rating = {net:0, rating:0};
      console.log('error', e)
    });//error

    $http.get($rootScope.server+"/feedback/nps"+query)
    .success(function(d3,status){
      if(d3.statusCode==200)
        $scope.nps = d3.data;
      else
        $scope.nps = {nps:0};
    })
    .error(function(e){
      $scope.nps = {nps:0};
      console.log('error', e)
    });//error

    // api for visits
    $http.get($rootScope.server+"/visits"+query)
    .success(function(d4,status){
      if(d4.statusCode==200){
            console.log("visits.. ",d4)
            $scope.visits = d4.data;
            $scope.visit.data=[];
            $scope.visit.data=$scope.visits.graphdata
        console.log($scope.visits.graphlabels)
         console.log($scope.visits.graphdata)

        $scope.customer.labels=[];
         $scope.visit.labels=$scope.visits.graphlabels;
      }
      else
        $scope.visits = {total:0, new:0, repeat:0};
    })
    .error(function(e){
      $scope.visits = {total:0, new:0, repeat:0};
      console.log('error', e)
    });//error

    //api for customers
    $http.get($rootScope.server+"/customer/summary"+query)
    .success(function(d5,status){
      if(d5.statusCode==200){
        console.log("customers.. ",d5)
        $scope.customers = d5.data;
       $scope.customer.data=[];
        $scope.customer.data=$scope.customers.graphdata
        console.log($scope.customers.graphlabels)
         console.log($scope.customers.graphdata)

        $scope.customer.labels=[];
         $scope.customer.labels=$scope.customers.graphlabels;


      }
      else
        $scope.customers = {total:0, new:0, repeat:0};
    })
    .error(function(e){
      $scope.customers = {total:0, new:0, repeat:0};
      console.log('error', e)
    });//error

    //devices
    $http.get($rootScope.server+"/device/summary")
    .success(function(d6,status){
      if(d6.statusCode==200){
        console.log("devices....",d6)
        $scope.devices = d6;
        $scope.devices.offline = parseInt($scope.devices.total) - $rootScope.onlineDev.length;
        $scope.devices.online = $rootScope.onlineDev.length;
        $scope.graphdata=[];
        $scope.graphdata.push($scope.devices.offline);
        $scope.graphdata.push($scope.devices.online);
        console.log($scope.graphdata);
        // $scope.wifi.labels=$scope.devices.graphlabels;
        console.log( $scope.devices.data.graphlabels)
        $scope.wifi.labels=$scope.devices.data.graphlabels


      }
      else
        $scope.devices = {total:0, online:0, offline:0}
    })
    .error(function(e){
      $scope.devices = {total:0, online:0, offline:0}
      console.log('error', e)
    });//error

    $http.get($rootScope.server+"/feedback/fbperloc"+query)
    .success(function(d7,status){
      if(d7.statusCode==200){
        console.log("fbperloc.. ",d7)
        $scope.fbperloc = d7;
        $scope.max1=$scope.fbperloc.graphdata.indexOf(Math.max.apply(null, $scope.fbperloc.graphdata))
        $scope.min1=$scope.fbperloc.graphdata.indexOf(Math.min.apply(null, $scope.fbperloc.graphdata))
        console.log($scope.max1);
        $scope.loc_feedback.data=[];
        $scope.loc_feedback.data=$scope.fbperloc.graphdata;
        $scope.loc_feedback.labels=[];
        for(var i=0;i<$scope.fbperloc.graphlabels.length;i++){
          $scope.fbperloc.graphlabels[i]=($scope.fbperloc.graphlabels[i]+" "+"("+$scope.fbperloc.graphdata[i]+")");
        }
        $scope.loc_feedback.labels=$scope.fbperloc.graphlabels;
        console.log( $scope.loc_feedback.labels);
        console.log($scope.fbperloc.graphlabels)
        console.log($scope.fbperloc.graphlabels[$scope.max1])
        $scope.topcity=$scope.fbperloc.graphlabels[$scope.max1]
        $scope.mincity=$scope.fbperloc.graphlabels[$scope.min1]
      }
    })
   .error(function(e){
      console.log('error', e)
    });//error

    $http.get($rootScope.server+"/feedback/concerncount"+query)
    .success(function(d8,status){
      if(d8.statusCode==200){
        console.log("concerncount.. ",d8)
        $scope.concerncount = d8;
        console.log($scope.concerncount.graphdata)
        //$scope.max2=$scope.concerncount.graphdata.indexOf(Math.max.apply(null, $scope.concerncount.graphdata))
       // console.log($scope.topconcern)
        console.log($scope.concerncount.graphlabels)
        console.log($scope.concerncount.concerncount)
        $scope.Topconcern.data=[];
        $scope.Topconcern.data=$scope.concerncount.graphdata;
        $scope.Topconcern.labels=[];
        for(var i=0;i<$scope.concerncount.graphlabels.length;i++){
          $scope.concerncount.graphlabels[i]=($scope.concerncount.graphlabels[i]+" "+"("+$scope.concerncount.graphdata[i]+")");
        }
        $scope.Topconcern.labels=$scope.concerncount.graphlabels;
       // $scope.topconcern=$scope.concerncount.graphlabels[$scope.max2]
      }
    })
    .error(function(e){
      console.log('error', e)
    });//error

    //   $http.get($rootScope.server+"/feedback/ratingtrend"+query)
    //   .success(function(d9,status){
    //       if(d9.statusCode==200)
    //       {
    //         console.log("ratingtrend.. ",d9)
    //         $scope.ratingtrends = d9;
    //         console.log( $scope.ratingtrends)
    //         console.log($scope.ratingtrends.graphdata)
    //         console.log($scope.ratingtrends.graphlabel)
    //         $scope.trenddata=[];
    //         $scope.trenddata=$scope.ratingtrends.graphdata;
    //         console.log($scope.trenddata)
    //         $scope.trendlabels=[];
    //          $scope.trendlabels=$scope.ratingtrends.graphlabel;
    //          console.log($scope.trendlabels)
    //       }
    //   })
    //   .error(function(e){
    //     console.log('error', e)
    //   });//error
    // $http.get($rootScope.server+"/feedback/npstrend"+query)
    //   .success(function(d10,status){
    //       if(d10.statusCode==200)
    //       {
    //         console.log("npstrend.. ",d10)
    //         $scope.npstrends = d10;
    //         console.log($scope.npstrends)
    //         $scope.npsdata=[];
    //         $scope.npsdata=$scope.npstrends.graphdata;
    //         console.log($scope.npsdata)
    //         $scope.npslabels=[];
    //          $scope.npslabels=$scope.npstrends.graphlabel;
    //          console.log($scope.npslabels)
    //       }
    //   })
    //   .error(function(e){
    //     console.log('error', e)
    //   });//error
  }
});


// app.controller('dashboardCtrl',function($rootScope,$scope,$location, $http){

//   $scope.init = function(){
//     $scope.filter = {};
//     $rootScope.for = "forever";
//     $scope.getDash($rootScope.for);
//   }

//   $scope.ShowHide = function () {
//     $scope.IsVisible = $scope.IsVisible ? false : true;
//     if($scope.IsVisible)
//       $rootScope.for = "custom";
//   }


//   $scope.getDash = function(fr){
//     $scope.summary={total:-1, positive:-1, negative:-1};
//     $scope.rating = {net:-1, rating:-1};
//     $scope.nps = {nps:-1};
//     $scope.visits = {total:-1, new:-1, repeat:-1};
//     $scope.customers = {total:-1, new:-1, repeat:-1};
//     $scope.devices = {total:-1, online:-1, offline:-1};
//     $scope.source = null;
//     $rootScope.for = fr;
//     var gt = "";
//     var lt = "";
//     console.log($scope.filter)
//     if($scope.filter.fromdate){
//       var myDate1=$scope.filter.fromdate;
//       myDate1=myDate1.split("-");
//       gt=myDate1[1]+"/"+myDate1[2]+"/"+myDate1[0];
//       gt = new Date(gt).getTime()/1000;
//     }
//     if($scope.filter.todate){
//       var myDate2=$scope.filter.todate;
//       myDate2=myDate2.split("-");
//       lt=myDate2[1]+"/"+myDate2[2]+"/"+myDate2[0];
//       lt = new Date(lt).getTime()/1000;
//       lt = lt+86400;
//     }
//     if($scope.filter.loc)
//       var loc = $scope.filter.loc;
//     if(gt&&lt&&(gt>lt)){
//       $scope.tserror = "Please check the dates";
//       gt = "";
//       lt = "";
//       $scope.filter = {};
//     }
//     if(fr=="custom" && !gt && !lt)
//       fr = "forever";
//     var query = "?of="+fr;
//     if(loc)
//       query += "&loc="+loc;
//     if(gt)
//       query += "&gt="+gt
//     if(lt)
//       query += "&lt="+lt;
//     // api feedbacks
//     console.log("dashboard query", query)
//     $http.get($rootScope.server+"/feedback/summary"+query)
//       .success(function(d1,status){
//           if(d1.statusCode==200)
//           {
//             console.log("summary.. ",d1)
//             $scope.summary = d1.data;
//           }
//       })
//       .error(function(e){
//         console.log('error', e)
//       });//error
//     $http.get($rootScope.server+"/feedback/ratingtrend"+query)
//       .success(function(d9,status){
//           if(d9.statusCode==200)
//           {
//             console.log("ratingtrend.. ",d9)
//             $scope.ratingtrend = d9.data;
//           }
//       })
//       .error(function(e){
//         console.log('error', e)
//       });//error
//     $http.get($rootScope.server+"/feedback/npstrend"+query)
//       .success(function(d10,status){
//           if(d10.statusCode==200)
//           {
//             console.log("npstrend.. ",d10)
//             $scope.npstrend = d10.data;
//           }
//       })
//       .error(function(e){
//         console.log('error', e)
//       });//error
//     $http.get($rootScope.server+"/feedback/fbperloc"+query)
//       .success(function(d7,status){
//           if(d7.statusCode==200)
//           {
//             console.log("fbperloc.. ",d7)
//             $scope.fbperloc = d7.data;
//           }
//       })
//       .error(function(e){
//         console.log('error', e)
//       });//error
//     $http.get($rootScope.server+"/feedback/concerncount"+query)
//       .success(function(d8,status){
//           if(d8.statusCode==200)
//           {
//             console.log("concerncount.. ",d8)
//             $scope.concerncount = d8.data;
//           }
//       })
//       .error(function(e){
//         console.log('error', e)
//       });//error
//       $http.get($rootScope.server+"/feedback/source"+query)
//         .success(function(sdata,status){
//             if(sdata.statusCode==200)
//             {
//               $scope.source = sdata.data;
//             }
//             else {
//               $scope.source = '-';
//             }
//         })
//         .error(function(e){
//           $scope.source = '-';
//           console.log('error', e)
//         });//error

//       $http.get($rootScope.server+"/feedback/rating"+query)
//         .success(function(d2,status){
//             if(d2.statusCode==200)
//             {
//               $scope.rating = d2.data;
//             }
//             else {
//               $scope.rating = {net:0, rating:0};
//             }
//         })
//         .error(function(e){
//           $scope.rating = {net:0, rating:0};
//           console.log('error', e)
//         });//error
//         $http.get($rootScope.server+"/feedback/nps"+query)
//           .success(function(d3,status){
//               if(d3.statusCode==200)
//               {
//                 $scope.nps = d3.data;
//               }
//               else{
//                 $scope.nps = {nps:0};
//               }

//           })
//           .error(function(e){
//             $scope.nps = {nps:0};
//             console.log('error', e)
//           });//error
//     // api for visits
//     $http.get($rootScope.server+"/visits"+query)
//       .success(function(d4,status){
//           if(d4.statusCode==200)
//           {
//             console.log("visits.. ",d4)
//             $scope.visits = d4.data;
//           }
//           else{
//           $scope.visits = {total:0, new:0, repeat:0};
//           }
//       })
//       .error(function(e){
//         $scope.visits = {total:0, new:0, repeat:0};
//         console.log('error', e)
//       });//error
//     //api for customers
//     $http.get($rootScope.server+"/customer/summary"+query)
//       .success(function(d5,status){
//           if(d5.statusCode==200)
//           {
//             console.log("customers.. ",d5)
//             $scope.customers = d5.data;
//           }
//           else {
//             $scope.customers = {total:0, new:0, repeat:0};
//           }
//       })
//       .error(function(e){
//         $scope.customers = {total:0, new:0, repeat:0};
//         console.log('error', e)
//       });//error
//     //bots - not yet implemented

//     //devices
//     $http.get($rootScope.server+"/device/summary")
//       .success(function(d6,status){
//           if(d6.statusCode==200)
//           {
//             $scope.devices = d6.data;
//             $scope.devices.offline = parseInt($scope.devices.total) - $rootScope.onlineDev.length;
//             $scope.devices.online = $rootScope.onlineDev.length;
//           }
//           else{
//             $scope.devices = {total:0, online:0, offline:0}
//           }
//       })
//       .error(function(e){
//         $scope.devices = {total:0, online:0, offline:0}
//         console.log('error', e)
//       });//error
//   }

// });

app.controller('customerCtrl',function($rootScope,$scope,$location, $http, Rytapi){

  $scope.init = function(){
    $scope.filter={};
    $scope.rytapi = new Rytapi('customer');
  }

   $scope.search = function(){
    if($scope.filter.fromdate){
      var myDate1=$scope.filter.fromdate;
      myDate1=myDate1.split("-");
      var newDate1=myDate1[1]+"/"+myDate1[2]+"/"+myDate1[0];
      $scope.filter.fromts = new Date(newDate1).getTime()/1000;
      delete $scope.filter.fromdate;
    }
    if($scope.filter.todate){
      var myDate2=$scope.filter.todate;
      myDate2=myDate2.split("-");
      var newDate2=myDate2[1]+"/"+myDate2[2]+"/"+myDate2[0];
      $scope.filter.tots = new Date(newDate2).getTime()/1000;
      $scope.filter.tots = $scope.filter.tots+86400;
      delete $scope.filter.todate;
    }
    // if($scope.filter.loc)
    //   $scope.filter.loc = $scope.filter.loc.name;
    console.log($scope.filter)
    delete $scope.rytapi;
    $scope.rytapi = new Rytapi("customer", $scope.filter)
  }

  $scope.report = function(){
    if($scope.filter.fromdate){
      var myDate1=$scope.filter.fromdate;
      myDate1=myDate1.split("-");
      var newDate1=myDate1[1]+"/"+myDate1[2]+"/"+myDate1[0];
      $scope.filter.fromts = new Date(newDate1).getTime()/1000;
      delete $scope.filter.fromdate;
    }
    if($scope.filter.todate){
      var myDate2=$scope.filter.todate;
      myDate2=myDate2.split("-");
      var newDate2=myDate2[1]+"/"+myDate2[2]+"/"+myDate2[0];
      $scope.filter.tots = new Date(newDate2).getTime()/1000;
      $scope.filter.tots = $scope.filter.tots+86400;
      delete $scope.filter.todate;
    }
    // if($scope.filter.loc)
    //   $scope.filter.loc = $scope.filter.loc.name;
    console.log($scope.filter)
    var url = $rootScope.server+"/customer/report";
    var count = false;
    $scope.busy = true;
    for(var i in $scope.filter)
    {
      if($scope.filter[i])
      {
        if(!count)
        {
          url = url+"?"+i+"="+$scope.filter[i];
          count = true;
        }
        else {
          url = url+"&"+i+"="+$scope.filter[i];
        }
      }
    }
    console.log(url);

    $http.get(url,{ responseType: "arraybuffer" })
      .success(function(d,status){
        $scope.busy = false;
        var blob = new Blob([d], {
         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
           });
          saveAs(blob,'customerReport.xlsx');
            })
      .error(function(e){
        console.log('error', e)
      });//error
  }

});

app.controller('settingsCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/trigger.html';
  }

})

app.controller('botsCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){

    $scope.searchKey = '';
    $scope.filterKey = '';
    $scope.filterby = 'Choose Filter';
    $scope.filters = {filterby:['Gender','Age Group','Verified'], criteria:{'Gender':['Female','Male'],'Age Group':['Below 25', 'Above 25', 'Above 40']},'Verified':['Phone','Email','Phone & Email']}

    $scope.head = [
      {name:'FB Page ID',fld:''},
      {name:'Unanswered Queries', fld:''}
    ];

    $scope.fbpage = [
      { id: 'FB1000', show: { id: 'FB1000', unanswered: 46 }  },
    ];
  }

  $scope.setcriteria = function(filterby){
    console.log(filterby)
    $scope.filterby = filterby;
    $scope.filterOptions = $scope.filters.criteria[filterby];
    console.log($scope.filterOptions)
  }

});

app.controller('ticketCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){
    $scope.searchKey = '';
  }

  $scope.setcriteria = function(filterby){
    console.log(filterby)
    $scope.filterby = filterby;
    $scope.filterOptions = $scope.filters.criteria[filterby];
    console.log($scope.filterOptions)
  }


});

app.controller('dealorcouponCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){

    $scope.searchKey = '';

  }

  $scope.setcriteria = function(filterby){
    console.log(filterby)
    $scope.filterby = filterby;
    $scope.filterOptions = $scope.filters.criteria[filterby];
    console.log($scope.filterOptions)
  }



});

app.controller('catalogormenuCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){

    $scope.searchKey = '';
  }

  $scope.setcriteria = function(filterby){
    console.log(filterby)
    $scope.filterby = filterby;
    $scope.filterOptions = $scope.filters.criteria[filterby];
    console.log($scope.filterOptions)
  }

});

app.controller('devicesCtrl',function($rootScope,$scope,$location, Rytapi,$http){

  $scope.init = function(){
    $scope.searchKey = '';
    $scope.rytapi = new Rytapi('device');

    $scope.$on("devStatusUpdate", function(){
        // do nothing
    })

  }

  $scope.setcriteria = function(filterby){
    console.log(filterby)
    $scope.filterby = filterby;
    $scope.filterOptions = $scope.filters.criteria[filterby];
    console.log($scope.filterOptions)
  }


});

app.controller('appsCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){

    $scope.searchKey = '';

  }

  $scope.setcriteria = function(filterby){
    console.log(filterby)
    $scope.filterby = filterby;
    $scope.filterOptions = $scope.filters.criteria[filterby];
    console.log($scope.filterOptions)
  }

});


app.controller('TabsCtrl', function ($scope,$rootScope) {

  $scope.tabs = {
    "initialfeedback":[
      // {
      //   title: 'Store Rankings',
      //   url: 'assets/views/storerankings.html'
      // },
      {
        title: 'All Feedbacks',
        url: 'assets/views/feedbacklist.html'
      }
    ],
    "feedbacks":[
      // {
      //   title: 'Activity Log',
      //   url: 'assets/views/activitylog.html'
      // },
      {
        title: 'Add note',
        url: 'assets/views/addnote.html'
      }, {
        title: 'Email',
        url: 'assets/views/email.html'
      }, {
        title: 'SMS',
        url: 'assets/views/sms.html'
      }
      // , {
      //   title: 'Raise Ticket',
      //   url: 'assets/views/raiseticket.html'
      // }
    ],
    "settings":[
      // {
      //   title: 'Profile',
      //   url: 'assets/views/profile.html'
      // },
      {
        title: 'Trigger',
        url: 'assets/views/trigger.html'
      },
      {
        title: 'Change Password',
        url: 'assets/views/changepassword.html'
      }
    ],
     "formbuilder":[
    {
        title: 'Form Builder',
        url: 'assets/views/feedbackform1.html'
      }
      // {
      //   title: 'Profile',
      //   url: 'assets/views/profile.html'
      // },


    ],
    "customers":[
      // {
      //   title: 'History',
      //   url: 'assets/views/custHistory.html'
      // },
      {
        title: 'Activity Log',
        url: 'assets/views/activitylog.html'
      }, {
        title: 'Add note',
        url: 'assets/views/addnote.html'
      }, {
        title: 'Email',
        url: 'assets/views/email.html'
      }
      // ,{
      //   title: 'SMS',
      //   url: 'assets/views/sms.html'
      // }, {
      //   title: 'FB Chat',
      //   url: 'assets/views/fbchat.html'
      // }, {
      //   title: 'Web Chat',
      //   url: 'assets/views/webchat.html'
      // }
    ],
    "devices":[
      // {
      //   title: 'Mission List',
      //   url: 'assets/views/missionlist.html'
      // },
      // {
      //   title: 'Employee List',
      //   url: 'assets/views/employeelist.html'
      // // },
      // {
      //   title: 'Email Trigger List',
      //   url: 'assets/views/emailtriggerlist.html'
      // },
      // {
      //   title: 'SMS Trigger List',
      //   url: 'assets/views/smstriggerlist.html'
      // },
      {
        title: 'Add note',
        url: 'assets/views/addnote.html'
      }
      // ,
      // {
      //   title: 'Languages',
      //   url: 'assets/views/languages.html'
      // }
    ],
    "apps":[
      {
        title: 'Email Trigger List',
        url: 'assets/views/emailtriggerlist.html'
      },
      {
        title: 'SMS Trigger List',
        url: 'assets/views/smstriggerlist.html'
      }
    ],
    "tickets":[
      {
        title: 'Activity Log',
        url: 'assets/views/activitylog.html'
      }, {
        title: 'Add note',
        url: 'assets/views/addnote.html'
      }, {
        title: 'Email',
        url: 'assets/views/email.html'
      }, {
        title: 'SMS',
        url: 'assets/views/sms.html'
      }
    ],
    "catormenu":[
      {
        title: 'Add Category',
        url: 'assets/views/addCategory.html'
      }, {
        title: 'Add Item',
        url: 'assets/views/addItem.html'
      }
    ],
    "newcatormenu":[
      {
        title: 'New Catalog',
        url: 'assets/views/newcatalog.html'
      }, {
        title: 'New Menu',
        url: 'assets/views/newmenu.html'
      }
    ],
    "dlorcpn":[
      {
        title: 'Add note',
        url: 'assets/views/addnote.html'
      }, {
        title: 'Update',
        url: 'assets/views/update.html'
      }
    ],
    "newdlorcpn":[
      {
        title: 'New Deal',
        url: 'assets/views/newdeal.html'
      }, {
        title: 'New Coupon',
        url: 'assets/views/newcoupon.html'
      }
    ]
  };


    $rootScope.onClickTab = function (tab) {
      console.log("onClickTab")
      console.log(tab)
      // parse.JSON(tab);
      console.log(tab.url)
      $rootScope.currentTab = tab.url;
      console.log($rootScope.currentTab)
    }

    $scope.isActiveTab = function(tabUrl) {
      return tabUrl == $rootScope.currentTab;
    }
});

app.controller('fbdtlsCtrl', function ($scope,$rootScope,$http) {

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/addnote.html';
	var id = $rootScope.selected.id || null;
	if(!id)
		id=$rootScope.selected.fdid;
    $http.get($rootScope.server+"/feedback/detail/"+id)
      .success(function(d,status){
          if(d.statusCode==200)
          {
            $scope.feedback = d.data;
            if($scope.feedback.pic)
            {
              $scope.feedback.pic = "https://rytangle.com/fbpics/"+$scope.feedback.gid+"/"+$scope.feedback.pic;
            }
          }
      })
      .error(function(e){
        console.log('error', e)
      });//error
  }

});

app.controller('activitylogCtrl', function ($scope,$rootScope,$http) {
  $scope.init = function(){
    console.log("activity Log");
    $scope.icons={
      "feedback": "fa fa-comments bg-yellow",
      "message" : "fa fa-facebook bg-blue",
      "purchase":"fa fa-shopping-bag bg-red",
      "visit" : "fa fa-vcard-o bg-purple",
      "booking":"fa fa-shopping-bag bg-purple"
    }
    console.log($rootScope.server+"/customer/events/"+$rootScope.selected.custid);
    $http.get($rootScope.server+"/customer/events/"+$rootScope.selected.custid)
      .success(function(d,status){
          if(d.statusCode==200)
          {
            $scope.activities = d.data;
          }
      })
      .error(function(e){
        console.log('error', e)
      });//error
  }

});

app.controller('devicedtlsCtrl', function ($scope,$rootScope, $http) {

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/addnote.html';
    var id = $rootScope.selected.deviceid || null;
    $http.get($rootScope.server+"/device/detail/"+id)
        .success(function(d,status){
            if(d.statusCode==200)
            {
              $scope.device = d.data;
            }
        })
        .error(function(e){
          console.log('error', e)
        });//error
  };// init

});

app.controller('appdtlsCtrl', function ($scope,$rootScope) {

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/emailtriggerlist.html';
  }

});

app.controller('botdtlsCtrl', function ($scope,$rootScope) {

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/emailtriggerlist.html';
  }

});

app.controller('custdtlsCtrl', function ($scope,$rootScope,$http) {
  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/activitylog.html';
    $http.get($rootScope.server+"/customer/detail/"+$rootScope.selected.custid)
      .success(function(d,status){
        console.log(d);
          if(d.statusCode==200)
          {
            $scope.customer = d.data;
          }
      })
      .error(function(e){
        console.log('error', e)
      });//error
      $http.get($rootScope.server+"/customer/custsummary/"+$rootScope.selected.custid)
        .success(function(d,status){
          console.log(d);
            if(d.statusCode==200)
            {
              $scope.summary = d.data;
            }
        })
        .error(function(e){
          console.log('error', e)
        });//error
  };

});

app.controller('tktdtlsCtrl', function ($scope,$rootScope) {

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/activitylog.html';
  }

});

app.controller('catormenudtlsCtrl', function ($scope,$rootScope) {

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/addCategory.html';
  }

});

app.controller('dlorcpndtlsCtrl', function ($scope,$rootScope) {

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/addnote.html';
  }

});

app.controller('newdealorcouponCtrl', function ($scope,$rootScope) {

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/newdeal.html';
  }

});

app.controller('newcatalogormenuCtrl', function ($scope,$rootScope) {

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/newcatalog.html';
  }

});


app.controller('advancefilterfbCtrl', function ($scope,$rootScope) {

  $scope.init = function(){
    $scope.choosenfilters = {};
    $scope.filtershowcase = []

    $scope.custparameters = [
                                              {
                                                'head':    'agegroup',
                                                'type':    'agegroup',
                                                'required': true,
                                                'que':      'Age Group',
                                                'options': ['Below 25', '25-35', '35-50', 'Above 50']
                                              },
                                              {
                                                'head':    'gender',
                                                'type':    'gender',
                                                'required': true,
                                                'que':      'Gender',
                                                'options': ['Male', 'Female']
                                              },
                                              {
                                                'head':    'name',
                                                'type':    'name',
                                                'required': false,
                                                'que':      'Name',
                                                'options': []
                                              },
                                              {
                                                'head':    'phone',
                                                'type':    'phone',
                                                'required': false,
                                                'que':      'Phone',
                                                'options': []
                                              }
                              ];
    $scope.fbparameters = [
      {
        'head': 'rating',
        'type': 'rating',
        'dependsonparam': '',
        'dependsonval': '',
        'required': true,
        'answered': false,
        'scale': 5,
        'val': 0,
        'concern': true,
        'desc': [],
        'options': [1, 2, 3, 4, 5],
        'concernoptions': [1, 2, 3, 4],
        'que': 'Please rate your experience at Zaffran'
      },
      {
        'head': "service",
        'type': 'likedislike',
        'dependsonparam': '',
        'dependsonval': '',
        'required': false,
        'answered': false,
        'val': '',
        'concern': true,
        'desc': [],
        'options': ['like', 'dislike'],
        'concernoptions': ['dislike'],
        'que': 'Services'
      },
      {
        'head': "food",
        'type': 'likedislike',
        'dependsonparam': '',
        'dependsonval': '',
        'required': false,
        'answered': false,
        'val': '',
        'concern': true,
        'desc': [],
        'options': ['like', 'dislike'],
        'concernoptions': ['dislike'],
        'que': 'Food'
      },
      {
        'head': "ambience",
        'type': 'likedislike',
        'dependsonparam': '',
        'dependsonval': '',
        'required': false,
        'answered': false,
        'val': '',
        'concern': true,
        'desc': [],
        'options': ['like', 'dislike'],
        'concernoptions': ['dislike'],
        'que': 'Ambience'
      },
      {
        'head': "visit",
        'type': 'checkbox',
        'required': false,
        'answered': false,
        'val': '',
        'concern': false,
        'desc': [],
        'options': ['Quite Frequently', 'Special Occassions', 'First Time', 'Rarely'],
        'concernoptions': [],
        'que': 'How often do you visit Zaffran?',
      },
      {
        'head': "refer",
        'type': 'obj',
        'dependsonparam': '',
        'dependsonval': '',
        'required': false,
        'answered': false,
        'val': '',
        'concern': false,
        'desc': [{
          "name": "",
          "phone": ""
        }],
        'options': [],
        'concernoptions': [],
        'que': 'Give your loved ones a 10% discount on their visit..'
      },
      {
        'head': "favdish",
        'type': 'string',
        'dependsonparam': '',
        'dependsonval': '',
        'required': false,
        'answered': false,
        'val': '',
        'concern': false,
        'options': [],
        'concernoptions': [],
        'que': "Which is your favourite dish at zaffran?"
      },
      {
        'head': "comment",
        'type': 'string',
        'dependsonparam': '',
        'dependsonval': '',
        'required': false,
        'answered': false,
        'val': '',
        'concern': false,
        'desc': [],
        'options': [],
        'concernoptions': [],
        'que': "Comment"
      }
    ]
  }


  $scope.checkifinarr = function(obj,param,val){
    if(!$scope[obj][param.head])
      return false;
    else{
      for(var i = 0; i < $scope[obj][param.head].length; i++){
        var index = $scope[obj][param.head].indexOf(val);
        if(index>-1){
          return true;
        }
      }
    }
  };

  $scope.removefrom = function(obj,param){
    console.log(obj,param)
    var index = $scope[obj][param.head].indexOf(param.body);
    if(index>-1){
      console.log("removing ",param.head," ",param.body," from filters")
      $scope[obj][param.head].splice(index,1);
    }

    var showindex = $scope.filtershowcase.indexOf(param);
    if(showindex>-1){
      $scope.filtershowcase.splice(showindex,1);
    }

  };

  $scope.setdate = function(obj,param,val){
    console.log(val);
  }

  $scope.insertto = function(obj,param,val){
    $scope.locvar = '';
    console.log(obj,param,val)
    var filter = {};
    filter['head'] = param;
    filter['body'] = val;
    if(!$scope[obj][param]){
      console.log("first push of ",param)
      $scope[obj][param]=[];
      $scope[obj][param].push(val);
      $scope.filtershowcase.push(filter)
    }
    else{
      console.log(param," already choosen")
      if(param == 'Location'){
        var index = $scope[obj][param].indexOf(val);
        if(index>-1){
          return null;
        }
        else{
          console.log("adding ",val," to ",param)
          $scope[obj][param].push(val);
          $scope.filtershowcase.push(filter);
          return null
        }
      }
      else if(param == 'From Date' || param == 'To Date'){
        $scope[obj][param].splice(index,1);
        for(var j = 0; j < $scope.filtershowcase.length; j++){
          if ($scope.filtershowcase[j].head==param) {
            $scope.filtershowcase[j].body=val;
            return null;
          }
        }
      }

      for(var i = 0; i < $scope[obj][param].length; i++){
        var index = $scope[obj][param].indexOf(val);
        if(index>-1){
          console.log("removing ",param," ",val," from filters")
          $scope[obj][param].splice(index,1);
          break;
        }
      }

      for(var j = 0; j < $scope.filtershowcase.length; j++){
        if ($scope.filtershowcase[j].head==param && $scope.filtershowcase[j].body==val) {
          $scope.filtershowcase.splice(j,1);
          return null;
        }
      }

      $scope[obj][param].push(val);
      $scope.filtershowcase.push(filter)
    }
    console.log($scope[obj])
    console.log($scope.filtershowcase)
  }


});

app.controller('previewFormCtrl',function($rootScope,$scope){

  $scope.newField = {};
  $scope.fields = [{

    type: 'text',
    que: ''

  }];


})

app.controller('FbController', function ($rootScope, $scope, $http, $location) {


        $rootScope.fbparameters = [
      {
        "head": "rating",
        "type": "rating",
        "name": "rating",
        "visible": false,
        "dependsonparam": "",
        "dependsonval": "",
        "required": true,
        "val": 0,
        "desc": [],
        "que": "Please rate at a scale of 1-5.",
        "options": [1, 2, 3, 4, 5],
        "concernoptions": []
      }, {
        "head": "npsRating",
        "type": "nps",
        "name": "npsRating",
        "visible": true,
        "dependsonparam": "",
        "dependsonval": "",
        "required": true,
        "val": -1,
        "desc": [],
        "que": "How likely you Recommend to others.",
        "options": [1, 2, 3, 4, 5],
        "concernoptions": []
      }, {
        "head": "House-Keeping",
        "type": "colorSmileyRadio",
        "name": "House-Keeping",
        "visible": true,
        "dependsonparam": "",
        "dependsonval": "",
        "required": false,
        "val": "",
        "desc": [],
        "que": "House-Keeping",
        "options": [1, 2, 3, 4, 5],
        "concernoptions": []
      },{
    "head": "lighting",
    "type": "yesno",
    "name": "Proper lighting",
    "visible": true,
    "dependsonparam": "",
    "dependsonval": "",
    "required": false,
    "val": "",
    "desc": [],
    "que": "Was the washroom properly lighted?",
    "options": ["Yes", "No"],
    "concernoptions": ["No"]
  },
      {
        "head": "hygiene",
        "type": "colorSmileyRadio",
        "name": "Hygiene",
        "visible": true,
        "dependsonparam": "",
        "dependsonval": "",
        "required": false,
        "val": "",
        "desc": [],
        "que": "Hygiene",
        "options": ["Poor", "Average", "Good", "Very Good", "Excellent"],
        "concernoptions": ["Average", "Poor"]
      },
      {
        "head": "vists",
        "type": "radio",
        "name": "vists",
        "visible": true,
        "dependsonparam": "",
        "dependsonval": "",
        "required": false,
        "val": "",
        "desc": [],
        "que": "Is this your First vist? ",
        "options": ['Yes','No'],
        "concernoptions": []
      },
      {
        "head": "visit_frequency",
        "type": "radio",
        "name": "Visit Frequency",
        "visible": true,
        "dependsonparam": "vists",
        "dependsonval": "No",
        "required": false,
        "val": "",
        "desc": [],
        "que": "How often do you visit?",
        "options": ["Frequently", "Occasionally", "Rarely", "First Time"],
        "concernoptions": []
      },
        {
        "head": "like_most",
        "type": "shorttext",
        "name": "Like Most",
        "visible": true,
        "dependsonparam": "",
        "dependsonval": "",
        "required": false,
        "val": "",
        "desc": [],
        "que": "What do you like most?",
        "options": [],
        "concernoptions": []
      }, {
        "head": "suggestions",
        "type": "longtext",
        "name": "Suggestions",
        "visible": true,
        "dependsonparam": "",
        "dependsonval": "",
        "required": false,
        "val": "",
        "desc": [],
        "que": "Suggestions",
        "options": [],
        "concernoptions": []
      },
      {
        "head": "liked",
        "type": "likedislike",
        "name": "likedislike",
        "visible": true,
        "dependsonparam": "",
        "dependsonval": "",
        "required": false,
        "val": "",
        "desc": [],
        "que": "Liked our Shops ?",
        "options": ['Yes','No'],
        "concernoptions": []
      },
      {
        "head": "multidrop",
        "type": "checkbox",
        "name": "multidrop",
        "visible": true,
        "dependsonparam": "liked",
        "dependsonval": "yes",
        "required": false,
        "val": "",
        "desc": [],
        "que": "Tell us,what you likes? ",
        "options": [' Fashion', 'Beauty, Health, Grocery', 'Books','Sports, Fitness, Bags','Movies & Music'],
        "concernoptions": []
      },
      {
        "head": "refer",
        "type": "refer",
        "name": "Refer a Friend",
        "visible": true,
        "dependsonparam": "",
        "dependsonval": "",
        "required": false,
        "scale": "",
        "val": "",
        "desc": [],
        "que": "Please refer some of your friends to us",
        "options": [{
          "name": "",
          "phone": ""
        }],
        "concernoptions": []
      },
    ];

    $scope.setVal = function (index, val) {
      console.log(index)
      console.log(val)
      if ($rootScope.fbparameters[index].type == 'num') {
        $rootScope.fbparameters[index].val = parseInt(val);
      }
      else {
        $rootScope.fbparameters[index].val = val;
      }
      $rootScope.fbparameters[index].answered = true;
      $rootScope.pleasefill = false;
    }// end setVal


    $scope.isVal = function (index, val) {
      console.log(index, val)
      if ($rootScope.fbparameters[index].val == val)
        return true;
      return false;
    }



  $scope.shouldihide = function (index) {
    if ($rootScope.fbparameters[index].dependsonparam) {
      for (var i = 0; i < $rootScope.fbparameters.length; i++) {
        if ($rootScope.fbparameters[i].head == $rootScope.fbparameters[index].dependsonparam && $rootScope.fbparameters[i].val != $rootScope.fbparameters[index].dependsonval) {
          return true;
        }
      }
    }
    return false;
  }

  $scope.allfilled = function () {
    for (var i = 0; i < $rootScope.fbparameters.length; i++) {
      if ($rootScope.fbparameters[i].required && !$rootScope.fbparameters[i].answered) {
        var notready = true;
        $scope.tobefilled = $rootScope.fbparameters[i].head;
        break;
      }
    }
    if (notready)
      return false;
    // else{
    //   if(!$rootScope.agree.val){
    //     $scope.tobefilled = 'agree';
    //     return false
    //   }
    else {
      $scope.tobefilled = '';
      return true;
    }
  }

});
//////////////// locationsCtrl ///////////////////////////////////////////////////

app.controller('locationsCtrl',function($rootScope,$scope,$location,$http,Rytapi){

  $scope.init = function(){
    $scope.currentlocnames = [];
    $scope.newlocation = false;
    $scope.rytapi = new Rytapi('location');
  }

  $scope.removeloc = function(loc,from){
    $scope.location = loc;
    var url = $rootScope.server+"/location/removeloc";
    console.log(url)
    console.log($scope.location)
    $http.post(url,$scope.location)
    .success(function(d,status){
      console.log(d,status)
      // if (d.statusCode==200 || d.statusCode==404) {
      //   $scope.message = {"statusCode":200,"message":"Location update succesfull."}
      // }
      // else{
      //   $scope.message = {"statusCode":502,"message":"Oops! Failed to updated location. Please retry!"}
      // }
      switch(from){
        case "table":
          $scope.init();
        break;
        case "edit":
          $location.path("locations");
        break;
      }
    })
    .error(function(e){
      console.log("addoreditlocation failed")
      console.log('error', e)
      // $scope.message = {"statusCode":502,"message":"Oops! Failed to update password. Please retry!"}
      $scope.init();
    });
  }

  $scope.addoreditloc = function(loc,fntype){
    console.log("addoreditloc called")
    $scope[fntype] = true;
    $scope.location = loc;
    if($rootScope.locations.length){
      $scope.currentlocnames = [];
      for(var i=0; i<$rootScope.locations.length; i++){
        var locname = $rootScope.locations[i].name.toLowerCase().replace(/[^0-9a-z]/gi, '');
        locname = locname.split(' ').join('');
        $scope.currentlocnames.push(locname);
      }
      console.log($scope.currentlocnames);
    }
    // if(fntype=="newlocation"){
    //   $scope.location.locid = $rootScope.randomString(10,'aA#');
    // }
    $rootScope.currentTab = "assets/views/addoreditlocation.html";
    console.log(fntype,$scope.location,$rootScope.currentTab);
    console.log($scope.currentlocnames.indexOf("Ghatkopar"));
  }

  $scope.checkalrdyexist = function(){
    if($scope.location.name){
      var str = $scope.location.name.toLowerCase().replace(/[^0-9a-z]/gi, '');
      str = str.split(' ').join('');
      if($scope.currentlocnames.indexOf(str)>-1)
        return false;
    }
    return true;
  }

  $scope.save = function(loc,fntype){
    var url = $rootScope.server+"/location/addoreditlocation";
    if(fntype=="newlocation"){
      $scope.location["displayname"] = $scope.location.name;
      $scope.location.name = $scope.location.name.toLowerCase().replace(/[^0-9a-z]/gi, '');
      $scope.location.name = $scope.location.name.split(' ').join('');
    }
    console.log($scope.location)
    $http.post(url,$scope.location)
    .success(function(d,status){
      console.log(d,status)
      if (d.statusCode==200 || d.statusCode==404) {
        $scope.message = {"statusCode":200,"message":"Location update succesfull."}
      }
      else{
        $scope.message = {"statusCode":502,"message":"Oops! Failed to update location. Please retry!"}
      }
      $scope[fntype] = false;
      $scope.init();
    })
    .error(function(e){
      console.log("addoreditlocation failed")
      console.log('error', e)
      $scope.message = {"statusCode":502,"message":"Oops! Failed to update password. Please retry!"}
      $scope[fntype] = false;
      $location.path(loc)
    });
  }

  $scope.canceladdoredit = function(loc,fntype){
    $scope.location = {};
    $scope[fntype] = false;
    $location.path(loc)
  }

  $scope.setcriteria = function(filterby){
    console.log(filterby)
    $scope.filterby = filterby;
    $scope.filterOptions = $scope.filters.criteria[filterby];
    console.log($scope.filterOptions)
  }

});


app.controller('changepasswordCtrl',function($rootScope,$scope,$location,$http){

  $scope.init = function(){
    $scope.change={};
    $scope.message = {"bgcolor":"danger","message":"Oops! Failed to update password. Please retry!"}
  }

  $scope.check=function(){
    if( $scope.change.password1 &&  $scope.change.password2)
    {
      if($scope.change.password1==$scope.change.password2){
        return true;
      }
      else{
        return false;
      }
    }
    else{
      return false;
    }
  }

  $scope.changepassword = function(){
    $http.post($rootScope.server+"/user/changepassword",$scope.change)
    .success(function(d,status){
      if (d.statusCode==200) {
        $scope.message = {"statusCode":200,"message":"Password updated successfully"}
      }
      else{
        $scope.message = {"statusCode":502,"message":"Oops! Failed to update password. Please retry!"}
      }
    })
    .error(function(e){
      console.log("changepassword failed")
      console.log('error', e)
      $scope.message = {"statusCode":502,"message":"Oops! Failed to update password. Please retry!"}
    });//error
  }

});

////////////////triggerCtrl///////////////////////////////////////////////////////

app.controller("triggerCtrl", function($scope,$window,$http,$location,$rootScope,Rytapi) {
  $scope.init = function(){
    $rootScope.newtrigger = false;
    $rootScope.edittrigger = false;
    $scope.rytapi = new Rytapi('trigger');
  }

  $scope.addoredittrigg = function(trig,fntype){
    console.log("addoredittrigg called")
    $rootScope.events = [{"fename": "Negative Feedbacks","bename": "feedback"},{"fename": "Customer Walkin", "bename": "visit"}];
    $rootScope[fntype] = true;
    $rootScope.trigger = trig;
    if(fntype=="newtrigger"){
      $rootScope.trigger.active = true;
    }
    $rootScope.currentTab = "assets/views/addoredittrigger.html";
    console.log($rootScope.trigger);
  }

  $scope.removeitem = function(what,index){
    $rootScope.trigger[what].splice(index,1);
  }

  $scope.save = function(loc,fntype){
      console.log($rootScope.trigger)
      console.log(loc,fntype)
    if(!$rootScope.trigger["sms"])
      $rootScope.trigger["sms"] = [];
    if(!$rootScope.trigger["email"])
      $rootScope.trigger["email"] = [];
    for(var i=0; i < $window.phonearr.length; i++){
      if($window.phonearr[i])
        $rootScope.trigger["sms"].push(parseInt($window.phonearr[i]));
    }
    for(var j=0; j < $window.emailarr.length; j++){
      if($window.emailarr[j])
        $rootScope.trigger["email"].push($window.emailarr[j]);
    }
    if(fntype=="addtrigger" && $rootScope.trigger.loc){
      $rootScope.trigger.displayloc = $rootScope.trigger.loc.displayname;
      $rootScope.trigger.loc = $rootScope.trigger.loc.name;
    }
    if($rootScope.trigger.eventdtls)
      $rootScope.trigger.event = $rootScope.trigger.eventdtls.bename;
    console.log($rootScope.trigger)
    var url = $rootScope.server+"/trigger/addoredittrigger";
    console.log(url)
    console.log($rootScope.trigger)
    $http.post(url,$rootScope.trigger)
    .success(function(d,status){
      console.log(d,status)
      if (d.statusCode==200 || d.statusCode==404) {
        $scope.message = {"statusCode":200,"message":"Location update succesfull."}
      }
      else{
        $scope.message = {"statusCode":502,"message":"Oops! Failed to update trigger. Please retry!"}
      }
      $scope[fntype] = false;
      $rootScope.currentTab = "assets/views/trigger.html";
    })
    .error(function(e){
      console.log("addoredittrigger failed")
      console.log('error', e)
      $scope.message = {"statusCode":502,"message":"Oops! Failed to update trigger. Please retry!"}
      $scope[fntype] = false;
      $rootScope.currentTab = "assets/views/trigger.html";
    });
  }

  $scope.canceladdoredit = function(loc,fntype){
    $rootScope.trigger = {};
    $rootScope[fntype] = false;
    $rootScope.currentTab = "assets/views/trigger.html";
  }

  $scope.removetrig = function(trig,from){
    $rootScope.trigger = trig;
    var url = $rootScope.server+"/trigger/removetrig";
    console.log(url)
    console.log($rootScope.trigger)
    $http.post(url,$rootScope.trigger)
    .success(function(d,status){
      console.log(d,status)
      // if (d.statusCode==200 || d.statusCode==404) {
      //   $scope.message = {"statusCode":200,"message":"Location update succesfull."}
      // }
      // else{
      //   $scope.message = {"statusCode":502,"message":"Oops! Failed to update trigger. Please retry!"}
      // }
      switch(from){
        case "table":
          console.log(from);
          $scope.init();
        break;
        case "edit":
          console.log(from);
          $rootScope.currentTab = "assets/views/trigger.html";
        break;
      }
    })
    .error(function(e){
      console.log("addoreditlocation failed")
      console.log('error', e)
      // $scope.message = {"statusCode":502,"message":"Oops! Failed to update password. Please retry!"}
      $scope.init();
    });
  }
});

app.controller('formCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/feedbackform1.html';
  }

});

/* Amendment by diksha */
app.controller('previewCtrl',function ($rootScope,$scope,$http) {


console.log($rootScope.data);




});

/* star rating directive */

app.directive('starRating', function () {
    return {
        scope: {
            rating: '=',
            maxRating: '@',
            readOnly: '@',
            click: "&",
            mouseHover: "&",
            mouseLeave: "&"
        },
        restrict: 'EA',
        template:
            "<div style='display: inline-block; margin: 5px; padding: 5px; cursor:pointer;' ng-repeat='idx in maxRatings track by $index'> \
                    <img style='height:40px;' ng-src='{{((hoverValue + _rating) <= $index) && \"http://www.codeproject.com/script/ratings/images/star-empty-lg.png\" || \"http://www.codeproject.com/script/ratings/images/star-fill-lg.png\"}}' \
                    ng-Click='isolatedClick($index + 1)' \
                    ng-mouseenter='isolatedMouseHover($index + 1)' \
                    ng-mouseleave='isolatedMouseLeave($index + 1)'></img> \
            </div>",
        compile: function (element, attrs) {
            if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
                attrs.maxRating = '5';
            };
        },
        controller: function ($scope, $element, $attrs) {
            $scope.maxRatings = [];

            for (var i = 1; i <= $scope.maxRating; i++) {
                $scope.maxRatings.push({});
            };

            $scope._rating = $scope.rating;

			$scope.isolatedClick = function (param) {
				if ($scope.readOnly == 'true') return;

				$scope.rating = $scope._rating = param;
				$scope.hoverValue = 0;
				$scope.click({
					param: param
				});
			};

			$scope.isolatedMouseHover = function (param) {
				if ($scope.readOnly == 'true') return;

				$scope._rating = 0;
				$scope.hoverValue = param;
				$scope.mouseHover({
					param: param
				});
			};

			$scope.isolatedMouseLeave = function (param) {
				if ($scope.readOnly == 'true') return;

				$scope._rating = $scope.rating;
				$scope.hoverValue = 0;
				$scope.mouseLeave({
					param: param

        });


      }
    }
  }
});

app.controller('formbuildCtrl',function($rootScope,$scope,$http,$sce){
  $scope.init = function(){
     // $scope.clearfield();
  }
    $scope.tabs = [
      {
        title: 'Build Form',
        url: '/assets/app/views/buildform.html'
      }, {
        title: 'Preview Form',
        url: '/assets/app/views/addnote.html'
      }
    ];
    console.log("Initing");
    console.log("loading");
    $scope.ans={};
    $scope.smile = "";
    $scope.feedbacks = {"Questions":[]};
      $scope.feedbacks.Questions.concernoptions=[];
    var url=$rootScope.server+"/template/getfordash/?type=fbapp";
    console.log(url)
    $http.get(url)
    .success(function(data)
    {
      console.log(data);
      $scope.feedbacks.Questions=data.data;
    })
    .error(function(err)
    {
      console.log(err)
    })


    // $scope.save = function(){
    //    // console.log("going")
    //   $rootScope.data.push();
    //   $scope.que.push({"que":''})
    //   console.log($scope.que)
    // }

    $rootScope.data = {
      singleSelect:null,
      availableOptions: [
      {name:''},
      {name: 'Smiley'},
      { name: 'Rating'},
      { name: 'Button'},
      { name: 'Text'}
    ],
      smileySelect:null,
      availableSTypes:[
        {name:''},
      {name:'Color Smiley',url:'/assets/views/colorSmileyRadio'},
      {name:'BlackWhite Smiley', url:'/assets/views/smileyradio'}
    ],
      ratingSelect:null,
      availableRTypes:[
        {name:''},
      {name:'Star Rating'},
      {name:'Five Number Rating'},
      {name:'Ten Number Rating'}
    ],
      buttonSelect:null,
      availableBTypes:[
        {name:''},
      {name:'Single SelectButton'},
      {name:'MultiSelect Button'}
    ],
      textSelect:null,
      availableTTypes:[
        {name:''},
      {name:'Short Text'},
      {name:'Long Text'}
],
    }
    console.log("Option",$rootScope.data)

    $scope.required = false;

    // $rootScope.formbuilders = [
    //   {
    //     "head": "",
    //     "type": "",
    //     "name": "",
    //     "visible": false,
    //     "dependsonparam": "",
    //     "dependsonval": "",
    //     "required": true,
    //     "val": 0,
    //     "desc": [],
    //     "que": "",
    //     "options": [{"Value":""}],
    //     "concernoptions": []
    //   }
    //   ];

  

  $scope.trustedContent = $sce.trustAsHtml($rootScope.data.url);


$scope.save = function(){
// console.log("questionname:",$scope.question,"head:",$scope.Qname,"DTsmiley:" )
// $scope.addques = true;
$scope.obj={};


$scope.obj.questionname=$scope.question;
$scope.obj.Smiley= $rootScope.data.smileySelect;
// if($scope.obj.Smiley=='Color Smiley')
// {
//   $scope.obj.url='assets/views/colorSmileyRadio.html'
// }
$scope.obj.Rating = $rootScope.data.ratingSelect;
$scope.obj.button = $rootScope.data.buttonSelect;
$scope.obj.tex = $rootScope.data.textSelect;
$scope.obj.Input = $rootScope.data.textSelect;
$scope.obj.head= $scope.Qname;

 
console.log("data",$scope.obj)

$scope.questionlist=[];
$scope.questionlist.push($scope.obj);
console.log($scope.questionlist);


//$scope.question= [];
 //$scope.Qname = [];
 //$scope.data.smileySelect= [];

 // $scope.clearfield();

}

$scope.clearfield = function(){

// $scope.userForm.$setPristine();
  // $scope.question = '';
  // $scope.Qname = '';
  
}
 // scope.question= "";
 


$scope.selected = 0;

$scope.label=[{ "Option": "", checked:false,}];
$scope.multiselect = [{"Option":"",checked:false}]
$scope.addOther = function () {
// console.log(parentindex);
$scope.label.push({ "Option": "", checked:false })
$scope.multiselect.push({"Option":"", checked:false})
}
$scope.deleterefer = function(refer){
  var index = $scope.label.indexOf(refer);
  $scope.label.splice(index, 1);
  $scope.multiselect.splice(index,1);
};



    $scope.starRating3 = 2;

    $scope.click3 = function (param) {
        console.log('Click');
    };

    $scope.mouseHover3 = function (param) {
        console.log('mouseHover(' + param + ')');
        $scope.hoverRating3 = param;
    };

    $scope.mouseLeave3 = function (param) {
        console.log('mouseLeave(' + param + ')');
        $scope.hoverRating3 = param + '*';

      }
  




      $scope.edit=function(answers,newquestion){
      $scope.init();
      console.log(answers);
      console.log(newquestion);
      console.log(answers.type)
      console.log(answers.concernoptions)
      console.log(answers.options)
      $scope.constants[answers.type].options=answers.options;
      console.log($scope.ans.options)
      $scope.ans = answers;
     }



      $scope.add=function(a) {
      console.log("Adding a new Question");
      $scope.ans.concernoptions=[];
      if ($scope.feedbacks.Questions.indexOf(a) == -1) {
        console.log(a);
        console.log($scope.ans.type)
        // console.log($scope.constants[$scope.ans.type].options)

        if( $scope.ans.type== 'singledropdown'  || $scope.ans.type== 'multidropdown'|| $scope.ans.type== 'radio'|| $scope.ans.type== 'checkbox'){

            console.log("ifpart")
            if(!angular.isArray($scope.constants[$scope.ans.type].options))
            {
                console.log("check array");
                $scope.ans.options=$scope.constants[$scope.ans.type].options.split(',');
                $scope.feedbacks.Questions.push(a);
            }
            else
                $scope.ans.options=$scope.constants[$scope.ans.type].options
                $scope.feedbacks.Questions.push(a);

        }
        else
        {
                $scope.ans.options=$scope.constants[$scope.ans.type].options
                $scope.feedbacks.Questions.push(a);
        }
        console.log(a);

        }

        else
        {

            console.log(a);
            console.log($scope.ans.type)
            console.log($scope.constants[$scope.ans.type].options)
            if( $scope.ans.type== 'singledropdown'  || $scope.ans.type== 'multidropdown'|| $scope.ans.type== 'radio'|| $scope.ans.type== 'checkbox'){
                console.log("ifpart")
                if(!angular.isArray($scope.constants[$scope.ans.type].options))
                {
                      console.log("check array");
                      $scope.ans.options=$scope.constants[$scope.ans.type].options.split(',');
                      $scope.feedbacks.Questions.push(a);
                  }
                    else
                $scope.ans.options=$scope.constants[$scope.ans.type].options
                $scope.feedbacks.Questions.push(a);
                }
              else
              {
                  $scope.ans.options=$scope.constants[$scope.ans.type].options
                  $scope.feedbacks.Questions.push(a);
              }
           }

            $scope.ans={};
    }

    $scope.cancel=function() {
        console.log("clear field");
        $scope.ans={};

    }
    $scope.deletequestion = function (customer) {
        console.log(customer);
        var index = $scope.feedbacks.Questions.indexOf(customer);
        $scope.feedbacks.Questions.splice(index, 1);
    };

// *****************checkboxend***********************************************


$scope.publish=function(val){
  console.log(val);
  $scope.appval=angular.toJson(val);
  console.log($scope.appval);

  $scope.feedback={};
  var url = $rootScope.server+"/template/post";

  $scope.feedback["data"]=JSON.parse($scope.appval);
  $scope.feedback["type"]="fbapp";
  console.log($scope.feedback);
  $scope.feedback=angular.toJson($scope.feedback);
  console.log($scope.feedback);
  $http.post(url,$scope.val);
  console.log(url)
  var config = {
                headers : {

                              'Content-Type': 'application/json;',
                              'Access-Control-Allow-Origin': '*'                          }
            }


    $http.post(url, $scope.feedback)
            .success(function (data, status, headers, config) {
              console.log(data)
                $scope.feedbacks.Questions = data.data;
            })
            .error(function (data, status, header, config) {
                $scope.ResponseDetails = "Data: " + data +
                    "<hr />status: " + status +
                    "<hr />headers: " + header +
                    "<hr />config: " + config;
            });
}

   $scope.constants={
                      "colorSmileyRadio":   {"options":['Excellent','very good','good','bad','very bad'],
                                         "link" :""
                                         },

                     "smileyradio":    {"options":['Excellent','very good','good','bad','very  bad'],
                                         "link" :""
                                         },

                      "rating":          {"options":['1','2','3','4','5'],
                                          "link" :""
                                         },

                     "nps":              {"options":['0','1','2','3','4','5','6','7','8','9','10'],
                                          "link":""
                                         },

                    "shorttext":
                                        {"options":[],
                                          "link":""
                                         },
                    "longtext":
                                        {"options":[],
                                          "link":""
                                         },

                    "checkbox":
                                        {"options":['1','2','3','4','5'],
                                          "link":""
                                         },

                     "likedislike":
                                        {"options":["like","dislike"],
                                          "link":""
                                         },
                     "yesno":
                                        {"options":["yes","no"],
                                          "link":""
                                         },
                    "radio":
                                        {"options":['1','2','3','4','5'],
                                          "link":""
                                         },
                    "singledropdown":
                                        {"options":['1','2','3','4','5'],
                                          "link":""
                                         },
                    "multidropdown":
                                        {"options":['1','2','3','4','5'],
                                          "link":""
                                         },
                    "refer":
                                        {"options":['1','2','3','4','5'],
                                          "link":""
                                         }
                    }
    $scope.type= '';
    $scope.anstypes = [
    "smileyradio","colorSmileyRadio","radio","refer","likedislike","yesno", "multidropdown","singledropdown","checkbox","shorttext","longtext","rating","nps"];


$scope.IsansSelected=function()
{
  console.log($scope.ans.type)
  if($scope.selectedAns)
  {

    $scope.ans.option = $scope.constants[ans.type];
    if($scope.selOptions.optionable )
      return true;
  }
  else

   return false

}






 $scope.options = []


});
