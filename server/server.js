// Say Hello - server

Meteor.publish("directory", function() {
	return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});

Meteor.publish("current_events", function() {
	return CurrentEvents.find({});
});
