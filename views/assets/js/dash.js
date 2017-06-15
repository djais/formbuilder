'use strict';

var webapp = angular.module('webApp',[]);

webapp.run(function($rootScope,$http){
  //initial constants
  $rootScope.server = location.protocol+'//'+location.hostname+'/api';
  console.log($rootScope.server+"/group");
  $http({method:'GET', url:$rootScope.server+"/group"})
    .success(function(response, status){
      console.log(response);
      if(response.statusCode == 200)
      {
        $rootScope.company = response.data;
        console.log($rootScope.company);
      }
    })//success
    .error(function(err){
      // unhandled error
    })
});


/**********************************
initCtrl
************************************/
webapp.controller('initCtrl', function($scope, $rootScope){
  console.log('here in controller');
});
