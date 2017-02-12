var getMarker;
var defaultMarkerSymbol;
var selectedMarkerSymbol;
var userMarkerSymbol;
var selectedMarker;
var userMarker
var initialize;
var manualPosition = false;

var GoogleMap;

function getNewGoogleMapsObject() {
    var mapCanvas = document.getElementById("mapCanvas");
    var mapOptions = {
      //center: new google.maps.LatLng(40.4319, -86.9202),
      zoom: 12,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      streetViewControl: false,
      disableDefaultUI: true,
      zoomControl: true,
      mapMaker: true,
      mapTypeId: google.maps.MapTypeId.ROAD,
      styles: [{
        featureType: "poi",
        elementType: "label",
        stylers: [{ visibility: "off" }]
      }]
    };
    return new google.maps.Map(mapCanvas, mapOptions);
};

function initialize_google_maps() {
  initialize = function() {
    console.log("Initializing Google Maps ... ");
    defaultMarkerValues = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      strokeColor: 'black',
      scale: 7,
      fillOpacity: 10,
      strokeWeight: 1,
    };
    defaultMarkerSymbol = Object.assign({fillColor: 'lightblue'}, defaultMarkerValues);
    selectedMarkerSymbol = Object.assign({fillColor: 'lightgreen'}, defaultMarkerValues);
    userMarkerSymbol = Object.assign({fillColor: 'teal'}, defaultMarkerValues);
    GoogleMap = getNewGoogleMapsObject();//new google.maps.Map(mapCanvas, mapOptions);
    if (navigator.geolocation) {
      userMarker = new google.maps.Marker({
        map: GoogleMap,
        icon: userMarkerSymbol
      });
      navigator.geolocation.watchPosition(
        function(pos) {
          var coords = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          if(manualPosition) return;
          GoogleMap.panTo(coords);
          userMarker.setPosition(coords);
        }
      )
    };

/*
    var MapInterval;
    function WaitForGMap() {
      MapInterval = window.setInterval(function() {	
        if (GoogleMap) {
          window.clearInterval(MapInterval);
          LoadMapEvents();
        }
      }, 100);
    }
    WaitForGMap();
*/
   }

  
    initialize();
 
  
//    subscribeToAllTables();

};
var openCreateDialog = function(x, y) {
    Session.set("createCoords", {x: x, y: y});
    Session.set("createError", null);
    Session.set("showCreateDialog", true);
  }

var getMarker = function(x, y) {
    return new google.maps.Marker({
      position: new google.maps.LatLng(x, y)
    });
  }



function LoadMapEvents() {
  CurrentEvents.find({}).forEach(function(_event) {
    console.log("Event: " + _event.name);
    var marker = getMarker(_event.x, _event.y);
    marker.setMap(GoogleMap);
    marker.setTitle(_event.name);
    marker.setIcon(defaultMarkerSymbol);
    google.maps.event.addListener(marker, 'click', function() {
      if (selectedMarker)
        selectedMarker.setIcon(defaultMarkerSymbol);
      selectedMarker = marker;
      selectedMarker.setIcon(selectedMarkerSymbol);
      Session.set("selected", _event._id);
      var coords = new google.maps.LatLng(marker.getPosition().lat(), marker.getPosition().lng());
      manualPosition = true;
      GoogleMap.panTo(coords);
    });
  });
  google.maps.event.addListener(userMarker, 'click', function() {
    manualPosition = false;
  });
  google.maps.event.addListener(GoogleMap, 'dblclick', function(mouse) {
    console.log("Lat: " + mouse.latLng.lat() + 
      "\nLong: " + mouse.latLng.lng());
    console.log("userId: " + Meteor.userId())
    if (! Meteor.userId())
      return;
    var coords = mouse.latLng
    openCreateDialog(coords.lat(), coords.lng());
  });
};

