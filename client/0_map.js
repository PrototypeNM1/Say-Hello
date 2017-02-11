var loaded = false;

$(document).ready(function() { loaded = true; });


function initialize_google_map() {
  LOAD();
}

function LOAD()
{
  initialize = function() {
    console.log("Initializing Google Maps ... ");
    defaultMarkerSymbol = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'blue',
      strokeColor: 'black',
      scale: 10,
      fillOpacity: 1,
      strokeWeight: 1   
    };
    selectedMarkerSymbol = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'green',
      strokeColor: 'black',
      scale: 10,
      fillOpacity: 1,
      strokeWeight: 1
    };
    userMarkerSymbol = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'red',
      strokeColor: 'black',
      scale: 10,
      fillOpacity: 1,
      strokeWeight: 1
    };

    var map_canvas = document.getElementById("map_canvas");
    var map_options = {
      center: new google.maps.LatLng(40.4319, -86.9202),
      zoom: 16,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      streetViewControl: false,
      disableDefaultUI: true,
      zoomControl: true,
      //mapMaker: true
      mapTypeId: google.maps.MapTypeId.ROAD,
      styles: [{
        featureType: "poi",
        elementType: "label",
        stylers: [{ visibility: "off" }]
      }]
    }

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

    GoogleMap = new google.maps.Map(map_canvas, map_options);

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
  }
  var openCreateDialog = function(x, y) {
    Session.set("createCoords", {x: x, y: y});
    Session.set("createError", null);
    Session.set("showCreateDialog", true);
  }

  getMarker = function(x, y) {
    return new google.maps.Marker({
      position: new google.maps.LatLng(x, y)
    });
  }
  google.maps.event.addDomListener(window, 'load', initialize);
  window.onload = (initialize)
  Meteor.subscribe("directory");
  Meteor.subscribe("current_events", initialize);
  Meteor.subscribe("past_events");
  Meteor.subscribe("facebook_info");
  Meteor.subscribe("friends");
  Meteor.subscribe("sign");
  Template.map.rendered = initialize;
};

