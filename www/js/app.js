angular.module('app', ['ionic','ionic.service.core', 'ngLodash', 'app.controllers', 'app.directives'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    Ionic.io();

    var push = new Ionic.Push({
      "debug": true
    });

    push.register(function(token) {
      console.log("Device token:",token.token);
    });

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
.config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home')

    $stateProvider
      //.state('app', {
      //  url: "/app",
      //  abstract: true,
      //  templateUrl: "js/templates/menu.html",
      //  controller: 'AppCtrl'
      //})
      .state('index', {
        url: '/home',
        templateUrl: 'js/templates/index.html',
        controller: 'IndexCtrl'
      });
    $stateProvider.state('map', {
        url: '/map',
        templateUrl: 'js/templates/map.html',
        controller: 'MapCtrl'
      });
    $stateProvider.state('mapStep', {
      url: '/mapStep',
      templateUrl: 'js/templates/map-step.html',
      controller: 'MapStepCtrl'
    });
    $stateProvider.state('choices', {
      url: '/choices',
      templateUrl: 'js/templates/choices.html',
      controller: 'ChoicesCtrl'
    });
    $stateProvider.state('activities', {
      url: '/activities',
      templateUrl: 'js/templates/activities.html',
      controller: 'ActivitiesCtrl'
    });
  }])
