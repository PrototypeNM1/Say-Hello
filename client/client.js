Meteor.startup(function() {
  if (Meteor.userId()) {
    Session.set("event-type", "current");
    subscribeToAllTables();
    Map.initialize();
    LoadMapEvents();
  };
  Deps.autorun(function() {
    var selected = Session.get("selected");
    if (selected && ! CurrentEvents.findOne(selected)) {
      Session.set("selected", null);
    }
  });
});
Meteor.subscribe("friends");

Template.account_tab.friendListFinal = function() {
   myTest = new Array();
    myTest[0] = "Help";
    return myTest;
}


	var alti = new Array();
	alti[0] = "No Account"
	alti[1] = "Login!"
	return alti;
if(Meteor.isClient) {
  console.log("Welcome to client");
  Meteor.subscribe("friends");
  Deps.autorun(function(){

    if(Meteor.user() && Meteor.user().emails && Meteor.user().emails[0].address){
      //Configuration for email login
      console.log("email is: " + Meteor.user().emails[0].address);
      currentEmail = Meteor.user().emails[0].address;
      var output = Friends.findOne({myEmail: currentEmail});
      if(typeof(output)!="object") {
        console.log("There's no such user");
        myPerson = new person(null, null, currentEmail, null, null, null, null);
        console.log("Not defined, new user!");
        friendName = "null";
        Friends.insert({
          myEmail: myPerson.email,
          firstName: myPerson.firstname,
          lastName: myPerson.lastname,
          myGender: myPerson.gender,
          myId: myPerson.id,
          friendList: [{name: friendName}]
        });
      }
      var output = Friends.findOne({myEmail: currentEmail});
      console.log("output is: " + output.firstName);
      var firstName = output.firstName;
      var lastName = output.lastName;
      var myEmail = output.myEmail;
      var myGender = output.myGender;
      var myId = output.myId;
      var myPerson = new person(firstName, lastName, myEmail, null, myGender, locale, myId);
      document.getElementById("changefirst").value = myPerson.firstname;
      document.getElementById("changelast").value = myPerson.lastname;
      document.getElementById("changeemail").value = myPerson.email;
      document.getElementById("changephone").value = myPerson.phoneNumber;
      document.getElementById("changegender").value = myPerson.gender;
      document.getElementById('changefirst').disabled=true;
      document.getElementById('changelast').disabled=true;
      document.getElementById('changeemail').disabled=true;
      document.getElementById('changephone').disabled=true;
      document.getElementById('changegender').disabled=true;
      var img = document.getElementById("prof");
      img.src = "public/SilhoutteHead.jpg";
    }
    else if(Meteor.user() && Meteor.user().services && Meteor.user().services.facebook){
      //Configure Facebook login
      console.log("Logged In:");
      //get the current user's email
      Meteor.subscribe("facebook_info");	
      console.log("grabbing the email"); 
      var currentEmail = Meteor.user().services.facebook.email;
      console.log(currentEmail);
      var output = Friends.findOne({myMail: currentEmail});
      var output = Friends.findOne({myEmail: currentEmail});
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
          myPerson = new person(first, last, email, 8675309, gender, locale, id);
          myPerson = new person(first, last, email, null, gender, locale, id);
          var img = document.getElementById("prof");
          img.src = "http://graph.facebook.com/" + id + "/picture/?type=large";
          counter++;
        }
        console.log("Not defined, new user!");
        friendName = "null"; //null at this time
        ///These need to be stored in friend list at time of sign in
        Friends.insert({
          myEmail: email,
          firstName: first,
          lastName: last,
          myGender: gender,
          myId: id,
          friendList: [{name: friendName}]
        });

      }
      var locale = Meteor.user().services.facebook.locale;
      //fetch this user's friend list from his email
      var output = Friends.findOne({myEmail: currentEmail});
      console.log("output is: " + output.firstName);
      var firstName = output.firstName;
      var lastName = output.lastName;
      var myEmail = output.myEmail;
      var myGender = output.myGender;
      var myId = output.myId;

      var myPerson = new person(firstName, lastName, myEmail, null, myGender, locale, myId);



      var id = Meteor.user().services.facebook.id;

      var img = document.getElementById("prof");
      //if(myId != null){
      img.src = "http://graph.facebook.com/" + id + "/picture/?type=large";
      document.getElementById("changefirst").value = myPerson.firstname;
      document.getElementById("changelast").value = myPerson.lastname;
      document.getElementById("changeemail").value = myPerson.email;
      document.getElementById("changephone").value = myPerson.phoneNumber;
      document.getElementById("changegender").value = myPerson.gender;

      document.getElementById('changefirst').disabled=true;
      document.getElementById('changelast').disabled=true;
      document.getElementById('changeemail').disabled=true;
      document.getElementById('changephone').disabled=true;
      document.getElementById('changegender').disabled=true;


    }
  });




  Deps.autorun(function(){
    if(Meteor.userId()==null) {
      console.log("Logs out");
      Template.everything.rendered = function() {
      };

    }

    if(Meteor.loggingIn()) {
    }

  });
}

var lint;
var myPerson;
var counter = 0;

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

Template.event_list.event_list_past = function() {
  return null; //PastEvents.find(); 
}

Template.event_list.rendered = function() {
  $('#event-list').listview('refresh');
  $('.event-item').click(function() {
    Session.set("selected", $(this).attr('name'));
  });
};

Template.account_tab.rendered = function() {
  var phones = [{ "mask": "(###) ###-####"}, { "mask": "(###) ###-##############"}];
  $('#changephone').inputmask({ 
    mask: phones, 
    greedy: false, 
    definitions: { '#': { validator: "[0-9]", cardinality: 1}} 
  });
  console.log("account_tab rendered");
}

Template.account_tab.events =  {
  'click .edit': function () {
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
      var currentEmail = email;
      var myId = Friends.findOne({myEmail: currentEmail});
      console.log("myId: " + myId);
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
  }
};

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
  'click .curLoc': function() {
    // create thing at current location
    navigator.geolocation.getCurrentPosition(function(position) {
      openCreateDialog(position.coords.latitude, position.coords.longitude);
    });
  },

  'click .friendsTab': function() {
    console.log("Clicked friends tab");
    var currentEmail = null;
    if(Meteor.user().services.facebook) {
      currentEmail = Meteor.user().services.facebook.email
    } else {
      currentEmail = user.emails[o].address;
      console.log("Email login: " + currentEmail);
    }

    var list = new Array();
    var result = Friends.findOne({myEmail: currentEmail});
    var friends = result.friendList;
    console.log(friends);
    for(var i=0; i<friends.length; i++) {
      if(typeof(friends[i])!="object") {
        console.log("Friend# " + (i) + " " + friends[i]);
        list = list + '<div style="background-color: #333; padding: 5px; width: 100%; border-radius: 5px; box-shadow: 1px 1px 1px 1px grey;">';
        var myFriend = Friends.findOne({myEmail: friends[i]});
        list = list + "<br>" + myFriend.firstName + " " + myFriend.lastName + "<br>";
        var email = myFriend.myEmail;
        list = list + email;
        list = list + '</div>'
      }
    }
    console.log(list);
    document.getElementById("friends").innerHTML=list;
  },

  'click .account': function(){

    Meteor.subscribe("facebook_info");
    console.log("Getting Account Information");
    var currentEmail = Meteor.user().services.facebook.email;
    console.log("For email: " + currentEmail);
    var output = Friends.findOne({myEmail: currentEmail});
    var locale = Meteor.user().services.facebook.locale;
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
    img.src = "http://graph.facebook.com/" + myId + "/picture/?type=large";
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

