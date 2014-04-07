


// Say Hello - client
var defaultMarkerSymbol;
var selectedMarkerSymbol;
var selectedMarker;
var GoogleMap;
var myPerson;




/*
	Constructor for the person object
	Holds person's information
*/
function person(firstname, lastname, email, phoneNumber, gender, loc, idNum)
{
	this.firstname = firstname;
	this.lastname = lastname;
	this.email = email;
	this.phoneNumber = phoneNumber;
	this.gender = gender;
	this.loc = loc;
	this.idNum = idNum;
}


/*
	Allows access to the facebook information
*/
/*Accounts.ui.config({
	requestPermissions: {
		facebook: [ 'bio', 'email']
	}
});*/




var initialize = function() {
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
	//init_stuff = window.setInterval(function() {
	//window.clearInterval(init_stuff);

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			function(pos) {
				var coords = pos.coords;
				var map_canvas = document.getElementById("map_canvas");
				var map_options = {
					center: new google.maps.LatLng(coords.latitude, coords.longitude),
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
				alert(map_options.center);
			},
			function(err) {
				//do nothing
			},
			{timeout: 30000, enableHighAccuracy: true, maximumAge: 75000}
		);
	} else {
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
		alert(map_options.center);
	}
// TODO: MAP CENTERING

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
	//}, 100);
}
/*var openCreateDialog = function(x, y) {
	Session.set("createCoords", {x: x, y: y});
	Session.set("createError", null);
	Session.set("showCreateDialog", true);
	//initialize();
}
*/
	
var getMarker = function(x, y) {
	return new google.maps.Marker({
		position: new google.maps.LatLng(x, y)
	});
}
	//google.maps.event.addDomListener(window, 'load', initialize);
	//window.onload = (initialize)


Meteor.subscribe("directory");
Meteor.subscribe("current_events", initialize);
Meteor.subscribe("past_events");
Meteor.subscribe("facebook_info");

Template.map.rendered = initialize;
/*
	Allows access to the facebook information
*/
/*Accounts.ui.config({
	requestPermissions: {
		facebook: [ 'bio', 'email']
	}
});*/
Meteor.startup(function() {
	Deps.autorun(function() {
		var selected = Session.get("selected");
		if (selected && ! CurrentEvents.findOne(selected)) {
			Session.set("selected", null);
		}
	});
});


Template.everything.showEventDetails = function() {
	return Session.get("selected");
}

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
	},
	'click .close': function() {
		Session.set("selected", null);
	}
});

Template.event_list.event_list = function() {
	return CurrentEvents.find();
};

Template.event_list.rendered = function() {
	$('#event-list').listview('refresh');
	$('#epanel').height( $('#footer').innerHeight() - 2 * $('#footer-nav').innerHeight() - 20 );
	$('.event-item').click(function() {
		Session.set("selected", $(this).attr('name'));
	});
};

/*LEVIS CODE GOES HERE*/
Template.account_tab.events =  {
	'click .set': function () {
	
		var first = Meteor.user().services.facebook.first_name;
		var last = Meteor.user().services.facebook.last_name;
		var email = Meteor.user().services.facebook.email;
		var gender = Meteor.user().services.facebook.gender;
		var locale = Meteor.user().services.facebook.locale;
		var id = Meteor.user().services.facebook.id;
		myPerson = new person(first, last, email, 8675309, gender, locale, id);

		document.getElementById("outputfirst").innerHTML = myPerson.firstname;
		document.getElementById("outputlast").innerHTML = myPerson.lastname;
		document.getElementById("outputemail").innerHTML = myPerson.email;
		document.getElementById("outputphone").innerHTML = myPerson.phoneNumber;
		document.getElementById("outputgender").innerHTML = myPerson.gender;

		document.getElementById("changefirst").value = myPerson.firstname;
		document.getElementById("changelast").value = myPerson.lastname;
		document.getElementById("changeemail").value = myPerson.email;
		document.getElementById("changephone").value = myPerson.phoneNumber;
		document.getElementById("changegender").value = myPerson.gender;
},
	'click .edit': function () {
		document.getElementById("outputfirst").style.display = 'none';
		document.getElementById("outputlast").style.display = 'none';
		document.getElementById("outputemail").style.display = 'none';
		document.getElementById("outputphone").style.display = 'none';
		document.getElementById("outputgender").style.display = 'none';	

		document.getElementById("changefirst").style.display = 'inline';
		document.getElementById("changelast").style.display = 'inline';
		document.getElementById("changeemail").style.display = 'inline';
		document.getElementById("changephone").style.display = 'inline';
		document.getElementById("changegender").style.display = 'inline';

		
},
	'click .save': function () {
		
		document.getElementById("outputfirst").style.display = 'inline';
		document.getElementById("outputlast").style.display = 'inline';
		document.getElementById("outputemail").style.display = 'inline';
		document.getElementById("outputphone").style.display = 'inline';
		document.getElementById("outputgender").style.display = 'inline';	

		document.getElementById("changefirst").style.display = 'none';
		document.getElementById("changelast").style.display = 'none';
		document.getElementById("changeemail").style.display = 'none';
		document.getElementById("changephone").style.display = 'none';
		document.getElementById("changegender").style.display = 'none';

		myPerson.firstname = document.getElementById("changefirst").value;
		myPerson.lastname = document.getElementById("changelast").value;
		myPerson.email = document.getElementById("changeemail").value;
		myPerson.phoneNumber = document.getElementById("changephone").value;
		myPerson.gender = document.getElementById("changegender").value;

		document.getElementById("outputfirst").innerHTML = myPerson.firstname;
		document.getElementById("outputlast").innerHTML = myPerson.lastname;
		document.getElementById("outputemail").innerHTML = myPerson.email;
		document.getElementById("outputphone").innerHTML = myPerson.phoneNumber;
		document.getElementById("outputgender").innerHTML = myPerson.gender;
		
}
};

/*
Template.attendance.rendered = function() {
	//$('#attendee-list').listview('refresh');
	if ( $('#attendee-list').hasClass('ui-listview')) {
	    $('#attendee-list').listview('refresh');
	} else {
    		$('#attendee-list').trigger('create');
	}
};
*/
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

window.onload = function() {
	$( "#create" ).click(function() {
		//openCreateDialog(0,0);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(pos) {
				alert("Creating event at location <" + pos.coords.latitude + ", " + pos.coords.longitude + ">");
				openCreateDialog(pos.coords.latitude, pos.coords.longitude);
			});
		}
	});
	$( "#moar" ).click(function() {
		alert("TODO: load more events (need to limit event view to 5 at a time by default, increase by 5 each time more loads");
	});
	$( "#past-current" ).click(function() {
		if (Session.get("event-type") == "current") {
			Session.set("event-type", "past");
			alert("Switched to past events display (not implemented)");
		} else {
			Session.set("event-type", "current");
			alert("Switched to current events display (not implemented)");
		}
		//alert("TODO: implement past events");
	});
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
