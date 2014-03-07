// Say Hello - server

Meteor.publish("directory", function() {
		return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
		});

Meteor.publish("current_events", function() {
<<<<<<< HEAD
	return CurrentEvents.find({});
});


=======
		return CurrentEvents.find({});
		});
>>>>>>> c6e60328c7e3ee7dbe307e5903a090bc7e24c820
