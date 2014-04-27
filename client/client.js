


// Say Hello - client
// Wait for google maps api to load
//alert('test');
var loaded = false;
var lint;
var myPerson;
var counter = 0;

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
$(document).ready(function() { loaded = true; });
lint = window.setInterval(function() {
    //console.log('------');
    if (google) {
	//console.log('google exists');
	if (google.maps) { //google.maps.SymbolPath.CIRCLE
	    //console.log('google.maps exists');
	    if (google.maps.SymbolPath) {
		//console.log('google.maps.SymbolPath exists');
		if (google.maps.SymbolPath.CIRCLE === 0) {
		    //console.log('google.maps.SymbolPath.CIRCLE exists');
		    window.clearInterval(lint);
		    LOAD();
		}
	    }
	}
    }
}, 1000);


var getMarker;
var defaultMarkerSymbol;
var selectedMarkerSymbol;
var selectedMarker;
var GoogleMap;
var initialize;

function LOAD()
{
/*
    var defaultMarkerSymbol;
    var selectedMarkerSymbol;
    var selectedMarker;
    var GoogleMap;
*/







    initialize = function() {
	console.log("initializing map ...");
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

	var MapInterval;
	function WaitForGMap() {
	    MapInterval = window.setInterval(function() {	
		if (GoogleMap) {
		    window.clearInterval(MapInterval);
		    //console.log(GoogleMap);
		    LoadMapEvents();
		}
	    }, 100);
	}
	WaitForGMap();
	//alert(map_options.center);

	GoogleMap = new google.maps.Map(map_canvas, map_options);

	if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(
		function(pos) {
		    var coords = pos.coords;
		    GoogleMap.setCenter(new google.maps.LatLng(coords.latitude, coords.longitude));
		},
		function(err) {
		},
		{timeout: 30000, enableHighAccuracy: true, maximumAge: 75000}
	    );
	    navigator.geolocation.watchPosition(
		function(pos) {
		    var coords = pos.coords;
		    GoogleMap.setCenter(new google.maps.LatLng(coords.latitude, coords.longitude));
		}
	    )
	}

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
	function LoadMapEvents() {
	    //console.log("Revent Count (init): " + CurrentEvents.find().count());
	    CurrentEvents.find({}).forEach(function(_event) {
		console.log("Event: " + _event.name);
		var marker = getMarker(_event.x, _event.y);
		marker.setMap(GoogleMap);
		marker.setTitle(_event.name);
		marker.setIcon(defaultMarkerSymbol);
		google.maps.event.addListener(marker, 'click', function() {
		    var theMarker
		    if (selectedMarker)
			selectedMarker.setIcon(defaultMarkerSymbol);
		    //theMarker = _.clone(defaultMarkerSymbol);
		    selectedMarker = marker;
		    //theMarker = _.clone(selectedMarkerSymbol)
		    //theMarker.scale = 8 + Math.sqrt(_event.attendees.length);
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
	}; // LoadMapEvents
	//}, 100);
    }
    var openCreateDialog = function(x, y) {
	Session.set("createCoords", {x: x, y: y});
	Session.set("createError", null);
	Session.set("showCreateDialog", true);
	//initialize();
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

   
    //Meteor.subscribe("facebook_info");
    Meteor.subscribe("friends");
    Meteor.subscribe("sign");





    Template.map.rendered = initialize;
}; // LOAD


//Template.map.rendered = initialize;
/*
  Allows access to the facebook information
*/
/*Accounts.ui.config({
  requestPermissions: {
  facebook: [ 'bio', 'email']
  }
  });*/
Meteor.startup(function() {
    Session.set("event-type", "current");
    Deps.autorun(function() {
	var selected = Session.get("selected");
	if (selected && ! CurrentEvents.findOne(selected)) {
	    Session.set("selected", null);
	}
	
    });
});

Template.footer.showEventDetails = function() {
    //$('#event-list').toggle( Session.get("selected") != null );
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
    initialize(); // google maps
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
	//Meteor call to check the attendee list


	return false;
    },
    'click .curLoc': function() {
	// create thing at current location
	navigator.geolocation.getCurrentPosition(function(position) {
	    openCreateDialog(position.coords.latitude, position.coords.longitude);
	});
    },
    'click .cancel': function() {
	Session.set("selected", null);
    }
});

/* Current Events */
Template.event_list.event_list = function() {
    // Condition here to grab either past or current events
    if (Session.get("event-type") == "current") {
	return CurrentEvents.find(); // current events
    } else {
	console.log("User Id: " + Meteor.userId());
	var pastEvents = PastEvents.findOne({user: Meteor.userId()});
	if (pastEvents) {
	    return CurrentEvents.find({_id: {$in: pastEvents.events}}); // find events that are in past events array
	} else {
	    return CurrentEvents.find("Empty"); // No past events (no event will have an _id of 'Empty'
	}
    }
};

/* Past Events */
Template.event_list.event_list_past = function() {
    return null; //PastEvents.find(); 
}

Template.event_list.rendered = function() {
    $('#event-list').listview('refresh');
    
    $('.event-item').click(function() {
	Session.set("selected", $(this).attr('name'));
    });
};





/*LEVIS CODE GOES HERE*/
//le

//levistest.meteor.com
Template.account_tab.events =  {
    //if(Meteor.userId()) {
    
    
    'click .edit': function () {
       // if(document.getElementById('makeChange').value == "Edit"){
            //document.getElementById('makeChange').value = "Save";
	console.log("Edit button clicked");
	if(document.getElementById("makeChange").value == "Edit"){
            document.getElementById('choose').style.display = "inline";
            document.getElementById('changefirst').disabled=false;
            document.getElementById('changelast').disabled=false;
            document.getElementById('changeemail').disabled=false;
            document.getElementById('changephone').disabled=false;
            document.getElementById('changegender').disabled=false;
            $("#makeChange").prop('value', 'Save').button("refresh");
	}

        else {
            var file = document.getElementById("choose").value;
            var firstname = document.getElementById("changefirst").value;
            var lastname = document.getElementById("changelast").value;
            var email = document.getElementById("changeemail").value;
            var phoneNumber = document.getElementById("changephone").value;
            var gender = document.getElementById("changegender").value;
	

	
            document.getElementById('choose').style.display = "none";
            document.getElementById('changefirst').disabled=true;
            document.getElementById('changelast').disabled=true;
            document.getElementById('changeemail').disabled=true;
            document.getElementById('changephone').disabled=true;
            document.getElementById('changegender').disabled=true;
	
	    var currentEmail = Meteor.user().services.facebook.email;
	    
	    var myId = Friends.findOne({myEmail: currentEmail});
	    console.log("myId: " + myId);
	    
	    //push these changes in database
	    Friends.update({_id: myId._id}, {$set: {
		firstName: firstname, 
		lastName: lastname,
		myEmail:  email,
		phoneNumber: phoneNumber,
		myGender: gender,
	    }});
	    
	    console.log("Database updated");
	    
            $("#makeChange").prop('value', 'Edit').button("refresh");
        }
	
	//update the friend list with changes

    }
};


/********** Contact Share Info ****************************/
Template.attendance.events({
    'click #shareContact': function(event) {

	//first get the element by name
	var outputEmail  = Friends.find({});
	
	var emailId = new Array();
	var count = 0;
	outputEmail.forEach(function(data) {
	    console.log("Ids Checked=" + "myRadio"+data.myEmail);
	    console.log("Collection entry: " + data.myEmail);
	    if(document.getElementById("myRadio"+data.myEmail)!=null) {
		if(document.getElementById("myRadio"+data.myEmail).checked==true) {
		    console.log("Found true: " + "myRadio"+data.myEmail + "with value" + document.getElementById("userA"+data.myEmail).innerHTML);
		    emailId[count] = document.getElementById("userA"+data.myEmail).innerHTML;
		}
	    }
	});
	console.log(emailId);
	//match the list of email with their respec userIds

	//var emailId = document.getElementById("name").innerHTML;
	
	for(var i=0; i<emailId.length; i++) {
	    var output = Friends.findOne({myEmail: emailId});
	    //console.log("Name: " + output.firstName);
	    
	    var currentUserEmail = Meteor.user().services.facebook.email;
	
	    //do proper update
	    var myId = Friends.findOne({myEmail: currentUserEmail});
	    console.log("Added Email: " + emailId[i] + "to friend list");
	    Friends.update({_id: myId._id}, {$addToSet: {friendList: emailId[i]}});
	}
    }
});
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
    },

    'click .friendsTab': function() {
	
	console.log("Clicked friends tab");
	var currentEmail = Meteor.user().services.facebook.email
	var list = new Array();
	var result = Friends.findOne({myEmail: currentEmail});
	var friends = result.friendList;
	
	//friendlist contains the email of all the friends
	//get these from friends
	console.log(friends);
	for(var i=0; i<friends.length; i++) {
	    if(typeof(friends[i])!="object") {
		//check for same email
		
		console.log("Friend# " + (i) + " " + friends[i]);
		list = list + '<div style="background-color: #333; padding: 5px; width: 100%; border-radius: 5px; box-shadow: 1px 1px 1px 1px grey;">';
		//add the name
		var myFriend = Friends.findOne({myEmail: friends[i]});

		list = list + "<br>" + myFriend.firstName + " " + myFriend.lastName + "<br>";
		
		//add email address of these friends
		var email = myFriend.myEmail;

		list = list + email;

		list = list + '</div>'
	    }
	    
	}
	console.log(list);
	document.getElementById("friends").innerHTML=list;
    },

    'click .account': function(){
	
	/*Code for loading the account information to the account tab
	  As of now, it 
	  -creates the user object from services.facebook
	  -sets the values of each text field
	  -and disables the text fields
	*/
	
	//get the current user's email
	Meteor.subscribe("facebook_info");	
	console.log("Getting Account Information");
	var currentEmail = Meteor.user().services.facebook.email;
	console.log("For email: " + currentEmail);
	//fetch this user's friend list from his email
	var output = Friends.findOne({myEmail: currentEmail});
	
	
	var locale = Meteor.user().services.facebook.locale;
	//fetch this user's friend list from his email
	
	
	var firstName = output.firstName;
	var lastName = output.lastName;
	var myEmail = output.myEmail;
	var myGender = output.myGender;
	var myId = output.myId;
	
	var phoneNumber = output.phoneNumber;

	var myPerson = new person(firstName, lastName, myEmail, phoneNumber, myGender, locale, myId);
	
 	document.getElementById("changefirst").value = myPerson.firstname;
	document.getElementById("changelast").value = myPerson.lastname;
	document.getElementById("changeemail").value = myPerson.email;
	document.getElementById("changephone").value = myPerson.phoneNumber;
	document.getElementById("changegender").value = myPerson.gender;
	
	var img = document.getElementById("prof");

	console.log("Image: " + output.profile_pic);
	img.src = output.profile_pic; //"http://graph.facebook.com/" + id + "/picture/?type=large";
	//document.getElementById(
    }
    
});

