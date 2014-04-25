/*
 Say Hello - server
/*

/*
	This uses the accessToken from the Facebook login widget to gain access 
	to user profile
*/
console.log("Welcome to the server");                                                         ;

Accounts.onCreateUser(function(options, user) {
    if (options.profile) { // maintain the default behavior
        user.profile = options.profile;
    }

    if (user.services.facebook) {
        // get profile data from Facebook
        var result = Meteor.http.get("https://graph.facebook.com/me", {
	     params: {access_token: user.services.facebook.accessToken}});

        if ( !result.error && result.data ) {
            // if successfully obtained facebook profile, save it off
            user.profile.facebook = result.data;
        }
    }
    console.log("Create user");

    return user;
});


/*
  The information grabbed from Facebook cannot be accessed by the client
  unless the server publishes the information
*/

Meteor.publish("facebook_info", function() { 
    return Meteor.users.find({_id: this.userId}, {fields: {'services.facebook.first_name': 1,
							   'services.facebook.last_name': 1,
							   'services.facebook.email': 1,
							   'services.facebook.gender': 1,
							   'services.facebook.locale': 1,
							   'services.facebook.id': 1}}); 
});


var getMarker = function() {console.log("Hello from getMarker!");};
var GoogleMap;
  
/*
  Allows access to the facebook information
*/
/*
  Accounts.ui.config({
  requestPermissions: {
  facebook: [ 'bio', 'email']
  }
 });
*/

Meteor.publish("directory", function() {
    return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});

Meteor.publish("current_events", function() {
    return CurrentEvents.find({});
});

Meteor.publish("past_events", function() {
    return PastEvents.find({});
});

Meteor.publish("friends", function() {
    return Friends.find({});
});

Meteor.publish("Sign", function() {
    return Sign.find({});
});
