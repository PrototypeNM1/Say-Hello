if (Meteor.isClient) {
  LOG.msg("Starting client side code ... ");
  Meteor.startup(function() {
    LOG.msg('Meteor is starting up ... ');
    Map.initialize();
    Deps.autorun(function() {
      if (Meteor.user()) {
        initializeEverything();
        createEverything();
      } else {
        destroyEverything();
      }
    });
  });
}

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
  Map.initialize(); // google maps
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
    navigator.geolocation.getCurrentPosition(function(position) {
      openCreateDialog(position.coords.latitude, position.coords.longitude);
    });
  },
  'click .cancel': function() {
    Session.set("selected", null);
  }
});

Template.attendance.events({
  'click #shareContact': function(event) {
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
    for(var i=0; i<emailId.length; i++) {
      var output = Friends.findOne({myEmail: emailId});
      var currentUserEmail = Meteor.user().services.facebook.email;
      var myId = Friends.findOne({myEmail: currentUserEmail});
      console.log("Added Email: " + emailId[i] + "to friend list");
      Friends.update({_id: myId._id}, {$addToSet: {friendList: emailId[i]}});
    }
  }
});

Template.footer.events({
  'click .sign-in': function() {
    Meteor.call('sign_', Session.get("selected"), true); // sign in
    return false;
  },
  'click .sign-out': function() {
    Meteor.call('sign_', Session.get("selected"), false); // sign out
    return false;
  },
  'click .friendsTab': function() {
  },
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

var coordsRelativeToElement = function(element, event) {
  var offset = $(element).offset();
  var x = event.pageX - offset.left;
  var y = event.pageY - offset.top;
  return {x: x, y: y};
};

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

