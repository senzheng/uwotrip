
angular.module("neiconn")
       .controller("neiconnCtrl",function ($scope, $interval){
       	  //http request to the backend and return the data to the front-end
   
          $scope.test = trips;
           $scope.data = {
                 popular_city : [
                               { name: "San Fransico",img:"images/sf.jpeg" ,category: "westcoast"},
                               { name: "Los Angeles",img:"images/la.jpg" ,category: "westcoast"},
                               { name: "Seattle",img:"images/sea.jpg" ,category: "westcoast"},
                               { name: "Portland",img:"images/pdx.jpg" ,category: "westcoast"},
                               { name: "New York",img:"images/nyc.jpg" ,category: "eastcoast"},
                               { name: "Boston",img:"images/bos.jpg" ,category: "eastcoast"},
                               { name: "D.C.",img:"images/DC.jpg" ,category: "eastcoast"},
                               { name: "Miami",img:"images/mia.jpg" ,category: "eastcoast"}
                             ]
         
          }

       	  var trip = trips[0];

          $scope.data = trip;
           var directionsService = new google.maps.DirectionsService();
           var directionsDisplay;

          var initMap = function () {
              directionsDisplay = new google.maps.DirectionsRenderer({
                  suppressMarkers: true
              });

              var map = new google.maps.Map(document.getElementById('map_canvas'), {
                 zoom: 13,
                 center: {lat: 37.7833, lng: -122.4167},
                 mapTypeId: google.maps.MapTypeId.ROADMAP,

                 styles : [{
                        "featureType": "administrative",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "administrative",
                        "elementType": "labels.text.fill",
                        "stylers": [
                            {
                                "color": "#6195a0"
                            }
                        ]
                    },
                    {
                        "featureType": "administrative",
                        "elementType": "labels.icon",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "administrative.country",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "administrative.province",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "on"
                            }
                        ]
                    },
                    {
                        "featureType": "administrative.locality",
                        "elementType": "geometry.fill",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "administrative.land_parcel",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape",
                        "elementType": "all",
                        "stylers": [
                            {
                                "color": "#f2f2f2"
                            },
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape",
                        "elementType": "geometry.fill",
                        "stylers": [
                            {
                                "color": "#ffffff"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape.man_made",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape.natural.landcover",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape.natural.terrain",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            },
                            {
                                "color": "#e8e8e8"
                            }
                        ]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "geometry",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "poi.park",
                        "elementType": "geometry.fill",
                        "stylers": [
                            {
                                "color": "#e6f3d6"
                            },
                            {
                                "visibility": "on"
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "all",
                        "stylers": [
                            {
                                "saturation": -100
                            },
                            {
                                "lightness": 45
                            },
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "geometry.fill",
                        "stylers": [
                            {
                                "color": "#ded9d3"
                            },
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "labels.text",
                        "stylers": [
                            {
                                "color": "#4e4e4e"
                            }
                        ]
                    },
                    {
                        "featureType": "road.arterial",
                        "elementType": "geometry.fill",
                        "stylers": [
                            {
                                "color": "#f4f4f4"
                            }
                        ]
                    },
                    {
                        "featureType": "road.arterial",
                        "elementType": "labels.text.fill",
                        "stylers": [
                            {
                                "color": "#787878"
                            }
                        ]
                    },
                    {
                        "featureType": "road.arterial",
                        "elementType": "labels.icon",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "transit",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "water",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "water",
                        "elementType": "geometry.fill",
                        "stylers": [
                            {
                                "color": "#b7d5f7"
                            },
                            {
                                "saturation": "0"
                            }
                        ]
                    }
                ] 

               });
              var trafficLayer = new google.maps.TrafficLayer();
               trafficLayer.setMap(map);
               
directionsDisplay.setMap(map);
             
                 calculateAndDisplayRoute(directionsService, directionsDisplay);
        
          
                 var infoWindow = new google.maps.InfoWindow({map: map});
                $interval(function(){
                 if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(function(position) {
                        var pos = {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        };

                        infoWindow.setPosition(pos);
                        infoWindow.setContent('<img src="/images/owner1.jpg" style="width : 50px; height: 50px;">');
                        map.setCenter(pos);
                      }, function() {
                        handleLocationError(true, infoWindow, map.getCenter());
                      });
                    } else {
                      // Browser doesn't support Geolocation
                      handleLocationError(false, infoWindow, map.getCenter());
                    }
                 //changeStatus();
               },1000)

                 
                  

           



           var beaches = [
                
 
              ];

            var sunshine = [];  
           var official = [];
           var imageO = [];


              alert(trip.local.length);
              alert(trip.official.length);
              for(var i = 0; i < trip.local.length; i++){
                var price = trip.local[i].name;
                 beaches.push([trip.local[i].position.name, parseFloat(trip.local[i].position.lat), parseFloat(trip.local[i].position.lon),i,price]);
              }

              for(var i = 0; i < trip.official.length; i++){
                var price = trip.official[i].name;
                 sunshine.push([trip.official[i].name, parseFloat(trip.official[i].lat), parseFloat(trip.official[i].lon), i, price]);
              }

              


              


              
                 


              //alert(beaches + "   " + beaches.length);
           var image = {
                url: '/images/iconnn.png',
                // This marker is 20 pixels wide by 32 pixels high.
                size: new google.maps.Size(0, 0),
                // The origin for this image is (0, 0).
                origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at (0, 32).
                anchor: new google.maps.Point(0, 40)
              };

           var shape = {
              coords: [1, 1, 1, 20, 18, 20, 18, 1],
              type: 'poly'
            };
          for (var i = 0; i < beaches.length; i++) {
          var beach = beaches[i];
           var marker1 = new MarkerWithLabel({
             position: {lat: beach[1], lng: beach[2]},
             map: map,
             labelContent: beach[4],
             labelAnchor: new google.maps.Point(-5, 35),
             icon : image,
             labelContent: '<i class="fa fa-user fa-4x" style="color:rgba(0,77,26,1);"></i>',
       labelAnchor: new google.maps.Point(22, 50),
             shape: shape,
             title: beach[0],
             zIndex: beach[3]

           });

           }

            //set interval
           for (var i = 0; i < sunshine.length; i++) {
          var beach = sunshine[i];
           var marker1 = new MarkerWithLabel({
             position: {lat: beach[1], lng: beach[2]},
             map: map,
             labelContent: beach[4],
             labelAnchor: new google.maps.Point(-5, 35),
             icon : image,
             labelContent: '<i class="fa fa-car fa-3x" style="color:rgba(0,77,26,1);"></i>',
       labelAnchor: new google.maps.Point(10, 50),
             shape: shape,
             title:  beach[0],
             zIndex: beach[3]

           });

           }

            var contentString = '<div style="width: 80px; height: 40px; background-color: rgba(0,77,26,1); text-align: center;"><img src="/images/owner4.jpg" style="width:30px; height:40px; float: left"><p style=" padding : 0; color:white;">'+trip._id+'</p></div>'
            



            var infoBubble = new InfoBubble({
              map: map,
              content: contentString,
              shadowStyle: 1,
              padding: 0,
              arrowSize: 10,
              borderWidth: 1,
              borderColor: '#2c2c2c',
              disableAutoPan: true,
              hideCloseButton: true,
              arrowPosition: 30,
              backgroundClassName: 'transparent',
              arrowStyle: 2
            });

            marker1.addListener('click', function() {
              infoBubble.open(map, marker1);
            });


          



           







            
        }

       function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        var waypts = [];

        
        for (var i = 0; i < trip.local.length; i++) {
          
            waypts.push({
              location: new google.maps.LatLng(parseFloat(trip.local[i].position.lat), parseFloat(trip.local[i].position.lon)),
              stopover: true
            });

           
          }
        directionsService.route({
          origin: new google.maps.LatLng(parseFloat(trip.official[0].lat), parseFloat(trip.official[0].lon)),
          destination: new google.maps.LatLng(parseFloat(trip.official[0].lat), parseFloat(trip.official[0].lon)),
          waypoints: waypts,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(/* now, or future date */),
            trafficModel: google.maps.TrafficModel.PESSIMISTIC
          }

        }, function(response, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            var route = response.routes[0];
            var summaryPanel = document.getElementById('directions-panel');
            summaryPanel.innerHTML = '';
            
            console.log(route.legs);
            // For each route, display summary information.
            var total = 0;
            for (var i = 0; i < route.legs.length; i++) {
              var d = new Date();
              total = total + route.legs[i].duration.value;
              d.setSeconds(total);
              var ampm = d.getHours() >= 12 ? 'pm' : 'am';
              var routeSegment = i + 1;
              summaryPanel.innerHTML += '<div class="mapside"><span class="badge">'+ (i + 1) +'</span>' + trip.local[i].position.name + " - ETA " + d.getHours() +":"+ d.getMinutes()+ " "+ampm
                  '<br></div>';
            }
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      }
      initMap();

       })
       .controller('appCtrl', function($scope){
           $scope.temps = temps;

           $scope.accept = function (id, photo, name) {
               
           }
       })