var extScope;
var map, service, infoWindow, autocomplete;

app.controller('MainController', function($scope, $http) {
	extScope = $scope;
});

function initAutocomplete() {
	autocomplete = new google.maps.places.Autocomplete(
		(document.getElementById('autocomplete')),
        {types: ['geocode']}
	);
	autocomplete.addListener('place_changed', initMap);
}

function initMap() {
	var place = autocomplete.getPlace();
	var loc = place.geometry.location;
	map = new google.maps.Map(document.getElementById('map'), {
	    	zoom: 13,
	    	center: loc,
	    	mapTypeControl: false,
	    	scrollwheel: false
	});
	styleMap(map);

	// Get the results of the TextSearch request.
	var studyRequest = {
      	location: loc,
      	radius: '500',
      	query: 'coffee || library'
    };
    infoWindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    service.textSearch(studyRequest, callback);
}

function geolocate() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var geolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var circle = new google.maps.Circle({
          center: geolocation,
          radius: position.coords.accuracy
        });
        autocomplete.setBounds(circle.getBounds());
      });
    }
}

function callback(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		console.log(results);
		// Display markers first
		for(var i = 0; i < results.length; i++) {
			createMarker(results[i]);
		}
		// Then display results
		extScope.$apply(function() {
			extScope.nooks = results;
			extScope.error = null;
		});
		for(var i = 0; i < results.length; i++) {
			getDetails(results[i], i);
		}
	}
	else {
		extScope.$apply(function() {
			extScope.nooks = null;
			extScope.error = "No results. Try a different place!";
		});
	}
}

function getDetails(place, index) {
	var detailsRequest = {
		placeId: place.place_id
	};
	service.getDetails(detailsRequest, function(details, status) {
		if( status == google.maps.places.PlacesServiceStatus.OK) {
			extScope.$apply(function() {
				extScope.nooks[index].url = details.url;
				if(details.website != null) {
					extScope.nooks[index].site = details.website;
				}
				else {
					extScope.nooks[index].site = null;
				}
			});
        } else if (status == google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
            setTimeout(function() {
                getDetails(place, index);
            }, 200);
        }
	});
}

function createMarker(place) {
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});
	google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(place.name);
        infoWindow.open(map, this);
    });
}

// Map style from: https://snazzymaps.com/style/134/light-dream
function styleMap(map) {
	var mainMapStyle = new google.maps.StyledMapType(
	[
	    {
	        "featureType": "landscape",
	        "stylers": [
	            {
	                "hue": "#FFBB00"
	            },
	            {
	                "saturation": 43.400000000000006
	            },
	            {
	                "lightness": 37.599999999999994
	            },
	            {
	                "gamma": 1
	            }
	        ]
	    },
	    {
	        "featureType": "road.highway",
	        "stylers": [
	            {
	                "hue": "#FFC200"
	            },
	            {
	                "saturation": -61.8
	            },
	            {
	                "lightness": 45.599999999999994
	            },
	            {
	                "gamma": 1
	            }
	        ]
	    },
	    {
	        "featureType": "road.arterial",
	        "stylers": [
	            {
	                "hue": "#FF0300"
	            },
	            {
	                "saturation": -100
	            },
	            {
	                "lightness": 51.19999999999999
	            },
	            {
	                "gamma": 1
	            }
	        ]
	    },
	    {
	        "featureType": "road.local",
	        "stylers": [
	            {
	                "hue": "#FF0300"
	            },
	            {
	                "saturation": -100
	            },
	            {
	                "lightness": 52
	            },
	            {
	                "gamma": 1
	            }
	        ]
	    },
	    {
	        "featureType": "water",
	        "stylers": [
	            {
	                "hue": "#0078FF"
	            },
	            {
	                "saturation": -13.200000000000003
	            },
	            {
	                "lightness": 2.4000000000000057
	            },
	            {
	                "gamma": 1
	            }
	        ]
	    },
	    {
	        "featureType": "poi",
	        "stylers": [
	            {
	                "hue": "#00FF6A"
	            },
	            {
	                "saturation": -1.0989010989011234
	            },
	            {
	                "lightness": 11.200000000000017
	            },
	            {
	                "gamma": 1
	            }
	        ]
	    }
	],
	{name: 'Main Map'});
	map.mapTypes.set('main_map', mainMapStyle);
	map.setMapTypeId('main_map');
}