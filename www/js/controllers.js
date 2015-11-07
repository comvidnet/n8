var toplocations = [];
toplocations.push({
  location: 'Rijksmuseum Amsterdam',
  latitude: 1,
  longitude: 2,
  time: 120
});

var rp = [];
rp.push({
  location: 'user',
  type: 'user',
  time: 2,
  latitude: 1,
  longitude: 2,
  next: 'Artis Amsterdam'
});
rp.push({
  location: 'Artis Amsterdam',
  type: 'food',
  time: 60,
  next: 'Tropenmuseum Amsterdam'
});
rp.push({
  location: 'Tropenmuseum Amsterdam',
  type: 'museum',
  time: 75,
  travel: 'public',
  next: 'Hermitage Amsterdam'
});
rp.push({
  location: 'Hermitage Amsterdam',
  type: 'museum',
  time: 90,
  next: 'Rijksmuseum Amsterdam'
});

var routeSteps = [];


angular.module('app.controllers', [])
  .controller('MainCtrl', function($scope, $rootScope, $ionicModal, $ionicNavBarDelegate) {
     $rootScope.baseUrl = 'http://localhost:8100/';

        $rootScope.back = function(){
            $ionicNavBarDelegate.back();
        };

    $rootScope.rp = rp;
    $ionicModal.fromTemplateUrl('/js/modals/full-route-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $rootScope.modalFullRoute = modal;
    });
    $rootScope.openFullRouteModal = function() {
        $rootScope.modalFullRoute.show();
    };
    $rootScope.closeFullRouteModal = function() {
        $rootScope.modalFullRoute.hide();
    };
  })
  .controller('IndexCtrl', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $scope.goToMap = function () {
      $state.go('app.map');
    };
  }])
.controller('MapCtrl', function($scope, $ionicLoading, lodash, $ionicModal, $http, $ionicModal, $timeout) {
    $scope.routeInfo = [];
    $scope.loading = $ionicLoading.show({
      content: 'Loading...',
      showBackdrop: false
    });

    $scope.route = {
        title:'Route #1',
        description:'2 museums, walk by Hortus Botanical, lunch at Artis zoo, end your day at Rijksmuseum'
    };

    $ionicModal.fromTemplateUrl('/js/modals/route-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function() {
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    $timeout(function(){
        $scope.openModal();
    },2000);

    $scope.mapCreated = function(map) {
      $scope.map = map;


      var directionsService = new google.maps.DirectionsService;
      var directionsDisplay = new google.maps.DirectionsRenderer(/*{suppressMarkers: true}*/);

      directionsDisplay.setMap(map);
      navigator.geolocation.getCurrentPosition(function (pos) {
        //getRouteFrom server

        $http.get('http://localhost:8100/getRoute').then(function(result) {

          rp = result.data.route.route;
          var waytp = rp.slice();
          waytp.shift();
          waypts = lodash.map(waytp, function(wp) {
            return {
              location: wp.location
            }
          })
          rp[0].location = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          directionsService.route({
            origin: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
            destination: toplocations[0].location,
            waypoints: waypts,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.WALKING
          }, function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response);
              $scope.loading.hide();

              var route = response.routes[0];
              //var summaryPanel = document.getElementById('directions-panel');
              //summaryPanel.innerHTML = '';
              // For each route, display summary information.

              $scope.$apply(function () {
                for (var i = 0; i < route.legs.length; i++) {
                  $scope.routeInfo.push({
                    text: route.legs[i].start_address,
                    duration: route.legs[i].duration.text});

                  routeSteps.push({
                      location: route.legs[i].start_address,
                      next: route.legs[i].end_address
                    })
                  //  var routeSegment = i + 1;
                  //  summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
                  //    '</b><br>';
                  //  summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
                  //  summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
                  //  summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
                }
              });
            } else {
              window.alert('Directions request failed due to ' + status);
            }
          });
        })
      });

    var myloc = new google.maps.Marker({
      clickable: false,
      icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
        new google.maps.Size(22,22),
        new google.maps.Point(0,18),
        new google.maps.Point(11,11)),
      shadow: null,
      zIndex: 999,
      map: $scope.map// your google.maps.Map object
    });

    var watchID = navigator.geolocation.watchPosition(function (pos) {
      console.log('Polling pos', pos);
      //$scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));

      var me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      myloc.setPosition(me);
    }, function (error) {
      alert('Unable to get location: ' + error.message);
    }, { enableHighAccuracy: true });
  };

  $scope.centerOnMe = function () {
    console.log("Centering");
    if (!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function (pos) {
      console.log('Got pos', pos);
      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      $scope.loading.hide();
    }, function (error) {
      alert('Unable to get location: ' + error.message);
    });
  };

})
  .controller('MapStepCtrl', function($scope, $ionicModal, $timeout, lodash) {

    $scope.current = rp[1];
        console.log($scope.current);
    $ionicModal.fromTemplateUrl('/js/modals/step-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function() {
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $timeout(function(){
        $scope.openModal();
    },2000);

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer(/*{suppressMarkers: true}*/);

    $scope.mapCreated = function(map) {
      $scope.map = map;

      directionsDisplay.setMap(map);
      $scope.step = 0;
      $scope.nextStep();

    }


    $scope.nextStep = function() {
        var loc =routeSteps[ $scope.step];
        var ds = {
          origin: loc.location,
          destination: loc.next
        }
        if (loc.travel == 'public')
          ds.travelMode = google.maps.TravelMode.TRANSIT;
        else
          ds.travelMode = google.maps.TravelMode.WALKING;
        directionsService.route(ds, function (response, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response)
          }
        });
      $scope.step++;
    };

  })
    .controller('ChoicesCtrl', ['$scope', '$state', function($scope, $state) {
        $scope.choices = [
            {
                title:'explore',
                description:'I want to walk and see new things in the city',
                active:false
            },{
                title:'museums',
                description:'I want to visit Rijksmuseum',
                active:false
            }
        ];
    }])
    .controller('ActivitiesCtrl', ['$scope', '$state', function($scope, $state) {

        $scope.activities = [
            {
                title:'cycle',
                image:'bicycle.png',
                active:false
            },{
                title:'boat',
                image:'boat.png',
                active:false
            },{
                title:'surprise',
                image:'alien.png',
                active:false
            },{
                title:'local food',
                image:'burger.png',
                active:false
            },{
                title:'sightseeing',
                image:'binoculars.png',
                active:false
            },{
                title:'walk',
                image:'city.png',
                active:false
            },{
                title:'park',
                image:'bird_alt.png',
                active:false
            },{
                title:'museum',
                image:'museum_pillars.png',
                active:false
            },{
                title:'festival',
                image:'balloons.png',
                active:false
            },{
                title:'pancakes',
                image:'apple.png',
                active:false
            },{
                title:'shopping',
                image:'bag_shopping.png',
                active:false
            }
        ]
    }])

    .controller('TimeCtrl', ['$scope', '$state', function($scope, $state) {

    }]);
