var app = angular.module('dashboard',['ngRoute','chart.js']);

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
  $routeProvider.when('/insideapp',         {templateUrl: 'assets/views/insideapp.html', reloadOnSearch: false});
  $routeProvider.when('/settings',          {templateUrl: 'assets/views/settings.html', reloadOnSearch: false});
  $routeProvider.when('/tickets',           {templateUrl: 'assets/views/tickets.html', reloadOnSearch: false});
  $routeProvider.when('/ticketdtls',        {templateUrl: 'assets/views/ticketdtls.html', reloadOnSearch: false});
  $routeProvider.when('/newtkt',            {templateUrl: 'assets/views/newtkt.html', reloadOnSearch: false});
  $routeProvider.when('/newdealorcoupon',   {templateUrl: 'assets/views/newdealorcoupon.html', reloadOnSearch: false});
  $routeProvider.when('/newcatalogormenu',  {templateUrl: 'assets/views/newcatalogormenu.html', reloadOnSearch: false});
  $routeProvider.when('/users',             {templateUrl: 'assets/views/users.html', reloadOnSearch: false});
  $routeProvider.when('/uploadexcel',       {templateUrl: 'assets/views/uploadexcel.html', reloadOnSearch: false});
});

app.run(function($rootScope, $http){
  $rootScope.server = location.origin+'/api/upload/';
});

app.controller('appCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){
  };

  $rootScope.route = function(page){
    console.log(page);
    $rootScope.sidebaractive = page;
    $location.path(page);
  };

  $rootScope.gotoDetail = function(item, page){
    console.log(item)
    $rootScope.selected = item;
    $location.path(page)
  }

  $rootScope.details = function(part){
    for (var key in part){
      console.log(key)
      console.log(part[key])
    }
  }

  $rootScope.toString = function(item){
    console.log(item.toString);
    return item.toString();
  }


});

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
                              {"title":"FB Chatbot","url":"bots","icon":"fa fa-facebook"},
                              // {"title":"Web Chatbot","url":"bots","icon":"fa fa-comments"},
                              {"title":"App","url":"apps","icon":"fa fa-android"}
                            ]
                },
                {"title":"Admin",
                 "contents":[
                              {"title":"Settings","url":"settings","icon":"fa fa-cogs"}
                            ]
                }
              ]
  }

});

app.controller('minidashCtrl',function($rootScope){

  $rootScope.topic = {
    "feedbacks": [{"main":"67","sub":"Feedbacks"},{"main":"29","sub":"Negative"},{"main":"Parking","sub":"Top Concern: 47 Dislikes"},{"main":"6.5","sub":"NPS Score"}],
    "customers": [{"main":"36","sub":"Total Registrations"},{"main":"18","sub":"Birthdays/Anniversaries"},{"main":"31","sub":"gave feedback again"},{"main":"15","sub":"Multiple Visits"}],
    "tickets": [{"main":"215","sub":"Total Tickets"},{"main":"75","sub":"Open Tickets"},{"main":"15","sub":"High Priority"},{"main":"15","sub":"Avg days to resolve a ticket"}]
  }

});

