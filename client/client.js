// Say Hello - client
var defaultMarkerSymbol;
var selectedMarkerSymbol;
var selectedMarker;
var init_stuff;
var initialize;
var getMarker = function() {console.log("Hello from getMarker!");};
var GoogleMap;

Meteor.subscribe("directory");
Meteor.subscribe("current_events", function() {
	initialize = function() {
		defaultMarkerSymbol = {
			path: google.maps.SymbolPath.CIRCLE,
			fillColor: 'blue',
			strokeColor: 'black',
			scale: 13,
			fillOpacity: 1,
			strokeWeight: 3
		};
		selectedMarkerSymbol = {
			path: google.maps.SymbolPath.CIRCLE,
			fillColor: 'green',
			strokeColor: 'black',
			scale: 13,
			fillOpacity: 1,
			strokeWeight: 3
		};

		init_stuff = window.setInterval(function() {
		window.clearInterval(init_stuff);
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
			mapTypeId: google.maps.MapTypeId.HYBRID,
			styles: [{
				featureType: "poi",
				elementType: "label",
				stylers: [{ visibility: "off" }]
			}]
		}
		GoogleMap = new google.maps.Map(map_canvas, map_options);
		//google.maps.event.addListener(map, 'idle', function() {
			// generate markers
		//	alert("Google Map Loaded.");
			/*
			for (var _event in CurrentEvents.find().fetch()) {
				console.log("Event: " + _event[0]);
				var marker = getMarker(_event.x, _event.y);
				marker.setMap(map);
			}
			*/
		console.log("Revent Count (init): " + CurrentEvents.find().count());
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
			});
		});
		//});
		google.maps.event.addListener(GoogleMap, 'dblclick', function(mouse) {
			console.log("Lat: " + mouse.latLng.lat() + 
					"\nLong: " + mouse.latLng.lng());
			console.log("userId: " + Meteor.userId())
			if (! Meteor.userId())
				return; // not logged in
			var coords = mouse.latLng
			openCreateDialog(coords.lat(), coords.lng());
		});
		}, 100);
	}
	/*var openCreateDialog = function(x, y) {
		Session.set("createCoords", {x: x, y: y});
		Session.set("createError", null);
		Session.set("showCreateDialog", true);
		//initialize();
	}
	*/
	
	getMarker = function(x, y) {
		return new google.maps.Marker({
			position: new google.maps.LatLng(x, y)
		});
	}
	//google.maps.event.addDomListener(window, 'load', initialize);
	window.onload = (initialize)
	//console.log(getMarker);
	/*var createDia = false;
	Deps.autorun(function(c) {
		var boo = Session.get("showCreateDialog");
		if (createDia == true && boo != createDia) {
			createDia = boo;
			initialize();
		} else {
			createDia = boo;
		}
		c.stop();
	});
	*/
});

Meteor.startup(function() {
	Deps.autorun(function() {
		var selected = Session.get("selected");
		if (selected && ! CurrentEvents.findOne(selected)) {
			Session.set("selected", null);
		}
	});
});



Template.details._event = function() {
	//alert("Current selected: " + Session.get("selected"));
	return CurrentEvents.findOne(Session.get("selected"));
};

Template.details.anyEvents = function() {
	console.log("ANY_EVENTS: # events: " + CurrentEvents.find().count());
	return CurrentEvents.find().count() > 0;
};

Template.details.attending = function() {
	return this.attendees.length > 0;
};

Template.details.canGeolocate = function() {
	//initialize(); // google maps
	console.log(navigator + "\n" + navigator.geolocation);
	return navigator.geolocation && true;
};

Template.details.signedIn = function(_event, currentId) {
	var tendees = _.pluck(_event.attendees, 'name');
	console.log(Meteor.users.findOne(currentId));
	var user = displayName(Meteor.users.findOne(currentId));
	var email = contactEmail(Meteor.users.findOne(currentId));
	console.log("User: " + user + "\nEmail: " + email);
	console.log("Current user is in this event: " + 
			(_.contains(tendees, user) || _.contains(tendees, email)));
	if (_.contains(tendees, user) || _.contains(tendees, email))
		return true;
	else
		return false;
}

Template.details.creatorName = function() {
	var owner = Meteor.users.findOne(this.owner);
	if (owner._id === Meteor.userId())
		return "me";
	return displayName(owner);
};

Template.details.events({
	'click .sign-in': function() {
		Meteor.call('sign_', Session.get("selected"), true); // sign in
		return false;
	},
	'click .sign-out': function() {
		Meteor.call('sign_', Session.get("selected"), false); // sign out
		return false;
	},
	'click .curLoc': function() {
		// create thing at current location
		navigator.geolocation.getCurrentPosition(function(position) {
			openCreateDialog(position.coords.latitude, position.coords.longitude);
		});
	}
});

Template.event_list.event_list = function() {
	return CurrentEvents.find();
};

