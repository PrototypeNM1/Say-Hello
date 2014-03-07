

Accounts.onCreateUser(function(options, user) {
    if (options.profile) { // maintain the default behavior
        user.profile = options.profile;
    }

    // get profile data from Facebook
    var result = Meteor.http.get("https://graph.facebook.com/me", {
      params: {access_token: user.services.facebook.accessToken}});

    if ( !result.error && result.data ) {
        // if successfully obtained facebook profile, save it off
        user.profile.facebook = result.data;
    }



    return user;
});

Meteor.publish("facebook_info", function() { 
	return Meteor.users.find({_id: this.userId}, {fields: {'services.facebook.email': 1,
								'services.facebook.gender': 1,
								'services.facebook.locale': 1,
								'services.facebook.id': 1}}); 
});
