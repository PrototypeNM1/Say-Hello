var GoogleMap;
var autocomplete;
var autocompleteAddress = {};
//
var defaultMarkerSymbol; 
var selectedMarkerSymbol;
var userMarkerSymbol;
//
var selectedMarker;
var userMarker;
//
var manualPosition = false;

var Map = {
  canvas: function() {
    return DOM.getID('mapCanvas')
  },
  options: function() {
    return {
      zoom: 12,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      streetViewControl: false,
      disableDefaultUI: true,
      zoomControl: false,
      mapMaker: true,
      mapTypeId: google.maps.MapTypeId.ROAD,
      styles: [{
        featureType: "poi",
        elementType: "label",
        stylers: [{ visibility: "off" }]
      }]
    }
  },
  center: function() {
   if (navigator.geolocation) {
      if (userMarker) {
        userMarker.setMap(null);
      }
      userMarker = new google.maps.Marker({
        map: GoogleMap,
        icon: userMarkerSymbol
      });
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          var coords = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          if(!manualPosition) {
            GoogleMap.panTo(coords);
            userMarker.setPosition(coords);
          }
        }
      )
    };
  },
  recenterButton: function() {
    var recenterButton = document.createElement('div');
    recenterButton.style.padding = '2px';
    recenterButton.innerHTML = '&#10687;';
    recenterButton.style.fontSize = '21px';
    recenterButton.style.textAlign = 'center';
    recenterButton.style.backgroundColor = 'white';
    recenterButton.addEventListener('click', function() {
      Map.center();
    });
    recenterButton.index = 1;
    return recenterButton;
  }, 
  setMarkerValues: function() {
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
    return true;
  },
  getAutocompleteBox: function() {
    var element = document.createElement('input');
    element.style.width = '100%';
    element.id = 'autocomplete';
    element.type = 'text';
    element.placeholder = 'Enter your address';
    element.index = 1;
    element.style.padding = '7px';
    return element;
  },
  initAutoComplete: function() {
    var element = this.getAutocompleteBox();
    autocomplete = new google.maps.places.Autocomplete(
      element,
      {types: ['geocode']}
    );
    autocomplete.addListener('place_changed', function() {
      var place = autocomplete.getPlace();
      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        var val = place.address_components[i].short_name;
        autocompleteAddress.addressType = val;
      };
      var lat = place.geometry.location.lat();
      var lng = place.geometry.location.lng();
      var coords = new google.maps.LatLng(lat, lng);
      GoogleMap.panTo(coords);
      userMarker.setPosition(coords);
    });
    GoogleMap.controls[google.maps.ControlPosition.TOP_CENTER].push(element); 
  },
  setClickEvents: function() {
    google.maps.event.addListener(userMarker, 'click', function() {
      manualPosition = false;
    });
    GoogleMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.recenterButton());
  },
  initialize: function() {
    LOG.msg("Initializing Google Maps ... ");
    GoogleMap = new google.maps.Map(this.canvas(), this.options());
    if (!GoogleMap) {
      LOG.error("Google Maps couldn't be initialized");
    }
    if(this.setMarkerValues()) {
      this.center();
    }
    this.setClickEvents();
    this.initAutoComplete();
  }
};

var openCreateDialog = function(x, y) {
  Session.set("createCoords", {x: x, y: y});
  Session.set("createError", null);
  Session.set("showCreateDialog", true);
};

var getMarker = function(x, y) {
  return new google.maps.Marker({
    position: new google.maps.LatLng(x, y)
  });
};

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
};