app.controller('feedbackCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){

    $scope.searchKey = '';
    $scope.filterKey = '';
    $scope.filterby = 'Choose Filter';
    $scope.filters = {filterby:['Location','Sentiment','Concern'], criteria:{'Location':['Bengaluru','Mumbai','Cochin'],'Sentiment':['positive','negative'],'Concern':['Staff behviour', 'Service', 'Parking']}}
    $rootScope.currentTab = 'assets/views/storerankings.html';

    $scope.head = [
      {name:'Source', fld:'source'},
      {name:'Promoter?', fld:'keyParam'},
      {name:'Sentiment', fld:'sentiment'},
      {name:'Concerns', fld:'concerns'},
      {name:'Location', fld:'location'},
      {name:'Time', fld:'time'},
      {name:'Date', fld:'date'}
    ];

    $scope.storehead = [
      {name:'Position', fld:'source'},
      {name:'Location', fld:'keyParam'},
      {name:'Total Feedbacks', fld:'sentiment'},
      {name:'positive', fld:'concerns'},
      {name:'negative', fld:'location'},
      {name:'NPS', fld:'time'},
      {name:'Rating', fld:'date'}
    ];

    $scope.storerankings = [
      { id: '100', show: { position: '1', location: 'Bangalore', total: '114', negative: '35', positive: '79', nps: '80%', rating: '4.1' } },
      { id: '101', show: { position: '2', location: 'New York', total: '47', negative: '20', positive: '27', nps: '72%', rating: '3.9' } },
      { id: '102', show: { position: '3', location: 'Sydney', total: '86', negative: '35', positive: '51', nps: '67%', rating: '3.2' } },
      { id: '103', show: { position: '4', location: 'Jaipur', total: '32', negative: '16', positive: '16', nps: '53%', rating: '2.6' } },
      { id: '104', show: { position: '5', location: 'New Delhi', total: '27', negative: '19', positive: '8', nps: '45%', rating: '2.4' } }
    ];

    $scope.switchfbview = function(location){
      console.log(location)
      $scope.keyreference = location.show.location;
      $rootScope.currentTab = 'assets/views/locationfb.html';
    }

    $scope.feedbacks = [
      { id: '100', customer: { name: 'Arjun', phone: '9567075891', email: 'arjun@rytangle.com', gender: 'Male', age_group: 'Below 25' }, feedback: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', keyParam: 'detractor', sentiment: 'negative', concerns: ['staff behavior', 'service', 'Parking'], location: 'Bangalore', time: '11:35', date: '04-Sept-16' } },
      { id: '101', customer: { name: 'Rahul', phone: '9980159797', email: 'rahul@rytangle.com', gender: 'Male', age_group: 'Above 25' }, feedback: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', keyParam: 'detractor', sentiment: 'positive', concerns: ['staff behavior', 'service'], location: 'New York', time: '11:35', date: '03-Sept-16' } },
      { id: '102', customer: { name: 'Arjun', phone: '9567075891', email: 'arjun@rytangle.com', gender: 'Male', age_group: 'Below 25' }, feedback: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', keyParam: 'detractor', sentiment: 'negative', concerns: ['staff behavior', 'service'], location: 'Sydney', time: '11:35', date: '02-Sept-16' } },
      { id: '103', customer: { name: 'Arjun', phone: '9567075891', email: 'arjun@rytangle.com', gender: 'Male', age_group: 'Below 25' }, feedback: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', keyParam: 'detractor', sentiment: 'negative', concerns: ['staff behavior', 'service'], location: 'Jaipur', time: '11:35', date: '01-Sept-16' } },
      { id: '104', customer: { name: 'Vishnu', phone: '8157891812', email: 'vishnu@rytangle.com', gender: 'Male', age_group: 'Below 25' }, feedback: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', keyParam: 'detractor', sentiment: 'negative', concerns: ['staff behavior', 'service'], location: 'Bangalore', time: '11:35', date: '05-Sept-16' } },
      { id: '105', customer: { name: 'Rahul', phone: '9980159797', email: 'rahul@rytangle.com', gender: 'Male', age_group: 'Above 25' }, feedback: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', keyParam: 'detractor', sentiment: 'positive', concerns: ['staff behavior', 'service'], location: 'Bangalore', time: '11:35', date: '06-Sept-16' } },
      { id: '106', customer: { name: 'Vishnu', phone: '8157891812', email: 'vishnu@rytangle.com', gender: 'Male', age_group: 'Below 25' }, feedback: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', keyParam: 'detractor', sentiment: 'positive', concerns: ['staff behavior', 'service'], location: 'New Delhi', time: '11:35', date: '07-Sept-16' } },
      { id: '107', customer: { name: 'Rahul', phone: '9980159797', email: 'rahul@rytangle.com', gender: 'Male', age_group: 'Above 25' }, feedback: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', keyParam: 'detractor', sentiment: 'negative', concerns: ['staff behavior', 'service'], location: 'Jaipur', time: '11:35', date: '08-Sept-16' } },
      { id: '108', customer: { name: 'Rahul', phone: '9980159797', email: 'rahul@rytangle.com', gender: 'Male', age_group: 'Above 25' }, feedback: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', keyParam: 'detractor', sentiment: 'positive', concerns: ['staff behavior', 'service'], location: 'Sydney', time: '11:35', date: '09-Sept-16' } },
      { id: '109', customer: { name: 'Arjun', phone: '9567075891', email: 'arjun@rytangle.com', gender: 'Male', age_group: 'Below 25' }, feedback: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', keyParam: 'detractor', sentiment: 'positive', concerns: ['staff behavior', 'service'], location: 'Bangalore', time: '11:35', date: '10-Sept-16' } },
      { id: '110', customer: { name: 'Arjun', phone: '9567075891', email: 'arjun@rytangle.com', gender: 'Male', age_group: 'Below 25' }, feedback: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', keyParam: 'detractor', sentiment: 'negative', concerns: ['staff behavior', 'service'], location: 'New York', time: '11:35', date: '11-Sept-16' } },
    ];


  }

  $scope.setcriteria = function(filterby){
    console.log(filterby)
    $scope.filterby = filterby;
    $scope.filterOptions = $scope.filters.criteria[filterby];
    console.log($scope.filterOptions)
  }


});


app.controller('dashboardCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){
    $scope.filterKey = '';
    $scope.filterby = 'Choose Filter';
    $scope.filters = {filterby:['Location','Gender','Age Group'], criteria:{'Location':['Bengaluru','Mumbai','Cochin'],'Gender':['Female','Male'],'Age Group':['Below 25', 'Above 25', 'Above 40']}}
  }

  $scope.setcriteria = function(filterby){
    console.log(filterby)
    $scope.filterby = filterby;
    $scope.filterOptions = $scope.filters.criteria[filterby];
    console.log($scope.filterOptions)
  }

 {
    $scope.colors = ['#45b7cd', '#ff6384', '#ff8e72'];

    $scope.labels = ['1', '2', '3', '4', '5', '6', '7'];
    $scope.concernList = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90],
      [18, 48, 77, 9, 100, 27, 40],
      [18, 48, 77, 9, 100, 27, 40],
      [18, 48, 77, 9, 100, 27, 40]
    ];
    $scope.satisfactionList = [
      [4.0, 3.4, 3.6, 3.5, 4.3, 4.1, 3.9],
      [3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8]
    ];
    $scope.npsList = [
      [22, 29, 31, 25, 24, 28, 27],
      [27, 27, 27, 27, 27, 27, 27]
    ];
    $scope.feedbackList = [
      [187, 260, 410, 580, 280, 900, 1140],
      [20, 27, 40, 52, 85, 91, 110]
    ];
    $scope.custList = [
      [120, 227, 340, 452, 585, 691, 710],
      [187, 260, 410, 580, 780, 900, 1140]
    ];
    $scope.walkinList = [
      [120, 227, 340, 452, 585, 691, 710]
    ];
    $scope.datasetOverride1 = [
      {
        label: "Services",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      },
      {
        label: "Cleanliness",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      },
      {
        label: "Presentation",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      },
      {
        label: "Staff Behavior",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      },
      {
        label: "Product Availability",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      }]
    $scope.datasetOverride2 = [
      {
        label: "Satisfaction Index",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      },
      {
        label: "Average",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      }]
    $scope.datasetOverride3 = [
      {
        label: "NPS",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      },
      {
        label: "Average",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      }]
    $scope.datasetOverride4 = [
      {
        label: "Negative",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      },
      {
        label: "Positive",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      }]
    $scope.datasetOverride5 = [
      {
        label: "Phone",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      },
      {
        label: "Email",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      }]
    $scope.datasetOverride6 = [
      {
        label: "Walkin",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      }];
};

});

app.controller('customerCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){

    $scope.searchKey = '';
    $scope.filterKey = '';
    $scope.filterby = 'Choose Filter';
    $scope.filters = {filterby:['Gender','Age Group'], criteria:{'Gender':['Female','Male'],'Age Group':['Below 25', 'Above 25', 'Above 40']},'Verified':['Phone','Email','Phone & Email']}
    // $scope.filters = {filterby:['Gender','Age Group','Verified'], criteria:{'Gender':['Female','Male'],'Age Group':['Below 25', 'Above 25', 'Above 40']},'Verified':['Phone','Email','Phone & Email']}
    $scope.newcustomer = false;

    $scope.head = [
      {name:'Name',fld:''},
      {name:'Phone',fld:''},
      {name:'Email',fld:''},
      {name:'Gender',fld:''},
      {name:'Age Group',fld:''},
      {name:'D.O.B',fld:''},
      {name:'Anniversary',fld:''},
      {name:'Last Interaction',fld:''}
      // {name:'Verified',fld:'verification'}
    ];

    $scope.customers = [
      { id: '1000', customer: { name: 'Arjun', phone: '9567075891', email: 'arjun@rytangle.com', gender: 'Male', age_group: 'Below 25', dob: '13 Nov', anniversary: '30 Sep', lastinteraction: 'Jan 22' }, meta: { total_interactions: '2', avgRating: '2' }, interactions: [{ date: '03-Sept-16', Source: 'Chatbot', Location: '', Detail: 'Deals in watches' }, { date: '04-Sept-16', Source: 'Device', Location: 'Fastrack Indiranagar', Detail: 'FB ID 100' }] },
      { id: '1001', customer: { name: 'Rahul', phone: '9980159797', email: 'rahul@rytangle.com', gender: 'Male', age_group: 'Above 25', dob: '16 May', anniversary: '20 June', lastinteraction: 'Jan 21' }, meta: { total_interactions: '2', avgRating: '2' }, interactions: [{ date: '03-Sept-16', Source: 'Chatbot', Location: '', Detail: 'Deals in watches' }, { date: '04-Sept-16', Source: 'Device', Location: 'Fastrack Indiranagar', Detail: 'FB ID 100' }] },
      { id: '1002', customer: { name: 'Vishnu', phone: '8157891812', email: 'vishnu@rytangle.com', gender: 'Male', age_group: 'Below 25', dob: '20 Apr', anniversary: '16 Nov', lastinteraction: 'Jan 18' }, meta: { total_interactions: '2', avgRating: '2' }, interactions: [{ date: '03-Sept-16', Source: 'Chatbot', Location: '', Detail: 'Deals in watches' }, { date: '04-Sept-16', Source: 'Device', Location: 'Fastrack Indiranagar', Detail: 'FB ID 100' }] }
    ];
  }

  $scope.setcriteria = function(filterby){
    console.log(filterby)
    $scope.filterby = filterby;
    $scope.filterOptions = $scope.filters.criteria[filterby];
    console.log($scope.filterOptions)
  }

});

app.controller('settingsCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/profile.html';
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
    $scope.filterKey = '';
    $scope.filterby = 'Choose Filter';
    $scope.filters = {filterby:['Source','Location','Status','Priority'], criteria:{'Source':['Web','WiFi'],'Location':['Bengaluru','Mumbai','Cochin'],'Status':['Open','Resolved','Awaiting Response','Closed'],'Priority':['High', 'Medium', 'Low']}}


    $scope.tickets = [
      { id: '100', customer: { name: 'Arjun', phone: '9567075891', email: 'arjun@rytangle.com' }, ticket: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', name: 'Arjun', opendate: '30 Jul 2016', status: 'open', location: 'Bangalore', lastupdate: '7 hours ago' } },
      { id: '101', customer: { name: 'Rahul', phone: '9980159797', email: 'rahul@rytangle.com' }, ticket: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'WiFi', name: 'Rahul', opendate: '02 May 2016', status: 'closed', location: 'Bangalore', lastupdate: '12 hours ago' } },
      { id: '102', customer: { name: 'Arjun', phone: '9567075891', email: 'arjun@rytangle.com' }, ticket: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', name: 'Vishnu', opendate: '01 Aug 2016', status: 'open', location: 'Bangalore', lastupdate: '20:08 12 Sep 2016' } },
      { id: '103', customer: { name: 'Arjun', phone: '9567075891', email: 'arjun@rytangle.com' }, ticket: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', name: 'Arjun', opendate: '02 Oct 2016', status: 'open', location: 'Bangalore', lastupdate: '16:45 12 Sep 2016' } },
      { id: '104', customer: { name: 'Vishnu', phone: '8157891812', email: 'vishnu@rytangle.com' }, ticket: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', name: 'Vishnu', opendate: '31 Jul 2016', status: 'resolved', location: 'Bangalore', lastupdate: '09:15 12 Sep 2016' } },
      { id: '105', customer: { name: 'Rahul', phone: '9980159797', email: 'rahul@rytangle.com' }, ticket: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'WiFi', name: 'Rahul', opendate: '30 May 2016', status: 'open', location: 'Bangalore', lastupdate: '19:14 11 Sep 2016' } },
      { id: '106', customer: { name: 'Vishnu', phone: '8157891812', email: 'vishnu@rytangle.com' }, ticket: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', name: 'Rahul', opendate: '19 Sep 2016', status: 'resolved', location: 'Bangalore', lastupdate: '14:05 11 Sep 2016' } },
      { id: '107', customer: { name: 'Rahul', phone: '9980159797', email: 'rahul@rytangle.com' }, ticket: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', name: 'Vishnu', opendate: '04 Jul 2016', status: 'closed', location: 'Bangalore', lastupdate: '10:31 09 Sep 2016' } },
      { id: '108', customer: { name: 'Rahul', phone: '9980159797', email: 'rahul@rytangle.com' }, ticket: { npsScore: '3', rating: '2', service: 'disLike', facilities: '', staff: 'disLike', comment: 'Improve service' }, derived: { source: 'web', name: 'Arjun', opendate: '16 Oct 2016', status: 'open', location: 'Bangalore', lastupdate: '11:45 06 Sep 2016' } }
    ];

    $scope.head = [
      {name:'Source', fld:''},
      {name:'Name', fld:''},
      {name:'Open Date', fld:''},
      {name:'Status', fld:''},
      {name:'Location', fld:''},
      {name:'Last Update', fld:''},
    ]
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
    $scope.filterKey = '';
    $scope.filterby = 'Choose Filter';
    $scope.filters = {filterby:['Location','Type','Status','Validity'], criteria:{'Location':['Bengaluru','Mumbai','Cochin'],'Type':['Deal','Coupon'],'Status':['Active','Expired','Unpublished'],'Validity':['Less than a week', 'Less than a month', 'More than a month']}}

    $scope.head = [
      {name:'type',fld:''},
      {name:'title',fld:''},
      {name:'status',fld:''},
      {name:'rules',fld:''},
      {name:'validity',fld:''}
    ];

    $scope.dealsorcoupons = [
      { id: '500', show: { type: 'deal', title: 'model deal', status: 'active', rules: ['rule 1', 'rule 2'], validity: 'Oct 30' }, detail: { dateofcreation: 'sep 9' } },
      { id: '501', show: { type: 'coupon', title: 'model coupon', status: 'expired', rules: ['rule 1', 'rule 2'], validity: 'Oct 10' }, detail: { dateofcreation: 'sep 9' } },
      { id: '502', show: { type: 'deal', title: 'model deal', status: 'unpublished', rules: ['rule 1', 'rule 2'], validity: '' }, detail: { dateofcreation: 'sep 9' } },
      { id: '503', show: { type: 'coupon', title: 'model coupon', status: 'unpublished', rules: ['rule 1', 'rule 2'], validity: '' }, detail: { dateofcreation: 'sep 9' } },
      { id: '504', show: { type: 'coupon', title: 'model coupon', status: 'active', rules: ['rule 1', 'rule 2'], validity: 'Oct 25' }, detail: { dateofcreation: 'sep 9' } },
      { id: '505', show: { type: 'deal', title: 'model deal', status: 'expired', rules: ['rule 1', 'rule 2'], validity: 'Oct 5' }, detail: { dateofcreation: 'sep 9' } },
    ];
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
    $scope.filterKey = '';
    $scope.filterby = 'Choose Filter';
    $scope.filters = {filterby:['Location','Type','Status','Validity'], criteria:{'Location':['Bengaluru','Mumbai','Cochin'],'Type':['Deal','Coupon'],'Status':['Active','Expired','Unpublished'],'Validity':['Less than a week', 'Less than a month', 'More than a month']}}

    $scope.head = [
      {name:'Type',fld:''},
      {name:'Title',fld:''},
      {name:'Status',fld:''},
      {name:'Validity',fld:''}
    ];

    $scope.catalogormenu =  [
      { id: '500', show: { type: 'menu', title: 'Barbeque Nation - menu 1', status: 'active', validity: 'Oct 10' }, contents: [{ title: 'Veg Menu', type: 'Category' }, { title: 'Paneer Pakoda', type: 'Item', Parent: 'Veg Menu' }, { title: 'Non-Veg Menu', type: 'Category' }], detail: { dateofcreation: 'sep 9' } },
      { id: '501', show: { type: 'catalog', title: 'Tanishq - catalog 1', status: 'unpublished', validity: 'Oct 10' }, contents: [{ title: 'Bangles', type: 'Category' }, { title: 'Mysore Bangle', type: 'Item', Parent: 'Bangles' }, { title: 'Chains', type: 'Category' }], detail: { dateofcreation: 'sep 9' } },
      { id: '502', show: { type: 'menu', title: 'Barbeque Nation - menu 2', status: 'expires', validity: 'Oct 10' }, contents: [{ title: 'Food Menu', type: 'Category' }, { title: 'Soups', type: 'Item', Parent: 'Food Menu' }, { title: 'Bar Menu', type: 'Category' }], detail: { dateofcreation: 'sep 9' } },
    ];
  }

  $scope.setcriteria = function(filterby){
    console.log(filterby)
    $scope.filterby = filterby;
    $scope.filterOptions = $scope.filters.criteria[filterby];
    console.log($scope.filterOptions)
  }

});

app.controller('devicesCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){

    $scope.searchKey = '';
    $scope.filterKey = '';
    $scope.filterby = 'Choose Filter';
    $scope.filters = {filterby:['Location','Type','Status','Validity'], criteria:{'Location':['Bengaluru','Mumbai','Cochin'],'Type':['Deal','Coupon'],'Status':['Active','Expired','Unpublished'],'Validity':['Less than a week', 'Less than a month', 'More than a month']}}

    $scope.head = [
      {name:'Status',fld:''},
      {name:'Id',fld:''},
      {name:'Name',fld:''},
      {name:'Serial',fld:''},
      {name:'Location',fld:''},
      {name:'Last Update',fld:''},
    ];

    $scope.devices =  [
      { id: '500', show: { status: 'offline', id: 500, name: 'Device 1', serial: 'RYT101150500', location: 'Bangalore', lastupdate: '19-Dec-2016 15:25' }, details: { status: 'offline', name: 'Device 1', serial: 'RYT101150500', wifi: 'Device-1', countrycode: '91', devid: '500', ip: '192.168.1.100', mac: '08:01:20:0b:10:22', disk: '63% of 7.2 GB', location: 'Bangalore', lastupdate: '19-Dec-2016 15:25', activatedon: '28-Oct-2015 16:21' }},
      { id: '501', show: { status: 'offline', id: 501, name: 'Device 1', serial: 'RYT101150501', location: 'Bangalore', lastupdate: '19-Dec-2016 15:25' }, details: { status: 'online', name: 'Device 2', serial: 'RYT101150501', wifi: 'Device-2', countrycode: '91', devid: '501', ip: '192.168.1.100', mac: '08:01:20:0b:10:22', disk: '63% of 7.2 GB', location: 'Bangalore', lastupdate: '19-Dec-2016 15:25', activatedon: '28-Oct-2015 16:21' }},
      { id: '502', show: { status: 'offline', id: 502, name: 'Device 1', serial: 'RYT101150502', location: 'Bangalore', lastupdate: '19-Dec-2016 15:25' }, details: { status: 'offline', name: 'Device 3', serial: 'RYT101150502', wifi: 'Device-3', countrycode: '91', devid: '502', ip: '192.168.1.100', mac: '08:01:20:0b:10:22', disk: '63% of 7.2 GB', location: 'Bangalore', lastupdate: '19-Dec-2016 15:25', activatedon: '28-Oct-2015 16:21' }},
    ];
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
    $scope.filterKey = '';
    $scope.filterby = 'Choose Filter';
    $scope.filters = {filterby:['Location','Type','Status','Validity'], criteria:{'Location':['Bengaluru','Mumbai','Cochin'],'Type':['Deal','Coupon'],'Status':['Active','Expired','Unpublished'],'Validity':['Less than a week', 'Less than a month', 'More than a month']}}

    $scope.head = [
      {name:'Id',fld:''},
      {name:'Name',fld:''},
      {name:'Serial',fld:''},
      {name:'Location',fld:''},
      {name:'Last Update',fld:''},
    ];

    $scope.apps =  [
      { id: '500', show: { id: 500, name: 'Device 1', version: '1.0', location: 'Bangalore', lastupdate: '19-Dec-2016 15:25' }},
      { id: '501', show: { id: 501, name: 'Device 2', version: '1.1', location: 'New York', lastupdate: '30-Jan-2017 11:17' }},
      { id: '502', show: { id: 502, name: 'Device 3', version: '1.0', location: 'Mumbai', lastupdate: '11-Jan-2016 00:17' }},
    ];
  }

  $scope.setcriteria = function(filterby){
    console.log(filterby)
    $scope.filterby = filterby;
    $scope.filterOptions = $scope.filters.criteria[filterby];
    console.log($scope.filterOptions)
  }

});

app.controller('locationsCtrl',function($rootScope,$scope,$location){

  $scope.init = function(){
  }

});

app.controller('TabsCtrl', function ($scope,$rootScope) {

  $scope.tabs = {
    "initialfeedback":[
      {
        title: 'Store Rankings',
        url: 'assets/views/storerankings.html'
      }, {
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
      {
        title: 'Profile',
        url: 'assets/views/profile.html'
      },
      {
        title: 'Locations',
        url: 'assets/views/locations.html'
      }
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
      }, {
        title: 'SMS',
        url: 'assets/views/sms.html'
      }, {
        title: 'FB Chat',
        url: 'assets/views/fbchat.html'
      }, {
        title: 'Web Chat',
        url: 'assets/views/webchat.html'
      }
    ],
    "devices":[
      // {
      //   title: 'Mission List',
      //   url: 'assets/views/missionlist.html'
      // },
      // {
      //   title: 'Employee List',
      //   url: 'assets/views/employeelist.html'
      // },
      {
        title: 'Email Trigger List',
        url: 'assets/views/emailtriggerlist.html'
      },
      {
        title: 'SMS Trigger List',
        url: 'assets/views/smstriggerlist.html'
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
      console.log($scope.currentTab)
    }

    $scope.isActiveTab = function(tabUrl) {
        return tabUrl == $scope.currentTab;
    }
});

app.controller('fbdtlsCtrl', function ($scope,$rootScope) {

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/addnote.html';
  }

});

app.controller('devicedtlsCtrl', function ($scope,$rootScope) {

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/emailtriggerlist.html';
  }

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

app.controller('custdtlsCtrl', function ($scope,$rootScope) {

  $scope.init = function(){
    $rootScope.currentTab = 'assets/views/activitylog.html';
    $rootScope.modelfb = { id: '101', customer: { name: 'Rahul', phone: '9611876767', email: 'rahul@rytangle.com', gender: 'Male', age_group: 'Above 25' }, feedback: { npsScore: '3', rating: '5', service: '', facilities: '', staff: '', comment: 'Improve service' }, derived: { source: 'web', keyParam: 'detractor', sentiment: positive, concerns: ['staff behavior', 'service'], location: 'Bangalore', time: '18:44', date: '13-Jan-17' } };
  }

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
