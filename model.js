// This is the model.js; it is used to set up the client and server
CurrentEvents = new Meteor.Collection("current_events")
PastEvents = new Meteor.Collection("past_events")
Sign = new Meteor.Collection("Sign");

Sign.allow ({
    insert: function() {
	return true;
    }
});

CurrentEvents.allow({
    insert: function(userId, myEvent) {
	return false; // we want to use CreateEvent
    },
    update: function(userId, myEvent, fields, modifier) {
		if (userId !== myEvent.owner)
			return false; // not the owner of the event

		var allowed = ["name", "description", "x", "y"];
		if (_.difference(fields, allowed).length)
			return false;
		// _.difference(A, B) checks for differences between A and B
		// and returns a list of differences
	},
	remove: function(userId, myEvent) {
		return true; // remove events from the database
	}
});

/*************** Past Events *********************/
PastEvents.allow({
    insert: function(userId, hisEvent) {
	return true; 
    },
    remove: function(userId, hisEvent) {
	return true; 

	//use RemovePastEvents, to be implemented in next iteration 
	//there is no absolute past event, it depends on the number of person attending the event
    }
});







// get the number of people at the event
attending = function(myEvent) {
	return myEvent.attendees.length;
};

createEvent = function(options) {
	var id = Random.id(); // Generate random id string
	Meteor.call('createEvent', _.extend({_id: id}, options));
	// _.extend(A, B, C, ...) adds B key-value pairs into A,
	// then C key-value pairs, then ... key-value pairs and
	// returns A
	return id;
};

createPastEvent = function(options) {
    Meteor.call('createPastEvent', options);
}

Meteor.methods({ 
		// list of methods that are to be run ON THE SERVER
		createEvent: function(options) {
		// As of right now, assume valid input
	
		check(options, {
		    name: String,
		    description: String,
		    _id: String,
		    x: Number,
		    y: Number
		});
	
		var id = options._id || Random.id();
		// get the _id of the event if exists, otherwise generate idi
		    console.log("this.userId: " + this.userId);
		    var uName = displayName(Meteor.users.findOne(this.userId));
		   
		    
		     var uEmail = Meteor.user().services.facebook.email;
		    //contactEmail(Meteor.users.findOne(this.userId));
		console.log("Username of creator: " + uName);
		CurrentEvents.insert({
			_id: id,
			owner: this.userId,
			x: options.x,
			y: options.y,
			name: options.name,
			description: options.description,
		    attendees: [{name: uName, email: uEmail}]
		});
		return id;
	},

    createPastEvent: function(options) {

	/*
	check(options, {
	    name: String,
	    description: String,
	    _id: String,
	    x: Number,
	    y: Number
	});

	var id = options._id;


	//get the id of the events
	console.log("this.userId: " + this.userId);
	var uName = displayName(Meteor.users.findOne(this.userId));
	console.log("Username of creator: " + uName);
	*/
	//number of attendies
	
	

    },
    
	sign_: function(eventId, signing_in) {
		check(eventId, String);
		if (! this.userId)
			throw new Meteor.Error(403, "You must be logged in to sign " + 
				       (signing_in ? "in" : "out") + "!");

		var myEvent = CurrentEvents.findOne(eventId);
		if (! myEvent)
			throw new Meteor.Error(404, "There is no such event!");

		var attendIndex = _.indexOf(this.userId);
		var uName = displayName(Meteor.users.findOne(this.userId));
	    
	    var uEmail = null;
	if(Meteor.user().service.facebook) {
	    uEmail = Meteor.user().services.facebook.email
	} else {
	    uEmail = user.emails[o].address;
	    console.log("Email login: " + uEmail);
	}

//	    var uEmail = Meteor.user().services.facebook.email;
		//check(uName, String);
	    var updateTable = {name: uName, email: uEmail};
		check(updateTable, {
		    name: String,
		    email: String
		});
		check(this.userId, String);
		//console.log(typeof updateTable);
		//check(updateTable, Object);
		if (attendIndex === -1) {
			// Person is not in the event!
			if (signing_in) {
				// Add person to event
				CurrentEvents.update(eventId,
						{$push: {attendees: updateTable}});

			} else {
				// Remove person from event
				CurrentEvents.update(eventId,
						{$pull: {attendees: updateTable}});

				var userPastEvents = PastEvents.findOne({user: this.userId});
				if (userPastEvents) {
					// document exists for past events for this user, insert event
					console.log("User has past event entry");
					PastEvents.update({user: this.userId}, {$addToSet: {events: eventId}});
				} else {
					PastEvents.insert({user: this.userId, events: [eventId]});
					console.log("User did not have past event entry. Created new");
				}

			}
		}
	},
	invite: function(partyId, userId) {
		// TODO: implement invitation of other users?
	}
});


/////////////////////////////////
// Users

displayName = function(user) {
	if (user.profile && user.profile.name)
		return user.profile.name;
	return user.emails[0].address;
};

contactEmail = function(user) {
	if (user.emails && user.emails.length)
		return user.emails[0].address;
	if (user.services && user.services.facebook && user.services.facebook.email)
		return user.services.facebook.email;
	return null;
}	