Template.details.rendered = function() {
    $("#detail-modal").height( $("#event-list").height() );
    console.log("Height: " + $("#event-list").height());
};

Template.footer.rendered = function() {
    $('#epanel').height( $('#footer').innerHeight() - 2 * $('#footer-nav').innerHeight() - 20 );
    $('#apanel').height( $('#footer').innerHeight() - 2 * $('#footer-nav').innerHeight() - 20 );
    $('#ppanel').height( $('#footer').innerHeight() - 2 * $('#footer-nav').innerHeight() - 20 );
};


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
	    }, function(err) { alert("Geolocation was unsuccessful in finding your current position. Please double-click the map to create an event."); }, 
	       {timeout: 5000});
	} else {
		alert("Geolocation has been disabled on your device! Please double-click the map to create an event.");
	}
    });
    $( "#moar" ).click(function() {
	alert("TODO: load more events (need to limit event view to 5 at a time by default, increase by 5 each time more loads");
    });
    $( "#past-current" ).click(function() {
	
	
	if (Session.get("event-type") == "current") {
	    Session.set("event-type", "past");
	    $( '#past-current' ).text("View Current Events");
	    //alert("Switched to past events display (not implemented)");
	} else {
	    Session.set("event-type", "current");
	    $( '#past-current' ).text("View Past Events");
	    //alert("Switched to current events display (not implemented)");
	}

	
	//alert("TODO: implement past events");
	//go throught all the events in current event list, if attendies is == 0 add it to past event list
	/*
	  console.log("Searching for events....");
	  var eventID;

	  CurrentEvents.find({}).forEach(function (_event) {
	  console.log("Event: " + _event.name);
	  console.log("Attendees: " + _event.attendees.length);
	  console.log("Event ID: " + _event._id);
	  if(_event.attendees.length == 0) {
	  //insert this event in the past event collection
	  PastEvents.insert({
	  _id: _event._id,
	  owner: _event.owner,
	  name: _event.name,
	  description: _event.description,
	  x: _event.x,
	  y: _event.y,
	  attendees: _event.attendees
	  });
	  //var eventID = _event._id;
	  //remove this event
	  console.log("Removed event id: " + _event._id);
	  CurrentEvents.remove({_id: _event._id});
	  
	  }
	  

	  //make a dialog for viewing details of this past event
	  // already done by Derek.
	  });
	  //remove this event from current event list
	  //console.log(eventID);

	  */
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

/*















The










Space














Is









Here












To









Avoid

















Merge















Conflicts











*/

	    

if(Meteor.isClient) {
    console.log("Welcome to client");
    
    Deps.autorun(function(){
	if(Meteor.user() && Meteor.user().services) {
	    
	    console.log("Logged In:");
	    
	    //get the current user's email
	    Meteor.subscribe("facebook_info");	

	    console.log("Grabbing the email"); 

	    var currentEmail = Meteor.user().services.facebook.email;
	    
	    console.log(currentEmail);
	    
	    //fetch this user's friend list from his email
	    var output = Friends.findOne({myEmail: currentEmail});

	    //if output is undefined hence not an object,
	    //hence put it in the database
	    if(typeof(output)!="object") {
		console.log("There's no such user");
		//populate the field
		if(counter == 0){			
		    Meteor.subscribe("facebook_info");	
		    var first = Meteor.user().services.facebook.first_name;
		    var last = Meteor.user().services.facebook.last_name;
		    var email = Meteor.user().services.facebook.email;
		    var gender = Meteor.user().services.facebook.gender;
		    var locale = Meteor.user().services.facebook.locale;
		    var id = Meteor.user().services.facebook.id;
		    var phoneNumber = "none";

		    myPerson = new person(first, last, email, phoneNumber, gender, locale, id);
			
		    var img = document.getElementById("prof");
		    //img.src = "http://graph.facebook.com/" + id + "/picture/?type=large";
		    var profile_pic = "http://graph.facebook.com/" + id + "/picture/?type=large";

		    counter++;
		}
		
		
		console.log("Not defined, new user!");
		friendName = "null"; //null at this time
		///These need to be stored in friend list at time of sign in
		Friends.insert({
		    profile_pic: profile_pic, 
		    myEmail: email,
		    firstName: first,
		    lastName: last,
		    myGender: gender,
		    myId: id,
		    phoneNumber: phoneNumber,
		    friendList: [{name: friendName}]
		});
		
	    }
	    
	    

	    

	    var locale = Meteor.user().services.facebook.locale;
	    //fetch this user's friend list from his email
	    var output = Friends.findOne({myEmail: currentEmail});
	    //console.log("output is: " + output.firstName);
	    var firstName = output.firstName;
	    var lastName = output.lastName;
	    var myEmail = output.myEmail;
	    var myGender = output.myGender;
	    var myId = output.myId;
	    var phoneNumber = output.phoneNumber;

	    var myPerson = new person(firstName, lastName, myEmail, phoneNumber, myGender, locale, myId);
		
		
	    
		
	    var img = document.getElementById("prof");
	    img.src = "http://graph.facebook.com/" + myId + "/picture/?type=large";
	    
    
	}
    });
		 
		 
	

    Deps.autorun(function(){
	if(Meteor.userId()==null) {
	   console.log("Logs out");
	    
	    

	     //Meteor.subscribe("Sign");

	    //Sign.insert({status: "out"});
	    
	    
	    Template.everything.rendered = function() {
		//console.log("!");
		//document.getElementById('footer').style.display = 'none';

	    };

	}

	if(Meteor.loggingIn()) {
	    //console.log("Trying to login");
	    

	}
    
    });
}
	    
