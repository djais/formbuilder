var webapp = angular.module('webApp',['ui.bootstrap']);


webapp.run(function($rootScope){
  //initial constants
  $rootScope.server = location.protocol+'//'+location.hostname+'/api';
});

//////////  filters ///////////////////////

webapp.filter('unsafe', function($sce) {
    return function(value) {
        if (!value) { return ''; }
        return $sce.trustAsHtml(value);
    };
})


/////////////controllers ////////////////

webapp.controller('signCtrl', function($scope, $rootScope, $http){

  $scope.init = function(){
    $scope.alert = {msg:null, class:"alert alert-info"};
  };//init
  $scope.submit = function(){
    console.log('here');
    if ($scope.userForm.$valid) {
      $scope.alert.msg='Signing you to Rytangle...';
      $http.post($rootScope.server+"/user",$scope.post)
        .success(function(d,status){
          console.log(d);
            if(d.statusCode==200)
            {
              $scope.alert.msg = d.msg;
              $scope.alert.class='alert alert-success';
            }
            else if(d.statusCode==409)
            {
              $scope.alert.msg = "Email provided by you already exist. If you are the owner and have not verified your Email, <a href=#>click here to Resend Verification Email</a>";
              $scope.alert.class='alert alert-danger'
            }
            else {
              $scope.alert.msg = d.msg;
              $scope.alert.class='alert alert-warning'
            }
        })
        .error(function(e){
          console.log('error', e)
        });//error
    }
  }// submit

});//signCtrl