Template.footer.events({
	'click .sign-in': function() {
		Meteor.call('sign_', Session.get("selected"), true); // sign in
		return false;
	},
	'click .sign-out': function() {
		Meteor.call('sign_', Session.get("selected"), false); // sign out
		return false;
	},
	'click .curLoc': function() {
		// create thing at current location
		navigator.geolocation.getCurrentPosition(function(position) {
			openCreateDialog(position.coords.latitude, position.coords.longitude);
		});
	}
});


////////////////////////////////////
// Attendance

// Nothing to do here! :)


////////////////////////////////////
// Map

// JQuery!
var coordsRelativeToElement = function(element, event) {
	var offset = $(element).offset();
	var x = event.pageX - offset.left;
	var y = event.pageY - offset.top;
	return {x: x, y: y};
};
/*
Template.map.events({
	'mousedown circle, mousedown text': function(event, template) {
		Session.set("selected", event.currentTarget.id);
	},
	'dblclick .gm-style': function(event, template) {
		if (! Meteor.userId()) // if not logged in
			return;
		var coords = event.latLng //coordsRelativeToElement(event.currentTarget, event);
		openCreateDialog(coords.lat(), coords.lng());
	}
});
*/
/*
Template.map.rendered = function() {
	var self = this;
	self.node = self.find("svg");

	if (! self.handle) {
		self.handle = Deps.autorun(function() {
			var selected = Session.get('selected');
			var selectedEvent = selected && CurrentEvents.findOne(selected);
			var radius = function(_event) {
				return 10 + Math.sqrt(attending(_event)) * 10;
			};

			// Draw circles for each event
			var updateCircles = function(group) {
				group.attr("id", function(_event) { return _event._id })
					.attr("cx", function(_event) { return _event.x * 500 })
					.attr("cy", function(_event) { return _event.y * 500 })
					.attr("r", radius)
					.attr("class", function(_event) {
						return "public";
					})
					.style('opacity', function(_event) {
						return selected === _event._id ? 1 : 0.6;
					});
			};

			var circles = d3.select(self.node).select(".circles").selectAll("circle")
				.data(CurrentEvents.find().fetch(), function(_event) { return _event._id; });
			updateCircles(circles.enter().append("circle"));
			updateCircles(circles.transition().duration(250).ease("cubic-out"));
			circles.exit().transition().duration(250).attr("r", 0).remove();

			// Label each with the current attendance count
			var updateLabels = function(group) {
				group.attr("id", function(_event) { return _event._id })
					.text(function(_event) { return attending(_event) || ""; })
					.attr("x", function(_event) { return _event.x * 500 })
					.attr("y", function(_event) { return _event.y * 500 + radius(_event)/2 })
					.style('font-size', function(_event) {
						return radius(_event) * 1.23 + "px";
					});
				};

				var labels = d3.select(self.node).select(".labels").selectAll("text")
					.data(CurrentEvents.find().fetch(), function(_event) { return _event._id });

				updateLabels(labels.enter().append("text"));
				updateLabels(labels.transition().duration(250).ease("cubic-out"));
				labels.exit().remove();

				// Draw circle around selected event
				var callout = d3.select(self.node).select("circle.callout")
					.transition().duration(250).ease("cubic-out");
				if (selectedEvent)
					callout.attr("cx", selectedEvent.x * 500)
						.attr("cy", selectedEvent.y * 500)
						.attr("r", radius(selectedEvent) + 10)
						.attr("class", "callout")
						.attr("display", '');
				else
					callout.attr("display", 'none');
			});
	}
};

Template.map.destroyed = function() {
	this.handle && this.handle.stop();
};
*/

/////////////////////////////////
// Create Event Dialog

var openCreateDialog = function(x, y) {
	Session.set("createCoords", {x: x, y: y});
	Session.set("createError", null);
	Session.set("showCreateDialog", true);
};

Template.page.showCreateDialog = function() {
	return Session.get("showCreateDialog");
};

Template.createDialog.events({
	'click .save': function(event, template) {
		//alert("Got it!");
		var name = template.find(".name").value;
		var description = template.find(".description").value;
		var coords = Session.get("createCoords");

		if (name.length && description.length) {
			// Title and Description are valid!
			var id = createEvent({
				name: name,
				description: description,
				x: coords.x,
				y: coords.y
			});
			var marker = getMarker(coords.x, coords.y);
			marker.setTitle(name);
			marker.setMap(GoogleMap);
			marker.setIcon(selectedMarkerSymbol);
			google.maps.event.addListener(marker, 'click', function() {
				if (selectedMarker)
					selectedMarker.setIcon(defaultMarkerSymbol);
				selectedMarker = marker;
				selectedMarker.setIcon(selectedMarkerSymbol);
				Session.set("selected", id);
			});

			Session.set("selected", id);
			Session.set("showCreateDialog", false);
		} else {
			Session.set("createError",
				"Title and/or Description fields are not valid!");
		}
	},
	'click .cancel': function() {
		Session.set("showCreateDialog", false);
	}
});

Template.createDialog.error = function() {
	return Session.get("createError");
};

//
